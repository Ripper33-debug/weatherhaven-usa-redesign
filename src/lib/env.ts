import { isUpstashRateLimitConfigured } from "@/lib/rate-limit-config";

const REQUIRED_IN_PRODUCTION = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_EMAIL",
  "NEXT_PUBLIC_SITE_URL",
] as const;

/** Log missing env vars once at startup in production (does not throw during build). */
export function warnOnMissingProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    console.warn(`[env] Missing recommended production variables: ${missing.join(", ")}`);
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    console.warn("[env] RESEND_API_KEY is not set — transactional emails will be skipped.");
  }

  if (!process.env.UPSTASH_REDIS_REST_URL?.trim()) {
    console.warn("[env] UPSTASH_REDIS_REST_URL is not set — using in-memory rate limits (not ideal on serverless).");
  } else if (!isUpstashRateLimitConfigured()) {
    console.warn("[env] UPSTASH_REDIS_REST_TOKEN is missing — rate limits will fall back to in-memory.");
  }

  if (!process.env.SENTRY_DSN?.trim()) {
    console.warn("[env] SENTRY_DSN is not set — API errors will only appear in server logs.");
  }
}
