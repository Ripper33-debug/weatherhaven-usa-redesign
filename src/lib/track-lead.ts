"use client";

import type { LeadEventType } from "@/lib/lead-events";
import { fetchWithCsrf } from "@/lib/csrf-client";

const SESSION_KEY = "wh-lead-session";

function getLeadSessionKey(): string {
  if (typeof window === "undefined") return "server";
  try {
    let key = localStorage.getItem(SESSION_KEY);
    if (!key) {
      key = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, key);
    }
    return key;
  } catch {
    return "anonymous";
  }
}

/** Fire-and-forget marketing lead intent (works for anonymous visitors). */
export function trackLead(
  eventType: LeadEventType,
  eventLabel: string,
  payload?: Record<string, unknown>,
) {
  void fetchWithCsrf("/api/lead-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type: eventType,
      event_label: eventLabel,
      page: typeof window !== "undefined" ? window.location.pathname : undefined,
      payload,
      session_key: getLeadSessionKey(),
    }),
  }).catch(() => {
    /* non-blocking */
  });
}
