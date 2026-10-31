# System models

One folder per system (`public/models/<slug>/`). The list of systems with a model, and how each one
folds up, is `src/lib/system-models.ts`. Each model appears in three places: the product page's 3D
viewer, the full-size AR page (`/ar/<slug>`; the TRECC is `/ar`) and the mission builder's 3D camp.

## Adding a model

1. Build it to the same conventions as the MECC (`mecc/README.md`): metres, Y up, origin on the ground
   at the centre of the footprint, width along X, length along Z. Name the paint and fabric materials
   `paint` and `fabric`, and keep moving parts (side walls, expansions) as separate nodes on their real
   hinge. Export a Draco-compressed `<name>-deployed-web.glb` (and `-stowed-web.glb` if it can't fold
   itself up).
2. `node scripts/models/add-model.mjs <slug> <folder>`: checks the files, copies them here and prints
   the entry for `SYSTEM_MODELS`.
3. Fill in the entry: `articulation` (hinge nodes and their packed rotation, expansions and their hinge
   line, nodes hidden while packed), `finishMaterials`, `inside` (the fit-out file, its node and a
   label), and the AR page's copy (`ar`), using only published figures.
4. Render the viewer's stills (`<slug>-poster-deployed.jpg` 1600 × 900 and `-m.jpg` 1200 × 900) from
   the product page's viewer.
5. If the mission builder places that system, check the camp (`src/lib/three/camp/shelters.ts`).
6. Lint, test, build, then look at the product page, `/ar/<slug>` and the camp on desktop and phone.

## Files here

- `mecc/`: Barry Castelli's MECC, built in Blender from the MECC brochure (1087, 2021) and weatherhaven.com
  photos. Deployed 0.7 MB, packed 0.2 MB (Draco). Not engineering CAD; see its README for what's estimated.
- `ateps/`, `ehmecc/`, `endurance/`, `hercon/`, `mex-26/`, `mts/`, `polar-chief/`, `polarhaven/`, `rdmss/`,
  `series-4/`: Barry's full-line models from weatherhaven.com pages and photos (Draco): deployed, packed,
  `-deployed-fitted` (adds a `<MODEL>_fitout` node for "Show inside") and the viewer's stills.
  The MECC, EHMECC and TRECC fit-outs are separate files (`<slug>-fitout-*.glb`) in the model's coordinates;
  `mecc/` and `ehmecc/` also hold a merged `-deployed-fitted.glb` for the AR page (`scripts/models/merge-fitout.mjs`).
- `trecc-*.glb`, `ar/`: the TRECC, cut down from Weatherhaven's CAD export (see REDESIGN.md).
