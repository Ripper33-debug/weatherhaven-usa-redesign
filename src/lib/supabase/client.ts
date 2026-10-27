import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. When env vars are missing (local preview, a Vercel preview without
 * secrets) fall back to an unreachable placeholder so public pages render instead of crashing;
 * auth and analytics calls then fail quietly.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "missing-anon-key",
  );
}
