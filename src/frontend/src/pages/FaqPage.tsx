// src/pages/FaqPage.tsx
// Premium Globalized FAQ Page — GDPR, Play Store & International Law Compliant.

import Layout from "@/components/Layout";
import { useState, useMemo } from "react";
import {
  ChevronDown, HelpCircle, Search, X, Sparkles, ShieldCheck, Globe,
  Mail, Scale, Database, UserCheck, Trash2, FileText, AlertTriangle,
  CheckCircle2, TrendingUp, Lock, Users, Coins, Gift, ChevronRight,
  MessageCircle, Eye, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// FAQ Data — Organized by category with legal/global sections
// ============================================================
const FAQS = [
  {
    category: "Getting Started",
    icon: HelpCircle,
    color: "from-blue-500 to-sky-500",
    items: [
      { q: "What is Givethra?", a: "Givethra is a humanitarian platform that connects Help Seekers with Heroes through verified requests, direct assistance where practical, and community features. Our motto: From Need to Help." },
      { q: "How do I create an account?", a: "Sign in with your Google account, then complete your profile. Heroes can browse eligible cases right away. Help Seekers must complete KYC (identity verification) before a request can be approved." },
      { q: "Is Givethra free?", a: "Creating an account is free. Your first Help Request is free, and if it is rejected your second is also free. Other features use credits (1 credit = USD 1). The fee is always shown before you confirm." },
      { q: "Is Givethra a job, loan, or bank?", a: "No. Givethra does not offer jobs, loans, or instalment plans and is not a bank or financial institution." },
      { q: "In which countries is Givethra available?", a: "Givethra is available in 200+ countries. Local payment methods, currencies, and ID documents are supported per country. Some features may be limited in specific regions based on legal and payment-provider availability." },
    ],
  },
  {
    category: "For Help Seekers",
    icon: Gift,
    color: "from-teal-500 to-emerald-500",
    items: [
      { q: "How do I request help?", a: "Choose a category, complete the form in your own words, upload required documents, record your appeal video and selfie confirmation, accept the declarations, and submit." },
      { q: "Who can see my documents?", a: "Only authorised verification staff. Heroes, contributors, and other users never see your documents. Your appeal video is locked and only an eligible Hero who unlocks your case can stream it — play only, no download button." },
      { q: "Why was my request rejected?", a: "Common reasons: wrong category, documents that do not support the need, unclear video, inconsistent amount, or missing information. You will see the reason and how to fix it where correction is allowed." },
      { q: "How often can I request help?", a: "Utility bills and rent: once per monthly period. School/university fees: monthly for a distinct fee period. Other categories: after about three months from a completed request. After a rejection, retry after 30 days (some categories allow 15). Disability, widow, orphan, and elderly support follow special rules." },
      { q: "What happens after five rejections?", a: "The account may be suspended. Reactivation requires the published fee (currently 5 credits) and review. You can request a fair review of any decision by contacting support." },
    ],
  },
  {
    category: "For Heroes",
    icon: ShieldCheck,
    color: "from-amber-400 to-orange-500",
    items: [
      { q: "How do I help someone?", a: "Browse verified cases, unlock a case with credits to see the approved payment reference and appeal video, pay the institution or provider directly through your own bank or wallet, then upload proof." },
      { q: "Do I send money to Givethra?", a: "For direct help, no. You pay the school, hospital, utility, or landlord directly. Community donations and credits are separate features and clearly labelled." },
      { q: "Is a verified case guaranteed?", a: "Verified means it passed our checks. It does not guarantee how a person's circumstances will change." },
      { q: "What is a Proud Heart?", a: "A recognition you earn when a case you helped is successfully completed." },
    ],
  },
  {
    category: "Credits, Donations & Withdrawals",
    icon: Coins,
    color: "from-violet-500 to-purple-500",
    items: [
      { q: "What are credits?", a: "A platform fee unit (1 credit = USD 1). They cannot be withdrawn or transferred and are not a guarantee of approval or assistance." },
      { q: "How do I add credits?", a: "In your Wallet, pick an available payment method, pay, and upload the receipt. After review, credits are added — usually within 24 hours." },
      { q: "What is the community support feature?", a: "Eligible users can post and receive support units, up to 1,000 per post, with one new post per 24 hours. Support units are not cash or guaranteed income." },
      { q: "How do withdrawals work?", a: "The withdrawal window opens on the 30th and closes on the 3rd of the next month. The minimum is PKR 300. Processing depends on checks and payment-provider availability." },
      { q: "Can I donate to the community?", a: "Yes, voluntarily. Donations are separate from help for a specific case. See the Donation Policy for how funds are used." },
    ],
  },
  {
    category: "Shop Dream Now",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    items: [
      { q: "What is Shop Dream Now?", a: "A product-participation feature: participants each contribute a small share toward a product's target. When the target is reached, one eligible participant receives it under the published selection method." },
      { q: "Will everyone get the product?", a: "No. A product is not guaranteed to every participant. A previous recipient cannot be selected again. Read the listing rules and Shop Dream Now Rules first." },
      { q: "What if the target isn't reached?", a: "Contributions are refunded as stated on the listing." },
    ],
  },
  {
    category: "Privacy & Data Rights",
    icon: Lock,
    color: "from-cyan-500 to-teal-500",
    items: [
      { q: "How do I download or delete my data?", a: "Go to Privacy & Account to download a copy of your data or delete your account. You can also email privacy@givethra.org. We respond within 30 days as required by GDPR and CCPA." },
      { q: "How do I change my cookie choices?", a: "Use 'Cookie settings' in the footer at any time." },
      { q: "Will support staff ask for money or passwords?", a: "Never. Support (WhatsApp, Telegram, email) is guidance only. Report anyone asking for money, passwords, or codes." },
      { q: "How do I report a problem?", a: "Use the Report page, the report option on content, or email support@givethra.org." },
      { q: "What personal data does Givethra collect?", a: "We collect: name, email, phone number, country, city, KYC documents (for verification), payment information (for withdrawals), and usage data (for security). We never sell your data. See the Privacy Policy for full details." },
      { q: "Is my data shared with third parties?", a: "Only with: (1) verification service providers (under strict contracts), (2) payment processors (for withdrawals), (3) legal authorities (only when legally required). See the Privacy Policy for details." },
      { q: "What if I'm in the EU?", a: "You have rights under GDPR: access, rectification, erasure, restriction, portability, objection. Contact privacy@givethra.org to exercise any of these rights." },
      { q: "What if I'm in California?", a: "You have rights under CCPA: know, delete, opt-out, non-discrimination. Contact privacy@givethra.org for any CCPA request." },
    ],
  },
  {
    category: "Play Store & Legal Compliance",
    icon: Scale,
    color: "from-slate-600 to-slate-800",
    items: [
      { q: "Is the Givethra app safe for Android?", a: "Yes. Givethra follows all Google Play Developer Policies including: Data Safety requirements, Content Rating, Privacy Policy disclosure, Account Deletion, and permission transparency." },
      { q: "How do I delete my Givethra account?", a: "Two ways: (1) In-app: go to Settings → Delete Account. (2) Web: visit givethra.org/delete-account. We process deletions within 30 days." },
      { q: "What permissions does the app need?", a: "Camera (for KYC selfie/video), Storage (for document uploads), and Location (optional — only to show nearby cases). You can deny any permission and still use most features." },
      { q: "Does Givethra show ads?", a: "No. Givethra is ad-free and does not sell user data to advertisers." },
      { q: "Is Givethra GDPR compliant?", a: "Yes. We process data lawfully, keep it encrypted, honor all GDPR rights (access, deletion, portability), and never transfer data outside lawful frameworks." },
      { q: "How are disputes resolved?", a: "First, contact support@givethra.org. We aim to resolve all disputes within 30 days. For unresolved matters, users in the EU may contact their local Data Protection Authority (DPA), and users elsewhere may use local consumer protection bodies." },
      { q: "What laws govern Givethra?", a: "Givethra operates globally. Where local laws conflict with our practices, we adapt to comply. Primary legal jurisdiction is Pakistan, with compliance to EU (GDPR), US (CCPA), Canada (PIPEDA), and Singapore (PDPA) where applicable." },
      { q: "How do I report abuse or fraud?", a: "Use the Report page (givethra.org/report), email report@givethra.org, or click 'Report' on any content. All reports are investigated within 7 days." },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-4 text-left transition-colors hover:text-teal-600"
      >
        <span className="text-sm font-bold text-slate-800">{q}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180 text-teal-600" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed text-slate-600">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter FAQs by search query
  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      ),
    })).filter(section => section.items.length > 0);
  }, [search]);

  const totalResults = filteredFaqs.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-900 text-white">
          <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-lg"
            >
              <HelpCircle className="h-4 w-4" /> Help Center
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl"
            >
              Frequently Asked <br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                Questions
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-teal-100"
            >
              Everything you need to know about Givethra — from getting started to legal rights, GDPR, and Google Play compliance.
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mx-auto mt-8 max-w-xl"
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your question..."
                  className="h-14 w-full rounded-2xl border-0 bg-white pl-12 pr-12 text-base font-medium text-slate-900 shadow-2xl outline-none ring-2 ring-transparent transition focus:ring-yellow-300"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              {search && (
                <p className="mt-3 text-xs font-bold text-teal-100">
                  {totalResults} {totalResults === 1 ? "result" : "results"} found for "{search}"
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* ===== CATEGORY QUICK NAV ===== */}
        <section className="border-b border-slate-200 bg-white py-4">
          <div className="mx-auto max-w-5xl px-4">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FAQS.map(({ category, icon: Icon }) => (
                <a
                  key={category}
                  href={`#${category.replace(/\s+/g, "-").toLowerCase()}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {category}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ CONTENT ===== */}
        <section className="mx-auto max-w-4xl px-4 py-10">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
              <Search className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 font-display text-lg font-black text-slate-900">No results found</p>
              <p className="mt-1 text-sm text-slate-500">Try a different keyword or browse by category below.</p>
              <button
                onClick={() => setSearch("")}
                className="mt-4 rounded-xl bg-teal-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-teal-700"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFaqs.map(({ category, icon: Icon, color, items }, sectionIdx) => (
                <motion.div
                  key={category}
                  id={category.replace(/\s+/g, "-").toLowerCase()}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIdx * 0.05 }}
                  viewport={{ once: true }}
                  className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className={`relative bg-gradient-to-r ${color} px-5 py-4`}>
                    <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-white/70">Section {sectionIdx + 1}</p>
                        <h2 className="font-display text-lg font-black text-white">{category}</h2>
                      </div>
                    </div>
                  </div>
                  <div className="px-5">
                    {items.map((item) => <FaqItem key={item.q} {...item} />)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ===== QUICK LINKS ===== */}
        <section className="bg-white py-12">
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
                <ChevronRight className="h-3 w-3" /> Related Pages
              </div>
              <h2 className="mt-3 font-display text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                Explore More
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: ShieldCheck, title: "Privacy Policy", href: "/privacy-policy", desc: "Full data protection details" },
                { icon: FileText, title: "Terms of Service", href: "/terms", desc: "Rules and obligations" },
                { icon: Users, title: "Community Guidelines", href: "/community-guidelines", desc: "How to be a great member" },
                { icon: AlertTriangle, title: "Report Abuse", href: "/report", desc: "Report fraud or abuse" },
                { icon: Mail, title: "Contact Us", href: "/contact", desc: "Reach our team" },
                { icon: Globe, title: "About Givethra", href: "/about", desc: "Our mission and values" },
              ].map(({ icon: Icon, title, href, desc }) => (
                <a
                  key={title}
                  href={href}
                  className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-emerald-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900">{title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                  </div>
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600" />
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CONTACT CTA ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 py-16 text-white">
          <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
              <MessageCircle className="h-3 w-3 text-yellow-300" /> Still Have Questions?
            </div>
            <h2 className="mt-4 font-display text-3xl font-black tracking-tight md:text-4xl">
              We're Here to Help
            </h2>
            <p className="mt-3 text-teal-100">Our support team responds within 24 hours.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="/contact"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 text-base font-black text-amber-950 shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                <Mail className="h-5 w-5" /> Contact Us
              </a>
              <a
                href="mailto:support@givethra.org"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                support@givethra.org
              </a>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
