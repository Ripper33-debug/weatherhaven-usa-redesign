/**
 * Exports every published figure on the site into one CSV for engineering to check, one row per
 * figure, with a "Possible issue" column for contradictions the script can spot on its own
 * (an area that doesn't match its dimensions, two different multipliers, different temperature
 * ranges for one system, a mission-builder figure that isn't on the product page).
 *
 *   npx vite-node --config vitest.config.ts scripts/content/spec-checklist.ts <out.csv>
 *
 * Sources: src/lib/product-content.ts (specs, highlights, configurations, key figure, description,
 * overview), src/lib/system-sizes.ts (the to-scale drawings), src/lib/shelter-compare.ts (Compare)
 * and the mission builder's "why it fits" facts in src/lib/mission-guide.ts.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import { SYSTEM_SIZES, footprintFt2 } from "@/lib/system-sizes";
import { COMPARE_EXTRA_SPECS, COMPARE_ROWS } from "@/lib/shelter-compare";

type Row = { system: string; section: string; label: string; value: string; source: string; issue: string };
const rows: Row[] = [];
const nameOf = (slug: string) => PRODUCT_CONTENT[slug]?.name ?? slug;
const sourcesOf = (slug: string) => (PRODUCT_CONTENT[slug]?.sources ?? []).join(" ; ");
const hasDigit = (s: string) => /\d/.test(s);
const add = (slug: string, section: string, label: string, value: string, issue = "") =>
  rows.push({ system: nameOf(slug), section, label, value, source: sourcesOf(slug), issue });

const num = (s: string) => Number(s.replace(/,/g, ""));
const round = (n: number) => Math.round(n * 10) / 10;
/** "181 × 97 × 82 in" → [181, 97, 82] */
const dimsIn = (s: string): [number, number, number | undefined] | null => {
  const m = s.match(/(\d[\d,.]*)\s*×\s*(\d[\d,.]*)(?:\s*×\s*(\d[\d,.]*))?\s*in\b/);
  return m ? [num(m[1]), num(m[2]), m[3] ? num(m[3]) : undefined] : null;
};
const ft2Of = (s: string) => {
  const m = s.match(/(\d[\d,.]*)\s*ft²/);
  return m ? num(m[1]) : null;
};
const tempRanges = (s: string) => [...s.matchAll(/([−-]\d+)\s*°\s*([CF])\s*to\s*\+?(\d+)\s*°\s*[CF]/g)].map((m) => `${m[1].replace("-", "−")}°${m[2]} to +${m[3]}°${m[2]}`);
const multipliers = (s: string) => {
  const out: string[] = [];
  for (const m of s.matchAll(/(\d+(?:\.\d+)?)\s*×\s*(?:its|the)/g)) out.push(`${m[1]}×`);
  if (/nearly triple|triples?\b/i.test(s)) out.push("about 3×");
  // "More than double its width" is about width, not floor area.
  if (/\bdoubles?\b|more than double/i.test(s) && !/double its width/i.test(s)) out.push("about 2×");
  return out;
};

