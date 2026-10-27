"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { trackEvent } from "@/lib/analytics";
import { SHELTER_ZONES, type ShelterZone, type ShelterZoneId } from "@/lib/shelterZones";

type TooltipState = { x: number; y: number; zone: ShelterZone } | null;

export function InteractiveShelterVisual({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<ShelterZoneId | null>(null);
  const [active, setActive] = useState<ShelterZone | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [interacted, setInteracted] = useState(false);
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    if (interacted) return;
    const id = window.setInterval(() => {
      setPulseIndex((i) => (i + 1) % SHELTER_ZONES.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [interacted]);

  const stopIdle = useCallback(() => setInteracted(true), []);

  const onZoneEnter = (zone: ShelterZone, e: React.MouseEvent) => {
    stopIdle();
    setHovered(zone.id);
    setTooltip({ x: e.clientX, y: e.clientY, zone });
  };

  const onZoneMove = (zone: ShelterZone, e: React.MouseEvent) => {
    setTooltip({ x: e.clientX, y: e.clientY, zone });
  };

  const onZoneLeave = () => {
    setHovered(null);
    setTooltip(null);
  };

  const onZoneClick = (zone: ShelterZone) => {
    stopIdle();
    void trackEvent("click", `Shelter zone — ${zone.name}`);
    setActive(zone);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    window.setTimeout(() => setActive(null), 280);
  };

  const zoneFill = (id: ShelterZoneId) => {
    if (hovered === id) return "rgba(200,169,110,0.6)";
    if (!interacted && SHELTER_ZONES[pulseIndex]?.id === id) return "rgba(200,169,110,0.18)";
    return undefined;
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <svg
        viewBox="0 0 440 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full cursor-pointer"
        aria-label="Interactive shelter systems diagram"
      >
        <defs>
          <linearGradient id="hroof" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="rgb(63 63 70)" stopOpacity="0.9" />
            <stop offset="1" stopColor="rgb(24 24 27)" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="hwall" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="rgb(39 39 42)" stopOpacity="0.85" />
            <stop offset="1" stopColor="rgb(9 9 11)" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <g id="zone-roof" onMouseEnter={(e) => onZoneEnter(SHELTER_ZONES[1]!, e)} onMouseMove={(e) => onZoneMove(SHELTER_ZONES[1]!, e)} onMouseLeave={onZoneLeave} onClick={() => onZoneClick(SHELTER_ZONES[1]!)}>
          <path
            d="M24 198 L220 32 L416 198 Z"
            stroke="currentColor"
            strokeWidth="1.1"
            fill={zoneFill("roof") ?? "url(#hroof)"}
            className="transition-[fill] duration-200"
            opacity="0.95"
          />
        </g>

        <g id="zone-structure" onMouseEnter={(e) => onZoneEnter(SHELTER_ZONES[0]!, e)} onMouseMove={(e) => onZoneMove(SHELTER_ZONES[0]!, e)} onMouseLeave={onZoneLeave} onClick={() => onZoneClick(SHELTER_ZONES[0]!)}>
          <path
            d="M72 198 V118 L220 48 L368 118 V198"
            stroke="currentColor"
            strokeWidth="0.9"
            fill={zoneFill("walls") ?? "url(#hwall)"}
            className="transition-[fill] duration-200"
          />
        </g>

        <g id="zone-interior" onMouseEnter={(e) => onZoneEnter(SHELTER_ZONES[5]!, e)} onMouseMove={(e) => onZoneMove(SHELTER_ZONES[5]!, e)} onMouseLeave={onZoneLeave} onClick={() => onZoneClick(SHELTER_ZONES[5]!)}>
          <rect
            x="168"
            y="118"
            width="104"
            height="80"
            stroke="currentColor"
            strokeWidth="0.75"
            fill={zoneFill("interior") ?? "rgb(24 24 27 / 0.55)"}
            className="transition-[fill] duration-200"
          />
        </g>

        <line x1="220" y1="32" x2="220" y2="118" stroke="currentColor" strokeWidth="0.5" opacity="0.35" pointerEvents="none" />

        <g id="zone-entrance" onMouseEnter={(e) => onZoneEnter(SHELTER_ZONES[4]!, e)} onMouseMove={(e) => onZoneMove(SHELTER_ZONES[4]!, e)} onMouseLeave={onZoneLeave} onClick={() => onZoneClick(SHELTER_ZONES[4]!)}>
          <rect
            x="198"
            y="158"
            width="44"
            height="40"
            stroke="currentColor"
            strokeWidth="0.6"
            fill={zoneFill("entrance") ?? "rgb(24 24 27 / 0.35)"}
            className="transition-[fill] duration-200"
          />
        </g>

        <g id="zone-power" onMouseEnter={(e) => onZoneEnter(SHELTER_ZONES[3]!, e)} onMouseMove={(e) => onZoneMove(SHELTER_ZONES[3]!, e)} onMouseLeave={onZoneLeave} onClick={() => onZoneClick(SHELTER_ZONES[3]!)}>
          <rect
            x="110"
            y="168"
            width="48"
            height="30"
            stroke="currentColor"
            strokeWidth="0.5"
            fill={zoneFill("power") ?? "transparent"}
            className="transition-[fill] duration-200"
            opacity="0.9"
          />
          <rect
            x="282"
            y="168"
            width="48"
            height="30"
            stroke="currentColor"
            strokeWidth="0.5"
            fill={zoneFill("power") ?? "transparent"}
            className="transition-[fill] duration-200"
            opacity="0.9"
          />
        </g>

        <g id="zone-ecu" onMouseEnter={(e) => onZoneEnter(SHELTER_ZONES[2]!, e)} onMouseMove={(e) => onZoneMove(SHELTER_ZONES[2]!, e)} onMouseLeave={onZoneLeave} onClick={() => onZoneClick(SHELTER_ZONES[2]!)}>
          <rect
            x="88"
            y="142"
            width="36"
            height="28"
            stroke="currentColor"
            strokeWidth="0.5"
            fill={zoneFill("ecu") ?? "rgb(39 39 42 / 0.7)"}
            className="transition-[fill] duration-200"
          />
          <rect
            x="316"
            y="142"
            width="36"
            height="28"
            stroke="currentColor"
            strokeWidth="0.5"
            fill={zoneFill("ecu") ?? "rgb(39 39 42 / 0.7)"}
            className="transition-[fill] duration-200"
          />
        </g>

        <line x1="48" y1="198" x2="392" y2="198" stroke="currentColor" strokeWidth="1.5" opacity="0.25" pointerEvents="none" />
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-[60] max-w-[220px] border border-white/10 bg-[#0d0f12] px-3 py-2 shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#4d9fff]">{tooltip.zone.name}</p>
          <p className="mt-1 text-[11px] leading-snug text-[#8a9099]">{tooltip.zone.tooltipSpec}</p>
        </div>
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-[55] flex w-full max-w-full flex-col border-l border-white/[0.08] bg-[#0d0f12] transition-transform duration-300 ease-out sm:max-w-[360px] ${
          panelOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!panelOpen}
      >
        {active && (
          <>
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <p className="wh-label">{active.name}</p>
              <button
                type="button"
                onClick={closePanel}
                className="p-2 text-[#8a9099] hover:text-white"
                aria-label="Close zone detail"
              >
                <IconX size={20} stroke={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <h3 className="font-display text-xl font-semibold text-white">{active.title}</h3>
              <ul className="mt-6 space-y-3 text-sm leading-relaxed text-[#8a9099]">
                {active.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 bg-[#4d9fff]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={active.learnMoreHref}
                className="mt-8 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4d9fff] transition-opacity hover:opacity-70"
              >
                Learn More →
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
