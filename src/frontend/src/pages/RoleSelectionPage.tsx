// src/frontend/src/pages/RoleSelectionPage.tsx
// Givethra - Role Selection Landing Page (Enhanced with 4 auto-slide boxes)

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
  // additional icons for slides
  Share2,
  Star,
  CheckCircle,
  UserPlus,
  BookOpen,
  Home,
  Award,
  Target,
  ThumbsUp,
  Users as UsersIcon,
  HeartHandshake,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { getApprovedCases, getKycStatus } from "@/lib/api";

// ------------------------------------------------------------
// SLIDE DATA FOR EACH BOX (same as HTML version)
// ------------------------------------------------------------
const COMMUNITY_SLIDES = [
  { icon: <Globe className="w-6 h-6" />, text: "Community", desc: "Connect with people who care" },
  { icon: <Share2 className="w-6 h-6" />, text: "Connect & Share", desc: "Share your story, find support" },
  { icon: <HeartHandshake className="w-6 h-6" />, text: "Support Others", desc: "Every kind word matters" },
  { icon: <ThumbsUp className="w-6 h-6" />, text: "Like • Comment • Share", desc: "Engage with the community" },
  { icon: <UsersIcon className="w-6 h-6" />, text: "Build Your Community", desc: "Grow together, thrive together" },
];

const HERO_SLIDES = [
  { icon: <Star className="w-6 h-6" />, text: "Hero", desc: "You can change a life today" },
  { icon: <UserPlus className="w-6 h-6" />, text: "Become a Hero", desc: "Step up and make a difference" },
  { icon: <Lock className="w-6 h-6" />, text: "Unlock a Case", desc: "Choose a case to support" },
  { icon: <Heart className="w-6 h-6" />, text: "Contribute & Help", desc: "Your contribution counts" },
  { icon: <Gift className="w-6 h-6" />, text: "3 Free Contributions", desc: "Welcome offer — try it now" },
  { icon: <CheckCircle className="w-6 h-6" />, text: "Help Verified People", desc: "Support those who need it most" },
  { icon: <Target className="w-6 h-6" />, text: "Make a Real Impact", desc: "Be the change you want to see" },
];

const REQUESTER_SLIDES = [
  { icon: <FileText className="w-6 h-6" />, text: "Requester", desc: "Get the help you deserve" },
  { icon: <HandHelping className="w-6 h-6" />, text: "Request Help", desc: "Reach out with confidence" },
  { icon: <BookOpen className="w-6 h-6" />, text: "Submit Your Case", desc: "Tell us your story" },
  { icon: <ShieldCheck className="w-6 h-6" />, text: "Complete KYC", desc: "Secure & private verification" },
  { icon: <CheckCircle className="w-6 h-6" />, text: "Get Verified", desc: "Build trust in the community" },
  { icon: <Heart className="w-6 h-6" />, text: "Receive Verified Help", desc: "Support from real people" },
];

// Category icons for Active Cases (reuse from existing)
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

// Color themes for each box (glass-morphism + accent)
const BOX_THEMES = {
  community: {
    accent: "teal",
    borderColor: "border-teal-300 dark:border-teal-700",
    bgGlow: "bg-teal-500/5",
    shadowColor: "shadow-teal-500/10",
    hoverBorder: "hover:border-teal-400",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-600",
    dotColor: "bg-teal-500",
    badgeColor: "text-teal-600",
  },
  active: {
    accent: "rose",
    borderColor: "border-rose-300 dark:border-rose-700",
    bgGlow: "bg-rose-500/5",
    shadowColor: "shadow-rose-500/10",
    hoverBorder: "hover:border-rose-400",
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600",
    dotColor: "bg-rose-500",
    badgeColor: "text-rose-600",
  },
  hero: {
    accent: "emerald",
    borderColor: "border-emerald-300 dark:border-emerald-700",
    bgGlow: "bg-emerald-500/5",
    shadowColor: "shadow-emerald-500/10",
    hoverBorder: "hover:border-emerald-400",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    dotColor: "bg-emerald-500",
    badgeColor: "text-emerald-600",
  },
  requester: {
    accent: "amber",
    borderColor: "border-amber-300 dark:border-amber-700",
    bgGlow: "bg-amber-500/5",
    shadowColor: "shadow-amber-500/10",
    hoverBorder: "hover:border-amber-400",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    dotColor: "bg-amber-500",
    badgeColor: "text-amber-600",
  },
};

