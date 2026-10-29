import { NextResponse } from "next/server";
import tzlookup from "@photostructure/tz-lookup";
import { conditionsAt } from "@/lib/field-weather";
import { checkRateLimit, getRequestIp } from "@/lib/rateLimit";

/**
 * Weather this hour at any point on the map, for the mission builder's "build it where you're
 * going". Points are snapped to a 0.1° grid (about 11 km), so nearby clicks share MET Norway's
 * 30-minute cache, and each visitor gets 20 lookups a minute.
 */
export async function GET(request: Request) {
  if (!checkRateLimit(`place-weather:${getRequestIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 85 || Math.abs(lng) > 180) {
    return NextResponse.json({ error: "Invalid point" }, { status: 400 });
  }
  const snap = (v: number) => Math.round(v * 10) / 10;
  const at = { lat: snap(lat), lng: snap(lng) };
  const now = await conditionsAt(at.lat, at.lng);
  if (!now) {
    return NextResponse.json({ error: "Weather unavailable" }, { status: 503, headers: { "Cache-Control": "public, s-maxage=60" } });
  }
  let tz: string | null = null;
  try {
    tz = tzlookup(at.lat, at.lng);
  } catch {
    tz = null;
  }
  return NextResponse.json({ ...now, tz }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
}
