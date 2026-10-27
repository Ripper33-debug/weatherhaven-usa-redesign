/** Parse Supabase implicit-flow tokens from a URL hash fragment. */
export function parseRecoveryHash(hash: string): { access_token: string; refresh_token: string } | null {
  const trimmed = hash.replace(/^#/, "").trim();
  if (!trimmed) return null;

  const params = new URLSearchParams(trimmed);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return null;

  return { access_token, refresh_token };
}

export function safeAuthRedirectPath(path: string | null | undefined, fallback = "/auth/reset-password"): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}
