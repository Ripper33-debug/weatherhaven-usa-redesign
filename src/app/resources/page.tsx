import type { Metadata } from "next";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { COMPANY_CONTACT } from "@/lib/company-facts";
import { pageMeta } from "@/lib/page-meta";
import { SYSTEMS_BY_FAMILY } from "@/lib/site-nav";

export const metadata: Metadata = pageMeta({
  title: "Resources",
  description:
    "Weatherhaven spec sheets, info sheets, ISO certification, contracting details and links for program and procurement teams.",
  path: "/resources",
});

type Resource = { title: string; detail: string; href: string; kind: "PDF" | "Web page" };

const DOWNLOADS: Resource[] = [
  {
    title: "Airmax LP inflatable airbeam shelter: info sheet",
    detail: "Dimensions, weights, wind and snow ratings, inflation pressure and setup.",
    href: "/downloads/inflatable-airbeam-shelter.pdf",
    kind: "PDF",
  },
  {
    title: "ISO 9001:2015 certificate, Burnaby and Brockville",
    detail: "Quality management certification for Weatherhaven's Canadian manufacturing sites.",
    href: COMPANY_CONTACT.isoCertificateUrl,
    kind: "PDF",
  },
];

const COMPANY: Resource[] = [
  { title: "About Weatherhaven", detail: "History, leadership and the company's global group.", href: "https://www.weatherhaven.com/AboutUs", kind: "Web page" },
  { title: "Military solutions", detail: "Weatherhaven's defense portfolio and program references.", href: "https://www.weatherhaven.com/military", kind: "Web page" },
  { title: "Medical solutions", detail: "Field hospitals, clinics and medical shelter configurations.", href: "https://www.weatherhaven.com/medical", kind: "Web page" },
  { title: "Commercial and workforce camps", detail: "Mining, energy and research camp infrastructure.", href: "https://www.weatherhaven.com/commercial", kind: "Web page" },
  { title: "Regional offices", detail: "Contacts for Weatherhaven offices worldwide.", href: COMPANY_CONTACT.contactPageUrl, kind: "Web page" },
];

function ResourceList({ items }: { items: Resource[] }) {
  return (
    <ul className="border-t border-line">
      {items.map((r) => {
        const external = r.href.startsWith("http");
        return (
          <li key={r.href} className="border-b border-line">
            <a
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid gap-1 py-5 no-underline sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-8"
            >
              <span>
                <span className="block text-[1.05rem] font-semibold text-snow group-hover:text-signal">{r.title}</span>
                <span className="mt-1 block text-[0.92rem] text-muted">{r.detail}</span>
              </span>
              <span className="text-[0.85rem] text-muted">
                {r.kind}
                {external ? `, ${new URL(r.href).hostname.replace(/^www\./, "")}` : ""}
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export default function ResourcesPage() {
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Resources" }]}
        title="Resources for program teams"
        lead="Spec sheets, certifications and contracting details in one place. Detailed technical data for export-controlled programs is released through a Weatherhaven expert."
      />
      <div className="bg-ink py-14 sm:py-20">
        <div className="v2-wrap grid gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-20">
          <div className="space-y-16">
            <section aria-labelledby="dl-heading">
              <h2 id="dl-heading" className="v2-h2 text-snow">
                Downloads
              </h2>
              <div className="mt-6">
                <ResourceList items={DOWNLOADS} />
              </div>
            </section>

            <section aria-labelledby="spec-heading">
              <h2 id="spec-heading" className="v2-h2 text-snow">
                Spec sheets
              </h2>
              <p className="v2-body mt-3">Every system page carries its published specifications.</p>
              <div className="mt-6 grid gap-8 sm:grid-cols-2">
                {SYSTEMS_BY_FAMILY.map((f) => (
                  <div key={f.id}>
                    <h3 className="text-[0.95rem] font-semibold text-snow">{f.name}</h3>
                    <ul className="mt-3 space-y-2">
                      {f.systems.map((s) => (
                        <li key={s.slug}>
                          <Link href={`${s.href}#specifications`} className="v2-link text-[0.95rem]">
                            {s.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section aria-labelledby="co-heading">
              <h2 id="co-heading" className="v2-h2 text-snow">
                From the Weatherhaven group
              </h2>
              <div className="mt-6">
                <ResourceList items={COMPANY} />
              </div>
            </section>
          </div>

          <aside aria-labelledby="buyer-heading" className="lg:pt-2">
            <div className="v2-plate px-6 py-7 lg:sticky lg:top-28">
              <h2 id="buyer-heading" className="text-[1.1rem] font-semibold text-snow">
                Contracting details
              </h2>
              <dl className="mt-5 space-y-4 text-[0.95rem]">
                <div>
                  <dt className="text-muted">US entity</dt>
                  <dd className="text-snow">{COMPANY_CONTACT.legalName}</dd>
                </div>
                <div>
                  <dt className="text-muted">Address</dt>
                  <dd className="text-snow">889 Erie Avenue, North Tonawanda, NY 14120</dd>
                </div>
                <div>
                  <dt className="text-muted">Certifications</dt>
                  <dd className="text-snow">ISO 9001:2015</dd>
                </div>
                <div>
                  <dt className="text-muted">Phone</dt>
                  <dd className="text-snow">{COMPANY_CONTACT.phone}</dd>
                </div>
              </dl>
              <Link href="/contact?inquiry=Program%20Requirement" className="v2-btn mt-7 w-full">
                Request technical data
              </Link>
              <Link href="/government" className="v2-link mt-4 inline-block text-[0.9rem]">
                CAGE, UEI, NAICS codes and contract vehicles
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
