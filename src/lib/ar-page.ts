import { readFileSync } from "node:fs";
import path from "node:path";
import { furnishedModel, SYSTEM_MODELS, type SystemModel } from "@/lib/system-models";

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

/**
 * The "Inside: Empty / <fit-out>" switch. It swaps model-viewer's src (Quick Look's USDZ is made from
 * whatever is loaded when "View in your space" is tapped; Scene Viewer gets the src), keeps the choice
 * in the page address (?inside=1) and redraws the QR code so a phone opens the same view.
 */
const FURNISHED_CSS = `
.nw{white-space:nowrap}
.fit{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
.fit>span{font-size:14px;font-weight:600;color:var(--snow)}
.seg{display:inline-flex;box-shadow:inset 0 0 0 1px var(--line-strong)}
.seg button{font:inherit;font-size:14px;font-weight:600;min-height:44px;padding:0 16px;border:0;background:transparent;color:rgb(238 242 246 / .82);cursor:pointer}
.seg button+button{box-shadow:inset 1px 0 0 var(--line-strong)}
.seg button:hover{color:var(--snow);background:rgb(238 242 246 / .06)}
.seg button[aria-pressed="true"]{background:var(--snow);color:var(--ink)}
.seg button:focus-visible{outline:2px solid var(--signal);outline-offset:2px}
`;

const FURNISHED_JS = `<script>
(function () {
  var mv = document.getElementById('mv'), seg = document.getElementById('fitseg');
  if (!mv || !seg) return;
  var btns = seg.querySelectorAll('button'), note = document.getElementById('fitnote');
  var noteText = note.textContent;
  function qr() {
    var img = document.getElementById('qrimg');
    if (!img || !self.qrcode) return;
    var q = qrcode(0, 'M'); q.addData(location.href); q.make(); img.src = q.createDataURL(6, 0);
  }
  function set(on, user) {
    var src = on ? seg.getAttribute('data-full') : seg.getAttribute('data-empty');
    if (mv.getAttribute('src') !== src) {
      mv.setAttribute('src', src);
      if (user) { note.hidden = !on; note.textContent = on ? 'Loading the fit-out\u2026' : noteText; }
    }
    btns[0].setAttribute('aria-pressed', String(!on));
    btns[1].setAttribute('aria-pressed', String(on));
    if (!user) note.hidden = !on;
    if (user) {
      var u = new URL(location.href);
      if (on) u.searchParams.set('inside', '1'); else u.searchParams.delete('inside');
      history.replaceState(null, '', u);
      qr();
    }
  }
  mv.addEventListener('load', function () {
    var on = btns[1].getAttribute('aria-pressed') === 'true';
    note.textContent = noteText; note.hidden = !on;
  });
  if (new URLSearchParams(location.search).get('inside') === '1') set(true, false);
  btns[0].addEventListener('click', function () { set(false, true); });
  btns[1].addEventListener('click', function () { set(true, true); });
})();
</script>`;

function withFurnished(html: string, model: SystemModel, empty: string): string {
  const full = furnishedModel(model.slug);
  const label = model.inside?.label;
  if (!full || !label) return html;
  const control =
    `<div class="fit"><span id="fitlabel">Inside</span><div class="seg" id="fitseg" role="group" aria-labelledby="fitlabel" data-empty="${esc(empty)}" data-full="${esc(full)}">` +
    `<button type="button" aria-pressed="true">Empty</button><button type="button" aria-pressed="false">${esc(label)}</button></div></div>\n` +
    `    <p class="small" id="fitnote" hidden>Example fit-out: ${esc(label.toLowerCase())}. Walk in through the door to see it. Configuration varies by program.</p>\n    `;
  html = swap(html, '<button class="btn" id="arbtn" hidden>', `${control}<button class="btn" id="arbtn" hidden>`);
  html = swap(html, "</style>", `${FURNISHED_CSS}</style>`);
  return swap(html, "</body>", `${FURNISHED_JS}\n</body>`);
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
  const glb = model?.deployed ?? "/assets/models/trecc-open.glb";
  if (!model || !model.ar) return withFurnished(html, SYSTEM_MODELS.trecc, glb);

  const name = model.ar.title.replace(/^See the /, "").replace(/ at full size$/, "");
  html = swap(html, "Place the deployed Weatherhaven TRECC in your space", `Place the deployed Weatherhaven ${esc(name)} in your space`);
  html = swap(html, "<title>TRECC at full size | Weatherhaven</title>", `<title>${esc(name)} at full size | Weatherhaven</title>`);
  html = swap(html, "← Back to the TRECC", `← Back to the ${esc(name)}`);
  html = swap(html, 'alt="Weatherhaven TRECC expandable container, deployed"', `alt="${esc(model.ar.alt)}"`);
  html = swap(html, ">Weatherhaven CAD model</p>", ">Weatherhaven 3D model</p>");
  // The system name never breaks across lines (MEX-26 split at its hyphen on phones).
  html = swap(html, "<h1>See the TRECC at full size</h1>", `<h1>${esc(model.ar.title).replace(esc(name), `<span class="nw">${esc(name)}</span>`)}</h1>`);
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
    `<p class="small">${esc(model.source)}. ${model.finishMaterials ? "The paint shown is the green finish; c" : "C"}onfiguration varies by program.</p>`,
  );
  return withFurnished(html, model, glb);
}
