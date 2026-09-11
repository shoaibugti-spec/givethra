import { w as createLucideIcon, u as useNavigate, r as reactExports, j as getApprovedCases, l as jsxRuntimeExports, p as ue } from "./main-EspZtMZv.js";
import { L as Layout } from "./Layout-wYZkEQhc.js";
import { B as Button } from "./button-BrpTixLc.js";
import { I as Input } from "./input-DprFI1f6.js";
import { L as Label } from "./label-DOzeUvXs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-RlYogfnt.js";
import { s as shareCase } from "./caseSharing-DzTdnRpU.js";
import { S as Search } from "./search-DlEEPgKI.js";
import { X } from "./x-Br49mtL5.js";
import { C as CircleCheck } from "./circle-check-BPQn3gNr.js";
import { M as MapPin } from "./map-pin-C91oi1yI.js";
import { S as Share2 } from "./share-2-CjdTjd5b.js";
import "./users-_6SD4cVf.js";
import "./heart-CaEhMUxo.js";
import "./message-circle-CqePZOv0.js";
import "./index-o8esZfzI.js";
import "./index-D1NJSY4H.js";
import "./index-BjBsYUTf.js";
import "./index-D7zt7y2w.js";
import "./Combination-BHE4JWne.js";
import "./index-C_XxiJMd.js";
import "./chevron-down-Dbk3kovR.js";
import "./check-Bg7ZFbn9.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const SlidersHorizontal = createLucideIcon("SlidersHorizontal", [
  ["line", { x1: "21", x2: "14", y1: "4", y2: "4", key: "obuewd" }],
  ["line", { x1: "10", x2: "3", y1: "4", y2: "4", key: "1q6298" }],
  ["line", { x1: "21", x2: "12", y1: "12", y2: "12", key: "1iu8h1" }],
  ["line", { x1: "8", x2: "3", y1: "12", y2: "12", key: "ntss68" }],
  ["line", { x1: "21", x2: "16", y1: "20", y2: "20", key: "14d8ph" }],
  ["line", { x1: "12", x2: "3", y1: "20", y2: "20", key: "m0wm8r" }],
  ["line", { x1: "14", x2: "14", y1: "2", y2: "6", key: "14e1ph" }],
  ["line", { x1: "8", x2: "8", y1: "10", y2: "14", key: "1i6ji0" }],
  ["line", { x1: "16", x2: "16", y1: "18", y2: "22", key: "1lctlv" }]
]);
const CATEGORIES = [
  "Education",
  "School Fees",
  "University Fees",
  "Books",
  "Uniform",
  "Medical",
  "Surgery",
  "Medicines",
  "Utilities",
  "Housing",
  "Food",
  "Employment",
  "Transportation",
  "Disability Support",
  "Orphans",
  "Widows",
  "Debt Relief",
  "Emergency Needs",
  "Other"
];
const URGENCIES = ["Low", "Medium", "High", "Emergency"];
const CURRENCY_SYMBOLS = {
  USD: "$",
  PKR: "Rs",
  SAR: "SAR",
  AED: "AED",
  GBP: "£",
  EUR: "€",
  INR: "₹",
  TRY: "₺",
  BDT: "৳",
  EGP: "E£",
  NGN: "₦",
  KES: "KSh",
  ZAR: "R",
  BRL: "R$",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  IDR: "Rp",
  MYR: "RM",
  THB: "฿",
  PHP: "₱",
  VND: "₫",
  SGD: "S$",
  AFN: "؋",
  NPR: "Rs",
  LKR: "Rs",
  QAR: "QAR",
  KWD: "KWD",
  BHD: "BHD",
  OMR: "OMR",
  JOD: "JOD",
  MAD: "MAD"
};
function sym(cur) {
  return CURRENCY_SYMBOLS[cur] ?? cur;
}
function CasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [showFilters, setShowFilters] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [filterCountry, setFilterCountry] = reactExports.useState("all");
  const [filterCity, setFilterCity] = reactExports.useState("all");
  const [filterCat, setFilterCat] = reactExports.useState("all");
  const [filterUrgency, setFilterUrgency] = reactExports.useState("all");
  const [sortBy, setSortBy] = reactExports.useState("newest");
  const [detectedCountry, setDetectedCountry] = reactExports.useState(null);
  reactExports.useEffect(() => {
    loadCases();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`
            );
            const data = await res.json();
            if (data == null ? void 0 : data.countryName) setDetectedCountry(data.countryName);
          } catch {
          }
        },
        () => {
        },
        { timeout: 8e3 }
      );
    }
  }, []);
  async function loadCases() {
    setLoading(true);
    try {
      const data = await getApprovedCases();
      setCases(data ?? []);
    } catch (err) {
      console.error("Failed to load cases:", err);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }
  const countries = Array.from(new Set(cases.map((c) => c.country).filter(Boolean))).sort();
  const cities = Array.from(
    new Set(
      cases.filter((c) => filterCountry === "all" || c.country === filterCountry).map((c) => c.city).filter(Boolean)
    )
  ).sort();
  let filtered = cases.filter((c) => {
    var _a, _b, _c, _d, _e;
    if (filterCountry !== "all" && c.country !== filterCountry) return false;
    if (filterCity !== "all" && c.city !== filterCity) return false;
    if (filterCat !== "all" && c.category !== filterCat) return false;
    if (filterUrgency !== "all" && c.urgency !== filterUrgency) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!((_a = c.title) == null ? void 0 : _a.toLowerCase().includes(q)) && !((_b = c.short_description) == null ? void 0 : _b.toLowerCase().includes(q)) && !((_c = c.description) == null ? void 0 : _c.toLowerCase().includes(q)) && !((_d = c.institute_name) == null ? void 0 : _d.toLowerCase().includes(q)) && !((_e = c.city) == null ? void 0 : _e.toLowerCase().includes(q)))
        return false;
    }
    return true;
  });
  filtered = [...filtered].sort((a, b) => {
    const activeRank = (status) => ["active", "live"].includes(String(status || "").toLowerCase()) ? 1 : 0;
    const activeDifference = activeRank(b.status) - activeRank(a.status);
    if (activeDifference !== 0) return activeDifference;
    if (sortBy === "newest")
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    if (sortBy === "oldest")
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    if (sortBy === "amount_low") return (a.amount_needed ?? 0) - (b.amount_needed ?? 0);
    if (sortBy === "amount_high") return (b.amount_needed ?? 0) - (a.amount_needed ?? 0);
    if (sortBy === "urgent") {
      const order = { Emergency: 4, High: 3, Medium: 2, Low: 1 };
      return (order[b.urgency] ?? 0) - (order[a.urgency] ?? 0);
    }
    return 0;
  });
  const activeFilterCount = [filterCountry, filterCity, filterCat, filterUrgency].filter(
    (f) => f !== "all"
  ).length;
  const categoryTabs = [
    { label: "All", value: "all", count: cases.length },
    ...CATEGORIES.map((category) => ({
      label: category,
      value: category,
      count: cases.filter((item) => item.category === category).length
    })).filter((item) => item.count > 0)
  ];
  function resetFilters() {
    setFilterCountry("all");
    setFilterCity("all");
    setFilterCat("all");
    setFilterUrgency("all");
    setSortBy("newest");
    setSearch("");
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 py-6 space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Browse Cases" }),
      detectedCountry && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setFilterCountry(detectedCountry),
          className: "text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium",
          children: [
            "📍 Near me: ",
            detectedCountry
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "Search by hospital, school, title, city...",
          value: search,
          onChange: (e) => setSearch(e.target.value),
          className: "pl-10 h-11"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 scrollbar-hide", "aria-label": "Case category tabs", children: categoryTabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setFilterCat(tab.value),
        className: `shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${filterCat === tab.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`,
        children: [
          tab.label,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 opacity-75", children: tab.count })
        ]
      },
      tab.value
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          onClick: () => setShowFilters(!showFilters),
          className: "gap-2 flex-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { className: "h-4 w-4" }),
            "Filters",
            " ",
            activeFilterCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-primary text-white text-[10px] rounded-full px-1.5", children: activeFilterCount })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: sortBy, onValueChange: setSortBy, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "newest", children: "Newest First" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "oldest", children: "Oldest First" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "amount_low", children: "Amount: Low to High" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "amount_high", children: "Amount: High to Low" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "urgent", children: "Most Urgent" })
        ] })
      ] })
    ] }),
    showFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: "Filters" }),
        activeFilterCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: resetFilters,
            className: "text-xs text-red-600 flex items-center gap-1",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }),
              " Clear all"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Country" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: filterCountry,
            onValueChange: (v) => {
              setFilterCountry(v);
              setFilterCity("all");
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-60", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Countries" }),
                countries.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "City" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: filterCity,
            onValueChange: setFilterCity,
            disabled: filterCountry === "all",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                SelectValue,
                {
                  placeholder: filterCountry === "all" ? "Select country first" : "All cities"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-60", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Cities" }),
                cities.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterCat, onValueChange: setFilterCat, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-60", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All Categories" }),
            CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Urgency" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setFilterUrgency("all"),
              className: `px-2 py-2 rounded-lg border text-xs font-medium ${filterUrgency === "all" ? "bg-primary text-white border-primary" : "border-border"}`,
              children: "All"
            }
          ),
          URGENCIES.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setFilterUrgency(u),
              className: `px-2 py-2 rounded-lg border text-xs font-medium ${filterUrgency === u ? "bg-primary text-white border-primary" : "border-border"}`,
              children: u
            },
            u
          ))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      filtered.length,
      " case(s) found"
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20 text-muted-foreground", children: "Loading..." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 rounded-xl border border-dashed bg-muted/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "No cases found." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Try changing your filters." }),
      activeFilterCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", className: "mt-3", onClick: resetFilters, children: "Clear Filters" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: filtered.map((c) => {
      const cur = c.currency || "USD";
      const s = sym(cur);
      const needed = Number(c.amount_needed ?? 0);
      const collected = Number(c.amount_collected ?? 0);
      const pct = needed > 0 ? Math.min(Math.round(collected / needed * 100), 100) : 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "rounded-xl border bg-card overflow-hidden cursor-pointer hover:shadow-md transition-shadow",
          onClick: () => navigate({
            to: "/cases/$id",
            params: { id: c.id }
          }),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full", children: c.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `text-xs font-medium px-2 py-0.5 rounded-full ${c.urgency === "Emergency" ? "bg-red-100 text-red-700" : c.urgency === "High" ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`,
                  children: c.urgency
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm line-clamp-1", children: c.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: c.short_description }),
            needed > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 pt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[11px] font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-teal-600", children: [
                  s,
                  " ",
                  collected,
                  " raised"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                  pct,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-muted rounded-full h-1.5 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "bg-primary h-1.5 rounded-full transition-all",
                  style: { width: `${pct}%` }
                }
              ) })
            ] }),
            c.deadline && (() => {
              const daysLeft = Math.ceil(
                (new Date(c.deadline).getTime() - Date.now()) / (1e3 * 60 * 60 * 24)
              );
              if (daysLeft < 0) return null;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `text-xs font-bold px-2 py-1 rounded-lg text-center ${daysLeft <= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`,
                  children: [
                    "⏳",
                    " ",
                    daysLeft === 0 ? "Expires TODAY!" : daysLeft === 1 ? "1 day left!" : `${daysLeft} days left to help!`
                  ]
                }
              );
            })(),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-teal-600 font-medium", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3 w-3" }),
              " Verified"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 text-xs text-muted-foreground pt-1 border-t", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 min-w-0 truncate", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 shrink-0" }),
                " ",
                c.city,
                ", ",
                c.country
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                needed > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-primary", children: [
                  s,
                  " ",
                  needed,
                  " ",
                  cur
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    "aria-label": `Share ${c.title}`,
                    className: "inline-flex h-8 items-center justify-center gap-1 rounded-full border border-primary/20 px-2 text-primary transition-colors hover:bg-primary/10",
                    onClick: async (event) => {
                      event.stopPropagation();
                      const result = await shareCase(c);
                      if (result === "shared") ue.success("Case shared!");
                      else if (result === "copied") ue.success("Case message and link copied!");
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-semibold", children: "Share" })
                    ]
                  }
                )
              ] })
            ] })
          ] })
        },
        c.id
      );
    }) })
  ] }) });
}
export {
  CasesPage as default
};
