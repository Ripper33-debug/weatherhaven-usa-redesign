import { afterEach, describe, expect, it } from "vitest";
import {
  isSofAccessRequest,
  isValidSofPinInput,
  pathRequiresSofAuth,
  SOF_PROGRAM_MARKER,
} from "./sof-auth";
import { generateSofAccessPin } from "./sof-auth-pin";
import { legacyPasswordFromSofPin, passwordFromSofPin } from "./sof-auth-password";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
});

describe("sof-auth", () => {
  it("detects SOF program marker", () => {
    expect(isSofAccessRequest(SOF_PROGRAM_MARKER)).toBe(true);
    expect(isSofAccessRequest("general")).toBe(false);
  });

  it("generates four-digit pins", () => {
    const pin = generateSofAccessPin();
    expect(pin).toMatch(/^\d{4}$/);
  });

  it("validates pin input", () => {
    expect(isValidSofPinInput("1234")).toBe(true);
    expect(isValidSofPinInput("12")).toBe(false);
  });

  it("guards secure routes", () => {
    expect(pathRequiresSofAuth("/sof-solutions/secure")).toBe(true);
    expect(pathRequiresSofAuth("/sof-solutions")).toBe(false);
  });
});

describe("sof-auth-password", () => {
  it("derives stable HMAC passwords from pin", () => {
    process.env.SOF_PIN_SECRET = "test-pepper";
    expect(passwordFromSofPin("4829")).toMatch(/^WH\.SOF\./);
    expect(passwordFromSofPin("4829")).toBe(passwordFromSofPin("4829"));
    expect(passwordFromSofPin("4829")).not.toBe(legacyPasswordFromSofPin("4829"));
  });

  it("keeps legacy password format for migration", () => {
    expect(legacyPasswordFromSofPin("4829")).toBe("WH.SOF.4829.ACCESS");
  });
});
