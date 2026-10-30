import { arPageHtml } from "@/lib/ar-page";
import { SYSTEM_MODELS } from "@/lib/system-models";

/** Full-size AR page for each system with a model and AR copy in SYSTEM_MODELS (the TRECC is /ar). */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(SYSTEM_MODELS)
    .filter((m) => m.slug !== "trecc" && m.ar)
    .map((m) => ({ slug: m.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = SYSTEM_MODELS[slug];
  if (!model?.ar || slug === "trecc") return new Response("Not found", { status: 404 });
  return new Response(arPageHtml(model), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
