import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getBackendActor } from "@/lib/actor";
import { useNavigate } from "@tanstack/react-router";
import { MailCheck, RefreshCcw, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function VerifyEmailPage() {
  const { pendingVerification, verifyEmailOtp, isLoggingIn, isAuthenticated } =
    useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Resolve the email: prefer context state, fall back to sessionStorage
  const email =
    pendingVerification?.email ??
    (() => {
      try {
        return sessionStorage.getItem("pending_verify_email") ?? "";
      } catch {
        return "";
      }
    })();

  // If already authenticated, skip verification
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/onboarding" });
    }
  }, [isAuthenticated, navigate]);

  // If no pending email and not authenticated, redirect to sign-up
  useEffect(() => {
    if (!email) {
      navigate({ to: "/sign-up" });
    }
  }, [email, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.trim().length < 4) {
      setError("Please enter the full verification code.");
      return;
    }
    try {
      await verifyEmailOtp(email, code.trim());
      // storeSession has been called inside verifyEmailOtp — isAuthenticated will flip
      // and the useEffect above will redirect to /onboarding
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired code. Please try again.",
      );
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    setResendMessage("");
    setError("");
    try {
      const actor = getBackendActor();
      if (!actor) throw new Error("Backend unavailable.");
      const result = await actor.sendEmailOtp(email);
      if (result.__kind__ === "ok") {
        setResendMessage("A new code has been sent to your email.");
      } else {
        setError(result.err);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4">
            <MailCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a verification code to
          </p>
          <p className="font-semibold text-foreground text-sm mt-1 break-all">
            {email}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          {error && <ErrorBanner message={error} />}

          {resendMessage && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              {resendMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verify-code">Verification Code</Label>
              <Input
                id="verify-code"
                ref={inputRef}
                data-ocid="verify_email.code_input"
                type="text"
                inputMode="numeric"
                placeholder="Enter the code from your email"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/[^0-9a-zA-Z]/g, ""))
                }
                maxLength={10}
                required
                className="text-center text-lg tracking-widest font-mono h-12"
              />
              <p className="text-xs text-muted-foreground text-center">
                Check your inbox (and spam folder) for the code.
              </p>
            </div>

            <Button
              type="submit"
              data-ocid="verify_email.submit_button"
              disabled={isLoggingIn || !code.trim()}
              className="w-full h-11 font-semibold"
            >
              {isLoggingIn ? <LoadingSpinner size="sm" /> : "Verify & Continue"}
            </Button>
          </form>

          <div className="pt-1 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Didn’t receive the code?
            </p>
            <Button
              type="button"
              data-ocid="verify_email.resend_button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Wrong email?{" "}
          <button
            type="button"
            onClick={() => navigate({ to: "/sign-up" })}
            className="text-primary hover:underline font-medium"
          >
            Go back to sign up
          </button>
        </p>
      </div>
    </div>
  );
}
