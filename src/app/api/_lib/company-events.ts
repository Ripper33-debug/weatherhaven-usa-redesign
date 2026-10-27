import "server-only";

import {
  legacyRowsAsCompanyEvents,
  type CompanyEventInsert,
  type CompanyEventRow,
} from "@/lib/company-events";
import { createAdminClient } from "@/app/api/_lib/get-admin";

function hasSupabaseAdminEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("company_events") &&
    (lower.includes("does not exist") ||
      lower.includes("schema cache") ||
      lower.includes("could not find the table"))
  );
}

function formatCompanyEventDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "Events table not set up yet. Run supabase/migrations/20260606120000_company_events.sql in Supabase.";
  }
  if (message.toLowerCase().includes("duplicate")) {
    return "An event with this slug already exists. Choose a different slug.";
  }
  return "Something went wrong saving the event. Check Supabase logs or try again.";
}

export async function probeCompanyEventsTable(): Promise<{ ready: boolean; message?: string }> {
  if (!hasSupabaseAdminEnv()) {
    return {
      ready: false,
      message: "Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("company_events").select("id").limit(1);

  if (error) {
    return { ready: false, message: formatCompanyEventDbError(error.message) };
  }

  return { ready: true };
}

export async function listCompanyEvents(options?: {
  publishedOnly?: boolean;
  limit?: number;
}): Promise<CompanyEventRow[]> {
  if (!hasSupabaseAdminEnv()) {
    const legacy = legacyRowsAsCompanyEvents();
    if (options?.publishedOnly) {
      return options.limit ? legacy.slice(0, options.limit) : legacy;
    }
    return [];
  }

  const supabase = createAdminClient();
  let query = supabase
    .from("company_events")
    .select("*")
    .order("starts_at", { ascending: true, nullsFirst: false });

  if (options?.publishedOnly) {
    query = query.eq("status", "published");
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    if (isMissingTableError(error.message)) {
      return options?.publishedOnly ? legacyRowsAsCompanyEvents() : [];
    }
    console.error("company_events list error:", error.message);
    return options?.publishedOnly ? legacyRowsAsCompanyEvents() : [];
  }

  const rows = (data ?? []) as CompanyEventRow[];
  if (options?.publishedOnly && rows.length === 0) {
    return legacyRowsAsCompanyEvents();
  }
  return rows;
}

export async function insertCompanyEvent(
  input: CompanyEventInsert,
): Promise<{ ok: true; row: CompanyEventRow } | { ok: false; error: string }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Database not configured" };
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const row = {
    slug: input.slug.trim().toLowerCase(),
    title: input.title.trim(),
    summary: input.summary?.trim() || null,
    event_type: input.event_type ?? "capability_briefing",
    schedule_type: input.schedule_type ?? "scheduled",
    starts_at: input.starts_at ?? null,
    ends_at: input.ends_at ?? null,
    timezone: input.timezone?.trim() || "America/New_York",
    location: input.location?.trim() || null,
    registration_url: input.registration_url?.trim() || null,
    related_news_slug: input.related_news_slug?.trim() || null,
    cover_image_url: input.cover_image_url?.trim() || null,
    status: input.status ?? "draft",
    updated_at: now,
  };

  const { data, error } = await supabase.from("company_events").insert(row).select().single();

  if (error) {
    console.error("company_events insert error:", error.message);
    return { ok: false, error: formatCompanyEventDbError(error.message) };
  }

  return { ok: true, row: data as CompanyEventRow };
}

export async function updateCompanyEvent(
  id: string,
  patch: Partial<CompanyEventInsert>,
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
  if (patch.event_type !== undefined) update.event_type = patch.event_type;
  if (patch.schedule_type !== undefined) update.schedule_type = patch.schedule_type;
  if (patch.starts_at !== undefined) update.starts_at = patch.starts_at;
  if (patch.ends_at !== undefined) update.ends_at = patch.ends_at;
  if (patch.timezone !== undefined) update.timezone = patch.timezone?.trim() || null;
  if (patch.location !== undefined) update.location = patch.location?.trim() || null;
  if (patch.registration_url !== undefined) update.registration_url = patch.registration_url?.trim() || null;
  if (patch.related_news_slug !== undefined) update.related_news_slug = patch.related_news_slug?.trim() || null;
  if (patch.cover_image_url !== undefined) update.cover_image_url = patch.cover_image_url?.trim() || null;
  if (patch.status !== undefined) update.status = patch.status;

  const { error } = await supabase.from("company_events").update(update).eq("id", id);

  if (error) {
    console.error("company_events update error:", error.message);
    return { ok: false, error: formatCompanyEventDbError(error.message) };
  }

  return { ok: true };
}

export async function deleteCompanyEvent(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Database not configured" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("company_events").delete().eq("id", id);

  if (error) {
    console.error("company_events delete error:", error.message);
    return { ok: false, error: formatCompanyEventDbError(error.message) };
  }

  return { ok: true };
}
