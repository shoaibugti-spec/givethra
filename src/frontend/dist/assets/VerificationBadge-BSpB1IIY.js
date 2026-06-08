import { c as createLucideIcon, j as jsxRuntimeExports, d as cn } from "./index-BoYH-a4m.js";
import { S as ShieldCheck } from "./shield-check-CV1UwXCf.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "m9 15 2 2 4-4", key: "1grp1n" }]
];
const FileCheck = createLucideIcon("file-check", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
      key: "oel41y"
    }
  ],
  ["path", { d: "M12 8v4", key: "1got3b" }],
  ["path", { d: "M12 16h.01", key: "1drbdi" }]
];
const ShieldAlert = createLucideIcon("shield-alert", __iconNode);
const config = {
  institution_verified: {
    label: "Verified",
    icon: ShieldCheck,
    className: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950 dark:border-emerald-800"
  },
  documents_submitted: {
    label: "Docs Submitted",
    icon: FileCheck,
    className: "text-primary bg-primary/10 border-primary/20"
  },
  pending: {
    label: "Pending",
    icon: ShieldAlert,
    className: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950 dark:border-amber-800"
  },
  unverified: {
    label: "Unverified",
    icon: ShieldAlert,
    className: "text-muted-foreground bg-muted border-border"
  }
};
function VerificationBadge({ level, size = "sm", className }) {
  const { label, icon: Icon, className: colorClass } = config[level];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        colorClass,
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: size === "sm" ? "h-3 w-3" : "h-4 w-4" }),
        label
      ]
    }
  );
}
export {
  VerificationBadge as V
};
