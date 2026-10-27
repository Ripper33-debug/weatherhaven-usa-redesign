const STORAGE_KEY = "wh-sof-login-prefs";

export type SofLoginPrefs = {
  email: string;
  rememberEmail: boolean;
  rememberCode: boolean;
  pin?: string;
};

function canUseStorage(): boolean {
  return typeof localStorage !== "undefined";
}

export function readSofLoginPrefs(): SofLoginPrefs | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SofLoginPrefs;
    if (!parsed || typeof parsed.email !== "string") return null;
    return {
      email: parsed.email,
      rememberEmail: Boolean(parsed.rememberEmail),
      rememberCode: Boolean(parsed.rememberCode),
      pin: parsed.rememberCode && typeof parsed.pin === "string" ? parsed.pin.slice(0, 4) : undefined,
    };
  } catch {
    return null;
  }
}

export function writeSofLoginPrefs(prefs: {
  email: string;
  pin: string;
  rememberEmail: boolean;
  rememberCode: boolean;
}): void {
  if (!canUseStorage()) return;
  try {
    if (!prefs.rememberEmail && !prefs.rememberCode) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload: SofLoginPrefs = {
      email: prefs.rememberEmail ? prefs.email.trim() : "",
      rememberEmail: prefs.rememberEmail,
      rememberCode: prefs.rememberCode,
      pin: prefs.rememberCode && isValidStoredPin(prefs.pin) ? prefs.pin : undefined,
    };
    if (!payload.rememberEmail) {
      payload.email = "";
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* private browsing / blocked storage */
  }
}

function isValidStoredPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function clearSofLoginPrefs(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
