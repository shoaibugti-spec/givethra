import { a as useAuth, u as useNavigate, r as reactExports, j as jsxRuntimeExports, L as Link } from "./index-C7ZxjHlS.js";
import { a as CategoryPill } from "./CategoryPill-BgiFthIF.js";
import { L as Layout } from "./Layout-BMq74Uxj.js";
import { B as Button } from "./button-QIYvq4xc.js";
import { S as Skeleton } from "./skeleton-XJNy3M--.js";
import { u as useBackendActor } from "./useBackend-Dxqmakwa.js";
import { H as HandHeart } from "./hand-heart-B8ghr84t.js";
import { M as MapPin } from "./map-pin-CXGl91yn.js";
import { S as ShieldCheck } from "./shield-check--kD3Q-5L.js";
import { C as Clock } from "./clock-CB4B95xZ.js";
import { C as CircleX } from "./circle-x-ivfTcJTk.js";
import { C as CircleCheck } from "./circle-check-BiLjReYf.js";
import "./input-EIAk_KSS.js";
import "./heart-VGojEH0R.js";
import "./bell-BDI-oIDm.js";
import "./x-BZLxzlHw.js";
import "./shield-BEOLXRSd.js";
import "./useQuery-Cb3pY6Kz.js";
const FILTERS = [
  { label: "All", value: "all" },
  { label: "Submitted", value: "Submitted" },
  { label: "Under Review", value: "UnderReview" },
  { label: "Approved", value: "Approved" },
  { label: "Completed", value: "Completed" }
];
function proofStatusLabel(status) {
  if (status === "UnderReview") return "Under Review";
  return status;
}
function ProofStatusBadge({ status }) {
  const map = {
    Submitted: {
      className: "bg-primary/10 text-primary border-primary/20",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" })
    },
    UnderReview: {
      className: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" })
    },
    Approved: {
      className: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" })
    },
    Completed: {
      className: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-700",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" })
    },
    Rejected: {
      className: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3 w-3" })
    }
  };
  const { className, icon } = map[status] ?? map.Submitted;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${className}`,
      children: [
        icon,
        proofStatusLabel(status)
      ]
    }
  );
}
function VerifStatusBadge({ status }) {
  if (status === "InstitutionVerified") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }),
      "Verified"
    ] });
  }
  if (status === "DocumentsSubmitted") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
      "Docs Submitted"
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground", children: "Unverified" });
}
function SupportCardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/2" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-20 rounded-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-16 rounded-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-16 rounded-full" })
    ] })
  ] });
}
function MySupportsPage() {
  const { isAuthenticated, isHero, role } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [supports, setSupports] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [filter, setFilter] = reactExports.useState("all");
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    Promise.all([actor.getMySupportedCases(""), actor.getMyProofs("")]).then(([cases, proofs]) => {
      const proofMap = /* @__PURE__ */ new Map();
      for (const p of proofs) {
        const key = String(p.caseId);
        const existing = proofMap.get(key);
        if (!existing || p.createdAt > existing.createdAt) {
          proofMap.set(key, p);
        }
      }
      const merged = cases.map((c) => {
        const proof = proofMap.get(String(c.id));
        return proof ? { case: c, proof } : null;
      }).filter((x) => x !== null);
      setSupports(merged);
    }).catch(() => setSupports([])).finally(() => setLoading(false));
  }, [actor, isFetching]);
  const filtered = reactExports.useMemo(() => {
    if (filter === "all") return supports;
    return supports.filter((s) => s.proof.status === filter);
  }, [supports, filter]);
  const countFor = (v) => v === "all" ? supports.length : supports.filter((s) => s.proof.status === v).length;
  const formatDate = (ts) => new Date(Number(ts) / 1e6).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }
  if (role && !isHero) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "max-w-2xl mx-auto px-4 py-20 text-center space-y-6",
        "data-ocid": "my_supports.role_prompt",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HandHeart, { className: "h-8 w-8 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold text-foreground", children: "This page is for Heroes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Switch to Hero role to support cases and track your contributions." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              "data-ocid": "my_supports.switch_role_button",
              onClick: () => navigate({ to: "/onboarding" }),
              children: "Switch to Hero Role"
            }
          )
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-6 pb-24 md:py-10 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "data-ocid": "my_supports.page", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl md:text-3xl font-bold text-foreground", children: "My Supports" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Cases you have supported as a Hero." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0",
        "data-ocid": "my_supports.filter.tab",
        children: FILTERS.map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setFilter(value),
            "data-ocid": `my_supports.filter.${value}`,
            className: `shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors duration-200 ${filter === value ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`,
            children: [
              label,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-xs opacity-70", children: [
                "(",
                countFor(value),
                ")"
              ] })
            ]
          },
          value
        ))
      }
    ),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "my_supports.loading_state", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SupportCardSkeleton, {}, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "my_supports.empty_state",
        className: "rounded-2xl border-2 border-dashed border-border bg-muted/20 py-20 text-center space-y-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HandHeart, { className: "h-7 w-7 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: filter === "all" ? "No supported cases yet." : `No ${proofStatusLabel(filter)} cases.` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Browse cases to start supporting." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cases", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { "data-ocid": "my_supports.browse_button", children: "Browse Verified Cases" }) })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "my_supports.list", children: filtered.map(({ case: c, proof }, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: "/cases/$id",
        params: { id: String(c.id) },
        "data-ocid": `my_supports.item.${i + 1}`,
        className: "block rounded-xl border border-border bg-card p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 group",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors", children: c.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                  c.city,
                  ", ",
                  c.country
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ProofStatusBadge, { status: proof.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryPill, { category: String(c.category), size: "xs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VerifStatusBadge, { status: String(c.verificationStatus) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
              "Supported ",
              formatDate(proof.createdAt)
            ] })
          ] })
        ]
      },
      String(c.id)
    )) })
  ] }) });
}
export {
  MySupportsPage as default
};
