import { describe, expect, it } from "vitest";
import {
  containsHtmlOrScript,
  validateEmailField,
  validateOptionalStringField,
  validateStringField,
} from "./api-validation";

describe("api-validation", () => {
  it("validates email format", () => {
    expect(validateEmailField("user@example.com").ok).toBe(true);
    expect(validateEmailField("not-an-email").ok).toBe(false);
  });

  it("rejects HTML in strings", () => {
    expect(validateStringField("<script>alert(1)</script>", "Message").ok).toBe(false);
    expect(containsHtmlOrScript("hello <b>world</b>")).toBe(true);
  });

  it("enforces max length", () => {
    expect(validateStringField("a".repeat(501), "Field").ok).toBe(false);
    expect(validateStringField("a".repeat(500), "Field").ok).toBe(true);
  });

  it("allows optional empty fields", () => {
    expect(validateOptionalStringField("", "Program").ok).toBe(true);
    expect(validateOptionalStringField(undefined, "Program").ok).toBe(true);
  });
});
