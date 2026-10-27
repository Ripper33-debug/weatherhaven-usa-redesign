import type { CreateEmailOptions } from "resend";
import { getEmailFrom, getReplyTo, getResendClient } from "@/lib/email-config";

export type CustomerEmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/** Customer-facing transactional send with plain-text part and program desk reply-to. */
export async function sendCustomerEmail(
  payload: CustomerEmailPayload,
): Promise<
  | { ok: true }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string }
> {
  const resend = getResendClient();
  if (!resend) {
    return { ok: false, skipped: true, reason: "RESEND_API_KEY not set" };
  }

  const replyTo = getReplyTo();
  const message: CreateEmailOptions = {
    from: getEmailFrom(),
    to: payload.to.trim(),
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  };
  if (replyTo) {
    message.replyTo = replyTo;
  }

  const { error } = await resend.emails.send(message);
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
