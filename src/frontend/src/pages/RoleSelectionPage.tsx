// src/frontend/src/pages/RoleSelectionPage.tsx
// Givethra - Full-Color Auto-Slide Boxes (No Extra Icons, No Dots)

import HeroesWall from "@/components/HeroesWall";
import KindnessWall from "@/components/KindnessWall";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  Globe,
  Sparkles,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Download,
  Smartphone,
  // Icons for slides (only used inside slides)
  Users,
  Share2,
  HeartHandshake,
  ThumbsUp,
  Users as UsersIcon,
  Star,
  UserPlus,
  Lock,
  Heart,
  Gift,
  CheckCircle,
  Target,
  FileText,
  HandHelping,
  BookOpen,
  Bell,
  Battery,
  Flame,
  Droplets,
  GraduationCap,
  Stethoscope,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getApprovedCases, getKycStatus } from "@/lib/api";

// ---------- Slide data with icons (only these appear inside boxes) ----------
const COMMUNITY_SLIDES = [
  { icon: <Users className="w-8 h-8" />, title: "Community", desc: "Connect with people who care" },
  { icon: <Share2 className="w-8 h-8" />, title: "Connect & Share", desc: "Share your story, find support" },
  { icon: <HeartHandshake className="w-8 h-8" />, title: "Support Others", desc: "Every kind word matters" },
  { icon: <ThumbsUp className="w-8 h-8" />, title: "Like • Comment • Share", desc: "Engage with the community" },
  { icon: <UsersIcon className="w-8 h-8" />, title: "Build Your Community", desc: "Grow together, thrive together" },
];

const HERO_SLIDES = [
  { icon: <Star className="w-8 h-8" />, title: "Hero", desc: "You can change a life today" },
  { icon: <UserPlus className="w-8 h-8" />, title: "Become a Hero", desc: "Step up and make a difference" },
  { icon: <Lock className="w-8 h-8" />, title: "Unlock a Case", desc: "Choose a case to support" },
  { icon: <Heart className="w-8 h-8" />, title: "Contribute & Help", desc: "Your contribution counts" },
  { icon: <Gift className="w-8 h-8" />, title: "3 Free Contributions", desc: "Welcome offer — try it now" },
  { icon: <CheckCircle className="w-8 h-8" />, title: "Help Verified People", desc: "Support those who need it most" },
  { icon: <Target className="w-8 h-8" />, title: "Make a Real Impact", desc: "Be the change you want to see" },
];

const REQUESTER_SLIDES = [
  { icon: <FileText className="w-8 h-8" />, title: "Requester", desc: "Get the help you deserve" },
  { icon: <HandHelping className="w-8 h-8" />, title: "Request Help", desc: "Reach out with confidence" },
  { icon: <BookOpen className="w-8 h-8" />, title: "Submit Your Case", desc: "Tell us your story" },
  { icon: <ShieldCheck className="w-8 h-8" />, title: "Complete KYC", desc: "Secure & private verification" },
  { icon: <CheckCircle className="w-8 h-8" />, title: "Get Verified", desc: "Build trust in the community" },
  { icon: <Heart className="w-8 h-8" />, title: "Receive Verified Help", desc: "Support from real people" },
];

// Category styles for Active Cases (to get icons)
const ROLE_CATEGORY_STYLES: Record<
  string,
  { icon: typeof Battery }
