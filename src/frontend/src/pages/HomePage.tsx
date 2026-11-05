// src/frontend/src/pages/HomePage.tsx
// Givethra - Premium HomePage with KYC Verified badge under user name.

import InstallButton from "@/components/InstallButton";
import CompletionCooldownBanner from "@/components/CompletionCooldownBanner";
import Layout from "@/components/Layout";
import SocialLinks from "@/components/SocialLinks";
import { SiWhatsapp } from "react-icons/si";
import { CATEGORY_EMOJI } from "@/components/CategoryPill";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { runUserGuide } from "@/lib/userGuide";
import { orderCasesForViewer } from "@/lib/caseOrdering";
import { getCaseCalendarDate, isCasePastDeadline, isExpiredCaseRecord, daysUntilCaseDeadline } from "@/lib/caseExpiry";
import { handleImageError, resolveMediaUrl } from "@/lib/media";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck, Briefcase, Building2, MailCheck, Phone, Search, SlidersHorizontal, X,
  MapPin, Bell, Heart, FileText, Mail, ChevronRight, MessageCircle, ShieldCheck, Gift,
  Battery, Flame, Droplets, GraduationCap, Stethoscope, ShoppingCart, Share2, Home,
  BookOpen, Pill, Apple, Baby, Accessibility, Gem, Wrench, Tractor, CreditCard, Siren,
  MoreHorizontal, Sparkles, TrendingUp, Zap, CheckCircle2, Clock, AlertTriangle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getApprovedCases, getCategoryCounts, getKycStatus, getWallet, getUnlockCount,
  getUnreadNotificationsCount, getProfile, searchUsers, getCommunityPosts,
  createCommunityPost, getUserSupports, getEarningsSummary, requestWithdrawal,
  supportPost, followUser, unfollowUser,
} from "@/lib/api";
import SlidingHomePanel from "@/components/SlidingHomePanel";

const WHATSAPP_URL = "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";
const SUPPORT_WHATSAPP_URL = "https://wa.me/message/42CJXLUYEI2KM1?src=qr";
const WELCOME_POPUP_INTERVAL_MS = 12 * 60 * 60 * 1000;
const CONTACT_EMAIL = "info@givethra.org";

const ANNOUNCEMENT =
  "🎉 Big Offer for Everyone! Complete your KYC and submit your FIRST CASE completely FREE — no fee! After review & approval, Heroes will help you. Start now at givethra.org 🤲   •   🎉 Heroes: Your first 3 helps are FREE! After that, 1 credit per help. Become a Hero and change lives today.";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹",
  TRY: "₺", BDT: "৳", EGP: "E£", NGN: "₦", KES: "KSh", ZAR: "R", BRL: "R$",
  CAD: "C$", AUD: "A$", JPY: "¥", CNY: "¥", KRW: "₩", IDR: "Rp", MYR: "RM",
  THB: "฿", PHP: "₱", VND: "₫", SGD: "S$", AFN: "؋", NPR: "Rs", LKR: "Rs",
  QAR: "QAR", KWD: "KWD", BHD: "BHD", OMR: "OMR", JOD: "JOD", MAD: "MAD",
};

function sym(cur?: string) { return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$"); }

function normalizePublishedCategory(value: unknown): string {
  const category = String(value ?? "").trim();
  if (category === "School, College & University Fees") return "School Fees";
  if (category === "Education, Books & Admission") return "Education & Books";
  return category;
}

const FILTER_CATEGORIES = [
  "Electricity Bill", "Gas Bill", "Water Bill", "House Rent", "School Fees",
  "Education & Books", "Medical & Treatment", "Medicines", "Food & Groceries",
  "Child Support", "Orphan Support", "Widow & Elderly Support",
  "Disability Support", "Marriage Support", "Business / Work Help",
  "Home Repair", "Funeral Expenses", "Livestock / Farming", "Debt Relief",
  "Emergency Help",
];

const CATEGORY_SLIDE_MEDIA: Record<string, string> = {
  "Electricity Bill": "/assets/generated/category-electricity-bill.jpg",
  "Gas Bill": "/assets/generated/category-gas-bill.jpg",
  "Water Bill": "/assets/generated/category-water-bill.jpg",
  "House Rent": "/assets/generated/category-house-rent.jpg",
  "School Fees": "/assets/generated/category-school-fees.jpg",
  "Education & Books": "/assets/generated/category-education-books.jpg",
  "Medical & Treatment": "/assets/generated/category-medical-treatment.jpg",
  Medicines: "/assets/generated/category-medicines.jpg",
  "Food & Groceries": "/assets/generated/category-food-groceries.jpg",
  "Child Support": "/assets/generated/category-child-support.jpg",
  "Orphan Support": "/assets/generated/category-orphan-support.jpg",
  "Widow & Elderly Support": "/assets/generated/category-widow-elderly.jpg",
  "Disability Support": "/assets/generated/category-disability-support.jpg",
  "Marriage Support": "/assets/generated/category-marriage-support.jpg",
  "Business / Work Help": "/assets/generated/category-business-work.jpg",
  "Home Repair": "/assets/generated/category-home-repair.jpg",
  "Funeral Expenses": "/assets/generated/category-funeral-expenses.jpg",
  "Livestock / Farming": "/assets/generated/category-livestock-farming.jpg",
  "Debt Relief": "/assets/generated/category-debt-relief.jpg",
  "Emergency Help": "/assets/generated/category-emergency-help.jpg",
};

const CATEGORY_ICON: Record<string, typeof Battery> = {
  "Electricity Bill": Battery, "Gas Bill": Flame, "Water Bill": Droplets, "House Rent": Home,
  "School Fees": GraduationCap, "Education & Books": BookOpen, "Medical & Treatment": Stethoscope, Medicines: Pill,
  "Food & Groceries": Apple, "Child Support": Baby, "Orphan Support": Heart, "Widow & Elderly Support": Heart, "Disability Support": Accessibility,
  "Marriage Support": Gem, "Business / Work Help": ShoppingCart, "Home Repair": Wrench, "Funeral Expenses": Heart,
  "Livestock / Farming": Tractor, "Debt Relief": CreditCard, "Emergency Help": Siren,
};

const CATEGORY_FORM_NAME: Record<string, string> = {
  "School Fees": "School, College & University Fees",
  "Education & Books": "Education, Books & Admission",
};

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
  "Orphan Support": "Help an orphaned child build a brighter future 🤲",
  "Widow & Elderly Support": "Be a support for a widow or elder 🤲",
  "Disability Support": "Help someone live with dignity ♿",
  "Marriage Support": "Help a family celebrate with dignity 💍",
  "Business / Work Help": "Help someone stand on their feet 🛒",
  "Home Repair": "Help rebuild a safe home 🏚️",
  "Funeral Expenses": "Help a family in their hardest hour 🤲",
  "Livestock / Farming": "Help a farmer earn a living 🐄",
  "Debt Relief": "Help free someone from debt's burden 🙏",
  "Emergency Help": "Help someone in an urgent crisis 🚨",
};

