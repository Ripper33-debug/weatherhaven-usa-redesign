"use server";

import { notFound, redirect } from "next/navigation";
import { isAccessRequestStatus } from "@/lib/access-request-status";
import { updateAccessRequestStatus } from "@/lib/accessRequests";
import { secureCompare } from "@/lib/secure-compare";

export async function setLeadStatusAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const expected = process.env.LEADS_REGISTER_VIEW_TOKEN;
  if (!token || !expected || !secureCompare(token, expected)) {
    notFound();
  }
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !isAccessRequestStatus(status)) {
    redirect(`/programs/sof-lead-register?t=${encodeURIComponent(token)}`);
  }
  await updateAccessRequestStatus(id, status);
  redirect(`/programs/sof-lead-register?t=${encodeURIComponent(token)}`);
}
