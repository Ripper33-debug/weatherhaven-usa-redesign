import type { Metadata } from "next";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { pageMeta } from "@/lib/page-meta";
import { refText, systemHref, systemName, type FactRef } from "@/lib/published-facts";
import { NAV_CTA } from "@/lib/site-nav";
import {
  CAPABILITIES_STATEMENT,
  CERTIFICATION_ROWS,
  CLIMATE_SCALE,
  SETUP_ROWS,
  TRECC_RECORD,
  WIND_SNOW,
  climateRows,
  fieldRecord,
  fmtTemp,
} from "@/lib/tested";

export const metadata: Metadata = pageMeta({
  title: "Tested and proven",
  description:
    "Published temperature, wind and snow ratings, setup times, TRECC test results, certifications and the field record of Weatherhaven shelters, with sources.",
  path: "/tested-and-proven",
});

const ICE = "#8fc1ec";
const pct = (c: number) => ((c - CLIMATE_SCALE.minC) / (CLIMATE_SCALE.maxC - CLIMATE_SCALE.minC)) * 100;

function SystemLink({ slug }: { slug: string }) {
  return (
    <Link href={systemHref(slug)} className="font-semibold text-snow no-underline hover:text-signal">
      {systemName(slug)}
    </Link>
  );
}

function Fact({ r }: { r?: FactRef }) {
  return r ? <>{refText(r)}</> : <span className="text-muted">Not published</span>;
}

/**
 * One rating as a bar on the shared scale. The fill runs ice blue to signal orange across the whole
 * scale, so a bar's colour shows where it sits; only its own span is visible.
 */
function RangeBar({ minC, maxC }: { minC: number; maxC: number | null }) {
  const left = pct(minC);
  if (maxC === null) {
    return (
      <span aria-hidden className="absolute top-1/2 h-4 w-[3px] -translate-y-1/2" style={{ left: `${left}%`, background: ICE }} />
    );
  }
  const width = pct(maxC) - left;
  const pos = width >= 100 ? 0 : (left / (100 - width)) * 100;
  return (
    <span
      aria-hidden
      className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-[1px]"
      style={{
        left: `${left}%`,
        width: `${width}%`,
        backgroundImage: `linear-gradient(90deg, ${ICE}, var(--v2-signal))`,
        backgroundSize: `${(100 / width) * 100}% 100%`,
        backgroundPosition: `${pos}% 0`,
      }}
    />
  );
}

function SectionHead({ id, title, children }: { id: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end">
      <h2 id={id} className="v2-h2 text-snow">
        {title}
      </h2>
      {children ? <div className="v2-body lg:justify-self-end">{children}</div> : null}
    </div>
  );
}

