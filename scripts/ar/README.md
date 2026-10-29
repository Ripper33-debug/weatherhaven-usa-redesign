# TRECC models for phone AR

`public/models/ar/` holds the real-scale, deployed TRECC in each finish, for "See it full size":
a plain GLB for Android's Scene Viewer and a USDZ for iPhone's AR Quick Look.

They are made from `public/models/trecc-open.glb` (the web cut of the CAD export). These tools
aren't part of the site's dependencies, so run them in a scratch folder:

```bash
mkdir -p /tmp/ar && cd /tmp/ar && npm init -y && npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer@0.22
pip install usd-core pygltflib numpy

MIN_PART=0.04 CREASE=40 node <repo>/scripts/ar/prepare-ar-models.mjs <repo>/public/models /tmp/ar/out 0.2 0.006
python3 <repo>/scripts/ar/glb-to-usdz.py /tmp/ar/out /tmp/ar/out
cp /tmp/ar/out/trecc-deployed-*.{glb,usdz} <repo>/public/models/ar/
```

What the preparation does, and why:
- Drops compression extensions (Scene Viewer doesn't read them).
- Removes inside faces and loose parts under 4 cm (invisible at room scale, and each costs
  triangles), keeps one copy of panels drawn twice, and simplifies to about 105,000 triangles.
- Gives curved surfaces smooth normals while keeping CAD edges sharp.
- Folds the many small part colours into a short palette (about 14 materials) and sets the shell
  to the finish colour.
The GLBs pass the Khronos glTF validator with no errors or warnings.
