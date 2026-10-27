import { NextResponse } from "next/server";
import { applyApiRateLimit } from "@/lib/api-rate-limit";
import { guardApiMutation } from "@/lib/api-guard";

/** Deprecated — emails are sent from POST /api/request-access and admin actions. */
export async function POST(request: Request) {
  const limited = applyApiRateLimit(request);
  if (limited) return limited;
  const blocked = await guardApiMutation(request);
  if (blocked) return blocked;

  return NextResponse.json(
    { error: "This endpoint is deprecated. Use POST /api/request-access instead." },
    { status: 410 },
  );
}
