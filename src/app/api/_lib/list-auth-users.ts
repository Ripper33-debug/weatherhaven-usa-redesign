import "server-only";

import { createAdminClient } from "@/app/api/_lib/get-admin";

export async function listAuthUsers(perPage = 1000) {
  return createAdminClient().auth.admin.listUsers({ perPage });
}
