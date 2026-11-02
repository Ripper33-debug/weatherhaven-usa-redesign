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

## Updating from a new round of Barry's models

`scripts/models/import-round.mjs "<package folder>"` converts a package (one folder per model with
`<name>-deployed-web.glb`, `-stowed-web.glb` and `-deployed-fitted-web.glb`) into the files below,
textures capped at 1024 px. Then re-capture the viewer stills (the product page with
`window.__CAMP_CAPTURE__`), copy the deploy videos and interior renders, and redraw the homepage
lineup (`src/components/home/v2/lineup.ts` says how).

## Files here (round 4, November 2026)

Per system folder (`ateps/`, `ehmecc/`, `endurance/`, `hercon/`, `mecc/`, `mex-26/`, `mts/`,
`polar-chief/`, `polarhaven/`, `rdmss/`, `series-4/`), all Draco compressed:

- `<slug>-deployed.glb`: the deployed shelter with its deploy animation (one clip). Containers' clips
  start from the closed container; soft shelters' from bare ground. The file's resting pose is deployed.
- `<slug>-stowed.glb`: packed for transport (viewer's packed view for soft shelters; the camp's arrival).
- `<slug>-fitout.glb`: the example fit-out alone (`<MODEL>_fitout`), in the shell's coordinates ("Show inside").
- `<slug>-deployed-fitted.glb`: shell plus fit-out, static (AR page's furnished choice).
- `<slug>-ar.glb`: the deployed shelter without its animation (AR page).
- `<slug>-camp.glb`: a third of the triangles, no textures, no animation (the mission builder's camp).
- `<slug>-poster-deployed.jpg` (1600 × 900) and `-m.jpg` (1200 × 900): the viewer's stills.
- `<slug>-interior.jpg` and, for nine systems, `<slug>-deploy.mp4`: Barry's interior render and deploy
  video, shown when a browser can't run the 3D viewer.
- `env/desert-sky-256.hdr`: the outdoor sky the models were colour-checked under (from Barry's web kit),
  cut down to 256 × 128 for lighting only.

Barry Castelli built these in Blender from weatherhaven.com and weatherhavenusa.com pages and photos,
the 40th anniversary book, patents, the US capabilities statement and the MECC's DLA data sheet. They
are not engineering CAD. The TRECC (`trecc-*.glb`, `ar/`, `/assets/models/trecc-open.glb`) is still
cut down from Weatherhaven's CAD export (see REDESIGN.md); `trecc/` holds its fit-out, deploy video and
interior render.
