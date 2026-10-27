"use server";

import { revalidatePath } from "next/cache";
import { isAdminEmail } from "@/lib/auth-admin";
import { getAccessRequestById, updateAccessRequestStatus } from "@/lib/accessRequests";
import { insertAdminEvent, type AdminEventInsert } from "@/lib/admin-events";
import { updateContactLeadStatus } from "@/lib/contactLeads";
import { generateTempPassword, sendInviteEmail, sendWelcomeEmail } from "@/lib/email";
import { captureRouteWarning } from "@/lib/monitoring";
import { sendAccessDeniedEmail } from "@/lib/send-access-denied-email";
import {
  generateSofAccessPin,
} from "@/lib/sof-auth-pin";
import {
  isSofAccessRequest,
  SOF_PROGRAM_MARKER,
} from "@/lib/sof-auth";
import { passwordFromSofPin } from "@/lib/sof-auth-password";
import { markSofApprovedInMetadata } from "@/lib/sof-membership";
import { sendSofAccessCodeEmail } from "@/lib/send-sof-access-email";
import { createInvite, listInvites, refreshInviteToken, type InviteRow } from "@/lib/invites";
import { getSiteUrl } from "@/lib/site-url";
import { findUserByEmail } from "@/lib/supabase/find-user-by-email";
import {
  createAuthUser,
  createInviteAuthUser,
  deleteAuthUser,
  listAuthUsersForAdmin,
  updateAuthUserPassword,
  updateInviteExistingUser,
  upsertAuthUserPassword,
} from "@/app/api/_lib/admin-user-ops";
import { createClient } from "@/lib/supabase/server";

export type AdminUserRow = {
  id: string;
  email: string | undefined;
  created_at: string;
  last_sign_in_at: string | null | undefined;
  isOperator?: boolean;
};

async function assertAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAdminEmail(user?.email);
}

async function adminActorEmail(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.email?.trim() ?? "unknown";
}

async function recordAdminAction(event: Omit<AdminEventInsert, "actor_email">): Promise<void> {
  const result = await insertAdminEvent({
    actor_email: await adminActorEmail(),
    ...event,
  });
  if (!result.ok) {
    captureRouteWarning("admin/action", "Admin audit log insert failed", {
      action: event.action,
      error: result.error,
    });
  }
}

function sofMembershipMetadata(): Record<string, unknown> {
  return {
    sof_approved: true,
    sof_program: SOF_PROGRAM_MARKER,
    sof_approved_at: new Date().toISOString(),
  };
}


export async function adminListUsers(): Promise<AdminUserRow[]> {
  if (!(await assertAdmin())) {
    return [];
  }
  const { data } = await listAuthUsersForAdmin();
  return (data?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at ?? "",
    last_sign_in_at: u.last_sign_in_at,
  }));
}

