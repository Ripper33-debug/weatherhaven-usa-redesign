import { getProductImage, getProductGalleryUrls } from "@/lib/product-images";
import manifest from "@/lib/product-gallery-manifest.json";

export type LocalProductImages = {
  cover?: string;
  gallery: string[];
};

type GalleryManifest = Record<string, LocalProductImages>;

const GALLERY_MANIFEST = manifest as GalleryManifest;

function getLocalProductImages(slug: string): LocalProductImages {
  return GALLERY_MANIFEST[slug] ?? { gallery: [] };
}

/** Additional images under /public/products/{slug}/gallery/ (from build manifest). */
export function listProductGalleryImages(slug: string): string[] {
  return getLocalProductImages(slug).gallery;
}

export function mergeProductDetailImages(
  slug: string,
  local: LocalProductImages,
  cms?: { coverImageUrl?: string; galleryImageUrls?: string[] },
): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const push = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    urls.push(trimmed);
  };

  if (local.cover) push(local.cover);
  for (const galleryUrl of local.gallery) {
    push(galleryUrl);
  }

  const cover = cms?.coverImageUrl?.trim();
  if (cover) push(cover);

  for (const raw of cms?.galleryImageUrls ?? []) {
    const url = raw?.trim();
    if (url) push(url);
  }

  for (const url of getProductGalleryUrls(slug)) {
    push(url);
  }

  if (urls.length === 0) {
    const cdn = getProductImage(slug)?.src;
    if (cdn) push(cdn);
  }

  return urls;
}

/** Cover + gallery + CMS + CDN fallback for product detail pages. */
export function getProductDetailImages(
  slug: string,
  cms?: { coverImageUrl?: string; galleryImageUrls?: string[] },
): string[] {
  return mergeProductDetailImages(slug, getLocalProductImages(slug), cms);
}
