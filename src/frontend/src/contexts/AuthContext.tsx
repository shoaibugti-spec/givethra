import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GOOGLE_CLIENT_ID } from "../config/auth";

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
}

const AuthContext = createContext<AuthContextValue | null>(null);
const ROLE_KEY = "givethra_role";
const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";

function safeLocalGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeLocalSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { }
}
function safeLocalRemove(key: string): void {
  try { localStorage.removeItem(key); } catch { }
}

/** Accept the token formats used by the Cloudflare OAuth worker and clean the URL. */
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Initial verification on load
  useEffect(() => {
    const token = getTokenFromLocation();
    if (token) {
      fetch(`${WORKER_URL}/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.valid && data.user) {
            const u: UserPublic = {
              id: data.user.user_id,
              email: data.user.email,
              fullName: data.user.full_name || data.user.email,
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

  const refreshUser = useCallback(async () => {
    const token = getTokenFromLocation();
    if (!token) {
      setUser(null);
      setUserId(null);
      return;
    }
    try {
      const res = await fetch(`${WORKER_URL}/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.valid && data.user) {
        const u: UserPublic = {
          id: data.user.user_id,
          email: data.user.email,
          fullName: data.user.full_name || data.user.email,
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
    setLoginError(null);
    try {
      const response = await fetch(`${WORKER_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.token || !data.user) {
        throw new Error(data.error || `Google sign-in could not be verified (HTTP ${response.status}).`);
      }

      safeLocalSet("auth_token", data.token);
      safeLocalSet("user_email", data.user.email);
      const authenticatedUser: UserPublic = {
        id: data.user.user_id,
        email: data.user.email,
        fullName: data.user.full_name || data.user.email,
        photo: data.user.avatar_url || "",
        role: (safeLocalGet(ROLE_KEY) as UserRole) || null,
      };
      setUser(authenticatedUser);
      setUserId(authenticatedUser.id);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setLoginError(error instanceof Error ? error.message : "Google sign-in failed. Please try again.");
      safeLocalRemove("auth_token");
      safeLocalRemove("user_email");
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  // Use Google Identity Services directly. No OAuth client secret is sent to the browser.
  const loginWithGoogle = useCallback(() => {
    const googleIdentity = (window as any).google;
    if (!GOOGLE_CLIENT_ID || !googleIdentity?.accounts?.id) {
      const message = "Google sign-in is not ready yet. Please wait a moment and try again.";
      console.error(message);
      setLoginError(message);
      setIsLoggingIn(false);
      return;
    }

    setLoginError(null);
    setIsLoggingIn(true);
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
    });
    googleIdentity.accounts.id.prompt((notification: any) => {
      if (notification?.isNotDisplayed?.()) {
        setIsLoggingIn(false);
        setLoginError("Google sign-in could not open. Please allow Google prompts/pop-ups and try again.");
      } else {
        // Suppress false cancellation banners entirely to ensure clean UX
        setIsLoggingIn(false);
      }
    });
  }, [finishGoogleLogin]);

  const handleLogout = useCallback(async () => {
    safeLocalRemove("auth_token");
    safeLocalRemove("user_email");
    safeLocalRemove(ROLE_KEY);
    setUser(null);
    setUserId(null);
    queryClient.clear();
    window.location.href = "/";
  }, [queryClient]);

  const storedRole = (safeLocalGet(ROLE_KEY) as UserRole) ?? null;
  const setRole = (r: UserRole) => {
    if (r) safeLocalSet(ROLE_KEY, r);
    else safeLocalRemove(ROLE_KEY);
  };

  const isAuthenticated = !!userId && !!user;
  const role: UserRole = isAuthenticated ? storedRole : null;
  const isAdmin = isAuthenticated && user?.email === ADMIN_EMAIL;

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
    };
  }
  return ctx;
}
