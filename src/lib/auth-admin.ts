/** Server-side admin emails from ADMIN_EMAIL or comma-separated ADMIN_EMAILS */
export function getAdminEmails(): string[] {
  const multi = process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (multi?.length) return multi;
  const single = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return single ? [single] : [];
}

export function getAdminEmail(): string | undefined {
  return getAdminEmails()[0];
}

/** Password-only admin login uses the primary operator email from env. */
export function resolveAdminLoginEmail(explicitEmail?: string | null): string | null {
  const trimmed = explicitEmail?.trim().toLowerCase();
  if (trimmed) return trimmed;
  return getAdminEmail() ?? null;
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const admins = getAdminEmails();
  return admins.length > 0 && admins.includes(normalized);
}
