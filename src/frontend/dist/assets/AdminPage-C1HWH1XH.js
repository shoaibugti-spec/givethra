import { c as createLucideIcon, a as useAuth, u as useNavigate, r as reactExports, j as jsxRuntimeExports, b as LoadingSpinner, V as VerificationStatus, R as ReviewStatus, f as ue } from "./index-C7ZxjHlS.js";
import { L as Layout } from "./Layout-BMq74Uxj.js";
import { V as VerificationBadge } from "./VerificationBadge-BGsyXgDM.js";
import { B as Badge } from "./badge-CwN3900c.js";
import { B as Button } from "./button-QIYvq4xc.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BlS6X6Iy.js";
import { u as useBackendActor } from "./useBackend-Dxqmakwa.js";
import { S as Shield } from "./shield-BEOLXRSd.js";
import { C as CircleX } from "./circle-x-ivfTcJTk.js";
import "./input-EIAk_KSS.js";
import "./heart-VGojEH0R.js";
import "./bell-BDI-oIDm.js";
import "./x-BZLxzlHw.js";
import "./shield-check--kD3Q-5L.js";
import "./index-CaBAJ_1p.js";
import "./index-DIHmeXX3.js";
import "./index-o7zQPoiM.js";
import "./useQuery-Cb3pY6Kz.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M21.801 10A10 10 0 1 1 17 3.335", key: "yps3ct" }],
  ["path", { d: "m9 11 3 3L22 4", key: "1pflzl" }]
];
const CircleCheckBig = createLucideIcon("circle-check-big", __iconNode);
function toVerifLevel(v) {
  if (v === "InstitutionVerified") return "institution_verified";
  if (v === "DocumentsSubmitted") return "documents_submitted";
  return "unverified";
}
function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [cases, setCases] = reactExports.useState([]);
  const [proofs, setProofs] = reactExports.useState([]);
  const [users, setUsers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    Promise.all([
      actor.getAllCases(),
      actor.getAllProofs(),
      actor.getAllUsers()
    ]).then(([c, p, u]) => {
      setCases(c);
      setProofs(p);
      setUsers(u);
    }).catch(() => null).finally(() => setLoading(false));
  }, [actor, isFetching]);
  const updateVerif = async (caseId, status) => {
    if (!actor) return;
    try {
      await actor.updateVerificationStatus(caseId, status);
      setCases(
        (prev) => prev.map(
          (c) => c.id === caseId ? { ...c, verificationStatus: status } : c
        )
      );
      ue.success("Verification status updated.");
    } catch {
      ue.error("Failed to update verification.");
    }
  };
  const updateProof = async (proofId, status) => {
    if (!actor) return;
    try {
      await actor.updateProofStatus(proofId, status, null);
      setProofs(
        (prev) => prev.map((p) => p.id === proofId ? { ...p, status } : p)
      );
      ue.success("Proof status updated.");
    } catch {
      ue.error("Failed to update proof.");
    }
  };
  const suspendUser = async (userId) => {
    if (!actor) return;
    try {
      await actor.suspendUser(userId);
      setUsers(
        (prev) => prev.map((u) => u.id === userId ? { ...u, isActive: false } : u)
      );
      ue.success("User suspended.");
    } catch {
      ue.error("Failed to suspend user.");
    }
  };
  const banUser = async (userId) => {
    if (!actor) return;
    try {
      await actor.banUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      ue.success("User banned.");
    } catch {
      ue.error("Failed to ban user.");
    }
  };
  if (!isAuthenticated || !isAdmin) {
    navigate({ to: "/" });
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold text-foreground", children: "Admin Panel" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4", children: [
      {
        label: "Total Users",
        value: users.length,
        ocid: "admin.users_card"
      },
      {
        label: "Total Cases",
        value: cases.length,
        ocid: "admin.pending_cases_card"
      },
      {
        label: "Support Proofs",
        value: proofs.length,
        ocid: "admin.proofs_card"
      }
    ].map(({ label, value, ocid }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": ocid,
        className: "rounded-xl border border-border bg-card p-5 space-y-1",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-display font-bold text-foreground", children: value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: label })
        ]
      },
      label
    )) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex justify-center py-20",
        "data-ocid": "admin.loading_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { label: "Loading admin data..." })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "cases", "data-ocid": "admin.tabs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "cases", "data-ocid": "admin.cases_tab", children: [
          "Cases (",
          cases.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "proofs", "data-ocid": "admin.proofs_tab", children: [
          "Proofs (",
          proofs.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "users", "data-ocid": "admin.users_tab", children: [
          "Users (",
          users.length,
          ")"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cases", className: "space-y-3 mt-4", children: cases.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "admin.cases_empty_state",
          className: "text-center py-12 text-muted-foreground",
          children: "No cases yet."
        }
      ) : cases.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `admin.case.item.${i + 1}`,
          className: "rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 flex-wrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                VerificationBadge,
                {
                  level: toVerifLevel(c.verificationStatus),
                  size: "sm"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground truncate", children: c.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                c.city,
                ", ",
                c.country,
                " · ",
                c.category
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  "data-ocid": `admin.verify_case_button.${i + 1}`,
                  onClick: () => updateVerif(
                    c.id,
                    VerificationStatus.DocumentsSubmitted
                  ),
                  children: "Docs"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  "data-ocid": `admin.institution_verify_button.${i + 1}`,
                  onClick: () => updateVerif(
                    c.id,
                    VerificationStatus.InstitutionVerified
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
                    " Verify"
                  ]
                }
              )
            ] })
          ]
        },
        String(c.id)
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "proofs", className: "space-y-3 mt-4", children: proofs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "admin.proofs_empty_state",
          className: "text-center py-12 text-muted-foreground",
          children: "No support proofs yet."
        }
      ) : proofs.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `admin.proof.item.${i + 1}`,
          className: "rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: p.status === "Approved" ? "default" : p.status === "Rejected" ? "destructive" : "secondary",
                  children: p.status
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Case #",
                String(p.caseId),
                " ·",
                " ",
                p.referenceNumber ?? "No ref"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  "data-ocid": `admin.approve_proof_button.${i + 1}`,
                  onClick: () => updateProof(p.id, ReviewStatus.Approved),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
                    " Approve"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  "data-ocid": `admin.reject_proof_button.${i + 1}`,
                  onClick: () => updateProof(p.id, ReviewStatus.Rejected),
                  className: "text-destructive border-destructive/40 hover:bg-destructive/10",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 mr-1" }),
                    " Reject"
                  ]
                }
              )
            ] })
          ]
        },
        String(p.id)
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "users", className: "space-y-3 mt-4", children: users.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          "data-ocid": "admin.users_empty_state",
          className: "text-center py-12 text-muted-foreground",
          children: "No users yet."
        }
      ) : users.map((u, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          "data-ocid": `admin.user.item.${i + 1}`,
          className: "rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: u.fullName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                u.email,
                " · ",
                u.role,
                " · ",
                u.country
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: u.isActive ? "secondary" : "destructive",
                  className: "text-xs",
                  children: u.isActive ? "Active" : "Inactive"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  "data-ocid": `admin.suspend_user_button.${i + 1}`,
                  onClick: () => suspendUser(u.id),
                  disabled: !u.isActive,
                  children: "Suspend"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  "data-ocid": `admin.ban_user_button.${i + 1}`,
                  onClick: () => banUser(u.id),
                  className: "text-destructive border-destructive/40 hover:bg-destructive/10",
                  children: "Ban"
                }
              )
            ] })
          ]
        },
        String(u.id)
      )) })
    ] })
  ] }) });
}
export {
  AdminPage as default
};
