import { describe, expect, it } from "vitest";
import { isMarketingPage, isProductCatalogPath } from "./marketing-pages";

describe("marketing-pages", () => {
  it("treats public marketing routes as marketing", () => {
    expect(isMarketingPage("/")).toBe(true);
    expect(isMarketingPage("/contact")).toBe(true);
    expect(isMarketingPage("/capabilities")).toBe(true);
    expect(isMarketingPage("/mission-solution-builder")).toBe(true);
    expect(isMarketingPage("/news")).toBe(true);
    expect(isMarketingPage("/sof-solutions/request-access")).toBe(true);
  });

  it("excludes SOF secure workspace from marketing chrome", () => {
    expect(isMarketingPage("/sof-solutions/secure")).toBe(false);
    expect(isMarketingPage("/sof-solutions/secure/deployment-planner")).toBe(false);
  });

  it("excludes SOF login from marketing chrome", () => {
    expect(isMarketingPage("/sof-solutions/login")).toBe(false);
  });

  it("identifies product catalog paths", () => {
    expect(isProductCatalogPath("/configurable-solutions/softwall-command")).toBe(true);
    expect(isProductCatalogPath("/contact")).toBe(false);
  });
});
