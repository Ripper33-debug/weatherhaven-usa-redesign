import { NextResponse } from "next/server";
import { applyNamedRateLimit } from "@/lib/api-rate-limit";
import { insertAccessRequest } from "@/lib/accessRequests";
import { insertLeadEvent } from "@/lib/lead-events";
import { badRequestResponse, guardApiMutation, serverErrorResponse } from "@/lib/api-guard";
import { validateEmailField, validateStringField } from "@/lib/api-validation";
import { sendAccessRequestEmails } from "@/lib/send-access-request-emails";
import { SOF_PROGRAM_MARKER } from "@/lib/sof-auth";

function hasSupabaseAdminEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

export async function POST(req: Request) {
  try {
    const limited = await applyNamedRateLimit(req, "sofRequestAccess");
    if (limited) return limited;
    const blocked = await guardApiMutation(req);
    if (blocked) return blocked;

    if (!hasSupabaseAdminEnv()) {
      return serverErrorResponse(
        "/api/sof-request-access",
        new Error("Database not configured"),
      );
    }

    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return badRequestResponse("Invalid JSON body.");
    }

    const nameResult = validateStringField(body.name, "Name");
    if (!nameResult.ok) return badRequestResponse(nameResult.error);

    const emailResult = validateEmailField(body.email);
    if (!emailResult.ok) return badRequestResponse(emailResult.error);

    const reference = `WH-SOF-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    const dbResult = await insertAccessRequest({
      full_name: nameResult.value,
      organization: "SOF access request",
      email: emailResult.value,
      role: "SOF prospect",
      program: SOF_PROGRAM_MARKER,
      requirements: null,
      reference,
      request_type: "sof",
      status: "pending",
    });

    if (!dbResult.ok) {
      const message = "dbError" in dbResult ? dbResult.dbError : "Database insert failed";
      return serverErrorResponse("/api/sof-request-access", new Error(message));
    }

    void import("@/app/api/_lib/lead-profiles").then(({ upsertLeadProfile }) =>
      upsertLeadProfile({
        email: emailResult.value,
        full_name: nameResult.value,
        organization: "SOF access request",
        pipeline_status: "qualified",
      }),
    );

    let emailSent = false;
    try {
      const emailResultSend = await sendAccessRequestEmails({
        name: nameResult.value,
        organization: "SOF access request",
        email: emailResult.value,
        role: "SOF prospect",
        program: SOF_PROGRAM_MARKER,
        reference,
        source: "SOF Access Request",
      });
      emailSent = emailResultSend.ok;
      if (!emailResultSend.ok && !("skipped" in emailResultSend && emailResultSend.skipped)) {
        console.error("SOF request access email error:", "error" in emailResultSend ? emailResultSend.error : emailResultSend);
      }
    } catch (emailError) {
      console.error("SOF request access email error:", emailError);
    }

    void insertLeadEvent({
      event_type: "sof_request",
      event_label: `SOF access — ${emailResult.value}`,
      page: "/api/sof-request-access",
      payload: { reference, name: nameResult.value },
    });

    return NextResponse.json({
      ok: true,
      reference,
      emailSent,
      message: "Request recorded. You will receive a four-digit access code by email if approved.",
    });
  } catch (error) {
    return serverErrorResponse("/api/sof-request-access", error);
  }
}
