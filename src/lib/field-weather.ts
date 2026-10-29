import "server-only";
import { FIELD_SITES, type FieldSite } from "@/lib/field-sites";
import { conditionsNow, pickExtremes, type Conditions, type FieldExtremes, type FieldReading } from "@/lib/field-readout";

/**
 * Weather this hour from MET Norway (the Norwegian Meteorological Institute), whose data is free
 * for commercial use with credit (CC BY 4.0).
 *
 * Their terms (api.met.no/doc/TermsOfService) ask clients to identify themselves, cache responses,
 * keep coordinates to four decimals and stay well under 20 requests a second. So:
 * - successful replies are cached for 30 minutes (their forecasts update about that often), so
 *   each place costs one call per half hour whatever the traffic;
 * - a place whose call just failed isn't asked again for two minutes;
 * - at most six calls run at once.
 * Every wait is capped outside fetch (Next drops a fetch's abort signal when it refreshes a cached
 * reply), so a slow reply can never hold up a page.
 *
 * Before launch, add a contact email to USER_AGENT.
 */
const MET_URL = "https://api.met.no/weatherapi/locationforecast/2.0/compact";
const USER_AGENT = "WeatherhavenUSA/1.0 (+https://weatherhavenusa.com)";
const CALL_LIMIT_MS = 2500;
const READOUT_LIMIT_MS = 9000;
const RETRY_AFTER_MS = 120_000;
const PARALLEL = 6;

const failedAt = new Map<string, number>();
// The last complete readout, used when a refresh comes back short (the hero then labels it as the
// latest reading if it's over an hour old).
let lastGood: FieldExtremes | null = null;

function within<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const late = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([promise, late]).finally(() => clearTimeout(timer));
}

async function fetchConditions(url: string): Promise<Conditions | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(CALL_LIMIT_MS),
  });
  // 203 means MET has deprecated this product: treat it as unusable rather than cache it.
  if (res.status !== 200) return null;
  return conditionsNow(await res.json(), new Date());
}

/** Conditions this hour at a place, or null if MET Norway can't answer in time. */
export async function conditionsAt(lat: number, lng: number): Promise<Conditions | null> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const failed = failedAt.get(key);
  if (failed !== undefined && Date.now() - failed < RETRY_AFTER_MS) return null;
  const url = `${MET_URL}?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}`;
  const result = await within(
    fetchConditions(url).catch(() => null),
    CALL_LIMIT_MS,
    null,
  );
  if (result) failedAt.delete(key);
  else failedAt.set(key, Date.now());
  return result;
}

async function readSite(site: FieldSite): Promise<FieldReading | null> {
  const now = await conditionsAt(site.lat, site.lng);
  if (!now) return null;
  return { name: site.name, tz: site.tz, lat: site.lat, lng: site.lng, band: site.band, tempC: now.tempC, at: now.time };
}

/** Runs `work` over `items`, at most `parallel` at a time. */
async function inBatches<T, R>(items: T[], parallel: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const lanes = Array.from({ length: Math.min(parallel, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await work(items[i]);
    }
  });
  await Promise.all(lanes);
  return out;
}

/**
 * Coldest and hottest place on the deployment map right now. If too few places answer in time,
 * the last complete readout is used; null (the hero leaves the readout out) only if there has
 * never been one.
 */
export async function getFieldExtremes(): Promise<FieldExtremes | null> {
  const results: (FieldReading | null)[] = [];
  const all = inBatches(FIELD_SITES, PARALLEL, async (site) => {
    const r = await readSite(site);
    results.push(r);
    return r;
  });
  await within(all, READOUT_LIMIT_MS, undefined);
  const expected = {
    cold: FIELD_SITES.filter((s) => s.band === "cold").length,
    hot: FIELD_SITES.filter((s) => s.band === "hot").length,
  };
  const fresh = pickExtremes(
    results.filter((r): r is FieldReading => r !== null),
    expected,
  );
  if (fresh) lastGood = fresh;
  return fresh ?? lastGood;
}
