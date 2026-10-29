import type { Metadata } from "next";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { BUYER_SEGMENTS, buyerHref } from "@/lib/buyer-segments";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Who we serve",
  description:
    "Weatherhaven shelters for the US Army, Air Force and Air National Guard, special operations, NATO and UN missions, the Canadian Armed Forces, emergency medical response, polar research and remote workforce camps.",
  path: "/who-we-serve",
});

/** One statement and a plain list of the buyers, each leading to its own page. */
export default function WhoWeServePage() {
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Who we serve" }]}
        title="Who we serve"
        lead="Armed forces, emergency and medical agencies, polar research programs and remote workforce camps. Each page lists what that kind of buyer uses and what is on record."
      />
      <div className="v2-wrap pb-24 pt-12">
        <ul className="border-t border-line">
          {BUYER_SEGMENTS.map((s) => (
            <li key={s.slug} className="border-b border-line">
              <Link
                href={buyerHref(s.slug)}
                className="group grid gap-1 py-6 no-underline sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] sm:items-baseline sm:gap-8"
              >
                <span className="text-[1.25rem] font-semibold leading-snug text-snow transition-colors group-hover:text-signal [font-variation-settings:'wdth'_106]">
                  {s.label}
                </span>
                <span className="text-[0.95rem] leading-relaxed text-muted">{s.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
