import InstallButton from "@/components/InstallButton";
import { CATEGORY_EMOJI } from "@/components/CategoryPill";
import FeedbackWall from "@/components/FeedbackWall";
import Layout from "@/components/Layout";
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
  Accessibility,
  Baby,
  BadgeCheck,
  Battery,
  BookOpen,
  Briefcase,
  Building2,
  ChevronRight,
  Droplets,
  Feather,
  Facebook,
  FileText,
  Flame,
  Gift,
  GraduationCap,
  Hammer,
  Heart,
  HeartHandshake,
  Home,
  Instagram,
  Linkedin,
  Mail,
  MailCheck,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  ShoppingCart,
  Siren,
  SlidersHorizontal,
  Stethoscope,
  Pill,
  WalletCards,
  Wheat,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  getApprovedCases,
  getCategoryCounts,
  getCasesByUser,
  getKycStatus,
  getWallet,
  getUnlockCount,
  getUnreadNotificationsCount,
} from "@/lib/api";

const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61590715263595";
const INSTAGRAM_URL =
  "https://www.instagram.com/givethra.community";
const WHATSAPP_URL =
  "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";
const LINKEDIN_URL =
  "https://www.linkedin.com/company/givethra-org/";
const CONTACT_EMAIL = "info@givethra.org";

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

function sym(currency?: string) {
  return CURRENCY_SYMBOLS[currency || "USD"] ?? currency ?? "$";
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
  Medicines: "Help a patient get their medicine 💊",
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
  Other: "Be someone's hope today 🤲",
};