export async function adminSendInvite(
  email: string,
  name?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return { ok: false, error: "Email required" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const token = crypto.randomUUID();
  const created = await createInvite({
    email: trimmedEmail,
    name,
    invitedBy: user?.email ?? "admin",
    token,
  });

  if (!created.ok) {
    return { ok: false, error: created.error };
  }

  const mail = await sendInviteEmail({ to: trimmedEmail, token, siteUrl: getSiteUrl() });
  if (!mail.ok && !("skipped" in mail && mail.skipped)) {
    return { ok: false, error: mail.error ?? "Failed to send invite email" };
  }

  await recordAdminAction({
    action: "invite.sent",
    target_type: "invite",
    target_email: trimmedEmail,
    detail: { name: name?.trim() || null },
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminResendInvite(
  inviteId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const invites = await listInvites();
  const invite = invites.find((i) => i.id === inviteId);
  if (!invite) {
    return { ok: false, error: "Invite not found" };
  }

  const token = crypto.randomUUID();
  const refreshed = await refreshInviteToken(inviteId, token);
  if (!refreshed.ok) {
    return { ok: false, error: refreshed.error ?? "Failed to refresh invite" };
  }

  const mail = await sendInviteEmail({ to: invite.email, token, siteUrl: getSiteUrl() });
  if (!mail.ok && !("skipped" in mail && mail.skipped)) {
    return { ok: false, error: mail.error ?? "Failed to send invite email" };
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminListInvites(): Promise<InviteRow[]> {
  if (!(await assertAdmin())) {
    return [];
  }
  return listInvites();
}

export async function acceptInviteAccount(
  token: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { getInviteByToken, markInviteAccepted, validateInvite } = await import("@/lib/invites");
  const invite = await getInviteByToken(token);
  const validation = validateInvite(invite);
  if (!validation.valid || !invite) {
    return { ok: false, error: "This invitation is invalid or has expired." };
  }

  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const { error: createError } = await createInviteAuthUser(invite.email, password);

  if (createError) {
    const existing = await findUserByEmail(invite.email);
    if (existing.user) {
      const { error: updateError } = await updateInviteExistingUser(existing.user.id, password);
      if (updateError) {
        return { ok: false, error: "Something went wrong" };
      }
    } else {
      return { ok: false, error: "Something went wrong" };
    }
  }

  const marked = await markInviteAccepted(token);
  if (!marked.ok) {
    return { ok: false, error: marked.error ?? "Failed to update invite" };
  }

  return { ok: true };
}

export async function adminAddUser(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }
  const { error } = await createAuthUser(email, password);
  if (error) {
    return { ok: false, error: "Something went wrong" };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminDeleteUser(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }
  const { error } = await deleteAuthUser(userId);
  if (error) {
    return { ok: false, error: "Something went wrong" };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminApproveAccessRequest(
  requestId: string,
  email: string,
  program?: string | null,
): Promise<
  { ok: true; password: string; sofPin?: string; emailSent?: boolean } | { ok: false; error: string }
> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { ok: false, error: "Email required" };
  }

  const sof = isSofAccessRequest(program);
  const sofPin = sof ? generateSofAccessPin() : undefined;
  const password = sofPin ? passwordFromSofPin(sofPin) : generateTempPassword();

  const userResult = await upsertAuthUserPassword(
    trimmedEmail,
    password,
    sof ? sofMembershipMetadata() : undefined,
  );
  if (!userResult.ok) {
    return { ok: false, error: userResult.error };
  }

  if (sof) {
    await markSofApprovedInMetadata(userResult.userId);
  }

  const statusResult = await updateAccessRequestStatus(requestId, "approved");
  if (!statusResult.ok) {
    return { ok: false, error: statusResult.error };
  }

  let emailSent = false;
  if (sof && sofPin) {
    const mail = await sendSofAccessCodeEmail(trimmedEmail, sofPin);
    emailSent = mail.ok;
    if (!mail.ok && !("skipped" in mail && mail.skipped)) {
      revalidatePath("/admin");
      return {
        ok: false,
        error: `Account ready but email failed: ${mail.error}. Share code manually: ${sofPin}`,
      };
    }
  } else {
    const mail = await sendWelcomeEmail({ to: trimmedEmail, password });
    emailSent = mail.ok;
    if (!mail.ok && !("skipped" in mail && mail.skipped)) {
      revalidatePath("/admin");
      return {
        ok: false,
        error: `Account ready but email failed: ${"error" in mail ? mail.error : "unknown"}. Share password manually: ${password}`,
      };
    }
  }

  await recordAdminAction({
    action: "access_request.approved",
    target_type: "access_request",
    target_id: requestId,
    target_email: trimmedEmail,
    detail: { sof, emailSent },
  });

  revalidatePath("/admin");
  return { ok: true, password, sofPin, emailSent };
}

/** Set a new platform password for /login and email it to the user. */
export async function adminResetPlatformPassword(
  email: string,
): Promise<{ ok: true; password: string; emailSent: boolean } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return { ok: false, error: "Email required" };
  }

  const { user, error: lookupError } = await findUserByEmail(trimmedEmail);
  if (lookupError) {
    return { ok: false, error: lookupError };
  }
  if (!user) {
    return { ok: false, error: "No account for this email. Approve an access request or send an invite first." };
  }

  const password = generateTempPassword();
  const { error: updateError } = await updateAuthUserPassword(user.id, password);

  if (updateError) {
    return { ok: false, error: "Something went wrong" };
  }

  const mail = await sendWelcomeEmail({ to: trimmedEmail, password });
  revalidatePath("/admin");

  if (!mail.ok) {
    if ("skipped" in mail && mail.skipped) {
      await recordAdminAction({
        action: "platform_password.reset",
        target_type: "user",
        target_id: user.id,
        target_email: trimmedEmail,
        detail: { emailSent: false },
      });
      return { ok: true, password, emailSent: false };
    }
    return {
      ok: false,
      error: `Password updated but email failed: ${mail.error}. Share manually: ${password}`,
    };
  }

  await recordAdminAction({
    action: "platform_password.reset",
    target_type: "user",
    target_id: user.id,
    target_email: trimmedEmail,
    detail: { emailSent: true },
  });

  return { ok: true, password, emailSent: true };
}

/** Issue a new four-digit SOF code and email it to an existing member. */
export async function adminResetSofAccessCode(
  email: string,
): Promise<{ ok: true; sofPin: string; emailSent: boolean } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) {
    return { ok: false, error: "Email required" };
  }

  const { user, error: lookupError } = await findUserByEmail(trimmedEmail);
  if (lookupError) {
    return { ok: false, error: lookupError };
  }
  if (!user) {
    return { ok: false, error: "No account for this email. Approve a SOF access request first." };
  }

  const sofPin = generateSofAccessPin();
  const resetResult = await upsertAuthUserPassword(
    trimmedEmail,
    passwordFromSofPin(sofPin),
    sofMembershipMetadata(),
  );
  if (!resetResult.ok) {
    return { ok: false, error: resetResult.error };
  }
  await markSofApprovedInMetadata(resetResult.userId);

  const mail = await sendSofAccessCodeEmail(trimmedEmail, sofPin);
  revalidatePath("/admin");

  if (!mail.ok) {
    if ("skipped" in mail && mail.skipped) {
      await recordAdminAction({
        action: "sof_code.reset",
        target_type: "user",
        target_id: user.id,
        target_email: trimmedEmail,
        detail: { emailSent: false },
      });
      return {
        ok: true,
        sofPin,
        emailSent: false,
      };
    }
    return {
      ok: false,
      error: `Password updated but email failed: ${mail.error}. Share code manually: ${sofPin}`,
    };
  }

  await recordAdminAction({
    action: "sof_code.reset",
    target_type: "user",
    target_id: user.id,
    target_email: trimmedEmail,
    detail: { emailSent: true },
  });

  return { ok: true, sofPin, emailSent: true };
}

export async function adminDenyAccessRequest(
  requestId: string,
): Promise<{ ok: true; emailSent: boolean } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const request = await getAccessRequestById(requestId);
  if (!request) {
    return { ok: false, error: "Request not found" };
  }

  const result = await updateAccessRequestStatus(requestId, "denied");
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  let emailSent = false;
  const recipient = request.email?.trim();
  if (recipient) {
    const mail = await sendAccessDeniedEmail({
      to: recipient,
      name: request.full_name?.trim() || "there",
      organization: request.organization,
      program: request.program,
      reference: request.reference,
    });
    emailSent = mail.ok;
    if (!mail.ok && !("skipped" in mail && mail.skipped)) {
      captureRouteWarning("admin/deny-access", "Denied notification email failed", {
        requestId,
        error: mail.error,
      });
    }
  }

  await recordAdminAction({
    action: "access_request.denied",
    target_type: "access_request",
    target_id: requestId,
    target_email: recipient ?? undefined,
    detail: { emailSent, reference: request.reference },
  });

  revalidatePath("/admin");
  return { ok: true, emailSent };
}

export async function adminUpdateContactLeadStatus(
  leadId: string,
  status: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }
  const result = await updateContactLeadStatus(leadId, status);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  revalidatePath("/admin");
  return { ok: true };
}

