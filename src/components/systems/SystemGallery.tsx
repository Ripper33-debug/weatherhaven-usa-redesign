"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, ViewTransition, type ReactNode } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";

/** How far a finger or mouse has to travel sideways before it counts as a swipe. */
const SWIPE_PX = 40;

/**
 * Product photo viewer: a wide frame that cross-fades between photos (swipe, arrow keys or the
 * buttons), a thumbnail strip, and a full-screen view. Photos are shown whole (portrait and
 * landscape alike) over a soft, blurred copy of themselves, so nothing is cropped.
 */
export function SystemGallery({
  images,
  name,
  transitionName,
  blurs = {},
  lead = false,
  bleed = false,
}: {
  images: string[];
  name: string;
  /** Shared-element name (the catalog card's photo morphs into this frame). Omit when another element carries it. */
  transitionName?: string;
  /** src → tiny preview, passed from the server so photos fade in instead of popping. */
  blurs?: Record<string, string>;
  /** The viewer opens the page, so the first photo is its largest paint. */
  lead?: boolean;
  /** Edge to edge across the window, with the thumbnails kept to the page width. */
  bleed?: boolean;
}) {
  const count = images.length;
  const [index, setIndex] = useState(0);
  /** The photo underneath while the next one fades in. */
  const [previous, setPrevious] = useState<number | null>(null);
  /** Photos that have finished loading; the first counts from the start (it's server-rendered). */
  const [loaded, setLoaded] = useState<Record<string, true>>(() => (images[0] ? { [images[0]]: true } : {}));
  const [full, setFull] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stripRef = useRef<HTMLUListElement>(null);
  const swipeRef = useRef<{ x: number; y: number } | null>(null);
  const reduced = useClientMediaQuery("(prefers-reduced-motion: reduce)");

  const show = useCallback(
    (next: number) => {
      const target = ((next % count) + count) % count;
      if (target === index) return;
      // With reduced motion the new photo simply replaces the old one.
      setPrevious(reduced ? null : index);
      setIndex(target);
    },
    [count, index, reduced],
  );
  const go = useCallback((d: number) => show(index + d), [index, show]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (full && !dialog.open) dialog.showModal();
    if (!full && dialog.open) dialog.close();
  }, [full]);

  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [full, go]);

  // Keep the current thumbnail in view, scrolling the strip only (never the page).
  useEffect(() => {
    const strip = stripRef.current;
    const item = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !item) return;
    const left = item.offsetLeft - strip.clientWidth / 2 + item.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: reduced ? "auto" : "smooth" });
  }, [index, reduced]);

  if (count === 0) return null;
  const current = images[index];
  const under = previous !== null && previous !== index ? images[previous] : null;
  const currentReady = !!loaded[current];

  const swipe = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      swipeRef.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: React.PointerEvent) => {
      const start = swipeRef.current;
      swipeRef.current = null;
      if (!start || count < 2) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.2) go(dx < 0 ? 1 : -1);
    },
    onPointerCancel: () => {
      swipeRef.current = null;
    },
  };

  const backdrop = (src: string) =>
    blurs[src] ? (
      <div
        aria-hidden
        className="absolute inset-[-8%] bg-cover bg-center opacity-55 blur-2xl"
        style={{ backgroundImage: `url(${blurs[src]})` }}
      />
    ) : null;

  const frame: ReactNode = (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label={`${name} photos`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        } else if (e.key === "Home") {
          e.preventDefault();
          show(0);
        } else if (e.key === "End") {
          e.preventDefault();
          show(count - 1);
        }
      }}
      {...swipe}
      className={`v2-product-frame relative aspect-[4/3] w-full ${bleed ? "max-h-[78svh]" : "max-h-[80svh]"} touch-pan-y select-none overflow-hidden bg-hull sm:aspect-[16/9]`}
    >
      {/* The outgoing photo stays put underneath; the incoming one fades in over it once loaded. */}
      {under ? (
        <div className="absolute inset-0 bg-hull">
          {backdrop(under)}
          <Image src={under} alt="" fill sizes={bleed ? "100vw" : "(max-width: 1320px) 100vw, 1224px"} className="object-contain" />
        </div>
      ) : null}
      <div
        key={current}
        onAnimationEnd={() => setPrevious(null)}
        className={`absolute inset-0 bg-hull ${!currentReady ? "opacity-0" : under ? "v2-product-fade" : ""}`}
      >
        {backdrop(current)}
        <Image
          src={current}
          alt={`${name}, photo ${index + 1} of ${count}`}
          fill
          priority={lead && index === 0}
          // Next 16's `priority` only adds the preload; the first photo is the page's largest paint.
          fetchPriority={lead && index === 0 ? "high" : undefined}
          sizes={bleed ? "100vw" : "(max-width: 1320px) 100vw, 1224px"}
          draggable={false}
          onLoad={() => setLoaded((l) => (l[current] ? l : { ...l, [current]: true }))}
          className="object-contain"
        />
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="v2-press absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-ink/65 text-snow backdrop-blur-md hover:bg-ink/85 hover:text-signal sm:left-4"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden><path d="M13 8H4M7.5 4.5 4 8l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="v2-press absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-ink/65 text-snow backdrop-blur-md hover:bg-ink/85 hover:text-signal sm:right-4"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        </>
      ) : null}

      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 sm:inset-x-4 sm:bottom-4">
        <span className="v2-tnum bg-ink/65 px-2.5 py-1.5 text-[0.875rem] text-snow backdrop-blur-md" aria-live="polite">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          onClick={() => setFull(true)}
          className="v2-press flex h-10 items-center gap-2 bg-ink/65 px-3 text-[0.875rem] text-snow backdrop-blur-md hover:bg-ink/85 hover:text-signal"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" />
          </svg>
          Full screen
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-w-0">
      {transitionName ? (
        <ViewTransition name={transitionName} share="v2-morph" default="none">
          {frame}
        </ViewTransition>
      ) : (
        frame
      )}

      {count > 1 ? (
        <ul ref={stripRef} className={`v2-product-strip mt-3 flex gap-2 overflow-x-auto pb-1 ${bleed ? "v2-wrap" : ""}`} aria-label="Choose a photo">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => show(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`relative block h-16 w-24 overflow-hidden bg-hull transition-opacity duration-300 sm:h-[4.5rem] sm:w-28 ${
                  i === index ? "opacity-100 outline outline-2 -outline-offset-2 outline-signal" : "opacity-55 hover:opacity-100"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="112px"
                  {...(blurs[src] ? { placeholder: "blur" as const, blurDataURL: blurs[src] } : {})}
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <dialog
        ref={dialogRef}
        onClose={() => setFull(false)}
        className="v2-product-dialog m-0 h-[100dvh] max-h-none w-screen max-w-none bg-ink/95 p-0 text-snow backdrop:bg-ink/90"
        aria-label={`${name} photos, full screen`}
      >
        {full ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="v2-tnum text-[0.9375rem] text-muted">
                {name}, {index + 1} / {count}
              </span>
              <button type="button" onClick={() => setFull(false)} className="h-11 px-3 text-[0.9375rem] text-snow hover:text-signal">
                Close
              </button>
            </div>
            <div className="relative flex-1 touch-pan-y select-none" {...swipe}>
              <Image
                key={current}
                src={current}
                alt={`${name}, photo ${index + 1} of ${count}`}
                fill
                sizes="100vw"
                draggable={false}
                className="v2-product-fade object-contain"
              />
            </div>
            {count > 1 ? (
              <div className="flex justify-center gap-3 py-4">
                <button type="button" onClick={() => go(-1)} className="v2-btn v2-btn-ghost !min-h-11">
                  Previous
                </button>
                <button type="button" onClick={() => go(1)} className="v2-btn v2-btn-ghost !min-h-11">
                  Next
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
