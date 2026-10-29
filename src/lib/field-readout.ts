/**
 * Pure helpers for the homepage's live field readout: reading MET Norway's forecast, picking the
 * coldest and hottest places, and formatting. The network side is in field-weather.ts.
 */
export type FieldReading = {
  name: string;
  /** IANA time zone. */
  tz: string;
  lat: number;
  lng: number;
  tempC: number;
  band: "cold" | "hot";
  /** ISO time of the forecast hour the temperature is for. */
  at: string;
};

/** `at`: the older of the two readings' forecast hours. */
export type FieldExtremes = { cold: FieldReading; hot: FieldReading; at: string };

type MetStep = {
  time?: string;
  data?: {
    instant?: { details?: { air_temperature?: unknown; wind_speed?: unknown } };
    next_1_hours?: { summary?: { symbol_code?: unknown } };
    next_6_hours?: { summary?: { symbol_code?: unknown } };
  };
};

export type Conditions = {
  /** ISO time of the forecast hour. */
  time: string;
  tempC: number;
  /** Metres per second, or null if missing. */
  windMs: number | null;
  /** MET Norway symbol code ("fog", "lightsnow_day"…), or null if missing. */
  symbol: string | null;
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * Conditions for the hour nearest `now` from a MET Norway locationforecast response, or null when
 * the response has nothing within 90 minutes (a broken or very stale reply).
 */
export function conditionsNow(json: unknown, now: Date): Conditions | null {
  const series = (json as { properties?: { timeseries?: MetStep[] } } | null)?.properties?.timeseries;
  if (!Array.isArray(series)) return null;
  let best: MetStep | null = null;
  let bestGap = Infinity;
  for (const step of series) {
    const t = Date.parse(step?.time ?? "");
    if (!Number.isFinite(t) || num(step?.data?.instant?.details?.air_temperature) === null) continue;
    const gap = Math.abs(t - now.getTime());
    if (gap < bestGap) {
      bestGap = gap;
      best = step;
    }
  }
  if (!best || bestGap > 90 * 60_000) return null;
  const symbol = best.data?.next_1_hours?.summary?.symbol_code ?? best.data?.next_6_hours?.summary?.symbol_code;
  return {
    time: best.time!,
    tempC: num(best.data?.instant?.details?.air_temperature)!,
    windMs: num(best.data?.instant?.details?.wind_speed),
    symbol: typeof symbol === "string" ? symbol : null,
  };
}

/** Just the temperature from conditionsNow. */
export function temperatureNow(json: unknown, now: Date): number | null {
  return conditionsNow(json, now)?.tempC ?? null;
}

/** MET Norway symbol codes in plain words ("lightsnowshowers_day" → "Light snow showers"). */
export function describeSky(symbol: string | null): string | null {
  if (!symbol) return null;
  const code = symbol.replace(/_(day|night|polartwilight)$/, "");
  const fixed: Record<string, string> = {
    clearsky: "Clear",
    fair: "Mostly clear",
    partlycloudy: "Partly cloudy",
    cloudy: "Cloudy",
    fog: "Fog",
  };
  if (fixed[code]) return fixed[code];
  const m = code.match(/^(light|heavy)?(rain|sleet|snow)(showers)?(andthunder)?$/);
  if (!m) return null;
  const words = [m[1], m[2], m[3] ? "showers" : null].filter(Boolean).join(" ");
  const out = `${words}${m[4] ? " and thunder" : ""}`;
  return out.charAt(0).toUpperCase() + out.slice(1);
}

export const toMph = (ms: number) => ms * 2.23694;

/**
 * The coldest place in the cold band and the hottest in the hot band. Returns null unless at
 * least three quarters of each band answered, since otherwise "coldest" or "hottest" could be
 * wrong.
 */
export function pickExtremes(readings: FieldReading[], expected: { cold: number; hot: number }): FieldExtremes | null {
  const cold = readings.filter((r) => r.band === "cold");
  const hot = readings.filter((r) => r.band === "hot");
  if (cold.length === 0 || hot.length === 0) return null;
  if (cold.length < Math.ceil(expected.cold * 0.75) || hot.length < Math.ceil(expected.hot * 0.75)) return null;
  const coldest = cold.reduce((a, b) => (b.tempC < a.tempC ? b : a));
  const hottest = hot.reduce((a, b) => (b.tempC > a.tempC ? b : a));
  return { cold: coldest, hot: hottest, at: coldest.at < hottest.at ? coldest.at : hottest.at };
}

/** True when a reading is too old to call "right now" (the page can be served from cache). */
export function isStale(at: string, now: Date, maxMinutes = 75): boolean {
  return now.getTime() - Date.parse(at) > maxMinutes * 60_000;
}

export const toFahrenheit = (c: number) => (c * 9) / 5 + 32;

/** Whole degrees with a true minus sign, and a plus sign above zero ("−53", "+95", "0"). */
export function signedDegrees(value: number): string {
  const n = Math.round(value);
  if (n === 0) return "0";
  return n < 0 ? `−${Math.abs(n)}` : `+${n}`;
}

/** "75.10° S 123.35° E" */
export function formatCoords(lat: number, lng: number): string {
  const ns = `${Math.abs(lat).toFixed(2)}° ${lat < 0 ? "S" : "N"}`;
  const ew = `${Math.abs(lng).toFixed(2)}° ${lng < 0 ? "W" : "E"}`;
  return `${ns} ${ew}`;
}

/**
 * "HH:MM" in a time zone, or null when the browser doesn't know the zone (older browsers lack
 * some renamed zones, such as America/Nuuk).
 */
export function localTimeFormatter(tz: string): Intl.DateTimeFormat | null {
  try {
    return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  } catch {
    return null;
  }
}
