/**
 * What the 3D camp on the mission builder shows for a set of answers (complete or not): which
 * shelters, how many, where they stand, how the camp arrives and how permanent it looks.
 *
 * Pure data, no three.js, so it is cheap to test. The leading system is the same one the
 * builder recommends once every question is answered, and the companions are the builder's own
 * "a camp this size usually adds" pairings. Quantities are illustrative, not a sizing.
 *
 * Sizes are in metres, long side along x. Published dimensions are used where Weatherhaven
 * publishes them; the rest are noted as estimates (see KIND_SIZE).
 */
import {
  labelFor,
  pairings,
  rankPartial,
  type ClimateId,
  type DurationId,
  type GuideAnswers,
  type MissionId,
  type PeopleId,
  type TransportId,
} from "@/lib/mission-guide";

export type ModelKind =
  | "trecc"
  | "mecc"
  | "ehmecc"
  | "bmecc"
  | "ateps"
  | "hercon"
  | "iso"
  | "series4-26"
  | "series4-12"
  | "rdmss"
  | "mts"
  | "mex26"
  | "airmax-lp"
  | "airmax-hp"
  | "polarhaven"
  | "polar-chief"
  | "endurance";

export type KindSize = { l: number; w: number; h: number; source: string };

const IN = 0.0254;
const FT = 0.3048;

/** Outside size of each model as drawn. `source` says where the numbers come from. */
export const KIND_SIZE: Record<ModelKind, KindSize> = {
  trecc: { l: 181 * IN, w: 97 * IN, h: 2.35, source: "CAD model; TRECC-T deployed 181 × 97 in" },
  mecc: { l: 20 * FT, w: 243 * IN, h: 8 * FT, source: "20-ft container, 243 in deployed width" },
  ehmecc: { l: 20 * FT, w: 240 * IN, h: 144 * IN + 0.25, source: "240 in deployed width, 144 in interior height (roof thickness estimated)" },
  bmecc: { l: 10 * FT, w: 243 * IN, h: 8 * FT, source: "10-ft container, 243 in deployed width" },
  ateps: { l: 244 * IN, w: 104 * IN, h: 91 * IN, source: "244 × 104 in deployed, 91 in high" },
  hercon: { l: 24 * FT, w: 8 * FT, h: 8 * FT, source: "Estimated: an 8-ft module opened to 6× a 4-ft unit's footprint" },
  iso: { l: 20 * FT, w: 8 * FT, h: 8.5 * FT, source: "20-ft ISO container (ISO 668)" },
  "series4-26": { l: 40 * FT, w: 26 * FT, h: 17.33 * FT, source: "26 ft wide, 17 ft 4 in peak; 40 ft length chosen for the drawing" },
  "series4-12": { l: 32 * FT, w: 12 * FT, h: 7 * FT, source: "12 ft wide, 7 ft peak; 32 ft length chosen for the drawing" },
  rdmss: { l: 41.8 * FT, w: 23.8 * FT, h: 3.4, source: "4-module 41.8 × 23.8 ft; height estimated" },
  mts: { l: 8, w: 6, h: 3.3, source: "Estimated; no published dimensions" },
  mex26: { l: 40 * FT, w: 26 * FT, h: 6.1, source: "26-ft clear span; length and height estimated" },
  "airmax-lp": { l: 6, w: 5.7, h: 2.8, source: "Main unit 600 × 570 × 280 cm" },
  "airmax-hp": { l: 8, w: 6, h: 4, source: "6 m wide, 4 m centre, 3 m eaves; 8 m length chosen" },
  polarhaven: { l: 16 * FT, w: 12 * FT, h: 7 * FT, source: "12 × 16 ft unit, 7 ft peak" },
  "polar-chief": { l: 14 * FT, w: 14 * FT, h: 8.5 * FT, source: "Octagon 14 ft across, 8.5 ft centre, 6.3 ft eaves" },
  endurance: { l: 16 * FT, w: 8 * FT, h: 6.5 * FT, source: "16 × 8 ft, 6 ft 6 in high" },
};

/** The model drawn for each system the builder can recommend. */
export const KIND_FOR_SLUG: Record<string, ModelKind> = {
  trecc: "trecc",
  mecc: "mecc",
  ehmecc: "ehmecc",
  bmecc: "bmecc",
  ateps: "ateps",
  hercon: "hercon",
  "non-expandable-iso-containers": "iso",
  "series-4": "series4-26",
  rdmss: "rdmss",
  mts: "mts",
  "mex-26": "mex26",
  "airbeam-lp": "airmax-lp",
  "airbeam-hp": "airmax-hp",
  polarhaven: "polarhaven",
  "polar-chief": "polar-chief",
  endurance: "endurance",
};

