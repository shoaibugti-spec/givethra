import { j as jsxRuntimeExports, d as cn } from "./index-C7ZxjHlS.js";
const categoryColors = {
  Education: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  Medical: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
  Food: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  Housing: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  Utilities: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
  Employment: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  Emergency: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  "Emergency Cases": "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  Orphans: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800",
  Widows: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800",
  Disability: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
  "Disability Support": "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800",
  "Other Needs": "bg-muted text-muted-foreground border-border"
};
const CATEGORY_EMOJI = {
  Education: "🎓",
  Medical: "🏥",
  Food: "🍲",
  Utilities: "⚡",
  Housing: "🏠",
  Employment: "💼",
  Disability: "♿",
  "Disability Support": "♿",
  Orphans: "👶",
  Widows: "❤️",
  Emergency: "🚨",
  "Emergency Cases": "🚨",
  "Other Needs": "✨",
  Other: "✨"
};
function CategoryPill({
  category,
  size = "xs",
  className,
  showEmoji = false
}) {
  const colorClass = categoryColors[category] ?? "bg-muted text-muted-foreground border-border";
  const emoji = CATEGORY_EMOJI[category];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: cn(
        "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap",
        size === "xs" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        colorClass,
        className
      ),
      children: [
        showEmoji && emoji && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: emoji }),
        category
      ]
    }
  );
}
export {
  CATEGORY_EMOJI as C,
  CategoryPill as a
};
