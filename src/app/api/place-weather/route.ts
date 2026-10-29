import { NextResponse } from "next/server";
import { conditionsAt } from "@/lib/field-weather";
import { checkRateLimit, getRequestIp } from "@/lib/rateLimit";
import { PLACE_GRID } from "@/lib/live-site";

/**
 * Weather this hour at any point on the map, for the mission builder's "build it where you're
 * going". Only points on a 0.25° grid (about 28 km) are accepted, which the page snaps to, so
 * nearby clicks share one CDN entry and one cached MET Norway reply. Each visitor gets 20 lookups
 * a minute, and each server instance passes at most 120 a minute on to the weather service.
 */
const BUDGET_PER_MINUTE = 120;
let budget = { minute: 0, used: 0 };

const onGrid = (v: number) => Math.abs(v / PLACE_GRID - Math.round(v / PLACE_GRID)) < 1e-6;
const busy = () => NextResponse.json({ error: "Weather unavailable" }, { status: 503, headers: { "Cache-Control": "public, s-maxage=60" } });

export async function GET(request: Request) {
  if (!checkRateLimit(`place-weather:${getRequestIp(request)}`, 20, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const url = new URL(request.url);
  const rawLat = url.searchParams.get("lat");
  const rawLng = url.searchParams.get("lng");
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  if (!rawLat || !rawLng || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 85 || Math.abs(lng) > 180 || !onGrid(lat) || !onGrid(lng)) {
    return NextResponse.json({ error: "Invalid point" }, { status: 400 });
  }
  const minute = Math.floor(Date.now() / 60_000);
  if (budget.minute !== minute) budget = { minute, used: 0 };
  if (budget.used >= BUDGET_PER_MINUTE) return busy();
  budget.used++;
  const now = await conditionsAt(lat, lng);
  if (!now) return busy();
  return NextResponse.json(now, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
}
