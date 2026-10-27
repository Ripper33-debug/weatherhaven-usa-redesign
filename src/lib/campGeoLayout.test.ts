import { describe, expect, it } from "vitest";
import { MISSION_BUILDER_DEFAULTS } from "@/lib/missionBuilder";
import { generateCampPlan } from "@/lib/campPlanner";
import { PRODUCTS } from "@/lib/products";
import { campGeoBounds, campZonesToGeo } from "@/lib/campGeoLayout";

describe("campGeoLayout", () => {
  const state = {
    ...MISSION_BUILDER_DEFAULTS,
    environment: "desert",
    primaryFunction: "c2",
    personnelCount: "36",
  };

  it("maps schematic zones to geo rectangles centered on a site", () => {
    const plan = generateCampPlan(state, PRODUCTS);
    expect(plan).not.toBeNull();
    const geo = campZonesToGeo(34.5, -117.2, plan!.zones, plan!.forceTier);
    expect(geo.length).toBeGreaterThan(0);

    for (const zone of geo) {
      const [[south, west], [north, east]] = zone.bounds;
      expect(north).toBeGreaterThan(south);
      expect(east).toBeGreaterThan(west);
    }

    const bounds = campGeoBounds(34.5, -117.2, plan!.zones, plan!.forceTier);
    expect(bounds).not.toBeNull();
    const [[bSouth, bWest], [bNorth, bEast]] = bounds!;
    expect(bNorth - bSouth).toBeGreaterThan(0);
    expect(bEast - bWest).toBeGreaterThan(0);
  });

  it("scales footprint with force tier", () => {
    const smallPlan = generateCampPlan(
      { ...state, personnelCount: "12" },
      PRODUCTS,
    );
    const battalionPlan = generateCampPlan(
      { ...state, personnelCount: "400", primaryFunction: "logistics" },
      PRODUCTS,
    );
    expect(smallPlan).not.toBeNull();
    expect(battalionPlan).not.toBeNull();

    const smallBounds = campGeoBounds(0, 0, smallPlan!.zones, smallPlan!.forceTier)!;
    const largeBounds = campGeoBounds(0, 0, battalionPlan!.zones, battalionPlan!.forceTier)!;

    const smallSpan = smallBounds[1][0] - smallBounds[0][0];
    const largeSpan = largeBounds[1][0] - largeBounds[0][0];
    expect(largeSpan).toBeGreaterThan(smallSpan);
  });

  it("keeps map overlay at expeditionary scale (not hundreds of meters per cell)", () => {
    const plan = generateCampPlan(state, PRODUCTS);
    expect(plan).not.toBeNull();

    const lat = 46.448;
    const bounds = campGeoBounds(lat, -121.99, plan!.zones, plan!.forceTier)!;
    const latSpanM = (bounds[1][0] - bounds[0][0]) * 111_320;
    const lngSpanM = (bounds[1][1] - bounds[0][1]) * 111_320 * Math.cos((lat * Math.PI) / 180);
    const maxSpanM = Math.max(latSpanM, lngSpanM);

    expect(maxSpanM).toBeGreaterThan(40);
    expect(maxSpanM).toBeLessThan(120);
  });
});
