import "server-only";

import { createAdminClient } from "@/app/api/_lib/get-admin";

/** Find auth user by email (case-insensitive). */
export async function findUserByEmail(email: string) {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();
  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) {
    console.error("findUserByEmail:", error.message);
    return { user: null, error: "Something went wrong" };
  }
  const user = (data?.users ?? []).find((u) => u.email?.trim().toLowerCase() === normalized) ?? null;
  return { user, error: null };
}