export async function adminUpdateLeadPipeline(
  email: string,
  pipelineStatus: string,
  nextFollowUpAt: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const { isLeadPipelineStatus } = await import("@/lib/lead-pipeline-status");
  const { upsertLeadProfile, updateLeadProfile } = await import("@/lib/leadProfiles");

  if (!isLeadPipelineStatus(pipelineStatus)) {
    return { ok: false, error: "Invalid pipeline status" };
  }

  const upsert = await upsertLeadProfile({ email, pipeline_status: pipelineStatus });
  if (!upsert.ok) return upsert;

  const patch = await updateLeadProfile(email, {
    pipeline_status: pipelineStatus,
    next_follow_up_at: nextFollowUpAt,
  });
  if (!patch.ok) return patch;

  await recordAdminAction({
    action: "lead.pipeline_updated",
    target_type: "lead",
    target_email: email,
    detail: { pipelineStatus, nextFollowUpAt },
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminAddLeadNote(
  email: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const { upsertLeadProfile, insertLeadNote } = await import("@/lib/leadProfiles");

  await upsertLeadProfile({ email });

  const result = await insertLeadNote({
    lead_email: email,
    body,
    actor_email: await adminActorEmail(),
  });
  if (!result.ok) return result;

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminSaveNewsRelease(input: {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  body?: string;
  external_url?: string;
  cover_image_url?: string;
  status: "draft" | "published";
  published_at?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const { insertNewsRelease, updateNewsRelease } = await import("@/app/api/_lib/news-releases");
  const { slugifyNewsTitle } = await import("@/lib/news-releases");

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title required" };

  const slug = (input.slug.trim() || slugifyNewsTitle(title)).toLowerCase();
  const publishedAt =
    input.published_at?.trim() ||
    (input.status === "published" ? new Date().toISOString() : null);

  if (input.id) {
    const result = await updateNewsRelease(input.id, {
      slug,
      title,
      summary: input.summary ?? null,
      body: input.body ?? null,
      external_url: input.external_url ?? null,
      cover_image_url: input.cover_image_url ?? null,
      status: input.status,
      published_at: publishedAt,
    });
    if (!result.ok) return result;
  } else {
    const result = await insertNewsRelease({
      slug,
      title,
      summary: input.summary ?? null,
      body: input.body ?? null,
      external_url: input.external_url ?? null,
      cover_image_url: input.cover_image_url ?? null,
      status: input.status,
      published_at: publishedAt,
    });
    if (!result.ok) return result;
  }

  await recordAdminAction({
    action: input.id ? "news_release.updated" : "news_release.created",
    target_type: "news_release",
    target_id: input.id ?? slug,
    detail: { slug, status: input.status },
  });

  revalidatePath("/admin");
  revalidatePath("/news");
  revalidatePath("/events");
  revalidatePath("/");
  return { ok: true };
}

export async function adminDeleteNewsRelease(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const { deleteNewsRelease } = await import("@/app/api/_lib/news-releases");
  const result = await deleteNewsRelease(id);
  if (!result.ok) return result;

  await recordAdminAction({
    action: "news_release.deleted",
    target_type: "news_release",
    target_id: id,
  });

  revalidatePath("/admin");
  revalidatePath("/news");
  revalidatePath("/events");
  revalidatePath("/");
  return { ok: true };
}

export async function adminSaveCompanyEvent(input: {
  id?: string;
  title: string;
  slug: string;
  summary?: string;
  event_type?: import("@/lib/company-events").CompanyEventType;
  schedule_type?: import("@/lib/company-events").CompanyEventScheduleType;
  starts_at?: string | null;
  ends_at?: string | null;
  timezone?: string;
  location?: string;
  registration_url?: string;
  related_news_slug?: string;
  cover_image_url?: string;
  status?: "draft" | "published";
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const { insertCompanyEvent, updateCompanyEvent } = await import("@/app/api/_lib/company-events");
  const { slugifyEventTitle } = await import("@/lib/company-events");

  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title required" };

  const slug = (input.slug.trim() || slugifyEventTitle(title)).toLowerCase();
  const payload = {
    slug,
    title,
    summary: input.summary ?? null,
    event_type: input.event_type,
    schedule_type: input.schedule_type,
    starts_at: input.starts_at ?? null,
    ends_at: input.ends_at ?? null,
    timezone: input.timezone,
    location: input.location ?? null,
    registration_url: input.registration_url ?? null,
    related_news_slug: input.related_news_slug ?? null,
    cover_image_url: input.cover_image_url ?? null,
    status: input.status,
  };

  if (input.id) {
    if (input.id.startsWith("legacy-")) {
      return { ok: false, error: "Fallback rows cannot be edited. Run company_events migration and seed SQL." };
    }
    const result = await updateCompanyEvent(input.id, payload);
    if (!result.ok) return result;
  } else {
    const result = await insertCompanyEvent(payload);
    if (!result.ok) return result;
  }

  await recordAdminAction({
    action: input.id ? "company_event.updated" : "company_event.created",
    target_type: "company_event",
    target_id: input.id ?? slug,
    detail: { slug, status: input.status },
  });

  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath("/");
  return { ok: true };
}

export async function adminDeleteCompanyEvent(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const { deleteCompanyEvent } = await import("@/app/api/_lib/company-events");
  const result = await deleteCompanyEvent(id);
  if (!result.ok) return result;

  await recordAdminAction({
    action: "company_event.deleted",
    target_type: "company_event",
    target_id: id,
  });

  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath("/");
  return { ok: true };
}

export async function adminSaveCatalogProduct(input: {
  id?: string;
  slug: string;
  status: "draft" | "published";
  sort_order?: number;
  data: import("@/lib/products").Product;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const { insertCatalogProduct, updateCatalogProduct } = await import("@/app/api/_lib/catalog-products");
  const { slugifyProductName } = await import("@/lib/catalog-products");

  const name = input.data.name?.trim();
  if (!name) return { ok: false, error: "Product name required" };

  const slug = (input.slug.trim() || slugifyProductName(name)).toLowerCase();
  const data = { ...input.data, slug };

  if (input.id) {
    if (input.id.startsWith("static-")) {
      return { ok: false, error: "Built-in fallback rows cannot be edited. Run catalog SQL to seed Supabase." };
    }
    const result = await updateCatalogProduct(input.id, {
      slug,
      status: input.status,
      sort_order: input.sort_order,
      data,
    });
    if (!result.ok) return result;
  } else {
    const result = await insertCatalogProduct({
      slug,
      status: input.status,
      sort_order: input.sort_order ?? 0,
      data,
    });
    if (!result.ok) return result;
  }

  await recordAdminAction({
    action: input.id ? "catalog_product.updated" : "catalog_product.created",
    target_type: "catalog_product",
    target_id: input.id ?? slug,
    detail: { slug, status: input.status },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/configurable-solutions");
  revalidatePath("/mission-solution-builder");
  revalidatePath(`/configurable-solutions/${slug}`);
  return { ok: true };
}

export async function adminDeleteCatalogProduct(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  if (id.startsWith("static-")) {
    return { ok: false, error: "Built-in fallback rows cannot be deleted." };
  }

  const { deleteCatalogProduct, listCatalogProducts } = await import("@/app/api/_lib/catalog-products");
  const rows = await listCatalogProducts();
  const row = rows.find((r) => r.id === id);
  const result = await deleteCatalogProduct(id);
  if (!result.ok) return result;

  await recordAdminAction({
    action: "catalog_product.deleted",
    target_type: "catalog_product",
    target_id: id,
    detail: row ? { slug: row.slug } : undefined,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/configurable-solutions");
  revalidatePath("/mission-solution-builder");
  if (row?.slug) {
    revalidatePath(`/configurable-solutions/${row.slug}`);
  }
  return { ok: true };
}

export async function adminSaveDeploymentStory(input: {
  deployment_id: string;
  headline?: string;
  narrative?: string;
  image_slug?: string;
  cover_image_url?: string;
  featured?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const { upsertDeploymentStory } = await import("@/app/api/_lib/deployment-stories");
  const result = await upsertDeploymentStory(input);
  if (!result.ok) return result;

  await recordAdminAction({
    action: "deployment_story.updated",
    target_type: "deployment_story",
    target_id: input.deployment_id,
    detail: { featured: Boolean(input.featured) },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/api/deployment-stories");
  return { ok: true };
}

export async function adminDeleteDeploymentStory(
  deploymentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }

  const { deleteDeploymentStory } = await import("@/app/api/_lib/deployment-stories");
  const result = await deleteDeploymentStory(deploymentId);
  if (!result.ok) return result;

  await recordAdminAction({
    action: "deployment_story.deleted",
    target_type: "deployment_story",
    target_id: deploymentId,
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/api/deployment-stories");
  return { ok: true };
}
