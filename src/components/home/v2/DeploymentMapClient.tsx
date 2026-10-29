"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { prefersReducedMotion } from "@/lib/effects/media";
import { describeSky, localTimeFormatter, signedDegrees, toFahrenheit, toMph, type Conditions } from "@/lib/field-readout";
import { snapToGrid } from "@/lib/place-grid";
import { lightAt } from "@/lib/solar";
import { MapTourSlide, type TourPoint } from "@/components/home/v2/MapTourCard";

export type { TourPoint };

export type PinKind = "military" | "humanitarian" | "scientific";

export type MapPin = {
  id: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  /** IANA time zone at the pin. */
  tz: string;
  /** False for pins that mark a whole country rather than a place (no local weather for those). */
  precise: boolean;
  kind: PinKind;
  label: string;
  country: string;
  program?: string;
  theater: string;
};

type Theater = { id: string; label: string };
type View = { x: number; y: number; w: number; h: number };

const KINDS: { id: PinKind; label: string; color: string }[] = [
  { id: "military", label: "Defense and peacekeeping", color: "#f18522" },
  { id: "humanitarian", label: "Medical and disaster relief", color: "#eef2f6" },
  { id: "scientific", label: "Research and commercial", color: "#8ec5e6" },
];

const KIND_COLOR: Record<PinKind, string> = {
  military: "#f18522",
  humanitarian: "#eef2f6",
  scientific: "#8ec5e6",
};

/** How long the tour stays at each stop while it plays. */
const STOP_MS = 11_000;

/** Representative photography per mission type (captioned as representative). */
function photoFor(pin: MapPin): { src: string; alt: string } {
  if (Math.abs(pin.lat) > 58) {
    return { src: "/products/polar-chief/gallery/01-com-PolarChief149.jpg", alt: "Weatherhaven polar shelters on the ice" };
  }
  if (pin.kind === "military") {
    return { src: "/products/ehmecc/gallery/11-NATO_EHMECC_02.jpg", alt: "Weatherhaven expandable containers deployed for a military program" };
  }
  if (pin.kind === "humanitarian") {
    return { src: "/products/hercon/gallery/03-com-BrazilHERCon.jpg", alt: "Weatherhaven hard-wall expandable buildings deployed for relief" };
  }
  return { src: "/products/series-4/gallery/01-com-S4-PlacerDome151.jpg", alt: "Weatherhaven fabric shelters at a remote work camp" };
}

const FULL = (w: number, h: number): View => ({ x: 0, y: 0, w, h });
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Reduced motion and tab visibility, read without effects (and as "no" on the server).
const onReducedChange = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const onVisibilityChange = (cb: () => void) => {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
};

/** A gentle arc between two tour stops, bowed toward the top of the map. */
function arcPath(a: { x: number; y: number }, b: { x: number; y: number }): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  return `M${a.x} ${a.y}Q${mx} ${my - d * 0.28} ${b.x} ${b.y}`;
}

