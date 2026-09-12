// src/frontend/src/pages/RoleSelectionPage.tsx
// Givethra - Full-Color Auto-Slide Boxes
// Requester button → NeedHelpPage after KYC approval

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
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getApprovedCases } from "@/lib/api";

const COMMUNITY_SLIDES = [
  { icon: <Users className="w-8 h-8" />, title: "Welcome Givethra Home", desc: "Connect with people who care" },
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

const ROLE_CATEGORY_STYLES: Record<string, { icon: typeof Battery }> = {
  "Electricity Bill": { icon: Battery },
  "Gas Bill": { icon: Flame },
  "Water Bill": { icon: Droplets },
  "School Fees": { icon: GraduationCap },
  "Medical & Treatment": { icon: Stethoscope },
  "Business / Work Help": { icon: ShoppingCart },
};

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61590715263595";
const INSTAGRAM_URL = "https://www.instagram.com/givethra.community";
const LINKEDIN_URL = "https://www.linkedin.com/company/givethra-org/";
const WHATSAPP_URL = "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";
const SUPPORT_WHATSAPP_URL = "https://wa.me/message/42CJXLUYEI2KM1?src=qr";
const CONTACT_EMAIL = "info@givethra.org";


function SignInLandingPage({ onSignIn, isLoggingIn, loginError }: { onSignIn: () => void; isLoggingIn: boolean; loginError: string | null }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-10">
        <section className="rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-teal-50 p-8 text-center shadow-sm md:p-14">
          <div className="mx-auto h-24 w-24 overflow-hidden rounded-3xl border-4 border-white shadow-xl ring-4 ring-primary/15"><img src="/assets/givethra-google-logo.png" alt="Givethra G+ logo" className="h-full w-full object-cover" /></div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary">Givethra</p>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-foreground md:text-6xl">
            Verified Help.<br />
            <span className="text-primary">Real Impact.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Real people. Genuine needs. Secure, verified support from a global community.
            Sign in once, complete your identity verification, and choose how you want to participate.
          </p>
          <button
            type="button"
            onClick={onSignIn}
            disabled={isLoggingIn}
            className="mt-8 inline-flex h-12 min-w-56 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-bold text-primary-foreground shadow-lg transition hover:bg-primary/90 active:scale-[.98] disabled:cursor-wait disabled:opacity-70"
          >
            {isLoggingIn && <Loader2 className="h-5 w-5 animate-spin" />}
            {isLoggingIn ? "Connecting securely…" : "Sign in with Google"}
          </button>
          <div id="google-account-chooser-fallback" className="mx-auto hidden min-h-11 max-w-sm justify-center" aria-live="polite" />
          {loginError && (
            <p role="alert" className="mx-auto mt-4 max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {loginError}
            </p>
          )}
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium text-primary">Support verified people, earn through your own posts after eligibility, and manage your separate Earnings Wallet.</p>
        </section>
        <section className="grid gap-4 sm:grid-cols-4" aria-label="Givethra trust principles">
          {[
            ["Verified", "Identity and cases are reviewed."],
            ["Secure", "Private documents stay protected."],
            ["Compassion", "Support reaches genuine needs."],
            ["Connected", "A global community helps together."],
          ].map(([title, description]) => (
            <div key={title} className="rounded-2xl border bg-card p-5 text-center shadow-sm">
              <ShieldCheck className="mx-auto h-6 w-6 text-primary" />
              <h2 className="mt-3 font-bold text-foreground">{title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </section>
        <footer className="flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
          <Link to="/about">About</Link><Link to="/faq">FAQ</Link><Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link><Link to="/community-guidelines">Community Guidelines</Link><Link to="/contact">Contact</Link>
        </footer>
      </div>
    </div>
  );
}

export default function RoleSelectionPage() {
  const { isAuthenticated, loginWithGoogle, isLoggingIn, loginError, role: authRole, setRole: setAuthRole } = useAuth();
  const { role, setRole } = useRole();
  const navigate = useNavigate();

  const [activeCases, setActiveCases] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) void navigate({ to: "/home" });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    getApprovedCases()
      .then((rows) => setActiveCases(Array.isArray(rows) ? rows : []))
      .catch(() => setActiveCases([]));
  }, []);

  const activeCaseCategories = Object.entries(
    activeCases.reduce<Record<string, number>>((counts, c) => {
      const cat = String(c?.category || "Other");
      counts[cat] = (counts[cat] || 0) + 1;
      return counts;
    }, {})
  ).map(([category, count]) => ({ category, count }));

  const activeSlides =
    activeCaseCategories.length > 0
      ? [
          { icon: <Bell className="w-8 h-8" />, title: `${activeCases.length} Active Cases`, desc: "Tap to help now" },
          ...activeCaseCategories.map((cat) => {
            const style = ROLE_CATEGORY_STYLES[cat.category] || { icon: FileText };
            const Icon = style.icon;
            return { icon: <Icon className="w-8 h-8" />, title: cat.category, desc: `${cat.count} case${cat.count === 1 ? "" : "s"}` };
          }),
        ]
      : [{ icon: <Bell className="w-8 h-8" />, title: "No active cases", desc: "Check back soon" }];
  const roleHubSlides = [...activeSlides, ...COMMUNITY_SLIDES, ...HERO_SLIDES, ...REQUESTER_SLIDES];

  const [communityIndex, setCommunityIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [requesterIndex, setRequesterIndex] = useState(0);
  const roleHubSliderRef = useRef<HTMLDivElement>(null);
  const [roleHubSlideIndex, setRoleHubSlideIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCommunityIndex(p => (p + 1) % COMMUNITY_SLIDES.length), 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeSlides.length === 0) return;
    const interval = setInterval(() => setActiveIndex(p => (p + 1) % activeSlides.length), 3500);
    return () => clearInterval(interval);
  }, [activeSlides.length]);

  useEffect(() => {
    const interval = setInterval(() => setHeroIndex(p => (p + 1) % HERO_SLIDES.length), 4200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setRequesterIndex(p => (p + 1) % REQUESTER_SLIDES.length), 4600);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      setRoleHubSlideIndex((previous) => {
        const next = (previous + 1) % roleHubSlides.length;
        const slider = roleHubSliderRef.current;
        const slide = slider?.children[next] as HTMLElement | undefined;
        // Move only the horizontal carousel. scrollIntoView() also changes the
        // document's vertical scroll position when the user is reading a wall.
        if (slider && slide) slider.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [roleHubSlides.length]);

  // Requester always opens Need Help first; that page owns sign-in and KYC handoff.
  const handleRequesterClick = () => {
    setRole("requester");
    setAuthRole("help_seeker");
    window.scrollTo({ top: 0, behavior: "auto" });
    navigate({ to: "/need-help" });
  };

  const handleCommunityClick = () => {
    const nextRole = role || (authRole === "hero" ? "hero" : "requester");
    setRole(nextRole);
    setAuthRole(nextRole === "hero" ? "hero" : "help_seeker");
    window.scrollTo({ top: 0, behavior: "auto" });
    void navigate({ to: "/home" });
  };

  const handleHeroClick = () => {
    setRole("hero");
    setAuthRole("hero");
    window.scrollTo({ top: 0, behavior: "auto" });
    navigate({ to: "/become-hero" });
  };

  // Never flash the former role hub after authentication; the authenticated
  // destination is the Home page only.
  if (isAuthenticated) return <div className="min-h-screen bg-background" aria-label="Opening Givethra Home" />;

  if (!isAuthenticated) {
    return <SignInLandingPage onSignIn={loginWithGoogle} isLoggingIn={isLoggingIn} loginError={loginError} />;
  }

  const SlideContent = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
    <div className="flex flex-col items-center justify-center w-full h-full text-white">
      <div className="mb-2">{icon}</div>
      <span className="text-lg font-bold md:text-xl drop-shadow-md">{title}</span>
      <span className="mt-0.5 text-sm text-white/90 md:text-base drop-shadow-md">{desc}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-12">
        <div className="space-y-4">
          <div ref={roleHubSliderRef} data-slide-index={roleHubSlideIndex} className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl scrollbar-hide" aria-label="Givethra highlights">
            {roleHubSlides.map((slide, index) => (
              <div key={`${slide.title}-${index}`} role={slide.title === "Welcome Givethra Home" ? "button" : undefined} tabIndex={slide.title === "Welcome Givethra Home" ? 0 : undefined} onClick={slide.title === "Welcome Givethra Home" ? handleCommunityClick : undefined} onKeyDown={slide.title === "Welcome Givethra Home" ? (event) => { if (event.key === "Enter" || event.key === " ") handleCommunityClick(); } : undefined} className={`min-w-full snap-center rounded-3xl bg-gradient-to-br from-primary/10 via-card to-teal-50 px-6 py-8 text-center shadow-sm ${slide.title === "Welcome Givethra Home" ? "cursor-pointer hover:ring-2 hover:ring-primary/30" : ""}`}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">{slide.icon}</div>
                <h1 className="mt-3 text-2xl font-bold text-foreground md:text-3xl">{slide.title}</h1>
                <p className="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">{slide.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">How are you today?</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-5">
          <button
            type="button"
            onClick={handleCommunityClick}
            className="group flex items-center justify-center rounded-3xl bg-teal-600 p-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-teal-700 aspect-square"
          >
            <SlideContent
              icon={COMMUNITY_SLIDES[communityIndex].icon}
              title={COMMUNITY_SLIDES[communityIndex].title}
              desc={COMMUNITY_SLIDES[communityIndex].desc}
            />
          </button>

          {/* Active cases counter — informational only */}
          <div
            className="group flex items-center justify-center rounded-3xl bg-rose-600 p-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-rose-700 aspect-square"
          >
            {activeSlides.length > 0 && (
              <SlideContent
                icon={activeSlides[activeIndex].icon}
                title={activeSlides[activeIndex].title}
                desc={activeSlides[activeIndex].desc}
              />
            )}
          </div>

          {/* Hero button 2 – hero slides */}
          <button
            type="button"
            onClick={handleHeroClick}
            className="group flex items-center justify-center rounded-3xl bg-amber-500 p-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-amber-600 aspect-square"
          >
            <SlideContent
              icon={HERO_SLIDES[heroIndex].icon}
              title={HERO_SLIDES[heroIndex].title}
              desc={HERO_SLIDES[heroIndex].desc}
            />
          </button>

          {/* Requester button */}
          <button
            type="button"
            onClick={handleRequesterClick}
            className="group flex items-center justify-center rounded-3xl bg-blue-600 p-4 shadow-md transition-all hover:scale-[1.02] hover:shadow-xl dark:bg-blue-700 aspect-square"
          >
            <SlideContent
              icon={REQUESTER_SLIDES[requesterIndex].icon}
              title={REQUESTER_SLIDES[requesterIndex].title}
              desc={REQUESTER_SLIDES[requesterIndex].desc}
            />
          </button>
        </div>

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
              <p className="text-sm text-muted-foreground mt-1">Verified cases, anytime — right on your phone.</p>
            </div>
            <a
              href="/Givethra.apk"
              download="Givethra.apk"
              type="application/vnd.android.package-archive"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            >
              <Download className="h-4 w-4" /> Download App
            </a>
          </div>
        </section>

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

        <section className="py-10 px-4 bg-card border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-foreground">Connect with Givethra</h2>
              <p className="text-sm text-muted-foreground">Follow us and reach out — we're here to help.</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Support" className="h-11 w-11 rounded-full bg-muted hover:bg-green-600 hover:text-white flex items-center justify-center text-muted-foreground transition-colors"><MessageCircle className="h-5 w-5" /></a>
              <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
            <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:underline"><MessageCircle className="h-4 w-4" /> Get WhatsApp Support 24/7</a>
            <div>
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><Mail className="h-4 w-4" /> {CONTACT_EMAIL}</a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 border-t border-border text-sm text-muted-foreground">
              <Link to="/about">About</Link>
              <Link to="/faq">FAQ</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/community-guidelines">Community Guidelines</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
            <p className="text-xs text-muted-foreground pt-1">© {new Date().getFullYear()} Givethra. All rights reserved.</p>
          </div>
        </section>

        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>"Be the reason someone believes in kindness."</p>
          <p className="mt-2">givethra.org</p>
        </div>
      </div>
    </div>
  );
}
