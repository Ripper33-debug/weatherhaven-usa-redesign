/**
 * The homepage's true-scale lineup (HomeLineup): each system with a 3D model on this site, rendered
 * deployed from the same three-quarter angle (34° round, 10° up) with one orthographic camera at 60
 * image pixels per metre, under the viewer's sky lighting (public/hero/lineup/*.webp, transparent;
 * guy lines kept, site kit left out). Every image is cropped so the centre of the
 * model's footprint sits the same distance (110 px) above its bottom edge, so lining the images up by their
 * bottom edges stands every model on one line at true relative size.
 *
 * Order: smallest to largest footprint. Sizes are the image sizes in pixels.
 */
export const LINEUP_PX_PER_M = 60;

export const LINEUP: { slug: string; w: number; h: number }[] = [
  { slug: "trecc", w: 298, h: 267 },
  { slug: "ateps", w: 462, h: 273 },
  { slug: "endurance", w: 355, h: 253 },
  { slug: "polarhaven", w: 468, h: 310 },
  { slug: "hercon", w: 571, h: 306 },
  { slug: "series-4", w: 622, h: 364 },
  { slug: "rdmss", w: 985, h: 410 },
  { slug: "mts", w: 663, h: 355 },
  { slug: "polar-chief", w: 551, h: 324 },
  { slug: "mecc", w: 568, h: 297 },
  { slug: "ehmecc", w: 568, h: 381 },
  { slug: "mex-26", w: 807, h: 473 },
];
