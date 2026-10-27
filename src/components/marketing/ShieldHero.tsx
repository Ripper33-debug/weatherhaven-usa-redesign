"use client";

import Link from "next/link";
import { HeroMediaBackground } from "@/components/hero/HeroMediaBackground";
import { HeroScrollCue } from "@/components/marketing/HeroScrollCue";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { btnMarketingLink, btnMarketingOutline } from "@/lib/cta-buttons";
import { COMPANY_CREDIBILITY_LINE } from "@/lib/company-facts";
import { company } from "@/lib/site";

type Variant = "home" | "sof";

const COPY: Record<
  Variant,
  { label: string; headline: string; exploreHref: string; exploreLabel: string }
> = {
  home: {
    label: "Deployable Infrastructure",
    headline: "Shelter systems built for anywhere.",
    exploreHref: "/configurable-solutions",
    exploreLabel: "Browse systems",
  },
  sof: {
    label: "Special Operations",
    headline: "Mission-ready shelter for special operations.",
    exploreHref: "/configurable-solutions",
    exploreLabel: "Browse systems",
  },
};

export function ShieldHero({ variant = "home" }: { variant?: Variant }) {
  const copy = COPY[variant];
  const { ref, rootClass } = useScrollReveal({ immediate: true, variant: "fade-up-stagger", staggerMs: 140 });

  return (
    <section className="relative isolate min-h-dvh w-full max-w-full overflow-hidden bg-[#080a0c]">
      <HeroMediaBackground
        variant={variant === "sof" ? "sof" : "home"}
        shieldOverlay
        showParticles={false}
        premium
        sequentialLoop={variant === "home"}
        videoPreload="auto"
      />
      <div
        ref={ref}
        className={`relative z-10 flex min-h-dvh items-center px-5 py-20 sm:px-10 sm:py-32 lg:pl-24 lg:pr-16 ${rootClass}`}
      >
        <div className="max-w-[720px]">
          <p data-reveal-child className="wh-marketing-eyebrow">
            {copy.label}
          </p>
          <h1
            data-reveal-child
            className="wh-marketing-display mt-4 text-[2.25rem] leading-[1.05] text-white sm:mt-6 sm:text-[56px] lg:text-[76px]"
          >
            {copy.headline}
          </h1>
          {variant === "home" ? (
            <>
              <p data-reveal-child className="wh-marketing-lead desktop-only mt-4 max-w-[540px] sm:mt-6">
                {company.description}
              </p>
              <p data-reveal-child className="wh-marketing-lead mobile-only mt-4 max-w-[540px] sm:mt-6">
                Military, medical, and commercial shelter systems — deployed anywhere on Earth.
              </p>
            </>
          ) : null}
          {variant === "home" ? (
            <p
              data-reveal-child
              className="mt-4 hidden max-w-[540px] text-xs font-medium tracking-[0.12em] text-[#8a9099] uppercase sm:mt-5 sm:block"
            >
              {COMPANY_CREDIBILITY_LINE}
            </p>
          ) : null}
          <div data-reveal-child className="mt-8 flex w-full flex-col items-stretch gap-3 sm:mt-12 sm:w-auto sm:flex-row sm:items-center sm:gap-10">
            <Link href={copy.exploreHref} className={`${btnMarketingOutline} w-full justify-center sm:w-auto`}>
              {copy.exploreLabel}
            </Link>
            <Link href="/contact" className={`${btnMarketingLink} justify-center sm:justify-start`}>
              Get in touch
              <span className="transition-transform duration-300 group-hover/link:translate-x-0.5" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
      <HeroScrollCue />
    </section>
  );
}
