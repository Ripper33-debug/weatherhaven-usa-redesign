import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity publish webhook: refreshes the site as soon as an editor publishes, instead of within the
 * minute the pages otherwise take. In Sanity (manage → API → Webhooks) point a webhook at
 * https://<site>/api/revalidate/sanity, trigger on create/update/delete, and set the same secret as
 * the SANITY_REVALIDATE_SECRET environment variable on Vercel.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ ok: false, message: "Webhook secret not set" }, { status: 501 });
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(req, secret);
    if (!isValidSignature) return NextResponse.json({ ok: false, message: "Invalid signature" }, { status: 401 });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, type: body?._type ?? null });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Bad request" }, { status: 400 });
  }
}
