import { r as reactExports, M as getCasesByUser, l as jsxRuntimeExports, J as uploadFileToStorage, e as useAuth, p as ue, N as getUserSuspension, b as getWallet, O as getFeedbacks, P as insertCaseSubmission, u as useNavigate, g as getKycStatus, L as Link } from "./main-XWGl9bfu.js";
import { L as Layout } from "./Layout-B37pWsjx.js";
import { B as Button } from "./button-QyTBuXi2.js";
import { M as MessageCircle } from "./message-circle-Cc089LoD.js";
import { L as Label } from "./label-CIqc7hSc.js";
import { I as Input } from "./input-C2fZtUDS.js";
import { C as ChevronLeft } from "./chevron-left-DfShWIT9.js";
import { C as ChevronRight } from "./chevron-right-CccMJ6Xd.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BTmoliKO.js";
import { C as COUNTRIES } from "./countries-Au0MzsWq.js";
import { C as CircleCheck } from "./circle-check-VtAwHJjH.js";
import { W as WATER_COMPANIES, G as GAS_COMPANIES, E as ELECTRICITY_COMPANIES, H as HEALTH_REF_HINT, a as HEALTH_INSTITUTES, b as EDUCATION_INSTITUTES, c as EDUCATION_REF_HINT } from "./institutesList-K_M7HDTu.js";
import { T as Textarea } from "./textarea-Af5l_XO3.js";
import { a as sendNotification } from "./notify-Cwv5ExoN.js";
import "./users-DwDKFISD.js";
import "./x-DZawEjNS.js";
import "./heart-Br4iiKEI.js";
import "./index-DN9KZDz1.js";
import "./index-5X8hNaAw.js";
import "./index-CSocGDoZ.js";
import "./index-DWWQzNyi.js";
import "./Combination-VjWgoRzP.js";
import "./index-COEGIzpx.js";
import "./chevron-down-DlKgqB3T.js";
import "./check-gsHmgI_k.js";
const COOLDOWN_DAYS = 30;
const EARLY_REQUEST_AFTER_DAYS = 15;
const MS_DAY = 24 * 60 * 60 * 1e3;
function parseDate(value) {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}
function formatRemaining(ms) {
  if (ms <= 0) return "0 Days 0 Hours";
  const totalMinutes = Math.floor(ms / 6e4);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor(totalMinutes % (60 * 24) / 60);
  return `${days} Days ${hours} Hours Remaining`;
}
function buildCooldownState(cases, options) {
  const empty = {
    phase: "none",
    lastCompletedCaseId: null,
    lastCompletedTitle: null,
    lastCompletedAt: null,
    remainingMs: 0,
    remainingDays: 0,
    remainingHours: 0,
    remainingMinutes: 0,
    elapsedDays: 0,
    canSubmitNormal: true,
    canRequestEarly: false,
    messageTitle: "",
    messageBody: ""
  };
  const list = Array.isArray(cases) ? cases : [];
  const completed = list.filter((c) => String(c.status || "").toLowerCase() === "completed").map((c) => ({
    id: String(c.id),
    title: String(c.title || "Your case"),
    at: parseDate(c.completed_at) || parseDate(c.updated_at) || parseDate(c.created_at) || 0,
    raw: c.completed_at || c.updated_at || c.created_at || null
  })).filter((c) => c.at > 0).sort((a, b) => b.at - a.at);
  if (completed.length === 0) return empty;
  const latest = completed[0];
  const now = Date.now();
  const elapsedMs = Math.max(0, now - latest.at);
  const elapsedDays = elapsedMs / MS_DAY;
  const remainingMs = Math.max(0, COOLDOWN_DAYS * MS_DAY - elapsedMs);
  const remainingDays = Math.floor(remainingMs / MS_DAY);
  const remainingHours = Math.floor(remainingMs % MS_DAY / (60 * 60 * 1e3));
  const remainingMinutes = Math.floor(remainingMs % (60 * 60 * 1e3) / 6e4);
  const earlyRejected = !!(options == null ? void 0 : options.earlyRequestRejected);
  if (remainingMs <= 0) {
    return {
      phase: "ready",
      lastCompletedCaseId: latest.id,
      lastCompletedTitle: latest.title,
      lastCompletedAt: latest.raw ? String(latest.raw) : null,
      remainingMs: 0,
      remainingDays: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      elapsedDays: Math.floor(elapsedDays),
      canSubmitNormal: true,
      canRequestEarly: false,
      messageTitle: "You can now submit a new Help Request",
      messageBody: "Your previous waiting period is over. You may submit a new case if you still need help."
    };
  }
  const base = {
    lastCompletedCaseId: latest.id,
    lastCompletedTitle: latest.title,
    lastCompletedAt: latest.raw ? String(latest.raw) : null,
    remainingMs,
    remainingDays,
    remainingHours,
    remainingMinutes,
    elapsedDays: Math.floor(elapsedDays),
    canSubmitNormal: false
  };
  if (earlyRejected) {
    return {
      ...base,
      phase: "early_locked",
      canRequestEarly: false,
      messageTitle: "Early request was not approved",
      messageBody: "Your early request was rejected. Please wait until the full 30-day period ends before submitting again."
    };
  }
  if (elapsedDays >= EARLY_REQUEST_AFTER_DAYS) {
    return {
      ...base,
      phase: "early_available",
      canRequestEarly: true,
      messageTitle: "Your Help Was Completed",
      messageBody: "You can submit another case after 30 days. After 15 days you may send one early request for admin review (approval is not guaranteed)."
    };
  }
  return {
    ...base,
    phase: "waiting",
    canRequestEarly: false,
    messageTitle: "Your Help Was Completed",
    messageBody: "You can submit another case after 30 days. A limited early-request option appears after 15 days."
  };
}
function detectEarlyRequestRejected(cases) {
  const list = Array.isArray(cases) ? cases : [];
  const completed = list.filter((c) => String(c.status || "").toLowerCase() === "completed").map((c) => ({
    id: String(c.id),
    at: parseDate(c.completed_at) || parseDate(c.updated_at) || parseDate(c.created_at) || 0
  })).filter((c) => c.at > 0).sort((a, b) => b.at - a.at);
  if (completed.length === 0) return false;
  const lastCompletedAt = completed[0].at;
  const earlyRejected = list.some((c) => {
    const st = String(c.status || "").toLowerCase();
    if (st !== "rejected") return false;
    const created = parseDate(c.created_at) || parseDate(c.submitted_at) || 0;
    if (created < lastCompletedAt) return false;
    const details = c.category_details || c.categoryDetails || {};
    return details.is_early_request === true || details.was_early_request === true || c.is_early_request === true || c.was_early_request === true;
  });
  return earlyRejected;
}
function useCompletionCooldown(userId) {
  const [cases, setCases] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [tick, setTick] = reactExports.useState(0);
  const load = reactExports.useCallback(async () => {
    if (!userId) {
      setCases([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getCasesByUser(userId);
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("useCompletionCooldown load error:", err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  reactExports.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 6e4);
    return () => window.clearInterval(id);
  }, []);
  const cooldown = reactExports.useMemo(() => {
    const earlyRejected = detectEarlyRequestRejected(cases);
    return buildCooldownState(cases, { earlyRequestRejected: earlyRejected });
  }, [cases, tick]);
  const remainingLabel = formatRemaining(cooldown.remainingMs);
  return {
    loading,
    cases,
    cooldown,
    remainingLabel,
    refetch: load
  };
}
const WHATSAPP_CHANNEL_URL = "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";
const SUPPORT_WHATSAPP_URL = "https://wa.me/message/42CJXLUYEI2KM1?src=qr";
function SubmitTopBar({
  isFree,
  balance
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-950/30 p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isFree ? "text-green-700 font-bold text-base" : "text-primary font-bold text-base", children: isFree ? "FREE Case" : `Credits: ${balance}` }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 flex-wrap text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: WHATSAPP_CHANNEL_URL, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 font-semibold text-green-700 hover:underline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 shrink-0" }),
        " WhatsApp Channel"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "|" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: SUPPORT_WHATSAPP_URL, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1.5 font-semibold text-primary hover:underline", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4 shrink-0" }),
        " 24/7 Support"
      ] })
    ] })
  ] });
}
const ALL_CATEGORIES = [
  { id: "Electricity Bill", label: "Electricity", emoji: "⚡", color: "#eab308" },
  { id: "Gas Bill", label: "Gas", emoji: "🔥", color: "#f97316" },
  { id: "Water Bill", label: "Water", emoji: "💧", color: "#3b82f6" },
  { id: "House Rent", label: "House Rent", emoji: "🏠", color: "#6366f1" },
  { id: "School, College & University Fees", label: "School/College Fee", emoji: "🎓", color: "#a855f7" },
  { id: "Education, Books & Admission", label: "Education/Books", emoji: "📚", color: "#ec4899" },
  { id: "Medical & Treatment", label: "Medical Treatment", emoji: "🏥", color: "#ef4444" },
  { id: "Medicines", label: "Medicines", emoji: "💊", color: "#f43f5e" },
  { id: "Food & Groceries", label: "Food & Groceries", emoji: "🍲", color: "#10b981" },
  { id: "Child Support", label: "Child Support", emoji: "👶", color: "#06b6d4" },
  { id: "Widow & Elderly Support", label: "Widow/Elderly", emoji: "👵", color: "#14b8a6" },
  { id: "Disability Support", label: "Disability Support", emoji: "♿", color: "#0ea5e9" },
  { id: "Marriage Support", label: "Marriage Support", emoji: "💍", color: "#d946ef" },
  { id: "Business / Work Help", label: "Business Help", emoji: "💼", color: "#f59e0b" },
  { id: "Home Repair", label: "Home Repair", emoji: "🔧", color: "#78716c" },
  { id: "Funeral Expenses", label: "Funeral Expenses", emoji: "🕊️", color: "#6b7280" },
  { id: "Livestock / Farming", label: "Livestock/Farming", emoji: "🐄", color: "#84cc16" },
  { id: "Debt Relief", label: "Debt Relief", emoji: "💰", color: "#8b5cf6" },
  { id: "Emergency Help", label: "Emergency Help", emoji: "🚨", color: "#b91c1c" }
];
const CategoryButton = reactExports.memo(function CategoryButton2({
  cat,
  isSelected,
  onSelect
}) {
  const handleClick = reactExports.useCallback(() => {
    onSelect(cat.id);
  }, [cat.id, onSelect]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick: handleClick,
      "aria-pressed": isSelected,
      style: {
        backgroundColor: cat.color,
        color: "#ffffff",
        borderRadius: "16px",
        padding: "16px 8px",
        minHeight: "90px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        // آئیکون اور نام کے درمیان فاصلہ
        border: "none",
        cursor: "pointer",
        textAlign: "center",
        fontWeight: "600",
        fontSize: "14px",
        lineHeight: "1.3",
        position: "relative",
        boxSizing: "border-box",
        WebkitTapHighlightColor: "transparent",
        userSelect: "none",
        touchAction: "manipulation",
        boxShadow: isSelected ? "inset 0 0 0 4px #000000, 0 6px 20px rgba(0,0,0,0.35)" : "inset 0 0 0 0px transparent, 0 2px 8px rgba(0,0,0,0.12)"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "28px", lineHeight: 1, display: "block" }, children: cat.emoji }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "block", fontSize: "14px", fontWeight: "600" }, children: cat.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            "aria-hidden": !isSelected,
            style: {
              position: "absolute",
              top: "6px",
              right: "6px",
              background: "#ffffff",
              color: "#000000",
              borderRadius: "50%",
              width: "22px",
              height: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "13px",
              fontWeight: "bold",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
              pointerEvents: "none",
              opacity: isSelected ? 1 : 0,
              transform: isSelected ? "scale(1)" : "scale(0.8)",
              transition: "opacity 0.12s ease, transform 0.12s ease"
            },
            children: "✓"
          }
        )
      ]
    }
  );
});
const StepCategory = reactExports.memo(function StepCategory2({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  willBeFree = false,
  isFreeDisabled = false,
  freeCasesUsed = 0
}) {
  const valueRef = reactExports.useRef(value);
  valueRef.current = value;
  const handleSelect = reactExports.useCallback(
    (id) => {
      if (id === valueRef.current) return;
      valueRef.current = id;
      onChange(id);
    },
    [onChange]
  );
  const handleNext = reactExports.useCallback(() => {
    if (valueRef.current) onNext();
  }, [onNext]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "16px", maxWidth: "800px", margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", marginBottom: "24px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }, children: "What do you need help with?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#666", fontSize: "14px" }, children: "Choose the category that best describes your need." }),
      willBeFree && !isFreeDisabled && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          style: {
            display: "inline-block",
            marginTop: "8px",
            padding: "6px 16px",
            borderRadius: "20px",
            background: "#d1fae5",
            color: "#065f46",
            fontSize: "14px",
            fontWeight: "500"
          },
          children: [
            "🎉 ",
            freeCasesUsed === 0 ? "Your first case is FREE!" : "This case is FREE!"
          ]
        }
      ),
      isFreeDisabled && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          style: {
            display: "inline-block",
            marginTop: "8px",
            padding: "6px 16px",
            borderRadius: "20px",
            background: "#fef3c7",
            color: "#92400e",
            fontSize: "14px",
            fontWeight: "500"
          },
          children: "⚠️ Free cases used up. 1 credit fee applies."
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px"
        },
        children: ALL_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          CategoryButton,
          {
            cat,
            isSelected: value === cat.id,
            onSelect: handleSelect
          },
          cat.id
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        style: {
          marginTop: "24px",
          display: "flex",
          gap: "12px",
          justifyContent: "center"
        },
        children: [
          !isFirst && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: onBack,
              style: {
                padding: "10px 24px",
                borderRadius: "8px",
                border: "1px solid #ccc",
                background: "transparent",
                cursor: "pointer",
                flex: 1,
                fontSize: "16px"
              },
              children: "Back"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleNext,
              disabled: !value,
              style: {
                padding: "10px 24px",
                borderRadius: "8px",
                border: "none",
                background: value ? "#00A896" : "#ccc",
                color: "#fff",
                cursor: value ? "pointer" : "not-allowed",
                flex: 1,
                opacity: value ? 1 : 0.6,
                fontSize: "16px",
                fontWeight: "500"
              },
              children: "Next →"
            }
          )
        ]
      }
    )
  ] });
});
function StepNavigation({
  onNext,
  onBack,
  isFirst,
  isLast,
  nextLabel = "Next",
  disabled = false,
  loading = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-4 border-t", children: [
    !isFirst && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        variant: "outline",
        className: "flex-1",
        onClick: onBack,
        disabled: loading,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4 mr-1" }),
          " Back"
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        className: "flex-1",
        onClick: onNext,
        disabled: disabled || loading,
        children: loading ? "Loading..." : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          isLast ? "Submit Request" : nextLabel,
          !isLast && /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 ml-1" })
        ] })
      }
    )
  ] });
}
function StepGuide({ lines }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Helpful guide" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 list-disc space-y-1 pl-4", children: lines.map((line) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: line }, line)) })
  ] });
}
function StepTitle({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "What is the title of your request?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Write a short, clear title that describes your need in a few words." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Request title *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: value || "",
          onChange: (e) => onChange(e.target.value),
          placeholder: placeholder || "e.g. Help with School Fee",
          className: "text-lg py-6",
          autoFocus: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Keep the title short and specific (about 5–12 words).",
          "Example: “Electricity bill for June” or “School fee for one child”.",
          "Do not write your full story here — that comes in Why Help.",
          "Avoid vague titles like “Need help” or “Urgent”."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !(value == null ? void 0 : value.trim())
      }
    )
  ] });
}
function StepShortDesc({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Summarize your need in one line" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This appears as a short summary on your case card." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Short description *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: value || "",
          onChange: (e) => onChange(e.target.value),
          placeholder: placeholder || "e.g. Need assistance with electricity bill for June",
          className: "text-lg py-6",
          autoFocus: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "One clear sentence is enough.",
          "Mention what you need and for which month/person if relevant.",
          "This is not the full story — full details come later in Why Help.",
          "Keep it honest and easy to understand."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !(value == null ? void 0 : value.trim())
      }
    )
  ] });
}
function StepCountry({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Which country are you in?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Select the country where you currently live." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Country *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value || "", onValueChange: onChange, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "text-base py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select country" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (COUNTRIES || []).map((c) => {
          const name = typeof c === "string" ? c : c.name || c.label;
          return /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: name, children: name }, name);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Select the country of your current residence.",
          "This helps matching and verification for your case.",
          "Choose carefully — it should match your documents."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !value
      }
    )
  ] });
}
function StepCity({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Which city are you in?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enter the city where you currently live." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "City *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: value || "",
          onChange: (e) => onChange(e.target.value),
          placeholder: placeholder || "e.g. Karachi",
          className: "text-lg py-6",
          autoFocus: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Write the city name clearly (e.g. Karachi, Lahore, Islamabad).",
          "Use the city that matches your current residence.",
          "Avoid village-only names if a nearby city is used on your documents."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !(value == null ? void 0 : value.trim())
      }
    )
  ] });
}
const OPTIONS$3 = [
  {
    value: "Emergency",
    icon: "🚨",
    label: "Emergency",
    hint: "Need help within days"
  },
  {
    value: "Medium",
    icon: "⏰",
    label: "Medium",
    hint: "Need help within a few weeks"
  },
  {
    value: "Low",
    icon: "📅",
    label: "Low",
    hint: "Can wait longer if needed"
  }
];
function StepUrgency({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "How urgent is your need?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Choose the option that best matches your real timeline." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Urgency *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3", children: OPTIONS$3.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange(opt.value),
          className: `p-4 rounded-xl border-2 text-left transition-all ${value === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: opt.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: opt.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: opt.hint })
            ] })
          ] })
        },
        opt.value
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Select urgency honestly based on your real deadline.",
          "Emergency is for needs within a few days.",
          "False urgency can hurt trust and slow approval.",
          "Some bill categories may set urgency from the due date automatically."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !value
      }
    )
  ] });
}
const GENDER_OPTIONS = [
  { value: "Male", icon: "👨", label: "Male" },
  { value: "Female", icon: "👩", label: "Female" },
  { value: "Child", icon: "🧒", label: "Child" }
];
function StepGender({ value, onChange, onNext, onBack, isFirst, isLast }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Select your gender" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This decides which identity documents we will ask for next." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gender *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: GENDER_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => onChange(opt.value),
          className: `p-6 rounded-xl border-2 text-center transition-all ${value === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-4xl mb-2", children: opt.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: opt.label })
          ]
        },
        opt.value
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Male / Female: you will select marital status, then upload matching documents (FRC, Nikah Nama, etc.).",
          "Child: B-Form and FRC are required. Orphan status may also be asked.",
          "Choose carefully — required documents depend on this selection."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !value
      }
    )
  ] });
}
const OPTIONS$2 = ["Single", "Married", "Widow", "Divorced"];
function StepMaritalStatus({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "What is your marital status?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This helps us understand your family situation and required documents." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Marital status *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: OPTIONS$2.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange(opt),
          className: `p-4 rounded-xl border-2 text-center transition-all ${value === opt ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: opt })
        },
        opt
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Single: Family Registration Certificate (FRC) is required.",
          "Married: Nikah Nama and FRC are required.",
          "Widow / Widower: death certificate, Nikah Nama, and FRC are required.",
          "Divorced: court divorce certificate, Nikah Nama, and FRC are required."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !value
      }
    )
  ] });
}
function StepOrphan({ value, onChange, onNext, onBack, isFirst, isLast }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Are you an orphan?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This information helps us provide targeted support and request the right proof." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Orphan status *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: ["Yes", "No"].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => onChange(opt),
          className: `p-6 rounded-xl border-2 text-center transition-all ${value === opt ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl mb-1", children: opt === "Yes" ? "🙏" : "✅" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: opt })
          ]
        },
        opt
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "If Yes, you will select which parent passed away.",
          "You must upload the parent's death certificate in the documents step.",
          "Answer honestly — this is used for verification."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !value
      }
    )
  ] });
}
const OPTIONS$1 = ["Father", "Mother", "Both"];
function StepOrphanParent({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Which parent passed away?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This helps us request the correct orphan proof document." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Parent *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: OPTIONS$1.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onChange(opt),
          className: `p-4 rounded-xl border-2 text-center transition-all ${value === opt ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: opt })
        },
        opt
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Select Father, Mother, or Both.",
          "You must upload the matching death certificate in identity documents.",
          "Answer honestly — this is used for verification."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !value
      }
    )
  ] });
}
function DocBox({ label, required, hint, accept = "image/*,.pdf", onUpload, value }) {
  const [uploading, setUploading] = reactExports.useState(false);
  const handleChange = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFileToStorage(file, `docs/${Date.now()}_${file.name}`);
      onUpload(url);
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border p-3 space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { className: "text-sm", children: [
      label,
      " ",
      required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
    ] }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: hint }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "file",
        accept,
        onChange: handleChange,
        className: "block w-full text-sm text-muted-foreground"
      }
    ),
    uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "⏳ Uploading..." }),
    value && !uploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600 flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
      " Uploaded ✓"
    ] })
  ] });
}
function getRequiredDocs(gender, maritalStatus, isOrphan) {
  const list = [];
  if (gender === "Male") {
    if (maritalStatus === "Single") {
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for single male"
      });
    }
    if (maritalStatus === "Married") {
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate)",
        hint: "Required for married male"
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for married male"
      });
    }
    if (maritalStatus === "Widow") {
      list.push({
        key: "wife_death_cert",
        label: "Wife's Death Certificate",
        hint: "Death certificate of the deceased wife"
      });
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate)",
        hint: "Marriage certificate with the deceased wife"
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for widower"
      });
    }
    if (maritalStatus === "Divorced") {
      list.push({
        key: "divorce_cert",
        label: "Divorce Certificate (Court issued)",
        hint: "Court-issued divorce certificate"
      });
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate from ex-spouse)",
        hint: "Marriage certificate from ex-spouse"
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for divorced male"
      });
    }
  }
  if (gender === "Female") {
    if (maritalStatus === "Single") {
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for single female"
      });
    }
    if (maritalStatus === "Married") {
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate)",
        hint: "Required for married female"
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for married female"
      });
    }
    if (maritalStatus === "Widow") {
      list.push({
        key: "husband_death_cert",
        label: "Husband's Death Certificate",
        hint: "Death certificate of the deceased husband"
      });
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate)",
        hint: "Marriage certificate with the deceased husband"
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for widow"
      });
    }
    if (maritalStatus === "Divorced") {
      list.push({
        key: "divorce_cert",
        label: "Divorce Certificate (Court issued)",
        hint: "Court-issued divorce certificate"
      });
      list.push({
        key: "nikah_nama",
        label: "Nikah Nama (Marriage Certificate from ex-spouse)",
        hint: "Marriage certificate from ex-spouse"
      });
      list.push({
        key: "frc",
        label: "Family Registration Certificate (FRC)",
        hint: "Required for divorced female"
      });
    }
    if (isOrphan === "Yes") {
      list.push({
        key: "orphan_proof",
        label: "Orphan Proof (Parent's Death Certificate)",
        hint: "Required because you selected orphan"
      });
    }
  }
  if (gender === "Child") {
    list.push({
      key: "b_form",
      label: "B-Form (Child's ID)",
      hint: "Required for child cases"
    });
    list.push({
      key: "frc",
      label: "Family Registration Certificate (FRC)",
      hint: "Required for child cases"
    });
    if (isOrphan === "Yes") {
      list.push({
        key: "orphan_proof",
        label: "Orphan Proof (Parent's Death Certificate)",
        hint: "Required because the child is an orphan"
      });
    }
  }
  return list;
}
function StepGenderDocuments({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const gender = (formData == null ? void 0 : formData.gender) || "";
  const maritalStatus = (formData == null ? void 0 : formData.maritalStatus) || "";
  const isOrphan = (formData == null ? void 0 : formData.isOrphan) || "";
  const genderDocUrls = (formData == null ? void 0 : formData.genderDocUrls) || {};
  const requiredDocs = getRequiredDocs(gender, maritalStatus, isOrphan);
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      genderDocUrls: { ...prev.genderDocUrls || {}, [key]: url }
    }));
  };
  const allUploaded = requiredDocs.length === 0 || requiredDocs.every((doc) => !!genderDocUrls[doc.key]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Upload identity documents" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "These documents depend on your gender, marital status, and orphan status. Clear photos are required for verification." })
    ] }),
    requiredDocs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No extra identity documents are required for this selection. You can continue." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: requiredDocs.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      DocBox,
      {
        label: doc.label,
        required: true,
        hint: doc.hint,
        onUpload: (url) => setDoc(doc.key, url),
        value: genderDocUrls[doc.key]
      },
      doc.key
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Upload clear, readable photos of each required document.",
          "Documents must match the gender and marital status you selected.",
          "If you are an orphan, include the parent's death certificate.",
          "For a child case, B-Form and FRC are always required."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !allUploaded
      }
    )
  ] });
}
function StepSeekerName({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Your full name" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your name exactly as it appears on your CNIC or ID." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full name *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: value || "",
          onChange: (e) => onChange(e.target.value),
          placeholder: placeholder || "Your full name",
          className: "text-lg py-6",
          autoFocus: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Use the same name as on your CNIC / official ID.",
          "Do not use nicknames or incomplete names.",
          "This name is used for verification and case records."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !(value == null ? void 0 : value.trim())
      }
    )
  ] });
}
function StepSeekerContact({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  placeholder
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Your contact number" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "A working phone number so we can reach you for verification." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact number *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: value || "",
          onChange: (e) => onChange(e.target.value),
          placeholder: placeholder || "Your phone",
          className: "text-lg py-6",
          autoFocus: true
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Use an active number that you answer regularly.",
          "Include country code if you are outside Pakistan when relevant.",
          "Wrong numbers delay verification and approval."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !(value == null ? void 0 : value.trim())
      }
    )
  ] });
}
function StepJobStatus({ value, onChange, onNext, onBack, isFirst, isLast }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Do you have a job?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This helps us understand your financial situation for verification." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Job status *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [
        { v: "Yes", icon: "💼", label: "Yes, I have a job" },
        { v: "No", icon: "🚫", label: "No, I don't have a job" }
      ].map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => onChange(opt.v),
          className: `p-6 rounded-xl border-2 text-center transition-all ${value === opt.v ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl mb-1", children: opt.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sm", children: opt.label })
          ]
        },
        opt.v
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "If you have been jobless for more than one year but still have old salary records, select Yes and upload your last salary slip plus a current bank statement.",
          "Select No only if you truly have no employment income.",
          "Next step will ask for the matching documents."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !value
      }
    )
  ] });
}
function StepJobDocuments({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const { salarySlipUrl, statementUrl } = formData;
  const setDoc = (key, url) => {
    setFormData((prev) => ({ ...prev, [key]: url }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Upload your job documents" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Required because you selected that you have a job (or recent employment history)." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DocBox,
          {
            label: "Last 6 months salary slip",
            required: true,
            hint: "Clear photo or PDF of salary slips",
            onUpload: (url) => setDoc("salarySlipUrl", url),
            value: salarySlipUrl
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DocBox,
          {
            label: "Last 6 months bank statement",
            required: true,
            hint: "Original bank statement preferred for serious cases — not only a micro-wallet screenshot",
            accept: ".pdf,image/*",
            onUpload: (url) => setDoc("statementUrl", url),
            value: statementUrl
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Upload salary slips covering the last 6 months when available.",
          "Upload a real bank statement that shows your financial situation.",
          "Do not rely only on a micro-account or wallet screenshot for large or serious cases.",
          "If you lost your job more than a year ago, still upload the last salary slip you have plus a current statement."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !salarySlipUrl || !statementUrl
      }
    )
  ] });
}
function StepNoJobDocument({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const { statementUrl } = formData;
  const setDoc = (key, url) => {
    setFormData((prev) => ({ ...prev, [key]: url }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Upload your bank statement" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Required because you selected that you do not have a job." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        DocBox,
        {
          label: "Last 6 months bank statement",
          required: true,
          hint: "Original bank statement preferred — EasyPaisa/JazzCash alone is weak for serious cases",
          accept: ".pdf,image/*",
          onUpload: (url) => setDoc("statementUrl", url),
          value: statementUrl
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Upload a clear 6-month bank statement.",
          "For serious cases, prefer an original bank statement over only a micro-wallet history.",
          "This helps verification of your financial need."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !statementUrl
      }
    )
  ] });
}
function BaseCategoryForm({
  title,
  subtitle,
  guide,
  children,
  onNext,
  onBack,
  isFirst,
  isLast,
  disabled,
  submitting
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: title }),
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: subtitle }),
      guide && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: guide })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst: !!isFirst,
        isLast: !!isLast,
        disabled: !!disabled || !!submitting
      }
    )
  ] });
}
const CATEGORY_LIMITS = {
  "Widow & Elderly Support": { type: "fixed", amount: 6e3, label: "Fixed Stipend" },
  "Child Support": { type: "fixed", amount: 6e3, label: "Fixed Stipend" },
  "Disability Support": { type: "fixed", amount: 6e3, label: "Fixed Stipend" },
  "Emergency Help": { type: "fixed", amount: 3e3, label: "Fixed Emergency Help" },
  "Livestock / Farming": { type: "fixed", amount: 8e3, label: "Fixed Farming Help" },
  "Electricity Bill": { type: "verified", label: "1 Month Verified Bill" },
  "Gas Bill": { type: "verified", label: "1 Month Verified Bill" },
  "Water Bill": { type: "verified", label: "1 Month Verified Bill" },
  "House Rent": { type: "verified", label: "1 Month Verified Rent" },
  "School, College & University Fees": { type: "verified", label: "1 Student / 1 Month Verified Fee" },
  "Education, Books & Admission": { type: "verified", label: "Verified Cost" },
  "Food & Groceries": { type: "max", maxAmount: 12e3, label: "Max Rs 12,000 per family" },
  "Medicines": { type: "verified", label: "Verified Prescription Cost" },
  "Medical & Treatment": { type: "verified", label: "Verified Treatment Bill" },
  "Home Repair": { type: "max", maxAmount: 18e3, label: "Max Rs 18,000" },
  "Debt Relief": { type: "debt_percentage", percentage: 5, maxAmount: 25e3, label: "5% of debt (max Rs 25,000)" },
  "Business / Work Help": { type: "max", maxAmount: 2e4, label: "Rs 8,000–20,000" },
  "Marriage Support": { type: "verified", label: "Verified Need" },
  "Funeral Expenses": { type: "verified", label: "Verified Need" }
};
const CASE_CURRENCIES = ["PKR", "USD", "SAR", "AED", "GBP", "EUR", "INR", "BDT", "TRY"];
const UTILITY_CATS = {
  "Electricity Bill": { companies: ELECTRICITY_COMPANIES },
  "Gas Bill": { companies: GAS_COMPANIES },
  "Water Bill": { companies: WATER_COMPANIES }
};
const EDUCATION_SUB_OPTIONS = [
  { value: "admission", label: "🎓 Admission Fee" },
  { value: "books", label: "📚 Books / Study Materials" },
  { value: "uniform", label: "👕 Uniform / Shoes" }
];
const FEE_SUB_OPTIONS = [
  { value: "school", label: "🏫 School Fee" },
  { value: "college", label: "🎓 College Fee" },
  { value: "university", label: "🏛️ University Fee" }
];
const EDUCATION_ADMISSION_FIELDS = {
  School: [
    { key: "institute_name", label: "School Name", required: true, placeholder: "e.g. Beaconhouse School System" },
    { key: "class_grade", label: "Class / Grade", required: true, placeholder: "e.g. Grade 8" },
    { key: "admission_type", label: "Admission Type", required: true, choices: ["New Admission", "Re-admission", "Transfer"] },
    { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed"] }
  ],
  College: [
    { key: "institute_name", label: "College Name", required: true, placeholder: "e.g. Government College University" },
    { key: "program", label: "Program / Class", required: true, choices: ["FA", "FSc", "ICS", "I.Com", "Other"] },
    { key: "year", label: "Year", required: true, choices: ["1st Year", "2nd Year"] },
    { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed"] }
  ],
  University: [
    { key: "institute_name", label: "University Name", required: true, placeholder: "e.g. National University of Modern Languages" },
    { key: "program_degree", label: "Program / Degree", required: true, placeholder: "e.g. BS Psychology" },
    { key: "semester_year", label: "Semester / Year", required: true, placeholder: "e.g. Fall 2026" },
    { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed", "Waiting List"] }
  ]
};
const EDUCATION_FEE_FIELDS = {
  School: [
    { key: "institute_name", label: "School Name", required: true, placeholder: "e.g. Beaconhouse School System" },
    { key: "class_grade", label: "Class / Grade", required: true, placeholder: "e.g. Grade 8" },
    { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" }
  ],
  College: [
    { key: "institute_name", label: "College Name", required: true, placeholder: "e.g. Government College University" },
    { key: "program", label: "Program / Class", required: true, choices: ["FA", "FSc", "ICS", "I.Com", "Other"] },
    { key: "year", label: "Year", required: true, choices: ["1st Year", "2nd Year"] },
    { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" }
  ],
  University: [
    { key: "institute_name", label: "University Name", required: true, placeholder: "e.g. National University of Modern Languages" },
    { key: "program_degree", label: "Program / Degree", required: true, placeholder: "e.g. BS Psychology" },
    { key: "semester_year", label: "Semester / Year", required: true, placeholder: "e.g. Fall 2026" },
    { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" }
  ]
};
function getEducationDocs(type, subType) {
  const docs = [];
  if (type === "admission") {
    docs.push({ key: "admission_proof", label: "Admission / Selection Proof", required: true, hint: "Clear photo of offer letter or merit list" });
    docs.push({ key: "fee_challan", label: "Fee Challan / Voucher", required: true, hint: "Challan should clearly show amount and due date" });
    docs.push({ key: "student_id_proof", label: "Student B-Form / CNIC / School ID", required: true, hint: "Clear proof of student identity" });
  } else if (type === "fee") {
    docs.push({ key: "fee_challan", label: "Fee Challan / Voucher", required: true, hint: "Challan should clearly show amount and due date" });
    docs.push({ key: "student_id_proof", label: "Student B-Form / CNIC / School ID", required: true, hint: "Clear proof of student identity" });
  } else if (type === "books") {
    docs.push({ key: "books_quotation", label: "Books List / Quotation", required: true, hint: "Clear photo of book list and price quotation" });
    docs.push({ key: "student_id_proof", label: "Student B-Form / School/College ID", required: true, hint: "Student identity proof" });
  } else if (type === "uniform") {
    docs.push({ key: "uniform_quotation", label: "Uniform List / Quotation", required: true, hint: "Clear photo of uniform items and price quotation" });
    docs.push({ key: "student_id_proof", label: "Student B-Form / School/College ID", required: true, hint: "Student identity proof" });
    docs.push({ key: "uniform_items", label: "Items Needed", required: true, hint: "List of uniform items (shoes, bag, winter uniform etc.)" });
  }
  return docs;
}
const LIST_CATS = {
  "School, College & University Fees": {
    list: EDUCATION_INSTITUTES,
    refLabel: "Fee Challan / Voucher Number",
    refHint: EDUCATION_REF_HINT,
    personFields: [
      { key: "student_name", label: "Student's Name (ONE student)", required: true, placeholder: "Full name of student" },
      { key: "father_name", label: "Father's Name", required: true, placeholder: "Father's full name" },
      { key: "roll_no", label: "Roll No / Registration No", required: true, placeholder: "Student's roll number" }
    ],
    billLabel: "Fee Challan / Voucher Photo",
    isEducationCategory: true,
    subOptions: FEE_SUB_OPTIONS,
    getSubFields: (subType, subValue) => {
      if (subType === "school") return EDUCATION_FEE_FIELDS.School;
      if (subType === "college") return EDUCATION_FEE_FIELDS.College;
      if (subType === "university") return EDUCATION_FEE_FIELDS.University;
      return [];
    },
    getSubDocs: (subType, subValue) => getEducationDocs("fee")
  },
  "Education, Books & Admission": {
    list: EDUCATION_INSTITUTES,
    refLabel: "Challan / Reference Number",
    refHint: "If available, enter the challan or quotation reference number",
    personFields: [
      { key: "student_name", label: "Student's Name (ONE student)", required: true, placeholder: "Full name of student" },
      { key: "student_class", label: "Class / Grade / Program", required: true, placeholder: "e.g. Grade 8, FA, BS" }
    ],
    billLabel: "Bill / Challan / Quotation Photo",
    isEducationCategory: true,
    subOptions: EDUCATION_SUB_OPTIONS,
    getSubFields: (subType, subValue) => {
      if (subType === "admission") {
        if (subValue === "School") return EDUCATION_ADMISSION_FIELDS.School;
        if (subValue === "College") return EDUCATION_ADMISSION_FIELDS.College;
        if (subValue === "University") return EDUCATION_ADMISSION_FIELDS.University;
        return [];
      }
      return [];
    },
    getSubDocs: (subType, subValue) => getEducationDocs(subType)
  },
  "Medical & Treatment": {
    list: HEALTH_INSTITUTES,
    refLabel: "Bill / Invoice / MR Number",
    refHint: HEALTH_REF_HINT,
    personFields: [
      { key: "patient_name", label: "Patient's Name (ONE patient)", required: true, placeholder: "Full name of patient" },
      { key: "illness", label: "Illness / Treatment Needed", required: true, placeholder: "Brief description of illness" }
    ],
    billLabel: "Hospital Bill / Medical Receipt Photo"
  },
  "Medicines": {
    list: HEALTH_INSTITUTES,
    refLabel: "Invoice / Prescription Number (if any)",
    refHint: HEALTH_REF_HINT,
    personFields: [
      { key: "patient_name", label: "Patient's Name (ONE patient)", required: true, placeholder: "Full name of patient" },
      { key: "illness", label: "Illness / Condition", required: true, placeholder: "Brief description of condition" }
    ],
    billLabel: "Prescription / Medicine Estimate Photo",
    extraDocs: [
      { key: "doctor_report", label: "Doctor's Report / Prescription", required: true, hint: "Clear photo of the doctor's written report or prescription" }
    ]
  }
};
const PAYMENT_RECEIVER_CATS = /* @__PURE__ */ new Set([
  "House Rent",
  "Food & Groceries",
  "Medicines",
  "Home Repair",
  "Debt Relief",
  "Business / Work Help",
  "Marriage Support",
  "Funeral Expenses",
  "Livestock / Farming",
  "Emergency Help",
  "Other"
]);
const PROPERTY_RELEVANT_CATS = /* @__PURE__ */ new Set(["Electricity Bill", "Gas Bill", "Water Bill", "House Rent", "Food & Groceries"]);
const CHOICE_FIELDS = {
  parents_status: ["Both alive", "Father passed away", "Mother passed away", "Both passed away"],
  disability_type: ["Physical", "Visual", "Hearing", "Intellectual", "Other"],
  relation: ["My daughter", "My son", "My sister", "My brother", "Myself", "Other relative"],
  deceased_relation: ["My father", "My mother", "My husband", "My wife", "My child", "Other relative"]
};
function isEasyCat(cat) {
  return !!UTILITY_CATS[cat] || !!LIST_CATS[cat];
}
function getCategoryLimit(category) {
  return CATEGORY_LIMITS[category] || null;
}
function getFixedAmount(category) {
  const limit = getCategoryLimit(category);
  return (limit == null ? void 0 : limit.type) === "fixed" ? limit.amount || null : null;
}
function getMaxAmount(category) {
  const limit = getCategoryLimit(category);
  if ((limit == null ? void 0 : limit.type) === "max") return limit.maxAmount || null;
  if ((limit == null ? void 0 : limit.type) === "debt_percentage") return limit.maxAmount || null;
  return null;
}
function calculateDebtAmount(debtTotal) {
  const limit = CATEGORY_LIMITS["Debt Relief"];
  if (!limit || limit.type !== "debt_percentage") return 0;
  const percentage = limit.percentage;
  const maxAmount = limit.maxAmount;
  const calculated = debtTotal * percentage / 100;
  return Math.min(calculated, maxAmount);
}
function getMaxLimit(category) {
  return getMaxAmount(category);
}
function isDebtCategory(category) {
  return category === "Debt Relief";
}
function ElectricityBillForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  var _a;
  const companies = ((_a = UTILITY_CATS["Electricity Bill"]) == null ? void 0 : _a.companies) || [];
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const instituteName = formData.instituteName || catFields.company || "";
  const refNumber = formData.refNumber || "";
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setTop = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const onCompanyChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      instituteName: name,
      catFields: { ...prev.catFields || {}, company: name }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a2;
    return !!instituteName.trim() && !!refNumber.trim() && !!((_a2 = catFields.bill_owner_name) == null ? void 0 : _a2.trim()) && !!catDocUrls.bill;
  }, [instituteName, refNumber, catFields.bill_owner_name, catDocUrls.bill]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Electricity Bill",
      subtitle: "One month verified electricity bill only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Electricity company *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: instituteName, onValueChange: onCompanyChange, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select company" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: companies.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.name, children: c.name }, c.name)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Consumer reference number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: refNumber,
                onChange: (e) => setTop("refNumber", e.target.value),
                placeholder: "Reference / consumer number on the bill"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bill owner name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.bill_owner_name || "",
                onChange: (e) => setField("bill_owner_name", e.target.value),
                placeholder: "Name printed on the bill"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Electricity bill photo (ONE month only)",
              required: true,
              hint: "Clear photo of a single current month bill — not old dues or multiple months",
              onUpload: (url) => setDoc("bill", url),
              value: catDocUrls.bill
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Upload only ONE month electricity bill — the current due month.",
              "Do not submit arrears, old dues, or multiple months combined.",
              "Reference number and owner name must match the bill photo.",
              "Blurry or incomplete bills can cause rejection."
            ]
          }
        )
      ]
    }
  );
}
function GasBillForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  var _a;
  const companies = ((_a = UTILITY_CATS["Gas Bill"]) == null ? void 0 : _a.companies) || [];
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const instituteName = formData.instituteName || catFields.company || "";
  const refNumber = formData.refNumber || "";
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setTop = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const onCompanyChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      instituteName: name,
      catFields: { ...prev.catFields || {}, company: name }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a2;
    return !!instituteName.trim() && !!refNumber.trim() && !!((_a2 = catFields.bill_owner_name) == null ? void 0 : _a2.trim()) && !!catDocUrls.bill;
  }, [instituteName, refNumber, catFields.bill_owner_name, catDocUrls.bill]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Gas Bill",
      subtitle: "One month verified gas bill only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Gas company *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: instituteName, onValueChange: onCompanyChange, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select company" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: companies.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.name, children: c.name }, c.name)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Consumer reference number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: refNumber,
                onChange: (e) => setTop("refNumber", e.target.value),
                placeholder: "Reference / consumer number on the bill"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bill owner name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.bill_owner_name || "",
                onChange: (e) => setField("bill_owner_name", e.target.value),
                placeholder: "Name printed on the bill"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Gas bill photo (ONE month only)",
              required: true,
              hint: "Clear photo of a single current month bill — not arrears",
              onUpload: (url) => setDoc("bill", url),
              value: catDocUrls.bill
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Upload only ONE month gas bill — the current due month.",
              "Do not include old dues, arrears, or multiple months.",
              "Company, reference number, and owner name must match the bill.",
              "Clear, readable photo is required for verification."
            ]
          }
        )
      ]
    }
  );
}
function WaterBillForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  var _a;
  const companies = ((_a = UTILITY_CATS["Water Bill"]) == null ? void 0 : _a.companies) || [];
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const instituteName = formData.instituteName || catFields.company || "";
  const refNumber = formData.refNumber || "";
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setTop = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const onCompanyChange = (name) => {
    setFormData((prev) => ({
      ...prev,
      instituteName: name,
      catFields: { ...prev.catFields || {}, company: name }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a2;
    return !!instituteName.trim() && !!refNumber.trim() && !!((_a2 = catFields.bill_owner_name) == null ? void 0 : _a2.trim()) && !!catDocUrls.bill;
  }, [instituteName, refNumber, catFields.bill_owner_name, catDocUrls.bill]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Water Bill",
      subtitle: "One month verified water bill only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Water company / board *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: instituteName, onValueChange: onCompanyChange, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select company" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: companies.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.name, children: c.name }, c.name)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Consumer reference number *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: refNumber,
                onChange: (e) => setTop("refNumber", e.target.value),
                placeholder: "Reference / consumer number on the bill"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bill owner name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.bill_owner_name || "",
                onChange: (e) => setField("bill_owner_name", e.target.value),
                placeholder: "Name printed on the bill"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Water bill photo (ONE month only)",
              required: true,
              hint: "Clear photo of a single current month bill — not arrears",
              onUpload: (url) => setDoc("bill", url),
              value: catDocUrls.bill
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Upload only ONE month water bill — the current due month.",
              "Do not submit arrears, old dues, or multiple months.",
              "Reference number and owner name must match the bill photo.",
              "Clear photo is required for verification."
            ]
          }
        )
      ]
    }
  );
}
function SchoolFeesForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const eduSubType = formData.eduSubType || catFields.edu_sub_type || "";
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const onSubTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      eduSubType: value,
      catFields: { ...prev.catFields || {}, edu_sub_type: value }
    }));
  };
  const subFields = eduSubType === "school" ? EDUCATION_FEE_FIELDS.School : eduSubType === "college" ? EDUCATION_FEE_FIELDS.College : eduSubType === "university" ? EDUCATION_FEE_FIELDS.University : [];
  const isValid = reactExports.useMemo(() => {
    var _a, _b, _c;
    if (!eduSubType) return false;
    if (!((_a = catFields.student_name) == null ? void 0 : _a.trim())) return false;
    if (!((_b = catFields.father_name) == null ? void 0 : _b.trim())) return false;
    if (!((_c = catFields.roll_no) == null ? void 0 : _c.trim())) return false;
    for (const field of subFields) {
      if (field.required && !String(catFields[field.key] || "").trim()) return false;
    }
    if (!catDocUrls.fee_challan) return false;
    if (!catDocUrls.student_id_proof) return false;
    return true;
  }, [eduSubType, catFields, catDocUrls, subFields]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "School, College & University Fees",
      subtitle: "ONE student · ONE month verified fee only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fee type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: eduSubType, onValueChange: onSubTypeChange, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select fee type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FEE_SUB_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Student's name (ONE student only) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.student_name || "",
                onChange: (e) => setField("student_name", e.target.value),
                placeholder: "Full name of one student"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Father's name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.father_name || "",
                onChange: (e) => setField("father_name", e.target.value),
                placeholder: "Father's full name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Roll no / registration no *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.roll_no || "",
                onChange: (e) => setField("roll_no", e.target.value),
                placeholder: "Student roll or registration number"
              }
            )
          ] }),
          subFields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              field.label,
              " ",
              field.required ? "*" : ""
            ] }),
            field.choices ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: catFields[field.key] || "",
                onValueChange: (v) => setField(field.key, v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: `Select ${field.label}` }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: field.choices.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields[field.key] || "",
                onChange: (e) => setField(field.key, e.target.value),
                placeholder: field.placeholder || field.label
              }
            )
          ] }, field.key)),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Fee challan / voucher (ONE month)",
              required: true,
              hint: "Challan must show amount and due date clearly",
              onUpload: (url) => setDoc("fee_challan", url),
              value: catDocUrls.fee_challan
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Student ID proof (B-Form / CNIC / School ID)",
              required: true,
              hint: "Clear proof of student identity",
              onUpload: (url) => setDoc("student_id_proof", url),
              value: catDocUrls.student_id_proof
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "This case is for ONE student only — do not combine multiple children.",
              "Upload fee for ONE month only — not a full year or multiple terms.",
              "Fee challan must clearly show student name, amount, and due date.",
              "Student identity proof is required for verification."
            ]
          }
        )
      ]
    }
  );
}
function MedicalTreatmentForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const refNumber = formData.refNumber || "";
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setTop = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a, _b, _c;
    return !!((_a = catFields.patient_name) == null ? void 0 : _a.trim()) && !!((_b = catFields.illness) == null ? void 0 : _b.trim()) && !!((_c = catFields.hospital_name) == null ? void 0 : _c.trim()) && !!catDocUrls.medical_bill;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Medical & Treatment",
      subtitle: "ONE patient · verified treatment bill only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Patient's name (ONE patient only) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.patient_name || "",
                onChange: (e) => setField("patient_name", e.target.value),
                placeholder: "Full name of one patient"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Illness / treatment needed *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.illness || "",
                onChange: (e) => setField("illness", e.target.value),
                placeholder: "Brief description of illness or treatment"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hospital / clinic name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.hospital_name || "",
                onChange: (e) => setField("hospital_name", e.target.value),
                placeholder: "Hospital or clinic name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bill / invoice / MR number (if any)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: refNumber,
                onChange: (e) => setTop("refNumber", e.target.value),
                placeholder: "Optional reference number"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Hospital bill / medical receipt",
              required: true,
              hint: "Clear photo of the verified treatment bill for one patient",
              onUpload: (url) => setDoc("medical_bill", url),
              value: catDocUrls.medical_bill
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "This case is for ONE patient only — do not combine multiple patients.",
              "Upload a clear hospital bill or medical receipt that shows the amount.",
              "Patient name and illness details must match the documents.",
              "Blurry or incomplete bills can delay or reject the case."
            ]
          }
        )
      ]
    }
  );
}
function MedicinesForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const refNumber = formData.refNumber || "";
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setTop = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a, _b;
    return !!((_a = catFields.patient_name) == null ? void 0 : _a.trim()) && !!((_b = catFields.illness) == null ? void 0 : _b.trim()) && !!catDocUrls.medicine_estimate && !!catDocUrls.doctor_report;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Medicines",
      subtitle: "ONE patient · verified prescription cost only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Patient's name (ONE patient only) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.patient_name || "",
                onChange: (e) => setField("patient_name", e.target.value),
                placeholder: "Full name of one patient"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Illness / condition *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.illness || "",
                onChange: (e) => setField("illness", e.target.value),
                placeholder: "Brief description of condition"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice / prescription number (if any)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: refNumber,
                onChange: (e) => setTop("refNumber", e.target.value),
                placeholder: "Optional reference"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Prescription / medicine estimate photo",
              required: true,
              hint: "Clear estimate or list of medicines with prices",
              onUpload: (url) => setDoc("medicine_estimate", url),
              value: catDocUrls.medicine_estimate
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Doctor's report / prescription",
              required: true,
              hint: "Clear photo of the doctor's written report or prescription",
              onUpload: (url) => setDoc("doctor_report", url),
              value: catDocUrls.doctor_report
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "This case is for ONE patient only.",
              "Upload both the medicine estimate and the doctor's prescription / report.",
              "Payment receiver (pharmacy / shop) details will be asked in the next step for this category.",
              "Documents must be clear and readable for verification."
            ]
          }
        )
      ]
    }
  );
}
function ChildSupportForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const parentsOptions = CHOICE_FIELDS.parents_status || [];
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a;
    return !!((_a = catFields.child_name) == null ? void 0 : _a.trim()) && !!catFields.child_age && !!catFields.parents_status && !!catDocUrls.child_b_form && !!catDocUrls.parents_proof;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Child Support",
      subtitle: "Fixed stipend Rs 6,000 · verified child need",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Child's name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.child_name || "",
                onChange: (e) => setField("child_name", e.target.value),
                placeholder: "Full name of the child"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Child's age *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: catFields.child_age || "",
                onChange: (e) => setField("child_age", e.target.value),
                placeholder: "Age in years"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Parents status *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: catFields.parents_status || "",
                onValueChange: (v) => setField("parents_status", v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select parents status" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: parentsOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt, children: opt }, opt)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "B-Form / birth certificate",
              required: true,
              hint: "Clear photo of child's B-Form or birth certificate",
              onUpload: (url) => setDoc("child_b_form", url),
              value: catDocUrls.child_b_form
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Proof of parents' status",
              required: true,
              hint: "Death certificate or other proof matching parents status",
              onUpload: (url) => setDoc("parents_proof", url),
              value: catDocUrls.parents_proof
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "This category has a fixed stipend of Rs 6,000.",
              "Upload clear B-Form and parents status proof.",
              "Details must match the documents exactly.",
              "False information can lead to rejection."
            ]
          }
        )
      ]
    }
  );
}
const STATUS_OPTIONS = ["Widow", "Elderly"];
function WidowElderlyForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isWidow = catFields.status === "Widow";
  const isValid = reactExports.useMemo(() => {
    var _a;
    if (!catFields.status) return false;
    if (!((_a = catFields.full_name) == null ? void 0 : _a.trim())) return false;
    if (!catFields.age) return false;
    if (!catDocUrls.cnic) return false;
    if (isWidow && !catDocUrls.death_cert) return false;
    return true;
  }, [catFields, catDocUrls, isWidow]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Widow & Elderly Support",
      subtitle: "Fixed stipend Rs 6,000 · verified need",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: catFields.status || "",
                onValueChange: (v) => setField("status", v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select status" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STATUS_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt, children: opt }, opt)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Full name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.full_name || "",
                onChange: (e) => setField("full_name", e.target.value),
                placeholder: "Full name as on CNIC"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Age *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: catFields.age || "",
                onChange: (e) => setField("age", e.target.value),
                placeholder: "Age in years"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "CNIC photo",
              required: true,
              hint: "Clear front side of CNIC",
              onUpload: (url) => setDoc("cnic", url),
              value: catDocUrls.cnic
            }
          ),
          isWidow && /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Spouse death certificate",
              required: true,
              hint: "Required for widow status",
              onUpload: (url) => setDoc("death_cert", url),
              value: catDocUrls.death_cert
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "This category has a fixed stipend of Rs 6,000.",
              "Widow status requires a clear death certificate of the spouse.",
              "CNIC name and details must match the form.",
              "Upload clear, readable documents only."
            ]
          }
        )
      ]
    }
  );
}
const MODE_OPTIONS = [
  { value: "stipend", label: "Monthly stipend (Rs 6,000)" },
  { value: "treatment", label: "Treatment / aid support" }
];
function DisabilitySupportForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catDocUrls = formData.catDocUrls || {};
  const disabilityType = formData.disabilityType || "";
  const disabilityMode = formData.disabilityMode || "";
  const typeOptions = CHOICE_FIELDS.disability_type || [];
  const setTop = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    return !!disabilityType && !!disabilityMode && !!catDocUrls.disability_cnic && !!catDocUrls.disability_photo;
  }, [disabilityType, disabilityMode, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Disability Support",
      subtitle: "Fixed stipend Rs 6,000 or verified treatment need",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disability type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: disabilityType, onValueChange: (v) => setTop("disabilityType", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: typeOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt, children: opt }, opt)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type of help needed *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: disabilityMode, onValueChange: (v) => setTop("disabilityMode", v), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select help type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: MODE_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Disability CNIC / certificate",
              required: true,
              hint: "Front and back if possible",
              onUpload: (url) => setDoc("disability_cnic", url),
              value: catDocUrls.disability_cnic
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Clear photo of the disability",
              required: true,
              hint: "Respectful, clear photo for verification",
              onUpload: (url) => setDoc("disability_photo", url),
              value: catDocUrls.disability_photo
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Stipend mode is a fixed Rs 6,000 support.",
              "Treatment mode requires verified medical need documents.",
              "Upload clear disability CNIC/certificate and photo.",
              "Incorrect or unclear documents can cause rejection."
            ]
          }
        )
      ]
    }
  );
}
function HouseRentForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a, _b;
    return !!((_a = catFields.landlord_name) == null ? void 0 : _a.trim()) && !!((_b = catFields.landlord_contact) == null ? void 0 : _b.trim()) && !!catFields.rent_amount && !!catDocUrls.rental_agreement && !!catDocUrls.landlord_cnic;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "House Rent",
      subtitle: "One month verified rent only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Landlord name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.landlord_name || "",
                onChange: (e) => setField("landlord_name", e.target.value),
                placeholder: "Full name of landlord"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Landlord contact *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.landlord_contact || "",
                onChange: (e) => setField("landlord_contact", e.target.value),
                placeholder: "Landlord phone number"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Monthly rent amount (ONE month) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: catFields.rent_amount || "",
                onChange: (e) => setField("rent_amount", e.target.value),
                placeholder: "Amount for one month only"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Rental agreement",
              required: true,
              hint: "Clear photo of the rent agreement",
              onUpload: (url) => setDoc("rental_agreement", url),
              value: catDocUrls.rental_agreement
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Landlord CNIC",
              required: true,
              hint: "Front side of landlord CNIC",
              onUpload: (url) => setDoc("landlord_cnic", url),
              value: catDocUrls.landlord_cnic
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Request help for ONE month rent only — not multiple months or arrears.",
              "Landlord name and contact must be real and reachable for verification.",
              "Upload a clear rental agreement and landlord CNIC.",
              "Payment receiver details (landlord bank) will be asked in the next step for this category."
            ]
          }
        )
      ]
    }
  );
}
function EducationBooksForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const eduSubType = formData.eduSubType || catFields.edu_sub_type || "";
  const eduAdmissionLevel = formData.eduAdmissionLevel || catFields.admission_level || "";
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const onSubTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      eduSubType: value,
      eduAdmissionLevel: "",
      catFields: {
        ...prev.catFields || {},
        edu_sub_type: value,
        admission_level: ""
      }
    }));
  };
  const onLevelChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      eduAdmissionLevel: value,
      catFields: { ...prev.catFields || {}, admission_level: value }
    }));
  };
  const admissionFields = eduSubType === "admission" && eduAdmissionLevel ? EDUCATION_ADMISSION_FIELDS[eduAdmissionLevel] || [] : [];
  const requiredDocs = getEducationDocs(eduSubType);
  const isValid = reactExports.useMemo(() => {
    var _a, _b;
    if (!eduSubType) return false;
    if (!((_a = catFields.student_name) == null ? void 0 : _a.trim())) return false;
    if (!((_b = catFields.student_class) == null ? void 0 : _b.trim())) return false;
    if (eduSubType === "admission" && !eduAdmissionLevel) return false;
    for (const field of admissionFields) {
      if (field.required && !String(catFields[field.key] || "").trim()) return false;
    }
    for (const doc of requiredDocs) {
      if (doc.required && !catDocUrls[doc.key]) return false;
    }
    return true;
  }, [
    eduSubType,
    eduAdmissionLevel,
    catFields,
    catDocUrls,
    admissionFields,
    requiredDocs
  ]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Education, Books & Admission",
      subtitle: "ONE student · verified education cost only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Help type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: eduSubType, onValueChange: onSubTypeChange, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EDUCATION_SUB_OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Student's name (ONE student only) *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.student_name || "",
                onChange: (e) => setField("student_name", e.target.value),
                placeholder: "Full name of one student"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Class / grade / program *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.student_class || "",
                onChange: (e) => setField("student_class", e.target.value),
                placeholder: "e.g. Grade 8, FA, BS"
              }
            )
          ] }),
          eduSubType === "admission" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Admission level *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: eduAdmissionLevel, onValueChange: onLevelChange, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "School / College / University" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["School", "College", "University"].map((lvl) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: lvl, children: lvl }, lvl)) })
            ] })
          ] }),
          admissionFields.map((field) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
              field.label,
              " ",
              field.required ? "*" : ""
            ] }),
            field.choices ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: catFields[field.key] || "",
                onValueChange: (v) => setField(field.key, v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: `Select ${field.label}` }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: field.choices.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields[field.key] || "",
                onChange: (e) => setField(field.key, e.target.value),
                placeholder: field.placeholder || field.label
              }
            )
          ] }, field.key)),
          requiredDocs.map((doc) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: doc.label,
              required: doc.required,
              hint: doc.hint,
              onUpload: (url) => setDoc(doc.key, url),
              value: catDocUrls[doc.key]
            },
            doc.key
          ))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "This case is for ONE student only.",
              "Choose the correct help type: Admission, Books, or Uniform.",
              "Upload clear quotation / challan and student identity proof.",
              "Amounts and documents must match what the institute requires."
            ]
          }
        )
      ]
    }
  );
}
function FoodGroceriesForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a;
    return !!catFields.family_members && !!((_a = catFields.shop_name) == null ? void 0 : _a.trim()) && !!catFields.groceries_amount && !!catDocUrls.groceries_estimate;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Food & Groceries",
      subtitle: "Max Rs 12,000 per family · verified need",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Number of family members *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: catFields.family_members || "",
                onChange: (e) => setField("family_members", e.target.value),
                placeholder: "e.g. 5"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Shop name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.shop_name || "",
                onChange: (e) => setField("shop_name", e.target.value),
                placeholder: "Grocery shop name"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Groceries amount needed *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: catFields.groceries_amount || "",
                onChange: (e) => setField("groceries_amount", e.target.value),
                placeholder: "Max Rs 12,000"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Groceries estimate / list photo",
              required: true,
              hint: "Clear list with prices from the shop",
              onUpload: (url) => setDoc("groceries_estimate", url),
              value: catDocUrls.groceries_estimate
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Maximum help is Rs 12,000 per family for this category.",
              "Upload a clear shop estimate or item list with prices.",
              "Shop payment details will be asked in the payment receiver step.",
              "Amount must match the estimate document."
            ]
          }
        )
      ]
    }
  );
}
function MarriageSupportForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const relationOptions = CHOICE_FIELDS.relation || [];
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a;
    return !!catFields.relation && !!((_a = catFields.person_name) == null ? void 0 : _a.trim()) && !!catDocUrls.relation_proof && !!catDocUrls.marriage_quotation;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Marriage Support",
      subtitle: "Verified marriage need only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Relation *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: catFields.relation || "",
                onValueChange: (v) => setField("relation", v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select relation" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: relationOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt, children: opt }, opt)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Person's name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.person_name || "",
                onChange: (e) => setField("person_name", e.target.value),
                placeholder: "Name of the person getting married"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Relation proof",
              required: true,
              hint: "Document proving relation to the person",
              onUpload: (url) => setDoc("relation_proof", url),
              value: catDocUrls.relation_proof
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Marriage quotation / estimate",
              required: true,
              hint: "Clear quotation of marriage-related costs",
              onUpload: (url) => setDoc("marriage_quotation", url),
              value: catDocUrls.marriage_quotation
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Upload clear relation proof and marriage cost quotation.",
              "Vendor payment details will be asked in the payment receiver step.",
              "Only verified needs are approved.",
              "Documents must be readable and complete."
            ]
          }
        )
      ]
    }
  );
}
function BusinessWorkHelpForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a;
    return !!((_a = catFields.business_name) == null ? void 0 : _a.trim()) && !!catFields.business_amount && !!catDocUrls.business_quotation && !!catDocUrls.business_proof;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Business / Work Help",
      subtitle: "Max Rs 20,000 · verified business need",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Business / work name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.business_name || "",
                onChange: (e) => setField("business_name", e.target.value),
                placeholder: "Name of business or work activity"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Amount needed *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: catFields.business_amount || "",
                onChange: (e) => setField("business_amount", e.target.value),
                placeholder: "Typical range Rs 8,000–20,000"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Business quotation / cost list",
              required: true,
              hint: "Clear list of items or costs needed",
              onUpload: (url) => setDoc("business_quotation", url),
              value: catDocUrls.business_quotation
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Business proof",
              required: true,
              hint: "Photo or document proving the business / work",
              onUpload: (url) => setDoc("business_proof", url),
              value: catDocUrls.business_proof
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Maximum amount for this category is Rs 20,000.",
              "Upload a clear quotation and proof of business activity.",
              "Supplier payment details will be collected in the payment receiver step.",
              "Vague or incomplete documents can cause rejection."
            ]
          }
        )
      ]
    }
  );
}
const PROPERTY_TYPES = ["House", "Room", "Shop", "Other"];
const REPAIR_TYPES = ["Roof", "Wall", "Plumbing", "Electrical", "Other"];
function HomeRepairForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    return !!catFields.property_type && !!catFields.repair_type && !!catFields.repair_amount && !!catDocUrls.repair_estimate;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Home Repair",
      subtitle: "Max Rs 18,000 · verified repair need",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Property type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: catFields.property_type || "",
                onValueChange: (v) => setField("property_type", v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select property type" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PROPERTY_TYPES.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt, children: opt }, opt)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Repair type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: catFields.repair_type || "",
                onValueChange: (v) => setField("repair_type", v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select repair type" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: REPAIR_TYPES.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt, children: opt }, opt)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Repair amount *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: catFields.repair_amount || "",
                onChange: (e) => setField("repair_amount", e.target.value),
                placeholder: "Max Rs 18,000"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Repair estimate",
              required: true,
              hint: "Clear estimate from contractor or material shop",
              onUpload: (url) => setDoc("repair_estimate", url),
              value: catDocUrls.repair_estimate
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Maximum amount is Rs 18,000 for this category.",
              "Upload a clear repair estimate matching the amount.",
              "Contractor / shop payment details come in the payment receiver step.",
              "Only verified repair needs are approved."
            ]
          }
        )
      ]
    }
  );
}
function FuneralExpensesForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const relationOptions = CHOICE_FIELDS.deceased_relation || [];
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a;
    return !!catFields.deceased_relation && !!((_a = catFields.deceased_name) == null ? void 0 : _a.trim()) && !!catDocUrls.death_certificate && !!catDocUrls.relation_proof;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Funeral Expenses",
      subtitle: "Verified funeral need only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Relation to deceased *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: catFields.deceased_relation || "",
                onValueChange: (v) => setField("deceased_relation", v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select relation" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: relationOptions.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt, children: opt }, opt)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deceased person's name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.deceased_name || "",
                onChange: (e) => setField("deceased_name", e.target.value),
                placeholder: "Full name of the deceased"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Death certificate",
              required: true,
              hint: "Official death certificate",
              onUpload: (url) => setDoc("death_certificate", url),
              value: catDocUrls.death_certificate
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Relation proof",
              required: true,
              hint: "Proof of relation to the deceased",
              onUpload: (url) => setDoc("relation_proof", url),
              value: catDocUrls.relation_proof
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Death certificate is mandatory.",
              "Relation proof must clearly show your connection to the deceased.",
              "Service provider payment details come in the payment receiver step.",
              "Submit only verified, clear documents."
            ]
          }
        )
      ]
    }
  );
}
const FARM_TYPES = ["Livestock", "Poultry", "Crops", "Dairy", "Other"];
function LivestockFarmingForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    return !!catFields.farm_type && !!catFields.farm_amount && !!catDocUrls.livestock_quotation && !!catDocUrls.livestock_proof;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Livestock / Farming",
      subtitle: "Verified farming need only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Farm type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: catFields.farm_type || "",
                onValueChange: (v) => setField("farm_type", v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select farm type" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: FARM_TYPES.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt, children: opt }, opt)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Amount needed *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: catFields.farm_amount || "",
                onChange: (e) => setField("farm_amount", e.target.value),
                placeholder: "Amount required"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Quotation",
              required: true,
              hint: "Clear price quotation for animals, feed, or materials",
              onUpload: (url) => setDoc("livestock_quotation", url),
              value: catDocUrls.livestock_quotation
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Farm / livestock proof",
              required: true,
              hint: "Photo or document proving the farming activity",
              onUpload: (url) => setDoc("livestock_proof", url),
              value: catDocUrls.livestock_proof
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Upload a clear quotation and proof of farming activity.",
              "Supplier payment details will be asked in the payment receiver step.",
              "Only verified farming needs are approved.",
              "Documents must be clear and complete."
            ]
          }
        )
      ]
    }
  );
}
function DebtReliefForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a;
    return !!((_a = catFields.creditor_name) == null ? void 0 : _a.trim()) && !!catFields.total_debt && !!catDocUrls.debt_proof;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Debt Relief",
      subtitle: "5% of total debt · max Rs 25,000",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Creditor name *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: catFields.creditor_name || "",
                onChange: (e) => setField("creditor_name", e.target.value),
                placeholder: "Person or institution owed"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total debt amount *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                value: catFields.total_debt || "",
                onChange: (e) => setField("total_debt", e.target.value),
                placeholder: "Full outstanding debt"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Help amount is calculated later as 5% of total debt (maximum Rs 25,000)." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Debt proof",
              required: true,
              hint: "Loan paper, ledger, or written proof of debt",
              onUpload: (url) => setDoc("debt_proof", url),
              value: catDocUrls.debt_proof
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Help is 5% of total debt, capped at Rs 25,000.",
              "You will confirm total debt again in the amount step.",
              "Upload clear proof of the outstanding debt.",
              "Creditor payment details come in the payment receiver step."
            ]
          }
        )
      ]
    }
  );
}
const EMERGENCY_TYPES = [
  "Accident",
  "Sudden illness",
  "Natural disaster",
  "Displacement",
  "Other urgent need"
];
function EmergencyHelpForm({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const catFields = formData.catFields || {};
  const catDocUrls = formData.catDocUrls || {};
  const setField = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      catFields: { ...prev.catFields || {}, [key]: value }
    }));
  };
  const setDoc = (key, url) => {
    setFormData((prev) => ({
      ...prev,
      catDocUrls: { ...prev.catDocUrls || {}, [key]: url }
    }));
  };
  const isValid = reactExports.useMemo(() => {
    var _a;
    return !!catFields.emergency_type && !!((_a = catFields.emergency_description) == null ? void 0 : _a.trim()) && !!catDocUrls.emergency_proof;
  }, [catFields, catDocUrls]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    BaseCategoryForm,
    {
      title: "Emergency Help",
      subtitle: "Verified urgent need only",
      onNext,
      onBack,
      isFirst,
      isLast,
      disabled: !isValid,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Emergency type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: catFields.emergency_type || "",
                onValueChange: (v) => setField("emergency_type", v),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select emergency type" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EMERGENCY_TYPES.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: opt, children: opt }, opt)) })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Describe the emergency *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: catFields.emergency_description || "",
                onChange: (e) => setField("emergency_description", e.target.value),
                placeholder: "What happened, when, and what help is needed now",
                rows: 4
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            DocBox,
            {
              label: "Emergency proof",
              required: true,
              hint: "Photo, report, or document proving the emergency",
              onUpload: (url) => setDoc("emergency_proof", url),
              value: catDocUrls.emergency_proof
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StepGuide,
          {
            lines: [
              "Explain the emergency clearly and honestly.",
              "Upload proof that shows the urgent situation.",
              "Recipient payment details come in the payment receiver step.",
              "False claims are rejected and may affect your account."
            ]
          }
        )
      ]
    }
  );
}
const CATEGORY_FORM_MAP = {
  "Electricity Bill": ElectricityBillForm,
  "Gas Bill": GasBillForm,
  "Water Bill": WaterBillForm,
  "School, College & University Fees": SchoolFeesForm,
  "Medical & Treatment": MedicalTreatmentForm,
  "Medicines": MedicinesForm,
  "Child Support": ChildSupportForm,
  "Widow & Elderly Support": WidowElderlyForm,
  "Disability Support": DisabilitySupportForm,
  "House Rent": HouseRentForm,
  "Education, Books & Admission": EducationBooksForm,
  "Food & Groceries": FoodGroceriesForm,
  "Marriage Support": MarriageSupportForm,
  "Business / Work Help": BusinessWorkHelpForm,
  "Home Repair": HomeRepairForm,
  "Funeral Expenses": FuneralExpensesForm,
  "Livestock / Farming": LivestockFarmingForm,
  "Debt Relief": DebtReliefForm,
  "Emergency Help": EmergencyHelpForm
};
function StepCategoryDetails({ formData, setFormData, onNext, onBack, isFirst, isLast }) {
  const { category } = formData;
  const FormComponent = CATEGORY_FORM_MAP[category];
  if (!FormComponent) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No form defined for this category." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    FormComponent,
    {
      formData,
      setFormData,
      onNext,
      onBack,
      isFirst,
      isLast
    }
  );
}
const OPTIONS = [
  { value: "rented", label: "Rented", icon: "🏠" },
  { value: "owned", label: "Owned", icon: "📜" }
];
function StepPropertyOwnership({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Property ownership" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Is the property rented or owned? This decides which documents we ask next." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Ownership *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: OPTIONS.map((opt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => onChange(opt.value),
          className: `p-6 rounded-xl border-2 text-center transition-all ${value === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl mb-1", children: opt.icon }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: opt.label })
          ]
        },
        opt.value
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Rented: you will upload rental agreement and landlord CNIC.",
          "Owned: you will upload owner CNIC and relation to owner.",
          "Choose the option that matches your real situation."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !value
      }
    )
  ] });
}
function StepRentedDocuments({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const rentalAgreementUrl = (formData == null ? void 0 : formData.rentalAgreementUrl) || "";
  const landlordCnicUrl = (formData == null ? void 0 : formData.landlordCnicUrl) || "";
  const setDoc = (key, url) => {
    setFormData((prev) => ({ ...prev, [key]: url }));
  };
  const isValid = !!rentalAgreementUrl && !!landlordCnicUrl;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Rented property documents" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Upload documents that prove you are living in a rented property." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DocBox,
          {
            label: "Rental agreement",
            required: true,
            hint: "Clear photo of the rent agreement",
            onUpload: (url) => setDoc("rentalAgreementUrl", url),
            value: rentalAgreementUrl
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DocBox,
          {
            label: "Landlord CNIC",
            required: true,
            hint: "Front side of landlord CNIC",
            onUpload: (url) => setDoc("landlordCnicUrl", url),
            value: landlordCnicUrl
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Both rental agreement and landlord CNIC are required.",
          "Photos must be clear and readable.",
          "Names should match other details in your case where possible."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !isValid
      }
    )
  ] });
}
const RELATIONS = ["Myself", "Father", "Mother", "Spouse", "Other family"];
function StepOwnedDocuments({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const ownerCnicUrl = (formData == null ? void 0 : formData.ownerCnicUrl) || "";
  const ownerRelation = (formData == null ? void 0 : formData.ownerRelation) || "";
  const setDoc = (url) => {
    setFormData((prev) => ({ ...prev, ownerCnicUrl: url }));
  };
  const setRelation = (value) => {
    setFormData((prev) => ({ ...prev, ownerRelation: value }));
  };
  const isValid = !!ownerCnicUrl && !!ownerRelation;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Owned property documents" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Upload owner CNIC and select your relation to the owner." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Relation to owner *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: ownerRelation, onValueChange: setRelation, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select relation" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RELATIONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DocBox,
          {
            label: "Owner CNIC",
            required: true,
            hint: "Clear front side of property owner CNIC",
            onUpload: setDoc,
            value: ownerCnicUrl
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Select how you are related to the property owner.",
          "Upload a clear owner CNIC photo.",
          "If you are the owner, choose Myself and upload your own CNIC."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !isValid
      }
    )
  ] });
}
const RECEIVER_LABELS = {
  "House Rent": "Landlord",
  "Food & Groceries": "Shop Owner",
  "Medicines": "Pharmacy / Shop Owner",
  "Home Repair": "Contractor / Material Shop",
  "Debt Relief": "Creditor",
  "Business / Work Help": "Business Owner / Supplier",
  "Marriage Support": "Marriage Vendor",
  "Funeral Expenses": "Funeral Service Provider",
  "Livestock / Farming": "Supplier / Farm Owner",
  "Emergency Help": "Emergency Recipient",
  Other: "Recipient"
};
const SHOP_NAME_CATS = /* @__PURE__ */ new Set(["Food & Groceries", "Medicines", "Home Repair"]);
function StepPaymentReceiver({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const category = (formData == null ? void 0 : formData.category) || "";
  const label = RECEIVER_LABELS[category] || "Payment Receiver";
  const needsShopName = SHOP_NAME_CATS.has(category);
  const receiverName = (formData == null ? void 0 : formData.receiverName) || "";
  const receiverContact = (formData == null ? void 0 : formData.receiverContact) || "";
  const receiverBank = (formData == null ? void 0 : formData.receiverBank) || "";
  const receiverAccount = (formData == null ? void 0 : formData.receiverAccount) || "";
  const receiverAddress = (formData == null ? void 0 : formData.receiverAddress) || "";
  const receiverShopName = (formData == null ? void 0 : formData.receiverShopName) || "";
  const setField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const isValid = !!receiverName.trim() && !!receiverContact.trim() && !!receiverBank.trim() && !!receiverAccount.trim() && !!receiverAddress.trim() && (!needsShopName || !!receiverShopName.trim());
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-bold", children: [
        label,
        " payment details"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enter where the help amount should be paid. These details are required for verification and payout." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          label,
          " name *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: receiverName,
            onChange: (e) => setField("receiverName", e.target.value),
            placeholder: `Enter ${label.toLowerCase()} name`,
            className: "bg-background"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          label,
          " contact number *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: receiverContact,
            onChange: (e) => setField("receiverContact", e.target.value),
            placeholder: "Phone number for verification",
            className: "bg-background"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          label,
          " bank name *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: receiverBank,
            onChange: (e) => setField("receiverBank", e.target.value),
            placeholder: "Bank name",
            className: "bg-background"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          label,
          " account number *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: receiverAccount,
            onChange: (e) => setField("receiverAccount", e.target.value),
            placeholder: "Account number",
            className: "bg-background"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
          label,
          " address *"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: receiverAddress,
            onChange: (e) => setField("receiverAddress", e.target.value),
            placeholder: "Complete address of the receiver / shop",
            rows: 2,
            className: "bg-background"
          }
        )
      ] }),
      needsShopName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Shop name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: receiverShopName,
            onChange: (e) => setField("receiverShopName", e.target.value),
            placeholder: "Shop or pharmacy name",
            className: "bg-background"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          `Fill complete ${label.toLowerCase()} details so admin can verify the payout.`,
          "Name, contact, bank, account number, and address are all required.",
          needsShopName ? "Shop name is required for this category." : "Use the real account that will receive the help amount.",
          "Incorrect details can delay or reject the case."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !isValid
      }
    )
  ] });
}
const MIN_WORDS = 200;
function countWords$1(text) {
  const t = (text || "").trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}
function StepWhyHelp({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const text = value || "";
  const words = countWords$1(text);
  const isValid = words >= MIN_WORDS;
  const remaining = Math.max(0, MIN_WORDS - words);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Why do you need this help?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Describe your situation in detail. Heroes read this to understand your need and decide whether to help." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Explain your situation *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: text,
          onChange: (e) => onChange(e.target.value),
          placeholder: "Explain from the beginning: what happened, since when, your current situation, family circumstances, and how this help will change things. Write at least 200 words...",
          rows: 12,
          className: "text-base min-h-[240px]",
          autoFocus: true
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: isValid ? "text-green-600 font-medium" : "text-amber-700 dark:text-amber-400", children: isValid ? `✓ ${words} words — you can continue` : `${words} words so far — at least ${MIN_WORDS} required (${remaining} more)` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground tabular-nums", children: [
          words,
          " / ",
          MIN_WORDS,
          "+"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          `Write at least ${MIN_WORDS} words. More detail is always better.`,
          "Cover what happened, when it started, your current situation, and why you need help now.",
          "Be honest and clear. Heroes use this text to verify and decide.",
          "Do not copy a short one-line summary — explain the full story."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !isValid
      }
    )
  ] });
}
function StepDebtTotal({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  formData,
  setFormData
}) {
  const total = parseFloat(value || (formData == null ? void 0 : formData.debtTotalAmount) || "") || 0;
  const helpAmount = total > 0 ? calculateDebtAmount(total) : 0;
  const isValid = total > 0;
  const handleChange = (raw) => {
    if (setFormData) {
      setFormData((prev) => ({
        ...prev,
        debtTotalAmount: raw,
        amount: calculateDebtAmount(parseFloat(raw) || 0).toString()
      }));
    }
    onChange == null ? void 0 : onChange(raw);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "What is your total debt?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Enter the full outstanding debt. Help is calculated as 5% (max Rs 25,000)." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total debt amount *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          value: value || (formData == null ? void 0 : formData.debtTotalAmount) || "",
          onChange: (e) => handleChange(e.target.value),
          placeholder: "Full debt amount",
          className: "text-lg py-6",
          autoFocus: true
        }
      ),
      total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-700 dark:text-green-400", children: [
        "Estimated help amount: Rs ",
        helpAmount.toLocaleString()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Enter the full outstanding debt, not the help amount.",
          "Help = 5% of total debt, capped at Rs 25,000.",
          "Total debt must match your debt proof document.",
          "Creditor payment details are collected in the payment receiver step."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !isValid
      }
    )
  ] });
}
function StepAmount({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  formData
}) {
  const category = (formData == null ? void 0 : formData.category) || "";
  const maxLimit = getMaxLimit(category);
  const limitInfo = getCategoryLimit(category);
  const fixedAmount = getFixedAmount(category);
  const isFixed = fixedAmount != null;
  const amountNum = parseFloat(value) || 0;
  const overMax = maxLimit != null && amountNum > maxLimit;
  const isValid = isFixed ? fixedAmount > 0 : amountNum > 0 && !overMax;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "How much help do you need?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        isFixed ? "This category has a fixed assistance amount." : "Enter the amount required for this case.",
        (limitInfo == null ? void 0 : limitInfo.label) ? ` Policy: ${limitInfo.label}.` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: isFixed ? "Amount (Fixed)" : "Amount needed *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "number",
          value: isFixed ? fixedAmount : value || "",
          onChange: isFixed ? void 0 : (e) => onChange(e.target.value),
          readOnly: isFixed,
          "aria-readonly": isFixed,
          placeholder: isFixed ? void 0 : "Enter amount",
          className: "text-lg py-6",
          autoFocus: !isFixed
        }
      ),
      isFixed && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-green-700", children: [
        "Fixed amount: Rs ",
        fixedAmount.toLocaleString(),
        ". You cannot change this amount."
      ] }),
      overMax && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-600", children: [
        "Amount cannot exceed Rs ",
        maxLimit == null ? void 0 : maxLimit.toLocaleString(),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          isFixed ? `Fixed policy: Rs ${fixedAmount.toLocaleString()}.` : (limitInfo == null ? void 0 : limitInfo.label) ? `Category policy: ${limitInfo.label}.` : "Enter only the amount required for this verified need.",
          maxLimit ? `Maximum allowed for this category is Rs ${maxLimit.toLocaleString()}.` : "Amount should match your documents and bill/estimate.",
          "Do not inflate the amount — mismatched amounts are rejected.",
          "Fixed-stipend categories are handled automatically and may skip this step."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !isValid
      }
    )
  ] });
}
function StepCurrency({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Select currency" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Choose the currency for the amount you requested." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Currency *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: value || "PKR", onValueChange: onChange, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "text-base py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select currency" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: (CASE_CURRENCIES || ["PKR"]).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Most cases in Pakistan should use PKR.",
          "Select another currency only if your need is truly in that currency.",
          "Currency should match your bills and payment details."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !value
      }
    )
  ] });
}
function StepDeadline({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const isPast = value ? new Date(value) < new Date((/* @__PURE__ */ new Date()).toDateString()) : false;
  const isValid = !!value && !isPast;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "When do you need this help by?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Select a realistic deadline in the future." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deadline *" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          type: "date",
          value: value || "",
          onChange: (e) => onChange(e.target.value),
          className: "text-lg py-6",
          autoFocus: true
        }
      ),
      isPast && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: "Deadline must be in the future." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Pick a real due date from your bill, challan, or need.",
          "Past dates are not allowed.",
          "Unrealistic deadlines can reduce trust during review.",
          "For utility bills, use the bill due date when possible."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !isValid
      }
    )
  ] });
}
function StepSelfie({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const { user } = useAuth();
  const videoRef = reactExports.useRef(null);
  const canvasRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const [cameraReady, setCameraReady] = reactExports.useState(false);
  const [uploading, setUploading] = reactExports.useState(false);
  const [localPreview, setLocalPreview] = reactExports.useState("");
  const remoteUrl = (formData == null ? void 0 : formData.selfieUrl) || "";
  const showPreview = localPreview || remoteUrl;
  const [error, setError] = reactExports.useState("");
  const stopCamera = () => {
    var _a;
    (_a = streamRef.current) == null ? void 0 : _a.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  };
  const startCamera = async () => {
    setError("");
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
      streamRef.current = stream;
      await new Promise((r) => setTimeout(r, 80));
      const el = videoRef.current;
      if (!el) throw new Error("Video element not ready");
      el.srcObject = stream;
      el.muted = true;
      el.setAttribute("playsinline", "true");
      await el.play().catch(() => void 0);
      await new Promise((resolve) => {
        if (el.videoWidth > 0) return resolve();
        const onMeta = () => {
          el.removeEventListener("loadedmetadata", onMeta);
          resolve();
        };
        el.addEventListener("loadedmetadata", onMeta);
        setTimeout(() => resolve(), 2e3);
      });
      setCameraReady(true);
    } catch (e) {
      console.error(e);
      setError("Camera access denied or unavailable. Allow camera permission and try again.");
      setCameraReady(false);
    }
  };
  reactExports.useEffect(() => {
    if (!showPreview) startCamera();
    return () => stopCamera();
  }, []);
  const captureSelfie = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (!video.videoWidth || !video.videoHeight) {
      setError("Camera is still starting. Wait a moment and try again.");
      return;
    }
    setError("");
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setLocalPreview(dataUrl);
      const blob = await new Promise(
        (resolve) => canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("Failed to create image");
      stopCamera();
      if (!(user == null ? void 0 : user.id)) throw new Error("Please sign in again before uploading.");
      setUploading(true);
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      const path = `cases/${user.id}/${Date.now()}_selfie.jpg`;
      const url = await uploadFileToStorage(file, path);
      setFormData((prev) => ({ ...prev, selfieUrl: url }));
      ue.success("Selfie uploaded");
    } catch (e) {
      console.error(e);
      const msg = (e == null ? void 0 : e.message) || "Selfie upload failed — retake please.";
      setError(msg);
      ue.error(msg);
      setLocalPreview("");
      setFormData((prev) => ({ ...prev, selfieUrl: "" }));
      await startCamera();
    } finally {
      setUploading(false);
    }
  };
  const retake = async () => {
    setLocalPreview("");
    setFormData((prev) => ({ ...prev, selfieUrl: "" }));
    setError("");
    await startCamera();
  };
  const isValid = !!remoteUrl && !uploading;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Live selfie" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Open the front camera and take a clear live photo. Gallery upload is not allowed." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "hidden" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-xl border bg-black overflow-hidden", children: showPreview ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: showPreview,
        alt: "Selfie preview",
        className: "w-full max-h-[420px] object-contain bg-black"
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "video",
      {
        ref: videoRef,
        playsInline: true,
        muted: true,
        autoPlay: true,
        className: "w-full max-h-[420px] object-contain bg-black",
        style: { transform: "scaleX(-1)" }
      }
    ) }),
    uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-600 text-center", children: "Uploading selfie..." }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }),
    remoteUrl && !uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-600 text-center", children: "Selfie ready" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: !showPreview ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "button",
          onClick: captureSelfie,
          disabled: !cameraReady || uploading,
          className: "w-full",
          children: "Capture live selfie"
        }
      ),
      !cameraReady && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: startCamera, className: "w-full", children: "Enable camera" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: retake, disabled: uploading, className: "w-full", children: "Retake live selfie" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Live camera only — no file attachment.",
          "Face the camera with good lighting.",
          "Wait for “Selfie ready” before Next."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !isValid
      }
    )
  ] });
}
const MIN_SECONDS = 60;
const MAX_SECONDS = 120;
const VIDEO_WIDTH = 854;
const VIDEO_HEIGHT = 480;
const VIDEO_BITRATE = 9e5;
const AUDIO_BITRATE = 64e3;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;
function pad2(n) {
  return n < 10 ? `0${n}` : String(n);
}
function formatClock(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m + ":" + pad2(s);
}
function pickMimeType() {
  var _a;
  const types = [
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9,opus",
    "video/webm"
  ];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && ((_a = MediaRecorder.isTypeSupported) == null ? void 0 : _a.call(MediaRecorder, t))) {
      return t;
    }
  }
  return "video/webm";
}
function StepVideo({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast
}) {
  const { user } = useAuth();
  const liveVideoRef = reactExports.useRef(null);
  const streamRef = reactExports.useRef(null);
  const recorderRef = reactExports.useRef(null);
  const chunksRef = reactExports.useRef([]);
  const timerRef = reactExports.useRef(null);
  const secondsRef = reactExports.useRef(0);
  const stoppingRef = reactExports.useRef(false);
  const [cameraReady, setCameraReady] = reactExports.useState(false);
  const [recording, setRecording] = reactExports.useState(false);
  const [paused, setPaused] = reactExports.useState(false);
  const [seconds, setSeconds] = reactExports.useState(0);
  const [uploading, setUploading] = reactExports.useState(false);
  const [localBlobUrl, setLocalBlobUrl] = reactExports.useState("");
  const remoteUrl = (formData == null ? void 0 : formData.videoUrl) || "";
  const [error, setError] = reactExports.useState("");
  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const stopStream = () => {
    var _a;
    (_a = streamRef.current) == null ? void 0 : _a.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
    setCameraReady(false);
  };
  const startCamera = async () => {
    setError("");
    try {
      stopStream();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: VIDEO_WIDTH, max: VIDEO_WIDTH },
          height: { ideal: VIDEO_HEIGHT, max: VIDEO_HEIGHT },
          frameRate: { ideal: 24, max: 24 },
          resizeMode: "crop-and-scale"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100
        }
      });
      streamRef.current = stream;
      await new Promise((r) => setTimeout(r, 80));
      const el = liveVideoRef.current;
      if (!el) throw new Error("Video element not ready");
      el.srcObject = stream;
      el.muted = true;
      el.setAttribute("playsinline", "true");
      el.onloadedmetadata = () => {
        el.play().catch(() => void 0);
      };
      await el.play().catch(() => void 0);
      setCameraReady(true);
    } catch (e) {
      console.error(e);
      setError("Camera/microphone access denied. Allow permissions and try again.");
      setCameraReady(false);
    }
  };
  reactExports.useEffect(() => {
    if (!localBlobUrl) startCamera();
    return () => {
      clearTimer();
      try {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      } catch {
      }
      stopStream();
      if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
    };
  }, []);
  const startTimer = () => {
    clearTimer();
    timerRef.current = window.setInterval(() => {
      secondsRef.current += 1;
      const s = secondsRef.current;
      setSeconds(s);
      if (s >= MAX_SECONDS && !stoppingRef.current) {
        void finishRecording();
      }
    }, 1e3);
  };
  const startRecording = () => {
    if (!streamRef.current) {
      setError("Camera is not ready.");
      return;
    }
    setError("");
    chunksRef.current = [];
    secondsRef.current = 0;
    setSeconds(0);
    setPaused(false);
    stoppingRef.current = false;
    const mimeType = pickMimeType();
    let recorder;
    try {
      recorder = new MediaRecorder(streamRef.current, {
        mimeType,
        videoBitsPerSecond: VIDEO_BITRATE,
        audioBitsPerSecond: AUDIO_BITRATE
      });
    } catch {
      try {
        recorder = new MediaRecorder(streamRef.current);
      } catch (e) {
        console.error(e);
        setError("Recording is not supported on this browser.");
        return;
      }
    }
    recorderRef.current = recorder;
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    recorder.onerror = () => {
      setError("Recording error. Please try again.");
      setRecording(false);
      setPaused(false);
      clearTimer();
    };
    recorder.start(1e3);
    setRecording(true);
    startTimer();
  };
  const pauseRecording = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state !== "recording") return;
    rec.pause();
    setPaused(true);
    clearTimer();
  };
  const resumeRecording = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state !== "paused") return;
    rec.resume();
    setPaused(false);
    startTimer();
  };
  const finishRecording = async () => {
    if (stoppingRef.current) return;
    const rec = recorderRef.current;
    if (!rec) return;
    if (secondsRef.current < MIN_SECONDS) {
      ue.error("Record at least 60 seconds before stopping.");
      return;
    }
    stoppingRef.current = true;
    clearTimer();
    setPaused(false);
    await new Promise((resolve) => {
      var _a;
      rec.onstop = () => resolve();
      try {
        if (rec.state !== "inactive") {
          try {
            (_a = rec.requestData) == null ? void 0 : _a.call(rec);
          } catch {
          }
          rec.stop();
        } else resolve();
      } catch {
        resolve();
      }
    });
    setRecording(false);
    recorderRef.current = null;
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    chunksRef.current = [];
    const sizeMB = blob.size / (1024 * 1024);
    if (blob.size < 1e3) {
      setError("Recording failed. Please try again.");
      stoppingRef.current = false;
      await startCamera();
      return;
    }
    if (blob.size > MAX_VIDEO_BYTES) {
      setError("Video is too large (max 20MB). Please record again in a well-lit place.");
      stoppingRef.current = false;
      await startCamera();
      return;
    }
    if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
    const blobUrl = URL.createObjectURL(blob);
    setLocalBlobUrl(blobUrl);
    stopStream();
    if (!(user == null ? void 0 : user.id)) {
      setError("Please sign in again before uploading.");
      stoppingRef.current = false;
      return;
    }
    setUploading(true);
    setError("");
    try {
      const file = new File([blob], "appeal.webm", { type: "video/webm" });
      const path = `cases/${user.id}/${Date.now()}_appeal.webm`;
      const url = await uploadFileToStorage(file, path);
      setFormData((prev) => ({ ...prev, videoUrl: url }));
      ue.success("Video uploaded successfully (" + sizeMB.toFixed(1) + " MB)");
    } catch (e) {
      console.error(e);
      const msg = (e == null ? void 0 : e.message) || "Video upload failed. Please record again.";
      setError(msg);
      ue.error(msg);
      setFormData((prev) => ({ ...prev, videoUrl: "" }));
    } finally {
      setUploading(false);
      stoppingRef.current = false;
    }
  };
  const onStopClick = () => {
    if (secondsRef.current < MIN_SECONDS) {
      ue.error("You must record more than 1 minute. " + (MIN_SECONDS - secondsRef.current) + "s left.");
      return;
    }
    void finishRecording();
  };
  const retake = async () => {
    clearTimer();
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch {
    }
    recorderRef.current = null;
    chunksRef.current = [];
    secondsRef.current = 0;
    setSeconds(0);
    setRecording(false);
    setPaused(false);
    setFormData((prev) => ({ ...prev, videoUrl: "" }));
    if (localBlobUrl) {
      URL.revokeObjectURL(localBlobUrl);
      setLocalBlobUrl("");
    }
    setError("");
    await startCamera();
  };
  const canStop = recording && seconds >= MIN_SECONDS && !uploading;
  const isValid = !!remoteUrl && !recording && !uploading;
  const progressPct = Math.min(100, seconds / MAX_SECONDS * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Live video appeal" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Record a live video about your case for Heroes. Medium 480p quality keeps upload and review fast. Minimum 1 minute (60s), maximum 120 seconds. File upload is not allowed." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full rounded-xl border bg-black overflow-hidden", children: localBlobUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "video",
      {
        src: localBlobUrl,
        controls: true,
        playsInline: true,
        preload: "metadata",
        className: "w-full max-h-[420px] object-contain bg-black"
      },
      localBlobUrl
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      "video",
      {
        ref: liveVideoRef,
        playsInline: true,
        muted: true,
        autoPlay: true,
        className: "w-full max-h-[420px] object-contain bg-black"
      }
    ) }),
    recording && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-red-600", children: [
          paused ? "Paused" : "Recording",
          " ",
          formatClock(seconds)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
          "Min ",
          formatClock(MIN_SECONDS),
          " · Max ",
          formatClock(MAX_SECONDS)
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-red-500 h-2 rounded-full transition-all",
          style: { width: progressPct + "%" }
        }
      ) })
    ] }),
    uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-600 text-center", children: "Uploading video..." }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: error }),
    remoteUrl && !uploading && localBlobUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-600 text-center", children: "Video ready — press play above to check picture and sound, then continue." }),
    localBlobUrl && !remoteUrl && !uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-700 text-center", children: "Preview is available. Upload did not finish — record again or check your connection." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
      !localBlobUrl && !recording && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            onClick: startRecording,
            disabled: !cameraReady || uploading,
            className: "w-full",
            children: "Start live recording"
          }
        ),
        !cameraReady && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: startCamera, className: "w-full", children: "Enable camera & microphone" })
      ] }),
      recording && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        !paused ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: pauseRecording, children: "Pause" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: resumeRecording, children: "Resume" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "button",
            onClick: onStopClick,
            disabled: !canStop,
            variant: canStop ? "default" : "secondary",
            children: seconds < MIN_SECONDS ? "Stop unlocks in " + (MIN_SECONDS - seconds) + "s" : "Stop & save"
          }
        )
      ] }),
      localBlobUrl && !recording && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: retake, disabled: uploading, children: "Record again" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "This video is for Heroes so they understand your situation and why you need help.",
          "Explain who you are, what happened, your current condition, and how help will help.",
          "Speak clearly in a quiet place.",
          "After recording, press play and listen once to confirm sound is clear.",
          "Medium 480p video with clear audio is used to keep uploads manageable for admin review.",
          "Minimum 1 minute. Maximum 120 seconds. Pause is allowed. Stop unlocks after 60 seconds."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !isValid
      }
    )
  ] });
}
function StepTerms({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  submitting
}) {
  const confirmed = !!value;
  const handleCheckboxChange = (e) => {
    onChange(e.target.checked);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Terms & Conditions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Please read carefully and confirm before submitting your case." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Terms & Conditions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-60 overflow-y-auto rounded-xl border border-border bg-muted/30 p-4 text-xs space-y-2.5 leading-relaxed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1. Truthfulness & Accuracy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "I confirm that all information, documents, and statements provided in my case are completely true and accurate. Any falsehood or fraud will result in permanent account closure."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "2. Video Privacy & Access" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "a." }),
          " My identity documents (CNIC, bills, etc.) and my selfie will ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "never" }),
          " be shown to any contributor. They are only for Givethra's verification team.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "b." }),
          " My verification video (the appeal video I record)",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "will be shown only to the Hero who unlocks my case" }),
          " by paying the required credit. No one else can see it.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "c." }),
          " The video is provided in ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "stream-only mode" }),
          " ",
          "— it cannot be downloaded, shared, or saved by anyone.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "d." }),
          " Once my case is successfully completed (payment made), the video will be ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "permanently hidden" }),
          " from that Hero and will never be shown again."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3. Feedback Mandate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "If my case is successfully completed, I must submit a",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "feedback video (minimum 60 seconds) + a written caption" }),
          " ",
          "within ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "24 hours" }),
          " of completion. Failure to do so will result in my account being ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "suspended" }),
          ". To unsuspend, I must pay ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "5 credits" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "4. Public Usage Rights" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "I grant Givethra the right to use my",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "case description, feedback video, and caption" }),
          " as public property. Givethra may publish these on social media, the community wall, or other public platforms where viewers can watch, like, and comment."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "5. Listing Fee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "I understand that if my case is not my first case or part of a free offer, a",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1 credit listing fee" }),
          " will be deducted, which is",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "non-refundable" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "6. Consent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "I have read and fully agree to all the above terms and conditions."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            id: "termsCheckWizard",
            checked: confirmed,
            onChange: handleCheckboxChange,
            className: "h-5 w-5 mt-0.5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/50 cursor-pointer"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "label",
          {
            htmlFor: "termsCheckWizard",
            className: "text-sm font-medium cursor-pointer select-none leading-snug",
            children: [
              "I have read all the Terms & Conditions and I ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "fully agree" }),
              " to them."
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepGuide,
      {
        lines: [
          "Read every point carefully before agreeing.",
          "Your selfie and ID docs are for verification only.",
          "Your appeal video is shown only to the Hero who unlocks the case.",
          "After completion you must submit feedback within 24 hours."
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StepNavigation,
      {
        onNext,
        onBack,
        isFirst,
        isLast,
        disabled: !confirmed || !!submitting
      }
    )
  ] });
}
const StepProgress = reactExports.memo(function StepProgress2({
  current,
  total
}) {
  const safeTotal = Math.max(total, 1);
  const percentage = Math.round(current / safeTotal * 100);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Step ",
        current,
        " of ",
        safeTotal
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        percentage,
        "% complete"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-1.5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "bg-primary h-1.5 rounded-full",
        style: {
          width: `${percentage}%`,
          transition: "width 0.25s ease-out"
        }
      }
    ) })
  ] });
});
function useVisibleSteps(formData) {
  const category = (formData == null ? void 0 : formData.category) ?? "";
  const gender = (formData == null ? void 0 : formData.gender) ?? "";
  const isOrphan = (formData == null ? void 0 : formData.isOrphan) ?? "";
  const jobStatus = (formData == null ? void 0 : formData.jobStatus) ?? "";
  const propertyOwnership = (formData == null ? void 0 : formData.propertyOwnership) ?? "";
  return reactExports.useMemo(() => {
    const steps = [];
    steps.push("category");
    steps.push("title", "shortDesc", "country", "city");
    if (!isEasyCat(category)) {
      steps.push("urgency");
    }
    steps.push("gender");
    if (gender === "Male" || gender === "Female") {
      steps.push("maritalStatus");
    }
    if (gender === "Female" || gender === "Child") {
      steps.push("orphan");
      if (isOrphan === "Yes") {
        steps.push("orphanParent");
      }
    }
    if (gender) {
      steps.push("genderDocuments");
    }
    steps.push("seekerName", "seekerContact");
    steps.push("jobStatus");
    if (jobStatus === "Yes") {
      steps.push("jobDocuments");
    } else if (jobStatus === "No") {
      steps.push("noJobDocument");
    }
    steps.push("categoryDetails");
    if (PROPERTY_RELEVANT_CATS.has(category)) {
      steps.push("propertyOwnership");
      if (propertyOwnership === "rented") {
        steps.push("rentedDocuments");
      } else if (propertyOwnership === "owned") {
        steps.push("ownedDocuments");
      }
    }
    if (PAYMENT_RECEIVER_CATS.has(category)) {
      steps.push("paymentReceiver");
    }
    steps.push("whyHelp");
    if (isDebtCategory(category)) {
      steps.push("debtTotal");
    } else {
      steps.push("amount");
    }
    steps.push("currency", "deadline", "selfie", "video", "terms");
    return steps;
  }, [category, gender, isOrphan, jobStatus, propertyOwnership]);
}
const SS_KEY = "givethra_submit_draft_v4";
function useSubmitDraft() {
  const saveDraft = reactExports.useCallback((data) => {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify(data));
    } catch {
    }
  }, []);
  const loadDraft = reactExports.useCallback(() => {
    try {
      const s = sessionStorage.getItem(SS_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }, []);
  const clearDraft = reactExports.useCallback(() => {
    try {
      sessionStorage.removeItem(SS_KEY);
    } catch {
    }
  }, []);
  return { saveDraft, loadDraft, clearDraft };
}
const INITIAL_STATS = {
  balance: 0,
  freeCasesUsed: 0,
  totalCases: 0,
  rejectedCases: 0,
  isSuspended: false,
  isFreeDisabled: false,
  suspensionCount: 0,
  blockedByFeedback: null,
  activeCase: null
};
function useUserSubmitStats(userId) {
  const [stats, setStats] = reactExports.useState(INITIAL_STATS);
  const [loading, setLoading] = reactExports.useState(true);
  const [reloadKey, setReloadKey] = reactExports.useState(0);
  const refetch = reactExports.useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);
  reactExports.useEffect(() => {
    if (!userId) {
      setStats(INITIAL_STATS);
      setLoading(false);
      return;
    }
    const currentUserId = userId;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [cases, suspension, wallet, feedbacks] = await Promise.all([
          getCasesByUser(currentUserId),
          getUserSuspension(currentUserId),
          getWallet(currentUserId),
          getFeedbacks(200)
        ]);
        if (cancelled) return;
        const caseList = Array.isArray(cases) ? cases : [];
        const totalCases = caseList.length;
        const rejectedCases = caseList.filter(
          (c) => String(c.status || "").toLowerCase() === "rejected"
        ).length;
        const freeCasesUsed = caseList.filter((c) => c.was_free === true).length;
        const sorted = caseList.slice().sort(
          (a, b) => new Date(b.created_at || b.submitted_at || 0).getTime() - new Date(a.created_at || a.submitted_at || 0).getTime()
        );
        let activeCase = null;
        for (const c of sorted) {
          const st = String(c.status || "").toLowerCase();
          if (st === "pending" || st === "approved" || st === "rejected") {
            activeCase = {
              id: String(c.id),
              title: String(c.title || "Your case"),
              status: st,
              rejectionReason: String(
                c.rejection_reason || c.admin_notes || c.reject_reason || c.rejection_notes || ""
              ).trim() || void 0
            };
            break;
          }
        }
        const completedCases = caseList.filter(
          (c) => String(c.status || "").toLowerCase() === "completed"
        );
        let blocked = null;
        if (completedCases.length > 0) {
          const feedbackList = Array.isArray(feedbacks) ? feedbacks : [];
          const now = Date.now();
          const overdue = completedCases.find((completed) => {
            const completedAt = new Date(
              String(
                completed.completed_at || completed.updated_at || completed.created_at || ""
              )
            ).getTime();
            if (!Number.isFinite(completedAt) || now - completedAt < 24 * 60 * 60 * 1e3) {
              return false;
            }
            const submitted = feedbackList.some(
              (fb) => String(fb.case_id) === String(completed.id) && String(fb.user_id) === String(currentUserId) && ["pending_review", "approved"].includes(
                String(fb.status || "").toLowerCase()
              )
            );
            return !submitted;
          });
          if (overdue) {
            blocked = {
              caseId: String(overdue.id),
              caseTitle: String(overdue.title || "your completed case")
            };
          }
        }
        const isSuspended = (suspension == null ? void 0 : suspension.is_active) === true || (suspension == null ? void 0 : suspension.is_active) === 1;
        const isFreeDisabled = rejectedCases >= 3 || freeCasesUsed >= 2;
        setStats({
          balance: Number((wallet == null ? void 0 : wallet.balance) || 0),
          freeCasesUsed,
          totalCases,
          rejectedCases,
          isSuspended,
          isFreeDisabled,
          suspensionCount: Number((suspension == null ? void 0 : suspension.suspension_count) || 0),
          blockedByFeedback: blocked,
          activeCase
        });
      } catch (err) {
        console.error("Error loading user stats:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [userId, reloadKey]);
  return { stats, loading, refetch };
}
const MIN_WHY_HELP_WORDS = 200;
const hasValue = (value) => {
  if (typeof value === "number") return Number.isFinite(value) && value > 0;
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
};
const hasDoc = (docs, key) => typeof (docs == null ? void 0 : docs[key]) === "string" && String(docs[key]).trim().length > 0;
function countWords(text) {
  const trimmed = String(text || "").trim();
  return trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
}
function getRequiredGenderDocKeys(gender, maritalStatus, isOrphan) {
  const keys = [];
  if (gender === "Male") {
    if (maritalStatus === "Single") keys.push("frc");
    if (maritalStatus === "Married") keys.push("nikah_nama", "frc");
    if (maritalStatus === "Widow") keys.push("wife_death_cert", "nikah_nama", "frc");
    if (maritalStatus === "Divorced") keys.push("divorce_cert", "nikah_nama", "frc");
  }
  if (gender === "Female") {
    if (maritalStatus === "Single") keys.push("frc");
    if (maritalStatus === "Married") keys.push("nikah_nama", "frc");
    if (maritalStatus === "Widow") keys.push("husband_death_cert", "nikah_nama", "frc");
    if (maritalStatus === "Divorced") keys.push("divorce_cert", "nikah_nama", "frc");
    if (isOrphan === "Yes") keys.push("orphan_proof");
  }
  if (gender === "Child") {
    keys.push("b_form", "frc");
    if (isOrphan === "Yes") keys.push("orphan_proof");
  }
  return keys;
}
function validateCategoryDetails(formData) {
  const fields = formData.catFields || {};
  const docs = formData.catDocUrls || {};
  const category = formData.category;
  const requireFields = (keys, message) => keys.some((key) => !hasValue(fields[key])) ? message : null;
  const requireDocs = (keys, message) => keys.some((key) => !hasDoc(docs, key)) ? message : null;
  if (["Electricity Bill", "Gas Bill", "Water Bill"].includes(category)) {
    if (!hasValue(formData.instituteName || fields.company)) return "Please select the service provider";
    if (!hasValue(formData.refNumber)) return "Please enter the consumer reference number";
    if (!hasValue(fields.bill_owner_name)) return "Please enter the bill owner's name";
    return requireDocs(["bill"], "Please upload the bill photo");
  }
  if (category === "School, College & University Fees") {
    if (!hasValue(fields.edu_sub_type || formData.eduSubType)) return "Please select the fee type";
    if (requireFields(["student_name", "father_name", "roll_no"], "Please complete the student details")) {
      return "Please complete the student details";
    }
    const subtype = fields.edu_sub_type || formData.eduSubType;
    const subFields = subtype === "school" ? EDUCATION_FEE_FIELDS.School : subtype === "college" ? EDUCATION_FEE_FIELDS.College : subtype === "university" ? EDUCATION_FEE_FIELDS.University : [];
    if (subFields.some((field) => field.required && !hasValue(fields[field.key]))) {
      return "Please complete all required education details";
    }
    return requireDocs(["fee_challan", "student_id_proof"], "Please upload the fee challan and student ID proof");
  }
  if (category === "Education, Books & Admission") {
    const subtype = fields.edu_sub_type || formData.eduSubType;
    if (!hasValue(subtype)) return "Please select the education help type";
    if (!hasValue(fields.student_name) || !hasValue(fields.student_class)) return "Please complete the student details";
    const level = fields.admission_level || formData.eduAdmissionLevel || "";
    if (subtype === "admission" && !hasValue(level)) return "Please select the admission level";
    const admissionFields = subtype === "admission" ? EDUCATION_ADMISSION_FIELDS[level] || [] : [];
    if (admissionFields.some((field) => field.required && !hasValue(fields[field.key]))) {
      return "Please complete all required admission details";
    }
    const requiredDocs = getEducationDocs(subtype);
    return requireDocs(requiredDocs.filter((doc) => doc.required).map((doc) => doc.key), "Please upload all required education documents");
  }
  const rules = {
    "Medical & Treatment": { fields: ["patient_name", "illness", "hospital_name"], docs: ["medical_bill"], message: "Please complete the medical details and upload the medical bill" },
    Medicines: { fields: ["patient_name", "illness"], docs: ["medicine_estimate", "doctor_report"], message: "Please complete the medicine details and upload the required documents" },
    "Child Support": { fields: ["child_name", "child_age", "parents_status"], docs: ["child_b_form", "parents_proof"], message: "Please complete the child details and upload the required documents" },
    "Widow & Elderly Support": { fields: ["status", "full_name", "age"], docs: ["cnic"], message: "Please complete the support details and upload the CNIC" },
    "Disability Support": { fields: [], docs: ["disability_cnic", "disability_photo"], message: "Please select the disability details and upload the required documents" },
    "House Rent": { fields: ["landlord_name", "landlord_contact", "rent_amount"], docs: ["rental_agreement", "landlord_cnic"], message: "Please complete the rent details and upload the required documents" },
    "Food & Groceries": { fields: ["family_members", "shop_name", "groceries_amount"], docs: ["groceries_estimate"], message: "Please complete the grocery details and upload the estimate" },
    "Debt Relief": { fields: ["creditor_name", "total_debt"], docs: ["debt_proof"], message: "Please complete the debt details and upload proof" },
    "Emergency Help": { fields: ["emergency_type", "emergency_description"], docs: ["emergency_proof"], message: "Please complete the emergency details and upload proof" },
    "Marriage Support": { fields: ["relation", "person_name"], docs: ["relation_proof", "marriage_quotation"], message: "Please complete the marriage support details and upload proof" },
    "Funeral Expenses": { fields: ["deceased_relation", "deceased_name"], docs: ["death_certificate", "relation_proof"], message: "Please complete the funeral details and upload proof" },
    "Home Repair": { fields: ["property_type", "repair_type", "repair_amount"], docs: ["repair_estimate"], message: "Please complete the repair details and upload the estimate" },
    "Business / Work Help": { fields: ["business_name", "business_amount"], docs: ["business_quotation", "business_proof"], message: "Please complete the business details and upload proof" },
    "Livestock / Farming": { fields: ["farm_type", "farm_amount"], docs: ["livestock_quotation", "livestock_proof"], message: "Please complete the farming details and upload proof" }
  };
  const rule = rules[category];
  if (rule) {
    if (category === "Disability Support" && (!hasValue(formData.disabilityType) || !hasValue(formData.disabilityMode))) return rule.message;
    if (rule.fields.some((key) => !hasValue(fields[key])) || rule.docs.some((key) => !hasDoc(docs, key))) return rule.message;
    if (category === "Widow & Elderly Support" && fields.status === "Widow" && !hasDoc(docs, "death_cert")) return "Please upload the death certificate";
  }
  return null;
}
function validateStep(stepId, formData) {
  formData.catFields || {};
  formData.catDocUrls || {};
  switch (stepId) {
    case "category":
      return !hasValue(formData.category) ? "Please select a category" : null;
    case "title":
      return !hasValue(formData.title) ? "Please enter a title" : null;
    case "shortDesc":
      return !hasValue(formData.shortDesc) ? "Please enter a short description" : null;
    case "country":
      return !hasValue(formData.country) ? "Please select your country" : null;
    case "city":
      return !hasValue(formData.city) ? "Please enter your city" : null;
    case "urgency":
      return !hasValue(formData.urgency) ? "Please select an urgency level" : null;
    case "gender":
      return !hasValue(formData.gender) ? "Please select your gender" : null;
    case "maritalStatus":
      return ["Male", "Female"].includes(formData.gender) && !hasValue(formData.maritalStatus) ? "Please select your marital status" : null;
    case "orphan":
      return ["Female", "Child"].includes(formData.gender) && !hasValue(formData.isOrphan) ? "Please select your orphan status" : null;
    case "orphanParent":
      return formData.isOrphan === "Yes" && !hasValue(formData.orphanParent) ? "Please select which parent passed away" : null;
    case "genderDocuments":
      return getRequiredGenderDocKeys(formData.gender, formData.maritalStatus, formData.isOrphan).some((key) => !hasDoc(formData.genderDocUrls || {}, key)) ? "Please upload all required identity documents" : null;
    case "seekerName":
      return !hasValue(formData.seekerName) ? "Please enter your full name" : null;
    case "seekerContact":
      return !hasValue(formData.seekerContact) ? "Please enter your contact number" : null;
    case "jobStatus":
      return !hasValue(formData.jobStatus) ? "Please select your employment status" : null;
    case "jobDocuments":
      return formData.jobStatus === "Yes" && (!hasValue(formData.salarySlipUrl) || !hasValue(formData.statementUrl)) ? "Please upload your salary slip and bank statement" : null;
    case "noJobDocument":
      return formData.jobStatus === "No" && !hasValue(formData.statementUrl) ? "Please upload your bank statement" : null;
    case "categoryDetails":
      return validateCategoryDetails(formData);
    case "propertyOwnership":
      return PROPERTY_RELEVANT_CATS.has(formData.category) && !hasValue(formData.propertyOwnership) ? "Please select property ownership" : null;
    case "rentedDocuments":
      return formData.propertyOwnership === "rented" && (!hasValue(formData.rentalAgreementUrl) || !hasValue(formData.landlordCnicUrl)) ? "Please upload both rented property documents" : null;
    case "ownedDocuments":
      return formData.propertyOwnership === "owned" && (!hasValue(formData.ownerCnicUrl) || !hasValue(formData.ownerRelation)) ? "Please upload the owner's CNIC and select the relation" : null;
    case "paymentReceiver": {
      if (!PAYMENT_RECEIVER_CATS.has(formData.category)) return null;
      const required = ["receiverName", "receiverContact", "receiverBank", "receiverAccount", "receiverAddress"];
      if (required.some((key) => !hasValue(formData[key]))) return "Please complete the payment receiver details";
      if (["Food & Groceries", "Medicines", "Home Repair"].includes(formData.category) && !hasValue(formData.receiverShopName)) return "Please enter the shop name";
      return null;
    }
    case "whyHelp": {
      const text = String(formData.description || formData.whyHelp || "").trim();
      const words = countWords(text);
      return !text ? "Please explain your situation in detail" : words < MIN_WHY_HELP_WORDS ? `Please write at least ${MIN_WHY_HELP_WORDS} words (currently ${words}).` : null;
    }
    case "debtTotal": {
      const value = Number(formData.debtTotalAmount);
      return isDebtCategory(formData.category) && (!Number.isFinite(value) || value <= 0) ? "Please enter your total debt amount" : null;
    }
    case "amount": {
      if (isDebtCategory(formData.category)) return null;
      const value = Number(formData.amount);
      if (!Number.isFinite(value) || value <= 0) return "Please enter the amount needed";
      const max = getMaxLimit(formData.category);
      return max && value > max ? `Amount cannot exceed Rs ${max.toLocaleString()}` : null;
    }
    case "currency":
      return !hasValue(formData.currency) ? "Please select a currency" : null;
    case "deadline":
      return !hasValue(formData.deadline) ? "Please select a deadline" : new Date(formData.deadline) < /* @__PURE__ */ new Date() ? "Deadline must be in the future" : null;
    case "selfie":
      return !hasValue(formData.selfieUrl) ? "Please take a live selfie" : null;
    case "video":
      return !hasValue(formData.videoUrl) ? "Please record a video appeal" : null;
    case "terms":
      return formData.confirmed === true || formData.confirmed === "true" ? null : "You must agree to the Terms & Conditions";
    default:
      return null;
  }
}
async function submitCase(formData, userId, isFree) {
  var _a, _b, _c, _d;
  const requirePermanentUrl = (value, label) => {
    const url = String(value || "").trim();
    if (!/^https:\/\//i.test(url) || /^blob:/i.test(url) || /^data:/i.test(url)) {
      throw new Error(`${label} upload is incomplete. Please upload it again before submitting.`);
    }
    return url;
  };
  let finalAmount = 0;
  const category = formData.category;
  const fixedAmount = getFixedAmount(category);
  if (fixedAmount != null) {
    finalAmount = fixedAmount;
  } else if (category === "Debt Relief") {
    const debt = parseFloat(formData.debtTotalAmount) || 0;
    finalAmount = calculateDebtAmount(debt);
  } else {
    finalAmount = parseFloat(formData.amount) || 0;
  }
  const catDocUrls = formData.catDocUrls || {};
  const genderDocUrls = formData.genderDocUrls || {};
  const photoUrls = [
    ...Object.values(catDocUrls),
    ...Object.values(genderDocUrls)
  ].filter(Boolean);
  const isEarlyRequest = formData.isEarlyRequest === true;
  const caseData = {
    user_id: userId,
    category: formData.category,
    title: formData.title,
    short_description: formData.shortDesc,
    country: formData.country,
    city: formData.city,
    urgency: formData.urgency || "Medium",
    description: formData.description,
    amount_needed: finalAmount,
    currency: formData.currency || "PKR",
    why_help: formData.description,
    deadline: formData.deadline,
    institute_name: ((_a = formData.catFields) == null ? void 0 : _a.institute_name) || formData.instituteName || "",
    institute_contact: ((_b = formData.catFields) == null ? void 0 : _b.institute_contact) || "",
    institute_address: ((_c = formData.catFields) == null ? void 0 : _c.institute_address) || "",
    payment_method: "Direct",
    account_title: formData.receiverName || "",
    account_number: formData.receiverAccount || formData.refNumber || "",
    account_iban: "",
    category_details: {
      ...formData.catFields,
      ...formData.eduSubFields || {},
      property_ownership: formData.propertyOwnership,
      job_status: formData.jobStatus,
      gender: formData.gender,
      marital_status: formData.maritalStatus,
      is_orphan: formData.isOrphan,
      orphan_parent: formData.orphanParent,
      seeker_name: formData.seekerName,
      seeker_contact: formData.seekerContact,
      disability_mode: formData.disabilityMode,
      disability_type: formData.disabilityType,
      salary_slip_url: formData.salarySlipUrl,
      statement_url: formData.statementUrl,
      rental_agreement_url: formData.rentalAgreementUrl,
      landlord_cnic_url: formData.landlordCnicUrl,
      owner_cnic_url: formData.ownerCnicUrl,
      owner_relation: formData.ownerRelation,
      receiver_name: formData.receiverName || "",
      receiver_contact: formData.receiverContact || "",
      receiver_bank: formData.receiverBank || "",
      receiver_account: formData.receiverAccount || "",
      receiver_address: formData.receiverAddress || "",
      receiver_shop_name: formData.receiverShopName || "",
      gender_doc_urls: genderDocUrls,
      cat_doc_urls: catDocUrls,
      ref_number: formData.refNumber || "",
      institute_name: formData.instituteName || ((_d = formData.catFields) == null ? void 0 : _d.institute_name) || "",
      property_rental_agreement_url: formData.rentalAgreementUrl || "",
      property_landlord_cnic_url: formData.landlordCnicUrl || "",
      property_owner_cnic_url: formData.ownerCnicUrl || "",
      // Early request after completed case (15–30 day window)
      is_early_request: isEarlyRequest,
      was_early_request: isEarlyRequest
    },
    photo_urls: photoUrls,
    selfie_url: requirePermanentUrl(formData.selfieUrl, "Selfie"),
    video_url: requirePermanentUrl(formData.videoUrl, "Appeal video"),
    status: "pending",
    submitted_at: (/* @__PURE__ */ new Date()).toISOString(),
    was_free: isFree,
    is_early_request: isEarlyRequest
  };
  await insertCaseSubmission(caseData);
  if (isFree) {
    await sendNotification(
      userId,
      "system",
      isEarlyRequest ? "Early Request Submitted FREE" : "Case Submitted FREE",
      isEarlyRequest ? `Your early request "${formData.title}" was submitted FREE and is under admin review.` : `Your case "${formData.title}" was submitted FREE and is under review.`,
      "/my-cases"
    );
    return {
      success: true,
      message: isEarlyRequest ? "Early request submitted FREE. Admin will review — approval is not guaranteed." : "Your case is FREE! Submitted for review."
    };
  }
  await sendNotification(
    userId,
    "system",
    isEarlyRequest ? "Early Request Submitted" : "Case Submitted",
    isEarlyRequest ? `Your early request "${formData.title}" is under admin review.` : `Your case "${formData.title}" was submitted and is under review.`,
    "/my-cases"
  );
  return {
    success: true,
    message: isEarlyRequest ? "Early request submitted. Admin will review — approval is not guaranteed." : "Case submitted! Under review."
  };
}
const STEP_COMPONENTS = {
  category: StepCategory,
  title: StepTitle,
  shortDesc: StepShortDesc,
  country: StepCountry,
  city: StepCity,
  urgency: StepUrgency,
  gender: StepGender,
  maritalStatus: StepMaritalStatus,
  orphan: StepOrphan,
  orphanParent: StepOrphanParent,
  genderDocuments: StepGenderDocuments,
  seekerName: StepSeekerName,
  seekerContact: StepSeekerContact,
  jobStatus: StepJobStatus,
  jobDocuments: StepJobDocuments,
  noJobDocument: StepNoJobDocument,
  categoryDetails: StepCategoryDetails,
  propertyOwnership: StepPropertyOwnership,
  rentedDocuments: StepRentedDocuments,
  ownedDocuments: StepOwnedDocuments,
  paymentReceiver: StepPaymentReceiver,
  whyHelp: StepWhyHelp,
  debtTotal: StepDebtTotal,
  amount: StepAmount,
  currency: StepCurrency,
  deadline: StepDeadline,
  selfie: StepSelfie,
  video: StepVideo,
  terms: StepTerms
};
const STEPS_NEEDING_FORMDATA = /* @__PURE__ */ new Set([
  "jobDocuments",
  "noJobDocument",
  "genderDocuments",
  "categoryDetails",
  "rentedDocuments",
  "ownedDocuments",
  "paymentReceiver",
  "debtTotal",
  "selfie",
  "video",
  "amount",
  "deadline"
]);
const PLACEHOLDERS = {
  title: "e.g. Help with School Fee",
  shortDesc: "One line summary",
  seekerName: "Your full name",
  seekerContact: "Your phone",
  city: "e.g. Karachi"
};
const INITIAL_FORM = {
  category: "",
  title: "",
  shortDesc: "",
  country: "",
  city: "",
  urgency: "",
  gender: "",
  maritalStatus: "",
  isOrphan: "",
  orphanParent: "",
  genderDocUrls: {},
  seekerName: "",
  seekerContact: "",
  jobStatus: "",
  salarySlipUrl: "",
  statementUrl: "",
  catFields: {},
  catDocUrls: {},
  propertyOwnership: "",
  rentalAgreementUrl: "",
  landlordCnicUrl: "",
  ownerCnicUrl: "",
  ownerRelation: "",
  receiverName: "",
  receiverContact: "",
  receiverBank: "",
  receiverAccount: "",
  receiverAddress: "",
  receiverShopName: "",
  description: "",
  debtTotalAmount: "",
  amount: "",
  currency: "PKR",
  deadline: "",
  selfieUrl: "",
  videoUrl: "",
  confirmed: false,
  isEarlyRequest: false
};
function SubmitRequestWizard() {
  var _a, _b, _c;
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = reactExports.useState({ ...INITIAL_FORM });
  const [currentStepId, setCurrentStepId] = reactExports.useState("category");
  const [submitting, setSubmitting] = reactExports.useState(false);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [checkingKyc, setCheckingKyc] = reactExports.useState(true);
  const [forceNewCase, setForceNewCase] = reactExports.useState(false);
  const [allowEarlyFlow, setAllowEarlyFlow] = reactExports.useState(false);
  const { saveDraft, loadDraft, clearDraft } = useSubmitDraft();
  const { stats, loading: statsLoading, refetch } = useUserSubmitStats(user == null ? void 0 : user.id);
  const { cooldown, remainingLabel, loading: cooldownLoading } = useCompletionCooldown(user == null ? void 0 : user.id);
  const visibleStepIds = useVisibleSteps(formData);
  const currentIndex = visibleStepIds.indexOf(currentStepId);
  const totalSteps = visibleStepIds.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;
  const canUseFree = !stats.isSuspended && !stats.isFreeDisabled && stats.freeCasesUsed < 2;
  const willBeFree = canUseFree;
  const balance = stats.balance ?? 0;
  const currentStepIdRef = reactExports.useRef(currentStepId);
  currentStepIdRef.current = currentStepId;
  const formDataRef = reactExports.useRef(formData);
  formDataRef.current = formData;
  const visibleStepIdsRef = reactExports.useRef(visibleStepIds);
  visibleStepIdsRef.current = visibleStepIds;
  const allowEarlyFlowRef = reactExports.useRef(allowEarlyFlow);
  allowEarlyFlowRef.current = allowEarlyFlow;
  const cooldownRef = reactExports.useRef(cooldown);
  cooldownRef.current = cooldown;
  reactExports.useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in", search: { redirect: "/onboarding-submit" } });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const kyc = (user == null ? void 0 : user.id) ? await getKycStatus(user.id) : null;
        const approved = String((kyc == null ? void 0 : kyc.status) || "none").trim().toLowerCase() === "approved";
        if (!approved) {
          try {
            sessionStorage.setItem("givethra_kyc_return_to", "/onboarding-submit");
          } catch {
          }
          navigate({ to: "/kyc" });
          return;
        }
        const saved = loadDraft();
        if (!cancelled && saved) {
          setFormData((prev) => ({ ...prev, ...saved }));
          if (saved._stepId) setCurrentStepId(saved._stepId);
        }
      } catch {
        try {
          sessionStorage.setItem("givethra_kyc_return_to", "/onboarding-submit");
        } catch {
        }
        navigate({ to: "/kyc" });
      } finally {
        if (!cancelled) {
          setCheckingKyc(false);
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, navigate, loadDraft, user == null ? void 0 : user.id]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    const early = new URLSearchParams(window.location.search).get("early") === "1";
    if (early && cooldown.phase === "early_available") {
      setAllowEarlyFlow(true);
    }
  }, [cooldown.phase]);
  reactExports.useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      saveDraft({ ...formDataRef.current, _stepId: currentStepIdRef.current });
    }, 400);
    return () => clearTimeout(timer);
  }, [formData, currentStepId, isLoading, saveDraft]);
  reactExports.useEffect(() => {
    if (!visibleStepIds.includes(currentStepId) && visibleStepIds.length > 0) {
      setCurrentStepId(visibleStepIds[0]);
    }
  }, [visibleStepIds, currentStepId]);
  const handleFieldChange = reactExports.useCallback((field, value) => {
    formDataRef.current = { ...formDataRef.current, [field]: value };
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);
  const handleNext = reactExports.useCallback(() => {
    const stepId = currentStepIdRef.current;
    const data = formDataRef.current;
    const error = validateStep(stepId, data);
    if (error) {
      ue.error(error);
      return;
    }
    const idx = visibleStepIdsRef.current.indexOf(stepId);
    const nextIndex = idx + 1;
    if (nextIndex < visibleStepIdsRef.current.length) {
      setCurrentStepId(visibleStepIdsRef.current[nextIndex]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);
  const handleBack = reactExports.useCallback(() => {
    const stepId = currentStepIdRef.current;
    const idx = visibleStepIdsRef.current.indexOf(stepId);
    const prevIndex = idx - 1;
    if (prevIndex >= 0) {
      setCurrentStepId(visibleStepIdsRef.current[prevIndex]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);
  const handleSubmit = reactExports.useCallback(async () => {
    const latest = { ...formDataRef.current };
    if (latest.confirmed === "true" || latest.confirmed === 1) {
      latest.confirmed = true;
    }
    for (const stepId of visibleStepIdsRef.current) {
      const error = validateStep(stepId, latest);
      if (error) {
        ue.error(error);
        setCurrentStepId(stepId);
        return;
      }
    }
    if (latest.confirmed !== true) {
      ue.error("You must agree to the Terms & Conditions.");
      setCurrentStepId("terms");
      return;
    }
    if (!latest.selfieUrl) {
      ue.error("Please take a live selfie");
      setCurrentStepId("selfie");
      return;
    }
    if (!latest.videoUrl) {
      ue.error("Please record a video appeal");
      setCurrentStepId("video");
      return;
    }
    const isEarly = allowEarlyFlowRef.current && cooldownRef.current.phase === "early_available";
    setSubmitting(true);
    try {
      const payload = { ...latest, confirmed: true, isEarlyRequest: isEarly };
      const result = await submitCase(payload, user.id, willBeFree);
      clearDraft();
      setForceNewCase(false);
      setAllowEarlyFlow(false);
      ue.success(result.message);
      refetch();
      navigate({ to: "/my-cases" });
    } catch (err) {
      const message = (err == null ? void 0 : err.message) || "Submission failed";
      if (String(message).toLowerCase().includes("kyc")) {
        ue.error(message);
        navigate({ to: "/kyc" });
      } else {
        ue.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  }, [user, willBeFree, clearDraft, navigate, refetch]);
  const stableOnChange = reactExports.useCallback(
    (val) => {
      const stepId = currentStepIdRef.current;
      if (stepId === "whyHelp") {
        handleFieldChange("description", val);
      } else if (stepId === "terms") {
        handleFieldChange("confirmed", val === true || val === "true");
      } else if (stepId === "orphan") {
        handleFieldChange("isOrphan", val);
      } else {
        handleFieldChange(stepId, val);
      }
    },
    [handleFieldChange]
  );
  const stableSetFormData = reactExports.useCallback((updater) => {
    if (typeof updater === "function") {
      const next = updater(formDataRef.current);
      formDataRef.current = next;
      setFormData(next);
    } else {
      formDataRef.current = updater;
      setFormData(updater);
    }
  }, []);
  const startFreshCase = reactExports.useCallback(() => {
    clearDraft();
    setFormData({ ...INITIAL_FORM });
    setCurrentStepId("category");
    setForceNewCase(true);
  }, [clearDraft]);
  const currentValue = currentStepId === "whyHelp" ? formData.description : currentStepId === "terms" ? formData.confirmed : currentStepId === "orphan" ? formData.isOrphan : formData[currentStepId] ?? "";
  const needsFormData = STEPS_NEEDING_FORMDATA.has(currentStepId);
  const stepProps = reactExports.useMemo(() => {
    const common = {
      value: currentValue,
      onChange: stableOnChange,
      onNext: isLast ? handleSubmit : handleNext,
      onBack: handleBack,
      isFirst,
      isLast,
      submitting
    };
    const extra = {};
    if (currentStepId === "category") {
      extra.willBeFree = willBeFree;
      extra.isFreeDisabled = stats.isFreeDisabled;
      extra.freeCasesUsed = stats.freeCasesUsed;
    }
    if (needsFormData) {
      extra.formData = formData;
      extra.setFormData = stableSetFormData;
    }
    if (PLACEHOLDERS[currentStepId]) {
      extra.placeholder = PLACEHOLDERS[currentStepId];
    }
    return { ...common, ...extra };
  }, [currentStepId, currentValue, stableOnChange, handleNext, handleBack, handleSubmit, isFirst, isLast, submitting, willBeFree, stats.isFreeDisabled, stats.freeCasesUsed, formData, stableSetFormData, needsFormData]);
  const CurrentStepComponent = STEP_COMPONENTS[currentStepId];
  const shell = (body) => /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto px-4 py-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SubmitTopBar, { isFree: willBeFree, balance }),
    body
  ] }) });
  if (isLoading || checkingKyc || statsLoading || cooldownLoading) {
    return shell(/* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center", children: "Loading Submit Request Wizard..." }));
  }
  if (stats.isSuspended) {
    return shell(
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-8 space-y-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-red-700", children: "Account Suspended" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Your account is suspended. Please unlock it first." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate({ to: "/wallet" }), children: "Go to Wallet" })
      ] })
    );
  }
  if (stats.blockedByFeedback) {
    return shell(
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-8 space-y-4 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Please Share Your Feedback First" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          'Your case "',
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: stats.blockedByFeedback.caseTitle }),
          '" was completed. Before submitting a new case, please share your feedback (message + video).'
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cases/$id", params: { id: stats.blockedByFeedback.caseId }, children: "Go to My Completed Case" }) })
      ] })
    );
  }
  const inCooldown = cooldown.phase === "waiting" || cooldown.phase === "early_available" || cooldown.phase === "early_locked";
  if (inCooldown && !(allowEarlyFlow && cooldown.phase === "early_available")) {
    return shell(
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 p-8 space-y-5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-rose-800", children: "Your Help Was Completed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base", children: "You can submit another case after 30 Days" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-semibold tabular-nums", children: [
          "⏳ ",
          formatRemaining(cooldown.remainingMs)
        ] }),
        cooldown.lastCompletedTitle && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Last completed: “",
          cooldown.lastCompletedTitle,
          "”"
        ] }),
        cooldown.phase === "early_available" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-white/90 dark:bg-card p-4 space-y-3 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "Need Help Again?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You may submit one early request for review. Approval is not guaranteed." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: () => setAllowEarlyFlow(true), children: "Request Early Review" })
        ] }),
        cooldown.phase === "early_locked" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-600", children: [
          "Your early request was not approved. Please wait ",
          remainingLabel,
          " before submitting again."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/home", children: "Back to Home" }) })
      ] })
    );
  }
  if (((_a = stats.activeCase) == null ? void 0 : _a.status) === "pending" && !forceNewCase) {
    return shell(
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-8 space-y-5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-amber-800", children: "Case Under Review" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base", children: [
          "Your case ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            '"',
            stats.activeCase.title,
            '"'
          ] }),
          " is ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Pending" }),
          "."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/home", children: "Back to Home" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cases/$id", params: { id: stats.activeCase.id }, children: "View My Case" }) })
        ] })
      ] })
    );
  }
  if (((_b = stats.activeCase) == null ? void 0 : _b.status) === "approved" && !forceNewCase) {
    return shell(
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-green-300 bg-green-50 dark:bg-green-950/20 p-8 space-y-5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-green-800", children: "Case Approved" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            '"',
            stats.activeCase.title,
            '"'
          ] }),
          " is live."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/home", children: "Back to Home" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cases/$id", params: { id: stats.activeCase.id }, children: "Open Case Page" }) })
        ] })
      ] })
    );
  }
  if (((_c = stats.activeCase) == null ? void 0 : _c.status) === "rejected" && !forceNewCase) {
    return shell(
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-8 space-y-5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-red-700", children: "Case Rejected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            '"',
            stats.activeCase.title,
            '"'
          ] }),
          " was rejected."
        ] }),
        stats.activeCase.rejectionReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white dark:bg-card border p-4 text-left text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "Reason:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground whitespace-pre-wrap", children: stats.activeCase.rejectionReason })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { className: "w-full", onClick: startFreshCase, children: "Submit a New Case" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", asChild: true, className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/home", children: "Back to Home" }) })
        ] })
      ] })
    );
  }
  return shell(
    /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      allowEarlyFlow && cooldown.phase === "early_available" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-amber-900 dark:text-amber-100", children: "Early review request" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-900/80 dark:text-amber-100/80 mt-1", children: "Admin will review this as an early request. Approval is not guaranteed." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StepProgress, { current: Math.max(currentIndex + 1, 1), total: Math.max(totalSteps, 1) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: CurrentStepComponent && /* @__PURE__ */ jsxRuntimeExports.jsx(CurrentStepComponent, { ...stepProps }, currentStepId) }),
      currentIndex > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-xs text-muted-foreground text-center", children: "Your progress is saved automatically." })
    ] })
  );
}
export {
  SubmitRequestWizard as default
};
