import { e as useAuth, u as useNavigate, r as reactExports, a1 as getCaseResolutionsByHero, a2 as getCaseUnlocksByHero, a3 as getCasesByIds, p as ue, l as jsxRuntimeExports, H as HeartHandshake } from "./main-EspZtMZv.js";
import { L as Layout } from "./Layout-wYZkEQhc.js";
import { B as Button } from "./button-BrpTixLc.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-DETzQsZW.js";
import { a as isTrulyCompletedHelp, i as isContributionResolution, r as resolutionDisplayStatus } from "./resolutionStatus-DHDdhFyW.js";
import { M as MapPin } from "./map-pin-C91oi1yI.js";
import { C as Calendar } from "./calendar-BlVo-Q3F.js";
import { F as FileText } from "./file-text-BcVokOSk.js";
import { E as Eye } from "./eye-BF5sercH.js";
import { C as CircleAlert } from "./circle-alert-CI1fNXYv.js";
import { C as CircleCheck } from "./circle-check-BPQn3gNr.js";
import { C as CircleX } from "./circle-x-B0-Jayhr.js";
import { C as Clock } from "./clock-mK-y2hDF.js";
import "./users-_6SD4cVf.js";
import "./x-Br49mtL5.js";
import "./heart-CaEhMUxo.js";
import "./message-circle-CqePZOv0.js";
import "./index-D1NJSY4H.js";
import "./index-BjBsYUTf.js";
import "./index-D7zt7y2w.js";
import "./index-o8esZfzI.js";
const CURRENCY_SYMBOLS = {
  USD: "$",
  PKR: "Rs",
  SAR: "SAR",
  AED: "AED",
  GBP: "£",
  EUR: "€",
  INR: "₹"
};
function sym(cur) {
  return CURRENCY_SYMBOLS[cur] ?? cur;
}
function MyHelpPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = reactExports.useState(true);
  const [records, setRecords] = reactExports.useState([]);
  const [filterType, setFilterType] = reactExports.useState("all");
  const [filterStatus, setFilterStatus] = reactExports.useState("all");
  reactExports.useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadData();
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isAuthenticated]);
  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      const [resolutionsResult, unlocksResult] = await Promise.all([
        getCaseResolutionsByHero(user.id),
        getCaseUnlocksByHero(user.id)
      ]);
      const resolutions = Array.isArray(resolutionsResult) ? resolutionsResult : [];
      const unlocks = Array.isArray(unlocksResult) ? unlocksResult : [];
      const caseIds = Array.from(
        /* @__PURE__ */ new Set([
          ...resolutions.map((r) => String(r.case_id || "")).filter(Boolean),
          ...unlocks.map((u) => String(u.case_id || "")).filter(Boolean)
        ])
      );
      if (caseIds.length === 0) {
        setRecords([]);
        setLoading(false);
        return;
      }
      const casesData = await getCasesByIds(caseIds);
      const caseMap = /* @__PURE__ */ new Map();
      (Array.isArray(casesData) ? casesData : []).forEach((c) => {
        if (c == null ? void 0 : c.id) caseMap.set(String(c.id), c);
      });
      const recordList = [];
      for (const resolution of resolutions) {
        const caseId = String(resolution.case_id || "");
        if (!caseId) continue;
        const caseRecord = caseMap.get(caseId) || {
          id: caseId,
          title: resolution.case_title || "Unknown case",
          category: resolution.case_category || "Other",
          country: resolution.case_country || "",
          city: resolution.case_city || "",
          currency: resolution.currency || "PKR",
          amount_needed: resolution.amount_paid || 0
        };
        const resolutionStatus = String((resolution == null ? void 0 : resolution.status) || "").trim().toLowerCase();
        const isApproved = isTrulyCompletedHelp(resolution) || resolutionStatus === "completed" || String(caseRecord.status || "").toLowerCase() === "completed";
        const isContribution = isContributionResolution(resolution);
        const statusDisplay = isApproved ? "completed" : resolutionDisplayStatus(resolution);
        recordList.push({
          id: resolution.id,
          type: isContribution ? "contribution" : "direct",
          amount: Number(resolution.seeker_confirmed_amount ?? resolution.amount_paid ?? 0),
          transactionId: resolution.transaction_id || caseRecord.payment_transaction_id || "",
          receiptUrl: resolution.receipt_url || caseRecord.payment_receipt_url || null,
          status: statusDisplay,
          completedAt: resolution.completed_at || resolution.admin_confirmed_at || resolution.submitted_at,
          caseId,
          caseTitle: caseRecord.title || "Unknown case",
          caseCategory: caseRecord.category || "Other",
          caseCountry: caseRecord.country || "",
          caseCity: caseRecord.city || "",
          currency: caseRecord.currency || "PKR",
          resolution,
          isApproved,
          seekerName: resolution.seeker_name || caseRecord.full_name || "Verified Seeker",
          seekerCnic: resolution.seeker_cnic_number || "",
          heroName: resolution.hero_name || user.fullName || "You",
          heroCnic: resolution.hero_cnic_number || ""
        });
      }
      for (const unlock of unlocks) {
        const caseId = String(unlock.case_id || "");
        if (!caseId) continue;
        if (resolutions.some((r) => String(r.case_id) === caseId)) continue;
        const caseRecord = caseMap.get(caseId) || {
          id: caseId,
          title: "Unlocked case",
          category: "Other",
          currency: "PKR",
          status: "pending"
        };
        const isPartial = unlock.payment_type === "partial";
        const caseIsCompleted = String(caseRecord.status || "").toLowerCase() === "completed";
        const outcome = caseIsCompleted ? "unlock_only_completed" : "unlock_only_pending";
        recordList.push({
          id: unlock.id,
          type: isPartial ? "contribution" : "direct",
          amount: Number(unlock.pledged_amount ?? 0),
          transactionId: "N/A",
          receiptUrl: null,
          status: caseIsCompleted ? "completed" : "pending",
          completedAt: unlock.unlocked_at,
          caseId,
          caseTitle: caseRecord.title || "Unlocked case",
          caseCategory: caseRecord.category || "Other",
          caseCountry: caseRecord.country || "",
          caseCity: caseRecord.city || "",
          currency: caseRecord.currency || "PKR",
          resolution: null,
          isApproved: false,
          seekerName: "—",
          seekerCnic: "",
          heroName: user.fullName || "You",
          heroCnic: "",
          isUnlockOnly: true,
          caseCompletedByOther: caseIsCompleted,
          outcome
        });
      }
      recordList.sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA;
      });
      setRecords(recordList);
    } catch (err) {
      console.error("Failed to load help records:", err);
      ue.error("Could not load your help history.");
    } finally {
      setLoading(false);
    }
  }
  const filteredRecords = records.filter((r) => {
    if (filterType !== "all" && r.type !== filterType) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });
  const statusConfig = {
    pending: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }), label: "Pending", color: "bg-orange-100 text-orange-700" },
    rejected: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5" }), label: "Rejected", color: "bg-red-100 text-red-700" },
    completed: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }), label: "Completed", color: "bg-green-100 text-green-700" }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "My Help" })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20 text-muted-foreground", children: "Loading your help history..." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 rounded-xl border border-dashed bg-muted/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "You haven't helped anyone yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Browse cases and become a Hero today!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "mt-4", onClick: () => navigate({ to: "/cases" }), children: "Browse Cases" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: filterType, onValueChange: (v) => setFilterType(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-3 w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", children: "All" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "contribution", children: "🤝 Contribution" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "direct", children: "🦸 Direct" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: filterStatus, onValueChange: (v) => setFilterStatus(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "all", children: "All Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "pending", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "completed", children: "Completed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "rejected", children: "Rejected" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "No ",
        filterType !== "all" ? filterType : "",
        " ",
        filterStatus !== "all" ? filterStatus : "",
        " records found."
      ] }) }) : filteredRecords.map((record) => {
        const cfg = statusConfig[record.status] || statusConfig.pending;
        const cur = record.currency || "PKR";
        const s = sym(cur);
        const isCompleted = record.status === "completed";
        const isRejected = record.status === "rejected";
        const isUnlockOnly = record.isUnlockOnly;
        if (isUnlockOnly) {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `rounded-xl border p-4 space-y-3 ${isCompleted ? "border-green-300 bg-green-50/50 dark:bg-green-950/10" : "bg-card"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`, children: [
                      cfg.icon,
                      " ",
                      cfg.label
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full", children: record.type === "contribution" ? "🤝 Contribution" : "🦸 Direct Help" }),
                    isUnlockOnly && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full", children: "🔓 Unlock Only" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm truncate", children: record.caseTitle }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: record.caseCategory }),
                    (record.caseCity || record.caseCountry) && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3" }),
                      " ",
                      [record.caseCity, record.caseCountry].filter(Boolean).join(", ")
                    ] }),
                    record.amount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                      s,
                      " ",
                      record.amount,
                      " ",
                      cur
                    ] })
                  ] }),
                  record.transactionId && record.transactionId !== "N/A" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    "TXN: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: record.transactionId })
                  ] }),
                  record.completedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
                    " ",
                    new Date(record.completedAt).toLocaleDateString()
                  ] })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  isCompleted && record.isApproved && !isUnlockOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      className: "gap-2 bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[120px]",
                      onClick: () => {
                        const affidavitWindow = window.open(`/affidavit/${encodeURIComponent(record.caseId)}`, "_blank", "noopener,noreferrer");
                        if (!affidavitWindow) ue.error("Please allow pop-ups to view the affidavit.");
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                        " View Affidavit"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      className: "flex-1 min-w-[100px]",
                      onClick: () => navigate({ to: "/cases/$id", params: { id: record.caseId } }),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5 mr-1.5" }),
                        " View Case"
                      ]
                    }
                  ),
                  isRejected && !isCompleted && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full mt-1 rounded-lg bg-red-100 dark:bg-red-950/30 p-2 text-xs text-red-700 flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 shrink-0" }),
                    "This help was not verified. You can try helping again on another case."
                  ] }),
                  isUnlockOnly && record.caseCompletedByOther && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full mt-1 rounded-lg bg-blue-100 dark:bg-blue-950/30 p-2 text-xs text-blue-700", children: [
                    "🙏 This case has been completed — someone else helped to complete it. Your unlock was also part of this journey, thank you! Find a new case and become a complete Hero. ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "mt-2", onClick: () => navigate({ to: "/cases" }), children: "Browse More Cases" })
                  ] }),
                  isUnlockOnly && !record.caseCompletedByOther && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full mt-1 rounded-lg bg-amber-100 dark:bg-amber-950/30 p-2 text-xs text-amber-700", children: "💪 You unlocked this case but didn't complete a payment. Browse more cases and become a full Hero!" })
                ] })
              ]
            },
            record.id
          );
        }
        if (record.type === "contribution" && isCompleted && record.isApproved) {
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "rounded-xl border p-4 space-y-3 border-green-300 bg-green-50/50 dark:bg-green-950/10",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`, children: [
                      cfg.icon,
                      " ",
                      cfg.label
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full", children: "🤝 Contribution" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm truncate", children: record.caseTitle }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: record.caseCategory }),
                    record.amount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                      s,
                      " ",
                      record.amount,
                      " ",
                      cur
                    ] })
                  ] }),
                  record.transactionId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                    "TXN: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: record.transactionId })
                  ] }),
                  record.receiptUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: record.receiptUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-flex text-xs font-medium text-primary hover:underline", children: "View payment proof" })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      className: "gap-2 bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[120px]",
                      onClick: () => window.open(`/affidavit/${encodeURIComponent(record.caseId)}`, "_blank", "noopener,noreferrer"),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                        " View Affidavit"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      variant: "outline",
                      className: "flex-1 min-w-[100px]",
                      onClick: () => navigate({ to: "/cases/$id", params: { id: record.caseId } }),
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5 mr-1.5" }),
                        " View Case"
                      ]
                    }
                  )
                ] })
              ]
            },
            record.id
          );
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `rounded-xl border p-4 space-y-3 ${isCompleted ? "border-green-300 bg-green-50/50 dark:bg-green-950/10" : "bg-card"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`, children: [
                    cfg.icon,
                    " ",
                    cfg.label
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full", children: record.type === "contribution" ? "🤝 Contribution" : "🦸 Direct Help" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm truncate", children: record.caseTitle }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: record.caseCategory }),
                  record.amount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
                    s,
                    " ",
                    record.amount,
                    " ",
                    cur
                  ] })
                ] }),
                record.transactionId && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  "TXN: ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: record.transactionId })
                ] }),
                record.receiptUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: record.receiptUrl, target: "_blank", rel: "noopener noreferrer", className: "inline-flex text-xs font-medium text-primary hover:underline", children: "View payment proof" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
                isCompleted && record.isApproved && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    className: "gap-2 bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[120px]",
                    onClick: () => window.open(`/affidavit/${encodeURIComponent(record.caseId)}`, "_blank", "noopener,noreferrer"),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
                      " View Affidavit"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "flex-1 min-w-[100px]",
                    onClick: () => navigate({ to: "/cases/$id", params: { id: record.caseId } }),
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5 mr-1.5" }),
                      " View Case"
                    ]
                  }
                )
              ] })
            ]
          },
          record.id
        );
      }) })
    ] })
  ] }) });
}
export {
  MyHelpPage as default
};
