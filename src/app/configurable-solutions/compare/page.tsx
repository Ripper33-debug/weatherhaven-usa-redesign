import type { Metadata } from "next";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { Suspense } from "react";
import { SpecComparator, SpecComparatorFromUrl } from "@/components/compare/SpecComparator";
import { pageMeta } from "@/lib/page-meta";
import { refText, systemHref, systemName, type FactRef } from "@/lib/published-facts";
import { COMPARE_ROWS, COMPARE_TYPES, cellFor, compareTypeHeader, comparableSystems, type CompareRow } from "@/lib/shelter-compare";
import { NAV_CTA } from "@/lib/site-nav";

export const metadata: Metadata = pageMeta({
  title: "Compare shelter types",
  description:
    "Expandable containers, soft-wall, inflatable and polar shelters compared on packed size, deployed size, setup, transport, temperature, wind and snow ratings, with any two Weatherhaven systems side by side.",
  path: "/configurable-solutions/compare",
});

function Ref({ r }: { r: FactRef }) {
  return (
    <span className="block">
      {r.prefix ? <span className="text-muted">{r.prefix}: </span> : null}
      {refText(r)}
    </span>
  );
}

/** One shelter type's entries for a row: the systems that publish the figure, or "Not published" once. */
function Cell({ row, systems }: { row: CompareRow; systems: string[] }) {
  const cells = cellFor(row, systems);
  if (cells.length === 0) return <span className="block text-[0.9375rem] text-muted">Not published</span>;
  return (
    <div className="space-y-3">
      {cells.map(({ slug, refs }) => (
        <div key={slug} className="text-[0.9375rem] leading-snug">
          <Link href={systemHref(slug)} className="font-semibold text-snow no-underline hover:text-signal">
            {systemName(slug)}
          </Link>
          <div className="mt-0.5 text-snow/85">
            {refs.map((r) => (
              <Ref key={`${r.label}-${r.text}`} r={r} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CompareSheltersPage() {
  const types = COMPARE_TYPES.map((t) => ({ ...t, ...compareTypeHeader(t.family) }));
  const systems = comparableSystems();

  return (
    <>
      <V2PageHeader
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/configurable-solutions", label: "Systems" },
          { label: "Compare" },
        ]}
        title="Compare shelter types"
        lead="Put any two of the 17 systems side by side, then see the four kinds of Weatherhaven shelter compared on the figures each publishes."
      />

      <section id="two-systems" aria-labelledby="two-heading" className="v2-light scroll-mt-24 py-16 sm:py-20">
        <div className="v2-wrap">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end">
            <h2 id="two-heading" className="v2-h2 text-snow">
              Any two systems
            </h2>
            <p className="v2-body lg:justify-self-end">
              Every published specification for the two you pick, lined up by figure. The link updates as you choose,
              so you can send the comparison on.
            </p>
          </div>
          <div className="mt-10">
            <Suspense fallback={<SpecComparator systems={systems} initial={["mecc", "rdmss"]} />}>
              <SpecComparatorFromUrl systems={systems} initial={["mecc", "rdmss"]} />
            </Suspense>
          </div>
          <p className="mt-8 text-[0.875rem] text-muted">
            Figures are Weatherhaven&rsquo;s published specifications and vary with configuration. &ldquo;On
            request&rdquo; means one of the two doesn&rsquo;t publish that figure; the US office can supply it. Each
            system&rsquo;s page has its full spec sheet and to-scale drawing.
          </p>
        </div>
      </section>

      <section aria-labelledby="types-heading" className="bg-ink py-16 sm:py-20">
        <div className="v2-wrap">
          <div className="v2-reveal grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-end">
            <h2 id="types-heading" className="v2-h2 text-snow">
              By shelter type
            </h2>
            <p className="v2-body lg:justify-self-end">
              Each column shows its best-documented systems. &ldquo;Not published&rdquo; means the figure isn&rsquo;t
              public; the US office can supply it for a solicitation.
            </p>
          </div>

          {/* Wide screens: one table, a column per type. */}
          <table className="mt-10 hidden w-full table-fixed border-collapse text-left lg:table">
            <caption className="sr-only">Shelter types compared on published figures</caption>
            <thead>
              <tr className="border-b border-line-strong align-bottom">
                <th scope="col" className="w-[10rem] pb-5 pr-6 text-[0.8125rem] font-normal text-muted">
                  Figure
                </th>
                {types.map((t) => (
                  <th key={t.family} scope="col" className="pb-5 pr-6 align-top font-normal">
                    <span className="block text-[1.15rem] font-semibold text-snow [font-variation-settings:'wdth'_108]">{t.name}</span>
                    <span className="mt-2 block text-[0.875rem] leading-snug text-muted">{t.summary}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.id} className="border-b border-line align-top">
                  <th scope="row" className="py-5 pr-6 text-[0.95rem] font-semibold text-snow">
                    {row.label}
                  </th>
                  {types.map((t) => (
                    <td key={t.family} className="py-5 pr-6">
                      <Cell row={row} systems={t.systems} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Phones and tablets: one block per figure, types stacked inside it, behind a disclosure
              (it runs to several screens). */}
          <details className="group mt-8 border-y border-line lg:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[1rem] font-semibold text-snow [&::-webkit-details-marker]:hidden">
              Show the {COMPARE_ROWS.length} figures by shelter type
              <span aria-hidden className="text-[1.25rem] leading-none text-signal transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="space-y-10 pb-8 pt-2">
              {COMPARE_ROWS.map((row) => (
                <section key={row.id} aria-labelledby={`row-${row.id}`} className="border-t border-line-strong pt-5">
                  <h3 id={`row-${row.id}`} className="v2-h3 text-snow">
                    {row.label}
                  </h3>
                  <div className="mt-4 grid gap-6 sm:grid-cols-2">
                    {types.map((t) => (
                      <div key={t.family} className="min-w-0">
                        <p className="mb-2 text-[0.8125rem] text-muted">{t.name}</p>
                        <Cell row={row} systems={t.systems} />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </details>
        </div>
      </section>


      <section className="border-t border-line bg-hull py-20">
        <div className="v2-wrap flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="v2-h2 max-w-[22ch] text-snow">Weighing options for a program</h2>
            <p className="v2-body mt-4 max-w-[52ch]">
              The US office can walk your team through the trade-offs for your mission and supply figures that
              aren&rsquo;t published, for an alternatives analysis or a solicitation.
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
