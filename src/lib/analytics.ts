import { getBrowserClient as getClient, maybeSignedIn } from "@/lib/supabase/lazy-client";

// Activity tracking only applies to signed-in users, so the Supabase client loads on demand and
// not at all for anonymous visitors.
let sessionId: string | null = null;
let sessionStartTime = Date.now();
let currentPage = "";
let pageStartTime = Date.now();
let lastPageViewId: string | null = null;
let clickTrackerTeardown: (() => void) | null = null;

async function updateLastPageTime() {
  if (!lastPageViewId) return;
  const supabase = await getClient();
  const timeOnPage = Math.floor((Date.now() - pageStartTime) / 1000);
  await supabase.from("page_views").update({ time_on_page_seconds: timeOnPage }).eq("id", lastPageViewId);
}

export async function startSession() {
  if (sessionId) return;
  if (!maybeSignedIn()) return;

  const supabase = await getClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const entryPage = typeof window !== "undefined" ? window.location.pathname : null;
  const referrer = typeof document !== "undefined" ? document.referrer || null : null;
  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 240) : null;

  const { data } = await supabase
    .from("user_sessions")
    .insert({
      user_id: user.id,
      email: user.email,
      started_at: new Date().toISOString(),
      entry_page: entryPage,
      referrer,
      user_agent: userAgent,
    })
    .select()
    .single();

  if (data) {
    sessionId = data.id;
    sessionStartTime = Date.now();
  }
}

export async function endSession() {
  if (!sessionId) return;

  await updateLastPageTime();

  const supabase = await getClient();
  const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
  await supabase
    .from("user_sessions")
    .update({ ended_at: new Date().toISOString(), duration_seconds: duration })
    .eq("id", sessionId);

  sessionId = null;
  lastPageViewId = null;
  currentPage = "";
  teardownClickTracking();
}

function teardownClickTracking() {
  if (clickTrackerTeardown) {
    clickTrackerTeardown();
    clickTrackerTeardown = null;
  }
}

export async function initClickTracking() {
  teardownClickTracking();
  if (!sessionId) return;

  const supabase = await getClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !sessionId) return;

  const handler = (e: MouseEvent) => {
    void (async () => {
      if (!sessionId) return;

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      if (!currentUser) return;

      const target = e.target as HTMLElement;
      if (!target) return;

      const clickable =
        (target.closest("a, button, [role='button'], input, select, textarea, label") as HTMLElement | null) ??
        target;

      const elementText = (
        clickable.textContent ||
        clickable.getAttribute("aria-label") ||
        clickable.getAttribute("placeholder") ||
        ""
      )
        .trim()
        .slice(0, 100);

      const hrefAttr = clickable.getAttribute("href");
      const href =
        hrefAttr ??
        (clickable instanceof HTMLAnchorElement && clickable.href ? clickable.href : null);

      const className =
        typeof clickable.className === "string"
          ? clickable.className
          : (clickable.getAttribute("class") ?? "");

      await supabase.from("click_events").insert({
        user_id: currentUser.id,
        email: currentUser.email,
        session_id: sessionId,
        page: window.location.pathname,
        element_type: clickable.tagName.toLowerCase(),
        element_text: elementText || "(no text)",
        element_id: clickable.id || null,
        element_class: className.slice(0, 100) || null,
        href: href || null,
        x_position: Math.round(e.clientX),
        y_position: Math.round(e.clientY),
        clicked_at: new Date().toISOString(),
      });
    })();
  };

  document.addEventListener("click", handler, true);
  clickTrackerTeardown = () => document.removeEventListener("click", handler, true);
}

export async function trackPageView(page: string, pageTitle: string) {
  if (!sessionId) return;
  const supabase = await getClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !sessionId) return;

  if (currentPage && lastPageViewId) {
    await updateLastPageTime();
  }

  const { data } = await supabase
    .from("page_views")
    .insert({
      user_id: user.id,
      email: user.email,
      page,
      page_title: pageTitle,
      session_id: sessionId,
      visited_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (data) {
    lastPageViewId = data.id;
  }

  currentPage = page;
  pageStartTime = Date.now();
}

export async function trackEvent(eventType: string, eventLabel: string) {
  if (!sessionId) return;
  const supabase = await getClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !sessionId) return;

  await supabase.from("user_events").insert({
    user_id: user.id,
    email: user.email,
    event_type: eventType,
    event_label: eventLabel,
    page: currentPage,
    session_id: sessionId,
    occurred_at: new Date().toISOString(),
  });
}
