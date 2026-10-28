type BrowserClient = ReturnType<typeof import("./client")["createClient"]>;

let clientPromise: Promise<BrowserClient> | null = null;

/** The browser Supabase client, loaded on demand: it's a large bundle most public visitors never need. */
export function getBrowserClient(): Promise<BrowserClient> {
  clientPromise ??= import("./client").then((m) => m.createClient());
  return clientPromise;
}

/** Supabase keeps the session in sb-…-auth-token cookies (readable from the page); without one nobody is signed in. */
export function maybeSignedIn(): boolean {
  return typeof document !== "undefined" && document.cookie.includes("-auth-token");
}
