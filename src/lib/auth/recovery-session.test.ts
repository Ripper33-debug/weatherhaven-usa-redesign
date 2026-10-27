import { describe, expect, it } from "vitest";
import { parseRecoveryHash, safeAuthRedirectPath } from "@/lib/auth/recovery-session";

describe("parseRecoveryHash", () => {
  it("reads access and refresh tokens from hash", () => {
    expect(
      parseRecoveryHash("#access_token=abc&refresh_token=def&type=recovery"),
    ).toEqual({ access_token: "abc", refresh_token: "def" });
  });

  it("returns null when tokens missing", () => {
    expect(parseRecoveryHash("#type=recovery")).toBeNull();
    expect(parseRecoveryHash("")).toBeNull();
  });
});

describe("safeAuthRedirectPath", () => {
  it("allows same-origin paths", () => {
    expect(safeAuthRedirectPath("/auth/reset-password")).toBe("/auth/reset-password");
  });

  it("rejects external paths", () => {
    expect(safeAuthRedirectPath("//evil.com")).toBe("/auth/reset-password");
    expect(safeAuthRedirectPath("https://evil.com")).toBe("/auth/reset-password");
  });
});
