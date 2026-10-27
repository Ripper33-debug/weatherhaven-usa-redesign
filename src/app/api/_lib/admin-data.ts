import "server-only";

import { createAdminClient } from "@/app/api/_lib/get-admin";

export async function fetchRawAdminAnalyticsData() {
  const admin = createAdminClient();
  return Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("user_sessions").select("*").order("started_at", { ascending: false }),
    admin.from("page_views").select("*").order("visited_at", { ascending: false }),
    admin.from("user_events").select("*").order("occurred_at", { ascending: false }),
    admin.from("click_events").select("*").order("clicked_at", { ascending: false }),
  ]);
}

export async function fetchLeadEventStats(since30: string) {
  const admin = createAdminClient();
  const { data: events, error } = await admin
    .from("lead_events")
    .select("event_type, event_label")
    .gte("submitted_at", since30);
  return { events, error };
}

export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
