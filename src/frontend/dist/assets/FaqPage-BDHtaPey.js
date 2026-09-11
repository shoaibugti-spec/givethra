import { w as createLucideIcon, l as jsxRuntimeExports, r as reactExports } from "./main-CYM9BeWF.js";
import { L as Layout } from "./Layout-PIwTKxdu.js";
import { C as ChevronDown } from "./chevron-down-DbuGCb17.js";
import "./button-BoXCjEAF.js";
import "./users-DQ_fG41C.js";
import "./x-z1TbCY5C.js";
import "./heart-BeKUzFrD.js";
import "./message-circle-CsflEQIJ.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CircleHelp = createLucideIcon("CircleHelp", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", key: "1u773s" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
]);
const FAQS = [
  {
    category: "Getting Started",
    items: [
      { q: "What is Givethra?", a: "Givethra is a humanitarian platform that connects people who need help (Help Seekers) with people who want to help (Heroes). Every case is verified, and Heroes provide support directly to institutions like schools and hospitals." },
      { q: "How do I create an account?", a: "Click 'Get Started' and sign up using your Google account or email. After signing up, complete your KYC (identity verification) to start using all features." },
      { q: "Is Givethra free to use?", a: "Creating an account is free. Submitting a help request costs 1 credit ($1), and unlocking a case as a Hero costs 1 credits ($2). These small fees help keep the platform secure and verified." }
    ]
  },
  {
    category: "For Help Seekers",
    items: [
      { q: "How do I request help?", a: "First complete your KYC verification. Then go to 'Submit', fill in your case details, upload supporting documents, record a verification selfie and video, and submit. Your case will be reviewed by our team before going live." },
      { q: "What documents do I need?", a: "Depending on your case: medical reports, school fee slips, utility bills, disability certificates, or similar proof. The more genuine documentation you provide, the faster your case gets approved." },
      { q: "How long does verification take?", a: "KYC and case reviews typically take 1-3 business days. You'll be notified once your case is approved or if more information is needed." },
      { q: "What happens after someone helps me?", a: "When a Hero resolves your case, you'll be asked to confirm the resolution. Once confirmed, the case is completed and both parties receive a digital affidavit as proof." }
    ]
  },
  {
    category: "For Heroes",
    items: [
      { q: "How do I help someone?", a: "Browse verified cases, unlock a case for 1 credits to see full details and contact information, then provide support directly (pay the school, hospital, or institution). Upload proof of your support to complete the case." },
      { q: "Why do I pay to unlock a case?", a: "The unlock fee ensures only serious, committed Heroes access sensitive personal documents and contact details. It protects Help Seekers' privacy and keeps the platform secure." },
      { q: "Do I send money through Givethra?", a: "No. Givethra does not handle or transfer donations. Heroes pay institutions directly (school fees, hospital bills, etc.), which ensures full transparency and accountability." },
      { q: "What is a Proud Heart?", a: "When you successfully complete a case, you earn a Proud Heart — a recognition of the real impact you've made in someone's life." }
    ]
  },
  {
    category: "Payments & Credits",
    items: [
      { q: "What are credits?", a: "Credits are used for platform fees. 1 Credit = $1 USD. Submitting a request costs 1 credit; unlocking a case costs 1 credits. Credits cannot be withdrawn or transferred." },
      { q: "How do I add credits?", a: "Go to your Wallet, choose a payment method (NayaPay or Binance USDT), send the payment, and upload your receipt. Once an admin approves it, credits are added to your account." },
      { q: "How long until my credits are added?", a: "After you submit your deposit proof, an admin reviews and approves it — usually within 24 hours." }
    ]
  },
  {
    category: "Trust & Safety",
    items: [
      { q: "How does Givethra verify cases?", a: "We verify identities through KYC (ID documents, selfie, and video), review all submitted documents, and approve cases manually before they go live. This multi-step process builds trust." },
      { q: "Is my personal information safe?", a: "Yes. Your sensitive documents and contact details are locked and only visible to verified Heroes who unlock your specific case. We follow strict privacy practices." },
      { q: "What if someone commits fraud?", a: "Fraud, false information, or identity misrepresentation results in an immediate permanent ban and possible legal action. We take community trust seriously." }
    ]
  }
];
function FaqItem({ q, a }) {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpen(!open), className: "w-full flex items-center justify-between gap-3 py-4 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-foreground", children: q }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}` })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed pb-4", children: a })
  ] });
}
function FaqPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4 py-12 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleHelp, { className: "h-6 w-6 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold text-foreground", children: "Frequently Asked Questions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "Everything you need to know about using Givethra." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: FAQS.map(({ category, items }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-bold text-primary mb-2", children: category }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(FaqItem, { ...item }, item.q)) })
    ] }, category)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-primary/5 border border-primary/20 p-6 text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground", children: "Still have questions?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Reach out to us and we'll be happy to help." })
    ] })
  ] }) });
}
export {
  FaqPage as default
};
