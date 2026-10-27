import { NextResponse } from "next/server";
import { applyApiRateLimit } from "@/lib/api-rate-limit";
import { getAdminEmails, isAdminEmail } from "@/lib/auth-admin";
import { createClient } from "@/lib/supabase/server";

/** Returns nav/login role flags without exposing ADMIN_EMAIL to the client. */
export async function GET(request: Request) {
  const limited = applyApiRateLimit(request);
  if (limited) return limited;
  const adminLoginEnabled = getAdminEmails().length > 0;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({
    adminLoginEnabled,
    isAdmin: isAdminEmail(user?.email),
  });
}
