import { f as useNavigate, u as useAuth, h as useRole, r as reactExports, j as jsxRuntimeExports, L as Link } from "./main-g9K_ERoM.js";
import { B as Button } from "./button-B16x4Aev.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-BsZ58UjL.js";
import { L as LoaderCircle } from "./loader-circle-BACKBKXa.js";
import { D as Download } from "./download-CYQVgnCQ.js";
import { M as MessageCircle, a as Mail } from "./message-circle-Ds5NPe60.js";
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
      else navigate({ to: "/home" });
    }
  }, [isAuthenticated, navigate, redirect]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "w-full max-w-md border-border shadow-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-24 w-24 overflow-hidden rounded-3xl border-4 border-white shadow-xl ring-4 ring-primary/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "/assets/givethra-google-logo.png", alt: "Givethra G+ logo", className: "h-full w-full object-cover" }) }) }),
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
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { id: "google-account-chooser-fallback", className: "hidden min-h-11 w-full justify-center", "aria-live": "polite" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-center text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/30 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "block text-foreground", children: "Support" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Help verified people" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/30 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "block text-foreground", children: "Earnings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Earn from your posts" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm font-medium text-primary", children: "Support others, become eligible, earn through your own posts, and use your separate Earnings Wallet." }),
      loginError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { role: "alert", className: "rounded-md bg-destructive/10 px-3 py-2 text-center text-sm text-destructive", children: loginError }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-muted-foreground", children: [
        "Don't have an account?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/sign-up", className: "text-primary font-medium hover:underline", children: "Sign up" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 border-t border-border pt-5 text-center text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-teal-50 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl", children: "📱" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 font-bold text-foreground", children: "Get the Givethra Android App" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "Verified cases, anytime — right on your phone." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "mt-3 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4" }),
            "Download App"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-[11px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-emerald-50 p-2 text-emerald-700", children: "Verified & Secure" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-sky-50 p-2 text-sky-700", children: "100% Transparency" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-rose-50 p-2 text-rose-700", children: "Compassion Driven by Humanity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-amber-50 p-2 text-amber-700", children: "Global Community" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-violet-50 p-2 text-violet-700", children: "Help Beyond Borders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-teal-50 p-2 text-teal-700", children: "Safe & Private" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Connect with Givethra" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Follow us and reach out — we're here to help." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "https://wa.me/message/42CJXLUYEI2KM1?src=qr", target: "_blank", rel: "noreferrer", className: "inline-flex items-center gap-1 text-green-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }),
              "Get WhatsApp Support 24/7"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "mailto:info@givethra.org", className: "inline-flex items-center gap-1 text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4" }),
              "info@givethra.org"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex flex-wrap justify-center gap-x-3 gap-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/about", children: "About" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/faq", children: "FAQ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", children: "Privacy Policy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/terms", children: "Terms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/community-guidelines", children: "Community Guidelines" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/contact", children: "Contact Us" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " Givethra. All rights reserved."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "italic", children: "“Be the reason someone believes in kindness.”" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "givethra.org" })
      ] })
    ] })
  ] }) });
}
export {
  SignInPage as default
};
