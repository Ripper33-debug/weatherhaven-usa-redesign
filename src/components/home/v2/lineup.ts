/**
 * The homepage's true-scale lineup (HomeLineup): each system with a 3D model on this site, rendered
 * deployed from the same three-quarter angle with one orthographic camera at 60 image pixels per
 * metre (public/hero/lineup/*.webp, transparent). Every image is cropped so the centre of the
 * model's footprint sits the same distance above its bottom edge, so lining the images up by their
 * bottom edges stands every model on one line at true relative size.
 *
 * Order: smallest to largest footprint. Sizes are the image sizes in pixels.
 */
export const LINEUP_PX_PER_M = 60;

export const LINEUP: { slug: string; w: number; h: number }[] = [
  { slug: "trecc", w: 314, h: 228 },
  { slug: "ateps", w: 464, h: 235 },
  { slug: "endurance", w: 350, h: 215 },
  { slug: "polarhaven", w: 452, h: 270 },
  { slug: "hercon", w: 580, h: 266 },
  { slug: "series-4", w: 602, h: 320 },
  { slug: "rdmss", w: 740, h: 331 },
  { slug: "mts", w: 638, h: 317 },
  { slug: "polar-chief", w: 546, h: 349 },
  { slug: "mecc", w: 616, h: 248 },
  { slug: "ehmecc", w: 634, h: 332 },
  { slug: "mex-26", w: 802, h: 434 },
];
