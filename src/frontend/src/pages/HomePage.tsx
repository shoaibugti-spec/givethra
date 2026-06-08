import type { CaseSummary, VerificationStatus } from "@/backend";
import { CaseCard, type CaseCardData } from "@/components/CaseCard";
import { CATEGORY_EMOJI, CategoryPill } from "@/components/CategoryPill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBackendActor } from "@/hooks/useBackend";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Accessibility,
  Baby,
  BadgeCheck,
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  Home,
  MailCheck,
  Phone,
  ShieldCheck,
  Siren,
  Stethoscope,
  Utensils,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const FILTER_CATEGORIES = [
  "Education",
  "Medical",
  "Food",
  "Utilities",
  "Housing",
  "Employment",
  "Disability",
  "Orphans",
  "Widows",
  "Emergency",
  "Other",
];

const BROWSE_CATEGORIES = [
  { name: "Education", icon: GraduationCap, count: 0, emoji: "🎓" },
  { name: "Medical", icon: Stethoscope, count: 0, emoji: "🏥" },
  { name: "Food", icon: Utensils, count: 0, emoji: "🍲" },
  { name: "Utilities", icon: Zap, count: 0, emoji: "⚡" },
  { name: "Housing", icon: Home, count: 0, emoji: "🏠" },
  { name: "Employment", icon: Briefcase, count: 0, emoji: "💼" },
  { name: "Disability", icon: Accessibility, count: 0, emoji: "♿" },
  { name: "Orphans", icon: Baby, count: 0, emoji: "👶" },
  { name: "Widows", icon: Heart, count: 0, emoji: "❤️" },
  { name: "Emergency", icon: Siren, count: 0, emoji: "🚨" },
];

function toCardData(c: CaseSummary): CaseCardData {
  const vMap: Record<VerificationStatus, CaseCardData["verificationLevel"]> = {
    DocumentsSubmitted: "documents_submitted",
    InstitutionVerified: "institution_verified",
    Unverified: "unverified",
  };
  return {
    id: String(c.id),
    title: c.title,
    category: c.category,
    country: c.country,
    city: c.city,
    amountNeeded: Number(c.amountNeeded) / 100,
    amountRaised: 0,
    verificationLevel: vMap[c.verificationStatus] ?? "unverified",
    description: "",
  };
}

