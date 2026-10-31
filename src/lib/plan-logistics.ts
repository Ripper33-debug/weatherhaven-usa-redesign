/**
 * How the mission builder's camp ships and sets up: a planning estimate, worked out only from
 * Weatherhaven's published packed sizes, weights and setup figures (src/lib/product-content.ts)
 * and from official aircraft, pallet and container figures (sources below). Pure, so it is tested
 * (plan-logistics.test.ts).
 *
 * Rules:
 * - A system is counted only where its packed size (or packed volume) is published. Weight is
 *   counted where published; a load with no published weight still takes its pallet positions and
 *   is named, so the payload check is known to be partial.
 * - Everything rounds up. Packs are laid on the floor of a pallet or container, never stacked.
 * - The camp's quantities are the 3D camp's (illustrative), not a sizing. Weatherhaven produces the
 *   real load plan.
 *
 * Official figures used:
 * - C-17: "170,900 pounds (77,519 kilograms) of cargo (18 pallet positions)"; cargo compartment
 *   88 ft long, 18 ft wide, 12 ft 4 in high. US Air Force fact sheet,
 *   https://www.af.mil/About-Us/Fact-Sheets/Display/Article/1529726/ (checked October 2026).
 * - C-130J-30: "8 pallets"; cargo compartment 56 ft long, 123 in wide, 9 ft high. Air Mobility
 *   Command fact sheet, https://www.amc.af.mil/About-Us/Fact-Sheets/Display/Article/2848932/c-130-hercules/.
 *   Maximum payload 44,000 lb (Lockheed Martin, https://www.lockheedmartin.com/en-us/products/c130/c-130j-30-super-hercules.html);
 *   the 130th Airlift Wing fact sheet gives 46,700 lb, so the lower figure is used.
 * - 463L pallet: 88 × 108 in overall, usable 84 × 104 in, 10,000 lb, 96 in maximum height. US Army
 *   FM 55-9, appendix D (https://www.globalsecurity.org/military/library/policy/army/fm/55-9/appd.htm).
 *   Pallets ride 108 in across the floor, so each pallet position is 88 in deep: two rows of nine
 *   fill the C-17's 18-ft-wide floor, one row of eight the C-130J-30's 123-in floor.
 * - A 20-ft ISO container (240 × 96 in) therefore covers three 88-in positions in one row.
 *   Weatherhaven publishes C-130 carriage for the EHMECC only, so other containers count on the
 *   C-17 alone.
 * - 20-ft container minimum inside length and width 5,867 × 2,330 mm (231 × 91.75 in), ISO 1894.
 *   Two 463L pallets fit end to end. Pallet loads taller than 86 in are counted one per container
 *   (a flat rack), to stay clear of the door opening.
 * - Road: one 20-ft load per truck (container chassis or PLS flatrack).
 */
import { campPlan, type CampPlan } from "@/lib/camp-scene-plan";
import type { GuideAnswers } from "@/lib/mission-guide";

export const PALLET_463L = {
  usableL: 104,
  usableW: 84,
  positionDepth: 88,
  maxHeight: 96,
  maxLoadLb: 10_000,
} as const;
export const CONTAINER_20FT = {
  insideL: 231,
  insideW: 91.75,
  insideH: 92.5,
  palletsPerContainer: 2,
  palletMaxHeight: 86,
} as const;

export type AircraftId = "c17" | "c130";
export const AIRCRAFT: Record<
  AircraftId,
  { name: string; positions: number; payloadLb: number }
> = {
  c17: { name: "C-17", positions: 18, payloadLb: 170_900 },
  c130: { name: "C-130J-30", positions: 8, payloadLb: 44_000 },
};

/** Share of a pallet's or container's volume a load of soft bags is assumed to fill. */
export const BAG_FILL = 0.5;

type Box = { l: number; w: number; h: number };

/** How many boxes fit on a floor in one layer, either way round. */
export function floorFit(
  item: { l: number; w: number },
  floor: { l: number; w: number },
): number {
  const a = Math.floor(floor.l / item.l) * Math.floor(floor.w / item.w);
  const b = Math.floor(floor.l / item.w) * Math.floor(floor.w / item.l);
  return Math.max(a, b);
}

/** How many bags of a published volume fit a space at BAG_FILL. */
export function volumeFit(bagFt3: number, space: Box): number {
  const ft3 = (space.l * space.w * space.h) / 1728;
  return Math.floor((ft3 * BAG_FILL) / bagFt3);
}

