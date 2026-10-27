import { NextResponse } from "next/server";
import { isAdminEmail } from "@/lib/auth-admin";
import {
  CMS_MEDIA_BUCKET,
  buildCmsMediaPath,
  cmsMediaExtension,
  cmsMediaPublicUrl,
  sanitizeCmsMediaSlug,
  validateCmsMediaFile,
  type CmsMediaContext,
} from "@/lib/cms-media";
import { guardApiMutation, guardApiRead, serverErrorResponse } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function parseContext(value: FormDataEntryValue | null): CmsMediaContext | null {
  if (value === "products" || value === "news" || value === "deployments") return value;
  return null;
}

export async function POST(request: Request) {
  const limited = guardApiRead(request);
  if (limited) return limited;

  const csrf = await guardApiMutation(request);
  if (csrf) return csrf;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  const auth = await createClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
  }

  const file = formData.get("file");
  const context = parseContext(formData.get("context"));
  const slugRaw = formData.get("slug");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
  }
  if (!context) {
    return NextResponse.json({ error: "Upload context is required." }, { status: 400 });
  }

  const slug = typeof slugRaw === "string" ? sanitizeCmsMediaSlug(slugRaw) : "item";
  const validationError = validateCmsMediaFile(file);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const ext = cmsMediaExtension(file.type);
  if (!ext) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }

  const path = buildCmsMediaPath(context, slug, ext);
  const bytes = Buffer.from(await file.arrayBuffer());

  try {
    const admin = createAdminClient();
    const { error } = await admin.storage.from(CMS_MEDIA_BUCKET).upload(path, bytes, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600",
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("bucket") && message.includes("not found")) {
        return NextResponse.json(
          {
            error:
              "Media storage bucket is not set up. Run supabase/migrations/20260603120000_cms_media.sql in Supabase.",
          },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: "Upload failed. Try again." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      url: cmsMediaPublicUrl(supabaseUrl, path),
      path,
    });
  } catch (error) {
    return serverErrorResponse("admin/upload-media", error);
  }
}
