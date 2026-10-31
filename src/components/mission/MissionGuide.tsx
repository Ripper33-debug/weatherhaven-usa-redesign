"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  answersFromParams,
  ANSWER_PARAMS,
  guideContactPrefill,
  isComplete,
  labelFor,
  pairings,
  QUESTIONS,
  recommend,
  type GuideAnswers,
  type Recommendation,
} from "@/lib/mission-guide";
import { storeCampSnapshot, storeContactPrefill } from "@/lib/contact-prefill";
import { trackLead } from "@/lib/track-lead";
import { sizesForSlug } from "@/lib/system-sizes";
import { SizeCompare } from "@/components/systems/SizeCompare";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { CampScene, type CampSceneApi } from "@/components/mission/CampScene";
import { PlacePicker } from "@/components/mission/PlacePicker";
import { CampLogistics } from "@/components/mission/CampLogistics";
import type { CampFocus } from "@/lib/three/camp/campStage";
import {
  climateForPlace,
  placeFromParams,
  placePhrase,
  placeToParams,
  snapToGrid,
  type GuidePlace,
  type LiveConditions,
} from "@/lib/live-site";
import { formatCoords } from "@/lib/field-readout";

const MissionSolutionBuilder = dynamic(
  () => import("@/components/mission/MissionSolutionBuilder").then((m) => m.MissionSolutionBuilder),
  { loading: () => <p className="v2-wrap py-16 text-[0.95rem] text-muted">Loading the detailed form</p> },
);

export type GuideProduct = {
  slug: string;
  name: string;
  subtitle: string;
  cover: string;
  blur?: string;
  /** What the photo shows when it isn't this system (no photo of its own yet). */
  shows?: string;
  specs: { label: string; value: string }[];
};

type Step = number | "results";

function firstOpen(a: GuideAnswers): Step {
  const i = QUESTIONS.findIndex((q) => !a[q.key]);
  return i === -1 ? "results" : i;
}

/** A link to this page with the answers (and the place) in it, built from the answers rather than the address bar. */
function shareUrl(a: GuideAnswers, place: GuidePlace | null): string {
  const url = new URL("/mission-solution-builder", window.location.origin);
  for (const q of QUESTIONS) {
    const v = a[q.key];
    if (v) url.searchParams.set(ANSWER_PARAMS[q.key], v);
  }
  for (const [k, v] of Object.entries(placeToParams(place))) if (v) url.searchParams.set(k, v);
  return url.toString();
}

type LiveState = LiveConditions | "loading" | "error" | null;

function writeUrl(a: GuideAnswers, extra?: Record<string, string | null>) {
  const url = new URL(window.location.href);
  for (const q of QUESTIONS) {
    const v = a[q.key];
    if (v) url.searchParams.set(ANSWER_PARAMS[q.key], v);
    else url.searchParams.delete(ANSWER_PARAMS[q.key]);
  }
  for (const [k, v] of Object.entries(extra ?? {})) {
    if (v === null) url.searchParams.delete(k);
    else url.searchParams.set(k, v);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

function Check() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="mt-[0.3rem] h-3.5 w-3.5 shrink-0 text-signal" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2.5 8.5l3.5 3.5 7.5-8" />
    </svg>
  );
}