const IN_PER_M = 39.37;
const m = (v: number) => v * IN_PER_M;

/**
 * How one unit packs, from the published figures. `perLoad` units make one indivisible load of
 * `positions` pallet positions; `perTeu` units fill one 20-ft container.
 */
export type ShipBasis = {
  /** How the unit is counted, in a few words, e.g. "One 20-ft ISO container". */
  packedAs: string;
  weightLb?: number;
  air?: { positions: number; perLoad: number; c130: boolean };
  /** Why it isn't counted for airlift, when it isn't. */
  noAir?: string;
  perTeu?: number;
  noSea?: string;
};

export type SetupBasis = { crew?: number; minutes?: number; text: string };

export type UnitBasis = {
  /** The published configuration one unit of the camp is counted as, when there's a choice. */
  countedAs?: string;
  ship: ShipBasis;
  setup?: SetupBasis;
  /** Published deployed floor area of one unit, ft². */
  areaFt2?: number;
  /** A published note about power or climate control, shown as is. */
  power?: string;
  /** A published note about helicopter or over-snow moves, shown as is. */
  move?: string;
};

const NOT_PUBLISHED = "packed size not published";
const palletsPerTeu = (heightIn: number) =>
  heightIn <= CONTAINER_20FT.palletMaxHeight
    ? CONTAINER_20FT.palletsPerContainer
    : 1;
const PALLET_FLOOR = { l: PALLET_463L.usableL, w: PALLET_463L.usableW };
/**
 * Two 463L pallets married end to end, for packs longer than one pallet's deck (the Endurance's
 * 110-in bag). Counted conservatively as one pallet's usable deck plus one more 88-in position.
 */
const MARRIED_FLOOR = { l: PALLET_463L.usableL + 88, w: PALLET_463L.usableW };
const PALLET_SPACE = { ...PALLET_FLOOR, h: PALLET_463L.maxHeight };
const TEU_FLOOR = { l: CONTAINER_20FT.insideL, w: CONTAINER_20FT.insideW };
const TEU_SPACE = { ...TEU_FLOOR, h: CONTAINER_20FT.insideH };

/** One pallet load per unit (a system that is itself built on a 463L pallet). */
function onePallet(
  packedAs: string,
  heightIn: number,
  weightLb: number | undefined,
  c130: boolean,
): ShipBasis {
  return {
    packedAs,
    weightLb,
    air: { positions: 1, perLoad: 1, c130 },
    perTeu: palletsPerTeu(heightIn),
  };
}

/** Packs laid on 463L pallets and in containers, one layer. */
function packs(packedAs: string, box: Box, weightLb: number): ShipBasis {
  const fitsHeight = box.h <= PALLET_463L.maxHeight;
  const perPallet = fitsHeight ? floorFit(box, PALLET_FLOOR) : 0;
  const perPair = fitsHeight && perPallet === 0 ? floorFit(box, MARRIED_FLOOR) : 0;
  const perTeu = floorFit(box, TEU_FLOOR);
  return {
    packedAs,
    weightLb,
    ...(perPallet > 0
      ? { air: { positions: 1, perLoad: perPallet, c130: true } }
      : perPair > 0
        ? { air: { positions: 2, perLoad: perPair, c130: true } }
        : { noAir: "doesn't fit on 463L pallets as published" }),
    ...(perTeu > 0 ? { perTeu } : { noSea: NOT_PUBLISHED }),
  };
}

/** Bags with only a published total volume, at BAG_FILL. */
function bags(packedAs: string, ft3: number, weightLb: number): ShipBasis {
  return {
    packedAs,
    weightLb,
    air: { positions: 1, perLoad: volumeFit(ft3, PALLET_SPACE), c130: true },
    perTeu: volumeFit(ft3, TEU_SPACE),
  };
}

const iso20 = (
  weightLb: number | undefined,
  c130: boolean,
  perModule = 1,
): ShipBasis => ({
  packedAs:
    perModule === 1
      ? "One 20-ft ISO container"
      : `Two units couple into one 20-ft ISO module`,
  weightLb,
  air: {
    positions: Math.ceil(240 / PALLET_463L.positionDepth),
    perLoad: perModule,
    c130,
  },
  perTeu: perModule,
});

