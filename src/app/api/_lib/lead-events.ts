import "server-only";

import { createAdminClient } from "@/app/api/_lib/get-admin";

export type LeadEventType =
  | "inquiry_submit"
  | "access_request"
  | "sof_request"
  | "mission_builder"
  | "camp_planner"
  | "demo_request"
  | "product_interest"
  | "cta_click";

export type LeadEventInsert = {
  event_type: LeadEventType;
  event_label: string;
  page?: string | null;
  payload?: Record<string, unknown> | null;
  session_key?: string | null;
};

export async function insertLeadEvent(data: LeadEventInsert) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("lead_events").insert({
    event_type: data.event_type,
    event_label: data.event_label.trim().slice(0, 200),
    page: data.page?.trim().slice(0, 500) ?? null,
    payload: data.payload ?? null,
    session_key: data.session_key?.trim().slice(0, 64) ?? null,
  });

  if (error) {
    console.error("lead_events insert:", error.message);
    return { ok: false as const, error: "Something went wrong" };
  }
  return { ok: true as const };
}
