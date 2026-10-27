import { cookies } from "next/headers";
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/csrf-constants";
import { secureCookieOptions } from "@/lib/cookie-options";
import { secureCompare } from "@/lib/secure-compare";

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@/lib/csrf-constants";

export function createCsrfToken(): string {
  return crypto.randomUUID();
}

export function csrfCookieOptions() {
  return secureCookieOptions({
    maxAge: 60 * 60 * 8,
  });
}

/** Machine-to-machine routes may skip CSRF when Bearer matches LEADS_ADMIN_TOKEN. */
export function isBearerAuthorized(request: Request): boolean {
  const token = process.env.LEADS_ADMIN_TOKEN?.trim();
  if (!token) return false;

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;

  return secureCompare(auth.slice(7).trim(), token);
}

/** Verify double-submit CSRF token (header must match httpOnly cookie). */
export async function verifyCsrfRequest(request: Request): Promise<boolean> {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return true;
  }
  if (isBearerAuthorized(request)) {
    return true;
  }

  const header = request.headers.get(CSRF_HEADER_NAME)?.trim();
  const cookieStore = await cookies();
  const cookie = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  if (!header || !cookie) return false;
  return secureCompare(header, cookie);
}