const unknown = (why = NOT_PUBLISHED): ShipBasis => ({
  packedAs: "Load plan on request",
  noAir: why,
  noSea: why,
});

/**
 * Published figures per system (product-content.ts). Keys are product slugs, plus
 * "trecc-sanitation" for the TRECC sanitation unit the camp adds, which publishes no packed size.
 */
export const UNIT_BASIS: Record<string, UnitBasis> = {
  mecc: {
    ship: iso20(7_700, false),
    setup: { crew: 2, minutes: 15, text: "2 people, 10–15 min" },
    areaFt2: 420,
    move: "Lifts by forklift, crane, helicopter or PLS truck",
  },
  ehmecc: {
    ship: iso20(8_483, true),
    setup: { minutes: 10, text: "under 10 min, no tools" },
    areaFt2: 420,
    move: "Can be underslung by helicopter",
  },
  bmecc: {
    ship: iso20(5_500, false, 2),
    areaFt2: 210,
  },
  trecc: {
    countedAs: "TRECC-P, on one 463L pallet",
    ship: onePallet("One 463L pallet, 104 × 84 × 60 in", 60, 2_205, true),
    setup: { crew: 2, minutes: 3, text: "2 personnel, under 3 min" },
    areaFt2: 132,
    power: "24 VDC actuators with a manual backup",
    move: "Under 60 in stowed, CH-47 airlift compatible",
  },
  "trecc-sanitation": {
    ship: unknown(),
    power: "Solar and 24 VDC power",
  },
  ateps: {
    ship: onePallet("One 463L pallet, 84 × 104 in", 91, 2_500, true),
    setup: { crew: 2, minutes: 10, text: "2 people, under 10 min" },
    areaFt2: Math.round(((244 * 104) / 144) * 10) / 10,
    move: "4-point sling top lift",
  },
  hercon: {
    ship: unknown("weight not published"),
    setup: { crew: 6, text: "a team of six, minutes" },
  },
  "non-expandable-iso-containers": {
    ship: unknown("container size varies by module"),
  },
  "series-4": {
    ship: unknown(),
    setup: { text: "no tools or specialist skills" },
  },
  rdmss: {
    countedAs: "2-module RDMSS",
    ship: {
      ...unknown("bag sizes not published"),
      weightLb: 1_426,
      packedAs: "7 bags, 1,426 lb; bag sizes not published",
    },
    setup: { crew: 3, minutes: 10, text: "3 people, under 10 min" },
    areaFt2: 495,
  },
  mts: {
    ship: unknown(),
    setup: { text: "no tools or specialist training" },
    power: "Pre-harnessed electrical system with ECU and cable ports",
  },
  "mex-26": {
    ship: onePallet("One 463L pallet, 108 × 88 × 60 in", 60, undefined, true),
    setup: { crew: 10, minutes: 180, text: "10 people, 3 hours or less" },
  },
  "airbeam-lp": {
    countedAs: "Airmax LP main unit",
    ship: packs(
      "Packs of 1.4 × 1.2 × 1.0 m, 242.5 kg",
      { l: m(1.4), w: m(1.2), h: m(1.0) },
      Math.round(242.5 * 2.20462),
    ),
    setup: { crew: 2, minutes: 10, text: "2 people, 5–10 min" },
    areaFt2: Math.round(6 * 5.7 * 10.7639 * 10) / 10,
  },
  "airbeam-hp": {
    ship: unknown(),
    setup: { text: "a small team, minutes, no tools" },
  },
  polarhaven: {
    countedAs: "12 × 16 ft Polarhaven",
    // Weight from the published average of 1.75 lb per ft² of floor.
    ship: {
      ...unknown(),
      weightLb: 336,
      packedAs: "About 336 lb; packed size not published",
    },
    setup: { minutes: 30, text: "about 30 min" },
    areaFt2: 192,
  },
  "polar-chief": {
    ship: bags("Three bags, 42 ft³, 220 lb", 42, 220),
    setup: { crew: 2, minutes: 20, text: "2 people, about 20 min" },
    // Octagon 14 ft across the flats.
    areaFt2: Math.round(
      2 * (1 + Math.SQRT2) * (14 * Math.tan(Math.PI / 8)) ** 2,
    ),
  },
  endurance: {
    countedAs: "16-ft Endurance",
    ship: packs(
      "One bag, 110 × 12 × 12 in, 77 lb",
      { l: 110, w: 12, h: 12 },
      77,
    ),
    setup: { crew: 1, minutes: 5, text: "1 person, about 5 min" },
    areaFt2: 128,
    move: "Sled, snowmobile or helicopter",
  },
};

