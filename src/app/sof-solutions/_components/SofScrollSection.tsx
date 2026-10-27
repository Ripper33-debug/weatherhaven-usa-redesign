"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

export function SofScrollSection({
  children,
  className = "",
  stagger = false,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: boolean;
}) {
  const { ref, rootClass } = useScrollReveal({
    variant: stagger ? "slide-up-stagger" : "fade-up",
    staggerMs: 80,
    threshold: 0.15,
  });

  return (
    <section ref={ref} className={`sof-section bg-[#080a0c] ${rootClass} ${className}`}>
      {children}
    </section>
  );
}
