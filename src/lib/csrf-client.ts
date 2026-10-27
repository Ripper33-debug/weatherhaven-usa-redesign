"use client";

import { CSRF_HEADER_NAME } from "@/lib/csrf-constants";

let csrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;

export async function ensureCsrfToken(): Promise<string | null> {
  if (csrfToken) return csrfToken;
  if (typeof window === "undefined") return null;

  if (!csrfPromise) {
    csrfPromise = fetch("/api/csrf", { credentials: "same-origin", cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { token?: string };
        csrfToken = data.token ?? null;
        return csrfToken;
      })
      .catch(() => null)
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
}

/** POST/PATCH/PUT/DELETE fetch with CSRF header. */
export async function fetchWithCsrf(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (method !== "GET" && method !== "HEAD") {
    const token = await ensureCsrfToken();
    if (token) headers.set(CSRF_HEADER_NAME, token);
  }

  return fetch(input, { ...init, headers, credentials: init.credentials ?? "same-origin" });
}
