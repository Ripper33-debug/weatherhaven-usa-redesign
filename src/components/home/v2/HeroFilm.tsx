"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";

/**
 * The homepage film: a 25-second loop cut from Weatherhaven's brand films, which were made from its
 * own product photography (the TRECC in fog, snow, a sandstorm, at dusk and at night, plus close-ups
 * of its hardware). Interiors and scenes showing things Weatherhaven may not sell were left out.
 * The hero says it's an illustrative film.
 *
 * The still (its first frame) is the first paint; the film starts downloading only once the page has
 * loaded (on phones, at the first touch or scroll), at 720p on phones (about 1 MB; 2.4 MB at 1080p,
 * see scripts/media/build-hero-film.sh).
 * Reduced motion, data saver and 2G connections start paused on the still; the button always works.
 */
const POSTER = "/hero/film-poster.jpg";

function loadSource(video: HTMLVideoElement) {
  if (video.getAttribute("src")) return;
  const small = window.matchMedia("(max-width: 767px)").matches;
  video.src = small ? "/hero/film-720.mp4" : "/hero/film-1080.mp4";
}

/**
 * Data saver on, or a 2G-class connection: keep the still and don't fetch the film until the
 * visitor presses Play. (navigator.connection is Chromium-only; elsewhere the film loads as usual.)
 */
function slowOrSaving(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g");
}

export function HeroFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const reduced = useClientMediaQuery("(prefers-reduced-motion: reduce)");
  // Reduced motion starts paused; after that the visitor's own choice wins.
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  // Set after mount when the connection says to save data (see slowOrSaving).
  const [saving, setSaving] = useState(false);
  const paused = userPaused ?? (reduced || saving);
  const userPausedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlaying = () => setPlaying(true);
    video.addEventListener("playing", onPlaying);
    const start = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || userPausedRef.current) return;
      if (slowOrSaving()) {
        setSaving(true);
        return;
      }
      loadSource(video);
      void video.play().catch(() => undefined);
    };
    // Phones wait for the first touch, scroll or key press: the still stays the page's largest paint
    // (a film that starts by itself on a slow phone became the largest paint, seconds later), and a
    // visitor who never interacts doesn't download the film. Wider screens start once loaded.
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const INTERACTION = ["pointerdown", "touchstart", "scroll", "keydown"] as const;
    const onInteract = () => {
      for (const t of INTERACTION) window.removeEventListener(t, onInteract);
      start();
    };
    const arm = () => {
      if (!phone) return start();
      for (const t of INTERACTION) window.addEventListener(t, onInteract, { once: true, passive: true });
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      video.removeEventListener("playing", onPlaying);
      window.removeEventListener("load", arm);
      for (const t of INTERACTION) window.removeEventListener(t, onInteract);
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (paused || video.paused) {
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
    <>
      <Image
        src={POSTER}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover object-[40%_50%] md:object-[60%_50%]"
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover object-[40%_50%] transition-opacity duration-1000 md:object-[60%_50%] ${
          playing ? "opacity-100" : "opacity-0"
        }`}
      />
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-20 z-10 flex h-10 items-center gap-2 bg-ink/50 px-3 text-[0.85rem] font-medium text-snow/85 backdrop-blur-sm transition-colors hover:text-snow md:right-[var(--v2-gutter)] md:top-24"
        aria-label={paused ? "Play the background film" : "Pause the background film"}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          {paused ? <path d="M3 1.5v9l7-4.5z" fill="currentColor" /> : <path d="M3 1.5h2v9H3zM7 1.5h2v9H7z" fill="currentColor" />}
        </svg>
        {paused ? "Play film" : "Pause film"}
      </button>
    </>
  );
}
