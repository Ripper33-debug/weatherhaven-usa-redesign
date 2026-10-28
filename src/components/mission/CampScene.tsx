"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import { campPlan } from "@/lib/camp-scene-plan";
import type { GuideAnswers } from "@/lib/mission-guide";
import type { CampFocus, CampStage, TagPos } from "@/lib/three/camp/campStage";
import { startWhenNear } from "@/lib/start-when-near";

type LoadState = "idle" | "loading" | "ready" | "fallback";

/**
 * The 3D camp that builds itself beside the mission builder's questions. The questions stay the
 * accessible way to use the builder; the scene is an illustration with a text description, and
 * its labels repeat links that are also in the results.
 */
export function CampScene({ answers, focus, results }: { answers: GuideAnswers; focus: CampFocus; results: boolean }) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<CampStage | null>(null);
  const tagRefs = useRef(new Map<string, HTMLElement>());
  const [load, setLoad] = useState<LoadState>("idle");
  const [hover, setHover] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const compact = useClientMediaQuery("(max-width: 1023px)");
  const coarse = useClientMediaQuery("(pointer: coarse)");

  const plan = useMemo(() => campPlan(answers), [answers]);
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  // Load three.js once the page has loaded and the scene is on screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let cancelled = false;
    const start = async () => {
      const mod = await import("@/lib/three/camp/campStage");
      if (cancelled) return;
      if (!mod.canUseWebGL() || !canvasRef.current) {
        setLoad("fallback");
        return;
      }
      setLoad("loading");
      try {
        const mobile = window.matchMedia("(max-width: 1023px)").matches;
        const stage = await mod.createCampStage(canvasRef.current, {
          mobile,
          reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          maxDpr: mobile ? 1.5 : 1.6,
          onTags: (tags: TagPos[]) => {
            for (const t of tags) {
              const node = tagRefs.current.get(t.unitId);
              if (!node) continue;
              node.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`;
              node.style.opacity = t.visible ? "1" : "0";
              node.style.visibility = t.visible ? "visible" : "hidden";
            }
          },
          onPick: (slug) => routerRef.current.push(`/configurable-solutions/${slug}`),
          onHover: setHover,
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
    const stop = startWhenNear(el, () => void start(), "50% 0px");
    return () => {
      cancelled = true;
      stop();
      stageRef.current?.dispose();
      stageRef.current = null;
    };
  }, []);

  // Hand every new plan to the stage.
  useEffect(() => {
    if (load !== "ready") return;
    stageRef.current?.setPlan(plan, focus);
  }, [load, plan, focus]);

  // Size and visibility.
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (load !== "ready" || !canvas || !stage) return;
    const ro = new ResizeObserver(() => stage.resize());
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => stage.setActive(e.isIntersecting));
    io.observe(canvas);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [load]);

  const ready = load === "ready";
  const lead = plan.lead;
  const tags = plan.tags;
  const showTags = ready && (results ? tags : tags.slice(0, 1));

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden bg-[#0c121b]"
      onPointerDown={() => setTouched(true)}
    >
      {/* Placeholder until the scene draws its first frame, and the stand-in without WebGL. */}
      <div aria-hidden className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>
        <div className="v2-camp-placeholder absolute inset-0" />
      </div>
      <canvas
        ref={canvasRef}
        role={ready ? "img" : undefined}
        aria-label={ready ? plan.summary : undefined}
        aria-hidden={!ready}
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
      />

      {/* Name tags over the shelters: the lead while answering, every system on the results. */}
      {showTags
        ? showTags.map((t) => {
            const best = t.role === "best";
            const on = hover === t.unitId;
            const chip = (
              <>
                <span
                  className={`block whitespace-nowrap px-2.5 py-1 text-[0.8rem] font-semibold leading-none transition-colors ${
                    best ? "bg-signal text-ink" : on ? "bg-snow text-ink" : "bg-ink/80 text-snow shadow-[inset_0_0_0_1px_rgb(148_170_196/0.4)] backdrop-blur-sm"
                  }`}
                >
                  {t.name}
                  {results && best ? <span className="ml-1.5 font-medium opacity-80">Best match</span> : null}
                </span>
                <span aria-hidden className={`mx-auto block h-5 w-px ${best ? "bg-signal" : "bg-snow/60"}`} />
                <span aria-hidden className={`mx-auto -mt-0.5 block h-1.5 w-1.5 rounded-full ${best ? "bg-signal" : "bg-snow"}`} />
              </>
            );
            const style = { opacity: 0, visibility: "hidden" as const };
            const ref = (el: HTMLElement | null) => {
              if (el) tagRefs.current.set(t.unitId, el);
              else tagRefs.current.delete(t.unitId);
            };
            return results ? (
              <a
                key={t.unitId}
                ref={ref}
                href={`/configurable-solutions/${t.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/configurable-solutions/${t.slug}`);
                }}
                onPointerEnter={() => setHover(t.unitId)}
                onPointerLeave={() => setHover(null)}
                tabIndex={-1}
                aria-hidden
                style={style}
                className="absolute left-0 top-0 z-10 no-underline transition-opacity duration-300"
              >
                <span className="flex -translate-x-1/2 -translate-y-full flex-col">{chip}</span>
              </a>
            ) : (
              <div key={t.unitId} ref={ref} aria-hidden style={style} className="pointer-events-none absolute left-0 top-0 z-10 transition-opacity duration-300">
                <span className="flex -translate-x-1/2 -translate-y-full flex-col">{chip}</span>
              </div>
            );
          })
        : null}

      {/* What the scene is showing */}
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-ink/70 to-transparent px-4 pb-10 pt-3 sm:px-6 sm:pt-5">
        {lead ? (
          <p className="text-[0.8rem] text-snow/75 sm:text-[0.85rem]">
            {results ? "Recommended camp" : "Leading match so far"}
            <span className="mt-0.5 block text-[1.15rem] font-semibold text-snow sm:text-[1.35rem] [font-variation-settings:'wdth'_110]">{lead.name}</span>
          </p>
        ) : (
          <p className="max-w-[26ch] text-[0.95rem] leading-snug text-snow/85 sm:text-[1.05rem]">Your camp builds here as you answer.</p>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/75 to-transparent px-4 pb-2.5 pt-8 sm:px-6 sm:pb-4">
        <p className="max-w-[52ch] text-[0.72rem] leading-snug text-snow/70 sm:text-[0.78rem]">
          {load === "fallback"
            ? "The 3D camp needs WebGL, which this browser has turned off. The questions and results work the same without it."
            : compact
              ? "Illustration. Simplified models, illustrative quantities. Grid: 5 m."
              : "Illustration. Simplified models drawn from published dimensions; quantities are illustrative. Grid squares are 5 m."}
        </p>
        {ready && !touched ? (
          <p className="shrink-0 text-[0.72rem] text-snow/70 sm:text-[0.78rem]">
            {coarse ? "Swipe sideways to turn" : results ? "Drag to turn, click a shelter for specs" : "Drag to turn"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
