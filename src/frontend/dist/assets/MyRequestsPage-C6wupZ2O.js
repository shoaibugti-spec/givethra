import { a as useAuth, u as useNavigate, r as reactExports, j as jsxRuntimeExports, b as LoadingSpinner, L as Link } from "./index-C7ZxjHlS.js";
import { a as CategoryPill } from "./CategoryPill-BgiFthIF.js";
import { L as Layout } from "./Layout-BMq74Uxj.js";
import { V as VerificationBadge } from "./VerificationBadge-BGsyXgDM.js";
import { B as Button } from "./button-QIYvq4xc.js";
import { u as useBackendActor } from "./useBackend-Dxqmakwa.js";
import { P as Plus } from "./plus-BbxoQMo4.js";
import "./input-EIAk_KSS.js";
import "./heart-VGojEH0R.js";
import "./bell-BDI-oIDm.js";
import "./x-BZLxzlHw.js";
import "./shield-BEOLXRSd.js";
import "./shield-check--kD3Q-5L.js";
import "./useQuery-Cb3pY6Kz.js";
function toVerifLevel(v) {
  if (v === "InstitutionVerified") return "institution_verified";
  if (v === "DocumentsSubmitted") return "documents_submitted";
  return "unverified";
}
function MyRequestsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [cases, setCases] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    actor.listCases(null, { offset: BigInt(0), limit: BigInt(50) }).then(setCases).catch(() => setCases([])).finally(() => setLoading(false));
  }, [actor, isFetching]);
  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-10 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold text-foreground", children: "My Requests" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-1", children: "Track the status of your submitted help requests." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          "data-ocid": "my_requests.submit_button",
          onClick: () => navigate({ to: "/submit-request" }),
          className: "gap-2 shrink-0",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
            "New Request"
          ]
        }
      )
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex justify-center py-20",
        "data-ocid": "my_requests.loading_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, { label: "Loading requests..." })
      }
    ) : cases.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": "my_requests.empty_state",
        className: "rounded-2xl border-2 border-dashed border-border bg-muted/20 py-20 text-center space-y-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "You haven't submitted any requests yet." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              onClick: () => navigate({ to: "/submit-request" }),
              "data-ocid": "my_requests.empty_submit_button",
              children: "Submit your first request"
            }
          )
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: cases.map((req, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        "data-ocid": `my_requests.item.${i + 1}`,
        className: "rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                VerificationBadge,
                {
                  level: toVerifLevel(req.verificationStatus)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryPill, { category: req.category })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-foreground truncate", children: req.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              req.city,
              ", ",
              req.country,
              " · $",
              (Number(req.amountNeeded) / 100).toLocaleString(),
              " needed"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/cases/$id", params: { id: String(req.id) }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              "data-ocid": `my_requests.view_button.${i + 1}`,
              children: "View"
            }
          ) })
        ]
      },
      String(req.id)
    )) })
  ] }) });
}
export {
  MyRequestsPage as default
};
