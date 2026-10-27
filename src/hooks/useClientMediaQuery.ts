"use client";

import { useSyncExternalStore } from "react";

function subscribeMediaQuery(query: string, onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** Subscribe to a media query on the client with a stable SSR fallback. */
export function useClientMediaQuery(query: string, serverFallback = false) {
  return useSyncExternalStore(
    (onChange) => subscribeMediaQuery(query, onChange),
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}
