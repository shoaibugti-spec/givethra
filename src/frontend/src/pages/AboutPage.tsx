// src/pages/AboutPage.tsx
// Premium Globalized About Page — GDPR, Play Store & International Law Compliant.

import Layout from "@/components/Layout";
import SocialLinks from "@/components/SocialLinks";
import { SITE } from "@/lib/siteConfig";
import {
  Globe, Heart, Lock, Shield, Users, Sparkles, CheckCircle2, FileText,
  Scale, UserCheck, Database, Trash2, Mail, AlertTriangle, Building2,
  MapPin, TrendingUp, Award, BadgeCheck, ChevronRight, Zap, Eye,
} from "lucide-react";
import { motion } from "framer-motion";

const values = [
  {
    icon: Shield,
    title: "Verified Requests",
    description: "Every Help Request is reviewed by our Verification Team for authenticity, completeness and category eligibility before it goes live.",
    color: "from-blue-500 to-sky-500",
  },
  {
    icon: Heart,
    title: "Direct Assistance",
    description: "Where practical, Heroes pay the institution or service provider directly — bills, fees, treatment or rent — and upload proof so progress is visible.",
    color: "from-teal-500 to-emerald-500",
  },
  {
    icon: Lock,
    title: "Privacy & Dignity",
    description: "Private documents are visible only to authorised reviewers. Appeal videos are locked, play-only and unlocked just for eligible Heroes.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Users,
    title: "Community Participation",
    description: "Beyond direct help, the community can share posts, support one another, donate voluntarily and take part in Shop Dream Now — each clearly separate.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Globe,
    title: "Built for the World",
    description: "Givethra is designed to serve people across continents, expanding country by country as legal, payment and operational readiness allow.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: BadgeCheck,
    title: "Transparent & Accountable",
    description: "All amounts, decisions, and outcomes are documented. Users can view their history, request their data, or contact us anytime.",
    color: "from-cyan-500 to-teal-500",
  },
];

const globalCompliance = [
  {
    icon: Database,
    title: "Data Protection",
    description: "Your data is stored securely, processed lawfully, and never sold. We follow GDPR (EU), CCPA (California), PIPEDA (Canada) and PDPA (Singapore) standards.",
    region: "Global",
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    description: "You have the right to access, correct, delete, or export your personal data at any time. Contact privacy@givethra.org for requests.",
    region: "Global",
  },
  {
    icon: Trash2,
    title: "Right to Deletion",
    description: "You can request full account and data deletion. We'll process within 30 days as required by GDPR and CCPA.",
    region: "Global",
  },
  {
    icon: Scale,
    title: "Fair Use Policy",
    description: "No discrimination, no fraudulent cases, no abuse. Violations may lead to suspension as outlined in our Terms of Service.",
    region: "Global",
  },
  {
    icon: Shield,
    title: "KYC & AML",
    description: "We verify all users for Know Your Customer (KYC) and follow Anti-Money Laundering (AML) best practices to keep the platform safe.",
    region: "Global",
  },
  {
    icon: FileText,
    title: "Google Play Compliant",
    description: "Givethra follows all Google Play Developer Policies, including data safety, content restrictions and user consent.",
    region: "Android",
  },
];

