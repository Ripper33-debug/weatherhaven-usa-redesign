"use client";

import Link from "next/link";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import type { CTAProps } from "@/components/CTA";

export function MarketingCtaSection({ title, description, primary, secondary }: CTAProps) {
  return (
    <MarketingSection className="border-t border-white/[0.08] bg-[#080a0c] py-20 sm:py-28">
      <div className="mx-auto max-w-3xl">
        <h2 data-reveal-child className="wh-marketing-display text-3xl leading-[1.05] text-white sm:text-4xl lg:text-[44px]">
          {title}
        </h2>
        {description && (
          <p data-reveal-child className="wh-marketing-lead mt-6">
            {description}
          </p>
        )}
        <div data-reveal-child className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link href={primary.href} className={btnMarketingPrimary}>
            {primary.label}
          </Link>
          {secondary && (
            <Link href={secondary.href} className={btnMarketingOutline}>
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </MarketingSection>
  );
}
