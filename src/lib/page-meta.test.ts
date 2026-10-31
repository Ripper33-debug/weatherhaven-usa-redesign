import { describe, expect, it } from "vitest";
import { metaDescription } from "@/lib/page-meta";

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
