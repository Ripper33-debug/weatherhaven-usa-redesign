import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCampSnapshot,
  clearContactPrefill,
  CONTACT_PREFILL_STORAGE_KEY,
  readCampSnapshot,
  readContactPrefill,
  storeCampSnapshot,
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

describe("camp snapshot hand-off", () => {
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
    vi.stubGlobal("window", { sessionStorage, location: { origin: "https://weatherhavenusa.com" } });
    vi.stubGlobal("sessionStorage", sessionStorage);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const link = "https://weatherhavenusa.com/mission-solution-builder?mission=command";

  it("keeps a picture of the camp and the plan link until it has been shown", () => {
    storeCampSnapshot({ image: "data:image/jpeg;base64,AAAA", link });
    expect(readCampSnapshot()).toEqual({ image: "data:image/jpeg;base64,AAAA", link });
    clearCampSnapshot();
    expect(readCampSnapshot()).toBeNull();
  });

  it("ignores anything that isn't a JPEG data URL or a link to this site's builder", () => {
    storeCampSnapshot({ image: "https://evil.example/x.jpg", link });
    expect(readCampSnapshot()).toBeNull();
    storeCampSnapshot({ image: "data:image/jpeg;base64,AAAA", link: "https://evil.example/mission-solution-builder" });
    expect(readCampSnapshot()).toBeNull();
  });
});
