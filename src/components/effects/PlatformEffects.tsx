"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initDomEnhancements } from "@/lib/effects/dom-enhancements";
import { isMarketingPage } from "@/lib/marketing-pages";

const MUTATION_DEBOUNCE_MS = 250;

export function PlatformEffects() {
  const pathname = usePathname();
  const marketing = isMarketingPage(pathname);

  useEffect(() => {
    if (marketing) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("reset-effects") === "1") {
      sessionStorage.removeItem("wh-session-init-v3");
      sessionStorage.removeItem("wh-session-init-v2");
      sessionStorage.removeItem("wh-hero-typed");
      sessionStorage.removeItem("wh-session-init");
    }

    const cleanup = initDomEnhancements();
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new MutationObserver(() => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        initDomEnhancements();
      }, MUTATION_DEBOUNCE_MS);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      cleanup?.();
      observer.disconnect();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [pathname, marketing]);

  return null;
}
