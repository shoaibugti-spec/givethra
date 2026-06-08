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

function GoogleSignIn() {
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
            navigate({ to: "/" });
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Google sign-in failed.";
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
          text: "signin_with",
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
          Use Phone or Email sign-in in the meantime.
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
        Sign in securely with your Google account.
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

function PhoneSignIn() {
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
      navigate({ to: "/" });
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
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              data-ocid="signin.phone_input"
              type="tel"
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            data-ocid="signin.send_otp_button"
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
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              data-ocid="signin.otp_input"
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
            data-ocid="signin.verify_otp_button"
            disabled={loading || !otp}
            className="w-full h-11 font-semibold"
          >
            {loading ? <LoadingSpinner size="sm" /> : "Verify OTP & Sign In"}
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

function EmailSignIn() {
  const { loginEmail, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await loginEmail(email, password);
      navigate({ to: "/" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password.",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          data-ocid="signin.email_input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            to="/forgot-password"
            className="text-xs text-muted-foreground hover:text-primary underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            data-ocid="signin.password_input"
            type={showPw ? "text" : "password"}
            placeholder="Enter your password"
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
      <Button
        type="submit"
        data-ocid="signin.submit_button"
        disabled={isLoggingIn}
        className="w-full h-11 font-semibold"
      >
        {isLoggingIn ? <LoadingSpinner size="sm" /> : "Sign In"}
      </Button>
    </form>
  );
}

// --- Page ---

export default function SignInPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
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

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <Tabs defaultValue="google" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-5">
              <TabsTrigger value="google" data-ocid="signin.google_tab">
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
              <TabsTrigger value="phone" data-ocid="signin.phone_tab">
                <Phone className="h-3.5 w-3.5 mr-1" /> Phone
              </TabsTrigger>
              <TabsTrigger value="email" data-ocid="signin.email_tab">
                <Mail className="h-3.5 w-3.5 mr-1" /> Email
              </TabsTrigger>
            </TabsList>
            <TabsContent value="google">
              <GoogleSignIn />
            </TabsContent>
            <TabsContent value="phone">
              <PhoneSignIn />
            </TabsContent>
            <TabsContent value="email">
              <EmailSignIn />
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-5">
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
