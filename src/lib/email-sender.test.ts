import { describe, expect, it } from "vitest";
import { buildEmailSetupSnapshot, parseEmailFrom } from "@/lib/email-sender";

describe("parseEmailFrom", () => {
  it("parses name and address", () => {
    expect(parseEmailFrom('Weatherhaven Programs <noreply@weatherhavenusa.com>')).toEqual({
      name: "Weatherhaven Programs",
      email: "noreply@weatherhavenusa.com",
    });
  });

  it("parses bare email", () => {
    expect(parseEmailFrom("noreply@example.com")).toEqual({ email: "noreply@example.com" });
  });
});

describe("buildEmailSetupSnapshot", () => {
  it("builds redirect URL and sender fields", () => {
    const snapshot = buildEmailSetupSnapshot({
      emailFrom: "Weatherhaven Programs <noreply@weatherhavenusa.com>",
      resendConfigured: true,
      siteUrl: "https://weatherhavenusa.com/",
      notifyTo: "leads@weatherhavenusa.com",
    });

    expect(snapshot.senderEmail).toBe("noreply@weatherhavenusa.com");
    expect(snapshot.resetRedirectUrl).toBe("https://weatherhavenusa.com/auth/reset-password");
    expect(snapshot.resendConfigured).toBe(true);
  });
});
