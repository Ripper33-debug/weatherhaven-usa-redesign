import "server-only";

import { createAdminClient } from "@/app/api/_lib/get-admin";

export type InviteRow = {
  id: string;
  email: string;
  name: string | null;
  token: string;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  status: string;
};

export async function listInvites(): Promise<InviteRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("invites").select("*").order("invited_at", { ascending: false });
  if (error) {
    console.error("listInvites:", error.message);
    return [];
  }
  return (data ?? []) as InviteRow[];
}

export async function getInviteByToken(token: string): Promise<InviteRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("invites").select("*").eq("token", token).maybeSingle();
  if (error || !data) return null;
  return data as InviteRow;
}

export async function createInvite(params: {
  email: string;
  name?: string;
  invitedBy: string;
  token: string;
}): Promise<{ ok: true; invite: InviteRow } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invites")
    .insert({
      email: params.email.trim().toLowerCase(),
      name: params.name?.trim() || null,
      token: params.token,
      invited_by: params.invitedBy,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    return { ok: false, error: "Something went wrong" };
  }
  return { ok: true, invite: data as InviteRow };
}

export async function markInviteAccepted(token: string): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("invites")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("token", token);
  if (error) return { ok: false, error: "Something went wrong" };
  return { ok: true };
}

export async function refreshInviteToken(id: string, token: string): Promise<{ ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("invites")
    .update({
      token,
      invited_at: new Date().toISOString(),
      status: "pending",
      accepted_at: null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: "Something went wrong" };
  return { ok: true };
}
