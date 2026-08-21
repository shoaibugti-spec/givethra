// src/frontend/src/pages/HomePage.tsx
// Replaces Supabase with Cloudflare Worker APIs

import InstallButton from "@/components/InstallButton";
import { CATEGORY_EMOJI } from "@/components/CategoryPill";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import FeedbackWall from "@/components/FeedbackWall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { runUserGuide } from "@/lib/userGuide";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Building2,
  MailCheck,
  Phone,
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Bell,
  Heart,
  FileText,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  Gift,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  getApprovedCases,
  getCategoryCounts,
  getKycStatus,
  getWallet,
  getUnlockCount,
  getUnreadNotificationsCount,
} from "@/lib/api";

const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61590715263595";
const INSTAGRAM_URL = "https://www.instagram.com/givethra.community";
const WHATSAPP_URL =
  "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";
const CONTACT_EMAIL = "info@givethra.org";

// ====== ANNOUNCEMENT ======
const ANNOUNCEMENT =
  "🎉 Big Offer for Everyone! Complete your KYC and submit your FIRST CASE completely FREE — no fee! After review & approval, Heroes will help you. Start now at givethra.org 🤲   •   🎉 Heroes: Your first 3 helps are FREE! After that, 1 credit per help. Become a Hero and change lives today.";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  PKR: "Rs",
  SAR: "SAR",
  AED: "AED",
  GBP: "£",
  EUR: "€",
  INR: "₹",
  TRY: "₺",
  BDT: "৳",
  EGP: "E£",
  NGN: "₦",
  KES: "KSh",
  ZAR: "R",
  BRL: "R$",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  IDR: "Rp",
  MYR: "RM",
  THB: "฿",
  PHP: "₱",
  VND: "₫",
  SGD: "S$",
  AFN: "؋",
  NPR: "Rs",
  LKR: "Rs",
  QAR: "QAR",
  KWD: "KWD",
  BHD: "BHD",
  OMR: "OMR",
  JOD: "JOD",
  MAD: "MAD",
};

function sym(cur?: string) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}

const FILTER_CATEGORIES = [
  "Electricity Bill",
  "Gas Bill",
  "Water Bill",
  "House Rent",
  "School Fees",
  "Education & Books",
  "Medical & Treatment",
  "Medicines",
  "Food & Groceries",
  "Child Support",
  "Widow & Elderly Support",
  "Disability Support",
  "Marriage Support",
  "Business / Work Help",
  "Home Repair",
  "Funeral Expenses",
  "Livestock / Farming",
  "Debt Relief",
  "Emergency Help",
  "Other",
];

const CATEGORY_APPEAL: Record<string, string> = {
  "Electricity Bill": "Help bring light back to a home 💡",
  "Gas Bill": "Help light a family's stove again 🔥",
  "Water Bill": "Help restore clean water to a home 💧",
  "House Rent": "Help keep a roof over a family's head 🏠",
  "School Fees": "Help a child stay in school 📚",
  "Education & Books": "Help a student keep learning 📖",
  "Medical & Treatment": "Help save a life through treatment 🏥",
  "Medicines": "Help a patient get their medicine 💊",
  "Food & Groceries": "Help fill an empty plate 🍚",
  "Child Support": "Help brighten a child's future 👶",
  "Widow & Elderly Support": "Be a support for a widow or elder 🤲",
  "Disability Support": "Help someone live with dignity ♿",
  "Marriage Support": "Help a family celebrate with dignity 💍",
  "Business / Work Help": "Help someone stand on their feet 🛒",
  "Home Repair": "Help rebuild a safe home 🏚️",
  "Funeral Expenses": "Help a family in their hardest hour 🤲",
  "Livestock / Farming": "Help a farmer earn a living 🐄",
  "Debt Relief": "Help free someone from debt's burden 🙏",
  "Emergency Help": "Help someone in an urgent crisis 🚨",
  "Other": "Be someone's hope today 🤲",
};

