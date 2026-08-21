import { OAUTH_STATE_COOKIE, encodeOAuthState } from "@shared/const";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Manus OAuth login. Call this from an event handler or effect at the
// moment you want to navigate, e.g. `onClick={() => startLogin()}`.
//
// It has SIDE EFFECTS — it mints a one-time nonce, writes the __Host- state
// cookie, and navigates immediately — so the cookie nonce always matches the
// `state` it sends. Do NOT call it during render (no `href={startLogin()}` /
// `loginUrl={...}`): each call overwrites the cookie, so a stray render-phase
// call would desync it from an in-flight login and the callback would reject it
// with "invalid oauth state". It returns void by design, so there is no URL to
// stash across renders.
// Automatically clear legacy Supabase tokens/cookies without touching active Cloudflare sessions
export const cleanupLegacySupabaseState = () => {
  try {
    if (typeof window === "undefined") return;
    // 1. Clear localStorage keys matching Supabase legacy patterns
    const lsKeysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes("sb-") || key.includes("supabase") || key.includes("supabase.auth") || key.includes("sb-access-token"))) {
        lsKeysToRemove.push(key);
      }
    }
    lsKeysToRemove.forEach(k => localStorage.removeItem(k));

    // 2. Clear sessionStorage keys matching Supabase legacy patterns
    const ssKeysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes("sb-") || key.includes("supabase") || key.includes("supabase.auth") || key.includes("sb-access-token"))) {
        ssKeysToRemove.push(key);
      }
    }
    ssKeysToRemove.forEach(k => sessionStorage.removeItem(k));

    // 3. Clear legacy Supabase cookies
    const cookies = document.cookie ? document.cookie.split(";") : [];
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name.includes("sb-") || name.includes("supabase") || name.includes("sb-access-token")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }
    });
  } catch (e) {
    console.warn("[Auth Cleanup] Legacy cleanup warning:", e);
  }
};

// Run cleanup immediately on module load so legacy users never hit stale state
if (typeof window !== "undefined") {
  try {
    cleanupLegacySupabaseState();
  } catch {}
}

export const startLogin = () => {
  cleanupLegacySupabaseState();

  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;

  const nonce = crypto.randomUUID();
  document.cookie = `${OAUTH_STATE_COOKIE}=${nonce}; Path=/; Max-Age=600; SameSite=None; Secure`;
  const state = encodeOAuthState({ redirectUri, nonce });

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  window.location.href = url.toString();
};