const CATEGORY_SLIDE_STYLE: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Electricity Bill": { icon: Battery, color: "text-amber-600", bg: "bg-amber-500/15" },
  "Gas Bill": { icon: Flame, color: "text-orange-600", bg: "bg-orange-500/15" },
  "Water Bill": { icon: Droplets, color: "text-sky-600", bg: "bg-sky-500/15" },
  "House Rent": { icon: Home, color: "text-emerald-600", bg: "bg-emerald-500/15" },
  "School Fees": { icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-500/15" },
  "Education & Books": { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-500/15" },
  "Medical & Treatment": { icon: Stethoscope, color: "text-rose-600", bg: "bg-rose-500/15" },
  Medicines: { icon: Pill, color: "text-violet-600", bg: "bg-violet-500/15" },
  "Food & Groceries": { icon: ShoppingCart, color: "text-lime-700", bg: "bg-lime-500/15" },
  "Child Support": { icon: Baby, color: "text-pink-600", bg: "bg-pink-500/15" },
  "Widow & Elderly Support": { icon: HeartHandshake, color: "text-fuchsia-600", bg: "bg-fuchsia-500/15" },
  "Disability Support": { icon: Accessibility, color: "text-cyan-700", bg: "bg-cyan-500/15" },
  "Marriage Support": { icon: Heart, color: "text-red-600", bg: "bg-red-500/15" },
  "Business / Work Help": { icon: Briefcase, color: "text-slate-700", bg: "bg-slate-500/15" },
  "Home Repair": { icon: Hammer, color: "text-yellow-700", bg: "bg-yellow-500/15" },
  "Funeral Expenses": { icon: Feather, color: "text-slate-600", bg: "bg-slate-500/15" },
  "Livestock / Farming": { icon: Wheat, color: "text-green-700", bg: "bg-green-500/15" },
  "Debt Relief": { icon: WalletCards, color: "text-teal-700", bg: "bg-teal-500/15" },
  "Emergency Help": { icon: Siren, color: "text-red-700", bg: "bg-red-500/15" },
  Other: { icon: FileText, color: "text-primary", bg: "bg-primary/10" },
};

const CATEGORY_SLIDE_COPY: Record<string, { title: string; desc: string }> = {
  "Electricity Bill": { title: "Need Electricity Bill Help?", desc: "Need help paying this month’s electricity bill?" },
  "Gas Bill": { title: "Need Gas Bill Help?", desc: "Need help paying this month’s gas bill?" },
  "Water Bill": { title: "Need Water Bill Help?", desc: "Need help paying this month’s water bill?" },
  "House Rent": { title: "Need Rent Help?", desc: "Need help paying this month’s rent?" },
  "School Fees": { title: "Need School Fee Help?", desc: "Need help paying your school fees?" },
  "Education & Books": { title: "Need Education Help?", desc: "Need help with books or study costs?" },
  "Medical & Treatment": { title: "Need Medical Help?", desc: "Need help with treatment costs?" },
  Medicines: { title: "Need Medicine Help?", desc: "Need help paying for essential medicines?" },
  "Food & Groceries": { title: "Need Food Help?", desc: "Need help with essential groceries?" },
  "Child Support": { title: "Need Child Support?", desc: "Need help with essential needs for your child?" },
  "Widow & Elderly Support": { title: "Need Elderly Support?", desc: "Need help with essential needs?" },
  "Disability Support": { title: "Need Disability Support?", desc: "Need help with an essential need?" },
  "Marriage Support": { title: "Need Wedding Help?", desc: "Need help with an essential wedding expense?" },
  "Business / Work Help": { title: "Need Work Support?", desc: "Need help starting work or a small business?" },
  "Home Repair": { title: "Need Home Repair Help?", desc: "Need help with an essential home repair?" },
  "Funeral Expenses": { title: "Need Funeral Help?", desc: "Need help with essential funeral expenses?" },
  "Livestock / Farming": { title: "Need Farming Help?", desc: "Need help with livestock or farming costs?" },
  "Debt Relief": { title: "Need Debt Relief?", desc: "Need help with an urgent debt?" },
  "Emergency Help": { title: "Need Emergency Help?", desc: "Facing an urgent essential need?" },
  Other: { title: "Need Help?", desc: "Facing an urgent essential need?" },
};

const URGENCIES = ["Low", "Medium", "High", "Emergency"];

const TRUST_BADGES = [
  { icon: MailCheck, label: "Email Verified", color: "text-teal-600" },
  { icon: Phone, label: "Mobile Verified", color: "text-blue-600" },
  { icon: BadgeCheck, label: "Identity Verified", color: "text-violet-600" },
  { icon: Building2, label: "Institution Verified", color: "text-orange-600" },
];

type GuideSlide =
  | { key: string; type: "image"; image: string }
  | { key: string; type: "announce"; to: string }
  | {
      key: string;
      type: "action" | "guide";
      icon: React.ElementType;
      title: string;
      desc: string;
      cta?: string;
      to: string;
      category?: string;
      color: string;
      bg: string;
      eyebrow?: string;
    };

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [cases, setCases] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState("none");
  const [unlockCount, setUnlockCount] = useState(0);
  const [freeCasesUsed, setFreeCasesUsed] = useState(0);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);
  const sliderTouchStartX = useRef<number | null>(null);

  useEffect(() => {
    void loadCases();
    void loadCategoryCounts();

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`,
          );
          const data = await response.json();
          if (data?.countryName) {
            setDetectedCountry(data.countryName);
          }
          if (data?.city || data?.locality) {
            setDetectedCity(data.city || data.locality);
          }
        } catch {
          // Location is optional.
        }
      },
      () => {
        // User denied location access.
      },
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    void runUserGuide(user.id);
    void loadGuideStatus();
    void loadUnlockCount();

    const casesInterval = window.setInterval(() => {
      void loadCases();
    }, 60000);

    return () => {
      window.clearInterval(casesInterval);
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    setSlideIndex(0);
  }, [freeCasesUsed, isAuthenticated, kycStatus, unlockCount]);

  async function loadCases() {
    setLoading(true);
    try {
      const data = await getApprovedCases();
      setCases(data ?? []);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategoryCounts() {
    try {
      const data = await getCategoryCounts();
      setCategoryCounts(data ?? {});
    } catch {
      setCategoryCounts({});
    }
  }

  async function loadGuideStatus() {
    if (!user?.id) return;
    try {
      const [kyc, userCases] = await Promise.all([
        getKycStatus(user.id),
        getCasesByUser(user.id),
      ]);
      setKycStatus(kyc?.status ?? "none");
      setFreeCasesUsed(
        (userCases ?? []).filter((item: any) => item.was_free === true).length,
      );
      await Promise.all([
        getWallet(user.id),
        getUnreadNotificationsCount(user.id),
      ]);
    } catch {
      // Optional dashboard data.
    }
  }

  async function loadUnlockCount() {
    if (!user?.id) return;
    try {
      const count = await getUnlockCount(user.id);
      setUnlockCount(count ?? 0);
    } catch {
      setUnlockCount(0);
    }
  }

  const guideSlides = useMemo<GuideSlide[]>(() => {
    const slides: GuideSlide[] = [
      {
        key: "hero",
        type: "image",
        image: "/assets/generated/hero-givethra.dim_1200x500.jpg",
      },
    ];
    const freeCaseComplete = freeCasesUsed >= 2;

    if (!isAuthenticated) {
      slides.push(
        {
          key: "free_helps",
          type: "action",
          icon: Gift,
          title: "🎉 First 3 helps are FREE!",
          desc: "Become a Hero and unlock your first 3 cases for free. After that, 1 credit per help.",
          cta: "Become a Hero — Free",
          to: "/sign-in",
          color: "text-teal-700",
          bg: "bg-teal-500/10",
        },
        {
          key: "free_case",
          type: "action",
          icon: FileText,
          title: "📝 Submit your FIRST case FREE!",
          desc: "Complete KYC and submit your first case with no fee. Heroes will verify and help you.",
          cta: "Submit Free Case",
          to: "/sign-in",
          color: "text-primary",
          bg: "bg-primary/10",
        },
      );
    } else {
      if (kycStatus !== "approved") {
        slides.push(
          {
            key: "announce",
            type: "announce",
            to: "/kyc",
          },
          {
            key: "kyc",
            type: "guide",
            icon: ShieldCheck,
            title: "Step 1: Verify your identity",
            desc: "Complete your KYC by adding your CNIC front, back, and selfie photos.",
            cta: "Complete your KYC now",
            to: "/kyc",
            color: "text-violet-700",
            bg: "bg-violet-500/10",
          },
        );
      }

      if (kycStatus === "approved") {
        if (!freeCaseComplete) {
          slides.push({
            key: "submit",
            type: "guide",
            icon: FileText,
            title: "Submit your FIRST case — FREE! 🎉",
            desc: "Your identity is verified. Submit your first case completely free.",
            cta: "Submit your free case",
            to: "/submit-request",
            color: "text-primary",
            bg: "bg-primary/10",
          });
        } else {
          slides.push({
            key: "credits",
            type: "guide",
            icon: WalletCards,
            title: "Need more help after your free cases?",
            desc: "Add credits securely to submit another eligible case when you are ready.",
            cta: "View credits",
            to: "/become-hero",
            color: "text-amber-700",
            bg: "bg-amber-500/10",
          });
        }

        slides.push({
          key: "help",
          type: "guide",
          icon: Heart,
          title: "Help someone — become a Hero",
          desc: "Browse verified cases and support a real person directly.",
          cta: "Browse verified cases",
          to: "/cases",
          color: "text-rose-700",
          bg: "bg-rose-500/10",
        });

        if (unlockCount < 3) {
          slides.push({
            key: "free_helps_auth",
            type: "guide",
            icon: Gift,
            title: "🎉 Your first 3 helps are FREE!",
            desc: `Your first ${3 - unlockCount} unlocks are free. Start helping now!`,
            cta: "Start helping now",
            to: "/cases",
            color: "text-teal-700",
            bg: "bg-teal-500/10",
          });
        }
      }
    }

    slides.push(
      ...FILTER_CATEGORIES.map((category) => ({
        key: `category_${category}`,
        type: "guide" as const,
        icon: CATEGORY_SLIDE_STYLE[category]?.icon ?? FileText,
        eyebrow: "Explore a help category",
        title: CATEGORY_SLIDE_COPY[category]?.title ?? category,
        desc: CATEGORY_SLIDE_COPY[category]?.desc ?? "Explore verified help requests in this category.",
        cta: "Explore this category",
        to: "/",
        category,
        color: CATEGORY_SLIDE_STYLE[category]?.color ?? "text-primary",
        bg: CATEGORY_SLIDE_STYLE[category]?.bg ?? "bg-primary/10",
      })),
    );

    return slides;
  }, [freeCasesUsed, isAuthenticated, kycStatus, unlockCount]);

  useEffect(() => {
    if (guideSlides.length <= 1) return;
    const interval = window.setInterval(() => {
      setSlideIndex((current) => (current + 1) % guideSlides.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [guideSlides.length]);

  const countries = useMemo(
    () =>
      Array.from(
        new Set(cases.map((item) => item.country).filter(Boolean)),
      ).sort(),
    [cases],
  );

  const cities = useMemo(
    () =>
      Array.from(
        new Set(
          cases
            .filter(
              (item) =>
                filterCountry === "all" || item.country === filterCountry,
            )
            .map((item) => item.city)
            .filter(Boolean),
        ),
      ).sort(),
    [cases, filterCountry],
  );

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();
    const result = cases.filter((item) => {
      if (filterCountry !== "all" && item.country !== filterCountry) {
        return false;
      }
      if (filterCity !== "all" && item.city !== filterCity) {
        return false;
      }
      if (filterCat !== "all" && item.category !== filterCat) {
        return false;
      }
      if (filterUrgency !== "all" && item.urgency !== filterUrgency) {
        return false;
      }
      if (!query) return true;
      return [
        item.title,
        item.short_description,
        item.description,
        item.institute_name,
        item.city,
      ].some((value) => String(value ?? "").toLowerCase().includes(query));
    });

    return result.sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.submitted_at).getTime() -
          new Date(a.submitted_at).getTime()
        );
      }
      if (sortBy === "oldest") {
        return (
          new Date(a.submitted_at).getTime() -
          new Date(b.submitted_at).getTime()
        );
      }
      if (sortBy === "amount_low") {
        return Number(a.amount_needed ?? 0) - Number(b.amount_needed ?? 0);
      }
      if (sortBy === "amount_high") {
        return Number(b.amount_needed ?? 0) - Number(a.amount_needed ?? 0);
      }
      if (sortBy === "urgent") {
        const urgencyOrder: Record<string, number> = {
          Emergency: 4,
          High: 3,
          Medium: 2,
          Low: 1,
        };
        return (
          (urgencyOrder[b.urgency] ?? 0) - (urgencyOrder[a.urgency] ?? 0)
        );
      }
      return 0;
    });
  }, [
    cases,
    filterCat,
    filterCity,
    filterCountry,
    filterUrgency,
    search,
    sortBy,
  ]);

  const activeFilterCount = [
    filterCountry,
    filterCity,
    filterCat,
    filterUrgency,
  ].filter((value) => value !== "all").length;

  function resetFilters() {
    setFilterCountry("all");
    setFilterCity("all");
    setFilterCat("all");
    setFilterUrgency("all");
    setSortBy("newest");
    setSearch("");
  }

  function selectCategory(category: string) {
    setFilterCat((current) => (current === category ? "all" : category));
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }

  const visibleSlideIndexes = useMemo(() => {
    const last = guideSlides.length - 1;
    return guideSlides
      .map((_, index) => index)
      .filter((index) => index === 0 || index === last || Math.abs(index - slideIndex) <= 2);
  }, [guideSlides, slideIndex]);

  function goToSlide(index: number) {
    setSlideIndex((index + guideSlides.length) % guideSlides.length);
  }

  function handleSliderTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    sliderTouchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleSliderTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const start = sliderTouchStartX.current;
    sliderTouchStartX.current = null;
    if (start === null || guideSlides.length < 2) return;
    const end = event.changedTouches[0]?.clientX ?? start;
    const distance = end - start;
    if (Math.abs(distance) < 42) return;
    goToSlide(slideIndex + (distance < 0 ? 1 : -1));
  }

  function handleSlideClick(slide: GuideSlide) {
    if (slide.type === "image") return;
    if ("category" in slide && slide.category) {
      selectCategory(slide.category);
      return;
    }
    navigate({ to: slide.to });
  }

  function renderSlideContent() {
    const slide = guideSlides[slideIndex] ?? guideSlides[0];
    if (!slide) return null;

    if (slide.type === "image") {
      return (
        <img
          src={slide.image}
          alt="Givethra community support"
          className="h-52 w-full object-cover md:h-72"
        />
      );
    }

    if (slide.type === "announce") {
      return (
        <button
          type="button"
          onClick={() => handleSlideClick(slide)}
          className="flex min-h-52 w-full cursor-pointer flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary via-primary to-teal-600 px-6 py-5 text-center text-white transition-transform hover:scale-[1.01] md:min-h-72"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-4xl shadow-inner">🎉</span>
          <div className="max-w-xs text-2xl font-black leading-tight tracking-tight md:text-3xl">
            First Case FREE! 🎉
          </div>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-white/85">
            Complete your KYC and submit your first request with zero fees.
          </p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-primary shadow-sm">
            Complete your KYC now
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>
      );
    }

    const Icon = slide.icon;
    return (
      <button
        type="button"
        onClick={() => navigate({ to: slide.to })}
        className="group flex min-h-52 w-full cursor-pointer flex-col items-center justify-center gap-2 bg-gradient-to-br from-card via-card to-primary/5 px-6 py-5 text-center transition-transform hover:scale-[1.01] md:min-h-72"
      >
        <div className={`flex h-14 w-14 items-center justify-center rounded-[18px] shadow-sm ${slide.bg}`}>
          <Icon className={`h-7 w-7 ${slide.color}`} />
        </div>
        {slide.eyebrow && (
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary/75">
            {slide.eyebrow}
          </span>
        )}
        <h3 className="max-w-md font-display text-lg font-bold leading-tight tracking-tight text-foreground md:text-2xl">
          {slide.title}
        </h3>
        <p className="max-w-md text-xs leading-relaxed text-muted-foreground md:text-[15px]">
          {slide.desc}
        </p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-transform group-hover:translate-x-0.5 md:px-4 md:py-2 md:text-sm">
          {slide.cta ?? "Tap to continue"}
          <ChevronRight className="h-4 w-4" />
        </span>
      </button>
    );
  }

  return (
    <Layout>
      <div className="bg-background pb-20 md:pb-0">
        <InstallButton />

        <div className="relative h-9 overflow-hidden border-b border-primary/30 bg-primary text-primary-foreground">
          <div className="absolute inset-y-0 left-0 z-10 flex items-center bg-primary px-3 shadow-[8px_0_14px_rgba(0,0,0,0.08)]">
            <Gift className="h-4 w-4 shrink-0" />
          </div>
          <div className="flex h-full w-max items-center animate-marquee pl-10">
            <span className="whitespace-nowrap px-6 text-sm font-semibold">
              {ANNOUNCEMENT}
            </span>
            <span
              aria-hidden="true"
              className="whitespace-nowrap px-6 text-sm font-semibold"
            >
              {ANNOUNCEMENT}
            </span>
          </div>
        </div>

        <section className="relative overflow-hidden border-b border-border bg-card">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 pb-6 pt-8 md:flex-row md:gap-12 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="flex-1 space-y-4 text-center md:text-left"
            >
              <h1 className="font-display text-3xl font-black leading-tight text-foreground md:text-5xl">
                Verified Help.
                <br />
                <span className="text-primary">Real Impact.</span>
              </h1>
              <p className="max-w-md text-base text-muted-foreground">
                Connect with verified people, support genuine needs, and create
                meaningful impact.
              </p>
              {!isAuthenticated && (
                <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
                  <Button
                    size="lg"
                    onClick={() => navigate({ to: "/become-hero" })}
                    className="h-11 px-6 font-semibold"
                  >
                    Become a Hero
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate({ to: "/need-help" })}
                    className="h-11 px-6 font-semibold"
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
              className="w-full flex-1 space-y-4"
            >
              <div
                className="relative w-full overflow-hidden rounded-2xl border border-primary/10 bg-card shadow-xl"
                onTouchStart={handleSliderTouchStart}
                onTouchEnd={handleSliderTouchEnd}
              >
                {renderSlideContent()}
                {guideSlides.length > 1 && (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-black/40 to-transparent px-4 pb-3 pt-8">
                    <div className="flex items-center gap-1.5" aria-label="Slider navigation">
                      {visibleSlideIndexes.map((index) => {
                        const slide = guideSlides[index];
                        return (
                          <button
                            key={slide.key}
                            type="button"
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}: ${slide.key.replaceAll("_", " ")}`}
                            className={`h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                              index === slideIndex
                                ? "w-7 bg-white"
                                : "w-2 bg-white/55 hover:bg-white/80"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {isAuthenticated && (
          <section className="border-b border-border bg-background px-4 py-5">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate({ to: "/become-hero" })}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-1 font-bold text-foreground">
                    Become a Hero
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Browse verified cases and help someone directly by paying
                    their institute.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate({ to: "/need-help" })}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-primary hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-1 font-bold text-foreground">
                    Need Help?
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Submit your first case FREE with documents and get
                    verified, direct support.
                  </p>
                </div>
              </button>
            </div>
          </section>
        )}

        {detectedCountry && (
          <section className="border-b border-border bg-primary/5 px-4 py-2.5">
            <div className="mx-auto flex max-w-7xl items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">Your location:</span>
              <span className="font-semibold text-foreground">
                {detectedCity ? `${detectedCity}, ` : ""}
                {detectedCountry}
              </span>
              <button
                type="button"
                onClick={() => {
                  setFilterCountry(detectedCountry);
                  if (detectedCity) {
                    setFilterCity(detectedCity);
                  }
                  window.setTimeout(() => {
                    resultsRef.current?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }, 100);
                }}
                className="ml-auto shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white"
              >
                Show local cases
              </button>
            </div>
          </section>
        )}

        <section className="border-b border-border bg-background px-4 py-4">
          <div className="mx-auto max-w-7xl space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search hospital, school, city, title..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 pl-10"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setShowFilters((current) => !current)}
                className="flex-1 gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary px-1.5 text-[10px] text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Sort cases" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="amount_low">
                    Amount: Low to High
                  </SelectItem>
                  <SelectItem value="amount_high">
                    Amount: High to Low
                  </SelectItem>
                  <SelectItem value="urgent">Most Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {showFilters && (
              <div className="space-y-4 rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-xs text-red-600"
                    >
                      <X className="h-3 w-3" />
                      Clear all
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Country</Label>
                  <Select
                    value={filterCountry}
                    onValueChange={(value) => {
                      setFilterCountry(value);
                      setFilterCity("all");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
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
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  <Select value={filterCat} onValueChange={setFilterCat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">All Categories</SelectItem>
                      {FILTER_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Urgency</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <button
                      type="button"
                      onClick={() => setFilterUrgency("all")}
                      className={`rounded-lg border px-1 py-2 text-xs font-medium ${
                        filterUrgency === "all"
                          ? "border-primary bg-primary text-white"
                          : "border-border"
                      }`}
                    >
                      All
                    </button>
                    {URGENCIES.map((urgency) => (
                      <button
                        key={urgency}
                        type="button"
                        onClick={() => setFilterUrgency(urgency)}
                        className={`rounded-lg border px-1 py-2 text-xs font-medium ${
                          filterUrgency === urgency
                            ? "border-primary bg-primary text-white"
                            : "border-border"
                        }`}
                      >
                        {urgency}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-border bg-muted/30 px-4 py-4">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Tap a category to filter
            </p>
            <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-1">
              {FILTER_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => selectCategory(category)}
                  className={`flex min-w-[68px] shrink-0 flex-col items-center rounded-xl p-2 transition-colors ${
                    filterCat === category
                      ? "bg-primary/10 ring-1 ring-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="text-xl">
                    {CATEGORY_EMOJI[category] ?? "📌"}
                  </span>
                  <span className="font-bold text-foreground">
                    {categoryCounts[category] ?? 0}
                  </span>
                  <span className="text-center text-[10px] leading-tight text-muted-foreground">
                    {category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          ref={resultsRef}
          className="scroll-mt-32 bg-background px-4 py-8"
        >
          <div className="mx-auto max-w-7xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">
                {filterCat !== "all" ? `${filterCat} Cases` : "Verified Cases"}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({filteredCases.length})
                </span>
              </h2>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-semibold text-primary"
                >
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-16 text-center text-muted-foreground">
                Loading...
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
                <p className="font-semibold text-foreground">
                  No cases found.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCases.map((item, index) => {
                  const currency = item.currency || "USD";
                  const currencySymbol = sym(currency);
                  const needed = Number(item.amount_needed ?? 0);
                  const collected = Number(item.amount_collected ?? 0);
                  const remaining = Math.max(needed - collected, 0);
                  const percent =
                    needed > 0
                      ? Math.min(
                          Math.round((collected / needed) * 100),
                          100,
                        )
                      : 0;
                  const isDone = needed > 0 && collected >= needed;
                  const appeal =
                    CATEGORY_APPEAL[item.category] ??
                    "Be someone's hope today 🤲";

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: Math.min(index * 0.05, 0.4),
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/cases/$id",
                            params: { id: item.id },
                          })
                        }
                        className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/40 hover:shadow-lg"
                      >
                        <div className="border-b border-border bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-card px-2.5 py-1 text-xs font-semibold text-primary">
                              <span>
                                {CATEGORY_EMOJI[item.category] ?? "📌"}
                              </span>
                              {item.category}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                item.urgency === "Emergency"
                                  ? "bg-red-100 text-red-700"
                                  : item.urgency === "High"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {item.urgency}
                            </span>
                          </div>
                          <p className="text-sm font-bold leading-snug text-foreground">
                            {appeal}
                          </p>
                        </div>

                        <div className="flex flex-1 flex-col space-y-3 p-4">
                          <div>
                            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-foreground">
                              {item.title}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {item.short_description}
                            </p>
                          </div>

                          {needed > 0 && (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl font-black text-primary">
                                {currencySymbol} {needed}
                              </span>
                              <span className="text-xs font-medium text-muted-foreground">
                                {currency} needed
                              </span>
                            </div>
                          )}

                          {needed > 0 && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-teal-600">
                                  {currencySymbol} {collected} raised
                                </span>
                                <span className="text-muted-foreground">
                                  {isDone
                                    ? "Fully helped 🎉"
                                    : `${percent}%`}
                                </span>
                              </div>

                              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    isDone ? "bg-teal-500" : "bg-primary"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[11px]">
                                <span className="text-muted-foreground">
                                  Goal:{" "}
                                  <strong className="text-foreground">
                                    {currencySymbol} {needed}
                                  </strong>
                                </span>
                                {!isDone && (
                                  <span className="font-semibold text-primary">
                                    {currencySymbol} {remaining} left
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {item.deadline &&
                            (() => {
                              const daysLeft = Math.ceil(
                                (new Date(item.deadline).getTime() -
                                  Date.now()) /
                                  (1000 * 60 * 60 * 24),
                              );
                              if (daysLeft < 0) return null;
                              return (
                                <div
                                  className={`rounded-lg px-2 py-1 text-center text-xs font-bold ${
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

                          <div className="mt-auto flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.city}, {item.country}
                            </span>
                            <span className="inline-flex items-center gap-1 font-semibold text-primary">
                              Help now
                              <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-5 text-center font-display text-lg font-bold">
              Built on Trust &amp; Verification
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {TRUST_BADGES.map(({ icon: Icon, label, color }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card">
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3 text-teal-500" />
                      <span className="text-xs font-semibold">{label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Verified
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 sm:flex-row">
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-foreground">
                📱 Get the Givethra Android App
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Verified cases, anytime — right on your phone.
              </p>
            </div>
            <a
              href="/Givethra.apk"
              download
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Download App
            </a>
          </div>
        </section>

        <FeedbackWall />

        <section className="bg-background px-4 py-10">
          <div className="mx-auto max-w-4xl space-y-6">
            <h2 className="text-center font-display text-lg font-bold">
              How Givethra Works
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              ].map(({ step, title, desc, emoji }, index) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.12 }}
                  className="relative flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center"
                >
                  <span className="absolute -top-3 left-4 text-xs font-black text-primary/30">
                    {step}
                  </span>
                  <span className="text-3xl">{emoji}</span>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {!isAuthenticated && (
          <section className="bg-primary px-4 py-10 text-primary-foreground">
            <div className="mx-auto max-w-xl space-y-4 text-center">
              <h2 className="font-display text-2xl font-bold">
                Ready to make a difference?
              </h2>
              <p className="text-sm text-primary-foreground/80">
                Join Heroes changing lives through verified, direct support.
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
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
                  className="h-11 bg-primary-foreground px-6 font-semibold text-primary hover:bg-primary-foreground/90"
                >
                  Request Help
                </Button>
              </div>
            </div>
          </section>
        )}

        <section className="border-t border-border bg-card px-4 py-10">
          <div className="mx-auto max-w-2xl space-y-5 text-center">
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
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-white"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-white"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-white"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-teal-600 hover:text-white"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                aria-label="Email"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-white"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-600 hover:underline"
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

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <Link
                to="/about"
                className="transition-colors hover:text-primary"
              >
                About
              </Link>
              <Link
                to="/faq"
                className="transition-colors hover:text-primary"
              >
                FAQ
              </Link>
              <Link
                to="/privacy"
                className="transition-colors hover:text-primary"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="transition-colors hover:text-primary"
              >
                Terms
              </Link>
              <Link
                to="/community-guidelines"
                className="transition-colors hover:text-primary"
              >
                Community Guidelines
              </Link>
              <Link
                to="/contact"
                className="transition-colors hover:text-primary"
              >
                Contact Us
              </Link>
            </div>

            <p className="pt-1 text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Givethra. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
