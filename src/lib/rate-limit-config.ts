/** Shared rate-limit windows — enforced via Upstash on Vercel when env vars are set. */

export const RATE_LIMITS = {
  contact: { limit: 8, windowMs: 60_000 },
  requestAccess: { limit: 6, windowMs: 60_000 },
  sofRequestAccess: { limit: 6, windowMs: 60_000 },
  leadEvents: { limit: 40, windowMs: 60_000 },
  sofLoginIp: { limit: 12, windowMs: 15 * 60_000 },
  sofLoginEmail: { limit: 5, windowMs: 15 * 60_000 },
} as const;

export function isUpstashRateLimitConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim() && process.env.UPSTASH_REDIS_REST_TOKEN?.trim());
}
