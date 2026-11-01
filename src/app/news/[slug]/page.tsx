import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getNewsReleaseBySlug } from "@/app/api/_lib/news-releases";
import { V2PageHeader } from "@/components/site/V2PageHeader";
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
    <div className="bg-ink text-snow">
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { href: "/news", label: "News" }, { label: formatNewsDate(release.published_at) }]}
        title={release.title}
        lead={release.summary ?? undefined}
        wide
      />

      <section className="v2-wrap max-w-[860px] py-16 sm:py-24">
        <p className="text-[0.95rem] text-muted">{formatNewsDate(release.published_at)}</p>
        {release.cover_image_url ? (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden bg-hull">
            <Image
              src={release.cover_image_url}
              alt=""
              fill
              unoptimized
              className="v2-photo object-cover"
              sizes="(max-width: 760px) 100vw, 760px"
              priority
            />
          </div>
        ) : null}
        {release.body ? (
          <div className="mt-8 max-w-[66ch] whitespace-pre-wrap text-[1.0625rem] leading-[1.7] text-snow/85">
            {release.body}
          </div>
        ) : release.summary ? (
          <p className="mt-8 max-w-[66ch] text-[1.0625rem] leading-[1.7] text-snow/85">{release.summary}</p>
        ) : null}

        <div className="mt-14 border-t border-line pt-10">
          <Link href="/news" className="v2-link">
            All news
          </Link>
        </div>
      </section>
    </div>
  );
}