const TRUST_BADGES = [
  {
    icon: MailCheck,
    label: "Email Verified",
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: Phone,
    label: "Mobile Verified",
    color: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: BadgeCheck,
    label: "Identity Verified",
    color: "text-violet-600 dark:text-violet-400",
  },
  {
    icon: Building2,
    label: "Institution Verified",
    color: "text-orange-600 dark:text-orange-400",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [filterCat, setFilterCat] = useState("all");
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!actor || isFetching) return;
    actor
      .listCases(null, { offset: BigInt(0), limit: BigInt(6) })
      .then(setCases);
  }, [actor, isFetching]);

  const liveCases = cases.map(toCardData);
  const displayCases = liveCases;

  const filteredCases =
    filterCat === "all"
      ? displayCases
      : displayCases.filter((c) => c.category === filterCat);

  return (
    <div className="bg-background pb-20 md:pb-0">
      {/* ── WELCOME / HERO SECTION ─────────────────────────────── */}
      <section
        data-ocid="home.hero_section"
        className="relative overflow-hidden bg-card border-b border-border"
      >
        {/* Gradient blob */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 -left-16 h-48 w-48 rounded-full bg-primary/8 blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-0 md:py-16 flex flex-col md:flex-row items-center gap-6 md:gap-12">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex-1 space-y-4 md:space-y-5 text-center md:text-left"
          >
            {/* Brand label */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary tracking-wide uppercase">
                GIVETHRA
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Verified Help.
              <br />
              <span className="text-primary">Real Impact.</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-md">
              Connect with verified people, support genuine needs, and create
              meaningful impact.
            </p>

            <div className="flex gap-3 justify-center md:justify-start">
              <Button
                size="lg"
                data-ocid="home.become_hero_button"
                onClick={() => navigate({ to: "/sign-up" })}
                className="h-11 px-6 font-semibold text-sm flex-1 sm:flex-none"
              >
                Become a Hero
              </Button>
              <Button
                size="lg"
                variant="outline"
                data-ocid="home.request_help_button"
                onClick={() => navigate({ to: "/sign-up" })}
                className="h-11 px-6 font-semibold text-sm flex-1 sm:flex-none"
              >
                Request Help
              </Button>
            </div>

            {/* Quick stats row */}
            <div className="flex items-center gap-5 justify-center md:justify-start pt-1">
              {[
                { val: "0", label: "Cases Verified" },
                { val: "0", label: "Heroes" },
                { val: "$0", label: "Directly Supported" },
              ].map(({ val, label }) => (
                <div key={label} className="text-center md:text-left">
                  <p className="font-display text-lg font-bold text-foreground">
                    {val}
                  </p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="flex-1 w-full rounded-2xl overflow-hidden shadow-xl"
          >
            <img
              src="/assets/generated/hero-givethra.dim_1200x500.jpg"
              alt="Givethra – verified humanitarian support"
              className="w-full h-52 md:h-80 object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* ── QUICK CATEGORY PILLS (horizontal scroll) ──────────── */}
      <section
        data-ocid="home.category_pills_section"
        className="bg-background border-b border-border py-3 px-4"
      >
        <div
          ref={pillsRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide max-w-7xl mx-auto"
        >
          {/* All pill */}
          <button
            type="button"
            data-ocid="home.category_pill.all"
            onClick={() => setFilterCat("all")}
            className={`inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap px-3 py-1.5 text-sm transition-smooth shrink-0 ${
              filterCat === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
            }`}
          >
            All
          </button>
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              data-ocid={`home.category_pill.${cat.toLowerCase().replace(/ /g, "_")}`}
              onClick={() => setFilterCat(filterCat === cat ? "all" : cat)}
              className={`inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap px-3 py-1.5 text-sm transition-smooth shrink-0 ${
                filterCat === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              <span>{CATEGORY_EMOJI[cat] ?? ""}</span>
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── BROWSE HELP CATEGORIES (grid) ─────────────────────── */}
      <section
        data-ocid="home.browse_categories_section"
        className="py-8 px-4 bg-muted/30 border-b border-border"
      >
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              Browse Help Categories
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {BROWSE_CATEGORIES.map(({ name, icon: Icon, count }, i) => (
              <motion.button
                key={name}
                type="button"
                data-ocid={`home.browse_cat.${name.toLowerCase().replace(/ /g, "_")}`}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setFilterCat(name);
                  document
                    .getElementById("featured-cases")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group flex flex-col items-center gap-2 rounded-xl bg-card border border-border p-3 text-center transition-smooth hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-smooth">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    {name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {count} active
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED VERIFIED CASES ───────────────────────────── */}
      <section
        id="featured-cases"
        data-ocid="home.featured_cases_section"
        className="py-8 px-4 bg-background"
      >
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-foreground">
              Featured Verified Cases
              {filterCat !== "all" && (
                <span className="ml-2 text-primary">· {filterCat}</span>
              )}
            </h2>
            <Link
              to="/cases"
              data-ocid="home.view_all_cases_link"
              className="text-xs text-primary font-semibold hover:underline shrink-0"
            >
              View All →
            </Link>
          </div>

          {filteredCases.length === 0 ? (
            <div
              data-ocid="home.cases_empty_state"
              className="text-center py-16 rounded-xl border border-dashed border-border bg-muted/20"
            >
              <p className="text-foreground font-semibold text-base">
                No verified cases available yet.
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Be the first verified request on Givethra.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => navigate({ to: "/submit-request" })}
              >
                Submit a Request
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCases.slice(0, 6).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  data-ocid={`home.case.item.${i + 1}`}
                >
                  <CaseCard
                    data={c}
                    showViewDetails
                    onClick={() => {
                      navigate({ to: "/cases/$id", params: { id: c.id } });
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST BADGES SECTION ──────────────────────────────── */}
      <section
        data-ocid="home.trust_section"
        className="py-8 px-4 bg-muted/30 border-y border-border"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-lg font-bold text-foreground mb-5 text-center">
            Built on Trust &amp; Verification
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TRUST_BADGES.map(({ icon: Icon, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-ocid={`home.trust_badge.${i + 1}`}
                className="flex items-center gap-3 rounded-xl bg-card border border-border p-3 shadow-sm"
              >
                <div className="h-9 w-9 rounded-lg bg-card flex items-center justify-center shrink-0">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs font-semibold text-foreground">
                      {label}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Verified</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section
        data-ocid="home.how_it_works_section"
        className="py-10 px-4 bg-background"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-display text-lg font-bold text-foreground text-center">
            How Givethra Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Request Help",
                desc: "Submit your verified case with documents and pay a $1 listing fee.",
                emoji: "📝",
              },
              {
                step: "02",
                title: "Get Verified",
                desc: "Our team reviews documents and approves your case for Heroes.",
                emoji: "✅",
              },
              {
                step: "03",
                title: "Receive Direct Support",
                desc: "Heroes unlock your case and pay institutions directly.",
                emoji: "🌟",
              },
            ].map(({ step, title, desc, emoji }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="relative flex flex-col items-center text-center gap-3 rounded-xl bg-card border border-border p-5"
              >
                <span className="absolute -top-3 left-4 text-xs font-black font-display text-primary/30">
                  {step}
                </span>
                <span className="text-3xl">{emoji}</span>
                <h3 className="font-display font-bold text-foreground text-sm">
                  {title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <section
        data-ocid="home.cta_section"
        className="py-10 px-4 bg-primary text-primary-foreground"
      >
        <div className="max-w-xl mx-auto text-center space-y-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold">
            Ready to make a difference?
          </h2>
          <p className="text-primary-foreground/80 text-sm">
            Join thousands of Heroes changing lives through verified, direct
            support.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              size="lg"
              variant="secondary"
              data-ocid="home.cta_hero_button"
              onClick={() => navigate({ to: "/sign-up" })}
              className="h-11 px-6 font-semibold flex-1 sm:flex-none max-w-44"
            >
              Become a Hero
            </Button>
            <Button
              size="lg"
              data-ocid="home.cta_cases_button"
              onClick={() => navigate({ to: "/cases" })}
              className="h-11 px-6 font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90 flex-1 sm:flex-none max-w-44"
            >
              Browse Cases
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
