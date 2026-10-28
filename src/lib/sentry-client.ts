// Browser Sentry, loaded on demand: after the page goes idle (instrumentation-client.ts) or
// straight away when an error boundary has something to report. Nothing loads without a DSN.
type SentryModule = typeof import("@sentry/nextjs");

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || process.env.SENTRY_DSN?.trim();
let loading: Promise<SentryModule | null> | null = null;
let loaded: SentryModule | null = null;

export function loadSentry(): Promise<SentryModule | null> {
  if (!dsn || typeof window === "undefined") return Promise.resolve(null);
  loading ??= import("@sentry/nextjs")
    .then((S) => {
      S.init({
        dsn,
        enabled: true,
        tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 0,
        environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: 0,
      });
      loaded = S;
      return S;
    })
    .catch(() => {
      // A failed chunk load (offline, blocked) shouldn't surface as an unhandled rejection.
      loading = null;
      return null;
    });
  return loading;
}

/** The SDK if it has already loaded, for synchronous hooks such as router transitions. */
export const loadedSentry = () => loaded;

/** Reports an error, loading Sentry first if needed. */
export function reportError(error: unknown) {
  void loadSentry().then((S) => S?.captureException(error));
}
