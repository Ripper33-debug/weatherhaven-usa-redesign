export const CMS_MEDIA_BUCKET = "cms-media";

export const CMS_MEDIA_MAX_BYTES = 8 * 1024 * 1024;

export const CMS_MEDIA_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type CmsMediaContext = "products" | "news" | "deployments";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export function cmsMediaExtension(mimeType: string): string | null {
  return EXT_BY_TYPE[mimeType] ?? null;
}

export function validateCmsMediaFile(file: Pick<File, "size" | "type">): string | null {
  if (!CMS_MEDIA_ALLOWED_TYPES.has(file.type)) {
    return "Use a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size <= 0) {
    return "File is empty.";
  }
  if (file.size > CMS_MEDIA_MAX_BYTES) {
    return "Image must be 8 MB or smaller.";
  }
  return null;
}

export function sanitizeCmsMediaSlug(slug: string): string {
  const normalized = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return normalized.length >= 2 ? normalized : "item";
}

/** Storage object path under the cms-media bucket. */
export function buildCmsMediaPath(context: CmsMediaContext, slug: string, ext: string): string {
  const safeSlug = sanitizeCmsMediaSlug(slug);
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  return `${context}/${safeSlug}/${stamp}-${rand}.${ext}`;
}

export function cmsMediaPublicUrl(supabaseUrl: string, path: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${CMS_MEDIA_BUCKET}/${path}`;
}
