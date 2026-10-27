import { HERO_IRON_PATIENCE_SRC, HERO_VIDEO_READY } from "@/lib/hero-media";
import { PLACEHOLDER_HOME_VIDEOS, type PlaceholderVideoSpec } from "@/lib/placeholder-media";

export type HomeVideoBandSpec = PlaceholderVideoSpec;

/** Mid-page cinematic between Global reach and Systems portfolio. */
export function homeMissionBandVideo(): HomeVideoBandSpec {
  if (HERO_VIDEO_READY) {
    return {
      src: HERO_IRON_PATIENCE_SRC,
      poster: "/products/trecc.jpg",
      label: "Iron patience in the field",
    };
  }

  return PLACEHOLDER_HOME_VIDEOS.missionBand;
}

/** Lower-page band before stats — Mixkit only until a second owned clip is added. */
export function homeProofBandVideo(): HomeVideoBandSpec | null {
  if (!PLACEHOLDER_HOME_VIDEOS.enabled) return null;
  return PLACEHOLDER_HOME_VIDEOS.proofBand;
}
