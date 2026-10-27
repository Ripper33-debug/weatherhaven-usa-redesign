import { Resend } from "resend";

const DEFAULT_FROM = "Weatherhaven Programs <onboarding@resend.dev>";

/** Verified sender in Resend (e.g. Weatherhaven Programs <noreply@yourdomain.com>). */
export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
}

/** Reply-to for customer transactional mail (program desk). */
export function getReplyTo(): string | undefined {
  const value =
    process.env.EMAIL_REPLY_TO?.trim() ||
    process.env.NOTIFY_TO?.trim() ||
    process.env.ADMIN_EMAIL?.trim();
  return value || undefined;
}

/** Internal distribution list for lead / access notifications. */
export function getNotifyTo(): string | undefined {
  return process.env.NOTIFY_TO?.trim() || process.env.ADMIN_EMAIL?.trim() || undefined;
}

export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

export function requireResendClient(): Resend {
  const client = getResendClient();
  if (!client) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return client;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
