import Link from "next/link";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";

export function HomeCta() {
  return (
    <section aria-labelledby="cta-heading" className="relative overflow-hidden border-t border-line bg-ink py-24 sm:py-32">
      <svg aria-hidden className="pointer-events-none absolute -right-24 top-1/2 hidden w-[620px] -translate-y-1/2 opacity-[0.07] lg:block" viewBox="0 0 400 260">
        <rect x="140" y="80" width="120" height="120" fill="none" stroke="#eef2f6" strokeWidth="2" />
        <path d="M140 200 L40 200 L40 110 L140 80 M260 200 L360 200 L360 110 L260 80" fill="none" stroke="#eef2f6" strokeWidth="2" />
      </svg>
      <div className="v2-wrap relative">
        <h2 id="cta-heading" className="v2-display max-w-[14ch] text-snow">
          Tell us where you&apos;re deploying.
        </h2>
        <p className="v2-lead mt-6">
          Share the mission, the climate and the number of people. A Weatherhaven expert will come back with a
          starting configuration, usually within 48 hours.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/contact" className="v2-btn">
            Talk to an expert
          </Link>
          <Link href="/mission-solution-builder" className="v2-btn v2-btn-ghost">
            Build a mission profile
          </Link>
        </div>
        <div className="mt-12 grid gap-6 border-t border-line pt-8 text-[0.95rem] sm:grid-cols-2 lg:max-w-3xl">
          <p className="text-muted">
            Prefer the phone? Call the US office at{" "}
            <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-link">
              {COMPANY_CONTACT.phone}
            </a>
            .
          </p>
          <p className="text-muted">
            Special operations programs can{" "}
            <Link href="/sof-solutions/request-access" className="v2-link">
              request SOF portal access
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
