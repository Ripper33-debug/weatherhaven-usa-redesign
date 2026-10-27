"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/effects/media";

export type PinKind = "military" | "humanitarian" | "scientific";

export type MapPin = {
  id: string;
  x: number;
  y: number;
  lat: number;
  kind: PinKind;
  label: string;
  program: string;
  theater: string;
};

type Theater = { id: string; label: string; region: string };

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

const FULL = (w: number, h: number) => ({ x: 0, y: 0, w, h });

export function DeploymentMapClient({
  pins,
  theaters,
  dotPath,
  width,
  height,
}: {
  pins: MapPin[];
  theaters: Theater[];
  dotPath: string;
  width: number;
  height: number;
}) {
  const [kind, setKind] = useState<PinKind | "all">("all");
  const [theater, setTheater] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string>(
    () => pins.find((p) => p.id.includes("mcmurdo"))?.id ?? pins[0]?.id ?? "",
  );
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [view, setView] = useState(FULL(width, height));
  const viewRef = useRef(view);
  const rafRef = useRef(0);

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
  const selected = visible.find((p) => p.id === selectedId) ?? visible[0] ?? pins.find((p) => p.id === selectedId);
  const hovered = hoverId ? pins.find((p) => p.id === hoverId) : null;

  const animateTo = useCallback((target: { x: number; y: number; w: number; h: number }) => {
    cancelAnimationFrame(rafRef.current);
    if (prefersReducedMotion()) {
      viewRef.current = target;
      setView(target);
      return;
    }
    const from = viewRef.current;
    const start = performance.now();
    const dur = 650;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - (1 - t) ** 3;
      const next = {
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
        h: from.h + (target.h - from.h) * e,
      };
      viewRef.current = next;
      setView(next);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

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


  const scale = view.w / width; // < 1 when zoomed in
  const pinR = 3.4 * Math.max(scale, 0.35);
  const index = visible.findIndex((p) => p.id === selected?.id);
  const go = (delta: number) => {
    if (visible.length === 0) return;
    const next = visible[(index + delta + visible.length) % visible.length];
    setSelectedId(next.id);
  };

  const theaterInfo = theaters.find((t) => t.id === selected?.theater);
  const kindInfo = KINDS.find((k) => k.id === selected?.kind);
  const photo = selected ? photoFor(selected) : null;

  return (
    <div className="mt-12">
      {/* Filters */}
      <div className="flex flex-col gap-4 border-y border-line py-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Mission type" className="flex flex-wrap gap-2">
          <FilterChip active={kind === "all"} onClick={() => setKind("all")}>
            All missions <span className="v2-tnum text-muted">{pins.length}</span>
          </FilterChip>
          {KINDS.map((k) => (
            <FilterChip key={k.id} active={kind === k.id} onClick={() => setKind(k.id)}>
              <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: k.color }} />
              {k.label} <span className="v2-tnum text-muted">{counts[k.id]}</span>
            </FilterChip>
          ))}
        </div>
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
                {t.label}: {t.region.replace("&", "and")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Map */}
        <div className="relative">
          <svg
            viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
            className="h-auto w-full touch-manipulation select-none"
            role="img"
            aria-label={`World map with ${visible.length} Weatherhaven deployment sites`}
          >
            <path d={dotPath} className="v2-map-dots" style={{ strokeWidth: 2.4 * Math.max(scale, 0.45) }} />
            {visible.map((p) => {
              const active = p.id === selected?.id;
              return (
                <g
                  key={p.id}
                  className="v2-pin"
                  data-active={active}
                  onClick={() => setSelectedId(p.id)}
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
            {hovered && hovered.id !== selected?.id ? (
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
          {theater !== "all" ? (
            <button
              type="button"
              onClick={() => chooseTheater("all")}
              className="absolute left-0 top-0 bg-ink/80 px-3 py-2 text-[0.85rem] text-snow hover:text-signal"
            >
              Show whole world
            </button>
          ) : null}
        </div>

        {/* Selected site */}
        {selected ? (
          <aside aria-live="polite" className="flex flex-col border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
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
            <h3 className="v2-h3 mt-2 text-snow">{selected.label}</h3>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[0.9rem]">
              <dt className="text-muted">Program</dt>
              <dd className="text-snow">{selected.program}</dd>
              {theaterInfo ? (
                <>
                  <dt className="text-muted">Region</dt>
                  <dd className="text-snow">
                    {theaterInfo.label}, {theaterInfo.region.replace("&", "and")}
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
        ) : null}
      </div>
      <p className="mt-6 text-[0.8rem] text-muted">
        Site data from Weatherhaven&apos;s deployment records. Base map: Natural Earth.
      </p>
    </div>
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
