export type AdminEventRow = {
  id: string;
  actor_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_email: string | null;
  detail: Record<string, unknown> | null;
  created_at: string | null;
};

export type AdminEventInsert = {
  actor_email: string;
  action: string;
  target_type?: string;
  target_id?: string;
  target_email?: string;
  detail?: Record<string, unknown>;
};

const ACTION_LABELS: Record<string, string> = {
  "access_request.approved": "Access approved",
  "access_request.denied": "Access denied",
  "platform_password.reset": "Platform password reset",
  "sof_code.reset": "SOF access code reset",
  "invite.sent": "Invite sent",
};

export function adminEventLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}
