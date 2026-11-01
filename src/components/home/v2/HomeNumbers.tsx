import { COMPANY_STATS } from "@/lib/company-facts";

/**
 * Four figures straight after the film, on a light band: the company's published facts
 * (src/lib/company-facts.ts, from weatherhaven.com). Founded in 1981 is shown as the year rather
 * than "40+ years". No count-up: the figures are simply there.
 */
const byLabel = (label: string) => COMPANY_STATS.find((s) => s.label === label)?.value;

const FIGURES = [
  { value: "1981", label: "Founded in British Columbia" },
  { value: byLabel("Countries"), label: "Countries with Weatherhaven shelters" },
  { value: byLabel("Militaries served"), label: "Militaries served" },
  { value: byLabel("Continents"), label: "Continents, Antarctica included" },
].filter((f): f is { value: string; label: string } => !!f.value);

export function HomeNumbers() {
  return (
    <section aria-label="Weatherhaven in figures" className="v2-light border-b border-line">
      <dl className="v2-wrap v2-reveal-stagger grid grid-cols-2 gap-x-6 gap-y-10 py-14 sm:py-20 lg:grid-cols-4 lg:gap-x-10">
        {FIGURES.map((f) => (
          <div key={f.label} className="flex flex-col-reverse justify-end gap-3 border-t border-line-strong pt-5">
            <dt className="max-w-[18ch] text-[0.95rem] leading-snug text-muted sm:text-[1rem]">{f.label}</dt>
            <dd className="v2-figure m-0 text-[clamp(3rem,7.4vw,6.5rem)] leading-[0.86] text-snow">{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
