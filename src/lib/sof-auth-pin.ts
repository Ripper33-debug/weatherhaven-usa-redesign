import "server-only";

import { randomInt } from "node:crypto";

/** Four-digit access code shown to the approved user. */
export function generateSofAccessPin(): string {
  return String(randomInt(1000, 10000));
}
