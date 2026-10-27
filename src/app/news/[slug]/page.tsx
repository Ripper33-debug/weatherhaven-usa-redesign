import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getNewsReleaseBySlug } from "@/app/api/_lib/news-releases";
import { PageHero } from "@/components/site/PageHero";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { btnMarketingLink } from "@/lib/cta-buttons";
import { formatNewsDate, isExternalNewsLink } from "@/lib/news-releases";
import { shareMetadataFromImage } from "@/lib/share-metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const release = await getNewsReleaseBySlug(slug);
  if (!release || release.status !== "published") {
    return { title: "News release" };
  }
  return {
    title: release.title,
    description: release.summary ?? release.title,
    ...shareMetadataFromImage(release.cover_image_url, release.title),
  };
}

export default async function NewsReleasePage({ params }: Props) {
  const { slug } = await params;
  const release = await getNewsReleaseBySlug(slug);

  if (!release || release.status !== "published") {
    notFound();
  }

  if (isExternalNewsLink(release)) {
    redirect(release.external_url!);
  }

  return (
    <div className="bg-[#080a0c] text-white">
      <PageHero
        label="News release"
        title={release.title}
        description={release.summary ?? undefined}
      />

      <MarketingSection className="mx-auto max-w-[760px] px-6 py-16 sm:py-20">
        <p className="text-xs tracking-wide text-[#8a9099]">{formatNewsDate(release.published_at)}</p>
        {release.cover_image_url ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden border border-white/[0.08]">
            <Image
              src={release.cover_image_url}
              alt=""
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 760px) 100vw, 760px"
              priority
            />
          </div>
        ) : null}
        {release.body ? (
          <div className="prose-invert mt-8 whitespace-pre-wrap text-base leading-relaxed text-[#c8ccd2]">
            {release.body}
          </div>
        ) : release.summary ? (
          <p className="mt-8 text-base leading-relaxed text-[#c8ccd2]">{release.summary}</p>
        ) : null}

        <div className="mt-14 border-t border-white/[0.08] pt-10">
          <Link href="/news" className={btnMarketingLink}>
            ← All news
          </Link>
        </div>
      </MarketingSection>
    </div>
  );
}
