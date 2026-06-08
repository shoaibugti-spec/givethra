import type { UserPublic } from "@/backend";
import {
  getBackendActor,
  resetBackendActor,
  resolveCanisterId,
} from "@/lib/actor";
import { useQueryClient } from "@tanstack/react-query";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type UserRole = "hero" | "help_seeker" | "admin" | null;

export interface PendingVerification {
  email: string;
  type: "email";
}

interface AuthContextValue {
  user: UserPublic | null;
  userId: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  pendingVerification: PendingVerification | null;
  login: () => void;
  logout: () => void;
  loginWithGoogle: (
    googleId: string,
    email: string,
    fullName: string,
    photo: string,
  ) => Promise<void>;
  loginWithPhone: (phone: string, otp: string) => Promise<void>;
  registerEmail: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
  verifyEmailOtp: (email: string, code: string) => Promise<void>;
  loginEmail: (email: string, password: string) => Promise<void>;
  role: UserRole;
  setRole: (role: UserRole) => void;
  isHero: boolean;
  isHelpSeeker: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "givethra_session";
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
    /* ignore */
  }
}
function safeLocalRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize synchronously via useState initializer so the actor is
  // available on the very first render — before any GSI callback fires.
  const [actor] = useState(() => {
    try {
      return getBackendActor();
    } catch (err) {
      console.error("[Givethra] Actor initialization error:", err);
      return null;
    }
  });
  const queryClient = useQueryClient();

  const [user, setUser] = useState<UserPublic | null>(null);
  const [userId, setUserId] = useState<string | null>(
    safeLocalGet(SESSION_KEY),
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification | null>(() => {
      try {
        const stored = sessionStorage.getItem("pending_verify_email");
        return stored ? { email: stored, type: "email" } : null;
      } catch {
        return null;
      }
    });

  // On mount or userId change, hydrate user from backend
  useEffect(() => {
    const storedId = safeLocalGet(SESSION_KEY);
    if (!storedId || !actor) {
      setIsInitializing(false);
      return;
    }
    actor
      .getCurrentUser(storedId)
      .then((result) => {
        if (result.__kind__ === "ok") {
          setUser(result.ok);
          setUserId(storedId);
        } else {
          safeLocalRemove(SESSION_KEY);
          setUserId(null);
        }
      })
      .catch(() => {
        safeLocalRemove(SESSION_KEY);
        setUserId(null);
      })
      .finally(() => setIsInitializing(false));
  }, [actor]);

  const storeSession = useCallback((uid: string, profile: UserPublic) => {
    safeLocalSet(SESSION_KEY, uid);
    setUserId(uid);
    setUser(profile);
  }, []);

  const loginWithGoogle = useCallback(
    async (
      googleId: string,
      email: string,
      fullName: string,
      _photo: string,
    ) => {
      async function retry<T>(
        fn: () => Promise<T>,
        maxRetries = 3,
      ): Promise<T> {
        let lastError: Error = new Error("Unknown error");
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            return await fn();
          } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            const msg = lastError.message.toLowerCase();
            if (
              !msg.includes("network") &&
              !msg.includes("timeout") &&
              !msg.includes("fetch") &&
              !msg.includes("connection")
            ) {
              throw lastError;
            }
            if (attempt < maxRetries - 1) {
              await new Promise<void>((r) =>
                setTimeout(r, 500 * (attempt + 1)),
              );
            }
          }
        }
        throw lastError;
      }
      // Retry getting the actor up to 5 times (500ms apart)
      let act = actor ?? getBackendActor();
      console.log(
        "[Auth] loginWithGoogle: initial actor =",
        act ? "OK" : "null",
      );
      if (!act) {
        for (let i = 0; i < 5; i++) {
          await new Promise<void>((r) => setTimeout(r, 500));
          resetBackendActor();
          act = getBackendActor();
          console.log(
            "[Auth] Attempt",
            i + 1,
            "of 5: actor =",
            act ? "OK" : "null",
          );
          if (act) break;
        }
      }
      if (!act) {
        const cid = resolveCanisterId();
        const win = window as unknown as Record<string, unknown>;
        const canisterWinKeys = Object.keys(win).filter(
          (k) => k.startsWith("__CANISTER") || k.startsWith("__ENV"),
        );
        const msg = `Backend connection unavailable.\n  canisterId=${cid ?? "undefined"}\n  import.meta.env.CANISTER_ID_BACKEND=${import.meta.env.CANISTER_ID_BACKEND ?? "undefined"}\n  window.__CANISTER* keys=${JSON.stringify(canisterWinKeys)}\n  actor=null after 5 attempts.`;
        console.error("[Auth] loginWithGoogle FAILED:", msg);
        throw new Error(msg);
      }
      setIsLoggingIn(true);
      try {
        // Try login first
        const loginResult = await retry(() => act.loginWithGoogle(googleId));
        if (loginResult.__kind__ === "ok") {
          const profile = loginResult.ok;
          storeSession(profile.id, profile);
          return;
        }
        // Not registered yet — register automatically, also with retry
        const regResult = await retry(() =>
          act.registerWithGoogle(googleId, fullName, email, null),
        );
        if (regResult.__kind__ === "ok") {
          const profile = regResult.ok;
          storeSession(profile.id, profile);
        } else {
          throw new Error(regResult.err);
        }
      } catch (error) {
        console.error("[Auth] loginWithGoogle error:", error);
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [actor, storeSession],
  );

  const loginWithPhone = useCallback(
    async (phone: string, otp: string) => {
      let act = actor ?? getBackendActor();
      console.log(
        "[Auth] loginWithPhone: initial actor =",
        act ? "OK" : "null",
      );
      if (!act) {
        for (let i = 0; i < 5; i++) {
          await new Promise<void>((r) => setTimeout(r, 500));
          resetBackendActor();
          act = getBackendActor();
          console.log(
            "[Auth] Attempt",
            i + 1,
            "of 5: actor =",
            act ? "OK" : "null",
          );
          if (act) break;
        }
      }
      if (!act) {
        const cid = resolveCanisterId();
        const win = window as unknown as Record<string, unknown>;
        const canisterWinKeys = Object.keys(win).filter(
          (k) => k.startsWith("__CANISTER") || k.startsWith("__ENV"),
        );
        const msg = `Backend connection unavailable.\n  canisterId=${cid ?? "undefined"}\n  import.meta.env.CANISTER_ID_BACKEND=${import.meta.env.CANISTER_ID_BACKEND ?? "undefined"}\n  window.__CANISTER* keys=${JSON.stringify(canisterWinKeys)}\n  actor=null after 5 attempts.`;
        console.error("[Auth] loginWithPhone FAILED:", msg);
        throw new Error(msg);
      }
      setIsLoggingIn(true);
      try {
        const result = await act.verifyPhoneOtp(phone, otp);
        if (result.__kind__ === "ok") {
          const profile = result.ok;
          storeSession(profile.id, profile);
        } else {
          throw new Error(result.err);
        }
      } catch (error) {
        console.error("[Auth] loginWithPhone error:", error);
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [actor, storeSession],
  );

  // registerEmail: backend returns {#ok: OTP_code}. Do NOT treat it as a userId.
  // Store email and set pendingVerification so the UI navigates to /verify-email.
  const registerEmail = useCallback(
    async (email: string, password: string, fullName: string) => {
      let act = actor ?? getBackendActor();
      console.log("[Auth] registerEmail: initial actor =", act ? "OK" : "null");
      if (!act) {
        for (let i = 0; i < 5; i++) {
          await new Promise<void>((r) => setTimeout(r, 500));
          resetBackendActor();
          act = getBackendActor();
          console.log(
            "[Auth] Attempt",
            i + 1,
            "of 5: actor =",
            act ? "OK" : "null",
          );
          if (act) break;
        }
      }
      if (!act) {
        const cid = resolveCanisterId();
        const win = window as unknown as Record<string, unknown>;
        const canisterWinKeys = Object.keys(win).filter(
          (k) => k.startsWith("__CANISTER") || k.startsWith("__ENV"),
        );
        const msg = `Backend connection unavailable.\n  canisterId=${cid ?? "undefined"}\n  import.meta.env.CANISTER_ID_BACKEND=${import.meta.env.CANISTER_ID_BACKEND ?? "undefined"}\n  window.__CANISTER* keys=${JSON.stringify(canisterWinKeys)}\n  actor=null after 5 attempts.`;
        console.error("[Auth] registerEmail FAILED:", msg);
        throw new Error(msg);
      }
      setIsLoggingIn(true);
      try {
        const result = await act.registerWithEmail(email, fullName, password);
        if (result.__kind__ === "ok") {
          // result.ok is the OTP code string, not a userId
          try {
            sessionStorage.setItem("pending_verify_email", email);
          } catch {
            /* ignore */
          }
          setPendingVerification({ email, type: "email" });
        } else {
          throw new Error(result.err);
        }
      } catch (error) {
        console.error("[Auth] registerEmail error:", error);
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [actor],
  );

  // verifyEmailOtp: called from /verify-email after the user enters the OTP.
  const verifyEmailOtp = useCallback(
    async (email: string, code: string) => {
      let act = actor ?? getBackendActor();
      console.log(
        "[Auth] verifyEmailOtp: initial actor =",
        act ? "OK" : "null",
      );
      if (!act) {
        for (let i = 0; i < 5; i++) {
          await new Promise<void>((r) => setTimeout(r, 500));
          resetBackendActor();
          act = getBackendActor();
          console.log(
            "[Auth] Attempt",
            i + 1,
            "of 5: actor =",
            act ? "OK" : "null",
          );
          if (act) break;
        }
      }
      if (!act) {
        const cid = resolveCanisterId();
        const win = window as unknown as Record<string, unknown>;
        const canisterWinKeys = Object.keys(win).filter(
          (k) => k.startsWith("__CANISTER") || k.startsWith("__ENV"),
        );
        const msg = `Backend connection unavailable.\n  canisterId=${cid ?? "undefined"}\n  import.meta.env.CANISTER_ID_BACKEND=${import.meta.env.CANISTER_ID_BACKEND ?? "undefined"}\n  window.__CANISTER* keys=${JSON.stringify(canisterWinKeys)}\n  actor=null after 5 attempts.`;
        console.error("[Auth] verifyEmailOtp FAILED:", msg);
        throw new Error(msg);
      }
      setIsLoggingIn(true);
      try {
        const result = await act.verifyEmailOtp(email, code);
        if (result.__kind__ === "ok") {
          const profile = result.ok;
          storeSession(profile.id, profile);
          setPendingVerification(null);
          try {
            sessionStorage.removeItem("pending_verify_email");
          } catch {
            /* ignore */
          }
        } else {
          throw new Error(result.err);
        }
      } catch (error) {
        console.error("[Auth] verifyEmailOtp error:", error);
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [actor, storeSession],
  );

  const loginEmail = useCallback(
    async (email: string, password: string) => {
      let act = actor ?? getBackendActor();
      console.log("[Auth] loginEmail: initial actor =", act ? "OK" : "null");
      if (!act) {
        for (let i = 0; i < 5; i++) {
          await new Promise<void>((r) => setTimeout(r, 500));
          resetBackendActor();
          act = getBackendActor();
          console.log(
            "[Auth] Attempt",
            i + 1,
            "of 5: actor =",
            act ? "OK" : "null",
          );
          if (act) break;
        }
      }
      if (!act) {
        const cid = resolveCanisterId();
        const win = window as unknown as Record<string, unknown>;
        const canisterWinKeys = Object.keys(win).filter(
          (k) => k.startsWith("__CANISTER") || k.startsWith("__ENV"),
        );
        const msg = `Backend connection unavailable.\n  canisterId=${cid ?? "undefined"}\n  import.meta.env.CANISTER_ID_BACKEND=${import.meta.env.CANISTER_ID_BACKEND ?? "undefined"}\n  window.__CANISTER* keys=${JSON.stringify(canisterWinKeys)}\n  actor=null after 5 attempts.`;
        console.error("[Auth] loginEmail FAILED:", msg);
        throw new Error(msg);
      }
      setIsLoggingIn(true);
      try {
        const result = await act.loginWithEmail(email, password);
        if (result.__kind__ === "ok") {
          const profile = result.ok;
          storeSession(profile.id, profile);
        } else {
          throw new Error(result.err);
        }
      } catch (error) {
        console.error("[Auth] loginEmail error:", error);
        throw error;
      } finally {
        setIsLoggingIn(false);
      }
    },
    [actor, storeSession],
  );

  const storedRole = (safeLocalGet(ROLE_KEY) as UserRole) ?? null;
  const setRole = (role: UserRole) => {
    if (role) safeLocalSet(ROLE_KEY, role);
    else safeLocalRemove(ROLE_KEY);
  };

  const handleLogout = useCallback(() => {
    const act = actor ?? getBackendActor();
    if (act && userId) {
      act.logoutUser(userId).catch(() => {
        /* ignore */
      });
    }
    queryClient.clear();
    safeLocalRemove(SESSION_KEY);
    safeLocalRemove(ROLE_KEY);
    setUser(null);
    setUserId(null);
  }, [actor, userId, queryClient]);

  const isAuthenticated = !!userId && !!user;
  const role: UserRole = isAuthenticated ? storedRole : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        isAuthenticated,
        isInitializing,
        isLoggingIn,
        pendingVerification,
        login: () => {
          /* legacy no-op; use loginWithGoogle/loginEmail/loginWithPhone */
        },
        logout: handleLogout,
        loginWithGoogle,
        loginWithPhone,
        registerEmail,
        verifyEmailOtp,
        loginEmail,
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      userId: null,
      isAuthenticated: false,
      isInitializing: true,
      isLoggingIn: false,
      pendingVerification: null,
      login: () => undefined,
      logout: () => undefined,
      loginWithGoogle: async () => undefined,
      loginWithPhone: async () => undefined,
      registerEmail: async () => undefined,
      verifyEmailOtp: async () => undefined,
      loginEmail: async () => undefined,
      role: null,
      setRole: () => undefined,
      isHero: false,
      isHelpSeeker: false,
      isAdmin: false,
    };
  }
  return ctx;
}
