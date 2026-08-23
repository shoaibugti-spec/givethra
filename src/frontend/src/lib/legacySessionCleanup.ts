const CURRENT_KEYS = new Set(["auth_token", "user_email", "givethra_role", "givethra_guest_id"]);

function isLegacyKey(key: string): boolean {
  const normalized = key.toLowerCase();
  if (CURRENT_KEYS.has(key)) return false;
  return normalized.includes("supabase") || normalized.startsWith("sb-") || normalized.includes("sb-access-token") || normalized.includes("old_givethra");
}

export function clearLegacyBrowserState(): void {
  if (typeof window === "undefined") return;
  try {
    for (const storage of [window.localStorage, window.sessionStorage]) {
      const keys = Object.keys(storage);
      for (const key of keys) {
        if (isLegacyKey(key)) storage.removeItem(key);
      }
    }
  } catch {
    // Storage can be unavailable in privacy mode; authentication must still continue.
  }

  try {
    const cookies = document.cookie.split(";").map((part) => part.trim().split("=")[0]).filter(Boolean);
    for (const name of cookies) {
      if (isLegacyKey(name) || name.toLowerCase().includes("supabase")) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    }
  } catch {
    // HttpOnly or blocked cookies cannot be cleared by frontend JavaScript.
  }
}
