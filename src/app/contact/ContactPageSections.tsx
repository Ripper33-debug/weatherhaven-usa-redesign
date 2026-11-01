"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ContactEngineeringForm, ContactEngineeringFormFallback } from "@/components/contact/ContactEngineeringForm";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";

export function ContactPageSections() {
  return (
    <section className="bg-ink py-16 sm:py-24">
      <div className="v2-wrap grid gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-16">
        <div>
          <h2 className="v2-h2 text-snow">Share your requirement</h2>
          <p className="v2-body mt-3 max-w-[60ch]">
            Four fields are enough to start. Program, timeline and site details help us route you to the right
            specialist.
          </p>
          <div className="mt-8">
            <Suspense fallback={<ContactEngineeringFormFallback />}>
              <ContactEngineeringForm />
            </Suspense>
          </div>
        </div>

        <aside className="space-y-10 lg:pt-2">
          <div className="v2-plate px-6 py-7">
            <h2 className="text-[1.05rem] font-semibold text-snow">US office</h2>
            <p className="mt-3 text-[0.95rem] text-snow/85">{COMPANY_CONTACT.legalName}</p>
            <p className="text-[0.95rem] text-muted">889 Erie Avenue, North Tonawanda, NY 14120</p>
            <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-figure mt-5 block text-[1.9rem] text-snow no-underline hover:text-signal">
              {COMPANY_CONTACT.phone}
            </a>
            <Link href="/government" className="v2-link mt-4 inline-block text-[0.95rem]">
              CAGE, UEI and contract vehicles
            </Link>
          </div>

          <nav aria-labelledby="request-types-heading">
            <h2 id="request-types-heading" className="text-[1.05rem] font-semibold text-snow">
              Or ask for something specific
            </h2>
            <ul className="mt-4 border-t border-line text-[0.95rem]">
              {[
                { inquiry: "Capability Briefing", label: "A capability briefing", note: "In person or online" },
                { inquiry: "Engineer Call", label: "A call with an engineer", note: "Pick two or three times" },
                { inquiry: "CAD Drawings", label: "CAD drawings", note: "In the formats you need" },
                { inquiry: "Demo Request", label: "A demo", note: "See a system set up" },
                { inquiry: "Factory Tour", label: "A factory tour", note: "See systems built and tested" },
              ].map((m) => (
                <li key={m.inquiry} className="border-b border-line">
                  <Link
                    href={`/contact?inquiry=${encodeURIComponent(m.inquiry)}`}
                    scroll={false}
                    className="v2-press group flex items-baseline justify-between gap-4 py-3 no-underline"
                  >
                    <span className="text-snow transition-colors group-hover:text-signal">{m.label}</span>
                    <span className="text-right text-[0.875rem] text-muted">{m.note}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[1.05rem] font-semibold text-snow">What happens next</h2>
            <ol className="mt-4 space-y-4">
              {[
                "A Weatherhaven expert reviews your inquiry within one business day.",
                "You get a confirmation email at the address you provide.",
                "A specialist responds within 48 hours with next steps matched to your program.",
              ].map((line, i) => (
                <li key={line} className="grid grid-cols-[1.75rem_1fr] text-[0.95rem] leading-relaxed text-muted">
                  <span className="v2-figure text-signal">{i + 1}</span>
                  {line}
                </li>
              ))}
            </ol>
          </div>

          <div className="border-t border-line pt-8 text-[0.95rem] leading-relaxed text-muted">
            <h2 className="text-[1.05rem] font-semibold text-snow">Global headquarters</h2>
            <p className="mt-3">{COMPANY_CONTACT.globalLegalName}</p>
            <p>#130-8610 Glenlyon Parkway, Burnaby, BC V5J 0B6, Canada</p>
            <p className="mt-2">
              Tel{" "}
              <a href={companyPhoneHref(COMPANY_CONTACT.globalPhone)} className="v2-link">
                {COMPANY_CONTACT.globalPhone}
              </a>
            </p>
            <a href={COMPANY_CONTACT.contactPageUrl} target="_blank" rel="noopener noreferrer" className="v2-link mt-4 inline-block">
              Regional offices worldwide
            </a>
          </div>

          <div className="border-t border-line pt-8 text-[0.95rem] leading-relaxed text-muted">
            <h2 className="text-[1.05rem] font-semibold text-snow">Special operations programs</h2>
            <p className="mt-3">
              Restricted systems and data are shared through the SOF portal.{" "}
              <Link href="/sof-solutions/request-access" className="v2-link">
                Request access
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
