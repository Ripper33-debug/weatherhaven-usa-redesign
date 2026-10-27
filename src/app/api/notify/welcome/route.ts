import { NextResponse } from "next/server";
import { applyApiRateLimit } from "@/lib/api-rate-limit";
import { isAdminEmail } from "@/lib/auth-admin";
import {
  badRequestResponse,
  guardApiMutation,
  serverErrorResponse,
} from "@/lib/api-guard";
import { validateEmailField, validateOptionalStringField, validateStringField } from "@/lib/api-validation";
import { createClient } from "@/lib/supabase/server";
import { isSofAccessRequest } from "@/lib/sof-auth";
import { sendWelcomeEmail } from "@/lib/email";
import { sendSofAccessCodeEmail } from "@/lib/send-sof-access-email";

export async function POST(request: Request) {
  const limited = applyApiRateLimit(request);
  if (limited) return limited;
  const blocked = await guardApiMutation(request);
  if (blocked) return blocked;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
      email?: unknown;
      tempPassword?: unknown;
      sofPin?: unknown;
      program?: unknown;
    };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return badRequestResponse("Invalid JSON body.");
    }

    const emailResult = validateEmailField(body.email);
    if (!emailResult.ok) return badRequestResponse(emailResult.error);

    const programResult = validateOptionalStringField(body.program, "Program");
    if (!programResult.ok) return badRequestResponse(programResult.error);

    const sofPinResult = validateOptionalStringField(body.sofPin, "SOF PIN", 4);
    if (!sofPinResult.ok) return badRequestResponse(sofPinResult.error);

    const sof = isSofAccessRequest(programResult.value) && sofPinResult.value;

    if (sof) {
      if (!/^\d{4}$/.test(sofPinResult.value)) {
        return badRequestResponse("SOF PIN must be four digits.");
      }
      const mail = await sendSofAccessCodeEmail(emailResult.value, sofPinResult.value);
      if (!mail.ok) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
      }
    } else {
      const passwordResult = validateStringField(body.tempPassword, "Password", { maxLength: 256 });
      if (!passwordResult.ok) return badRequestResponse(passwordResult.error);

      const mail = await sendWelcomeEmail({
        to: emailResult.value,
        password: passwordResult.value,
      });
      if (!mail.ok) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return serverErrorResponse("/api/notify/welcome", error);
  }
}

export async function GET(request: Request) {
  const limited = applyApiRateLimit(request);
  if (limited) return limited;
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
