"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

type Props = {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
  staggerMs?: number;
};

export function SectionReveal({ children, className = "", stagger = true, staggerMs = 80 }: Props) {
  const { ref, rootClass } = useScrollReveal({
    variant: stagger ? "fade-up-stagger" : "fade-up",
    staggerMs,
    threshold: 0.15,
  });

  return (
    <div ref={ref} className={`wh-section-reveal wh-scroll-reveal-fade ${rootClass} ${className}`}>
      {children}
    </div>
  );
}
