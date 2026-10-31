import { createClient, type QueryParams } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";

/** Published content only, through Sanity's CDN; gives up after 4 s so a Sanity outage can't stall a page. */
const client = isSanityConfigured() ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published", timeout: 4000, maxRetries: 1 }) : null;

/** How long the site keeps CMS content before checking for edits (a publish webhook can clear it sooner). */
export const CMS_REVALIDATE_SECONDS = 60;

/**
 * Runs a GROQ query, or returns null when the CMS isn't connected or doesn't answer, so every
 * caller can fall back to the content in code. Never throws.
 */
export async function cmsFetch<T>(query: string, params: QueryParams = {}): Promise<T | null> {
  if (!client) return null;
  try {
    return await client.fetch<T>(query, params, { next: { revalidate: CMS_REVALIDATE_SECONDS, tags: ["sanity"] } });
  } catch (error) {
    console.error("[cms] query failed; using the content in code", error instanceof Error ? error.message : error);
    return null;
  }
}
