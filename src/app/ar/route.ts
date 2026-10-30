import { arPageHtml } from "@/lib/ar-page";

/**
 * Real-scale AR view of the deployed TRECC, copied from the Canadian site (can-weatherhaven):
 * Google <model-viewer> with WebXR, Quick Look and Scene Viewer at ar-scale="fixed", a QR code of
 * this page for desktop visitors, and a "View in your space" button on phones. Other systems with a
 * model get the same page at /ar/<slug> (see src/app/ar/[slug]/route.ts and src/lib/ar-page.ts).
 *
 * Assets (all served from this site, copied verbatim): public/assets/models/trecc-open.glb (Draco),
 * public/assets/ar/model-viewer.min.js and qrcode.js, public/assets/draco-ar/ (the newer decoder;
 * the old r128 one makes model-viewer throw "Unexpected geometry type"), public/assets/fonts/.
 * The site's CSP needs 'wasm-unsafe-eval' in script-src and blob: in worker-src for the decoder.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(arPageHtml(), { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
