import { j as jsxRuntimeExports } from "./index-BoYH-a4m.js";
import { L as Layout } from "./Layout-DyTGbA2S.js";
import { S as Shield } from "./shield-BJahHKMQ.js";
import { H as Heart } from "./heart-qvi-jSMZ.js";
import { G as Globe } from "./globe-DDM3hcyG.js";
import { L as Lock } from "./lock-Ckm8ZJJy.js";
import "./button-DXj5HeE2.js";
import "./input-BGHi7jlu.js";
import "./useBackend-FSH8Ysa0.js";
import "./backend-B2Q1poOu.js";
import "./bell-DSWTbU_S.js";
import "./x-Yn9x35TY.js";
const values = [
  {
    icon: Shield,
    title: "Verified Impact",
    description: "Every case on Givethra is reviewed and verified. We cross-check documents, identities, and institutions to ensure your support reaches the right person."
  },
  {
    icon: Heart,
    title: "Direct Support",
    description: "Heroes pay institutions directly — school fees, hospital bills, utility providers. No middlemen, no donation pools. Pure, transparent impact."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Givethra connects people across borders. A Hero in Canada can support a student in Kenya. Verified, safe, and accountable."
  },
  {
    icon: Lock,
    title: "Privacy First",
    description: "Sensitive documents and personal details are locked behind a verified unlock system. Only committed Heroes who pay the unlock fee gain access."
  }
];
function AboutPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-20 px-4 text-center bg-card border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl md:text-5xl font-bold text-foreground", children: "About Givethra" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-muted-foreground leading-relaxed", children: "Givethra is a global trust-based humanitarian platform that connects people who need help with people who want to help — through verified cases, direct support, and real accountability." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 px-4 bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground mb-6", children: "Our Mission" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground leading-relaxed mb-4", children: "The world has no shortage of generosity. What it lacks is trust. Millions of people want to help, but fear fraud, misuse, or uncertainty about where their support goes." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground leading-relaxed", children: "Givethra was built to solve that. We verify every case. We protect sensitive information. We enable Heroes to pay directly to schools, hospitals, and utility providers — so every act of support has a paper trail and a real outcome." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 px-4 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-foreground mb-10 text-center", children: "What We Stand For" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 gap-6", children: values.map(({ icon: Icon, title, description }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "rounded-2xl border border-border bg-card p-6 space-y-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-primary" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display font-semibold text-foreground", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: description })
          ]
        },
        title
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 px-4 bg-primary/5 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto text-center space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground", children: "Our Trust Statement" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground leading-relaxed italic", children: "“Givethra is built to create trust and transparency in helping others. Every effort is made to verify cases and ensure that support reaches the right people. Users are encouraged to support with confidence and good intention.”" })
    ] }) })
  ] }) });
}
export {
  AboutPage as default
};
