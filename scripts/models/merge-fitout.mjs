/**
 * Merges a shell and its separate fit-out file into one model, for the AR page's "Furnished" choice
 * (model-viewer shows one file). Used for the MECC, EHMECC and TRECC, whose fit-outs come separately.
 *
 *   node scripts/models/merge-fitout.mjs <shell.glb> <fitout.glb> <out.glb>
 *
 * Needs glTF-Transform, which isn't a project dependency; install it somewhere else first:
 *   npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 draco3dgltf meshoptimizer
 * The output is Draco compressed. The shell's own file is left as it is.
 */
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRDracoMeshCompression } from "@gltf-transform/extensions";
import { mergeDocuments, prune, unpartition } from "@gltf-transform/functions";
import draco3d from "draco3dgltf";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";

const [shellPath, fitPath, outPath] = process.argv.slice(2);
if (!outPath) {
  console.error("usage: node scripts/models/merge-fitout.mjs <shell.glb> <fitout.glb> <out.glb>");
  process.exit(1);
}
await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  "draco3d.decoder": await draco3d.createDecoderModule(),
  "draco3d.encoder": await draco3d.createEncoderModule(),
  "meshopt.decoder": MeshoptDecoder,
  "meshopt.encoder": MeshoptEncoder,
});

const doc = await io.read(shellPath);
mergeDocuments(doc, await io.read(fitPath));
// The fit-out arrives as a second scene; move its nodes into the shell's scene (same coordinates).
const root = doc.getRoot();
const [main, ...rest] = root.listScenes();
for (const scene of rest) {
  for (const node of scene.listChildren()) {
    scene.removeChild(node);
    main.addChild(node);
  }
  scene.dispose();
}
root.setDefaultScene(main);
await doc.transform(unpartition(), prune());
doc.createExtension(KHRDracoMeshCompression).setRequired(true).setEncoderOptions({ method: KHRDracoMeshCompression.EncoderMethod.EDGEBREAKER });
await io.write(outPath, doc);
console.log(`${outPath}: ${main.listChildren().map((n) => n.getName()).join(", ")}`);
