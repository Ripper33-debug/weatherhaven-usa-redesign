"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/effects/media";

/**
 * Full-bleed film hero. Poster paints first (LCP), the clip fades in once it can play.
 * Phones get a lighter 720p encode.
 */
export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (prefersReducedMotion()) {
      video.pause();
      setPaused(true);
      return;
    }
    const small = window.matchMedia("(max-width: 767px)").matches;
    video.src = small ? "/hero/hero-720.mp4" : "/hero/hero.mp4";
    const onPlaying = () => setPlaying(true);
    video.addEventListener("playing", onPlaying);
    void video.play().catch(() => undefined);
    return () => video.removeEventListener("playing", onPlaying);
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ink">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/hero-poster.jpg"
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

      <div className="v2-wrap pb-14 pt-32 sm:pb-20 lg:pb-24">
        <h1 className="v2-display v2-rise text-snow">
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
        className="absolute bottom-5 right-5 hidden h-10 items-center gap-2 px-3 text-[0.8rem] font-medium text-snow/70 transition-colors hover:text-snow sm:flex"
        aria-label={paused ? "Play background video" : "Pause background video"}
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
