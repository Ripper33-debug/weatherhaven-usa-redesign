import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  answersFromParams,
  ANSWER_PARAMS,
  isComplete,
  labelFor,
  QUESTIONS,
  recommend,
  type GuideAnswers,
} from "@/lib/mission-guide";
import { placeFromParams, placePhrase, type GuidePlace } from "@/lib/live-site";
import { CONFIRMED_DEPLOYMENTS } from "@/lib/confirmed-deployments";
import { isPrecisePin, placeName } from "@/lib/deployment-pins";
import { formatCoords } from "@/lib/field-readout";
import {
  campLogistics,
  formatNumber,
  ft2ToM2,
  lbKg,
  listNames,
  onRequestText,
  shippingSummary,
} from "@/lib/plan-logistics";
import { PROCUREMENT } from "@/lib/procurement";
import { COMPANY_CONTACT } from "@/lib/company-facts";
import {
  PageUrl,
  PrintButton,
  TodayDate,
} from "@/components/systems/SpecSheetActions";
import { AutoPrint } from "@/components/mission/PlanSheetActions";

export const metadata: Metadata = {
  title: "Camp plan",
  description:
    "One-page planning estimate from the mission builder: systems, shipping, setup and footprint.",
  robots: { index: false, follow: false },
};

/** Rendered per request from the plan's answers in the address. */
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Print: only the sheet, on white, at letter size. The site's header and footer drop out. */
const PRINT_CSS = `
@media print {
  @page { size: letter; margin: 0.45in; }
  html, body { background: #fff !important; }
  [data-global-nav], [data-global-footer], [data-print-hide] { display: none !important; }
  body * { visibility: hidden; }
  #plan-sheet, #plan-sheet * { visibility: visible; }
  #plan-sheet { position: absolute; left: 0; top: 0; box-shadow: none !important; padding: 0 !important; max-width: none !important; width: 100%; }
  /* A little smaller on paper so the sources and plan link stay on the one page. */
  #plan-sheet { zoom: 0.9; }
  #plan-sheet a { color: inherit; text-decoration: none; }
}
`;

function places(): GuidePlace[] {
  return CONFIRMED_DEPLOYMENTS.filter(isPrecisePin).map((d) => ({
    id: d.id,
    name: placeName(d),
    lat: d.lat,
    lng: d.lng,
  }));
}

function builderPath(a: GuideAnswers, place: GuidePlace | null): string {
  const q = new URLSearchParams();
  for (const k of QUESTIONS) {
    const v = a[k.key];
    if (v) q.set(ANSWER_PARAMS[k.key], v);
  }
  if (place?.id) q.set("site", place.id);
  else if (place)
    q.set("at", `${place.lat.toFixed(2)},${place.lng.toFixed(2)}`);
  return `/mission-solution-builder?${q.toString()}`;
}

const cell = "py-1 pr-3 align-top";
const head = "py-1 pr-3 text-left font-medium text-[#4a5361]";

/**
 * The mission builder's plan on one page: answers, the recommended camp, the shipping estimate,
 * setup and footprint, and the US company's identifiers. Black on white for printing or saving as
 * PDF, like the product spec sheets.
 */