// ---- product pages ----------------------------------------------------------------------------
for (const [slug, p] of Object.entries(PRODUCT_CONTENT)) {
  const issues = new Map<string, string>(); // key: "section|label" → issue
  const all = [
    p.description,
    p.keySpec,
    ...p.overview,
    ...p.highlights.map((h) => `${h.title} ${h.description}`),
    ...p.specs.map((s) => `${s.label} ${s.value}`),
    ...p.configurations.map((c) => `${c.title} ${c.description}`),
  ];

  // Variant areas vs the variant's own deployed dimensions (e.g. TRECC-T 86 ft² vs 181 × 97 in).
  for (const c of p.configurations) {
    const dep = c.description.match(/deployed\s+([^.;]+)/i);
    const d = dep ? dimsIn(dep[1]) : null;
    if (!d) continue;
    const area = (d[0] * d[1]) / 144;
    const spec = p.specs.find((s) => s.label.startsWith(c.title) && ft2Of(s.value) !== null);
    if (!spec) continue;
    const stated = ft2Of(spec.value)!;
    if (Math.abs(area - stated) / stated > 0.1) {
      const other = p.specs.find((s) => s !== spec && ft2Of(s.value) !== null && Math.abs(ft2Of(s.value)! - area) / area < 0.05);
      issues.set(
        `spec|${spec.label}`,
        `Says ${stated} ft², but ${c.title}'s deployed ${d[0]} × ${d[1]} in is ${round(area)} ft²${other ? `; matches "${other.label}" (${ft2Of(other.value)} ft²), so the two may be swapped` : ""}.`,
      );
    }
  }

  // Deployed width × packed length vs the stated floor area (expandable containers).
  const width = p.specs.find((s) => /deployed width/i.test(s.label));
  const packed = p.specs.find((s) => /packed size/i.test(s.label));
  const areaSpec = p.specs.find((s) => /floor area/i.test(s.label));
  const wIn = width?.value.match(/(\d[\d,]*)\s*in/)?.[1];
  const lIn = packed ? dimsIn(packed.value)?.[0] : undefined;
  const statedArea = areaSpec ? ft2Of(areaSpec.value) : null;
  if (wIn && lIn && statedArea) {
    const area = (num(wIn) * lIn) / 144;
    if (Math.abs(area - statedArea) / statedArea > 0.03) {
      issues.set(
        `spec|${areaSpec!.label}`,
        `Deployed width ${wIn} in × packed length ${lIn} in = ${round(area)} ft², not ${statedArea} ft². Check whether ${statedArea} ft² includes something else (e.g. a different model height or a vestibule).`,
      );
    }
  }

  // Different growth multipliers in different places (e.g. "nearly triple" vs "about 2.5×").
  const mults = [...new Set(all.flatMap(multipliers))];
  const multIssue = mults.length > 1 ? `Different growth figures on the same page: ${mults.join(", ")}.` : "";

  // Different temperature ranges for one system.
  const temps = [...new Set(all.flatMap(tempRanges))];
  const celsius = temps.filter((t) => t.includes("°C"));
  const fahrenheit = temps.filter((t) => t.includes("°F"));
  const tempIssue = celsius.length > 1 || fahrenheit.length > 1 ? `More than one temperature range: ${temps.join("; ")}.` : "";

  const flag = (section: string, label: string, text: string) => {
    const parts = [issues.get(`${section}|${label}`) ?? ""];
    if (multIssue && multipliers(text).length) parts.push(multIssue);
    if (tempIssue && tempRanges(text).length) parts.push(tempIssue);
    return parts.filter(Boolean).join(" ");
  };

  add(slug, "Systems cards and menu: key figure", "Key figure", p.keySpec, flag("key", "", p.keySpec));
  if (hasDigit(p.description) || multipliers(p.description).length) add(slug, "Product page: description", "Description", p.description, flag("desc", "", p.description));
  p.overview.filter((o) => hasDigit(o) || multipliers(o).length).forEach((o, i) => add(slug, "Product page: overview", `Paragraph ${i + 1}`, o, flag("overview", "", o)));
  for (const h of p.highlights) add(slug, "Product page: highlights", h.title, h.description, flag("highlight", h.title, `${h.title} ${h.description}`));
  for (const s of p.specs) add(slug, "Product page: specifications", s.label, s.value, flag("spec", s.label, `${s.label} ${s.value}`));
  for (const c of p.configurations) if (hasDigit(c.description)) add(slug, "Product page: configurations", c.title, c.description, flag("config", c.title, c.description));
}

