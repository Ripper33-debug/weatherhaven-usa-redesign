// Sentry loads after the page has finished loading (idle time), so its SDK doesn't compete with
// the first paint on phones. With no DSN configured it never loads at all. Error boundaries load
// it immediately when they have something to report (src/lib/sentry-client.ts).
import { loadSentry, loadedSentry } from "@/lib/sentry-client";

if (typeof window !== "undefined") {
  const load = () => void loadSentry();
  const whenIdle = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(load, { timeout: 4000 });
    else setTimeout(load, 1500);
  };
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
}

export const onRouterTransitionStart = (
  ...args: Parameters<typeof import("@sentry/nextjs")["captureRouterTransitionStart"]>
) => loadedSentry()?.captureRouterTransitionStart(...args);
