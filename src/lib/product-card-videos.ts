export type ProductCardVideo = {
  src: string;
  label: string;
};

/** Optional cinematic loop for catalog cards and product detail galleries — keyed by product slug. */
export const PRODUCT_CARD_VIDEOS: Partial<Record<string, ProductCardVideo>> = {
  trecc: {
    src: "/products/trecc-card.mp4",
    label: "TRECC deployment cinematic",
  },
};

export function getProductCardVideo(slug: string): ProductCardVideo | undefined {
  return PRODUCT_CARD_VIDEOS[slug];
}