const URGENCIES = ["Low", "Medium", "High", "Emergency"];

function relativePostTime(value: unknown) {
  const timestamp = new Date(String(value || "")).getTime();
  if (!Number.isFinite(timestamp)) return "Recently";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// ============================================================
// KYC Verified Badge Component
// ============================================================
function KycBadge({ kycStatus }: { kycStatus: string }) {
  const navigate = useNavigate();
  const status = String(kycStatus || "none").toLowerCase();

  if (status === "approved") {
    return (
      <Link
        to="/kyc"
        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 shadow-sm ring-1 ring-emerald-200 transition hover:from-emerald-200 hover:to-teal-200"
      >
        <BadgeCheck className="h-3 w-3" fill="currentColor" />
        Verified
      </Link>
    );
  }

  if (status === "pending") {
    return (
      <Link
        to="/kyc"
        className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 shadow-sm ring-1 ring-amber-200 transition hover:from-amber-200 hover:to-yellow-200"
      >
        <Clock className="h-3 w-3" />
        Pending
      </Link>
    );
  }

  // "none" or "rejected" or "re_kyc"
  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/kyc" })}
      className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-100 to-red-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-700 shadow-sm ring-1 ring-rose-200 transition hover:from-rose-200 hover:to-red-200"
    >
      <AlertTriangle className="h-3 w-3" />
      Unverified
    </button>
  );
}

