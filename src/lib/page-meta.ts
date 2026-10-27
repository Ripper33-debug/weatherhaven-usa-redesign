import type { Metadata } from "next";

const SITE_NAME = "Weatherhaven USA";
const DEFAULT_IMAGE = "/hero/hero-poster.jpg";

/**
 * Complete per-page metadata: title, description, canonical URL and matching Open Graph /
 * Twitter cards, so shared links show the page itself rather than the homepage.
 */
export function pageMeta({
  title,
  description,
  path,
  image,
  imageAlt,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  imageAlt?: string;
}): Metadata {
  const img = image?.trim() || DEFAULT_IMAGE;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      images: [{ url: img, width: 1200, height: 630, alt: imageAlt ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [img],
    },
  };
}
