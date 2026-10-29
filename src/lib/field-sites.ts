/**
 * Places on Weatherhaven's deployment map (the confirmed list, src/lib/confirmed-deployments.ts) that can be the
 * coldest or hottest of them, for the live "weather right now" readout on the homepage hero.
 *
 * Every named place (not country centre points) in the cold band (55° and further from the
 * equator) and the hot band (within 38° of it) is checked, so "coldest" and "hottest" hold across
 * the whole map: places between the bands are never the extremes. Names are the map's, with
 * spelling fixed and stations named as their operators do. Time zones come from the coordinates,
 * the same way the deployment map gets them.
 */
import tzlookup from "@photostructure/tz-lookup";
import { CONFIRMED_DEPLOYMENTS } from "@/lib/confirmed-deployments";
import { isPrecisePin, placeName } from "@/lib/deployment-pins";

export type FieldSite = {
  /** Pin id on the deployment map. */
  id: string;
  name: string;
  /** IANA time zone. */
  tz: string;
  lat: number;
  lng: number;
  band: "cold" | "hot";
};

type Pin = { id: string; label: string; title: string; lat: number; lng: number };

export const FIELD_SITES: FieldSite[] = (CONFIRMED_DEPLOYMENTS as Pin[]).flatMap((d) => {
  if (!isPrecisePin(d)) return [];
  const band = Math.abs(d.lat) >= 55 ? "cold" : Math.abs(d.lat) <= 38 ? "hot" : null;
  if (!band) return [];
  return [{ id: d.id, name: placeName(d), tz: tzlookup(d.lat, d.lng), lat: d.lat, lng: d.lng, band }];
});
