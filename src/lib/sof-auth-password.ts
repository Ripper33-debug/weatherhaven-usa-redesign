import "server-only";

import { createHmac } from "node:crypto";

function sofPinSecret(): string {
  const secret = process.env.SOF_PIN_SECRET?.trim();
  if (!secret) {
    throw new Error("SOF_PIN_SECRET must be configured");
  }
  return secret;
}

/** Supabase password derived from the PIN (user only enters the 4 digits at login). */
export function passwordFromSofPin(pin: string): string {
  const digits = pin.replace(/\D/g, "").slice(0, 4);
  const digest = createHmac("sha256", sofPinSecret()).update(`sof:${digits}`).digest("base64url");
  return `WH.SOF.${digest.slice(0, 48)}`;
}

/** Legacy predictable format — kept for sign-in fallback on existing accounts. */
export function legacyPasswordFromSofPin(pin: string): string {
  const digits = pin.replace(/\D/g, "").slice(0, 4);
  return `WH.SOF.${digits}.ACCESS`;
}

/** Password candidates to try at SOF sign-in (new HMAC first, then legacy). */
export function sofPinPasswordCandidates(pin: string): string[] {
  const candidates: string[] = [];
  try {
    candidates.push(passwordFromSofPin(pin));
  } catch {
    // SOF_PIN_SECRET not configured — legacy accounts only until secret is set.
  }
  candidates.push(legacyPasswordFromSofPin(pin));
  return candidates;
}
