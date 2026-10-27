import { NextResponse } from "next/server";
import { applyApiRateLimit } from "@/lib/api-rate-limit";
import { createCsrfToken, csrfCookieOptions } from "@/lib/csrf";
import { CSRF_COOKIE_NAME } from "@/lib/csrf-constants";

/** Issue a CSRF token (httpOnly cookie + JSON body for client header). */
export async function GET(request: Request) {
  const limited = applyApiRateLimit(request);
  if (limited) return limited;
  const token = createCsrfToken();
  const response = NextResponse.json({ token });
  response.cookies.set(CSRF_COOKIE_NAME, token, csrfCookieOptions());
  return response;
}
