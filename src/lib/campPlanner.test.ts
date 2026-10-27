import { describe, expect, it } from "vitest";
import { MISSION_BUILDER_DEFAULTS } from "@/lib/missionBuilder";
import { PRODUCTS } from "@/lib/products";
import {
  buildCampPlanContactPrefill,
  campPlanMinimumReady,
  forceTierFromPersonnel,
  generateCampPlan,
  parsePersonnelCount,
} from "./campPlanner";

describe("campPlanner", () => {
  it("parses personnel", () => {
    expect(parsePersonnelCount("36")).toBe(36);
    expect(parsePersonnelCount("")).toBe(0);
  });

  it("maps force tiers", () => {
    expect(forceTierFromPersonnel(12)).toBe("small");
    expect(forceTierFromPersonnel(80)).toBe("platoon");
    expect(forceTierFromPersonnel(120)).toBe("company");
    expect(forceTierFromPersonnel(400)).toBe("battalion");
  });

  it("requires minimum fields", () => {
    expect(campPlanMinimumReady(MISSION_BUILDER_DEFAULTS)).toBe(false);
    expect(
      campPlanMinimumReady({
        ...MISSION_BUILDER_DEFAULTS,
        environment: "arctic",
        primaryFunction: "c2",
        personnelCount: "24",
      }),
    ).toBe(true);
  });

  it("generates arctic C2 package with cold-weather line", () => {
    const plan = generateCampPlan(
      {
        ...MISSION_BUILDER_DEFAULTS,
        environment: "arctic",
        primaryFunction: "c2",
        personnelCount: "24",
      },
      PRODUCTS,
    );
    expect(plan).not.toBeNull();
    expect(plan!.lineItems.some((i) => i.slug === "endurance")).toBe(true);
    expect(plan!.zones.some((z) => z.id === "command")).toBe(true);
    expect(plan!.rom.label).toBe("Pricing available upon program alignment");
    expect(plan!.rom.minMillionsUsd).toBe(0);
  });

  it("generates large logistics camp with camp power", () => {
    const plan = generateCampPlan(
      {
        ...MISSION_BUILDER_DEFAULTS,
        environment: "desert",
        primaryFunction: "logistics",
        personnelCount: "150",
        deploymentDuration: "12plus",
      },
      PRODUCTS,
    );
    expect(plan).not.toBeNull();
    expect(plan!.lineItems.some((i) => i.slug === "ateps")).toBe(true);
  });

  it("builds contact prefill from camp plan", () => {
    const state = {
      ...MISSION_BUILDER_DEFAULTS,
      environment: "arctic",
      primaryFunction: "c2",
      personnelCount: "24",
    };
    const plan = generateCampPlan(state, PRODUCTS)!;
    const prefill = buildCampPlanContactPrefill(state, plan);
    expect(prefill.inquiry_type).toBe("Technical Exchange");
    expect(prefill.program).toContain(plan.packageId);
    expect(prefill.message).toContain("Camp package ID");
  });
});
