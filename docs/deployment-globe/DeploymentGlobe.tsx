'use client';
// Always-on Weatherhaven deployment globe for any page section.
//
//   import DeploymentGlobe from '@/components/DeploymentGlobe';
//   <DeploymentGlobe />                  // 3D globe
//   <DeploymentGlobe view="map" />       // flat map
//
// - Shows a still of the globe straight away; the live globe loads by itself as the section nears the screen and fades in.
// - While nobody is using it, it plays the highlights loop; it hands over the moment someone clicks or drags.
// - The page scrolls normally over it (Ctrl/⌘ + scroll zooms; on phones, swipe sideways to spin).
// - It stops drawing while scrolled out of view, and forwards its events (pin opened, contact clicks...) to Google Analytics.
// Expects the globe package in /public/deployment-globe (change `base` if it lives elsewhere).
import { useEffect, useRef, useState, type CSSProperties } from 'react';

type Props = {
  view?: 'globe' | 'map';
  /** Section height. Default fits a 16:9-ish band on desktop and a single screen on phones. */
  height?: CSSProperties['height'];
  /** Set false to start still and only move when someone uses it. */
  ambient?: boolean;
  base?: string;
  className?: string;
  title?: string;
};

export default function DeploymentGlobe({
  view = 'globe',
  height = 'clamp(560px, 56vw, 760px)',
  ambient = true,
  base = '/deployment-globe',
  className,
  title = 'Where Weatherhaven has deployed',
}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  // Load the live globe when the section is within ~1000px of the screen (immediately if it starts on screen).
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) { setMounted(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setMounted(true); io.disconnect(); }
    }, { rootMargin: '1000px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Messages from the globe: "ready" fades it in; everything else goes to Google Analytics (gtag or GTM).
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      const d = e.data;
      if (!d || d.source !== 'weatherhaven-globe') return;
      if (d.event === 'globe_ready') { setReady(true); return; }
      const { source, event, ...params } = d;
      const w = window as unknown as { gtag?: (...a: unknown[]) => void; dataLayer?: unknown[] };
      if (typeof w.gtag === 'function') w.gtag('event', event, params);
      else (w.dataLayer = w.dataLayer || []).push({ event, ...params });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  // Never wait on a stuck load: show the frame after 10 s regardless.
  useEffect(() => {
    if (!mounted || ready) return;
    const t = setTimeout(() => setReady(true), 10000);
    return () => clearTimeout(t);
  }, [mounted, ready]);

  const qs = ['embed', view === 'map' ? 'view=map' : '', ambient ? '' : 'ambient=0'].filter(Boolean).join('&');
  const fill: CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0, transition: 'opacity .9s ease' };

  return (
    <div ref={box} className={className} style={{ position: 'relative', width: '100%', height, background: '#03080F', overflow: 'hidden' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${base}/assets/embed-poster.jpg`} alt="" aria-hidden="true"
        style={{ ...fill, objectFit: 'cover', objectPosition: '58% 50%', opacity: ready ? 0 : 1 }} />
      {mounted && (
        <iframe ref={frame} src={`${base}/index.html?${qs}`} title={title} allow="fullscreen"
          style={{ ...fill, opacity: ready ? 1 : 0 }} />
      )}
    </div>
  );
}
