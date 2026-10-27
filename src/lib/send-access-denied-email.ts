import { isSofAccessRequest } from "@/lib/sof-auth";
import { accessRequestDeniedEmail } from "@/lib/shield-email";
import { accessRequestDeniedEmailText } from "@/lib/shield-email-text";
import { sendCustomerEmail } from "@/lib/send-customer-email";

export async function sendAccessDeniedEmail(params: {
  to: string;
  name: string;
  organization?: string | null;
  program?: string | null;
  reference?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string; skipped?: boolean }> {
  const isSof = isSofAccessRequest(params.program);
  const refSuffix = params.reference?.trim() ? ` (${params.reference.trim()})` : "";

  const result = await sendCustomerEmail({
    to: params.to.trim(),
    subject: isSof
      ? `Weatherhaven Programs — SOF access request update${refSuffix}`
      : `Weatherhaven Programs — Access request update${refSuffix}`,
    html: accessRequestDeniedEmail({
      name: params.name,
      organization: params.organization,
      reference: params.reference,
      isSof,
    }),
    text: accessRequestDeniedEmailText({
      name: params.name,
      reference: params.reference,
      isSof,
    }),
  });

  if (!result.ok) {
    if ("skipped" in result && result.skipped) {
      return { ok: false, error: result.reason, skipped: true };
    }
    return { ok: false, error: "error" in result ? result.error : "Send failed" };
  }
  return { ok: true };
}
