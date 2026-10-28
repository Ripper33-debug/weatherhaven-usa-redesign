/**
 * Company facts presented as the riveted ID plate found on every shipping container.
 * All figures are Weatherhaven's own published numbers (Oct 2026): weatherhaven.com home page (95+ countries),
 * /Innovation (3,000+ containers, 51 patents in 30 countries) and /Commercial/antarctic-climate-research.
 */
const FACTS = [
  { value: "1981", label: "Founded in British Columbia, Canada" },
  { value: "95+", label: "Countries with Weatherhaven shelters, on all seven continents" },
  { value: "3,000+", label: "Expandable containers sold to more than 25 military customers" },
  { value: "51", label: "Patents granted across 30 countries" },
  { value: "20+ of 32", label: "Countries doing climate research in Antarctica that use Weatherhaven products" },
] as const;

function Rivets() {
  return (
    <>
      <span aria-hidden className="v2-rivet left-3 top-3" />
      <span aria-hidden className="v2-rivet right-3 top-3" />
      <span aria-hidden className="v2-rivet bottom-3 left-3" />
      <span aria-hidden className="v2-rivet bottom-3 right-3" />
    </>
  );
}

export function HomeDataPlate() {
  return (
    <section aria-labelledby="plate-heading" className="relative z-10 -mt-px bg-ink pb-20 pt-4 sm:pb-28">
      <div className="v2-wrap">
        <div className="v2-plate v2-chamfer px-6 py-8 sm:px-10 sm:py-10">
          <Rivets />
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-5">
            <h2 id="plate-heading" className="text-[0.95rem] font-semibold text-snow [font-variation-settings:'wdth'_112]">
              Weatherhaven by the numbers
            </h2>
            <p className="text-[0.8rem] text-muted">ISO 9001:2015 certified. CAGE 0EYW4.</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 pt-7 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-0">
            {FACTS.map((fact, i) => (
              <div
                key={fact.value}
                className={`flex flex-col-reverse ${i === FACTS.length - 1 ? "col-span-2 sm:col-span-1" : ""} lg:border-l lg:border-line lg:px-6 lg:first:border-l-0 lg:first:pl-0`}
              >
                <dt className="mt-3 max-w-[24ch] text-[0.875rem] leading-snug text-muted">{fact.label}</dt>
                <dd className="v2-figure text-[2.4rem] leading-none text-snow sm:text-[2.9rem]">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
