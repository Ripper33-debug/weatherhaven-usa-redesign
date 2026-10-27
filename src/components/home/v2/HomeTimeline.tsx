const MILESTONES = [
  { year: "1981", title: "Founded in British Columbia", body: "Started by the founders of an expedition company and a Vancouver construction firm." },
  { year: "1984", title: "First Canadian military contract", body: "MEX-26 maintenance shelters for the Canadian Forces." },
  { year: "1988", title: "First Antarctic camp", body: "Polarhaven shelters begin decades of national research programs on the ice." },
  { year: "1990", title: "First United Nations contract", body: "The start of long-running peacekeeping and relief work." },
  { year: "1994", title: "First MECCs delivered", body: "To US Army Natick Labs and the Canadian Coast Guard." },
  { year: "2003", title: "Camp Julien, Afghanistan", body: "A complete camp for 2,200 people." },
  { year: "2017", title: "Canada's HQSS program", body: "CAD $167M acquisition and in-service support contract for headquarters shelters." },
  { year: "2025", title: "Additive manufacturing in a MECC", body: "A deployable 3D-printing facility in two linked MECCs, delivered to a US client." },
  { year: "2026", title: "Supacat partnership", body: "TRECC-T paired with Supacat high-mobility vehicles; field trials planned for 2027." },
] as const;

export function HomeTimeline() {
  return (
    <section aria-labelledby="timeline-heading" className="border-t border-line bg-ink py-20 sm:py-28">
      <div className="v2-wrap">
        <h2 id="timeline-heading" className="v2-h1 max-w-[18ch] text-snow">
          Forty-five years in the field.
        </h2>
      </div>
      <div
        role="region"
        aria-label="Company milestones"
        tabIndex={0}
        className="v2-rail mt-12 flex gap-0 overflow-x-auto pb-6"
      >
        {MILESTONES.map((m, i) => (
          <article key={m.year} className="relative w-[78vw] max-w-[300px] shrink-0 pr-8 sm:w-[300px]">
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 shrink-0 ${i === MILESTONES.length - 1 ? "bg-signal" : "bg-snow"}`} aria-hidden />
              <span className="h-px flex-1 bg-line-strong" aria-hidden />
            </div>
            <p className="v2-figure mt-5 text-[2.6rem] leading-none text-snow">{m.year}</p>
            <h3 className="mt-3 text-[1.05rem] font-semibold text-snow">{m.title}</h3>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-muted">{m.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
