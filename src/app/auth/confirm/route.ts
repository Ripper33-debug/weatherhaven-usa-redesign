import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeAuthRedirectPath } from "@/lib/auth/recovery-session";
import { createClient } from "@/lib/supabase/server";

/** Exchange recovery token_hash for a session (server-side, no tokens in browser URL). */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safeAuthRedirectPath(searchParams.get("next"));

  const successUrl = new URL(next, request.url);
  const errorUrl = new URL("/auth/reset-password", request.url);
  errorUrl.searchParams.set("error", "invalid_link");

  if (!token_hash || !type) {
    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    console.error("[auth/confirm]", error.message);
    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(successUrl);
}
