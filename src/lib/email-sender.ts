/** Resend SMTP credentials for Supabase Auth (recovery / magic link mail). */
export const RESEND_SMTP = {
  host: "smtp.resend.com",
  port: 465,
  username: "resend",
} as const;

/** Parse `Weatherhaven Programs <noreply@domain.com>` or bare `noreply@domain.com`. */
export function parseEmailFrom(raw: string): { name?: string; email: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { email: "" };
  }

  const bracketMatch = trimmed.match(/^(.+?)\s*<([^>]+)>$/);
  if (bracketMatch) {
    const name = bracketMatch[1].replace(/^["']|["']$/g, "").trim();
    return {
      name: name || undefined,
      email: bracketMatch[2].trim(),
    };
  }

  return { email: trimmed };
}

export type EmailSetupSnapshot = {
  resendConfigured: boolean;
  emailFrom: string;
  senderName: string;
  senderEmail: string;
  siteUrl: string;
  resetRedirectUrl: string;
  notifyTo?: string;
};

/** Non-secret values operators copy into Resend / Supabase dashboards. */
export function buildEmailSetupSnapshot(params: {
  emailFrom: string;
  resendConfigured: boolean;
  siteUrl: string;
  notifyTo?: string;
}): EmailSetupSnapshot {
  const parsed = parseEmailFrom(params.emailFrom);
  const siteUrl = params.siteUrl.replace(/\/$/, "");

  return {
    resendConfigured: params.resendConfigured,
    emailFrom: params.emailFrom,
    senderName: parsed.name ?? "Weatherhaven Programs",
    senderEmail: parsed.email,
    siteUrl,
    resetRedirectUrl: `${siteUrl}/auth/reset-password`,
    notifyTo: params.notifyTo,
  };
}
