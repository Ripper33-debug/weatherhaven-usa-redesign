import "server-only";

import type { AdminEventInsert, AdminEventRow } from "@/lib/admin-event-labels";
import { createAdminClient } from "@/app/api/_lib/get-admin";

export async function insertAdminEvent(event: AdminEventInsert): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("admin_events").insert({
    actor_email: event.actor_email.trim(),
    action: event.action,
    target_type: event.target_type ?? null,
    target_id: event.target_id ?? null,
    target_email: event.target_email?.trim().toLowerCase() ?? null,
    detail: event.detail ?? null,
  });

  if (error) {
    console.error("admin_events insert error:", error.message);
    return { ok: false, error: "Something went wrong" };
  }
  return { ok: true };
}

export async function listAdminEvents(limit = 80): Promise<AdminEventRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("admin_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("admin_events list error:", error.message);
    return [];
  }
  return (data ?? []) as AdminEventRow[];
}
