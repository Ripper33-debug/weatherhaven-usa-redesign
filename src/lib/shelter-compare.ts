import { PRODUCT_CONTENT, PRODUCT_FAMILIES, type ProductFamily } from "@/lib/product-content";
import type { ProductSpec } from "@/lib/products";
import type { FactRef } from "@/lib/published-facts";
import { FAMILY_ORDER } from "@/lib/site-nav";

/**
 * Data for /configurable-solutions/compare. The shelter-type matrix lists, for each row, what the
 * representative systems of each type publish; every entry is a FactRef into product-content.ts
 * (checked by published-facts.test.ts). An empty cell reads "Not published".
 */

export const COMPARE_TYPES: { family: ProductFamily; systems: string[] }[] = [
  { family: "expandable", systems: ["mecc", "ehmecc", "trecc"] },
  { family: "softwall", systems: ["rdmss", "series-4"] },
  { family: "inflatable", systems: ["airbeam-lp", "airbeam-hp"] },
  { family: "polar", systems: ["polarhaven", "polar-chief"] },
];

export function compareTypeHeader(family: ProductFamily) {
  const f = PRODUCT_FAMILIES.find((x) => x.id === family);
  return { name: f?.name ?? family, summary: f?.summary ?? "" };
}

const spec = (slug: string, label: string, text: string, prefix?: string): FactRef => ({ slug, field: "spec", label, text, prefix });

export type CompareRow = { id: string; label: string; refs: FactRef[] };

export const COMPARE_ROWS: CompareRow[] = [
  {
    id: "packed",
    label: "Packed",
    refs: [
      { slug: "mecc", field: "description", text: "a 20-ft ISO container" },
      spec("ehmecc", "Packed size", "240 × 96 × 96 in (standard 20-ft ISO)"),
      { slug: "trecc", field: "highlight", label: "Trailer, vehicle or pallet", text: "Light tactical trailer, M1289 JLTV trailer or a single 463L pallet" },
      spec("rdmss", "1-module", "925 lb in 6 bags", "1-module"),
      spec("rdmss", "4-module", "2,156 lb in 12 bags", "4-module"),
      spec("airbeam-lp", "Packed (main unit)", "1.4 × 1.2 × 1.0 m", "Main unit"),
      spec("polar-chief", "Weight / packed", "220 lb; 42 ft³ in 3 bags"),
    ],
  },
  {
    id: "floor",
    label: "Deployed size",
    refs: [
      spec("mecc", "Deployed floor area", "420 ft² (39 m²)"),
      spec("ehmecc", "Floor area / volume", "420 ft² / 4,661 ft³"),
      spec("trecc", "TRECC-T (light tactical trailer)", "86 ft²", "TRECC-T"),
      spec("trecc", "TRECC-M (M1289 JLTV trailer)", "121.6 ft²", "TRECC-M"),
      spec("trecc", "TRECC-P (one 463L pallet)", "132 ft²", "TRECC-P"),
      spec("rdmss", "1-module", "245 ft²", "1-module"),
      spec("rdmss", "4-module", "995 ft²", "4-module"),
      spec("series-4", "Widths", "8, 10, 12, 14, 16, 18, 20, 22, 24, 26 and 30 ft; any length", "Widths"),
      spec("airbeam-lp", "Deployed (main unit)", "600 × 570 × 280 cm", "Main unit"),
      spec("airbeam-lp", "Size range", "3–6 m wide, 2 m length increments"),
      spec("airbeam-hp", "Widths", "3, 4, 5 and 6 m; length in 2 m increments", "Widths"),
      spec("polarhaven", "Widths", "8, 10, 12, 14, 16, 18 and 20 ft; length unlimited", "Widths"),
      spec("polar-chief", "Size", "14 ft across / 15.5 ft diagonal"),
    ],
  },
  {
    id: "setup",
    label: "Setup",
    refs: [
      spec("mecc", "Setup", "2 people, 10–15 min, no special skills"),
      spec("ehmecc", "Setup", "Under 10 min, no tools; can deploy truck-mounted"),
      spec("trecc", "Setup", "Under 3 min, 2 personnel; 24 VDC actuators, manual backup"),
      spec("rdmss", "Setup", "Under 20 min (4-module); under 10 min (1–2 modules)"),
      spec("rdmss", "Crew", "3 people", "Crew"),
      spec("series-4", "Setup", "No tools or specialist skills"),
      spec("airbeam-lp", "Setup", "5–10 min, 2 people recommended"),
      spec("airbeam-hp", "Setup / strike", "Small team, minutes, no tools; reverse pumping to strike"),
      spec("polarhaven", "Setup", "≈ 30 min for a 12 × 16 ft unit"),
      spec("polar-chief", "Setup", "≈ 20 min, 2 people"),
    ],
  },
  {
    id: "transport",
    label: "Moves by",
    refs: [
      spec("mecc", "Transport", "ISO and CSC certified; stacks 9 high; forklift, crane, helicopter or PLS"),
      spec("ehmecc", "Air transport", "C-130, C-17, C-5, A400M; helicopter underslung"),
      spec("trecc", "Helicopter", "Under 60 in stowed height; CH-47 airlift compatible"),
    ],
  },
  {
    id: "climate",
    label: "Temperature rating",
    refs: [
      spec("trecc", "Climate", "−40°F to +120°F"),
      spec("rdmss", "Operating temperature", "−51°C to +49°C"),
      spec("airbeam-lp", "Temperature", "−30°C to +50°C"),
      spec("polar-chief", "Comfortable ambient temperature", "−50°C (−58°F)", "Comfortable ambient temperature"),
    ],
  },
  {
    id: "wind-snow",
    label: "Wind and snow",
    refs: [
      spec("trecc", "Wind rating", "55 mph sustained / 75 mph gusts", "Wind"),
      spec("rdmss", "Snow load", "20 lb/ft²", "Snow load"),
      spec("airbeam-lp", "Wind / snow", "95 km/h (Beaufort 10) / 50 kg/m²", "Wind / snow"),
      { slug: "airbeam-hp", field: "description", text: "more rigidity and wind and snow resistance than low-pressure designs" },
    ],
  },
  {
    id: "life",
    label: "Service life",
    refs: [spec("mecc", "Service life", "15–20 years in the field")],
  },
  {
    id: "roles",
    label: "Typical roles",
    refs: [
      { slug: "mecc", field: "highlight", label: "Command post to clinic", text: "command post, clinic, workshop, office or accommodation module" },
      { slug: "ehmecc", field: "description", text: "headquarters and large command posts" },
      { slug: "trecc", field: "description", text: "command post, workshop, clinic or sanitation unit" },
      { slug: "rdmss", field: "description", text: "the system behind Canada's HQSS program" },
      { slug: "series-4", field: "highlight", label: "Tropics to Antarctica", text: "Kitchens, accommodation, workshops and command space" },
      { slug: "airbeam-lp", field: "configuration", label: "Medical and triage", text: "Medical and triage" },
      { slug: "airbeam-lp", field: "configuration", label: "Command and accommodation", text: "Command and accommodation" },
      { slug: "polarhaven", field: "description", text: "long-term polar base camps" },
      { slug: "polar-chief", field: "description", text: "a camp kitchen, lab or office" },
    ],
  },
];

