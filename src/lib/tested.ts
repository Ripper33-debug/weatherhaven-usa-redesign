import { DEPLOYMENT_STORIES, FIELD_NOTES } from "@/lib/field-stories";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import type { FactRef } from "@/lib/published-facts";

/**
 * Data for /tested-and-proven. Every figure is a FactRef into product-content.ts or a field story,
 * so nothing here is typed in twice; published-facts.test.ts checks each ref still holds.
 */

/* ------------------------------------------------------------------ climate ratings */

/** Systems that publish a temperature rating, and the spec that carries it. */
export const CLIMATE_SPECS: { slug: string; label: string; kind: "range" | "comfortable-at" }[] = [
  { slug: "rdmss", label: "Operating temperature", kind: "range" },
  { slug: "bmecc", label: "Operating temperature", kind: "range" },
  { slug: "trecc", label: "Climate", kind: "range" },
  { slug: "airbeam-lp", label: "Temperature", kind: "range" },
  { slug: "polar-chief", label: "Comfortable ambient temperature", kind: "comfortable-at" },
];

type Temp = { value: number; unit: "C" | "F" };

/** Reads temperatures like "−51°C" or "+120°F" (Unicode or ASCII minus) out of a spec value. */
export function parseTemps(value: string): Temp[] {
  const out: Temp[] = [];
  for (const m of value.matchAll(/([−+-]?\d+(?:\.\d+)?)\s?°\s?([CF])/g)) {
    out.push({ value: Number(m[1].replace("−", "-")), unit: m[2] as "C" | "F" });
  }
  return out;
}

const toC = (t: Temp) => (t.unit === "C" ? t.value : ((t.value - 32) * 5) / 9);
const toF = (t: Temp) => (t.unit === "F" ? t.value : (t.value * 9) / 5 + 32);

/** "−40 °F", "+49 °C": the sign the way the published figures write it. */
export function fmtTemp(value: number, unit: "C" | "F"): string {
  const r = Math.round(value);
  const sign = r < 0 ? "−" : r > 0 ? "+" : "";
  return `${sign}${Math.abs(r)} °${unit}`;
}

export type ClimateRow = {
  slug: string;
  kind: "range" | "comfortable-at";
  /** In °C for the chart. `maxC` is null when only a low end is published. */
  minC: number;
  maxC: number | null;
  /** As published, then converted to the other unit. */
  published: string;
  converted: string;
};

export function climateRows(): ClimateRow[] {
  const rows: ClimateRow[] = [];
  for (const c of CLIMATE_SPECS) {
    const value = PRODUCT_CONTENT[c.slug]?.specs.find((s) => s.label === c.label)?.value;
    if (!value) continue;
    const temps = parseTemps(value);
    if (temps.length === 0) continue;
    const other = (t: Temp) => (t.unit === "C" ? "F" : "C");
    const conv = (t: Temp) => fmtTemp(t.unit === "C" ? toF(t) : toC(t), other(t));
    if (c.kind === "range" && temps.length >= 2) {
      const [lo, hi] = temps;
      rows.push({
        slug: c.slug,
        kind: "range",
        minC: toC(lo),
        maxC: toC(hi),
        published: `${fmtTemp(lo.value, lo.unit)} to ${fmtTemp(hi.value, hi.unit)}`,
        converted: `${conv(lo)} to ${conv(hi)}`,
      });
    } else {
      const [t] = temps;
      rows.push({
        slug: c.slug,
        kind: "comfortable-at",
        minC: toC(t),
        maxC: null,
        published: fmtTemp(t.value, t.unit),
        converted: conv(t),
      });
    }
  }
  return rows.sort((a, b) => a.minC - b.minC);
}

/** The chart's scale, in °C. Every published rating falls inside it. */
export const CLIMATE_SCALE = { minC: -60, maxC: 60, ticksC: [-60, -40, -20, 0, 20, 40, 60] } as const;

/* ------------------------------------------------------------------ wind and snow */

export const WIND_SNOW: { slug: string; wind?: FactRef; snow?: FactRef }[] = [
  {
    slug: "trecc",
    wind: { slug: "trecc", field: "spec", label: "Wind rating", text: "55 mph sustained / 75 mph gusts" },
  },
  {
    slug: "airbeam-lp",
    wind: { slug: "airbeam-lp", field: "spec", label: "Wind / snow", text: "95 km/h (Beaufort 10)" },
    snow: { slug: "airbeam-lp", field: "spec", label: "Wind / snow", text: "50 kg/m²" },
  },
  {
    slug: "rdmss",
    snow: { slug: "rdmss", field: "spec", label: "Snow load", text: "20 lb/ft²" },
  },
];

/* ------------------------------------------------------------------ setup */

const setup = (slug: string, text: string, label = "Setup"): FactRef => ({ slug, field: "spec", label, text });

