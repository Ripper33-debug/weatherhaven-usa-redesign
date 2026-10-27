"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { WEATHERHAVEN_BRAND } from "@/lib/brand";
import { prefersReducedMotion } from "@/lib/effects/media";

const LOGO_HEIGHT = 40;
const LOGO_WIDTH = Math.round((LOGO_HEIGHT * WEATHERHAVEN_BRAND.logoWidth) / WEATHERHAVEN_BRAND.logoHeight);
const MIN_DURATION_MS = 1400;
const MAX_WAIT_MS = 3200;
const FADE_OUT_MS = 450;

/** Bump when we need everyone to see the intro again after a major release. */
const SESSION_KEY = "wh-session-init-v3";

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function InitialLoadScreen() {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset-effects") === "1") {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem("wh-session-init-v2");
      sessionStorage.removeItem("wh-hero-typed");
      sessionStorage.removeItem("wh-session-init");
    }

    if (prefersReducedMotion() || sessionStorage.getItem(SESSION_KEY) === "1") return;

    let cancelled = false;
    let loaded = document.readyState === "complete";
    const start = performance.now();

    const onLoad = () => {
      loaded = true;
    };
    window.addEventListener("load", onLoad);

    const finish = () => {
      if (cancelled) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      setProgress(100);
      setExiting(true);
      window.setTimeout(() => {
        if (!cancelled) setVisible(false);
      }, FADE_OUT_MS);
    };

    let rafId = 0;

    const startIntro = () => {
      if (cancelled) return;
      setVisible(true);
      rafId = requestAnimationFrame(tick);
    };

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      const timeRatio = Math.min(1, elapsed / MIN_DURATION_MS);
      const eased = easeOutCubic(timeRatio);
      const loadCap = loaded ? 1 : 0.9;
      setProgress(Math.min(eased * 100 * loadCap, 99.5));

      const ready = elapsed >= MIN_DURATION_MS && (loaded || elapsed >= MAX_WAIT_MS);
      if (ready) {
        finish();
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    requestAnimationFrame(startIntro);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  useEffect(() => {
    if (!visible) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`wh-init-load fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#080a0c] ${exiting ? "wh-init-load-out" : ""}`}
      aria-hidden
    >
      <div
        className="relative"
        style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT, maxWidth: "min(88vw, 100%)" }}
      >
        <Image
          src={WEATHERHAVEN_BRAND.logoSrc}
          alt=""
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          priority
          className="h-auto w-full opacity-[0.18] brightness-[1.6]"
          style={{ width: LOGO_WIDTH, height: "auto", maxWidth: "100%" }}
        />
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <Image
            src={WEATHERHAVEN_BRAND.logoSrc}
            alt=""
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            priority
            className="h-auto max-w-none"
            style={{ width: LOGO_WIDTH, height: "auto" }}
          />
        </div>
      </div>
    </div>
  );
}
