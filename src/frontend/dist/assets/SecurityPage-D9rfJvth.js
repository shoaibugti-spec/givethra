import { w as createLucideIcon, e as useAuth, r as reactExports, D as getKycSubmission, l as jsxRuntimeExports, L as Link } from "./main-EspZtMZv.js";
import { L as Layout } from "./Layout-wYZkEQhc.js";
import { B as Button } from "./button-BrpTixLc.js";
import { S as ShieldCheck } from "./shield-check-CZNKdetk.js";
import { S as Shield } from "./x-Br49mtL5.js";
import { C as Clock } from "./clock-mK-y2hDF.js";
import { L as LogOut } from "./log-out-Dk8IJhut.js";
import { C as CircleX } from "./circle-x-B0-Jayhr.js";
import { C as CircleCheck } from "./circle-check-BPQn3gNr.js";
import "./users-_6SD4cVf.js";
import "./heart-CaEhMUxo.js";
import "./message-circle-CqePZOv0.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Monitor = createLucideIcon("Monitor", [
  ["rect", { width: "20", height: "14", x: "2", y: "3", rx: "2", key: "48i651" }],
  ["line", { x1: "8", x2: "16", y1: "21", y2: "21", key: "1svkeh" }],
  ["line", { x1: "12", x2: "12", y1: "17", y2: "21", key: "vw1qmm" }]
]);
function SecurityPage() {
  const { user, isAuthenticated } = useAuth();
  const [kycData, setKycData] = reactExports.useState(null);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (user) loadKyc();
    else setIsLoading(false);
  }, [user]);
  async function loadKyc() {
    setIsLoading(true);
    try {
      const data = await getKycSubmission(user.id);
      setKycData(data);
    } catch (err) {
      console.error("Failed to load KYC:", err);
      setKycData(null);
    } finally {
      setIsLoading(false);
    }
  }
  function StatusRow({
    label,
    description,
    status,
    action
  }) {
    const config = {
      verified: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4" }), text: "Verified", cls: "text-teal-600" },
      pending: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }), text: "Pending", cls: "text-orange-500" },
      failed: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }), text: "Rejected", cls: "text-red-500" },
      unknown: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }), text: "Not Set", cls: "text-muted-foreground" }
    };
    const c = config[status];
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4 py-3 border-b border-border last:border-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: label }),
        description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: description })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1 text-xs font-semibold ${c.cls}`, children: [
          c.icon,
          " ",
          c.text
        ] }),
        action
      ] })
    ] });
  }
  const kycStatus = (kycData == null ? void 0 : kycData.status) ?? "unknown";
  const kycStatusKind = kycStatus === "approved" ? "verified" : kycStatus === "rejected" ? "failed" : kycData ? "pending" : "unknown";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-xl mx-auto px-4 pt-6 pb-24", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Security Center" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Verification Status" })
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-6 text-muted-foreground text-sm", children: "Loading..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatusRow,
          {
            label: "Email Verification",
            description: (user == null ? void 0 : user.email) ? `Verified: ${user.email}` : "No email linked",
            status: (user == null ? void 0 : user.email) ? "verified" : "unknown"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatusRow,
          {
            label: "Mobile Verification",
            description: "No phone linked",
            status: "unknown"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatusRow,
          {
            label: "Identity Verification",
            description: "Government ID document check",
            status: kycStatusKind
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StatusRow,
          {
            label: "KYC Status",
            description: "Know Your Customer verification",
            status: kycStatusKind,
            action: kycStatus !== "approved" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/kyc", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "text-xs h-7", children: kycStatus === "rejected" ? "Re-submit KYC" : kycData ? "View KYC" : "Complete KYC" }) }) : null
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Session Info" })
      ] }),
      isAuthenticated ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Email: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: user == null ? void 0 : user.email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1", children: [
          "Name: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: user == null ? void 0 : user.fullName })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Sign in to view session info." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Monitor, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Active Sessions" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No active sessions found." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Session Management" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "No active sessions found." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", className: "w-full", disabled: true, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4 mr-2" }),
        "Sign Out All Other Devices"
      ] })
    ] })
  ] }) });
}
export {
  SecurityPage as default
};
