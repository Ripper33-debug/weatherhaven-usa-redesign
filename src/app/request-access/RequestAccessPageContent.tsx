"use client";

import Link from "next/link";
import { RequestAccessForm } from "@/components/RequestAccessForm";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { btnMarketingLink } from "@/lib/cta-buttons";

export function RequestAccessPageContent() {
  return (
    <>
      <p className="mx-auto max-w-5xl px-6 pb-2 text-sm text-[#8a9099]">
        General inquiries:{" "}
        <Link href="/contact" className={btnMarketingLink}>
          Contact our team <span aria-hidden>→</span>
        </Link>
      </p>
      <MarketingSection className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div data-reveal-child>
          <RequestAccessForm />
        </div>
      </MarketingSection>
    </>
  );
}
