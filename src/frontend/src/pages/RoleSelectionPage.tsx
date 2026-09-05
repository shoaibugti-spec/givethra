// src/frontend/src/pages/RoleSelectionPage.tsx
// Givethra - Role Selection with Auto-Slide Boxes (Colorful & Professional)

import HeroesWall from "@/components/HeroesWall";
import KindnessWall from "@/components/KindnessWall";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  HandHelping,
  ShieldCheck,
  Users,
  Globe,
  Sparkles,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Bell,
  Battery,
  Flame,
  Droplets,
  GraduationCap,
  Stethoscope,
  ShoppingCart,
  FileText,
  Download,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getApprovedCases, getKycStatus } from "@/lib/api";

// ---------- Category styles (unchanged) ----------
const ROLE_CATEGORY_STYLES: Record<
  string,
  { icon: typeof Battery; color: string; bg: string }
> = {
  "Electricity Bill": {
    icon: Battery,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  "Gas Bill": {
    icon: Flame,
    color: "text-orange-600",
    bg: "bg-orange-500/10",
  },
  "Water Bill": {
    icon: Droplets,
    color: "text-sky-600",
    bg: "bg-sky-500/10",
  },
  "School Fees": {
    icon: GraduationCap,
    color: "text-indigo-600",
    bg: "bg-indigo-500/10",
  },
  "Medical & Treatment": {
    icon: Stethoscope,
    color: "text-rose-600",
    bg: "bg-rose-500/10",
  },
  "Business / Work Help": {
    icon: ShoppingCart,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
};

// ---------- Slide data (exactly as you described) ----------
const COMMUNITY_SLIDES = [
  { text: "Community", desc: "Connect with people who care" },
  { text: "Connect & Share", desc: "Share your story, find support" },
  { text: "Support Others", desc: "Every kind word matters" },
  { text: "Like • Comment • Share", desc: "Engage with the community" },
  { text: "Build Your Community", desc: "Grow together, thrive together" },
];

const HERO_SLIDES = [
  { text: "Hero", desc: "You can change a life today" },
  { text: "Become a Hero", desc: "Step up and make a difference" },
  { text: "Unlock a Case", desc: "Choose a case to support" },
  { text: "Contribute & Help", desc: "Your contribution counts" },
  { text: "3 Free Contributions", desc: "Welcome offer — try it now" },
  { text: "Help Verified People", desc: "Support those who need it most" },
  { text: "Make a Real Impact", desc: "Be the change you want to see" },
];

const REQUESTER_SLIDES = [
  { text: "Requester", desc: "Get the help you deserve" },
  { text: "Request Help", desc: "Reach out with confidence" },
  { text: "Submit Your Case", desc: "Tell us your story" },
  { text: "Complete KYC", desc: "Secure & private verification" },
  { text: "Get Verified", desc: "Build trust in the community" },
  { text: "Receive Verified Help", desc: "Support from real people" },
];

// ---------- Social links (unchanged) ----------
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590715263595";
const INSTAGRAM_URL = "https://www.instagram.com/givethra.community";
const LINKEDIN_URL = "https://www.linkedin.com/company/givethra-org/";
const WHATSAPP_URL = "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";
const CONTACT_EMAIL = "info@givethra.org";

export default function RoleSelectionPage() {
  const { isAuthenticated, user, setRole: setAuthRole } = useAuth();
  const { setRole } = useRole();
  const navigate = useNavigate();

  const [activeCases, setActiveCases] = useState<any[]>([]);

  // ---------- Fetch active cases ----------
  useEffect(() => {
    getApprovedCases()
      .then((rows) => {
        setActiveCases(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        setActiveCases([]);
      });
  }, []);

  // ---------- Build category slides for Active Cases ----------
  const activeCaseCategories = Object.entries(
    activeCases.reduce<Record<string, number>>((counts, currentCase) => {
      const category = String(currentCase?.category || "Other");
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {})
  ).map(([category, count]) => ({
    category,
    count,
  }));

  // Active slides: first a summary, then each category
  const activeSlides =
    activeCaseCategories.length > 0
      ? [
          { text: `${activeCases.length} Active Cases`, desc: "Tap to help now" },
          ...activeCaseCategories.map((cat) => ({
            text: cat.category,
            desc: `${cat.count} case${cat.count === 1 ? "" : "s"}`,
          })),
        ]
      : [{ text: "No active cases", desc: "Check back soon" }];

  // ---------- Auto-slide state for each box ----------
  const [communityIndex, setCommunityIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [requesterIndex, setRequesterIndex] = useState(0);

  // Auto-slide effect for each box (no dots)
  useEffect(() => {
    const interval = setInterval(() => {
      setCommunityIndex((prev) => (prev + 1) % COMMUNITY_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeSlides.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activeSlides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRequesterIndex((prev) => (prev + 1) % REQUESTER_SLIDES.length);
    }, 4600);
    return () => clearInterval(interval);
  }, []);

  // ---------- Role selection handler (unchanged) ----------
  const handleRoleSelect = async (role: "hero" | "requester") => {
    setRole(role);
    setAuthRole(role === "requester" ? "help_seeker" : "hero");

    if (!isAuthenticated) {
      navigate({
        to: "/sign-in",
        search: {
          role,
          redirect: role === "requester" ? "/kyc" : "/home",
        },
      });
      return;
    }

    if (role === "requester") {
      try {
        const kyc = await getKycStatus(user!.id);
        const status = String(kyc?.status || "none").trim().toLowerCase();
        if (status === "approved") {
          navigate({ to: "/home" });
        } else {
          navigate({ to: "/kyc" });
        }
      } catch (error) {
        console.error("KYC status check failed:", error);
        navigate({ to: "/kyc" });
      }
    } else {
      navigate({ to: "/home" });
    }
  };

  // ---------- Helper: render a slide inside a box ----------
  const renderSlide = (text: string, desc: string) => (
    <div className="flex flex-col items-center justify-center h-full w-full px-2">
      <span className="text-base font-bold text-foreground md:text-xl">
        {text}
      </span>
      <span className="mt-1 text-xs text-muted-foreground md:text-sm">
        {desc}
      </span>
    </div>
  );

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-foreground">Givethra</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Real People.
              <br className="sm:hidden" />
              <span className="text-primary"> Real Needs. Real Help.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A trusted platform where real people with genuine needs get support
              from kind-hearted Heroes.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">How are you today?</p>
        </div>

        {/* 4‑Box Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-5">
          {/* ---------- Community (Teal) ---------- */}
          <Link
            to="/community"
            className="group flex aspect-square flex-col items-center justify-center rounded-3xl border border-teal-300/60 bg-gradient-to-br from-teal-50/80 to-white/80 p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/20 dark:border-teal-800/60 dark:from-teal-950/30 dark:to-background/80"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 transition-transform group-hover:scale-105 dark:text-teal-400">
              <Users className="h-7 w-7 md:h-8 md:w-8" />
            </div>
            {/* Slide area */}
            <div className="flex-1 flex items-center justify-center w-full">
              {renderSlide(
                COMMUNITY_SLIDES[communityIndex].text,
                COMMUNITY_SLIDES[communityIndex].desc
              )}
            </div>
            <span className="mt-1 text-[10px] font-medium text-teal-600 dark:text-teal-400 opacity-70">
              Guest available
            </span>
          </Link>

          {/* ---------- Active Cases (Coral / Rose) ---------- */}
          <button
            type="button"
            onClick={() => handleRoleSelect("hero")}
            className="group relative flex aspect-square flex-col items-center justify-center rounded-3xl border border-rose-300/60 bg-gradient-to-br from-rose-50/80 to-white/80 p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/20 dark:border-rose-800/60 dark:from-rose-950/30 dark:to-background/80"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 transition-transform group-hover:scale-105 dark:text-rose-400">
              <Bell className="h-7 w-7 md:h-8 md:w-8" />
            </div>
            <div className="flex-1 flex items-center justify-center w-full">
              {activeSlides.length > 0 &&
                renderSlide(
                  activeSlides[activeIndex].text,
                  activeSlides[activeIndex].desc
                )}
            </div>
            <span className="mt-1 text-[10px] font-medium text-rose-600 dark:text-rose-400 opacity-70">
              {activeCases.length} active cases
            </span>
          </button>

          {/* ---------- Become a Hero (Gold / Amber) ---------- */}
          <button
            type="button"
            onClick={() => handleRoleSelect("hero")}
            className="group flex aspect-square flex-col items-center justify-center rounded-3xl border border-amber-300/60 bg-gradient-to-br from-amber-50/80 to-white/80 p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/20 dark:border-amber-800/60 dark:from-amber-950/30 dark:to-background/80"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-105 dark:text-amber-400">
              <Heart className="h-7 w-7 md:h-8 md:w-8" />
            </div>
            <div className="flex-1 flex items-center justify-center w-full">
              {renderSlide(HERO_SLIDES[heroIndex].text, HERO_SLIDES[heroIndex].desc)}
            </div>
            <span className="mt-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 opacity-70">
              3 free contributions
            </span>
          </button>

          {/* ---------- Requester (Blue) ---------- */}
          <button
            type="button"
            onClick={() => handleRoleSelect("requester")}
            className="group flex aspect-square flex-col items-center justify-center rounded-3xl border border-blue-300/60 bg-gradient-to-br from-blue-50/80 to-white/80 p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 dark:border-blue-800/60 dark:from-blue-950/30 dark:to-background/80"
          >
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-105 dark:text-blue-400">
              <HandHelping className="h-7 w-7 md:h-8 md:w-8" />
            </div>
            <div className="flex-1 flex items-center justify-center w-full">
              {renderSlide(
                REQUESTER_SLIDES[requesterIndex].text,
                REQUESTER_SLIDES[requesterIndex].desc
              )}
            </div>
            <span className="mt-1 text-[10px] font-medium text-blue-600 dark:text-blue-400 opacity-70">
              KYC verified
            </span>
          </button>
        </div>

        {/* Rest of the page (Walls, Download, Trust, Footer) - unchanged */}
        <section className="space-y-8 bg-background py-8" aria-label="Community impact walls">
          <HeroesWall />
          <KindnessWall />
        </section>

        <section className="max-w-3xl mx-auto w-full px-0 pt-2">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                📱 Get the Givethra Android App
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Verified cases, anytime — right on your phone.
              </p>
            </div>
            <a
              href="/Givethra.apk"
              download="Givethra.apk"
              type="application/vnd.android.package-archive"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            >
              <Download className="h-4 w-4" />
              Download App
            </a>
          </div>
        </section>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-muted-foreground pt-4 border-t border-border">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>Verified & Secure</span>
            <span className="text-[10px]">100% Transparency</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heart className="h-5 w-5 text-primary" />
            <span>Compassion</span>
            <span className="text-[10px]">Driven by Humanity</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Globe className="h-5 w-5 text-primary" />
            <span>Global Community</span>
            <span className="text-[10px]">Help Beyond Borders</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>Safe & Private</span>
            <span className="text-[10px]">Your Data is Protected</span>
          </div>
        </div>

        {/* Footer */}
        <section className="py-10 px-4 bg-card border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-foreground">
                Connect with Givethra
              </h2>
              <p className="text-sm text-muted-foreground">
                Follow us and reach out — we're here to help.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Channel"
                className="h-11 w-11 rounded-full bg-muted hover:bg-green-600 hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label="Email"
                className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:underline"
            >
              <MessageCircle className="h-4 w-4" />
              Follow our WhatsApp Channel
            </a>
            <div>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Mail className="h-4 w-4" />
                {CONTACT_EMAIL}
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 border-t border-border text-sm text-muted-foreground">
              <Link to="/about">About</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/community-guidelines">Community Guidelines</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              © {new Date().getFullYear()} Givethra. All rights reserved.
            </p>
          </div>
        </section>

        {/* Bottom Quote */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>"Be the reason someone believes in kindness."</p>
          <p className="mt-2">givethra.org</p>
        </div>
      </div>
    </div>
  );
}
