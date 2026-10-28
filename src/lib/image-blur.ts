import blurMap from "@/data/image-blur.json";

const BLUR = blurMap as Record<string, string>;

/**
 * next/image blur placeholder props for a local product photo (server components only, so the
 * placeholder map never ships to the browser as a whole).
 */
export function blurProps(src: string): { placeholder?: "blur"; blurDataURL?: string } {
  const data = BLUR[src];
  return data ? { placeholder: "blur", blurDataURL: data } : {};
}