export type SystemLine = {
  key: string;
  name: string;
  count: number;
  basis: UnitBasis;
};

/** The camp's systems and quantities, in the camp's own order (lead first). */
export function systemLines(plan: CampPlan): SystemLine[] {
  const lines: SystemLine[] = [];
  for (const u of plan.units) {
    const key =
      u.role === "paired" && u.name === "TRECC sanitation"
        ? "trecc-sanitation"
        : u.slug;
    const line = lines.find((l) => l.key === key);
    if (line) line.count += 1;
    else
      lines.push({
        key,
        name: u.name,
        count: 1,
        basis: UNIT_BASIS[key] ?? { ship: unknown() },
      });
  }
  return lines;
}

type Load = {
  name: string;
  positions: number;
  weightLb: number;
  weightKnown: boolean;
};

export type AircraftEstimate = {
  aircraft: AircraftId;
  /** Aircraft loads (sorties) for the systems that can be counted. */
  loads: number;
  positions: number;
  weightLb: number;
  /** Systems counted for positions whose weight isn't published. */
  weightMissing: string[];
  /** Systems not counted on this aircraft, with why. */
  excluded: { name: string; count: number; reason: string }[];
};

/** First-fit decreasing: each load goes on the first aircraft with room and payload left. */
function packAircraft(
  loads: Load[],
  cap: { positions: number; payloadLb: number },
): number {
  const sorted = [...loads].sort(
    (a, b) => b.positions - a.positions || b.weightLb - a.weightLb,
  );
  const bins: { positions: number; payload: number }[] = [];
  for (const l of sorted) {
    const bin = bins.find(
      (b) => b.positions >= l.positions && b.payload >= l.weightLb,
    );
    if (bin) {
      bin.positions -= l.positions;
      bin.payload -= l.weightLb;
    } else {
      bins.push({
        positions: cap.positions - l.positions,
        payload: cap.payloadLb - l.weightLb,
      });
    }
  }
  return bins.length;
}

export function airEstimate(
  lines: SystemLine[],
  aircraft: AircraftId,
): AircraftEstimate {
  const cap = AIRCRAFT[aircraft];
  const loads: Load[] = [];
  const excluded: AircraftEstimate["excluded"] = [];
  const weightMissing: string[] = [];
  for (const line of lines) {
    const s = line.basis.ship;
    if (!s.air) {
      excluded.push({
        name: line.name,
        count: line.count,
        reason: s.noAir ?? NOT_PUBLISHED,
      });
      continue;
    }
    if (aircraft === "c130" && !s.air.c130) {
      excluded.push({
        name: line.name,
        count: line.count,
        reason: "C-130 carriage not published for this system",
      });
      continue;
    }
    if (s.weightLb === undefined) weightMissing.push(line.name);
    let left = line.count;
    while (left > 0) {
      const n = Math.min(s.air.perLoad, left);
      loads.push({
        name: line.name,
        positions: s.air.positions,
        weightLb: (s.weightLb ?? 0) * n,
        weightKnown: s.weightLb !== undefined,
      });
      left -= n;
    }
  }
  return {
    aircraft,
    loads: packAircraft(loads, cap),
    positions: loads.reduce((t, l) => t + l.positions, 0),
    weightLb: loads.reduce((t, l) => t + l.weightLb, 0),
    weightMissing,
    excluded,
  };
}

export type SeaEstimate = {
  /** 20-ft container equivalents. */
  teu: number;
  /** Truckloads by road: one 20-ft load each. */
  trucks: number;
  excluded: { name: string; count: number; reason: string }[];
};

export function seaEstimate(lines: SystemLine[]): SeaEstimate {
  let teu = 0;
  const excluded: SeaEstimate["excluded"] = [];
  for (const line of lines) {
    const per = line.basis.ship.perTeu;
    if (!per) {
      excluded.push({
        name: line.name,
        count: line.count,
        reason: line.basis.ship.noSea ?? NOT_PUBLISHED,
      });
      continue;
    }
    teu += Math.ceil(line.count / per);
  }
  return { teu, trucks: teu, excluded };
}

