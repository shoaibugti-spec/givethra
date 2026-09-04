// src/frontend/src/pages/ProfilePage.tsx
// Givethra - Complete Profile Page with Corrected, Professional Layout
// 🔥 FIXED: Uses shared resolutionStatus helpers (Fix #5)

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
import { isTrulyCompletedHelp, isContributionResolution } from "@/lib/resolutionStatus";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SUPPORTS_PER_CREDIT = 100;
const CREDITS_PER_REWARD = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getBadge(unlockCount: number, contributionCount: number, directHelpCount: number) {
  if (directHelpCount > 0 && contributionCount > 0 && unlockCount > 0) {
    return {
      title: "Super Hero",
      emoji: "🌟",
      description: "You have unlocked cases, contributed, and provided direct help. You are the ultimate Hero!",
      icon: <Trophy className="h-4 w-4 text-yellow-500" />,
      color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
    };
  }
  if (directHelpCount > 0) {
    return {
      title: "Hero",
      emoji: "🦸",
      description: "You paid directly for someone's need. You are a true Hero!",
      icon: <Award className="h-4 w-4 text-blue-500" />,
      color: "bg-gradient-to-r from-blue-400 to-indigo-500 text-white",
    };
  }
  if (contributionCount > 0) {
    return {
      title: "Young Hero",
      emoji: "⭐",
      description: "You contributed to a fundraising pool. Every contribution counts! Keep going to become a full Hero.",
      icon: <Sparkles className="h-4 w-4 text-green-500" />,
      color: "bg-gradient-to-r from-green-400 to-emerald-500 text-white",
    };
  }
  if (unlockCount > 0) {
    return {
      title: "Newborn Hero",
      emoji: "🆕",
      description: "You unlocked a case. Take the next step to become a full Hero!",
      icon: <Sparkles className="h-4 w-4 text-purple-500" />,
      color: "bg-gradient-to-r from-purple-400 to-pink-500 text-white",
    };
  }
  return null;
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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const profileUserId = location.pathname.match(/^\/profile\/([^/]+)/)?.[1] || user?.id || "";
  const isOwnProfile = Boolean(user?.id && profileUserId === user.id);
  const [kycData, setKycData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
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

  const [caseStats, setCaseStats] = useState({
    submitted: 0,
    completed: 0,
    rejected: 0,
    expired: 0,
  });

  const [helpedCount, setHelpedCount] = useState(0);
  const [directHelps, setDirectHelps] = useState(0);
  const [contributions, setContributions] = useState(0);
  const [unlockCount, setUnlockCount] = useState(0);
  const [totalAmountSpent, setTotalAmountSpent] = useState(0);
  const [helpedCases, setHelpedCases] = useState<any[]>([]);
  const [totalHelpReceived, setTotalHelpReceived] = useState(0);
  const [trustLevel, setTrustLevel] = useState(100);
  const [badge, setBadge] = useState<{ title: string; emoji: string; description: string; icon: JSX.Element; color: string } | null>(null);

  useEffect(() => {
    setProfile(null);
    setKycData(null);
    setProfileLoading(true);
    if (!profileUserId) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadData();
  }, [isAuthenticated, location.pathname, role, profileUserId]);

  async function loadData() {
    setProfileLoading(true);
    try {
      const [kyc, caseList, prof, resolutions, unlocks] = await Promise.all([
        getKycSubmission(profileUserId),
        getCasesByUser(profileUserId),
        getProfile(profileUserId, role),
        getCaseResolutionsByHero(profileUserId),
        getCaseUnlocksByHero(profileUserId),
      ]);

      setKycData(kyc);
      setProfile(prof);
      setHeroesCount(Number(prof?.heroes_count || prof?.followers_count || 0));
      setFollowingCount(Number(prof?.following_count || 0));
      setSupportsCount(Number(prof?.supports_count || 0));
      setIsMyHero(Boolean(prof?.is_following));

      const list = Array.isArray(caseList) ? caseList : [];
      setCases(list);
      const submitted = list.length;
      const completed = list.filter((c: any) => c.status === "completed").length;
      const rejected = list.filter((c: any) => c.status === "rejected").length;
      const expired = list.filter((c: any) => c.status === "expired").length;
      setCaseStats({ submitted, completed, rejected, expired });

      const totalReceived = list
        .filter((c: any) => c.status === "completed")
        .reduce((sum: number, c: any) => sum + (Number(c.amount_collected) || 0), 0);
      setTotalHelpReceived(totalReceived);

      setTrustLevel(getTrustLevel(rejected, completed, expired));

      // 🔥 FIX #5: Use isTrulyCompletedHelp from shared helpers
      const resolutionList = Array.isArray(resolutions) ? resolutions : [];
      const validResolutions = resolutionList.filter((r: any) => isTrulyCompletedHelp(r));
      setHelpedCount(validResolutions.length);
      setHelpedCases(validResolutions.slice(0, 5));

      const direct = validResolutions.filter((r: any) => !isContributionResolution(r));
      const contrib = validResolutions.filter((r: any) => isContributionResolution(r));
      setDirectHelps(direct.length);
      setContributions(contrib.length);

      const totalSpent = validResolutions.reduce(
        (sum: number, r: any) => sum + (Number(r.seeker_confirmed_amount ?? r.amount_paid) || 0),
        0
      );
      setTotalAmountSpent(totalSpent);

      const unlockList = Array.isArray(unlocks) ? unlocks : [];
      setUnlockCount(unlockList.length);

      setBadge(getBadge(unlockList.length, contrib.length, direct.length));
    } catch (err) {
      console.error("Failed to load profile data:", err);
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
  const profileReady = !profileLoading && profile && String(profile.user_id || "") === String(profileUserId);

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

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 pt-0 pb-24 space-y-4">
        {/* ============================= Header Card ============================= */}
        <div className="rounded-b-3xl bg-card border border-border shadow-sm overflow-hidden">
          {/* Cover */}
          <div className="h-32 relative bg-gradient-to-br from-primary via-primary/80 to-primary/40">
            {coverUrl ? (
              <img src={coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-2 right-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
                <div className="absolute bottom-0 left-8 h-12 w-12 rounded-full bg-white/10 blur-lg" />
              </div>
            )}

            {isOwnProfile && (
              <button
                aria-label="Profile menu"
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center hover:bg-black/35 transition-colors"
                onClick={() => setShowMenu(true)}
              >
                <MoreHorizontal className="h-4 w-4 text-white" />
              </button>
            )}
          </div>

          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-12 mb-3">
              <div className="relative shrink-0">
                <div className="h-24 w-24 rounded-3xl border-4 border-card ring-1 ring-border flex items-center justify-center shadow-xl overflow-hidden bg-primary">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-2xl">{initials}</span>
                  )}
                </div>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/edit-profile" })}
                    title="Edit Profile"
                    aria-label="Edit Profile"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full border-2 border-card bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {!isOwnProfile && (
                <Button
                  type="button"
                  onClick={toggleHero}
                  disabled={heroUpdating}
                  className={`rounded-full px-4 h-9 font-semibold shadow-sm shrink-0 ${
                    isMyHero
                      ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <HeartHandshake className="h-4 w-4 mr-1.5" />
                  {heroUpdating ? "Updating..." : isMyHero ? "My Hero" : "Hero"}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <h1 className="text-xl font-bold text-foreground truncate">{displayName}</h1>
                {badge && (
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                      {badge.icon}
                      {badge.title}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setBadgeInfoOpen(true)}
                            className="text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">{badge.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>

              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => navigate({ to: "/edit-profile" })}
                  title="Edit Profile"
                  aria-label="Edit Profile"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/15 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
            </div>

            <div className="space-y-1 mt-1">
              {(profile?.city || profile?.country) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {[profile?.city, profile?.country].filter(Boolean).join(", ")}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Member since {profile?.member_since || 2026}
                </span>
                {kycApproved && (
                  <span className="flex items-center gap-1 text-teal-600 font-medium">
                    <CheckCircle2 className="h-3 w-3" /> KYC Verified
                  </span>
                )}
              </div>
              {profile?.bio && <p className="text-sm text-muted-foreground italic pt-1">{profile.bio}</p>}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 rounded-2xl border border-border/70 bg-background/70 px-2 py-3 shadow-sm">
              <button
                onClick={() => openRelationshipList("requesters")}
                className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity"
                aria-label="View Requesters"
              >
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="text-lg font-bold text-primary leading-tight">{heroesCount}</span>
                <span className="text-[11px] text-muted-foreground">Requesters</span>
              </button>
              <button
                onClick={() => openRelationshipList("heroes")}
                className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity border-x border-border/60"
                aria-label="View Heroes"
              >
                <HeartHandshake className="h-3.5 w-3.5 text-foreground" />
                <span className="text-lg font-bold text-foreground leading-tight">{followingCount}</span>
                <span className="text-[11px] text-muted-foreground">Heroes</span>
              </button>
              <div className="flex flex-col items-center gap-0.5">
                <Gift className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-lg font-bold text-amber-600 leading-tight">{supportsCount.toLocaleString()}</span>
                <span className="text-[11px] text-muted-foreground">Supports</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {verificationBadges.map((b) => (
                <span
                  key={b.label}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    b.active
                      ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {b.active ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ============================= Trust Level ============================= */}
        <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Trust Level</span>
            <span className="text-sm font-bold text-primary">{trustLevel}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all ${
                trustLevel >= 70 ? "bg-green-500" : trustLevel >= 40 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${trustLevel}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Based on case history</span>
            <span>
              +{caseStats.completed * 5} approvals · -{caseStats.rejected * 10} rejections · -{caseStats.expired * 5} expired
            </span>
          </div>
        </div>

        {/* ============================= Credits (from Supports) ============================= */}
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold">Credits</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-amber-600">{creditCount}</span>
              <button
                type="button"
                onClick={() => setCreditsInfoOpen(true)}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="How credits work"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div className="h-2 rounded-full bg-amber-500 transition-all" style={{ width: `${creditProgressPct}%` }} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {SUPPORTS_PER_CREDIT - supportsIntoCurrentCredit} more Supports to your next Credit · {creditsIntoCurrentReward}/{CREDITS_PER_REWARD} Credits toward your next reward
            {rewardsUnlocked > 0 ? ` (${rewardsUnlocked} unlocked so far)` : ""}
          </p>
        </div>

        {/* ============================= Role-based Stats ============================= */}
        {role === "hero" ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">
                {totalAmountSpent > 0 ? `$${totalAmountSpent.toFixed(2)}` : "—"}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
                <HandCoins className="h-3 w-3" /> Total Spent
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">{helpedCount}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
                <HeartHandshake className="h-3 w-3" /> Helped
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">{directHelps}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
                <Building2 className="h-3 w-3" /> Direct Helps
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">{contributions}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
                <HandCoins className="h-3 w-3" /> Contributions
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm col-span-2">
              <div className="text-2xl font-bold text-foreground">{unlockCount}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
                <Unlock className="h-3 w-3" /> Total Unlocks
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">{caseStats.submitted}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
                <Briefcase className="h-3 w-3" /> Submitted
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">{caseStats.completed}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-blue-600" /> Completed
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">{caseStats.rejected}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-600" /> Rejected
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">{caseStats.expired}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-600" /> Expired
              </div>
            </div>
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm col-span-2">
              <div className="text-2xl font-bold text-green-600">
                {totalHelpReceived > 0 ? `$${totalHelpReceived.toFixed(2)}` : "—"}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
                <HeartHandshake className="h-3 w-3" /> Total Help Received
              </div>
            </div>
          </div>
        )}

        {/* ============================= Cases List ============================= */}
        {cases.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-primary" /> Cases
              </h2>
              {isOwnProfile && (
                <button
                  onClick={() => navigate({ to: "/my-cases" })}
                  className="text-xs text-primary font-medium flex items-center hover:underline"
                >
                  View all <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {cases.slice(0, 5).map((c: any) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border p-3"
                >
                  <span className="text-sm font-medium truncate">{c.title || `Case #${c.id}`}</span>
                  <span
                    className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${getCaseStatusStyle(c.status)}`}
                  >
                    {c.status || "pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================= Helped Cases (Hero view) ============================= */}
        {role === "hero" && helpedCases.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <h2 className="font-semibold flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-primary" /> Cases You Helped
            </h2>
            <div className="space-y-2">
              {helpedCases.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-xl border border-border p-3">
                  <span className="text-sm font-medium truncate">{r.case_title || `Case #${r.case_id ?? r.id}`}</span>
                  <span className="shrink-0 text-xs font-semibold text-green-600">
                    {r.seeker_confirmed_amount ?? r.amount_paid ? `$${Number(r.seeker_confirmed_amount ?? r.amount_paid).toFixed(2)}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================= Community Posts ============================= */}
        {Array.isArray(profile?.posts) && profile.posts.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-primary" /> Community Posts
              </h2>
              <span className="text-xs text-muted-foreground">{profile.posts.length} posts</span>
            </div>
            {profile.posts.map((post: any) => (
              <article key={post.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {post.is_pinned ? <Pin className="h-3 w-3 text-primary" /> : null}
                  <span>{post.is_pinned ? "Pinned" : "Community post"}</span>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">{post.message}</p>
              </article>
            ))}
          </div>
        )}

        {/* Sandwich Menu Dialog */}
        <Dialog open={showMenu} onOpenChange={setShowMenu}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Account Menu</DialogTitle>
              <DialogDescription>Manage your profile and account settings.</DialogDescription>
            </DialogHeader>
            <div className="rounded-2xl border border-border overflow-hidden">
              {menuItems.map((item, idx) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    navigate({ to: item.to as "/" });
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors ${
                    idx < menuItems.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-primary">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20 font-medium text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        )}

        <p className="text-center text-xs text-muted-foreground pb-2">Givethra v2.0 · Built with ❤️</p>
      </div>

      {/* Logout Dialog */}
      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" /> Logout
            </DialogTitle>
            <DialogDescription>Are you sure you want to logout?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowLogout(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                logout();
                setShowLogout(false);
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4 mr-1.5" /> Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Info Dialog */}
      <Dialog open={badgeInfoOpen} onOpenChange={setBadgeInfoOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Hero Badges
            </DialogTitle>
            <DialogDescription>Understand what each badge means and how you earn them.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
              <div className="mt-0.5 text-xl">🆕</div>
              <div>
                <p className="font-semibold text-sm">Newborn Hero</p>
                <p className="text-xs text-muted-foreground">You unlocked a case but did not complete a payment. Take the next step!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
              <div className="mt-0.5 text-xl">⭐</div>
              <div>
                <p className="font-semibold text-sm">Young Hero</p>
                <p className="text-xs text-muted-foreground">You contributed to a fundraising pool. Every contribution counts!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
              <div className="mt-0.5 text-xl">🦸</div>
              <div>
                <p className="font-semibold text-sm">Hero</p>
                <p className="text-xs text-muted-foreground">You paid directly for someone's need. You are a true Hero!</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
              <div className="mt-0.5 text-xl">🌟</div>
              <div>
                <p className="font-semibold text-sm">Super Hero</p>
                <p className="text-xs text-muted-foreground">You have unlocked, contributed, and provided direct help. The ultimate Hero!</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setBadgeInfoOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credits Info Dialog */}
      <Dialog open={creditsInfoOpen} onOpenChange={setCreditsInfoOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-600" /> How Credits Work
            </DialogTitle>
            <DialogDescription>Turn community Supports into real perks.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-sm text-muted-foreground">
            <p>
              Every <span className="font-semibold text-foreground">{SUPPORTS_PER_CREDIT} Supports</span> your posts and
              cases receive from the community earn you{" "}
              <span className="font-semibold text-foreground">1 Credit</span>.
            </p>
            <p>
              Collect <span className="font-semibold text-foreground">{CREDITS_PER_REWARD} Credits</span> to unlock a
              reward — submit a new case, unlock a case, or clear an account suspension.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setCreditsInfoOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Relationship List Dialog */}
      <Dialog open={relationshipType !== null} onOpenChange={(open) => !open && setRelationshipType(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{relationshipType === "heroes" ? "Your Heroes" : "Your Requesters"}</DialogTitle>
            <DialogDescription>
              {relationshipType === "heroes" ? "People you have chosen as Heroes." : "People who have chosen you as their Hero."}
              {!relationshipLoading && relationshipUsers.length > 0 && (
                <span className="block mt-0.5 text-xs font-medium text-foreground">{relationshipUsers.length} total</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1">
            {relationshipLoading ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Loading...</p>
            ) : relationshipUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No {relationshipType} yet.</p>
            ) : (
              relationshipUsers.map((item, idx) => {
                const userId = item.user_id ?? item.id ?? item.hero_id ?? item.requester_id ?? "";
                const name = item.full_name ?? item.name ?? item.user_name ?? "Givethra User";
                const initials2 = name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={String(userId || idx)} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <button
                      onClick={() => {
                        setRelationshipType(null);
                        if (userId) navigate({ to: "/profile/$id", params: { id: String(userId) } });
                      }}
                      className="h-10 w-10 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-semibold shrink-0"
                    >
                      {item.avatar_url ? (
                        <img src={item.avatar_url} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        initials2
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setRelationshipType(null);
                        if (userId) navigate({ to: "/profile/$id", params: { id: String(userId) } });
                      }}
                      className="flex-1 text-left min-w-0"
                    >
                      <span className="font-medium truncate block">
                        {name}
                        {item.is_verified ? <span className="ml-1 text-teal-600">✓</span> : null}
                      </span>
                    </button>
                    {isOwnProfile && (
                      <Button variant="outline" size="sm" onClick={() => removeRelationship(String(userId))}>
                        {relationshipType === "heroes" ? "Unhero" : "Remove"}
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
