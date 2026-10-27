import type { Metadata } from "next";
import Link from "next/link";
import { listNewsReleases } from "@/app/api/_lib/news-releases";
import { NewsReleaseList } from "@/components/news/NewsReleaseList";
import { PageHero } from "@/components/site/PageHero";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { btnMarketingLink, btnMarketingPrimary } from "@/lib/cta-buttons";

export const metadata: Metadata = {
  title: "News & Releases",
  description:
    "Company news, program updates, and press releases from Weatherhaven deployable shelter systems.",
};

export const revalidate = 300;

export default async function NewsPage() {
  const releases = await listNewsReleases({ publishedOnly: true });

  return (
    <div className="bg-[#080a0c] text-white">
      <PageHero
        label="News & releases"
        title="Updates from Weatherhaven."
        description="Program milestones, partnerships, and company news — published here as releases go live."
      />

      <MarketingSection className="mx-auto max-w-[900px] px-6 py-16 sm:py-24">
        <NewsReleaseList releases={releases} />

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.08] pt-10 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/events" className={btnMarketingLink}>
            Events & briefings <span aria-hidden>→</span>
          </Link>
          <Link href="/contact" className={btnMarketingPrimary}>
            Contact our team
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
