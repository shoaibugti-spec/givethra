import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";

export default function SignUpPage() {
  const { login, isLoggingIn, isInitializing, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [_showPw, _setShowPw] = useState(false);
  const [error, setError] = useState("");

  // If already authenticated, redirect to onboarding
  if (isAuthenticated) {
    navigate({ to: "/onboarding" });
  }

  const handleSignUp = () => {
    setError("");
    login();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Join Givethra
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your account and start making an impact
          </p>
        </div>

        {/* Internet Identity Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-6">
          {error && <ErrorBanner message={error} />}

          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Givethra uses Internet Identity for secure, privacy-preserving
              authentication. No password required.
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 text-left">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Secure authentication without passwords
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Your identity stays private
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                Works across all devices
              </li>
            </ul>
          </div>

          <Button
            data-ocid="signup.submit_button"
            onClick={handleSignUp}
            disabled={isLoggingIn || isInitializing}
            className="w-full h-11 font-semibold text-base"
          >
            {isLoggingIn || isInitializing ? (
              <LoadingSpinner size="sm" />
            ) : (
              "Create Account with Internet Identity"
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/sign-in"
              className="text-primary font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-foreground">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
