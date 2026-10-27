import { describe, expect, it } from "vitest";
import { isValidEmail, sanitizeString, validateRequired } from "./validate";

describe("validate", () => {
  it("sanitizes HTML", () => {
    expect(sanitizeString("<b>hello</b>")).toBe("hello");
  });

  it("validates email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
    expect(isValidEmail("bad")).toBe(false);
  });

  it("checks required fields", () => {
    expect(validateRequired({ name: "Jane" })).toBeNull();
    expect(validateRequired({ name: "" })).toBe("name is required");
  });
});
