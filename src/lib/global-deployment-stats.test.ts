import { describe, expect, it } from "vitest";
import { GLOBAL_DEPLOYMENT_STATS as DISPLAY_STATS } from "./global-deployment-stats";
import { GLOBAL_DEPLOYMENT_STATS, GLOBAL_DEPLOYMENTS } from "./global-deployments";

describe("global-deployment-stats", () => {
  it("matches imported deployment pin count", () => {
    expect(DISPLAY_STATS.pins).toBe(GLOBAL_DEPLOYMENTS.length);
    expect(GLOBAL_DEPLOYMENT_STATS.pins).toBe(GLOBAL_DEPLOYMENTS.length);
  });
});