function ProgressRail({
  answers,
  place,
  step,
  onJump,
}: {
  answers: GuideAnswers;
  place: GuidePlace | null;
  step: Step;
  onJump: (i: number) => void;
}) {
  const current = step === "results" ? QUESTIONS.length : step;
  return (
    <nav aria-label="Mission builder steps" className="border-b border-line pb-6">
      <ol className="grid grid-cols-5 gap-2 sm:gap-4">
        {QUESTIONS.map((q, i) => {
          const done = !!answers[q.key];
          const here = i === current;
          const reachable = done || i <= firstOpenIndex(answers);
          return (
            <li key={q.key} className="min-w-0">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onJump(i)}
                aria-current={here ? "step" : undefined}
                className="group flex w-full min-w-0 flex-col items-start text-left disabled:cursor-default"
              >
                <span
                  aria-hidden
                  className={`block h-1 w-full transition-colors ${here ? "bg-signal" : done ? "bg-snow/60" : "bg-line-strong"}`}
                />
                <span className={`v2-tnum mt-3 text-[0.85rem] font-semibold ${here ? "text-signal" : done ? "text-snow" : "text-muted"}`}>
                  {i + 1}
                  <span className="sr-only sm:not-sr-only sm:ml-2">{q.label}</span>
                </span>
                <span className="mt-0.5 hidden w-full truncate text-[0.85rem] text-muted group-enabled:group-hover:text-snow sm:block">
                  {done ? (q.key === "climate" && place ? place.name : labelFor(q.key, answers[q.key])) : " "}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** "in Alert, Nunavut (polar or extreme cold)", or just the climate when no place was picked. */
function climatePhrase(climate: string, place: GuidePlace | null): string {
  const label = labelFor("climate", climate).toLowerCase();
  if (!place) return label;
  return climate === "mixed" ? `${placePhrase(place)}, among other climates` : `${placePhrase(place)} (${label})`;
}

function firstOpenIndex(a: GuideAnswers): number {
  const i = QUESTIONS.findIndex((q) => !a[q.key]);
  return i === -1 ? QUESTIONS.length : i;
}

function Results({
  answers,
  place,
  recs,
  products,
  onEdit,
  onRestart,
  headingRef,
  sceneApi,
}: {
  answers: Required<GuideAnswers>;
  place: GuidePlace | null;
  recs: Recommendation[];
  products: Record<string, GuideProduct>;
  onEdit: (i: number) => void;
  onRestart: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  sceneApi: React.RefObject<CampSceneApi | null>;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [best, ...rest] = recs;
  const alternates = rest.slice(0, 2);
  const pairs = pairings(answers, recs.slice(0, 3).map((r) => r.slug));
  const bestProduct = products[best.slug];
  const sizes = sizesForSlug(best.slug);

  const sendToExpert = () => {
    const prefill = guideContactPrefill(answers, recs, place ? `${place.name} (${formatCoords(place.lat, place.lng)})` : undefined);
    // The expert gets a link to this exact plan, so they can open the same camp in 3D.
    const link = shareUrl(answers, place);
    // The contact form takes up to 500 characters; keep the link whole and trim the summary if needed.
    const tail = `\nPlan in 3D: ${link}`;
    storeContactPrefill({ ...prefill, message: `${(prefill.message ?? "").slice(0, Math.max(0, 500 - tail.length))}${tail}` });
    const image = sceneApi.current?.snapshot();
    if (image) storeCampSnapshot({ image, link });
    trackLead("mission_builder", `Mission builder: ${labelFor("mission", answers.mission)}`, {
      systems: recs.slice(0, 3).map((r) => r.slug),
      people: answers.people,
      climate: answers.climate,
      site: place?.name,
    });
    router.push("/contact?handoff=camp-plan");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(answers, place));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="v2-step-in">
      <div className="flex flex-col gap-6">
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="v2-h2 text-snow outline-none">
            Your recommended setup
          </h2>
          <p className="mt-3 max-w-[60ch] text-[1rem] leading-relaxed text-muted">
            For {labelFor("mission", answers.mission).toLowerCase()}, {labelFor("people", answers.people)} people,{" "}
            {climatePhrase(answers.climate, place)}, moved by{" "}
            {labelFor("transport", answers.transport).toLowerCase()},
            standing for {labelFor("duration", answers.duration).toLowerCase()}.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => onEdit(0)} className="v2-btn v2-btn-ghost">
            Change answers
          </button>
          <button type="button" onClick={() => void copyLink()} className="v2-btn v2-btn-ghost" aria-live="polite">
            {copied ? "Link copied" : "Copy link to this plan"}
          </button>
        </div>
      </div>

      {/* Best match */}
      <section aria-labelledby="best-heading" className="mt-10 grid gap-0 border border-line bg-hull @3xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="relative aspect-[16/10] @3xl:aspect-auto @3xl:min-h-[26rem]">
          <Image
            src={bestProduct?.cover ?? "/products/ehmecc.jpg"}
            alt={bestProduct?.shows ? `Photo of ${bestProduct.shows}` : `Weatherhaven ${best.name}`}
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover"
            {...(bestProduct?.blur ? { placeholder: "blur" as const, blurDataURL: bestProduct.blur } : {})}
          />
          {bestProduct?.shows ? (
            <p className="absolute bottom-3 left-3 bg-ink/75 px-2.5 py-1 text-[0.8125rem] text-muted backdrop-blur-sm">Photo shows {bestProduct.shows}</p>
          ) : null}
        </div>
        <div className="flex flex-col p-6 sm:p-10">
          <p className="text-[0.9rem] font-semibold text-signal">Best match</p>
          <h3 id="best-heading" className="v2-h1 mt-2 text-snow">
            {best.name}
          </h3>
          {bestProduct?.subtitle ? <p className="mt-2 text-[0.95rem] text-muted">{bestProduct.subtitle}</p> : null}
          <ul className="mt-7 space-y-3">
            {best.reasons.map((r) => (
              <li key={r} className="flex gap-3 text-[1rem] leading-relaxed text-snow/90">
                <Check />
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 pt-9 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={sendToExpert} className="v2-btn">
              Send this plan to an expert
            </button>
            <Link href={`/configurable-solutions/${best.slug}`} className="v2-btn v2-btn-ghost">
              {best.name} specifications
            </Link>
          </div>
        </div>
      </section>

      {/* Also fits */}
      {alternates.length > 0 ? (
        <section aria-labelledby="alt-heading" className="mt-14">
          <h3 id="alt-heading" className="v2-h3 text-snow">
            Also fits
          </h3>
          <div className="mt-6 grid gap-6 @xl:grid-cols-2">
            {alternates.map((r) => {
              const p = products[r.slug];
              return (
                <Link
                  key={r.slug}
                  href={`/configurable-solutions/${r.slug}`}
                  className="group grid grid-cols-[7rem_1fr] gap-5 border border-line p-4 no-underline transition-colors hover:border-line-strong sm:grid-cols-[9rem_1fr]"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={p?.cover ?? "/products/ehmecc.jpg"}
                      alt=""
                      fill
                      sizes="9rem"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      {...(p?.blur ? { placeholder: "blur" as const, blurDataURL: p.blur } : {})}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[1.15rem] font-semibold text-snow group-hover:text-signal">{r.name}</p>
                    <ul className="mt-2 space-y-1.5">
                      {r.reasons.slice(0, 2).map((x) => (
                        <li key={x} className="text-[0.9rem] leading-relaxed text-muted">
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* How the camp ships and sets up, and the one-page plan */}
      <CampLogistics answers={answers} place={place} />

      {/* Size of the best match */}
      {sizes.length > 0 ? (
        <section aria-labelledby="guide-size-heading" className="mt-16 border-t border-line pt-12">
          <h3 id="guide-size-heading" className="v2-h3 mb-8 text-snow">
            How big is the {best.name}?
          </h3>
          <SizeCompare sizes={sizes} />
        </section>
      ) : null}

      {/* Often paired */}
      {pairs.length > 0 ? (
        <section aria-labelledby="pair-heading" className="mt-16 border-t border-line pt-12">
          <h3 id="pair-heading" className="v2-h3 text-snow">
            A camp this size usually adds
          </h3>
          <ul className="mt-6 grid gap-4 @xl:grid-cols-2">
            {pairs.map((p) => (
              <li key={p.name} className="border-l-2 border-signal pl-4">
                <Link href={`/configurable-solutions/${p.slug}`} className="text-[1.05rem] font-semibold text-snow no-underline hover:text-signal">
                  {p.name}
                </Link>
                <p className="mt-1 text-[0.95rem] leading-relaxed text-muted">{p.why}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-16 flex flex-col gap-6 border-t border-line pt-10">
        <p className="max-w-[62ch] text-[0.9rem] leading-relaxed text-muted">
          Matches are based on Weatherhaven&apos;s published specifications. A Weatherhaven expert confirms the
          configuration, quantities and price for your program, usually within 48 hours.
        </p>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={sendToExpert} className="v2-btn">
            Send this plan to an expert
          </button>
          <button type="button" onClick={onRestart} className="v2-btn v2-btn-ghost">
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}

export const GUIDE_TITLE = "Plan a deployment in five questions";
const GUIDE_LEAD =
  "Answer five questions and see the camp take shape. You'll see the Weatherhaven systems that fit, with the published specs behind each match, and you can send the plan to an expert.";
const DETAILED_TITLE = "Describe the full mission requirement.";
const DETAILED_LEAD =
  "Environment, function, mobility, timeline and power in one form. It builds an indicative camp layout and parts list you can send to a Weatherhaven expert. A planning tool, not a quote.";

const CRUMBS = [{ href: "/", label: "Home" }, { label: "Mission builder" }];

function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="v2-tech flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
        <li>
          <Link href="/" className="text-muted no-underline hover:text-snow">
            Home
          </Link>
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="text-line-strong">
            /
          </span>
          <span aria-current="page" className="text-snow">
            Mission builder
          </span>
        </li>
      </ol>
    </nav>
  );
}

const anyAnswer = (a: GuideAnswers) => QUESTIONS.some((q) => !!a[q.key]);

/**
 * The URL holds the answers (so a plan can be shared and the browser stays in step with the
 * screen); this component only tracks which question is showing and what the 3D camp should
 * point its camera at.
 */
function GuideBody({
  products,
  answers,
  place,
  places,
  detailed,
}: {
  products: Record<string, GuideProduct>;
  answers: GuideAnswers;
  place: GuidePlace | null;
  places: GuidePlace[];
  detailed: boolean;
}) {
  const [step, setStep] = useState<Step>(() => firstOpen(answers));
  // What the last action changed, so the camp's camera can show it.
  const [focus, setFocus] = useState<CampFocus>(() => (anyAnswer(answers) ? "overview" : "empty"));
  const topRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLElement>(null);
  const sceneApi = useRef<CampSceneApi | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const advanceTimer = useRef(0);
  const moveFocus = useRef(false);

  // Never show a question past the first unanswered one, or results for an unfinished plan
  // (the URL can change underneath, e.g. following the header link back to a blank builder).
  const open = firstOpenIndex(answers);
  const shown: Step = step === "results" ? (isComplete(answers) ? "results" : open) : Math.min(step, open);
  const sceneFocus: CampFocus = shown === "results" ? "results" : anyAnswer(answers) ? (focus === "empty" ? "overview" : focus) : "empty";

  const recs = useMemo(() => (isComplete(answers) ? recommend(answers) : []), [answers]);
  const photos = useMemo(
    () => Object.fromEntries(Object.values(products).map((p) => [p.slug, { src: p.cover, blur: p.blur, shows: p.shows }])),
    [products],
  );

  // Live conditions at the chosen place (fetched once per place). Map points are read on a
  // quarter-degree grid, which the weather route insists on so its cache can do its job.
  const placeKey = place ? `${place.id ?? ""}|${place.lat},${place.lng}` : null;
  const [liveFetched, setLiveFetched] = useState<{ key: string; value: LiveConditions | "error" } | null>(null);
  useEffect(() => {
    if (!place || !placeKey) return;
    const ctrl = new AbortController();
    const url = place.id
      ? `/api/site-weather?id=${encodeURIComponent(place.id)}`
      : `/api/place-weather?lat=${snapToGrid(place.lat)}&lng=${snapToGrid(place.lng)}`;
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((c: Omit<LiveConditions, keyof GuidePlace | "seenAt">) =>
        setLiveFetched({ key: placeKey, value: { ...c, ...place, seenAt: new Date().toISOString() } }),
      )
      .catch((err: unknown) => {
        if ((err as Error).name !== "AbortError") setLiveFetched({ key: placeKey, value: "error" });
      });
    return () => ctrl.abort();
    // placeKey stands for the place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeKey]);
  const live: LiveState = !place ? null : liveFetched?.key === placeKey ? liveFetched.value : "loading";
  // While the next place loads, the camp keeps the last real conditions rather than flashing back
  // to the plain climate.
  const lastLive = liveFetched && typeof liveFetched.value === "object" ? liveFetched.value : null;
  const liveForScene = !place ? null : typeof live === "object" ? live : live === "loading" ? lastLive : null;

  // After the visitor moves between questions, put focus on the new heading so keyboard and
  // screen-reader users land on it (not on the first visit).
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    headingRef.current?.focus({ preventScroll: true });
  }, [shown]);

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  /** Brings the next question (or, on phones, the finished camp) into view under the header. */
  const scrollToTop = (toScene = false) => {
    const el = topRef.current;
    if (!el) return;
    const phone = window.matchMedia("(max-width: 1023px)").matches;
    const scene = sceneRef.current;
    let y: number;
    if (phone && toScene && headRef.current) {
      // The scene follows the page header; measure from there, since the scene itself may still
      // be stuck to the top of the screen.
      y = headRef.current.getBoundingClientRect().bottom + window.scrollY - 64;
    } else {
      // On phones the scene sticks under the header, so stop below it.
      const cover = phone && scene ? 64 + scene.offsetHeight + 12 : 96;
      y = el.getBoundingClientRect().top + window.scrollY - cover;
    }
    if (window.scrollY > y + 40) window.scrollTo({ top: y, behavior: "smooth" });
  };

  const goTo = (s: Step) => {
    window.clearTimeout(advanceTimer.current);
    moveFocus.current = true;
    setStep(s);
    if (s === "results") setFocus("results");
    else if (answers[QUESTIONS[s].key]) setFocus(QUESTIONS[s].key);
    scrollToTop(s === "results");
  };

  const choose = (key: keyof GuideAnswers, id: string, index: number) => {
    const next = { ...answers, [key]: id } as GuideAnswers;
    // A climate picked by hand keeps the place: it corrects the guess, the place's weather stays.
    writeUrl(next);
    setFocus(key);
    // A short pause so the choice registers before the next question slides in.
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      const after = index + 1 < QUESTIONS.length ? index + 1 : "results";
      moveFocus.current = true;
      const to = after === "results" && !isComplete(next) ? firstOpen(next) : after;
      setStep(to);
      scrollToTop(to === "results");
    }, 220);
  };

  /** A real place: sets the climate answer it implies, then moves on once the choice has shown. */
  const pickPlace = (p: GuidePlace) => {
    const next = { ...answers, climate: climateForPlace(p.lat, p.lng, p.id) } as GuideAnswers;
    writeUrl(next, placeToParams(p));
    setFocus("climate");
    window.clearTimeout(advanceTimer.current);
    const index = QUESTIONS.findIndex((x) => x.key === "climate");
    advanceTimer.current = window.setTimeout(() => {
      const after = index + 1 < QUESTIONS.length ? index + 1 : "results";
      moveFocus.current = true;
      const to = after === "results" && !isComplete(next) ? firstOpen(next) : after;
      setStep(to);
      scrollToTop(to === "results");
    }, 1400);
  };

  const clearPlace = () => {
    window.clearTimeout(advanceTimer.current);
    writeUrl(answers, placeToParams(null));
  };

  /** The visitor is still using the picker (searching again, opening the map): don't move on. */
  const holdStep = () => window.clearTimeout(advanceTimer.current);

  const restart = () => {
    writeUrl({}, placeToParams(null));
    setFocus("empty");
    goTo(0);
  };

  const showFull = (on: boolean) => {
    writeUrl(answers, { form: on ? "full" : null });
    window.scrollTo({ top: 0 });
  };

  if (detailed) {
    return (
      <>
        <V2PageHeader crumbs={CRUMBS} title={DETAILED_TITLE} lead={DETAILED_LEAD} />
        <div ref={topRef}>
          <div className="v2-wrap pt-10">
            <button type="button" onClick={() => showFull(false)} className="v2-link text-[0.95rem]">
              Use the five-question builder instead
            </button>
          </div>
          <MissionSolutionBuilder />
        </div>
      </>
    );
  }

  const q = typeof shown === "number" ? QUESTIONS[shown] : null;
  const atResults = shown === "results";

  const onOptionKey = (e: React.KeyboardEvent<HTMLButtonElement>, i: number, count: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    const to = e.key === "Home" ? 0 : e.key === "End" ? count - 1 : delta ? (i + delta + count) % count : -1;
    if (to < 0) return;
    e.preventDefault();
    optionRefs.current[to]?.focus();
  };

  return (
    <section
      aria-labelledby="builder-title"
      // No scroll anchoring: the scene changes height on phones when the results arrive, and the
      // browser would otherwise shift the page under the scroll to the finished camp.
      className="relative [overflow-anchor:none] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr] xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
    >
      <header ref={headRef} className="v2-pad-l px-[var(--v2-gutter)] pb-8 pt-28 sm:pt-32 lg:col-start-1 lg:row-start-1 lg:pb-10 lg:pr-12 lg:pt-36">
        <Breadcrumb />
        <h1 id="builder-title" className="v2-h1 v2-h1-compact mt-6 max-w-[15ch] text-snow">
          {GUIDE_TITLE}
        </h1>
        <p className="v2-lead mt-5 max-w-[46ch]">{GUIDE_LEAD}</p>
      </header>

      {/* The 3D camp: sticks under the header on phones while answering, fills the right half on
          larger screens. */}
      <div className="contents lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:block lg:pt-[72px]">
        <div
          ref={sceneRef}
          className={`${
            atResults ? "relative h-[56svh] min-h-[320px]" : "sticky top-16 z-20 h-[38svh] min-h-[250px]"
          } border-y border-line lg:sticky lg:top-[72px] lg:z-auto lg:h-[calc(100svh-72px)] lg:min-h-[520px] lg:border-y-0 lg:border-l`}
        >
          <CampScene answers={answers} live={liveForScene} focus={sceneFocus} results={atResults} photos={photos} apiRef={sceneApi} />
        </div>
      </div>

      <div
        ref={topRef}
        className={`v2-pad-l @container px-[var(--v2-gutter)] pt-8 lg:col-start-1 lg:row-start-2 lg:pr-12 lg:pt-0 ${atResults ? "" : "v2-under-scene"}`}
      >
        <ProgressRail answers={answers} place={place} step={shown} onJump={(i) => goTo(i)} />

        <div className="pt-10 sm:pt-12">
          {q && typeof shown === "number" ? (
            <div key={q.key} className="v2-step-in">
              <h2 id={`q-${q.key}`} ref={headingRef} tabIndex={-1} className="v2-h2 max-w-[22ch] text-snow outline-none">
                {q.title}
              </h2>
              {q.key === "climate" ? (
                <>
                  <PlacePicker
                    places={places}
                    value={place}
                    live={live}
                    climateLabel={place && answers.climate ? labelFor("climate", answers.climate) : null}
                    onPick={pickPlace}
                    onClear={clearPlace}
                    onInteract={holdStep}
                  />
                  <p className="mt-8 text-[0.95rem] text-muted">Or describe the climate:</p>
                </>
              ) : null}
              <div
                role="radiogroup"
                aria-labelledby={`q-${q.key}`}
                className={`${q.key === "climate" ? "mt-4" : "mt-8"} grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2`}
              >
                {q.options.map((o, i) => {
                  const on = answers[q.key] === o.id;
                  const selected = q.options.findIndex((x) => x.id === answers[q.key]);
                  return (
                    <button
                      key={o.id}
                      ref={(el) => {
                        optionRefs.current[i] = el;
                      }}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      tabIndex={(selected === -1 ? i === 0 : on) ? 0 : -1}
                      onKeyDown={(e) => onOptionKey(e, i, q.options.length)}
                      onClick={() => choose(q.key, o.id, shown)}
                      className={`group flex min-h-[4.75rem] flex-col justify-between gap-2 border p-4 text-left transition-colors sm:min-h-[6rem] sm:gap-3 sm:p-5 ${
                        on ? "border-signal bg-signal/[0.1]" : "border-line-strong bg-hull/60 hover:border-snow/50 hover:bg-hull"
                      }`}
                    >
                      <span className="text-[1.05rem] font-semibold leading-snug text-snow sm:text-[1.1rem]">{o.label}</span>
                      <span className="flex items-end justify-between gap-3">
                        <span className="text-[0.9rem] leading-snug text-muted">{o.hint}</span>
                        <span
                          aria-hidden
                          className={`h-4 w-4 shrink-0 rounded-full border transition-colors ${on ? "border-signal bg-signal" : "border-line-strong group-hover:border-snow/60"}`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-3">
                  {shown > 0 ? (
                    <button type="button" onClick={() => goTo(shown - 1)} className="v2-btn v2-btn-ghost">
                      Back
                    </button>
                  ) : null}
                  {answers[q.key] && shown < QUESTIONS.length - 1 ? (
                    <button type="button" onClick={() => goTo(shown + 1)} className="v2-btn v2-btn-ghost">
                      Next
                    </button>
                  ) : null}
                  {isComplete(answers) ? (
                    <button type="button" onClick={() => goTo("results")} className="v2-btn">
                      See the recommendation
                    </button>
                  ) : null}
                </div>
                <p className="v2-tnum text-[0.9rem] text-muted">
                  Question {shown + 1} of {QUESTIONS.length}
                </p>
              </div>
            </div>
          ) : isComplete(answers) ? (
            <Results
              answers={answers}
              place={place}
              recs={recs}
              products={products}
              onEdit={(i) => goTo(i)}
              onRestart={restart}
              headingRef={headingRef}
              sceneApi={sceneApi}
            />
          ) : null}
        </div>

        <p className="mt-16 border-t border-line pt-8 text-[0.95rem] text-muted">
          Already have a detailed requirement?{" "}
          <button type="button" onClick={() => showFull(true)} className="v2-link">
            Use the full requirements form
          </button>
          .
        </p>
      </div>
    </section>
  );
}

/** Reads the answers (and the place) from the URL, so a finished plan can be shared as a link. */
export function MissionGuide({ products, places }: { products: Record<string, GuideProduct>; places: GuidePlace[] }) {
  const params = useSearchParams();
  const answers = answersFromParams((k) => params.get(k));
  const place = useMemo(() => placeFromParams((k) => params.get(k), places), [params, places]);
  return <GuideBody products={products} answers={answers} place={place} places={places} detailed={params.get("form") === "full"} />;
}

/** Server-rendered first question, shown only if the URL can't be read on the server. */
export function MissionGuideFallback({ products, places }: { products: Record<string, GuideProduct>; places: GuidePlace[] }) {
  return <GuideBody products={products} answers={{}} place={null} places={places} detailed={false} />;
}
