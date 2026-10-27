const isProduction = process.env.NODE_ENV === "production";

export type SecureCookieOptions = {
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  maxAge?: number;
  expires?: Date;
  domain?: string;
};

/** Secure defaults for app-set cookies (httpOnly, secure in prod, SameSite=Lax). */
export function secureCookieOptions(overrides: SecureCookieOptions = {}): SecureCookieOptions {
  return {
    path: "/",
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    ...overrides,
  };
}

/** Merge Supabase SSR cookie options with secure defaults. */
export function mergeSupabaseCookieOptions(options: Record<string, unknown> | undefined): SecureCookieOptions {
  const rawSameSite = options?.sameSite;
  const sameSite =
    rawSameSite === "strict" || rawSameSite === "none" || rawSameSite === "lax" ? rawSameSite : "lax";

  return secureCookieOptions({
    path: typeof options?.path === "string" ? options.path : "/",
    httpOnly: typeof options?.httpOnly === "boolean" ? options.httpOnly : true,
    secure: isProduction
      ? typeof options?.secure === "boolean"
        ? options.secure
        : true
      : typeof options?.secure === "boolean"
        ? options.secure
        : false,
    sameSite,
    maxAge: typeof options?.maxAge === "number" ? options.maxAge : undefined,
    domain: typeof options?.domain === "string" ? options.domain : undefined,
  });
}
