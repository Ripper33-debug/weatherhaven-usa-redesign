"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/effects/media";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";

/**
 * Full-bleed film hero. Poster paints first (LCP), the clip fades in once it can play.
 * Phones get a lighter 720p encode.
 */
function loadSource(video: HTMLVideoElement) {
  if (video.getAttribute("src")) return;
  const small = window.matchMedia("(max-width: 767px)").matches;
  video.src = small ? "/hero/hero-v2-720.mp4" : "/hero/hero-v2-1080.mp4";
}

export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const reduced = useClientMediaQuery("(prefers-reduced-motion: reduce)");
  // Reduced motion starts paused; after that the visitor's own choice wins.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const paused = userPaused ?? reduced;
  const userPausedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlaying = () => setPlaying(true);
    video.addEventListener("playing", onPlaying);
    // The poster is the first paint; the film only starts downloading once the page has loaded.
    const start = () => {
      if (prefersReducedMotion() || userPausedRef.current) return;
      loadSource(video);
      void video.play().catch(() => undefined);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      video.removeEventListener("playing", onPlaying);
      window.removeEventListener("load", start);
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) {
      loadSource(video);
      void video.play().catch(() => undefined);
      userPausedRef.current = false;
      setUserPaused(false);
    } else {
      video.pause();
      userPausedRef.current = true;
      setUserPaused(true);
    }
  };

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/hero-v2-poster.jpg"
        alt=""
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-[60%_center]"
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className={`absolute inset-0 -z-10 h-full w-full object-cover object-[60%_center] transition-opacity duration-1000 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(90deg, rgb(10 15 23 / 0.86) 0%, rgb(10 15 23 / 0.55) 38%, rgb(10 15 23 / 0.05) 70%), linear-gradient(0deg, rgb(10 15 23 / 0.95) 0%, rgb(10 15 23 / 0) 45%)",
        }}
      />

      <div className="v2-wrap pb-28 pt-32 sm:pb-20 lg:pb-24">
        <h1 className="v2-display v2-rise-hero text-snow">
          <span className="lg:block">Ships in a container. </span>
          <span className="lg:block">Stands up in minutes.</span>
        </h1>
        <p className="v2-lead v2-rise v2-rise-2 mt-6 max-w-[54ch] sm:mt-8">
          Weatherhaven designs and builds rapidly deployable shelters, camps and field hospitals for military,
          medical and polar operations. Fielded in more than 95 countries since 1981.
        </p>
        <div className="v2-rise v2-rise-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/configurable-solutions" className="v2-btn">
            Explore systems
          </Link>
          <Link href="/contact" className="v2-btn v2-btn-ghost">
            Talk to an expert
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={togglePlayback}
        className="absolute right-3 top-20 flex h-10 items-center gap-2 bg-ink/40 px-3 text-[0.8rem] font-medium text-snow/80 transition-colors hover:text-snow sm:bottom-5 sm:right-5 sm:top-auto sm:bg-transparent"
        aria-label={paused ? "Play film: background video" : "Pause film: background video"}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          {paused ? (
            <path d="M3 1.5v9l7-4.5z" fill="currentColor" />
          ) : (
            <path d="M3 1.5h2v9H3zM7 1.5h2v9H7z" fill="currentColor" />
          )}
        </svg>
        {paused ? "Play film" : "Pause film"}
      </button>
    </section>
  );
}
