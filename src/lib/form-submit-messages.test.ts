import { describe, expect, it } from "vitest";
import { accessRequestEmailWarning, FORM_EMAIL_NOT_CONFIGURED_WARNING } from "@/lib/form-submit-messages";
import { RESOURCE_DOCUMENTS } from "@/lib/resources";

describe("accessRequestEmailWarning", () => {
  it("returns warning when email skipped", () => {
    expect(accessRequestEmailWarning({ emailSkipped: true })).toBe(FORM_EMAIL_NOT_CONFIGURED_WARNING);
  });

  it("prefers explicit warning from API", () => {
    expect(accessRequestEmailWarning({ warning: "Custom", emailSkipped: true })).toBe("Custom");
  });
});

describe("RESOURCE_DOCUMENTS", () => {
  it("lists valid external links", () => {
    for (const doc of RESOURCE_DOCUMENTS) {
      expect(doc.href).toMatch(/^https:\/\//);
      expect(doc.title.trim().length).toBeGreaterThan(0);
    }
  });
});
