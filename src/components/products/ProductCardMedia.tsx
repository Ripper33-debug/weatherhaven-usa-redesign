"use client";

import { useState } from "react";
import { ProductImageSlot } from "@/components/products/ProductImageSlot";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";
import { useInView } from "@/hooks/useInView";
import { getProductCardVideo } from "@/lib/product-card-videos";

type Props = {
  slug: string;
  preferredSrc?: string;
  brightness?: number;
  sizes?: string;
};

export function ProductCardMedia({ slug, preferredSrc, brightness = 0.72, sizes }: Props) {
  const video = getProductCardVideo(slug);
  const { ref, inView } = useInView<HTMLDivElement>("120px");
  const [hovered, setHovered] = useState(false);
  const touchDevice = useClientMediaQuery("(hover: none)", false);
  const showVideo = Boolean(video && inView && (hovered || touchDevice));

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <ProductImageSlot
        slug={slug}
        preferredSrc={preferredSrc}
        brightness={brightness}
        sizes={sizes}
        className={showVideo ? "opacity-0 transition-opacity duration-500" : "transition-opacity duration-500"}
      />
      {video && inView ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={video.label}
          className={`pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover object-center transition-opacity duration-500 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
          style={{ filter: `brightness(${brightness})` }}
        >
          <source src={video.src} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
