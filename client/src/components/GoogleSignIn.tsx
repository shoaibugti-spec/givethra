import { Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type GoogleIdentityApi = {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void;
      renderButton: (element: HTMLElement, options: Record<string, string | number | boolean>) => void;
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
    }, 120);
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
        if (!result.ok) throw new Error("Your Google account could not be signed in. Please try again.");
        window.location.assign("/dashboard");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Google sign-in did not complete.");
        setLoading(false);
      }
    };
    googleIdentity()?.accounts.id.initialize({ client_id: clientId, callback: handleCredential, auto_select: false, cancel_on_tap_outside: true });
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
  }, [clientId, compact, ready]);

  if (!clientId) {
    return <p className="text-sm text-rose-700">Google sign-in is being configured. Please return shortly.</p>;
  }

  return (
    <div className="grid justify-items-center gap-3">
      <div className="relative min-h-11" ref={buttonRef} aria-label="Continue with Google" />
      {loading ? <span className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" /> Verifying your account…</span> : null}
      {error ? <p className="max-w-xs text-center text-sm text-rose-700">{error}</p> : null}
      {!ready ? <span className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-3.5 w-3.5" /> Preparing secure Google sign-in…</span> : null}
    </div>
  );
}
