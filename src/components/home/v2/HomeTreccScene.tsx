"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import type { CameraPose, TreccStage } from "@/lib/three/treccStage";
import type { TreccFinish } from "@/lib/three/treccFinishes";
import { TreccFinishPicker } from "@/components/three/TreccFinishPicker";
import { TreccArButton } from "@/components/three/TreccArButton";
import { startWhenNear } from "@/lib/start-when-near";

/**
 * Scroll-driven 3D TRECC: stowed → orange scan reveals the deployed shelter → orbit.
 * Figures are the published TRECC numbers (see product-content.ts).
 */
const STEPS = [
  {
    title: "Rides stowed",
    photo: { src: "/products/trecc/gallery/08-TRECC-and-Car.jpg", alt: "A stowed TRECC on its trailer behind a JLTV" },
    body: "On a light tactical trailer, an M1289 JLTV trailer or a single 463L pallet. Under 60 in stowed height, so it is CH-47 airlift compatible.",
  },
  {
    title: "Two people, under three minutes",
    photo: { src: "/products/trecc/gallery/04-TRECC-1.jpg", alt: "A stowed TRECC beside a deployed one" },
    body: "Electric 24 VDC actuators expand it, with a manual backup.",
  },
  {
    title: "A building on arrival",
    photo: { src: "/products/trecc/gallery/12-TRECC-T_interior_white_light_03.jpg", alt: "Inside a TRECC-T set up with desks and chairs" },
    body: "A command post, workshop, clinic or sanitation unit, rated from −40 °F to +120 °F and 55 mph sustained winds.",
  },
  {
    title: "Tested",
    photo: { src: "/products/trecc/gallery/06-TRECC-3.jpg", alt: "Two TRECCs in a forest clearing with an armoured vehicle" },
    body: "MIL-STD-810G, with safety testing at Aberdeen Test Center. TRECC-T is at technology readiness level 9.",
  },
] as const;

/** Camera keyframes along the scroll (p = 0…1). */
const KEYS: { p: number; pose: CameraPose }[] = [
  { p: 0, pose: { az: 42, el: 16, dist: 10, ty: 0.7 } },
  { p: 0.3, pose: { az: 26, el: 12, dist: 10.4, ty: 0.75 } },
  { p: 0.64, pose: { az: -14, el: 12, dist: 13.2, ty: 1.0 } },
  { p: 1, pose: { az: -44, el: 18, dist: 13.6, ty: 1.0 } },
];
const DEPLOY_FROM = 0.3;
const DEPLOY_TO = 0.62;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function poseAt(p: number, compact: boolean): CameraPose {
  let i = 0;
  while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(a.p, b.p, p);
  const k = compact ? 0.74 : 1;
  return {
    az: lerp(a.pose.az, b.pose.az, t),
    el: lerp(a.pose.el, b.pose.el, t),
    dist: lerp(a.pose.dist, b.pose.dist, t) * k,
    ty: lerp(a.pose.ty, b.pose.ty, t),
  };
}

const stepAt = (p: number) => (p < 0.27 ? 0 : p < 0.64 ? 1 : p < 0.86 ? 2 : 3);

/** Glow behind the transparent 3D canvas, cross-faded with the finish's weather. */
const CLIMATE_GLOW: Record<TreccFinish, string> = {
  arctic: "radial-gradient(ellipse 55% 60% at 64% 58%, rgb(150 186 222 / 0.26), transparent 70%)",
  tan: "radial-gradient(ellipse 55% 60% at 64% 58%, rgb(214 150 78 / 0.22), transparent 70%)",
  green: "radial-gradient(ellipse 55% 60% at 64% 58%, rgb(96 128 104 / 0.18), transparent 70%)",
};

/** The weather each finish brings, and the published TRECC rating (the same for every finish). */
const CLIMATE_NOTE: Record<TreccFinish, { weather: string; rating: string }> = {
  arctic: { weather: "Blowing snow.", rating: "TRECC is rated down to −40 °F." },
  tan: { weather: "Blowing sand.", rating: "TRECC is rated up to +120 °F." },
  green: { weather: "Wind and rain.", rating: "TRECC is rated for 55 mph sustained winds." },
};

type LoadState = "idle" | "loading" | "ready" | "fallback";

