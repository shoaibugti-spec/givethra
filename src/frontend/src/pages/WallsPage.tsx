// src/frontend/src/pages/WallsPage.tsx
// Premium Redesign: Wall of Heroes, Kindness & Leaderboard with 3D effects.

import HeroLeaderboard from "@/components/HeroLeaderboard";
import HeroesWall from "@/components/HeroesWall";
import KindnessWall from "@/components/KindnessWall";
import Layout from "@/components/Layout";
import {
  BadgeCheck, Building2, Download, Heart, MailCheck, Medal, Phone,
  ShieldCheck, Trophy, Sparkles, ChevronRight, Flame, Star, Award,
  TrendingUp, Users, Zap,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type WallTab = "leaderboard" | "kindness" | "heroes";

const TABS: { id: WallTab; label: string; icon: typeof Trophy; gradient: string }[] = [
  { id: "leaderboard", label: "Leaderboard", icon: Trophy, gradient: "from-amber-400 to-orange-500" },
  { id: "kindness", label: "Kindness", icon: Heart, gradient: "from-pink-500 to-rose-500" },
  { id: "heroes", label: "Heroes", icon: Medal, gradient: "from-teal-500 to-emerald-600" },
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

function StepsSection({ title, steps, variant = "teal" }: { title: string; steps: { emoji: string; title: string; desc: string }[]; variant?: "teal" | "rose" }) {
  const gradients = variant === "teal"
    ? { badge: "from-teal-500 to-emerald-600", hover: "hover:border-teal-200 hover:bg-teal-50/30", iconRing: "ring-teal-100" }
    : { badge: "from-pink-500 to-rose-500", hover: "hover:border-pink-200 hover:bg-pink-50/30", iconRing: "ring-pink-100" };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50"
    >
      <div className={`relative bg-gradient-to-r ${variant === "teal" ? "from-teal-600 to-emerald-600" : "from-pink-500 to-rose-500"} px-6 py-5 text-white`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative flex items-center justify-center gap-3">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-center font-display text-lg font-black tracking-tight">{title}</h2>
          <Sparkles className="h-5 w-5" />
        </div>
      </div>
      <ol className="space-y-3 p-5">
        {steps.map((step, i) => (
          <li key={step.title} className={`group flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all ${gradients.hover}`}>
            <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-md ring-2 ${gradients.iconRing} transition-transform group-hover:scale-110`}>
              {step.emoji}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="flex items-center gap-2 text-[15px] font-black text-slate-900">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br ${gradients.badge} text-[10px] font-black text-white shadow-sm`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </motion.section>
  );
}

function DownloadAndTrust() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mt-6 space-y-4">
      
      {/* Premium 3D App Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 p-8 text-center text-white shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-yellow-400/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBoNDBWMEgwem0yMC00MHY0MG0wLTQwaC0yMG0yMCAwaDIwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBmaWxsPSJub25lIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+')] opacity-50" />
        
        <div className="relative flex flex-col items-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500/40 to-emerald-600/40 text-4xl shadow-2xl ring-2 ring-white/20 backdrop-blur-md">
            📱
          </span>
          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-yellow-400/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-yellow-300 mt-3">
            <Zap className="h-3 w-3" /> Fast & Secure
          </div>
          <h2 className="mt-3 font-display text-2xl font-black tracking-tight">Get the Givethra App</h2>
          <p className="mt-1 max-w-xs text-sm font-medium text-teal-200">Verified cases, anytime — right on your phone.</p>

          <a
            href="/Givethra.apk"
            download="Givethra.apk"
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 text-sm font-black text-amber-950 shadow-[0_8px_24px_rgba(251,191,36,0.5)] transition-all hover:scale-105 hover:shadow-[0_12px_32px_rgba(251,191,36,0.7)] active:scale-95"
          >
            <Download className="h-5 w-5" /> Download Now
          </a>
        </div>

        <div className="relative mt-6 flex flex-wrap justify-center gap-2">
          {["Verified & Secure", "100% Transparency", "Global Community", "Safe & Private"].map((t) => (
            <span key={t} className="rounded-full border border-teal-400/30 bg-teal-800/50 px-3 py-1 text-[11px] font-bold text-teal-100 backdrop-blur-sm">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Trust Badges with 3D Cards */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
        <div className="mb-5 flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-600" />
          <h2 className="text-center font-display text-lg font-black tracking-tight text-slate-900">Built on Trust</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {TRUST_BADGES.map(({ icon: Icon, label, color, bg }) => (
            <div key={label} className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-3.5 transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} shadow-inner`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-xs font-black text-slate-900">
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  <span className="truncate">{label}</span>
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Verified</p>
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
    try { window.history.replaceState(null, "", `#${next}`); } catch {}
  }

  return (
    <Layout>
      <main className="mx-auto max-w-5xl px-3 pb-24 pt-5 md:pt-8">
        
        {/* 3D HERO HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 p-6 text-white shadow-2xl md:p-8"
        >
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="relative flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> Community Walls
            </div>
            <h1 className="mt-3 font-display text-3xl font-black tracking-tight md:text-4xl">
              Hall of Kindness & Heroes
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-teal-100 md:text-base">
              Meet the top heroes, celebrate real kindness, and see how the Givethra community changes lives.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                <Trophy className="h-3 w-3 text-amber-400" /> Leaderboard
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                <Heart className="h-3 w-3 text-pink-400" fill="currentColor" /> Kindness Wall
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                <Medal className="h-3 w-3 text-teal-400" /> Heroes Wall
              </span>
            </div>
          </div>
        </motion.div>

        {/* PREMIUM SEGMENTED TABS (3D) */}
        <div role="tablist" aria-label="Walls" className="mx-auto mb-6 flex max-w-lg items-center justify-between gap-1 rounded-2xl bg-slate-200/60 p-1.5 shadow-inner">
          {TABS.map(({ id, label, icon: Icon, gradient }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(id)}
                className={`relative flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-black transition-all duration-300 ${
                  active ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="active-tab-bg"
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}
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

        {/* CONTENT AREA */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {tab === "leaderboard" && <HeroLeaderboard />}
                {tab === "kindness" && <KindnessWall />}
                {tab === "heroes" && <HeroesWall />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* DYNAMIC SECTIONS BELOW */}
        <AnimatePresence mode="wait">
          {tab === "leaderboard" && <DownloadAndTrust key="trust" />}
          {tab === "heroes" && <StepsSection key="req" title="How to Submit a Help Request" steps={REQUEST_STEPS} variant="teal" />}
          {tab === "kindness" && <StepsSection key="help" title="How to Help as a Hero" steps={HELP_STEPS} variant="rose" />}
        </AnimatePresence>

      </main>
    </Layout>
  );
}
