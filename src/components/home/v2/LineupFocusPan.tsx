"use client";

import { useEffect, useRef } from "react";

/**
 * Keyboard support for the pinned lineup (HomeLineup): the line pans with the page's scroll, so a
 * link tabbed to off to the side can't be scrolled into view by the browser. This scrolls the page
 * to the point where that system sits in the middle of the screen. In the swipe-row fallback the
 * browser does it on its own, so this does nothing there. It also starts loading the pictures
 * before the section arrives.
 */
export function LineupFocusPan() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest("section");
    const strip = section?.querySelector<HTMLElement>(".v2-home-lineup-strip");
    if (!section || !strip) return;
    const onFocus = (e: FocusEvent) => {
      const item = (e.target as HTMLElement | null)?.closest<HTMLElement>(".v2-home-lineup-item");
      if (!item || getComputedStyle(strip).animationName === "none") return;
      const vw = window.innerWidth;
      const panMax = strip.offsetWidth - vw;
      const pinned = section.offsetHeight - window.innerHeight;
      if (panMax <= 0 || pinned <= 0) return;
      const want = Math.min(panMax, Math.max(0, item.offsetLeft + item.offsetWidth / 2 - vw / 2));
      const top = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + (want / panMax) * pinned, behavior: "instant" });
    };
    section.addEventListener("focusin", onFocus);
    // The pictures off to the side would otherwise wait for the browser's lazy loading and appear
    // mid-pan; once the section is a screen away, fetch them all (about 150 KB together).
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        for (const img of section.querySelectorAll("img")) img.loading = "eager";
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(section);
    return () => {
      section.removeEventListener("focusin", onFocus);
      io.disconnect();
    };
  }, []);

  return <span ref={ref} hidden />;
}
