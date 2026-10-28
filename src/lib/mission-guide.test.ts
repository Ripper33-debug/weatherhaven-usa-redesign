import { describe, expect, it } from "vitest";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import {
  answersFromParams,
  guideContactPrefill,
  isComplete,
  pairings,
  QUESTIONS,
  recommend,
  type GuideAnswers,
} from "@/lib/mission-guide";

const top = (a: Required<GuideAnswers>, n = 3) => recommend(a).slice(0, n).map((r) => r.slug);

describe("mission guide", () => {
  it("puts the TRECC first for a fast, trailer-borne command post", () => {
    expect(top({ mission: "command", climate: "temperate", people: "9-25", transport: "road", duration: "rapid" })[0]).toBe("trecc");
  });

  it("suggests polar tents for a small remote science team and never the −30°C-rated Airmax LP", () => {
    const recs = recommend({ mission: "research", climate: "polar", people: "1-8", transport: "remote", duration: "rapid" });
    expect(recs.slice(0, 2).map((r) => r.slug)).toEqual(expect.arrayContaining(["endurance", "polar-chief"]));
    expect(recs.map((r) => r.slug)).not.toContain("airbeam-lp");
  });

  it("puts MEX-26 in the top three for airlifted vehicle maintenance", () => {
    expect(top({ mission: "maintenance", climate: "hot", people: "26-100", transport: "air", duration: "months" })).toContain("mex-26");
  });

  it("leaves MEX-26 out of anything that isn't maintenance", () => {
    const recs = recommend({ mission: "command", climate: "hot", people: "26-100", transport: "air", duration: "months" });
    expect(recs.map((r) => r.slug)).not.toContain("mex-26");
  });

  it("favors soft-wall camp systems for a large, long camp", () => {
    expect(top({ mission: "living", climate: "temperate", people: "500+", transport: "sea", duration: "years" })).toEqual(
      expect.arrayContaining(["series-4"]),
    );
  });

  it("returns real systems with reasons for every combination of answers", () => {
    const [m, c, p, t, d] = QUESTIONS.map((q) => q.options.map((o) => o.id));
    let combos = 0;
    for (const mission of m)
      for (const climate of c)
        for (const people of p)
          for (const transport of t)
            for (const duration of d) {
              const a = { mission, climate, people, transport, duration } as Required<GuideAnswers>;
              const recs = recommend(a);
              expect(recs.length).toBeGreaterThanOrEqual(2);
              for (const r of recs.slice(0, 3)) {
                expect(PRODUCT_CONTENT[r.slug]).toBeDefined();
                expect(r.reasons.length).toBeGreaterThan(0);
                expect(r.fit).toBeGreaterThan(0);
                expect(r.fit).toBeLessThanOrEqual(100);
              }
              for (const pr of pairings(a, recs.slice(0, 3).map((r) => r.slug))) expect(PRODUCT_CONTENT[pr.slug]).toBeDefined();
              combos++;
            }
    expect(combos).toBe(6 * 6 * 5 * 5 * 3);
  });

  it("reads only valid answers from the URL", () => {
    const params = new URLSearchParams("mission=medical&climate=moon&people=26-100");
    const a = answersFromParams((k) => params.get(k));
    expect(a).toEqual({ mission: "medical", people: "26-100" });
    expect(isComplete(a)).toBe(false);
  });

  it("builds a contact prefill naming the top system", () => {
    const a = { mission: "medical", climate: "hot", people: "26-100", transport: "air", duration: "months" } as const;
    const recs = recommend(a);
    const p = guideContactPrefill(a, recs);
    expect(p.system).toBe(recs[0].slug);
    expect(p.message).toContain("Medical care");
    expect((p.subject ?? "").length).toBeLessThanOrEqual(160);
  });
});
