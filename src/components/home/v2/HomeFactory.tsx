"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/effects/media";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";

const LIFECYCLE = ["Design", "Manufacture", "Deliver", "Install", "Demobilize", "Refurbish and store"] as const;

const CREDENTIALS = [
  { title: "ISO 9001:2015", body: "Certified quality management at the Burnaby and Brockville plants." },
  { title: "Developed with the US Army", body: "TRECC was co-developed with US Army DEVCOM and tested to MIL-STD-810G." },
  { title: "US entity, US contracting", body: "Weatherhaven Resources Inc., North Tonawanda, NY. CAGE 0EYW4." },
] as const;

/** Factory film band: plays only while on screen, never with reduced motion. */
export function HomeFactory() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const reduced = useClientMediaQuery("(prefers-reduced-motion: reduce)");
  const [pausedChoice, setPaused] = useState<boolean | null>(null);
  const paused = pausedChoice ?? reduced;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (prefersReducedMotion()) {
      userPaused.current = true;
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (userPaused.current) return;
          if (!video.getAttribute("src")) video.src = "/hero/built-720.mp4";
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="factory-heading" className="border-t border-line bg-hull">
      <div className="relative h-[46svh] min-h-[320px] overflow-hidden">
        {/* Still frame as a lazy image (a video poster would download with the first screen) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/built-poster.jpg"
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-hull via-hull/30 to-transparent" />
        <button
          type="button"
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            if (video.paused) {
              userPaused.current = false;
              if (!video.getAttribute("src")) video.src = "/hero/built-720.mp4";
              void video.play().catch(() => undefined);
              setPaused(false);
            } else {
              userPaused.current = true;
              video.pause();
              setPaused(true);
            }
          }}
          aria-label={paused ? "Play film: factory video" : "Pause film: factory video"}
          className="absolute right-3 top-3 flex h-10 items-center gap-2 bg-ink/40 px-3 text-[0.8rem] font-medium text-snow/80 transition-colors hover:text-snow sm:right-5 sm:top-5"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
            {paused ? <path d="M3 1.5v9l7-4.5z" fill="currentColor" /> : <path d="M3 1.5h2v9H3zM7 1.5h2v9H7z" fill="currentColor" />}
          </svg>
          {paused ? "Play film" : "Pause film"}
        </button>
      </div>
      <div className="v2-wrap relative -mt-24 pb-20 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 id="factory-heading" className="v2-h1 max-w-[15ch] text-snow">
              Designed, built and supported by one company.
            </h2>
            <p className="v2-lead mt-6">
              Weatherhaven engineers and manufactures every system it sells, then stays with the program until the
              last shelter is refurbished and stored.
            </p>
            <ol className="mt-10 grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
              {LIFECYCLE.map((stage, i) => (
                <li key={stage} className="bg-hull py-4 pr-4">
                  <span className="v2-figure block text-[0.95rem] text-signal">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-1 block text-[1rem] font-semibold text-snow">{stage}</span>
                </li>
              ))}
            </ol>
          </div>
          <ul className="self-end border-t border-line">
            {CREDENTIALS.map((c) => (
              <li key={c.title} className="border-b border-line py-6">
                <p className="v2-h3 text-snow">{c.title}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{c.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
