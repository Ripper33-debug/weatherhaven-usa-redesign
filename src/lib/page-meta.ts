import type { Metadata } from "next";

const SITE_NAME = "Weatherhaven USA";
/** 1200×630 share card: hero photo, wordmark and headline. */
const DEFAULT_IMAGE = "/og-image.jpg";

/**
 * Search results show about 155 characters of a description; longer page summaries are cut at a word
 * boundary so the snippet ends cleanly instead of mid-word.
 */
export function metaDescription(text: string, max = 158): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:.\s–—-]+$/, "")}…`;
}

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
  description = metaDescription(description);
  const custom = image?.trim();
  const img = custom || DEFAULT_IMAGE;
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
      // Only the default card is known to be 1200×630; page photos keep their own size.
      images: [custom ? { url: img, alt: imageAlt ?? title } : { url: img, width: 1200, height: 630, alt: imageAlt ?? title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [img],
    },
  };
}
