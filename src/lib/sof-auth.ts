/** Marker stored on access_requests.program for SOF intake. */
export const SOF_PROGRAM_MARKER = "special-forces";

export const SOF_LOGIN_PATH = "/sof-solutions/login";
export const SOF_REQUEST_ACCESS_PATH = "/sof-solutions/request-access";
export const SOF_SECURE_HOME = "/sof-solutions/secure";

export const SOF_SECURE_PREFIXES = ["/sof-solutions/secure"] as const;

export const SOF_AUTH_GATE_PATHS = [SOF_LOGIN_PATH, SOF_REQUEST_ACCESS_PATH] as const;

export function isSofAccessRequest(program?: string | null): boolean {
  if (!program?.trim()) return false;
  const p = program.trim().toLowerCase();
  return (
    p === SOF_PROGRAM_MARKER ||
    p === "special-forces" ||
    p.includes("special forces") ||
    p.startsWith("sof")
  );
}

export function pathRequiresSofAuth(pathname: string): boolean {
  return SOF_SECURE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isSofAuthGatePage(pathname: string): boolean {
  return (SOF_AUTH_GATE_PATHS as readonly string[]).includes(pathname);
}

export function isValidSofPinInput(value: string): boolean {
  return /^\d{4}$/.test(value.trim());
}
