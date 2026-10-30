# MECC 3D model

Built from Weatherhaven's MECC brochure (1087, 2021: specs table, packed/deployed photos, end elevation drawings) and the weatherhaven.com MECC page and photos. It is not engineering CAD: anything the sources don't show is a best estimate (see "Illustrative" below).

## Files
| File | What |
|---|---|
| `mecc-deployed.glb` | Deployed unit, full detail (280k triangles, 7 MB) |
| `mecc-deployed-web.glb` | Same, Draco-compressed for the website (0.7 MB) |
| `mecc-stowed.glb` | Packed 20 ft ISO container (57k triangles, 1.6 MB) |
| `mecc-stowed-web.glb` | Same, Draco-compressed (0.2 MB) |
| `mecc-deployed.blend`, `mecc-stowed.blend` | Blender scenes, Blender 5.0 |
| `src/` | The Blender Python that builds everything (`build.py deployed|stowed out_prefix`) |
| `renders/` | Preview renders + photo comparison |

All four GLBs pass the Khronos glTF validator with 0 errors and 0 warnings.

## Setup (same conventions as the TRECC files)
- Metres, Y up, origin on the ground at the centre of the footprint. Width is along X, length along Z.
- Door end faces +Z (Blender +Y); the ECU end faces -Z.
- Recolour by material name: `paint` (container body) and `fabric` (expansion shell). `light` is the light diffusers; set its emissive for night scenes.
- Nodes: `MECC_core`, `MECC_side_wall_L/R`, `MECC_expansion_L/R`, `MECC_interior`, `MECC_site_kit` (power cable, earth rod).
- Unlike the TRECC files, the side walls are separate nodes that pivot on their real hinge line. Rotating `MECC_side_wall_L/R` to 0 folds them back up, so a deploy animation can use the actual fold-down motion.

## Matches the published specs
- Packed: 96 x 240 x 96 in (ISO 20 ft, 6058 mm actual length)
- Deployed: 253 in wide, about 39 m² / 420 ft² of floor, same 8 ft height
- Internal headroom 2.23 m (7 ft 6 in)
- Set-up and transport features shown: forklift pockets, PLS/DROPS rails, ISO castings, 4 locking bars per side wall, levelling legs

## Illustrative (not from engineering)
- Exact arch spacing, fabric sag, strap and guy-line layout
- Hardware sizes, bolt patterns, interior fit-out (lights, power drops, distribution board, grilles)
- Header depth over the expansions: with the published 253 in width, the fold-down wall leaves a ~0.25 m header inside. The US interior photo suggests a thinner one, so engineering drawings would settle it.
