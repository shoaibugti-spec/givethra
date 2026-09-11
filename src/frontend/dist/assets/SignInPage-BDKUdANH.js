import { u as useNavigate, e as useAuth, f as useRole, r as reactExports, l as jsxRuntimeExports, L as Link } from "./main-CYM9BeWF.js";
import { B as Button } from "./button-BoXCjEAF.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-Bj4KFAll.js";
import { H as Heart } from "./heart-BeKUzFrD.js";
import { L as LoaderCircle } from "./loader-circle-D316IoOu.js";
function SignInPage() {
  const navigate = useNavigate();
  const { loginWithGoogle, isLoggingIn, isAuthenticated, loginError, setRole: setAuthRole } = useAuth();
  const { setRole: setSelectedRole } = useRole();
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  reactExports.useEffect(() => {
    const selected = new URLSearchParams(window.location.search).get("role");
    if (selected === "hero" || selected === "requester") {
      setSelectedRole(selected);
      setAuthRole(selected === "requester" ? "help_seeker" : "hero");
    }
  }, [setAuthRole, setSelectedRole]);
  reactExports.useEffect(() => {
    if (isAuthenticated) {
      if (redirect === "/need-help") navigate({ to: "/need-help" });
      else if (redirect === "/community") navigate({ to: "/community" });
      else navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate, redirect]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md border-border shadow-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-2xl bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-7 w-7 text-primary-foreground" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-2xl font-bold", children: "Welcome to Givethra" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Sign in to continue to your account" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: loginWithGoogle,
          disabled: isLoggingIn,
          className: "w-full h-12 gap-2 bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 shadow-sm",
          variant: "outline",
          children: isLoggingIn ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-5 w-5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "h-5 w-5", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z", fill: "#4285F4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })
            ] }),
            "Sign in with Google"
          ] })
        }
      ),
      loginError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive", children: loginError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground", children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sign-up", className: "text-primary font-medium hover:underline", children: "Sign up" })
      ] })
    ] })
  ] }) });
}
export {
  SignInPage as default
};
