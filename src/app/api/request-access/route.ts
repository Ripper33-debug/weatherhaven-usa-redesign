import { NextResponse } from "next/server";
import { applyNamedRateLimit } from "@/lib/api-rate-limit";
import { insertAccessRequest } from "@/lib/accessRequests";
import { insertLeadEvent } from "@/lib/lead-events";
import {
  badRequestResponse,
  guardApiMutation,
  serverErrorResponse,
} from "@/lib/api-guard";
import { isValidEmail, sanitizeString, validateRequired } from "@/lib/validate";
import { sendAccessRequestEmails } from "@/lib/send-access-request-emails";
import { accessRequestEmailWarning } from "@/lib/form-submit-messages";

export async function POST(req: Request) {
  const limited = await applyNamedRateLimit(req, "requestAccess");
  if (limited) return limited;
  const blocked = await guardApiMutation(req);
  if (blocked) return blocked;

  try {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return badRequestResponse("Invalid JSON body.");
    }

    const requiredError = validateRequired({
      name: body.name,
      organization: body.organization,
      email: body.email,
      role: body.role,
    });
    if (requiredError) return badRequestResponse(requiredError);

    const name = sanitizeString(String(body.name));
    const organization = sanitizeString(String(body.organization));
    const email = sanitizeString(String(body.email)).toLowerCase();
    const role = sanitizeString(String(body.role));
    const program = sanitizeString(String(body.program ?? ""));
    const message = sanitizeString(String(body.message ?? ""));

    if (!isValidEmail(email)) {
      return badRequestResponse("email must be a valid email address");
    }

    const reference = `WH-RA-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const payload = {
      reference,
      name,
      organization,
      email,
      role,
      program: program || null,
      message: message || null,
    };

    const dbResult = await insertAccessRequest({
      full_name: payload.name,
      organization: payload.organization,
      email: payload.email,
      role: payload.role,
      program: payload.program,
      requirements: payload.message,
      reference,
      status: "pending",
    });

    if (!dbResult.ok) {
      return serverErrorResponse("/api/request-access", new Error(dbResult.error));
    }

    void import("@/app/api/_lib/lead-profiles").then(({ upsertLeadProfile }) =>
      upsertLeadProfile({
        email: payload.email,
        full_name: payload.name,
        organization: payload.organization,
        pipeline_status: "qualified",
      }),
    );

    const emailResultSend = await sendAccessRequestEmails({
      name: payload.name,
      organization: payload.organization,
      email: payload.email,
      role: payload.role,
      program: payload.program,
      requirements: payload.message,
      reference,
      source: "Request Access",
    });

    void insertLeadEvent({
      event_type: "access_request",
      event_label: `Request access — ${payload.organization}`,
      page: "/api/request-access",
      payload: { reference, program: payload.program, role: payload.role },
    });

    let webhookDelivered = false;
    const webhookUrl = process.env.REQUEST_ACCESS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const wh = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "request_access",
            leadStatus: "pending",
            submittedAt: new Date().toISOString(),
            ...payload,
          }),
        });
        webhookDelivered = wh.ok;
      } catch {
        webhookDelivered = false;
      }
    }

    const emailWarning = accessRequestEmailWarning({
      emailSent: emailResultSend.ok,
      emailSkipped: "skipped" in emailResultSend ? emailResultSend.skipped : false,
    });

    return NextResponse.json({
      ok: true,
      reference,
      leadStatus: "pending" as const,
      emailSent: emailResultSend.ok,
      emailSkipped: "skipped" in emailResultSend ? emailResultSend.skipped : false,
      webhookDelivered: webhookUrl ? webhookDelivered : undefined,
      savedToDb: true,
      message: "Request recorded. A Weatherhaven expert will contact you within 48 hours.",
      ...(emailWarning ? { warning: emailWarning } : {}),
    });
  } catch (error) {
    return serverErrorResponse("/api/request-access", error);
  }
}
