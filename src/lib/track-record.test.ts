import { describe, expect, it } from "vitest";
import confirmed from "@/data/confirmed-pins.json";
import { DEPLOYMENT_STORIES } from "@/lib/field-stories";
import { FIELDED_SITES, PUBLIC_CONTRACTS, SITE_REGIONS, SITE_TYPES } from "@/lib/track-record";

describe("track record", () => {
  it("lists every confirmed site once, each with a known region and type", () => {
    expect(FIELDED_SITES).toHaveLength((confirmed as unknown[]).length);
    expect(new Set(FIELDED_SITES.map((s) => s.id)).size).toBe(FIELDED_SITES.length);
    for (const s of FIELDED_SITES) {
      expect(SITE_REGIONS).toContain(s.region);
      expect(SITE_TYPES).toContain(s.type);
    }
  });

  it("files Antarctic stations under Antarctica", () => {
    const antarctic = FIELDED_SITES.filter((s) => /antarctica/i.test(s.place));
    expect(antarctic.length).toBeGreaterThan(0);
    expect(antarctic.every((s) => s.region === "Antarctica")).toBe(true);
  });

  it("gives every contract a source and links only to stories that exist", () => {
    const ids = new Set(DEPLOYMENT_STORIES.map((s) => s.id));
    for (const c of PUBLIC_CONTRACTS) {
      expect(c.sources.length).toBeGreaterThan(0);
      if (c.story) expect(ids.has(c.story)).toBe(true);
    }
  });
});
