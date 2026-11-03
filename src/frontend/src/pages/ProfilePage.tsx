// src/frontend/src/pages/ProfilePage.tsx
// Givethra - Premium Profile Page Design
// 🔥 All backend logic, data loading, and error handling remain 100% intact.

import Layout from "@/components/Layout";
import { helpme } from "@/lib/helpme";
import DepositPanel from "@/components/DepositPanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate, useLocation } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Gift,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Settings,
  ShieldCheck,
  Wallet,
  HandCoins,
  HeartHandshake,
  Users,
  Award,
  Trophy,
  Sparkles,
  Info,
  MoreHorizontal,
  Pin,
  AlertCircle,
  UserPlus,
  UserMinus,
  UserCheck,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getKycSubmission,
  getProfile,
  getProfileStats,
  getWallet,
  getCasesByUser,
  getCaseResolutionsByHero,
  getCaseUnlocksByHero,
  getFollowList,
  followUser,
  unfollowUser,
  removeRequester,
  supportPost,
} from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isTrulyCompletedHelp } from "@/lib/resolutionStatus";
import { computeHeroStats, computeRequesterStats, type HeroStats, type RequesterStats } from "@/lib/profileStats";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const SUPPORTS_PER_DOLLAR = 10000;

// ---------------------------------------------------------------------------
// Helpers (Unchanged Logic)
// ---------------------------------------------------------------------------
function getBadge(unlockCount: number, contributionCount: number, directHelpCount: number) {
  if (contributionCount >= 3 && directHelpCount >= 3 || contributionCount + directHelpCount >= 10) {
    return { title: "Super Hero", emoji: "🌟", description: "You have unlocked cases, contributed, and provided direct help. You are the ultimate Hero!", icon: <Trophy className="h-4 w-4 text-yellow-500" />, color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-orange-500/30" };
  }
  if (directHelpCount > 0 || contributionCount > 0) {
    return { title: "Hero", emoji: "🦸", description: "You paid directly for someone's need. You are a true Hero!", icon: <Award className="h-4 w-4 text-blue-500" />, color: "bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-blue-500/30" };
  }
  if (unlockCount > 0) {
    return { title: "Young Hero", emoji: "⭐", description: "You unlocked a case. Complete a contribution or direct help to become a full Hero.", icon: <Sparkles className="h-4 w-4 text-green-500" />, color: "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-emerald-500/30" };
  }
  return { title: "Newborn Hero", emoji: "🆕", description: "Your Hero journey is ready to begin.", icon: <Sparkles className="h-4 w-4 text-purple-500" />, color: "bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-pink-500/30" };
}

function getTrustLevel(rejected: number, approved: number, expired: number) {
  let trust = 100;
  trust -= rejected * 10;
  trust += approved * 5;
  trust -= expired * 5;
  return Math.max(0, Math.min(100, trust));
}

function getCaseStatusStyle(status: string) {
  const s = String(status || "").toLowerCase();
  if (s === "completed") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "active" || s === "approved" || s === "live") return "bg-teal-50 text-teal-700 border-teal-200";
  if (s === "rejected") return "bg-red-50 text-red-700 border-red-200";
  if (s === "expired") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  const rawParam = location.pathname.match(/^\/profile\/([^/]+)/)?.[1];
  const profileUserId = (!rawParam || rawParam === "me") ? (user?.id || "") : rawParam;

  const isOwnProfile = Boolean(user?.id && profileUserId === user.id);
  const [kycData, setKycData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [cases, setCases] = useState<any[]>([]);
  const [showLogout, setShowLogout] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [profileView, setProfileView] = useState<"overview" | "help" | "cases">("overview");
  const [profileLoading, setProfileLoading] = useState(true);
  const [isMyHero, setIsMyHero] = useState(false);
  const [heroUpdating, setHeroUpdating] = useState(false);
  const [badgeInfoOpen, setBadgeInfoOpen] = useState(false);
  const [heroesCount, setHeroesCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [supportsCount, setSupportsCount] = useState(0);
  const [supportEarningsUsd, setSupportEarningsUsd] = useState(0);
  const [relationshipType, setRelationshipType] = useState<"heroes" | "requesters" | null>(null);
  const [relationshipUsers, setRelationshipUsers] = useState<any[]>([]);
  const [relationshipLoading, setRelationshipLoading] = useState(false);
  const [supportingPostId, setSupportingPostId] = useState<string | null>(null);

  const [requesterStats, setRequesterStats] = useState<RequesterStats>({
    totalSubmitted: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalCompleted: 0,
    totalExpired: 0,
    totalHelpReceived: 0,
  });
  const [heroStats, setHeroStats] = useState<HeroStats>({
    totalUnlocks: 0,
    directHelps: 0,
    contributions: 0,
    totalAmountHelped: 0,
  });
  const [helpedCases, setHelpedCases] = useState<any[]>([]);
  const [trustLevel, setTrustLevel] = useState(100);
  const [badge, setBadge] = useState<{ title: string; emoji: string; description: string; icon: JSX.Element; color: string } | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  // Credits balance (own profile only). Failure never blocks the profile.
  useEffect(() => {
    if (!isOwnProfile || !user?.id) return;
    let cancelled = false;
    getWallet(user.id)
      .then((wallet: any) => {
        if (!cancelled) setCreditBalance(Number(wallet?.balance ?? 0));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, user?.id, showDeposit]);

  // Help Me totals (verified payments, PKR-equivalent). Failure never blocks the profile.
  const [helpMeStats, setHelpMeStats] = useState<{ helped_count: number; helped_pkr: number; received_count: number; received_pkr: number } | null>(null);
  useEffect(() => {
    if (!profileUserId) return;
    let cancelled = false;
    helpme.stats(profileUserId).then((s) => { if (!cancelled) setHelpMeStats(s); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [profileUserId]);

  useEffect(() => {
    setProfile(null);
    setProfileError(null);
    setKycData(null);
    setProfileLoading(true);
    if (!profileUserId) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadData();
  }, [isAuthenticated, location.pathname, profileUserId]);

  // 🔥 INTACT: Promise.allSettled to prevent single failure from blocking everything
  async function loadData() {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const results = await Promise.allSettled([
        getKycSubmission(profileUserId),
        getProfile(profileUserId, role),
        getProfileStats(profileUserId),
      ]);

      const [kycResult, profResult, statsResult] = results;

      const kyc = kycResult.status === "fulfilled" ? kycResult.value : null;
      const prof = profResult.status === "fulfilled" ? profResult.value : null;
      let stats: any = statsResult.status === "fulfilled" ? statsResult.value : {};
      
      if (statsResult.status === "rejected" && isOwnProfile) {
        const fallback = await Promise.allSettled([
          getCasesByUser(profileUserId),
          getCaseResolutionsByHero(profileUserId),
          getCaseUnlocksByHero(profileUserId),
        ]);
        const fallbackCases = fallback[0].status === "fulfilled" && Array.isArray(fallback[0].value) ? fallback[0].value : [];
        const fallbackResolutions = fallback[1].status === "fulfilled" && Array.isArray(fallback[1].value) ? fallback[1].value : [];
        const fallbackUnlocks = fallback[2].status === "fulfilled" && Array.isArray(fallback[2].value) ? fallback[2].value : [];
        const computedRequester = computeRequesterStats(fallbackCases);
        stats = {
          cases: fallbackCases,
          resolutions: fallbackResolutions,
          hero: computeHeroStats(fallbackUnlocks, fallbackResolutions),
          requester: {
            ...computedRequester,
            totalApproved: fallbackCases.filter((item: any) => ["approved", "published", "active", "open", "in_progress"].includes(String(item?.effective_status || item?.status || "").trim().toLowerCase())).length,
            totalHelpReceived: fallbackCases.filter((item: any) => String(item?.effective_status || item?.status || "").trim().toLowerCase() === "completed").reduce((sum: number, item: any) => sum + Number(item?.amount_collected ?? item?.verified_amount ?? item?.help_received_amount ?? item?.amount_received ?? item?.amount_paid ?? item?.amount_needed ?? 0), 0),
          },
        };
      }
      const caseList = Array.isArray(stats.cases) ? stats.cases : [];
      const resolutions = Array.isArray(stats.resolutions) ? stats.resolutions : [];

      if (profResult.status === "rejected") {
        console.error("Profile fetch failed:", profResult.reason);
        setProfileError("Could not load profile details. Please try again later.");
        toast.error("Could not load profile details.");
      } else {
        setProfileError(null);
      }

      setKycData(kyc);
      setProfile(prof);
      setHeroesCount(Number(prof?.heroes_count || prof?.followers_count || 0));
      setFollowingCount(Number(prof?.following_count || 0));
      setSupportsCount(Number(prof?.supports_count || 0));
      setSupportEarningsUsd(Number(prof?.support_earnings_usd || 0));
      setIsMyHero(Boolean(prof?.is_following));

      const list = Array.isArray(caseList) ? caseList : [];
      const resolutionList = Array.isArray(resolutions) ? resolutions : [];
      const nextRequesterStats: RequesterStats = {
        totalSubmitted: Number(stats.requester?.totalSubmitted || 0),
        totalApproved: Number(stats.requester?.totalApproved || 0),
        totalRejected: Number(stats.requester?.totalRejected || 0),
        totalCompleted: Number(stats.requester?.totalCompleted || 0),
        totalExpired: Number(stats.requester?.totalExpired || 0),
        totalHelpReceived: Number(stats.requester?.totalHelpReceived || 0),
      };
      const nextHeroStats: HeroStats = {
        totalUnlocks: Number(stats.hero?.totalUnlocks || 0),
        directHelps: Number(stats.hero?.directHelps || 0),
        contributions: Number(stats.hero?.contributions || 0),
        totalAmountHelped: Number(stats.hero?.totalAmountHelped || 0),
      };

      setCases(list);
      setRequesterStats(nextRequesterStats);
      setHeroStats(nextHeroStats);
      setTrustLevel(getTrustLevel(nextRequesterStats.totalRejected, nextRequesterStats.totalCompleted, nextRequesterStats.totalExpired));

      const validResolutions = resolutionList.filter(isTrulyCompletedHelp);
      setHelpedCases(validResolutions.slice(0, 5));
      setBadge(getBadge(nextHeroStats.totalUnlocks, nextHeroStats.contributions, nextHeroStats.directHelps));
    } catch (err) {
      console.error("Unexpected error in loadData:", err);
      setProfileError("An unexpected error occurred while loading the profile.");
      toast.error("An unexpected error occurred while loading the profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function toggleHero() {
    if (!isAuthenticated || !user?.id) {
      navigate({ to: "/sign-in" });
      return;
    }
    if (isOwnProfile || heroUpdating) return;
    setHeroUpdating(true);
    try {
      if (isMyHero) {
        await unfollowUser(profileUserId);
        setIsMyHero(false);
        setHeroesCount((count) => Math.max(0, count - 1));
        toast.success("Removed from My Heroes");
      } else {
        await followUser(profileUserId);
        setIsMyHero(true);
        setHeroesCount((count) => count + 1);
        toast.success("Added to My Heroes");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update Hero status");
    } finally {
      setHeroUpdating(false);
    }
  }

  async function supportProfilePost(post: any) {
    const postId = String(post?.id || "");
    if (!postId || isOwnProfile || supportingPostId === postId || post?.supported_by_me) return;

    const previousCount = Number(post?.support_count || 0);
    setSupportingPostId(postId);
    setProfile((current: any) => current ? {
      ...current,
      posts: (current.posts || []).map((item: any) => item.id === postId
        ? { ...item, support_count: previousCount + 1, supported_by_me: true }
        : item),
    } : current);

    try {
      const result = await supportPost(postId);
      const confirmedCount = Number(result?.support_count ?? previousCount + 1);
      setProfile((current: any) => current ? {
        ...current,
        posts: (current.posts || []).map((item: any) => item.id === postId
          ? { ...item, support_count: confirmedCount, supported_by_me: true }
          : item),
      } : current);
      toast.success(result?.alreadySupported ? "You already supported this post." : "Support sent!");
    } catch (error: any) {
      setProfile((current: any) => current ? {
        ...current,
        posts: (current.posts || []).map((item: any) => item.id === postId
          ? { ...item, support_count: previousCount, supported_by_me: false }
          : item),
      } : current);
      toast.error(error?.message || "Failed to send Support.");
    } finally {
      setSupportingPostId(null);
    }
  }

  async function openRelationshipList(type: "heroes" | "requesters") {
    setRelationshipType(type);
    setRelationshipLoading(true);
    try {
      setRelationshipUsers(await getFollowList(profileUserId, type));
    } catch (error) {
      console.error("Failed to load relationship list", error);
      setRelationshipUsers([]);
    } finally {
      setRelationshipLoading(false);
    }
  }

  async function removeRelationship(targetId: string) {
    if (!isOwnProfile) return;
    try {
      if (relationshipType === "heroes") await unfollowUser(targetId);
      if (relationshipType === "requesters") await removeRequester(targetId);
      setRelationshipUsers((items) => items.filter((item) => String(item.user_id) !== String(targetId)));
      if (relationshipType === "heroes") setFollowingCount((count) => Math.max(0, count - 1));
      if (relationshipType === "requesters") setHeroesCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error("Failed to remove relationship", error);
    }
  }

  const kycApproved = kycData?.status === "approved";
  const displayName = profile?.full_name || user?.fullName || "My Profile";
  const avatarUrl = profile?.avatar_url || null;
  const coverUrl = profile?.cover_url || null;

  const verificationBadges = [
    { label: "Email Verified", icon: <Mail className="h-3 w-3" />, active: isOwnProfile ? !!user?.email : !!profile?.email_verified },
    { label: "Mobile Verified", icon: <Phone className="h-3 w-3" />, active: !!profile?.phone_number },
    { label: "Identity Verified", icon: <ShieldCheck className="h-3 w-3" />, active: kycApproved },
    { label: "Institution Verified", icon: <Building2 className="h-3 w-3" />, active: false },
  ];

  const menuItems = [
    { icon: <Pencil className="h-5 w-5" />, label: "Edit Profile", to: "/edit-profile" },
    { icon: <MessageCircle className="h-5 w-5" />, label: "Community", to: "/community" },
    { icon: <HeartHandshake className="h-5 w-5" />, label: "My Help Dashboard", to: "/my-help" },
    { icon: <Briefcase className="h-5 w-5" />, label: "My Cases Dashboard", to: "/my-cases" },
    { icon: <Bell className="h-5 w-5" />, label: "Notifications", to: "/notifications" },
    { icon: <Wallet className="h-5 w-5" />, label: "Credits & Deposit", to: "/wallet" },
    { icon: <ShieldCheck className="h-5 w-5" />, label: "Security", to: "/security" },
    { icon: <KeyRound className="h-5 w-5" />, label: "Google Account Security", to: "/security" },
    { icon: <Lock className="h-5 w-5" />, label: "Privacy", to: "/account-privacy" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", to: "/settings" },
  ];

  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "G";

  const profileReady = !profileLoading;
  const showProfileError = profileError || (!profile && !profileLoading);

  if (!profileReady) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 pt-8 pb-24">
          <div className="rounded-[2rem] border border-slate-200/60 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-5 h-24 w-24 rounded-full bg-slate-100 animate-pulse dark:bg-slate-800" />
            <div className="mx-auto h-6 w-48 rounded-lg bg-slate-200 animate-pulse dark:bg-slate-800" />
            <div className="mx-auto mt-3 h-4 w-32 rounded-md bg-slate-100 animate-pulse dark:bg-slate-800/50" />
            <p className="mt-6 text-sm font-semibold text-teal-600 animate-pulse">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 pt-8 pb-24">
          <div className="rounded-[2rem] border border-red-200 bg-red-50 p-8 text-center shadow-sm dark:border-red-900/50 dark:bg-red-950/20">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-black text-red-700 dark:text-red-300">Profile Not Available</h1>
            <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
              {profileError || "We could not load this profile. Please try again later."}
            </p>
            <Button className="mt-5 bg-red-600 font-bold hover:bg-red-700" onClick={() => loadData()}>
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (showDeposit && isOwnProfile) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 pt-4 pb-24">
          <DepositPanel
            onBack={() => { setShowDeposit(false); window.scrollTo({ top: 0 }); }}
            onBalanceChange={setCreditBalance}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-xl px-3 pt-0 pb-24 space-y-4 sm:px-4">
        
        {/* ============================= 🔥 PREMIUM HEADER CARD 🔥 ============================= */}
        <div className="overflow-hidden rounded-b-[2rem] border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900">
          
          {/* Cover Photo / Gradient */}
          <div className="relative h-36 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800">
            {coverUrl ? (
              <img src={coverUrl} alt="Cover" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -left-10 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
              </div>
            )}

            {isOwnProfile && (
              <button
                aria-label="Profile menu"
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all hover:bg-white/30 active:scale-95"
                onClick={() => setShowMenu(true)}
              >
                <MoreHorizontal className="h-5 w-5 text-white" />
              </button>
            )}
          </div>

          <div className="px-5 pb-6">
            {/* Avatar Row */}
            <div className="mb-4 -mt-14 flex items-end justify-between">
              <div className="relative shrink-0">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-teal-100 shadow-xl dark:border-slate-900 dark:bg-teal-900">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-teal-700 dark:text-teal-400">{initials}</span>
                  )}
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/edit-profile" })}
                    title="Edit Profile"
                    className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </div>

              {!isOwnProfile && (
                <Button
                  type="button"
                  onClick={toggleHero}
                  disabled={heroUpdating}
                  className={`h-10 shrink-0 rounded-full px-5 text-sm font-bold shadow-md transition-all ${
                    isMyHero
                      ? "bg-teal-50 text-teal-700 border-2 border-teal-200 hover:bg-teal-100 dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-400"
                      : "bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:scale-105"
                  }`}
                >
                  {heroUpdating ? "Wait..." : isMyHero ? <><UserCheck className="mr-1.5 h-4 w-4" /> My Hero</> : <><UserPlus className="mr-1.5 h-4 w-4" /> Make Hero</>}
                </Button>
              )}
            </div>

            {/* Name & Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white break-words">{displayName}</h1>
              {badge && (
                <div className="flex shrink-0 items-center gap-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider shadow-sm ${badge.color}`}>
                    {badge.icon}
                    {badge.title}
                  </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" onClick={() => setBadgeInfoOpen(true)} className="text-slate-400 transition-colors hover:text-teal-600">
                          <Info className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p className="max-w-xs text-xs">{badge.description}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            {/* Location & Details */}
            <div className="mt-2 space-y-1.5">
              {(profile?.city || profile?.country) && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                  <MapPin className="h-4 w-4 text-teal-500" />
                  {[profile?.city, profile?.country].filter(Boolean).join(", ")}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Joined {profile?.member_since || 2026}</span>
                {kycApproved && <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> KYC Verified</span>}
              </div>
              {profile?.bio && <p className="pt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{profile.bio}</p>}
            </div>

            {/* Stats Row */}
            <div className="mt-5 grid grid-cols-3 divide-x divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 py-3 shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-950/50">
              <button onClick={() => openRelationshipList("requesters")} className="group flex flex-col items-center gap-1 transition-opacity hover:opacity-80">
                <Users className="h-5 w-5 text-teal-600 transition-transform group-hover:scale-110" />
                <span className="text-xl font-black leading-none text-slate-900 dark:text-white">{heroesCount}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Requesters</span>
              </button>
              <button onClick={() => openRelationshipList("heroes")} className="group flex flex-col items-center gap-1 transition-opacity hover:opacity-80">
                <HeartHandshake className="h-5 w-5 text-teal-600 transition-transform group-hover:scale-110" />
                <span className="text-xl font-black leading-none text-slate-900 dark:text-white">{followingCount}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Heroes</span>
              </button>
              <div className="group flex flex-col items-center gap-1">
                <Gift className="h-5 w-5 text-amber-500" />
                <span className="text-xl font-black leading-none text-amber-600">{supportsCount.toLocaleString()}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Supports</span>
              </div>
            </div>

            {/* Wallet / Credits (Own Profile Only) */}
            {isOwnProfile && (
              <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-4 text-white shadow-lg">
                <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />
                <div className="flex items-center gap-2 text-sm font-semibold text-teal-100">
                  <Wallet className="h-4 w-4" /> Credits Balance
                </div>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-3xl font-black leading-none">{creditBalance == null ? "—" : creditBalance.toLocaleString()}</div>
                    <div className="mt-1.5 text-[11px] font-medium text-teal-100">≈ ${creditBalance == null ? "—" : creditBalance.toLocaleString()} USD · 1 Credit = $1</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowDeposit(true); window.scrollTo({ top: 0 }); }}
                    className="h-10 shrink-0 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 text-sm font-black text-amber-950 shadow-md transition-transform hover:scale-105 active:scale-95"
                  >
                    Deposit
                  </button>
                </div>
              </div>
            )}

            {/* Verification Badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              {verificationBadges.map((b) => (
                <span key={b.label} className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${b.active ? "bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-800" : "bg-slate-100 text-slate-400 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-700"}`}>
                  {b.active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ============================= OTHER CARDS ============================= */}
        
        {/* Trust Level */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Trust Level
            </span>
            <span className="text-lg font-black text-teal-600">{trustLevel}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${trustLevel >= 70 ? "bg-gradient-to-r from-emerald-400 to-green-500" : trustLevel >= 40 ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-red-400 to-red-600"}`}
              style={{ width: `${trustLevel}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-500">
            <span>Based on case history</span>
            <span>+{requesterStats.totalCompleted * 5} / -{requesterStats.totalRejected * 10}</span>
          </div>
        </div>

        {/* Support Earnings */}
        <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm dark:border-amber-900/30 dark:from-amber-950/20 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HandCoins className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Support Earnings</span>
            </div>
            <span className="text-xl font-black text-amber-600">${supportEarningsUsd.toFixed(2)}</span>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {supportsCount.toLocaleString()} Supports received · {SUPPORTS_PER_DOLLAR.toLocaleString()} Supports = $1.00
          </p>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-100/50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            <span>Withdrawal eligibility will be announced soon.</span>
            <span className="whitespace-nowrap rounded-md bg-amber-200/50 px-2 py-0.5">Coming soon</span>
          </div>
        </div>

        {/* Own Profile Tabs (My Help / My Cases) */}
        {isOwnProfile && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setProfileView("help")} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all ${profileView === "help" ? "border-teal-600 bg-teal-600 text-white shadow-md" : "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-400"}`}>
                <HeartHandshake className="h-4 w-4" /> My Help
              </button>
              <button type="button" onClick={() => setProfileView("cases")} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition-all ${profileView === "cases" ? "border-teal-600 bg-teal-600 text-white shadow-md" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"}`}>
                <Briefcase className="h-4 w-4" /> My Cases
              </button>
            </div>

            {profileView !== "overview" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-teal-100 bg-teal-50/30 p-4 dark:border-teal-900/30 dark:bg-teal-950/10">
                {profileView === "help" ? (
                  <>
                    <div className="mb-3 flex items-center gap-2 font-bold text-teal-700 dark:text-teal-400"><HeartHandshake className="h-4 w-4" /> My Help Stats</div>
                    <div className="grid grid-cols-2 gap-2.5 text-center">
                      <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"><strong className="block text-xl text-slate-900 dark:text-white">{heroStats.totalUnlocks}</strong><span className="text-[10px] font-semibold text-slate-500">Total Unlocks</span></div>
                      <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"><strong className="block text-xl text-slate-900 dark:text-white">{heroStats.directHelps + (helpMeStats?.helped_count || 0)}</strong><span className="text-[10px] font-semibold text-slate-500">Direct Helps</span></div>
                      <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"><strong className="block text-xl text-slate-900 dark:text-white">{heroStats.contributions}</strong><span className="text-[10px] font-semibold text-slate-500">Contributions</span></div>
                      <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"><strong className="block text-xl text-emerald-600">{heroStats.totalAmountHelped + (helpMeStats?.helped_pkr || 0)}</strong><span className="text-[10px] font-semibold text-slate-500">Total Amount Helped</span></div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex items-center gap-2 font-bold text-teal-700 dark:text-teal-400"><Briefcase className="h-4 w-4" /> My Cases Stats</div>
                    <div className="grid grid-cols-2 gap-2.5 text-center">
                      <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"><strong className="block text-xl text-slate-900 dark:text-white">{requesterStats.totalSubmitted}</strong><span className="text-[10px] font-semibold text-slate-500">Submitted</span></div>
                      <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"><strong className="block text-xl text-slate-900 dark:text-white">{requesterStats.totalApproved}</strong><span className="text-[10px] font-semibold text-slate-500">Approved</span></div>
                      <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"><strong className="block text-xl text-slate-900 dark:text-white">{requesterStats.totalRejected}</strong><span className="text-[10px] font-semibold text-slate-500">Rejected</span></div>
                      <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"><strong className="block text-xl text-slate-900 dark:text-white">{requesterStats.totalCompleted}</strong><span className="text-[10px] font-semibold text-slate-500">Completed</span></div>
                      <div className="col-span-2 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900"><strong className="block text-xl text-emerald-600">{requesterStats.totalHelpReceived + (helpMeStats?.received_pkr || 0)}</strong><span className="text-[10px] font-semibold text-slate-500">Total Help Received</span></div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </>
        )}

        {/* Cases List */}
        {cases.length > 0 && (
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Briefcase className="h-4 w-4 text-teal-600" /> Cases
              </h2>
              {isOwnProfile && (
                <button onClick={() => navigate({ to: "/my-cases" })} className="flex items-center text-xs font-bold text-teal-600 hover:underline">
                  View all <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {cases.slice(0, 5).map((c: any) => (
                <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:hover:bg-slate-800">
                  <span className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">{c.title || `Case #${c.id}`}</span>
                  <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${getCaseStatusStyle(c.status)}`}>
                    {c.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Helped Cases */}
        {role === "hero" && helpedCases.length > 0 && (
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <HeartHandshake className="h-4 w-4 text-amber-500" /> Cases You Helped
            </h2>
            <div className="space-y-2">
              {helpedCases.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-800 dark:text-slate-200">{r.case_title || `Case #${r.case_id ?? r.id}`}</span>
                    <span className="text-xs font-black text-emerald-600">
                      {r.seeker_confirmed_amount ?? r.amount_paid ?? r.case_amount_collected ?? r.case_amount_needed ? Number(r.seeker_confirmed_amount ?? r.amount_paid ?? r.case_amount_collected ?? r.case_amount_needed).toFixed(2) : ""}
                    </span>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {(r.receipt_url || r.case_paid_receipt_url) && <button type="button" className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[10px] font-bold text-teal-700 hover:bg-teal-100" onClick={() => navigate({ to: "/payment-proof/$caseId", params: { caseId: String(r.case_id) } })}>Proof</button>}
                    <button type="button" className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50" onClick={() => navigate({ to: "/affidavit/$caseId", params: { caseId: String(r.case_id) } })}>Affidavit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Posts */}
        {Array.isArray(profile?.posts) && profile.posts.length > 0 && (
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <MessageCircle className="h-4 w-4 text-teal-600" /> Community Posts
              </h2>
              <span className="text-xs font-semibold text-slate-400">{profile.posts.length} posts</span>
            </div>
            <div className="space-y-3">
              {profile.posts.map((post: any) => (
                <article key={post.id} className="rounded-2xl border border-slate-100 bg-slate-50/30 p-4 dark:border-slate-800 dark:bg-slate-950/30">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    {post.is_pinned ? <Pin className="h-3 w-3 text-teal-500" /> : null}
                    <span>{post.is_pinned ? "Pinned Post" : "Community Post"}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">{post.message}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                    <span className="text-xs font-bold text-slate-500">{Number(post.support_count || 0).toLocaleString()} Supports</span>
                    <button
                      type="button"
                      onClick={() => supportProfilePost(post)}
                      disabled={isOwnProfile || supportingPostId === String(post.id) || Boolean(post.supported_by_me)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all disabled:opacity-60 ${post.supported_by_me ? "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`}
                    >
                      <HandCoins className="h-3.5 w-3.5" />
                      {isOwnProfile ? "Your Post" : post.supported_by_me ? "Supported" : supportingPostId === String(post.id) ? "Supporting..." : "Support"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ============================= DIALOGS ============================= */}

        {/* Account Menu Dialog */}
        <Dialog open={showMenu} onOpenChange={setShowMenu}>
          <DialogContent className="max-w-sm rounded-3xl border-slate-200/60 p-6 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Account Menu</DialogTitle>
              <DialogDescription className="font-medium">Manage your profile and account settings.</DialogDescription>
            </DialogHeader>
            <div className="mt-2 overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800">
              {menuItems.map((item, idx) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    if (item.to === "/wallet" && isOwnProfile) {
                      setShowDeposit(true);
                      window.scrollTo({ top: 0 });
                      return;
                    }
                    navigate({ to: item.to as "/" });
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50 ${idx < menuItems.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}
                >
                  <span className="text-teal-600">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Logout Button */}
        {isOwnProfile && (
          <button
            type="button"
            onClick={() => setShowLogout(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/20 dark:hover:bg-red-900/30"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        )}

        <p className="pb-2 text-center text-xs font-medium text-slate-400">Givethra v2.0 · Built with ❤️</p>
      </div>

      {/* Logout Dialog */}
      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent className="max-w-sm rounded-3xl border-slate-200/60 p-6 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <LogOut className="h-5 w-5 text-red-500" /> Logout
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">Are you sure you want to logout?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex-row gap-2">
            <Button variant="outline" className="flex-1 rounded-xl font-bold" onClick={() => setShowLogout(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1 rounded-xl font-bold" onClick={() => { logout(); setShowLogout(false); navigate({ to: "/" }); }}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Info Dialog */}
      <Dialog open={badgeInfoOpen} onOpenChange={setBadgeInfoOpen}>
        <DialogContent className="max-w-sm rounded-3xl border-slate-200/60 p-6 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black">
              <Info className="h-5 w-5 text-teal-600" /> Hero Badges
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">Understand what each badge means and how you earn them.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-3">
            {[
              { e: "🆕", t: "Newborn Hero", d: "You unlocked a case but did not complete a payment. Take the next step!" },
              { e: "⭐", t: "Young Hero", d: "You contributed to a fundraising pool. Every contribution counts!" },
              { e: "🦸", t: "Hero", d: "You paid directly for someone's need. You are a true Hero!" },
              { e: "🌟", t: "Super Hero", d: "You have unlocked, contributed, and provided direct help. The ultimate Hero!" }
            ].map((b) => (
              <div key={b.t} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                <div className="mt-0.5 text-2xl">{b.e}</div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{b.t}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{b.d}</p>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-2">
            <Button className="w-full rounded-xl font-bold" onClick={() => setBadgeInfoOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔥 Relationship List Dialog (Heroes / Requesters) 🔥 */}
      <Dialog open={relationshipType !== null} onOpenChange={(open) => !open && setRelationshipType(null)}>
        <DialogContent className="max-w-md rounded-3xl border-slate-200/60 p-6 dark:border-slate-800">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-xl font-black">{relationshipType === "heroes" ? "Your Heroes" : "Requesters"}</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              {relationshipType === "heroes" ? "People you have chosen to support." : "People who have chosen you as their Hero."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
            {relationshipLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Loading...</p>
              </div>
            ) : relationshipUsers.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-500">No {relationshipType} yet.</p>
              </div>
            ) : (
              relationshipUsers.map((item, idx) => {
                const userId = item.user_id ?? item.id ?? item.hero_id ?? item.requester_id ?? "";
                const name = item.full_name ?? item.name ?? item.user_name ?? "Givethra User";
                const initials2 = name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={String(userId || idx)} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800">
                    <button
                      onClick={() => { setRelationshipType(null); if (userId) navigate({ to: "/profile/$id", params: { id: String(userId) } }); }}
                      className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-sm font-black text-white shadow-sm"
                    >
                      {item.avatar_url ? <img src={item.avatar_url} alt={name} className="h-full w-full object-cover" /> : initials2}
                    </button>
                    <button
                      onClick={() => { setRelationshipType(null); if (userId) navigate({ to: "/profile/$id", params: { id: String(userId) } }); }}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                        {name} {item.is_verified && <span className="text-teal-500">✓</span>}
                      </span>
                      <span className="block truncate text-xs font-medium text-slate-500">Tap to view profile</span>
                    </button>
                    {isOwnProfile && (
                      <Button variant="outline" size="sm" className="shrink-0 rounded-xl font-bold text-red-600 border-red-200 hover:bg-red-50" onClick={() => removeRelationship(String(userId))}>
                        {relationshipType === "heroes" ? <><UserMinus className="h-3.5 w-3.5 mr-1" /> Unhero</> : <><UserMinus className="h-3.5 w-3.5 mr-1" /> Remove</>}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

    </Layout>
  );
}
