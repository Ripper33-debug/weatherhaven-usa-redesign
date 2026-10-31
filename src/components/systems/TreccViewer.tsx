"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import type { OpenPoint, TreccStage } from "@/lib/three/treccStage";
import type { TreccFinish } from "@/lib/three/treccFinishes";
import { TreccFinishPicker } from "@/components/three/TreccFinishPicker";
import { TreccArButton } from "@/components/three/TreccArButton";
import { startWhenNear } from "@/lib/start-when-near";
import { systemModel } from "@/lib/system-models";

const INSIDE_LABEL = systemModel("trecc")?.inside?.label;

type LoadState = "idle" | "loading" | "ready" | "fallback";

/**
 * Numbered callouts pinned to the deployed TRECC, each a published fact keyed to the part it
 * describes (the size drawing further down the page covers the footprint). Points are fractions of
 * the deployed model's box: x along its length (the expanding end at 1), y up, z across (the long
 * side facing the default view at 1).
 */
const CALLOUTS: { title: string; text: string; point: OpenPoint }[] = [
  {
    title: "Electric actuators",
    text: "24 VDC actuators expand and stow it, with a manual backup.",
    point: { at: [0.82, 0.55, 1], normal: [0, 0, 1] },
  },
  {
    title: "All-aluminum shell",
    text: "Rated from −40 °F to +120 °F and for 55 mph sustained winds.",
    point: { at: [0.3, 1, 0.55], normal: [0, 1, 0] },
  },
  {
    title: "Trailer, vehicle or pallet",
    text: "A light tactical trailer, an M1289 JLTV trailer or one 463L pallet; under 60 in stowed, for CH-47 airlift.",
    point: { at: [0.12, 0.06, 1], normal: [0, 0, 1] },
  },
];

/**
 * Interactive TRECC on its product page: drag to turn, stowed/deployed, three finishes, and
 * "See it full size" in the phone's AR viewer (shown even when the 3D view can't load).
 */
