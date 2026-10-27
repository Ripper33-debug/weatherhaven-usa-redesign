import "server-only";

import { createAdminClient } from "@/app/api/_lib/get-admin";
import { findUserByEmail } from "@/app/api/_lib/find-user-by-email";

export async function upsertAuthUserPassword(
  email: string,
  password: string,
  metadataPatch?: Record<string, unknown>,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const admin = createAdminClient();
  const trimmedEmail = email.trim();
  const { user: existing } = await findUserByEmail(trimmedEmail);

  if (existing) {
    const mergedMeta = {
      ...((existing.user_metadata ?? {}) as Record<string, unknown>),
      ...(metadataPatch ?? {}),
    };
    const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      user_metadata: mergedMeta,
    });
    if (updateError) {
      return { ok: false, error: "Something went wrong" };
    }
    return { ok: true, userId: existing.id };
  }

  const { data, error: createError } = await admin.auth.admin.createUser({
    email: trimmedEmail,
    password,
    email_confirm: true,
    user_metadata: metadataPatch ?? {},
  });
  if (createError) {
    return { ok: false, error: "Something went wrong" };
  }
  if (!data.user?.id) {
    return { ok: false, error: "Something went wrong" };
  }
  return { ok: true, userId: data.user.id };
}

export async function listAuthUsersForAdmin() {
  const admin = createAdminClient();
  return admin.auth.admin.listUsers({ perPage: 1000 });
}

export async function createAuthUser(email: string, password: string) {
  const admin = createAdminClient();
  return admin.auth.admin.createUser({ email, password, email_confirm: true });
}

export async function deleteAuthUser(userId: string) {
  const admin = createAdminClient();
  return admin.auth.admin.deleteUser(userId);
}

export async function updateAuthUserPassword(userId: string, password: string) {
  const admin = createAdminClient();
  return admin.auth.admin.updateUserById(userId, { password });
}

export async function createInviteAuthUser(email: string, password: string) {
  const admin = createAdminClient();
  return admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
}

export async function updateInviteExistingUser(userId: string, password: string) {
  const admin = createAdminClient();
  return admin.auth.admin.updateUserById(userId, { password });
}