export default function AboutPage() {
  return (
    <Layout>
      <div className="bg-slate-50">
        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-900 text-white">
          <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:py-24">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-lg"
            >
              <Sparkles className="h-4 w-4" /> About Givethra
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl"
            >
              Humanity, Verified.<br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                Trust, Global.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-teal-100 md:text-lg"
            >
              {SITE.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-teal-100/80 md:text-base"
            >
              Givethra is a humanitarian technology platform connecting people who need help with people who want to help —
              through verified requests, privacy-conscious processes, and transparent accountability.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-wrap justify-center gap-2 text-[11px] font-bold"
            >
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                <Globe className="mr-1.5 inline h-3 w-3" /> Global Platform
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                <Shield className="mr-1.5 inline h-3 w-3" /> GDPR Compliant
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                <Lock className="mr-1.5 inline h-3 w-3" /> Privacy First
              </span>
            </motion.div>
          </div>
        </section>

        {/* ===== MISSION ===== */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 md:p-12 shadow-sm"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-teal-100/50 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
                  <Heart className="h-3 w-3" /> Our Mission
                </div>
                <h2 className="mt-4 font-display text-2xl font-black text-slate-900 md:text-3xl">
                  Generosity is abundant; trust is scarce.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-slate-600">
                  Many people want to help but worry where their support goes. Many people in real need hesitate to ask because of privacy and dignity.
                  Givethra makes it easier for genuine Help Seekers to apply, easier for Heroes to contribute with confidence, and easier for everyone
                  to understand how help is verified and delivered.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-700"><CheckCircle2 className="mr-1.5 inline h-3 w-3" /> Verified Help</span>
                  <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-700"><CheckCircle2 className="mr-1.5 inline h-3 w-3" /> Privacy Protected</span>
                  <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-700"><CheckCircle2 className="mr-1.5 inline h-3 w-3" /> Transparent Process</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== WHAT WE STAND FOR ===== */}
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
                <Award className="h-3 w-3" /> Values
              </div>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">What We Stand For</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {values.map(({ icon: Icon, title, description, color }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-md transition-transform group-hover:scale-110`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-black text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== GLOBAL COMPLIANCE ===== */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                <Shield className="h-3 w-3" /> Global Compliance
              </div>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Legal & Privacy Standards</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-slate-500">
                Givethra is built to comply with international data protection and app store requirements.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {globalCompliance.map(({ icon: Icon, title, description, region }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-100/40 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-md">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-700">
                        {region}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-sm font-black text-slate-900">{title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-bold"
            >
              <span className="text-slate-500">Legal Frameworks:</span>
              {["GDPR (EU)", "CCPA (US)", "PIPEDA (CA)", "PDPA (SG)", "Google Play", "Apple App Store"].map(law => (
                <span key={law} className="rounded-full bg-white px-2.5 py-1 text-slate-700 shadow-sm">
                  <CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-600" /> {law}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ===== WHAT GIVETHRA IS NOT ===== */}
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-3xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 md:p-8"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-black text-amber-900 md:text-2xl">What Givethra is NOT</h2>
                  <p className="mt-2 text-sm leading-relaxed text-amber-800/90">
                    Givethra is not an employer, bank, lender, or instalment seller, and it does not guarantee approval, funding, earnings, or product awards.
                    We are honest about what we do so you can use the platform with confidence.
                  </p>
                  <ul className="mt-4 space-y-1.5 text-xs font-medium text-amber-800/90">
                    {[
                      "Not a bank or financial institution",
                      "Not a charity or registered trust (for donations)",
                      "Not a loan or credit provider",
                      "Not a political or religious organization",
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-amber-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== WHERE WE OPERATE ===== */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 p-8 text-white shadow-2xl md:p-10"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-yellow-300/20 blur-3xl" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                  <Globe className="h-8 w-8" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-black md:text-3xl">Where We Operate</h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-teal-100">
                  Operated from <strong className="text-white">{[SITE.operatorProvince, SITE.operatorRegion].filter(Boolean).join(", ")}</strong>,
                  serving users worldwide where permitted by local laws.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2 text-[11px] font-bold">
                  <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm"><MapPin className="mr-1 inline h-3 w-3" /> Global Reach</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm"><TrendingUp className="mr-1 inline h-3 w-3" /> Country-by-Country Expansion</span>
                  <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm"><Shield className="mr-1 inline h-3 w-3" /> Local Law Compliant</span>
                </div>
                <div className="mt-6 flex justify-center">
                  <SocialLinks />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== YOUR RIGHTS (GDPR / CCPA) ===== */}
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-teal-700">
                <UserCheck className="h-3 w-3" /> Your Rights
              </div>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">You Are in Control</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-slate-500">
                Under GDPR, CCPA, and other privacy laws, you have the following rights:
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Eye, title: "Right to Access", desc: "You can request a copy of all personal data we hold about you." },
                { icon: FileText, title: "Right to Correct", desc: "Update your profile anytime from Edit Profile — no support ticket needed." },
                { icon: Trash2, title: "Right to Delete", desc: "Request full account deletion. We process within 30 days." },
                { icon: Database, title: "Right to Export", desc: "Download your data in a portable, machine-readable format." },
                { icon: Scale, title: "Right to Object", desc: "Object to any processing you disagree with — contact us anytime." },
                { icon: Lock, title: "Right to Withdraw Consent", desc: "Withdraw consent for optional data processing at any time." },
              ].map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="group flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-teal-300 hover:shadow-lg"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-emerald-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-6 flex items-start gap-3 rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-4"
            >
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
              <div>
                <p className="text-sm font-black text-teal-900">To exercise these rights:</p>
                <p className="mt-1 text-xs font-medium text-teal-800">
                  Email <a href="mailto:privacy@givethra.org" className="font-bold underline">privacy@givethra.org</a> or use{" "}
                  <a href="/contact" className="font-bold underline">Contact Us</a>. We respond within 30 days.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== PLAY STORE COMPLIANCE ===== */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-4">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-700">
                <BadgeCheck className="h-3 w-3" /> Google Play
              </div>
              <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Play Store Compliant</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-slate-500">
                Givethra is designed to meet Google Play Developer Policies.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Data Safety", desc: "Full data disclosure in Play Store Data Safety form" },
                { title: "Privacy Policy", desc: "Linked and accessible from within the app" },
                { title: "Content Rating", desc: "Rated for general audiences — no restricted content" },
                { title: "Account Deletion", desc: "In-app + web-based account deletion available" },
                { title: "Permissions", desc: "Only camera, storage, and location (with consent)" },
                { title: "Ads & Monetization", desc: "Ad-free. No in-app purchases for virtual goods." },
              ].map(({ title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-green-300 hover:shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    <p className="text-sm font-black text-slate-900">{title}</p>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{desc}</p>
                </motion.div>
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
              <Mail className="h-3 w-3 text-yellow-300" /> Get in Touch
            </div>
            <h2 className="mt-4 font-display text-3xl font-black tracking-tight md:text-4xl">Questions About Privacy or Legal?</h2>
            <p className="mt-3 text-teal-100">Our team responds to all compliance requests within 30 days.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:privacy@givethra.org"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-8 text-base font-black text-amber-950 shadow-[0_10px_30px_rgba(251,191,36,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                <Mail className="h-5 w-5" /> privacy@givethra.org
              </a>
              <a
                href="/contact"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/20"
              >
                Contact Us <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ===== FOOTER NOTE ===== */}
        <section className="bg-slate-50 py-8">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <p className="text-xs leading-relaxed text-slate-500">
              Givethra is committed to operating ethically, lawfully, and with the dignity of every person in mind. If you have concerns about
              our practices, please <a href="/contact" className="font-bold text-teal-600 hover:underline">contact us</a>.
              We take all feedback seriously.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
