"use client";

import Link from "next/link";
import { useState } from "react";
import { ShelterVisualPanel } from "@/components/home/ShelterVisualPanel";
import type { ShelterViewMode } from "@/lib/shelter-view-mode";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { PlaceholderVideoBand } from "@/components/media/PlaceholderVideo";
import { btnMarketingLink, btnMarketingOutline } from "@/lib/cta-buttons";
import { MarketingStatsCountUp } from "@/components/marketing/MarketingStatsCountUp";
import { COMPANY_CREDIBILITY_LINE, COMPANY_STAT_ROW } from "@/lib/company-facts";
import { homeMissionBandVideo, homeProofBandVideo } from "@/lib/home-video-bands";
import { company } from "@/lib/site";

const DEFAULT_PRODUCT_LINES = [
  { name: "MECC", desc: "Mobile expandable container for camp and maintenance footprints.", href: "/configurable-solutions/mecc" },
  { name: "TRECC", desc: "Tactical rapidly expandable command center and field sustainment.", href: "/configurable-solutions/trecc" },
  { name: "Series 4", desc: "Tensioned-fabric softwall shelters for command and support missions.", href: "/configurable-solutions/series-4" },
  { name: "Airbeam LP", desc: "Low-pressure inflatable airbeam shelters — compact, light, agile, modular.", href: "/configurable-solutions/airbeam-lp" },
  { name: "Endurance", desc: "Cold-weather shelter system for polar and high-latitude operations.", href: "/configurable-solutions/endurance" },
  { name: "HerCon", desc: "Humanitarian relief container packages for disaster response.", href: "/configurable-solutions/hercon" },
] ;

export type HomeProductLine = { name: string; desc: string; href: string };

const VIEW_TABS: { id: ShelterViewMode; label: string }[] = [
  { id: "shelter", label: "Shelter stack" },
  { id: "power", label: "Power & environmental" },
  { id: "field", label: "Field integration" },
];

