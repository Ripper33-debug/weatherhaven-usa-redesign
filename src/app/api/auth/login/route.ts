import { NextResponse } from "next/server";
import { applyApiRateLimit } from "@/lib/api-rate-limit";
import {
  badRequestResponse,
  guardApiMutation,
  serverErrorResponse,
} from "@/lib/api-guard";
import { validateStringField } from "@/lib/api-validation";
import { resolvePostLoginPath, sanitizeRedirectTo } from "@/lib/auth/post-login";
import { isAdminEmail, resolveAdminLoginEmail } from "@/lib/auth-admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const limited = applyApiRateLimit(request);
  if (limited) return limited;
  const blocked = await guardApiMutation(request);
  if (blocked) return blocked;

  try {
    let body: { email?: unknown; password?: unknown; redirectTo?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return badRequestResponse("Invalid JSON body.");
    }

    const passwordResult = validateStringField(body.password, "Password", { maxLength: 256 });
    if (!passwordResult.ok) return badRequestResponse(passwordResult.error);

    const redirectResult = validateStringField(body.redirectTo ?? "/", "Redirect", { required: false });
    if (!redirectResult.ok) return badRequestResponse(redirectResult.error);

    const loginEmail = resolveAdminLoginEmail(
      typeof body.email === "string" ? body.email : undefined,
    );
    if (!loginEmail) {
      return badRequestResponse("Admin login is not configured.");
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: passwordResult.value,
    });

    if (error) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    if (!isAdminEmail(data.user?.email)) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const redirectTo = sanitizeRedirectTo(`?redirectTo=${encodeURIComponent(redirectResult.value || "/")}`);
    const target = resolvePostLoginPath(redirectTo, { isAdmin: isAdminEmail(data.user?.email) });

    return NextResponse.json({ ok: true, redirectTo: target });
  } catch (error) {
    return serverErrorResponse("/api/auth/login", error);
  }
}
