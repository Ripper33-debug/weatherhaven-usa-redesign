import { getFieldExtremes } from "@/lib/field-weather";

/**
 * The homepage weather line (coldest and hottest deployment sites in MET Norway's forecast). The
 * hero fetches it after load rather than baking it into the cached page, because a page rendered at
 * one time and hydrated with weather from another threw React's hydration error (#418).
 * MET replies are cached for 30 minutes inside getFieldExtremes; the CDN keeps this for 15.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const field = await getFieldExtremes();
  return Response.json(field, {
    headers: { "Cache-Control": field ? "public, s-maxage=900, stale-while-revalidate=900" : "public, s-maxage=60" },
  });
}
