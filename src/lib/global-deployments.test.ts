import { describe, expect, it } from "vitest";
import {
  DEPLOYMENT_TOUR_THEATER_IDS,
  deploymentsForTheater,
  featuredDeploymentForTheater,
  getTheaterById,
  GLOBAL_DEPLOYMENTS,
  GLOBAL_DEPLOYMENT_STATS,
} from "./global-deployments";

describe("global-deployments", () => {
  it("loads Google My Maps import with expected volume", () => {
    expect(GLOBAL_DEPLOYMENTS.length).toBeGreaterThan(100);
    expect(GLOBAL_DEPLOYMENT_STATS.pins).toBe(GLOBAL_DEPLOYMENTS.length);
  });

  it("has deployments in every tour theater", () => {
    for (const id of DEPLOYMENT_TOUR_THEATER_IDS) {
      expect(deploymentsForTheater(id).length).toBeGreaterThan(0);
      expect(featuredDeploymentForTheater(id)).toBeDefined();
    }
  });

  it("resolves theaters by id", () => {
    expect(getTheaterById("centcom")?.label).toBe("CENTCOM");
  });

  it("includes Kabul coordinates from My Maps", () => {
    const kabul = GLOBAL_DEPLOYMENTS.find((d) => d.id === "afghanistan-nato-kabul-afghanistan");
    expect(kabul?.lat).toBeCloseTo(34.555, 2);
    expect(kabul?.lng).toBeCloseTo(69.207, 2);
    expect(kabul?.category).toBe("Defence/Peacekeeping");
  });
});
