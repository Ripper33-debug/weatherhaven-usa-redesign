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

/** A picture of the camp from the mission builder, shown on the contact page after hand-off. */
export const CAMP_SNAPSHOT_STORAGE_KEY = "wh-camp-snapshot";

export type CampSnapshot = { image: string; link: string };

export function storeCampSnapshot(snap: CampSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CAMP_SNAPSHOT_STORAGE_KEY, JSON.stringify(snap));
  } catch {
    // Storage full or blocked: the hand-off still works without the picture.
  }
}

/** Reads the snapshot (call clearCampSnapshot once shown). Only JPEG data URLs and links to the
 * mission builder on this site are accepted. */
export function readCampSnapshot(): CampSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CAMP_SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const snap = JSON.parse(raw) as Partial<CampSnapshot>;
    if (typeof snap.image !== "string" || !snap.image.startsWith("data:image/jpeg;base64,")) return null;
    if (typeof snap.link !== "string" || !snap.link.startsWith(`${window.location.origin}/mission-solution-builder`)) return null;
    return { image: snap.image, link: snap.link };
  } catch {
    return null;
  }
}

export function clearCampSnapshot(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CAMP_SNAPSHOT_STORAGE_KEY);
  } catch {
    // ignore
  }
}
