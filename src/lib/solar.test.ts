import { describe, expect, it } from "vitest";
import { isDaylight, subsolarPoint, sunElevation } from "@/lib/solar";

describe("solar position", () => {
  it("puts the sun over the equator near Greenwich at the March equinox, noon UTC", () => {
    const s = subsolarPoint(new Date("2026-03-20T12:00:00Z"));
    expect(Math.abs(s.lat)).toBeLessThan(0.5);
    // The sun runs about 7½ minutes slow then (equation of time), so at 12:00 UTC it is still
    // about 1.9° east of Greenwich.
    expect(s.lng).toBeCloseTo(1.9, 0);
  });

  it("matches the equation of time at its extremes", () => {
    // Early November the sun runs ~16 minutes fast (≈4.1° west at noon UTC); mid-February ~14 slow.
    expect(subsolarPoint(new Date("2026-11-03T12:00:00Z")).lng).toBeCloseTo(-4.1, 0);
    expect(subsolarPoint(new Date("2026-02-11T12:00:00Z")).lng).toBeCloseTo(3.55, 0);
  });

  it("follows the seasons", () => {
    expect(subsolarPoint(new Date("2026-06-21T12:00:00Z")).lat).toBeCloseTo(23.44, 0);
    expect(subsolarPoint(new Date("2026-12-21T12:00:00Z")).lat).toBeCloseTo(-23.44, 0);
  });

  it("moves 15° west every hour", () => {
    const a = subsolarPoint(new Date("2026-10-29T00:00:00Z")).lng;
    const b = subsolarPoint(new Date("2026-10-29T01:00:00Z")).lng;
    expect(((a - b + 540) % 360) - 180).toBeCloseTo(15, 0);
  });

  it("knows polar night and midnight sun", () => {
    // Alert, Nunavut (82.5° N) gets no sun in mid-December and no night in mid-June.
    for (let h = 0; h < 24; h += 3) {
      const hh = String(h).padStart(2, "0");
      expect(isDaylight(new Date(`2026-12-15T${hh}:00:00Z`), 82.5, -62.35)).toBe(false);
      expect(isDaylight(new Date(`2026-06-15T${hh}:00:00Z`), 82.5, -62.35)).toBe(true);
    }
  });

  it("is high at local noon and below the horizon at local midnight", () => {
    // Riyadh is UTC+3: local noon is about 09:00 UTC.
    expect(sunElevation(new Date("2026-10-29T09:00:00Z"), 24.71, 46.68)).toBeGreaterThan(50);
    expect(sunElevation(new Date("2026-10-28T21:00:00Z"), 24.71, 46.68)).toBeLessThan(-40);
  });
});