// ============================================================
// Home Social Dashboard
// ============================================================
function HomeSocialDashboard({ notificationCount = 0 }: { notificationCount?: number }) {
  const { user } = useAuth();
  const { role } = useRole();
  const [walletBalance, setWalletBalance] = useState(0);
  const [supports, setSupports] = useState(0);
  const [supportsGiven, setSupportsGiven] = useState(0);
  const [supportEarningsUsd, setSupportEarningsUsd] = useState(0);
  const [earningsSummary, setEarningsSummary] = useState<any>(null);
  const [kycStatus, setKycStatus] = useState<string>("none");
  const [activeMoneyTab, setActiveMoneyTab] = useState<"earning" | "support" | "wallet">(() => {
    if (typeof window === "undefined") return "support";
    try {
      const saved = window.localStorage.getItem("givethra_home_mode");
      return saved === "earning" || saved === "wallet" ? saved : "support";
    } catch { return "support"; }
  });
  const [withdrawalForm, setWithdrawalForm] = useState({ amount: "", bank_name: "", account_title: "", account_number: "" });
  const [posts, setPosts] = useState<any[]>([]);
  const [feedTab, setFeedTab] = useState<"for-you" | "latest" | "most-supported" | "my-posts">("for-you");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [busyPost, setBusyPost] = useState<string | null>(null);
  const [postCooldownUntil, setPostCooldownUntil] = useState<number | null>(null);
  const [clockMs, setClockMs] = useState(() => Date.now());
  const [userQuery, setUserQuery] = useState("");
  const [submittedUserQuery, setSubmittedUserQuery] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchError, setUserSearchError] = useState("");
  const homeLoadRequestRef = useRef(0);

  const loadHomeData = async () => {
    if (!user?.id) return;
    const requestId = ++homeLoadRequestRef.current;
    setLoading(true);
    const [walletResult, supportResult, earningsResult, postsResult, ownPostsResult, kycResult] = await Promise.allSettled([
      getWallet(user.id), getUserSupports(user.id), getEarningsSummary(),
      getCommunityPosts(feedTab), getCommunityPosts("my-posts"), getKycStatus(user.id),
    ]);
    if (requestId !== homeLoadRequestRef.current) return;
    if (walletResult.status === "fulfilled") setWalletBalance(Number(walletResult.value?.balance || 0));
    if (supportResult.status === "fulfilled") setSupports(Number(supportResult.value?.supports || 0));
    if (supportResult.status === "fulfilled") {
      const supportData = supportResult.value as typeof supportResult.value & { supportsGiven?: number; supportEarningsUsd?: number };
      setSupportsGiven(Number(supportData?.supportsGiven || 0));
      setSupportEarningsUsd(Number(supportData?.supportEarningsUsd || 0));
    }
    if (earningsResult.status === "fulfilled") setEarningsSummary(earningsResult.value);
    if (postsResult.status === "fulfilled") setPosts(Array.isArray(postsResult.value) ? postsResult.value : []);
    if (kycResult.status === "fulfilled") setKycStatus(String(kycResult.value?.status || "none").toLowerCase());
    if (ownPostsResult.status === "fulfilled") {
      const latest = ownPostsResult.value
        .filter((post: any) => post.user_id === user.id && post.created_at)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      const next = latest ? new Date(latest.created_at).getTime() + 24 * 60 * 60 * 1000 : 0;
      setPostCooldownUntil(next > Date.now() ? next : null);
    }
    setLoading(false);
  };

  useEffect(() => { loadHomeData(); }, [user?.id, feedTab]);
  useEffect(() => {
    const onPanelTab = (event: Event) => {
      const tab = (event as CustomEvent<"support" | "earning" | "wallet">).detail;
      if (tab === "support" || tab === "earning" || tab === "wallet") setActiveMoneyTab(tab);
    };
    window.addEventListener("givethra-home-panel-tab", onPanelTab);
    return () => window.removeEventListener("givethra-home-panel-tab", onPanelTab);
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setClockMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (activeMoneyTab !== "support" || posts.length === 0) return;
    const newest = posts.reduce((max, post) => Math.max(max, new Date(post?.created_at || 0).getTime()), 0);
    if (newest > 0) {
      window.dispatchEvent(new CustomEvent("givethra-support-posts-seen", { detail: { newest } }));
    }
  }, [activeMoneyTab, posts]);
  useEffect(() => {
    const query = submittedUserQuery.trim();
    if (query.length < 2) { setUserResults([]); setSearchingUsers(false); setUserSearchError(""); return; }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchingUsers(true); setUserSearchError("");
      try {
        const results = await searchUsers(query);
        if (!cancelled) setUserResults(Array.isArray(results) ? results : []);
      } catch (error) {
        if (!cancelled) { setUserResults([]); setUserSearchError(error instanceof Error ? error.message : "Search is temporarily unavailable."); }
      } finally { if (!cancelled) setSearchingUsers(false); }
    }, 250);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [submittedUserQuery]);

  const submitPost = async () => {
    const text = message.trim();
    if (posting || !text || !user?.id || (postCooldownUntil != null && postCooldownUntil > Date.now())) return;
    setPosting(true);
    try {
      const created = await createCommunityPost({ message: text, user_id: user.id, display_name: user.fullName || "User", is_guest: false });
      setPosts((current) => [{ ...created, display_name: created?.display_name || user.fullName || "User", message: text, likes_count: 0, support_count: 0 }, ...current]);
      setMessage(""); setPostCooldownUntil(Date.now() + 24 * 60 * 60 * 1000);
      toast.success("Your post is live. You can publish again after 24 hours.");
    } catch (error) {
      const nextPostAt = Number((error as any)?.nextPostAt ? new Date((error as any).nextPostAt).getTime() : 0);
      if (nextPostAt > Date.now()) setPostCooldownUntil(nextPostAt);
      toast.error(error instanceof Error ? error.message : "Post could not be published");
    } finally { setPosting(false); }
  };
  const cooldownRemainingMs = Math.max(0, (postCooldownUntil || 0) - clockMs);
  const cooldownHours = Math.floor(cooldownRemainingMs / (1000 * 60 * 60));
  const cooldownMinutes = Math.floor((cooldownRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const cooldownSeconds = Math.floor((cooldownRemainingMs % (1000 * 60)) / 1000);
  const postLocked = cooldownRemainingMs > 0;

  const sharePost = async (post: any) => {
    const text = `${post.display_name || "Givethra member"}: ${post.message || ""}`;
    const url = `${window.location.origin}/community`;
    try {
      if (navigator.share) await navigator.share({ title: "Givethra post", text, url });
      else { await navigator.clipboard?.writeText(`${text}\n${url}`); toast.success("Post link copied"); }
    } catch (error) {
      if ((error as DOMException)?.name !== "AbortError") toast.error("Post could not be shared");
    }
  };
  const reactToPost = async (post: any) => {
    if (!post?.id || post.supported_by_me || post.user_id === user?.id || busyPost != null) return;
    setBusyPost(`support:${post.id}`);
    try {
      const result = await supportPost(String(post.id));
      setPosts((current) => current.map((item) => item.id === post.id ? {
        ...item, support_count: Number(result?.support_count ?? Number(item.support_count || 0) + 1), supported_by_me: true,
      } : item));
      setSupports((value) => value + 1);
      if (result?.supportEarningsUsd != null) setSupportEarningsUsd(Number(result.supportEarningsUsd));
    } catch (error) { toast.error(error instanceof Error ? error.message : "Support could not be added"); }
    finally { setBusyPost(null); }
  };
  const togglePostHero = async (post: any) => {
    if (!post?.user_id || post.user_id === user?.id || busyPost != null) return;
    setBusyPost(`hero:${post.id}`);
    try {
      if (post.is_following) await unfollowUser(String(post.user_id));
      else await followUser(String(post.user_id));
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, is_following: !post.is_following } : item));
    } catch (error) { toast.error(error instanceof Error ? error.message : "Hero action could not be completed"); }
    finally { setBusyPost(null); }
  };

  return (
    <SlidingHomePanel onTabChange={setActiveMoneyTab}>
      <div className="min-h-full bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-24">
        <div className="mx-auto max-w-3xl space-y-4 px-3 py-4 md:px-5 md:py-7">
          <section className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-900/5 md:p-6">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-yellow-200/40 to-amber-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-gradient-to-br from-blue-200/40 to-sky-300/30 blur-3xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-amber-950 shadow-sm">
                  <Sparkles className="h-3 w-3" /> Givethra Home
                </span>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                  Welcome {role === "hero" ? "Hero" : "Requester"}
                </h1>

                {/* ⭐ KYC Verified Badge under name */}
                <div className="mt-2 flex items-center gap-2">
                  <KycBadge kycStatus={kycStatus} />
                  <span className="text-xs font-medium text-slate-500">
                    {kycStatus === "approved"
                      ? "Your identity is verified."
                      : kycStatus === "pending"
                        ? "Verification under review."
                        : "Complete KYC to start helping or requesting."}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {role === "hero" ? "Your kindness creates real impact." : "Share your journey and connect with support."}
                </p>
              </div>
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 text-xl font-black text-white shadow-lg shadow-blue-500/30">
                {(user?.fullName || "U").slice(0, 1).toUpperCase()}
              </div>
            </div>
            {activeMoneyTab === "support" ? (
              <div className="relative mt-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-sky-50/70 p-4">
                <p className="flex items-center gap-2 font-bold text-slate-900"><ShieldCheck className="h-4 w-4 text-blue-600" /> Support Center</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">Support others and receive support on your own posts. Both given and received Supports count toward your 5,000 eligibility target.</p>
                <p className="mt-2 text-[11px] font-semibold text-blue-700">10,000 Supports = $1</p>
                <div className="mt-3 rounded-lg bg-white/80 p-2.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Eligibility</span>
                    <span className="text-blue-700">{Number(earningsSummary?.eligibility_supports || 0).toLocaleString()} / 5,000</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-sky-400" style={{ width: `${Math.min(100, (Number(earningsSummary?.eligibility_supports || 0) / 5000) * 100)}%` }} />
                  </div>
                </div>
              </div>
            ) : null}
            {activeMoneyTab === "earning" ? (
              <div className="relative mt-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 font-bold text-slate-900"><TrendingUp className="h-4 w-4 text-amber-600" /> Earnings</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${earningsSummary?.earnings_eligible ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
                    {earningsSummary?.earnings_eligible ? "Eligible" : "Not eligible yet"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">Your posts earn only after eligibility. Current earnings: <strong className="text-slate-900">${Number(earningsSummary?.earnings_usd || supportEarningsUsd).toFixed(4)}</strong></p>
                <div className="mt-3 space-y-2">
                  {(earningsSummary?.posts || []).map((entry: any) => (
                    <div key={entry.id} className="flex justify-between rounded-lg bg-white/90 px-3 py-2 text-xs shadow-sm">
                      <span className="text-slate-600">Post {String(entry.post_id).slice(0, 8)} · {entry.supports} Support</span>
                      <strong className="text-slate-900">{Number(entry.amount_pkr).toFixed(2)} PKR</strong>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {activeMoneyTab === "wallet" ? (
              <div className="relative mt-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-sky-50/70 p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 font-bold text-slate-900"><CreditCard className="h-4 w-4 text-blue-600" /> Wallet</p>
                  <strong className="text-lg font-black text-blue-700">{Number(earningsSummary?.wallet_pkr || 0).toFixed(2)} PKR</strong>
                </div>
                <p className="mt-1 text-xs text-slate-600">Withdrawal opens from the 30th through the 3rd. Minimum 300 PKR.</p>
                <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wider text-blue-700">Withdrawal Request</p>
                  <div className="mt-3 grid gap-3">
                    <label className="grid gap-1 text-xs font-semibold text-slate-600">Bank name<input value={withdrawalForm.bank_name} onChange={e => setWithdrawalForm({ ...withdrawalForm, bank_name: e.target.value })} placeholder="Enter bank name" className="h-10 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" /></label>
                    <label className="grid gap-1 text-xs font-semibold text-slate-600">Account title<input value={withdrawalForm.account_title} onChange={e => setWithdrawalForm({ ...withdrawalForm, account_title: e.target.value })} placeholder="Enter account title" className="h-10 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" /></label>
                    <label className="grid gap-1 text-xs font-semibold text-slate-600">Account number / IBAN<input value={withdrawalForm.account_number} onChange={e => setWithdrawalForm({ ...withdrawalForm, account_number: e.target.value })} placeholder="Enter account number or IBAN" className="h-10 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" /></label>
                    <label className="grid gap-1 text-xs font-semibold text-slate-600">Amount (PKR)<input value={withdrawalForm.amount} onChange={e => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })} placeholder="Minimum 300 PKR" inputMode="decimal" className="h-10 rounded-lg border border-slate-200 bg-slate-50/60 px-3 text-sm font-normal text-slate-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" /></label>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-sky-500 font-bold shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-sky-600" disabled={!earningsSummary?.withdrawal_open || Number(earningsSummary?.wallet_pkr || 0) < 300} onClick={async () => { try { await requestWithdrawal({ ...withdrawalForm, amount: Number(withdrawalForm.amount || earningsSummary?.wallet_pkr || 0) }); toast.success("Withdrawal request sent to Admin."); setEarningsSummary(await getEarningsSummary()); } catch (error) { toast.error(error instanceof Error ? error.message : "Withdrawal failed"); } }}>Request withdrawal</Button>
                  </div>
                </div>
              </div>
            ) : null}
            {activeMoneyTab === "wallet" && (earningsSummary?.withdrawals || []).length > 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
                <p className="text-sm font-bold text-slate-900">Withdrawal History</p>
                <div className="mt-3 space-y-2">
                  {earningsSummary.withdrawals.map((item: any) => (
                    <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                      <span className="text-slate-700">{Number(item.amount_pkr).toFixed(2)} PKR · <strong className="capitalize text-slate-900">{item.status}</strong></span>
                      {item.payment_proof_url ? <a href={item.payment_proof_url} target="_blank" rel="noreferrer" className="font-semibold text-blue-600 underline">View payment proof</a> : <span className="text-slate-400">Awaiting admin proof</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          {activeMoneyTab === "support" ? <>
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Search className="h-4 w-4" /></div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Find people in Givethra</h2>
                  <p className="text-xs text-slate-500">Search by name or username, then open their profile.</p>
                </div>
              </div>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={userQuery} onChange={(event) => setUserQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); setSubmittedUserQuery(userQuery); } }} autoComplete="off" inputMode="search" placeholder="Search name or @username" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-24 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
                <button type="button" onClick={() => setSubmittedUserQuery(userQuery)} disabled={userQuery.trim().length < 2} className="absolute right-1 top-1 h-9 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 px-3 text-xs font-bold text-white shadow-sm transition hover:from-blue-700 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-50">Search</button>
              </div>
              {submittedUserQuery.trim().length >= 2 && (
                <div className="mt-3 space-y-2">
                  {searchingUsers ? <p className="py-3 text-center text-xs text-slate-500">Searching…</p>
                    : userSearchError ? <p className="py-3 text-center text-xs text-red-600">{userSearchError}</p>
                    : userResults.length === 0 ? <p className="py-3 text-center text-xs text-slate-500">No users found.</p>
                    : userResults.map((result) => (
                      <Link key={result.user_id} to="/profile/$id" params={{ id: String(result.user_id) }} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/40">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 font-bold text-blue-600">{result.avatar_url ? <img src={resolveMediaUrl(result.avatar_url)} alt="" onError={handleImageError} className="h-full w-full object-cover" /> : String(result.full_name || "U").slice(0, 1).toUpperCase()}</div>
                        <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{result.full_name || "Givethra member"}</p><p className="truncate text-xs text-slate-500">{result.username ? `@${result.username}` : "Givethra member"}{result.city ? ` · ${result.city}` : ""}</p></div>
                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />
                      </Link>
                    ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-sky-500 font-bold text-white">{(user?.fullName || "U").slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-sm font-semibold text-slate-900">{user?.fullName || "Your profile"}</p>
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What's on your mind to share?" rows={3} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200" />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500">{postLocked ? `Post locked · ${cooldownHours}h ${cooldownMinutes}m ${cooldownSeconds}s left` : "One post per 24 hours · Support others to grow the community"}</span>
                    <Button onClick={submitPost} disabled={posting || !message.trim() || postLocked} className="bg-gradient-to-r from-blue-600 to-sky-500 font-bold shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-sky-600">{posting ? "Posting..." : postLocked ? "Post Locked" : "Post"}</Button>
                  </div>
                </div>
              </div>
            </section>

            <div className="flex gap-1 overflow-x-auto rounded-xl border border-slate-100 bg-white p-1 shadow-sm">
              {[["for-you", "For You"], ["latest", "Latest"], ["most-supported", "Most Supported"], ["my-posts", "My Posts"]].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setFeedTab(value as typeof feedTab)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${feedTab === value ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>{label}</button>
              ))}
            </div>

            {loading ? <div className="py-12 text-center text-sm text-slate-500">Loading your feed...</div>
              : posts.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center text-sm text-slate-500">No posts yet. Be the first to share something.</div>
              : posts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Link to="/profile/$id" params={{ id: String(post.user_id || "me") }} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-sky-500 font-bold text-white">{post.avatar_url ? <img src={post.avatar_url} alt="" className="h-full w-full object-cover" /> : String(post.display_name || "U").slice(0, 1).toUpperCase()}</Link>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link to="/profile/$id" params={{ id: String(post.user_id || "me") }} className="truncate text-sm font-semibold text-slate-900 hover:text-blue-600">{post.display_name || "User"}</Link>
                        {post.user_id && post.user_id !== user?.id && <button type="button" disabled={busyPost === `hero:${post.id}`} onClick={() => togglePostHero(post)} className="rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-[10px] font-black text-amber-950 shadow-sm">{post.is_following ? "Hero ✓" : "Hero"}</button>}
                      </div>
                      <p className="text-xs text-slate-500">{relativePostTime(post.created_at)} · {post.is_verified ? "Verified member" : "Givethra member"}</p>
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{post.message}</p>
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                    <button type="button" disabled={busyPost === `support:${post.id}` || Boolean(post.supported_by_me) || post.user_id === user?.id} onClick={() => reactToPost(post)} className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${post.supported_by_me ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>{post.supported_by_me ? "Supported ✓" : "🫴🏻 Support"} · {Number(post.support_count || 0)}</button>
                    <button type="button" onClick={() => sharePost(post)} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"><Share2 className="h-4 w-4" /> Share</button>
                  </div>
                </article>
              ))}
          </> : null}
        </div>
      </div>
    </SlidingHomePanel>
  );
}

// ============================================================
// Main HomePage
// ============================================================
export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { role } = useRole();

  const [cases, setCases] = useState<any[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [utcToday, setUtcToday] = useState(() => getCaseCalendarDate());
  const [notifCount, setNotifCount] = useState(0);

  const [kycStatus, setKycStatus] = useState<string>("none");
  const [balance, setBalance] = useState(0);
  const [unlockCount, setUnlockCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [homeMode, setHomeMode] = useState<"support" | "earning">(() => {
    if (typeof window === "undefined" || window.location.pathname === "/") return "support";
    try {
      const saved = window.localStorage.getItem("givethra_home_mode");
      return saved === "earning" || saved === "wallet" ? "earning" : "support";
    } catch { return "support"; }
  });
  const [showWhatsAppWelcome, setShowWhatsAppWelcome] = useState(false);
  const whatsappWelcomeStorageKey = `givethra_whatsapp_welcome_last_seen:${user?.id ? `user:${user.id}` : "guest"}`;

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);
  const casesLoadRequestRef = useRef(0);

  useEffect(() => {
    const timer = window.setInterval(() => setUtcToday(getCaseCalendarDate()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onModeChange = (event: Event) => setHomeMode((event as CustomEvent<"support" | "earning">).detail === "earning" ? "earning" : "support");
    window.addEventListener("givethra-home-panel-tab", onModeChange);
    return () => window.removeEventListener("givethra-home-panel-tab", onModeChange);
  }, []);

  useEffect(() => {
    try {
      const lastSeen = Number(window.localStorage.getItem(whatsappWelcomeStorageKey) || 0);
      if (!Number.isFinite(lastSeen) || Date.now() - lastSeen >= WELCOME_POPUP_INTERVAL_MS) {
        window.localStorage.setItem(whatsappWelcomeStorageKey, String(Date.now()));
        setShowWhatsAppWelcome(true);
      }
    } catch { setShowWhatsAppWelcome(true); }
  }, [whatsappWelcomeStorageKey]);

  const closeWhatsAppWelcome = () => { setShowWhatsAppWelcome(false); };
  const followWhatsAppChannel = () => { setShowWhatsAppWelcome(false); };

  useEffect(() => {
    loadCases();
    loadCategoryCounts();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
            const data = await res.json();
            if (data?.countryName) setDetectedCountry(data.countryName);
            if (data?.city || data?.locality) setDetectedCity(data.city || data.locality);
          } catch {}
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!user?.id) { setUserCountry(null); return; }
    getProfile(user.id).then((profile) => setUserCountry(profile?.country || null)).catch(() => setUserCountry(null));
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      runUserGuide(user.id);
      loadNotifCount();
      loadGuideStatus();
      loadUnlockCount();
      const interval = setInterval(loadNotifCount, 20000);
      const caseInterval = setInterval(loadCases, 60000);
      return () => { clearInterval(interval); clearInterval(caseInterval); };
    }
  }, [isAuthenticated, user]);

  async function loadNotifCount() {
    if (!user?.id) return;
    try { const count = await getUnreadNotificationsCount(user.id); setNotifCount(count ?? 0); } catch {}
  }
  async function loadGuideStatus() {
    if (!user?.id) return;
    try {
      const kyc = await getKycStatus(user.id);
      setKycStatus(String(kyc?.status || "none").toLowerCase());
      const wallet = await getWallet(user.id);
      setBalance(wallet?.balance ?? 0);
    } catch {}
  }
  async function loadUnlockCount() {
    if (!user?.id) return;
    try { const count = await getUnlockCount(user.id); setUnlockCount(count ?? 0); } catch {}
  }
  async function loadCases() {
    const requestId = ++casesLoadRequestRef.current;
    setLoading(true);
    try {
      const data = await getApprovedCases();
      if (requestId === casesLoadRequestRef.current) {
        const liveCases = (Array.isArray(data) ? data : []).filter((item: any) =>
          ["approved", "published", "active"].includes(String(item.status || "").toLowerCase()) && !isExpiredCaseRecord(item)
        );
        setCases(liveCases);
      }
    } catch {} finally { if (requestId === casesLoadRequestRef.current) setLoading(false); }
  }
  async function loadCategoryCounts() {
    try {
      const counts = await getCategoryCounts();
      const normalized = Object.entries(counts ?? {}).reduce<Record<string, number>>((result, [category, count]) => {
        const label = normalizePublishedCategory(category);
        result[label] = (result[label] || 0) + Number(count || 0);
        return result;
      }, {});
      setCategoryCounts(normalized);
    } catch {}
  }

  const countries = Array.from(new Set(cases.map((c) => c.country).filter(Boolean))).sort();
  const cities = Array.from(new Set(cases.filter((c) => filterCountry === "all" || c.country === filterCountry).map((c) => c.city).filter(Boolean))).sort();
  const orderedCategories = [...FILTER_CATEGORIES].sort((a, b) => Number(categoryCounts[b] || 0) - Number(categoryCounts[a] || 0));

  let filtered = cases.filter((c) => {
    if (isCasePastDeadline(c.deadline, utcToday)) return false;
    if (filterCountry !== "all" && c.country !== filterCountry) return false;
    if (filterCity !== "all" && c.city !== filterCity) return false;
    if (filterCat !== "all" && normalizePublishedCategory(c.category) !== filterCat) return false;
    if (filterUrgency !== "all" && c.urgency !== filterUrgency) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!c.title?.toLowerCase().includes(q) && !c.short_description?.toLowerCase().includes(q) && !c.description?.toLowerCase().includes(q) && !c.institute_name?.toLowerCase().includes(q) && !c.city?.toLowerCase().includes(q)) return false;
    }
    return true;
  });
  filtered = orderCasesForViewer(filtered, userCountry || detectedCountry, sortBy);

  const activeFilterCount = [filterCountry, filterCity, filterCat, filterUrgency].filter((f) => f !== "all").length;

  function resetFilters() {
    setFilterCountry("all"); setFilterCity("all"); setFilterCat("all"); setFilterUrgency("all"); setSortBy("newest"); setSearch("");
  }
  function selectCategory(cat: string) {
    setFilterCat(filterCat === cat ? "all" : cat);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }
  function startCategoryRequest(category: string) {
    if (!isAuthenticated) { navigate({ to: "/sign-in" }); return; }
    setSelectedCategory(category);
    try { localStorage.setItem("givethra_prefill_category", CATEGORY_FORM_NAME[category] || category); } catch {}
    navigate({ to: "/submit-request" });
  }

  return (
    <Layout>
      <div className="bg-background pb-20 md:pb-0">
        {showWhatsAppWelcome && (
          <div className="pointer-events-none fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/50 p-4 backdrop-blur-sm sm:items-center">
            <div role="dialog" aria-modal="true" aria-labelledby="whatsapp-welcome-title" className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-green-200/40 to-emerald-300/30 blur-3xl" />
              <button type="button" onClick={closeWhatsAppWelcome} aria-label="Close WhatsApp welcome" className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"><X className="h-4 w-4" /></button>
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h2 id="whatsapp-welcome-title" className="relative mt-4 text-xl font-black tracking-tight text-slate-900">Stay updated with Givethra</h2>
              <p className="relative mt-2 text-sm leading-6 text-slate-600">Follow our WhatsApp Channel for new updates, important announcements and community news.</p>
              <div className="relative mt-5 grid gap-2 sm:grid-cols-2">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={followWhatsAppChannel} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/25 transition hover:from-green-600 hover:to-emerald-700">
                  <SiWhatsapp className="h-4 w-4" /> Follow Channel
                </a>
                <Link to="/dreams" onClick={closeWhatsAppWelcome} className="flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:from-blue-700 hover:to-sky-600">
                  Shop Dreams <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <button type="button" onClick={closeWhatsAppWelcome} className="relative mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">Maybe later</button>
            </div>
          </div>
        )}

        <a
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open 24/7 WhatsApp support"
          title="24/7 WhatsApp Support"
          className="group fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] ring-4 ring-white/80 transition-all hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300 md:bottom-6 md:right-6"
        >
          <SiWhatsapp className="h-7 w-7 drop-shadow" />
          <span className="absolute -right-1 -top-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-1.5 py-0.5 text-[9px] font-black leading-none text-amber-950 shadow-md">24/7</span>
        </a>

        {homeMode === "support" && <>
          <InstallButton />
          <CompletionCooldownBanner />

          {ANNOUNCEMENT && (
            <div className="relative flex h-9 items-center overflow-hidden border-b border-blue-900/20 bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 text-white">
              <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 px-2.5 shadow-[2px_0_8px_rgba(0,0,0,0.15)]">
                <Gift className="h-3.5 w-3.5 text-amber-950" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950">Offer</span>
              </div>
              <div className="whitespace-nowrap animate-marquee pl-24">
                <span className="text-sm font-medium px-4">{ANNOUNCEMENT}</span>
                <span className="text-sm font-medium px-4">{ANNOUNCEMENT}</span>
              </div>
            </div>
          )}

          <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-yellow-200/40 to-amber-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-gradient-to-br from-blue-200/40 to-sky-300/20 blur-3xl" />
            <div className="relative mx-auto max-w-7xl space-y-3 px-3 py-3.5">
              <div className="flex h-[228px] gap-2.5">
                <div className="flex w-[112px] shrink-0 flex-col gap-2.5 sm:w-[148px]">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/become-hero" })}
                    className="group relative flex flex-1 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-400 to-amber-500 px-2 text-center text-amber-950 shadow-[0_8px_24px_rgba(251,191,36,0.4)] ring-1 ring-amber-300/60 transition-all hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(251,191,36,0.55)] active:scale-[0.97]"
                  >
                    <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.6),transparent_60%)]" />
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/40 ring-2 ring-white/60 backdrop-blur-sm transition group-hover:scale-110">
                      <Heart className="h-5 w-5 text-red-500" fill="currentColor" />
                    </span>
                    <span className="relative text-[13px] font-black leading-tight tracking-tight">Become<br />A Hero</span>
                    <span className="relative text-[9px] font-bold uppercase tracking-wider opacity-80">Save Lives</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/need-help" })}
                    className="group relative flex flex-1 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500 px-2 text-center text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] ring-1 ring-blue-400/60 transition-all hover:scale-[1.02] hover:shadow-[0_12px_32px_rgba(37,99,235,0.55)] active:scale-[0.97]"
                  >
                    <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-sm transition group-hover:scale-110">
                      <FileText className="h-5 w-5 text-white" />
                    </span>
                    <span className="relative text-[13px] font-black leading-tight tracking-tight">Request<br />Help</span>
                    <span className="relative text-[9px] font-bold uppercase tracking-wider text-white/75">Free Case</span>
                  </button>
                </div>

                <div className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2.5 overflow-x-auto scrollbar-hide">
                  {FILTER_CATEGORIES.map((category) => {
                    const image = CATEGORY_SLIDE_MEDIA[category] || "/assets/generated/help-livelihood.jpg";
                    const active = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        aria-label={`Start ${category} help request`}
                        onClick={() => startCategoryRequest(category)}
                        className={`group relative h-full w-[158px] shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-900 text-left text-white shadow-[0_4px_20px_rgba(15,23,42,0.15)] ring-1 ring-slate-900/10 transition-all hover:shadow-[0_10px_28px_rgba(15,23,42,0.3)] active:scale-[0.98] sm:w-[196px] ${active ? "ring-2 ring-blue-500" : ""}`}
                      >
                        <img src={resolveMediaUrl(image)} alt="" loading="lazy" draggable={false} onError={handleImageError} className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover transition-transform duration-500 group-hover:scale-110" />
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                        <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2.5">
                          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-amber-950 shadow-sm">
                            <Zap className="h-2.5 w-2.5" fill="currentColor" /> Help Now
                          </span>
                          <span className="text-[15px] font-black leading-tight drop-shadow-md">{category}</span>
                          <span className="line-clamp-2 text-[10px] leading-snug text-white/85">{CATEGORY_APPEAL[category]}</span>
                          <span className="mt-1 inline-flex w-fit items-center gap-0.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-900 shadow-md">
                            Submit this <ChevronRight className="h-3 w-3" />
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                aria-label="Shop Dream Now — Givethra Dreams"
                onClick={() => navigate({ to: "/dreams" })}
                className="group relative block h-16 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-teal-800 to-emerald-700 text-left shadow-[0_8px_24px_rgba(13,148,136,0.25)] ring-1 ring-teal-500/30 transition-all hover:shadow-[0_12px_32px_rgba(13,148,136,0.4)] active:scale-[0.99] sm:h-20"
              >
                <img src={resolveMediaUrl("/dreams-products-banner.jpg")} alt="" onError={handleImageError} className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-r from-teal-950/70 via-teal-900/20 to-teal-950/40" />
                <span className="absolute inset-y-0 left-4 flex items-center gap-2 text-base font-black text-white drop-shadow-lg sm:text-xl">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-amber-950 shadow-md sm:h-9 sm:w-9"><Sparkles className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" /></span>
                  <span>Shop Dream Now</span>
                </span>
                <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black text-teal-800 shadow-md sm:text-xs">
                  Givethra Dreams <ChevronRight className="h-3 w-3" />
                </span>
              </button>
            </div>
          </section>

          <section className="border-b border-slate-200 bg-background px-3 py-2.5">
            <div className="mx-auto max-w-7xl space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input type="text" placeholder="Search hospital, school, city..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-xl border-slate-200 bg-white pl-9 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-blue-300" />
                </div>
                <Button type="button" variant="outline" size="icon" aria-label="Filters" onClick={() => setShowFilters(!showFilters)} className="relative h-11 w-11 shrink-0 rounded-xl border-slate-200 shadow-sm hover:border-blue-300 hover:bg-blue-50">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-1 text-[9px] font-bold text-white shadow-sm">{activeFilterCount}</span>}
                </Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-11 w-[122px] shrink-0 rounded-xl border-slate-200 px-2 text-xs shadow-sm">
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
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Filters</h3>
                    {activeFilterCount > 0 && <button onClick={resetFilters} className="flex items-center gap-1 text-xs font-semibold text-red-600"><X className="h-3 w-3" /> Clear all</button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-600">Country</Label>
                      <Select value={filterCountry} onValueChange={(v) => { setFilterCountry(v); setFilterCity("all"); }}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="all">All Countries</SelectItem>
                          {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold text-slate-600">City</Label>
                      <Select value={filterCity} onValueChange={setFilterCity} disabled={filterCountry === "all"}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={filterCountry === "all" ? "Select country first" : "All cities"} /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          <SelectItem value="all">All Cities</SelectItem>
                          {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Category</Label>
                    <Select value={filterCat} onValueChange={setFilterCat}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="all">All Categories</SelectItem>
                        {FILTER_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-600">Urgency</Label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {["all", ...URGENCIES].map((u) => (
                        <button key={u} type="button" onClick={() => setFilterUrgency(u)} className={`rounded-lg border px-1 py-1.5 text-[11px] font-semibold transition ${filterUrgency === u ? "border-blue-600 bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                          {u === "all" ? "All" : u}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {orderedCategories.map((cat) => {
                  const count = Number(categoryCounts[cat] || 0);
                  const active = filterCat === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => selectCategory(cat)}
                      className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold shadow-sm transition-all ${
                        active
                          ? "border-blue-600 bg-gradient-to-r from-blue-600 to-sky-500 text-white"
                          : count > 0
                            ? "border-blue-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50"
                            : "border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      <span className="text-sm leading-none">{CATEGORY_EMOJI[cat] ?? "📌"}</span>
                      <span className="whitespace-nowrap">{cat}</span>
                      <span className={`rounded-full px-1.5 text-[10px] font-black leading-4 ${active ? "bg-white/25 text-white" : count > 0 ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section ref={resultsRef} className="scroll-mt-28 bg-gradient-to-b from-slate-50 to-white px-3 py-3.5">
            <div className="mx-auto max-w-7xl space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-black tracking-tight text-slate-900">
                  {filterCat !== "all" ? `${filterCat} Cases` : "Verified Cases"}
                  <span className="ml-1.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">({filtered.length})</span>
                </h2>
                {activeFilterCount > 0 && <button onClick={resetFilters} className="text-xs font-bold text-blue-600 hover:underline">Clear filters</button>}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[1,2,3,4,5,6].map((i) => (
                    <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-slate-200" />
                        <div className="flex-1 space-y-1.5"><div className="h-3 w-3/5 rounded bg-slate-200" /><div className="h-2.5 w-2/5 rounded bg-slate-100" /></div>
                      </div>
                      <div className="mt-3 space-y-1.5"><div className="h-4 w-5/6 rounded bg-slate-200" /><div className="h-3 w-4/6 rounded bg-slate-100" /></div>
                      <div className="mt-4 h-2 w-full rounded-full bg-slate-100" />
                      <div className="mt-4 h-9 w-full rounded-xl bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 px-4 py-10 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-blue-600">
                    <Search className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">No cases found.</p>
                  <p className="mt-0.5 text-xs text-slate-500">Try changing your filters or location.</p>
                  {activeFilterCount > 0 && <Button variant="outline" size="sm" className="mt-4 rounded-xl border-slate-300" onClick={resetFilters}>Clear Filters</Button>}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((c, i) => {
                    const cur = c.currency || "USD";
                    const s = sym(cur);
                    const needed = Number(c.amount_needed ?? 0);
                    const collected = Number(c.amount_collected ?? 0);
                    const percent = needed > 0 ? Math.min(Math.round((collected / needed) * 100), 100) : 0;
                    const remaining = Math.max(needed - collected, 0);
                    const displayCategory = normalizePublishedCategory(c.category);
                    const selfieUrl = typeof c.selfie_url === "string" && c.selfie_url.trim() ? c.selfie_url : null;
                    const requesterName = String(c.full_name || c.display_name || "Verified requester").trim();
                    const isDone = needed > 0 && collected >= needed;
                    const daysLeft = c.deadline ? daysUntilCaseDeadline(c.deadline, utcToday) : null;
                    const urgencyStyle = c.urgency === "Emergency"
                      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-sm"
                      : c.urgency === "High"
                        ? "bg-gradient-to-r from-orange-400 to-amber-500 text-amber-950 shadow-sm"
                        : c.urgency === "Medium"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-600";

                    return (
                      <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                        <div
                          className="group flex h-full cursor-pointer flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-[0_12px_28px_rgba(37,99,235,0.12)]"
                          onClick={() => navigate({ to: "/cases/$id", params: { id: c.id } })}
                        >
                          <div className="flex items-center gap-2">
                            {selfieUrl && (
                              <div className="relative">
                                <img src={resolveMediaUrl(selfieUrl)} alt={`${requesterName} selfie`} loading="lazy" onError={handleImageError} className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-blue-400/40 ring-offset-2" />
                                <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 ring-2 ring-white shadow-sm">
                                  <ShieldCheck className="h-2.5 w-2.5 text-amber-950" />
                                </span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="flex items-center gap-1 truncate text-xs font-bold text-slate-900">
                                <span className="truncate">{selfieUrl ? requesterName : `${CATEGORY_EMOJI[displayCategory] ?? "📌"} ${displayCategory}`}</span>
                              </p>
                              <p className="truncate text-[11px] text-slate-500">
                                {selfieUrl ? `${CATEGORY_EMOJI[displayCategory] ?? "📌"} ${displayCategory}` : `${c.city}, ${c.country}`}
                              </p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${urgencyStyle}`}>{c.urgency}</span>
                          </div>

                          <div>
                            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">{c.title}</h3>
                            {c.short_description && <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{c.short_description}</p>}
                          </div>

                          {needed > 0 && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-black text-blue-700">{s} {needed} <span className="font-medium text-slate-400">{cur}</span></span>
                                <span className="text-[11px] font-semibold text-slate-500">{isDone ? "Fully helped 🎉" : `${percent}% · ${s} ${remaining} left`}</span>
                              </div>
                              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div className={`h-full rounded-full transition-all ${isDone ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gradient-to-r from-blue-600 to-sky-400"}`} style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          )}

                          <div className="mt-auto flex items-center gap-2 pt-1">
                            <div className="min-w-0 flex-1 text-[11px] text-slate-500">
                              {selfieUrl && <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" /> {c.city}, {c.country}</span>}
                              {daysLeft != null && daysLeft >= 0 && (
                                <span className={`font-bold ${daysLeft <= 3 ? "text-red-600" : "text-amber-600"}`}>
                                  ⏳ {daysLeft === 0 ? "Expires TODAY!" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              aria-label={`Help now with ${c.title || "this case"}`}
                              onClick={(event) => { event.stopPropagation(); navigate({ to: "/cases/$id", params: { id: c.id } }); }}
                              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 text-sm font-black text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] transition-all hover:from-blue-700 hover:to-sky-600 hover:shadow-[0_6px_18px_rgba(37,99,235,0.45)] active:scale-[.97]"
                            >
                              <Heart className="h-3.5 w-3.5" fill="currentColor" />
                              Help Now
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="border-b border-slate-200 bg-white px-4 py-4">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6">
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-slate-800 transition-colors hover:text-green-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50"><MessageCircle className="h-5 w-5 text-green-600" /></span>
                <span>WhatsApp Channel</span>
              </a>
              <span className="select-none text-lg text-slate-300">|</span>
              <a href="https://wa.me/message/42CJXLUYEI2KM1?src=qr" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-slate-800 transition-colors hover:text-blue-600">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50"><MessageCircle className="h-5 w-5 text-blue-600" /></span>
                <span>24/7 Customer Support</span>
              </a>
            </div>
          </section>

          {!isAuthenticated && (
            <section className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-8">
              <div className="mx-auto max-w-2xl space-y-5 text-center">
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-black tracking-tight text-slate-900">Connect with Givethra</h2>
                  <p className="text-sm text-slate-500">Follow us and reach out — we're here to help.</p>
                </div>
                <SocialLinks className="justify-center" />
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:underline">
                  <MessageCircle className="h-4 w-4" /> Follow our WhatsApp Channel
                </a>
                <div>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
                    <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
                  </a>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-200 pt-5 text-sm text-slate-500">
                  <Link to="/about" className="transition-colors hover:text-blue-600">About</Link>
                  <Link to="/faq" className="transition-colors hover:text-blue-600">FAQ</Link>
                  <Link to="/privacy-policy" className="transition-colors hover:text-blue-600">Privacy Policy</Link>
                  <Link to="/terms" className="transition-colors hover:text-blue-600">Terms</Link>
                  <Link to="/community-guidelines" className="transition-colors hover:text-blue-600">Community Guidelines</Link>
                  <Link to="/contact" className="transition-colors hover:text-blue-600">Contact Us</Link>
                </div>
                <p className="pt-1 text-xs text-slate-400">© {new Date().getFullYear()} Givethra. All rights reserved.</p>
              </div>
            </section>
          )}
        </>}

        {isAuthenticated && <HomeSocialDashboard notificationCount={notifCount} />}
      </div>
    </Layout>
  );
}
