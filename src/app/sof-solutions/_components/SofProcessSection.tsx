"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

export function SofProcessSection() {
  const { ref, rootClass } = useScrollReveal({ variant: "slide-up-stagger", staggerMs: 80, threshold: 0.15 });

  return (
    <section ref={ref} className={`sof-section bg-[#080a0c] ${rootClass}`}>
      <p className="wh-marketing-eyebrow">Our process</p>
      <h2 className="wh-marketing-display mt-6 max-w-5xl text-[32px] leading-[1.08] text-white lg:text-[44px]">
        Mission threads drive layout — not a fixed catalog.
      </h2>
      <div className="mt-16 grid grid-cols-1 gap-0 lg:mt-20 lg:grid-cols-3 lg:gap-10">
        {[
          {
            n: "01",
            t: "Needs Assessment",
            b: "Tell us your requirements and we work with you to deliver a redeployable shelter capability that suits your operation.",
          },
          {
            n: "02",
            t: "Design & Engineering",
            b: "Our team has over 1,000 years of combined experience designing shelter and camp solutions for every climate and terrain.",
          },
          {
            n: "03",
            t: "Deliver & Support",
            b: "Weatherhaven handles installation, demobilization, refurbishment, and storage — ready for next deployment.",
          },
        ].map((step) => (
          <div key={step.n} data-reveal-child className="border-t border-[rgba(255,255,255,0.1)] pt-6 lg:pt-8">
            <p className="text-[11px] font-medium tracking-[0.15em] text-[#4d9fff]">{step.n}</p>
            <p className="mt-4 text-lg font-medium text-white">{step.t}</p>
            <p className="mt-3 text-sm leading-relaxed text-[#8a9099]">{step.b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
