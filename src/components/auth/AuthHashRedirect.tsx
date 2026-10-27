"use client";

import { useEffect } from "react";

/**
 * Supabase password recovery links land with #access_token=... on Site URL (often /).
 * Forward to /auth/reset-password so the client can set a new password.
 */
export function AuthHashRedirect() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !hash.includes("access_token")) return;
    if (window.location.pathname.startsWith("/auth/reset-password")) return;
    window.location.replace(`/auth/reset-password${hash}${window.location.search}`);
  }, []);

  return null;
}
