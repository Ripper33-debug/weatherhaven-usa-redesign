/**
 * "Build it where you're going": a real place for the mission builder, the climate answer it
 * implies, and the live conditions there (MET Norway's forecast for this hour, with the sun's
 * position worked out locally). Pure and safe to use in the browser.
 */
import type { ClimateId } from "@/lib/mission-guide";
import { inferEnvironmentFromCoordinates } from "@/lib/climate-from-coordinates";
import { describeSky, formatCoords, signedDegrees, toFahrenheit, toMph, type Conditions } from "@/lib/field-readout";
import { lightAt } from "@/lib/solar";

/** A place picked in the builder: a named place on the deployment map, or a point on the map. */
export type GuidePlace = { id: string | null; name: string; lat: number; lng: number };

export type LiveConditions = GuidePlace & Conditions & { tz: string | null };

/**
 * The builder's climate answer for a place: its usual climate, not today's weather. Coarse by
 * design (latitude bands and known dry regions); the visitor can still pick another.
 */
export function climateForPlace(lat: number, lng: number): ClimateId {
  const abs = Math.abs(lat);
  if (abs >= 60) return "polar";
  const env = inferEnvironmentFromCoordinates(lat, lng).environment;
  if (env === "desert") return "hot";
  if (env === "tropical") return "tropical";
  if (abs >= 43) {
    // Mild west coasts (Pacific Northwest, Atlantic Europe) rarely hold snow.
    const mildCoast = abs <= 58 && ((lng >= -135 && lng <= -118) || (lng >= -12 && lng <= 12));
    return mildCoast ? "temperate" : "cold";
  }
  return "temperate";
}

/** Great-circle distance in km. */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const r = Math.PI / 180;
  const h =
    Math.sin(((bLat - aLat) * r) / 2) ** 2 + Math.cos(aLat * r) * Math.cos(bLat * r) * Math.sin(((bLng - aLng) * r) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** A point clicked on the map, named after the nearest documented place within 150 km. */
export function placeAtPoint(lat: number, lng: number, places: GuidePlace[]): GuidePlace {
  let best: GuidePlace | null = null;
  let bestKm = 150;
  for (const p of places) {
    const km = distanceKm(lat, lng, p.lat, p.lng);
    if (km < bestKm) {
      bestKm = km;
      best = p;
    }
  }
  const at = { lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 };
  return { id: null, name: best ? `Near ${best.name}` : formatCoords(at.lat, at.lng), ...at };
}

/** URL form of a place: a deployment-map pin id, or "lat,lng". */
export function placeToParams(p: GuidePlace | null): Record<"site" | "at", string | null> {
  if (!p) return { site: null, at: null };
  return p.id ? { site: p.id, at: null } : { site: null, at: `${p.lat.toFixed(2)},${p.lng.toFixed(2)}` };
}

export function placeFromParams(get: (name: string) => string | null, places: GuidePlace[]): GuidePlace | null {
  const site = get("site");
  if (site) return places.find((p) => p.id === site) ?? null;
  const m = get("at")?.match(/^(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  if (Math.abs(lat) > 85 || Math.abs(lng) > 180) return null;
  return placeAtPoint(lat, lng, places);
}

/** "−22 °F (−30 °C), light snow, wind 18 mph, dark" */
export function liveLine(live: LiveConditions, now: Date): string {
  const parts = [`${signedDegrees(toFahrenheit(live.tempC))} °F (${signedDegrees(live.tempC)} °C)`];
  const sky = describeSky(live.symbol);
  if (sky) parts.push(sky.toLowerCase());
  if (live.windMs !== null) parts.push(`wind ${Math.round(toMph(live.windMs))} mph`);
  parts.push(lightAt(now, live.lat, live.lng));
  return parts.join(", ");
}
