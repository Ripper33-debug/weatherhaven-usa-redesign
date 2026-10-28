"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
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
import { storeContactPrefill } from "@/lib/contact-prefill";
import { trackLead } from "@/lib/track-lead";
import { sizesForSlug } from "@/lib/system-sizes";
import { SizeCompare } from "@/components/systems/SizeCompare";

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
  representative?: boolean;
  specs: { label: string; value: string }[];
};

type Step = number | "results";

function firstOpen(a: GuideAnswers): Step {
  const i = QUESTIONS.findIndex((q) => !a[q.key]);
  return i === -1 ? "results" : i;
}

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

function ProgressRail({ answers, step, onJump }: { answers: GuideAnswers; step: Step; onJump: (i: number) => void }) {
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
                <span className="mt-0.5 hidden w-full truncate text-[0.8rem] text-muted group-enabled:group-hover:text-snow sm:block">
                  {done ? labelFor(q.key, answers[q.key]) : " "}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function firstOpenIndex(a: GuideAnswers): number {
  const i = QUESTIONS.findIndex((q) => !a[q.key]);
  return i === -1 ? QUESTIONS.length : i;
}

function Results({
  answers,
  recs,
  products,
  onEdit,
  onRestart,
}: {
  answers: Required<GuideAnswers>;
  recs: Recommendation[];
  products: Record<string, GuideProduct>;
  onEdit: (i: number) => void;
  onRestart: () => void;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [best, ...rest] = recs;
  const alternates = rest.slice(0, 2);
  const pairs = pairings(answers, recs.slice(0, 3).map((r) => r.slug));
  const bestProduct = products[best.slug];
  const sizes = sizesForSlug(best.slug);

  const sendToExpert = () => {
    storeContactPrefill(guideContactPrefill(answers, recs));
    trackLead("mission_builder", `Mission builder: ${labelFor("mission", answers.mission)}`, {
      systems: recs.slice(0, 3).map((r) => r.slug),
      people: answers.people,
      climate: answers.climate,
    });
    router.push("/contact?handoff=camp-plan");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="v2-step-in">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="v2-h2 text-snow">Your recommended setup</h2>
          <p className="mt-3 max-w-[60ch] text-[1rem] leading-relaxed text-muted">
            For {labelFor("mission", answers.mission).toLowerCase()}, {labelFor("people", answers.people)} people,{" "}
            {labelFor("climate", answers.climate).toLowerCase()}, moved by {labelFor("transport", answers.transport).toLowerCase()},
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
      <section aria-labelledby="best-heading" className="mt-10 grid gap-0 border border-line bg-hull lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[26rem]">
          <Image
            src={bestProduct?.cover ?? "/products/ehmecc.jpg"}
            alt={`Weatherhaven ${best.name}${bestProduct?.representative ? " (representative photo)" : ""}`}
            fill
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-cover"
            {...(bestProduct?.blur ? { placeholder: "blur" as const, blurDataURL: bestProduct.blur } : {})}
          />
          {bestProduct?.representative ? (
            <p className="absolute bottom-3 left-3 bg-ink/75 px-2.5 py-1 text-[0.75rem] text-muted backdrop-blur-sm">Representative photo</p>
          ) : null}
        </div>
        <div className="flex flex-col p-6 sm:p-10">
          <p className="text-[0.9rem] font-semibold text-signal">Best match</p>
          <h3 id="best-heading" className="v2-h1 mt-2 text-snow">
            {best.name}
          </h3>
          {bestProduct ? <p className="mt-2 text-[0.95rem] text-muted">{bestProduct.subtitle}</p> : null}
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
          <div className="mt-6 grid gap-6 md:grid-cols-2">
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
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
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

      <div className="mt-16 flex flex-col gap-6 border-t border-line pt-10 lg:flex-row lg:items-center lg:justify-between">
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

function GuideBody({ products, initial, detailed }: { products: Record<string, GuideProduct>; initial: GuideAnswers; detailed: boolean }) {
  const [answers, setAnswers] = useState<GuideAnswers>(initial);
  const [step, setStep] = useState<Step>(() => firstOpen(initial));
  const [full, setFull] = useState(detailed);
  const topRef = useRef<HTMLDivElement>(null);
  const advanceTimer = useRef(0);

  const recs = useMemo(() => (isComplete(answers) ? recommend(answers) : []), [answers]);

  const scrollToTop = () => {
    const el = topRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    if (window.scrollY > y + 40) window.scrollTo({ top: y, behavior: "smooth" });
  };

  const goTo = (s: Step) => {
    window.clearTimeout(advanceTimer.current);
    setStep(s);
    scrollToTop();
  };

  const choose = (key: keyof GuideAnswers, id: string, index: number) => {
    const next = { ...answers, [key]: id } as GuideAnswers;
    setAnswers(next);
    writeUrl(next);
    // A short pause so the choice registers before the next question slides in.
    window.clearTimeout(advanceTimer.current);
    advanceTimer.current = window.setTimeout(() => {
      const after = index + 1 < QUESTIONS.length ? index + 1 : "results";
      setStep(after === "results" && !isComplete(next) ? firstOpen(next) : after);
      scrollToTop();
    }, 220);
  };

  const restart = () => {
    setAnswers({});
    writeUrl({});
    goTo(0);
  };

  const showFull = (on: boolean) => {
    setFull(on);
    writeUrl(answers, { form: on ? "full" : null });
    scrollToTop();
  };

  if (full) {
    return (
      <div ref={topRef}>
        <div className="v2-wrap pt-10">
          <button type="button" onClick={() => showFull(false)} className="v2-link text-[0.95rem]">
            Back to the five-question builder
          </button>
        </div>
        <MissionSolutionBuilder />
      </div>
    );
  }

  const q = typeof step === "number" ? QUESTIONS[step] : null;

  return (
    <div ref={topRef} className="v2-wrap scroll-mt-24 pt-10 sm:pt-14">
      <ProgressRail answers={answers} step={step} onJump={(i) => goTo(i)} />

      <div className="pt-10 sm:pt-12">
        {q && typeof step === "number" ? (
          <fieldset key={q.key} className="v2-step-in">
            <legend className="v2-h2 max-w-[22ch] text-snow">{q.title}</legend>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {q.options.map((o) => {
                const on = answers[q.key] === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => choose(q.key, o.id, step)}
                    className={`group flex min-h-[6rem] flex-col justify-between gap-3 border p-5 text-left transition-colors ${
                      on ? "border-signal bg-signal/[0.1]" : "border-line-strong bg-hull/60 hover:border-snow/50 hover:bg-hull"
                    }`}
                  >
                    <span className="text-[1.1rem] font-semibold leading-snug text-snow">{o.label}</span>
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
              <div className="flex gap-3">
                {step > 0 ? (
                  <button type="button" onClick={() => goTo(step - 1)} className="v2-btn v2-btn-ghost">
                    Back
                  </button>
                ) : null}
                {answers[q.key] && step < QUESTIONS.length - 1 ? (
                  <button type="button" onClick={() => goTo(step + 1)} className="v2-btn v2-btn-ghost">
                    Next
                  </button>
                ) : null}
                {isComplete(answers) && step === QUESTIONS.length - 1 ? (
                  <button type="button" onClick={() => goTo("results")} className="v2-btn">
                    See the recommendation
                  </button>
                ) : null}
              </div>
              <p className="v2-tnum text-[0.9rem] text-muted">
                Question {step + 1} of {QUESTIONS.length}
              </p>
            </div>
          </fieldset>
        ) : isComplete(answers) ? (
          <Results answers={answers} recs={recs} products={products} onEdit={(i) => goTo(i)} onRestart={restart} />
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
  );
}

/** Reads saved answers from the URL, so a finished plan can be shared as a link. */
export function MissionGuide({ products }: { products: Record<string, GuideProduct> }) {
  const params = useSearchParams();
  const initial = answersFromParams((k) => params.get(k));
  return <GuideBody products={products} initial={initial} detailed={params.get("form") === "full"} />;
}

/** Server-rendered first question, shown until the URL has been read. */
export function MissionGuideFallback({ products }: { products: Record<string, GuideProduct> }) {
  return <GuideBody products={products} initial={{}} detailed={false} />;
}
