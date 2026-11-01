/**
 * One photograph per buyer, for the who-we-serve list and the top of each buyer's page. Each shows
 * a system that buyer uses; the caption says which, since the photo isn't of the buyer's own site.
 */
export type SegmentPhoto = {
  src: string;
  alt: string;
  caption: string;
  position?: string;
  /** A wider photograph for the band at the top of the buyer's page, when the card photo crops badly. */
  band?: { src: string; alt: string; caption: string; position?: string };
};

/** The photograph for the band at the top of a buyer's page. */
export function segmentBand(slug: string): Omit<SegmentPhoto, "band"> | undefined {
  const p = SEGMENT_PHOTOS[slug];
  return p?.band ?? p;
}

export const SEGMENT_PHOTOS: Record<string, SegmentPhoto> = {
  "us-army": {
    src: "/products/trecc/gallery/08-TRECC-and-Car.jpg",
    alt: "A stowed TRECC on its trailer behind a JLTV on frosty ground, mountains behind",
    caption: "A stowed TRECC on its trailer, behind a JLTV.",
    position: "50% 62%",
  },
  "air-force": {
    src: "/products/arctic-package/gallery/07-03_com-Polar-Chief-McMurdo164.jpg",
    alt: "A red and white Polar Chief shelter on flat ice under a deep blue sky, people and snowmobiles beside it",
    caption: "A Polar Chief on the ice at McMurdo.",
    position: "50% 62%",
  },
  "special-operations": {
    src: "/products/trecc/gallery/06-TRECC-3.jpg",
    alt: "Two TRECCs in a forest clearing with an armoured vehicle behind them",
    caption: "Two TRECCs in the field, one expanded.",
    position: "50% 55%",
  },
  "nato-allies": {
    src: "/products/ehmecc/gallery/11-NATO_EHMECC_02.jpg",
    alt: "A tan EHMECC expandable container, deployed, its end door open",
    caption: "An EHMECC built for NATO.",
    position: "50% 55%",
    band: {
      src: "/products/ehmecc/gallery/13-NATO_EHMECCs_deployed.jpg",
      alt: "A row of deployed EHMECC expandable containers on a paved lot",
      caption: "EHMECCs deployed for NATO.",
      position: "50% 50%",
    },
  },
  canada: {
    src: "/products/mex-26.jpg",
    alt: "Green MEX-26 clear-span maintenance shelters beside a road, trees behind",
    caption: "MEX-26 maintenance shelters.",
    position: "50% 55%",
  },
  "emergency-medical": {
    src: "/products/airbeam-lp/gallery/09-Airbeam-Low-Pressure-10.jpg",
    alt: "A green Airmax LP inflatable shelter on a mown lawn",
    caption: "An Airmax LP inflatable shelter.",
    position: "50% 60%",
  },
  "polar-research": {
    src: "/products/series-4/gallery/12-S4-Truss-Little-Dome-EPICA-1.jpeg",
    alt: "A long white Series 4 truss shelter with orange end bands on the Antarctic ice, two people in red cold-weather gear beside it",
    caption: "The Series 4 drill shelter at Little Dome C.",
    position: "50% 55%",
  },
  "industrial-camps": {
    src: "/products/series-4/gallery/01-com-S4-PlacerDome151.jpg",
    alt: "Red and white Series 4 shelters in a forest clearing below snowy peaks, a helicopter landing",
    caption: "Series 4 shelters in a remote camp.",
    position: "50% 60%",
  },
};
