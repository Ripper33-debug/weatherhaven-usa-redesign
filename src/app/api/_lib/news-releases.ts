import "server-only";

import {
  isPlaceholderNewsRelease,
  legacyRowsAsNews,
  mergeWithVerifiedNews,
  type NewsReleaseInsert,
  type NewsReleaseRow,
} from "@/lib/news-releases";
import { createAdminClient } from "@/app/api/_lib/get-admin";

function hasSupabaseAdminEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("news_releases") &&
    (lower.includes("does not exist") ||
      lower.includes("schema cache") ||
      lower.includes("could not find the table"))
  );
}

function formatNewsReleaseDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "News table not set up yet. In Supabase SQL editor, run supabase/migrations/20260601160000_news_releases.sql (see docs/PRODUCTION.md).";
  }
  if (message.toLowerCase().includes("duplicate")) {
    return "A release with this slug already exists. Choose a different slug.";
  }
  return "Something went wrong saving the release. Check Supabase logs or try again.";
}

export async function probeNewsReleasesTable(): Promise<{ ready: boolean; message?: string }> {
  if (!hasSupabaseAdminEnv()) {
    return {
      ready: false,
      message: "Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("news_releases").select("id").limit(1);

  if (error) {
    return { ready: false, message: formatNewsReleaseDbError(error.message) };
  }

  return { ready: true };
}

export async function listNewsReleases(options?: {
  publishedOnly?: boolean;
  limit?: number;
}): Promise<NewsReleaseRow[]> {
  if (!hasSupabaseAdminEnv()) {
    const legacy = legacyRowsAsNews().filter((row) => !isPlaceholderNewsRelease(row));
    if (options?.publishedOnly) {
      return options.limit ? legacy.slice(0, options.limit) : legacy;
    }
    return [];
  }

  const supabase = createAdminClient();
  let query = supabase.from("news_releases").select("*").order("published_at", { ascending: false });

  if (options?.publishedOnly) {
    query = query.eq("status", "published");
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    if (isMissingTableError(error.message)) {
      return options?.publishedOnly
        ? legacyRowsAsNews().filter((row) => !isPlaceholderNewsRelease(row))
        : [];
    }
    console.error("news_releases list error:", error.message);
    return options?.publishedOnly
      ? legacyRowsAsNews().filter((row) => !isPlaceholderNewsRelease(row))
      : [];
  }

  const rows = (data ?? []) as NewsReleaseRow[];
  const published = options?.publishedOnly
    ? rows.filter((row) => row.status === "published" && !isPlaceholderNewsRelease(row))
    : rows;

  if (options?.publishedOnly) {
    const merged = mergeWithVerifiedNews(published).filter((row) => !isPlaceholderNewsRelease(row));
    return options?.limit ? merged.slice(0, options.limit) : merged;
  }

  return options?.limit ? published.slice(0, options.limit) : published;
}

export async function getNewsReleaseBySlug(slug: string): Promise<NewsReleaseRow | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  if (!hasSupabaseAdminEnv()) {
    return legacyRowsAsNews().find((r) => r.slug === normalized) ?? null;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("news_releases")
    .select("*")
    .eq("slug", normalized)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) {
      return legacyRowsAsNews().find((r) => r.slug === normalized) ?? null;
    }
    console.error("news_releases get error:", error.message);
    return null;
  }

  return (data as NewsReleaseRow | null) ?? null;
}

export async function insertNewsRelease(
  input: NewsReleaseInsert,
): Promise<{ ok: true; row: NewsReleaseRow } | { ok: false; error: string }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Database not configured" };
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const row = {
    slug: input.slug.trim().toLowerCase(),
    title: input.title.trim(),
    summary: input.summary?.trim() || null,
    body: input.body?.trim() || null,
    external_url: input.external_url?.trim() || null,
    cover_image_url: input.cover_image_url?.trim() || null,
    status: input.status ?? "draft",
    published_at: input.published_at ?? (input.status === "published" ? now : null),
    updated_at: now,
  };

  const { data, error } = await supabase.from("news_releases").insert(row).select().single();

  if (error) {
    console.error("news_releases insert error:", error.message);
    return { ok: false, error: formatNewsReleaseDbError(error.message) };
  }

  return { ok: true, row: data as NewsReleaseRow };
}

export async function updateNewsRelease(
  id: string,
  patch: Partial<NewsReleaseInsert>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Database not configured" };
  }

  const supabase = createAdminClient();
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (patch.slug !== undefined) update.slug = patch.slug.trim().toLowerCase();
  if (patch.title !== undefined) update.title = patch.title.trim();
  if (patch.summary !== undefined) update.summary = patch.summary?.trim() || null;
  if (patch.body !== undefined) update.body = patch.body?.trim() || null;
  if (patch.external_url !== undefined) update.external_url = patch.external_url?.trim() || null;
  if (patch.cover_image_url !== undefined) update.cover_image_url = patch.cover_image_url?.trim() || null;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.published_at !== undefined) update.published_at = patch.published_at;

  const { error } = await supabase.from("news_releases").update(update).eq("id", id);

  if (error) {
    console.error("news_releases update error:", error.message);
    return { ok: false, error: formatNewsReleaseDbError(error.message) };
  }

  return { ok: true };
}

export async function deleteNewsRelease(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Database not configured" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("news_releases").delete().eq("id", id);

  if (error) {
    console.error("news_releases delete error:", error.message);
    return { ok: false, error: formatNewsReleaseDbError(error.message) };
  }

  return { ok: true };
}
