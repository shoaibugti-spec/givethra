import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck, UserCheck, LogIn, AlertCircle } from "lucide-react";
import { clearLegacySupabaseBrowserData, recoverFromLegacyAuthError } from "@/_core/legacyAuthCleanup";

type GoogleIdentityApi = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential?: string }) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
      }) => void;
      renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
      prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
    };
  };
};

function googleIdentity() {
  return Reflect.get(globalThis as object, "google") as unknown as GoogleIdentityApi | undefined;
}

export function GoogleSignIn({ compact = false }: { compact?: boolean }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (googleIdentity()?.accounts.id) {
        setReady(true);
        window.clearInterval(timer);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, []);

  const handleCredentialWithRetry = async (credential: string, retries = 2) => {
    if (!credential) return;
    clearLegacySupabaseBrowserData();
    setError("");
    setLoading(true);

    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);

      try {
        const response = await fetch("/api/auth/google", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
          signal: controller.signal,
        });
        window.clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Sign-in could not be completed. Please try again.");
        }

        window.location.assign("/dashboard");
        return;
      } catch (cause) {
        window.clearTimeout(timeoutId);
        if (recoverFromLegacyAuthError(cause)) return;
        const msg = cause instanceof Error ? cause.message : "Sign-in network error.";
        const isNetworkOrTimeout = msg.includes("aborted") || msg.includes("Failed to fetch") || msg.includes("NetworkError");

        if (attempt === retries || !isNetworkOrTimeout) {
          setError(msg.includes("aborted") ? "Connection timed out. Please check your network and try again." : msg);
          setLoading(false);
          return;
        }

        // Wait before retry with backoff
        await new Promise((resolve) => window.setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  };

  useEffect(() => {
    if (!ready || !buttonRef.current || !clientId) return;

    const credentialCallback = (response: { credential?: string }) => {
      if (response.credential) {
        handleCredentialWithRetry(response.credential);
      }
    };

    try {
      googleIdentity()?.accounts.id.initialize({
        client_id: clientId,
        callback: credentialCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      buttonRef.current.innerHTML = "";
      googleIdentity()?.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: compact ? "medium" : "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
        width: compact ? 230 : 276,
      });
    } catch (err) {
      console.warn("[GoogleSignIn] Button render warning", err);
    }
  }, [clientId, compact, ready]);

  const triggerDirectOAuth = () => {
    clearLegacySupabaseBrowserData();
    setError("");
    const redirectUri = window.location.origin;
    if (!clientId) {
      setError("Google client ID is missing.");
      return;
    }
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile&prompt=select_account`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        clearLegacySupabaseBrowserData();
        setLoading(true);
        window.history.replaceState(null, "", window.location.pathname);
        handleCredentialWithRetry(accessToken);
      }
    }
  }, []);

  if (!clientId) {
    return <p className="text-sm text-rose-700">Google sign-in client ID is not configured.</p>;
  }

  return (
    <div className="grid justify-items-center gap-3 w-full">
      <div
        className="relative min-h-12 flex justify-center w-full"
        ref={buttonRef}
        onClick={clearLegacySupabaseBrowserData}
        aria-label="Continue with Google"
      />

      <button
        type="button"
        onClick={triggerDirectOAuth}
        className="w-full max-w-[276px] py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
      >
        <LogIn className="h-4 w-4" /> Select Google Account & Sign In
      </button>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-emerald-700 font-medium py-1 animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" /> Verifying account & opening session…
        </div>
      ) : null}

      {error ? (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center w-full shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-rose-800 font-medium text-xs mb-1">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" /> Sign-in notice
          </div>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={() => { setError(""); window.location.reload(); }}
            className="mt-2 text-xs text-emerald-800 underline font-semibold hover:text-emerald-900 cursor-pointer"
          >
            Refresh page & try again
          </button>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-1 w-full mt-0.5">
        {!ready ? (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Loading secure Google gateway…
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Tap above for instant 1-tap or email selection
          </span>
        )}
      </div>
    </div>
  );
}
