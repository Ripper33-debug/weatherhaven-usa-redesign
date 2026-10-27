/** User-facing copy when transactional email is skipped or fails after a successful save. */

export const FORM_EMAIL_NOT_CONFIGURED_WARNING =
  "Your message was saved. Our programs desk will follow up within 48 hours. A confirmation email could not be sent from this site yet — use Contact if you need immediate acknowledgment.";

export const FORM_EMAIL_CONFIRM_FAILED_WARNING =
  "Your message was saved and our team will follow up. The confirmation email could not be delivered — check spam or contact us directly if you need immediate confirmation.";

export const MISSION_PLANNING_DISCLAIMER =
  "Planning tool — outputs help scope a discussion with Weatherhaven engineering. They are not a formal quote, ROM, or contract offer.";

export function accessRequestEmailWarning(data: {
  emailSent?: boolean;
  emailSkipped?: boolean;
  warning?: string;
}): string | null {
  if (data.warning?.trim()) return data.warning.trim();
  if (data.emailSkipped || data.emailSent === false) return FORM_EMAIL_NOT_CONFIGURED_WARNING;
  return null;
}

export function contactLeadEmailWarning(warning?: string): string | null {
  return warning?.trim() || null;
}

/** Hide confirmation-email bullet when delivery may have failed. */
export function filterConfirmationBullets(lines: readonly string[], hasEmailWarning: boolean): string[] {
  if (!hasEmailWarning) return [...lines];
  return lines.filter((line) => !line.toLowerCase().includes("confirmation email"));
}
