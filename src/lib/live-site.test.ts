import { describe, expect, it } from "vitest";
import { climateForPlace, liveLine, placeAtPoint, placeFromParams, placeToParams, type GuidePlace, type LiveConditions } from "@/lib/live-site";
import { liveWeather, livePreset } from "@/lib/three/camp/live-preset";
import { CLIMATES } from "@/lib/three/camp/environment";

const PLACES: GuidePlace[] = [
  { id: "greenland-thule-greenland", name: "Thule, Greenland", lat: 77.47, lng: -69.23 },
  { id: "saudi-arabia-riyadh-saudi-arabia", name: "Riyadh, Saudi Arabia", lat: 24.71, lng: 46.68 },
];

const live = (over: Partial<LiveConditions>): LiveConditions => ({
  id: null,
  name: "Test",
  lat: 77.47,
  lng: -69.23,
  tz: "America/Thule",
  time: "2026-10-29T16:00:00Z",
  tempC: -20,
  windMs: 3,
  symbol: "cloudy",
  ...over,
});

describe("climateForPlace", () => {
  it("reads the usual climate from where the place is", () => {
    expect(climateForPlace(77.47, -69.23)).toBe("polar"); // Thule
    expect(climateForPlace(-77.84, 166.69)).toBe("polar"); // McMurdo
    expect(climateForPlace(24.71, 46.68)).toBe("hot"); // Riyadh
    expect(climateForPlace(25.03, 0.59)).toBe("hot"); // Reggane
    expect(climateForPlace(-19.26, 146.82)).toBe("tropical"); // Townsville
    expect(climateForPlace(45.42, -75.7)).toBe("cold"); // Ottawa
    expect(climateForPlace(56.88, 24.6)).toBe("cold"); // Latvia
    expect(climateForPlace(49.28, -123.12)).toBe("temperate"); // Vancouver
    expect(climateForPlace(35.68, 139.65)).toBe("temperate"); // Tokyo
  });
});

describe("places in the URL", () => {
  it("round-trips a named place and a map point", () => {
    const named = PLACES[0];
    const p1 = placeToParams(named);
    expect(placeFromParams((k) => p1[k as "site" | "at"], PLACES)).toEqual(named);
    const point = placeAtPoint(77.1, -68.5, PLACES);
    expect(point.name).toBe("Near Thule, Greenland");
    const p2 = placeToParams(point);
    expect(p2).toEqual({ site: null, at: "77.10,-68.50" });
    expect(placeFromParams((k) => p2[k as "site" | "at"], PLACES)?.name).toBe("Near Thule, Greenland");
  });

  it("names far-away points by their coordinates and rejects junk", () => {
    expect(placeAtPoint(-40, -120, PLACES).name).toBe("40.00° S 120.00° W");
    expect(placeFromParams((k) => (k === "at" ? "91,0" : null), PLACES)).toBeNull();
    expect(placeFromParams((k) => (k === "at" ? "abc" : null), PLACES)).toBeNull();
    expect(placeFromParams((k) => (k === "site" ? "nowhere" : null), PLACES)).toBeNull();
  });
});

describe("live conditions in the 3D camp", () => {
  it("shows the weather that's actually happening", () => {
    expect(liveWeather(CLIMATES.polar, live({ symbol: "lightsnow", windMs: 4 }))).toBe("snow");
    expect(liveWeather(CLIMATES.polar, live({ symbol: "snow", windMs: 14 }))).toBe("blizzard");
    expect(liveWeather(CLIMATES.polar, live({ symbol: "clearsky_night", windMs: 12 }))).toBe("blizzard");
    expect(liveWeather(CLIMATES.polar, live({ symbol: "clearsky_night", windMs: 2 }))).toBe("none");
    expect(liveWeather(CLIMATES.hot, live({ symbol: "fair_day", windMs: 9 }))).toBe("dust");
    expect(liveWeather(CLIMATES.hot, live({ symbol: "fair_day", windMs: 2 }))).toBe("none");
    expect(liveWeather(CLIMATES.temperate, live({ symbol: "heavyrainandthunder" }))).toBe("storm");
    expect(liveWeather(CLIMATES.temperate, live({ symbol: "lightrainshowers_day" }))).toBe("rain");
  });

  it("darkens the camp at night and lights it by day", () => {
    // Riyadh: 21:00 UTC is local midnight, 09:00 UTC is local noon.
    const riyadh = { lat: 24.71, lng: 46.68, symbol: "clearsky_day", windMs: 2 };
    const nightP = livePreset(CLIMATES.hot, live(riyadh), new Date("2026-10-28T21:00:00Z"));
    const dayP = livePreset(CLIMATES.hot, live(riyadh), new Date("2026-10-29T09:00:00Z"));
    expect(nightP.keyIntensity).toBeLessThan(CLIMATES.hot.keyIntensity * 0.4);
    expect(dayP.keyIntensity).toBeGreaterThan(CLIMATES.hot.keyIntensity);
    expect(dayP.sunEl).toBeGreaterThan(40);
    // Noon sun in the south: behind the camera, which looks north (+z is camp azimuth 0).
    expect(Math.min(dayP.sunAz, 360 - dayP.sunAz)).toBeLessThan(15);
    expect(dayP.label).toBe("Right now at Test");
  });

  it("says what it's like there in plain words", () => {
    expect(liveLine(live({ tempC: -30, symbol: "lightsnow", windMs: 8 }), new Date("2026-12-15T12:00:00Z"))).toBe(
      "−22 °F (−30 °C), light snow, wind 18 mph, dark",
    );
  });
});
