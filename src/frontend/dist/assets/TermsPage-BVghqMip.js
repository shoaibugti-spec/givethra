import { j as jsxRuntimeExports } from "./index-C7ZxjHlS.js";
import { L as Layout } from "./Layout-BMq74Uxj.js";
import "./button-QIYvq4xc.js";
import "./input-EIAk_KSS.js";
import "./useBackend-Dxqmakwa.js";
import "./useQuery-Cb3pY6Kz.js";
import "./heart-VGojEH0R.js";
import "./bell-BDI-oIDm.js";
import "./x-BZLxzlHw.js";
import "./shield-BEOLXRSd.js";
const sections = [
  {
    title: "Acceptance of Terms",
    content: "By using Givethra, you agree to these Terms of Service. If you do not agree, please do not use the platform. We may update these terms at any time; continued use constitutes acceptance."
  },
  {
    title: "User Eligibility",
    content: "You must be at least 18 years old to create an account. By registering, you confirm that all information you provide is accurate and truthful."
  },
  {
    title: "Help Seekers",
    content: "Help Seekers must submit truthful, verifiable requests. Submitting false information, duplicate requests, or fraudulent documents will result in immediate suspension and possible legal action."
  },
  {
    title: "Heroes",
    content: "Heroes use Givethra to discover and support verified cases. Heroes pay directly to institutions and upload proof of support. Givethra does not handle or transfer donations."
  },
  {
    title: "Platform Fees",
    content: "A listing fee of $1 USD is required to submit a help request. A $2 USD unlock fee grants permanent access to case documents and contact details for that case."
  },
  {
    title: "No Guarantees",
    content: "Givethra verifies cases to the best of its ability but cannot guarantee outcomes. Heroes support at their own discretion. Givethra is not responsible for the actions of users."
  },
  {
    title: "Prohibited Conduct",
    content: "Users may not submit false information, harass others, attempt to circumvent fees, resell access to case documents, or use the platform for any illegal purpose."
  },
  {
    title: "Termination",
    content: "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraud, or harm the community."
  }
];
function TermsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-16 space-y-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-bold text-foreground", children: "Terms & Conditions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Last updated: June 2026" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground leading-relaxed text-sm", children: "Please read these terms carefully before using Givethra." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-8", children: sections.map(({ title, content }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-semibold text-foreground", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground leading-relaxed text-sm", children: content })
    ] }, title)) })
  ] }) });
}
export {
  TermsPage as default
};
