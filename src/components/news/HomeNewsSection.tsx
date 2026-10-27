import Link from "next/link";
import { listNewsReleases } from "@/app/api/_lib/news-releases";
import { NewsReleaseList } from "@/components/news/NewsReleaseList";
import { btnMarketingLink } from "@/lib/cta-buttons";

export async function HomeNewsSection() {
  const releases = await listNewsReleases({ publishedOnly: true, limit: 3 });
  if (releases.length === 0) return null;

  return (
    <section
      className="w-full max-w-full overflow-hidden border-b border-white/[0.08] bg-[#080a0c]"
      aria-labelledby="home-news-heading"
    >
      <div className="mx-auto max-w-[900px] px-5 py-12 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="wh-marketing-eyebrow">News & releases</p>
            <h2 id="home-news-heading" className="wh-marketing-display mt-3 text-2xl text-white sm:text-3xl">
              Program updates and company news
            </h2>
          </div>
          <Link href="/news" className={btnMarketingLink}>
            All news <span aria-hidden>→</span>
          </Link>
        </div>
        <NewsReleaseList releases={releases} compact />
      </div>
    </section>
  );
}
