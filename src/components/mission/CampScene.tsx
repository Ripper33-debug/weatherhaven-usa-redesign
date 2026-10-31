"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import { campPlan, hasDetailedModel, isDetailedKind } from "@/lib/camp-scene-plan";
import { fitoutForMission } from "@/lib/system-models";
import { publishedFact, QUESTIONS, type GuideAnswers, type QuestionKey } from "@/lib/mission-guide";
import type { CampFocus, CampStage, TagPos } from "@/lib/three/camp/campStage";
import { startWhenNear } from "@/lib/start-when-near";
import { liveLine, placePhrase, type LiveConditions } from "@/lib/live-site";

type LoadState = "idle" | "loading" | "ready" | "fallback";

/**
 * The 3D camp that builds itself beside the mission builder's questions. The questions stay the
 * accessible way to use the builder; the scene is an illustration with a text description, and
 * its labels repeat links that are also in the results.
 */
/** What the page can ask of the scene. */
export type CampSceneApi = { snapshot: () => string | null };

/** Shown without WebGL before the first answer. */
const INTRO_PHOTO = "/products/trecc/gallery/09-Trecc-Woods.jpg";

const MISSION_ROOM: Record<string, string> = {
  command: "a command post",
  medical: "a clinic",
  maintenance: "a maintenance bay",
  living: "accommodation",
  research: "a field lab",
  response: "emergency shelter",
};

