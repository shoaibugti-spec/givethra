const CURRENT_KEYS = new Set(["auth_token", "user_email", "givethra_role", "givethra_guest_id", "givethra:community-posts:v1"]);
const CURRENT_SERVICE_WORKER_CACHE = "givethra-v3";

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

  void clearLegacyCaches();
}

async function clearLegacyCaches(): Promise<void> {
  try {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => {
            const normalized = name.toLowerCase();
            return name !== CURRENT_SERVICE_WORKER_CACHE &&
              (normalized.includes("supabase") || normalized.includes("old_givethra") || normalized.startsWith("givethra-") || normalized.includes("workbox"));
          })
          .map((name) => caches.delete(name))
      );
    }
  } catch {
    // Cache Storage may be unavailable in private browsing; continue normally.
  }

  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations
          .filter((registration) => {
            const scriptUrl = registration.active?.scriptURL || registration.waiting?.scriptURL || registration.installing?.scriptURL;
            if (!scriptUrl) return false;
            try {
              const parsed = new URL(scriptUrl);
              return parsed.origin === window.location.origin && parsed.pathname !== "/sw.js";
            } catch {
              return false;
            }
          })
          .map((registration) => registration.unregister())
      );
    }
  } catch {
    // A service worker can be controlled by the browser and may not be unregisterable here.
  }
}
