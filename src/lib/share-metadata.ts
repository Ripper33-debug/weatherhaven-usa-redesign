import type { Metadata } from "next";
import { getProductImage } from "@/lib/product-images";
import type { Product } from "@/lib/products";

/** Best share/OG image for a catalog product (CMS → CDN → local path). */
export function resolveProductShareImageUrl(product: Product): string {
  const cms = product.coverImageUrl?.trim();
  if (cms) return cms;
  const cdn = getProductImage(product.slug)?.src;
  if (cdn) return cdn;
  return `/products/${product.slug}.jpg`;
}

export function shareMetadataFromImage(
  imageUrl: string | null | undefined,
  alt: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  const url = imageUrl?.trim();
  if (!url) return {};

  return {
    openGraph: {
      images: [{ url, width: 1200, height: 630, alt }],
    },
    twitter: {
      card: "summary_large_image",
      images: [url],
    },
  };
}
