const LEGACY_STORAGE_MARKERS = [
  "sb-",
  "supabase",
  "supabase.auth.token",
  "sb-access-token",
] as const;

const LEGACY_RECOVERY_GUARD_KEY = "__givethra_legacy_auth_recovery_at";
const LEGACY_RECOVERY_GUARD_WINDOW_MS = 15_000;

export function isLegacyAuthKey(key: string) {
  const normalized = key.toLowerCase();
  return LEGACY_STORAGE_MARKERS.some(marker => normalized.includes(marker));
}

function clearMatchingStorage(storage: Storage | undefined) {
  if (!storage) return;

  try {
    const matchingKeys: string[] = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && isLegacyAuthKey(key)) matchingKeys.push(key);
    }
    matchingKeys.forEach(key => storage.removeItem(key));
  } catch {
    // Private browsing and strict storage policies can make Web Storage unavailable.
  }
}

function clearMatchingCookies() {
  if (typeof document === "undefined") return;

  const cookieNames = document.cookie
    .split(";")
    .map(cookie => cookie.split("=")[0]?.trim() ?? "")
    .filter(Boolean)
    .filter(isLegacyAuthKey);

  const domains = [undefined, typeof window !== "undefined" ? window.location.hostname : undefined]
    .filter((value, index, values): value is string | undefined => values.indexOf(value) === index);

  cookieNames.forEach(name => {
    domains.forEach(domain => {
      const domainPart = domain ? `; Domain=${domain}` : "";
      document.cookie = `${encodeURIComponent(name)}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/${domainPart}`;
    });
  });
}

/**
 * Removes only legacy Supabase browser artifacts. Current Cloudflare/Manus
 * session storage and cookies are intentionally left untouched.
 */
export function clearLegacySupabaseBrowserData() {
  if (typeof window === "undefined") return;
  clearMatchingStorage(window.localStorage);
  clearMatchingStorage(window.sessionStorage);
  clearMatchingCookies();
}

function errorText(error: unknown) {
  if (error instanceof Error) return `${error.name} ${error.message}`.toLowerCase();
  try {
    return JSON.stringify(error).toLowerCase();
  } catch {
    return String(error).toLowerCase();
  }
}

export function isLegacyAuthError(error: unknown) {
  const text = errorText(error);
  return [
    "supabase",
    "sb-access-token",
    "sb-refresh-token",
    "invalid refresh token",
    "refresh token not found",
    "legacy session",
    "legacy auth",
  ].some(marker => text.includes(marker));
}

/**
 * Clears stale legacy state and performs at most one automatic reload in a
 * short browser window. This prevents an old session error from becoming an
 * infinite reload loop while still recovering transparently for legacy users.
 */
export function recoverFromLegacyAuthError(error: unknown) {
  if (typeof window === "undefined" || !isLegacyAuthError(error)) return false;

  let lastRecoveryAt = 0;
  try {
    lastRecoveryAt = Number(window.sessionStorage.getItem(LEGACY_RECOVERY_GUARD_KEY) ?? 0);
  } catch {
    // Continue without the guard if sessionStorage is unavailable.
  }

  const now = Date.now();
  if (lastRecoveryAt && now - lastRecoveryAt < LEGACY_RECOVERY_GUARD_WINDOW_MS) return false;

  try {
    window.sessionStorage.setItem(LEGACY_RECOVERY_GUARD_KEY, String(now));
  } catch {
    // Reload is still useful when storage is blocked.
  }

  clearLegacySupabaseBrowserData();
  window.location.reload();
  return true;
}

export function clearLegacyAuthRecoveryGuard() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(LEGACY_RECOVERY_GUARD_KEY);
  } catch {
    // Ignore storage policy errors.
  }
}