export type SetupEstimate = {
  /** Crew-hours for the systems that publish both crew and time, rounded up to the half hour. */
  crewHours: number;
  /** The longest single published setup, minutes (the first unit is up after this). */
  longestMinutes: number;
  lines: { name: string; count: number; text: string; crewMinutes?: number }[];
  /** Systems with no published crew-and-time figure. */
  missing: string[];
};

export function setupEstimate(lines: SystemLine[]): SetupEstimate {
  let crewMinutes = 0;
  let longest = 0;
  const out: SetupEstimate["lines"] = [];
  const missing: string[] = [];
  for (const line of lines) {
    const s = line.basis.setup;
    if (s?.minutes) longest = Math.max(longest, s.minutes);
    if (s?.crew && s.minutes) {
      const cm = s.crew * s.minutes * line.count;
      crewMinutes += cm;
      out.push({
        name: line.name,
        count: line.count,
        text: s.text,
        crewMinutes: cm,
      });
    } else {
      out.push({
        name: line.name,
        count: line.count,
        text: s?.text ?? "setup time not published",
      });
      missing.push(line.name);
    }
  }
  return {
    crewHours: Math.ceil((crewMinutes / 60) * 2) / 2,
    longestMinutes: longest,
    lines: out,
    missing,
  };
}

export type FootprintEstimate = {
  /** Published deployed floor area, summed over the units that publish it. */
  floorFt2: number;
  missing: string[];
  /** The ground the camp as drawn covers, guy lines and spacing included (metres). */
  site: { l: number; w: number; m2: number; ft2: number };
};

const FT2_PER_M2 = 10.7639;

export function footprintEstimate(
  lines: SystemLine[],
  plan: CampPlan,
): FootprintEstimate {
  let floor = 0;
  const missing: string[] = [];
  for (const line of lines) {
    if (line.basis.areaFt2) floor += line.basis.areaFt2 * line.count;
    else missing.push(line.name);
  }
  const b = plan.bounds;
  const l = Math.ceil(b.maxX - b.minX);
  const w = Math.ceil(b.maxZ - b.minZ);
  return {
    floorFt2: Math.round(floor),
    missing,
    site: {
      l: Math.max(l, w),
      w: Math.min(l, w),
      m2: l * w,
      ft2: Math.round(l * w * FT2_PER_M2),
    },
  };
}

export type WeightEstimate = {
  /** Published shipping weight, summed over the units that publish one. */
  lb: number;
  /** Systems with no published weight. */
  missing: string[];
};

export function weightEstimate(lines: SystemLine[]): WeightEstimate {
  let lb = 0;
  const missing: string[] = [];
  for (const line of lines) {
    if (line.basis.ship.weightLb !== undefined)
      lb += line.basis.ship.weightLb * line.count;
    else missing.push(line.name);
  }
  return { lb, missing };
}

export type CampLogistics = {
  plan: CampPlan;
  lines: SystemLine[];
  air: Record<AircraftId, AircraftEstimate>;
  sea: SeaEstimate;
  weight: WeightEstimate;
  setup: SetupEstimate;
  footprint: FootprintEstimate;
  /** Published power notes for the systems in the camp. */
  power: { name: string; text: string }[];
  /** Published helicopter and over-snow notes for the systems in the camp. */
  moves: { name: string; text: string }[];
};

export function campLogistics(answers: GuideAnswers): CampLogistics {
  const plan = campPlan(answers);
  const lines = systemLines(plan);
  return {
    plan,
    lines,
    air: { c17: airEstimate(lines, "c17"), c130: airEstimate(lines, "c130") },
    sea: seaEstimate(lines),
    weight: weightEstimate(lines),
    setup: setupEstimate(lines),
    footprint: footprintEstimate(lines, plan),
    power: lines.flatMap((l) =>
      l.basis.power ? [{ name: l.name, text: l.basis.power }] : [],
    ),
    moves: lines.flatMap((l) =>
      l.basis.move ? [{ name: l.name, text: l.basis.move }] : [],
    ),
  };
}

const NUM = new Intl.NumberFormat("en-US");
export const formatNumber = (n: number) => NUM.format(n);
export const lbToKg = (lb: number) => Math.round(lb / 2.20462);
export const ft2ToM2 = (ft2: number) => Math.round(ft2 / FT2_PER_M2);

