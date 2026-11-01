/**
 * Packed and deployed outside dimensions for the to-scale size drawings, in inches.
 *
 * Numbers are Weatherhaven's published figures from product-content.ts (see its sources), with
 * one stated drawing assumption: the expanding containers (MECC, EHMECC, BMECC) publish only
 * their deployed width, so they are drawn at their container length, which the side wings
 * don't change. Where anything else isn't published it is left out of the drawing rather than
 * guessed. `l` is drawn left to right, `w` top to bottom in plan view, `h` is height.
 */
export type Dims = { l: number; w: number; h?: number };

export type SystemSize = {
  /** Unique id (a product can have several sized variants). */
  id: string;
  /** Product page slug. */
  slug: string;
  name: string;
  /** Published packed footprint; absent when only bags or volumes are published. */
  packed?: Dims;
  deployed: Dims;
  /** Silhouette used in the side view. */
  profile: "box" | "rounded" | "peaked";
  /** Eave height for peaked profiles (in). */
  eaves?: number;
  /** Published floor area, shown as is (ft²). */
  areaPublished?: number;
  /** Packed size as published, for the readout. */
  packedNote: string;
  deployedNote: string;
  /** A few words for the all-systems lineup. */
  packedShort: string;
};

const ft = (f: number) => Math.round(f * 12 * 10) / 10;
const cm = (c: number) => Math.round((c / 2.54) * 10) / 10;

export const SYSTEM_SIZES: SystemSize[] = [
  {
    id: "mecc",
    slug: "mecc",
    name: "MECC",
    packed: { l: 240, w: 96, h: 96 },
    deployed: { l: 240, w: 243 },
    profile: "box",
    areaPublished: 420,
    packedNote: "20-ft ISO container, 20 × 8 × 8 ft",
    deployedNote: "243 in wide; drawn at the container's 20-ft length",
    packedShort: "Ships as a 20-ft container",
  },
  {
    id: "ehmecc",
    slug: "ehmecc",
    name: "EHMECC",
    packed: { l: 240, w: 96, h: 96 },
    deployed: { l: 240, w: 240 },
    profile: "box",
    areaPublished: 420,
    packedNote: "20-ft ISO container, 240 × 96 × 96 in",
    deployedNote: "240 in wide, 12-ft interior height; drawn at the container's 20-ft length",
    packedShort: "Ships as a 20-ft container",
  },
  {
    id: "bmecc",
    slug: "bmecc",
    name: "BMECC",
    packed: { l: 120, w: 96, h: 96 },
    deployed: { l: 120, w: 243 },
    profile: "box",
    areaPublished: 210,
    packedNote: "10-ft ISO container, 120 × 96 × 96 in",
    deployedNote: "243 in wide; drawn at the container's 10-ft length",
    packedShort: "Ships as a 10-ft container",
  },
  {
    id: "trecc-t",
    slug: "trecc",
    name: "TRECC-T",
    packed: { l: 114, w: 94.5, h: 57 },
    deployed: { l: 181, w: 97, h: 82 },
    profile: "box",
    packedNote: "114 × 94.5 × 57 in, stowed",
    deployedNote: "181 × 97 × 82 in",
    packedShort: "Stows to 114 × 94.5 in",
  },
  {
    id: "trecc-m",
    slug: "trecc",
    name: "TRECC-M",
    packed: { l: 89, w: 84, h: 57 },
    deployed: { l: 171, w: 72, h: 78 },
    profile: "box",
    packedNote: "89 × 84 × 57 in, stowed",
    deployedNote: "171 × 72 × 78 in",
    packedShort: "Stows to 89 × 84 in",
  },
  {
    id: "ateps",
    slug: "ateps",
    name: "ATEPS",
    packed: { l: 84, w: 104 },
    deployed: { l: 244, w: 104, h: 91 },
    profile: "box",
    packedNote: "One 463L pallet, 84 × 104 in",
    deployedNote: "244 × 104 in, 91 in high",
    packedShort: "One 463L pallet",
  },
  {
    id: "airbeam-lp",
    slug: "airbeam-lp",
    name: "Airmax LP",
    packed: { l: cm(140), w: cm(120), h: cm(100) },
    deployed: { l: cm(600), w: cm(570), h: cm(280) },
    profile: "rounded",
    packedNote: "Main unit 1.4 × 1.2 × 1.0 m",
    deployedNote: "Main unit 600 × 570 × 280 cm",
    packedShort: "Packs to 1.4 × 1.2 m",
  },
  {
    id: "endurance-16",
    slug: "endurance",
    name: "Endurance 16",
    packed: { l: 110, w: 12, h: 12 },
    deployed: { l: ft(16), w: ft(8), h: ft(6.5) },
    profile: "rounded",
    packedNote: "110 × 12 × 12 in",
    deployedNote: "16 × 8 ft, 6 ft 6 in high",
    packedShort: "Packs to 110 × 12 in",
  },
  {
    id: "polar-chief",
    slug: "polar-chief",
    name: "Polar Chief",
    deployed: { l: ft(14), w: ft(14), h: ft(8.5) },
    profile: "peaked",
    eaves: ft(6.3),
    packedNote: "Three bags, 42 ft³ in all",
    deployedNote: "14 ft across, 8.5 ft at the center",
    packedShort: "Packs into three bags",
  },
  {
    id: "rdmss-4",
    slug: "rdmss",
    name: "RDMSS, 4 modules",
    deployed: { l: ft(41.8), w: ft(23.8) },
    profile: "rounded",
    areaPublished: 995,
    packedNote: "12 bags, 2,156 lb",
    deployedNote: "41.8 × 23.8 ft",
    packedShort: "Packs into 12 bags",
  },
];

/** The 20-ft ISO container every logistician knows, as a reference outline (ISO 668). */
export const ISO_20FT: Dims = { l: 240, w: 96, h: 102 };
/** Human scale for the side view. */
export const PERSON_HEIGHT = 72;

export function sizesForSlug(slug: string): SystemSize[] {
  return SYSTEM_SIZES.filter((s) => s.slug === slug);
}

/** Footprint area in ft² from outside dimensions (octagon for Polar Chief). */
export function footprintFt2(d: Dims, profile?: SystemSize["profile"]): number {
  if (profile === "peaked") {
    // Regular octagon measured across flats.
    const side = (d.w / 12) * Math.tan(Math.PI / 8);
    return 2 * (1 + Math.SQRT2) * side * side;
  }
  return (d.l * d.w) / 144;
}

export function formatFt2(n: number): string {
  return n >= 100 ? Math.round(n).toLocaleString("en-US") : n.toFixed(n % 1 ? 1 : 0);
}

/** "8 ft 6 in" style length for labels. */
export function feetInches(inches: number): string {
  const total = Math.round(inches);
  const f = Math.floor(total / 12);
  const i = total % 12;
  if (f === 0) return `${i} in`;
  return i ? `${f} ft ${i} in` : `${f} ft`;
}
