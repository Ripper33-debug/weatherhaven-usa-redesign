/** CDN cover URLs for CMS seeding — keep in sync with product-images.ts and seed SQL. */
export const CMS_SEED_CDN = "https://eiec269001.blob.core.windows.net/site-content";

const cdn = (file: string) => `${CMS_SEED_CDN}/${file}`;

/** Product slug → cover_image_url for catalog_products.data.coverImageUrl */
export const CMS_PRODUCT_COVER_SEEDS: Record<string, string> = {
  ateps: cdn("weatherhaven-military-redeployable.jpg"),
  bmecc: cdn("mecc6.jpg"),
  trecc: cdn("trecc1.jpg"),
  ehmecc: cdn("softshelter8.jpg"),
  mecc: cdn("mecc1.jpg"),
  endurance: cdn("polar-1.jpg"),
  polarhaven: cdn("polar-1.jpg"),
  "polar-chief": cdn("polar-1.jpg"),
  "series-1-5-2": cdn("softshelter6.jpg"),
  "series-4": cdn("softshelter6.jpg"),
  "airbeam-hp": cdn("softshelter6.jpg"),
  rdmss: cdn("weatherhaven-military-redeployable.jpg"),
  "airbeam-lp": cdn("softshelter4.jpg"),
  "mex-26": cdn("expandablecontainer1.jpg"),
  mts: cdn("softshelter5.jpg"),
  hercon: cdn("weatherhaven-medical-redeployable.jpg"),
  "non-expandable-iso-containers": cdn("expandablecontainer1.jpg"),
};

/** News slug → cover_image_url for on-site articles */
export const CMS_NEWS_COVER_SEEDS: Record<string, string> = {
  "weatherhaven-usa-program-update": cdn("weatherhaven-military-redeployable.jpg"),
  "expeditionary-camp-capability-brief": cdn("expandablecontainer1.jpg"),
  "mission-solution-builder-launch": cdn("softshelter6.jpg"),
};

export function cmsProductCoverSeedSlugs(): string[] {
  return Object.keys(CMS_PRODUCT_COVER_SEEDS);
}

export function cmsNewsCoverSeedSlugs(): string[] {
  return Object.keys(CMS_NEWS_COVER_SEEDS);
}
