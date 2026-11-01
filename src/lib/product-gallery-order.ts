/**
 * Photo order for the public product pages: the strongest field photos first, workshop and
 * assembly shots last. Paths not listed keep their place in between. Chosen by eye from the
 * media library (Nov 2026); revisit when new photography arrives.
 */
const GALLERY_ORDER: Record<string, { lead: string[]; tail?: string[] }> = {
  trecc: {
    lead: [
      "/products/trecc/gallery/08-TRECC-and-Car.jpg",
      "/products/trecc/gallery/06-TRECC-3.jpg",
      "/products/trecc/gallery/07-TRECC-4.jpg",
      "/products/trecc/gallery/05-TRECC-2.jpg",
      "/products/trecc/gallery/09-Trecc-Woods.jpg",
      "/products/trecc/gallery/04-TRECC-1.jpg",
      "/products/trecc/gallery/13-TRECC-in-UK.png",
    ],
    tail: [
      "/products/trecc.jpg",
      "/products/trecc/gallery/01-75201221940__07AE5758-08F8-4C54-B2F6-355C5AFFE9C5.jpg",
      "/products/trecc/gallery/02-75201223366__29637475-633E-4782-BD7D-40B176E4B1DE.jpg",
      "/products/trecc/gallery/10-TRECC-T_deployed.jpg",
      "/products/trecc/gallery/11-TRECC-T_interior_green_light_02.jpg",
    ],
  },
  mecc: {
    lead: [
      "/products/mecc/gallery/20-MIL-MECC-7.jpg",
      "/products/mecc/gallery/05-IMG_1171.jpg",
      "/products/mecc/gallery/21-MIL-MECC-OfficeExt.jpg",
      "/products/mecc/gallery/10-MECC_deployed_exterior_overview.jpg",
      "/products/mecc/gallery/15-MECC_ramp_personnel_door_configuration.jpg",
      "/products/mecc/gallery/09-MCC.8A.KK.jpg",
      "/products/mecc/gallery/07-MCC-9A--KK.jpg",
    ],
    tail: [
      "/products/mecc/gallery/01-cor-MECC-FullyAssembled.jpg",
      "/products/mecc/gallery/02-Expanding-1.jpg",
      "/products/mecc/gallery/03-Expanding-2.jpg",
      "/products/mecc/gallery/04-Expanding-3.jpg",
      "/products/mecc/gallery/06-MCC-2A-AW.jpg",
      "/products/mecc/gallery/08-MCC-16A-AM.jpg",
    ],
  },
  ehmecc: {
    lead: [
      "/products/ehmecc/gallery/08-EHMECC.jpg",
      "/products/ehmecc/gallery/14-NATO_EHMECCs.jpg",
      "/products/ehmecc/gallery/04-EHMECC-Vehicle.jpg",
      "/products/ehmecc/gallery/05-EHMECC_MECC_deployed.jpg",
      "/products/ehmecc/gallery/13-NATO_EHMECCs_deployed.jpg",
      "/products/ehmecc/gallery/15-Petawawa-copy.jpg",
    ],
    tail: [
      "/products/ehmecc/gallery/01-EH-EXTERIOR.jpg",
      "/products/ehmecc/gallery/12-NATO_EHMECC.jpg",
      "/products/ehmecc/gallery/10-MIL-TRECC-EHMECC.jpg",
      "/products/ehmecc/gallery/09-MECC-and-EHMECC.jpg",
    ],
  },
  ateps: {
    lead: [
      "/products/ateps/gallery/01-ATEPS-2.jpg",
      "/products/ateps/gallery/04-ATEPS-5.jpg",
      "/products/ateps/gallery/03-ATEPS-4.jpg",
      "/products/ateps/gallery/02-ATEPS-3.jpg",
      "/products/ateps/gallery/05-ATEPS-6.jpg",
      "/products/ateps/gallery/07-ATEPS-8.jpg",
    ],
    tail: [
      "/products/ateps/gallery/13-ATEPS-Closed-PNG.jpg",
      "/products/ateps/gallery/14-ATEPS-Open-PNG.jpg",
      "/products/ateps/gallery/12-ATEPS-Closed-2.jpg",
      "/products/ateps/gallery/11-ATEPS-Closed-1.jpg",
    ],
  },
  hercon: {
    lead: [
      "/products/hercon.jpg",
      "/products/hercon/gallery/01-BAC-Ablution-HERCon-Deployed-(8).jpg",
      "/products/hercon/gallery/02-BAC-Ablution-HERCon-Deployed-(10).jpg",
      "/products/hercon/gallery/16-com-HERcon-Deploy8.jpg",
      "/products/hercon/gallery/13-com-HERcon-Deploy5.jpg",
      "/products/hercon/gallery/29-com-HERcon8.jpg",
    ],
    tail: [
      "/products/hercon/gallery/06-com-BrazilHERCon2.jpg",
      "/products/hercon/gallery/07-com-BrazilHERCon3.jpg",
      "/products/hercon/gallery/21-com-HERcon.jpg",
      "/products/hercon/gallery/22-com-HERcon1.jpg",
      "/products/hercon/gallery/23-com-HERcon2.jpg",
      "/products/hercon/gallery/24-com-HERcon3.jpg",
      "/products/hercon/gallery/25-com-HERcon4.jpg",
      "/products/hercon/gallery/26-com-HERcon5.jpg",
      "/products/hercon/gallery/27-com-HERcon6.jpg",
    ],
  },
  "series-4": {
    lead: [
      "/products/series-4/gallery/02-com-S4-PrimerCamp.PlacerDome150.jpg",
      "/products/series-4/gallery/01-com-S4-PlacerDome151.jpg",
      "/products/series-4/gallery/12-S4-Truss-Little-Dome-EPICA-1.jpeg",
      "/products/series-4/gallery/13-S4-Truss-Little-Dome-EPICA-2.jpeg",
      "/products/series-4/gallery/11-MIL-S4.jpg",
      "/products/series-4/gallery/20-Series-4-Truss.jpg",
      "/products/series-4/gallery/17-S4Truss.jpg",
    ],
    tail: [
      "/products/series-4.jpg",
      "/products/series-4/gallery/06-cor-BrazilTropicalInterior.jpg",
      "/products/series-4/gallery/07-DSC_3927.jpg",
      "/products/series-4/gallery/08-DSC_3928.jpg",
      "/products/series-4/gallery/09-DSC_3929.jpg",
      "/products/series-4/gallery/10-DSC_3934.jpg",
      "/products/series-4/gallery/14-S4-Truss-Little-Dome-EPICA-3.jpeg",
      "/products/series-4/gallery/16-S4-with-stove-pipe-flange-and-collar.jpg",
      "/products/series-4/gallery/18-Series-4-Truss-Frame.jpg",
    ],
  },
  mts: {
    lead: [
      "/products/mts/gallery/14-MIL-MTS2Exterior.jpg",
      "/products/mts/gallery/16-Pic-1-MTS-with-solarshade.jpg",
      "/products/mts/gallery/12-IMG_3212.jpg",
      "/products/mts/gallery/15-MTS-Side2.jpg",
      "/products/mts/gallery/13-IMG_3215.jpg",
    ],
  },
  "airbeam-lp": {
    lead: [
      "/products/airbeam-lp/gallery/08-Airbeam-Low-Pressure-9.jpg",
      "/products/airbeam-lp/gallery/13-Airbeam-Low-Pressure-14.jpg",
      "/products/airbeam-lp/gallery/11-Airbeam-Low-Pressure-12.jpg",
      "/products/airbeam-lp/gallery/14-Airbeam-Low-Pressure-15.jpg",
      "/products/airbeam-lp/gallery/23-Airbeam-Low-Pressure-24.jpg",
      "/products/airbeam-lp/gallery/09-Airbeam-Low-Pressure-10.jpg",
      "/products/airbeam-lp/gallery/12-Airbeam-Low-Pressure-13.jpg",
      "/products/airbeam-lp/gallery/17-Airbeam-Low-Pressure-18.jpg",
    ],
    tail: [
      "/products/airbeam-lp/gallery/02-Airbeam-Low-Pressure-3.jpg",
      "/products/airbeam-lp/gallery/04-Airbeam-Low-Pressure-5.jpg",
      "/products/airbeam-lp/gallery/05-Airbeam-Low-Pressure-6.jpg",
      "/products/airbeam-lp/gallery/06-Airbeam-Low-Pressure-7.jpg",
      "/products/airbeam-lp/gallery/07-Airbeam-Low-Pressure-8.jpg",
      "/products/airbeam-lp/gallery/03-Airbeam-Low-Pressure-4.jpg",
      "/products/airbeam-lp/gallery/18-Airbeam-Low-Pressure-19.jpg",
      "/products/airbeam-lp/gallery/10-Airbeam-Low-Pressure-11.jpg",
      "/products/airbeam-lp/gallery/16-Airbeam-Low-Pressure-17.jpg",
    ],
  },
  "non-expandable-iso-containers": {
    lead: [
      "/products/non-expandable-iso-containers/gallery/05-Quad-con-packup.jpg",
      "/products/non-expandable-iso-containers/gallery/04-Non-Expandable-Container-Morgue-Outside.jpg",
      "/products/non-expandable-iso-containers.jpg",
    ],
  },
  bmecc: {
    lead: [
      "/products/bmecc/gallery/01-BMECC-2.jpg",
      "/products/bmecc.jpg",
      "/products/bmecc/gallery/03-BMECC-Closed.jpg",
    ],
    tail: [
      "/products/bmecc/gallery/02-BMECC-Chart.jpg",
    ],
  },
  "mex-26": {
    lead: [
      "/products/mex-26/gallery/01-MIL-MEX&TEMS2.jpg",
      "/products/mex-26.jpg",
    ],
  },
};

/** Reorders a product page's photos: listed leads first (in order), listed tails last. */
export function orderProductGallery(slug: string, urls: readonly string[]): string[] {
  const order = GALLERY_ORDER[slug];
  if (!order) return [...urls];
  const present = new Set(urls);
  const lead = order.lead.filter((u) => present.has(u));
  const tail = (order.tail ?? []).filter((u) => present.has(u) && !lead.includes(u));
  const placed = new Set([...lead, ...tail]);
  return [...lead, ...urls.filter((u) => !placed.has(u)), ...tail];
}