/** Fastest first, by each system's published time. */
export const SETUP_ROWS: { slug: string; crew?: FactRef; time?: FactRef; note?: FactRef }[] = [
  { slug: "trecc", crew: setup("trecc", "2 personnel"), time: setup("trecc", "Under 3 min"), note: setup("trecc", "24 VDC actuators, manual backup") },
  { slug: "endurance", crew: setup("endurance", "1 person"), time: setup("endurance", "≈ 5 min"), note: setup("endurance", "erected from inside") },
  { slug: "airbeam-lp", crew: setup("airbeam-lp", "2 people recommended"), time: setup("airbeam-lp", "5–10 min") },
  { slug: "ehmecc", time: setup("ehmecc", "Under 10 min"), note: setup("ehmecc", "no tools; can deploy truck-mounted") },
  { slug: "ateps", crew: setup("ateps", "2 people"), time: setup("ateps", "under 10 min") },
  { slug: "mecc", crew: setup("mecc", "2 people"), time: setup("mecc", "10–15 min"), note: setup("mecc", "no special skills") },
  {
    slug: "rdmss",
    crew: setup("rdmss", "3 people", "Crew"),
    time: setup("rdmss", "Under 20 min (4-module); under 10 min (1–2 modules)"),
  },
  { slug: "polar-chief", crew: setup("polar-chief", "2 people"), time: setup("polar-chief", "≈ 20 min") },
  { slug: "polarhaven", time: setup("polarhaven", "≈ 30 min for a 12 × 16 ft unit") },
  { slug: "mex-26", crew: setup("mex-26", "10 people"), time: setup("mex-26", "3 hours or less"), note: setup("mex-26", "no special tools") },
  { slug: "hercon", crew: setup("hercon", "team of six"), time: setup("hercon", "Minutes"), note: setup("hercon", "no foundation") },
  {
    slug: "airbeam-hp",
    crew: setup("airbeam-hp", "Small team", "Setup / strike"),
    time: setup("airbeam-hp", "minutes", "Setup / strike"),
    note: setup("airbeam-hp", "no tools; reverse pumping to strike", "Setup / strike"),
  },
  { slug: "series-4", note: setup("series-4", "No tools or specialist skills") },
  { slug: "mts", note: setup("mts", "No tools or specialist training") },
];

/* ------------------------------------------------------------------ TRECC test record */

const treccStory = DEPLOYMENT_STORIES.find((s) => s.id === "trecc-us-army");

/**
 * TRECC's published test and trial record. Each item's `text` appears in the TRECC spec table or
 * the TRECC story (checked by the test). Weatherhaven publishes these; no third-party source is on
 * file, so the page says so.
 */
export const TRECC_RECORD: { title: string; text: string; in: "spec" | "story" }[] = [
  { title: "Environmental testing", text: "MIL-STD-810G", in: "spec" },
  { title: "Safety testing", text: "Aberdeen Test Center", in: "spec" },
  { title: "Technology readiness", text: "TRL 9 (TRECC-T)", in: "spec" },
  { title: "Field trials completed", text: "43", in: "story" },
  { title: "Army Expeditionary Warrior Experiments", text: "2022 and 2025", in: "story" },
  { title: "Exercises", text: "Project Convergence 2024 and Operation Lethal Eagle with the 101st Airborne Division", in: "story" },
  {
    title: "Development agreements",
    text: "an Other Transaction Agreement and a Cooperative Research and Development Agreement with DEVCOM",
    in: "story",
  },
];

/** The text the TRECC record items are checked against. */
export function treccRecordSource(where: "spec" | "story"): string {
  if (where === "spec") return PRODUCT_CONTENT.trecc.specs.map((s) => s.value).join(" ");
  if (!treccStory) return "";
  return [...treccStory.body, ...(treccStory.facts ?? []).map((f) => `${f.value} ${f.label}`)].join(" ");
}

export const CAPABILITIES_STATEMENT = {
  label: "Weatherhaven 2026 capabilities statement (PDF)",
  href: "https://usubc.org/wp-content/uploads/2026/08/Weatherhaven-2026-Capabilities-Statement-1.pdf",
};

/* ------------------------------------------------------------------ field record */

/** Stories and notes with third-party sources that show where systems have worked. */
export const FIELD_RECORD_STORY_IDS = ["beyond-epica", "nasa-endurance", "109th-airlift-wing"] as const;
export const FIELD_RECORD_NOTE_PLACES = ["Mount Brown South, Antarctica", "Tanquary Fiord, Nunavut"] as const;

export function fieldRecord() {
  const stories = FIELD_RECORD_STORY_IDS.flatMap((id) => DEPLOYMENT_STORIES.filter((s) => s.id === id && s.sources.length > 0));
  const notes = FIELD_RECORD_NOTE_PLACES.flatMap((place) => FIELD_NOTES.filter((n) => n.place === place && n.source));
  return { stories, notes };
}

/* ------------------------------------------------------------------ certification */

export const CERTIFICATION_ROWS: { slug: string; cert?: FactRef; life?: FactRef }[] = [
  {
    slug: "mecc",
    cert: { slug: "mecc", field: "spec", label: "Transport", text: "ISO and CSC certified; stacks 9 high" },
    life: { slug: "mecc", field: "spec", label: "Service life", text: "15–20 years in the field" },
  },
  { slug: "ehmecc", cert: { slug: "ehmecc", field: "spec", label: "Certification", text: "Full CSC; ISO stacking 3 high" } },
  { slug: "bmecc", cert: { slug: "bmecc", field: "spec", label: "Transport", text: "full CSC; stacks 9 high" } },
];

/** Every ref on the tested page, for the test. */
export function testedRefs(): FactRef[] {
  return [
    ...WIND_SNOW.flatMap((r) => [r.wind, r.snow]),
    ...SETUP_ROWS.flatMap((r) => [r.crew, r.time, r.note]),
    ...CERTIFICATION_ROWS.flatMap((r) => [r.cert, r.life]),
  ].filter((r): r is FactRef => Boolean(r));
}
