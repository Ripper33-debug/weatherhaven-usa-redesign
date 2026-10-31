import { describe, expect, it } from "vitest";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import { KIND_FOR_SLUG } from "@/lib/camp-scene-plan";
import { QUESTIONS, type GuideAnswers } from "@/lib/mission-guide";
import {
  AIRCRAFT,
  airEstimate,
  campLogistics,
  floorFit,
  seaEstimate,
  setupEstimate,
  UNIT_BASIS,
  volumeFit,
  weightEstimate,
  type SystemLine,
  type UnitBasis,
} from "@/lib/plan-logistics";

const line = (key: string, count: number, name = key): SystemLine => ({ key, name, count, basis: UNIT_BASIS[key] });
const custom = (name: string, count: number, basis: UnitBasis): SystemLine => ({ key: name, name, count, basis });

/** Every text a product publishes (specs, configurations, highlights). */
function published(slug: string): string {
  const c = PRODUCT_CONTENT[slug];
  return JSON.stringify(c);
}

describe("packing helpers", () => {
  it("lays boxes on a floor either way round, without stacking", () => {
    // Airmax LP pack, 1.4 × 1.2 m, on a 463L pallet's 104 × 84 in usable deck: two fit turned sideways.
    expect(floorFit({ l: 55.1, w: 47.2 }, { l: 104, w: 84 })).toBe(2);
    // The 110-in Endurance bag is longer than the deck.
    expect(floorFit({ l: 110, w: 12 }, { l: 104, w: 84 })).toBe(0);
    expect(floorFit({ l: 110, w: 12 }, { l: 231, w: 91.75 })).toBe(14);
  });

  it("fills bagged volume at half the space and rounds down", () => {
    // 104 × 84 × 96 in = 485 ft³; half is 242.7 ft³, so five 42-ft³ Polar Chief loads.
    expect(volumeFit(42, { l: 104, w: 84, h: 96 })).toBe(5);
  });
});

describe("published basis", () => {
  it("covers every system the camp can place", () => {
    for (const slug of Object.keys(KIND_FOR_SLUG)) expect(UNIT_BASIS[slug], slug).toBeDefined();
    expect(UNIT_BASIS["trecc-sanitation"]).toBeDefined();
  });

  it("uses only weights the product pages publish", () => {
    for (const [slug, b] of Object.entries(UNIT_BASIS)) {
      const w = b.ship.weightLb;
      if (w === undefined || slug === "airbeam-lp" || slug === "polarhaven") continue;
      expect(published(slug), `${slug} ${w} lb`).toContain(new Intl.NumberFormat("en-US").format(w));
    }
    // Airmax LP publishes kilograms; Polarhaven an average per ft² (1.75 × the 12 × 16 ft unit).
    expect(published("airbeam-lp")).toContain("242.5 kg");
    expect(published("polarhaven")).toContain("1.75 lb per ft²");
    expect(UNIT_BASIS.polarhaven.ship.weightLb).toBe(1.75 * 12 * 16);
  });

  it("counts a 20-ft container as three 88-in pallet positions", () => {
    expect(UNIT_BASIS.mecc.ship.air?.positions).toBe(3);
    expect(UNIT_BASIS.bmecc.ship.air).toMatchObject({ positions: 3, perLoad: 2 });
  });

  it("leaves systems without a published packed size out of the count", () => {
    for (const slug of ["series-4", "mts", "airbeam-hp", "non-expandable-iso-containers", "trecc-sanitation"]) {
      expect(UNIT_BASIS[slug].ship.air, slug).toBeUndefined();
      expect(UNIT_BASIS[slug].ship.perTeu, slug).toBeUndefined();
    }
  });
});

