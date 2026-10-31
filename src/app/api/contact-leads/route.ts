import { NextResponse } from "next/server";
import { applyNamedRateLimit } from "@/lib/api-rate-limit";
import {
  FORM_EMAIL_CONFIRM_FAILED_WARNING,
  FORM_EMAIL_NOT_CONFIGURED_WARNING,
} from "@/lib/form-submit-messages";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/app/api/_lib/get-admin";
import { getEmailFrom, getNotifyTo, getResendClient } from "@/lib/email-config";
import { insertLeadEvent } from "@/lib/lead-events";
import {
  badRequestResponse,
  guardApiMutation,
  serverErrorResponse,
} from "@/lib/api-guard";
import {
  validateEmailField,
  validateOptionalStringField,
  validateStringField,
} from "@/lib/api-validation";
import {
  contactAdminEmail,
  contactConfirmationEmail,
  type ShieldEmailRow,
} from "@/lib/shield-email";
import { contactConfirmationEmailText } from "@/lib/shield-email-text";
import { sendCustomerEmail } from "@/lib/send-customer-email";
import {
  CAD_DRAWINGS,
  ENGINEER_CALL,
  cadRequestBlock,
  engineerCallBlock,
  validateCadRequest,
  validateEngineerCall,
} from "@/lib/contact-requests";
import { PRODUCTS } from "@/lib/products";

/** The message can run longer than the other fields (500); the form shows the same limit. */
const MESSAGE_MAX_LENGTH = 2000;
/** Loose phone check: digits with spaces, +, -, dots, brackets and an optional extension. */
const PHONE_RE = /^\+?[0-9\s().-]{7,25}(\s*(ext\.?|x)\s*[0-9]{1,6})?$/i;

