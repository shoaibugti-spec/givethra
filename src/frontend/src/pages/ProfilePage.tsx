// src/frontend/src/pages/ProfilePage.tsx
// Givethra - Complete Profile Page with Correct Layout

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
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings,
  ShieldCheck,
  Wallet,
  HandCoins,
  HeartHandshake,
  Unlock,
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

// Helper: Check if a resolution is approved
function isApprovedResolution(resolution: any): boolean {
  if (!resolution) return false;
  const status = String(resolution?.status || "").trim().toLowerCase();
  if (["completed", "approved", "verified", "confirmed", "seeker_confirmed"].includes(status)) return true;
  if ([1, true, "1", "true", "yes"].includes(resolution?.admin_confirmed)) return true;
  if (resolution?.admin_approved_at || resolution?.approved_at || resolution?.verified_at || resolution?.completed_at || resolution?.admin_confirmed_at) return true;
  return false;
}

// Helper to get badge based on hero stats
function getBadge(unlockCount: number, contributionCount: number, directHelpCount: number) {
  if (directHelpCount > 0 && contributionCount > 0 && unlockCount > 0) {
    return {
      title: "Super Hero",
      emoji: "🌟",
      description: "You have unlocked cases, contributed, and provided direct help. You are the ultimate Hero!",
      icon: <Trophy className="h-6 w-6 text-yellow-500" />,
      color: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
    };
  }
  if (directHelpCount > 0) {
    return {
      title: "Hero",
      emoji: "🦸",
      description: "You paid directly for someone's need. You are a true Hero!",
      icon: <Award className="h-6 w-6 text-blue-500" />,
      color: "bg-gradient-to-r from-blue-400 to-indigo-500 text-white",
    };
  }
  if (contributionCount > 0) {
    return {
      title: "Young Hero",
      emoji: "⭐",
      description: "You contributed to a fundraising pool. Every contribution counts! Keep going to become a full Hero.",
      icon: <Sparkles className="h-6 w-6 text-green-500" />,
      color: "bg-gradient-to-r from-green-400 to-emerald-500 text-white",
    };
  }
  if (unlockCount > 0) {
    return {
      title: "Newborn Hero",
      emoji: "🆕",
      description: "You unlocked a case. Take the next step to become a full Hero!",
      icon: <Sparkles className="h-6 w-6 text-purple-500" />,
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

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { role } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const profileUserId = location.pathname.match(/^\/profile\/([^/]+)/)?.[1] || user?.id || "";
  const isOwnProfile = Boolean(user?.id && profileUserId === user.id);
  const [kycData, setKycData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showLogout, setShowLogout] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isMyHero, setIsMyHero] = useState(false);
  const [heroUpdating, setHeroUpdating] = useState(false);
  const [badgeInfoOpen, setBadgeInfoOpen] = useState(false);
  const [heroesCount, setHeroesCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [supportsCount, setSupportsCount] = useState(0);
  const [relationshipType, setRelationshipType] = useState<"heroes" | "requesters" | null>(null);
  const [relationshipUsers, setRelationshipUsers] = useState<any[]>([]);
  const [relationshipLoading, setRelationshipLoading] = useState(false);

  // Stats for all users
  const [caseStats, setCaseStats] = useState({
    submitted: 0,
    completed: 0,
    rejected: 0,
    expired: 0,
  });

  // Hero specific stats
  const [helpedCount, setHelpedCount] = useState(0);
  const [directHelps, setDirectHelps] = useState(0);
  const [contributions, setContributions] = useState(0);
  const [unlockCount, setUnlockCount] = useState(0);
  const [totalAmountSpent, setTotalAmountSpent] = useState(0);

  // Requester specific stats
  const [totalHelpReceived, setTotalHelpReceived] = useState(0);
  const [trustLevel, setTrustLevel] = useState(100);

  // Badge
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
      const [kyc, cases, prof, resolutions, unlocks] = await Promise.all([
        isOwnProfile && user ? getKycSubmission(user.id) : Promise.resolve(null),
        isOwnProfile && user ? getCasesByUser(user.id) : Promise.resolve([]),
        getProfile(profileUserId, role),
        isOwnProfile && user ? getCaseResolutionsByHero(user.id) : Promise.resolve([]),
        isOwnProfile && user ? getCaseUnlocksByHero(user.id) : Promise.resolve([]),
      ]);

      setKycData(kyc);
      setProfile(prof);
      setHeroesCount(Number(prof?.heroes_count || prof?.followers_count || 0));
      setFollowingCount(Number(prof?.following_count || 0));
      setSupportsCount(Number(prof?.supports_count || 0));
      setIsMyHero(Boolean(prof?.is_following));

      // --- Requester Stats (for everyone) ---
      const caseList = Array.isArray(cases) ? cases : [];
      const submitted = caseList.length;
      const completed = caseList.filter((c: any) => c.status === "completed").length;
      const rejected = caseList.filter((c: any) => c.status === "rejected").length;
      const expired = caseList.filter((c: any) => c.status === "expired").length;
      setCaseStats({ submitted, completed, rejected, expired });

      // Total Help Received (sum of amount_collected from completed cases)
      const totalReceived = caseList
        .filter((c: any) => c.status === "completed")
        .reduce((sum: number, c: any) => sum + (Number(c.amount_collected) || 0), 0);
      setTotalHelpReceived(totalReceived);

      // Trust Level (for requester)
      const trust = getTrustLevel(rejected, completed, expired);
      setTrustLevel(trust);

      // --- Hero Stats ---
      const resolutionList = Array.isArray(resolutions) ? resolutions : [];
      const validResolutions = resolutionList.filter((r: any) => isApprovedResolution(r));
      setHelpedCount(validResolutions.length);

      const direct = validResolutions.filter(
        (r: any) => String(r.paid_to || "").toLowerCase() !== "givethra"
      );
      const contrib = validResolutions.filter(
        (r: any) => String(r.paid_to || "").toLowerCase() === "givethra"
      );
      setDirectHelps(direct.length);
      setContributions(contrib.length);

      const totalSpent = validResolutions.reduce(
        (sum: number, r: any) => sum + (Number(r.seeker_confirmed_amount ?? r.amount_paid) || 0),
        0
      );
      setTotalAmountSpent(totalSpent);

      const unlockList = Array.isArray(unlocks) ? unlocks : [];
      setUnlockCount(unlockList.length);

      // --- Badge (only for Hero) ---
      const badgeInfo = getBadge(unlockList.length, contrib.length, direct.length);
      setBadge(badgeInfo);

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

  const verificationBadges = [
    { label: "Email Verified", icon: <Mail className="h-3 w-3" />, active: !!user?.email },
    { label: "Mobile Verified", icon: <Phone className="h-3 w-3" />, active: !!profile?.phone_number },
    { label: "Identity Verified", icon: <ShieldCheck className="h-3 w-3" />, active: kycApproved },
    { label: "Institution Verified", icon: <Building2 className="h-3 w-3" />, active: false },
  ];

  const menuItems = [
    { icon: <Pencil className="h-5 w-5" />, label: "Edit Profile", to: "/edit-profile" },
    { icon: <Briefcase className="h-5 w-5" />, label: "My Cases Dashboard", to: "/my-cases" },
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
    return <Layout><div className="max-w-xl mx-auto px-4 pt-8 pb-24"><div className="rounded-3xl border border-border bg-card p-8 text-center"><div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted animate-pulse" /><div className="mx-auto h-5 w-40 rounded bg-muted animate-pulse" /><p className="mt-4 text-sm text-muted-foreground">Loading profile...</p></div></div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 pt-0 pb-24 space-y-4">
        {/* Cover & Avatar */}
        <div className="rounded-b-3xl bg-card border border-border shadow-sm">
          <div className="h-32 relative rounded-t-3xl overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-primary/40">
            {coverUrl ? (
              <img src={coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-2 right-4 h-16 w-16 rounded-full bg-white/10 blur-xl" />
                <div className="absolute bottom-0 left-8 h-12 w-12 rounded-full bg-white/10 blur-lg" />
              </div>
            )}
          </div>

          {/* Avatar & Name Row */}
          <div className="px-5 pb-5">
            <div className="flex items-start gap-4 -mt-14 mb-3">
              {/* Avatar */}
              <div className="h-28 w-28 rounded-3xl border-4 border-card ring-1 ring-border flex items-center justify-center shadow-xl overflow-hidden bg-primary relative z-10 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-3xl">{initials}</span>
                )}
              </div>

              {/* Name, Badge, and Buttons */}
              <div className="flex-1 min-w-0 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <h1 className="text-xl font-bold text-foreground truncate">{displayName}</h1>
                    {badge && role === "hero" && (
                      <div className="flex items-center gap-1">
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
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Hero toggle button (only for other users) */}
                    {!isOwnProfile && (
                      <Button
                        type="button"
                        onClick={toggleHero}
                        disabled={heroUpdating}
                        className={`rounded-full px-4 h-9 font-semibold shadow-sm ${
                          isMyHero
                            ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15"
                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                        }`}
                      >
                        <HeartHandshake className="h-4 w-4 mr-1.5" />
                        {heroUpdating ? "Updating..." : isMyHero ? "My Hero" : "Hero"}
                      </Button>
                    )}
                    {/* Edit Pencil Icon (only for own profile) */}
                    {isOwnProfile && (
                      <button
                        type="button"
                        onClick={() => navigate({ to: "/edit-profile" })}
                        title="Edit Profile"
                        className="h-9 w-9 shrink-0 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
                        aria-label="Edit Profile"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                    {/* Sandwich Menu (•••) — only for own profile */}
                    {isOwnProfile && (
                      <button
                        aria-label="Profile menu"
                        className="h-9 w-9 shrink-0 rounded-full border border-border bg-card flex items-center justify-center hover:bg-muted transition-colors"
                        onClick={() => setShowMenu(true)}
                      >
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats Row: Requesters | Heroes | Supports */}
                <div className="flex items-center gap-5 mt-2 rounded-2xl border border-border/70 bg-background/70 px-3 py-2 shadow-sm">
                  <button
                    onClick={() => openRelationshipList("requesters")}
                    className="text-center hover:opacity-70 transition-opacity"
                    aria-label="View Requesters"
                  >
                    <span className="block text-xl font-bold text-primary">{heroesCount}</span>
                    <span className="text-xs text-muted-foreground">Requesters</span>
                  </button>
                  <button
                    onClick={() => openRelationshipList("heroes")}
                    className="text-center hover:opacity-70 transition-opacity"
                    aria-label="View Heroes"
                  >
                    <span className="block text-xl font-bold text-foreground">{followingCount}</span>
                    <span className="text-xs text-muted-foreground">Heroes</span>
                  </button>
                  <div className="text-center">
                    <span className="block text-xl font-bold text-amber-600">{supportsCount.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">Supports</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location, Member Since, KYC */}
            <div className="space-y-1">
              {(profile?.city || profile?.country) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{" "}
                  {[profile?.city, profile?.country].filter(Boolean).join(", ")}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Member since 2026
                </span>
                {kycApproved && (
                  <span className="flex items-center gap-1 text-teal-600 font-medium">
                    <CheckCircle2 className="h-3 w-3" /> KYC Verified
                  </span>
                )}
              </div>
              {profile?.bio && (
                <p className="text-sm text-muted-foreground italic pt-1">{profile.bio}</p>
              )}
            </div>

            {/* Verification Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {verificationBadges.map((badge) => (
                <span
                  key={badge.label}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    badge.active
                      ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {badge.active ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Role-based Stats */}
        {role === "hero" ? (
          // ----- HERO STATS -----
          <>
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
          </>
        ) : (
          // ----- REQUESTER STATS -----
          <>
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

            {/* Trust Level for Requester */}
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
                <span>Based on your case history</span>
                <span>
                  +{caseStats.completed * 5} approvals · -{caseStats.rejected * 10} rejections · -{caseStats.expired * 5} expired
                </span>
              </div>
            </div>
          </>
        )}

        {/* Community Posts Section */}
        {Array.isArray(profile?.posts) && profile.posts.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Community Posts</h2>
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
        <button
          type="button"
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20 font-medium text-sm transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>

        <p className="text-center text-xs text-muted-foreground pb-2">
          Givethra v2.0 · Built with ❤️
        </p>
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
            <DialogDescription>
              Understand what each badge means and how you earn them.
            </DialogDescription>
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

      {/* Relationship List Dialog (Requesters / Heroes) */}
      <Dialog open={relationshipType !== null} onOpenChange={(open) => !open && setRelationshipType(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{relationshipType === "heroes" ? "Your Heroes" : "Your Requesters"}</DialogTitle>
            <DialogDescription>
              {relationshipType === "heroes" ? "People you have chosen as Heroes." : "People who have chosen you as their Hero."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[55vh] overflow-y-auto space-y-2">
            {relationshipLoading ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Loading...</p>
            ) : relationshipUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No {relationshipType} yet.</p>
            ) : (
              relationshipUsers.map((item) => {
                const name = item.full_name || "User";
                const initials = name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={item.user_id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <button
                      onClick={() => {
                        setRelationshipType(null);
                        navigate({ to: "/profile/$id", params: { id: String(item.user_id) } });
                      }}
                      className="h-10 w-10 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-semibold shrink-0"
                    >
                      {item.avatar_url ? (
                        <img src={item.avatar_url} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setRelationshipType(null);
                        navigate({ to: "/profile/$id", params: { id: String(item.user_id) } });
                      }}
                      className="flex-1 text-left font-medium truncate"
                    >
                      {name}
                      {item.is_verified ? <span className="ml-1 text-teal-600">✓</span> : null}
                    </button>
                    {isOwnProfile && (
                      <Button variant="outline" size="sm" onClick={() => removeRelationship(String(item.user_id))}>
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
