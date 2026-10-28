// Sentry loads after the page has finished loading (idle time), so its ~130 KB SDK no longer
// competes with the first paint on phones. With no DSN configured it never loads at all.
// Trade-off: an error thrown in the first second or two of a visit isn't reported.
type SentryModule = typeof import("@sentry/nextjs");

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || process.env.SENTRY_DSN?.trim();
let sentry: SentryModule | null = null;

if (dsn && typeof window !== "undefined") {
  const load = () => {
    void import("@sentry/nextjs").then((S) => {
      S.init({
        dsn,
        enabled: true,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
      });
      sentry = S;
    });
  };
  const whenIdle = () => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(load, { timeout: 4000 });
    else setTimeout(load, 1500);
  };
  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle, { once: true });
}

export const onRouterTransitionStart = (...args: Parameters<SentryModule["captureRouterTransitionStart"]>) =>
  sentry?.captureRouterTransitionStart(...args);
