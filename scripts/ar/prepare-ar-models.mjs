// Plain, real-scale TRECC models for phone AR. Android's Scene Viewer takes no compression
// extensions and works best under ~100k triangles and ~10 materials, so the CAD cut is welded by
// position (its per-face normals block simplification), simplified, given creased normals again,
// and its many small part colours folded into a short palette.
// Usage: node prep2.mjs <models dir> <out dir> <ratio> <error>
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { cloneDocument, dequantize, weld, simplify, flatten, join, dedup, prune } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptSimplifier } from "meshoptimizer";
import fs from "node:fs";

const [src, out, ratio = "0.3", error = "0.004"] = process.argv.slice(2);
await MeshoptDecoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const FINISHES = { green: [0.072, 0.1, 0.048], tan: [0.34, 0.27, 0.135], arctic: [0.72, 0.74, 0.74] };
const KEEP = new Set(["shell", "rubber", "nonslip", "glass", "interior", "decal"]);
// Linear-RGB palette for the many small parts (labels, fittings, hardware).
const PALETTE = {
  white: [0.92, 0.92, 0.92], lightgrey: [0.7, 0.71, 0.72], grey: [0.45, 0.46, 0.47], darkgrey: [0.2, 0.21, 0.22],
  black: [0.04, 0.04, 0.04], red: [0.8, 0.05, 0.05], amber: [0.95, 0.6, 0.1], green: [0.15, 0.5, 0.2], olive: [0.3, 0.36, 0.24],
};
fs.mkdirSync(out, { recursive: true });

const tris = (doc) => doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives()).reduce((n, p) => n + (p.getIndices()?.getCount() ?? 0) / 3, 0);

/** Normals that are smooth across shallow angles and sharp across creases (CAD edges). */
function creasedNormals(prim, doc, creaseDeg) {
  const pos = prim.getAttribute("POSITION").getArray();
  const idx = prim.getIndices().getArray();
  const nTri = idx.length / 3;
  const fn = new Float32Array(nTri * 3);
  for (let t = 0; t < nTri; t++) {
    const [a, b, c] = [idx[t * 3], idx[t * 3 + 1], idx[t * 3 + 2]];
    const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1], uz = pos[b * 3 + 2] - pos[a * 3 + 2];
    const vx = pos[c * 3] - pos[a * 3], vy = pos[c * 3 + 1] - pos[a * 3 + 1], vz = pos[c * 3 + 2] - pos[a * 3 + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz);
    if (l < 1e-12) continue; // zero-area triangle: left out below
    fn[t * 3] = nx / l; fn[t * 3 + 1] = ny / l; fn[t * 3 + 2] = nz / l;
  }
  const live = (t) => fn[t * 3] !== 0 || fn[t * 3 + 1] !== 0 || fn[t * 3 + 2] !== 0;
  const facesOf = new Map();
  for (let t = 0; t < nTri; t++) if (live(t)) for (let k = 0; k < 3; k++) {
    const v = idx[t * 3 + k];
    (facesOf.get(v) ?? facesOf.set(v, []).get(v)).push(t);
  }
  const cos = Math.cos((creaseDeg * Math.PI) / 180);
  // Unindexed output: one vertex per corner, re-welded afterwards.
  const liveTris = [];
  for (let t = 0; t < nTri; t++) if (live(t)) liveTris.push(t);
  const outPos = new Float32Array(liveTris.length * 9), outNor = new Float32Array(liveTris.length * 9);
  liveTris.forEach((t, j) => {
    for (let k = 0; k < 3; k++) {
      const v = idx[t * 3 + k];
      let sx = 0, sy = 0, sz = 0;
      for (const f of facesOf.get(v)) {
        const d = fn[f * 3] * fn[t * 3] + fn[f * 3 + 1] * fn[t * 3 + 1] + fn[f * 3 + 2] * fn[t * 3 + 2];
        if (d >= cos) { sx += fn[f * 3]; sy += fn[f * 3 + 1]; sz += fn[f * 3 + 2]; }
      }
      let l = Math.hypot(sx, sy, sz);
      if (l < 1e-9) { sx = fn[t * 3]; sy = fn[t * 3 + 1]; sz = fn[t * 3 + 2]; l = 1; }
      const o = (j * 3 + k) * 3;
      outPos.set(pos.subarray(v * 3, v * 3 + 3), o);
      outNor[o] = sx / l; outNor[o + 1] = sy / l; outNor[o + 2] = sz / l;
    }
  });
  const buf = doc.getRoot().listBuffers()[0];
  prim.setIndices(null);
  prim.setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(outPos).setBuffer(buf));
  prim.setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(outNor).setBuffer(buf));
}

