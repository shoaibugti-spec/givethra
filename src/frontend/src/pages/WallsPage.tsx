// src/frontend/src/pages/WallsPage.tsx
// Three community boards, each with its own helper section underneath:
//   Leaderboard  -> Get the Android App + Built on Trust & Verification
//   Heroes Wall  -> How to submit a help request
//   Kindness     -> How to help as a Hero

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
} from "lucide-react";
import { useState } from "react";

type WallTab = "leaderboard" | "kindness" | "heroes";

const TABS: { id: WallTab; label: string; icon: typeof Trophy }[] = [
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "kindness", label: "Kindness", icon: Heart },
  { id: "heroes", label: "Heroes", icon: Medal },
];

const TRUST_BADGES = [
  { icon: MailCheck, label: "Email Verified", color: "text-emerald-600" },
  { icon: Phone, label: "Mobile Verified", color: "text-blue-600" },
  { icon: BadgeCheck, label: "Identity Verified", color: "text-violet-600" },
  { icon: Building2, label: "Institution Verified", color: "text-orange-600" },
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
    <section className="mt-3 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-3 text-center font-display text-base font-bold">{title}</h2>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3 rounded-xl bg-muted/40 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg">{step.emoji}</span>
            <div className="min-w-0">
              <p className="text-sm font-bold">
                <span className="mr-1.5 text-xs font-black text-primary/50">0{i + 1}</span>
                {step.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DownloadAndTrust() {
  return (
    <>
      <section className="mt-3 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-teal-50 p-4 text-center shadow-sm dark:to-card">
        <p className="text-2xl">📱</p>
        <h2 className="mt-1 font-display text-base font-bold">Get the Givethra Android App</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Verified cases, anytime — right on your phone.</p>
        <a
          href="/Givethra.apk"
          download="Givethra.apk"
          className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow transition hover:bg-primary/90 active:scale-95"
        >
          <Download className="h-4 w-4" /> Download App
        </a>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-[11px] text-muted-foreground">
          {["Verified & Secure", "100% Transparency", "Compassion", "Global Community", "Safe & Private", "Your Data is Protected"].map((t) => (
            <span key={t} className="rounded-full border border-border bg-card px-2.5 py-1">{t}</span>
          ))}
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center justify-center gap-1.5 text-center font-display text-base font-bold">
          <ShieldCheck className="h-4 w-4 text-primary" /> Built on Trust &amp; Verification
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {TRUST_BADGES.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 p-2.5">
              <Icon className={`h-5 w-5 shrink-0 ${color}`} />
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-xs font-semibold">
                  <BadgeCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                  <span className="truncate">{label}</span>
                </p>
                <p className="text-[10px] text-muted-foreground">Verified</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
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
      <main className="mx-auto max-w-5xl px-3 pb-24 pt-3">
        <div role="tablist" aria-label="Walls" className="grid grid-cols-3 gap-1.5 rounded-2xl border border-border bg-card p-1.5 shadow-sm">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(id)}
                className={`flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-bold transition ${
                  active ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
          {tab === "leaderboard" && <HeroLeaderboard />}
          {tab === "kindness" && <KindnessWall />}
          {tab === "heroes" && <HeroesWall />}
        </div>

        {tab === "leaderboard" && <DownloadAndTrust />}
        {tab === "heroes" && <StepsSection title="How to Submit a Help Request" steps={REQUEST_STEPS} />}
        {tab === "kindness" && <StepsSection title="How to Help as a Hero" steps={HELP_STEPS} />}
      </main>
    </Layout>
  );
}