export default async function CampPlanSheetPage({ searchParams }: Props) {
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : null;
  };
  const answers = answersFromParams(get);
  const place = placeFromParams(get, places());

  if (!isComplete(answers)) {
    return (
      <div className="bg-ink pb-24 pt-32 text-snow">
        <div className="v2-wrap max-w-[760px]">
          <h1 className="v2-h1">This plan is missing answers</h1>
          <p className="v2-lead mt-5">
            Answer all five questions in the mission builder, then download the
            plan again.
          </p>
          <Link href={builderPath(answers, place)} className="v2-btn mt-8">
            Open the mission builder
          </Link>
        </div>
      </div>
    );
  }

  const recs = recommend(answers);
  const best = recs[0];
  const l = campLogistics(answers);
  const ship = shippingSummary(l, answers.transport);
  const climate = labelFor("climate", answers.climate);
  const site = place
    ? `${placePhrase(place).replace(/^(in|at|near) /, "")} (${formatCoords(place.lat, place.lng)}); ${climate.toLowerCase()}`
    : climate;
  const back = builderPath(answers, place);
  const address = COMPANY_CONTACT.headquartersAddress.replace(
    ", United States",
    "",
  );
  const countedAs = l.lines
    .filter((x) => x.basis.countedAs)
    .map((x) => `${x.name} as the ${x.basis.countedAs}`);

  return (
    <div className="bg-ink pb-24 pt-28 sm:pt-32 print:bg-white print:p-0">
      <style>{PRINT_CSS}</style>
      <AutoPrint />
      <div className="v2-wrap">
        <div
          data-print-hide
          className="mx-auto mb-6 flex max-w-[8.5in] flex-wrap items-center justify-between gap-4"
        >
          <Link href={back} className="v2-link text-[0.95rem]">
            Back to the plan
          </Link>
          <PrintButton />
        </div>

        <article
          id="plan-sheet"
          className="mx-auto max-w-[8.5in] bg-white px-6 py-8 text-[0.8125rem] leading-snug text-[#14181f] shadow-[0_24px_60px_rgb(0_0_0/0.45)] sm:px-11 sm:py-10"
        >
          <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-[#14181f] pb-3">
            <Image
              src="/weatherhaven-logo@2x.png"
              alt="Weatherhaven"
              width={180}
              height={17}
              style={{ width: 180, height: "auto" }}
            />
            <p className="text-right text-[#4a5361]">
              Camp plan, planning estimate
              <br />
              <TodayDate />
            </p>
          </header>

          <h1 className="mt-4 text-[1.45rem] font-semibold leading-tight [font-variation-settings:'wdth'_110]">
            {labelFor("mission", answers.mission)},{" "}
            {labelFor("people", answers.people).replace(/^[A-Z]/, (c) => c.toLowerCase())} people
          </h1>
          <p className="mt-1 text-[0.95rem] text-[#4a5361]">
            Built around the {best.name}, from Weatherhaven&apos;s published
            specifications.
          </p>

          <div className="mt-4 grid gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <section aria-labelledby="plan-answers">
              <h2 id="plan-answers" className="text-[0.9rem] font-semibold">
                Requirement
              </h2>
              <table className="mt-2 w-full border-collapse">
                <tbody>
                  {QUESTIONS.map((q) => (
                    <tr key={q.key} className="border-t border-[#d5dae1]">
                      <th scope="row" className={`${head} w-[32%]`}>
                        {q.key === "climate" ? "Site" : q.label}
                      </th>
                      <td className={cell}>
                        {q.key === "climate"
                          ? site
                          : labelFor(q.key, answers[q.key])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section aria-labelledby="plan-match">
              <h2 id="plan-match" className="text-[0.9rem] font-semibold">
                Best match: {best.name}
              </h2>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {best.reasons.slice(0, 3).map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              {recs.length > 1 ? (
                <p className="mt-2 text-[#4a5361]">
                  Also fits: {listNames(recs.slice(1, 3).map((r) => r.name))}.
                </p>
              ) : null}
            </section>
          </div>

          <section aria-labelledby="plan-camp" className="mt-4">
            <h2 id="plan-camp" className="text-[0.9rem] font-semibold">
              The camp
            </h2>
            <table className="mt-2 w-full border-collapse">
              <thead>
                <tr>
                  <th className={head}>System</th>
                  <th className={`${head} text-right`}>Qty</th>
                  <th className={head}>Packed as</th>
                  <th className={head}>Setup, each</th>
                  <th className={`${head} text-right`}>Floor, each</th>
                </tr>
              </thead>
              <tbody>
                {l.lines.map((x) => (
                  <tr key={x.key} className="border-t border-[#d5dae1]">
                    <td className={`${cell} font-medium`}>{x.name}</td>
                    <td className={`${cell} text-right tabular-nums`}>
                      {x.count}
                    </td>
                    <td className={cell}>{x.basis.ship.packedAs}</td>
                    <td className={cell}>
                      {x.basis.setup?.text ?? "Not published"}
                    </td>
                    <td
                      className={`${cell} whitespace-nowrap text-right tabular-nums`}
                    >
                      {x.basis.areaFt2
                        ? `${formatNumber(Math.round(x.basis.areaFt2))} ft²`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section aria-labelledby="plan-ship" className="mt-4">
            <h2 id="plan-ship" className="text-[0.9rem] font-semibold">
              How it ships
            </h2>
            {ship.anyCounted ? (
              <table className="mt-2 w-full border-collapse">
                <tbody>
                  {ship.rows.map((r) => (
                    <tr key={r.id} className="border-t border-[#d5dae1]">
                      <th
                        scope="row"
                        className={`${head} w-[18%] ${r.chosen ? "text-[#14181f]" : ""}`}
                      >
                        {r.mode}
                        {r.chosen ? " (chosen)" : ""}
                      </th>
                      <td
                        className={`${cell} w-[22%] whitespace-nowrap font-semibold tabular-nums`}
                      >
                        {r.figure ?? "On request"}
                      </td>
                      <td className={`${cell} text-[#4a5361]`}>{r.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            {ship.onRequest.length > 0 ? (
              <p className="mt-2">
                {ship.anyCounted
                  ? "Load plan on request"
                  : "Aircraft loads, containers and trucks come with Weatherhaven's load plan; packed sizes aren't published"}
                : {onRequestText(ship.onRequest)}.
              </p>
            ) : null}
            {l.moves.length > 0 &&
            (answers.transport === "helo" || answers.transport === "remote") ? (
              <p className="mt-2">
                Helicopter and over-snow notes:{" "}
                {l.moves
                  .map(
                    (m) =>
                      `${m.name}, ${m.text.charAt(0).toLowerCase()}${m.text.slice(1)}`,
                  )
                  .join("; ")}
                .
              </p>
            ) : null}
          </section>

          <section aria-labelledby="plan-totals" className="mt-4">
            <h2 id="plan-totals" className="sr-only">
              Totals
            </h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 border-t-2 border-[#14181f] pt-3 sm:grid-cols-4">
              <div>
                <dt className="text-[#4a5361]">Shipping weight</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">
                  {l.weight.lb > 0 ? lbKg(l.weight.lb) : "On request"}
                </dd>
                {l.weight.missing.length ? (
                  <dd className="text-[0.75rem] text-[#4a5361]">
                    Not published: {listNames(l.weight.missing)}
                  </dd>
                ) : null}
              </div>
              <div>
                <dt className="text-[#4a5361]">Setup crew-time</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">
                  {l.setup.crewHours > 0
                    ? `About ${formatNumber(l.setup.crewHours)} h`
                    : "On request"}
                </dd>
                {l.setup.missing.length ? (
                  <dd className="text-[0.75rem] text-[#4a5361]">
                    Not published: {listNames(l.setup.missing)}
                  </dd>
                ) : null}
              </div>
              <div>
                <dt className="text-[#4a5361]">Floor space</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">
                  {l.footprint.floorFt2 > 0
                    ? `${formatNumber(l.footprint.floorFt2)} ft² (${formatNumber(ft2ToM2(l.footprint.floorFt2))} m²)`
                    : "On request"}
                </dd>
                {l.footprint.missing.length ? (
                  <dd className="text-[0.75rem] text-[#4a5361]">
                    Not published: {listNames(l.footprint.missing)}
                  </dd>
                ) : null}
              </div>
              <div>
                <dt className="text-[#4a5361]">Ground as drawn</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">
                  About {l.footprint.site.l} × {l.footprint.site.w} m
                </dd>
                <dd className="text-[0.75rem] text-[#4a5361]">
                  Guy lines and spacing included
                </dd>
              </div>
            </dl>
            {l.power.length > 0 ? (
              <p className="mt-3">
                Power:{" "}
                {l.power
                  .map(
                    (p) =>
                      `${p.name}, ${p.text.charAt(0).toLowerCase()}${p.text.slice(1)}`,
                  )
                  .join("; ")}
                . Climate control and generators are sized in the load plan.
              </p>
            ) : null}
          </section>

          <section
            aria-labelledby="plan-supplier"
            className="mt-4 grid gap-4 border-t-2 border-[#14181f] pt-3 sm:grid-cols-2"
          >
            <div>
              <h2 id="plan-supplier" className="text-[0.9rem] font-semibold">
                Supplier
              </h2>
              <p className="mt-1">
                {PROCUREMENT.legalName}, {address}
                <br />
                {COMPANY_CONTACT.phone}
              </p>
            </div>
            <dl className="grid grid-cols-[3.5rem_1fr] gap-y-0.5 self-end">
              <dt className="text-[#4a5361]">CAGE</dt>
              <dd className="v2-code">{PROCUREMENT.cage}</dd>
              <dt className="text-[#4a5361]">UEI</dt>
              <dd className="v2-code">{PROCUREMENT.uei}</dd>
            </dl>
          </section>

          <footer className="mt-3 border-t border-[#d5dae1] pt-3 text-[0.72rem] leading-relaxed text-[#4a5361]">
            <p>
              Planning estimate, not a quote or a load plan. Quantities are the
              mission builder&apos;s illustrative camp; figures are
              Weatherhaven&apos;s published packed sizes, weights and setup
              times, rounded up, with systems that don&apos;t publish them left
              out rather than guessed
              {countedAs.length ? ` (${countedAs.join("; ")})` : ""}. Aircraft:
              C-17, 18 pallet positions and 170,900 lb (US Air Force);
              C-130J-30, 8 pallets and 44,000 lb (Air Mobility Command, Lockheed
              Martin); 463L pallet per US Army FM 55-9. Weatherhaven produces
              the real load plan and configuration for the program.
            </p>
            <p className="mt-1">
              Plan link: <PageUrl path={back} />
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
}
