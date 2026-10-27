import { LEGACY_PRODUCT_SLUG_REDIRECTS } from "@/lib/weatherhaven-product-lines";

/** Official Weatherhaven product photography (weatherhaven.com CDN). */
export const WEATHERHAVEN_CDN = "https://eiec269001.blob.core.windows.net/site-content";

export type ProductImageSource = {
  /** Remote URL on Weatherhaven CDN */
  src: string;
  /** Optional local override: /public/products/[slug].jpg (+ /gallery/ on detail pages) */
  localPath?: string;
  alt: string;
};

const cdn = (file: string) => `${WEATHERHAVEN_CDN}/${file}`;

export { cdn };

/** Primary hero image per canonical catalog slug — sourced from weatherhaven.com product pages. */
export const PRODUCT_IMAGES: Record<string, ProductImageSource> = {
  ateps: {
    src: cdn("weatherhaven-military-redeployable.jpg"),
    alt: "Weatherhaven ATEPS deployable camp power system",
  },
  bmecc: {
    src: cdn("mecc6.jpg"),
    alt: "Weatherhaven BMECC expandable container shelter",
  },
  trecc: {
    src: cdn("trecc1.jpg"),
    alt: "Weatherhaven TRECC rapidly deployed container in the field",
  },
  ehmecc: {
    src: cdn("softshelter8.jpg"),
    alt: "Weatherhaven EHMECC extended-height command shelter",
  },
  mecc: {
    src: cdn("mecc1.jpg"),
    alt: "Weatherhaven MECC mobile expandable container configuration deployed",
  },
  endurance: {
    src: cdn("polar-1.jpg"),
    alt: "Weatherhaven Endurance cold-weather shelter system",
  },
  polarhaven: {
    src: cdn("polar-1.jpg"),
    alt: "Weatherhaven Polarhaven polar shelter system",
  },
  "polar-chief": {
    src: cdn("polar-1.jpg"),
    alt: "Weatherhaven Polar Chief polar command shelter",
  },
  "series-1-5-2": {
    src: cdn("softshelter6.jpg"),
    alt: "Weatherhaven Series 1.5 and 2 tensioned-fabric shelter",
  },
  "series-4": {
    src: cdn("softshelter6.jpg"),
    alt: "Weatherhaven Series 4 tensioned-fabric softwall shelter",
  },
  "airbeam-hp": {
    src: cdn("softshelter6.jpg"),
    alt: "Weatherhaven Airbeam HP high-pressure inflatable shelter",
  },
  rdmss: {
    src: cdn("weatherhaven-military-redeployable.jpg"),
    alt: "Weatherhaven RDMSS rapid-deploy modular shelter system",
  },
  "airbeam-lp": {
    src: cdn("softshelter4.jpg"),
    alt: "Weatherhaven Airbeam LP low-pressure inflatable shelter",
  },
  "mex-26": {
    src: cdn("expandablecontainer1.jpg"),
    alt: "Weatherhaven MEX-26 expandable ISO shelter",
  },
  mts: {
    src: cdn("softshelter5.jpg"),
    alt: "Weatherhaven MTS maintenance transit shelter",
  },
  hercon: {
    src: cdn("weatherhaven-medical-redeployable.jpg"),
    alt: "Weatherhaven HerCon humanitarian relief container",
  },
  "non-expandable-iso-containers": {
    src: cdn("expandablecontainer1.jpg"),
    alt: "Weatherhaven non-expandable ISO container shelter modules",
  },
};

/** Extra gallery URLs when no local /public/products/{slug}/gallery/ set exists. */
export const PRODUCT_GALLERY_IMAGES: Partial<Record<string, string[]>> = {};

export function getProductGalleryUrls(slug: string): string[] {
  return PRODUCT_GALLERY_IMAGES[slug] ?? [];
}

function resolveCanonicalImageSlug(slug: string): string {
  return LEGACY_PRODUCT_SLUG_REDIRECTS[slug] ?? slug;
}

export function getProductImage(slug: string): ProductImageSource | undefined {
  return PRODUCT_IMAGES[resolveCanonicalImageSlug(slug)];
}

export function getProductImageUrl(slug: string): string | undefined {
  const entry = getProductImage(slug);
  if (!entry) return undefined;
  const canonical = resolveCanonicalImageSlug(slug);
  return `/products/${canonical}.jpg`;
}

/** Prefer bundled local file when present; otherwise CDN. */
export function resolveProductImageSrc(slug: string, preferLocal = true): string | undefined {
  const entry = getProductImage(slug);
  if (!entry) return undefined;
  const canonical = resolveCanonicalImageSlug(slug);
  if (preferLocal) return `/products/${canonical}.jpg`;
  return entry.src;
}
