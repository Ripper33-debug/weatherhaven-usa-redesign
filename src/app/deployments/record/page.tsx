import type { Metadata } from "next";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { FieldedSitesTable } from "@/components/deployments/FieldedSitesTable";
import { FIELDED_SITES, PUBLIC_CONTRACTS, SITE_REGIONS, SITE_TYPES } from "@/lib/track-record";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Track record",
  description:
    "Weatherhaven's contracts on public record (US Army, Defense Logistics Agency, New York Air National Guard, Public Services and Procurement Canada) and every confirmed site that can be shown publicly.",
  path: "/deployments/record",
});

/**
 * A past-performance register: contracts on public record, then every confirmed site, in plain
 * tables a contracting officer can scan. Data and its limits are described in src/lib/track-record.ts.
 */
export default function TrackRecordPage() {
  const regions = SITE_REGIONS.filter((r) => FIELDED_SITES.some((s) => s.region === r));
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { href: "/deployments", label: "Deployments" }, { label: "Track record" }]}
        title="Track record"
        lead={`Contracts on public record, then the ${FIELDED_SITES.length} confirmed sites that can be shown publicly.`}
      />

      <div className="bg-ink">
        <section aria-labelledby="contracts-heading" className="border-b border-line py-16 sm:py-20">
          <div className="v2-wrap">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
              <h2 id="contracts-heading" className="v2-h2 text-snow">
                Contracts on public record
              </h2>
              <p className="v2-body max-w-[60ch]">
                From government award records and news releases, newest first. Programs described only in
                Weatherhaven&rsquo;s own material, such as the NATO headquarters and TRECC development, are on the{" "}
                <Link href="/deployments" className="v2-link">
                  deployments page
                </Link>
                .
              </p>
            </div>

            <table className="mt-10 w-full border-t border-line text-left">
              <caption className="sr-only">Weatherhaven contracts on public record</caption>
              <thead className="hidden lg:table-header-group">
                <tr className="border-b border-line">
                  <th scope="col" className="v2-tech w-[7rem] py-3 pr-6 font-medium text-muted">
                    Year
                  </th>
                  <th scope="col" className="v2-tech w-[16rem] py-3 pr-6 font-medium text-muted">
                    Buyer
                  </th>
                  <th scope="col" className="v2-tech py-3 pr-6 font-medium text-muted">
                    What
                  </th>
                  <th scope="col" className="v2-tech w-[13rem] py-3 pr-6 font-medium text-muted">
                    Award or stock number
                  </th>
                  <th scope="col" className="v2-tech w-[15rem] py-3 font-medium text-muted">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody>
                {PUBLIC_CONTRACTS.map((c) => (
                  <tr key={`${c.year}-${c.buyer}-${c.what.slice(0, 24)}`} className="block border-b border-line py-5 lg:table-row lg:py-0">
                    <td className="block text-[0.95rem] text-muted lg:table-cell lg:py-5 lg:pr-6 lg:align-top">
                      <span className="v2-tnum">{c.year}</span>
                    </td>
                    <td className="mt-1 block text-[1rem] font-semibold text-snow lg:mt-0 lg:table-cell lg:py-5 lg:pr-6 lg:align-top">
                      {c.buyer}
                    </td>
                    <td className="mt-2 block text-[0.95rem] leading-relaxed text-snow/85 lg:mt-0 lg:table-cell lg:py-5 lg:pr-6 lg:align-top">
                      {c.what}
                      {c.story ? (
                        <>
                          {" "}
                          <Link href={`/deployments#${c.story}`} className="v2-link whitespace-nowrap text-[0.9rem]">
                            The story
                          </Link>
                        </>
                      ) : null}
                    </td>
                    <td className="mt-3 block lg:mt-0 lg:table-cell lg:py-5 lg:pr-6 lg:align-top">
                      {c.ids.length ? (
                        <ul className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
                          {c.ids.map((id) => (
                            <li key={id} className="v2-code px-2 py-1 text-[0.85rem] text-snow shadow-[inset_0_0_0_1px_rgb(148_170_196/0.32)]">
                              {id}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-[0.875rem] text-muted">Not listed</span>
                      )}
                    </td>
                    <td className="mt-3 block text-[0.875rem] leading-relaxed lg:mt-0 lg:table-cell lg:py-5 lg:align-top">
                      <ul className="space-y-1">
                        {c.sources.map((s) => (
                          <li key={s.href}>
                            {s.href.startsWith("/") ? (
                              <Link href={s.href} className="text-muted underline decoration-line-strong underline-offset-2 hover:text-snow">
                                {s.label}
                              </Link>
                            ) : (
                              <a
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${s.label} (opens in a new tab)`}
                                className="text-muted underline decoration-line-strong underline-offset-2 hover:text-snow"
                              >
                                {s.label}
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="sites-heading" className="border-b border-line py-16 sm:py-20">
          <div className="v2-wrap">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
              <h2 id="sites-heading" className="v2-h2 text-snow">
                Fielded sites
              </h2>
              <p className="v2-body max-w-[60ch]">
                Every confirmed site on the{" "}
                <Link href="/deployments/map" className="v2-link">
                  deployment map
                </Link>
                , by country or mission. Weatherhaven shelters have gone to more than 95 countries in all; sites that
                can&rsquo;t be shown publicly aren&rsquo;t listed.
              </p>
            </div>
            <div className="mt-10">
              <FieldedSitesTable rows={FIELDED_SITES} regions={regions} types={SITE_TYPES} />
            </div>
          </div>
        </section>

        <section className="bg-hull py-20 sm:py-24">
          <div className="v2-wrap grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h2 className="v2-h2 max-w-[24ch] text-snow">Past performance for your solicitation</h2>
              <p className="v2-body mt-4 max-w-[52ch]">
                Ask the US office which programs are closest to your requirement and what can be shared about them.
              </p>
            </div>
            <Link href="/contact?inquiry=Capability%20Briefing" className="v2-btn">
              Request a briefing
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
