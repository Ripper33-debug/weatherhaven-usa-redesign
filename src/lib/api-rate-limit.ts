import { NextResponse } from "next/server";
import { clientIpFromRequest, rateLimitAllowed, RATE_LIMITS } from "@/lib/rate-limit";
import { checkRateLimit, getRequestIp } from "@/lib/rateLimit";

type RateLimitBucket = keyof typeof RATE_LIMITS;

/** Global in-memory cap (10/min per IP) — always applied as a backstop. */
export function applyApiRateLimit(request: Request): NextResponse | null {
  const ip = getRequestIp(request);
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  return null;
}

/** Named bucket limits (Upstash when configured, else in-memory). */
export async function applyNamedRateLimit(
  request: Request,
  bucket: RateLimitBucket,
): Promise<NextResponse | null> {
  const globalLimited = applyApiRateLimit(request);
  if (globalLimited) return globalLimited;

  const ip = clientIpFromRequest(request);
  const config = RATE_LIMITS[bucket];
  const allowed = await rateLimitAllowed(`${bucket}:${ip}`, config);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  return null;
}
