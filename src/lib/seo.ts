import type { Metadata } from "next";

/** Pages that should never appear in search indexes. */
export const NOINDEX_ROBOTS: Metadata["robots"] = { index: false, follow: false };
