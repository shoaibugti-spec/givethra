// src/frontend/src/pages/HomePage.tsx
// Givethra - Complete HomePage with Help Now slider, case listings, etc.
// This is the main dashboard page shown after role selection

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { runUserGuide } from "@/lib/userGuide";
import { orderCasesForViewer } from "@/lib/caseOrdering";
import { getCaseCalendarDate, isCasePastDeadline, isExpiredCaseRecord, daysUntilCaseDeadline } from "@/lib/caseExpiry";
import { handleImageError, resolveMediaUrl } from "@/lib/media";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Briefcase,
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
  Mail,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  Gift,
  Battery,
  Flame,
  Droplets,
  GraduationCap,
  Stethoscope,
  ShoppingCart,
  Share2,
  Home,
  BookOpen,
  Pill,
  Apple,
  Baby,
  Accessibility,
  Gem,
  Wrench,
  Tractor,
  CreditCard,
  Siren,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getApprovedCases,
  getCategoryCounts,
  getKycStatus,
  getWallet,
  getUnlockCount,
  getUnreadNotificationsCount,
  getProfile,
  searchUsers,
  getCommunityPosts,
  createCommunityPost,
  getUserSupports,
  getEarningsSummary,
  requestWithdrawal,
  supportPost,
  followUser,
  unfollowUser,
} from "@/lib/api";
import SlidingHomePanel from "@/components/SlidingHomePanel";

// Support earnings conversion: 10,000 = $1.

const WHATSAPP_URL =
  "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J";
const SUPPORT_WHATSAPP_URL =
  "https://wa.me/message/42CJXLUYEI2KM1?src=qr";
const WELCOME_POPUP_INTERVAL_MS = 12 * 60 * 60 * 1000;
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

function sym(cur?: string) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}

