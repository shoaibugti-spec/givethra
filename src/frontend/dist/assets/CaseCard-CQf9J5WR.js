import { j as jsxRuntimeExports, U as User, d as cn } from "./index-BoYH-a4m.js";
import { B as Button } from "./button-DXj5HeE2.js";
import { C as Card, a as CardContent } from "./card-BFaW8de3.js";
import { P as Progress } from "./progress-CORsrKER.js";
import { a as CategoryPill } from "./CategoryPill-DsTfuf3g.js";
import { V as VerificationBadge } from "./VerificationBadge-BSpB1IIY.js";
import { M as MapPin } from "./map-pin-BChSBW_d.js";
function CaseCard({
  data,
  onClick,
  className,
  showViewDetails = true
}) {
  const progress = data.amountNeeded > 0 ? Math.min(Math.round(data.amountRaised / data.amountNeeded * 100), 100) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Card,
    {
      "data-ocid": "case.card",
      className: cn(
        "overflow-hidden border border-border transition-smooth cursor-pointer group hover:shadow-lg hover:-translate-y-0.5 flex flex-col",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[16/9] overflow-hidden bg-muted", children: [
          data.imageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: data.imageUrl,
              alt: data.title,
              className: "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-8 w-8 text-primary/60" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 left-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VerificationBadge, { level: data.verificationLevel, size: "sm" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CategoryPill, { category: data.category, size: "xs" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 space-y-3 flex-1 flex flex-col", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-1.5", children: [
            data.applicantName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-medium", children: data.applicantName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-foreground leading-snug line-clamp-2 text-sm", children: data.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate min-w-0", children: [
              data.city,
              ", ",
              data.country
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount needed" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-foreground text-sm", children: [
                "$",
                data.amountNeeded.toLocaleString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: progress, className: "h-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                progress,
                "% raised"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "$",
                data.amountRaised.toLocaleString(),
                " raised"
              ] })
            ] })
          ] }),
          showViewDetails && /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              className: "w-full mt-1 h-8 text-xs font-semibold",
              onClick,
              "data-ocid": "case.view_details_button",
              children: "View Details"
            }
          )
        ] })
      ]
    }
  );
}
export {
  CaseCard as C
};
