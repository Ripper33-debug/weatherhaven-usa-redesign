import { timingSafeEqual } from "node:crypto";

/** Constant-time string comparison for secrets/tokens. */
export function secureCompare(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
