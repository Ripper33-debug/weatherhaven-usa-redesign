import { describe, expect, it } from "vitest";
import { buildDeploymentStory } from "./deployment-story";
import type { GlobalDeployment } from "./global-deployments";

const sample: GlobalDeployment = {
  id: "afghanistan-nato-kabul-afghanistan",
  lat: 34.555,
  lng: 69.207,
  label: "Kabul, Afghanistan",
  title: "Afghanistan (NATO)",
  address: "Kabul, Afghanistan",
  category: "Defence/Peacekeeping",
  systemSlug: "hqss",
  systemCode: "HQSS",
  environment: "Defence",
  theaterId: "centcom",
  summary: "Defence/Peacekeeping deployment — Kabul, Afghanistan.",
};

describe("deployment-story", () => {
  it("uses bundled story copy for flagship pins", () => {
    const story = buildDeploymentStory({
      ...sample,
      storyHeadline: "Forward headquarters, Kabul",
      storyNarrative: "HQSS tactical headquarters supported NATO expeditionary command.",
    });
    expect(story.headline).toMatch(/Kabul/i);
    expect(story.narrative).toMatch(/HQSS/i);
  });

  it("prefers CMS override over bundled copy", () => {
    const story = buildDeploymentStory(
      { ...sample, storyHeadline: "Bundled", storyNarrative: "Bundled text." },
      {
        deployment_id: sample.id,
        headline: "CMS headline",
        narrative: "CMS narrative.",
        image_slug: null,
        cover_image_url: null,
        featured: true,
        updated_at: new Date().toISOString(),
      },
    );
    expect(story.headline).toBe("CMS headline");
    expect(story.narrative).toBe("CMS narrative.");
    expect(story.cmsEdited).toBe(true);
  });

  it("generates narrative and image sources for standard pins", () => {
    const story = buildDeploymentStory({
      ...sample,
      id: "generic-pin",
      label: "Test City",
      title: "Test Program",
    });
    expect(story.curated).toBe(false);
    expect(story.narrative).toMatch(/Test Program/);
    expect(story.imageSources.length).toBeGreaterThan(0);
  });
});
