import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck, UserCheck, LogIn } from "lucide-react";

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
    }, 80);
    return () => window.clearInterval(timer);
  }, []);

  const handleCredential = async (credential: string) => {
    if (!credential) return;
    setError("");
    setLoading(true);
    try {
      const result = await fetch("/api/auth/google", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      if (!result.ok) {
        const errData = await result.json().catch(() => ({}));
        throw new Error(errData.error || "Your Google account could not be signed in. Please try again.");
      }
      window.location.assign("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Google sign-in did not complete.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ready || !buttonRef.current || !clientId) return;

    const credentialCallback = (response: { credential?: string }) => {
      if (response.credential) {
        handleCredential(response.credential);
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
      console.warn("[GoogleSignIn] Init warning", err);
    }
  }, [clientId, compact, ready]);

  const triggerAccountChooser = () => {
    setError("");
    try {
      const gsi = googleIdentity();
      if (gsi?.accounts.id) {
        gsi.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            const redirectUri = window.location.origin;
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId || "")}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile&prompt=select_account`;
            window.location.href = authUrl;
          }
        });
      } else {
        const redirectUri = window.location.origin;
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId || "")}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email%20profile&prompt=select_account`;
      }
    } catch (err) {
      console.warn("[GoogleSignIn] Prompt invocation error", err);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        setLoading(true);
        window.history.replaceState(null, "", window.location.pathname);
        handleCredential(accessToken);
      }
    }
  }, []);

  if (!clientId) {
    return <p className="text-sm text-rose-700">Google sign-in client ID is missing. Please check configuration.</p>;
  }

  return (
    <div className="grid justify-items-center gap-3 w-full">
      <div className="relative min-h-12 flex justify-center w-full" ref={buttonRef} aria-label="Continue with Google" />

      <button
        type="button"
        onClick={triggerAccountChooser}
        className="w-full max-w-[276px] py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-full text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
      >
        <LogIn className="h-4 w-4" /> Choose Google Account & Sign In
      </button>

      {loading ? (
        <span className="flex items-center gap-2 text-sm text-emerald-700 font-medium animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" /> Verifying Google account and opening session…
        </span>
      ) : null}

      {error ? (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center w-full">
          <p className="text-sm text-rose-700 font-medium">{error}</p>
          <button
            onClick={() => { setError(""); window.location.reload(); }}
            className="mt-2 text-xs text-emerald-800 underline font-semibold hover:text-emerald-900"
          >
            Click here to refresh sign-in
          </button>
        </div>
      ) : null}

      <div className="flex flex-col items-center gap-1.5 w-full mt-1">
        {!ready ? (
          <span className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Initializing secure Google Sign-In…
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Tap above to select any Google account instantly
          </span>
        )}
      </div>
    </div>
  );
}
