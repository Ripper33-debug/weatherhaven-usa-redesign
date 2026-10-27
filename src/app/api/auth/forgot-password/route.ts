import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { applyApiRateLimit } from "@/lib/api-rate-limit";
import { badRequestResponse, guardApiMutation, serverErrorResponse } from "@/lib/api-guard";
import { isAdminEmail, resolveAdminLoginEmail } from "@/lib/auth-admin";
import { getSiteUrl } from "@/lib/site-url";

const GENERIC_OK_MESSAGE =
  "If operator reset is configured, we sent a link to the team inbox. Check email and spam folder.";

export async function POST(request: Request) {
  const limited = applyApiRateLimit(request);
  if (limited) return limited;
  const blocked = await guardApiMutation(request);
  if (blocked) return blocked;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return serverErrorResponse("/api/auth/forgot-password", new Error("Supabase not configured"));
  }

  try {
    let body: { email?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return badRequestResponse("Invalid JSON body.");
    }

    const loginEmail = resolveAdminLoginEmail(
      typeof body.email === "string" ? body.email : undefined,
    );
    if (!loginEmail || !isAdminEmail(loginEmail)) {
      return badRequestResponse("Admin login is not configured.");
    }

    const supabase = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const redirectTo = `${getSiteUrl()}/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, { redirectTo });

    if (error) {
      const lower = error.message.toLowerCase();
      if (lower.includes("rate limit")) {
        return NextResponse.json(
          {
            error:
              "Too many reset emails sent recently. Wait an hour and try again, or contact your administrator.",
          },
          { status: 429 },
        );
      }
      console.error("[forgot-password]", error.message);
    }

    return NextResponse.json({ ok: true, message: GENERIC_OK_MESSAGE });
  } catch (err) {
    return serverErrorResponse("/api/auth/forgot-password", err);
  }
}
