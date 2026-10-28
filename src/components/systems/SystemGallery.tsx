"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, ViewTransition } from "react";

/** Product gallery: large frame, thumbnail strip, full-screen view on demand. */
export function SystemGallery({ images, name, transitionName }: { images: string[]; name: string; transitionName?: string }) {
  const [index, setIndex] = useState(0);
  const [full, setFull] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const count = images.length;
  const go = useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);

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

  if (count === 0) return null;
  const current = images[index];

  return (
    <div className="min-w-0">
      <ViewTransition name={transitionName} share="v2-morph">
        <div className="relative aspect-[4/3] overflow-hidden bg-hull">
          <Image
            key={current}
            src={current}
            alt={`${name}, photo ${index + 1} of ${count}`}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/80 to-transparent px-4 pb-3 pt-10">
            <span className="v2-tnum text-[0.85rem] text-snow/85">
              {index + 1} / {count}
            </span>
            <div className="flex gap-2">
              {count > 1 ? (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="flex h-10 w-10 items-center justify-center bg-ink/70 text-snow hover:text-signal">
                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M13 8H4M7.5 4.5 4 8l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Next photo" className="flex h-10 w-10 items-center justify-center bg-ink/70 text-snow hover:text-signal">
                    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </button>
                </>
              ) : null}
              <button type="button" onClick={() => setFull(true)} className="flex h-10 items-center bg-ink/70 px-3 text-[0.85rem] text-snow hover:text-signal">
                View full screen
              </button>
            </div>
          </div>
        </div>
      </ViewTransition>
      {count > 1 ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Photos">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={`relative block h-16 w-24 overflow-hidden bg-hull transition-opacity ${
                  i === index ? "opacity-100 outline outline-2 -outline-offset-2 outline-signal" : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <dialog
        ref={dialogRef}
        onClose={() => setFull(false)}
        className="m-0 h-[100dvh] max-h-none w-screen max-w-none bg-ink/95 p-0 text-snow backdrop:bg-ink/90"
        aria-label={`${name} photos`}
      >
        {full ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="v2-tnum text-[0.9rem] text-muted">
                {name}, {index + 1} / {count}
              </span>
              <button type="button" onClick={() => setFull(false)} className="h-10 px-3 text-[0.9rem] text-snow hover:text-signal">
                Close
              </button>
            </div>
            <div className="relative flex-1">
              <Image src={current} alt={`${name}, photo ${index + 1} of ${count}`} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex justify-center gap-3 py-4">
              <button type="button" onClick={() => go(-1)} className="v2-btn v2-btn-ghost !min-h-10">Previous</button>
              <button type="button" onClick={() => go(1)} className="v2-btn v2-btn-ghost !min-h-10">Next</button>
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