for (const state of ["open", "stowed"]) {
  const base = await io.read(`${src}/trecc-${state}.glb`);
  const before = tris(base);
  await base.transform(dequantize());
  for (const ext of base.getRoot().listExtensionsUsed()) ext.dispose();
  // Inside faces sit millimetres behind the shell; simplified, they poke through it.
  for (const prim of base.getRoot().listMeshes().flatMap((m) => m.listPrimitives())) {
    if (prim.getMaterial()?.getName() === "interior") prim.dispose();
  }
  // Fold part colours into the palette, sharing one material per palette entry.
  const shared = new Map();
  for (const mesh of base.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
    const mat = prim.getMaterial();
    if (!mat || KEEP.has(mat.getName())) continue;
    const c = mat.getBaseColorFactor();
    let best = "grey", bd = Infinity;
    for (const [k, p] of Object.entries(PALETTE)) {
      const d = (c[0] - p[0]) ** 2 + (c[1] - p[1]) ** 2 + (c[2] - p[2]) ** 2;
      if (d < bd) { bd = d; best = k; }
    }
    const metal = mat.getName() === "metal";
    const key = `${best}${metal ? "-metal" : ""}`;
    if (!shared.has(key)) {
      shared.set(key, base.createMaterial(key).setBaseColorFactor([...PALETTE[best], 1])
        .setMetallicFactor(metal ? 0.6 : 0).setRoughnessFactor(metal ? 0.45 : 0.7).setDoubleSided(true));
    }
    prim.setMaterial(shared.get(key));
  }
  for (const prim of base.getRoot().listMeshes().flatMap((m) => m.listPrimitives())) prim.setAttribute("NORMAL", null);
  await base.transform(weld());
  // Panels drawn twice with the same triangles (front and back) become one; materials are
  // double-sided.
  for (const prim of base.getRoot().listMeshes().flatMap((m) => m.listPrimitives())) {
    const idx = prim.getIndices().getArray();
    const seen = new Set();
    const keep = [];
    for (let t = 0; t < idx.length; t += 3) {
      const key = [idx[t], idx[t + 1], idx[t + 2]].sort((a, b) => a - b).join(",");
      if (seen.has(key)) continue;
      seen.add(key);
      keep.push(idx[t], idx[t + 1], idx[t + 2]);
    }
    prim.getIndices().setArray(new Uint32Array(keep));
  }
  // Drop tiny loose parts (bolts, rivets, clips under the size limit): invisible at room scale in
  // AR, but each one costs triangles the simplifier can't remove.
  const minSize = Number(process.env.MIN_PART ?? 0.03);
  let dropped = 0;
  for (const prim of base.getRoot().listMeshes().flatMap((m) => m.listPrimitives())) {
    const pos = prim.getAttribute("POSITION").getArray();
    const idx = prim.getIndices().getArray();
    const parent = new Int32Array(pos.length / 3).map((_, i) => i);
    const find = (x) => { while (parent[x] !== x) x = parent[x] = parent[parent[x]]; return x; };
    for (let t = 0; t < idx.length; t += 3) {
      const a = find(idx[t]);
      parent[find(idx[t + 1])] = a;
      parent[find(idx[t + 2])] = a;
    }
    const box = new Map();
    for (let v = 0; v < pos.length / 3; v++) {
      const r = find(v);
      const b = box.get(r) ?? box.set(r, [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]).get(r);
      for (let k = 0; k < 3; k++) { b[k] = Math.min(b[k], pos[v * 3 + k]); b[k + 3] = Math.max(b[k + 3], pos[v * 3 + k]); }
    }
    const keep = [];
    for (let t = 0; t < idx.length; t += 3) {
      const b = box.get(find(idx[t]));
      if (Math.hypot(b[3] - b[0], b[4] - b[1], b[5] - b[2]) < minSize) { dropped++; continue; }
      keep.push(idx[t], idx[t + 1], idx[t + 2]);
    }
    prim.getIndices().setArray(new Uint32Array(keep));
  }
  console.error("dropped small-part triangles:", dropped);
  // Creased normals first, then weld by position and normal: curved surfaces become smooth (so
  // they can be simplified), while real edges and the two sides of thin sheets stay as seams,
  // which the simplifier keeps. (Simplifying a sheet whose two sides share vertices can erase it.)
  for (const prim of base.getRoot().listMeshes().flatMap((m) => m.listPrimitives())) creasedNormals(prim, base, Number(process.env.CREASE ?? 35));
  await base.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: Number(ratio), error: Number(error) }),
    flatten(),
    join(),
    dedup(),
    prune(),
  );
  // The non-slip floor surface sits flush against the walls where the floor folds up; once
  // simplified it shows through them. Keep only its upward-facing faces (the walking surface).
  for (const prim of base.getRoot().listMeshes().flatMap((m) => m.listPrimitives())) {
    if (prim.getMaterial()?.getName() !== "nonslip") continue;
    const pos = prim.getAttribute("POSITION").getArray();
    const idx = prim.getIndices().getArray();
    const keep = [];
    for (let t = 0; t < idx.length; t += 3) {
      const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]];
      const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1], uz = pos[b * 3 + 2] - pos[a * 3 + 2];
      const vx = pos[c * 3] - pos[a * 3], vy = pos[c * 3 + 1] - pos[a * 3 + 1], vz = pos[c * 3 + 2] - pos[a * 3 + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (Math.abs(ny) / (Math.hypot(nx, ny, nz) || 1) > 0.7) keep.push(a, b, c);
    }
    prim.getIndices().setArray(new Uint32Array(keep));
  }
  await base.transform(prune());

  for (const [finish, color] of Object.entries(FINISHES)) {
    const doc = cloneDocument(base);
    for (const mat of doc.getRoot().listMaterials()) {
      if (mat.getName() === "shell") mat.setBaseColorFactor([...color, 1]);
      if (mat.getName() === "rubber") {
        const c = mat.getBaseColorFactor();
        mat.setBaseColorFactor([Math.max(c[0], 0.03) * 0.45, Math.max(c[1], 0.03) * 0.45, Math.max(c[2], 0.03) * 0.45, 1]).setRoughnessFactor(0.95);
      }
    }
    await doc.transform(dedup(), prune());
    const name = `trecc-${state === "open" ? "deployed" : "stowed"}-${finish}`;
    await io.write(`${out}/${name}.glb`, doc);
    console.log(name, Math.round(before), "->", Math.round(tris(doc)), "tris,", (fs.statSync(`${out}/${name}.glb`).size / 1e6).toFixed(2), "MB,",
      doc.getRoot().listMaterials().length, "materials,", doc.getRoot().listMeshes().flatMap((m) => m.listPrimitives()).length, "prims");
  }
}
