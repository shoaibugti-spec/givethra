import { c as createLucideIcon, a as useAuth, u as useNavigate, r as reactExports, j as jsxRuntimeExports, L as Link } from "./index-C7ZxjHlS.js";
import { a as CategoryPill } from "./CategoryPill-BgiFthIF.js";
import { L as Layout } from "./Layout-BMq74Uxj.js";
import { B as Button } from "./button-QIYvq4xc.js";
import { P as Progress } from "./progress-CVL8r6ux.js";
import { S as Skeleton } from "./skeleton-XJNy3M--.js";
import { u as useBackendActor } from "./useBackend-Dxqmakwa.js";
import { C as Clock } from "./clock-CB4B95xZ.js";
import { C as CircleCheck } from "./circle-check-BiLjReYf.js";
import { S as ShieldCheck } from "./shield-check--kD3Q-5L.js";
import { M as MapPin } from "./map-pin-CXGl91yn.js";
import { U as Users } from "./users-ZuBDaFIU.js";
import { C as ChevronRight } from "./chevron-right-DV_M6KnL.js";
import "./input-EIAk_KSS.js";
import "./heart-VGojEH0R.js";
import "./bell-BDI-oIDm.js";
import "./x-BZLxzlHw.js";
import "./shield-BEOLXRSd.js";
import "./index--e3bBEMH.js";
import "./index-CgtCr000.js";
import "./useQuery-Cb3pY6Kz.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 7v14", key: "1akyts" }],
  [
    "path",
    {
      d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
      key: "ruj8y"
    }
  ]
];
const BookOpen = createLucideIcon("book-open", __iconNode);
function verifStyle(v) {
  if (v === "InstitutionVerified")
    return {
      label: "Institution Verified",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800"
    };
  if (v === "DocumentsSubmitted")
    return {
      label: "Docs Submitted",
      className: "bg-primary/10 text-primary border-primary/20"
    };
  return {
    label: "Unverified",
    className: "bg-muted text-muted-foreground border-border"
  };
}
function StatCard({
  label,
  value,
  icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 rounded-xl border border-border bg-card p-3 text-center min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center text-primary mb-1", children: icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl font-bold text-foreground", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground leading-tight mt-0.5", children: label })
  ] });
}
function CaseSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-2/3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-24 rounded-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-2 w-full rounded-full" })
  ] });
}
function MyCasesPage() {
  const { isAuthenticated, isHelpSeeker, role } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [cases, setCases] = reactExports.useState([]);
  const [stats, setStats] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    Promise.all([
      // getMySupportedCases returns cases the user has a proof for;
      // for a Help Seeker this also shows their own submitted cases
      actor.getMySupportedCases("").catch(() => []),
      actor.getCallerUserProfile().catch(() => null)
    ]).then(([myCases, profile]) => {
      setCases(myCases);
      if (profile) {
        actor.getHelpSeekerStats(profile.id).then((s) => setStats(s ?? null)).catch(() => setStats(null));
      }
    }).catch(() => setCases([])).finally(() => setLoading(false));
  }, [actor, isFetching]);
  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }
  if (role && !isHelpSeeker) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "max-w-2xl mx-auto px-4 py-20 text-center space-y-6",
        "data-ocid": "my_cases.role_prompt",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-8 w-8 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "This page is for Help Seekers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Switch to Help Seeker role to manage your submitted cases and track support progress." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              "data-ocid": "my_cases.switch_role_button",
              onClick: () => navigate({ to: "/onboarding" }),
              children: "Switch to Help Seeker Role"
            }
          )
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6 pb-24 md:py-10 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "my_cases.page", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl md:text-3xl font-bold text-foreground", children: "My Cases" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Your unlocked cases and submitted requests." })
    ] }),
    stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", "data-ocid": "my_cases.stats", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Submitted",
          value: Number(stats.requestsSubmitted),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Approved",
          value: Number(stats.requestsApproved),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        StatCard,
        {
          label: "Completed",
          value: Number(stats.requestsCompleted),
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" })
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "my_cases.loading_state", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(CaseSkeleton, {}, i)) }) : cases.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "my_cases.empty_state",
        className: "rounded-2xl border-2 border-dashed border-border bg-muted/20 py-20 text-center space-y-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-7 w-7 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: "No unlocked cases yet." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Unlock a case to see full details and connect with supporters." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cases", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { "data-ocid": "my_cases.browse_button", children: "Browse Cases" }) })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "my_cases.list", children: cases.map((c, i) => {
      const { label, className } = verifStyle(c.verificationStatus);
      const amountUsd = Number(c.amountNeeded) / 100;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/cases/$id",
          params: { id: String(c.id) },
          "data-ocid": `my_cases.item.${i + 1}`,
          className: "flex items-stretch rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 group overflow-hidden",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 p-4 space-y-3 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "flex-1 min-w-0 font-display font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors", children: c.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${className}`,
                    children: label
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                  c.city,
                  ", ",
                  c.country
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryPill, { category: String(c.category), size: "xs" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-semibold text-foreground ml-auto", children: [
                  "$",
                  amountUsd.toLocaleString(),
                  " needed"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: 0, className: "h-1.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
                    "Awaiting supporters"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "0% funded" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center px-3 text-muted-foreground group-hover:text-primary transition-colors shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" }) })
          ]
        },
        String(c.id)
      );
    }) })
  ] }) });
}
export {
  MyCasesPage as default
};
