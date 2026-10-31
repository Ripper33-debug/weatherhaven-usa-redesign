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
          <div className="mt-8 space-y-5 text-[0.9rem] leading-relaxed">
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

        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {SYSTEMS_BY_FAMILY.map((family) => (
            <div key={family.id} className={family.id === "expandable" ? "" : ""}>
              <p className="text-[0.9rem] font-semibold text-snow">{family.name}</p>
              <ul className="mt-4 space-y-2.5">
                {family.systems.map((s) => (
                  <li key={s.slug}>
                    <Link href={s.href} className="text-[0.9rem] text-muted no-underline transition-colors hover:text-snow">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-[0.9rem] font-semibold text-snow">Company</p>
            <ul className="mt-4 space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[0.9rem] text-muted no-underline transition-colors hover:text-snow">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[0.9rem] font-semibold text-snow">Programs</p>
            <ul className="mt-4 space-y-2.5">
              {programLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[0.9rem] text-muted no-underline transition-colors hover:text-snow">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://www.weatherhaven.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.9rem] text-muted no-underline transition-colors hover:text-snow"
                >
                  Weatherhaven global site
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="v2-wrap flex flex-col gap-6 py-8 text-[0.8rem] leading-relaxed text-muted lg:flex-row lg:items-start lg:justify-between">
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
