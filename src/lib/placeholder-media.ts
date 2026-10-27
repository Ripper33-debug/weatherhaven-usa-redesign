/**
 * Stock footage fallback (Mixkit) — disabled automatically when owned hero is live.
 * Set NEXT_PUBLIC_HERO_VIDEO_READY=true after deploying /public/hero.mp4.
 */
const ownedHeroLive = process.env.NEXT_PUBLIC_HERO_VIDEO_READY === "true";

export const PLACEHOLDER_HOME_VIDEOS = {
  enabled: !ownedHeroLive,
  hero: {
    src: "https://assets.mixkit.co/videos/23426/23426-720.mp4",
    poster: "https://assets.mixkit.co/videos/23426/23426-thumb-720-3.jpg",
    label: "Troops in the field",
  },
  missionBand: {
    src: "https://assets.mixkit.co/videos/5943/5943-720.mp4",
    poster: "https://assets.mixkit.co/videos/5943/5943-thumb-720-0.jpg",
    label: "Soldiers on deployment",
  },
  proofBand: {
    src: "https://assets.mixkit.co/videos/23053/23053-720.mp4",
    poster: "https://assets.mixkit.co/videos/23053/23053-thumb-720-0.jpg",
    label: "Field command briefing",
  },
} as const;

export type PlaceholderVideoSpec = {
  src: string;
  poster?: string;
  label: string;
};
