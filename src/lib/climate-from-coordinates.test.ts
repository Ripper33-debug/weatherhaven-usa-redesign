import { describe, expect, it } from "vitest";
import {
  applyHighAltitudeIfNeeded,
  inferEnvironmentFromCoordinates,
} from "./climate-from-coordinates";

describe("inferEnvironmentFromCoordinates", () => {
  it("classifies Florida Gulf coast as maritime", () => {
    const result = inferEnvironmentFromCoordinates(26.5026, -81.9841);
    expect(result.environment).toBe("maritime");
  });

  it("classifies high latitude as arctic", () => {
    expect(inferEnvironmentFromCoordinates(70, 25).environment).toBe("arctic");
  });

  it("classifies Sahara as desert", () => {
    expect(inferEnvironmentFromCoordinates(24, 10).environment).toBe("desert");
  });

  it("classifies equatorial as tropical", () => {
    expect(inferEnvironmentFromCoordinates(5, 20).environment).toBe("tropical");
  });

  it("upgrades to high altitude when elevation is high", () => {
    const base = inferEnvironmentFromCoordinates(46.8, 8.2);
    const result = applyHighAltitudeIfNeeded(base, 3200);
    expect(result.environment).toBe("highalt");
    expect(result.detail).toContain("3200");
  });
});
