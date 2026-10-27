import { NextResponse } from "next/server";
import { applyNamedRateLimit } from "@/lib/api-rate-limit";
import { insertLeadEvent, type LeadEventType } from "@/lib/lead-events";
import {
  badRequestResponse,
  guardApiMutation,
  serverErrorResponse,
} from "@/lib/api-guard";
import {
  validateOptionalStringField,
  validateRecordPayload,
  validateStringField,
} from "@/lib/api-validation";

const ALLOWED_TYPES = new Set<LeadEventType>([
  "inquiry_submit",
  "access_request",
  "sof_request",
  "mission_builder",
  "camp_planner",
  "demo_request",
  "product_interest",
  "cta_click",
]);

export async function POST(request: Request) {
  const limited = await applyNamedRateLimit(request, "leadEvents");
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

    const eventTypeResult = validateStringField(body.event_type, "Event type");
    if (!eventTypeResult.ok) return badRequestResponse(eventTypeResult.error);

    const eventType = eventTypeResult.value as LeadEventType;
    if (!ALLOWED_TYPES.has(eventType)) {
      return badRequestResponse("Invalid event type.");
    }

    const eventLabelResult = validateStringField(body.event_label, "Event label");
    if (!eventLabelResult.ok) return badRequestResponse(eventLabelResult.error);

    const pageResult = validateOptionalStringField(body.page, "Page");
    if (!pageResult.ok) return badRequestResponse(pageResult.error);

    const sessionResult = validateOptionalStringField(body.session_key, "Session key", 128);
    if (!sessionResult.ok) return badRequestResponse(sessionResult.error);

    const payloadResult = validateRecordPayload(body.payload);
    if (!payloadResult.ok) return badRequestResponse(payloadResult.error);

    const result = await insertLeadEvent({
      event_type: eventType,
      event_label: eventLabelResult.value,
      page: pageResult.value || undefined,
      payload: payloadResult.value,
      session_key: sessionResult.value || undefined,
    });

    if (!result.ok) {
      return serverErrorResponse("/api/lead-events", new Error(result.error));
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverErrorResponse("/api/lead-events", error);
  }
}
