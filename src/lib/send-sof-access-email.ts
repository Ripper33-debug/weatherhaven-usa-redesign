import { getSiteUrl } from "@/lib/site-url";
import { SOF_LOGIN_PATH } from "@/lib/sof-auth";
import { sofAccessApprovedEmail } from "@/lib/shield-email";
import { sofAccessApprovedEmailText } from "@/lib/shield-email-text";
import { sendCustomerEmail } from "@/lib/send-customer-email";

export async function sendSofAccessCodeEmail(
  email: string,
  pin: string,
): Promise<{ ok: true } | { ok: false; error: string; skipped?: boolean }> {
  const siteUrl = getSiteUrl();
  const loginUrl = `${siteUrl}${SOF_LOGIN_PATH}`;

  const result = await sendCustomerEmail({
    to: email.trim(),
    subject: "Weatherhaven Programs — Your SOF access code",
    html: sofAccessApprovedEmail({
      email: email.trim(),
      pin: pin.trim(),
      loginUrl,
    }),
    text: sofAccessApprovedEmailText({
      email: email.trim(),
      pin: pin.trim(),
      loginUrl,
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
