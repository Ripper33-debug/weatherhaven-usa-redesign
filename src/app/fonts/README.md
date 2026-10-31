# Archivo, trimmed for the site

Archivo (Omnibus-Type, SIL Open Font License 1.1, https://github.com/Omnibus-Type/Archivo), from the
Google Fonts latin subset, cut down with fontTools' variable-font instancer so phones download less
before the first paint:

- `archivo-var.woff2` (55 KB, was 90 KB): weight 400–700 and width 100–118, the ranges the site uses.
- `archivo-figures.woff2` (14 KB): one static instance, width 84 at weight 600, for the condensed
  figures (`.v2-figure`). It loads only on pages that show them.

To rebuild from the full font: `fontTools.varLib.instancer.instantiateVariableFont(font, {"wght": (400, 700), "wdth": (100, 118)})`
and `{"wght": 600, "wdth": 84}`, saved as woff2. Widen the ranges here if a new style needs them.
