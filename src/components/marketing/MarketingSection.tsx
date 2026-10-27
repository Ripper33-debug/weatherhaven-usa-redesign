"use client";

import type { ElementType, ReactNode } from "react";
import { useScrollReveal, type ScrollRevealVariant } from "@/hooks/useScrollReveal";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  variant?: ScrollRevealVariant;
  staggerMs?: number;
};

/** Scroll-reveal wrapper for Shield marketing sections */
export function MarketingSection({
  children,
  className = "",
  as: Tag = "section",
  variant = "fade-up-stagger",
  staggerMs = 110,
}: Props) {
  const { ref, rootClass } = useScrollReveal({ variant, staggerMs, threshold: 0.12 });

  return (
    <Tag ref={ref} className={`wh-section-reveal ${rootClass} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