const URGENCIES = ["Low", "Medium", "High", "Emergency"];

const TRUST_BADGES = [
  { icon: MailCheck, label: "Email Verified", color: "text-emerald-600" },
  { icon: Phone, label: "Mobile Verified", color: "text-blue-600" },
  { icon: BadgeCheck, label: "Identity Verified", color: "text-violet-600" },
  { icon: Building2, label: "Institution Verified", color: "text-orange-600" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);

  const [kycStatus, setKycStatus] = useState<string>("none");
  const [balance, setBalance] = useState(0);
  const [unlockCount, setUnlockCount] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load cases on mount
  useEffect(() => {
    loadCases();
    loadCategoryCounts();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`
            );
            const data = await res.json();
            if (data?.countryName) setDetectedCountry(data.countryName);
            if (data?.city || data?.locality)
              setDetectedCity(data.city || data.locality);
          } catch {}
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, []);

  // Load user-specific data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      runUserGuide(user.id);
      loadNotifCount();
      loadGuideStatus();
      loadUnlockCount();

      // Poll for notifications every 20 seconds
      const interval = setInterval(loadNotifCount, 20000);

      // Refresh cases periodically
      const caseInterval = setInterval(loadCases, 60000);

      return () => {
        clearInterval(interval);
        clearInterval(caseInterval);
      };
    }
  }, [isAuthenticated, user]);

  async function loadNotifCount() {
    if (!user?.id) return;
    try {
      const count = await getUnreadNotificationsCount(user.id);
      setNotifCount(count ?? 0);
    } catch {
      // ignore
    }
  }

  async function loadGuideStatus() {
    if (!user?.id) return;
    try {
      const kyc = await getKycStatus(user.id);
      setKycStatus(kyc?.status ?? "none");
      const wallet = await getWallet(user.id);
      setBalance(wallet?.balance ?? 0);
    } catch {
      // ignore
    }
  }

  async function loadUnlockCount() {
    if (!user?.id) return;
    try {
      const count = await getUnlockCount(user.id);
      setUnlockCount(count ?? 0);
    } catch {
      // ignore
    }
  }

  async function loadCases() {
    setLoading(true);
    try {
      const data = await getApprovedCases();
      setCases(data ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function loadCategoryCounts() {
    try {
      const counts = await getCategoryCounts();
      setCategoryCounts(counts ?? {});
    } catch {
      // ignore
    }
  }

  // ====== SLIDE DEFINITIONS ======
  const HAND_SLIDE = {
    key: "hero",
    type: "image" as const,
    image: "/assets/generated/hero-givethra.dim_1200x500.jpg",
  };

  // Build guide slides based on auth status
  const guideSlides: any[] = [];

  // Always include the hand slide first
  guideSlides.push(HAND_SLIDE);

  if (!isAuthenticated) {
    // For non-authenticated users: show two action slides
    guideSlides.push({
      key: "free_helps",
      type: "action",
      icon: Gift,
      title: "🎉 First 3 helps are FREE!",
      desc: "Become a Hero and unlock your first 3 cases for free. After that, 1 credit per help. Start today.",
      cta: "Become a Hero — Free",
      to: "/sign-in",
      color: "text-green-600",
      bg: "bg-green-500/10",
    });
    guideSlides.push({
      key: "free_case",
      type: "action",
      icon: FileText,
      title: "📝 Submit your FIRST case FREE!",
      desc: "Complete KYC and submit your first case with no fee. Heroes will verify and help you.",
      cta: "Submit Free Case",
      to: "/sign-in",
      color: "text-primary",
      bg: "bg-primary/10",
    });
  } else {
    // For authenticated users, keep the existing guide slides
    if (kycStatus !== "approved") {
      guideSlides.push({ key: "announce", type: "announce", to: "/kyc" });
      guideSlides.push({
        key: "kyc",
        type: "guide",
        icon: ShieldCheck,
        title: "Step 1: Verify your identity",
        desc: "You've signed up — now complete your KYC. Add your CNIC photos (front, back, selfie) as shown on the KYC page. Tap here to start.",
        to: "/kyc",
        color: "text-violet-600",
        bg: "bg-violet-500/10",
      });
    }
    if (kycStatus === "approved") {
      guideSlides.push({
        key: "submit",
        type: "guide",
        icon: FileText,
        title: "Submit your FIRST case — FREE! 🎉",
        desc: "Your identity is verified! Your first case is completely free to submit. Tap here to start your request.",
        to: "/submit-request",
        color: "text-primary",
        bg: "bg-primary/10",
      });

      if (unlockCount < 3) {
        guideSlides.push({
          key: "free_helps_auth",
          type: "guide",
          icon: Gift,
          title: "🎉 Your first 3 helps are FREE!",
          desc: `As a Hero, your first ${3 - unlockCount} unlocks are completely free. After that, 1 credit per help. Start helping now!`,
          to: "/cases",
          color: "text-green-600",
          bg: "bg-green-500/10",
        });
      }

      guideSlides.push({
        key: "help",
        type: "guide",
        icon: Heart,
        title: "Help someone — become a Hero",
        desc: "Browse verified cases and help a real person by paying their institute directly. You'll get an affidavit as proof. Tap here to help.",
        to: "/cases",
        color: "text-rose-600",
        bg: "bg-rose-500/10",
      });
    }
  }

  // Auto-slide timer
  useEffect(() => {
    if (guideSlides.length <= 1) return;
    const t = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % guideSlides.length);
    }, 7000);
    return () => clearInterval(t);
  }, [guideSlides.length]);

  useEffect(() => {
    if (slideIndex >= guideSlides.length) setSlideIndex(0);
  }, [guideSlides.length, slideIndex]);

  const countries = Array.from(
    new Set(cases.map((c) => c.country).filter(Boolean))
  ).sort();
  const cities = Array.from(
    new Set(
      cases
        .filter((c) => filterCountry === "all" || c.country === filterCountry)
        .map((c) => c.city)
        .filter(Boolean)
    )
  ).sort();

  let filtered = cases.filter((c) => {
    if (filterCountry !== "all" && c.country !== filterCountry) return false;
    if (filterCity !== "all" && c.city !== filterCity) return false;
    if (filterCat !== "all" && c.category !== filterCat) return false;
    if (filterUrgency !== "all" && c.urgency !== filterUrgency) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !c.title?.toLowerCase().includes(q) &&
        !c.short_description?.toLowerCase().includes(q) &&
        !c.description?.toLowerCase().includes(q) &&
        !c.institute_name?.toLowerCase().includes(q) &&
        !c.city?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "newest")
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    if (sortBy === "oldest")
      return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    if (sortBy === "amount_low")
      return (a.amount_needed ?? 0) - (b.amount_needed ?? 0);
    if (sortBy === "amount_high")
      return (b.amount_needed ?? 0) - (a.amount_needed ?? 0);
    if (sortBy === "urgent") {
      const order: any = { Emergency: 4, High: 3, Medium: 2, Low: 1 };
      return (order[b.urgency] ?? 0) - (order[a.urgency] ?? 0);
    }
    return 0;
  });

  const activeFilterCount = [
    filterCountry,
    filterCity,
    filterCat,
    filterUrgency,
  ].filter((f) => f !== "all").length;

  function resetFilters() {
    setFilterCountry("all");
    setFilterCity("all");
    setFilterCat("all");
    setFilterUrgency("all");
    setSortBy("newest");
    setSearch("");
  }

  function selectCategory(cat: string) {
    setFilterCat(filterCat === cat ? "all" : cat);
    setTimeout(
      () => resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  }

  const currentSlide = guideSlides[slideIndex] ?? HAND_SLIDE;

  // Render slide content based on type
  function renderSlideContent() {
    if (currentSlide.type === "image") {
      return (
        <img
          src={currentSlide.image}
          alt="Givethra"
          className="w-full h-52 md:h-72 object-cover"
        />
      );
    }
    if (currentSlide.type === "announce") {
      return (
        <button
          type="button"
          onClick={() => navigate({ to: currentSlide.to })}
          className="w-full h-52 md:h-72 bg-gradient-to-br from-primary to-primary/80 text-white flex flex-col items-center justify-center text-center px-6 gap-2 cursor-pointer"
        >
          <span className="text-4xl">🎉</span>
          <div className="text-2xl md:text-3xl font-black tracking-wide">
            First Case FREE! 🎉
          </div>
          <p className="text-sm font-semibold opacity-90">Complete your KYC & submit your first request with zero fees</p>
          <p className="text-sm max-w-sm leading-relaxed opacity-95">
            Complete your KYC and submit your{" "}
            <strong>first case completely FREE</strong> — no fee!
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-bold bg-white/20 rounded-full px-4 py-1.5 mt-1">
            Complete your KYC now <ChevronRight className="h-4 w-4" />
          </span>
        </button>
      );
    }
    if (currentSlide.type === "action") {
      return (
        <button
          type="button"
          onClick={() => navigate({ to: currentSlide.to })}
          className="w-full h-52 md:h-72 bg-gradient-to-br from-card to-muted/40 flex flex-col items-center justify-center text-center px-6 gap-3 cursor-pointer hover:from-muted/30 transition-colors"
        >
          <div
            className={`h-16 w-16 rounded-2xl ${currentSlide.bg} flex items-center justify-center`}
          >
            <currentSlide.icon className={`h-8 w-8 ${currentSlide.color}`} />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {currentSlide.title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            {currentSlide.desc}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-1">
            {currentSlide.cta} <ChevronRight className="h-4 w-4" />
          </span>
        </button>
      );
    }
    // Default guide slide (for authenticated)
    return (
      <button
        type="button"
        onClick={() => navigate({ to: currentSlide.to })}
        className="w-full h-52 md:h-72 bg-gradient-to-br from-card to-muted/40 flex flex-col items-center justify-center text-center px-6 gap-3 cursor-pointer hover:from-muted/30 transition-colors"
      >
        <div
          className={`h-16 w-16 rounded-2xl ${currentSlide.bg} flex items-center justify-center`}
        >
          <currentSlide.icon className={`h-8 w-8 ${currentSlide.color}`} />
        </div>
        <h3 className="font-display text-xl font-bold text-foreground">
          {currentSlide.title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          {currentSlide.desc}
        </p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-1">
          Tap to continue <ChevronRight className="h-4 w-4" />
        </span>
      </button>
    );
  }

  return (
    <div className="bg-background pb-20 md:pb-0">
      <InstallButton />

      {ANNOUNCEMENT && (
        <div className="bg-primary text-primary-foreground overflow-hidden relative h-9 flex items-center border-b border-primary/30">
          <div className="absolute left-0 top-0 bottom-0 z-10 bg-primary px-2 flex items-center">
            <Gift className="h-4 w-4" />
          </div>
          <div className="whitespace-nowrap animate-marquee pl-10">
            <span className="text-sm font-medium px-4">{ANNOUNCEMENT}</span>
            <span className="text-sm font-medium px-4">{ANNOUNCEMENT}</span>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden bg-card border-b border-border">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 -left-16 h-48 w-48 rounded-full bg-primary/8 blur-2xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-6 md:py-12 flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="flex-1 space-y-4 text-center md:text-left"
          >
            <div className="flex items-center justify-between md:justify-start gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary tracking-wide uppercase">
                  GIVETHRA
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <LanguageSwitcher />
                {isAuthenticated && (
                  <button
                    onClick={() => navigate({ to: "/notifications" })}
                    className="relative h-9 w-9 flex items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-colors"
                  >
                    <Bell className="h-4 w-4 text-foreground" />
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {notifCount > 9 ? "9+" : notifCount}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Verified Help.<br />
              <span className="text-primary">Real Impact.</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md">
              Connect with verified people, support genuine needs, and create
              meaningful impact.
            </p>

            {!isAuthenticated && (
              <div className="flex gap-3 justify-center md:justify-start">
                <Button
                  size="lg"
                  onClick={() => navigate({ to: "/become-hero" })}
                  className="h-11 px-6 font-semibold flex-1 sm:flex-none"
                >
                  Become a Hero
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate({ to: "/need-help" })}
                  className="h-11 px-6 font-semibold flex-1 sm:flex-none"
                >
                  Request Help
                </Button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="flex-1 w-full space-y-4"
          >
            {/* Public message box above slider */}
            <div id="public-post" className="rounded-2xl border border-primary/20 bg-card p-4 shadow-sm text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-sm font-semibold text-foreground">Public Post</h3>
              </div>
              <p className="mb-3 text-xs leading-5 text-muted-foreground">Share any message about Givethra here.</p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formEl = e.currentTarget;
                const field = formEl.elements.namedItem("feedbackText") as HTMLInputElement | HTMLTextAreaElement;
                const txt = field?.value?.trim();
                if (!txt) return;
                try {
                  const token = localStorage.getItem("auth_token");
                  const res = await fetch("/api/public-feedback", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify({ message: txt, guest_name: user?.fullName || "Public Visitor" })
                  });
                  const result = await res.json().catch(() => null);
                  if (!res.ok) {
                    throw new Error(result?.error || "Failed to send message.");
                  }
                  toast.success("Success! Your message has been sent to Givethra.");
                  formEl.reset();
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "We could not send your message. Please try again.");
                }
              }} className="space-y-2">
                <textarea
                  name="feedbackText"
                  rows={3}
                  placeholder="Write your message..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  required
                />
                <div className="flex justify-end items-center text-xs">
                  <button type="submit" className="px-3 py-1.5 font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
                    Post Message
                  </button>
                </div>
              </form>
            </div>

            <div className="relative w-full rounded-2xl overflow-hidden shadow-xl">
              {renderSlideContent()}

              {guideSlides.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {guideSlides.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSlideIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === slideIndex
                          ? "w-6 bg-primary"
                          : "w-2 bg-white/70 border border-border"
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {isAuthenticated && (
        <section className="bg-background border-b border-border py-5 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate({ to: "/become-hero" })}
              className="text-left rounded-2xl border border-border bg-card hover:border-primary hover:shadow-md transition-all p-5 flex items-start gap-4 group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-foreground flex items-center gap-1">
                  Become a Hero{" "}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Browse verified cases and help someone directly by paying
                  their institute.
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate({ to: "/need-help" })}
              className="text-left rounded-2xl border border-border bg-card hover:border-primary hover:shadow-md transition-all p-5 flex items-start gap-4 group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-foreground flex items-center gap-1">
                  Need Help?{" "}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Submit your first case FREE with documents and get verified,
                  direct support.
                </p>
              </div>
            </button>
          </div>
        </section>
      )}

      {detectedCountry && (
        <section className="bg-primary/5 border-b border-border py-2.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-muted-foreground">Your location:</span>
            <span className="font-semibold text-foreground">
              {detectedCity ? `${detectedCity}, ` : ""}
              {detectedCountry}
            </span>
            <button
              onClick={() => {
                setFilterCountry(detectedCountry);
                if (detectedCity) setFilterCity(detectedCity);
                setTimeout(
                  () =>
                    resultsRef.current?.scrollIntoView({ behavior: "smooth" }),
                  100
                );
              }}
              className="ml-auto text-xs bg-primary text-white px-3 py-1 rounded-full font-medium shrink-0"
            >
              Show local cases
            </button>
          </div>
        </section>
      )}

      <section className="bg-background border-b border-border py-4 px-4">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search hospital, school, city, title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 flex-1"
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters{" "}
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-[10px] rounded-full px-1.5">
                  {activeFilterCount}
                </span>
              )}
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount_low">Amount: Low to High</SelectItem>
                <SelectItem value="amount_high">Amount: High to Low</SelectItem>
                <SelectItem value="urgent">Most Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showFilters && (
            <div className="rounded-2xl border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-red-600 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Country</Label>
                <Select
                  value={filterCountry}
                  onValueChange={(v) => {
                    setFilterCountry(v);
                    setFilterCity("all");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">City</Label>
                <Select
                  value={filterCity}
                  onValueChange={setFilterCity}
                  disabled={filterCountry === "all"}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        filterCountry === "all"
                          ? "Select country first"
                          : "All cities"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Category</Label>
                <Select value={filterCat} onValueChange={setFilterCat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    <SelectItem value="all">All Categories</SelectItem>
                    {FILTER_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Urgency</Label>
                <div className="grid grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterUrgency("all")}
                    className={`px-1 py-2 rounded-lg border text-xs font-medium ${
                      filterUrgency === "all"
                        ? "bg-primary text-white border-primary"
                        : "border-border"
                    }`}
                  >
                    All
                  </button>
                  {URGENCIES.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setFilterUrgency(u)}
                      className={`px-1 py-2 rounded-lg border text-xs font-medium ${
                        filterUrgency === u
                          ? "bg-primary text-white border-primary"
                          : "border-border"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted/30 border-b border-border py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-3">
            Tap a category to filter
          </p>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={`flex flex-col items-center shrink-0 min-w-[68px] p-2 rounded-xl transition-colors ${
                  filterCat === cat
                    ? "bg-primary/10 ring-1 ring-primary"
                    : "hover:bg-muted"
                }`}
              >
                <span className="text-xl">{CATEGORY_EMOJI[cat] ?? "📌"}</span>
                <span className="text-sm font-bold text-foreground">
                  {categoryCounts[cat] ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={resultsRef}
        className="py-8 px-4 bg-background scroll-mt-32"
      >
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">
              {filterCat !== "all" ? `${filterCat} Cases` : "Verified Cases"}
              <span className="ml-2 text-sm text-muted-foreground font-normal">
                ({filtered.length})
              </span>
            </h2>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs text-primary font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16 text-muted-foreground">
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-border bg-muted/20">
              <p className="text-foreground font-semibold">No cases found.</p>
              <p className="text-muted-foreground text-sm mt-1">
                Try changing your filters or location.
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c, i) => {
                const cur = c.currency || "USD";
                const s = sym(cur);
                const needed = Number(c.amount_needed ?? 0);
                const collected = Number(c.amount_collected ?? 0);
                const percent =
                  needed > 0 ? Math.min(Math.round((collected / needed) * 100), 100) : 0;
                const remaining = Math.max(needed - collected, 0);
                const appeal =
                  CATEGORY_APPEAL[c.category] ?? "Be someone's hope today 🤲";
                const isDone = needed > 0 && collected >= needed;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  >
                    <div
                      className="rounded-2xl border border-border bg-card overflow-hidden cursor-pointer hover:shadow-lg hover:border-primary/40 transition-all h-full flex flex-col"
                      onClick={() =>
                        navigate({
                          to: "/cases/$id",
                          params: { id: c.id },
                        })
                      }
                    >
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 border-b border-border">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-card text-primary px-2.5 py-1 rounded-full border border-primary/20">
                            <span>{CATEGORY_EMOJI[c.category] ?? "📌"}</span>{" "}
                            {c.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.urgency === "Emergency"
                                ? "bg-red-100 text-red-700"
                                : c.urgency === "High"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {c.urgency}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-foreground leading-snug">
                          {appeal}
                        </p>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col">
                        <div>
                          <h3 className="font-bold text-lg leading-snug line-clamp-2 text-foreground">
                            {c.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {c.short_description}
                          </p>
                        </div>

                        {needed > 0 && (
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-2xl font-black text-primary">
                              {s} {needed}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {cur} needed
                            </span>
                          </div>
                        )}

                        {needed > 0 && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-green-600">
                                {s} {collected} raised
                              </span>
                              <span className="text-muted-foreground">
                                {isDone ? "Fully helped 🎉" : `${percent}%`}
                              </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isDone ? "bg-green-500" : "bg-primary"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-muted-foreground">
                                Goal:{" "}
                                <strong className="text-foreground">
                                  {s} {needed}
                                </strong>
                              </span>
                              {!isDone && (
                                <span className="text-primary font-semibold">
                                  {s} {remaining} left
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {c.deadline &&
                          (() => {
                            const daysLeft = Math.ceil(
                              (new Date(c.deadline).getTime() - Date.now()) /
                                (1000 * 60 * 60 * 24)
                            );
                            if (daysLeft < 0) return null;
                            return (
                              <div
                                className={`text-xs font-bold px-2 py-1 rounded-lg text-center ${
                                  daysLeft <= 3
                                    ? "bg-red-100 text-red-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                ⏳{" "}
                                {daysLeft === 0
                                  ? "Expires TODAY!"
                                  : daysLeft === 1
                                  ? "1 day left!"
                                  : `${daysLeft} days left to help!`}
                              </div>
                            );
                          })()}

                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border mt-auto">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {c.city}, {c.country}
                          </span>
                          <span className="inline-flex items-center gap-1 text-primary font-semibold">
                            Help now <ChevronRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-8 px-4 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-lg font-bold mb-5 text-center">
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
                className="flex items-center gap-3 rounded-xl bg-card border border-border p-3"
              >
                <div className="h-9 w-9 rounded-lg bg-card flex items-center justify-center shrink-0">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3 text-emerald-500" />
                    <span className="text-xs font-semibold">{label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Verified</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pt-8">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-foreground">
              📱 Get the Givethra Android App
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Verified cases, anytime — right on your phone.
            </p>
          </div>
          <a
            href="/Givethra.apk"
            download
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
          >
            Download App
          </a>
        </div>
      </section>

      <FeedbackWall />

      <section className="py-10 px-4 bg-background">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="font-display text-lg font-bold text-center">
            How Givethra Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                step: "01",
                title: "Request Help",
                desc: "Complete KYC and submit your first case FREE with documents.",
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
                <span className="absolute -top-3 left-4 text-xs font-black text-primary/30">
                  {step}
                </span>
                <span className="text-3xl">{emoji}</span>
                <h3 className="font-bold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {!isAuthenticated && (
        <section className="py-10 px-4 bg-primary text-primary-foreground">
          <div className="max-w-xl mx-auto text-center space-y-4">
            <h2 className="font-display text-2xl font-bold">
              Ready to make a difference?
            </h2>
            <p className="text-primary-foreground/80 text-sm">
              Join Heroes changing lives through verified, direct support.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate({ to: "/become-hero" })}
                className="h-11 px-6 font-semibold"
              >
                Become a Hero
              </Button>
              <Button
                size="lg"
                onClick={() => navigate({ to: "/sign-up" })}
                className="h-11 px-6 font-semibold bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Request Help
              </Button>
            </div>
          </div>
        </section>
      )}

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
              href="https://www.linkedin.com/company/givethra-org/"
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
            <MessageCircle className="h-4 w-4" /> Follow our WhatsApp Channel
          </a>

          <div>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 border-t border-border text-sm text-muted-foreground">
            <Link
              to="/about"
              className="hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link to="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link
              to="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/community-guidelines"
              className="hover:text-primary transition-colors"
            >
              Community Guidelines
            </Link>
            <Link
              to="/contact"
              className="hover:text-primary transition-colors"
            >
              Contact Us
            </Link>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            © {new Date().getFullYear()} Givethra. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
}
