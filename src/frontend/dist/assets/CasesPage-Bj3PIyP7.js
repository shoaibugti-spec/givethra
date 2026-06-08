import { u as useNavigate, r as reactExports, j as jsxRuntimeExports, b as LoadingSpinner } from "./index-C7ZxjHlS.js";
import { C as CaseCard } from "./CaseCard-Ed09vH_V.js";
import { L as Layout, S as Search } from "./Layout-BMq74Uxj.js";
import { I as Input } from "./input-EIAk_KSS.js";
import { u as useBackendActor } from "./useBackend-Dxqmakwa.js";
import "./button-QIYvq4xc.js";
import "./card-BjpepsnO.js";
import "./progress-CVL8r6ux.js";
import "./index--e3bBEMH.js";
import "./index-CgtCr000.js";
import "./CategoryPill-BgiFthIF.js";
import "./VerificationBadge-BGsyXgDM.js";
import "./shield-check--kD3Q-5L.js";
import "./map-pin-CXGl91yn.js";
import "./heart-VGojEH0R.js";
import "./bell-BDI-oIDm.js";
import "./x-BZLxzlHw.js";
import "./shield-BEOLXRSd.js";
import "./useQuery-Cb3pY6Kz.js";
const CATEGORIES = [
  "All",
  "Education",
  "Medical",
  "Food",
  "Housing",
  "Disability Support",
  "Orphans",
  "Widows",
  "Emergency Cases",
  "Other Needs"
];
const VERIF_OPTIONS = [
  "All",
  "Unverified",
  "DocumentsSubmitted",
  "InstitutionVerified"
];
function toCardData(c) {
  const vMap = {
    DocumentsSubmitted: "documents_submitted",
    InstitutionVerified: "institution_verified",
    Unverified: "unverified"
  };
  return {
    id: String(c.id),
    title: c.title,
    category: c.category,
    country: c.country,
    city: c.city,
    amountNeeded: Number(c.amountNeeded) / 100,
    amountRaised: 0,
    verificationLevel: vMap[c.verificationStatus] ?? "unverified",
    description: ""
  };
}
function CasesPage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [cases, setCases] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [search, setSearch] = reactExports.useState("");
  const [activeCategory, setActiveCategory] = reactExports.useState("All");
  const [activeVerif, setActiveVerif] = reactExports.useState("All");
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    actor.listCases(null, { offset: BigInt(0), limit: BigInt(50) }).then(setCases).finally(() => setLoading(false));
  }, [actor, isFetching]);
  const filtered = cases.filter((c) => {
    const matchCat = activeCategory === "All" || c.category === activeCategory;
    const matchVerif = activeVerif === "All" || c.verificationStatus === activeVerif;
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.country.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchVerif && matchSearch;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold text-foreground", children: "Verified Cases" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Browse real people who need your support. Unlock a case to see full details and pay directly." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          "data-ocid": "cases.search_input",
          placeholder: "Search by title, country, city...",
          className: "pl-9",
          value: search,
          onChange: (e) => setSearch(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "cases.category_filter", className: "flex flex-wrap gap-2", children: CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "data-ocid": `cases.filter.${cat.toLowerCase().replace(/ /g, "_")}_tab`,
        onClick: () => setActiveCategory(cat),
        className: `px-3 py-1 rounded-full text-sm font-medium border transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`,
        children: cat
      },
      cat
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": "cases.verif_filter", className: "flex flex-wrap gap-2", children: VERIF_OPTIONS.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        "data-ocid": `cases.verif.${v.toLowerCase()}_tab`,
        onClick: () => setActiveVerif(v),
        className: `px-3 py-1 rounded-full text-sm font-medium border transition-colors ${activeVerif === v ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"}`,
        children: v === "All" ? "All Status" : v === "DocumentsSubmitted" ? "Docs Submitted" : v === "InstitutionVerified" ? "Verified" : v
      },
      v
    )) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex justify-center py-20",
        "data-ocid": "cases.loading_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { label: "Loading cases..." })
      }
    ) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        "data-ocid": "cases.empty_state",
        className: "text-center py-20 space-y-3",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "No cases found. Try a different search or filter." })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "data-ocid": `cases.item.${i + 1}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      CaseCard,
      {
        data: toCardData(c),
        onClick: () => navigate({ to: "/cases/$id", params: { id: String(c.id) } })
      }
    ) }, String(c.id))) })
  ] }) });
}
export {
  CasesPage as default
};
