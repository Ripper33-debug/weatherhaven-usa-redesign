import { describe, expect, it } from "vitest";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import { pairings, QUESTIONS, rankPartial, recommend, type GuideAnswers, type QuestionKey } from "@/lib/mission-guide";
import { campPlan, KIND_FOR_SLUG, KIND_SIZE, outerSize, type CampUnit, type Rect } from "@/lib/camp-scene-plan";

function* allAnswers(): Generator<Required<GuideAnswers>> {
  const [m, c, p, t, d] = QUESTIONS.map((q) => q.options.map((o) => o.id));
  for (const mission of m)
    for (const climate of c)
      for (const people of p)
        for (const transport of t)
          for (const duration of d) yield { mission, climate, people, transport, duration } as Required<GuideAnswers>;
}

function footprint(u: CampUnit): Rect {
  // Guy lines and end equipment included (outerSize).
  const s = outerSize(KIND_SIZE[u.kind]);
  const across = Math.abs(Math.sin(u.rot)) > 0.5;
  const hx = (across ? s.w : s.l) / 2;
  const hz = (across ? s.l : s.w) / 2;
  return { minX: u.x - hx, maxX: u.x + hx, minZ: u.z - hz, maxZ: u.z + hz };
}

const overlaps = (a: Rect, b: Rect, gap = 0.5) =>
  a.minX < b.maxX + gap && b.minX < a.maxX + gap && a.minZ < b.maxZ + gap && b.minZ < a.maxZ + gap;

describe("3D camp plan", () => {
  it("ranks a finished plan exactly like the recommendation", () => {
    for (const a of allAnswers()) {
      expect(rankPartial(a).map((r) => r.slug)).toEqual(recommend(a).map((r) => r.slug));
    }
  });

  it("builds every finished camp around the builder's best match, with its pairings", () => {
    for (const a of allAnswers()) {
      const recs = recommend(a);
      const plan = campPlan(a);
      expect(plan.lead?.slug).toBe(recs[0].slug);
      expect(plan.tags[0]).toMatchObject({ slug: recs[0].slug, role: "best" });
      const expected = pairings(a, recs.slice(0, 3).map((r) => r.slug)).map((p) => p.name);
      for (const t of plan.tags.slice(1)) expect(expected).toContain(t.name);
    }
  });

  it("never lets two shelters overlap, or the arrival area sit on the camp", () => {
    for (const a of allAnswers()) {
      const plan = campPlan(a);
      const ids = new Set(plan.units.map((u) => u.id));
      expect(ids.size).toBe(plan.units.length);
      for (let i = 0; i < plan.units.length; i++) {
        for (let j = i + 1; j < plan.units.length; j++) {
          const hit = overlaps(footprint(plan.units[i]), footprint(plan.units[j]));
          if (hit) throw new Error(`${plan.units[i].id} overlaps ${plan.units[j].id} for ${JSON.stringify(a)}`);
        }
      }
      const site = plan.transportSite!;
      const b = plan.bounds;
      const inside = site.x > b.minX && site.x < b.maxX && site.z > b.minZ && site.z < b.maxZ;
      expect(inside).toBe(false);
    }
  });

  it("draws every system with a model and links it to a product page", () => {
    for (const slug of Object.keys(KIND_FOR_SLUG)) expect(PRODUCT_CONTENT[slug]).toBeDefined();
    for (const a of allAnswers()) {
      for (const t of campPlan(a).tags) expect(PRODUCT_CONTENT[t.slug]).toBeDefined();
    }
  });

  it("starts empty and grows answer by answer without moving what is already built", () => {
    expect(campPlan({}).units).toHaveLength(0);
    const order: QuestionKey[] = ["mission", "climate", "people", "transport", "duration"];
    const full: Required<GuideAnswers> = { mission: "command", climate: "polar", people: "101-500", transport: "air", duration: "years" };
    let a: GuideAnswers = {};
    let prev = campPlan(a);
    for (const k of order) {
      a = { ...a, [k]: full[k] };
      const next = campPlan(a);
      if (next.lead?.slug === prev.lead?.slug) {
        for (const u of prev.units.filter((x) => x.role === "main")) {
          const same = next.units.find((x) => x.id === u.id);
          expect(same).toBeDefined();
          expect([same!.x, same!.z]).toEqual([u.x, u.z]);
        }
      }
      prev = next;
    }
    expect(prev.units.length).toBeGreaterThan(5);
    expect(prev.props.some((p) => p.kind === "fence")).toBe(true);
    expect(prev.summary).toMatch(/^Illustration of the camp so far: /);
  });

  it("shows only the lead shelter until the headcount is known", () => {
    const plan = campPlan({ mission: "living", climate: "temperate" });
    expect(plan.units).toHaveLength(1);
    expect(plan.units[0]).toMatchObject({ x: 0, z: 0, role: "main" });
  });

  it("adds site works by how long the camp stands", () => {
    const base = { mission: "command", climate: "temperate", people: "26-100", transport: "road" } as const;
    const kinds = (d: "rapid" | "months" | "years") => new Set(campPlan({ ...base, duration: d }).props.map((p) => p.kind));
    expect([...kinds("rapid")]).toEqual(["gen"]);
    expect(kinds("months").has("walk")).toBe(true);
    expect(kinds("months").has("fence")).toBe(false);
    expect(kinds("years").has("fence")).toBe(true);
    expect(kinds("years").has("pad")).toBe(true);
  });
});
