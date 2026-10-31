import { describe, expect, it } from "vitest";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import { refHolds, type FactRef } from "@/lib/published-facts";
import { COMPARE_EXTRA_SPECS, COMPARE_ROWS, COMPARE_TYPES, comparableSystems } from "@/lib/shelter-compare";
import { sideBySide, specRow } from "@/lib/spec-rows";
import { TRECC_RECORD, climateRows, fieldRecord, parseTemps, testedRefs, treccRecordSource } from "@/lib/tested";

const describeRef = (r: FactRef) => `${r.slug} ${r.field}${r.label ? ` "${r.label}"` : ""}: "${r.text}"`;

describe("every figure on the tested and compare pages traces to product-content", () => {
  it("rejects a ref that does not match", () => {
    expect(refHolds({ slug: "mecc", field: "spec", label: "Setup", text: "1 person" })).toBe(false);
    expect(refHolds({ slug: "mecc", field: "spec", label: "Nope", text: "2 people" })).toBe(false);
  });

  it("tested page refs", () => {
    const broken = testedRefs().filter((r) => !refHolds(r)).map(describeRef);
    expect(broken).toEqual([]);
  });

  it("compare matrix refs, and only the type's own systems", () => {
    const broken = COMPARE_ROWS.flatMap((row) => row.refs).filter((r) => !refHolds(r)).map(describeRef);
    expect(broken).toEqual([]);
    const shown = new Set(COMPARE_TYPES.flatMap((t) => t.systems));
    expect(COMPARE_ROWS.flatMap((row) => row.refs).filter((r) => !shown.has(r.slug))).toEqual([]);
  });

  it("compare's extra spec rows only restate numbers the system publishes", () => {
    for (const [slug, specs] of Object.entries(COMPARE_EXTRA_SPECS)) {
      const published = JSON.stringify(PRODUCT_CONTENT[slug]);
      for (const s of specs) {
        for (const n of s.value.match(/\d[\d,.]*/g) ?? []) expect(published, `${slug} ${s.label}: ${n}`).toContain(n);
      }
    }
  });

  it("TRECC record items appear in the TRECC specs or story", () => {
    for (const r of TRECC_RECORD) expect(treccRecordSource(r.in)).toContain(r.text);
  });
});

describe("climate ratings", () => {
  it("parses published temperatures in either unit and minus sign", () => {
    expect(parseTemps("−51°C to +49°C")).toEqual([
      { value: -51, unit: "C" },
      { value: 49, unit: "C" },
    ]);
    expect(parseTemps("−40°F to +120°F").map((t) => t.value)).toEqual([-40, 120]);
  });

  it("lists every system that publishes a rating, coldest first, with conversions", () => {
    const rows = climateRows();
    expect(rows.map((r) => r.slug)).toEqual(["rdmss", "bmecc", "polar-chief", "trecc", "airbeam-lp"]);
    const trecc = rows.find((r) => r.slug === "trecc")!;
    expect(trecc.published).toBe("−40 °F to +120 °F");
    expect(trecc.converted).toBe("−40 °C to +49 °C");
    expect(rows.find((r) => r.slug === "polar-chief")?.maxC).toBeNull();
  });
});

describe("field record", () => {
  it("only uses stories and notes with third-party sources", () => {
    const { stories, notes } = fieldRecord();
    expect(stories.map((s) => s.id)).toEqual(["beyond-epica", "nasa-endurance", "109th-airlift-wing"]);
    expect(notes.every((n) => n.source)).toBe(true);
  });
});

describe("side-by-side rows", () => {
  it("groups differently named specs onto one row", () => {
    expect(specRow("Packed size")).toBe("Packed");
    expect(specRow("Stowed footprint")).toBe("Packed");
    expect(specRow("Weight / packed")).toBe("Packed");
    expect(specRow("Operating temperature")).toBe("Temperature rating");
    expect(specRow("Interconnection")).toBe("Interconnection");
  });

  it("covers all 17 systems and every spec of both", () => {
    const systems = comparableSystems();
    expect(systems).toHaveLength(Object.keys(PRODUCT_CONTENT).length);
    const rows = sideBySide(PRODUCT_CONTENT.mecc.specs, PRODUCT_CONTENT.rdmss.specs);
    expect(rows.flatMap((r) => r.a)).toHaveLength(PRODUCT_CONTENT.mecc.specs.length);
    expect(rows.flatMap((r) => r.b)).toHaveLength(PRODUCT_CONTENT.rdmss.specs.length);
    expect(rows[0].row).toBe("Packed");
  });
});
