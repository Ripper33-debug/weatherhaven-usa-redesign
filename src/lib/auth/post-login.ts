import { pathRequiresAuth } from "@/lib/auth-routes";

/** Shared post-login redirect (admin / platform login form). */
export function resolvePostLoginPath(
  redirectTo: string,
  options: { isAdmin?: boolean },
): string {
  if (redirectTo !== "/") {
    if (pathRequiresAuth(redirectTo) && !options.isAdmin) {
      return "/";
    }
    return redirectTo;
  }
  if (options.isAdmin) {
    return "/admin";
  }
  return "/";
}

export function sanitizeRedirectTo(search: string): string {
  const redirectTo = new URLSearchParams(search).get("redirectTo") || "/";
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/";
  }
  return redirectTo;
}
