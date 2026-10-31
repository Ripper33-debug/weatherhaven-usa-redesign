import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "@/sanity/env";

type SanityImageSource = Parameters<ReturnType<typeof createImageUrlBuilder>["image"]>[0];
const builder = projectId ? createImageUrlBuilder({ projectId, dataset }) : null;

/** A CDN URL for an uploaded image, capped in width; null when there's no image. */
export function cmsImageUrl(source: SanityImageSource | null | undefined, width = 2000): string | null {
  if (!builder || !source) return null;
  return builder.image(source).width(width).fit("max").auto("format").url();
}