function normalizePublishedCategory(value: unknown): string {
  const category = String(value ?? "").trim();
  if (category === "School, College & University Fees") return "School Fees";
  if (category === "Education, Books & Admission") return "Education & Books";
  return category;
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
  "Orphan Support",
  "Widow & Elderly Support",
  "Disability Support",
  "Marriage Support",
  "Business / Work Help",
  "Home Repair",
  "Funeral Expenses",
  "Livestock / Farming",
  "Debt Relief",
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

const URGENCIES = [
  "Low",
  "Medium",
  "High",
  "Emergency",
];

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

function HomeSocialDashboard({ notificationCount = 0 }: { notificationCount?: number }) {
  const { user } = useAuth();
  const { role } = useRole();
  const [walletBalance, setWalletBalance] = useState(0);
  const [supports, setSupports] = useState(0);
  const [supportsGiven, setSupportsGiven] = useState(0);
  const [supportEarningsUsd, setSupportEarningsUsd] = useState(0);
  const [earningsSummary, setEarningsSummary] = useState<any>(null);
  const [activeMoneyTab, setActiveMoneyTab] = useState<"earning" | "support" | "wallet">(() => {
    if (typeof window === "undefined") return "support";
    try {
      const saved = window.localStorage.getItem("givethra_home_mode");
      return saved === "earning" || saved === "wallet" ? saved : "support";
    } catch {
      return "support";
    }
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
    const [walletResult, supportResult, earningsResult, postsResult, ownPostsResult] = await Promise.allSettled([
      getWallet(user.id),
      getUserSupports(user.id),
      getEarningsSummary(),
      getCommunityPosts(feedTab),
      getCommunityPosts("my-posts"),
    ]);
    if (requestId !== homeLoadRequestRef.current) return;
    if (walletResult.status === "fulfilled") setWalletBalance(Number(walletResult.value?.balance || 0));
    if (supportResult.status === "fulfilled") setSupports(Number(supportResult.value?.supports || 0));
    if (supportResult.status === "fulfilled") {
      const supportData = supportResult.value as typeof supportResult.value & {
        supportsGiven?: number;
        supportEarningsUsd?: number;
      };
      setSupportsGiven(Number(supportData?.supportsGiven || 0));
      setSupportEarningsUsd(Number(supportData?.supportEarningsUsd || 0));
    }
    if (earningsResult.status === "fulfilled") setEarningsSummary(earningsResult.value);
    if (postsResult.status === "fulfilled") setPosts(Array.isArray(postsResult.value) ? postsResult.value : []);
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
    if (query.length < 2) {
      setUserResults([]);
      setSearchingUsers(false);
      setUserSearchError("");
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setSearchingUsers(true);
      setUserSearchError("");
      try {
        const results = await searchUsers(query);
        if (!cancelled) setUserResults(Array.isArray(results) ? results : []);
      } catch (error) {
        if (!cancelled) {
          setUserResults([]);
          setUserSearchError(error instanceof Error ? error.message : "Search is temporarily unavailable.");
        }
      } finally {
        if (!cancelled) setSearchingUsers(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [submittedUserQuery]);

  const submitPost = async () => {
    const text = message.trim();
    if (posting || !text || !user?.id || (postCooldownUntil != null && postCooldownUntil > Date.now())) return;
    setPosting(true);
    try {
      const created = await createCommunityPost({ message: text, user_id: user.id, display_name: user.fullName || "User", is_guest: false });
      setPosts((current) => [{ ...created, display_name: created?.display_name || user.fullName || "User", message: text, likes_count: 0, support_count: 0 }, ...current]);
      setMessage("");
      setPostCooldownUntil(Date.now() + 24 * 60 * 60 * 1000);
      toast.success("Your post is live. You can publish again after 24 hours.");
    } catch (error) {
      const nextPostAt = Number((error as any)?.nextPostAt ? new Date((error as any).nextPostAt).getTime() : 0);
      if (nextPostAt > Date.now()) setPostCooldownUntil(nextPostAt);
      toast.error(error instanceof Error ? error.message : "Post could not be published");
    } finally {
      setPosting(false);
    }
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
      else {
        await navigator.clipboard?.writeText(`${text}\n${url}`);
        toast.success("Post link copied");
      }
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
        ...item,
        support_count: Number(result?.support_count ?? Number(item.support_count || 0) + 1),
        supported_by_me: true,
      } : item));
      setSupports((value) => value + 1);
      if (result?.supportEarningsUsd != null) setSupportEarningsUsd(Number(result.supportEarningsUsd));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Support could not be added");
    } finally {
      setBusyPost(null);
    }
  };
  const togglePostHero = async (post: any) => {
    if (!post?.user_id || post.user_id === user?.id || busyPost != null) return;
    setBusyPost(`hero:${post.id}`);
    try {
      if (post.is_following) await unfollowUser(String(post.user_id));
      else await followUser(String(post.user_id));
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, is_following: !post.is_following } : item));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Hero action could not be completed");
    } finally {
      setBusyPost(null);
    }
  };

  return (
      <SlidingHomePanel onTabChange={setActiveMoneyTab}>
      <div className="min-h-full bg-muted/20 pb-24">
        <div className="mx-auto max-w-3xl space-y-4 px-3 py-4 md:px-5 md:py-7">
          <section className="rounded-2xl bg-card px-5 py-5 shadow-sm border border-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Givethra Home</p>
                <h1 className="mt-1 text-2xl font-bold text-foreground md:text-3xl">Welcome {role === "hero" ? "Hero" : "Requester"}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{role === "hero" ? "Your kindness creates real impact." : "Share your journey and connect with support."}</p>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                {(user?.fullName || "U").slice(0, 1).toUpperCase()}
              </div>
            </div>
            {activeMoneyTab === "support" ? <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4"><p className="font-semibold">Support Center</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Support others and receive support on your own posts. Both given and received Supports count toward your 5,000 eligibility target.</p><p className="mt-2 text-[11px] text-muted-foreground">10,000 Supports = $1</p><p className="mt-3 text-xs font-semibold text-primary">Eligibility: {Number(earningsSummary?.eligibility_supports || 0).toLocaleString()} / 5,000 Supports</p></div> : null}
            {activeMoneyTab === "earning" ? <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/20"><div className="flex items-center justify-between"><p className="font-semibold">Earnings</p><span className={earningsSummary?.earnings_eligible ? "text-emerald-600" : "text-amber-700"}>{earningsSummary?.earnings_eligible ? "Eligible" : "Not eligible yet"}</span></div><p className="mt-1 text-xs text-muted-foreground">Your posts earn only after eligibility. Current earnings: ${Number(earningsSummary?.earnings_usd || supportEarningsUsd).toFixed(4)}</p><div className="mt-3 space-y-2">{(earningsSummary?.posts || []).map((entry: any) => <div key={entry.id} className="flex justify-between rounded-lg bg-white/70 px-3 py-2 text-xs"><span>Post {String(entry.post_id).slice(0, 8)} · {entry.supports} Support</span><strong>{Number(entry.amount_pkr).toFixed(2)} PKR</strong></div>)}</div></div> : null}
            {activeMoneyTab === "wallet" ? <div className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-4"><div className="flex items-center justify-between"><p className="font-semibold">Wallet</p><strong className="text-primary">{Number(earningsSummary?.wallet_pkr || 0).toFixed(2)} PKR</strong></div><p className="mt-1 text-xs text-muted-foreground">Withdrawal opens from the 30th through the 3rd. Minimum 300 PKR.</p><div className="mt-4 rounded-2xl border border-primary/15 bg-background p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-primary">Withdrawal Request</p><div className="mt-3 grid gap-3"><label className="grid gap-1 text-xs font-semibold text-muted-foreground">Bank name<input value={withdrawalForm.bank_name} onChange={e => setWithdrawalForm({ ...withdrawalForm, bank_name: e.target.value })} placeholder="Enter bank name" className="h-10 rounded-lg border border-border bg-muted/20 px-3 text-sm font-normal text-foreground" /></label><label className="grid gap-1 text-xs font-semibold text-muted-foreground">Account title<input value={withdrawalForm.account_title} onChange={e => setWithdrawalForm({ ...withdrawalForm, account_title: e.target.value })} placeholder="Enter account title" className="h-10 rounded-lg border border-border bg-muted/20 px-3 text-sm font-normal text-foreground" /></label><label className="grid gap-1 text-xs font-semibold text-muted-foreground">Account number / IBAN<input value={withdrawalForm.account_number} onChange={e => setWithdrawalForm({ ...withdrawalForm, account_number: e.target.value })} placeholder="Enter account number or IBAN" className="h-10 rounded-lg border border-border bg-muted/20 px-3 text-sm font-normal text-foreground" /></label><label className="grid gap-1 text-xs font-semibold text-muted-foreground">Amount (PKR)<input value={withdrawalForm.amount} onChange={e => setWithdrawalForm({ ...withdrawalForm, amount: e.target.value })} placeholder="Minimum 300 PKR" inputMode="decimal" className="h-10 rounded-lg border border-border bg-muted/20 px-3 text-sm font-normal text-foreground" /></label><Button className="w-full" disabled={!earningsSummary?.withdrawal_open || Number(earningsSummary?.wallet_pkr || 0) < 300} onClick={async () => { try { await requestWithdrawal({ ...withdrawalForm, amount: Number(withdrawalForm.amount || earningsSummary?.wallet_pkr || 0) }); toast.success("Withdrawal request sent to Admin."); setEarningsSummary(await getEarningsSummary()); } catch (error) { toast.error(error instanceof Error ? error.message : "Withdrawal failed"); } }}>Request withdrawal</Button></div></div></div> : null}
            {activeMoneyTab === "wallet" && (earningsSummary?.withdrawals || []).length > 0 ? <div className="mt-4 rounded-2xl border border-border bg-card p-4"><p className="text-sm font-bold">Withdrawal History</p><div className="mt-3 space-y-2">{earningsSummary.withdrawals.map((item: any) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs"><span>{Number(item.amount_pkr).toFixed(2)} PKR · <strong className="capitalize">{item.status}</strong></span>{item.payment_proof_url ? <a href={item.payment_proof_url} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">View payment proof</a> : <span className="text-muted-foreground">Awaiting admin proof</span>}</div>)}</div></div> : null}
          </section>

          {activeMoneyTab === "support" ? <>
          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <div>
                <h2 className="text-sm font-bold text-foreground">Find people in Givethra</h2>
                <p className="text-xs text-muted-foreground">Search by name or username, then open their profile.</p>
              </div>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={userQuery} onChange={(event) => setUserQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); setSubmittedUserQuery(userQuery); } }} autoComplete="off" inputMode="search" placeholder="Search name or @username" className="h-11 w-full rounded-xl border border-border bg-muted/20 pl-10 pr-24 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <button type="button" onClick={() => setSubmittedUserQuery(userQuery)} disabled={userQuery.trim().length < 2} className="absolute right-1 top-1 h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">Search</button>
            </div>
            {submittedUserQuery.trim().length >= 2 && (
              <div className="mt-3 space-y-2">
                {searchingUsers ? <p className="py-3 text-center text-xs text-muted-foreground">Searching…</p> : userSearchError ? <p className="py-3 text-center text-xs text-red-600">{userSearchError}</p> : userResults.length === 0 ? <p className="py-3 text-center text-xs text-muted-foreground">No users found.</p> : userResults.map((result) => (
                  <Link key={result.user_id} to="/profile/$id" params={{ id: String(result.user_id) }} className="flex items-center gap-3 rounded-xl border border-border/70 p-3 transition hover:border-primary/40 hover:bg-primary/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{result.avatar_url ? <img src={resolveMediaUrl(result.avatar_url)} alt="" onError={handleImageError} className="h-full w-full object-cover" /> : String(result.full_name || "U").slice(0, 1).toUpperCase()}</div>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{result.full_name || "Givethra member"}</p><p className="truncate text-xs text-muted-foreground">{result.username ? `@${result.username}` : "Givethra member"}{result.city ? ` · ${result.city}` : ""}</p></div>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{(user?.fullName || "U").slice(0, 1).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <p className="mb-2 text-sm font-semibold">{user?.fullName || "Your profile"}</p>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="What’s on your mind to share?" rows={3} className="w-full resize-none rounded-xl border border-border bg-muted/20 p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                <div className="mt-3 flex items-center justify-between gap-3"><span className="text-[11px] text-muted-foreground">{postLocked ? `Post locked · ${cooldownHours}h ${cooldownMinutes}m ${cooldownSeconds}s left` : "One post per 24 hours · Support others to grow the community"}</span><Button onClick={submitPost} disabled={posting || !message.trim() || postLocked}>{posting ? "Posting..." : postLocked ? "Post Locked" : "Post"}</Button></div>
              </div>
            </div>
          </section>

          <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-sm">
            {[ ["for-you", "For You"], ["latest", "Latest"], ["most-supported", "Most Supported"], ["my-posts", "My Posts"] ].map(([value, label]) => (
              <button key={value} type="button" onClick={() => setFeedTab(value as typeof feedTab)} className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${feedTab === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{label}</button>
            ))}
          </div>

          {loading ? <div className="py-12 text-center text-sm text-muted-foreground">Loading your feed...</div> : posts.length === 0 ? <div className="rounded-2xl border border-dashed bg-card py-12 text-center text-sm text-muted-foreground">No posts yet. Be the first to share something.</div> : posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3"><Link to="/profile/$id" params={{ id: String(post.user_id || "me") }} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary">{post.avatar_url ? <img src={post.avatar_url} alt="" className="h-full w-full object-cover" /> : String(post.display_name || "U").slice(0, 1).toUpperCase()}</Link><div className="min-w-0"><div className="flex items-center gap-2"><Link to="/profile/$id" params={{ id: String(post.user_id || "me") }} className="truncate text-sm font-semibold hover:text-primary">{post.display_name || "User"}</Link>{post.user_id && post.user_id !== user?.id && <button type="button" disabled={busyPost === `hero:${post.id}`} onClick={() => togglePostHero(post)} className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">{post.is_following ? "Hero ✓" : "Hero"}</button>}</div><p className="text-xs text-muted-foreground">{relativePostTime(post.created_at)} · {post.is_verified ? "Verified member" : "Givethra member"}</p></div></div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{post.message}</p>
              <div className="mt-4 flex gap-2 border-t border-border pt-3"><button type="button" disabled={busyPost === `support:${post.id}` || Boolean(post.supported_by_me) || post.user_id === user?.id} onClick={() => reactToPost(post)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${post.supported_by_me ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-primary/20 text-primary hover:bg-primary/10"}`}>{post.supported_by_me ? "Supported ✓" : "🫴🏻 Support"} · {Number(post.support_count || 0)}</button><button type="button" onClick={() => sharePost(post)} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"><Share2 className="h-4 w-4" /> Share</button></div>
            </article>
          ))}
          </> : null}
        </div>
      </div>
      </SlidingHomePanel>
  );
}

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
    } catch {
      return "support";
    }
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
    } catch {
      setShowWhatsAppWelcome(true);
    }
  }, [whatsappWelcomeStorageKey]);

  const closeWhatsAppWelcome = () => {
    setShowWhatsAppWelcome(false);
  };

  const followWhatsAppChannel = () => {
    setShowWhatsAppWelcome(false);
  };

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
            if (data?.countryName) {
              setDetectedCountry(data.countryName);
            }
            if (data?.city || data?.locality) {
              setDetectedCity(data.city || data.locality);
            }
          } catch {}
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setUserCountry(null);
      return;
    }
    getProfile(user.id)
      .then((profile) => setUserCountry(profile?.country || null))
      .catch(() => setUserCountry(null));
  }, [user?.id]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      runUserGuide(user.id);
      loadNotifCount();
      loadGuideStatus();
      loadUnlockCount();

      const interval = setInterval(loadNotifCount, 20000);
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
    } catch {}
  }

  async function loadGuideStatus() {
    if (!user?.id) return;
    try {
      const kyc = await getKycStatus(user.id);
      setKycStatus(kyc?.status ?? "none");
      const wallet = await getWallet(user.id);
      setBalance(wallet?.balance ?? 0);
    } catch {}
  }

  async function loadUnlockCount() {
    if (!user?.id) return;
    try {
      const count = await getUnlockCount(user.id);
      setUnlockCount(count ?? 0);
    } catch {}
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
    } catch {
      // ignore
    } finally {
      if (requestId === casesLoadRequestRef.current) setLoading(false);
    }
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
    } catch {
      // The published cases remain visible even if the count endpoint is unavailable.
    }
  }

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

  // Sort by published count while preserving the original sequence for ties and zeros.
  const orderedCategories = [...FILTER_CATEGORIES].sort((a, b) => Number(categoryCounts[b] || 0) - Number(categoryCounts[a] || 0));

  let filtered = cases.filter((c) => {
    if (isCasePastDeadline(c.deadline, utcToday)) return false;
    if (filterCountry !== "all" && c.country !== filterCountry) return false;
    if (filterCity !== "all" && c.city !== filterCity) return false;
    if (filterCat !== "all" && normalizePublishedCategory(c.category) !== filterCat) return false;
    if (filterUrgency !== "all" && c.urgency !== filterUrgency) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !c.title?.toLowerCase().includes(q) &&
        !c.short_description?.toLowerCase().includes(q) &&
        !c.description?.toLowerCase().includes(q) &&
        !c.institute_name?.toLowerCase().includes(q) &&
        !c.city?.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  filtered = orderCasesForViewer(filtered, userCountry || detectedCountry, sortBy);

  const activeFilterCount = [filterCountry, filterCity, filterCat, filterUrgency].filter(
    (f) => f !== "all"
  ).length;

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
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function startCategoryRequest(category: string) {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    setSelectedCategory(category);
    try {
      localStorage.setItem("givethra_prefill_category", CATEGORY_FORM_NAME[category] || category);
    } catch {}
    navigate({ to: "/submit-request" });
  }

  return (
    <Layout>
      <div className="bg-background pb-20 md:pb-0">
        {showWhatsAppWelcome && (
          <div className="pointer-events-none fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/45 p-4 sm:items-center">
            <div role="dialog" aria-modal="true" aria-labelledby="whatsapp-welcome-title" className="pointer-events-auto relative w-full max-w-sm rounded-2xl border border-green-200 bg-card p-5 shadow-2xl dark:border-green-900">
              <button type="button" onClick={closeWhatsAppWelcome} aria-label="Close WhatsApp welcome" className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-4 w-4" /></button>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-950/40"><MessageCircle className="h-6 w-6" /></div>
              <h2 id="whatsapp-welcome-title" className="mt-4 text-xl font-bold">Stay updated with Givethra</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Follow our WhatsApp Channel for new updates, important announcements and community news.</p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={followWhatsAppChannel} className="flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-green-700">Follow WhatsApp Channel</a>
                <Link to="/dreams" onClick={closeWhatsAppWelcome} className="flex w-full items-center justify-center gap-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90">Shop Dreams under Rs 500 <ChevronRight className="h-4 w-4" /></Link>
              </div>
              <button type="button" onClick={closeWhatsAppWelcome} className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted">Maybe later</button>
            </div>
          </div>
        )}

        <a
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open 24/7 WhatsApp support"
          title="24/7 WhatsApp Support"
          className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl ring-4 ring-white/80 transition-all hover:scale-105 hover:bg-[#1EBE5A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-300 md:bottom-6 md:right-6"
        >
          <SiWhatsapp className="h-8 w-8" />
          <span className="absolute -right-1 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-black leading-none text-primary-foreground shadow-sm">24/7</span>
        </a>

        {homeMode === "support" && <>
        <InstallButton />
        <CompletionCooldownBanner />

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

                {/* --- HERO ROW: 2 action buttons + horizontal category cards --- */}
        <section className="bg-card border-b border-border">
          <div className="mx-auto max-w-7xl space-y-2.5 px-3 py-3">
            <div className="flex h-[212px] gap-2">
              {/* Left: two stacked action buttons */}
              <div className="flex w-[104px] shrink-0 flex-col gap-2 sm:w-[132px]">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/become-hero" })}
                  className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 px-2 text-center text-white shadow-sm transition active:scale-[0.97]"
                >
                  <Heart className="h-6 w-6 text-red-400" fill="currentColor" />
                  <span className="text-[13px] font-extrabold leading-tight">Become<br />A Hero</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/need-help" })}
                  className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 px-2 text-center text-amber-950 shadow-sm transition active:scale-[0.97]"
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-[13px] font-extrabold leading-tight">Request<br />Help</span>
                </button>
              </div>

              {/* Right: category cards (same box size, swipe sideways) */}
              <div className="flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto scrollbar-hide">
                {FILTER_CATEGORIES.map((category) => {
                  const image = CATEGORY_SLIDE_MEDIA[category] || "/assets/generated/help-livelihood.jpg";
                  const active = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-label={`Start ${category} help request`}
                      onClick={() => startCategoryRequest(category)}
                      className={`relative h-full w-[152px] shrink-0 snap-start overflow-hidden rounded-2xl bg-slate-900 text-left text-white shadow-sm transition active:scale-[0.98] sm:w-[190px] ${active ? "ring-2 ring-primary" : ""}`}
                    >
                      <img
                        src={resolveMediaUrl(image)}
                        alt=""
                        loading="lazy"
                        draggable={false}
                        onError={handleImageError}
                        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                      />
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-2.5">
                        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/75">Help Now</span>
                        <span className="text-[15px] font-extrabold leading-tight drop-shadow">{category}</span>
                        <span className="line-clamp-2 text-[10px] leading-snug text-white/85">{CATEGORY_APPEAL[category]}</span>
                        <span className="mt-1 inline-flex w-fit items-center gap-0.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow">
                          Submit this request <ChevronRight className="h-3 w-3" />
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shop Dream banner */}
            <button
              type="button"
              aria-label="Shop Dream Now — Givethra Dreams"
              onClick={() => navigate({ to: "/dreams" })}
              className="group relative block h-16 w-full overflow-hidden rounded-2xl bg-teal-800 text-left shadow-sm transition active:scale-[0.99] sm:h-20"
            >
              <img
                src={resolveMediaUrl("/dreams-products-banner.jpg")}
                alt=""
                onError={handleImageError}
                className="h-full w-full object-cover object-center"
              />
              <span className="absolute inset-0 bg-gradient-to-r from-teal-950/60 via-teal-900/15 to-teal-950/35" />
              <span className="absolute inset-y-0 left-4 flex items-center gap-2 text-base font-extrabold text-white drop-shadow sm:text-xl">
                <Sparkles className="h-5 w-5 shrink-0" />
                <span>Shop Dream Now</span>
              </span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold text-teal-800 shadow sm:text-xs">
                Givethra Dreams <ChevronRight className="ml-0.5 inline h-3 w-3" />
              </span>
            </button>
          </div>
        </section>
        {/* --- END HERO ROW --- */}




                {/* Compact search + filter + sort (one line) and category chips */}
        <section className="border-b border-border bg-background px-3 py-2">
          <div className="mx-auto max-w-7xl space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search hospital, school, city..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 pl-8 text-sm"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Filters"
                onClick={() => setShowFilters(!showFilters)}
                className="relative h-10 w-10 shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-10 w-[118px] shrink-0 px-2 text-xs">
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
              <div className="space-y-3 rounded-2xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="flex items-center gap-1 text-xs text-red-600">
                      <X className="h-3 w-3" /> Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Country</Label>
                    <Select value={filterCountry} onValueChange={(v) => { setFilterCountry(v); setFilterCity("all"); }}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="all">All Countries</SelectItem>
                        {countries.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">City</Label>
                    <Select value={filterCity} onValueChange={setFilterCity} disabled={filterCountry === "all"}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder={filterCountry === "all" ? "Select country first" : "All cities"} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="all">All Cities</SelectItem>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Category</Label>
                  <Select value={filterCat} onValueChange={setFilterCat}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="all">All Categories</SelectItem>
                      {FILTER_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Urgency</Label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {["all", ...URGENCIES].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setFilterUrgency(u)}
                        className={`rounded-lg border px-1 py-1.5 text-[11px] font-medium ${
                          filterUrgency === u ? "border-primary bg-primary text-white" : "border-border"
                        }`}
                      >
                        {u === "all" ? "All" : u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Category chips: one slim row, categories with cases come first */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {orderedCategories.map((cat) => {
                const count = Number(categoryCounts[cat] || 0);
                const active = filterCat === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => selectCategory(cat)}
                    className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold transition-colors ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : count > 0
                          ? "border-primary/30 bg-card text-foreground"
                          : "border-border bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span className="text-sm leading-none">{CATEGORY_EMOJI[cat] ?? "📌"}</span>
                    <span className="whitespace-nowrap">{cat}</span>
                    <span className={`rounded-full px-1.5 text-[10px] font-extrabold leading-4 ${
                      active ? "bg-white/25 text-white" : count > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section ref={resultsRef} className="scroll-mt-28 bg-background px-3 py-3">
          <div className="mx-auto max-w-7xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold">
                {filterCat !== "all" ? `${filterCat} Cases` : "Verified Cases"}
                <span className="ml-1.5 text-sm font-semibold text-primary">({filtered.length})</span>
              </h2>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="text-xs font-semibold text-primary">
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-foreground">No cases found.</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Try changing your filters or location.</p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                )}
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

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    >
                      <div
                        className="flex h-full cursor-pointer flex-col gap-2 rounded-2xl border border-border bg-card p-3 transition-all hover:border-primary/40 hover:shadow-md"
                        onClick={() => navigate({ to: "/cases/$id", params: { id: c.id } })}
                      >
                        <div className="flex items-center gap-2">
                          {selfieUrl && (
                            <img
                              src={resolveMediaUrl(selfieUrl)}
                              alt={`${requesterName} selfie`}
                              loading="lazy"
                              onError={handleImageError}
                              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1 truncate text-xs font-bold text-foreground">
                              {selfieUrl && <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />}
                              <span className="truncate">{selfieUrl ? requesterName : `${CATEGORY_EMOJI[displayCategory] ?? "📌"} ${displayCategory}`}</span>
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {selfieUrl ? `${CATEGORY_EMOJI[displayCategory] ?? "📌"} ${displayCategory}` : `${c.city}, ${c.country}`}
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              c.urgency === "Emergency" ? "bg-red-100 text-red-700" :
                              c.urgency === "High" ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {c.urgency}
                          </span>
                        </div>

                        <div>
                          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground">{c.title}</h3>
                          {c.short_description && (
                            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{c.short_description}</p>
                          )}
                        </div>

                        {needed > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-primary">{s} {needed} <span className="font-medium text-muted-foreground">{cur}</span></span>
                              <span className="text-muted-foreground">{isDone ? "Fully helped 🎉" : `${percent}% · ${s} ${remaining} left`}</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className={`h-1.5 rounded-full transition-all ${isDone ? "bg-green-500" : "bg-primary"}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-auto flex items-center gap-2 pt-1">
                          <div className="min-w-0 flex-1 text-[11px] text-muted-foreground">
                            {selfieUrl && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 shrink-0" /> {c.city}, {c.country}
                              </span>
                            )}
                            {daysLeft != null && daysLeft >= 0 && (
                              <span className={`font-bold ${daysLeft <= 3 ? "text-red-600" : "text-amber-600"}`}>
                                ⏳ {daysLeft === 0 ? "Expires TODAY!" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            aria-label={`Help now with ${c.title || "this case"}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate({ to: "/cases/$id", params: { id: c.id } });
                            }}
                            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-extrabold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[.97]"
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

{/* --- WhatsApp links --- */}
        <section className="py-4 px-4 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 flex-wrap">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-green-600 transition-colors"
            >
              <MessageCircle className="h-6 w-6 text-green-600" />
              <span>WhatsApp Channel</span>
            </a>
            <span className="text-muted-foreground text-lg select-none">|</span>
            <a
              href="https://wa.me/message/42CJXLUYEI2KM1?src=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="h-6 w-6 text-primary" />
              <span>24/7 Customer Support</span>
            </a>
          </div>
        </section>

        <section className="py-6 px-4 bg-card border-t border-border">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-foreground">Connect with Givethra</h2>
              <p className="text-sm text-muted-foreground">Follow us and reach out — we're here to help.</p>
            </div>
            <SocialLinks className="justify-center" />
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:underline">
              <MessageCircle className="h-4 w-4" /> Follow our WhatsApp Channel
            </a>
            <div>
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                <Mail className="h-4 w-4" /> {CONTACT_EMAIL}
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 border-t border-border text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-primary transition-colors">About</Link>
              <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
              <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/community-guidelines" className="hover:text-primary transition-colors">Community Guidelines</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              © {new Date().getFullYear()} Givethra. All rights reserved.
            </p>
          </div>
        </section>
        </>}

        {isAuthenticated && <HomeSocialDashboard notificationCount={notifCount} />}
      </div>
    </Layout>
  );
}
