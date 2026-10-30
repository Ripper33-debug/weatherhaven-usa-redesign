import type { ProductSpec } from "@/lib/products";

/**
 * Spec labels differ from system to system ("Packed size", "Packed", "Stowed footprint"), so the
 * side-by-side groups them into shared rows. Labels that match no group get a row of their own.
 * Order matters: the first match wins ("Weight / packed" is a packed figure).
 */
export const SPEC_GROUPS: { row: string; match: RegExp }[] = [
  { row: "Packed", match: /^(packed|stowed|weight \/ packed|packing|shipping)/i },
  { row: "Deployed size", match: /^(deployed|floor area|size$|sizes|widths|size range|\d-module|trecc-[tmp]|expansion)/i },
  { row: "Height", match: /height/i },
  { row: "Weight", match: /weight/i },
  { row: "Setup", match: /^(setup|crew)/i },
  { row: "Temperature rating", match: /(temperature|climate)/i },
  { row: "Wind and snow", match: /(wind|snow)/i },
  { row: "Transport", match: /(transport|helicopter|handling)/i },
  { row: "Construction", match: /(frame|cover|construction|materials|insulation|foundation)/i },
  { row: "Certification and testing", match: /(certification|testing)/i },
  { row: "Service life", match: /service life/i },
];

export function specRow(label: string): string {
  return SPEC_GROUPS.find((g) => g.match.test(label))?.row ?? label;
}

export type SideBySideRow = { row: string; a: ProductSpec[]; b: ProductSpec[] };

/** Rows for two systems: the shared groups first, in group order, then any other labels. */
export function sideBySide(a: ProductSpec[], b: ProductSpec[]): SideBySideRow[] {
  const rows = new Map<string, SideBySideRow>();
  const add = (side: "a" | "b", s: ProductSpec) => {
    const key = specRow(s.label);
    if (!rows.has(key)) rows.set(key, { row: key, a: [], b: [] });
    rows.get(key)![side].push(s);
  };
  a.forEach((s) => add("a", s));
  b.forEach((s) => add("b", s));
  const order = SPEC_GROUPS.map((g) => g.row);
  const rank = (r: string) => {
    const i = order.indexOf(r);
    return i === -1 ? order.length : i;
  };
  return [...rows.values()].sort((x, y) => rank(x.row) - rank(y.row));
}
