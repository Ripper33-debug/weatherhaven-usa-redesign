/**
 * Where the sun is, accurate to a fraction of a degree (the low-precision solar position from the
 * US Naval Observatory / NOAA). Used for the "sun up" marks on the hero readout and the day/night
 * shading on the deployment map.
 */
const RAD = Math.PI / 180;

/** The point on Earth where the sun is directly overhead at `date`. */
export function subsolarPoint(date: Date): { lat: number; lng: number } {
  const d = date.getTime() / 86_400_000 - 10_957.5; // days since J2000.0 (2000-01-01 12:00 UTC)
  const g = (357.529 + 0.98560028 * d) * RAD; // mean anomaly
  const q = 280.459 + 0.98564736 * d; // mean longitude, degrees
  const l = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD; // ecliptic longitude
  const e = (23.439 - 0.00000036 * d) * RAD; // obliquity of the ecliptic
  const ra = Math.atan2(Math.cos(e) * Math.sin(l), Math.cos(l)) / RAD;
  const dec = Math.asin(Math.sin(e) * Math.sin(l)) / RAD;
  const gmst = 280.46061837 + 360.98564736629 * d;
  return { lat: dec, lng: wrap180(ra - gmst) };
}

/** Height of the sun above the horizon at a place, in degrees (negative below it). */
export function sunElevation(date: Date, lat: number, lng: number): number {
  const s = subsolarPoint(date);
  const h = (lng - s.lng) * RAD;
  const sinEl = Math.sin(lat * RAD) * Math.sin(s.lat * RAD) + Math.cos(lat * RAD) * Math.cos(s.lat * RAD) * Math.cos(h);
  return Math.asin(Math.max(-1, Math.min(1, sinEl))) / RAD;
}

/** True when the top of the sun is above the horizon (refraction included). */
export function isDaylight(date: Date, lat: number, lng: number): boolean {
  return sunElevation(date, lat, lng) > -0.833;
}

export type Light = "daylight" | "twilight" | "dark";

/** Daylight, twilight (sun up to 12° below the horizon) or dark: the same bands the map shades. */
export function lightAt(date: Date, lat: number, lng: number): Light {
  const el = sunElevation(date, lat, lng);
  return el > -0.833 ? "daylight" : el > -12 ? "twilight" : "dark";
}

function wrap180(deg: number): number {
  return ((((deg + 180) % 360) + 360) % 360) - 180;
}