// Helper: generate slide dots and auto-slide hook
function useAutoSlide<T>(slides: T[], intervalMs: number = 4000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    timerRef.current = setInterval(next, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, intervalMs, next]);

  return { currentIndex, goTo, next };
}

// ------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------
export default function RoleSelectionPage() {
  const { isAuthenticated, user, setRole: setAuthRole } = useAuth();
  const { setRole } = useRole();
  const navigate = useNavigate();

  // Active Cases state
  const [activeCases, setActiveCases] = useState<any[]>([]);
  useEffect(() => {
    getApprovedCases()
      .then((rows) => {
        setActiveCases(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        setActiveCases([]);
      });
  }, []);

  // Compute category counts
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

  // Auto-slide for each box
  const communitySlides = COMMUNITY_SLIDES;
  const heroSlides = HERO_SLIDES;
  const requesterSlides = REQUESTER_SLIDES;

  const { currentIndex: communityIdx, goTo: goToCommunity } = useAutoSlide(communitySlides, 4000);
  const { currentIndex: heroIdx, goTo: goToHero } = useAutoSlide(heroSlides, 4200);
  const { currentIndex: requesterIdx, goTo: goToRequester } = useAutoSlide(requesterSlides, 4600);

  // For Active Cases we want the slides to be the categories, but also include a "summary" slide.
  // We'll build slides based on activeCaseCategories.
  const activeSlides = activeCaseCategories.length > 0
    ? [
        { icon: <Bell className="w-6 h-6" />, text: `${activeCases.length} Active Cases`, desc: "Tap to help now" },
        ...activeCaseCategories.map(cat => {
          const style = ROLE_CATEGORY_STYLES[cat.category] || { icon: FileText, color: "text-primary", bg: "bg-primary/10" };
          const Icon = style.icon;
          return {
            icon: <Icon className="w-6 h-6" />,
            text: cat.category,
            desc: `${cat.count} case${cat.count === 1 ? "" : "s"}`,
          };
        })
      ]
    : [
        { icon: <Bell className="w-6 h-6" />, text: "No active cases", desc: "Check back soon" }
      ];

  const { currentIndex: activeIdx, goTo: goToActive } = useAutoSlide(activeSlides, 3500);

  // Handle role selection (unchanged)
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

  // Render a slide box with dots
  const renderSlideBox = (
    slides: any[],
    currentIdx: number,
    onDotClick: (idx: number) => void,
    theme: typeof BOX_THEMES.community,
    title: string,
    subtitle: string,
    icon: React.ReactNode,
    onClick?: () => void,
    extraBadge?: React.ReactNode,
    footerAction?: React.ReactNode,
  ) => {
    const currentSlide = slides[currentIdx] || slides[0];
    return (
      <div
        className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-3xl border ${theme.borderColor} bg-card/80 backdrop-blur-sm p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:${theme.shadowColor} hover:shadow-lg hover:${theme.hoverBorder} md:p-7 cursor-pointer`}
        onClick={onClick}
      >
        {/* Glow effect */}
        <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full ${theme.bgGlow} opacity-30 group-hover:opacity-50 transition-opacity blur-2xl pointer-events-none`} />
        
        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Icon with background */}
          <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${theme.iconBg} ${theme.iconColor} transition-transform group-hover:scale-105`}>
            {icon}
          </div>

          {/* Slide content */}
          <div className="flex flex-col items-center transition-opacity duration-300">
            <div className="mb-1">{currentSlide.icon}</div>
            <span className="text-base font-bold text-foreground md:text-xl">{currentSlide.text}</span>
            <span className="mt-1 text-xs text-muted-foreground md:text-sm">{currentSlide.desc}</span>
          </div>

          {/* Extra badge (for active cases count) */}
          {extraBadge && (
            <div className="mt-2">{extraBadge}</div>
          )}

          {/* Dots indicator */}
          {slides.length > 1 && (
            <div className="flex gap-1.5 mt-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${idx === currentIdx ? `w-4 ${theme.dotColor}` : "bg-muted-foreground/30"}`}
                  onClick={(e) => { e.stopPropagation(); onDotClick(idx); }}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Footer action (like "Join" or "Submit") */}
          {footerAction && (
            <div className="mt-3 text-xs font-medium text-muted-foreground flex items-center gap-1">
              {footerAction}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-12">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-foreground">
              Givethra
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Real People.
              <br className="sm:hidden" />
              <span className="text-primary">
                {" "}Real Needs. Real Help.
              </span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A trusted platform where real people with genuine
              needs get support from kind-hearted Heroes.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            How are you today?
          </p>
        </div>

        {/* 4-Box Grid */}
        <div className="grid grid-cols-2 gap-3 md:gap-5">

          {/* 1. Community */}
          <Link
            to="/community"
            className="block"
          >
            {renderSlideBox(
              communitySlides,
              communityIdx,
              goToCommunity,
              BOX_THEMES.community,
              "Community",
              "Connect & Share",
              <Users className="h-7 w-7" />,
              undefined,
              undefined,
              <span className="flex items-center gap-1"><UsersIcon className="w-3 h-3" /> Guest available</span>
            )}
          </Link>

          {/* 2. Active Cases */}
          <button
            type="button"
            onClick={() => handleRoleSelect("hero")}
            className="block w-full"
          >
            {renderSlideBox(
              activeSlides,
              activeIdx,
              goToActive,
              BOX_THEMES.active,
              "Active Cases",
              "Help Now",
              <Bell className="h-7 w-7" />,
              undefined,
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 px-2 py-0.5 rounded-full">
                {activeCases.length} active
              </span>,
              <span className="flex items-center gap-1"><Bell className="w-3 h-3" /> auto-slides</span>
            )}
          </button>

          {/* 3. Become a Hero */}
          <button
            type="button"
            onClick={() => handleRoleSelect("hero")}
            className="block w-full"
          >
            {renderSlideBox(
              heroSlides,
              heroIdx,
              goToHero,
              BOX_THEMES.hero,
              "Become a Hero",
              "Support someone",
              <Heart className="h-7 w-7" />,
              undefined,
              undefined,
              <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> 3 free contributions</span>
            )}
          </button>

          {/* 4. Requester */}
          <button
            type="button"
            onClick={() => handleRoleSelect("requester")}
            className="block w-full"
          >
            {renderSlideBox(
              requesterSlides,
              requesterIdx,
              goToRequester,
              BOX_THEMES.requester,
              "Requester",
              "Submit a request",
              <HandHelping className="h-7 w-7" />,
              undefined,
              undefined,
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> KYC verified</span>
            )}
          </button>

        </div>

        {/* Public Impact Walls */}
        <section className="space-y-8 bg-background py-8" aria-label="Community impact walls">
          <HeroesWall />
          <KindnessWall />
        </section>

        {/* Android App Download */}
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
              <a href="https://www.facebook.com/profile.php?id=61590715263595" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/givethra.community" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/givethra-org/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Channel" className="h-11 w-11 rounded-full bg-muted hover:bg-green-600 hover:text-white flex items-center justify-center text-muted-foreground transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="mailto:info@givethra.org" aria-label="Email" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <a href="https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:underline">
              <MessageCircle className="h-4 w-4" />
              Follow our WhatsApp Channel
            </a>
            <div>
              <a href="mailto:info@givethra.org" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <Mail className="h-4 w-4" />
                info@givethra.org
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

// Missing imports for icons used in slides
import { Lock, Gift } from "lucide-react";
