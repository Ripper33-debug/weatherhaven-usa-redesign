"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import type { TreccStage } from "@/lib/three/treccStage";
import type { TreccFinish } from "@/lib/three/treccFinishes";
import { TreccFinishPicker } from "@/components/three/TreccFinishPicker";
import { startWhenNear } from "@/lib/start-when-near";

type LoadState = "idle" | "loading" | "ready" | "fallback";

/** Interactive TRECC on its product page: drag to turn, stowed/deployed, three finishes. */
export function TreccViewer() {
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
      const busy = !!tweenRef.current || stage.isAnimating() || performance.now() - lastMove < 400;
      if (visible && busy && !raf) raf = requestAnimationFrame(frame);
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
      const { canUseWebGL, createTreccStage } = await import("@/lib/three/treccStage");
      if (cancelled) return;
      if (!canUseWebGL() || !canvasRef.current) {
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
      <div ref={wrapRef} className="relative aspect-[4/3] overflow-hidden border border-line bg-[radial-gradient(ellipse_at_60%_45%,#172233_0%,#0a0f17_70%)] sm:aspect-[16/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/models/trecc-poster-viewer.jpg"
          loading="lazy"
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
        {load === "loading" || load === "idle" ? (
          <p className="absolute bottom-4 left-4 text-[0.85rem] text-muted">Loading the 3D model</p>
        ) : null}
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
              <span className="hidden px-2 text-[0.8rem] text-muted sm:inline">or drag</span>
            </div>
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
              <TreccFinishPicker value={finish} onChange={chooseFinish} />
            </div>
          </>
        ) : null}
      </div>
      <p className="mt-3 text-[0.8rem] text-muted">3D model for illustration. Configuration varies by program.</p>
    </div>
  );
}