describe("airlift", () => {
  it("fits six 20-ft containers on a C-17 and two on a C-130J-30", () => {
    expect(airEstimate([line("ehmecc", 6)], "c17").loads).toBe(1);
    expect(airEstimate([line("ehmecc", 7)], "c17").loads).toBe(2);
    expect(airEstimate([line("ehmecc", 6)], "c130").loads).toBe(3);
  });

  it("keeps containers off the C-130 unless Weatherhaven publishes it", () => {
    const e = airEstimate([line("mecc", 2), line("trecc", 1, "TRECC")], "c130");
    expect(e.loads).toBe(1);
    expect(e.excluded).toEqual([{ name: "mecc", count: 2, reason: "C-130 carriage not published for this system" }]);
  });

  it("starts a new aircraft when the payload runs out before the positions", () => {
    const heavy = custom("Heavy", 2, { ship: { packedAs: "test", weightLb: 30_000, air: { positions: 1, perLoad: 1, c130: true } } });
    expect(airEstimate([heavy], "c130").loads).toBe(2);
    expect(AIRCRAFT.c130.payloadLb).toBe(44_000);
  });

  it("counts positions but flags loads with no published weight", () => {
    const e = airEstimate([line("mex-26", 3, "MEX-26")], "c17");
    expect(e.positions).toBe(3);
    expect(e.weightLb).toBe(0);
    expect(e.weightMissing).toEqual(["MEX-26"]);
  });

  it("rounds packs up to whole pallets", () => {
    // Three Airmax LP main units at two per pallet: two pallets, 3 × 535 lb.
    const e = airEstimate([line("airbeam-lp", 3)], "c17");
    expect(e.positions).toBe(2);
    expect(e.weightLb).toBe(3 * 535);
  });

  it("names what it can't count", () => {
    const e = airEstimate([line("series-4", 2, "Series 4")], "c17");
    expect(e.loads).toBe(0);
    expect(e.excluded.map((x) => x.name)).toEqual(["Series 4"]);
  });

  it("puts packs longer than one pallet on two married pallets", () => {
    // The 110-in Endurance bag: too long for one 104-in deck, so a married pair (2 positions).
    const e = airEstimate([line("endurance", 4, "Endurance")], "c17");
    expect(e.excluded).toEqual([]);
    expect(e.positions).toBe(2);
    expect(e.loads).toBe(1);
  });
});

describe("sea and road", () => {
  it("rounds each system up to whole 20-ft containers, one truck each", () => {
    const s = seaEstimate([line("mecc", 3), line("trecc", 3), line("ateps", 1), line("bmecc", 3), line("series-4", 2, "Series 4")]);
    // 3 MECC + 2 (three TRECC pallets, two per container) + 1 (ATEPS is 91 in tall) + 2 (BMECC pairs).
    expect(s.teu).toBe(8);
    expect(s.trucks).toBe(8);
    expect(s.excluded.map((x) => x.name)).toEqual(["Series 4"]);
  });
});

describe("weight", () => {
  it("adds published weights, including systems whose packed size isn't published", () => {
    const w = weightEstimate([line("rdmss", 2, "RDMSS"), line("mex-26", 1, "MEX-26")]);
    expect(w.lb).toBe(2 * 1_426);
    expect(w.missing).toEqual(["MEX-26"]);
  });
});

describe("setup", () => {
  it("adds crew-time and rounds up to the half hour", () => {
    // 3 MECC × 2 people × 15 min = 90, 1 TRECC × 2 × 3 = 6: 96 crew-minutes, 2 crew-hours.
    const s = setupEstimate([line("mecc", 3), line("trecc", 1)]);
    expect(s.crewHours).toBe(2);
    expect(s.missing).toEqual([]);
  });

  it("lists systems without a published crew and time", () => {
    const s = setupEstimate([line("ehmecc", 1, "EHMECC"), line("series-4", 1, "Series 4")]);
    expect(s.crewHours).toBe(0);
    expect(s.missing).toEqual(["EHMECC", "Series 4"]);
  });
});

function* allAnswers(): Generator<Required<GuideAnswers>> {
  const [m, c, p, t, d] = QUESTIONS.map((q) => q.options.map((o) => o.id));
  for (const mission of m)
    for (const climate of c)
      for (const people of p)
        for (const transport of t)
          for (const duration of d) yield { mission, climate, people, transport, duration } as Required<GuideAnswers>;
}

describe("every plan", () => {
  it("produces whole, finite numbers and accounts for every unit", () => {
    for (const a of allAnswers()) {
      const l = campLogistics(a);
      const units = l.plan.units.length;
      expect(l.lines.reduce((t, x) => t + x.count, 0)).toBe(units);
      for (const e of [l.air.c17, l.air.c130]) {
        expect(Number.isInteger(e.loads)).toBe(true);
        expect(e.loads).toBeLessThanOrEqual(units);
      }
      expect(Number.isInteger(l.sea.teu)).toBe(true);
      expect(Number.isFinite(l.footprint.floorFt2)).toBe(true);
      expect(l.footprint.site.m2).toBeGreaterThan(0);
    }
  });
});
