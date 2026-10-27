/** Routes that require a signed-in admin operator (middleware-enforced). */
export const AUTH_REQUIRED_PREFIXES = ["/admin", "/internal", "/programs"] as const;

export function pathRequiresAuth(pathname: string): boolean {
  return AUTH_REQUIRED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Legacy platform login — admin operators only; SOF members use /sof-solutions/login. */
export const AUTH_GATE_PATHS = ["/login", "/accept-invite"] as const;

export function isAuthGatePage(pathname: string): boolean {
  return (AUTH_GATE_PATHS as readonly string[]).includes(pathname);
}

export {
  SOF_AUTH_GATE_PATHS,
  SOF_LOGIN_PATH,
  SOF_REQUEST_ACCESS_PATH,
  SOF_SECURE_HOME,
  isSofAuthGatePage,
  pathRequiresSofAuth,
} from "@/lib/sof-auth";
