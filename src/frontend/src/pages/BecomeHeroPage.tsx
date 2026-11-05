// src/pages/BecomeHeroPage.tsx
// Premium BecomeHeroPage — matches HomePage theme (Teal/Emerald + Yellow + Glass).

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import {
  Shield, Lock, Heart, CheckCircle2, FileText, Video, Building2,
  HandCoins, Users, Award, Globe, Sparkles, UserCheck, Coins, Unlock,
  Zap, Star, TrendingUp, ChevronRight, Flame, Gift,
} from "lucide-react";
import { motion } from "framer-motion";

const PACKS = [
  { credits: 1, price: 1, name: "Starter Hero", desc: "Best for first-time Heroes." },
  { credits: 5, price: 5, name: "Helping Hand", desc: "Help multiple families." },
  { credits: 10, price: 10, name: "Community Hero", desc: "Support more verified cases.", popular: true },
  { credits: 25, price: 25, name: "Hope Builder", desc: "Ideal for regular Heroes." },
  { credits: 50, price: 50, name: "Guardian Hero", desc: "Create greater humanitarian impact." },
  { credits: 100, price: 100, name: "Global Hero", desc: "For organizations and generous supporters." },
];

export default function BecomeHeroPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function chooseCredits(credits: number) {
    try { sessionStorage.setItem("givethra_selected_credits", String(credits)); } catch {}
    if (isAuthenticated) navigate({ to: "/wallet" });
    else navigate({ to: "/sign-up" });
  }

  function goSignIn() {
    if (isAuthenticated) navigate({ to: "/cases" });
    else navigate({ to: "/sign-in" });
  }

  return (
    <Layout>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-900 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center md:py-24">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-lg">
            <Sparkles className="h-4 w-4" /> Become a Hero
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-6 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
            Help Real People.<br />
            <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">Protect Their Dignity.</span><br />
            Change Lives.
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-teal-100 md:text-lg">
            Every verified case on Givethra represents a real person facing a genuine hardship.
            To protect their dignity and privacy, sensitive information is only available to verified Heroes.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={goSignIn}
              className="h-14 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 text-base font-black text-amber-950 shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <Heart className="mr-2 h-5 w-5" fill="currentColor" /> Become a Hero
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: "/cases" })}
              className="h-14 rounded-2xl border-white/30 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              Browse Verified Cases
            </Button>
          </motion.div>

          {/* Free Help Banner */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-yellow-300/40 bg-yellow-400/15 px-4 py-3 text-sm font-semibold text-yellow-100 backdrop-blur-md">
            <Gift className="h-5 w-5 shrink-0 text-yellow-300" />
            <span>🎉 Your first <strong className="text-yellow-200">3 helps are FREE</strong>! After that, 1 credit per help.</span>
          </motion.div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative overflow-hidden bg-slate-50 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
              <Sparkles className="h-3 w-3" /> Simple Steps
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">How It Works</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "1", icon: UserCheck, t: "Create Hero Account", d: "Sign in securely with Google and complete your profile.", color: "from-blue-500 to-sky-500" },
              { n: "2", icon: Coins, t: "Choose Hero Credits", d: "Deposit securely. Credits let you unlock verified cases (1 credit = 1 case).", color: "from-yellow-400 to-amber-500" },
              { n: "3", icon: Unlock, t: "Unlock Verified Cases", d: "Access private documents, bills, verification video and payment reference.", color: "from-teal-500 to-emerald-500" },
              { n: "4", icon: Building2, t: "Help Directly", d: "Pay the school, hospital or utility company directly — or contribute with others.", color: "from-pink-500 to-rose-500" },
            ].map((c, i) => (
              <motion.div
                key={c.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${c.color} text-white shadow-md transition-transform group-hover:scale-110`}>
                    <c.icon className="h-6 w-6" />
                  </div>
                  <span className="text-4xl font-black text-slate-200">{c.n}</span>
                </div>
                <h3 className="mt-4 font-display text-base font-black text-slate-900">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CREDIT PACKAGES ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-16">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-teal-100/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
              <Coins className="h-3 w-3" /> Hero Credits
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Choose Your Hero Credits</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">One Credit unlocks one verified case. 1 Credit = $1.</p>
          </div>

          <div className="mx-auto mb-8 flex max-w-2xl items-center gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
            <Gift className="h-5 w-5 shrink-0" />
            <span>💚 Your first <strong>3 unlocks are FREE</strong> — no credits needed!</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PACKS.map((p, i) => (
              <motion.div
                key={p.credits}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className={`relative overflow-hidden rounded-3xl border bg-white p-6 transition-all hover:-translate-y-1 ${
                  p.popular
                    ? "border-teal-400 shadow-2xl shadow-teal-500/20 ring-2 ring-teal-400/50"
                    : "border-slate-200 shadow-sm hover:shadow-xl"
                }`}
              >
                {p.popular && (
                  <>
                    <div className="absolute -right-12 top-4 rotate-45 bg-gradient-to-r from-teal-500 to-emerald-600 px-12 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                      Popular
                    </div>
                    <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-teal-200/40 blur-3xl" />
                  </>
                )}
                <div className="relative">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                    p.popular
                      ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg"
                      : "bg-teal-50 text-teal-600"
                  }`}>
                    <Coins className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-black text-slate-900">{p.name}</h3>
                  <div className="mt-2 flex items-end gap-2">
                    <span className={`font-display text-4xl font-black leading-none ${p.popular ? "text-teal-700" : "text-slate-900"}`}>${p.price}</span>
                    <span className="mb-1 text-sm font-bold text-slate-500">{p.credits} Credit{p.credits > 1 ? "s" : ""}</span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">Unlock {p.credits} Case{p.credits > 1 ? "s" : ""}. {p.desc}</p>
                  <Button
                    className={`mt-5 w-full rounded-xl font-bold ${
                      p.popular
                        ? "h-12 bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg transition-transform hover:scale-105"
                        : "h-11 border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                    variant={p.popular ? "default" : "outline"}
                    onClick={() => chooseCredits(p.credits)}
                  >
                    Choose {p.name.split(" ")[0]} <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-xs font-medium text-slate-500">
            After choosing, you'll go to your secure Wallet to deposit. Credits are added after quick verification, then you can unlock cases immediately.
          </p>
        </div>
      </section>

      {/* ===== WHY UNLOCK ===== */}
      <section className="relative overflow-hidden bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
              <Shield className="h-3 w-3" /> Why Credits?
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Why do verified cases require Hero Credits?</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Shield, t: "Protect beneficiary privacy", d: "Bills, documents and videos are personal. Only serious Heroes see them.", color: "from-blue-500 to-sky-500" },
              { icon: Users, t: "Prevent fake viewers", d: "A small fee stops curious visitors from exposing someone's hardship.", color: "from-teal-500 to-emerald-500" },
              { icon: Lock, t: "Reduce fraud", d: "Verified Heroes and verified cases keep both sides safe.", color: "from-violet-500 to-purple-500" },
              { icon: FileText, t: "Support verification costs", d: "Every case is checked: documents, 1Bill references, calls to institutes.", color: "from-amber-500 to-orange-500" },
              { icon: Heart, t: "Keep the platform sustainable", d: "Credits keep Givethra running — ad-free and dignified.", color: "from-pink-500 to-rose-500" },
              { icon: CheckCircle2, t: "Your donation stays full", d: "Hero Credits are not donations. Your payment goes directly to the verified institution.", color: "from-teal-500 to-emerald-500" },
            ].map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-md transition-transform group-hover:scale-110`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-sm font-black text-slate-900">{c.t}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{c.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT YOU SEE AFTER UNLOCK ===== */}
      <section className="relative overflow-hidden bg-slate-50 py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
              <Unlock className="h-3 w-3" /> After Unlock
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">What You'll See</h2>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
            <div className="relative bg-gradient-to-br from-teal-600 to-emerald-600 px-6 py-5 text-white">
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Unlock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-teal-100">Full Access</p>
                  <p className="text-lg font-black">Everything you need to help</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2">
              {[
                "Original verified documents",
                "Original bills / fee challans",
                "Givethra verification report",
                "Beneficiary's video statement",
                "Institution / company information",
                "1Bill consumer & reference numbers",
                "Payment instructions",
                "Progress & help history",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TWO WAYS TO HELP ===== */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
              <HandCoins className="h-3 w-3" /> Two Options
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Two Ways To Help</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              { icon: Building2, t: "Option 1 — Direct Help", color: "from-blue-600 to-sky-500", badge: "Full Payment", d: "Pay the school, hospital, utility company or landlord directly using the verified reference (1Bill consumer number, fee challan). Upload your payment receipt, the beneficiary confirms, and the case closes with your named affidavit." },
              { icon: HandCoins, t: "Option 2 — Community Contribution", color: "from-teal-600 to-emerald-600", badge: "Any Amount", d: "Can't pay the full amount? Contribute any amount — Rs 500, Rs 1000, or more. When the fundraising target is reached, Givethra pays the institution directly and closes the case." },
            ].map((opt, i) => (
              <motion.div
                key={opt.t}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-teal-100/40 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${opt.color} text-white shadow-lg transition-transform group-hover:scale-110`}>
                      <opt.icon className="h-7 w-7" />
                    </div>
                    <span className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-950 shadow-sm">
                      {opt.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-black text-slate-900">{opt.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{opt.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HERO BENEFITS ===== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-700">
              <Award className="h-3 w-3" /> Your Profile
            </div>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Your Hero Profile</h2>
            <p className="mt-2 text-sm font-medium text-slate-500">Track your impact, build trust, earn recognition.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: Award, t: "Verified Hero Badge", color: "from-amber-400 to-orange-500" },
              { icon: Users, t: "People Helped", color: "from-blue-500 to-sky-500" },
              { icon: CheckCircle2, t: "Cases Completed", color: "from-teal-500 to-emerald-500" },
              { icon: HandCoins, t: "Amount Contributed", color: "from-pink-500 to-rose-500" },
              { icon: Globe, t: "Countries Reached", color: "from-violet-500 to-purple-500" },
              { icon: FileText, t: "Signed Affidavits", color: "from-teal-500 to-cyan-500" },
            ].map((b, i) => (
              <motion.div
                key={b.t}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${b.color} text-white shadow-md transition-transform group-hover:scale-110`}>
                  <b.icon className="h-6 w-6" />
                </div>
                <p className="text-xs font-black text-slate-800">{b.t}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRIVACY PROMISE ===== */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 p-8 text-center text-white shadow-2xl md:p-12">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-yellow-400/20 blur-3xl" />
            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                <Lock className="h-8 w-8" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-black md:text-3xl">Our Privacy Promise</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-teal-100 md:text-base">
                Every beneficiary deserves dignity. Public visitors only see a limited case preview —
                story, category, city and amount. Private documents, videos and payment information
                are only available to verified Heroes after unlocking a case.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm"><Shield className="mr-1.5 inline h-3 w-3" /> Verified Access</span>
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm"><Lock className="mr-1.5 inline h-3 w-3" /> Encrypted</span>
                <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm"><Heart className="mr-1.5 inline h-3 w-3" /> Dignified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 py-16 text-white">
        <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
            <Flame className="h-3 w-3 text-yellow-300" /> Start Today
          </div>
          <h2 className="mt-4 font-display text-3xl font-black tracking-tight md:text-4xl">Become Someone's Hero Today</h2>
          <p className="mt-3 text-teal-100">One small act of kindness can completely change someone's life.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={goSignIn}
              className="h-14 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 text-base font-black text-amber-950 shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95"
            >
              <Star className="mr-2 h-5 w-5" fill="currentColor" /> {isAuthenticated ? "Browse Verified Cases" : "Continue to Sign In"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: "/cases" })}
              className="h-14 rounded-2xl border-white/30 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              Browse All Cases
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
