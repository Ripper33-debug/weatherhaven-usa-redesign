import { describe, expect, it } from "vitest";
import { resolvePostLoginPath, sanitizeRedirectTo } from "./post-login";

describe("post-login", () => {
  it("sanitizes open redirects", () => {
    expect(sanitizeRedirectTo("?redirectTo=//evil.com")).toBe("/");
    expect(sanitizeRedirectTo("?redirectTo=/admin")).toBe("/admin");
  });

  it("sends admins to /admin when no redirect", () => {
    expect(resolvePostLoginPath("/", { isAdmin: true })).toBe("/admin");
    expect(resolvePostLoginPath("/", { isAdmin: false })).toBe("/");
  });

  it("blocks non-admin redirect to protected routes", () => {
    expect(resolvePostLoginPath("/admin", { isAdmin: false })).toBe("/");
    expect(resolvePostLoginPath("/admin", { isAdmin: true })).toBe("/admin");
    expect(resolvePostLoginPath("/contact", { isAdmin: false })).toBe("/contact");
  });
});
