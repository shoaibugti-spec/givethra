import { r as reactExports, j as jsxRuntimeExports, d as cn } from "./index-BoYH-a4m.js";
import { C as CircleAlert } from "./circle-alert-CarhqOsL.js";
import { X } from "./x-Yn9x35TY.js";
function ErrorBanner({ message, dismissible = true, className }) {
  const [dismissed, setDismissed] = reactExports.useState(false);
  if (dismissed) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "data-ocid": "error_state",
      role: "alert",
      className: cn(
        "flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
        "dark:border-red-800 dark:bg-red-950 dark:text-red-300",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: message }),
        dismissible && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setDismissed(true),
            "aria-label": "Dismiss error",
            className: "shrink-0 rounded transition-colors hover:text-red-900 dark:hover:text-red-100",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
          }
        )
      ]
    }
  );
}
export {
  ErrorBanner as E
};
