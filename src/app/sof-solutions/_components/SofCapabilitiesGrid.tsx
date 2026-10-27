"use client";

import {
  IconBolt,
  IconBed,
  IconLayoutDashboard,
  IconPackages,
  IconPlane,
  IconTemperature,
  IconTool,
  IconStethoscope,
} from "@tabler/icons-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const capabilityTiles = [
  { title: "Rapid Deployment", desc: "Shelter systems staged and fielded in hours, not days.", Icon: IconBolt },
  { title: "Mobility", desc: "Air, sea, and ground transportable configurations.", Icon: IconPlane },
  { title: "Climate Control", desc: "ECU systems rated for Arctic to desert extremes.", Icon: IconTemperature },
  { title: "Command & Control", desc: "C2-ready layouts with power, data, and blackout capability.", Icon: IconLayoutDashboard },
  { title: "Medical Support", desc: "Field-deployable medical shelter configurations.", Icon: IconStethoscope },
  { title: "Maintenance", desc: "Heavy maintenance shelter systems for aviation and vehicle support.", Icon: IconTool },
  { title: "Accommodation", desc: "Berthing and life support for extended operations.", Icon: IconBed },
  { title: "Logistics", desc: "Integrated sustainment and camp infrastructure sequencing.", Icon: IconPackages },
];

export function SofCapabilitiesGrid() {
  const { ref, rootClass } = useScrollReveal({ variant: "slide-up-stagger", staggerMs: 80, threshold: 0.15 });

  return (
    <section ref={ref} className={`sof-section bg-[#080a0c] ${rootClass}`} data-analytics-section="capabilities">
      <p className="wh-marketing-label">Capabilities</p>
      <h2 className="wh-marketing-display mt-6 max-w-4xl text-[32px] leading-[1.08] text-white lg:text-[44px]">
        Built for the full mission spectrum.
      </h2>
      <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4 lg:gap-12">
        {capabilityTiles.map(({ title, desc, Icon }) => (
          <div key={title} data-reveal-child>
            <Icon className="text-white" stroke={1.25} size={32} aria-hidden />
            <p className="mt-4 text-sm font-medium text-white">{title}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-[#8a9099]">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
