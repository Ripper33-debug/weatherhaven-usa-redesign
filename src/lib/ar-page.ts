import { readFileSync } from "node:fs";
import path from "node:path";
import type { SystemModel } from "@/lib/system-models";

/**
 * Builds a full-size AR page from src/ar-template.html (copied from the Canadian site, where it's
 * confirmed working on iPhone): model-viewer with ar-scale="fixed", a QR code for desktop visitors
 * and "View in your space" on phones. With no model it's the TRECC page as copied; with a model from
 * SYSTEM_MODELS, the TRECC wording is swapped for that system's. Server only (reads files).
 */
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function swap(html: string, from: string, to: string): string {
  if (!html.includes(from)) throw new Error(`AR template changed: missing ${from.slice(0, 60)}`);
  return html.replace(from, to);
}

export function arPageHtml(model?: SystemModel): string {
  const root = process.cwd();
  let html = readFileSync(path.join(root, "src/ar-template.html"), "utf8");
  const fonts = readFileSync(path.join(root, "src/ar-fonts.css"), "utf8");
  const slug = model?.slug ?? "trecc";
  html = html
    .replace("/*FONTS*/", fonts)
    .replace("/*LOGO*/", "/weatherhaven-logo-reverse@2x.png")
    .replace("/*GLB*/", model?.deployed ?? "/assets/models/trecc-open.glb")
    .replace("/*DRACO*/", "/assets/draco-ar/")
    .replace("/*QR*/", "/assets/ar/qrcode.js")
    .replace("/*MV*/", "/assets/ar/model-viewer.min.js")
    .replace('href="../#/products/trecc"', `href="/configurable-solutions/${slug}"`);
  if (!model || !model.ar) return html;

  const name = model.ar.title.replace(/^See the /, "").replace(/ at full size$/, "");
  html = swap(html, "Place the deployed Weatherhaven TRECC in your space", `Place the deployed Weatherhaven ${esc(name)} in your space`);
  html = swap(html, "<title>TRECC at full size | Weatherhaven</title>", `<title>${esc(name)} at full size | Weatherhaven</title>`);
  html = swap(html, "← Back to the TRECC", `← Back to the ${esc(name)}`);
  html = swap(html, 'alt="Weatherhaven TRECC expandable container, deployed"', `alt="${esc(model.ar.alt)}"`);
  html = swap(html, ">Weatherhaven CAD model</p>", ">Weatherhaven 3D model</p>");
  html = swap(html, "<h1>See the TRECC at full size</h1>", `<h1>${esc(model.ar.title)}</h1>`);
  html = swap(
    html,
    "<p>Place the deployed TRECC in the room you're standing in, at real scale. Walk around it; walk inside it.</p>",
    `<p>${esc(model.ar.lead)}</p>`,
  );
  html = swap(
    html,
    '<div class="facts"><span><b>Under 60 in</b> stowed</span><span><b>2 people</b>, under 3 minutes</span><span><b>Trailer, vehicle</b> or one 463L pallet</span></div>',
    `<div class="facts">${model.ar.facts.map((f) => `<span>${esc(f)}</span>`).join("")}</div>`,
  );
  html = swap(
    html,
    '<p class="small">The paint shown is the green finish; the CAD height is as supplied by Weatherhaven. Motion and placement are illustrative.</p>',
    `<p class="small">${esc(model.source)}. The paint shown is the green finish; configuration varies by program.</p>`,
  );
  return html;
}