// ---- to-scale drawings ------------------------------------------------------------------------
for (const s of SYSTEM_SIZES) {
  const area = footprintFt2(s.deployed, s.profile);
  let issue = "";
  if (s.areaPublished && Math.abs(area - s.areaPublished) / s.areaPublished > 0.1) {
    issue = `Drawing is ${round(area)} ft² from its dimensions, but labelled ${s.areaPublished} ft².`;
  }
  const specAreas = (PRODUCT_CONTENT[s.slug]?.specs ?? []).filter((x) => x.label.startsWith(s.name)).map((x) => ft2Of(x.value)).filter((x): x is number => x !== null);
  for (const a of specAreas) {
    if (Math.abs(area - a) / a > 0.1) issue = `${issue} Drawing is ${round(area)} ft² from ${s.deployedNote}, but the spec table says ${a} ft² for ${s.name}.`.trim();
  }
  // The drawing says how many times it grows (deployed ÷ packed footprint); compare with the copy's claim.
  if (s.packed) {
    const ratio = footprintFt2(s.deployed, s.profile) / footprintFt2(s.packed);
    const p = PRODUCT_CONTENT[s.slug];
    const claims = p ? [...new Set([p.description, p.keySpec, ...p.overview, ...p.highlights.map((h) => h.description)].flatMap(multipliers))] : [];
    for (const c of claims) {
      const claimed = Number(c.replace(/[^\d.]/g, ""));
      if (Math.abs(claimed - ratio) > 0.3) issue = `${issue} The drawing grows ${round(ratio)}× (packed to deployed footprint), but the copy says ${c.replace("about ", "")}${c.includes("3") ? ' ("nearly triple")' : ""}.`.trim();
    }
  }
  add(s.slug, "Product page: packed and deployed size drawing", `${s.name}: packed`, s.packedNote);
  add(s.slug, "Product page: packed and deployed size drawing", `${s.name}: deployed`, `${s.deployedNote}${s.areaPublished ? ` (${s.areaPublished} ft² labelled)` : ""}`, issue);
}

// ---- compare -----------------------------------------------------------------------------------
for (const row of COMPARE_ROWS) {
  for (const ref of row.refs) add(ref.slug, `Compare: shelter types, ${row.label}`, ref.prefix ?? ref.label ?? row.label, ref.text);
}
for (const [slug, specs] of Object.entries(COMPARE_EXTRA_SPECS)) {
  for (const s of specs) add(slug, "Compare: any two systems (restated from configurations)", s.label, s.value);
}

// ---- mission builder facts ----------------------------------------------------------------------
const guide = readFileSync(path.join(process.cwd(), "src/lib/mission-guide.ts"), "utf8");
const blocks = guide.split(/\n {2}\{\n {4}slug: "/).slice(1);
for (const b of blocks) {
  const slug = b.slice(0, b.indexOf('"'));
  const facts = b.slice(b.indexOf("facts: {"), b.indexOf("\n    },", b.indexOf("facts: {")));
  const p = PRODUCT_CONTENT[slug];
  const pageText = p
    ? [p.description, p.keySpec, ...p.overview, ...p.highlights.flatMap((h) => [h.title, h.description]), ...p.specs.flatMap((s) => [s.label, s.value]), ...p.configurations.flatMap((c) => [c.title, c.description])].join(" ")
    : "";
  for (const m of facts.matchAll(/^\s*"?([\w:+-]+)"?:\s*"((?:[^"\\]|\\.)*)",?$/gm)) {
    const [, key, text] = m;
    if (!hasDigit(text)) continue;
    const missing = [...text.matchAll(/\d[\d,.]*/g)].map((x) => x[0].replace(/[.,]$/, "")).filter((n) => !pageText.includes(n));
    add(slug, `Mission builder: why it fits (${key})`, key, text, missing.length ? `Not on the product page: ${[...new Set(missing)].join(", ")}. Check the figure and its source.` : "");
  }
}

// ---- write -------------------------------------------------------------------------------------
const header = ["System", "Page / section", "Label", "Value as shown", "Source cited", "Possible issue", "Correct? (Y/N)", "Correct value", "Checked by"];
const csv = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const out = [header, ...rows.map((r) => [r.system, r.section, r.label, r.value, r.source, r.issue, "", "", ""])].map((r) => r.map(csv).join(",")).join("\n");
const target = process.argv[2] ?? "spec-checklist.csv";
writeFileSync(target, `﻿${out}\n`);
console.log(`${rows.length} figures, ${rows.filter((r) => r.issue).length} flagged → ${target}`);
