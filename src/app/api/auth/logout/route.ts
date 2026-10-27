import { NextResponse } from "next/server";
import { applyApiRateLimit } from "@/lib/api-rate-limit";
import { guardApiMutation, serverErrorResponse } from "@/lib/api-guard";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const limited = applyApiRateLimit(request);
  if (limited) return limited;
  const blocked = await guardApiMutation(request);
  if (blocked) return blocked;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverErrorResponse("/api/auth/logout", error);
  }
}