const PEOPLE_INDEX: Record<PeopleId, number> = { "1-8": 0, "9-25": 1, "26-100": 2, "101-500": 3, "500+": 4 };

/** Illustrative number of the leading system, by headcount and how big one unit is. */
function mainCount(kind: ModelKind, people: PeopleId | undefined): number {
  if (!people) return 1;
  const s = KIND_SIZE[kind];
  const area = s.l * s.w;
  const table = area < 25 ? [1, 3, 5, 8, 12] : area < 60 ? [1, 2, 4, 6, 10] : [1, 2, 3, 5, 8];
  return table[PEOPLE_INDEX[people]];
}

const PAIR_COUNTS: Record<string, number[]> = {
  "TRECC sanitation": [1, 1, 2, 3, 4],
  "Series 4": [0, 0, 2, 4, 6],
  Polarhaven: [0, 0, 2, 4, 6],
  "ISO container modules": [0, 0, 2, 3, 4],
};

const PAIR_KIND: Record<string, ModelKind> = {
  "TRECC sanitation": "trecc",
  "Series 4": "series4-12",
  Polarhaven: "polarhaven",
  "ISO container modules": "iso",
};

export type CampUnit = {
  /** Stable across answer changes while the same unit is still in the camp. */
  id: string;
  slug: string;
  name: string;
  kind: ModelKind;
  x: number;
  z: number;
  /** Rotation about the vertical axis, radians. */
  rot: number;
  role: "main" | "paired";
};

export type CampTag = { unitId: string; slug: string; name: string; role: "best" | "paired" };

export type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

export type PropKind = "pad" | "walk" | "gen" | "bladder" | "light" | "tank" | "fence";

export type CampProp = {
  id: string;
  kind: PropKind;
  /** The duration answer that adds it: works for longer stays build on the shorter ones. */
  tier: DurationId;
  x: number;
  z: number;
  rot: number;
  /** Length and width for pads and walkways; length for fence runs. */
  l?: number;
  w?: number;
};

export type TransportSite = { kind: TransportId; x: number; z: number; rot: number };

export type CampPlan = {
  mission: MissionId | null;
  climate: ClimateId | null;
  people: PeopleId | null;
  transport: TransportId | null;
  duration: DurationId | null;
  /** The system the camp is built around (the builder's best match once complete). */
  lead: { slug: string; name: string } | null;
  units: CampUnit[];
  tags: CampTag[];
  props: CampProp[];
  /** The ground the shelters stand on, without transport. */
  bounds: Rect;
  transportSite: TransportSite | null;
  /** One sentence for screen readers. */
  summary: string;
};

/** Grid slots around the lead unit (column, row behind). Fixed order, so a unit keeps its place
 * as the camp grows. */
const SLOTS: [number, number][] = [
  [0, 0], [1, 0], [-1, 0], [0, 1], [1, 1], [-1, 1], [2, 0], [-2, 0], [2, 1], [-2, 1],
  [0, 2], [1, 2], [-1, 2], [2, 2], [-2, 2], [3, 0], [-3, 0], [3, 1], [-3, 1],
];

const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round2 = (v: number) => Math.round(v * 100) / 100 || 0;

