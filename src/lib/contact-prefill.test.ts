import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearContactPrefill,
  CONTACT_PREFILL_STORAGE_KEY,
  readContactPrefill,
  storeContactPrefill,
} from "./contact-prefill";

describe("contact-prefill", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    const sessionStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    };
    vi.stubGlobal("window", { sessionStorage });
    vi.stubGlobal("sessionStorage", sessionStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores and reads prefill payload", () => {
    storeContactPrefill({ subject: "Camp package", message: "Zones and ROM" });
    expect(readContactPrefill()?.subject).toBe("Camp package");
    expect(sessionStorage.getItem(CONTACT_PREFILL_STORAGE_KEY)).toBeTruthy();
    clearContactPrefill();
    expect(readContactPrefill()).toBeNull();
  });
});
