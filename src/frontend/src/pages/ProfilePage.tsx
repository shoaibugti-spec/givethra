// src/frontend/src/pages/ProfilePage.tsx
// Givethra — Production Profile Page
//
// Key fixes:
// - Own and public profiles are handled separately.
// - Viewed user's data is used for profile statistics.
// - Hero/Requester display is based on the viewed profile where possible.
// - Mobile layout avoids horizontal overflow.
// - Relationship lists use the viewed profile's relationships.
// - Edit/Logout actions are available only on the owner's profile.
// - Follow/Unfollow updates the correct relationship count.
// - KYC and trust information belongs to the viewed user.
// - Credits are calculated from Supports.
// - Hero badges are calculated from actual Hero activity.

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useNavigate, useLocation } from "@tanstack/react-router";

import {
  Award,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Coins,
  Gift,
  HeartHandshake,
  Info,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Phone,
  Pin,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Unlock,
  Users,
  Wallet,
  XCircle,
  HandCoins,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
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

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SUPPORTS_PER_CREDIT = 100;
const CREDITS_PER_REWARD = 5;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RelationshipType =
  | "heroes"
  | "requesters"
  | "supporters"
  | null;

type BadgeInfo = {
  title: string;
  emoji: string;
  description: string;
  icon: JSX.Element;
  color: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeStatus(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isApprovedResolution(resolution: any): boolean {
  if (!resolution) return false;

  const status = normalizeStatus(resolution.status);

  if (
    [
      "completed",
      "approved",
      "verified",
      "confirmed",
      "seeker_confirmed",
    ].includes(status)
  ) {
    return true;
  }

  if (
    [1, true, "1", "true", "yes"].includes(
      resolution.admin_confirmed,
    )
  ) {
    return true;
  }

  if (
    resolution.admin_approved_at ||
    resolution.approved_at ||
    resolution.verified_at ||
    resolution.completed_at ||
    resolution.admin_confirmed_at
  ) {
    return true;
  }

  return false;
}

function getBadge(
  unlockCount: number,
  contributionCount: number,
  directHelpCount: number,
): BadgeInfo | null {
  if (
    directHelpCount > 0 &&
    contributionCount > 0 &&
    unlockCount > 0
  ) {
    return {
      title: "Super Hero",
      emoji: "🌟",
      description:
        "You have unlocked cases, contributed, and provided direct help. You are the ultimate Hero!",
      icon: <Trophy className="h-4 w-4" />,
      color:
        "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
    };
  }

  if (directHelpCount > 0) {
    return {
      title: "Hero",
      emoji: "🦸",
      description:
        "You paid directly for someone's need. You are a true Hero!",
      icon: <Award className="h-4 w-4" />,
      color:
        "bg-gradient-to-r from-blue-400 to-indigo-500 text-white",
    };
  }

  if (contributionCount > 0) {
    return {
      title: "Young Hero",
      emoji: "⭐",
      description:
        "You contributed to a fundraising pool. Every contribution counts! Keep going to become a full Hero.",
      icon: <Sparkles className="h-4 w-4" />,
      color:
        "bg-gradient-to-r from-green-400 to-emerald-500 text-white",
    };
  }

  if (unlockCount > 0) {
    return {
      title: "Newborn Hero",
      emoji: "🆕",
      description:
        "You unlocked a case. Take the next step to become a full Hero!",
      icon: <Sparkles className="h-4 w-4" />,
      color:
        "bg-gradient-to-r from-purple-400 to-pink-500 text-white",
    };
  }

  return null;
}

function calculateTrustLevel(
  rejected: number,
  approved: number,
  expired: number,
): number {
  let trust = 100;

  trust -= rejected * 10;
  trust += approved * 5;
  trust -= expired * 5;

  return Math.max(0, Math.min(100, trust));
}

function getCaseStatusStyle(status: string) {
  const value = normalizeStatus(status);

  if (value === "completed") {
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900";
  }

  if (
    value === "active" ||
    value === "approved" ||
    value === "live"
  ) {
    return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900";
  }

  if (value === "rejected") {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900";
  }

  if (value === "expired") {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900";
  }

  return "bg-muted text-muted-foreground border-border";
}

function getDisplayRole(profile: any, fallbackRole: string | null) {
  const raw =
    profile?.role ??
    profile?.user_role ??
    profile?.account_role ??
    profile?.type ??
    fallbackRole ??
    "";

  const value = normalizeStatus(raw);

  if (
    value === "hero" ||
    value === "helper" ||
    value === "donor"
  ) {
    return "hero";
  }

  if (
    value === "requester" ||
    value === "help_seeker" ||
    value === "seeker"
  ) {
    return "requester";
  }

  return fallbackRole === "hero" ? "hero" : "requester";
}

function getInitials(name: string): string {
  const initials = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return initials || "G";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { role } = useRole();

  const navigate = useNavigate();
  const location = useLocation();

  // -------------------------------------------------------------------------
  // Determine whose profile is being viewed
  // -------------------------------------------------------------------------

  const profileUserId =
    location.pathname.match(/^\/profile\/([^/]+)/)?.[1] ||
    user?.id ||
    "";

  const isOwnProfile =
    Boolean(user?.id) &&
    String(profileUserId) === String(user.id);

  // -------------------------------------------------------------------------
  // Main state
  // -------------------------------------------------------------------------

  const [profile, setProfile] = useState<any>(null);
  const [kycData, setKycData] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [showMenu, setShowMenu] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [badgeInfoOpen, setBadgeInfoOpen] =
    useState(false);

  const [creditsInfoOpen, setCreditsInfoOpen] =
    useState(false);

  // -------------------------------------------------------------------------
  // Relationship state
  // -------------------------------------------------------------------------

  const [heroesCount, setHeroesCount] = useState(0);
  const [followingCount, setFollowingCount] =
    useState(0);
  const [supportsCount, setSupportsCount] =
    useState(0);

  const [isMyHero, setIsMyHero] = useState(false);
  const [heroUpdating, setHeroUpdating] =
    useState(false);

  const [relationshipType, setRelationshipType] =
    useState<RelationshipType>(null);

  const [relationshipUsers, setRelationshipUsers] =
    useState<any[]>([]);

  const [relationshipLoading, setRelationshipLoading] =
    useState(false);

  // -------------------------------------------------------------------------
  // Case stats
  // -------------------------------------------------------------------------

  const [caseStats, setCaseStats] = useState({
    submitted: 0,
    completed: 0,
    rejected: 0,
    expired: 0,
  });

  const [totalHelpReceived, setTotalHelpReceived] =
    useState(0);

  const [trustLevel, setTrustLevel] = useState(100);

  // -------------------------------------------------------------------------
  // Hero stats
  // -------------------------------------------------------------------------

  const [helpedCount, setHelpedCount] = useState(0);
  const [directHelps, setDirectHelps] = useState(0);
  const [contributions, setContributions] =
    useState(0);

  const [unlockCount, setUnlockCount] =
    useState(0);

  const [totalAmountSpent, setTotalAmountSpent] =
    useState(0);

  const [helpedCases, setHelpedCases] =
    useState<any[]>([]);

  const [badge, setBadge] =
    useState<BadgeInfo | null>(null);

  // -------------------------------------------------------------------------
  // Load profile
  // -------------------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      if (!profileUserId) {
        navigate({ to: "/sign-in" });
        return;
      }

      setProfileLoading(true);

      // Reset old profile data immediately when navigating
      // from one profile to another.
      setProfile(null);
      setKycData(null);
      setCases([]);
      setRelationshipUsers([]);
      setRelationshipType(null);

      setCaseStats({
        submitted: 0,
        completed: 0,
        rejected: 0,
        expired: 0,
      });

      setTotalHelpReceived(0);
      setTrustLevel(100);

      setHelpedCount(0);
      setDirectHelps(0);
      setContributions(0);
      setUnlockCount(0);
      setTotalAmountSpent(0);
      setHelpedCases([]);
      setBadge(null);

      try {
        const [
          kyc,
          caseList,
          prof,
          resolutions,
          unlocks,
        ] = await Promise.all([
          getKycSubmission(profileUserId),
          getCasesByUser(profileUserId),
          getProfile(profileUserId, role),
          getCaseResolutionsByHero(profileUserId),
          getCaseUnlocksByHero(profileUserId),
        ]);

        if (cancelled) return;

        const list = Array.isArray(caseList)
          ? caseList
          : [];

        const resolutionList = Array.isArray(resolutions)
          ? resolutions
          : [];

        const unlockList = Array.isArray(unlocks)
          ? unlocks
          : [];

        setKycData(kyc);
        setProfile(prof);
        setCases(list);

        // ---------------------------------------------------------------
        // Relationships
        // ---------------------------------------------------------------

        setHeroesCount(
          Number(
            prof?.requesters_count ??
              prof?.heroes_count ??
              prof?.followers_count ??
              0,
          ),
        );

        setFollowingCount(
          Number(
            prof?.heroes_count ??
              prof?.following_count ??
              0,
          ),
        );

        setSupportsCount(
          Number(
            prof?.supports_count ??
              prof?.support_count ??
              0,
          ),
        );

        setIsMyHero(
          Boolean(
            prof?.is_following ??
              prof?.is_my_hero ??
              false,
          ),
        );

        // ---------------------------------------------------------------
        // Requester / Case statistics
        // ---------------------------------------------------------------

        const submitted = list.length;

        const completed = list.filter(
          (item: any) =>
            normalizeStatus(item.status) ===
            "completed",
        ).length;

        const rejected = list.filter(
          (item: any) =>
            normalizeStatus(item.status) ===
            "rejected",
        ).length;

        const expired = list.filter(
          (item: any) =>
            normalizeStatus(item.status) ===
            "expired",
        ).length;

        setCaseStats({
          submitted,
          completed,
          rejected,
          expired,
        });

        const totalReceived = list
          .filter(
            (item: any) =>
              normalizeStatus(item.status) ===
              "completed",
          )
          .reduce(
            (sum: number, item: any) =>
              sum +
              (Number(
                item.amount_collected ??
                  item.collected_amount ??
                  item.amount_received ??
                  0,
              ) || 0),
            0,
          );

        setTotalHelpReceived(totalReceived);

        setTrustLevel(
          calculateTrustLevel(
            rejected,
            completed,
            expired,
          ),
        );

        // ---------------------------------------------------------------
        // Hero statistics
        // ---------------------------------------------------------------

        const validResolutions =
          resolutionList.filter(
            isApprovedResolution,
          );

        setHelpedCount(validResolutions.length);

        setHelpedCases(
          validResolutions.slice(0, 5),
        );

        const direct = validResolutions.filter(
          (item: any) =>
            normalizeStatus(item.paid_to) !==
            "givethra",
        );

        const contribution =
          validResolutions.filter(
            (item: any) =>
              normalizeStatus(item.paid_to) ===
              "givethra",
          );

        setDirectHelps(direct.length);
        setContributions(contribution.length);

        const totalSpent = validResolutions.reduce(
          (sum: number, item: any) =>
            sum +
            (Number(
              item.seeker_confirmed_amount ??
                item.amount_paid ??
                item.paid_amount ??
                item.amount ??
                0,
            ) || 0),
          0,
        );

        setTotalAmountSpent(totalSpent);

        setUnlockCount(unlockList.length);

        setBadge(
          getBadge(
            unlockList.length,
            contribution.length,
            direct.length,
          ),
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load profile:",
            error,
          );
          toast.error(
            "Unable to load profile information.",
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [
    profileUserId,
    role,
    isAuthenticated,
    navigate,
  ]);

  // -------------------------------------------------------------------------
  // Derived values
  // -------------------------------------------------------------------------

  const kycApproved =
    normalizeStatus(kycData?.status) ===
    "approved";

  const displayName =
    profile?.full_name ||
    profile?.name ||
    (isOwnProfile
      ? user?.fullName
      : null) ||
    "Givethra User";

  const avatarUrl =
    profile?.avatar_url ||
    profile?.profile_image ||
    null;

  const coverUrl =
    profile?.cover_url ||
    profile?.cover_image ||
    null;

  const initials = getInitials(displayName);

  const viewedRole = useMemo(
    () => getDisplayRole(profile, role),
    [profile, role],
  );

  // -------------------------------------------------------------------------
  // Credits
  // -------------------------------------------------------------------------

  const creditCount = Math.floor(
    supportsCount / SUPPORTS_PER_CREDIT,
  );

  const supportsIntoCurrentCredit =
    supportsCount % SUPPORTS_PER_CREDIT;

  const creditProgressPct = Math.round(
    (supportsIntoCurrentCredit /
      SUPPORTS_PER_CREDIT) *
      100,
  );

  const rewardsUnlocked = Math.floor(
    creditCount / CREDITS_PER_REWARD,
  );

  const creditsIntoCurrentReward =
    creditCount % CREDITS_PER_REWARD;

  // -------------------------------------------------------------------------
  // Verification badges
  // -------------------------------------------------------------------------

  const verificationBadges = [
    {
      label: "Email Verified",
      icon: (
        <Mail className="h-3 w-3" />
      ),
      active: isOwnProfile
        ? Boolean(user?.email)
        : Boolean(profile?.email_verified),
    },
    {
      label: "Mobile Verified",
      icon: (
        <Phone className="h-3 w-3" />
      ),
      active: Boolean(
        profile?.phone_verified ??
          profile?.phone_number,
      ),
    },
    {
      label: "Identity Verified",
      icon: (
        <ShieldCheck className="h-3 w-3" />
      ),
      active: kycApproved,
    },
    {
      label: "Institution Verified",
      icon: (
        <Building2 className="h-3 w-3" />
      ),
      active: Boolean(
        profile?.institution_verified,
      ),
    },
  ];

  // -------------------------------------------------------------------------
  // Account menu
  // -------------------------------------------------------------------------

  const menuItems = [
    {
      icon: <Pencil className="h-5 w-5" />,
      label: "Edit Profile",
      to: "/edit-profile",
    },
    {
      icon: (
        <MessageCircle className="h-5 w-5" />
      ),
      label: "Community",
      to: "/community",
    },
    {
      icon: (
        <Briefcase className="h-5 w-5" />
      ),
      label: "My Cases Dashboard",
      to: "/my-cases",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "Notifications",
      to: "/notifications",
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: "Wallet",
      to: "/wallet",
    },
    {
      icon: (
        <ShieldCheck className="h-5 w-5" />
      ),
      label: "Security",
      to: "/security",
    },
    {
      icon: <KeyRound className="h-5 w-5" />,
      label: "Google Account Security",
      to: "/security",
    },
    {
      icon: <Lock className="h-5 w-5" />,
      label: "Privacy",
      to: "/account-privacy",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      to: "/settings",
    },
  ];

  // -------------------------------------------------------------------------
  // Hero toggle
  // -------------------------------------------------------------------------

  async function toggleHero() {
    if (!isAuthenticated || !user?.id) {
      navigate({ to: "/sign-in" });
      return;
    }

    if (
      isOwnProfile ||
      heroUpdating ||
      !profileUserId
    ) {
      return;
    }

    setHeroUpdating(true);

    try {
      if (isMyHero) {
        await unfollowUser(profileUserId);

        setIsMyHero(false);

        // This is the number of people who have selected
        // this profile as Hero.
        setHeroesCount((count) =>
          Math.max(0, count - 1),
        );

        toast.success(
          "Removed from My Heroes",
        );
      } else {
        await followUser(profileUserId);

        setIsMyHero(true);

        setHeroesCount(
          (count) => count + 1,
        );

        toast.success(
          "Added to My Heroes",
        );
      }
    } catch (error) {
      console.error(
        "Failed to update Hero:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update Hero status.",
      );
    } finally {
      setHeroUpdating(false);
    }
  }

  // -------------------------------------------------------------------------
  // Relationship list
  // -------------------------------------------------------------------------

  async function openRelationshipList(
    type: Exclude<
      RelationshipType,
      null
    >,
  ) {
    setRelationshipType(type);
    setRelationshipUsers([]);
    setRelationshipLoading(true);

    try {
      const result =
        await getFollowList(
          profileUserId,
          type,
        );

      setRelationshipUsers(
        Array.isArray(result)
          ? result
          : [],
      );
    } catch (error) {
      console.error(
        "Failed to load relationship list:",
        error,
      );

      setRelationshipUsers([]);

      toast.error(
        "Could not load this list.",
      );
    } finally {
      setRelationshipLoading(false);
    }
  }

  // -------------------------------------------------------------------------
  // Remove relationship
  // -------------------------------------------------------------------------

  async function removeRelationship(
    targetId: string,
  ) {
    if (!isOwnProfile || !relationshipType) {
      return;
    }

    try {
      if (
        relationshipType === "heroes"
      ) {
        await unfollowUser(targetId);

        setFollowingCount((count) =>
          Math.max(0, count - 1),
        );
      }

      if (
        relationshipType ===
        "requesters"
      ) {
        await removeRequester(targetId);

        setHeroesCount((count) =>
          Math.max(0, count - 1),
        );
      }

      setRelationshipUsers(
        (items) =>
          items.filter(
            (item) =>
              String(
                item.user_id ??
                  item.id ??
                  item.hero_id ??
                  item.requester_id ??
                  item.supporter_id,
              ) !== String(targetId),
          ),
      );

      toast.success(
        relationshipType === "heroes"
          ? "Hero removed."
          : "Requester removed.",
      );
    } catch (error) {
      console.error(
        "Failed to remove relationship:",
        error,
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Could not remove relationship.",
      );
    }
  }

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  if (!profileUserId) {
    return null;
  }

  if (profileLoading) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 pt-6 pb-24">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="h-32 bg-muted animate-pulse" />

            <div className="px-5 pb-6">
              <div className="-mt-12 mb-4 h-24 w-24 rounded-3xl border-4 border-card bg-muted animate-pulse" />

              <div className="h-6 w-44 rounded bg-muted animate-pulse" />

              <div className="mt-3 h-4 w-32 rounded bg-muted animate-pulse" />

              <div className="mt-5 h-20 rounded-2xl bg-muted animate-pulse" />
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <p className="text-center text-sm text-muted-foreground">
              Loading profile...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 pt-8 pb-24">
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <XCircle className="mx-auto h-10 w-10 text-muted-foreground" />

            <h2 className="mt-4 font-semibold">
              Profile unavailable
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              This profile could not be loaded.
            </p>

            <Button
              className="mt-5"
              onClick={() =>
                navigate({ to: "/" })
              }
            >
              Go Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Layout>
      <div className="mx-auto w-full max-w-xl min-w-0 space-y-4 px-4 pb-24 pt-0">
        {/* ================================================================
            PROFILE HEADER
        ================================================================= */}

        <section className="overflow-hidden rounded-b-3xl border border-border bg-card shadow-sm">
          {/* Cover */}
          <div className="relative h-32 bg-gradient-to-br from-primary via-primary/80 to-primary/40">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt="Profile cover"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute right-5 top-2 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 left-10 h-16 w-16 rounded-full bg-white/10 blur-xl" />
              </div>
            )}

            {/* Own profile menu */}
            {isOwnProfile && (
              <button
                type="button"
                aria-label="Profile menu"
                onClick={() =>
                  setShowMenu(true)
                }
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/40"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="min-w-0 px-5 pb-5">
            {/* Avatar + Hero action */}
            <div className="-mt-12 mb-4 flex min-w-0 items-end justify-between gap-3">
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-card bg-primary shadow-xl ring-1 ring-border">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {initials}
                    </span>
                  )}
                </div>

                {isOwnProfile && (
                  <button
                    type="button"
                    title="Edit Profile"
                    aria-label="Edit Profile"
                    onClick={() =>
                      navigate({
                        to: "/edit-profile",
                      })
                    }
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {!isOwnProfile && (
                <Button
                  type="button"
                  disabled={heroUpdating}
                  onClick={toggleHero}
                  className={`h-9 shrink-0 rounded-full px-4 font-semibold ${
                    isMyHero
                      ? "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  <HeartHandshake className="mr-1.5 h-4 w-4" />

                  {heroUpdating
                    ? "Updating..."
                    : isMyHero
                      ? "My Hero"
                      : "Hero"}
                </Button>
              )}
            </div>

            {/* Name + edit */}
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h1 className="max-w-full break-words text-xl font-bold text-foreground">
                    {displayName}
                  </h1>

                  {badge && (
                    <div className="flex shrink-0 items-center gap-1">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${badge.color}`}
                      >
                        {badge.icon}
                        {badge.title}
                      </span>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              aria-label="Badge information"
                              onClick={() =>
                                setBadgeInfoOpen(
                                  true,
                                )
                              }
                              className="text-muted-foreground transition hover:text-primary"
                            >
                              <Info className="h-4 w-4" />
                            </button>
                          </TooltipTrigger>

                          <TooltipContent>
                            <p className="max-w-xs text-xs">
                              {badge.description}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>

              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/edit-profile",
                    })
                  }
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/15"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>

            {/* Location */}
            {(profile?.city ||
              profile?.country) && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="break-words">
                  {[
                    profile?.city,
                    profile?.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>
            )}

            {/* Member / verification */}
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Member since{" "}
                {profile?.member_since ||
                  profile?.created_year ||
                  2026}
              </span>

              {kycApproved && (
                <span className="flex items-center gap-1 font-medium text-teal-600">
                  <CheckCircle2 className="h-3 w-3" />
                  KYC Verified
                </span>
              )}
            </div>

            {/* Bio */}
            {profile?.bio && (
              <p className="break-words pt-2 text-sm italic text-muted-foreground">
                {profile.bio}
              </p>
            )}

            {/* ============================================================
                RELATIONSHIP COUNTS
            ============================================================ */}

            <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-border/70 bg-background/70 shadow-sm">
              <button
                type="button"
                onClick={() =>
                  openRelationshipList(
                    "requesters",
                  )
                }
                className="flex min-w-0 flex-col items-center gap-0.5 px-1 py-3 transition hover:bg-muted/40"
              >
                <Users className="h-3.5 w-3.5 text-primary" />

                <span className="text-lg font-bold leading-tight text-primary">
                  {heroesCount.toLocaleString()}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  Requesters
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openRelationshipList(
                    "heroes",
                  )
                }
                className="flex min-w-0 flex-col items-center gap-0.5 border-x border-border/60 px-1 py-3 transition hover:bg-muted/40"
              >
                <HeartHandshake className="h-3.5 w-3.5 text-foreground" />

                <span className="text-lg font-bold leading-tight text-foreground">
                  {followingCount.toLocaleString()}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  Heroes
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  openRelationshipList(
                    "supporters",
                  )
                }
                className="flex min-w-0 flex-col items-center gap-0.5 px-1 py-3 transition hover:bg-muted/40"
              >
                <Gift className="h-3.5 w-3.5 text-amber-600" />

                <span className="text-lg font-bold leading-tight text-amber-600">
                  {supportsCount.toLocaleString()}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  Supports
                </span>
              </button>
            </div>

            {/* ============================================================
                VERIFICATION BADGES
            ============================================================ */}

            <div className="mt-3 flex flex-wrap gap-2">
              {verificationBadges.map(
                (item) => (
                  <span
                    key={item.label}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                      item.active
                        ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-400"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.active ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}

                    {item.label}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>

        {/* ================================================================
            TRUST LEVEL
        ================================================================= */}

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">
              Trust Level
            </span>

            <span className="text-sm font-bold text-primary">
              {trustLevel}%
            </span>
          </div>

          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-3 rounded-full transition-all ${
                trustLevel >= 70
                  ? "bg-green-500"
                  : trustLevel >= 40
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
              style={{
                width: `${trustLevel}%`,
              }}
            />
          </div>

          <div className="mt-2 flex flex-wrap justify-between gap-1 text-[10px] text-muted-foreground">
            <span>
              Based on case history
            </span>

            <span>
              +{caseStats.completed * 5} approvals
              {" · "}
              -{caseStats.rejected * 10} rejections
              {" · "}
              -{caseStats.expired * 5} expired
            </span>
          </div>
        </section>

        {/* ================================================================
            CREDITS
        ================================================================= */}

        <section className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-600" />

              <span className="text-sm font-semibold">
                Credits
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-amber-600">
                {creditCount}
              </span>

              <button
                type="button"
                aria-label="How credits work"
                onClick={() =>
                  setCreditsInfoOpen(
                    true,
                  )
                }
                className="text-muted-foreground transition hover:text-primary"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all"
              style={{
                width: `${creditProgressPct}%`,
              }}
            />
          </div>

          <p className="mt-2 text-[11px] text-muted-foreground">
            {SUPPORTS_PER_CREDIT -
              supportsIntoCurrentCredit}{" "}
            more Supports to your next Credit
            {" · "}
            {creditsIntoCurrentReward}/
            {CREDITS_PER_REWARD} Credits toward
            your next reward
            {rewardsUnlocked > 0
              ? ` (${rewardsUnlocked} unlocked so far)`
              : ""}
          </p>
        </section>

        {/* ================================================================
            ROLE STATS
        ================================================================= */}

        {viewedRole === "hero" ? (
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
              <div className="text-2xl font-bold">
                {totalAmountSpent > 0
                  ? `$${totalAmountSpent.toFixed(2)}`
                  : "—"}
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight text-muted-foreground">
                <HandCoins className="h-3 w-3" />
                Total Spent
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
              <div className="text-2xl font-bold">
                {helpedCount}
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight text-muted-foreground">
                <HeartHandshake className="h-3 w-3" />
                Helped
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
              <div className="text-2xl font-bold">
                {directHelps}
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight text-muted-foreground">
                <Building2 className="h-3 w-3" />
                Direct Helps
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
              <div className="text-2xl font-bold">
                {contributions}
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight text-muted-foreground">
                <HandCoins className="h-3 w-3" />
                Contributions
              </div>
            </div>

            <div className="col-span-2 rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
              <div className="text-2xl font-bold">
                {unlockCount}
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight text-muted-foreground">
                <Unlock className="h-3 w-3" />
                Total Unlocks
              </div>
            </div>
          </section>
        ) : (
          <section className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
              <div className="text-2xl font-bold">
                {caseStats.submitted}
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                Submitted
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
              <div className="text-2xl font-bold">
                {caseStats.completed}
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight text-muted-foreground">
                <CheckCircle2 className="h-3 w-3 text-blue-600" />
                Completed
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
              <div className="text-2xl font-bold">
                {caseStats.rejected}
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight text-muted-foreground">
                <XCircle className="h-3 w-3 text-red-600" />
                Rejected
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
              <div className="text-2xl font-bold">
                {caseStats.expired}
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight text-muted-foreground">
                <Calendar className="h-3 w-3 text-amber-600" />
                Expired
              </div>
            </div>

            <div className="col-span-2 rounded-2xl border border-border bg-card p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {totalHelpReceived > 0
                  ? `$${totalHelpReceived.toFixed(2)}`
                  : "—"}
              </div>

              <div className="mt-0.5 flex items-center justify-center gap-1 text-[10px] leading-tight text-muted-foreground">
                <HeartHandshake className="h-3 w-3" />
                Total Help Received
              </div>
            </div>
          </section>
        )}

        {/* ================================================================
            CASES
        ================================================================= */}

        {cases.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-1.5 font-semibold">
                <Briefcase className="h-4 w-4 text-primary" />
                Cases
              </h2>

              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/my-cases",
                    })
                  }
                  className="flex shrink-0 items-center text-xs font-medium text-primary hover:underline"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="mt-3 space-y-2">
              {cases
                .slice(0, 5)
                .map((item: any) => (
                  <button
                    key={String(item.id)}
                    type="button"
                    onClick={() => {
                      if (item.id) {
                        navigate({
                          to: "/cases/$id",
                          params: {
                            id: String(
                              item.id,
                            ),
                          },
                        });
                      }
                    }}
                    className="flex w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-border p-3 text-left transition hover:bg-muted/40"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {item.title ||
                        `Case #${item.id}`}
                    </span>

                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${getCaseStatusStyle(
                        item.status,
                      )}`}
                    >
                      {item.status ||
                        "pending"}
                    </span>
                  </button>
                ))}
            </div>
          </section>
        )}

        {/* ================================================================
            CASES HELPED
        ================================================================= */}

        {viewedRole === "hero" &&
          helpedCases.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-4">
              <h2 className="flex items-center gap-1.5 font-semibold">
                <HeartHandshake className="h-4 w-4 text-primary" />
                Cases You Helped
              </h2>

              <div className="mt-3 space-y-2">
                {helpedCases.map(
                  (item: any) => (
                    <div
                      key={String(
                        item.id ??
                          item.case_id,
                      )}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border p-3"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {item.case_title ||
                          `Case #${
                            item.case_id ??
                            item.id
                          }`}
                      </span>

                      <span className="shrink-0 text-xs font-semibold text-green-600">
                        {item.seeker_confirmed_amount ??
                        item.amount_paid
                          ? `$${Number(
                              item.seeker_confirmed_amount ??
                                item.amount_paid,
                            ).toFixed(2)}`
                          : ""}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

        {/* ================================================================
            COMMUNITY POSTS
        ================================================================= */}

        {Array.isArray(
          profile?.posts,
        ) &&
          profile.posts.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-1.5 font-semibold">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Community Posts
                </h2>

                <span className="shrink-0 text-xs text-muted-foreground">
                  {profile.posts.length} posts
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {profile.posts.map(
                  (post: any) => (
                    <article
                      key={String(post.id)}
                      className="rounded-xl border border-border p-3"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {post.is_pinned ? (
                          <Pin className="h-3 w-3 text-primary" />
                        ) : null}

                        <span>
                          {post.is_pinned
                            ? "Pinned"
                            : "Community post"}
                        </span>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm">
                        {post.message}
                      </p>
                    </article>
                  ),
                )}
              </div>
            </section>
          )}

        {/* ================================================================
            LOGOUT
        ================================================================= */}

        {isOwnProfile && (
          <button
            type="button"
            onClick={() =>
              setShowLogout(true)
            }
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 py-3.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        )}

        <p className="pb-2 text-center text-xs text-muted-foreground">
          Givethra v2.0 · Built with ❤️
        </p>

        {/* ================================================================
            ACCOUNT MENU
        ================================================================= */}

        <Dialog
          open={showMenu}
          onOpenChange={setShowMenu}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                Account Menu
              </DialogTitle>

              <DialogDescription>
                Manage your profile and account
                settings.
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-hidden rounded-2xl border border-border">
              {menuItems.map(
                (item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setShowMenu(false);

                      navigate({
                        to: item.to as any,
                      });
                    }}
                    className={`flex w-full items-center gap-3 px-5 py-4 text-sm font-medium text-foreground transition hover:bg-muted/50 ${
                      index <
                      menuItems.length - 1
                        ? "border-b border-border"
                        : ""
                    }`}
                  >
                    <span className="text-primary">
                      {item.icon}
                    </span>

                    <span className="min-w-0 flex-1 text-left">
                      {item.label}
                    </span>

                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ),
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* ================================================================
            LOGOUT DIALOG
        ================================================================= */}

        <Dialog
          open={showLogout}
          onOpenChange={setShowLogout}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogOut className="h-5 w-5 text-red-500" />
                Logout
              </DialogTitle>

              <DialogDescription>
                Are you sure you want to logout?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setShowLogout(false)
                }
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  logout();
                  setShowLogout(false);
                  navigate({
                    to: "/",
                  });
                }}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ================================================================
            BADGE INFO
        ================================================================= */}

        <Dialog
          open={badgeInfoOpen}
          onOpenChange={setBadgeInfoOpen}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Hero Badges
              </DialogTitle>

              <DialogDescription>
                Understand what each Hero badge means.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-2">
                <span className="mt-0.5 text-xl">
                  🆕
                </span>

                <div>
                  <p className="text-sm font-semibold">
                    Newborn Hero
                  </p>

                  <p className="text-xs text-muted-foreground">
                    You unlocked a case but did
                    not complete a payment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-2">
                <span className="mt-0.5 text-xl">
                  ⭐
                </span>

                <div>
                  <p className="text-sm font-semibold">
                    Young Hero
                  </p>

                  <p className="text-xs text-muted-foreground">
                    You contributed to a
                    fundraising pool.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-2">
                <span className="mt-0.5 text-xl">
                  🦸
                </span>

                <div>
                  <p className="text-sm font-semibold">
                    Hero
                  </p>

                  <p className="text-xs text-muted-foreground">
                    You paid directly for
                    someone's need.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-muted/30 p-2">
                <span className="mt-0.5 text-xl">
                  🌟
                </span>

                <div>
                  <p className="text-sm font-semibold">
                    Super Hero
                  </p>

                  <p className="text-xs text-muted-foreground">
                    You have unlocked,
                    contributed, and provided
                    direct help.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={() =>
                  setBadgeInfoOpen(false)
                }
              >
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ================================================================
            CREDITS INFO
        ================================================================= */}

        <Dialog
          open={creditsInfoOpen}
          onOpenChange={setCreditsInfoOpen}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-600" />
                How Credits Work
              </DialogTitle>

              <DialogDescription>
                Turn community Supports into Givethra
                perks.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-sm text-muted-foreground">
              <p>
                Every{" "}
                <span className="font-semibold text-foreground">
                  {SUPPORTS_PER_CREDIT} Supports
                </span>{" "}
                your posts and cases receive from
                the community earn you{" "}
                <span className="font-semibold text-foreground">
                  1 Credit
                </span>
                .
              </p>

              <p>
                Collect{" "}
                <span className="font-semibold text-foreground">
                  {CREDITS_PER_REWARD} Credits
                </span>{" "}
                to unlock a reward such as
                submitting a new case, unlocking a
                case, or clearing an account
                suspension.
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={() =>
                  setCreditsInfoOpen(false)
                }
              >
                Got it
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ================================================================
            RELATIONSHIP LIST
        ================================================================= */}

        <Dialog
          open={relationshipType !== null}
          onOpenChange={(open) => {
            if (!open) {
              setRelationshipType(null);
              setRelationshipUsers([]);
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {relationshipType ===
                "heroes"
                  ? "Your Heroes"
                  : relationshipType ===
                      "supporters"
                    ? "Your Supporters"
                    : "Your Requesters"}
              </DialogTitle>

              <DialogDescription>
                {relationshipType ===
                "heroes"
                  ? "People you have chosen as Heroes."
                  : relationshipType ===
                      "supporters"
                    ? "People who have sent Support to your posts."
                    : "People who have chosen you as their Hero."}

                {!relationshipLoading &&
                  relationshipUsers.length >
                    0 && (
                    <span className="mt-0.5 block text-xs font-medium text-foreground">
                      {
                        relationshipUsers.length
                      }{" "}
                      total
                    </span>
                  )}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
              {relationshipLoading ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Loading...
                  </p>
                </div>
              ) : relationshipUsers.length ===
                0 ? (
                <div className="py-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-2 text-sm text-muted-foreground">
                    No{" "}
                    {relationshipType ||
                      "relationships"}{" "}
                    yet.
                  </p>
                </div>
              ) : (
                relationshipUsers.map(
                  (item, index) => {
                    const userId =
                      item.user_id ??
                      item.id ??
                      item.hero_id ??
                      item.requester_id ??
                      item.supporter_id ??
                      "";

                    const name =
                      item.full_name ??
                      item.name ??
                      item.user_name ??
                      "Givethra User";

                    const initials2 =
                      getInitials(name);

                    const supportCount =
                      item.support_count ??
                      item.supports ??
                      null;

                    function openUserProfile() {
                      setRelationshipType(
                        null,
                      );

                      if (userId) {
                        navigate({
                          to: "/profile/$id",
                          params: {
                            id: String(
                              userId,
                            ),
                          },
                        });
                      }
                    }

                    return (
                      <div
                        key={String(
                          userId ||
                            index,
                        )}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-border p-3"
                      >
                        <button
                          type="button"
                          aria-label={`Open ${name}'s profile`}
                          onClick={
                            openUserProfile
                          }
                          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-semibold text-white"
                        >
                          {item.avatar_url ? (