function rectOf(units: CampUnit[]): Rect {
  if (units.length === 0) return { minX: -4, maxX: 4, minZ: -4, maxZ: 4 };
  const r = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
  for (const u of units) {
    const s = KIND_SIZE[u.kind];
    const across = Math.abs(Math.sin(u.rot)) > 0.5;
    const hx = (across ? s.w : s.l) / 2;
    const hz = (across ? s.l : s.w) / 2;
    r.minX = Math.min(r.minX, u.x - hx);
    r.maxX = Math.max(r.maxX, u.x + hx);
    r.minZ = Math.min(r.minZ, u.z - hz);
    r.maxZ = Math.max(r.maxZ, u.z + hz);
  }
  return r;
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function campPlan(a: GuideAnswers): CampPlan {
  const ranked = a.mission ? rankPartial(a) : [];
  const lead = ranked[0] ?? null;
  const units: CampUnit[] = [];
  const tags: CampTag[] = [];

  if (lead) {
    const kind = KIND_FOR_SLUG[lead.slug] ?? "mecc";
    const s = KIND_SIZE[kind];
    const gx = clampN(s.l * 0.35, 2.5, 5);
    const gz = clampN(s.w * 0.8, 5, 9);
    const n = mainCount(kind, a.people);
    for (let i = 0; i < n && i < SLOTS.length; i++) {
      const [c, r] = SLOTS[i];
      units.push({
        id: `m-${lead.slug}-${i}`,
        slug: lead.slug,
        name: lead.name,
        kind,
        x: round2(c * (s.l + gx)),
        z: round2(-r * (s.w + gz)),
        rot: 0,
        role: "main",
      });
    }
    tags.push({ unitId: units[0].id, slug: lead.slug, name: lead.name, role: "best" });
  }

  // Companions appear once the headcount is known (they depend on the size of the camp).
  if (lead && a.people) {
    const main = rectOf(units);
    const picked = ranked.slice(0, 3).map((r) => r.slug);
    const idx = PEOPLE_INDEX[a.people];
    for (const p of pairings(a, picked)) {
      const kind = PAIR_KIND[p.name];
      const count = PAIR_COUNTS[p.name]?.[idx] ?? 0;
      if (!kind || count === 0) continue;
      const s = KIND_SIZE[kind];
      const base = slugify(p.name);
      const placed: CampUnit[] = [];
      for (let i = 0; i < count; i++) {
        let x = 0;
        let z = 0;
        if (kind === "series4-12" || kind === "polarhaven") {
          // Accommodation rows behind the main block, three to a row.
          const perRow = 3;
          const row = Math.floor(i / perRow);
          const inRow = Math.min(perRow, count - row * perRow);
          const j = i % perRow;
          x = (j - (inRow - 1) / 2) * (s.l + 3);
          z = main.minZ - 7 - s.w / 2 - row * (s.w + 4);
        } else if (kind === "iso") {
          // A column of fitted containers to the left.
          x = main.minX - 6 - s.l / 2;
          z = -i * (s.w + 3) + 1;
        } else {
          // Sanitation trailers to the right.
          x = main.maxX + 5 + s.l / 2;
          z = -i * (s.w + 3.5);
        }
        placed.push({ id: `p-${base}-${i}`, slug: p.slug, name: p.name, kind, x: round2(x), z: round2(z), rot: 0, role: "paired" });
      }
      units.push(...placed);
      tags.push({ unitId: placed[0].id, slug: p.slug, name: p.name, role: "paired" });
    }
  }

  const bounds = rectOf(units);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;

  let transportSite: TransportSite | null = null;
  if (a.transport) {
    const t = a.transport;
    if (t === "air") transportSite = { kind: t, x: round2(cx), z: round2(bounds.minZ - 30), rot: 0 };
    else if (t === "helo") transportSite = { kind: t, x: round2(bounds.maxX + 16), z: round2(cz + 2), rot: 0 };
    else if (t === "road") transportSite = { kind: t, x: round2(cx), z: round2(bounds.maxZ + 11), rot: 0 };
    else if (t === "sea") transportSite = { kind: t, x: round2(bounds.minX - 24), z: round2(cz), rot: 0 };
    else transportSite = { kind: t, x: round2(bounds.maxX + 7), z: round2(bounds.maxZ + 8), rot: 0 };
  }

  const props = permanence(a.duration, units, bounds);

  return {
    mission: a.mission ?? null,
    climate: a.climate ?? null,
    people: a.people ?? null,
    transport: a.transport ?? null,
    duration: a.duration ?? null,
    lead: lead ? { slug: lead.slug, name: lead.name } : null,
    units,
    tags,
    props,
    bounds,
    transportSite,
    summary: describe(a, units, lead?.name),
  };
}

/** Site works that show how long the camp is meant to stand. */
function permanence(duration: DurationId | undefined, units: CampUnit[], b: Rect): CampProp[] {
  if (!duration || units.length === 0) return [];
  const props: CampProp[] = [];
  const mains = units.filter((u) => u.role === "main");
  // Rapid: a generator beside some shelters and nothing else.
  mains.forEach((u, i) => {
    if (i % 3 !== 0) return;
    const s = KIND_SIZE[u.kind];
    props.push({ id: `gen-${u.id}`, kind: "gen", tier: "rapid", x: round2(u.x - s.l / 2 - 1.4), z: round2(u.z - s.w / 2 + 0.6), rot: 0 });
  });
  if (duration === "rapid") return props;

  // Months: duckboard walkways along each row, a fuel point and a few lights.
  const rows = [...new Set(units.map((u) => u.z))];
  for (const z of rows) {
    const inRow = units.filter((u) => u.z === z);
    const r = rectOf(inRow);
    const front = Math.max(...inRow.map((u) => u.z + KIND_SIZE[u.kind].w / 2));
    props.push({ id: `walk-${z}`, kind: "walk", tier: "months", x: round2((r.minX + r.maxX) / 2), z: round2(front + 1.6), rot: 0, l: round2(r.maxX - r.minX + 2), w: 1.2 });
  }
  props.push({ id: "bladder-0", kind: "bladder", tier: "months", x: round2(b.minX - 3), z: round2(b.minZ - 4), rot: 0 });
  props.push({ id: "bladder-1", kind: "bladder", tier: "months", x: round2(b.minX + 2.5), z: round2(b.minZ - 4.5), rot: 0.2 });
  props.push({ id: "gen-depot", kind: "gen", tier: "months", x: round2(b.minX - 3), z: round2(b.minZ + 0.5), rot: Math.PI / 2 });
  props.push({ id: "light-0", kind: "light", tier: "months", x: round2(b.minX - 2), z: round2(b.maxZ + 3), rot: 0 });
  props.push({ id: "light-1", kind: "light", tier: "months", x: round2(b.maxX + 2), z: round2(b.maxZ + 3), rot: 0 });
  if (duration === "months") return props;

  // Years: gravel pads, a fenced perimeter with a gate, light masts all round and water storage.
  for (const u of units) {
    const s = KIND_SIZE[u.kind];
    props.push({ id: `pad-${u.id}`, kind: "pad", tier: "years", x: u.x, z: u.z, rot: u.rot, l: round2(s.l + 2.4), w: round2(s.w + 2.4) });
  }
  const m = 9;
  const f = { minX: b.minX - m, maxX: b.maxX + m, minZ: b.minZ - m, maxZ: b.maxZ + m };
  const gate = 8;
  const midX = (f.minX + f.maxX) / 2;
  const runs: [number, number, number, number][] = [
    [f.minX, f.minZ, f.maxX, f.minZ],
    [f.maxX, f.minZ, f.maxX, f.maxZ],
    [f.minX, f.minZ, f.minX, f.maxZ],
    [f.minX, f.maxZ, midX - gate / 2, f.maxZ],
    [midX + gate / 2, f.maxZ, f.maxX, f.maxZ],
  ];
  runs.forEach(([x1, z1, x2, z2], i) => {
    const len = Math.hypot(x2 - x1, z2 - z1);
    props.push({ id: `fence-${i}`, kind: "fence", tier: "years", x: round2((x1 + x2) / 2), z: round2((z1 + z2) / 2), rot: Math.atan2(-(z2 - z1), x2 - x1), l: round2(len) });
  });
  const corners: [number, number][] = [
    [f.minX + 1.5, f.minZ + 1.5],
    [f.maxX - 1.5, f.minZ + 1.5],
    [f.maxX - 1.5, f.maxZ - 1.5],
    [f.minX + 1.5, f.maxZ - 1.5],
    [midX - gate / 2 - 1.5, f.maxZ - 1.5],
    [midX + gate / 2 + 1.5, f.maxZ - 1.5],
  ];
  corners.forEach(([x, z], i) => props.push({ id: `mast-${i}`, kind: "light", tier: "years", x: round2(x), z: round2(z), rot: 0 }));
  props.push({ id: "tank-0", kind: "tank", tier: "years", x: round2(b.maxX + 3.5), z: round2(b.minZ - 3.5), rot: 0 });
  props.push({ id: "tank-1", kind: "tank", tier: "years", x: round2(b.maxX + 6.6), z: round2(b.minZ - 3.5), rot: 0 });
  // Drop the "months" lights that now sit outside the fence corners' masts.
  return props.filter((p) => p.id !== "light-0" && p.id !== "light-1");
}

const CLIMATE_WORDS: Record<ClimateId, string> = {
  polar: "polar conditions",
  cold: "snow",
  temperate: "a temperate climate",
  hot: "desert heat",
  tropical: "the tropics",
  mixed: "any climate",
};

const TRANSPORT_WORDS: Record<TransportId, string> = {
  air: "arriving by fixed-wing airlift",
  helo: "arriving by helicopter",
  road: "arriving by truck",
  sea: "arriving as ISO containers",
  remote: "brought in by hand, sled or snowmobile",
};

function describe(a: GuideAnswers, units: CampUnit[], leadName?: string): string {
  if (!leadName) return "An empty site, waiting for the first answer.";
  const counts = new Map<string, number>();
  for (const u of units) counts.set(u.name, (counts.get(u.name) ?? 0) + 1);
  const parts = [...counts.entries()].map(([name, n]) => `${n} ${name}`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}` : parts[0];
  let s = `Illustration of the camp so far: ${list}`;
  if (a.climate) s += ` in ${CLIMATE_WORDS[a.climate]}`;
  if (a.transport) s += `, ${TRANSPORT_WORDS[a.transport]}`;
  if (a.duration) s += `, set up to stand for ${labelFor("duration", a.duration).toLowerCase()}`;
  return `${s}.`;
}
