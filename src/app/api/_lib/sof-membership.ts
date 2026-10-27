import "server-only";

import { SOF_PROGRAM_MARKER } from "@/lib/sof-auth";
import { createAdminClient } from "@/app/api/_lib/get-admin";

export async function markSofApprovedInMetadata(userId: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  const existing = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
  await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...existing,
      sof_approved: true,
      sof_program: SOF_PROGRAM_MARKER,
      sof_approved_at: new Date().toISOString(),
    },
  });
}
