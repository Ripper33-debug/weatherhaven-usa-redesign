"use client";

import { useEffect, useRef } from "react";
import { useClientMediaQuery } from "@/hooks/useClientMediaQuery";

type Mode = "default" | "hover" | "target" | "click";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const finePointer = useClientMediaQuery("(pointer: fine)");
  const coarsePointer = useClientMediaQuery("(pointer: coarse)");
  const enabled = finePointer && !coarsePointer;
  const modeRef = useRef<Mode>("default");
  const mouseRef = useRef({ x: 0, y: 0 });
  const ringRefPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("wh-custom-cursor");

    const setMode = (mode: Mode) => {
      modeRef.current = mode;
      const dot = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) return;
      dot.classList.remove("wh-cursor-dot-hover", "wh-cursor-dot-target", "wh-cursor-dot-click");
      ring.classList.remove("wh-cursor-ring-hover", "wh-cursor-ring-target", "wh-cursor-ring-click");
      if (mode === "hover") {
        dot.classList.add("wh-cursor-dot-hover");
        ring.classList.add("wh-cursor-ring-hover");
      } else if (mode === "target") {
        dot.classList.add("wh-cursor-dot-target");
        ring.classList.add("wh-cursor-ring-target");
      } else if (mode === "click") {
        dot.classList.add("wh-cursor-dot-click");
        ring.classList.add("wh-cursor-ring-click");
      }
    };

    const pulseRipple = (x: number, y: number) => {
      const ripple = rippleRef.current;
      if (!ripple) return;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.remove("wh-cursor-ripple-active");
      void ripple.offsetWidth;
      ripple.classList.add("wh-cursor-ripple-active");
    };

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      const t = e.target as HTMLElement | null;
      const isTarget = Boolean(
        t?.closest("[data-shelter-3d], [data-shelter-visual], .wh-shelter-visual"),
      );
      document.body.classList.toggle("wh-cursor-target-mode", isTarget);
      if (isTarget) {
        setMode("target");
      } else if (t?.closest("a, button, [role='button'], .btn-magnetic, input, select, textarea, label")) {
        setMode("hover");
      } else {
        setMode("default");
      }
    };

    const onDown = (e: MouseEvent) => {
      setMode("click");
      pulseRipple(e.clientX, e.clientY);
      window.setTimeout(() => {
        const t = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
        if (t?.closest("[data-shelter-3d], [data-shelter-visual], .wh-shelter-visual")) setMode("target");
        else if (t?.closest("a, button, [role='button'], .btn-magnetic")) setMode("hover");
        else setMode("default");
      }, 150);
    };

    const tick = () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      const { x, y } = mouseRef.current;
      if (dot) {
        dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      ringRefPos.current.x += (x - ringRefPos.current.x) * 0.18;
      ringRefPos.current.y += (y - ringRefPos.current.y) * 0.18;
      if (ring) {
        ring.style.transform = `translate(${ringRefPos.current.x}px, ${ringRefPos.current.y}px) translate(-50%, -50%)`;
      }
      const reticle = reticleRef.current;
      if (reticle) {
        reticle.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    ringRefPos.current = { ...mouseRef.current };
    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });

    return () => {
      document.body.classList.remove("wh-custom-cursor", "wh-cursor-target-mode");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div ref={dotRef} className="wh-cursor-dot" aria-hidden />
      <div ref={ringRef} className="wh-cursor-ring" aria-hidden />
      <div ref={rippleRef} className="wh-cursor-ripple" aria-hidden />
      <div ref={reticleRef} className="wh-cursor-reticle" aria-hidden>
        <span className="wh-cursor-reticle-h" />
        <span className="wh-cursor-reticle-v" />
        <span className="wh-cursor-reticle-dot" />
      </div>
    </>
  );
}
