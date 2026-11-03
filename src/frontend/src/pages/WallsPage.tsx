// src/frontend/src/pages/WallsPage.tsx
// Premium Redesign: Three community boards with modern UI, matching Givethra theme.

import HeroLeaderboard from "@/components/HeroLeaderboard";
import HeroesWall from "@/components/HeroesWall";
import KindnessWall from "@/components/KindnessWall";
import Layout from "@/components/Layout";
import {
  BadgeCheck,
  Building2,
  Download,
  Heart,
  MailCheck,
  Medal,
  Phone,
  ShieldCheck,
  Trophy,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // or 'motion/react'

type WallTab = "leaderboard" | "kindness" | "heroes";

const TABS: { id: WallTab; label: string; icon: typeof Trophy }[] = [
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "kindness", label: "Kindness", icon: Heart },
  { id: "heroes", label: "Heroes", icon: Medal },
];

const TRUST_BADGES = [
  { icon: MailCheck, label: "Email Verified", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: Phone, label: "Mobile Verified", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: BadgeCheck, label: "Identity Verified", color: "text-violet-600", bg: "bg-violet-50" },
  { icon: Building2, label: "Institution Verified", color: "text-orange-600", bg: "bg-orange-50" },
];

const REQUEST_STEPS = [
  { emoji: "📝", title: "Request Help", desc: "Complete KYC and submit your first case FREE with documents." },
  { emoji: "✅", title: "Get Verified", desc: "Our team reviews documents and approves your case for Heroes." },
  { emoji: "🌟", title: "Receive Direct Support", desc: "Heroes unlock your case and pay institutions directly." },
];

const HELP_STEPS = [
  { emoji: "🦸", title: "Become a Hero", desc: "Choose the Hero role and complete your KYC verification." },
  { emoji: "🔓", title: "Unlock a Verified Case", desc: "Pick a case you want to help. Your first 3 helps are FREE, then 1 credit per help." },
  { emoji: "🤲", title: "Help Directly", desc: "Pay the school, hospital or utility directly and change a life." },
];

function StepsSection({ title, steps }: { title: string; steps: { emoji: string; title: string; desc: string }[] }) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 rounded-3xl border border-slate-200/60 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-5 flex items-center justify-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-center font-display text-lg font-black tracking-tight text-slate-900 dark:text-white">{title}</h2>
        <Sparkles className="h-5 w-5 text-amber-500" />
      </div>
      <ol className="space-y-3">
        {steps.map((step, i) => (
          <li key={step.title} className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-teal-200 hover:bg-teal-50/30 dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-teal-900/50">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-110 dark:bg-slate-800 dark:ring-slate-700">
              {step.emoji}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="flex items-center gap-2 text-[15px] font-bold text-slate-900 dark:text-white">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-br from-teal-500 to-emerald-600 text-[10px] font-black text-white shadow-sm">
                  0{i + 1}
                </span>
                {step.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </motion.section>
  );
}

function DownloadAndTrust() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 space-y-4"
    >
      {/* Premium Android App Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 p-6 text-center text-white shadow-[0_8px_30px_rgba(13,148,136,0.3)]">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        
        <div className="relative flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md">
            📱
          </span>
          <h2 className="mt-3 font-display text-xl font-black tracking-tight">Get the Givethra App</h2>
          <p className="mt-1 max-w-xs text-sm text-teal-100">Verified cases, anytime — right on your phone.</p>
          
          <a
            href="/Givethra.apk"
            download="Givethra.apk"
            className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 text-sm font-black text-amber-950 shadow-[0_4px_14px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95"
          >
            <Download className="h-5 w-5" /> Download App
          </a>
        </div>
        
        <div className="relative mt-5 flex flex-wrap justify-center gap-2 text-[11px] font-semibold text-teal-50">
          {["Verified & Secure", "100% Transparency", "Compassion", "Global Community", "Safe & Private"].map((t) => (
            <span key={t} className="rounded-full border border-teal-400/30 bg-teal-800/40 px-3 py-1 backdrop-blur-sm">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="rounded-3xl border border-slate-200/60 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 flex items-center justify-center gap-2 text-center font-display text-lg font-black tracking-tight text-slate-900 dark:text-white">
          <ShieldCheck className="h-5 w-5 text-teal-600" /> Built on Trust
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {TRUST_BADGES.map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-800">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} dark:bg-opacity-20`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="truncate">{label.split(' ')[0]}</span>
                </p>
                <p className="text-[10px] font-semibold text-slate-500">Verified</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function readInitialTab(): WallTab {
  try {
    const hash = window.location.hash.replace("#", "");
    if (hash === "kindness" || hash === "heroes" || hash === "leaderboard") return hash;
  } catch {}
  return "leaderboard";
}

export default function WallsPage() {
  const [tab, setTab] = useState<WallTab>(readInitialTab);

  function selectTab(next: WallTab) {
    setTab(next);
    try {
      window.history.replaceState(null, "", `#${next}`);
    } catch {}
  }

  return (
    <Layout>
      <main className="mx-auto max-w-5xl px-3 pb-24 pt-4 md:pt-6">
        
        {/* Premium Segmented Tabs */}
        <div role="tablist" aria-label="Walls" className="mx-auto mb-5 flex max-w-md items-center justify-between gap-1 rounded-2xl bg-slate-100/80 p-1.5 shadow-inner backdrop-blur-sm dark:bg-slate-900/80">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(id)}
                className={`relative flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  active 
                    ? "text-white shadow-md" 
                    : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 shadow-[0_4px_12px_rgba(13,148,136,0.3)]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area with Glassmorphism wrapper */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-b from-teal-50/30 to-transparent pointer-events-none dark:from-teal-950/10" />
          <div className="relative">
            {tab === "leaderboard" && <HeroLeaderboard />}
            {tab === "kindness" && <KindnessWall />}
            {tab === "heroes" && <HeroesWall />}
          </div>
        </div>

        {/* Dynamic Bottom Sections */}
        <AnimatePresence mode="wait">
          {tab === "leaderboard" && <DownloadAndTrust key="trust" />}
          {tab === "heroes" && <StepsSection key="req" title="How to Submit a Help Request" steps={REQUEST_STEPS} />}
          {tab === "kindness" && <StepsSection key="help" title="How to Help as a Hero" steps={HELP_STEPS} />}
        </AnimatePresence>

      </main>
    </Layout>
  );
}