/** A row's refs for one shelter type, grouped by system in the type's order. */
export function cellFor(row: CompareRow, systems: string[]): { slug: string; refs: FactRef[] }[] {
  return systems
    .map((slug) => ({ slug, refs: row.refs.filter((r) => r.slug === slug) }))
    .filter((c) => c.refs.length > 0);
}

/* ------------------------------------------------------------------ any two systems */

export type ComparableSystem = {
  slug: string;
  name: string;
  family: ProductFamily;
  familyName: string;
  keySpec: string;
  specs: ProductSpec[];
};

/**
 * Figures a system publishes outside its spec table (in its configurations), restated as spec rows so
 * the side-by-side doesn't say "Not published" for them. Every number here appears in the same
 * system's product-content entry (checked in published-facts.test.ts).
 */
export const COMPARE_EXTRA_SPECS: Record<string, ProductSpec[]> = {
  trecc: [
    { label: "Packed size", value: "TRECC-T 114 × 94.5 × 57 in; TRECC-M 89 × 84 × 57 in; TRECC-P 104 × 84 × 60 in" },
    { label: "Height", value: "Stowed 57 in (TRECC-T, TRECC-M), 60 in (TRECC-P); deployed 82 in (TRECC-T), 78 in (TRECC-M)" },
    { label: "Weight", value: "1,620 lb (TRECC-T); 2,200 lb (TRECC-M); 2,205 lb tare (TRECC-P)" },
  ],
};

/** All 17 systems in catalog order, with their published spec tables. */
export function comparableSystems(): ComparableSystem[] {
  return FAMILY_ORDER.flatMap((slug) => {
    const p = PRODUCT_CONTENT[slug];
    if (!p) return [];
    const familyName = PRODUCT_FAMILIES.find((f) => f.id === p.family)?.name ?? p.family;
    const specs = [...p.specs, ...(COMPARE_EXTRA_SPECS[slug] ?? [])];
    return [{ slug, name: p.name, family: p.family, familyName, keySpec: p.keySpec, specs }];
  });
}
