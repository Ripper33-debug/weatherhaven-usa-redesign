import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { resolvePostLoginPath } from "@/lib/auth/post-login";
import { safeAuthRedirectPath } from "@/lib/auth/recovery-session";
import { isAdminEmail } from "@/lib/auth-admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = safeAuthRedirectPath(searchParams.get("redirectTo"), "/");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const target = resolvePostLoginPath(redirectTo, { isAdmin: isAdminEmail(user?.email) });
  return NextResponse.redirect(new URL(target, request.url));
}
