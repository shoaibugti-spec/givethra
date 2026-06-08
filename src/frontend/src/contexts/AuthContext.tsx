import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = "hero" | "help_seeker" | "admin" | null;

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: () => void;
  logout: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isHero: boolean;
  isHelpSeeker: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Persist role in localStorage keyed by auth state
const ROLE_KEY = "givethra_role";

function safeLocalGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function safeLocalRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const identity = useInternetIdentity();
  const { login, clear, isAuthenticated, isInitializing, loginStatus } =
    identity;
  const queryClient = useQueryClient();

  // Track whether we've completed a full initialization cycle
  const [initComplete, setInitComplete] = useState(false);

  useEffect(() => {
    if (!isInitializing) {
      setInitComplete(true);
    }
  }, [isInitializing]);

  const storedRole = (safeLocalGet(ROLE_KEY) as UserRole) ?? null;

  const setRole = (role: UserRole) => {
    if (role) safeLocalSet(ROLE_KEY, role);
    else safeLocalRemove(ROLE_KEY);
  };

  const handleLogout = () => {
    try {
      clear();
    } catch {
      // ignore
    }
    try {
      queryClient.clear();
    } catch {
      // ignore
    }
    safeLocalRemove(ROLE_KEY);
  };

  const role: UserRole = isAuthenticated ? storedRole : null;

  // Show loading screen until auth is fully initialized
  const stillInitializing = isInitializing || !initComplete;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitializing: stillInitializing,
        isLoggingIn: loginStatus === "logging-in",
        login,
        logout: handleLogout,
        role,
        setRole,
        isHero: role === "hero",
        isHelpSeeker: role === "help_seeker",
        isAdmin: role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — safe version that returns null instead of throwing.
 * Components can check `if (!auth || auth.isInitializing)` before rendering.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return a safe default instead of throwing — prevents __store null crashes
    return {
      isAuthenticated: false,
      isInitializing: true,
      isLoggingIn: false,
      login: () => undefined,
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
