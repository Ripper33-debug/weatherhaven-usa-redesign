"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Weatherhaven's deployment globe (public/deployment-globe, a self-contained page) as a section
 * of a site page. From the globe package's own component (docs/deployment-globe):
 * - a still of the globe shows straight away; the live globe loads as the section nears the
 *   screen and fades in over it;
 * - with `ambient`, it plays its highlights loop until someone uses it;
 * - the page scrolls normally over it (Ctrl/⌘ + scroll zooms; on phones, swipe sideways to spin);
 * - it stops drawing off screen, and forwards its events to Google Analytics when the site has it.
 */
export function DeploymentGlobe({
  view = "globe",
  height = "clamp(560px, 56vw, 760px)",
  ambient = true,
  embed = true,
  className,
  title = "Where Weatherhaven has deployed",
}: {
  view?: "globe" | "map";
  /** Section height. The default fits a 16:9-ish band on desktop and one screen on phones. */
  height?: CSSProperties["height"];
  /** False starts still and only moves when someone uses it. */
  ambient?: boolean;
  /** False shows the full page (side panel, list and filters) instead of the page-section version. */
  embed?: boolean;
  className?: string;
  title?: string;
}) {
  const base = "/deployment-globe";
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // Load the live globe when the section is within about 1000 px of the screen.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin: "1000px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Messages from the globe: "ready" fades it in; everything else goes to Google Analytics.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      const d = e.data as { source?: string; event?: string } | null;
      if (!d || d.source !== "weatherhaven-globe") return;
      if (d.event === "globe_ready") {
        setReady(true);
        return;
      }
      const params: Record<string, unknown> = { ...d };
      delete params.source;
      delete params.event;
      const event = d.event;
      const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };
      if (typeof w.gtag === "function") w.gtag("event", event, params);
      else if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...params });
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Never wait on a stuck load: show the frame after 10 s regardless.
  useEffect(() => {
    if (!mounted || ready) return;
    const t = window.setTimeout(() => setReady(true), 10_000);
    return () => window.clearTimeout(t);
  }, [mounted, ready]);

  const qs = [embed ? "embed" : "", view === "map" ? "view=map" : "", ambient ? "" : "ambient=0"].filter(Boolean).join("&");
  const fill: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, transition: "opacity .9s ease" };

  return (
    <div ref={box} className={className} style={{ position: "relative", width: "100%", height, background: "#03080F", overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a fixed-size still behind the iframe, not a content image */}
      <img
        src={`${base}/assets/${view === "map" ? "embed-poster-map.jpg" : "embed-poster.jpg"}`}
        alt=""
        aria-hidden="true"
        // Embedded further down a page, the still waits its turn instead of being preloaded with the
        // first screen; on the full-screen map it is the first screen.
        loading={embed ? "lazy" : undefined}
        // The flat map fits the width on phones, so its still does too; the globe's fills the box.
        className={view === "map" ? "object-contain md:object-cover" : "object-cover"}
        style={{ ...fill, objectPosition: view === "map" ? "50% 50%" : "58% 50%", opacity: ready ? 0 : 1 }}
      />
      {mounted ? (
        <iframe
          ref={frame}
          src={`${base}/index.html${qs ? `?${qs}` : ""}`}
          title={title}
          allow="fullscreen"
          style={{ ...fill, opacity: ready ? 1 : 0 }}
        />
      ) : null}
    </div>
  );
}
