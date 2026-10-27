import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSofLoginPrefs, readSofLoginPrefs, writeSofLoginPrefs } from "./sof-login-prefs";

describe("sof-login-prefs", () => {
  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
    clearSofLoginPrefs();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores email only when rememberEmail is set", () => {
    writeSofLoginPrefs({
      email: "operator@example.mil",
      pin: "1234",
      rememberEmail: true,
      rememberCode: false,
    });
    expect(readSofLoginPrefs()).toEqual({
      email: "operator@example.mil",
      rememberEmail: true,
      rememberCode: false,
      pin: undefined,
    });
  });

  it("stores pin when rememberCode is set", () => {
    writeSofLoginPrefs({
      email: "operator@example.mil",
      pin: "5678",
      rememberEmail: true,
      rememberCode: true,
    });
    expect(readSofLoginPrefs()?.pin).toBe("5678");
  });

  it("clears storage when both remember flags are off", () => {
    writeSofLoginPrefs({
      email: "operator@example.mil",
      pin: "5678",
      rememberEmail: true,
      rememberCode: true,
    });
    writeSofLoginPrefs({
      email: "operator@example.mil",
      pin: "5678",
      rememberEmail: false,
      rememberCode: false,
    });
    expect(readSofLoginPrefs()).toBeNull();
  });
});
