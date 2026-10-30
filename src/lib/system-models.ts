/**
 * Which systems have a real 3D model, and how to use it. One entry per system; the product page's
 * 3D viewer, the /ar/<slug> page and the mission builder's 3D camp all read this list.
 *
 * Model conventions (same as the TRECC files and Barry's Blender builds): metres, Y up, origin on
 * the ground at the centre of the footprint, width along X, length along Z, door end facing +Z.
 * Files live in public/models/<slug>/. `scripts/models/add-model.mjs` checks a new model and copies
 * it in; public/models/README.md explains the steps.
 *
 * The TRECC keeps its own viewer (src/components/systems/TreccViewer.tsx), built earlier from the CAD
 * export; it is listed here for the AR page and the camp.
 */
export type ModelCompression = "draco" | "meshopt";

export type SystemModel = {
  slug: string;
  /** Deployed model, used by the viewer, AR and the camp. */
  deployed: string;
  /** Packed model, where the deployed file can't fold itself up. */
  stowed?: string;
  compression: ModelCompression;
  /** Where the model came from, shown under the viewer and on the AR page. */
  source: string;
  /**
   * How the deployed file folds itself up for the stowed view and the deploy animation:
   * - hinges: nodes that rotate about their own origin; `stowed` is the rotation (radians, about Z)
   *   that folds them back up; the file holds the deployed rotation.
   * - unfold: nodes that open out from a hinge line at x = pivotX (scaled from 0 to 1 along X).
   * - hideStowed: nodes not shown while packed (interior, site kit).
   */
  articulation?: {
    hinges: { node: string; stowed: number }[];
    unfold: { node: string; pivotX: number }[];
    hideStowed: string[];
  };
  /**
   * Material names that take the finish colour: paint (hard shell) and fabric. The first name in
   * each list is the reference; the others (darker trim, straps) keep their brightness relative to it.
   */
  finishMaterials?: { paint: string[]; fabric: string[] };
  /**
   * Still of the deployed model for the product-page viewer (first paint and fallback): 1600 × 900,
   * plus a 1200 × 900 copy ending in -m for phones. Defaults to /models/<slug>/<slug>-poster-deployed.jpg.
   */
  poster?: string;
  /** The AR page's copy. */
  ar?: { title: string; lead: string; facts: string[]; alt: string };
};

export const SYSTEM_MODELS: Record<string, SystemModel> = {
  trecc: {
    slug: "trecc",
    deployed: "/assets/models/trecc-open.glb",
    compression: "draco",
    source: "Weatherhaven CAD model",
  },
  mecc: {
    slug: "mecc",
    deployed: "/models/mecc/mecc-deployed.glb",
    stowed: "/models/mecc/mecc-stowed.glb",
    compression: "draco",
    source: "3D model built from Weatherhaven’s published MECC drawings, specifications and photos",
    articulation: {
      // The file holds the walls folded down (deployed); 0 folds them back up flush with the container.
      hinges: [
        { node: "MECC_side_wall_L", stowed: 0 },
        { node: "MECC_side_wall_R", stowed: 0 },
      ],
      unfold: [
        { node: "MECC_expansion_L", pivotX: -1.219 },
        { node: "MECC_expansion_R", pivotX: 1.219 },
      ],
      hideStowed: ["MECC_interior", "MECC_site_kit"],
    },
    finishMaterials: { paint: ["paint", "paint_dark"], fabric: ["fabric", "strap"] },
    ar: {
      title: "See the MECC at full size",
      lead: "Place the deployed MECC in the room you’re standing in, at real scale. Walk around it; walk inside it.",
      facts: ["20-ft ISO container packed", "420 ft² deployed", "2 people, 10 to 15 minutes"],
      alt: "Weatherhaven MECC expandable container, deployed",
    },
  },
};

export function systemModel(slug: string): SystemModel | undefined {
  return SYSTEM_MODELS[slug];
}

/** The viewer's still: 16:9 for wider screens and a 4:3 copy (-m) for phones. */
export function modelPoster(slug: string): { src: string; small: string } {
  const src = SYSTEM_MODELS[slug]?.poster ?? `/models/${slug}/${slug}-poster-deployed.jpg`;
  return { src, small: src.replace(/\.jpg$/, "-m.jpg") };
}

/** The AR page for a system: the TRECC keeps /ar (links are already out); the rest are /ar/<slug>. */
export function arHref(slug: string): string | null {
  if (slug === "trecc") return "/ar";
  return SYSTEM_MODELS[slug]?.ar ? `/ar/${slug}` : null;
}
