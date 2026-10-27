"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getProductImage } from "@/lib/product-images";
import { getProductCardVideo } from "@/lib/product-card-videos";
import { ProductImageSlot } from "@/components/products/ProductImageSlot";

const AUTO_ADVANCE_MS = 5000;

type GalleryItem =
  | { kind: "image"; src: string }
  | { kind: "video"; src: string; label: string; poster?: string };

type Props = {
  slug: string;
  images: string[];
  brightness?: number;
  showCaption?: boolean;
  priority?: boolean;
  sizes?: string;
};

export function ProductGallery({
  slug,
  images,
  brightness = 0.95,
  showCaption = false,
  priority = false,
  sizes = "(max-width: 1024px) 100vw, 60vw",
}: Props) {
  const meta = getProductImage(slug);
  const alt = meta?.alt ?? "Weatherhaven shelter system";
  const video = getProductCardVideo(slug);

  const items = useMemo((): GalleryItem[] => {
    const list: GalleryItem[] = [];
    if (video) {
      list.push({
        kind: "video",
        src: video.src,
        label: video.label,
        poster: images[0],
      });
    }
    for (const src of images) {
      list.push({ kind: "image", src });
    }
    return list;
  }, [video, images]);

  if (items.length === 0) {
    return (
      <ProductImageSlot
        slug={slug}
        brightness={brightness}
        showCaption={showCaption}
        priority={priority}
        sizes={sizes}
      />
    );
  }

  return (
    <ProductGalleryInner
      items={items}
      alt={alt}
      brightness={brightness}
      showCaption={showCaption}
      priority={priority}
      sizes={sizes}
    />
  );
}

