/**
 * Best available local photo per system for cards and menus.
 * Three systems have no photo of their own in the media library yet (Airmax HP, RDMSS,
 * Series 1.5 & 2) and use a representative image from the same family — replace when
 * product photography is available.
 */
export const PRODUCT_COVERS: Record<string, { src: string; representative?: boolean; shows?: string; note?: string }> = {
  mecc: { src: "/products/mecc/gallery/20-MIL-MECC-7.jpg" },
  ehmecc: { src: "/products/ehmecc/gallery/14-NATO_EHMECCs.jpg" },
  trecc: { src: "/products/trecc/gallery/06-TRECC-3.jpg" },
  bmecc: { src: "/products/bmecc/gallery/01-BMECC-2.jpg" },
  ateps: { src: "/products/ateps/gallery/01-ATEPS-2.jpg" },
  hercon: { src: "/products/hercon/gallery/01-BAC-Ablution-HERCon-Deployed-(8).jpg" },
  "non-expandable-iso-containers": { src: "/products/non-expandable-iso-containers/gallery/05-Quad-con-packup.jpg" },
  // No RDMSS photo yet: the card shows the RDMSS 3D model rather than another shelter's photo.
  rdmss: { src: "/models/rdmss/rdmss-poster-deployed.jpg", note: "3D model" },
  "series-4": { src: "/products/series-4/gallery/01-com-S4-PlacerDome151.jpg" },
  mts: { src: "/products/mts/gallery/14-MIL-MTS2Exterior.jpg" },
  "mex-26": { src: "/products/mex-26.jpg" },
  "series-1-5-2": { src: "/products/series-4/gallery/07-DSC_3927.jpg", representative: true, shows: "a Series 4 shelter" },
  "airbeam-lp": { src: "/products/airbeam-lp/gallery/13-Airbeam-Low-Pressure-14.jpg" },
  "airbeam-hp": { src: "/products/softwall-medical.jpg", representative: true, shows: "an Airmax LP interior" },
  polarhaven: { src: "/products/polarhaven.jpg" },
  "polar-chief": { src: "/products/polar-chief.jpg" },
  endurance: { src: "/products/endurance.jpg" },
};

/** What a card says about its image when it isn't a photo of that system. */
export function productCoverNote(slug: string): string | null {
  const c = PRODUCT_COVERS[slug];
  if (!c) return null;
  if (c.note) return c.note;
  return c.representative && c.shows ? `Photo shows ${c.shows}` : null;
}

export function productCover(slug: string, cmsCover?: string): string {
  if (cmsCover?.trim()) return cmsCover.trim();
  return PRODUCT_COVERS[slug]?.src ?? "/products/ehmecc.jpg";
}
