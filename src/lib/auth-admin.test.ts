import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { getAdminEmails, isAdminEmail, resolveAdminLoginEmail } from "./auth-admin";

describe("auth-admin", () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env };
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_EMAILS;
  });

  afterEach(() => {
    process.env = env;
  });

  it("accepts single ADMIN_EMAIL", () => {
    process.env.ADMIN_EMAIL = "Admin@Example.com";
    expect(isAdminEmail("admin@example.com")).toBe(true);
    expect(isAdminEmail("other@example.com")).toBe(false);
  });

  it("accepts comma-separated ADMIN_EMAILS", () => {
    process.env.ADMIN_EMAILS = "a@example.com, b@example.com";
    expect(getAdminEmails()).toEqual(["a@example.com", "b@example.com"]);
    expect(isAdminEmail("b@example.com")).toBe(true);
  });

  it("resolves password-only login to primary admin email", () => {
    process.env.ADMIN_EMAIL = "ops@example.com";
    expect(resolveAdminLoginEmail()).toBe("ops@example.com");
    expect(resolveAdminLoginEmail("custom@example.com")).toBe("custom@example.com");
  });
});
