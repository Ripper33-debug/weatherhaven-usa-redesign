import "server-only";

import { isSofAccessRequest } from "@/lib/sof-auth";
import { createAdminClient } from "@/app/api/_lib/get-admin";

export type AccessRequestRow = {
  id: string;
  full_name: string | null;
  organization: string | null;
  email: string | null;
  role: string | null;
  program: string | null;
  requirements: string | null;
  reference: string | null;
  request_type: string | null;
  submitted_at: string | null;
  status: string | null;
};

export type AccessRequestInsert = {
  full_name: string;
  organization: string;
  email: string;
  role: string;
  program?: string | null;
  requirements?: string | null;
  reference?: string | null;
  request_type?: string | null;
  status?: string;
};

function isMissingColumnError(message: string, column: string): boolean {
  const lower = message.toLowerCase();
  const col = column.toLowerCase();
  return (
    lower.includes(col) &&
    (lower.includes("schema cache") ||
      lower.includes("does not exist") ||
      lower.includes("could not find"))
  );
}

function appendReferenceToRequirements(
  requirements: string | null | undefined,
  reference: string | null | undefined,
): string | null {
  const ref = reference?.trim();
  if (!ref) return requirements?.trim() || null;
  const base = requirements?.trim();
  return base ? `${base}\nReference: ${ref}` : `Reference: ${ref}`;
}

type InsertPayload = {
  full_name: string;
  organization: string;
  email: string;
  role: string;
  program: string | null;
  requirements: string | null;
  reference: string | null;
  request_type: string | null;
  status: string;
};

export async function insertAccessRequest(data: AccessRequestInsert) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("access_requests admin client error:", message);
    return { ok: false as const, error: "Something went wrong", dbError: message };
  }

  const reference = data.reference?.trim() || null;
  const requestType = data.request_type?.trim() || "general";
  const base: InsertPayload = {
    full_name: data.full_name,
    organization: data.organization,
    email: data.email,
    role: data.role,
    program: data.program ?? null,
    requirements: data.requirements ?? null,
    reference,
    request_type: requestType,
    status: data.status ?? "pending",
  };

  let { data: row, error } = await supabase.from("access_requests").insert(base).select().single();

  if (error && isMissingColumnError(error.message, "request_type")) {
    console.warn(
      "access_requests.request_type column missing — run supabase/migrations/20260606130000_access_requests_request_type.sql",
    );
    const { request_type: _removed, ...withoutType } = base;
    ({ data: row, error } = await supabase.from("access_requests").insert(withoutType).select().single());
  }

  if (error && reference && isMissingColumnError(error.message, "reference")) {
    console.warn(
      "access_requests.reference column missing — run supabase/migrations/20260529110000_admin_events_and_reference.sql",
    );
    const fallbackRow = {
      full_name: base.full_name,
      organization: base.organization,
      email: base.email,
      role: base.role,
      program: base.program,
      requirements: appendReferenceToRequirements(base.requirements, reference),
      request_type: base.request_type,
      status: base.status,
    };
    ({ data: row, error } = await supabase.from("access_requests").insert(fallbackRow).select().single());

    if (error && isMissingColumnError(error.message, "request_type")) {
      const { request_type: _removed, ...legacyRow } = fallbackRow;
      ({ data: row, error } = await supabase.from("access_requests").insert(legacyRow).select().single());
    }
  }

  if (error) {
    console.error("access_requests insert error:", error.message);
    return { ok: false as const, error: "Something went wrong", dbError: error.message };
  }
  return { ok: true as const, row: row as AccessRequestRow };
}

export async function listAccessRequests() {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("access_requests admin client error:", error);
    return [] as AccessRequestRow[];
  }

  const { data, error } = await supabase
    .from("access_requests")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("access_requests list error:", error.message);
    return [] as AccessRequestRow[];
  }
  return (data ?? []) as AccessRequestRow[];
}

export async function updateAccessRequestStatus(id: string, status: string) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("access_requests admin client error:", error);
    return { ok: false as const, error: "Something went wrong" };
  }

  const { error } = await supabase.from("access_requests").update({ status }).eq("id", id);
  if (error) {
    return { ok: false as const, error: "Something went wrong" };
  }
  return { ok: true as const };
}

export async function getAccessRequestById(id: string): Promise<AccessRequestRow | null> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("access_requests admin client error:", error);
    return null;
  }

  const { data, error } = await supabase.from("access_requests").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("access_requests get error:", error.message);
    return null;
  }
  return (data as AccessRequestRow | null) ?? null;
}

/** True when an approved SOF program access request exists for this email. */
export async function hasApprovedSofAccess(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (error) {
    console.error("hasApprovedSofAccess admin client error:", error);
    return false;
  }

  const { data, error } = await supabase
    .from("access_requests")
    .select("program")
    .eq("status", "approved")
    .ilike("email", normalized);

  if (error) {
    console.error("hasApprovedSofAccess:", error.message);
    return false;
  }

  return (data ?? []).some((row) => isSofAccessRequest(row.program));
}
