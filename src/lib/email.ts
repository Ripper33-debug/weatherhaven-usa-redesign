import { platformAccessApprovedEmail, platformInviteEmail } from "@/lib/shield-email";
import {
  platformAccessApprovedEmailText,
  platformInviteEmailText,
} from "@/lib/shield-email-text";
import { sendCustomerEmail } from "@/lib/send-customer-email";
import { getSiteUrl } from "@/lib/site-url";

export async function sendWelcomeEmail(params: {
  to: string;
  password: string;
  siteUrl?: string;
}) {
  const loginUrl = `${(params.siteUrl ?? getSiteUrl()).replace(/\/$/, "")}/login`;

  const result = await sendCustomerEmail({
    to: params.to,
    subject: "Weatherhaven Programs — Admin platform access approved",
    html: platformAccessApprovedEmail({
      email: params.to,
      password: params.password,
      loginUrl,
    }),
    text: platformAccessApprovedEmailText({
      email: params.to,
      password: params.password,
      loginUrl,
    }),
  });

  if (!result.ok) {
    if ("skipped" in result && result.skipped) {
      return { ok: false as const, skipped: true };
    }
    return { ok: false as const, error: "error" in result ? result.error : "Send failed" };
  }
  return { ok: true as const };
}

export function generateTempPassword() {
  return `WH-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export async function sendInviteEmail(params: { to: string; token: string; siteUrl: string }) {
  const acceptUrl = `${params.siteUrl.replace(/\/$/, "")}/accept-invite?token=${params.token}`;

  const result = await sendCustomerEmail({
    to: params.to,
    subject: "Weatherhaven Programs — Platform invitation",
    html: platformInviteEmail({ acceptUrl }),
    text: platformInviteEmailText({ acceptUrl }),
  });

  if (!result.ok) {
    if ("skipped" in result && result.skipped) {
      return { ok: false as const, skipped: true };
    }
    return { ok: false as const, error: "error" in result ? result.error : "Send failed" };
  }
  return { ok: true as const };
}
