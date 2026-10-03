// src/frontend/src/contexts/AuthContext.tsx
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GOOGLE_CLIENT_ID } from "../config/auth";
import { clearLegacyBrowserState } from "@/lib/legacySessionCleanup";

const WORKER_URL =
  typeof window !== "undefined" ? window.location.origin : "https://givethra.org";

export type UserRole = "hero" | "help_seeker" | "admin" | null;

export interface UserPublic {
  id: string;
  email: string;
  fullName: string;
  photo: string;
  role: UserRole;
}

interface AuthContextValue {
  user: UserPublic | null;
  setUser: (user: UserPublic | null) => void;
  refreshUser: () => Promise<void>;
  userId: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  loginError: string | null;
  loginWithGoogle: () => void;
  logout: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isHero: boolean;
  isHelpSeeker: boolean;
  isAdmin: boolean;
  isAssistant: boolean;  // ✅ نیا
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ROLE_KEY = "givethra_role";
const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";
const ASSISTANT_EMAIL = "shoaibugti@gmail.com";  // ✅ نیا
let googleScriptPromise: Promise<void> | null = null;

function ensureGoogleIdentityServices(timeoutMs = 20000): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google sign-in is only available in a browser."));
  if ((window as any).google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    const script = existing || document.createElement("script");
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (error) {
        googleScriptPromise = null;
        reject(error);
      } else {
        resolve();
      }
    };
    const timer = window.setTimeout(() => finish(new Error("Google sign-in is taking longer than expected. Please check your connection and try again.")), timeoutMs);
    script.addEventListener("load", () => {
      const waitForApi = () => {
        if ((window as any).google?.accounts?.id) return finish();
        window.setTimeout(() => {
          if ((window as any).google?.accounts?.id) finish();
          else if (!settled) waitForApi();
        }, 100);
      };
      waitForApi();
    }, { once: true });
    script.addEventListener("error", () => finish(new Error("Google sign-in could not be loaded. Please try again.")), { once: true });
    if (!existing) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });
  return googleScriptPromise;
}

function safeLocalGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeLocalSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { }
}
function safeLocalRemove(key: string): void {
  try { localStorage.removeItem(key); } catch { }
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

function getTokenFromLocation(): string | null {
  if (typeof window === "undefined") return safeLocalGet("auth_token");
  const url = new URL(window.location.href);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
  const token =
    url.searchParams.get("auth_token") ||
    url.searchParams.get("access_token") ||
    url.searchParams.get("token") ||
    hashParams.get("auth_token") ||
    hashParams.get("access_token") ||
    hashParams.get("token");
  if (!token) return safeLocalGet("auth_token");
  safeLocalSet("auth_token", token);
  const email = url.searchParams.get("email") || hashParams.get("email");
  if (email) safeLocalSet("user_email", email);
  ["auth_token", "access_token", "token", "email"].forEach((key) => {
    url.searchParams.delete(key);
    hashParams.delete(key);
  });
  const cleanedHash = hashParams.toString();
  url.hash = cleanedHash ? `#${cleanedHash}` : "";
  window.history.replaceState({}, document.title, url.toString());
  return token;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => {
    const stored = safeLocalGet(ROLE_KEY);
    return stored === "hero" || stored === "help_seeker" ? stored : null;
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const googleInitializedRef = useRef(false);
  const googlePromptRetryRef = useRef(0);
  const googlePromptTimerRef = useRef<number | null>(null);
  const googleLoginTimerRef = useRef<number | null>(null);

  useEffect(() => {
    clearLegacyBrowserState();
    const token = getTokenFromLocation();
    if (token) {
      fetchWithTimeout(`${WORKER_URL}/verify`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid && data.user) {
            const u: UserPublic = {
              id: data.user.user_id,
              email: data.user.email,
              fullName: data.user.full_name || "User",
              photo: data.user.avatar_url || "",
              role: (safeLocalGet(ROLE_KEY) as UserRole) || null,
            };
            setUser(u);
            setUserId(u.id);
          } else {
            safeLocalRemove("auth_token");
            safeLocalRemove("user_email");
            safeLocalRemove(ROLE_KEY);
          }
        })
        .catch(() => {})
        .finally(() => setIsInitializing(false));
    } else {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => () => {
    if (googlePromptTimerRef.current) window.clearTimeout(googlePromptTimerRef.current);
    if (googleLoginTimerRef.current) window.clearTimeout(googleLoginTimerRef.current);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getTokenFromLocation();
    if (!token) {
      setUser(null);
      setUserId(null);
      return;
    }
    try {
      const res = await fetchWithTimeout(`${WORKER_URL}/verify`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.valid && data.user) {
        const u: UserPublic = {
          id: data.user.user_id,
          email: data.user.email,
          fullName: data.user.full_name || "User",
          photo: data.user.avatar_url || "",
          role: (safeLocalGet(ROLE_KEY) as UserRole) || null,
        };
        setUser(u);
        setUserId(u.id);
      } else {
        safeLocalRemove("auth_token");
        safeLocalRemove("user_email");
        setUser(null);
        setUserId(null);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const finishGoogleLogin = useCallback(async (credential: string) => {
    if (googleLoginTimerRef.current) window.clearTimeout(googleLoginTimerRef.current);
    if (googlePromptTimerRef.current) window.clearTimeout(googlePromptTimerRef.current);
    googlePromptRetryRef.current = 0;
    setLoginError(null);
    try {
      let response: Response | null = null;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          response = await fetchWithTimeout(`${WORKER_URL}/auth/google`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential }),
          }, 15000);
          break;
        } catch (error) {
          if (attempt === 2) throw error;
          await new Promise((resolve) => window.setTimeout(resolve, 700 * (attempt + 1)));
        }
      }
      if (!response) throw new Error("Google sign-in verification did not return a response.");
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.error || `Google sign-in could not be verified (HTTP ${response.status}).`);
      }

      safeLocalSet("auth_token", data.token);
      safeLocalSet("user_email", data.user.email);
      try { sessionStorage.removeItem("givethra_auth_recovery_reload"); } catch { }
      const authenticatedUser: UserPublic = {
        id: data.user.user_id,
        email: data.user.email,
        fullName: data.user.full_name || "User",
        photo: data.user.avatar_url || "",
        role: (safeLocalGet(ROLE_KEY) as UserRole) || null,
      };
      setUser(authenticatedUser);
      setUserId(authenticatedUser.id);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      const message = error instanceof DOMException && error.name === "AbortError"
        ? "Google sign-in timed out. Please try again."
        : error instanceof Error ? error.message : "Google sign-in failed. Please try again.";
      setLoginError(message);
      safeLocalRemove("auth_token");
      safeLocalRemove("user_email");
      setUser(null);
      setUserId(null);
      if (message.includes("Authentication or database request failed")) {
        let canRecover = false;
        try {
          canRecover = sessionStorage.getItem("givethra_auth_recovery_reload") !== "1";
          if (canRecover) sessionStorage.setItem("givethra_auth_recovery_reload", "1");
        } catch { }
        if (canRecover) window.setTimeout(() => window.location.reload(), 50);
      }
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (isLoggingIn) return;
    clearLegacyBrowserState();
    setLoginError(null);
    setIsLoggingIn(true);
    googlePromptRetryRef.current = 0;
    if (googlePromptTimerRef.current) window.clearTimeout(googlePromptTimerRef.current);
    if (googleLoginTimerRef.current) window.clearTimeout(googleLoginTimerRef.current);
    if (!GOOGLE_CLIENT_ID) {
      setLoginError("Google sign-in is temporarily unavailable. Please try again shortly.");
      setIsLoggingIn(false);
      return;
    }
    try {
      await ensureGoogleIdentityServices();
    } catch (error) {
      console.error("Google Identity Services failed to load:", error);
      setLoginError(error instanceof Error ? error.message : "Google sign-in could not be loaded. Please try again.");
      setIsLoggingIn(false);
      return;
    }
    const googleIdentity = (window as any).google;
    if (!googleIdentity?.accounts?.id) {
      setLoginError("Google sign-in could not be loaded. Please try again.");
      setIsLoggingIn(false);
      return;
    }

    if (!googleInitializedRef.current) {
      googleIdentity.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: { credential?: string }) => {
          if (response?.credential) {
            void finishGoogleLogin(response.credential);
          } else {
            setLoginError("Google did not return a sign-in credential. Please try again.");
            setIsLoggingIn(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        use_fedcm_for_prompt: true,
        itp_support: true,
      });
      googleInitializedRef.current = true;
    }
    const openGooglePrompt = () => {
      googleIdentity.accounts.id.prompt((notification: any) => {
        const unavailable = notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.();
        if (!unavailable) return;
        if (googlePromptRetryRef.current < 3) {
          googlePromptRetryRef.current += 1;
          googlePromptTimerRef.current = window.setTimeout(openGooglePrompt, 650);
          return;
        }
        const fallback = document.getElementById("google-account-chooser-fallback");
        if (fallback && !fallback.dataset.rendered) {
          fallback.dataset.rendered = "1";
          fallback.classList.remove("hidden");
          googleIdentity.accounts.id.renderButton(fallback, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            width: Math.min(360, Math.max(240, fallback.clientWidth || 320)),
          });
        }
        setIsLoggingIn(false);
        setLoginError(null);
      });
    };
    openGooglePrompt();
    googleLoginTimerRef.current = window.setTimeout(() => {
      setIsLoggingIn((active) => {
        if (active) setLoginError("Google account selection is taking longer than expected. Please select your account when the Google prompt appears.");
        return false;
      });
    }, 60000);
  }, [finishGoogleLogin, isLoggingIn]);

  const handleLogout = useCallback(async () => {
    safeLocalRemove("auth_token");
    safeLocalRemove("user_email");
    safeLocalRemove(ROLE_KEY);
    setUser(null);
    setUserId(null);
    queryClient.clear();
    window.location.href = "/";
  }, [queryClient]);

  const setRole = (r: UserRole) => {
    if (r) safeLocalSet(ROLE_KEY, r);
    else safeLocalRemove(ROLE_KEY);
    setSelectedRole(r);
  };

  const isAuthenticated = !!userId && !!user;
  const role: UserRole = isAuthenticated ? selectedRole : null;
  const isAdmin = isAuthenticated && user?.email === ADMIN_EMAIL;
  const isAssistant = isAuthenticated && user?.email === ASSISTANT_EMAIL;  // ✅ نیا

  const value: AuthContextValue = {
    user,
    setUser,
    refreshUser,
    userId,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    loginError,
    loginWithGoogle,
    logout: handleLogout,
    role,
    setRole,
    isHero: role === "hero",
    isHelpSeeker: role === "help_seeker",
    isAdmin,
    isAssistant,  // ✅ نیا
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      setUser: () => undefined,
      refreshUser: async () => undefined,
      userId: null,
      isAuthenticated: false,
      isInitializing: true,
      isLoggingIn: false,
      loginError: null,
      loginWithGoogle: () => undefined,
      logout: () => undefined,
      role: null,
      setRole: () => undefined,
      isHero: false,
      isHelpSeeker: false,
      isAdmin: false,
      isAssistant: false,  // ✅ نیا
    };
  }
  return ctx;
}
