import { c as createLucideIcon, a as useAuth, u as useNavigate, r as reactExports, j as jsxRuntimeExports, d as cn } from "./index-C7ZxjHlS.js";
import { B as Button } from "./button-QIYvq4xc.js";
import { S as ShieldCheck } from "./shield-check--kD3Q-5L.js";
import { H as Heart } from "./heart-VGojEH0R.js";
import { C as ChevronRight } from "./chevron-right-DV_M6KnL.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14", key: "1j4xps" }],
  [
    "path",
    {
      d: "m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9",
      key: "uospg8"
    }
  ],
  ["path", { d: "m2 13 6 6", key: "16e5sb" }]
];
const HandHelping = createLucideIcon("hand-helping", __iconNode);
const roles = [
  {
    id: "hero",
    icon: Heart,
    title: "Become a Hero",
    subtitle: "I want to help others",
    description: "Browse verified cases, unlock case details, and support real people through direct institution payments.",
    accent: "text-primary",
    bg: "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/40",
    selected: "bg-primary/10 border-primary ring-2 ring-primary/30"
  },
  {
    id: "help_seeker",
    icon: HandHelping,
    title: "Request Help",
    subtitle: "I need assistance",
    description: "Submit a verified help request, upload supporting documents, and connect with Heroes who can assist you directly.",
    accent: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 dark:bg-emerald-950 dark:border-emerald-800",
    selected: "bg-emerald-100 border-emerald-500 ring-2 ring-emerald-300 dark:bg-emerald-900 dark:border-emerald-500"
  }
];
function OnboardingPage() {
  const { setRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }
  const handleContinue = () => {
    if (!selected) return;
    setSaving(true);
    setRole(selected);
    setTimeout(() => {
      if (selected === "hero") navigate({ to: "/cases" });
      else navigate({ to: "/my-requests" });
    }, 400);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background px-4 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-6 w-6 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "How would you like to use Givethra?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm", children: "You can switch roles at any time from your profile settings." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: roles.map(
      ({
        id,
        icon: Icon,
        title,
        subtitle,
        description,
        accent,
        bg,
        selected: selClass
      }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          "data-ocid": `onboarding.role_${id}`,
          onClick: () => setSelected(id),
          className: cn(
            "w-full text-left rounded-2xl border-2 p-5 transition-smooth",
            selected === id ? selClass : bg
          ),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: cn(
                  "mt-0.5 rounded-xl p-2.5 bg-background shadow-sm",
                  accent
                ),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-semibold text-foreground", children: title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-muted-foreground", children: subtitle }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground leading-relaxed", children: description })
            ] }),
            selected === id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 h-5 w-5 rounded-full bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-3 w-3 text-primary-foreground" }) })
          ] })
        },
        id
      )
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        "data-ocid": "onboarding.continue_button",
        onClick: handleContinue,
        disabled: !selected || saving,
        className: "w-full h-11 font-semibold text-base",
        children: saving ? "Setting up your account..." : "Continue"
      }
    )
  ] }) });
}
export {
  OnboardingPage as default
};