export function CampScene({
  answers,
  live = null,
  focus,
  results,
  photos,
  apiRef,
}: {
  answers: GuideAnswers;
  /** Real conditions at the place the visitor picked: the camp is built in them. */
  live?: LiveConditions | null;
  focus: CampFocus;
  results: boolean;
  /** Product photos by slug, shown instead of the 3D camp where WebGL is off. */
  photos?: Record<string, { src: string; blur?: string; shows?: string }>;
  apiRef?: React.MutableRefObject<CampSceneApi | null>;
}) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<CampStage | null>(null);
  const tagRefs = useRef(new Map<string, HTMLElement>());
  const [load, setLoad] = useState<LoadState>("idle");
  const [hover, setHover] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  // Look-inside view of the best match, as the scene reports it (a new plan closes it there).
  const [insideOn, setInsideOn] = useState(false);
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
      // Let the page settle first: loading three.js and compiling shaders is heavy.
      await new Promise<void>((resolve) => {
        const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
        if (ric) ric(() => resolve(), { timeout: 1200 });
        else window.setTimeout(resolve, 250);
      });
      if (cancelled) return;
      const { canUseWebGL } = await import("@/lib/three/camp/webgl-check");
      if (cancelled) return;
      if (!canUseWebGL() || !canvasRef.current) {
        setLoad("fallback");
        return;
      }
      setLoad("loading");
      const mod = await import("@/lib/three/camp/campStage");
      if (cancelled) return;
      try {
        const mobile = window.matchMedia("(max-width: 1023px)").matches;
        const stage = await mod.createCampStage(canvasRef.current, {
          mobile,
          reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
          maxDpr: mobile ? 1.5 : 1.6,
          onTags: (tags: TagPos[]) => {
            // Labels that would overlap stack upward, with a longer leader line down to the roof.
            const placed: { l: number; r: number; t: number; b: number }[] = [];
            for (const t of tags) {
              const node = tagRefs.current.get(t.unitId);
              if (!node) continue;
              const chip = node.firstElementChild as HTMLElement | null;
              const w = chip?.offsetWidth ?? 90;
              const h = 26;
              let lift = 0;
              if (t.visible) {
                for (let guard = 0; guard < 6; guard++) {
                  const box = { l: t.x - w / 2 - 4, r: t.x + w / 2 + 4, t: t.y - 24 - lift - h, b: t.y - 24 - lift };
                  const hit = placed.find((p) => box.l < p.r && p.l < box.r && box.t < p.b && p.t < box.b);
                  if (!hit) {
                    placed.push(box);
                    break;
                  }
                  lift += box.b - hit.t + 4;
                }
              }
              node.style.transform = `translate3d(${t.x}px, ${t.y}px, 0)`;
              node.style.setProperty("--lead", `${20 + lift}px`);
              node.style.opacity = t.visible ? "1" : "0";
              node.style.visibility = t.visible ? "visible" : "hidden";
            }
          },
          onPick: (slug) => routerRef.current.push(`/configurable-solutions/${slug}`),
          onHover: setHover,
          onInside: setInsideOn,
        });
        if (cancelled) {
          stage.dispose();
          return;
        }
        stageRef.current = stage;
        if (apiRef) apiRef.current = { snapshot: () => stageRef.current?.snapshot(960) ?? null };
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
      if (apiRef) apiRef.current = null;
    };
    // The stage is created once; apiRef is a stable ref object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hand every new plan to the stage.
  useEffect(() => {
    if (load !== "ready") return;
    stageRef.current?.setPlan(plan, focus);
    // A new plan or step closes the look-inside view (the stage does the same).
  }, [load, plan, focus]);

  // The place's weather, sun and light.
  useEffect(() => {
    if (load !== "ready") return;
    stageRef.current?.setLive(live);
  }, [load, live]);

  // Size and visibility.
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (load !== "ready" || !canvas || !stage) return;
    const ro = new ResizeObserver(() => stage.resize());
    ro.observe(canvas);
    // The newest entry wins (a fast scroll can queue an "out" and an "in" together).
    const io = new IntersectionObserver((entries) => stage.setActive(entries[entries.length - 1].isIntersecting));
    io.observe(canvas);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [load]);

  const ready = load === "ready";
  const lead = plan.lead;
  // The lead model's own fit-out when it suits the mission (campStage uses the same test).
  const leadFitout = lead && lead.slug !== "trecc" ? fitoutForMission(lead.slug, answers.mission) : null;
  // The lead system may be a detailed model (system-models.ts, or the TRECC's CAD files); say which
  // parts of the camp are drawn from it and which are simplified.
  const allDetailed = plan.units.every((u) => isDetailedKind(u.kind));
  const detailedNote = lead
    ? allDetailed
      ? `Detailed ${lead.name} model${plan.units.length > 1 ? "s" : ""}`
      : `Detailed ${lead.name} model; other systems simplified${compact ? "" : " from published dimensions"}`
    : "";
  const tags = plan.tags;
  const inside = results && insideOn;
  const showTags = ready && (results && !inside ? tags : tags.slice(0, 1));
  const toggleInside = () => {
    stageRef.current?.setInside(!inside);
  };
  // The published fact behind the answer the camera is showing (the same text the results use).
  // On phones the mission close-up puts the name tag where this line would go, so it waits for the
  // next answer there.
  const factKey = QUESTIONS.some((q) => q.key === focus) && !(compact && focus === "mission") ? (focus as QuestionKey) : null;
  const factText = lead && factKey ? publishedFact(lead.slug, factKey, answers[factKey]) : undefined;
  const fact = factText && factKey ? { label: QUESTIONS.find((q) => q.key === factKey)!.label, text: factText } : null;
  // Hovering any shelter lights up the label for its system.
  const hoverName = hover ? plan.units.find((u) => u.id === hover)?.name : undefined;

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden bg-[#0c121b]"
      onPointerDown={() => setTouched(true)}
    >
      {/* Placeholder until the scene draws its first frame. */}
      <div aria-hidden className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>
        <div className="v2-camp-placeholder absolute inset-0" />
      </div>
      {/* Without WebGL (common on locked-down government laptops): a photo of the leading system, or
          TRECCs in the field before the first answer. */}
      {load === "fallback" ? (
        lead && photos?.[lead.slug] ? (
          <Image
            key={lead.slug}
            src={photos[lead.slug].src}
            alt={`Weatherhaven ${lead.name}`}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
            {...(photos[lead.slug].blur ? { placeholder: "blur" as const, blurDataURL: photos[lead.slug].blur } : {})}
          />
        ) : (
          <Image src={INTRO_PHOTO} alt="Two Weatherhaven TRECCs set up in a forest clearing" fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
        )
      ) : null}
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
            const on = hoverName === t.name;
            const chip = (
              <>
                <span
                  className={`v2-tech block whitespace-nowrap px-2.5 py-1.5 !leading-none transition-colors ${
                    best ? "bg-signal text-ink" : on ? "bg-snow text-ink" : "bg-ink/80 text-snow shadow-[inset_0_0_0_1px_rgb(148_170_196/0.4)] backdrop-blur-sm"
                  }`}
                >
                  {t.name}
                  {results && best ? <span className="ml-1.5 font-medium opacity-80">Best match</span> : null}
                </span>
                <span aria-hidden className={`mx-auto block h-[var(--lead,20px)] w-px ${best ? "bg-signal" : "bg-snow/60"}`} />
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
                className={`pointer-events-none absolute left-0 top-0 h-0 w-0 no-underline transition-opacity duration-300 ${best ? "z-20" : "z-10"}`}
              >
                {/* The link box is a point at the anchor; only the label itself takes the pointer. */}
                <span className="pointer-events-auto flex w-max -translate-x-1/2 -translate-y-full flex-col">{chip}</span>
              </a>
            ) : (
              <div key={t.unitId} ref={ref} aria-hidden style={style} className="pointer-events-none absolute left-0 top-0 z-10 h-0 w-0 transition-opacity duration-300">
                <span className="flex w-max -translate-x-1/2 -translate-y-full flex-col">{chip}</span>
              </div>
            );
          })
        : null}

      {/* What the scene is showing */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-ink/70 to-transparent px-4 pb-10 pt-3 sm:px-6 sm:pt-5 ${
          ready && results ? "pr-32 sm:pr-56" : ""
        }`}
      >
        {lead ? (
          <>
            <p className="text-[0.85rem] text-snow/75 sm:text-[0.85rem]">
              {results ? "Recommended camp" : "Leading match so far"}
              <span className="mt-0.5 block text-[1.15rem] font-semibold text-snow sm:text-[1.35rem] [font-variation-settings:'wdth'_110]">{lead.name}</span>
            </p>
            {live ? (
              <p className="mt-2 max-w-[46ch] text-[0.85rem] leading-snug text-snow/85 sm:text-[0.85rem]">
                <span className="font-semibold text-snow">This hour {placePhrase(live, "at")}: </span>
                {liveLine(live)}
                <span className="text-snow/60"> (forecast: MET Norway)</span>
              </p>
            ) : null}
            {fact ? (
              <p key={`${focus}-${lead.slug}`} className="v2-step-in mt-2 line-clamp-2 max-w-[44ch] text-[0.85rem] leading-snug text-snow/80 sm:line-clamp-3 sm:text-[0.85rem]">
                <span className="font-semibold text-signal">{fact.label}: </span>
                {fact.text}
              </p>
            ) : null}
          </>
        ) : load === "fallback" ? (
          <p className="max-w-[28ch] text-[0.95rem] leading-snug text-snow sm:text-[1.05rem]">Answer the questions to see which system fits.</p>
        ) : (
          <p className="max-w-[26ch] text-[0.95rem] leading-snug text-snow/85 sm:text-[1.05rem]">Your camp builds here as you answer.</p>
        )}
      </div>

      {ready && results && lead ? (
        <button
          type="button"
          onClick={toggleInside}
          className="absolute right-3 top-3 z-30 inline-flex h-9 items-center bg-ink/75 px-3 text-[0.85rem] font-semibold text-snow shadow-[inset_0_0_0_1px_rgb(148_170_196/0.4)] backdrop-blur-sm transition-colors hover:bg-ink hover:text-signal sm:right-5 sm:top-5"
        >
          {inside ? "Back to the camp" : <>Look inside<span className="hidden sm:inline">&nbsp;the {lead.name}</span></>}
        </button>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[4.5rem] items-end justify-between gap-4 bg-gradient-to-t from-ink/75 to-transparent px-4 pb-2.5 sm:h-24 sm:px-6 sm:pb-4">
        <p className="max-w-[52ch] text-[0.8125rem] leading-snug text-snow/80 sm:text-[0.8125rem]">
          {inside
            ? leadFitout
              ? `Example fit-out: ${leadFitout.toLowerCase()}. Each layout is configured for the program.`
              : `Example fit-out for ${MISSION_ROOM[answers.mission ?? "response"]}. Each layout is configured for the program.`
            : load === "fallback"
            ? lead
              ? `${photos?.[lead.slug]?.shows ? `Photo of ${photos[lead.slug].shows}, from the same family as the ${lead.name}` : `Photo of the ${lead.name}`}. This browser can't show the 3D camp.`
              : "Photo of TRECCs in the field. This browser can't show the 3D camp (it needs hardware graphics); the questions and results work the same."
            : lead && hasDetailedModel(lead.slug)
              ? `${detailedNote}${compact ? "; illustrative quantities" : "; quantities are illustrative"}. Grid lines every 5 m.`
              : compact
                ? "Simplified models, illustrative quantities. Grid lines every 5 m."
                : "Simplified models drawn from published dimensions; quantities are illustrative. Grid lines every 5 m."}
        </p>
        {ready && !touched ? (
          <p className="shrink-0 text-[0.8125rem] text-snow/80 sm:text-[0.8125rem]">
            {coarse ? "Swipe sideways to turn" : results ? "Drag to turn, click a shelter for specs" : "Drag to turn"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
