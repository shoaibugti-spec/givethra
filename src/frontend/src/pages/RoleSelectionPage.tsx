// src/frontend/src/pages/RoleSelectionPage.tsx
// Givethra - Role Selection Landing Page
// Only English, no Urdu

import { Button } from "@/components/ui/button";
import HeroesWall from "@/components/HeroesWall";
import KindnessWall from "@/components/KindnessWall";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, HandHelping, ShieldCheck, Users, Globe, Sparkles, Facebook, Instagram, Linkedin, Mail, MessageCircle, Bell, Battery, Flame, Droplets, GraduationCap, Stethoscope, ShoppingCart, FileText } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { getApprovedCases } from "@/lib/api";

const ROLE_CATEGORY_STYLES: Record<string, { icon: typeof Battery; color: string; bg: string }> = {
  "Electricity Bill": { icon: Battery, color: "text-amber-600", bg: "bg-amber-500/10" },
  "Gas Bill": { icon: Flame, color: "text-orange-600", bg: "bg-orange-500/10" },
  "Water Bill": { icon: Droplets, color: "text-sky-600", bg: "bg-sky-500/10" },
  "School Fees": { icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-500/10" },
  "Medical & Treatment": { icon: Stethoscope, color: "text-rose-600", bg: "bg-rose-500/10" },
  "Business / Work Help": { icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-500/10" },
};

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
  const [activeCaseSlide, setActiveCaseSlide] = useState(-1);

  useEffect(() => {
    getApprovedCases().then((rows) => setActiveCases(Array.isArray(rows) ? rows : [])).catch(() => setActiveCases([]));
  }, []);

  const activeCaseCategories = Object.entries(activeCases.reduce<Record<string, number>>((counts, currentCase) => {
    const category = String(currentCase?.category || "Other");
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {})).map(([category, count]) => ({ category, count }));
  const activeCaseSlideData = activeCaseSlide >= 0 ? activeCaseCategories[activeCaseSlide] : null;

  useEffect(() => {
    setActiveCaseSlide(-1);
    if (activeCaseCategories.length === 0) return;
    const timer = setInterval(() => setActiveCaseSlide((previous) => previous >= activeCaseCategories.length - 1 ? -1 : previous + 1), 3500);
    return () => clearInterval(timer);
  }, [activeCases.length, activeCaseCategories.length]);

  // 🔥 FIXED: Role selection with proper redirects
  const handleRoleSelect = async (role: "hero" | "requester") => {
    setRole(role);
    setAuthRole(role === "requester" ? "help_seeker" : "hero");
    
    if (!isAuthenticated) {
      // If not authenticated, go to sign-in with role and redirect info
      navigate({ 
        to: "/sign-in", 
        search: { 
          role, 
          redirect: role === "requester" ? "/kyc" : "/home" 
        } 
      });
    } else {
      // Already authenticated - go directly
      if (role === "requester") {
        navigate({ to: "/kyc" }); // 🔥 Requester → KYC page immediately
      } else {
        navigate({ to: "/home" }); // 🔥 Hero → Home page (no KYC needed)
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full space-y-12">
        {/* Header with stats */}
        <div className="text-center space-y-4">
          {/* ✅ Logo: صرف "Givethra" سادہ متن */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-foreground">Givethra</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Real People. <br className="sm:hidden" />
              <span className="text-primary">Real Needs. Real Help.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A trusted platform where real people with genuine needs get support from kind-hearted Heroes.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">How are you today?</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-5">
          <Link to="/community" className="group flex aspect-square flex-col items-center justify-center rounded-3xl border border-primary/15 bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg md:p-7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-105 md:h-16 md:w-16"><Users className="h-7 w-7 md:h-8 md:w-8" /></div>
            <span className="text-base font-bold text-foreground md:text-xl">Community</span>
            <span className="mt-1 text-xs text-muted-foreground md:text-sm">My Heroes · Share & Discuss</span>
          </Link>
          <button type="button" onClick={() => { if (!activeCases.length) return; if (!isAuthenticated) { navigate({ to: "/sign-in", search: { role: "hero", redirect: "/home" } }); return; } setRole("hero"); setAuthRole("hero"); navigate({ to: "/home" }); }} className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-3xl border border-rose-200/70 bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-lg md:p-7 dark:border-rose-900/50">
            {activeCaseSlideData ? (() => { const style = ROLE_CATEGORY_STYLES[activeCaseSlideData.category] || { icon: FileText, color: "text-primary", bg: "bg-primary/10" }; const Icon = style.icon; return <><div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${style.bg} ${style.color}`}><Icon className="h-7 w-7 md:h-8 md:w-8" /></div><span className="max-w-full truncate text-base font-bold text-foreground md:text-xl">{activeCaseSlideData.category}</span><span className="mt-1 text-xs text-muted-foreground md:text-sm">{activeCaseSlideData.count} active case{activeCaseSlideData.count === 1 ? "" : "s"}</span></>; })() : <><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600"><Bell className="h-7 w-7 md:h-8 md:w-8" /></div><span className="text-base font-bold text-foreground md:text-xl">{activeCases.length} Active Cases</span><span className="mt-1 text-xs text-muted-foreground md:text-sm">{activeCases.length ? "Tap to help now" : "No active needs right now"}</span></>}
          </button>
          <button type="button" onClick={() => handleRoleSelect("hero")} className="group flex aspect-square flex-col items-center justify-center rounded-3xl border border-emerald-200/70 bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg md:p-7 dark:border-emerald-900/50">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-105 md:h-16 md:w-16"><Heart className="h-7 w-7 md:h-8 md:w-8" /></div>
            <span className="text-base font-bold text-foreground md:text-xl">Become a Hero</span>
            <span className="mt-1 text-xs text-muted-foreground md:text-sm">Support someone</span>
          </button>
          <button type="button" onClick={() => handleRoleSelect("requester")} className="group flex aspect-square flex-col items-center justify-center rounded-3xl border border-amber-200/70 bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg md:p-7 dark:border-amber-900/50">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-105 md:h-16 md:w-16"><HandHelping className="h-7 w-7 md:h-8 md:w-8" /></div>
            <span className="text-base font-bold text-foreground md:text-xl">Requester</span>
            <span className="mt-1 text-xs text-muted-foreground md:text-sm">Submit a request</span>
          </button>
        </div>

        {/* Public impact walls: available to guests and signed-in users */}
        <section className="space-y-8 bg-background py-8" aria-label="Community impact walls">
          <HeroesWall />
          <KindnessWall />
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

        {/* Footer Section */}
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
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Channel" className="h-11 w-11 rounded-full bg-muted hover:bg-green-600 hover:text-white flex items-center justify-center text-muted-foreground transition-colors"><MessageCircle className="h-5 w-5" /></a>
              <a href={`mailto:${CONTACT_EMAIL}`} aria-label="Email" className="h-11 w-11 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center text-muted-foreground transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:underline"><MessageCircle className="h-4 w-4" /> Follow our WhatsApp Channel</a>
            <div><a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><Mail className="h-4 w-4" /> {CONTACT_EMAIL}</a></div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 border-t border-border text-sm text-muted-foreground">
              <Link to="/about">About</Link><Link to="/faq">FAQ</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms</Link><Link to="/community-guidelines">Community Guidelines</Link><Link to="/contact">Contact Us</Link>
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
