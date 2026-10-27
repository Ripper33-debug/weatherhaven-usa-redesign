/** Optional still image for catalog cards — used when no CMS cover override is set. */
export const PRODUCT_CARD_IMAGES: Partial<Record<string, string>> = {
  trecc: "/products/trecc/gallery/13-TRECC-in-UK.png",
};

export function getProductCardImage(slug: string): string | undefined {
  return PRODUCT_CARD_IMAGES[slug];
}
