import { getEmailFrom, getNotifyTo, getResendClient } from "@/lib/email-config";
import { sendCustomerEmail } from "@/lib/send-customer-email";
import {
  requestAccessAdminEmail,
  requestAccessConfirmationEmail,
  sofRequestAccessConfirmationEmail,
  type ShieldEmailRow,
} from "@/lib/shield-email";
import {
  requestAccessConfirmationEmailText,
  sofRequestAccessConfirmationEmailText,
} from "@/lib/shield-email-text";

export type AccessRequestEmailPayload = {
  name: string;
  organization: string;
  email: string;
  role: string;
  program?: string | null;
  requirements?: string | null;
  source?: string;
  reference?: string;
};

function isSofAccessSource(source?: string): boolean {
  return (source?.trim() ?? "").toLowerCase().includes("sof");
}

export async function sendAccessRequestEmails(payload: AccessRequestEmailPayload) {
  const resend = getResendClient();
  if (!resend) {
    return { ok: false as const, skipped: true, reason: "RESEND_API_KEY not set" };
  }

  const sourceLabel = payload.source?.trim() || "Request Access";
  const sof = isSofAccessSource(sourceLabel);
  const adminRows: ShieldEmailRow[] = [
    { label: "Full name", value: payload.name },
    { label: "Organization", value: payload.organization },
    { label: "Email", value: payload.email },
    { label: "Role", value: payload.role },
    { label: "Program", value: payload.program?.trim() || "Not provided" },
    { label: "Requirements", value: payload.requirements?.trim() || "Not provided" },
  ];
  if (payload.reference?.trim()) {
    adminRows.push({ label: "Reference", value: payload.reference.trim() });
  }

  const from = getEmailFrom();
  const notifyTo = getNotifyTo();

  if (notifyTo) {
    const adminResult = await resend.emails.send({
      from,
      to: notifyTo,
      subject: `New ${sourceLabel} — ${payload.organization}`,
      html: requestAccessAdminEmail({
        name: payload.name,
        rows: adminRows,
        source: sourceLabel,
      }),
    });

    if (adminResult.error) {
      return { ok: false as const, error: adminResult.error.message };
    }
  }

  const refSuffix = payload.reference?.trim() ? ` (${payload.reference.trim()})` : "";
  const confirmSubject = sof
    ? `Weatherhaven Programs — SOF access request received${refSuffix}`
    : `Weatherhaven Programs — Access request received${refSuffix}`;

  const confirmResult = await sendCustomerEmail({
    to: payload.email,
    subject: confirmSubject,
    html: sof
      ? sofRequestAccessConfirmationEmail({
          name: payload.name,
          reference: payload.reference,
        })
      : requestAccessConfirmationEmail({
          name: payload.name,
          organization: payload.organization,
          role: payload.role,
          reference: payload.reference,
        }),
    text: sof
      ? sofRequestAccessConfirmationEmailText({
          name: payload.name,
          reference: payload.reference,
        })
      : requestAccessConfirmationEmailText({
          name: payload.name,
          organization: payload.organization,
          role: payload.role,
          reference: payload.reference,
        }),
  });

  if (!confirmResult.ok) {
    if ("skipped" in confirmResult && confirmResult.skipped) {
      return { ok: false as const, error: confirmResult.reason };
    }
    return { ok: false as const, error: "error" in confirmResult ? confirmResult.error : "Send failed" };
  }

  return { ok: true as const };
}
