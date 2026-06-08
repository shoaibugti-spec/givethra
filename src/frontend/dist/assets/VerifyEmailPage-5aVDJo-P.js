import { c as createLucideIcon, a as useAuth, u as useNavigate, r as reactExports, j as jsxRuntimeExports, b as LoadingSpinner, g as getBackendActor } from "./index-C7ZxjHlS.js";
import { E as ErrorBanner } from "./ErrorBanner-D-X8zqiW.js";
import { B as Button } from "./button-QIYvq4xc.js";
import { I as Input } from "./input-EIAk_KSS.js";
import { L as Label } from "./label-_UINz3UF.js";
import { M as MailCheck } from "./mail-check-BydDkTFE.js";
import { S as ShieldCheck } from "./shield-check--kD3Q-5L.js";
import "./circle-alert-C4A2vuXE.js";
import "./x-BZLxzlHw.js";
import "./index-CgtCr000.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "14sxne" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }],
  ["path", { d: "M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16", key: "1hlbsb" }],
  ["path", { d: "M16 16h5v5", key: "ccwih5" }]
];
const RefreshCcw = createLucideIcon("refresh-ccw", __iconNode);
function VerifyEmailPage() {
  const { pendingVerification, verifyEmailOtp, isLoggingIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [resendLoading, setResendLoading] = reactExports.useState(false);
  const [resendMessage, setResendMessage] = reactExports.useState("");
  const inputRef = reactExports.useRef(null);
  const email = (pendingVerification == null ? void 0 : pendingVerification.email) ?? (() => {
    try {
      return sessionStorage.getItem("pending_verify_email") ?? "";
    } catch {
      return "";
    }
  })();
  reactExports.useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/onboarding" });
    }
  }, [isAuthenticated, navigate]);
  reactExports.useEffect(() => {
    if (!email) {
      navigate({ to: "/sign-up" });
    }
  }, [email, navigate]);
  reactExports.useEffect(() => {
    var _a;
    (_a = inputRef.current) == null ? void 0 : _a.focus();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (code.trim().length < 4) {
      setError("Please enter the full verification code.");
      return;
    }
    try {
      await verifyEmailOtp(email, code.trim());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid or expired code. Please try again."
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MailCheck, { className: "h-7 w-7 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "Verify your email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "We sent a verification code to" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground text-sm mt-1 break-all", children: email })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBanner, { message: error }),
      resendMessage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4 shrink-0" }),
        resendMessage
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "verify-code", children: "Verification Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              id: "verify-code",
              ref: inputRef,
              "data-ocid": "verify_email.code_input",
              type: "text",
              inputMode: "numeric",
              placeholder: "Enter the code from your email",
              value: code,
              onChange: (e) => setCode(e.target.value.replace(/[^0-9a-zA-Z]/g, "")),
              maxLength: 10,
              required: true,
              className: "text-center text-lg tracking-widest font-mono h-12"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Check your inbox (and spam folder) for the code." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "submit",
            "data-ocid": "verify_email.submit_button",
            disabled: isLoggingIn || !code.trim(),
            className: "w-full h-11 font-semibold",
            children: isLoggingIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "sm" }) : "Verify & Continue"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground text-center mb-3", children: "Didn’t receive the code?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            "data-ocid": "verify_email.resend_button",
            variant: "outline",
            className: "w-full",
            onClick: handleResend,
            disabled: resendLoading,
            children: resendLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { size: "sm" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCcw, { className: "h-4 w-4 mr-2" }),
              "Resend Code"
            ] })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground", children: [
      "Wrong email?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => navigate({ to: "/sign-up" }),
          className: "text-primary hover:underline font-medium",
          children: "Go back to sign up"
        }
      )
    ] })
  ] }) });
}
export {
  VerifyEmailPage as default
};
