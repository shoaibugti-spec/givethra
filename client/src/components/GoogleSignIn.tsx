import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck, UserCheck } from "lucide-react";

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
    }, 100);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ready || !buttonRef.current || !clientId) return;

    const handleCredential = async (response: { credential?: string }) => {
      if (!response.credential) return;
      setError("");
      setLoading(true);
      try {
        const result = await fetch("/api/auth/google", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
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

    try {
      googleIdentity()?.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredential,
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

      googleIdentity()?.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log("[GoogleSignIn] Prompt suppressed, using rendered button");
        }
      });
    } catch (err) {
      console.warn("[GoogleSignIn] Init warning", err);
    }
  }, [clientId, compact, ready]);

  if (!clientId) {
    return <p className="text-sm text-rose-700">Google sign-in client ID is missing. Please check configuration.</p>;
  }

  return (
    <div className="grid justify-items-center gap-3 w-full">
      <div className="relative min-h-12 flex justify-center w-full" ref={buttonRef} aria-label="Continue with Google" />
      {loading ? (
        <span className="flex items-center gap-2 text-sm text-emerald-700 font-medium animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin" /> Connecting to your Google account…
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
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Loading secure Google Account Chooser…
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Select any Google account to sign in or create workspace
          </span>
        )}
      </div>
    </div>
  );
}
