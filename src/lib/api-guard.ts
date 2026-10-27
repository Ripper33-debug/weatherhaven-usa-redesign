import { NextResponse } from "next/server";
import { verifyCsrfRequest } from "@/lib/csrf";
import { captureRouteError } from "@/lib/monitoring";
import { checkRateLimit, getRequestIp } from "@/lib/rateLimit";

export function tooManyRequestsResponse() {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 });
}

export function invalidCsrfResponse() {
  return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverErrorResponse(route: string, error: unknown, status = 500) {
  captureRouteError(route, error);
  const body: { error: string; details?: string } = { error: "Something went wrong" };
  if (process.env.NODE_ENV !== "production") {
    body.details = error instanceof Error ? error.message : String(error);
  }
  return NextResponse.json(body, { status });
}

/** Rate-limit any API request (10/min per IP, in-memory). */
export function enforceApiRateLimit(request: Request): NextResponse | null {
  const ip = getRequestIp(request);
  if (!checkRateLimit(ip)) return tooManyRequestsResponse();
  return null;
}

/** CSRF check for POST/PATCH/PUT/DELETE API handlers. */
export async function guardCsrfMutation(request: Request): Promise<NextResponse | null> {
  if (!(await verifyCsrfRequest(request))) {
    return invalidCsrfResponse();
  }
  return null;
}

/** CSRF check for POST/PATCH/PUT/DELETE API handlers. */
export async function guardApiMutation(request: Request): Promise<NextResponse | null> {
  return guardCsrfMutation(request);
}

/** Rate limit only (for GET handlers). */
export function guardApiRead(request: Request): NextResponse | null {
  return enforceApiRateLimit(request);
}
