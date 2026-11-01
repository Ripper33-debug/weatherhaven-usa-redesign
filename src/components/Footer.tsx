import Image from "next/image";
import Link from "next/link";
import { NavAdminLink } from "@/components/navigation/NavAdminLink";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";
import { company, legalLinks } from "@/lib/site";
import { NAV_CTA, NAV_GOV, SYSTEMS_BY_FAMILY } from "@/lib/site-nav";
import { PROCUREMENT } from "@/lib/procurement";

const companyLinks = [
  { href: "/about", label: "About Weatherhaven" },
  { href: "/capabilities", label: "Capabilities" },
  { href: "/who-we-serve", label: "Who we serve" },
  { href: "/deployments", label: "Deployments" },
  { href: "/stories", label: "Program stories" },
  { href: "/deployments/record", label: "Track record" },
  { href: "/tested-and-proven", label: "Tested and proven" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events and briefings" },
  { href: "/resources", label: "Resources" },
];

const programLinks = [
  NAV_GOV,
  { href: "/mission-solution-builder", label: "Mission builder" },
  { href: "/configurable-solutions/compare", label: "Compare systems" },
  { href: "/sof-solutions", label: "SOF portal" },
  { href: "/sof-solutions/request-access", label: "Request SOF access" },
];

type FooterLink = { href: string; label: string; external?: true };
type FooterGroup = { title: string; links: FooterLink[] };

const families: FooterGroup[] = SYSTEMS_BY_FAMILY.map((f) => ({
  title: f.name,
  links: f.systems.map((s) => ({ href: s.href, label: s.name })),
}));
const byId = (id: string) => families[SYSTEMS_BY_FAMILY.findIndex((f) => f.id === id)];

const columns: FooterGroup[][] = [
  [byId("expandable")],
  [byId("softwall"), byId("inflatable")],
  [byId("polar"), { title: "Programs", links: [...programLinks, { href: "https://www.weatherhaven.com", label: "Weatherhaven global site", external: true as const }] }],
  [{ title: "Company", links: companyLinks }],
].map((col) => col.filter(Boolean));

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer data-global-footer className="v2-defer border-t border-line bg-ink text-snow">
      <div className="v2-wrap grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_2fr] lg:gap-16">
        <div>
          <Image
            src="/weatherhaven-logo-reverse@2x.png"
            alt="Weatherhaven"
            width={222}
            height={21}
            style={{ width: 222, height: "auto" }}
          />
          <p className="v2-small mt-6 max-w-sm">
            Rapidly deployable shelters, camps and field hospitals for military, medical and polar operations since
            1981.
          </p>
          <div className="mt-8 space-y-5 text-[0.9375rem] leading-relaxed">
            <div>
              <p className="font-semibold text-snow">US office</p>
              <p className="text-muted">{COMPANY_CONTACT.legalName}</p>
              <p className="text-muted">889 Erie Avenue, North Tonawanda, NY 14120</p>
              <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-link mt-1 inline-block">
                {COMPANY_CONTACT.phone}
              </a>
            </div>
            <div>
              <p className="font-semibold text-snow">Global headquarters</p>
              <p className="text-muted">{COMPANY_CONTACT.globalLegalName}</p>
              <p className="text-muted">#130-8610 Glenlyon Parkway, Burnaby, BC V5J 0B6</p>
            </div>
          </div>
          <Link href={NAV_CTA.href} className="v2-btn mt-8">
            {NAV_CTA.label}
          </Link>
        </div>

        {/* Four columns of link groups; the shorter groups share a column so no column runs empty. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {columns.map((col, i) => (
            <div key={i} className="space-y-10">
              {col.map((group) => (
                <div key={group.title}>
                  <p className="text-[0.9375rem] font-semibold text-snow">{group.title}</p>
                  <ul className="mt-4 space-y-2.5">
                    {group.links.map((l) => (
                      <li key={l.href}>
                        {"external" in l ? (
                          <a
                            href={l.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="v2-link-sweep text-[0.9375rem] text-muted transition-colors hover:text-snow"
                          >
                            {l.label}
                          </a>
                        ) : (
                          <Link href={l.href} className="v2-link-sweep text-[0.9375rem] text-muted transition-colors hover:text-snow">
                            {l.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="v2-wrap flex flex-col gap-6 py-8 text-[0.875rem] leading-relaxed text-muted lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="space-y-2">
            <p>
              © {year} {company.name} All rights reserved.
            </p>
            <p>
              ISO 9001:2015 certified. CAGE code {PROCUREMENT.cage}.{" "}
              <Link href={NAV_GOV.href} className="text-muted underline decoration-line-strong underline-offset-2 hover:text-snow">
                Contracting details
              </Link>
            </p>
          </div>
          <p className="max-w-xl lg:text-right">
            Export-controlled technical data may apply; detailed specifications are released to authorized programs.
            Configurations and performance vary by contract and theater. References to U.S. Department of Defense
            organizations do not imply endorsement.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-muted no-underline hover:text-snow">
                {l.label}
              </Link>
            ))}
            <NavAdminLink placement="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