/** `lead`: the viewer opens the page, so its still is the first thing to load. */
export function TreccViewer({ lead = false }: { lead?: boolean } = {}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<TreccStage | null>(null);
  const kickRef = useRef<() => void>(() => undefined);
  const tweenRef = useRef<{ from: number; to: number; start: number } | null>(null);
  const deployRef = useRef(1);
  const reduced = useClientMediaQuery("(prefers-reduced-motion: reduce)");
  const [load, setLoad] = useState<LoadState>("idle");
  const [finish, setFinish] = useState<TreccFinish>("green");
  const [deployed, setDeployed] = useState(true);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [hot, setHot] = useState<number | null>(null);
  /** "Show inside": the fit-out appears once a deploy (if one is running) has finished. */
  const insideRef = useRef(false);
  const pendingInsideRef = useRef(false);
  const pendingStowRef = useRef(false);
  const [insideOn, setInsideOn] = useState(false);
  const [insideLoading, setInsideLoading] = useState(false);
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let cancelled = false;
    let raf = 0;
    let lastMove = 0;
    let visible = false;
    const frame = () => {
      raf = 0;
      const stage = stageRef.current;
      if (!stage) return;
      const tw = tweenRef.current;
      if (tw) {
        const t = Math.min(1, (performance.now() - tw.start) / 1800);
        const k = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
        deployRef.current = tw.from + (tw.to - tw.from) * k;
        stage.setDeploy(deployRef.current);
        if (t >= 1) {
          tweenRef.current = null;
          if (pendingInsideRef.current && deployRef.current === 1) {
            pendingInsideRef.current = false;
            void stage.setInside(true, !reducedRef.current).then(kick);
          }
        }
      }
      if (pendingStowRef.current && stage.insideProgress() === 0) {
        pendingStowRef.current = false;
        tweenRef.current = { from: deployRef.current, to: 0, start: performance.now() };
      }
      // render() runs the orbit controls, whose change event calls kick(); that may already
      // have queued the next frame, so only queue one if nothing is pending.
      stage.render();
      placeMarkers(stage);
      const busy = !!tweenRef.current || stage.isAnimating() || performance.now() - lastMove < 400;
      if (visible && busy && !raf) raf = requestAnimationFrame(frame);
    };
    // The callouts follow the model; they show only when it's fully deployed and that face is
    // turned toward the camera.
    const placeMarkers = (stage: TreccStage) => {
      const pts = stage.projectOpen(CALLOUTS.map((c) => c.point));
      const show = deployRef.current > 0.98 && stage.insideProgress() === 0;
      pts.forEach((p, i) => {
        const el = markerRefs.current[i];
        if (!el) return;
        el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
        el.style.opacity = show && p.front ? "1" : "0";
      });
    };
    const kick = () => {
      lastMove = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;

    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    onScreen.observe(el);

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
        const stage = await createTreccStage(canvasRef.current, { maxDpr: 1.75 });
        if (cancelled) {
          stage.dispose();
          return;
        }
        stage.setCamera({ az: 34, el: 15, dist: 10.6, ty: 1.0 });
        stage.setDeploy(1);
        stage.enableControls(kick);
        stageRef.current = stage;
        // Test captures drive the stage directly (set only by those scripts).
        const w = window as unknown as { __CAMP_CAPTURE__?: boolean; __treccStage?: TreccStage };
        if (w.__CAMP_CAPTURE__) w.__treccStage = stage;
        setLoad("ready");
        kick();
      } catch {
        if (!cancelled) setLoad("fallback");
      }
    };
    const stopLoader = startWhenNear(el, () => void start(), "50% 0px");

    const onResize = () => {
      stageRef.current?.resize();
      kick();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      stopLoader();
      onScreen.disconnect();
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      stageRef.current?.dispose();
      stageRef.current = null;
    };
  }, []);

  const toggle = useCallback(
    (next: boolean) => {
      setDeployed(next);
      const stage = stageRef.current;
      if (!stage) return;
      if (!next && (insideRef.current || pendingInsideRef.current)) {
        // Put the roof back on first; the frame loop stows once it's on.
        const wasInside = insideRef.current;
        insideRef.current = false;
        pendingInsideRef.current = false;
        setInsideOn(false);
        void stage.setInside(false, !reduced).then(() => kickRef.current());
        if (wasInside && !reduced) {
          pendingStowRef.current = true;
          kickRef.current();
          return;
        }
      }
      if (reduced) {
        deployRef.current = next ? 1 : 0;
        stage.setDeploy(deployRef.current);
      } else {
        tweenRef.current = { from: deployRef.current, to: next ? 1 : 0, start: performance.now() };
      }
      kickRef.current();
    },
    [reduced],
  );

  const toggleInside = useCallback(async () => {
    const stage = stageRef.current;
    if (!stage) return;
    const next = !insideRef.current;
    insideRef.current = next;
    setInsideOn(next);
    if (!next) {
      pendingInsideRef.current = false;
      await stage.setInside(false, !reduced);
      kickRef.current();
      return;
    }
    // Stowed: deploy first; the fit-out downloads meanwhile.
    if (deployRef.current < 1 || pendingStowRef.current) {
      pendingStowRef.current = false;
      setDeployed(true);
      if (reduced) {
        deployRef.current = 1;
        stage.setDeploy(1);
      } else {
        tweenRef.current = { from: deployRef.current, to: 1, start: performance.now() };
      }
      kickRef.current();
    }
    setInsideLoading(true);
    try {
      await stage.preloadInside();
    } catch {
      insideRef.current = false;
      setInsideOn(false);
      return;
    } finally {
      setInsideLoading(false);
    }
    if (!insideRef.current) return;
    if (tweenRef.current) pendingInsideRef.current = true;
    else await stage.setInside(true, !reduced);
    kickRef.current();
  }, [reduced]);

  const chooseFinish = useCallback((f: TreccFinish) => {
    setFinish(f);
    stageRef.current?.setFinish(f, true);
    kickRef.current();
  }, []);

  const turn = useCallback((degrees: number) => {
    stageRef.current?.turn(degrees);
    kickRef.current();
  }, []);

  const ready = load === "ready";

  return (
    <div>
      <div ref={wrapRef} className="relative aspect-[4/3] overflow-hidden border border-line bg-[radial-gradient(ellipse_at_60%_45%,#172233_0%,#0a0f17_70%)] sm:aspect-[16/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/models/trecc-poster-viewer.jpg"
          loading={lead ? "eager" : "lazy"}
          fetchPriority={lead ? "high" : "auto"}
          decoding="async"
          alt={load === "fallback" ? "Weatherhaven TRECC expandable shelter, deployed" : ""}
          aria-hidden={load !== "fallback"}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
        />
        <canvas
          ref={canvasRef}
          role={ready ? "img" : undefined}
          aria-hidden={!ready}
          aria-label={ready ? `3D model of the TRECC, ${deployed ? "deployed" : "stowed"}. Drag or use the turn buttons to rotate it.` : undefined}
          className={`absolute inset-0 h-full w-full cursor-grab touch-none transition-opacity duration-700 active:cursor-grabbing ${ready ? "opacity-100" : "opacity-0"}`}
        />
        {ready
          ? CALLOUTS.map((c, i) => (
              <span
                key={c.title}
                ref={(el) => {
                  markerRefs.current[i] = el;
                }}
                aria-hidden
                style={{ opacity: 0 }}
                className={`pointer-events-none absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full text-[0.75rem] font-semibold tabular-nums transition-[opacity,background-color,color] duration-200 ${
                  hot === i ? "bg-signal text-ink" : "bg-ink/80 text-snow shadow-[inset_0_0_0_1px_rgb(238_242_246/0.7)]"
                }`}
              >
                {i + 1}
              </span>
            ))
          : null}
        {load === "loading" || load === "idle" ? (
          <p className="absolute bottom-4 left-4 text-[0.85rem] text-muted">Loading the 3D model</p>
        ) : null}
        <TreccArButton finish={finish} className="absolute right-3 top-3 sm:right-4 sm:top-4" />
        {ready ? (
          <>
            {/* On phones the AR button takes the top right, so "Show inside" wraps under the toggle. */}
            <div className="absolute left-3 top-3 flex max-w-[calc(100%-10.5rem)] flex-wrap items-start gap-2 sm:left-4 sm:top-4 sm:max-w-none">
              <div role="group" aria-label="Configuration" className="flex bg-ink/70 p-1 backdrop-blur-md">
                {[
                  { v: false, label: "Stowed" },
                  { v: true, label: "Deployed" },
                ].map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    aria-pressed={deployed === o.v}
                    onClick={() => toggle(o.v)}
                    className={`h-9 px-3 text-[0.85rem] font-medium transition-colors sm:px-4 ${
                      deployed === o.v ? "bg-snow text-ink" : "text-snow/80 hover:text-snow"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                aria-pressed={insideOn}
                aria-busy={insideLoading}
                onClick={() => void toggleInside()}
                className={`flex h-11 items-center gap-2 px-3 text-[0.85rem] font-medium backdrop-blur-md transition-colors sm:px-4 ${
                  insideOn ? "bg-snow text-ink" : "bg-ink/70 text-snow/80 hover:text-snow"
                } ${insideLoading ? "animate-pulse" : ""}`}
              >
                Show inside
              </button>
              <span className="sr-only" aria-live="polite">
                {insideLoading ? "Loading the fit-out" : ""}
              </span>
            </div>
            <div role="group" aria-label="Turn the model" className="absolute bottom-3 left-3 flex items-center bg-ink/70 p-1 backdrop-blur-md sm:bottom-4 sm:left-4">
              {[
                { deg: -45, label: "Turn left", d: "M9.5 4.5 5 9l4.5 4.5M5.5 9H12a4 4 0 0 1 0 8h-1" },
                { deg: 45, label: "Turn right", d: "M10.5 4.5 15 9l-4.5 4.5M14.5 9H8a4 4 0 0 0 0 8h1" },
              ].map((b) => (
                <button
                  key={b.label}
                  type="button"
                  aria-label={b.label}
                  title={b.label}
                  onClick={() => turn(b.deg)}
                  className="flex h-9 w-9 items-center justify-center text-snow/80 transition-colors hover:bg-white/[0.06] hover:text-snow"
                >
                  <svg aria-hidden viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={b.d} />
                  </svg>
                </button>
              ))}
            </div>
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
              <TreccFinishPicker value={finish} onChange={chooseFinish} />
            </div>
          </>
        ) : null}
      </div>
      <ol aria-label="TRECC at a glance" className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-3">
        {CALLOUTS.map((c, i) => (
          <li
            key={c.title}
            onMouseEnter={() => setHot(i)}
            onMouseLeave={() => setHot((h) => (h === i ? null : h))}
            className="grid grid-cols-[1.5rem_1fr] gap-3 border-t border-line pt-3"
          >
            <span
              aria-hidden
              className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[0.75rem] font-semibold tabular-nums transition-colors ${
                hot === i ? "bg-signal text-ink" : "text-snow shadow-[inset_0_0_0_1px_rgb(238_242_246/0.7)]"
              }`}
            >
              {i + 1}
            </span>
            <div>
              <p className="text-[0.95rem] font-semibold text-snow">{c.title}</p>
              <p className="mt-0.5 text-[0.9rem] leading-snug text-muted">{c.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[0.85rem] text-muted">
        {insideOn && INSIDE_LABEL ? `Example fit-out: ${INSIDE_LABEL}` : "Illustrative model"}. Configuration varies by program.
      </p>
    </div>
  );
}
