import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, Shield } from "lucide-react";
import { useState } from "react";

export default function SignInPage() {
  const { login, isLoggingIn, isInitializing, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate({ to: "/cases" });
  }

  const handleSignIn = () => {
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
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your Givethra account
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm space-y-6">
          <div className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Sign in securely with Internet Identity — no username or password
              needed.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" data-ocid="signin.remember_checkbox" />
            <Label
              htmlFor="remember"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Remember me on this device
            </Label>
          </div>

          <Button
            data-ocid="signin.submit_button"
            onClick={handleSignIn}
            disabled={isLoggingIn || isInitializing}
            className="w-full h-11 font-semibold text-base"
          >
            {isLoggingIn || isInitializing ? (
              <LoadingSpinner size="sm" />
            ) : (
              "Sign In with Internet Identity"
            )}
          </Button>

          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Forgot password?
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            New to Givethra?{" "}
            <Link
              to="/sign-up"
              className="text-primary font-medium hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
