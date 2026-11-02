/**
 * Brings a round of Barry's Blender models into public/models/<slug>/, ready for the website:
 *
 *   <slug>-deployed.glb        deployed shelter with its deploy animation (viewer, AR, camp)
 *   <slug>-stowed.glb          packed for transport (viewer's packed view)
 *   <slug>-deployed-fitted.glb deployed shell plus fit-out, static (AR page's "Furnished")
 *   <slug>-fitout.glb          the fit-out alone, in the shell's coordinates ("Show inside", camp)
 *   <slug>-ar.glb              the deployed shelter without its animation, for the AR page (Android's
 *                              Scene Viewer would loop the deploy in the room)
 *   <slug>-camp.glb            a light copy for the mission builder's camp, which repeats a shelter
 *                              many times from a distance and uses only colours: about a third of the
 *                              triangles, no textures, no animation
 *
 * Textures are capped at 1024 px (the 2048 px weathering map is the big one) and kept as JPEG/PNG,
 * so Android's Scene Viewer can still open the AR files; meshes are Draco compressed.
 *
 *   node scripts/models/import-round.mjs "<package folder>" [slug ...]
 *
 * The package folder is the one with a sub-folder per model (`mecc/mecc-deployed-web.glb`...).
 * Needs glTF-Transform and sharp, which aren't project dependencies; install them somewhere else
 * and run a copy of this script from there, with MODELS_OUT set to this repo's public/models/:
 *   npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 draco3dgltf sharp meshoptimizer
 */
import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, draco, prune, simplify, textureCompress, weld } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import { MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";

/** Package folder name → site slug. The TRECC keeps its own CAD-based files and viewer. */
const MODELS = {
  mecc: "mecc",
  ehmecc: "ehmecc",
  ateps: "ateps",
  hercon: "hercon",
  series4: "series-4",
  mts: "mts",
  rdmss: "rdmss",
  mex26: "mex-26",
  polarhaven: "polarhaven",
  polarchief: "polar-chief",
  endurance: "endurance",
};

const [pkg, ...only] = process.argv.slice(2);
if (!pkg) {
  console.error('usage: node scripts/models/import-round.mjs "<package folder>" [slug ...]');
  process.exit(1);
}
// MODELS_OUT overrides where the files go (needed when running a copy of this script elsewhere).
const out = process.env.MODELS_OUT ?? new URL("../../public/models/", import.meta.url).pathname;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
  "draco3d.encoder": await draco3d.createEncoderModule(),
});

const kb = (p) => `${Math.round(statSync(p).size / 1024)} KB`;
await MeshoptSimplifier.ready;

async function campCopy(src, dest) {
  const doc = await io.read(src);
  const root = doc.getRoot();
  for (const a of root.listAnimations()) a.dispose();
  for (const m of root.listMaterials()) {
    m.setBaseColorTexture(null).setNormalTexture(null).setOcclusionTexture(null).setMetallicRoughnessTexture(null).setEmissiveTexture(null);
  }
  for (const mesh of root.listMeshes())
    for (const prim of mesh.listPrimitives())
      for (const sem of prim.listSemantics()) if (/^TEXCOORD_|^TANGENT$/.test(sem)) prim.setAttribute(sem, null);
  await doc.transform(
    prune(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.33, error: 0.002 }),
    dedup(),
    prune(),
    draco({ method: "edgebreaker" }),
  );
  await io.write(dest, doc);
  console.log(`  ${dest.replace(out, "")}  ${kb(src)} → ${kb(dest)}`);
}

async function convert(src, dest, { fitoutOnly = false, still = false } = {}) {
  const doc = await io.read(src);
  if (still) for (const a of doc.getRoot().listAnimations()) a.dispose();
  if (fitoutOnly) {
    // Keep only the <MODEL>_fitout node (and what it uses); everything else is the shell.
    const scene = doc.getRoot().listScenes()[0];
    const keep = scene.listChildren().filter((n) => /_fitout$/.test(n.getName()));
    if (!keep.length) throw new Error(`${src} has no *_fitout node`);
    for (const n of scene.listChildren()) if (!keep.includes(n)) n.dispose();
  }
  await doc.transform(
    dedup(),
    prune(),
    textureCompress({ encoder: sharp, resize: [1024, 1024] }),
    draco({ method: "edgebreaker" }),
  );
  await io.write(dest, doc);
  console.log(`  ${dest.replace(out, "")}  ${kb(src)} → ${kb(dest)}`);
}

for (const [name, slug] of Object.entries(MODELS)) {
  if (only.length && !only.includes(slug)) continue;
  const dir = join(pkg, name);
  const to = join(out, slug);
  mkdirSync(to, { recursive: true });
  console.log(slug);
  await convert(join(dir, `${name}-deployed-web.glb`), join(to, `${slug}-deployed.glb`));
  await convert(join(dir, `${name}-stowed-web.glb`), join(to, `${slug}-stowed.glb`));
  await convert(join(dir, `${name}-deployed-fitted-web.glb`), join(to, `${slug}-deployed-fitted.glb`));
  await convert(join(dir, `${name}-deployed-fitted-web.glb`), join(to, `${slug}-fitout.glb`), { fitoutOnly: true });
  await convert(join(dir, `${name}-deployed-web.glb`), join(to, `${slug}-ar.glb`), { still: true });
  await campCopy(join(dir, `${name}-deployed-web.glb`), join(to, `${slug}-camp.glb`));
}
