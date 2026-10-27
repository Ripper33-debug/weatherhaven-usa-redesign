import { afterEach, describe, expect, it } from "vitest";
import { getEmailFrom, getNotifyTo, getReplyTo, isEmailConfigured } from "./email-config";

const env = process.env;

afterEach(() => {
  process.env = { ...env };
});

describe("email-config", () => {
  it("uses defaults when env is unset", () => {
    delete process.env.EMAIL_FROM;
    delete process.env.NOTIFY_TO;
    delete process.env.ADMIN_EMAIL;
    expect(getEmailFrom()).toContain("onboarding@resend.dev");
    expect(getNotifyTo()).toBeUndefined();
  });

  it("reads EMAIL_FROM and NOTIFY_TO", () => {
    process.env.EMAIL_FROM = "Test <test@example.com>";
    process.env.NOTIFY_TO = "leads@example.com";
    expect(getEmailFrom()).toBe("Test <test@example.com>");
    expect(getNotifyTo()).toBe("leads@example.com");
  });

  it("reads EMAIL_REPLY_TO with fallback to NOTIFY_TO", () => {
    delete process.env.EMAIL_REPLY_TO;
    process.env.NOTIFY_TO = "desk@example.com";
    expect(getReplyTo()).toBe("desk@example.com");
    process.env.EMAIL_REPLY_TO = "reply@example.com";
    expect(getReplyTo()).toBe("reply@example.com");
  });

  it("detects Resend configuration", () => {
    delete process.env.RESEND_API_KEY;
    expect(isEmailConfigured()).toBe(false);
    process.env.RESEND_API_KEY = "re_test";
    expect(isEmailConfigured()).toBe(true);
  });
});
