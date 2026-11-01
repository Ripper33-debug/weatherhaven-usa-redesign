import type { Metadata } from "next";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { PhotoBand } from "@/components/site/PhotoBand";
import { CopyCode } from "@/components/site/CopyCode";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";
import { PROCUREMENT } from "@/lib/procurement";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "For government buyers",
  description:
    "Weatherhaven Resources, Inc.: CAGE 0EYW4, UEI DBETGL9QKYH3, registered NAICS codes, current US Army and DLA contract vehicles, quality certification and how to request a configuration package.",
  path: "/government",
});

function SourceLink({ href, children }: { href: string; children: React.ReactNode }) {
  const cls = "underline decoration-line-strong underline-offset-2 hover:text-snow";
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  );
}

/**
 * Everything a contracting office needs to find, qualify and buy from Weatherhaven in the US.
 * The identifiers, codes and contract record are in src/lib/procurement.ts with their sources.
 */
export default function GovernmentBuyersPage() {
  const p = PROCUREMENT;
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Government buyers" }]}
        title="For government buyers"
        lead="Weatherhaven Resources, Inc. in North Tonawanda, New York, is Weatherhaven's US company. It holds the SAM.gov registration and the US contract vehicles."
      />

      {/* Identifiers and NAICS codes: a light data band, like the sheet a contracting office files */}
      <div className="v2-light py-20 sm:py-28">
        <div className="v2-wrap">
          {/* Identifiers */}
          <section aria-labelledby="ids-heading" className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <h2 id="ids-heading" className="v2-h2 text-snow">
                Identifiers
              </h2>
              <p className="v2-body mt-4 max-w-[44ch]">
                For SAM.gov, solicitations and vendor forms.
              </p>
            </div>
            <div className="v2-plate px-6 py-2 sm:px-8">
              <dl>
                {[
                  { k: "Legal name", v: <span className="text-snow">{p.legalName}</span> },
                  { k: "CAGE code", v: <CopyCode value={p.cage} label="CAGE code" /> },
                  { k: "UEI", v: <CopyCode value={p.uei} label="UEI" /> },
                  {
                    k: "SAM.gov",
                    v: (
                      <span className="text-snow">
                        Registered.{" "}
                        <span className="text-muted">
                          Check the current registration at <SourceLink href="https://sam.gov/">SAM.gov</SourceLink>.
                        </span>
                      </span>
                    ),
                  },
                  { k: "US office", v: <span className="text-snow">{COMPANY_CONTACT.headquartersAddress.replace(", United States", "")}</span> },
                  { k: "Parent company", v: <span className="text-snow">{COMPANY_CONTACT.globalLegalName}, Burnaby, BC, Canada</span> },
                  { k: "Quality", v: <span className="text-snow">ISO 9001:2015, Burnaby and Brockville plants</span> },
                  {
                    k: "Phone",
                    v: (
                      <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-link">
                        {COMPANY_CONTACT.phone}
                      </a>
                    ),
                  },
                ].map((row) => (
                  <div key={row.k} className="grid gap-1 border-b border-line py-4 last:border-b-0 sm:grid-cols-[11rem_1fr] sm:items-center sm:gap-6">
                    <dt className="v2-tech text-muted">{row.k}</dt>
                    <dd className="text-[1rem]">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {/* NAICS */}
          <section aria-labelledby="naics-heading" className="v2-reveal mt-20 grid gap-10 border-t border-line pt-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <h2 id="naics-heading" className="v2-h2 text-snow">
                NAICS codes
              </h2>
              <p className="v2-body mt-4 max-w-[44ch]">The codes in Weatherhaven Resources&rsquo; SAM.gov registration.</p>
            </div>
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {p.naics.map((n, i) => (
                <li
                  key={n.code}
                  className={`grid grid-cols-[4.5rem_1fr] gap-3 border-b border-line py-3 ${p.naics.length % 2 === 1 && i === p.naics.length - 1 ? "sm:col-span-2" : ""}`}
                >
                  <span className="v2-code text-[1rem] text-snow">{n.code}</span>
                  <span className="text-[0.95rem] text-muted">
                    {n.title}
                    {"primary" in n && n.primary ? <span className="v2-tech ml-2 text-signal">Primary</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="v2-wrap py-20 sm:py-28">
        {/* Contract record */}
        <section aria-labelledby="record-heading">
          <div className="v2-reveal grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <h2 id="record-heading" className="v2-h2 text-snow">
              Current vehicles and recent awards
            </h2>
            <p className="v2-body max-w-[60ch]">
              From the public award records. Ask about the right route for your program: a new requirement, spares
              by NSN, or an order under an existing agreement.
            </p>
          </div>
          <ul className="v2-reveal-stagger mt-12 grid gap-px border border-line bg-line md:grid-cols-2">
            {p.record.map((r, i) => (
              <li
                key={r.title}
                className={`flex flex-col bg-ink p-6 sm:p-8 ${p.record.length % 2 === 1 && i === p.record.length - 1 ? "md:col-span-2" : ""}`}
              >
                <p className="v2-tech text-muted">{r.buyer}</p>
                <h3 className="v2-h3 mt-3 text-snow">{r.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{r.text}</p>
                {r.ids.length ? (
                  <p className="mt-4 flex flex-wrap gap-2">
                    {r.ids.map((id) => (
                      <span key={id} className="v2-code px-2 py-1 text-[0.875rem] text-snow shadow-[inset_0_0_0_1px_var(--color-line-strong)]">
                        {id}
                      </span>
                    ))}
                  </p>
                ) : null}
                <p className="mt-auto pt-5 text-[0.875rem] text-muted">
                  Source: <SourceLink href={r.source.href}>{r.source.label}</SourceLink>
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[0.95rem] text-muted">
            <Link href="/deployments/record" className="v2-link">
              Full track record
            </Link>
            : every contract on public record and every confirmed site, in one table.
          </p>
        </section>
      </div>

      <PhotoBand
        src="/products/mecc/gallery/16-MECCs_x5_deployed_01.jpg"
        alt="Five white MECC expandable containers deployed side by side on a paved lot"
        caption="Five MECCs deployed side by side."
        position="50% 42%"
        height="medium"
      />

      <div className="v2-wrap pb-24 pt-16 sm:pb-28 sm:pt-20">
        {/* What we provide */}
        <section aria-labelledby="provide-heading" className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div className="v2-reveal">
            <h2 id="provide-heading" className="v2-h2 text-snow">
              Support for a procurement
            </h2>
            <p className="v2-body mt-4 max-w-[40ch]">What the US office can put together for a contracting team.</p>
          </div>
          <ul className="v2-reveal-stagger border-t border-line">
            {p.provide.map((item) => (
              <li key={item.title} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <p className="font-semibold text-snow">{item.title}</p>
                <p className="text-[0.95rem] leading-relaxed text-muted">
                  {item.text}
                  {item.link ? (
                    <>
                      {" "}
                      {item.link.external ? (
                        <SourceLink href={item.link.href}>{item.link.label}</SourceLink>
                      ) : (
                        <Link href={item.link.href} className="v2-link">
                          {item.link.label}
                        </Link>
                      )}
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="border-t border-line bg-hull py-20 sm:py-24">
        <div className="v2-wrap v2-reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="v2-h2 max-w-[22ch] text-snow">Scoping a requirement or a solicitation?</h2>
            <p className="v2-body mt-4 max-w-[52ch]">
              The US office in North Tonawanda answers program and contracting questions. Call{" "}
              <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-link">
                {COMPANY_CONTACT.phone}
              </a>
              .
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact?inquiry=Program%20Requirement" className="v2-btn">
              Request a configuration package
            </Link>
            <Link href="/configurable-solutions" className="v2-btn v2-btn-ghost">
              See every system
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
