import { NextResponse } from "next/server";
import { applyApiRateLimit } from "@/lib/api-rate-limit";
import { ACCESS_REQUEST_STATUSES, isAccessRequestStatus } from "@/lib/access-request-status";
import { listAccessRequests, updateAccessRequestStatus } from "@/lib/accessRequests";
import {
  badRequestResponse,
  guardApiMutation,
  serverErrorResponse,
} from "@/lib/api-guard";
import { validateOptionalStringField, validateStringField } from "@/lib/api-validation";
import { secureCompare } from "@/lib/secure-compare";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
}

function auth(req: Request) {
  const token = process.env.LEADS_ADMIN_TOKEN;
  if (!token) return false;
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return false;
  return secureCompare(h.slice(7), token);
}

export async function GET(req: Request) {
  const limited = applyApiRateLimit(req);
  if (limited) return limited;
  if (!auth(req)) return unauthorized();

  try {
    const rows = await listAccessRequests();
    const leads = rows.map((row) => ({
      id: row.id,
      reference: row.id.slice(0, 8).toUpperCase(),
      submittedAt: row.submitted_at,
      status: row.status ?? "pending",
      name: row.full_name,
      organization: row.organization,
      email: row.email,
      role: row.role,
      program: row.program,
      message: row.requirements,
    }));
    return NextResponse.json({ ok: true, leads, statuses: [...ACCESS_REQUEST_STATUSES] });
  } catch (error) {
    return serverErrorResponse("/api/leads", error);
  }
}

export async function PATCH(req: Request) {
  const limited = applyApiRateLimit(req);
  if (limited) return limited;
  const blocked = await guardApiMutation(req);
  if (blocked) return blocked;
  if (!auth(req)) return unauthorized();

  try {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return badRequestResponse("Invalid JSON body.");
    }

    const statusResult = validateStringField(body.status, "Status");
    if (!statusResult.ok) return badRequestResponse(statusResult.error);

    if (!isAccessRequestStatus(statusResult.value)) {
      return badRequestResponse("Invalid status.");
    }

    const idResult = validateOptionalStringField(body.id, "ID", 64);
    if (!idResult.ok) return badRequestResponse(idResult.error);

    const referenceResult = validateOptionalStringField(body.reference, "Reference", 32);
    if (!referenceResult.ok) return badRequestResponse(referenceResult.error);

    let id = idResult.value;
    if (!id && referenceResult.value) {
      const ref = referenceResult.value.toLowerCase();
      const rows = await listAccessRequests();
      const match = rows.find((r) => r.id.slice(0, 8).toLowerCase() === ref);
      id = match?.id ?? "";
    }

    if (!id) {
      return badRequestResponse("id or reference required.");
    }

    const updated = await updateAccessRequestStatus(id, statusResult.value);
    if (!updated.ok) {
      return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, id, status: statusResult.value });
  } catch (error) {
    return serverErrorResponse("/api/leads", error);
  }
}