export async function POST(request: Request) {
  const limited = await applyNamedRateLimit(request, "contact");
  if (limited) return limited;
  const blocked = await guardApiMutation(request);
  if (blocked) return blocked;

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return badRequestResponse("Invalid JSON body.");
    }

    const organizationResult = validateStringField(body.organization, "Organization");
    if (!organizationResult.ok) return badRequestResponse(organizationResult.error);

    const inquiryTypeResult = validateStringField(body.inquiry_type, "Inquiry type");
    if (!inquiryTypeResult.ok) return badRequestResponse(inquiryTypeResult.error);

    const emailResult = validateEmailField(body.email);
    if (!emailResult.ok) return badRequestResponse(emailResult.error);

    const fullNameResult = validateOptionalStringField(body.full_name, "Full name");
    if (!fullNameResult.ok) return badRequestResponse(fullNameResult.error);

    const roleResult = validateOptionalStringField(body.role, "Role");
    if (!roleResult.ok) return badRequestResponse(roleResult.error);

    const programResult = validateOptionalStringField(body.program, "Program");
    if (!programResult.ok) return badRequestResponse(programResult.error);

    const subjectResult = validateOptionalStringField(body.subject, "Subject");
    if (!subjectResult.ok) return badRequestResponse(subjectResult.error);

    const messageResult = validateOptionalStringField(body.message, "Message", MESSAGE_MAX_LENGTH);
    if (!messageResult.ok) return badRequestResponse(messageResult.error);

    const contactMethodResult = validateOptionalStringField(body.contact_method, "Contact method");
    if (!contactMethodResult.ok) return badRequestResponse(contactMethodResult.error);

    const phoneResult = validateOptionalStringField(body.phone, "Phone", 40);
    if (!phoneResult.ok) return badRequestResponse(phoneResult.error);
    if (phoneResult.value && !PHONE_RE.test(phoneResult.value)) {
      return badRequestResponse("Phone must be a phone number (digits, spaces, +, -, and an optional extension).");
    }
    if (contactMethodResult.value === "Phone" && !phoneResult.value) {
      return badRequestResponse("Phone is required when the contact method is Phone.");
    }

    const regionResult = validateStringField(body.region, "Region");
    if (!regionResult.ok) return badRequestResponse(regionResult.error);

    // Engineer calls and CAD requests carry their own fields; they're checked here and added to the
    // stored message as a short block (no new columns).
    const callResult = inquiryTypeResult.value === ENGINEER_CALL ? validateEngineerCall(body.call) : null;
    if (callResult && !callResult.ok) return badRequestResponse(callResult.error);
    const cadResult = inquiryTypeResult.value === CAD_DRAWINGS ? validateCadRequest(body.cad) : null;
    if (cadResult && !cadResult.ok) return badRequestResponse(cadResult.error);
    const requestBlock = [
      callResult?.ok ? engineerCallBlock(callResult.value) : "",
      cadResult?.ok ? cadRequestBlock(cadResult.value, PRODUCTS.find((p) => p.slug === cadResult.value.system)?.name) : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const full_name = fullNameResult.value || "Not provided";
    const role = roleResult.value || "Not provided";
    const program = programResult.value || null;
    const subject = subjectResult.value || `Inquiry: ${inquiryTypeResult.value}`;
    const message = [messageResult.value, requestBlock].filter(Boolean).join("\n\n") || "No additional message provided.";
    const contact_method = contactMethodResult.value || "Email";
    const phone = phoneResult.value || null;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = createAdminClient();
    const { error: insertError } = await admin.from("contact_leads").insert({
      user_id: user?.id ?? null,
      full_name,
      organization: organizationResult.value,
      role,
      inquiry_type: inquiryTypeResult.value,
      program,
      subject,
      message,
      contact_method,
      phone,
      email: emailResult.value,
      region: regionResult.value,
      status: "new",
    });

    if (insertError) {
      console.error("contact_leads insert error:", insertError.message);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }

    void import("@/app/api/_lib/lead-profiles").then(({ upsertLeadProfile }) =>
      upsertLeadProfile({
        email: emailResult.value,
        full_name,
        organization: organizationResult.value,
        pipeline_status: "new",
      }),
    );

    const contactVia =
      phone && contact_method === "Phone" ? `${contact_method} — ${phone}` : contact_method;

    const adminRows: ShieldEmailRow[] = [
      { label: "Name", value: full_name },
      { label: "Organization", value: organizationResult.value },
      { label: "Role", value: role },
      { label: "Email", value: emailResult.value },
      { label: "Region", value: regionResult.value },
      { label: "Contact via", value: contactVia },
      { label: "Inquiry type", value: inquiryTypeResult.value },
      { label: "Program", value: program || "Not provided" },
      { label: "Subject", value: subject },
      { label: "Message", value: message },
    ];

    const resend = getResendClient();
    const from = getEmailFrom();
    const notifyTo = getNotifyTo();
    let emailWarning: string | undefined;

    if (resend && notifyTo) {
      try {
        await resend.emails.send({
          from,
          to: notifyTo,
          subject: `New Engineering Inquiry — ${inquiryTypeResult.value} — ${organizationResult.value}`,
          html: contactAdminEmail(adminRows),
        });
      } catch (mailError) {
        console.error("Contact admin notification failed:", mailError);
      }
    } else {
      console.warn("[contact-leads] RESEND_API_KEY or NOTIFY_TO not configured — internal notify skipped.");
    }

    const userSubject =
      inquiryTypeResult.value === "Demo Request"
        ? "Weatherhaven Programs — Demo request received"
        : "Weatherhaven Programs — Inquiry received";

    const confirm = await sendCustomerEmail({
      to: emailResult.value,
      subject: userSubject,
      html: contactConfirmationEmail({
        fullName: full_name,
        organization: organizationResult.value,
        inquiryType: inquiryTypeResult.value,
        program,
      }),
      text: contactConfirmationEmailText({
        fullName: full_name,
        organization: organizationResult.value,
        inquiryType: inquiryTypeResult.value,
        program,
      }),
    });
    if (!confirm.ok) {
      if ("skipped" in confirm && confirm.skipped) {
        emailWarning = emailWarning ?? FORM_EMAIL_NOT_CONFIGURED_WARNING;
      } else {
        emailWarning = emailWarning ?? FORM_EMAIL_CONFIRM_FAILED_WARNING;
      }
      console.error("Contact confirmation email failed:", "error" in confirm ? confirm.error : confirm);
    }

    void insertLeadEvent({
      event_type: inquiryTypeResult.value === "Demo Request" ? "demo_request" : "inquiry_submit",
      event_label: `${inquiryTypeResult.value} — ${organizationResult.value}`,
      page: "/api/contact-leads",
      payload: { program, inquiry_type: inquiryTypeResult.value },
    });

    return NextResponse.json({ success: true, ...(emailWarning ? { warning: emailWarning } : {}) });
  } catch (error) {
    return serverErrorResponse("/api/contact-leads", error);
  }
}
