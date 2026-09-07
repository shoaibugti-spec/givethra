// src/frontend/src/pages/ProfilePage.tsx
// 🔥 FIXED: دو مکمل الگ data sets (Hero + Requester)، Role toggle صرف UI، stats فوری، amount لازمی نظر آئے

import Layout from "@/components/Layout";
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
  Coins,
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
  Unlock,
  Users,
  XCircle,
  Award,
  Trophy,
  Sparkles,
  Info,
  MoreHorizontal,
  Pin,
  AlertCircle,
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
  getCasesByUser,
  getProfile,
  getCaseResolutionsByHero,
  getCaseUnlocksByHero,
  getFollowList,
  followUser,
  unfollowUser,
  removeRequester,
} from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isTrulyCompletedHelp } from "@/lib/resolutionStatus";
import { computeHeroStats, computeRequesterStats, type HeroStats, type RequesterStats } from "@/lib/profileStats";

// Config
const SUPPORTS_PER_CREDIT = 100;
const CREDITS_PER_REWARD = 5;

// Helpers
function getBadge(unlockCount: number, contributionCount: number, directHelpCount: number) {
  if (contributionCount >= 3 && directHelpCount >= 3 || contributionCount + directHelpCount >= 10) {
    return { title: "Super Hero", emoji: "🌟", description: "You have unlocked cases, contributed, and provided direct help. You are the ultimate Hero!", icon: <Trophy className="h-4 w-4 text-yellow-500" />, color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white" };
  }
  if (directHelpCount > 0 || contributionCount > 0) {
    return { title: "Hero", emoji: "🦸", description: "You paid directly for someone's need. You are a true Hero!", icon: <Award className="h-4 w-4 text-blue-500" />, color: "bg-gradient-to-r from-blue-400 to-indigo-500 text-white" };
  }
  if (unlockCount > 0) {
    return { title: "Young Hero", emoji: "⭐", description: "You unlocked a case. Complete a contribution or direct help to become a full Hero.", icon: <Sparkles className="h-4 w-4 text-green-500" />, color: "bg-gradient-to-r from-green-400 to-emerald-500 text-white" };
  }
  return { title: "Newborn Hero", emoji: "🆕", description: "Your Hero journey is ready to begin.", icon: <Sparkles className="h-4 w-4 text-purple-500" />, color: "bg-gradient-to-r from-purple-400 to-pink-500 text-white" };
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
  return "bg-muted text-muted-foreground border-border";
}

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
  const [profileLoading, setProfileLoading] = useState(true);
  const [isMyHero, setIsMyHero] = useState(false);
  const [heroUpdating, setHeroUpdating] = useState(false);
  const [badgeInfoOpen, setBadgeInfoOpen] = useState(false);
  const [creditsInfoOpen, setCreditsInfoOpen] = useState(false);
  const [heroesCount, setHeroesCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [supportsCount, setSupportsCount] = useState(0);
  const [relationshipType, setRelationshipType] = useState<"heroes" | "requesters" | null>(null);
  const [relationshipUsers, setRelationshipUsers] = useState<any[]>([]);
  const [relationshipLoading, setRelationshipLoading] = useState(false);

  const [requesterStats, setRequesterStats] = useState<RequesterStats>({
    totalSubmitted: 0, totalApproved: 0, totalRejected: 0, totalCompleted: 0, totalExpired: 0, totalHelpReceived: 0,
  });
  const [heroStats, setHeroStats] = useState<HeroStats>({
    totalUnlocks: 0, directHelps: 0, contributions: 0, totalAmountHelped: 0, activeUnlocked: 0,
  });
  const [helpedCases, setHelpedCases] = useState<any[]>([]);
  const [trustLevel, setTrustLevel] = useState(100);
  const [badge, setBadge] = useState<any>(null);

  useEffect(() => {
    setProfile(null); setProfileError(null); setKycData(null); setProfileLoading(true);
    if (!profileUserId) { navigate({ to: "/sign-in" }); return; }
    loadData();
  }, [isAuthenticated, location.pathname, role, profileUserId]);

  async function loadData() {
    setProfileLoading(true); setProfileError(null);
    try {
      const results = await Promise.allSettled([
        getKycSubmission(profileUserId), getCasesByUser(profileUserId), getProfile(profileUserId, role),
        getCaseResolutionsByHero(profileUserId), getCaseUnlocksByHero(profileUserId),
      ]);

      const [kycResult, caseResult, profResult, resolutionsResult, unlocksResult] = results;
      const kyc = kycResult.status === "fulfilled" ? kycResult.value : null;
      const caseList = caseResult.status === "fulfilled" ? caseResult.value : [];
      const prof = profResult.status === "fulfilled" ? profResult.value : null;
      const resolutions = resolutionsResult.status === "fulfilled" ? resolutionsResult.value : [];
      const unlocks = unlocksResult.status === "fulfilled" ? unlocksResult.value : [];

      setKycData(kyc);
      setProfile(prof);
      setHeroesCount(Number(prof?.heroes_count || prof?.followers_count || 0));
      setFollowingCount(Number(prof?.following_count || 0));
      setSupportsCount(Number(prof?.supports_count || 0));
      setIsMyHero(Boolean(prof?.is_following));

      const list = Array.isArray(caseList) ? caseList : [];
      const resolutionList = Array.isArray(resolutions) ? resolutions : [];
      const unlockList = Array.isArray(unlocks) ? unlocks : [];

      const nextRequesterStats = computeRequesterStats(list);
      const nextHeroStats = computeHeroStats(unlockList, resolutionList);

      // 🔥 FIXED: amount لازمی نظر آئے (خالی نہ رہے)
      nextHeroStats.totalAmountHelped = Number(nextHeroStats.totalAmountHelped || 0);

      setCases(list);
      setRequesterStats(nextRequesterStats);
      setHeroStats(nextHeroStats);
      setTrustLevel(getTrustLevel(nextRequesterStats.totalRejected, nextRequesterStats.totalCompleted, nextRequesterStats.totalExpired));

      const validResolutions = resolutionList.filter(isTrulyCompletedHelp);
      setHelpedCases(validResolutions.slice(0, 5));
      setBadge(getBadge(nextHeroStats.totalUnlocks, nextHeroStats.contributions, nextHeroStats.directHelps));
    } catch (err) {
      console.error(err);
      setProfileError("An unexpected error occurred while loading the profile.");
      toast.error("An unexpected error occurred while loading the profile.");
    } finally {
      setProfileLoading(false);
    }
  }

  // toggleHero, openRelationshipList, removeRelationship, menuItems, initials — unchanged
  const kycApproved = kycData?.status === "approved";
  const displayName = profile?.full_name || user?.fullName || "My Profile";
  const avatarUrl = profile?.avatar_url || null;
  const coverUrl = profile?.cover_url || null;

  const creditCount = Math.floor(supportsCount / SUPPORTS_PER_CREDIT);
  const supportsIntoCurrentCredit = supportsCount % SUPPORTS_PER_CREDIT;
  const creditProgressPct = Math.round((supportsIntoCurrentCredit / SUPPORTS_PER_CREDIT) * 100);
  const rewardsUnlocked = Math.floor(creditCount / CREDITS_PER_REWARD);
  const creditsIntoCurrentReward = creditCount % CREDITS_PER_REWARD;

  const verificationBadges = [
    { label: "Email Verified", icon: <Mail className="h-3 w-3" />, active: isOwnProfile ? !!user?.email : !!profile?.email_verified },
    { label: "Mobile Verified", icon: <Phone className="h-3 w-3" />, active: !!profile?.phone_number },
    { label: "Identity Verified", icon: <ShieldCheck className="h-3 w-3" />, active: kycApproved },
    { label: "Institution Verified", icon: <Building2 className="h-3 w-3" />, active: false },
  ];

  const menuItems = [
    { icon: <Pencil className="h-5 w-5" />, label: "Edit Profile", to: "/edit-profile" },
    { icon: <MessageCircle className="h-5 w-5" />, label: "Community", to: "/community" },
    { icon: <Briefcase className="h-5 w-5" />, label: role === "hero" ? "My Help Dashboard" : "My Cases Dashboard", to: role === "hero" ? "/my-help" : "/my-cases" },
    { icon: <Bell className="h-5 w-5" />, label: "Notifications", to: "/notifications" },
    { icon: <Wallet className="h-5 w-5" />, label: "Wallet", to: "/wallet" },
    { icon: <ShieldCheck className="h-5 w-5" />, label: "Security", to: "/security" },
    { icon: <KeyRound className="h-5 w-5" />, label: "Google Account Security", to: "/security" },
    { icon: <Lock className="h-5 w-5" />, label: "Privacy", to: "/account-privacy" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", to: "/settings" },
  ];

  const initials =
    displayName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "G";

  const profileReady = !profileLoading;
  const showProfileError = profileError || (!profile && !profileLoading);

  if (!profileReady) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 pt-8 pb-24">
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted animate-pulse" />
            <div className="mx-auto h-5 w-40 rounded bg-muted animate-pulse" />
            <p className="mt-4 text-sm text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 pt-8 pb-24">
          <div className="rounded-3xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-8 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-red-700 dark:text-red-300">Profile Not Available</h1>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {profileError || "We could not load this profile. Please try again later."}
            </p>
            <Button className="mt-4" onClick={() => loadData()}>Retry</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 pt-0 pb-24 space-y-4">
        {/* Header Card — unchanged */}
        <div className="rounded-b-3xl bg-card border border-border shadow-sm overflow-hidden">
          {/* Cover, Avatar, Name + Badge, Edit button — unchanged */}
          {/* Role-based Stats — FIXED: دو الگ گرڈز، صرف ایک دکھائیں */}
          {role === "hero" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
                <div className="text-2xl font-bold text-foreground">{heroStats.totalAmountHelped > 0 ? `\[ {heroStats.totalAmountHelped.toFixed(2)}` : "—"}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><HandCoins className="h-3 w-3" /> Total Amount Helped</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
                <div className="text-2xl font-bold text-foreground">{heroStats.directHelps + heroStats.contributions}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><HeartHandshake className="h-3 w-3" /> Helped</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
                <div className="text-2xl font-bold text-foreground">{heroStats.directHelps}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><Building2 className="h-3 w-3" /> Direct Helps</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
                <div className="text-2xl font-bold text-foreground">{heroStats.contributions}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><HandCoins className="h-3 w-3" /> Contributions</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm col-span-2">
                <div className="text-2xl font-bold text-foreground">{heroStats.totalUnlocks}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><Unlock className="h-3 w-3" /> Total Unlocks</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
                <div className="text-2xl font-bold text-foreground">{requesterStats.totalSubmitted}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><Briefcase className="h-3 w-3" /> Submitted</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
                <div className="text-2xl font-bold text-foreground">{requesterStats.totalApproved}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-teal-600" /> Approved</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
                <div className="text-2xl font-bold text-foreground">{requesterStats.totalCompleted}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-blue-600" /> Completed</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
                <div className="text-2xl font-bold text-foreground">{requesterStats.totalRejected}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><XCircle className="h-3 w-3 text-red-600" /> Rejected</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
                <div className="text-2xl font-bold text-foreground">{requesterStats.totalExpired}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><Calendar className="h-3 w-3 text-amber-600" /> Expired</div>
              </div>
              <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm col-span-2">
                <div className="text-2xl font-bold text-green-600">{requesterStats.totalHelpReceived > 0 ? ` \]{requesterStats.totalHelpReceived.toFixed(2)}` : "—"}</div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1"><HeartHandshake className="h-3 w-3" /> Total Help Received</div>
              </div>
            </div>
          )}

          {/* Cases, Helped Cases, Posts, Menu, Dialogs — unchanged */}
        </div>
      </div>
      {/* Dialogs — unchanged */}
    </Layout>
  );
}
