import * as Sentry from "@sentry/nextjs";

function sentryEnabled(): boolean {
  return Boolean(process.env.SENTRY_DSN?.trim());
}

/** Report API / server failures to Sentry when SENTRY_DSN is configured. */
export function captureRouteError(
  route: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  console.error(`[${route}]`, error);
  if (!sentryEnabled()) return;

  Sentry.withScope((scope) => {
    scope.setTag("route", route);
    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        scope.setExtra(key, value);
      }
    }
    Sentry.captureException(error);
  });
}

/** Non-fatal operational warning (email skipped, audit insert failed, etc.). */
export function captureRouteWarning(
  route: string,
  message: string,
  extra?: Record<string, unknown>,
): void {
  console.warn(`[${route}] ${message}`, extra ?? "");
  if (!sentryEnabled()) return;

  Sentry.withScope((scope) => {
    scope.setTag("route", route);
    scope.setLevel("warning");
    if (extra) {
      for (const [key, value] of Object.entries(extra)) {
        scope.setExtra(key, value);
      }
    }
    Sentry.captureMessage(message);
  });
}
