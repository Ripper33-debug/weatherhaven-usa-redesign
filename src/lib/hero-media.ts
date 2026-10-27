import { PLACEHOLDER_HOME_VIDEOS } from "@/lib/placeholder-media";

/**
 * Owned hero clips in /public/hero/.
 * Set NEXT_PUBLIC_HERO_VIDEO_READY=true in Vercel to disable Mixkit fallbacks on auth/mid-page bands.
 */
export const HERO_VIDEO_READY = process.env.NEXT_PUBLIC_HERO_VIDEO_READY === "true";
export const HERO_VIDEO_SRC = "/hero/hero.mp4";
export const HERO_DEPLOY_SRC = "/hero/deploy.mp4";
export const HERO_IRON_PATIENCE_SRC = "/hero/iron-patience.mp4";
export const HERO_BUILT_FOR_FIELD_SRC = "/hero/built-for-the-field.mp4";

/** @deprecated Use HERO_DEPLOY_SRC */
export const HERO_RUNWAY_THRESHOLD_SRC = HERO_DEPLOY_SRC;

/** SOF landing/login uses the same owned hero unless you add /public/hero/hero-sof.mp4 later. */
export const SOF_HERO_VIDEO_READY = HERO_VIDEO_READY;
export const SOF_HERO_VIDEO_SRC = HERO_VIDEO_SRC;

/** Stock placeholder until owned hero is enabled */
export const HERO_PLACEHOLDER_READY = PLACEHOLDER_HOME_VIDEOS.enabled;
export const HERO_PLACEHOLDER_SRC = PLACEHOLDER_HOME_VIDEOS.hero.src;
export const HERO_PLACEHOLDER_POSTER = PLACEHOLDER_HOME_VIDEOS.hero.poster;

export type HeroClip = {
  src: string;
  poster?: string;
  label?: string;
};

/** Homepage hero — hero, deploy, iron patience, built for the field; loops back. */
export function homeHeroPlaylist(): HeroClip[] {
  return [
    { src: HERO_VIDEO_SRC, label: "Shelter systems built for anywhere" },
    { src: HERO_DEPLOY_SRC, label: "Deploy" },
    { src: HERO_IRON_PATIENCE_SRC, label: "Iron patience" },
    { src: HERO_BUILT_FOR_FIELD_SRC, label: "Built for the field" },
  ];
}

/** Auth gate pages: owned hero only when live; otherwise owned file + Mixkit loop. */
export function authHeroPlaylist(): HeroClip[] {
  if (HERO_VIDEO_READY) {
    return [{ src: HERO_VIDEO_SRC, label: "Weatherhaven shelter" }];
  }

  const clips: HeroClip[] = [{ src: HERO_VIDEO_SRC, label: "Weatherhaven shelter" }];
  if (HERO_PLACEHOLDER_READY) {
    clips.push({
      src: HERO_PLACEHOLDER_SRC,
      poster: HERO_PLACEHOLDER_POSTER,
      label: PLACEHOLDER_HOME_VIDEOS.hero.label,
    });
  }
  return clips;
}
