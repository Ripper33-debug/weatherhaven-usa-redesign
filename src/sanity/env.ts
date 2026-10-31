/**
 * Sanity project settings. The project ID isn't secret (it's in every browser request to Sanity),
 * so it can live here once Weatherhaven's project exists; until then the site runs on the content in
 * code and /studio says the CMS isn't connected.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
/** Pinned so a Sanity API change can't alter query results under us. */
export const apiVersion = "2025-10-01";

export function isSanityConfigured(): boolean {
  return projectId.length > 0;
}
