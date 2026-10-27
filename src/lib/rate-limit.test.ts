import { describe, expect, it } from "vitest";
import { rateLimitAllowedSync } from "./rate-limit";

describe("rateLimitAllowedSync (in-memory)", () => {
  it("allows requests under the limit", () => {
    const key = `test-${Date.now()}-a`;
    expect(rateLimitAllowedSync(key, { limit: 3, windowMs: 60_000 })).toBe(true);
    expect(rateLimitAllowedSync(key, { limit: 3, windowMs: 60_000 })).toBe(true);
    expect(rateLimitAllowedSync(key, { limit: 3, windowMs: 60_000 })).toBe(true);
  });

  it("blocks when limit exceeded", () => {
    const key = `test-${Date.now()}-b`;
    expect(rateLimitAllowedSync(key, { limit: 2, windowMs: 60_000 })).toBe(true);
    expect(rateLimitAllowedSync(key, { limit: 2, windowMs: 60_000 })).toBe(true);
    expect(rateLimitAllowedSync(key, { limit: 2, windowMs: 60_000 })).toBe(false);
  });
});
