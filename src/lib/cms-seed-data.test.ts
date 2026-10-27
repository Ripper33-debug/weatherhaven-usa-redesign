import { describe, expect, it } from "vitest";
import {
  CMS_NEWS_COVER_SEEDS,
  CMS_PRODUCT_COVER_SEEDS,
  CMS_SEED_CDN,
  cmsNewsCoverSeedSlugs,
  cmsProductCoverSeedSlugs,
} from "./cms-seed-data";

describe("cms-seed-data", () => {
  it("maps all catalog slugs to CDN covers", () => {
    expect(cmsProductCoverSeedSlugs()).toHaveLength(17);
    for (const slug of cmsProductCoverSeedSlugs()) {
      expect(CMS_PRODUCT_COVER_SEEDS[slug]).toMatch(new RegExp(`^${CMS_SEED_CDN}/`));
    }
  });

  it("maps sample news slugs to CDN covers", () => {
    expect(cmsNewsCoverSeedSlugs()).toHaveLength(3);
    expect(CMS_NEWS_COVER_SEEDS["mission-solution-builder-launch"]).toContain("softshelter");
  });
});
