"use client";

import { useMemo } from "react";
import {
  ANSWER_PARAMS,
  QUESTIONS,
  type GuideAnswers,
} from "@/lib/mission-guide";
import { placeToParams, type GuidePlace } from "@/lib/live-site";
import {
  campLogistics,
  formatNumber,
  ft2ToM2,
  lbKg,
  listNames,
  namesWithCounts,
  onRequestText,
  shippingSummary,
} from "@/lib/plan-logistics";

/** The printable one-page plan for these answers. */
export function planSheetHref(
  answers: GuideAnswers,
  place: GuidePlace | null,
  print = true,
): string {
  const q = new URLSearchParams();
  for (const k of QUESTIONS) {
    const v = answers[k.key];
    if (v) q.set(ANSWER_PARAMS[k.key], v);
  }
  for (const [k, v] of Object.entries(placeToParams(place))) if (v) q.set(k, v);
  if (print) q.set("print", "1");
  return `/mission-solution-builder/plan?${q.toString()}`;
}

/**
 * Under the results: how the camp shown ships (C-17, C-130J-30, containers, trucks), what it takes
 * to set up and how much ground it covers, from published figures only (src/lib/plan-logistics.ts),
 * plus the one-page plan to print or save as PDF.
 */
export function CampLogistics({
  answers,
  place,
}: {
  answers: Required<GuideAnswers>;
  place: GuidePlace | null;
}) {
  const l = useMemo(() => campLogistics(answers), [answers]);
  const ship = useMemo(
    () => shippingSummary(l, answers.transport),
    [l, answers.transport],
  );
  const countedAs = l.lines
    .filter((x) => x.basis.countedAs)
    .map((x) => `${x.name} as the ${x.basis.countedAs}`);
  const showMoves =
    (answers.transport === "helo" || answers.transport === "remote") &&
    l.moves.length > 0;

  return (
    <section
      aria-labelledby="move-heading"
      className="mt-16 border-t border-line pt-12"
    >
      <div className="flex flex-col gap-6 @2xl:flex-row @2xl:items-end @2xl:justify-between">
        <div>
          <h3 id="move-heading" className="v2-h3 text-snow">
            Moving and setting up this camp
          </h3>
          <p className="mt-3 max-w-[62ch] text-[0.95rem] leading-relaxed text-muted">
            A planning estimate for the camp shown ({namesWithCounts(l.lines)}),
            worked out from Weatherhaven&apos;s published packed sizes, weights
            and setup figures. Weatherhaven produces the real load plan.
          </p>
        </div>
        <a
          href={planSheetHref(answers, place)}
          target="_blank"
          rel="noopener"
          className="v2-btn shrink-0"
        >
          Download the plan (PDF)
        </a>
      </div>

      {/* How it ships: the visitor's own transport first. */}
      <h4 className="mt-10 text-[1.05rem] font-semibold text-snow">
        How it ships
      </h4>
      {ship.anyCounted ? (
        <ul className="mt-4 border-t border-line">
          {ship.rows.map((r) => (
            <li
              key={r.id}
              className={`grid gap-1 border-b border-line py-4 @xl:grid-cols-[9rem_11rem_1fr] @xl:gap-5 ${r.chosen ? "border-l-2 border-l-signal pl-4" : ""}`}
            >
              <p className="text-[0.95rem] font-medium text-snow">
                {r.mode}
                {r.chosen ? (
                  <span className="mt-0.5 block text-[0.8125rem] font-normal text-signal">
                    Your transport
                  </span>
                ) : null}
              </p>
              <p
                className={`v2-tnum text-[1.15rem] font-semibold ${r.figure ? "text-snow" : "text-muted"}`}
              >
                {r.figure ?? "On request"}
              </p>
              <p className="text-[0.9rem] leading-relaxed text-muted">
                {r.detail}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 max-w-[68ch] text-[0.95rem] leading-relaxed text-muted">
          Weatherhaven doesn&apos;t publish packed sizes for{" "}
          {listNames(ship.onRequest.map((x) => x.name))}, so aircraft loads,
          containers and trucks come with its load plan rather than being
          guessed here.
        </p>
      )}
      {ship.anyCounted && ship.onRequest.length > 0 ? (
        <p className="mt-4 max-w-[68ch] text-[0.9rem] leading-relaxed text-muted">
          <span className="text-snow">Load plan on request:</span>{" "}
          {onRequestText(ship.onRequest)}. Weatherhaven doesn&apos;t publish
          these figures, so they aren&apos;t guessed here.
        </p>
      ) : null}
      {showMoves ? (
        <p className="mt-4 max-w-[68ch] text-[0.9rem] leading-relaxed text-muted">
          <span className="text-snow">
            Helicopter and over-snow moves are planned for each mission.
          </span>{" "}
          Published notes:{" "}
          {l.moves
            .map(
              (m) =>
                `${m.name}: ${m.text.charAt(0).toLowerCase()}${m.text.slice(1)}`,
            )
            .join("; ")}
          .
        </p>
      ) : null}

      <dl className="mt-10 grid gap-x-10 gap-y-8 @xl:grid-cols-2">
        <div>
          <dt className="text-[0.95rem] text-muted">Shipping weight</dt>
          <dd className="mt-1">
            <p className="v2-tnum text-[1.15rem] font-semibold text-snow">
              {l.weight.lb > 0 ? lbKg(l.weight.lb) : "On request"}
            </p>
            <p className="mt-1 text-[0.9rem] leading-relaxed text-muted">
              {l.weight.missing.length
                ? `Published for ${l.lines.length - l.weight.missing.length} of ${l.lines.length} systems; not published for ${listNames(l.weight.missing)}.`
                : "Published weights for every system in the camp."}
            </p>
          </dd>
        </div>
        <div>
          <dt className="text-[0.95rem] text-muted">Setting up</dt>
          <dd className="mt-1">
            <p className="v2-tnum text-[1.15rem] font-semibold text-snow">
              {l.setup.crewHours > 0
                ? `About ${formatNumber(l.setup.crewHours)} crew-hours`
                : "Crew-time on request"}
            </p>
            <ul className="mt-1 space-y-0.5 text-[0.9rem] leading-relaxed text-muted">
              {l.setup.lines.map((s) => (
                <li key={s.name}>
                  {s.count} {s.name}: {s.text}
                  {s.count > 1 && s.crewMinutes ? " each" : ""}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="text-[0.95rem] text-muted">Floor space</dt>
          <dd className="mt-1">
            <p className="v2-tnum text-[1.15rem] font-semibold text-snow">
              {l.footprint.floorFt2 > 0
                ? `${formatNumber(l.footprint.floorFt2)} ft² (${formatNumber(ft2ToM2(l.footprint.floorFt2))} m²)`
                : "On request"}
            </p>
            <p className="mt-1 text-[0.9rem] leading-relaxed text-muted">
              Published deployed floor area
              {l.footprint.missing.length
                ? `; not published for ${listNames(l.footprint.missing)}`
                : ""}
              .
            </p>
          </dd>
        </div>
        <div>
          <dt className="text-[0.95rem] text-muted">Ground the camp covers</dt>
          <dd className="mt-1">
            <p className="v2-tnum text-[1.15rem] font-semibold text-snow">
              About {l.footprint.site.l} × {l.footprint.site.w} m
            </p>
            <p className="mt-1 text-[0.9rem] leading-relaxed text-muted">
              {formatNumber(l.footprint.site.m2)} m² (
              {formatNumber(l.footprint.site.ft2)} ft²) as drawn, guy lines and
              spacing included. A site survey sets the real layout.
            </p>
          </dd>
        </div>
      </dl>

      {l.power.length > 0 ? (
        <p className="mt-8 max-w-[68ch] text-[0.9rem] leading-relaxed text-muted">
          <span className="text-snow">Power:</span>{" "}
          {l.power
            .map(
              (p) =>
                `${p.name}, ${p.text.charAt(0).toLowerCase()}${p.text.slice(1)}`,
            )
            .join("; ")}
          . Climate control and generators are sized in the load plan.
        </p>
      ) : null}

      <details className="group mt-8 border-t border-line pt-5">
        <summary className="cursor-pointer list-none text-[0.95rem] font-medium text-snow marker:hidden hover:text-signal [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden
            className="mr-2 inline-block transition-transform group-open:rotate-90"
          >
            ›
          </span>
          How we estimate
        </summary>
        <ul className="mt-4 max-w-[70ch] list-disc space-y-2 pl-5 text-[0.875rem] leading-relaxed text-muted">
          <li>
            Quantities are the camp drawn above, which is illustrative.{" "}
            {countedAs.length ? `${countedAs.join("; ")}.` : ""}
          </li>
          <li>
            C-17: 18 pallet positions and 170,900 lb of cargo (
            <a
              href="https://www.af.mil/About-Us/Fact-Sheets/Display/Article/1529726/"
              className="v2-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              US Air Force fact sheet
            </a>
            ). C-130J-30: 8 pallets (
            <a
              href="https://www.amc.af.mil/About-Us/Fact-Sheets/Display/Article/2848932/c-130-hercules/"
              className="v2-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Air Mobility Command
            </a>
            ) and 44,000 lb, the lower of the published payload figures (
            <a
              href="https://www.lockheedmartin.com/en-us/products/c130/c-130j-30-super-hercules.html"
              className="v2-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lockheed Martin
            </a>
            ).
          </li>
          <li>
            463L pallet: 88 × 108 in, 84 × 104 in usable, 10,000 lb and 96 in
            high at most (US Army FM 55-9). Each pallet position is 88 in deep,
            so a 20-ft container takes three. Only the EHMECC publishes C-130
            carriage among the containers.
          </li>
          <li>
            Sea and road: two pallets to a 20-ft container (ISO 1894 inside
            length 231 in), one if the load is over 86 in tall; one 20-ft load
            per truck.
          </li>
          <li>
            Packs are laid flat and never stacked; bags with only a published
            volume fill half the space. Everything rounds up.
          </li>
        </ul>
      </details>
    </section>
  );
}
