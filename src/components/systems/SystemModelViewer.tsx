"use client";

import { useCallback, useEffect, useRef, useState, ViewTransition } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import type { SystemStage } from "@/lib/three/systemStage";
import type { TreccFinish } from "@/lib/three/treccFinishes";
import { TreccFinishPicker } from "@/components/three/TreccFinishPicker";
import { startWhenNear } from "@/lib/start-when-near";
import { arHref, modelPoster, systemModel } from "@/lib/system-models";

type LoadState = "idle" | "loading" | "ready" | "fallback";

/** How long the fold-down takes, and the ease (in-out cubic, like the TRECC viewer). */
const DEPLOY_MS = 2600;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Interactive 3D model on a product page, for any system in the model registry
 * (src/lib/system-models.ts) other than the TRECC: drag to turn, packed or deployed with the
 * model's own fold-down, three finishes, and a link to the full-size AR page. The still is the first
 * paint and stays as the fallback when the browser can't draw WebGL on a graphics chip.
 */
export function SystemModelViewer({
  slug,
  name,
  lead = false,
  transitionName,
}: {
  slug: string;
  name: string;
  lead?: boolean;
  /** Shared-element name for the stage (the catalog card's photo morphs into it). */
  transitionName?: string;
}) {
  const model = systemModel(slug);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<SystemStage | null>(null);
  const kickRef = useRef<() => void>(() => undefined);
  const tweenRef = useRef<{ from: number; to: number; start: number; ms: number } | null>(null);
  const deployRef = useRef(1);
  /** What to do once the running animation ends: cut the shell open, or pack up. */
  const pendingRef = useRef<"inside" | "pack" | null>(null);
  const insideRef = useRef(false);
  const reduced = useClientMediaQuery("(prefers-reduced-motion: reduce)");
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);
  const [load, setLoad] = useState<LoadState>("idle");
  const [finish, setFinish] = useState<TreccFinish>("green");
  const [deployed, setDeployed] = useState(true);
  const [canStow, setCanStow] = useState(false);
  const [insideOn, setInsideOn] = useState(false);
  const [insideLoading, setInsideLoading] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !model) return;
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
        const t = Math.min(1, (performance.now() - tw.start) / tw.ms);
        deployRef.current = tw.from + (tw.to - tw.from) * ease(t);
        stage.setDeploy(deployRef.current);
        if (t >= 1) {
          tweenRef.current = null;
          // Show inside was pressed while packed: cut it open once it has deployed.
          if (pendingRef.current === "inside" && deployRef.current === 1) {
            pendingRef.current = null;
            void stage.setInside(true, !reducedRef.current).then(kick);
          }
        }
      }
      // Packed was pressed while looking inside: pack once the roof is back on.
      if (pendingRef.current === "pack" && stage.insideProgress() === 0) {
        pendingRef.current = null;
        tweenRef.current = { from: deployRef.current, to: 0, start: performance.now(), ms: DEPLOY_MS };
      }
      stage.render();
      const busy = !!tweenRef.current || stage.isAnimating() || performance.now() - lastMove < 400;
      if (visible && busy && !raf) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      lastMove = performance.now();
      if (!raf) raf = requestAnimationFrame(frame);
    };
    kickRef.current = kick;

    // Draws only while on screen (and the browser pauses frames in hidden tabs).
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    onScreen.observe(el);

    const start = async () => {
      // Checked before three.js downloads: no WebGL, or WebGL drawn in software, keeps the still.
      const { canUseWebGL } = await import("@/lib/three/camp/webgl-check");
      if (cancelled) return;
      if (!canUseWebGL() || !canvasRef.current) {
        setLoad("fallback");
        return;
      }
      setLoad("loading");
      try {
        const { createSystemStage } = await import("@/lib/three/systemStage");
        if (cancelled || !canvasRef.current) return;
        const stage = await createSystemStage(canvasRef.current, model, { maxDpr: 1.75 });
        if (cancelled) {
          stage.dispose();
          return;
        }
        stage.enableControls(kick);
        stageRef.current = stage;
        // Test and poster captures drive the stage directly (set only by those scripts).
        const w = window as unknown as { __CAMP_CAPTURE__?: boolean; __systemStage?: SystemStage };
        if (w.__CAMP_CAPTURE__) w.__systemStage = stage;
        setCanStow(stage.canStow);
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
  }, [model]);

  const toggle = useCallback(
    (next: boolean) => {
      setDeployed(next);
      const stage = stageRef.current;
      if (!stage) return;
      const to = next ? 1 : 0;
      if (!next && insideRef.current) {
        // Put the roof back on first, then pack.
        insideRef.current = false;
        setInsideOn(false);
        void stage.setInside(false, !reduced).then(() => kickRef.current());
        if (!reduced) {
          pendingRef.current = "pack";
          kickRef.current();
          return;
        }
      }
      if (!next && pendingRef.current === "inside") {
        pendingRef.current = null;
        insideRef.current = false;
        setInsideOn(false);
      }
      if (reduced) {
        deployRef.current = to;
        stage.setDeploy(to);
      } else {
        // A partial reversal takes its share of the full time.
        const ms = DEPLOY_MS * Math.max(0.35, Math.abs(to - deployRef.current));
        tweenRef.current = { from: deployRef.current, to, start: performance.now(), ms };
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
      if (pendingRef.current === "inside") pendingRef.current = null;
      await stage.setInside(false, !reduced);
      kickRef.current();
      return;
    }
    // Packed: deploy first; the fit-out downloads meanwhile.
    if (deployRef.current < 1 || pendingRef.current === "pack") {
      pendingRef.current = null;
      setDeployed(true);
      if (reduced) {
        deployRef.current = 1;
        stage.setDeploy(1);
      } else {
        const ms = DEPLOY_MS * Math.max(0.35, 1 - deployRef.current);
        tweenRef.current = { from: deployRef.current, to: 1, start: performance.now(), ms };
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
    if (tweenRef.current) pendingRef.current = "inside";
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

  if (!model) return null;
  const ready = load === "ready";
  const ar = arHref(slug);
  const poster = modelPoster(slug);

  const stage = (
      <div
        ref={wrapRef}
        data-model-viewer
        className="relative aspect-[4/3] max-h-[80svh] w-full overflow-hidden border border-line bg-[radial-gradient(ellipse_at_60%_45%,#172233_0%,#0a0f17_70%)] sm:aspect-[16/9]"
      >
        {/* The phone still is 4:3, like the box on phones, so the model isn't cropped at the sides. */}
        <picture>
          <source media="(max-width: 639px)" srcSet={poster.small} />
          <img
            src={poster.src}
            loading={lead ? "eager" : "lazy"}
            fetchPriority={lead ? "high" : "auto"}
            decoding="async"
            alt={load === "fallback" ? `Weatherhaven ${name}, deployed` : ""}
            aria-hidden={load !== "fallback"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
          />
        </picture>
        <canvas
          ref={canvasRef}
          role={ready ? "img" : undefined}
          aria-hidden={!ready}
          aria-label={ready ? `3D model of the ${name}, ${deployed ? "deployed" : "packed"}. Drag or use the turn buttons to rotate it.` : undefined}
          className={`absolute inset-0 h-full w-full cursor-grab touch-none transition-opacity duration-700 active:cursor-grabbing ${ready ? "opacity-100" : "opacity-0"}`}
        />
        {load === "loading" || load === "idle" ? (
          <p className="absolute bottom-4 left-4 text-[0.875rem] text-muted">Loading the 3D model</p>
        ) : null}
        {ar ? (
          <a
            // With the fit-out showing, the AR page opens furnished too.
            href={insideOn ? `${ar}?inside=1` : ar}
            aria-label={insideOn ? "See it full size in AR, furnished" : "See it full size in AR"}
            className="absolute right-3 top-3 flex h-11 min-w-11 items-center justify-center gap-2 bg-ink/70 px-3 text-[0.875rem] font-medium text-snow no-underline backdrop-blur-md transition-colors hover:bg-ink/85 sm:right-4 sm:top-4"
          >
            <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M10 2.5 17 6v8l-7 3.5L3 14V6z" />
              <path d="M3 6l7 3.5L17 6M10 9.5v8" />
            </svg>
            {/* Phones show the icon only: the same link is a full button beside the copy. */}
            <span className="hidden sm:inline">See it full size</span>
          </a>
        ) : null}
        {ready ? (
          <>
            <div className="absolute left-3 right-16 top-3 flex flex-wrap items-start gap-2 sm:left-4 sm:right-auto sm:top-4">
              {canStow ? (
                <div role="group" aria-label="Configuration" className="flex bg-ink/70 p-1 backdrop-blur-md">
                  {[
                    { v: false, label: "Packed" },
                    { v: true, label: "Deployed" },
                  ].map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      aria-pressed={deployed === o.v}
                      onClick={() => toggle(o.v)}
                      className={`h-9 px-3 text-[0.875rem] font-medium transition-colors sm:px-4 ${
                        deployed === o.v ? "bg-snow text-ink" : "text-snow/80 hover:text-snow"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : null}
              {model.inside ? (
                <button
                  type="button"
                  aria-pressed={insideOn}
                  aria-busy={insideLoading}
                  onClick={() => void toggleInside()}
                  className={`flex h-11 items-center gap-2 px-3 text-[0.875rem] font-medium backdrop-blur-md transition-colors sm:px-4 ${
                    insideOn ? "bg-snow text-ink" : "bg-ink/70 text-snow/80 hover:text-snow"
                  } ${insideLoading ? "animate-pulse" : ""}`}
                >
                  <svg aria-hidden viewBox="0 0 20 20" className="hidden h-4 w-4 shrink-0 sm:block" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                    <path d="M3 8.5 10 4l7 4.5V16H3z" strokeDasharray={insideOn ? "2 2" : undefined} />
                    <path d="M7 16v-4h6v4" />
                  </svg>
                  Show inside
                </button>
              ) : null}
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
            {model.finishMaterials ? (
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4">
                <TreccFinishPicker value={finish} onChange={chooseFinish} />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
  );

  return (
    <div>
      {transitionName ? (
        <ViewTransition name={transitionName} share="v2-morph" default="none">
          {stage}
        </ViewTransition>
      ) : (
        stage
      )}
      <p className="mt-4 min-h-[1.5em] text-[0.875rem] text-muted">
        {insideOn && model.inside ? `Example fit-out: ${model.inside.label}` : model.source}. Configuration varies by program.
      </p>
    </div>
  );
}
