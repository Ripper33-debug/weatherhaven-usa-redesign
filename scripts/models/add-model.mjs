#!/usr/bin/env node
/**
 * Checks a new system model from Barry's Blender builds and copies it into public/models/<slug>/.
 *
 *   node scripts/models/add-model.mjs <slug> <folder>
 *
 * <folder> holds <name>-deployed-web.glb (required) and optionally <name>-stowed-web.glb and a README.md,
 * the same layout as the MECC delivery. The script checks each GLB (binary glTF 2.0, size, meshes,
 * node and material names, Y-up bounds in metres), copies them to public/models/<slug>/<slug>-deployed.glb
 * and -stowed.glb, and prints a SYSTEM_MODELS entry to finish in src/lib/system-models.ts.
 * Posters (the viewer's still images) are rendered afterwards; see public/models/README.md.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync } from "node:fs";
import path from "node:path";

const [slug, folder] = process.argv.slice(2);
if (!slug || !folder) {
  console.error("Usage: node scripts/models/add-model.mjs <slug> <folder>");
  process.exit(1);
}

function readGlb(file) {
  const b = readFileSync(file);
  if (b.readUInt32LE(0) !== 0x46546c67) throw new Error(`${file}: not a binary glTF (.glb)`);
  if (b.readUInt32LE(4) !== 2) throw new Error(`${file}: glTF version ${b.readUInt32LE(4)}, expected 2`);
  const len = b.readUInt32LE(12);
  const json = JSON.parse(b.subarray(20, 20 + len).toString("utf8"));
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const m of json.meshes ?? []) {
    for (const p of m.primitives) {
      const a = json.accessors[p.attributes.POSITION];
      for (let k = 0; k < 3; k++) {
        min[k] = Math.min(min[k], a.min[k]);
        max[k] = Math.max(max[k], a.max[k]);
      }
    }
  }
  return {
    bytes: b.length,
    extensions: json.extensionsUsed ?? [],
    nodes: (json.nodes ?? []).map((n) => n.name),
    materials: (json.materials ?? []).map((m) => m.name),
    animations: (json.animations ?? []).length,
    min,
    max,
  };
}

const files = readdirSync(folder);
const pick = (kind) => files.find((f) => f.endsWith(`-${kind}-web.glb`)) ?? files.find((f) => f.endsWith(`-${kind}.glb`));
const deployed = pick("deployed");
if (!deployed) throw new Error(`No *-deployed-web.glb in ${folder}`);
const stowed = pick("stowed");

const out = path.join("public/models", slug);
mkdirSync(out, { recursive: true });
const report = [];
for (const [kind, file] of [["deployed", deployed], ["stowed", stowed]]) {
  if (!file) continue;
  const info = readGlb(path.join(folder, file));
  const size = info.max.map((v, k) => (v - info.min[k]).toFixed(2));
  const warn = [];
  if (info.bytes > 3e6) warn.push(`large for the web (${(info.bytes / 1e6).toFixed(1)} MB): send the -web (Draco) export`);
  if (!info.extensions.includes("KHR_draco_mesh_compression") && !info.extensions.includes("EXT_meshopt_compression"))
    warn.push("not compressed");
  if (Math.min(...info.min.slice(1, 2)) < -0.5) warn.push("geometry well below the ground (Y < -0.5 m)");
  if (Number(size[1]) > 6 || Number(size[0]) > 30) warn.push(`unusual size ${size.join(" × ")} m: check units are metres`);
  copyFileSync(path.join(folder, file), path.join(out, `${slug}-${kind}.glb`));
  report.push({ kind, file, ...info, size, warn });
}
if (existsSync(path.join(folder, "README.md"))) copyFileSync(path.join(folder, "README.md"), path.join(out, "README.md"));

for (const r of report) {
  console.log(`\n${r.kind}: ${r.file} → public/models/${slug}/${slug}-${r.kind}.glb`);
  console.log(`  ${(r.bytes / 1e6).toFixed(2)} MB, ${r.extensions.join(", ") || "no extensions"}, ${r.animations} animations`);
  console.log(`  size (x × y × z, m): ${r.size.join(" × ")}`);
  console.log(`  nodes: ${r.nodes.join(", ")}`);
  console.log(`  materials: ${r.materials.join(", ")}`);
  for (const w of r.warn) console.log(`  WARNING: ${w}`);
}
const d = report.find((r) => r.kind === "deployed");
const compression = d.extensions.includes("EXT_meshopt_compression") ? "meshopt" : "draco";
console.log(`\nAdd to SYSTEM_MODELS in src/lib/system-models.ts (fill in articulation, finishes and AR copy):\n`);
console.log(`  "${slug}": {
    slug: "${slug}",
    deployed: "/models/${slug}/${slug}-deployed.glb",${stowed ? `\n    stowed: "/models/${slug}/${slug}-stowed.glb",` : ""}
    compression: "${compression}",
    source: "3D model built from Weatherhaven’s published drawings, specifications and photos",
  },`);
writeFileSync(path.join(out, ".added"), new Date().toISOString() + "\n");