> = {
  "Electricity Bill": { icon: Battery },
  "Gas Bill": { icon: Flame },
  "Water Bill": { icon: Droplets },
  "School Fees": { icon: GraduationCap },
  "Medical & Treatment": { icon: Stethoscope },
  "Business / Work Help": { icon: ShoppingCart },
};

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

  // Active slides: first a summary, then each category with icon
  const activeSlides =
    activeCaseCategories.length > 0
      ? [
          { icon: <Bell className="w-8 h-8" />, title: `${activeCases.length} Active Cases`, desc: "Tap to help now" },
          ...activeCaseCategories.map((cat) => {
            const style = ROLE_CATEGORY_STYLES[cat.category] || { icon: FileText };
            const Icon = style.icon;
            return {
              icon: <Icon className="w-8 h-8" />,
              title: cat.category,
              desc: `${cat.count} case${cat.count === 1 ? "" : "s"}`,
            };
          }),
        ]
      : [{ icon: <Bell className="w-8 h-8" />, title: "No active cases", desc: "Check back soon" }];

  // ---------- Auto-slide state for each box ----------
  const [communityIndex, setCommunityIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [requesterIndex, setRequesterIndex] = useState(0);

  // Auto-slide effects (no dots anywhere)
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

  // ---------- 🔥 Role selection handler (UPDATED) ----------
  const handleRoleSelect = async (role: "hero" | "requester") => {
    setRole(role);
    setAuthRole(role === "requester" ? "help_seeker" : "hero");

    if (!isAuthenticated) {
      // Not signed in -> go to sign-in with redirect
      navigate({
        to: "/sign-in",
        search: {
          role,
          redirect: role === "requester" ? "/submit-request" : "/cases",
        },
      });
      return;
    }

    // User is signed in
    if (role === "requester") {
      try {
        const kyc = await getKycStatus(user!.id);
        const status = String(kyc?.status || "none").trim().toLowerCase();
        if (status === "approved") {
          // ✅ KYC approved -> go to new submit wizard
          navigate({ to: "/submit-request" });
        } else {
          // KYC pending or rejected -> go to KYC page
          navigate({ to: "/kyc" });
        }
      } catch (error) {
        console.error("KYC status check failed:", error);
        navigate({ to: "/kyc" });
      }
    } else {
      // Hero -> go to Active Cases
      navigate({ to: "/cases" });
    }
  };

  // ---------- Render a slide (icon + title + desc, centered) ----------
  const SlideContent = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div className="flex flex-col items-center justify-center w-full h-full text-white">
      <div className="mb-2">{icon}</div>
      <span className="text-lg font-bold md:text-xl drop-shadow-md">{title}</span>
      <span className="mt-0.5 text-sm text-white/90 md:text-base drop-shadow-md">{desc}</span>
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
              Verified Help.
              <br className="sm:hidden" />
              <span className="text-primary"> Real Impact.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A trusted platform where real people with genuine needs get support
              from kind-hearted Heroes.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">How are you today?</p>
        </div>

        {/* 4‑Box Grid - Full Color, only slides, no extra icons, no dots */}
        <div className="grid grid-cols-2 gap-3 md:gap-5">
          {/* ---------- Community (Teal) ---------- */}
          <Link
            to="/community"
            className="group flex items-center justify-center rounded-3xl bg-teal-600 p-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-teal-700 aspect-square"
          >
            <SlideContent
              icon={COMMUNITY_SLIDES[communityIndex].icon}
              title={COMMUNITY_SLIDES[communityIndex].title}
              desc={COMMUNITY_SLIDES[communityIndex].desc}
            />
          </Link>

          {/* ---------- Active Cases (Coral/Red) ---------- */}
          <button
            type="button"
            onClick={() => handleRoleSelect("hero")}
            className="group flex items-center justify-center rounded-3xl bg-rose-600 p-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-rose-700 aspect-square"
          >
            {activeSlides.length > 0 && (
              <SlideContent
                icon={activeSlides[activeIndex].icon}
                title={activeSlides[activeIndex].title}
                desc={activeSlides[activeIndex].desc}
              />
            )}
          </button>

          {/* ---------- Become a Hero (Gold/Amber) ---------- */}
          <button
            type="button"
            onClick={() => handleRoleSelect("hero")}
            className="group flex items-center justify-center rounded-3xl bg-amber-500 p-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-amber-600 aspect-square"
          >
            <SlideContent
              icon={HERO_SLIDES[heroIndex].icon}
              title={HERO_SLIDES[heroIndex].title}
              desc={HERO_SLIDES[heroIndex].desc}
            />
          </button>

          {/* ---------- Requester (Blue) ---------- */}
          <button
            type="button"
            onClick={() => handleRoleSelect("requester")}
            className="group flex items-center justify-center rounded-3xl bg-blue-600 p-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-blue-700 aspect-square"
          >
            <SlideContent
              icon={REQUESTER_SLIDES[requesterIndex].icon}
              title={REQUESTER_SLIDES[requesterIndex].title}
              desc={REQUESTER_SLIDES[requesterIndex].desc}
            />
          </button>
        </div>

        {/* Rest of the page (unchanged) */}
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
            <span className="h-5 w-5 text-primary">❤️</span>
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
