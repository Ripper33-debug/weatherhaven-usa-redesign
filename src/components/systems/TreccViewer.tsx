"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import type { OpenPoint, TreccStage } from "@/lib/three/treccStage";
import type { TreccFinish } from "@/lib/three/treccFinishes";
import { TreccFinishPicker } from "@/components/three/TreccFinishPicker";
import { TreccArButton } from "@/components/three/TreccArButton";
import { startWhenNear } from "@/lib/start-when-near";

type LoadState = "idle" | "loading" | "ready" | "fallback";

/**
 * Numbered callouts pinned to the deployed TRECC, each a published fact (the same figures as the
 * spec table and size drawing on this page). Points are fractions of the deployed model's box:
 * x along its length (the expanding end at 1), y up, z across (the long side facing the default
 * view at 1).
 */
const CALLOUTS: { title: string; text: string; point: OpenPoint }[] = [
  {
    title: "Up in under 3 minutes",
    text: "Two people deploy it with 24 VDC electric actuators, with a manual backup.",
    point: { at: [0.82, 0.55, 1], normal: [0, 0, 1] },
  },
  {
    title: "Footprint grows about 1.6×",
    text: "TRECC-T: 114 × 94.5 in stowed, 181 × 97 in deployed.",
    point: { at: [1, 0.15, 0.5], normal: [1, 0, 0] },
  },
  {
    title: "All-aluminum shell",
    text: "Rated from −40 °F to +120 °F and for 55 mph sustained winds.",
    point: { at: [0.3, 1, 0.55], normal: [0, 1, 0] },
  },
  {
    title: "Rides what you drive",
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
        if (t >= 1) tweenRef.current = null;
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
      const show = deployRef.current > 0.98;
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
      <div ref={wrapRef} className="v2-ticks relative aspect-[4/3] overflow-hidden border border-line bg-[radial-gradient(ellipse_at_60%_45%,#172233_0%,#0a0f17_70%)] sm:aspect-[16/9]">
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
                className={`v2-tech pointer-events-none absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full !text-[0.72rem] transition-[opacity,background-color,color] duration-200 ${
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
            <div role="group" aria-label="Configuration" className="absolute left-3 top-3 flex bg-ink/70 p-1 backdrop-blur-md sm:left-4 sm:top-4">
              {[
                { v: false, label: "Stowed" },
                { v: true, label: "Deployed" },
              ].map((o) => (
                <button
                  key={o.label}
                  type="button"
                  aria-pressed={deployed === o.v}
                  onClick={() => toggle(o.v)}
                  className={`h-9 px-4 text-[0.85rem] font-medium transition-colors ${
                    deployed === o.v ? "bg-snow text-ink" : "text-snow/80 hover:text-snow"
                  }`}
                >
                  {o.label}
                </button>
              ))}
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
              <span className="hidden px-2 text-[0.85rem] text-muted sm:inline">or drag</span>
            </div>
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
              <TreccFinishPicker value={finish} onChange={chooseFinish} />
            </div>
          </>
        ) : null}
      </div>
      <ol aria-label="TRECC at a glance" className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {CALLOUTS.map((c, i) => (
          <li
            key={c.title}
            onMouseEnter={() => setHot(i)}
            onMouseLeave={() => setHot((h) => (h === i ? null : h))}
            className="grid grid-cols-[1.5rem_1fr] gap-3 border-t border-line pt-3"
          >
            <span
              aria-hidden
              className={`v2-tech mt-0.5 flex h-6 w-6 items-center justify-center rounded-full !text-[0.72rem] transition-colors ${
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
        3D model for illustration. Configuration varies by program.
        {lead ? (
          <span className="mt-2 block min-h-[3em] text-[0.9rem]">
            {ready ? "Drag to turn it, switch between stowed and deployed, and try the three finishes. " : null}On a phone, see it full
            size where you stand.
          </span>
        ) : null}
      </p>
    </div>
  );
}
