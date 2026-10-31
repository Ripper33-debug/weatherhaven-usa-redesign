/**
 * Sanity project settings. The project ID isn't secret (it's in every browser request to Sanity),
 * so it lives here. While the dataset is empty the site shows the content written into the code.
 */
/** Weatherhaven USA's Sanity project (sanity.io/manage). An environment variable can override it. */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() || "w31ge8yv";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim() || "production";
/** Pinned so a Sanity API change can't alter query results under us. */
export const apiVersion = "2025-10-01";

export function isSanityConfigured(): boolean {
  return projectId.length > 0;
}