export function HomeTreccScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<TreccStage | null>(null);
  const kickRef = useRef<() => void>(() => undefined);
  const reduced = useClientMediaQuery("(prefers-reduced-motion: reduce)");
  const compact = useClientMediaQuery("(max-width: 1023px)");
  const [load, setLoad] = useState<LoadState>("idle");
  const [finish, setFinish] = useState<TreccFinish>("green");
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  // False once a slow device has turned the weather off.
  const [weatherOn, setWeatherOn] = useState(true);

  // Load three.js and the models once the page has loaded and the visitor starts scrolling
  // toward the section, so they never compete with the hero film for bandwidth.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let cancelled = false;
    const start = async () => {
      // Checked before three.js downloads: no WebGL, or WebGL drawn in software (which turns every
      // frame into a long main-thread task), gets the still instead.
      const { canUseWebGL } = await import("@/lib/three/camp/webgl-check");
      if (cancelled) return;
      if (!canUseWebGL()) {
        setLoad("fallback");
        return;
      }
      const { createTreccStage } = await import("@/lib/three/treccStage");
      if (cancelled) return;
      if (!canvasRef.current) {
        setLoad("fallback");
        return;
      }
      setLoad("loading");
      try {
        const small = window.matchMedia("(max-width: 1023px)").matches;
        const stage = await createTreccStage(canvasRef.current, {
          maxDpr: small ? 1.5 : 1.75,
          climate: true,
          mobile: small,
          still: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        });
        if (cancelled) {
          stage.dispose();
          return;
        }
        stageRef.current = stage;
        setLoad("ready");
      } catch {
        if (!cancelled) setLoad("fallback");
      }
    };
    const stop = startWhenNear(el, () => void start(), "100% 0px");
    return () => {
      cancelled = true;
      stop();
      stageRef.current?.dispose();
      stageRef.current = null;
    };
  }, []);

  // Scroll → deploy + camera, rendered only while visible and changing.
  useEffect(() => {
    const stage = stageRef.current;
    const section = sectionRef.current;
    if (load !== "ready" || !stage || !section) return;
    stage.setShift(compact ? 0 : 0.21);
    stage.setStill(reduced);
    let raf = 0;
    let visible = true;
    let shown = reduced ? 1 : -1;
    let last = 0;
    // Skip redrawing identical frames (scrolling past either end, reduced motion).
    let drawn = -1;
    let dirty = true;
    const progress = () => {
      if (reduced) return 1;
      const r = section.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      return travel > 0 ? clamp(-r.top / travel) : 1;
    };
    // Falling weather is drawn at 30 frames a second. If a device can't keep that up while only
    // the weather moves, the weather thins out, then stops.
    let lastDraw = 0;
    const gaps: number[] = [];
    let density = 1;
    const watchQuality = (gap: number) => {
      if (density === 0 || gap > 400) return; // a hidden tab or a scroll jump isn't a slow device
      gaps.push(gap);
      if (gaps.length < 24) return;
      const median = [...gaps].sort((a, b) => a - b)[12];
      gaps.length = 0;
      if (median > 48) {
        density = density === 1 ? 0.45 : 0;
        stage.setWeatherDensity(density);
        if (density === 0) setWeatherOn(false);
      }
    };
    const frame = (now: number) => {
      raf = 0;
      const target = progress();
      // Ease toward the scroll position by elapsed time, so a slow phone keeps up with the finger
      // instead of trailing it. Headless test runs can opt out with window.__TRECC_INSTANT__.
      const instant = (window as unknown as { __TRECC_INSTANT__?: boolean }).__TRECC_INSTANT__;
      const dt = last ? Math.min(0.25, (now - last) / 1000) : 1 / 60;
      last = now;
      shown = shown < 0 || instant ? target : shown + (target - shown) * (1 - Math.exp(-dt / 0.13));
      if (Math.abs(target - shown) < 0.0004) shown = target;
      const moving = shown !== drawn || dirty || stage.isAnimating();
      const ambientDue = stage.isAmbient() && now - lastDraw >= 32;
      if (moving || ambientDue) {
        if (!moving && lastDraw) watchQuality(now - lastDraw);
        stage.setDeploy(smooth(DEPLOY_FROM, DEPLOY_TO, shown));
        stage.setCamera(poseAt(shown, compact));
        stage.render();
        drawn = shown;
        dirty = false;
        lastDraw = now;
      }
      const s = stepAt(shown);
      if (s !== stepRef.current) {
        stepRef.current = s;
        setStep(s);
      }
      if (visible && (shown !== target || stage.isAnimating() || stage.isAmbient())) raf = requestAnimationFrame(frame);
      else {
        last = 0;
        lastDraw = 0;
      }
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;
    const onResize = () => {
      stage.resize();
      dirty = true;
      kick();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick();
    });
    io.observe(section);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", onResize);
    kick();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      kickRef.current = () => undefined;
    };
  }, [load, reduced, compact]);

  const chooseFinish = useCallback((f: TreccFinish) => {
    setFinish(f);
    stageRef.current?.setFinish(f, true);
    kickRef.current();
  }, []);

  // Without WebGL (common on locked-down government laptops and remote desktops), or if the 3D view
  // fails: no pinned scroll, just the four steps with photos.
  if (load === "fallback") return <TreccStepsStatic sectionRef={sectionRef} />;

  const ready = load === "ready";
  const active = reduced ? 3 : step;
  const still = "stowed";

  return (
    <section
      ref={sectionRef}
      aria-labelledby="trecc-heading"
      className="relative h-[400svh] border-t border-line bg-ink motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden motion-reduce:relative motion-reduce:min-h-[620px]">
        {/* Still frame while the model loads (without WebGL the section switches to TreccStepsStatic).
            Sources are chosen by media query so the server HTML is already right for phones and
            reduced motion. */}
        <picture>
          <source media="(prefers-reduced-motion: reduce) and (max-width: 1023px)" srcSet="/models/trecc-poster-deployed-m.jpg" />
          <source media="(prefers-reduced-motion: reduce)" srcSet="/models/trecc-poster-deployed.jpg" />
          <source media="(max-width: 1023px)" srcSet={`/models/trecc-poster-${still}-m.jpg`} />
          <img
            src={`/models/trecc-poster-${still}.jpg`}
            loading="lazy"
            decoding="async"
            alt=""
            aria-hidden
            className={`absolute inset-x-0 top-0 h-[60svh] w-full object-cover transition-opacity duration-700 lg:inset-0 lg:h-full ${
              ready ? "opacity-0" : "opacity-100"
            }`}
          />
        </picture>
        {(Object.keys(CLIMATE_GLOW) as TreccFinish[]).map((f) => (
          <div
            key={f}
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 top-0 h-[60svh] transition-opacity duration-1000 lg:inset-0 lg:h-full ${
              ready && finish === f ? "opacity-100" : "opacity-0"
            }`}
            style={{ background: CLIMATE_GLOW[f] }}
          />
        ))}
        <canvas
          ref={canvasRef}
          aria-label={ready ? "3D model of a Weatherhaven TRECC going from stowed to deployed as you scroll" : undefined}
          role={ready ? "img" : undefined}
          aria-hidden={!ready}
          className={`absolute inset-x-0 top-0 h-[60svh] w-full transition-opacity duration-700 lg:inset-0 lg:h-full ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Legibility wash behind the copy on desktop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{ background: "linear-gradient(90deg, rgb(10 15 23 / 0.92) 0%, rgb(10 15 23 / 0.7) 26%, rgb(10 15 23 / 0) 52%)" }}
        />

        <div className="pointer-events-none relative flex h-full flex-col justify-end lg:justify-center">
          {/* Phones: the controls sit at the foot of the 3D view, or just above the copy when a short
              screen pushes the copy up into the view (sticky bottom = whichever is higher), so the
              headline never runs under them. Desktop: bottom right of the stage. */}
          <div className="v2-inset-r pointer-events-auto sticky bottom-[calc(40svh+0.5rem)] mb-3 mr-[var(--v2-gutter)] flex flex-col items-end gap-2 self-end lg:absolute lg:bottom-10 lg:mb-0 lg:mr-0">
            {ready ? (
              <p aria-live="polite" className="hidden bg-ink/70 px-3 py-1.5 text-[0.875rem] text-snow/90 backdrop-blur-md lg:block">
                {weatherOn ? `${CLIMATE_NOTE[finish].weather} ` : null}
                {CLIMATE_NOTE[finish].rating}
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              {/* Available before the 3D view loads, and without WebGL: AR uses the phone's own viewer. */}
              <TreccArButton finish={finish} tall />
              {ready ? <TreccFinishPicker value={finish} onChange={chooseFinish} /> : null}
            </div>
          </div>
          <div className="v2-wrap w-full pb-24 md:pb-8 lg:pb-0">
            <div className="pointer-events-auto max-w-[30rem] bg-ink lg:bg-transparent">
              <h2 id="trecc-heading" className="v2-h2 pt-5 text-snow lg:pt-0">
                Trailer to command post in under three minutes
              </h2>
              <p className="v2-body mt-4 hidden lg:block">
                TRECC is a patented all-aluminum shelter that rides on a trailer, a vehicle or a 463L pallet.
              </p>
              <ol className="mt-8 hidden space-y-1 lg:block">
                {STEPS.map((s, i) => {
                  const on = reduced || i === active;
                  return (
                    <li
                      key={s.title}
                      className={`grid grid-cols-[2.25rem_1fr] border-l-2 py-3 pl-4 transition-colors duration-300 ${
                        on ? "border-signal" : "border-line"
                      }`}
                    >
                      <span className={`v2-figure text-[1.05rem] ${on ? "text-signal" : "text-muted"}`}>{i + 1}</span>
                      <div>
                        <p className={`text-[1.1rem] font-semibold ${on ? "text-snow" : "text-muted"}`}>{s.title}</p>
                        <p
                          className={`overflow-hidden text-[0.95rem] leading-relaxed text-muted transition-[max-height,opacity] duration-500 ${
                            on ? "mt-1 max-h-32 opacity-100" : "max-h-0 opacity-0"
                          }`}
                        >
                          {s.body}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              {/* Phones: the active step under the model */}
              <div className="mt-3 min-h-[6.5rem] lg:hidden" aria-live="polite">
                <p className="text-[1.05rem] font-semibold text-snow">
                  <span className="v2-figure mr-2 text-signal">{active + 1}</span>
                  {STEPS[active].title}
                </p>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{STEPS[active].body}</p>
              </div>
              <Link href="/configurable-solutions/trecc" className="v2-link mt-5 inline-block text-[0.95rem] lg:mt-6">
                TRECC specifications
              </Link>
            </div>
          </div>
        </div>

        <p className="v2-inset-r pointer-events-none absolute bottom-3 hidden text-[0.8125rem] text-muted lg:block">
          Illustrative model. Configuration varies by program.
        </p>
      </div>
    </section>
  );
}

/** The section without 3D: heading, the four steps with photos, and the same links. */
function TreccStepsStatic({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  return (
    <section ref={sectionRef} aria-labelledby="trecc-heading" className="border-t border-line bg-ink py-16 sm:py-20 lg:py-24">
      <div className="v2-wrap">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <h2 id="trecc-heading" className="v2-h2 max-w-[22ch] text-snow">
            Trailer to command post in under three minutes
          </h2>
          <p className="v2-body max-w-[46ch] lg:justify-self-end">
            TRECC is a patented all-aluminum shelter that rides on a trailer, a vehicle or a 463L pallet.
          </p>
        </div>
        <ol className="mt-10 grid gap-x-6 gap-y-6 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[7.5rem_1fr] gap-4 sm:block">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#0c121b]">
                <Image src={s.photo.src} alt={s.photo.alt} fill sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 7.5rem" className="object-cover" />
              </div>
              <div className="sm:mt-4">
                <p className="text-[1.05rem] font-semibold text-snow sm:text-[1.1rem]">
                  <span className="v2-figure mr-2 text-signal">{i + 1}</span>
                  {s.title}
                </p>
                <p className="mt-1 text-[0.9rem] leading-relaxed text-muted sm:text-[0.95rem]">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/configurable-solutions/trecc" className="v2-link text-[0.95rem]">
            TRECC specifications
          </Link>
          {/* AR uses the phone's own viewer, so it works without WebGL here. */}
          <TreccArButton finish="green" tall />
        </div>
      </div>
    </section>
  );
}
