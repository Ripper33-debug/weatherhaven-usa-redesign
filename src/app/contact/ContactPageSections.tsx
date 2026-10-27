"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ContactEngineeringForm } from "@/components/contact/ContactEngineeringForm";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";

export function ContactPageSections() {
  return (
    <section className="bg-ink py-14 sm:py-20">
      <div className="v2-wrap grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-16">
        <div>
          <h2 className="v2-h2 text-snow">Share your requirement</h2>
          <p className="v2-body mt-3">
            Four fields are enough to start. Program, timeline and site details help us route you to the right
            specialist.
          </p>
          <div className="mt-8">
            <Suspense fallback={<p className="text-[0.95rem] text-muted">Loading the form</p>}>
              <ContactEngineeringForm />
            </Suspense>
          </div>
        </div>

        <aside className="space-y-10 lg:pt-2">
          <div className="v2-plate v2-chamfer px-6 py-7">
            <h2 className="text-[1.05rem] font-semibold text-snow">US office</h2>
            <p className="mt-3 text-[0.95rem] text-snow/85">{COMPANY_CONTACT.legalName}</p>
            <p className="text-[0.95rem] text-muted">889 Erie Avenue, North Tonawanda, NY 14120</p>
            <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-figure mt-5 block text-[1.9rem] text-snow no-underline hover:text-signal">
              {COMPANY_CONTACT.phone}
            </a>
            <p className="mt-1 text-[0.85rem] text-muted">CAGE 0EYW4</p>
          </div>

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
