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
  /**
   * The example fit-out behind "Show inside": a file whose node `node` is the fit-out, in the same
   * coordinates as the deployed file (Barry's `-deployed-fitted` files, or the separate fit-out-only
   * files for the MECC, EHMECC and TRECC). Only that node is added; `label` names the fit-out.
   */
  inside?: { src: string; node: string; label: string };
  /**
   * The whole deployed model with its fit-out, for the AR page's "Furnished" choice. Defaults to
   * `inside.src` when that is a `-deployed-fitted` file; the MECC, EHMECC and TRECC have merged files
   * (shell plus fit-out, built with glTF-Transform) because their fit-outs come separately.
   */
  furnished?: string;
  /**
   * Height (metres above the ground) where "Show inside" cuts the shell. Defaults to about
   * two-thirds of the shelter's height, capped at 2.1 m.
   */
  cutHeight?: number;
  /** The AR page's copy. */
  ar?: { title: string; lead: string; facts: string[]; alt: string };
};

/** Barry's site-sourced models (weatherhaven.com pages and photos, not engineering CAD). */
const builtFrom = (name: string) => `3D model built from Weatherhaven’s published ${name} specifications and photos`;
const LEAD_HARD = "in the room you’re standing in, at real scale. Walk around it; walk inside it.";
const LEAD_SOFT = "in the space you’re standing in, at real scale. Walk around it; walk inside it.";
/** Military shelters modelled in the green finish: the finish picker recolours these. */
const SOFT_FINISHES = { paint: ["paint"], fabric: ["fabric", "strap"] };

