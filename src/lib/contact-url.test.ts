import { describe, expect, it } from "vitest";
import { contactUrl } from "./contact-url";

describe("contactUrl", () => {
  it("returns base path without params", () => {
    expect(contactUrl()).toBe("/contact");
  });

  it("encodes system and inquiry", () => {
    expect(contactUrl({ system: "hqss", inquiry: "Demo Request" })).toBe(
      "/contact?system=hqss&inquiry=Demo+Request",
    );
  });

  it("includes deployment notes", () => {
    const url = contactUrl({ deployment: "12.3, 45.6" });
    expect(url).toContain("deployment=12.3");
  });
});
