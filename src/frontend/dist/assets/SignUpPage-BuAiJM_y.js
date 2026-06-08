import { a as useAuth, u as useNavigate, r as reactExports, j as jsxRuntimeExports, b as LoadingSpinner, L as Link } from "./index-BoYH-a4m.js";
import { E as ErrorBanner } from "./ErrorBanner-Da8eSBd7.js";
import { B as Button } from "./button-DXj5HeE2.js";
import { S as Shield } from "./shield-BJahHKMQ.js";
import "./circle-alert-CarhqOsL.js";
import "./x-Yn9x35TY.js";
function SignUpPage() {
  const { login, isLoggingIn, isInitializing, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [_showPw, _setShowPw] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  if (isAuthenticated) {
    navigate({ to: "/onboarding" });
  }
  const handleSignUp = () => {
    setError("");
    login();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-6 w-6 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Join Givethra" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Create your account and start making an impact" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-8 shadow-sm space-y-6", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBanner, { message: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Givethra uses Internet Identity for secure, privacy-preserving authentication. No password required." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs text-muted-foreground space-y-1 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary shrink-0" }),
            "Secure authentication without passwords"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary shrink-0" }),
            "Your identity stays private"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-primary shrink-0" }),
            "Works across all devices"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          "data-ocid": "signup.submit_button",
          onClick: handleSignUp,
          disabled: isLoggingIn || isInitializing,
          className: "w-full h-11 font-semibold text-base",
          children: isLoggingIn || isInitializing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "sm" }) : "Create Account with Internet Identity"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/sign-in",
            className: "text-primary font-medium hover:underline",
            children: "Sign in"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground", children: [
      "By continuing, you agree to our",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/terms", className: "underline hover:text-foreground", children: "Terms" }),
      " ",
      "and",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", className: "underline hover:text-foreground", children: "Privacy Policy" }),
      "."
    ] })
  ] }) });
}
export {
  SignUpPage as default
};
