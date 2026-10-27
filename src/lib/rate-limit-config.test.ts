import { describe, expect, it } from "vitest";
import { isUpstashRateLimitConfigured, RATE_LIMITS } from "./rate-limit-config";

describe("rate-limit-config", () => {
  it("defines production limit profiles", () => {
    expect(RATE_LIMITS.sofLoginEmail.limit).toBeLessThan(RATE_LIMITS.sofLoginIp.limit);
    expect(RATE_LIMITS.contact.limit).toBeGreaterThan(0);
  });

  it("detects Upstash env pair", () => {
    const prevUrl = process.env.UPSTASH_REDIS_REST_URL;
    const prevToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    expect(isUpstashRateLimitConfigured()).toBe(false);
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    expect(isUpstashRateLimitConfigured()).toBe(true);
    process.env.UPSTASH_REDIS_REST_URL = prevUrl;
    process.env.UPSTASH_REDIS_REST_TOKEN = prevToken;
  });
});
