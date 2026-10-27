"use client";

import type { PlaceholderVideoSpec } from "@/lib/placeholder-media";
import { useInView } from "@/hooks/useInView";

type Props = PlaceholderVideoSpec & {
  className?: string;
  overlay?: boolean;
};

export function PlaceholderVideo({ src, poster, label, className = "", overlay = false }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>("200px");

  return (
    <div ref={ref} className={`wh-film-grain relative overflow-hidden bg-[#0d0f12] ${className}`}>
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${inView ? "opacity-0" : "opacity-100"}`}
          loading="lazy"
        />
      ) : null}
      {inView ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={poster}
          aria-label={label}
          className="wh-video-ken-burns absolute inset-0 h-full w-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
      {overlay && (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,10,12,0.15) 0%, rgba(8,10,12,0.55) 55%, rgba(8,10,12,0.85) 100%)",
          }}
        />
      )}
    </div>
  );
}

type BandProps = PlaceholderVideoSpec & {
  aspectClass?: string;
};

export function PlaceholderVideoBand({ aspectClass = "aspect-[21/9] min-h-[200px]", ...spec }: BandProps) {
  return (
    <section className="bg-[#080a0c]" aria-label={spec.label}>
      <PlaceholderVideo {...spec} className={aspectClass} overlay />
    </section>
  );
}
