import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export { isUpstashRateLimitConfigured, RATE_LIMITS } from "@/lib/rate-limit-config";

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();

const limiterCache = new Map<string, Ratelimit>();

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const cacheKey = `${limit}:${windowMs}`;
  const cached = limiterCache.get(cacheKey);
  if (cached) return cached;

  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
  const limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
    prefix: "wh-ratelimit",
  });
  limiterCache.set(cacheKey, limiter);
  return limiter;
}

/** In-memory rate limiter (used for global API cap regardless of Upstash). */
export function rateLimitAllowedMemory(
  key: string,
  { limit = 12, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): boolean {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/** Returns true when the request is allowed under the limit (Upstash when configured, else in-memory). */
export async function rateLimitAllowed(
  key: string,
  { limit = 12, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): Promise<boolean> {
  const upstash = getUpstashLimiter(limit, windowMs);
  if (upstash) {
    const { success } = await upstash.limit(key);
    return success;
  }
  return rateLimitAllowedMemory(key, { limit, windowMs });
}

/** @deprecated Use async rateLimitAllowed */
export function rateLimitAllowedSync(
  key: string,
  opts: { limit?: number; windowMs?: number } = {},
): boolean {
  return rateLimitAllowedMemory(key, opts);
}

export function clientIpFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
