import { w as createLucideIcon, e as useAuth, u as useNavigate, l as jsxRuntimeExports } from "./main-XWGl9bfu.js";
import { L as Layout } from "./Layout-B37pWsjx.js";
import { B as Button } from "./button-QyTBuXi2.js";
import { S as Sparkles } from "./sparkles-CNoFYFLd.js";
import { H as Heart } from "./heart-Br4iiKEI.js";
import { C as Coins } from "./coins-CgGCp_1p.js";
import { L as LockOpen } from "./lock-open-HHrBfw_u.js";
import { B as Building2 } from "./building-2-CJrWxuqE.js";
import { S as Shield } from "./x-DZawEjNS.js";
import { U as Users } from "./users-DwDKFISD.js";
import { b as Lock } from "./message-circle-Cc089LoD.js";
import { F as FileText } from "./file-text-CqH166dC.js";
import { C as CircleCheck } from "./circle-check-VtAwHJjH.js";
import { H as HandCoins } from "./hand-coins-CqUacO8y.js";
import { A as Award } from "./award-DlMWpXj4.js";
import { G as Globe } from "./globe-C1ALVPjQ.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const UserCheck = createLucideIcon("UserCheck", [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["polyline", { points: "16 11 18 13 22 9", key: "1pwet4" }]
]);
const PACKS = [
  { credits: 1, price: 1, name: "Starter Hero", desc: "Best for first-time Heroes." },
  { credits: 5, price: 5, name: "Helping Hand", desc: "Help multiple families." },
  { credits: 10, price: 10, name: "Community Hero", desc: "Support more verified cases.", popular: true },
  { credits: 25, price: 25, name: "Hope Builder", desc: "Ideal for regular Heroes." },
  { credits: 50, price: 50, name: "Guardian Hero", desc: "Create greater humanitarian impact." },
  { credits: 100, price: 100, name: "Global Hero", desc: "For organizations and generous supporters." }
];
function BecomeHeroPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  function chooseCredits(credits) {
    try {
      sessionStorage.setItem("givethra_selected_credits", String(credits));
    } catch {
    }
    if (isAuthenticated) navigate({ to: "/wallet" });
    else navigate({ to: "/sign-up" });
  }
  function goSignIn() {
    if (isAuthenticated) navigate({ to: "/cases" });
    else navigate({ to: "/sign-in" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Layout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-gradient-to-b from-primary/5 to-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 py-16 text-center space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
        " Become a Hero"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl md:text-5xl font-bold text-foreground leading-tight", children: [
        "Help Real People.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Protect Their Dignity." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "Change Lives."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground max-w-2xl mx-auto text-lg", children: "Every verified case on Givethra represents a real person facing a genuine hardship. To protect their dignity and privacy, sensitive information is only available to verified Heroes. Become a Hero today and make a real impact." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "lg", className: "h-12 px-8 text-base font-semibold rounded-2xl", onClick: goSignIn, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 mr-2" }),
          " Become a Hero"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", variant: "outline", className: "h-12 px-8 text-base rounded-2xl", onClick: () => navigate({ to: "/cases" }), children: "Browse Verified Cases" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-teal-50 dark:bg-teal-950/20 border-2 border-teal-400 p-4 text-sm text-teal-700 dark:text-teal-300 text-center max-w-xl mx-auto font-medium", children: [
        "🎉 Your first ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3 helps are FREE" }),
        "! After that, 1 credit per help."
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-5xl mx-auto px-4 py-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-10", children: "How It Works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
        { n: "1", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-6 w-6" }), t: "Create Hero Account", d: "Sign in securely with Google and complete your profile." },
        { n: "2", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-6 w-6" }), t: "Choose Hero Credits", d: "Deposit securely. Credits let you unlock verified cases (1 credit = 1 case)." },
        { n: "3", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "h-6 w-6" }), t: "Unlock Verified Cases", d: "Access private documents, bills, verification video and payment reference." },
        { n: "4", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-6 w-6" }), t: "Help Directly", d: "Pay the school, hospital or utility company directly — or contribute with others." }
      ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 shadow-sm space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center", children: c.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl font-bold text-primary/20", children: c.n })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-foreground", children: c.t }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: c.d })
      ] }, c.n)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 py-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-2", children: "Choose Your Hero Credits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-muted-foreground mb-2", children: "One Credit unlocks one verified case. 1 Credit = $1." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-300 p-3 text-sm text-teal-700 dark:text-teal-300 text-center max-w-2xl mx-auto mb-6", children: [
        "💚 Remember: Your first ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "3 unlocks are FREE" }),
        " — you don't need credits for them!"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: PACKS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative rounded-2xl border bg-card p-6 shadow-sm space-y-3 ${p.popular ? "border-primary border-2" : ""}`, children: [
        p.popular && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full", children: "Most Popular" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg text-foreground", children: p.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-3xl font-bold text-primary", children: [
            "$",
            p.price
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-muted-foreground pb-1", children: [
            p.credits,
            " Credit",
            p.credits > 1 ? "s" : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Unlock ",
          p.credits,
          " Case",
          p.credits > 1 ? "s" : "",
          ". ",
          p.desc
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full rounded-xl", variant: p.popular ? "default" : "outline", onClick: () => chooseCredits(p.credits), children: [
          "Choose ",
          p.name.split(" ")[0]
        ] })
      ] }, p.credits)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground mt-6", children: "After choosing, you'll go to your secure Wallet to deposit. Credits are added after quick verification, then you can unlock cases immediately." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-5xl mx-auto px-4 py-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-10", children: "Why do verified cases require Hero Credits?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: [
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5" }), t: "Protect beneficiary privacy", d: "Bills, documents and videos are personal. Only serious Heroes see them." },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-5 w-5" }), t: "Prevent fake viewers", d: "A small fee stops curious visitors from exposing someone's hardship." },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-5 w-5" }), t: "Reduce fraud", d: "Verified Heroes and verified cases keep both sides safe." },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }), t: "Support verification costs", d: "Every case is checked: documents, 1Bill references, calls to institutes." },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5" }), t: "Keep the platform sustainable", d: "Credits keep Givethra running — ad-free and dignified." },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }), t: "Your donation stays full", d: "Hero Credits are not donations. Your payment goes directly to the verified institution." }
      ].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 shadow-sm space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center", children: c.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground text-sm", children: c.t }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: c.d })
      ] }, c.t)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-8", children: "What You'll See After Unlocking" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border bg-card p-6 shadow-sm grid sm:grid-cols-2 gap-3", children: [
        "Original verified documents",
        "Original bills / fee challans",
        "Givethra verification report",
        "Beneficiary's video statement",
        "Institution / company information",
        "1Bill consumer & reference numbers",
        "Payment instructions",
        "Progress & help history"
      ].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-primary shrink-0" }),
        " ",
        item
      ] }, item)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-5xl mx-auto px-4 py-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold text-center mb-10", children: "Two Ways To Help" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-primary/20 bg-card p-6 shadow-sm space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-xl bg-primary text-white flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: "Option 1 — Direct Help" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Pay the school, hospital, utility company or landlord directly using the verified reference (1Bill consumer number, fee challan). Upload your payment receipt, the beneficiary confirms, and the case closes with your named affidavit." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-primary/20 bg-card p-6 shadow-sm space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-xl bg-primary text-white flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: "Option 2 — Community Contribution" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Can't pay the full amount? Contribute any amount — Rs 500, Rs 1000, or more. When the fundraising target is reached, Givethra pays the institution directly and closes the case." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 py-14 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl md:text-3xl font-bold mb-8", children: "Your Hero Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-4", children: [
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-6 w-6" }), t: "Verified Hero Badge" },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-6 w-6" }), t: "People Helped" },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-6 w-6" }), t: "Cases Completed" },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-6 w-6" }), t: "Amount Contributed" },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-6 w-6" }), t: "Countries Reached" },
        { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-6 w-6" }), t: "Signed Affidavits" }
      ].map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card p-5 shadow-sm flex flex-col items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center", children: b.icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: b.t })
      ] }, b.t)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "max-w-4xl mx-auto px-4 py-14", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-primary text-white p-8 text-center space-y-4 shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-14 w-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-7 w-7" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold", children: "Our Privacy Promise" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-white/85 max-w-xl mx-auto text-sm leading-relaxed", children: "Every beneficiary deserves dignity. Public visitors only see a limited case preview — story, category, city and amount. Private documents, videos and payment information are only available to verified Heroes after unlocking a case." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-4xl mx-auto px-4 pb-16 text-center space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold", children: "Become Someone's Hero Today" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: "One small act of kindness can completely change someone's life." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", className: "h-12 px-8 text-base font-semibold rounded-2xl", onClick: goSignIn, children: isAuthenticated ? "Browse Verified Cases" : "Continue to Sign In" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "lg", variant: "outline", className: "h-12 px-8 text-base rounded-2xl", onClick: () => navigate({ to: "/cases" }), children: "Browse Verified Cases" })
      ] })
    ] })
  ] });
}
export {
  BecomeHeroPage as default
};
