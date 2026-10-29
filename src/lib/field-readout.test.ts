import { describe, expect, it } from "vitest";
import deployments from "@/data/confirmed-pins.json";
import { FIELD_SITES } from "@/lib/field-sites";
import {
  conditionsNow,
  describeSky,
  formatCoords,
  isStale,
  localTimeFormatter,
  pickExtremes,
  signedDegrees,
  temperatureNow,
  toFahrenheit,
  toMph,
} from "@/lib/field-readout";

const met = (rows: [string, number][]) => ({
  properties: { timeseries: rows.map(([time, t]) => ({ time, data: { instant: { details: { air_temperature: t } } } })) },
});

describe("field sites", () => {
  it("are confirmed place pins on the deployment map, with valid time zones", () => {
    const cold = FIELD_SITES.filter((s) => s.band === "cold");
    const hot = FIELD_SITES.filter((s) => s.band === "hot");
    expect(cold.length).toBeGreaterThanOrEqual(25);
    expect(hot.length).toBeGreaterThanOrEqual(40);
    for (const site of FIELD_SITES) {
      const pin = (deployments as { id: string; lat: number; lng: number }[]).find((d) => d.id === site.id);
      expect(pin, site.id).toBeTruthy();
      expect(site.lat).toBe(pin!.lat);
      expect(() => new Intl.DateTimeFormat("en-US", { timeZone: site.tz })).not.toThrow();
      expect(site.name).not.toMatch(/^-?\d/);
    }
  });

  it("covers the coldest and hottest places on the map", () => {
    const names = FIELD_SITES.map((s) => s.name);
    for (const n of ["Concordia Station, Antarctica", "Alert, Nunavut", "Svalbard, Norway"]) {
      expect(names).toContain(n);
    }
    for (const n of ["Reggane, Algeria", "Taraq, UAE", "Zekreet, Qatar", "Riyadh, Saudi Arabia", "Kabul, Afghanistan"]) {
      expect(names).toContain(n);
    }
    // Country centre points aren't places.
    expect(names).not.toContain("Mali");
    expect(names).not.toContain("Greenland");
  });
});

describe("temperatureNow", () => {
  const json = met([
    ["2026-10-29T03:00:00Z", -47.4],
    ["2026-10-29T04:00:00Z", -46.1],
    ["2026-10-29T05:00:00Z", -44.9],
  ]);

  it("takes the hour nearest now", () => {
    expect(temperatureNow(json, new Date("2026-10-29T03:20:00Z"))).toBe(-47.4);
    expect(temperatureNow(json, new Date("2026-10-29T03:40:00Z"))).toBe(-46.1);
  });

  it("gives up on stale or broken replies", () => {
    expect(temperatureNow(json, new Date("2026-10-29T09:00:00Z"))).toBeNull();
    expect(temperatureNow({}, new Date())).toBeNull();
    expect(temperatureNow(null, new Date())).toBeNull();
    expect(temperatureNow(met([["nope", 3]]), new Date())).toBeNull();
  });
});

describe("pickExtremes", () => {
  const r = (name: string, tempC: number, band: "cold" | "hot", at = "2026-10-29T03:00:00Z") => ({
    name,
    tz: "UTC",
    lat: 0,
    lng: 0,
    tempC,
    band,
    at,
  });

  it("takes the coldest from the cold band and the hottest from the hot band", () => {
    const x = pickExtremes(
      [r("a", -20, "cold"), r("b", -47.4, "cold"), r("c", 36.2, "hot", "2026-10-29T02:00:00Z"), r("d", 5, "hot"), r("e", 40, "cold")],
      { cold: 3, hot: 2 },
    );
    expect(x?.cold.name).toBe("b");
    expect(x?.hot.name).toBe("c");
    expect(x?.at).toBe("2026-10-29T02:00:00Z");
  });

  it("gives up when too few places in either band answered", () => {
    expect(pickExtremes([], { cold: 1, hot: 1 })).toBeNull();
    expect(pickExtremes([r("a", -1, "cold")], { cold: 1, hot: 1 })).toBeNull();
    expect(pickExtremes([r("a", -1, "cold"), r("b", 30, "hot")], { cold: 4, hot: 1 })).toBeNull();
    expect(pickExtremes([r("a", -1, "cold"), r("a2", -2, "cold"), r("a3", -3, "cold"), r("b", 30, "hot")], { cold: 4, hot: 1 })).not.toBeNull();
  });
});

describe("isStale", () => {
  it("allows the current hour's forecast and flags old cached pages", () => {
    expect(isStale("2026-10-29T03:00:00Z", new Date("2026-10-29T03:40:00Z"))).toBe(false);
    expect(isStale("2026-10-29T03:00:00Z", new Date("2026-10-29T05:00:00Z"))).toBe(true);
  });
});

describe("localTimeFormatter", () => {
  it("returns null for zones the runtime doesn't know", () => {
    expect(localTimeFormatter("Not/AZone")).toBeNull();
    expect(localTimeFormatter("Antarctica/McMurdo")?.format(new Date("2026-10-29T04:00:00Z"))).toBe("17:00");
  });
});

describe("formatting", () => {
  it("formats degrees with real minus and plus signs", () => {
    expect(signedDegrees(-47.4)).toBe("−47");
    expect(signedDegrees(toFahrenheit(-47.4))).toBe("−53");
    expect(signedDegrees(35.2)).toBe("+35");
    expect(signedDegrees(-0.3)).toBe("0");
  });

  it("formats coordinates", () => {
    expect(formatCoords(-75.1, 123.35)).toBe("75.10° S 123.35° E");
    expect(formatCoords(25.03, -0.59)).toBe("25.03° N 0.59° W");
  });
});

describe("conditionsNow and describeSky", () => {
  const json = {
    properties: {
      timeseries: [
        {
          time: "2026-10-29T03:00:00Z",
          data: {
            instant: { details: { air_temperature: -47.4, wind_speed: 5 } },
            next_1_hours: { summary: { symbol_code: "fog" } },
          },
        },
        {
          time: "2026-10-29T04:00:00Z",
          data: { instant: { details: { air_temperature: -46 } }, next_6_hours: { summary: { symbol_code: "lightsnowshowers_day" } } },
        },
      ],
    },
  };

  it("reads temperature, wind and sky for the nearest hour", () => {
    expect(conditionsNow(json, new Date("2026-10-29T03:10:00Z"))).toEqual({
      time: "2026-10-29T03:00:00Z",
      tempC: -47.4,
      windMs: 5,
      symbol: "fog",
    });
    expect(conditionsNow(json, new Date("2026-10-29T04:10:00Z"))).toEqual({
      time: "2026-10-29T04:00:00Z",
      tempC: -46,
      windMs: null,
      symbol: "lightsnowshowers_day",
    });
  });

  it("describes MET Norway symbols in plain words", () => {
    expect(describeSky("fog")).toBe("Fog");
    expect(describeSky("clearsky_polartwilight")).toBe("Clear");
    expect(describeSky("lightsnowshowers_day")).toBe("Light snow showers");
    expect(describeSky("heavyrainandthunder")).toBe("Heavy rain and thunder");
    expect(describeSky("sleet")).toBe("Sleet");
    expect(describeSky("somethingnew")).toBeNull();
    expect(describeSky(null)).toBeNull();
  });

  it("converts wind to mph", () => {
    expect(Math.round(toMph(5))).toBe(11);
  });
});
