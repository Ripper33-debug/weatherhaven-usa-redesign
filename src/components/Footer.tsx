import Link from "next/link";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";
import { company, footerColumns, legalLinks } from "@/lib/site";
import { NavAdminLink } from "@/components/navigation/NavAdminLink";

export function Footer() {
  return (
    <footer data-global-footer className="border-t border-white/[0.08] bg-[#080a0c]">
      <div className="wh-marketing-divider" />
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 sm:py-20 lg:px-12">
        <div className="grid gap-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <WeatherhavenLogoLink href="/" height={36} className="sm:h-10" />
            <p className="mt-1 font-mono text-[10px] font-medium tracking-[0.2em] text-[#8a9099]">
              {COMPANY_CONTACT.legalName}
            </p>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-[#8a9099] sm:text-sm">
              {COMPANY_CONTACT.headquartersAddress}
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-[#8a9099] sm:text-base">{company.description}</p>
            <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-white">{company.tagline}</p>
            <p className="mt-4 text-sm text-[#8a9099]">
              <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="text-white/80 hover:text-white">
                Tel {COMPANY_CONTACT.phone}
              </a>
              {" · "}
              <Link href="/contact" className="text-white/80 hover:text-white">
                Contact our team
              </Link>
              {" · "}
              <a
                href={COMPANY_CONTACT.contactPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white"
              >
                Corporate site
              </a>
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#8a9099]">
              <NavAdminLink placement="footer" />
              <span className="text-white/20" aria-hidden>
                ·
              </span>
              <Link href="/sof-solutions/login" className="hover:text-white">
                SOF member sign-in
              </Link>
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <p className="wh-marketing-eyebrow">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#8a9099] transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.08] pt-10 text-xs leading-relaxed text-[#8a9099] sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono tracking-wide">
              © {new Date().getFullYear()} {company.name} All rights reserved.
            </p>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {legalLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-[#8a9099] hover:text-white">
                  {link.label}
                </Link>
              ))}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <Link
              href="/sof-solutions"
              className="text-[12px] text-[rgba(255,255,255,0.3)] no-underline transition hover:text-[rgba(255,255,255,0.6)]"
            >
              Special Operations Portal
            </Link>
            <p className="max-w-xl sm:text-right">
              Export-controlled technical data may apply. Distribution limited to authorized recipients and programs of
              record.
            </p>
          </div>
        </div>
        <p className="mt-6 max-w-4xl border-l border-white/10 pl-5 text-[11px] leading-relaxed text-[#8a9099]">
          Reference to U.S. Department of Defense organizations or visual style does not imply endorsement. Shelter and
          infrastructure descriptions are illustrative of capability classes and may vary by contract and theater.
        </p>
      </div>
    </footer>
  );
}