export function DeploymentMapClient({
  pins,
  theaters,
  width,
  height,
  tour,
}: {
  pins: MapPin[];
  theaters: Theater[];
  width: number;
  height: number;
  /** Stops of the guided tour; without them the map opens on all sites. */
  tour?: TourPoint[];
}) {
  const hasTour = !!tour && tour.length > 0;
  const [mode, setMode] = useState<"tour" | "explore">(hasTour ? "tour" : "explore");
  const [kind, setKind] = useState<PinKind | "all">("all");
  const [theater, setTheater] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string>(
    () => pins.find((p) => p.id.includes("mcmurdo"))?.id ?? pins[0]?.id ?? "",
  );
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [view, setView] = useState(FULL(width, height));
  const viewRef = useRef(view);
  const rafRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const tourRef = useRef<HTMLDivElement>(null);
  const [svgPx, setSvgPx] = useState(760);
  const [dotPaths, setDotPaths] = useState<[string, string, string] | null>(null);
  const [sun, setSun] = useState<[number, number] | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [weather, setWeather] = useState<Record<string, Conditions | "error">>({});

  // ---- tour state -------------------------------------------------------------------------
  const [stop, setStop] = useState(0);
  const stopRef = useRef(0);
  const [arcFrom, setArcFrom] = useState<number | null>(null);
  /** The visitor's own play/pause choice; until they make one, the tour plays unless they prefer reduced motion. */
  const [userPlay, setUserPlay] = useState<boolean | null>(null);
  const reduced = useSyncExternalStore(onReducedChange, prefersReducedMotion, () => false);
  const tabHidden = useSyncExternalStore(onVisibilityChange, () => document.hidden, () => false);
  const [inView, setInView] = useState(false);
  const [pointerIn, setPointerIn] = useState(false);
  const wantsPlay = userPlay ?? !reduced;
  // A mouse over the map or card holds the tour; keyboard focus moving in stops it (below).
  const playing = hasTour && mode === "tour" && wantsPlay && inView && !pointerIn && !tabHidden;
  const elapsed = useRef(0);
  const barRef = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  // The land dots load as the map nears the screen instead of riding in the page HTML. Once they
  // are in, they are shaded by daylight and redrawn on every minute, with the sun's position,
  // while the map is near the screen.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    type DotModule = typeof import("@/components/home/v2/world-dot-path");
    let cancelled = false;
    let timer = 0;
    let mod: DotModule | null = null;
    let loading = false;
    let near = false;
    const tick = () => {
      window.clearTimeout(timer);
      if (cancelled || !mod || !near) return;
      const d = new Date();
      setNow(d);
      setDotPaths(mod.dotPathsByLight(d));
      setSun(mod.sunOnMap(d));
      timer = window.setTimeout(tick, 60_000 - (d.getTime() % 60_000) + 50);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        if (!near) {
          window.clearTimeout(timer);
          return;
        }
        if (mod) tick();
        else if (!loading) {
          loading = true;
          void import("@/components/home/v2/world-dot-path").then((m) => {
            mod = m;
            tick();
          });
        }
      },
      { rootMargin: "1000px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // The map's size on screen, so tour labels and lines stay the same size at any zoom.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSvgPx(entry.contentRect.width || 760));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const visible = useMemo(
    () => pins.filter((p) => (kind === "all" || p.kind === kind) && (theater === "all" || p.theater === theater)),
    [pins, kind, theater],
  );

  const counts = useMemo(() => {
    const c: Record<PinKind, number> = { military: 0, humanitarian: 0, scientific: 0 };
    for (const p of pins) c[p.kind] += 1;
    return c;
  }, [pins]);

  // The selection always stays inside the current filter.
  const selected = visible.find((p) => p.id === selectedId) ?? visible[0];
  const hovered = hoverId ? pins.find((p) => p.id === hoverId) : null;
  const current = hasTour ? tour[stop] : null;

  // Weather at the selected site (or tour stop), fetched once per place after a short pause
  // (stepping through places doesn't fire a request for each one), and only once the map has
  // come near the screen. Tour stops are read on the same quarter-degree grid as the mission
  // builder's map points.
  const weatherKey =
    mode === "tour"
      ? current && !current.area && now && !weather[`tour:${current.id}`]
        ? `tour:${current.id}`
        : null
      : now && selected?.precise && !weather[selected.id]
        ? selected.id
        : null;
  useEffect(() => {
    if (!weatherKey) return;
    const tourStop = weatherKey.startsWith("tour:") ? tour?.find((s) => `tour:${s.id}` === weatherKey) : null;
    const url = tourStop
      ? `/api/place-weather?lat=${snapToGrid(tourStop.lat)}&lng=${snapToGrid(tourStop.lng)}`
      : `/api/site-weather?id=${encodeURIComponent(weatherKey)}`;
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      fetch(url, { signal: ctrl.signal })
        .then((r) => (r.ok ? (r.json() as Promise<Conditions>) : Promise.reject(new Error(String(r.status)))))
        .then((c) => setWeather((w) => ({ ...w, [weatherKey]: c })))
        .catch((err: unknown) => {
          if ((err as Error).name !== "AbortError") setWeather((w) => ({ ...w, [weatherKey]: "error" }));
        });
    }, tourStop ? 400 : 250);
    return () => {
      window.clearTimeout(t);
      ctrl.abort();
    };
    // weatherKey stands for the place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherKey]);

  /**
   * Moves the map's view. `fly` eases in and out and, for long hops, pulls back partway so the
   * route between two places reads as travel rather than a smear.
   */
  const animateTo = useCallback(
    (target: View, opts: { duration?: number; fly?: boolean } = {}) => {
      cancelAnimationFrame(rafRef.current);
      if (prefersReducedMotion()) {
        viewRef.current = target;
        setView(target);
        return;
      }
      const from = viewRef.current;
      const start = performance.now();
      const dur = opts.duration ?? 650;
      const fc = { x: from.x + from.w / 2, y: from.y + from.h / 2 };
      const tc = { x: target.x + target.w / 2, y: target.y + target.h / 2 };
      const wide = Math.max(from.w, target.w);
      const peak = opts.fly ? Math.min(width, Math.max(wide, Math.hypot(tc.x - fc.x, tc.y - fc.y) * 1.3)) : wide;
      const step = (t0: number) => {
        const t = Math.min(1, (t0 - start) / dur);
        const e = opts.fly ? (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2) : 1 - (1 - t) ** 3;
        let w = from.w + (target.w - from.w) * e + (peak - wide) * Math.sin(Math.PI * t);
        w = Math.min(w, width);
        const h = (w * height) / width;
        const cx = fc.x + (tc.x - fc.x) * e;
        const cy = fc.y + (tc.y - fc.y) * e;
        const next =
          t < 1
            ? { x: clamp(cx - w / 2, 0, width - w), y: clamp(cy - h / 2, 0, height - h), w, h }
            : target;
        viewRef.current = next;
        setView(next);
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [width, height],
  );

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  /**
   * The view for a tour stop: close in on a site, wider for a whole country, and wider near the
   * poles, where the map runs out and a close view would be mostly empty ocean.
   */
  const viewForStop = useCallback(
    (s: TourPoint): View => {
      const w = width / (s.area ? 2.6 : Math.abs(s.lat) > 60 ? 3 : 4.2);
      const h = (w * height) / width;
      return { x: clamp(s.x - w / 2, 0, width - w), y: clamp(s.y - h / 2, 0, height - h), w, h };
    },
    [width, height],
  );

  const goStop = useCallback(
    (to: number) => {
      if (!tour?.length) return;
      const n = tour.length;
      const next = ((to % n) + n) % n;
      const from = stopRef.current;
      elapsed.current = 0;
      stopRef.current = next;
      setArcFrom(from === next ? null : from);
      setStop(next);
      startedRef.current = true;
      animateTo(viewForStop(tour[next]), { duration: 1700, fly: true });
    },
    [tour, animateTo, viewForStop],
  );

  // The tour starts when the map is well on screen: the first time, it flies from the whole
  // world to the first stop.
  useEffect(() => {
    const el = tourRef.current;
    if (!el || !hasTour) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const on = entry.intersectionRatio >= 0.35;
        setInView(on);
        if (on && !startedRef.current && tour) {
          startedRef.current = true;
          animateTo(viewForStop(tour[stopRef.current]), { duration: 1900, fly: true });
        }
      },
      { threshold: [0, 0.35, 0.6] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasTour, tour, animateTo, viewForStop]);

  // While the tour plays, the progress bar fills and the next stop comes up when it's full.
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const t = performance.now();
      // A throttled background timer can come back late; count at most one tick's worth.
      elapsed.current += Math.min(t - last, 250);
      last = t;
      const p = Math.min(1, elapsed.current / STOP_MS);
      // (`scale`, not `transform`: the bar's class sets `scale`, and the two would multiply.)
      if (barRef.current) barRef.current.style.scale = `${p} 1`;
      if (p >= 1) goStop(stopRef.current + 1);
    }, 100);
    return () => window.clearInterval(id);
  }, [playing, stop, goStop]);

  // Zoom to a theater's pins, keeping the map's aspect ratio.
  const viewFor = (t: string) => {
    if (t === "all") return FULL(width, height);
    const inTheater = pins.filter((p) => p.theater === t);
    if (inTheater.length === 0) return FULL(width, height);
    const xs = inTheater.map((p) => p.x);
    const ys = inTheater.map((p) => p.y);
    const pad = 60;
    let x0 = Math.min(...xs) - pad;
    let x1 = Math.max(...xs) + pad;
    let y0 = Math.min(...ys) - pad;
    let y1 = Math.max(...ys) + pad;
    const aspect = width / height;
    let w = x1 - x0;
    let h = y1 - y0;
    if (w / h > aspect) {
      const nh = w / aspect;
      y0 -= (nh - h) / 2;
      h = nh;
    } else {
      const nw = h * aspect;
      x0 -= (nw - w) / 2;
      w = nw;
    }
    w = Math.min(w, width);
    h = Math.min(h, height);
    x0 = Math.max(0, Math.min(x0, width - w));
    y0 = Math.max(0, Math.min(y0, height - h));
    x1 = x0 + w;
    y1 = y0 + h;
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  };

  const chooseTheater = (t: string) => {
    setTheater(t);
    animateTo(viewFor(t));
  };

  const explore = (pinId?: string) => {
    setMode("explore");
    if (pinId) setSelectedId(pinId);
    setTheater("all");
    animateTo(FULL(width, height), { duration: 900 });
  };

  const startTour = () => {
    setMode("tour");
    elapsed.current = 0;
    startedRef.current = true;
    if (tour) animateTo(viewForStop(tour[stopRef.current]), { duration: 1500, fly: true });
  };

  const scale = view.w / width; // < 1 when zoomed in
  const u = view.w / svgPx; // map units per screen pixel
  const pinR = 3.4 * Math.max(scale, 0.35);
  const index = visible.findIndex((p) => p.id === selected?.id);
  const go = (delta: number, focusPin = false) => {
    if (visible.length === 0) return;
    const next = visible[(index + delta + visible.length) % visible.length];
    setSelectedId(next.id);
    if (focusPin) {
      requestAnimationFrame(() => svgRef.current?.querySelector<SVGGElement>('[data-active="true"]')?.focus());
    }
  };

  // Pins use a roving tab stop: Tab reaches the selected site, arrow keys move between sites.
  const onPinKey = (e: React.KeyboardEvent<SVGGElement>, id: string) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      if (mode === "tour") explore(id);
      else go(1, true);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      if (mode === "tour") explore(id);
      else go(-1, true);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (mode === "tour") explore(id);
      else setSelectedId(id);
    }
  };

  const theaterInfo = theaters.find((t) => t.id === selected?.theater);
  const kindInfo = KINDS.find((k) => k.id === selected?.kind);
  const photo = selected ? photoFor(selected) : null;
  const touring = mode === "tour" && current;
  const arcStop = touring && arcFrom !== null ? tour?.[arcFrom] : null;

  // The tour's label on the map, kept on screen.
  const label = touring
    ? (() => {
        const fs = 13 * u;
        const lw = (current.where.length * 7.1 + 18) * u;
        const lo = view.x + 4 * u;
        const hi = view.x + view.w - 4 * u - lw;
        const rightX = current.x + 12 * u;
        const leftX = current.x - 12 * u - lw;
        // Beside the stop where it fits, otherwise centred above it.
        const side = rightX <= hi ? rightX : leftX >= lo ? leftX : null;
        const lx = side ?? clamp(current.x - lw / 2, lo, Math.max(lo, hi));
        const ly = clamp(current.y - (side === null ? 40 : 30) * u, view.y + 4 * u, view.y + view.h - 26 * u);
        return { fs, lw, lx, ly };
      })()
    : null;

  return (
    <div className="mt-12">
      {/* View and filters */}
      <div className="flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {hasTour ? (
            <div role="group" aria-label="Map view" className="mr-2 flex gap-2">
              <FilterChip active={mode === "tour"} onClick={() => (mode === "tour" ? null : startTour())}>
                Guided tour
              </FilterChip>
              <FilterChip active={mode === "explore"} onClick={() => (mode === "explore" ? null : explore())}>
                All sites <span className="v2-tnum text-muted">{pins.length}</span>
              </FilterChip>
            </div>
          ) : null}
          {mode === "explore" ? (
            <div role="group" aria-label="Mission type" className="flex flex-wrap gap-2">
              {!hasTour ? (
                <FilterChip active={kind === "all"} onClick={() => setKind("all")}>
                  All missions <span className="v2-tnum text-muted">{pins.length}</span>
                </FilterChip>
              ) : (
                <FilterChip active={kind === "all"} onClick={() => setKind("all")}>
                  All missions
                </FilterChip>
              )}
              {KINDS.map((k) => (
                <FilterChip key={k.id} active={kind === k.id} onClick={() => setKind(k.id)}>
                  <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: k.color }} />
                  {k.label} <span className="v2-tnum text-muted">{counts[k.id]}</span>
                </FilterChip>
              ))}
            </div>
          ) : (
            <p className="text-[0.9rem] text-muted">
              {tour?.length} deployments on the public record, from the Antarctic ice to Ukraine.
            </p>
          )}
        </div>
        {mode === "explore" ? (
          <label className="flex items-center gap-3 text-[0.875rem] text-muted">
            Region
            <select
              value={theater}
              onChange={(e) => chooseTheater(e.target.value)}
              className="h-10 min-w-[12rem] border border-line-strong bg-hull px-3 text-[0.9rem] text-snow"
            >
              <option value="all">Whole world</option>
              {theaters.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div
        ref={tourRef}
        className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
        onPointerEnter={(e) => e.pointerType === "mouse" && setPointerIn(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setPointerIn(false)}
        onFocus={(e) => {
          // Keyboard focus coming into the tour stops it, as carousels should; the play button
          // starts it again.
          if (mode === "tour" && wantsPlay && (e.target as Element).matches?.(":focus-visible") && !e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setUserPlay(false);
          }
        }}
      >
        {/* Map */}
        <div className="min-w-0 self-start">
          <div className="relative">
            <svg
              ref={svgRef}
              viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
              className="h-auto w-full touch-manipulation select-none"
              role="group"
              aria-label={
                touring
                  ? `World map, guided tour stop ${stop + 1} of ${tour?.length}: ${current.where}. Selecting a site switches to all sites.`
                  : `World map with ${visible.length} Weatherhaven deployment sites. Use the arrow keys to move between sites.`
              }
            >
              {(["day", "dusk", "night"] as const).map((light, i) => (
                <path
                  key={light}
                  d={dotPaths?.[i] || "M0 0"}
                  className={`v2-map-dots v2-map-dots-${light}`}
                  style={{ strokeWidth: 2.4 * Math.max(scale, 0.8), opacity: dotPaths ? 1 : 0, transition: "opacity 600ms ease" }}
                />
              ))}
              {sun ? (
                <g pointerEvents="none" aria-hidden className="v2-map-sun">
                  <circle cx={sun[0]} cy={sun[1]} r={11 * Math.max(scale, 0.5)} className="v2-map-sun-halo" />
                  <circle cx={sun[0]} cy={sun[1]} r={4.2 * Math.max(scale, 0.5)} className="v2-map-sun-core" />
                </g>
              ) : null}
              <g style={{ opacity: touring ? 0.4 : 1, transition: "opacity 400ms ease" }}>
                {visible.map((p) => {
                  const active = !touring && p.id === selected?.id;
                  return (
                    <g
                      key={p.id}
                      className="v2-pin"
                      data-active={active}
                      role="button"
                      tabIndex={active || (touring && p.id === selected?.id) ? 0 : -1}
                      aria-pressed={active}
                      aria-label={p.label}
                      onKeyDown={(e) => onPinKey(e, p.id)}
                      onClick={() => (touring ? explore(p.id) : setSelectedId(p.id))}
                      onMouseEnter={() => setHoverId(p.id)}
                      onMouseLeave={() => setHoverId((h) => (h === p.id ? null : h))}
                    >
                      <circle cx={p.x} cy={p.y} r={pinR * 3} fill="transparent" />
                      {active ? (
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={pinR}
                          fill="none"
                          stroke={KIND_COLOR[p.kind]}
                          strokeWidth={1.2 * Math.max(scale, 0.4)}
                          className="v2-pin-sonar"
                        />
                      ) : null}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={active ? pinR * 1.5 : pinR}
                        fill={KIND_COLOR[p.kind]}
                        stroke="#0a0f17"
                        strokeWidth={1.2 * Math.max(scale, 0.4)}
                        className="v2-pin-core"
                      />
                    </g>
                  );
                })}
              </g>

              {/* The tour: the route from the last stop, the stop itself and its name */}
              {touring && label ? (
                <g pointerEvents="none" aria-hidden>
                  {arcStop ? (
                    <path
                      key={`arc-${stop}`}
                      d={arcPath(arcStop, current)}
                      pathLength={1}
                      className="v2-tour-arc"
                      fill="none"
                      style={{ strokeWidth: 1.6 * u }}
                    />
                  ) : null}
                  {current.area ? (
                    <circle
                      cx={current.x}
                      cy={current.y}
                      r={30 * u}
                      className="v2-tour-area"
                      style={{ strokeWidth: 1.2 * u, strokeDasharray: `${4 * u} ${3 * u}` }}
                    />
                  ) : null}
                  <circle
                    key={`sonar-${stop}`}
                    cx={current.x}
                    cy={current.y}
                    r={7 * u}
                    fill="none"
                    stroke={KIND_COLOR[current.kind]}
                    strokeWidth={1.5}
                    vectorEffect="non-scaling-stroke"
                    className="v2-tour-sonar"
                  />
                  <circle cx={current.x} cy={current.y} r={5 * u} fill={KIND_COLOR[current.kind]} stroke="#0a0f17" strokeWidth={1.6 * u} />
                  <g key={`label-${stop}`} className="v2-tour-label">
                    <rect x={label.lx} y={label.ly} width={label.lw} height={22 * u} fill="#0a0f17" fillOpacity={0.88} stroke="rgb(148 170 196 / 0.4)" strokeWidth={u} />
                    <text x={label.lx + 9 * u} y={label.ly + 15.5 * u} fill="#eef2f6" fontSize={label.fs} fontWeight={600}>
                      {current.where}
                    </text>
                  </g>
                </g>
              ) : null}

              {!touring && hovered && hovered.id !== selected?.id ? (
                <g pointerEvents="none">
                  <rect
                    x={hovered.x + 8 * scale}
                    y={hovered.y - 22 * scale}
                    width={(hovered.label.length * 6.4 + 16) * scale}
                    height={20 * scale}
                    fill="#101824"
                    stroke="rgb(148 170 196 / 0.32)"
                    strokeWidth={scale}
                  />
                  <text x={hovered.x + 16 * scale} y={hovered.y - 8 * scale} fill="#eef2f6" fontSize={12 * scale}>
                    {hovered.label}
                  </text>
                </g>
              ) : null}
            </svg>
            {mode === "explore" && theater !== "all" ? (
              <button
                type="button"
                onClick={() => chooseTheater("all")}
                className="absolute left-0 top-0 bg-ink/80 px-3 py-2 text-[0.85rem] text-snow hover:text-signal"
              >
                Show whole world
              </button>
            ) : null}
          </div>
          {touring && tour ? (
            <div className="mt-5">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => goStop(stop - 1)} className="v2-btn v2-btn-ghost !min-h-10 !px-4" aria-label="Previous stop">
                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                    <path d="M13 8H4M7.5 4.5 4 8l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setUserPlay(!wantsPlay)}
                  className="v2-btn v2-btn-ghost !min-h-10 !px-4"
                  aria-label={wantsPlay ? "Pause the tour" : "Play the tour"}
                >
                  {wantsPlay ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                      <path d="M5 3.5v9M11 3.5v9" fill="none" stroke="currentColor" strokeWidth="1.8" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                      <path d="M5 3.2v9.6L12.6 8z" fill="currentColor" />
                    </svg>
                  )}
                </button>
                <button type="button" onClick={() => goStop(stop + 1)} className="v2-btn v2-btn-ghost !min-h-10 !px-4" aria-label="Next stop">
                  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                    <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                <span className="v2-tnum ml-2 text-[0.85rem] text-muted">
                  Stop {stop + 1} of {tour.length}
                </span>
              </div>
              {/* Time left at this stop while the tour plays */}
              <span aria-hidden className="mt-4 block h-[2px] overflow-hidden bg-line-strong">
                <span key={`bar-${stop}`} ref={barRef} className="block h-full origin-left scale-x-0 bg-signal" />
              </span>
              {/* The route: every stop, in order; any can be jumped to. */}
              <ol aria-label="Tour stops" className="mt-5 hidden gap-x-6 gap-y-0.5 lg:grid lg:grid-cols-2 xl:grid-cols-3">
                {tour.map((s, i) => (
                  <li key={s.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => goStop(i)}
                      aria-current={i === stop ? "step" : undefined}
                      className={`flex w-full min-w-0 items-baseline gap-2.5 py-1.5 text-left text-[0.85rem] transition-colors ${
                        i === stop ? "text-snow" : "text-muted hover:text-snow"
                      }`}
                    >
                      <span className={`v2-tnum w-5 shrink-0 text-right ${i === stop ? "text-signal" : ""}`}>{i + 1}</span>
                      <span className="truncate" title={s.where}>
                      {s.where}
                    </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>

        {touring && tour ? (
          <aside aria-roledescription="carousel" aria-label="Deployment tour" className="flex flex-col border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {/* Announced when the visitor moves the tour on, not every few seconds while it plays. */}
            <div className="grid" aria-live={playing ? "off" : "polite"}>
              {tour.map((s, i) => (
                <MapTourSlide
                  key={s.id}
                  stop={s}
                  index={i}
                  count={tour.length}
                  current={i === stop}
                  now={now}
                  weather={weather[`tour:${s.id}`]}
                />
              ))}
            </div>
          </aside>
        ) : selected ? (
          <aside className="flex flex-col border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {photo ? (
              <figure>
                <div className="relative aspect-[3/2] overflow-hidden bg-hull">
                  <Image key={photo.src} src={photo.src} alt={photo.alt} fill sizes="340px" className="object-cover" />
                </div>
                <figcaption className="mt-2 text-[0.75rem] text-muted">Representative photo</figcaption>
              </figure>
            ) : null}
            <p className="mt-5 flex items-center gap-2 text-[0.85rem] font-medium" style={{ color: KIND_COLOR[selected.kind] }}>
              <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: KIND_COLOR[selected.kind] }} />
              {kindInfo?.label}
            </p>
            {/* Only the site's name is announced; the clock and weather below change on their own. */}
            <h3 aria-live="polite" className="v2-h3 mt-2 text-snow">
              {selected.label}
            </h3>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[0.9rem]">
              {!selected.label.includes(selected.country) ? (
                <>
                  <dt className="text-muted">Country</dt>
                  <dd className="text-snow">{selected.country}</dd>
                </>
              ) : null}
              {selected.program ? (
                <>
                  <dt className="text-muted">Program</dt>
                  <dd className="text-snow">{selected.program}</dd>
                </>
              ) : null}
              {theaterInfo ? (
                <>
                  <dt className="text-muted">Region</dt>
                  <dd className="text-snow">
                    {theaterInfo.label}
                  </dd>
                </>
              ) : null}
              {selected.precise && now ? (
                <>
                  <LocalTime now={now} tz={selected.tz} light={lightAt(now, selected.lat, selected.lng)} />
                  <dt className="text-muted">Weather now</dt>
                  <dd className="text-snow">
                    <WeatherNow value={weather[selected.id]} />
                  </dd>
                </>
              ) : null}
            </dl>
            <div className="mt-auto flex items-center gap-2 pt-6">
              <button type="button" onClick={() => go(-1)} className="v2-btn v2-btn-ghost !min-h-10 !px-4" aria-label="Previous site">
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                  <path d="M13 8H4M7.5 4.5 4 8l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <button type="button" onClick={() => go(1)} className="v2-btn v2-btn-ghost !min-h-10 !px-4" aria-label="Next site">
                <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
                  <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <span className="v2-tnum ml-2 text-[0.85rem] text-muted">
                {index + 1} of {visible.length}
              </span>
            </div>
          </aside>
        ) : (
          <aside className="flex flex-col justify-center border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="v2-h3 text-snow">No documented sites match both filters.</p>
            <p className="mt-2 text-[0.95rem] text-muted">Try another mission type or region.</p>
            <button
              type="button"
              onClick={() => {
                setKind("all");
                chooseTheater("all");
              }}
              className="v2-btn v2-btn-ghost mt-6 self-start"
            >
              Show all sites
            </button>
          </aside>
        )}
      </div>
      <p className="mt-6 text-[0.8rem] text-muted">
        {touring
          ? "Tour: the deployment stories and field notes on the deployments page, each with its sources. "
          : null}
        Site data from Weatherhaven&apos;s deployment records. Base map: Natural Earth. Lit land is in daylight now, and
        the pale ring marks where the sun is overhead. Weather: this hour&rsquo;s forecast from{" "}
        <a href="https://www.met.no/en" className="underline decoration-line-strong underline-offset-2 hover:text-snow">
          MET Norway
        </a>
        .
      </p>
    </div>
  );
}

function LocalTime({ now, tz, light }: { now: Date; tz: string; light: string }) {
  const fmt = useMemo(() => localTimeFormatter(tz), [tz]);
  if (!fmt) return null;
  return (
    <>
      <dt className="text-muted">Local time</dt>
      <dd className="v2-tnum text-snow">
        <time>{fmt.format(now)}</time>, {light}
      </dd>
    </>
  );
}

function WeatherNow({ value }: { value: Conditions | "error" | undefined }) {
  if (value === undefined) return <span className="text-muted">Checking…</span>;
  if (value === "error") return <span className="text-muted">Not available right now</span>;
  const sky = describeSky(value.symbol);
  const wind = value.windMs === null ? null : `wind ${Math.round(toMph(value.windMs))} mph`;
  return (
    <>
      <span className="v2-figure">
        {signedDegrees(toFahrenheit(value.tempC))} °F ({signedDegrees(value.tempC)} °C)
      </span>
      {[sky?.toLowerCase(), wind].filter(Boolean).map((part) => `, ${part}`)}
    </>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-10 items-center gap-2 px-3.5 text-[0.875rem] font-medium transition-colors ${
        active ? "bg-snow text-ink [&_.text-muted]:text-ink/60" : "text-snow shadow-[inset_0_0_0_1px_rgb(148_170_196/0.32)] hover:bg-white/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}
