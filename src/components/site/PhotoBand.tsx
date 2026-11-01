import Image from "next/image";
import type { ReactNode } from "react";
import { blurProps } from "@/lib/image-blur";

/**
 * A full-bleed photograph between sections, drifting slightly slower than the page (.v2-parallax,
 * scroll-driven CSS, off for reduced motion). Optional content sits over the darkened lower edge;
 * the caption names what the photo shows.
 */
export function PhotoBand({
  src,
  alt,
  caption,
  children,
  position = "50% 50%",
  height = "tall",
  fadeTo = "ink",
}: {
  src: string;
  alt: string;
  caption?: string;
  children?: ReactNode;
  /** CSS object-position for the crop. */
  position?: string;
  height?: "tall" | "medium";
  /** The colour the photo fades into at its lower edge (the next section's background). */
  fadeTo?: "ink" | "hull";
}) {
  const h = height === "tall" ? "h-[62svh] min-h-[380px] sm:h-[72svh]" : "h-[44svh] min-h-[300px]";
  const fade = fadeTo === "hull" ? "from-hull via-hull/35" : "from-ink via-ink/35";
  return (
    <figure className="relative isolate m-0">
      <div className={`v2-parallax relative ${h} overflow-hidden bg-hull`}>
        <Image src={src} alt={alt} fill sizes="100vw" className="v2-photo object-cover" style={{ objectPosition: position }} {...blurProps(src)} />
      </div>
      <div aria-hidden className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${fade} to-transparent`} />
      {children ? <div className="absolute inset-x-0 bottom-0">{children}</div> : null}
      {caption ? (
        // With content over the photo, phones put the caption under the photo so the two don't collide.
        <figcaption
          className={`v2-wrap text-right text-[0.8125rem] ${
            children
              ? "relative block pt-2 text-muted sm:absolute sm:inset-x-0 sm:bottom-3 sm:pt-0 sm:text-snow/70"
              : "absolute inset-x-0 bottom-3 text-snow/70"
          }`}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
