import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GOOGLE_CLIENT_ID, isGoogleAuthConfigured } from "@/config/auth";
import { useAuth } from "@/contexts/AuthContext";
import { getBackendActor } from "@/lib/actor";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Mail, Phone, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const google: any;

function decodeJwt(token: string): Record<string, string> {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

// --- Google Tab ---

function GoogleSignUp() {
  const { loginWithGoogle, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const btnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const configured = isGoogleAuthConfigured();

  useEffect(() => {
    if (!configured) return;
    const initGsi = () => {
      if (typeof google === "undefined" || !btnRef.current) return;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          setError("");
          const payload = decodeJwt(response.credential);
          const googleId = payload.sub ?? "";
          const email = payload.email ?? "";
          const fullName = payload.name ?? "";
          const photo = payload.picture ?? "";
          try {
            await loginWithGoogle(googleId, email, fullName, photo);
            navigate({ to: "/onboarding" });
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Google sign-up failed.";
            setError(
              msg === "Not ready"
                ? "Connecting to server\u2026 Please try again in a moment."
                : msg,
            );
          }
        },
      });
      if (btnRef.current) {
        google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          width: 340,
          text: "signup_with",
        });
      }
    };
    if (typeof google !== "undefined") {
      initGsi();
    } else {
      const script = document.querySelector('script[src*="gsi/client"]');
      if (script) script.addEventListener("load", initGsi);
    }
  }, [loginWithGoogle, navigate, configured]);

  if (!configured) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-4">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
            Google Sign-In Not Configured
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500">
            A Google OAuth Client ID is required. Go to{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium"
            >
              Google Cloud Console
            </a>
            , create an OAuth 2.0 Client ID, and set{" "}
            <code className="font-mono bg-amber-500/20 px-1 rounded">
              VITE_GOOGLE_CLIENT_ID
            </code>{" "}
            in your environment, or update{" "}
            <code className="font-mono bg-amber-500/20 px-1 rounded">
              src/config/auth.ts
            </code>
            .
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Use Phone or Email sign-up in the meantime.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="space-y-2">
          <ErrorBanner message={error} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => {
              setError("");
              setRetryKey((k) => k + 1);
            }}
          >
            Try Again
          </Button>
        </div>
      )}
      <p className="text-sm text-muted-foreground text-center">
        Create your account using your Google account.
      </p>
      {isLoggingIn ? (
        <div className="flex justify-center py-2">
          <LoadingSpinner size="sm" />
        </div>
      ) : (
        <div key={retryKey} className="flex justify-center" ref={btnRef} />
      )}
    </div>
  );
}

// --- Phone Tab ---

function PhoneSignUp() {
  const { loginWithPhone } = useAuth();
  const actor = getBackendActor();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [displayOtp, setDisplayOtp] = useState<string | null>(null);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setLoading(true);
    setError("");
    try {
      const result = await actor.sendPhoneOtp(phone);
      if (result.__kind__ === "ok") {
        setDisplayOtp(result.ok);
        setStep("otp");
      } else {
        setError(result.err);
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginWithPhone(phone, otp);
      navigate({ to: "/onboarding" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBanner message={error} />}
      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-phone">Phone Number</Label>
            <Input
              id="signup-phone"
              data-ocid="signup.phone_input"
              type="tel"
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            data-ocid="signup.send_otp_button"
            disabled={loading || !phone}
            className="w-full h-11 font-semibold"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {displayOtp && (
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                Testing Mode — OTP Code:
              </p>
              <p className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300 tracking-widest text-center">
                {displayOtp}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="signup-otp">Enter OTP</Label>
            <Input
              id="signup-otp"
              data-ocid="signup.otp_input"
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
            />
          </div>
          <Button
            type="submit"
            data-ocid="signup.verify_otp_button"
            disabled={loading || !otp}
            className="w-full h-11 font-semibold"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Verify & Create Account"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              setStep("phone");
              setDisplayOtp(null);
            }}
          >
            Back
          </Button>
        </form>
      )}
    </div>
  );
}

// --- Email Tab ---

function EmailSignUp() {
  const { registerEmail, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      await registerEmail(email, password, fullName);
      navigate({ to: "/verify-email" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          data-ocid="signup.fullname_input"
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email Address</Label>
        <Input
          id="signup-email"
          data-ocid="signup.email_input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            data-ocid="signup.password_input"
            type={showPw ? "text" : "password"}
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPw(!showPw)}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          data-ocid="signup.confirm_password_input"
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        data-ocid="signup.submit_button"
        disabled={isLoggingIn}
        className="w-full h-11 font-semibold"
      >
        {isLoggingIn ? <LoadingSpinner size="sm" /> : "Create Account"}
      </Button>
    </form>
  );
}

// --- Page ---

export default function SignUpPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/onboarding" });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
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

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-5">
              <TabsTrigger value="google" data-ocid="signup.google_tab">
                <svg
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </TabsTrigger>
              <TabsTrigger value="phone" data-ocid="signup.phone_tab">
                <Phone className="h-3.5 w-3.5 mr-1" /> Phone
              </TabsTrigger>
              <TabsTrigger value="email" data-ocid="signup.email_tab">
                <Mail className="h-3.5 w-3.5 mr-1" /> Email
              </TabsTrigger>
            </TabsList>
            <TabsContent value="google">
              <GoogleSignUp />
            </TabsContent>
            <TabsContent value="phone">
              <PhoneSignUp />
            </TabsContent>
            <TabsContent value="email">
              <EmailSignUp />
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-5">
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
