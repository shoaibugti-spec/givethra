import { c as createLucideIcon, u as useAuth, O as useLocation, f as useNavigate, r as reactExports, C as getCaseById, F as getCaseResolutions, P as getCaseUnlocksByHero, o as ue, j as jsxRuntimeExports } from "./main-g9K_ERoM.js";
import { L as Layout } from "./Layout-C2xD75Ts.js";
import { B as Button } from "./button-B16x4Aev.js";
import { a as isTrulyCompletedHelp, i as isContributionResolution } from "./resolutionStatus-DHDdhFyW.js";
import { A as ArrowLeft } from "./arrow-left-DT46p4Ta.js";
import { F as FileText } from "./file-text-BX7_gWdF.js";
import { E as ExternalLink } from "./external-link-BCBdXOT-.js";
import { C as CircleCheck } from "./circle-check-g9UYGXUf.js";
import "./x-0HxdDPFz.js";
import "./heart-jbpX9LjB.js";
import "./lock-VvpKTfA-.js";
import "./message-circle-Ds5NPe60.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Printer = createLucideIcon("Printer", [
  [
    "path",
    {
      d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
      key: "143wyd"
    }
  ],
  ["path", { d: "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6", key: "1itne7" }],
  ["rect", { x: "6", y: "14", width: "12", height: "8", rx: "1", key: "1ue0tg" }]
]);
function maskName(value) {
  const parts = String(value || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Protected participant";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0).toUpperCase()}.`;
}
function maskCnic(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits ? `${digits.slice(0, 4)}*********` : "Not disclosed";
}
function maskAccount(value) {
  const digits = String(value || "").replace(/\s/g, "");
  return digits ? `****${digits.slice(-4)}` : "Not disclosed";
}
function formatDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "Not recorded" : date.toLocaleDateString(void 0, { year: "numeric", month: "long", day: "numeric" });
}
function AffidavitPage() {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [caseData, setCaseData] = reactExports.useState(null);
  const [resolution, setResolution] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const caseId = reactExports.useMemo(() => {
    const match = location.pathname.match(/^\/affidavit\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }, [location.pathname]);
  reactExports.useEffect(() => {
    let active = true;
    if (!caseId || !(user == null ? void 0 : user.id)) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    Promise.allSettled([getCaseById(caseId), getCaseResolutions(caseId), getCaseUnlocksByHero(user.id)]).then((results) => {
      if (!active) return;
      const nextCase = results[0].status === "fulfilled" ? results[0].value : null;
      const resolutions = results[1].status === "fulfilled" && Array.isArray(results[1].value) ? results[1].value : [];
      const unlocks = results[2].status === "fulfilled" && Array.isArray(results[2].value) ? results[2].value : [];
      const userUnlock = unlocks.find((u) => String(u.case_id) === String(caseId));
      const completedList = resolutions.filter(isTrulyCompletedHelp);
      let verified = completedList.find((r) => r.receipt_url || r.paid_receipt_url) || completedList[0] || null;
      const adminReceipt = (nextCase == null ? void 0 : nextCase.paid_receipt_url) || (nextCase == null ? void 0 : nextCase.payment_proof_url) || (nextCase == null ? void 0 : nextCase.receipt_url) || null;
      const directUnlock = userUnlock && String(userUnlock.payment_type || "").toLowerCase() !== "partial";
      const caseCompleted = String((nextCase == null ? void 0 : nextCase.status) || "").toLowerCase() === "completed";
      const ownContributionResolution = resolutions.find(
        (r) => String(r.hero_id || "") === String(user.id) && isTrulyCompletedHelp(r)
      );
      if (!verified && directUnlock && caseCompleted) {
        verified = {
          ...nextCase,
          id: `generated-direct-${nextCase.id}`,
          status: "completed",
          payment_type: "full",
          paid_to: "institute",
          transaction_id: nextCase.reference_number || "",
          receipt_url: adminReceipt,
          amount_paid: nextCase.amount_collected || nextCase.amount_needed || 0,
          completed_at: nextCase.closed_at || nextCase.reviewed_at || null
        };
      } else if (!verified && userUnlock && String(userUnlock.payment_type || "").toLowerCase() === "partial" && ownContributionResolution && caseCompleted) {
        verified = {
          ...ownContributionResolution,
          id: `generated-contribution-${(nextCase == null ? void 0 : nextCase.id) || caseId}`,
          status: "completed",
          payment_type: "partial",
          paid_to: "givethra",
          completed_at: ownContributionResolution.completed_at || (nextCase == null ? void 0 : nextCase.closed_at) || null
        };
      }
      setCaseData(nextCase);
      setResolution(verified || null);
    }).catch((error) => {
      if (active) ue.error(error instanceof Error ? error.message : "Unable to load affidavit");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [caseId, user == null ? void 0 : user.id]);
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-xl px-4 py-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Sign in required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Please sign in to view a verified affidavit." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-5", onClick: () => navigate({ to: "/sign-in" }), children: "Sign in" })
    ] }) });
  }
  const data = resolution || {};
  const title = (caseData == null ? void 0 : caseData.title) || data.case_title || "Completed assistance";
  const category = (caseData == null ? void 0 : caseData.category) || data.case_category || "Community assistance";
  const currency = (caseData == null ? void 0 : caseData.currency) || data.currency || "USD";
  const amount = data.seeker_confirmed_amount ?? data.amount_paid ?? data.amount ?? (caseData == null ? void 0 : caseData.amount_collected) ?? (caseData == null ? void 0 : caseData.amount_needed) ?? "Not recorded";
  const verificationCode = String(data.verification_security_code || data.security_code || data.id || caseId).slice(-16).toUpperCase();
  const receiptUrl = data.receipt_url || data.paid_receipt_url || (caseData == null ? void 0 : caseData.paid_receipt_url) || "";
  isContributionResolution(data);
  const role = "Hero";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "mx-auto max-w-3xl px-4 py-6 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between print:hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: () => navigate({ to: "/my-help" }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "mr-2 h-4 w-4" }),
        "Back to My Help"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => window.print(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "mr-2 h-4 w-4" }),
        "Print / Save PDF"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl border border-border bg-card p-10 text-center text-sm text-muted-foreground", children: "Loading verified affidavit..." }) : !resolution || !isTrulyCompletedHelp(resolution) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center dark:border-amber-900/50 dark:bg-amber-950/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "mx-auto h-10 w-10 text-amber-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-xl font-bold", children: "Affidavit not available" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "This case does not have an approved, digitally verified assistance record yet." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-sm md:p-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "border-b border-border pb-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs font-bold uppercase tracking-[0.22em] text-primary", children: "Givethra" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-2 text-2xl font-bold tracking-tight", children: [
          "DIGITALLY VERIFIED AFFIDAVIT — ",
          role
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Official record of completed assistance" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-7 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold uppercase tracking-wide text-primary", children: "Case Information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 rounded-2xl bg-muted/30 p-4 text-sm sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Case ID:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: caseId })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Category:" }),
            " ",
            category
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Title:" }),
            " ",
            title
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-7 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold uppercase tracking-wide text-primary", children: "Protected Participants" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 rounded-2xl border border-border p-4 text-sm sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Requester" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: maskName(data.seeker_name || (caseData == null ? void 0 : caseData.user_name)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs text-muted-foreground", children: [
              "CNIC: ",
              maskCnic(data.seeker_cnic_number || data.seeker_cnic)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Hero" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: maskName(data.hero_name || (user == null ? void 0 : user.fullName)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs text-muted-foreground", children: [
              "CNIC: ",
              maskCnic(data.hero_cnic_number || data.hero_cnic)
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-7 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold uppercase tracking-wide text-primary", children: "Assistance Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 rounded-2xl bg-muted/30 p-4 text-sm sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Help type:" }),
            " ",
            data.paid_to === "givethra" ? "Contribution" : "Direct Help"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount settled:" }),
            " ",
            amount,
            " ",
            currency
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Transaction:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: data.transaction_id || "Not recorded" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Payment method:" }),
            " ",
            data.payment_method || (caseData == null ? void 0 : caseData.payment_method) || "Not recorded"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Verification date:" }),
            " ",
            formatDate(data.reviewed_at || data.admin_confirmed_at || data.completed_at || data.submitted_at)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Account:" }),
            " ",
            maskAccount((caseData == null ? void 0 : caseData.account_number) || (caseData == null ? void 0 : caseData.account_iban))
          ] })
        ] }),
        receiptUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: receiptUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
          "View payment evidence"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-7 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900 dark:border-teal-900/50 dark:bg-teal-950/20 dark:text-teal-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-start gap-2 font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mt-0.5 h-4 w-4 shrink-0" }),
          "Audit guarantee"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 leading-relaxed", children: "This digitally generated affidavit records a verified assistance event. Personal identifiers are intentionally masked. Full source records remain protected within Givethra and may be disclosed only through an authorized audit or dispute process." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 font-mono text-xs", children: [
          "Verification security code: ",
          verificationCode
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "mt-8 border-t border-border pt-5 text-center text-xs text-muted-foreground", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Givethra. All rights reserved."
      ] })
    ] })
  ] }) });
}
export {
  AffidavitPage as default,
  maskAccount,
  maskCnic,
  maskName
};
