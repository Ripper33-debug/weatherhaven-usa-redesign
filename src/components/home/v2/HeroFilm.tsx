"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";

/**
 * The homepage film: a 25-second loop cut from Weatherhaven's brand films, which were made from its
 * own product photography (the TRECC in fog, snow, a sandstorm, at dusk and at night, plus close-ups
 * of its hardware). Interiors and scenes showing things Weatherhaven may not sell were left out.
 * The hero says it's an illustrative film.
 *
 * The still is the first paint. Wide screens show the film's first frame (the TRECC in a foggy
 * forest, dark enough for the headline beside it). Phones show the film as a band above the copy,
 * so they get a frame that reads at that size: the TRECC on its trailer at dusk
 * (public/hero/film-poster-phone.jpg, cut from the film at 15.3 s to the phone band's crop), and
 * their film starts on that same frame, so the still dissolves into motion without a jump.
 *
 * The film starts downloading only once the page has loaded (on phones, at the first touch or
 * scroll), at 720p on phones (about 1 MB; 2.4 MB at 1080p, see scripts/media/build-hero-film.sh).
 * Reduced motion, data saver and 2G connections start paused on the still; the button always works.
 */
const POSTER = "/hero/film-poster.jpg";
const PHONE_POSTER = "/hero/film-poster-phone.jpg";
/** Where the phone film starts: the frame the phone still was cut from. */
const PHONE_START = 15.3;
const PHONE = "(max-width: 767px)";

function loadSource(video: HTMLVideoElement) {
  if (video.getAttribute("src")) return;
  const small = window.matchMedia(PHONE).matches;
  video.src = small ? `/hero/film-720.mp4#t=${PHONE_START}` : "/hero/film-1080.mp4";
}

/**
 * Data saver on, or a 2G-class connection: keep the still and don't fetch the film until the
 * visitor presses Play. (navigator.connection is Chromium-only; elsewhere the film loads as usual.)
 */
function slowOrSaving(): boolean {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c && (c.saveData === true || c.effectiveType === "slow-2g" || c.effectiveType === "2g");
}

// Art direction: one <picture>, the phone still for narrow screens and the film's first frame above.
const phone = getImageProps({ src: PHONE_POSTER, alt: "", fill: true, sizes: "100vw" }).props;
const wide = getImageProps({ src: POSTER, alt: "", fill: true, sizes: "100vw" }).props;

export function HeroFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // True only while frames are actually moving: the button offers Play until then (while the film
  // waits for a phone's first touch, while it loads, and when autoplay is refused).
  const [running, setRunning] = useState(false);
  // The film fades in over the still the first time it plays, then stays (a paused film shows its frame).
  const [shown, setShown] = useState(false);
  const userPausedRef = useRef(false);

  // The stills are the first paint: preloaded from the head, each for its own screen size only.
  preload(phone.src, { as: "image", imageSrcSet: phone.srcSet, imageSizes: "100vw", media: PHONE, fetchPriority: "high" });
  preload(wide.src, { as: "image", imageSrcSet: wide.srcSet, imageSizes: "100vw", media: "(min-width: 768px)", fetchPriority: "high" });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlaying = () => {
      setRunning(true);
      setShown(true);
    };
    const onStopped = () => setRunning(false);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onStopped);
    video.addEventListener("waiting", onStopped);
    video.addEventListener("ended", onStopped);
    const start = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || userPausedRef.current) return;
      if (slowOrSaving()) return;
      loadSource(video);
      void video.play().catch(() => undefined);
    };
    // Phones wait for the first touch, scroll or key press: the still stays the page's largest paint
    // (a film that starts by itself on a slow phone became the largest paint, seconds later), and a
    // visitor who never interacts doesn't download the film. Wider screens start once loaded.
    const onPhone = window.matchMedia(PHONE).matches;
    const INTERACTION = ["pointerdown", "touchstart", "scroll", "keydown"] as const;
    const onInteract = () => {
      for (const t of INTERACTION) window.removeEventListener(t, onInteract);
      start();
    };
    const arm = () => {
      if (!onPhone) return start();
      for (const t of INTERACTION) window.addEventListener(t, onInteract, { once: true, passive: true });
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onStopped);
      video.removeEventListener("waiting", onStopped);
      video.removeEventListener("ended", onStopped);
      window.removeEventListener("load", arm);
      for (const t of INTERACTION) window.removeEventListener(t, onInteract);
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (running) {
      userPausedRef.current = true;
      video.pause();
    } else {
      userPausedRef.current = false;
      loadSource(video);
      void video.play().catch(() => undefined);
    }
  };

  return (
    <>
      <picture>
        <source media={PHONE} srcSet={phone.srcSet} sizes="100vw" />
        <img
          {...wide}
          alt=""
          loading="eager"
          fetchPriority="high"
          className="object-cover object-center md:object-[60%_50%]"
        />
      </picture>
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden
        className={`absolute inset-0 h-full w-full object-cover object-[56%_50%] transition-opacity duration-1000 md:object-[60%_50%] ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      />
      <button
        type="button"
        onClick={toggle}
        className="v2-press absolute right-3 top-20 z-10 flex h-10 items-center gap-2 bg-ink/50 px-3 text-[0.875rem] font-medium text-snow/85 backdrop-blur-sm transition-colors hover:text-snow md:right-[var(--v2-gutter)] md:top-24"
        aria-label={running ? "Pause the background film" : "Play the background film"}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
          {running ? <path d="M3 1.5h2v9H3zM7 1.5h2v9H7z" fill="currentColor" /> : <path d="M3 1.5v9l7-4.5z" fill="currentColor" />}
        </svg>
        {running ? "Pause film" : "Play film"}
      </button>
    </>
  );
}
