/** Short-lived contact form prefill from mission builder / camp planner. */

export const CONTACT_PREFILL_STORAGE_KEY = "wh-contact-prefill";

export type ContactPrefillPayload = {
  inquiry_type?: string;
  program?: string;
  subject?: string;
  message?: string;
  system?: string;
};

export function storeContactPrefill(payload: ContactPrefillPayload): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CONTACT_PREFILL_STORAGE_KEY, JSON.stringify(payload));
}

export function readContactPrefill(): ContactPrefillPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CONTACT_PREFILL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ContactPrefillPayload;
  } catch {
    return null;
  }
}

export function clearContactPrefill(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(CONTACT_PREFILL_STORAGE_KEY);
}
