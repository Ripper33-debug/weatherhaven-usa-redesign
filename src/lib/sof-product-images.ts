import { getProductDetailImages } from "@/lib/product-gallery";
import { getProductCardImage } from "@/lib/product-card-images";
import { cdn } from "@/lib/product-images";

const TRECC_ALT = "Weatherhaven TRECC rapidly deployed container in the field";

/** Imagery for SOF-restricted catalog (representative until program-specific assets are cleared). */
export const SOF_PRODUCT_IMAGES: Record<string, { src: string; alt: string }> = {
  clam: {
    src: "/sof/clam.jpg",
    alt: "CLAM compact lightweight adaptable module in arctic deployment with winter camouflage shelters",
  },
  "specter-c2": {
    src: cdn("softshelter6.jpg"),
    alt: "Specter C2 low-signature command shelter module",
  },
  "shadow-cache": {
    src: cdn("weatherhaven-military-redeployable.jpg"),
    alt: "Shadow Cache pre-positioned sustainment shelter system",
  },
  "reaper-lc": {
    src: cdn("softshelter8.jpg"),
    alt: "Reaper LC long-cycle special operations shelter envelope",
  },
};

/** Same photo set as the public /configurable-solutions/trecc product page. */
export function getSofTreccGalleryImages(): string[] {
  return getProductDetailImages("trecc");
}

export function getSofProductImage(slug: string): { src: string; alt: string } | undefined {
  if (slug === "trecc") {
    const images = getSofTreccGalleryImages();
    return {
      src: getProductCardImage("trecc") ?? images[0] ?? "/products/trecc.jpg",
      alt: TRECC_ALT,
    };
  }
  return SOF_PRODUCT_IMAGES[slug];
}
