import type { User } from "@supabase/supabase-js";
import { hasApprovedSofAccess } from "@/lib/accessRequests";
import { isAdminEmail } from "@/lib/auth-admin";
import { markSofApprovedInMetadata } from "@/app/api/_lib/sof-membership";

export const SOF_NOT_APPROVED_QUERY = "not_approved";

export function userHasSofAccessFromMetadata(user: User | null | undefined): boolean {
  if (!user?.user_metadata) return false;
  return user.user_metadata.sof_approved === true;
}

/** Admin operators may access SOF secure for support; members need approval metadata or DB row. */
export async function userCanAccessSofSecure(
  user: User | null | undefined,
): Promise<boolean> {
  if (!user?.email) return false;
  if (isAdminEmail(user.email)) return true;
  if (userHasSofAccessFromMetadata(user)) return true;
  return hasApprovedSofAccess(user.email);
}

export { markSofApprovedInMetadata } from "@/app/api/_lib/sof-membership";

export async function syncSofMembershipMetadata(user: User): Promise<void> {
  if (userHasSofAccessFromMetadata(user)) return;
  if (!user.email || !(await hasApprovedSofAccess(user.email))) return;
  await markSofApprovedInMetadata(user.id);
}