export function HomeMarketingChapters({ productLines = DEFAULT_PRODUCT_LINES }: { productLines?: HomeProductLine[] }) {
  const [activeView, setActiveView] = useState<ShelterViewMode>("shelter");
  const proofBand = homeProofBandVideo();

  return (
    <>
      <MarketingSection className="bg-[#080a0c] px-5 py-16 sm:px-6 sm:py-36 lg:py-44">
        <div className="mx-auto max-w-[840px] text-center">
          <p data-reveal-child className="wh-marketing-eyebrow">
            Global reach
          </p>
          <h2
            data-reveal-child
            className="wh-marketing-display mt-4 text-[1.75rem] leading-[1.14] text-white sm:mt-6 sm:text-[48px] lg:text-[58px]"
          >
            Built for the world&apos;s most demanding environments.
          </h2>
          <p data-reveal-child className="wh-marketing-lead mx-auto mt-5 max-w-[620px] sm:mt-8">
            Founded in 1981, Weatherhaven deploys rapidly deployable and redeployable shelters to more than 95 countries
            across all seven continents — including remote, harsh, and ecologically sensitive locations.
          </p>
        </div>
      </MarketingSection>

      <PlaceholderVideoBand
        {...homeMissionBandVideo()}
        aspectClass="aspect-[16/9] min-h-[200px] sm:aspect-[21/9] sm:min-h-[320px]"
      />

      <MarketingSection className="bg-[#080a0c] px-5 py-16 sm:px-6 sm:py-32 lg:px-12 lg:py-40">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <p data-reveal-child className="wh-marketing-eyebrow">
              Systems portfolio
            </p>
            <h2
              data-reveal-child
              className="wh-marketing-display mt-4 text-[1.75rem] leading-[1.1] text-white sm:mt-6 sm:text-[36px] lg:text-[52px]"
            >
              Purpose-built for every mission.
            </h2>
            <p data-reveal-child className="mt-8">
              <Link href="/configurable-solutions" className={`${btnMarketingLink} inline-flex`}>
                View all systems <span aria-hidden>→</span>
              </Link>
            </p>
            <ul data-reveal-child className="mt-8 sm:mt-10">
              {productLines.map((line) => (
                <li key={line.name} className="wh-marketing-list-item">
                  <Link href={line.href} className="group flex items-center gap-4 py-4 transition-transform duration-300 sm:gap-6 sm:py-6 sm:hover:translate-x-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-medium text-white sm:text-xl">{line.name}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#8a9099] transition-colors duration-300 group-hover:text-white/75">
                        {line.desc}
                      </p>
                    </div>
                    <span
                      className="shrink-0 text-lg text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-[#4d9fff]"
                      aria-hidden
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-reveal-child>
            <p className="wh-marketing-eyebrow">Interactive preview</p>
            <p className="mt-4">
              <Link href="/mission-solution-builder" className={`${btnMarketingLink} inline-flex`}>
                Build a mission profile
                <span className="transition-transform duration-300 group-hover/link:translate-x-0.5" aria-hidden>
                  →
                </span>
              </Link>
            </p>
            <div className="wh-marketing-panel relative mt-6 overflow-hidden">
              <div
                className="relative aspect-[16/11] w-full min-h-[260px]"
                role="tabpanel"
                id={`shelter-preview-${activeView}`}
                aria-labelledby={`shelter-tab-${activeView}`}
              >
                <ShelterVisualPanel activeView={activeView} className="absolute inset-0" />
              </div>
              <div
                className="wh-mobile-scroll-x -mx-1 flex gap-x-6 gap-y-2 border-t border-white/[0.06] px-5 py-3 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-5 sm:py-4"
                role="tablist"
                aria-label="Shelter preview views"
              >
                {VIEW_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeView === tab.id}
                    aria-controls={`shelter-preview-${tab.id}`}
                    id={`shelter-tab-${tab.id}`}
                    onClick={() => setActiveView(tab.id)}
                    className={`shrink-0 text-xs font-medium tracking-wide transition-colors duration-300 ${
                      activeView === tab.id ? "text-[#4d9fff]" : "text-white/45 hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MarketingSection>

      {proofBand ? (
        <PlaceholderVideoBand
          {...proofBand}
          aspectClass="aspect-[2/1] min-h-[240px] sm:aspect-[21/9] sm:min-h-[300px]"
        />
      ) : null}

      <MarketingSection className="bg-[#0d0f12] px-5 py-16 sm:px-6 sm:py-36">
        <div className="mx-auto max-w-[1100px]">
          <p data-reveal-child className="wh-marketing-eyebrow text-center">
            Proven in the field
          </p>
          <div data-reveal-child className="overflow-visible pt-2">
            <MarketingStatsCountUp stats={COMPANY_STAT_ROW} layout="hero" />
          </div>
          <div data-reveal-child className="wh-marketing-divider mx-auto mt-12 max-w-md sm:mt-20" />
          <p data-reveal-child className="wh-marketing-lead mx-auto mt-8 max-w-[640px] text-center sm:mt-12">
            {company.description}
          </p>
          <p data-reveal-child className="mt-8 text-center text-xs leading-relaxed tracking-wide text-[#8a9099]/80">
            {COMPANY_CREDIBILITY_LINE}
          </p>
        </div>
      </MarketingSection>

      <MarketingSection className="bg-[#080a0c] px-5 py-20 sm:px-6 sm:py-44">
        <div className="mx-auto max-w-[720px] text-center">
          <p data-reveal-child className="wh-marketing-eyebrow">
            Engineering support
          </p>
          <h2
            data-reveal-child
            className="wh-marketing-display mt-4 text-[2rem] leading-[1.08] text-white sm:mt-6 sm:text-[64px] lg:text-[72px]"
          >
            Can we help?
          </h2>
          <p data-reveal-child className="wh-marketing-lead mt-6">
            Talk to an Expert about your requirement.
          </p>
          <div data-reveal-child className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8">
            <Link href="/contact" className={btnMarketingOutline}>
              Contact our team
            </Link>
            <Link href="/configurable-solutions" className={btnMarketingLink}>
              Browse systems
              <span className="transition-transform duration-300 group-hover/link:translate-x-0.5" aria-hidden>
                →
              </span>
            </Link>
          </div>
          <p data-reveal-child className="mt-10 text-sm text-[#8a9099]">
            Response within 48 hours. Technical exchanges matched to program status.
          </p>
        </div>
      </MarketingSection>
    </>
  );
}