/** "3 MECC, 2 Series 4 and 1 TRECC sanitation" */
export function namesWithCounts(
  items: { name: string; count: number }[],
): string {
  const parts = items.map((i) => `${i.count} ${i.name}`);
  return parts.length > 1
    ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`
    : (parts[0] ?? "");
}

export type ShippingRow = {
  id: "c17" | "c130" | "sea" | "road";
  mode: string;
  /** The headline figure, or null when nothing in the camp can be counted this way. */
  figure: string | null;
  detail: string;
  /** The visitor chose this way of moving the camp. */
  chosen: boolean;
};

const plural = (n: number, one: string, many = `${one}s`) =>
  `${formatNumber(n)} ${n === 1 ? one : many}`;
const lbKg = (lb: number) =>
  `${formatNumber(lb)} lb (${formatNumber(lbToKg(lb))} kg)`;
const listNames = (names: string[]) =>
  names.length > 1
    ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`
    : (names[0] ?? "");

/**
 * The shipping estimate in words, shared by the results and the printable plan. Systems no mode can
 * count are gathered in `onRequest`; a system left out of only one mode is named in that row.
 */
export function shippingSummary(
  l: CampLogistics,
  transport: string,
): {
  rows: ShippingRow[];
  onRequest: { name: string; count: number; reason: string }[];
  anyCounted: boolean;
} {
  const seaOut = new Set(l.sea.excluded.map((e) => e.name));
  const onRequest = l.air.c17.excluded.filter((e) => seaOut.has(e.name));
  const global = new Set(onRequest.map((e) => e.name));

  const airRow = (id: AircraftId): ShippingRow => {
    const e = l.air[id];
    const cap = AIRCRAFT[id];
    const parts: string[] = [];
    if (e.loads > 0) {
      parts.push(
        id === "c17" || e.loads === 1
          ? `${formatNumber(e.positions)} of ${formatNumber(e.loads * cap.positions)} pallet positions`
          : `${formatNumber(e.positions)} pallet positions over ${e.loads} aircraft`,
      );
      if (e.weightLb > 0) parts.push(lbKg(e.weightLb));
    }
    const c17Only = e.excluded
      .filter((x) => x.reason.startsWith("C-130"))
      .map((x) => x.name);
    if (c17Only.length)
      parts.push(
        `${listNames(c17Only)} on the C-17 only (C-130 carriage not published)`,
      );
    const other = e.excluded.filter(
      (x) => !global.has(x.name) && !x.reason.startsWith("C-130"),
    );
    for (const x of other) parts.push(`${x.name} not counted: ${x.reason}`);
    if (e.weightMissing.length)
      parts.push(`no published weight for ${listNames(e.weightMissing)}`);
    return {
      id,
      mode: cap.name,
      figure: e.loads > 0 ? plural(e.loads, "aircraft load") : null,
      detail:
        parts.join("; ") || "Pallet positions not published for these systems",
      chosen: transport === "air",
    };
  };

  const seaOther = l.sea.excluded
    .filter((x) => !global.has(x.name))
    .map((x) => `${x.name} not counted: ${x.reason}`);
  const rows: ShippingRow[] = [
    airRow("c17"),
    airRow("c130"),
    {
      id: "sea",
      mode: "Ship or rail",
      figure:
        l.sea.teu > 0 ? `${formatNumber(l.sea.teu)} × 20-ft container${l.sea.teu === 1 ? "" : "s"}` : null,
      detail:
        l.sea.teu > 0
          ? [
              "20-ft container equivalents, rounded up for each system",
              ...seaOther,
            ].join("; ")
          : "Packed sizes not published for these systems",
      chosen: transport === "sea",
    },
    {
      id: "road",
      mode: "Road",
      figure: l.sea.trucks > 0 ? plural(l.sea.trucks, "truckload") : null,
      detail:
        l.sea.trucks > 0
          ? [
              "One 20-ft load per truck, on a container chassis or PLS flatrack",
              ...seaOther,
            ].join("; ")
          : "Packed sizes not published for these systems",
      chosen: transport === "road",
    },
  ];
  // The visitor's own way of moving the camp first.
  rows.sort((a, b) => Number(b.chosen) - Number(a.chosen));
  return { rows, onRequest, anyCounted: rows.some((r) => r.figure) };
}

/** "RDMSS (bag sizes not published) and Series 4 (packed size not published)" */
export function onRequestText(
  items: { name: string; reason: string }[],
): string {
  return listNames(items.map((i) => `${i.name} (${i.reason})`));
}

export { listNames, lbKg, plural };
