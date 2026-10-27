"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

export function SofProblemSection() {
  const { ref, rootClass } = useScrollReveal({ variant: "fade-up", threshold: 0.15 });

  return (
    <section
      ref={ref}
      className={`sof-section border-t border-[rgba(255,255,255,0.08)] bg-[#080a0c] ${rootClass}`}
    >
      <p className="wh-marketing-eyebrow mb-12">The problem</p>
      <div className="grid max-w-[1400px] gap-16 lg:grid-cols-2 lg:gap-20">
        <blockquote className="wh-marketing-display text-[28px] font-normal italic leading-snug text-white lg:text-[36px]">
          SOF teams need fast, deployable infrastructure that works in the world&apos;s most remote, harsh, and
          ecologically sensitive locations — and works the first time.
        </blockquote>
        <div>
          {[
            {
              t: "Speed",
              b: "Weatherhaven softwall shelters deploy in hours. Our HQSS system is the most advanced tactical shelter ever developed for speed, modularity, and climate protection.",
            },
            {
              t: "Environment",
              b: "From -50°C Arctic tundra to desert heat — Weatherhaven systems are field-proven on all seven continents.",
            },
            {
              t: "Redeployability",
              b: "Mission complete, Weatherhaven demobilizes, refurbishes, and stores your systems — ready for the next operation.",
            },
          ].map((row) => (
            <div key={row.t} className="mb-8 border-l-2 border-[#4d9fff] pl-5 last:mb-0 md:mb-10">
              <p className="text-sm font-medium text-white">{row.t}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#8a9099]">{row.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
