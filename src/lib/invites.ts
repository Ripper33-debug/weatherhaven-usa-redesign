export type { InviteRow } from "@/app/api/_lib/invites";
export {
  createInvite,
  getInviteByToken,
  listInvites,
  markInviteAccepted,
  refreshInviteToken,
} from "@/app/api/_lib/invites";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function isInviteExpired(invitedAt: string): boolean {
  return Date.now() - new Date(invitedAt).getTime() > INVITE_TTL_MS;
}

export function validateInvite(invite: import("@/app/api/_lib/invites").InviteRow | null): {
  valid: boolean;
  reason?: string;
} {
  if (!invite) return { valid: false, reason: "not_found" };
  if (invite.status === "accepted") return { valid: false, reason: "accepted" };
  if (isInviteExpired(invite.invited_at)) return { valid: false, reason: "expired" };
  return { valid: true };
}