function ProductGalleryLightbox({
  alt,
  items,
  index,
  onClose,
  onStep,
}: {
  alt: string;
  items: Extract<GalleryItem, { kind: "image" }>[];
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const active = items[index];
  const multi = items.length > 1;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        onStep(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        onStep(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onStep]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!active) return null;

  const arrowClass =
    "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-[#080a0c]/95 text-2xl leading-none text-white transition hover:border-[#4d9fff]";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#080a0c]/95 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Full screen product photo"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-sm text-white transition hover:border-[#4d9fff]"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Close full screen view"
      >
        Close
      </button>

      <div
        className="relative h-[min(85vh,900px)] w-full max-w-6xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Image
          src={active.src}
          alt={alt}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />

        {multi ? (
          <>
            <button
              type="button"
              className={`${arrowClass} left-2 sm:left-4`}
              onClick={() => onStep(-1)}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${arrowClass} right-2 sm:right-4`}
              onClick={() => onStep(1)}
              aria-label="Next photo"
            >
              ›
            </button>
            <p className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-mono text-xs text-white/80">
              {index + 1} / {items.length}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ProductGalleryInner({
  items,
  alt,
  brightness,
  showCaption,
  priority,
  sizes,
}: {
  items: GalleryItem[];
  alt: string;
  brightness: number;
  showCaption: boolean;
  priority: boolean;
  sizes: string;
}) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set());
  const available = useMemo(
    () =>
      items.filter((item) => {
        if (item.kind === "video") return true;
        return !failed.has(item.src);
      }),
    [items, failed],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const imageItems = useMemo(
    () => available.filter((item): item is Extract<GalleryItem, { kind: "image" }> => item.kind === "image"),
    [available],
  );

  const clampedIndex =
    available.length === 0 ? 0 : Math.min(activeIndex, available.length - 1);
  const activeItem = available[clampedIndex];
  const multi = available.length > 1;

  const lightboxImageIndex = useMemo(() => {
    if (activeItem?.kind !== "image") return 0;
    const idx = imageItems.findIndex((item) => item.src === activeItem.src);
    return idx >= 0 ? idx : 0;
  }, [activeItem, imageItems]);

  const markFailed = (src: string) => {
    setFailed((prev) => new Set(prev).add(src));
  };

  const step = useCallback(
    (delta: number) => {
      if (available.length <= 1) return;
      setActiveIndex((idx) => (idx + delta + available.length) % available.length);
    },
    [available.length],
  );

  const stepLightbox = useCallback(
    (delta: number) => {
      if (imageItems.length <= 1) return;
      const nextSrc = imageItems[(lightboxImageIndex + delta + imageItems.length) % imageItems.length]?.src;
      if (!nextSrc) return;
      const galleryIndex = available.findIndex((item) => item.kind === "image" && item.src === nextSrc);
      if (galleryIndex >= 0) setActiveIndex(galleryIndex);
    },
    [available, imageItems, lightboxImageIndex],
  );

  useEffect(() => {
    if (!multi || paused || activeItem?.kind === "video") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const id = window.setInterval(() => {
      setActiveIndex((idx) => (idx + 1) % available.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(id);
  }, [multi, paused, available.length, activeItem?.kind]);

  useEffect(() => {
    if (!multi || lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [multi, step, lightboxOpen]);

  if (!activeItem) {
    return null;
  }

  const arrowClass =
    "absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/40 bg-[#080a0c]/95 text-2xl leading-none text-white shadow-[0_4px_24px_rgba(0,0,0,0.55)] backdrop-blur-sm transition hover:border-[#4d9fff] hover:bg-[#0d0f12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d9fff]";

  return (
    <>
      <div
        className="absolute inset-0 flex flex-col"
        tabIndex={multi ? 0 : undefined}
        role={multi ? "group" : undefined}
        aria-label={multi ? "Product photo gallery" : undefined}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setPaused(false);
          }
        }}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(145deg, #121820 0%, #080a0c 50%, #0d0f12 100%)",
            }}
            aria-hidden
          />
          {activeItem.kind === "video" ? (
            <video
              key={activeItem.src}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={activeItem.poster}
              aria-label={activeItem.label}
              className="absolute inset-0 h-full w-full object-cover object-center"
              style={{ filter: `brightness(${brightness})` }}
            >
              <source src={activeItem.src} type="video/mp4" />
            </video>
          ) : (
            <button
              type="button"
              className="absolute inset-0 z-[1] cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              aria-label="Open full screen photo"
            >
              <Image
                key={activeItem.src}
                src={activeItem.src}
                alt={alt}
                fill
                priority={priority}
                loading={priority ? undefined : "lazy"}
                sizes={sizes}
                className="object-cover object-center transition-opacity duration-500"
                style={{ filter: `brightness(${brightness})` }}
                onError={() => markFailed(activeItem.src)}
              />
            </button>
          )}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(8,10,12,0.72) 0%, rgba(8,10,12,0.12) 50%, transparent 100%)",
            }}
            aria-hidden
          />

          {activeItem.kind === "image" ? (
            <button
              type="button"
              className="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-[#080a0c]/85 px-2.5 py-1.5 text-[11px] font-medium text-white/85 backdrop-blur-sm transition hover:border-[#4d9fff]"
              onClick={() => setLightboxOpen(true)}
              aria-label="Open full screen photo"
            >
              Expand
            </button>
          ) : null}

          {multi ? (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                className={`${arrowClass} left-3 sm:left-4`}
                aria-label="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className={`${arrowClass} right-3 sm:right-4`}
                aria-label="Next photo"
              >
                ›
              </button>
              <button
                type="button"
                aria-label="Previous photo"
                className="absolute inset-y-0 left-0 z-10 w-[30%] cursor-w-resize bg-transparent"
                onClick={() => step(-1)}
              />
              <button
                type="button"
                aria-label="Next photo"
                className="absolute inset-y-0 right-0 z-10 w-[30%] cursor-e-resize bg-transparent"
                onClick={() => step(1)}
              />
              <p
                className="pointer-events-none absolute bottom-3 right-4 z-20 rounded-full border border-white/15 bg-[#080a0c]/85 px-2.5 py-1 font-mono text-[11px] tracking-wide text-white/80 backdrop-blur-sm"
                aria-live="polite"
              >
                {clampedIndex + 1} / {available.length}
              </p>
            </>
          ) : null}
        </div>

        {multi ? (
          <div className="relative z-[2] flex shrink-0 gap-1.5 overflow-x-auto border-t border-white/[0.08] bg-[#080a0c] p-2.5 [scrollbar-width:thin]">
            {available.map((item, index) => {
              const selected = index === clampedIndex;
              if (item.kind === "video") {
                const thumbSrc = item.poster;
                return (
                  <button
                    key={`video-${item.src}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden border-2 transition ${
                      selected ? "border-[#4d9fff]" : "border-white/20 opacity-75 hover:opacity-100"
                    }`}
                    aria-label="View cinematic video"
                    aria-current={selected ? "true" : undefined}
                  >
                    {thumbSrc ? (
                      <Image src={thumbSrc} alt="" fill className="object-cover" sizes="96px" />
                    ) : (
                      <div className="absolute inset-0 bg-[#121820]" />
                    )}
                    <span
                      className="absolute inset-0 flex items-center justify-center bg-black/35 text-lg text-white"
                      aria-hidden
                    >
                      ▶
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.src}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden border-2 transition ${
                    selected ? "border-[#4d9fff]" : "border-white/20 opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`View photo ${index + 1} of ${available.length}`}
                  aria-current={selected ? "true" : undefined}
                >
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                    onError={() => markFailed(item.src)}
                  />
                </button>
              );
            })}
          </div>
        ) : null}

        {showCaption && multi ? (
          <p className="pointer-events-none absolute bottom-[4.75rem] left-4 z-[2] text-[10px] tracking-wide text-white/50 sm:bottom-[5.25rem]">
            Tap sides, thumbnails, or Expand for full screen
          </p>
        ) : showCaption ? (
          <p className="absolute bottom-3 left-4 z-[2] text-[10px] tracking-wide text-white/40">
            Product imagery · Weatherhaven
          </p>
        ) : null}
      </div>

      {lightboxOpen && imageItems.length > 0 ? (
        <ProductGalleryLightbox
          alt={alt}
          items={imageItems}
          index={lightboxImageIndex}
          onClose={() => setLightboxOpen(false)}
          onStep={stepLightbox}
        />
      ) : null}
    </>
  );
}
