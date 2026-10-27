import "server-only";

import type { LeadPipelineStatus } from "@/lib/lead-pipeline-status";
import { createAdminClient } from "@/app/api/_lib/get-admin";

export type LeadProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  organization: string | null;
  pipeline_status: string;
  next_follow_up_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type LeadNoteRow = {
  id: string;
  lead_email: string;
  body: string;
  actor_email: string;
  created_at: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function listLeadProfiles(): Promise<LeadProfileRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lead_profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("lead_profiles list error:", error.message);
    return [];
  }
  return (data ?? []) as LeadProfileRow[];
}

export async function getLeadProfileByEmail(email: string): Promise<LeadProfileRow | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lead_profiles")
    .select("*")
    .ilike("email", normalized)
    .maybeSingle();

  if (error) {
    console.error("lead_profiles get error:", error.message);
    return null;
  }
  return (data as LeadProfileRow | null) ?? null;
}

export async function upsertLeadProfile(input: {
  email: string;
  full_name?: string | null;
  organization?: string | null;
  pipeline_status?: LeadPipelineStatus;
}): Promise<{ ok: true; row: LeadProfileRow } | { ok: false; error: string }> {
  const email = input.email.trim();
  const normalized = normalizeEmail(email);
  if (!normalized) return { ok: false, error: "Email required" };

  const supabase = createAdminClient();
  const existing = await getLeadProfileByEmail(normalized);

  const row = {
    email: normalized,
    full_name: input.full_name?.trim() || existing?.full_name || null,
    organization: input.organization?.trim() || existing?.organization || null,
    pipeline_status: input.pipeline_status ?? existing?.pipeline_status ?? "new",
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { data, error } = await supabase
      .from("lead_profiles")
      .update(row)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) {
      console.error("lead_profiles update error:", error.message);
      return { ok: false, error: "Something went wrong" };
    }
    return { ok: true, row: data as LeadProfileRow };
  }

  const { data, error } = await supabase.from("lead_profiles").insert(row).select().single();
  if (error) {
    console.error("lead_profiles insert error:", error.message);
    return { ok: false, error: "Something went wrong" };
  }
  return { ok: true, row: data as LeadProfileRow };
}

export async function updateLeadProfile(
  email: string,
  patch: {
    pipeline_status?: LeadPipelineStatus;
    next_follow_up_at?: string | null;
    full_name?: string | null;
    organization?: string | null;
  },
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalized = normalizeEmail(email);
  if (!normalized) return { ok: false, error: "Email required" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("lead_profiles")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .ilike("email", normalized);

  if (error) {
    console.error("lead_profiles patch error:", error.message);
    return { ok: false, error: "Something went wrong" };
  }
  return { ok: true };
}

export async function listLeadNotes(email: string, limit = 50): Promise<LeadNoteRow[]> {
  const normalized = normalizeEmail(email);
  if (!normalized) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .ilike("lead_email", normalized)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("lead_notes list error:", error.message);
    return [];
  }
  return (data ?? []) as LeadNoteRow[];
}

export async function insertLeadNote(input: {
  lead_email: string;
  body: string;
  actor_email: string;
}): Promise<{ ok: true; row: LeadNoteRow } | { ok: false; error: string }> {
  const body = input.body.trim();
  if (!body) return { ok: false, error: "Note cannot be empty" };

  const email = normalizeEmail(input.lead_email);
  if (!email) return { ok: false, error: "Email required" };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .insert({
      lead_email: email,
      body,
      actor_email: input.actor_email.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error("lead_notes insert error:", error.message);
    return { ok: false, error: "Something went wrong" };
  }

  await supabase
    .from("lead_profiles")
    .update({ updated_at: new Date().toISOString() })
    .ilike("email", email);

  return { ok: true, row: data as LeadNoteRow };
}

export async function listAllLeadNotes(limit = 500): Promise<LeadNoteRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lead_notes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("lead_notes list all error:", error.message);
    return [];
  }
  return (data ?? []) as LeadNoteRow[];
}
