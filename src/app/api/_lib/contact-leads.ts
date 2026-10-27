import "server-only";

import { createAdminClient } from "@/app/api/_lib/get-admin";

export type ContactLeadRow = {
  id: string;
  user_id: string | null;
  full_name: string | null;
  organization: string | null;
  role: string | null;
  inquiry_type: string | null;
  program: string | null;
  subject: string | null;
  message: string | null;
  contact_method: string | null;
  phone: string | null;
  email: string | null;
  region: string | null;
  submitted_at: string | null;
  status: string | null;
};

export type ContactLeadInsert = {
  user_id: string;
  full_name: string;
  organization: string;
  role: string;
  inquiry_type: string;
  program?: string | null;
  subject: string;
  message: string;
  contact_method: string;
  phone?: string | null;
};

export async function listContactLeads() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_leads")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("contact_leads list error:", error.message);
    return [] as ContactLeadRow[];
  }
  return (data ?? []) as ContactLeadRow[];
}

export async function updateContactLeadStatus(id: string, status: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_leads").update({ status }).eq("id", id);
  if (error) {
    return { ok: false as const, error: "Something went wrong" };
  }
  return { ok: true as const };
}
