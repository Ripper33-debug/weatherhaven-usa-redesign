import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Real-scale AR view of the deployed TRECC, copied from the Canadian site (can-weatherhaven):
 * Google <model-viewer> with WebXR, Quick Look and Scene Viewer at ar-scale="fixed", a QR code of
 * this page for desktop visitors, and a "View in your space" button on phones. The page is the
 * sister repo's src/ar-template.html with its placeholders filled in; it's standalone (no site nav),
 * as it is there, and rendered once at build time.
 *
 * Assets (all served from this site, copied verbatim): public/assets/models/trecc-open.glb (Draco),
 * public/assets/ar/model-viewer.min.js and qrcode.js, public/assets/draco-ar/ (the newer decoder;
 * the old r128 one makes model-viewer throw "Unexpected geometry type"), public/assets/fonts/.
 * The site's CSP needs 'wasm-unsafe-eval' in script-src and blob: in worker-src for the decoder.
 */
export const dynamic = "force-static";

function page(): string {
  const root = process.cwd();
  const tpl = readFileSync(path.join(root, "src/ar-template.html"), "utf8");
  const fonts = readFileSync(path.join(root, "src/ar-fonts.css"), "utf8");
  return tpl
    .replace("/*FONTS*/", fonts)
    .replace("/*LOGO*/", "/weatherhaven-logo-reverse@2x.png")
    .replace("/*GLB*/", "/assets/models/trecc-open.glb")
    .replace("/*DRACO*/", "/assets/draco-ar/")
    .replace("/*QR*/", "/assets/ar/qrcode.js")
    .replace("/*MV*/", "/assets/ar/model-viewer.min.js")
    .replace('href="../#/products/trecc"', 'href="/configurable-solutions/trecc"');
}

export function GET() {
  return new Response(page(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
