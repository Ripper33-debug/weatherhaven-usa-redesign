"use client";

import Link from "next/link";
import { PageHero } from "@/components/site/PageHero";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { EventsSchedule } from "@/components/events/EventsSchedule";
import { NewsReleaseList } from "@/components/news/NewsReleaseList";
import { btnMarketingLink, btnMarketingPrimary } from "@/lib/cta-buttons";
import { partitionCompanyEvents, relatedNewsSlugsFromEvents, type CompanyEventRow } from "@/lib/company-events";
import { COMPANY_CONTACT } from "@/lib/company-facts";
import type { NewsReleaseRow } from "@/lib/news-releases";

type Props = {
  events: CompanyEventRow[];
  newsReleases: NewsReleaseRow[];
};

export function EventsPageContent({ events, newsReleases }: Props) {
  const { upcoming, onDemand, past } = partitionCompanyEvents(events);
  const relatedSlugs = relatedNewsSlugsFromEvents(events);
  const newsBySlug = Object.fromEntries(newsReleases.map((row) => [row.slug, row]));
  const relatedNews = newsReleases.filter(
    (row) => relatedSlugs.includes(row.slug) || row.slug.includes("brief") || row.slug.includes("capability"),
  );
  const generalNews = newsReleases.filter((row) => !relatedNews.some((r) => r.id === row.id)).slice(0, 3);

  return (
    <div className="bg-[#080a0c] text-white">
      <PageHero
        label="Events & briefings"
        title="Meet Weatherhaven where your programs are."
        description="Scheduled capability briefings, virtual walkthroughs, and trade-show follow-up — tied to program news and engineering support."
      />

      <MarketingSection className="mx-auto max-w-[960px] px-5 py-14 sm:px-6 sm:py-24">
        <EventsSchedule upcoming={upcoming} onDemand={onDemand} past={past} newsBySlug={newsBySlug} />

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.08] pt-10 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/contact" className={btnMarketingPrimary}>
            Contact our team
          </Link>
          <Link href="/mission-solution-builder" className={btnMarketingLink}>
            Try Mission Solution Builder <span aria-hidden>→</span>
          </Link>
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-white/[0.08] bg-[#0d0f12] px-5 py-14 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[960px]">
          <p data-reveal-child className="wh-marketing-eyebrow">
            How we engage
          </p>
          <ul data-reveal-child className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
            <li className="border-l border-[#4d9fff]/30 pl-5 sm:pl-6">
              <p className="text-lg text-white sm:text-xl">Trade show support</p>
              <p className="wh-marketing-lead mt-2 text-base">
                Booth-ready narratives and routing for deeper technical exchange after the event.
              </p>
            </li>
            <li className="border-l border-[#4d9fff]/30 pl-5 sm:pl-6">
              <p className="text-lg text-white sm:text-xl">Capability briefings</p>
              <p className="wh-marketing-lead mt-2 text-base">
                Closed-door walkthroughs aligned to program requirements and export posture.
              </p>
            </li>
            <li className="border-l border-[#4d9fff]/30 pl-5 sm:pl-6">
              <p className="text-lg text-white sm:text-xl">Program follow-up</p>
              <p className="wh-marketing-lead mt-2 text-base">
                Structured intake through contact channels — US office{" "}
                <a href={`tel:${COMPANY_CONTACT.phone.replace(/[^\d+]/g, "")}`} className="text-white hover:text-[#4d9fff]">
                  {COMPANY_CONTACT.phone}
                </a>
                .
              </p>
            </li>
          </ul>
        </div>
      </MarketingSection>

      <MarketingSection className="border-t border-white/[0.08] px-5 py-14 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-[960px]">
          <div data-reveal-child className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="wh-marketing-eyebrow">Related program news</p>
              <p className="mt-2 text-sm text-[#8a9099]">
                Briefings and releases connected to the sessions above.
              </p>
            </div>
            <Link href="/news" className={btnMarketingLink}>
              All news & releases <span aria-hidden>→</span>
            </Link>
          </div>
          <div data-reveal-child className="mt-8">
            <NewsReleaseList releases={relatedNews.length > 0 ? relatedNews : newsReleases.slice(0, 5)} compact />
          </div>
          {generalNews.length > 0 ? (
            <>
              <p data-reveal-child className="wh-marketing-eyebrow mt-12">
                More updates
              </p>
              <div data-reveal-child className="mt-6">
                <NewsReleaseList releases={generalNews} compact />
              </div>
            </>
          ) : null}
        </div>
      </MarketingSection>
    </div>
  );
}
