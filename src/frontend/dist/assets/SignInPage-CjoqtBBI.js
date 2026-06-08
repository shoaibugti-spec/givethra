import { a as useAuth, u as useNavigate, r as reactExports, j as jsxRuntimeExports, L as Link, b as LoadingSpinner, g as getBackendActor } from "./index-C7ZxjHlS.js";
import { E as ErrorBanner } from "./ErrorBanner-D-X8zqiW.js";
import { B as Button } from "./button-QIYvq4xc.js";
import { I as Input } from "./input-EIAk_KSS.js";
import { L as Label } from "./label-_UINz3UF.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BlS6X6Iy.js";
import { E as EyeOff, i as isGoogleAuthConfigured, G as GOOGLE_CLIENT_ID } from "./auth-DfquxP2I.js";
import { S as Shield } from "./shield-BEOLXRSd.js";
import { P as Phone } from "./phone-BesfN5n8.js";
import { M as Mail } from "./mail-BazMw0Ai.js";
import { E as Eye } from "./eye-DHxExUII.js";
import "./circle-alert-C4A2vuXE.js";
import "./x-BZLxzlHw.js";
import "./index-CgtCr000.js";
import "./index-CaBAJ_1p.js";
import "./index-DIHmeXX3.js";
import "./index-o7zQPoiM.js";
function decodeJwt(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}
function GoogleSignIn() {
  const { loginWithGoogle, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const btnRef = reactExports.useRef(null);
  const [error, setError] = reactExports.useState("");
  const [retryKey, setRetryKey] = reactExports.useState(0);
  const configured = isGoogleAuthConfigured();
  reactExports.useEffect(() => {
    if (!configured) return;
    const initGsi = () => {
      if (typeof google === "undefined" || !btnRef.current) return;
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
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
            const msg = err instanceof Error ? err.message : "Google sign-in failed.";
            setError(
              msg === "Not ready" ? "Connecting to server… Please try again in a moment." : msg
            );
          }
        }
      });
      if (btnRef.current) {
        google.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          width: 340,
          text: "signin_with"
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
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-amber-500/10 border border-amber-500/30 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1", children: "Google Sign-In Not Configured" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 dark:text-amber-500", children: [
          "A Google OAuth Client ID is required. Go to",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "https://console.cloud.google.com/apis/credentials",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "underline font-medium",
              children: "Google Cloud Console"
            }
          ),
          ", create an OAuth 2.0 Client ID, and set",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono bg-amber-500/20 px-1 rounded", children: "VITE_GOOGLE_CLIENT_ID" }),
          " ",
          "in your environment, or update",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono bg-amber-500/20 px-1 rounded", children: "src/config/auth.ts" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Use Phone or Email sign-in in the meantime." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBanner, { message: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          className: "w-full text-xs",
          onClick: () => {
            setError("");
            setRetryKey((k) => k + 1);
          },
          children: "Try Again"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Sign in securely with your Google account." }),
    isLoggingIn ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "sm" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", ref: btnRef }, retryKey)
  ] });
}
function PhoneSignIn() {
  const { loginWithPhone } = useAuth();
  const actor = getBackendActor();
  const navigate = useNavigate();
  const [phone, setPhone] = reactExports.useState("");
  const [otp, setOtp] = reactExports.useState("");
  const [displayOtp, setDisplayOtp] = reactExports.useState(null);
  const [step, setStep] = reactExports.useState("phone");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const handleSendOtp = async (e) => {
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
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginWithPhone(phone, otp);
      navigate({ to: "/" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBanner, { message: error }),
    step === "phone" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSendOtp, className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "phone", children: "Phone Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "phone",
            "data-ocid": "signin.phone_input",
            type: "tel",
            placeholder: "+92 300 1234567",
            value: phone,
            onChange: (e) => setPhone(e.target.value),
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          "data-ocid": "signin.send_otp_button",
          disabled: loading || !phone,
          className: "w-full h-11 font-semibold",
          children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "sm" }) : "Send OTP"
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleVerifyOtp, className: "space-y-4", children: [
      displayOtp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-amber-500/10 border border-amber-500/20 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600 dark:text-amber-400 font-medium mb-1", children: "Testing Mode — OTP Code:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold font-mono text-amber-700 dark:text-amber-300 tracking-widest text-center", children: displayOtp })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "otp", children: "Enter OTP" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "otp",
            "data-ocid": "signin.otp_input",
            type: "text",
            inputMode: "numeric",
            placeholder: "Enter 6-digit code",
            value: otp,
            onChange: (e) => setOtp(e.target.value),
            maxLength: 6,
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "submit",
          "data-ocid": "signin.verify_otp_button",
          disabled: loading || !otp,
          className: "w-full h-11 font-semibold",
          children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "sm" }) : "Verify OTP & Sign In"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          variant: "ghost",
          className: "w-full text-sm",
          onClick: () => {
            setStep("phone");
            setDisplayOtp(null);
          },
          children: "Back"
        }
      )
    ] })
  ] });
}
function EmailSignIn() {
  const { loginEmail, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [showPw, setShowPw] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await loginEmail(email, password);
      navigate({ to: "/" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password."
      );
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBanner, { message: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", children: "Email Address" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          id: "email",
          "data-ocid": "signin.email_input",
          type: "email",
          placeholder: "you@example.com",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          required: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/forgot-password",
            className: "text-xs text-muted-foreground hover:text-primary underline",
            children: "Forgot password?"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "password",
            "data-ocid": "signin.password_input",
            type: showPw ? "text" : "password",
            placeholder: "Enter your password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true,
            className: "pr-10"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
            onClick: () => setShowPw(!showPw),
            "aria-label": showPw ? "Hide password" : "Show password",
            children: showPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        type: "submit",
        "data-ocid": "signin.submit_button",
        disabled: isLoggingIn,
        className: "w-full h-11 font-semibold",
        children: isLoggingIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "sm" }) : "Sign In"
      }
    )
  ] });
}
function SignInPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    if (isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-6 w-6 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Welcome back" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sign in to your Givethra account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "google", className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid w-full grid-cols-3 mb-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "google", "data-ocid": "signin.google_tab", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "svg",
              {
                className: "h-4 w-4 mr-1",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "path",
                    {
                      fill: "#4285F4",
                      d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "path",
                    {
                      fill: "#34A853",
                      d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "path",
                    {
                      fill: "#FBBC05",
                      d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "path",
                    {
                      fill: "#EA4335",
                      d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    }
                  )
                ]
              }
            ),
            "Google"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "phone", "data-ocid": "signin.phone_tab", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3.5 w-3.5 mr-1" }),
            " Phone"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "email", "data-ocid": "signin.email_tab", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5 mr-1" }),
            " Email"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "google", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleSignIn, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "phone", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneSignIn, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "email", children: /* @__PURE__ */ jsxRuntimeExports.jsx(EmailSignIn, {}) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground mt-5", children: [
        "New to Givethra?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/sign-up",
            className: "text-primary font-medium hover:underline",
            children: "Create account"
          }
        )
      ] })
    ] })
  ] }) });
}
export {
  SignInPage as default
};
