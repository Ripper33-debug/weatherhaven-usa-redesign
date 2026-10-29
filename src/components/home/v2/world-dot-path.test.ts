import { describe, expect, it } from "vitest";
import worldDots from "@/data/world-dots.json";
import deployments from "@/data/global-deployments.json";
import { dotPathsByLight, invert, project } from "@/components/home/v2/world-dot-path";

describe("deployment map projection", () => {
  it("puts every pin where the map generator did", () => {
    const pins = worldDots.pins as Record<string, number[]>;
    for (const d of deployments as { id: string; lat: number; lng: number }[]) {
      const xy = pins[d.id];
      if (!xy) continue;
      const [x, y] = project(d.lng, d.lat);
      expect(Math.abs(x - xy[0]), d.id).toBeLessThan(0.6);
      expect(Math.abs(y - xy[1]), d.id).toBeLessThan(0.6);
    }
  });

  it("inverts its own projection", () => {
    for (const [lng, lat] of [[0, 0], [-122.4, 49.3], [166.7, -77.8], [-62.3, 82.5], [179, -84]]) {
      const [x, y] = project(lng, lat);
      const [l2, p2] = invert(x, y);
      expect(l2).toBeCloseTo(lng, 4);
      expect(p2).toBeCloseTo(lat, 4);
    }
  });

  it("splits the land into day, twilight and night", () => {
    const total = (worldDots.dots as number[]).length / 2;
    const paths = dotPathsByLight(new Date("2026-10-29T04:00:00Z"));
    const counts = paths.map((p) => (p.match(/M/g) ?? []).length);
    expect(counts[0] + counts[1] + counts[2]).toBe(total);
    // At 04:00 UTC it's daytime over Asia and Australia and night over the Americas.
    expect(counts[0]).toBeGreaterThan(total * 0.2);
    expect(counts[2]).toBeGreaterThan(total * 0.2);
  });
});
