import { w as createLucideIcon, e as useAuth, u as useNavigate, r as reactExports, M as getCasesByUser, l as jsxRuntimeExports } from "./main-CYM9BeWF.js";
import { L as Layout } from "./Layout-PIwTKxdu.js";
import { B as Button } from "./button-BoXCjEAF.js";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-BUePzdoQ.js";
import { F as FileText } from "./file-text-BqYk1oVP.js";
import { C as CircleAlert } from "./circle-alert-DeSVkQwk.js";
import { C as CalendarClock } from "./calendar-clock-PkbBz5vk.js";
import { A as ArrowRight } from "./arrow-right-DmPI4oeG.js";
import { E as Eye } from "./eye-DO95myrp.js";
import { C as CircleCheck } from "./circle-check-DzEnRCnr.js";
import { C as CircleX } from "./circle-x-DphzjV_f.js";
import { C as Clock } from "./clock-jnNgLhvf.js";
import "./users-DQ_fG41C.js";
import "./x-z1TbCY5C.js";
import "./heart-BeKUzFrD.js";
import "./message-circle-CsflEQIJ.js";
import "./index-BdAhQxWM.js";
import "./index-KZxXceaa.js";
import "./index-ChMUzQGk.js";
import "./index-CeDhMLko.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Plus = createLucideIcon("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
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
function MyCasesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myCases, setMyCases] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [myCaseStatusFilter, setMyCaseStatusFilter] = reactExports.useState("completed");
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
      const cases = await getCasesByUser(user.id);
      setMyCases(
        (Array.isArray(cases) ? cases : []).map((c) => ({
          ...c,
          status: String((c == null ? void 0 : c.status) || "pending").toLowerCase()
        }))
      );
    } catch (err) {
      console.error("Failed to load cases dashboard:", err);
    } finally {
      setLoading(false);
    }
  }
  const statusConfig = {
    pending: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3.5 w-3.5" }), label: "Pending", color: "bg-orange-100 text-orange-700" },
    rejected: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5" }), label: "Rejected", color: "bg-red-100 text-red-700" },
    approved: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }), label: "Approved", color: "bg-green-100 text-green-700" },
    completed: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }), label: "Completed", color: "bg-blue-100 text-blue-700" },
    expired: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-3.5 w-3.5" }), label: "Expired", color: "bg-amber-100 text-amber-700" }
  };
  function CaseRow({ c }) {
    const statusKey = c.status;
    const cfg = statusConfig[statusKey] ?? statusConfig.pending;
    const cur = c.currency || "USD";
    const s = sym(cur);
    const needed = Number(c.amount_needed ?? 0);
    const collected = Number(c.amount_collected ?? 0);
    const pct = needed > 0 ? Math.min(Math.round(collected / needed * 100), 100) : 0;
    const isRejected = statusKey === "rejected";
    const isExpired = c.status === "expired";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-4 space-y-3 ${isRejected ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : isExpired ? "border-amber-300 bg-amber-50/50" : "bg-card"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`, children: [
            cfg.icon,
            " ",
            cfg.label
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full", children: c.category })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: c.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "📍 ",
          c.city,
          ", ",
          c.country,
          " ",
          needed > 0 && `· ${s} ${needed} ${cur}`
        ] })
      ] }) }),
      needed > 0 && !isRejected && !isExpired && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[11px] font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-600", children: [
            s,
            " ",
            collected,
            " settled"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            pct,
            "% · ",
            s,
            " ",
            Math.max(needed - collected, 0),
            " left"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-1.5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary h-1.5 rounded-full transition-all", style: { width: `${pct}%` } }) })
      ] }),
      isRejected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Case Rejected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: c.rejection_reason || "No reason provided." })
        ] })
      ] }),
      statusKey === "completed" && (c.payment_transaction_id || c.payment_receipt_url) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-teal-200 bg-teal-50/60 p-3 space-y-2 text-xs text-teal-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Payment received and verified" }),
        c.payment_transaction_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "TXN: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium", children: c.payment_transaction_id })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
          c.payment_receipt_url && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: c.payment_receipt_url, target: "_blank", rel: "noopener noreferrer", className: "rounded-md border border-teal-300 bg-white px-2.5 py-1.5 font-medium hover:bg-teal-100", children: "View payment proof" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => window.open(`/affidavit/${encodeURIComponent(c.id)}`, "_blank", "noopener,noreferrer"), className: "rounded-md border border-teal-300 bg-white px-2.5 py-1.5 font-medium hover:bg-teal-100", children: "View affidavit" })
        ] })
      ] }),
      isExpired && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-amber-300 bg-amber-50 p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-100 p-2 rounded-full shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "h-6 w-6 text-amber-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-base font-bold text-amber-800", children: "⏰ Case Expired" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "No one helped in time, but you can try again" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg border-2 border-amber-200 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-amber-900", children: [
          "Your case remained active until the deadline but no Hero stepped forward. ",
          c.was_free ? "Since this was your free case, you can submit a new case for FREE." : "The 1 credit you used has been refunded."
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white", onClick: () => navigate({ to: "/submit-request" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-3.5 w-3.5" }),
            " Submit New Case"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "flex-1 gap-2 border-amber-300 text-amber-600", onClick: () => navigate({ to: "/cases" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
            " Browse Other Cases"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "w-full gap-1.5", onClick: () => navigate({ to: "/cases/$id", params: { id: c.id } }), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-3.5 w-3.5" }),
        " View Details"
      ] })
    ] });
  }
  const filteredMyCases = myCases.filter((c) => {
    const status = String(c.status || "").toLowerCase();
    if (myCaseStatusFilter === "approved") {
      return status === "approved" || status === "published";
    }
    return status === myCaseStatusFilter;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-6 w-6 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "My Cases" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => navigate({ to: "/submit-request" }), className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
        " New Case"
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20 text-muted-foreground", children: "Loading..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: myCaseStatusFilter, onValueChange: setMyCaseStatusFilter, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "pending", children: "Pending" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "rejected", children: "Rejected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "approved", children: "Approved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "completed", children: "Completed" })
      ] }) }),
      filteredMyCases.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "No ",
        myCaseStatusFilter,
        " cases."
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filteredMyCases.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(CaseRow, { c }, c.id)) })
    ] })
  ] }) });
}
export {
  MyCasesPage as default
};
