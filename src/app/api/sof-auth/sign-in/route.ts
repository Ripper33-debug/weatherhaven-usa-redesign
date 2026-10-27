import { NextResponse } from "next/server";
import { applyApiRateLimit } from "@/lib/api-rate-limit";
import { hasApprovedSofAccess } from "@/lib/accessRequests";
import { markSofApprovedInMetadata } from "@/lib/sof-membership";
import { createClient } from "@/lib/supabase/server";
import { findUserByEmail } from "@/lib/supabase/find-user-by-email";
import {
  badRequestResponse,
  guardApiMutation,
  serverErrorResponse,
} from "@/lib/api-guard";
import { validateEmailField, validateStringField } from "@/lib/api-validation";
import { isValidSofPinInput } from "@/lib/sof-auth";
import { sofPinPasswordCandidates } from "@/lib/sof-auth-password";
import { clientIpFromRequest, rateLimitAllowed, RATE_LIMITS } from "@/lib/rate-limit";

const IP_LIMIT = RATE_LIMITS.sofLoginIp;
const EMAIL_LIMIT = RATE_LIMITS.sofLoginEmail;

const SOF_SIGN_IN_DENIED =
  "Invalid email or access code. Request access if you have not been approved yet.";

export async function POST(request: Request) {
  const limited = applyApiRateLimit(request);
  if (limited) return limited;
  const blocked = await guardApiMutation(request);
  if (blocked) return blocked;

  const ip = clientIpFromRequest(request);

  try {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return badRequestResponse("Invalid JSON body.");
    }

    const emailResult = validateEmailField(body.email);
    if (!emailResult.ok) return badRequestResponse(emailResult.error);

    const pinResult = validateStringField(body.pin, "Access code", { maxLength: 4 });
    if (!pinResult.ok) return badRequestResponse(pinResult.error);

    const email = emailResult.value;
    const pin = pinResult.value;

    if (!isValidSofPinInput(pin)) {
      return badRequestResponse("Access code must be four digits.");
    }

    if (!(await rateLimitAllowed(`sof-login:ip:${ip}`, IP_LIMIT))) {
      return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
    }

    if (!(await rateLimitAllowed(`sof-login:email:${email}`, EMAIL_LIMIT))) {
      return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
    }

    if (!(await hasApprovedSofAccess(email))) {
      return NextResponse.json({ ok: false, error: SOF_SIGN_IN_DENIED }, { status: 401 });
    }

    const supabase = await createClient();
    const candidates = sofPinPasswordCandidates(pin);
    let signedIn = false;

    for (const password of candidates) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) {
        signedIn = true;
        break;
      }
    }

    if (!signedIn) {
      return NextResponse.json({ ok: false, error: SOF_SIGN_IN_DENIED }, { status: 401 });
    }

    const { user } = await findUserByEmail(email);
    if (user) {
      await markSofApprovedInMetadata(user.id);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverErrorResponse("/api/sof-auth/sign-in", error);
  }
}
