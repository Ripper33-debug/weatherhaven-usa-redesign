"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export type ScrollRevealVariant = "fade-up" | "fade-up-stagger" | "slide-up-stagger" | "slide-left-stagger";

type Options = {
  variant?: ScrollRevealVariant;
  /** Stagger delay in ms between children (stagger variants only). */
  staggerMs?: number;
  /** Intersection threshold 0–1 */
  threshold?: number;
  /** Trigger once */
  once?: boolean;
  /** For hero: reveal immediately on mount without waiting for intersection */
  immediate?: boolean;
};

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  variant = "fade-up",
  staggerMs = 100,
  threshold = 0.15,
  once = true,
  immediate = false,
}: Options = {}) {
  const ref = useRef<T>(null);
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduceMotion || immediate) {
      el.classList.add("wh-revealed");
      el.querySelectorAll("[data-reveal-child]").forEach((child) => child.classList.add("wh-revealed"));
      return;
    }

    const reveal = () => {
      el.classList.add("wh-revealed");
      const children = el.querySelectorAll<HTMLElement>("[data-reveal-child]");
      children.forEach((child, i) => {
        if (variant.includes("stagger")) {
          child.style.transitionDelay = `${i * staggerMs}ms`;
        }
        child.classList.add("wh-revealed");
      });
    };

    if (immediate) {
      requestAnimationFrame(reveal);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        reveal();
        if (once) obs.disconnect();
      },
      { threshold },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [reduceMotion, immediate, once, threshold, staggerMs, variant]);

  const rootClass =
    variant === "fade-up" || variant === "fade-up-stagger"
      ? "wh-scroll-reveal-fade"
      : variant === "slide-up-stagger"
        ? "wh-scroll-reveal-slide-up"
        : "wh-scroll-reveal-slide-left";

  return { ref, rootClass, reduceMotion };
}
