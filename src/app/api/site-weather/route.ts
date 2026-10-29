import { NextResponse } from "next/server";
import tzlookup from "@photostructure/tz-lookup";
import { GLOBAL_DEPLOYMENTS } from "@/lib/global-deployments";
import { isPrecisePin } from "@/lib/deployment-pins";
import { conditionsAt } from "@/lib/field-weather";

/**
 * Weather this hour at one site on the deployment map, for the map's "right now" panel.
 * Only pins that mark a place are accepted (so this can't be used to look up anywhere else), MET
 * Norway's replies are cached for 30 minutes, and the CDN keeps each answer for 15 (a failure
 * for one).
 */
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const pin = GLOBAL_DEPLOYMENTS.find((d) => d.id === id);
  if (!pin || !isPrecisePin(pin)) return NextResponse.json({ error: "Unknown site" }, { status: 404 });
  const now = await conditionsAt(pin.lat, pin.lng);
  if (!now) {
    // Cached briefly too, so an outage at MET doesn't turn into one call per visitor.
    return NextResponse.json({ error: "Weather unavailable" }, { status: 503, headers: { "Cache-Control": "public, s-maxage=60" } });
  }
  return NextResponse.json({ ...now, tz: tzlookup(pin.lat, pin.lng) }, { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } });
}