export default function TestedPage() {
  const climate = climateRows();
  const field = fieldRecord();

  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Tested and proven" }]}
        title="Tested and proven"
        lead="Temperature, wind and snow ratings, setup times, the TRECC test record and certifications, as Weatherhaven publishes them, with the places these shelters have worked and the sources that say so."
      />

      {/* Climate ratings */}
      <section aria-labelledby="climate-heading" className="bg-ink py-16 sm:py-20">
        <div className="v2-wrap">
          <SectionHead id="climate-heading" title="Temperature ratings">
            <p>Published operating ranges on one scale. Systems not listed don&rsquo;t publish a rating.</p>
          </SectionHead>

          <table className="mt-10 w-full border-collapse text-left">
            <caption className="sr-only">Published temperature ratings, coldest first</caption>
            <thead>
              <tr className="border-b border-line-strong text-[0.8125rem] text-muted">
                <th scope="col" className="w-[7rem] pb-3 pr-4 font-normal sm:w-[10rem]">
                  System
                </th>
                <th scope="col" className="hidden pb-3 pr-6 font-normal md:table-cell">
                  <span className="sr-only">Range on a scale from −60 °C to +60 °C</span>
                </th>
                <th scope="col" className="pb-3 font-normal md:w-[17rem]">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              {climate.map((c) => (
                <tr key={c.slug} className="border-b border-line align-middle">
                  <th scope="row" className="py-4 pr-4 text-[0.95rem] font-normal">
                    <SystemLink slug={c.slug} />
                  </th>
                  <td className="hidden py-4 pr-6 md:table-cell">
                    <span className="relative block h-6">
                      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
                      <span aria-hidden className="absolute top-0 h-6 w-px bg-line-strong" style={{ left: `${pct(0)}%` }} />
                      <RangeBar minC={c.minC} maxC={c.maxC} />
                    </span>
                  </td>
                  <td className="py-4 text-[0.95rem] leading-snug">
                    {c.kind === "comfortable-at" ? (
                      <span className="text-snow">Comfortable inside at {c.published} outside</span>
                    ) : (
                      <span className="text-snow">{c.published}</span>
                    )}
                    <span className="block text-[0.8125rem] text-muted">{c.converted}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="hidden md:table-footer-group">
              <tr>
                <td />
                <td className="pr-6 pt-3">
                  <span aria-hidden className="relative block h-9 text-[0.75rem] text-muted">
                    {CLIMATE_SCALE.ticksC.map((t) => (
                      <span key={t} className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-center leading-tight" style={{ left: `${pct(t)}%` }}>
                        <span className="block text-snow/80">{fmtTemp(t, "C")}</span>
                        <span className="block">{fmtTemp((t * 9) / 5 + 32, "F")}</span>
                      </span>
                    ))}
                  </span>
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
          <p className="mt-6 text-[0.8125rem] text-muted">
            Converted figures are rounded to the nearest degree. Polar Chief publishes the outside temperature at which
            it stays comfortable inside, not a range.
          </p>
        </div>
      </section>

      {/* Wind and snow, and setup */}
      <section aria-labelledby="wind-heading setup-heading" className="border-t border-line bg-ink py-16 sm:py-20">
        <div className="v2-wrap grid gap-16 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div>
            <h2 id="wind-heading" className="v2-h2 text-snow">
              Wind and snow
            </h2>
            <dl className="mt-8 border-t border-line">
              {WIND_SNOW.map((w) => (
                <div key={w.slug} className="border-b border-line py-4">
                  <dt className="text-[0.95rem]">
                    <SystemLink slug={w.slug} />
                  </dt>
                  <dd className="mt-2 grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1 text-[0.95rem] leading-snug text-snow">
                    <span className="text-[0.8125rem] text-muted">Wind</span>
                    <span>
                      <Fact r={w.wind} />
                    </span>
                    <span className="text-[0.8125rem] text-muted">Snow</span>
                    <span>
                      <Fact r={w.snow} />
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 id="setup-heading" className="v2-h2 text-snow">
              Setup times
            </h2>
            <p className="v2-body mt-3">Crew and time as each system publishes them, fastest first.</p>
            <table className="mt-8 w-full border-collapse text-left">
              <caption className="sr-only">Published setup crew and time by system</caption>
              <thead className="hidden sm:table-header-group">
                <tr className="border-b border-line-strong text-[0.8125rem] text-muted">
                  <th scope="col" className="pb-3 pr-4 font-normal">
                    System
                  </th>
                  <th scope="col" className="pb-3 pr-4 font-normal">
                    Crew
                  </th>
                  <th scope="col" className="pb-3 pr-4 font-normal">
                    Time
                  </th>
                  <th scope="col" className="pb-3 font-normal">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {SETUP_ROWS.map((s) => (
                  <tr key={s.slug} className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-line py-4 align-top sm:table-row sm:py-0">
                    <th scope="row" className="col-span-2 text-[0.95rem] font-normal sm:py-4 sm:pr-4">
                      <SystemLink slug={s.slug} />
                    </th>
                    <td className="text-[0.95rem] leading-snug text-snow sm:py-4 sm:pr-4">
                      <span className="block text-[0.75rem] text-muted sm:hidden">Crew</span>
                      <Fact r={s.crew} />
                    </td>
                    <td className="text-[0.95rem] leading-snug text-snow sm:py-4 sm:pr-4">
                      <span className="block text-[0.75rem] text-muted sm:hidden">Time</span>
                      <Fact r={s.time} />
                    </td>
                    <td className="col-span-2 text-[0.875rem] leading-snug text-muted sm:py-4">
                      {s.note ? refText(s.note) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TRECC test record */}
      <section aria-labelledby="trecc-heading" className="border-t border-line bg-hull py-16 sm:py-20">
        <div className="v2-wrap grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <h2 id="trecc-heading" className="v2-h2 text-snow">
              TRECC test record
            </h2>
            <p className="v2-body mt-4 max-w-[44ch]">
              TRECC was co-developed with US Army DEVCOM. Weatherhaven publishes this record in its{" "}
              <a href={CAPABILITIES_STATEMENT.href} target="_blank" rel="noopener noreferrer" className="v2-link">
                2026 capabilities statement (PDF)
              </a>
              ; the test reports themselves aren&rsquo;t public.
            </p>
            <p className="mt-6">
              <Link href="/configurable-solutions/trecc" className="v2-link text-[0.95rem]">
                TRECC specifications and 3D model
              </Link>
            </p>
          </div>
          <dl className="border-t border-line">
            {TRECC_RECORD.map((r) => (
              <div key={r.title} className="grid gap-1 border-b border-line py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <dt className="text-[0.875rem] text-muted">{r.title}</dt>
                <dd className={r.text === "43" ? "v2-figure text-[1.6rem] leading-none text-snow" : "text-[1rem] leading-snug text-snow"}>
                  {r.text.charAt(0).toUpperCase() + r.text.slice(1)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Field record */}
      <section aria-labelledby="field-heading" className="border-t border-line bg-ink py-16 sm:py-20">
        <div className="v2-wrap">
          <SectionHead id="field-heading" title="Where they've worked">
            <p>Polar and high-altitude sites where Weatherhaven shelters have been used, from the organizations that ran them.</p>
          </SectionHead>
          <ul className="mt-10 grid gap-px border border-line bg-line md:grid-cols-2 xl:grid-cols-3">
            {field.stories.map((s) => (
              <li key={s.id} className="flex flex-col bg-ink p-6 sm:p-7">
                <p className="text-[0.8125rem] text-muted">
                  <span className="text-snow">{s.place}</span>
                  {s.when ? `, ${s.when}` : ""}
                </p>
                <h3 className="v2-h3 mt-2 text-snow">{s.title}</h3>
                {s.facts?.length ? (
                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                    {s.facts.map((f) => (
                      <div key={f.label}>
                        <dt className="sr-only">{f.label}</dt>
                        <dd className="v2-figure text-[1.4rem] leading-none text-snow">{f.value}</dd>
                        <dd className="mt-1 text-[0.8125rem] text-muted">{f.label}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                <p className="mt-4 text-[0.875rem] text-muted">
                  {s.systems.length > 1 ? "Systems: " : "System: "}
                  {s.systems.map((x, i) => (
                    <span key={x.slug}>
                      <Link href={systemHref(x.slug)} className="v2-link">
                        {x.name}
                      </Link>
                      {i < s.systems.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
                <div className="mt-auto pt-5 text-[0.8125rem] text-muted">
                  <p>{s.sources.length > 1 ? "Sources" : "Source"}</p>
                  <ul className="mt-1 space-y-1">
                    {s.sources.map((src) => (
                      <li key={src.href}>
                        <a href={src.href} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-snow">
                          {src.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/deployments#${s.id}`} className="v2-link mt-3 inline-block text-[0.875rem]">
                    The full account
                  </Link>
                </div>
              </li>
            ))}
            {field.notes.map((n) => (
              <li key={n.place} className="flex flex-col bg-ink p-6 sm:p-7">
                <p className="text-[0.8125rem] text-snow">{n.place}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-snow/85">{n.text}</p>
                {n.source ? (
                  <p className="mt-auto pt-5 text-[0.8125rem] text-muted">
                    Source:{" "}
                    <a href={n.source.href} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-snow">
                      {n.source.label}
                    </a>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Quality and certification */}
      <section aria-labelledby="quality-heading" className="border-t border-line bg-ink py-16 sm:py-20">
        <div className="v2-wrap grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <h2 id="quality-heading" className="v2-h2 text-snow">
              Quality and certification
            </h2>
            <p className="v2-body mt-4 max-w-[44ch]">
              Quality management at the Burnaby and Brockville plants is certified to ISO 9001:2015. MECC, EHMECC and
              BMECC carry CSC approval, the international safety approval for containers moved and stacked as
              cargo.
            </p>
            <p className="mt-6">
              <Link href="/government" className="v2-link text-[0.95rem]">
                CAGE, UEI and contract vehicles
              </Link>
            </p>
          </div>
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Published certification and service life by system</caption>
            <thead>
              <tr className="border-b border-line-strong text-[0.8125rem] text-muted">
                <th scope="col" className="pb-3 pr-4 font-normal">
                  System
                </th>
                <th scope="col" className="pb-3 pr-4 font-normal">
                  Certification
                </th>
                <th scope="col" className="pb-3 font-normal">
                  Service life
                </th>
              </tr>
            </thead>
            <tbody>
              {CERTIFICATION_ROWS.map((c) => (
                <tr key={c.slug} className="border-b border-line align-top">
                  <th scope="row" className="py-4 pr-4 text-[0.95rem] font-normal">
                    <SystemLink slug={c.slug} />
                  </th>
                  <td className="py-4 pr-4 text-[0.95rem] leading-snug text-snow">
                    <Fact r={c.cert} />
                  </td>
                  <td className="py-4 text-[0.95rem] leading-snug text-snow">
                    <Fact r={c.life} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-line bg-hull py-20">
        <div className="v2-wrap flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="v2-h2 max-w-[22ch] text-snow">Need the figures for your site</h2>
            <p className="v2-body mt-4 max-w-[52ch]">
              Ratings that aren&rsquo;t published, test documentation for authorized programs, and how a system
              performs in your climate: the US office can brief your team.
            </p>
          </div>
          <Link href={NAV_CTA.href} className="v2-btn self-start lg:self-auto">
            {NAV_CTA.label}
          </Link>
        </div>
      </section>
    </>
  );
}
