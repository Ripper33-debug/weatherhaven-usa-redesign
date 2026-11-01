import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { metaDescription, pageMeta } from "@/lib/page-meta";
import shareCards from "@/lib/share-cards.json";

describe("metaDescription", () => {
  it("keeps short descriptions as they are", () => {
    expect(metaDescription("Shelters for special operations.")).toBe("Shelters for special operations.");
  });

  it("cuts long ones at a word boundary with an ellipsis, within the limit", () => {
    const long =
      "Canada's Headquarters Shelter System gives each command post its operations area, planning area, offices and utility space, on Weatherhaven's RDMSS. Awarded in 2017, now in service with support options to 2042.";
    const d = metaDescription(long);
    expect(d.length).toBeLessThanOrEqual(158);
    expect(d.endsWith("…")).toBe(true);
    expect(long.startsWith(d.slice(0, -1))).toBe(true);
    expect(d).not.toMatch(/[,\s]…$/);
  });
});

describe("share cards", () => {
  it("every card in the manifest exists in public/", () => {
    for (const file of Object.values(shareCards)) expect(existsSync(join(process.cwd(), "public", file)), file).toBe(true);
  });

  it("a page with a card shares the card, not its raw photo", () => {
    const m = pageMeta({ title: "TRECC", description: "d", path: "/configurable-solutions/trecc", image: "/products/trecc.jpg" });
    expect(m.openGraph?.images).toEqual([{ url: "/og/system-trecc.jpg", width: 1200, height: 630, alt: "TRECC" }]);
  });

  it("a page without a card keeps its photo, then the homepage card", () => {
    const withPhoto = pageMeta({ title: "X", description: "d", path: "/nowhere", image: "/products/x.jpg" });
    expect(withPhoto.openGraph?.images).toEqual([{ url: "/products/x.jpg", alt: "X" }]);
    const plain = pageMeta({ title: "X", description: "d", path: "/nowhere" });
    expect(plain.openGraph?.images).toEqual([{ url: "/og-image.jpg", width: 1200, height: 630, alt: "X" }]);
  });
});
