"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import type { CameraPose, TreccStage } from "@/lib/three/treccStage";
import type { TreccFinish } from "@/lib/three/treccFinishes";
import { TreccFinishPicker } from "@/components/three/TreccFinishPicker";

/**
 * Scroll-driven 3D TRECC: stowed → orange scan reveals the deployed shelter → orbit.
 * Figures are the published TRECC numbers (see product-content.ts).
 */
const STEPS = [
  {
    title: "Rides stowed",
    body: "On a light tactical trailer, an M1289 JLTV trailer or a single 463L pallet. Under 60 in packed height for internal CH-47 carry.",
  },
  {
    title: "Two people, under three minutes",
    body: "Electric 24VDC actuators expand it, with a manual backup.",
  },
  {
    title: "A building on arrival",
    body: "A command post, workshop, clinic or sanitation unit, rated from −40 °F to +120 °F and 55 mph sustained winds.",
  },
  {
    title: "Tested",
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

  // Load three.js and the models only when the section is close.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const { canUseWebGL, createTreccStage } = await import("@/lib/three/treccStage");
        if (cancelled) return;
        if (!canUseWebGL() || !canvasRef.current) {
          setLoad("fallback");
          return;
        }
        setLoad("loading");
        try {
          const stage = await createTreccStage(canvasRef.current, { maxDpr: window.matchMedia("(max-width: 1023px)").matches ? 1.5 : 1.75 });
          if (cancelled) {
            stage.dispose();
            return;
          }
          stageRef.current = stage;
          setLoad("ready");
        } catch {
          if (!cancelled) setLoad("fallback");
        }
      },
      { rootMargin: "1400px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
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
    let raf = 0;
    let visible = true;
    let shown = reduced ? 1 : -1;
    const progress = () => {
      if (reduced) return 1;
      const r = section.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      return travel > 0 ? clamp(-r.top / travel) : 1;
    };
    const frame = () => {
      raf = 0;
      const target = progress();
      // Ease toward the scroll position; headless test runs can opt out with window.__TRECC_INSTANT__.
      const instant = (window as unknown as { __TRECC_INSTANT__?: boolean }).__TRECC_INSTANT__;
      shown = shown < 0 || instant ? target : shown + (target - shown) * 0.12;
      if (Math.abs(target - shown) < 0.0004) shown = target;
      stage.setDeploy(smooth(DEPLOY_FROM, DEPLOY_TO, shown));
      stage.setCamera(poseAt(shown, compact));
      stage.render();
      const s = stepAt(shown);
      if (s !== stepRef.current) {
        stepRef.current = s;
        setStep(s);
      }
      if (visible && (shown !== target || stage.isAnimating())) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;
    const onResize = () => {
      stage.resize();
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

  const ready = load === "ready";
  const active = reduced ? 3 : step;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="trecc-heading"
      className={`relative border-t border-line bg-ink ${reduced ? "" : "h-[400svh]"}`}
    >
      <div className={`${reduced ? "relative h-[100svh] min-h-[620px]" : "sticky top-0 h-[100svh]"} overflow-hidden`}>
        {/* Still frame while the model loads, and the fallback without WebGL */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/models/trecc-poster-${reduced || load === "fallback" ? "deployed" : "stowed"}${compact ? "-m" : ""}.jpg`}
          alt={
            load === "fallback"
              ? "Weatherhaven TRECC expandable shelter, deployed"
              : ""
          }
          aria-hidden={load !== "fallback"}
          className={`absolute inset-x-0 top-0 h-[60svh] w-full object-cover transition-opacity duration-700 lg:inset-0 lg:h-full ${
            ready ? "opacity-0" : "opacity-100"
          }`}
        />
        <canvas
          ref={canvasRef}
          aria-label="3D model of a Weatherhaven TRECC going from stowed to deployed as you scroll"
          role="img"
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
          <div className="v2-wrap w-full pb-24 md:pb-8 lg:pb-0">
            <div className="pointer-events-auto max-w-[30rem] bg-ink lg:bg-transparent">
              <h2 id="trecc-heading" className="v2-h2 pt-5 text-snow lg:pt-0">
                Trailer to command post in under three minutes.
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

        {ready ? (
          <div className="v2-inset-r absolute top-[calc(60svh-3.75rem)] lg:bottom-10 lg:top-auto">
            <TreccFinishPicker value={finish} onChange={chooseFinish} />
          </div>
        ) : null}
        <p className="v2-inset-r pointer-events-none absolute bottom-3 hidden text-[0.75rem] text-muted/80 lg:block">
          3D model for illustration. Configuration varies by program.
        </p>
      </div>
    </section>
  );
}