export const SYSTEM_MODELS: Record<string, SystemModel> = {
  trecc: {
    slug: "trecc",
    deployed: "/assets/models/trecc-open.glb",
    compression: "draco",
    source: "Weatherhaven CAD model",
    inside: { src: "/models/trecc/trecc-fitout-command-post.glb", node: "TRECC_fitout", label: "Command post" },
    // A copy of the AR file with the fit-out added; trecc-open.glb itself stays exactly as copied.
    furnished: "/assets/models/trecc-open-fitted.glb",
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
    inside: { src: "/models/mecc/mecc-fitout-command-post.glb", node: "MECC_fitout", label: "Command post" },
    furnished: "/models/mecc/mecc-deployed-fitted.glb",
    ar: {
      title: "See the MECC at full size",
      lead: `Place the deployed MECC ${LEAD_HARD}`,
      facts: ["20-ft ISO container packed", "420 ft² deployed", "2 people, 10 to 15 minutes"],
      alt: "Weatherhaven MECC expandable container, deployed",
    },
  },
  ehmecc: {
    slug: "ehmecc",
    deployed: "/models/ehmecc/ehmecc-deployed.glb",
    // The raised roof is part of the core, so the packed view is its own file rather than a fold.
    stowed: "/models/ehmecc/ehmecc-stowed.glb",
    compression: "draco",
    source: builtFrom("EHMECC"),
    finishMaterials: { paint: ["paint", "paint_dark"], fabric: ["fabric", "strap"] },
    inside: { src: "/models/ehmecc/ehmecc-fitout-operating-room.glb", node: "EHMECC_fitout", label: "Operating room" },
    furnished: "/models/ehmecc/ehmecc-deployed-fitted.glb",
    ar: {
      title: "See the EHMECC at full size",
      lead: `Place the deployed EHMECC ${LEAD_HARD}`,
      facts: ["20-ft ISO container packed", "420 ft² with a 12-ft ceiling", "Under 10 minutes, no tools"],
      alt: "Weatherhaven EHMECC expandable container with its roof raised, deployed",
    },
  },
  ateps: {
    slug: "ateps",
    deployed: "/models/ateps/ateps-deployed.glb",
    stowed: "/models/ateps/ateps-stowed.glb",
    compression: "draco",
    source: builtFrom("ATEPS"),
    articulation: {
      hinges: [
        { node: "ATEPS_side_wall_L", stowed: 0 },
        { node: "ATEPS_side_wall_R", stowed: 0 },
      ],
      unfold: [
        { node: "ATEPS_expansion_L", pivotX: -1.067 },
        { node: "ATEPS_expansion_R", pivotX: 1.067 },
      ],
      hideStowed: ["ATEPS_interior"],
    },
    // Modelled in grey, so no finish picker (its "green" would show grey).
    inside: { src: "/models/ateps/ateps-deployed-fitted.glb", node: "ATEPS_fitout", label: "Medical aid station" },
    ar: {
      title: "See the ATEPS at full size",
      lead: `Place the deployed ATEPS ${LEAD_HARD}`,
      facts: ["One 463L pallet packed", "244 × 104 in deployed", "2 people, under 10 minutes"],
      alt: "Weatherhaven ATEPS expandable shelter, deployed",
    },
  },
  hercon: {
    slug: "hercon",
    deployed: "/models/hercon/hercon-deployed.glb",
    stowed: "/models/hercon/hercon-stowed.glb",
    compression: "draco",
    source: builtFrom("HERCon"),
    finishMaterials: { paint: ["paint", "paint_dark"], fabric: [] },
    inside: { src: "/models/hercon/hercon-deployed-fitted.glb", node: "HERCON_fitout", label: "Housing, 8 berths" },
    ar: {
      title: "See the HERCon at full size",
      lead: `Place the deployed HERCon ${LEAD_HARD}`,
      facts: ["Ships as an ISO container", "Up to 6× its shipping footprint", "Minutes to set up, team of six"],
      alt: "Weatherhaven HERCon expandable container, deployed",
    },
  },
  "series-4": {
    slug: "series-4",
    deployed: "/models/series-4/series-4-deployed.glb",
    stowed: "/models/series-4/series-4-stowed.glb",
    compression: "draco",
    source: builtFrom("Series 4"),
    finishMaterials: SOFT_FINISHES,
    inside: { src: "/models/series-4/series-4-deployed-fitted.glb", node: "SERIES4_fitout", label: "Kitchen and dining" },
    ar: {
      title: "See the Series 4 at full size",
      lead: `Place a 16 × 32 ft Series 4 ${LEAD_SOFT}`,
      facts: ["8 to 30 ft wide, any length", "Shown 16 × 32 ft", "No tools or specialist skills"],
      alt: "Weatherhaven Series 4 soft-wall shelter, 16 by 32 ft, deployed",
    },
  },
  rdmss: {
    slug: "rdmss",
    deployed: "/models/rdmss/rdmss-deployed.glb",
    stowed: "/models/rdmss/rdmss-stowed.glb",
    compression: "draco",
    source: builtFrom("RDMSS"),
    finishMaterials: { paint: ["paint"], fabric: ["fabric", "strap", "cap"] },
    inside: { src: "/models/rdmss/rdmss-deployed-fitted.glb", node: "RDMSS_fitout", label: "Command post" },
    ar: {
      title: "See the RDMSS at full size",
      lead: `Place the deployed RDMSS ${LEAD_SOFT}`,
      facts: ["Up to 995 ft² (4 modules)", "3 people, under 20 minutes", "−51°C to +49°C"],
      alt: "Weatherhaven RDMSS soft-wall shelter with its solar shade, deployed",
    },
  },
  mts: {
    slug: "mts",
    deployed: "/models/mts/mts-deployed.glb",
    stowed: "/models/mts/mts-stowed.glb",
    compression: "draco",
    source: builtFrom("MTS"),
    finishMaterials: SOFT_FINISHES,
    inside: { src: "/models/mts/mts-deployed-fitted.glb", node: "MTS_fitout", label: "Dining hall" },
    ar: {
      title: "See the MTS at full size",
      lead: `Place a deployed MTS ${LEAD_SOFT}`,
      facts: ["Modules join into camps and hospitals", "No tools or specialist training", "Over- and under-pressure capable"],
      alt: "Weatherhaven MTS modular tent system, deployed",
    },
  },
  "mex-26": {
    slug: "mex-26",
    deployed: "/models/mex-26/mex-26-deployed.glb",
    stowed: "/models/mex-26/mex-26-stowed.glb",
    compression: "draco",
    source: builtFrom("MEX-26"),
    finishMaterials: SOFT_FINISHES,
    inside: { src: "/models/mex-26/mex-26-deployed-fitted.glb", node: "MEX26_fitout", label: "Vehicle maintenance bay" },
    ar: {
      title: "See the MEX-26 at full size",
      lead: `Place the deployed MEX-26 ${LEAD_SOFT} It’s big: you’ll want a car park or a field.`,
      facts: ["26-ft clear span", "One 463L pallet packed", "10 people, 3 hours or less"],
      alt: "Weatherhaven MEX-26 vehicle maintenance shelter, deployed",
    },
  },
  polarhaven: {
    slug: "polarhaven",
    deployed: "/models/polarhaven/polarhaven-deployed.glb",
    stowed: "/models/polarhaven/polarhaven-stowed.glb",
    compression: "draco",
    source: builtFrom("Polarhaven"),
    // Modelled in its polar colours; no military finishes.
    inside: { src: "/models/polarhaven/polarhaven-deployed-fitted.glb", node: "POLARHAVEN_fitout", label: "Base camp" },
    ar: {
      title: "See the Polarhaven at full size",
      lead: `Place a 14 × 20 ft Polarhaven ${LEAD_SOFT}`,
      facts: ["8 to 20 ft wide, any length", "About 30 minutes for a 12 × 16 ft unit", "Antarctic base camps since 1988"],
      alt: "Weatherhaven Polarhaven arch shelter, deployed",
    },
  },
  "polar-chief": {
    slug: "polar-chief",
    deployed: "/models/polar-chief/polar-chief-deployed.glb",
    stowed: "/models/polar-chief/polar-chief-stowed.glb",
    compression: "draco",
    source: builtFrom("Polar Chief"),
    inside: { src: "/models/polar-chief/polar-chief-deployed-fitted.glb", node: "POLARCHIEF_fitout", label: "Kitchen and mess" },
    ar: {
      title: "See the Polar Chief at full size",
      lead: `Place the deployed Polar Chief ${LEAD_SOFT}`,
      facts: ["14 ft across", "2 people, about 20 minutes", "Comfortable at −50°C"],
      alt: "Weatherhaven Polar Chief octagonal polar shelter, deployed",
    },
  },
  endurance: {
    slug: "endurance",
    deployed: "/models/endurance/endurance-deployed.glb",
    stowed: "/models/endurance/endurance-stowed.glb",
    compression: "draco",
    source: builtFrom("Endurance"),
    inside: { src: "/models/endurance/endurance-deployed-fitted.glb", node: "ENDURANCE_fitout", label: "Sleeping quarters" },
    // A low tent: cut at about waist height so the near wall doesn't hide the cots.
    cutHeight: 0.95,
    ar: {
      title: "See the Endurance at full size",
      lead: `Place a 16-ft Endurance ${LEAD_SOFT}`,
      facts: ["16 or 21 ft long, 8 ft wide", "1 person, about 5 minutes", "77 lb (16 ft)"],
      alt: "Weatherhaven Endurance polar tent, 16 ft, deployed",
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

/**
 * Which example fit-outs suit each mission builder mission. The camp's "Look inside" shows the
 * model's own fit-out only when it suits the mission (no operating room in a command post);
 * otherwise it draws the mission's simplified interior.
 */
const FITOUTS_FOR_MISSION: Record<string, RegExp> = {
  command: /command post/i,
  medical: /operating room|aid station/i,
  maintenance: /maintenance/i,
  living: /housing|sleeping|base camp|dining|kitchen|mess/i,
  research: /sleeping|base camp|kitchen|mess/i,
  response: /housing|sleeping|base camp|dining|kitchen|mess|aid station/i,
};

/** The fit-out label the camp shows for this system and mission, or null for the simplified interior. */
export function fitoutForMission(slug: string, mission: string | null | undefined): string | null {
  const label = SYSTEM_MODELS[slug]?.inside?.label;
  return label && FITOUTS_FOR_MISSION[mission ?? "response"]?.test(label) ? label : null;
}

/** The furnished model for the AR page, or null when the system has no fit-out. */
export function furnishedModel(slug: string): string | null {
  const m = SYSTEM_MODELS[slug];
  if (!m) return null;
  return m.furnished ?? (m.inside?.src.endsWith("-deployed-fitted.glb") ? m.inside.src : null);
}

/** The AR page for a system: the TRECC keeps /ar (links are already out); the rest are /ar/<slug>. */
export function arHref(slug: string): string | null {
  if (slug === "trecc") return "/ar";
  return SYSTEM_MODELS[slug]?.ar ? `/ar/${slug}` : null;
}
