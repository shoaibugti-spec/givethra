import { c as createLucideIcon, e as useParams, u as useNavigate, a as useAuth, r as reactExports, j as jsxRuntimeExports, b as LoadingSpinner, f as ue } from "./index-C7ZxjHlS.js";
import { a as CategoryPill } from "./CategoryPill-BgiFthIF.js";
import { L as Layout } from "./Layout-BMq74Uxj.js";
import { V as VerificationBadge } from "./VerificationBadge-BGsyXgDM.js";
import { B as Button } from "./button-QIYvq4xc.js";
import { I as Input } from "./input-EIAk_KSS.js";
import { L as Label } from "./label-_UINz3UF.js";
import { P as Progress } from "./progress-CVL8r6ux.js";
import { u as useBackendActor } from "./useBackend-Dxqmakwa.js";
import { M as MapPin } from "./map-pin-CXGl91yn.js";
import { L as Lock } from "./lock-C5Jp2qk6.js";
import { H as Heart } from "./heart-VGojEH0R.js";
import "./bell-BDI-oIDm.js";
import "./x-BZLxzlHw.js";
import "./shield-BEOLXRSd.js";
import "./shield-check--kD3Q-5L.js";
import "./index-CgtCr000.js";
import "./index--e3bBEMH.js";
import "./useQuery-Cb3pY6Kz.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M12 3v12", key: "1x0j5s" }],
  ["path", { d: "m17 8-5-5-5 5", key: "7q97r8" }],
  ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }]
];
const Upload = createLucideIcon("upload", __iconNode);
function toVerifLevel(v) {
  if (v === "InstitutionVerified") return "institution_verified";
  if (v === "DocumentsSubmitted") return "documents_submitted";
  return "unverified";
}
function CaseDetailPage() {
  const { id } = useParams({ from: "/cases/$id" });
  const navigate = useNavigate();
  const { isAuthenticated, isHero } = useAuth();
  const { actor, isFetching } = useBackendActor();
  const [caseData, setCaseData] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [unlocked, setUnlocked] = reactExports.useState(false);
  const [unlocking, setUnlocking] = reactExports.useState(false);
  const [showProofForm, setShowProofForm] = reactExports.useState(false);
  const [proofRef, setProofRef] = reactExports.useState("");
  const [submittingProof, setSubmittingProof] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    const caseId = BigInt(id);
    setLoading(true);
    const guestUserId = "";
    Promise.all([
      actor.getCaseDetail(caseId, guestUserId),
      isAuthenticated ? actor.isUnlocked(caseId, guestUserId) : Promise.resolve(false)
    ]).then(([detail, isUnl]) => {
      setCaseData(detail ?? null);
      setUnlocked(isUnl);
    }).finally(() => setLoading(false));
  }, [actor, isFetching, id, isAuthenticated]);
  const handleUnlock = async () => {
    if (!actor) return;
    setUnlocking(true);
    try {
      const successUrl = `${window.location.origin}/cases/${id}?unlocked=1`;
      const cancelUrl = `${window.location.origin}/cases/${id}`;
      const sessionUrl = await actor.createUnlockFeeSession(
        BigInt(id),
        successUrl,
        cancelUrl
      );
      window.location.href = sessionUrl;
    } catch {
      ue.error("Failed to start payment. Please try again.");
      setUnlocking(false);
    }
  };
  const handleSubmitProof = async () => {
    if (!actor) return;
    setSubmittingProof(true);
    try {
      await actor.submitProof(BigInt(id), "", [], proofRef || null);
      ue.success("Proof submitted! The admin will review it shortly.");
      setShowProofForm(false);
      setProofRef("");
    } catch {
      ue.error("Failed to submit proof. Please try again.");
    } finally {
      setSubmittingProof(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex justify-center py-20",
        "data-ocid": "case_detail.loading_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { label: "Loading case..." })
      }
    ) });
  }
  if (!caseData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "max-w-4xl mx-auto px-4 py-20 text-center",
        "data-ocid": "case_detail.error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Case not found." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              className: "mt-4",
              onClick: () => navigate({ to: "/cases" }),
              children: "Back to Cases"
            }
          )
        ]
      }
    ) });
  }
  const amountNeeded = Number(caseData.amountNeeded) / 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => navigate({ to: "/cases" }),
        className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors",
        "data-ocid": "case_detail.back_button",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }),
          "Back to cases"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              VerificationBadge,
              {
                level: toVerifLevel(caseData.verificationStatus),
                size: "md"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryPill, { category: caseData.category, size: "sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl md:text-3xl font-bold text-foreground", children: caseData.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4 shrink-0" }),
            caseData.city,
            ", ",
            caseData.country
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground leading-relaxed", children: caseData.description })
        ] }),
        unlocked ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "case_detail.unlocked_section",
            className: "rounded-2xl border border-border bg-card p-6 space-y-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-foreground", children: "Case Details" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
                caseData.documents.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground mb-2", children: "Documents" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1", children: caseData.documents.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "li",
                    {
                      className: "text-primary underline text-xs",
                      children: doc.fileName
                    },
                    doc.storageId
                  )) })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No documents attached yet." }),
                caseData.adminNote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-3 rounded-lg bg-muted text-muted-foreground text-xs", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Admin note: " }),
                  caseData.adminNote
                ] })
              ] })
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "case_detail.locked_section",
            className: "rounded-2xl border border-dashed border-border bg-muted/40 p-6 flex flex-col items-center text-center gap-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 w-12 rounded-full bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-5 w-5 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-foreground", children: "Documents & Contact Details Locked" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Unlock this case for $2 USD to access verified documents, institution contacts, and payment instructions." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  "data-ocid": "case_detail.unlock_button",
                  disabled: !isAuthenticated || unlocking,
                  onClick: handleUnlock,
                  className: "px-8",
                  children: unlocking ? "Redirecting..." : isAuthenticated ? "Unlock Case — $2" : "Sign in to unlock"
                }
              ),
              !isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => navigate({ to: "/sign-in" }),
                    className: "text-primary underline",
                    children: "Sign in"
                  }
                ),
                " ",
                "or",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => navigate({ to: "/sign-up" }),
                    className: "text-primary underline",
                    children: "create an account"
                  }
                ),
                " ",
                "to unlock cases."
              ] })
            ]
          }
        ),
        isHero && unlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            "data-ocid": "case_detail.support_section",
            className: "rounded-2xl border border-border bg-card p-6 space-y-4",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-foreground", children: "Submit Proof of Support" }),
              showProofForm ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "proofRef", children: "Reference Number or Notes" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "proofRef",
                      "data-ocid": "case_detail.proof_ref_input",
                      placeholder: "Transaction reference, receipt number...",
                      value: proofRef,
                      onChange: (e) => setProofRef(e.target.value)
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      "data-ocid": "case_detail.submit_proof_button",
                      disabled: submittingProof,
                      onClick: handleSubmitProof,
                      className: "flex-1",
                      children: submittingProof ? "Submitting..." : "Submit Proof"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outline",
                      "data-ocid": "case_detail.cancel_proof_button",
                      onClick: () => setShowProofForm(false),
                      children: "Cancel"
                    }
                  )
                ] })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  "data-ocid": "case_detail.support_button",
                  onClick: () => setShowProofForm(true),
                  className: "w-full gap-2",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
                    " I Supported This Case"
                  ]
                }
              )
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-foreground", children: "Funding Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount needed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
                "$",
                amountNeeded.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: 0, className: "h-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Direct support model" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pay institution directly" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4 space-y-1 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: caseData.category })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              VerificationBadge,
              {
                level: toVerifLevel(caseData.verificationStatus),
                size: "sm"
              }
            )
          ] })
        ] }),
        isHero && !unlocked && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            className: "w-full",
            "data-ocid": "case_detail.unlock_cta_button",
            onClick: handleUnlock,
            disabled: !isAuthenticated || unlocking,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4 mr-2" }),
              unlocking ? "Redirecting..." : "Unlock to Help — $2"
            ]
          }
        )
      ] })
    ] })
  ] }) });
}
export {
  CaseDetailPage as default
};
