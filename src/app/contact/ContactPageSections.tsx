"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ContactEngineeringForm } from "@/components/contact/ContactEngineeringForm";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { btnMarketingLink } from "@/lib/cta-buttons";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";

export function ContactPageSections() {
  return (
    <>
      <MarketingSection className="mx-auto max-w-3xl px-6 py-12 sm:py-16 lg:px-8">
        <div data-reveal-child className="border-b border-white/[0.08] pb-10">
          <p className="wh-marketing-eyebrow">United States office</p>
          <p className="mt-4 text-lg text-white">{COMPANY_CONTACT.legalName}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#8a9099]">{COMPANY_CONTACT.headquartersAddress}</p>
          <p className="mt-4 text-sm text-[#8a9099]">
            Tel{" "}
            <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="text-white hover:text-[#4d9fff]">
              {COMPANY_CONTACT.phone}
            </a>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[#8a9099]">
            Global headquarters: {COMPANY_CONTACT.globalLegalName} — {COMPANY_CONTACT.globalHeadquartersAddress} — Tel{" "}
            <a href={companyPhoneHref(COMPANY_CONTACT.globalPhone)} className="text-white hover:text-[#4d9fff]">
              {COMPANY_CONTACT.globalPhone}
            </a>
            <span className="mx-2 text-white/30">·</span>
            Fax {COMPANY_CONTACT.globalFax}
          </p>
          <Link
            href={COMPANY_CONTACT.contactPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-8 inline-flex ${btnMarketingLink}`}
          >
            Regional offices &amp; secure inquiry form <span aria-hidden>→</span>
          </Link>
        </div>
      </MarketingSection>

      <MarketingSection className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <p data-reveal-child className="wh-marketing-eyebrow">
          Inquiry form
        </p>
        <h2 data-reveal-child className="wh-marketing-display mt-4 text-2xl text-white sm:text-3xl">
          Share your requirement
        </h2>
        <p data-reveal-child className="wh-marketing-lead mt-4">
          Program, timeline, and deployment context help us route your request to the right specialist.
        </p>
        <div data-reveal-child className="mt-10">
          <Suspense fallback={<p className="text-sm text-[#8a9099]">Loading form…</p>}>
            <ContactEngineeringForm />
          </Suspense>
        </div>
      </MarketingSection>
    </>
  );
}
