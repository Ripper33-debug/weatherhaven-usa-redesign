"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  authHeroPlaylist,
  homeHeroPlaylist,
  HERO_PLACEHOLDER_POSTER,
  HERO_PLACEHOLDER_READY,
  HERO_PLACEHOLDER_SRC,
  HERO_VIDEO_READY,
  HERO_VIDEO_SRC,
  SOF_HERO_VIDEO_READY,
  SOF_HERO_VIDEO_SRC,
} from "@/lib/hero-media";
import { PLACEHOLDER_HOME_VIDEOS } from "@/lib/placeholder-media";
import { useInView } from "@/hooks/useInView";

const HeroTopoCanvas = dynamic(
  () => import("@/components/HeroTopoCanvas").then((m) => m.HeroTopoCanvas),
  { ssr: false },
);

type Variant = "home" | "sof";

type Props = {
  variant?: Variant;
  shieldOverlay?: boolean;
  showParticles?: boolean;
  premium?: boolean;
  /** Play owned hero + placeholder back-to-back (login / SOF sign-in). */
  sequentialLoop?: boolean;
  /** Homepage hero uses auto; inner page heroes use metadata to save bandwidth. */
  videoPreload?: "auto" | "metadata" | "none";
};

export function HeroMediaBackground({
  variant = "home",
  shieldOverlay = false,
  showParticles = false,
  premium = false,
  sequentialLoop = false,
  videoPreload = "metadata",
}: Props) {
  const { ref, inView } = useInView<HTMLDivElement>("0px");
  const [clipIndex, setClipIndex] = useState(0);
  const [clipVisible, setClipVisible] = useState(true);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playlist = sequentialLoop
    ? variant === "home"
      ? homeHeroPlaylist()
      : authHeroPlaylist()
    : null;
  const ownedReady = variant === "sof" ? SOF_HERO_VIDEO_READY : HERO_VIDEO_READY;
  const ownedSrc = variant === "sof" ? SOF_HERO_VIDEO_SRC : HERO_VIDEO_SRC;
  const placeholderReady = variant === "home" && HERO_PLACEHOLDER_READY;
  const placeholderSrc = HERO_PLACEHOLDER_SRC;
  const placeholderPoster = HERO_PLACEHOLDER_POSTER;
  const placeholderLabel = PLACEHOLDER_HOME_VIDEOS.hero.label;
  const showVideo = sequentialLoop ? (playlist?.length ?? 0) > 0 : ownedReady || placeholderReady;
  const activeClip = playlist?.[clipIndex];
  const videoSrc = sequentialLoop ? (activeClip?.src ?? HERO_VIDEO_SRC) : ownedReady ? ownedSrc : placeholderSrc;
  const poster = sequentialLoop
    ? activeClip?.poster
    : placeholderReady && !ownedReady
      ? placeholderPoster
      : undefined;
  const onClipEnded = useCallback(() => {
    if (!playlist || playlist.length <= 1) return;
    setClipVisible(false);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setClipIndex((i) => (i + 1) % playlist.length);
      setClipVisible(true);
    }, 500);
  }, [playlist]);

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);
  const videoOverlay =
    "linear-gradient(to bottom, rgba(8,10,12,0.15) 0%, rgba(8,10,12,0.5) 100%)";
  const overlay = showVideo
    ? videoOverlay
    : premium
      ? "linear-gradient(105deg, rgba(8,10,12,0.82) 0%, rgba(8,10,12,0.45) 42%, rgba(8,10,12,0.25) 70%), linear-gradient(to bottom, rgba(8,10,12,0.1) 0%, rgba(8,10,12,0.75) 100%)"
      : shieldOverlay
        ? "linear-gradient(to bottom, rgba(8,10,12,0.2) 0%, rgba(8,10,12,0.65) 100%)"
        : "linear-gradient(to bottom, rgba(8,10,12,0.3) 0%, rgba(8,10,12,0.7) 100%)";

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 z-0 w-full max-w-full overflow-hidden ${premium ? "wh-film-grain" : ""}`}
      aria-hidden
    >
      {showVideo ? (
        <>
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              className={`absolute inset-0 z-0 h-full w-full object-cover ${inView ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
              fetchPriority="high"
            />
          ) : null}
          {inView ? (
            <video
              key={videoSrc}
              autoPlay
              muted
              loop={!sequentialLoop || (playlist?.length ?? 0) <= 1}
              playsInline
              preload={videoPreload}
              poster={poster}
              onEnded={sequentialLoop ? onClipEnded : undefined}
              aria-label={
                sequentialLoop
                  ? activeClip?.label
                  : placeholderReady && !ownedReady
                    ? placeholderLabel
                    : undefined
              }
              className={`hero-video absolute left-0 top-0 z-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
                clipVisible ? "opacity-100" : "opacity-0"
              } ${premium ? "wh-video-ken-burns" : ""}`}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : null}
        </>
      ) : (
        <HeroTopoCanvas showParticles={showParticles} />
      )}
      <div className="absolute inset-0 z-[1]" style={{ background: overlay }} />
    </div>
  );
}
