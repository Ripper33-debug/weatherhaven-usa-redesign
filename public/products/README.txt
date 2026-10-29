Product photography
=====================

Catalog cover (cards + first gallery slide)
  public/products/{slug}.jpg

Additional photos (product detail gallery)
  public/products/{slug}/gallery/any-name.jpg

Supported formats: .jpg, .jpeg, .webp, .png
Files are sorted alphabetically (01.jpg, 02.jpg works well).

Canonical product lines (OneDrive `010 - Products` folder names)
-----------------------------------------------------------------
  ateps, bmecc, trecc, ehmecc, mecc, endurance, polarhaven, polar-chief,
  series-1-5-2, series-4, airbeam-hp, rdmss, airbeam-lp, mex-26, mts,
  hercon, non-expandable-iso-containers

Sync from OneDrive:
  node scripts/sync-product-photos.mjs

Legacy marketing slugs redirect to canonical products (see weatherhaven-product-lines.ts).

CDN fallbacks remain in src/lib/product-images.ts when local files are missing.
