// src/frontend/src/pages/ProfilePage.tsx
// Givethra — Complete Public + Own Profile Page
// Merged version:
// - Own/Public profile support
// - Hero / Requester stats
// - Hero badges
// - Supports -> Credits
// - Trust level
// - KYC / verification badges
// - Heroes / Requesters lists
// - My Hero / Unhero
// - Case history
// - Helped cases
// - Community posts
// - Multi-currency amount display
// - Mobile responsive layout
// - Profile refresh on focus
// - Account menu + logout

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
  HandCoins,
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
} from "lucide-react";

import { useCallback, useEffect, useMemo, useState } from "react";
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

// ============================================================================
// CONFIG
// ============================================================================

const SUPPORTS_PER_CREDIT = 100;
const CREDITS_PER_REWARD = 5;

// ============================================================================
// TYPES
// ============================================================================

type RelationshipType = "heroes" | "requesters" | null;

type BadgeInfo = {
  title: string;
  emoji: string;
  description: string;
  color: string;
  icon: JSX.Element;
};

type CaseStats = {
  submitted: number;
  completed: number;
  approved: number;
  rejected: number;
  expired: number;
};

type AmountMap = Record<string, number>;

// ============================================================================
// HELPERS
// ============================================================================

function normalizeStatus(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isApprovedResolution(resolution: any): boolean {
  if (!resolution) return false;

  const status = normalizeStatus(resolution?.status);

  if (
    [
      "completed",
      "approved",
      "verified",
      "confirmed",
      "seeker_confirmed",
      "admin_confirmed",
    ].includes(status)
  ) {
    return true;
  }

  if (
    [1, true, "1", "true", "yes"].includes(
      resolution?.admin_confirmed
    )
  ) {
    return true;
  }

  if (
    resolution?.admin_approved_at ||
    resolution?.approved_at ||
    resolution?.verified_at ||
    resolution?.completed_at ||
    resolution?.admin_confirmed_at
  ) {
    return true;
  }

  return false;
}

function getCurrencySymbol(currency?: string): string {
  const code = String(currency || "USD").toUpperCase();

  const symbols: Record<string, string> = {
    PKR: "Rs",
    USD: "$",
    AED: "د.إ",
    SAR: "﷼",
    GBP: "£",
    EUR: "€",
    INR: "₹",
    BDT: "৳",
    CNY: "¥",
    CAD: "C$",
    AUD: "A$",
    NZD: "NZ$",
    JPY: "¥",
    TRY: "₺",
    MYR: "RM",
    IDR: "Rp",
    QAR: "﷼",
    KWD: "د.ك",
    OMR: "﷼",
    BHD: ".د.ب",
  };

  return symbols[code] || code;
}

function formatMoney(
  amount: number,
  currency?: string
): string {
  const value = Number(amount || 0);
  if (!Number.isFinite(value) || value <= 0) return "—";

  const code = String(currency || "USD").toUpperCase();
  const symbol = getCurrencySymbol(code);

  return `${symbol} ${value.toLocaleString(undefined, {
    minimumFractionDigits: code === "USD" || code === "EUR" || code === "GBP" ? 2 : 0,
    maximumFractionDigits: code === "USD" || code === "EUR" || code === "GBP" ? 2 : 0,
  })}`;
}

function addAmount(
  target: AmountMap,
  currency: string,
  amount: number
) {
  const code = String(currency || "USD").toUpperCase();
  const value = Number(amount || 0);

  if (!Number.isFinite(value) || value <= 0) return;

  target[code] = (target[code] || 0) + value;
}

function formatAmountMap(amounts: AmountMap): string {
  const entries = Object.entries(amounts);

  if (!entries.length) return "—";

  return entries
    .map(([currency, amount]) =>
      formatMoney(amount, currency)
    )
    .join(" · ");
}

function getResolutionAmount(resolution: any): number {
  return Number(
    resolution?.seeker_confirmed_amount ??
      resolution?.amount_paid ??
      resolution?.amount ??
      0
  );
}

function getResolutionCurrency(resolution: any): string {
  return String(
    resolution?.currency ||
      resolution?.case_currency ||
      "USD"
  ).toUpperCase();
}

function getBadge(
  unlockCount: number,
  contributionCount: number,
  directHelpCount: number
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
        "You have unlocked cases, contributed, and provided direct help. You are an ultimate Hero!",
      icon: (
        <Trophy className="h-4 w-4 text-yellow-500" />
      ),
      color:
        "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
    };
  }

  if (directHelpCount > 0) {
    return {
      title: "Hero",
      emoji: "🦸",
      description:
        "You have directly helped someone with their verified need.",
      icon: (
        <Award className="h-4 w-4 text-blue-500" />
      ),
      color:
        "bg-gradient-to-r from-blue-400 to-indigo-500 text-white",
    };
  }

  if (contributionCount > 0) {
    return {
      title: "Young Hero",
      emoji: "⭐",
      description:
        "You have contributed to a fundraising pool. Every contribution counts!",
      icon: (
        <Sparkles className="h-4 w-4 text-green-500" />
      ),
      color:
        "bg-gradient-to-r from-green-400 to-emerald-500 text-white",
    };
  }

  if (unlockCount > 0) {
    return {
      title: "Newborn Hero",
      emoji: "🆕",
      description:
        "You have unlocked a case. Take the next step and complete the help!",
      icon: (
        <Sparkles className="h-4 w-4 text-purple-500" />
      ),
      color:
        "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    };
  }

  return null;
}

function calculateTrustLevel(
  rejected: number,
  completed: number,
  expired: number
): number {
  let trust = 100;

  trust -= rejected * 10;
  trust += completed * 5;
  trust -= expired * 5;

  return Math.max(0, Math.min(100, trust));
}

function getCaseStatusStyle(status: string) {
  const value = normalizeStatus(status);

  if (value === "completed") {
    return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800";
  }

  if (
    value === "active" ||
    value === "approved" ||
    value === "live"
  ) {
    return "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800";
  }

  if (value === "rejected") {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800";
  }

  if (value === "expired") {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
  }

  if (value === "pending") {
    return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800";
  }

  return "bg-muted text-muted-foreground border-border";
}

function getCaseStatusLabel(status: string) {
  const value = normalizeStatus(status);

  if (!value) return "Pending";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const { role } = useRole();

  const navigate = useNavigate();
  const location = useLocation();

  // --------------------------------------------------------------------------
  // PROFILE ID
  // --------------------------------------------------------------------------

  const profileUserId =
    location.pathname.match(/^\/profile\/([^/]+)/)?.[1] ||
    user?.id ||
    "";

  const isOwnProfile = Boolean(
    user?.id &&
      String(profileUserId) === String(user.id)
  );

  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------

  const [profile, setProfile] = useState<any>(null);
  const [kycData, setKycData] = useState<any>(null);
  const [cases, setCases] = useState<any[]>([]);

  const [resolutions, setResolutions] = useState<any[]>([]);
  const [unlocks, setUnlocks] = useState<any[]>([]);

  const [profileLoading, setProfileLoading] = useState(true);

  const [showMenu, setShowMenu] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [badgeInfoOpen, setBadgeInfoOpen] = useState(false);
  const [creditsInfoOpen, setCreditsInfoOpen] = useState(false);

  const [relationshipType, setRelationshipType] =
    useState<RelationshipType>(null);

  const [relationshipUsers, setRelationshipUsers] =
    useState<any[]>([]);

  const [relationshipLoading, setRelationshipLoading] =
    useState(false);

  const [isMyHero, setIsMyHero] = useState(false);
  const [heroUpdating, setHeroUpdating] = useState(false);

  // --------------------------------------------------------------------------
  // COUNTS
  // --------------------------------------------------------------------------

  const [heroesCount, setHeroesCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [supportsCount, setSupportsCount] = useState(0);

  // --------------------------------------------------------------------------
  // CASE STATS
  // --------------------------------------------------------------------------

  const [caseStats, setCaseStats] =
    useState<CaseStats>({
      submitted: 0,
      completed: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
    });

  const [totalHelpReceived, setTotalHelpReceived] =
    useState<AmountMap>({});

  // --------------------------------------------------------------------------
  // HERO STATS
  // --------------------------------------------------------------------------

  const [helpedCount, setHelpedCount] = useState(0);
  const [directHelps, setDirectHelps] = useState(0);
  const [contributions, setContributions] = useState(0);
  const [unlockCount, setUnlockCount] = useState(0);

  const [totalAmountSpent, setTotalAmountSpent] =
    useState<AmountMap>({});

  const [helpedCases, setHelpedCases] =
    useState<any[]>([]);

  // --------------------------------------------------------------------------
  // BADGE
  // --------------------------------------------------------------------------

  const [badge, setBadge] =
    useState<BadgeInfo | null>(null);

  // --------------------------------------------------------------------------
  // LOAD PROFILE
  // --------------------------------------------------------------------------

  const loadData = useCallback(async () => {
    if (!profileUserId) {
      navigate({ to: "/sign-in" });
      return;
    }

    setProfileLoading(true);

    try {
      const [
        kyc,
        caseList,
        prof,
        resolutionResult,
        unlockResult,
      ] = await Promise.all([
        getKycSubmission(profileUserId),
        getCasesByUser(profileUserId),
        getProfile(profileUserId, role),
        getCaseResolutionsByHero(profileUserId),
        getCaseUnlocksByHero(profileUserId),
      ]);

      // ------------------------------------------------------------
      // PROFILE
      // ------------------------------------------------------------

      setKycData(kyc);
      setProfile(prof);

      setHeroesCount(
        Number(
          prof?.heroes_count ??
            prof?.followers_count ??
            0
        )
      );

      setFollowingCount(
        Number(prof?.following_count || 0)
      );

      setSupportsCount(
        Number(prof?.supports_count || 0)
      );

      setIsMyHero(Boolean(prof?.is_following));

      // ------------------------------------------------------------
      // CASES
      // ------------------------------------------------------------

      const list = Array.isArray(caseList)
        ? caseList
        : [];

      setCases(list);

      const submitted = list.length;

      const completed = list.filter(
        (c: any) =>
          normalizeStatus(c.status) === "completed"
      ).length;

      const approved = list.filter(
        (c: any) =>
          ["approved", "active", "live"].includes(
            normalizeStatus(c.status)
          )
      ).length;

      const rejected = list.filter(
        (c: any) =>
          normalizeStatus(c.status) === "rejected"
      ).length;

      const expired = list.filter(
        (c: any) =>
          normalizeStatus(c.status) === "expired"
      ).length;

      setCaseStats({
        submitted,
        completed,
        approved,
        rejected,
        expired,
      });

      // ------------------------------------------------------------
      // TOTAL HELP RECEIVED
      // ------------------------------------------------------------

      const received: AmountMap = {};

      list
        .filter(
          (c: any) =>
            normalizeStatus(c.status) === "completed"
        )
        .forEach((c: any) => {
          const amount = Number(
            c.amount_collected ??
              c.amount_needed ??
              0
          );

          const currency = String(
            c.currency || "USD"
          ).toUpperCase();

          addAmount(
            received,
            currency,
            amount
          );
        });

      setTotalHelpReceived(received);

      // ------------------------------------------------------------
      // RESOLUTIONS
      // ------------------------------------------------------------

      const resolutionList = Array.isArray(
        resolutionResult
      )
        ? resolutionResult
        : [];

      setResolutions(resolutionList);

      const validResolutions =
        resolutionList.filter(
          (resolution: any) =>
            isApprovedResolution(resolution)
        );

      setHelpedCount(validResolutions.length);

      setHelpedCases(
        validResolutions.slice(0, 5)
      );

      // ------------------------------------------------------------
      // DIRECT HELP VS CONTRIBUTION
      // ------------------------------------------------------------

      const direct = validResolutions.filter(
        (resolution: any) =>
          String(
            resolution?.paid_to || ""
          ).toLowerCase() !== "givethra"
      );

      const contribution =
        validResolutions.filter(
          (resolution: any) =>
            String(
              resolution?.paid_to || ""
            ).toLowerCase() === "givethra"
        );

      setDirectHelps(direct.length);
      setContributions(contribution.length);

      // ------------------------------------------------------------
      // TOTAL SPENT
      // ------------------------------------------------------------

      const spent: AmountMap = {};

      validResolutions.forEach(
        (resolution: any) => {
          addAmount(
            spent,
            getResolutionCurrency(
              resolution
            ),
            getResolutionAmount(
              resolution
            )
          );
        }
      );

      setTotalAmountSpent(spent);

      // ------------------------------------------------------------
      // UNLOCKS
      // ------------------------------------------------------------

      const unlockList = Array.isArray(
        unlockResult
      )
        ? unlockResult
        : [];

      setUnlocks(unlockList);
      setUnlockCount(unlockList.length);

      // ------------------------------------------------------------
      // BADGE
      // ------------------------------------------------------------

      setBadge(
        getBadge(
          unlockList.length,
          contribution.length,
          direct.length
        )
      );
    } catch (error) {
      console.error(
        "Failed to load profile data:",
        error
      );

      toast.error(
        "Unable to load profile information."
      );
    } finally {
      setProfileLoading(false);
    }
  }, [
    profileUserId,
    role,
    navigate,
  ]);

  // --------------------------------------------------------------------------
  // INITIAL LOAD + FOCUS REFRESH
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!profileUserId) {
      navigate({ to: "/sign-in" });
      return;
    }

    setProfile(null);
    setKycData(null);

    loadData();

    const handleFocus = () => {
      loadData();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [
    profileUserId,
    location.pathname,
    isAuthenticated,
    loadData,
    navigate,
  ]);

  // ==========================================================================
  // HERO FOLLOW
  // ==========================================================================

  async function toggleHero() {
    if (!isAuthenticated || !user?.id) {
      navigate({ to: "/sign-in" });
      return;
    }

    if (
      isOwnProfile ||
      heroUpdating
    ) {
      return;
    }

    setHeroUpdating(true);

    try {
      if (isMyHero) {
        await unfollowUser(
          profileUserId
        );

        setIsMyHero(false);

        setHeroesCount(
          (count) =>
            Math.max(0, count - 1)
        );

        toast.success(
          "Removed from My Heroes"
        );
      } else {
        await followUser(
          profileUserId
        );

        setIsMyHero(true);

        setHeroesCount(
          (count) => count + 1
        );

        toast.success(
          "Added to My Heroes"
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update Hero status"
      );
    } finally {
      setHeroUpdating(false);
    }
  }

  // ==========================================================================
  // RELATIONSHIP LIST
  // ==========================================================================

  async function openRelationshipList(
    type: "heroes" | "requesters"
  ) {
    setRelationshipType(type);
    setRelationshipLoading(true);

    try {
      const result =
        await getFollowList(
          profileUserId,
          type
        );

      setRelationshipUsers(
        Array.isArray(result)
          ? result
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load relationship list:",
        error
      );

      setRelationshipUsers([]);
    } finally {
      setRelationshipLoading(false);
    }
  }

  async function removeRelationship(
    targetId: string
  ) {
    if (!isOwnProfile) return;

    try {
      if (
        relationshipType === "heroes"
      ) {
        await unfollowUser(
          targetId
        );

        setFollowingCount(
          (count) =>
            Math.max(0, count - 1)
        );
      }

      if (
        relationshipType === "requesters"
      ) {
        await removeRequester(
          targetId
        );

        setHeroesCount(
          (count) =>
            Math.max(0, count - 1)
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
                  ""
              ) !==
              String(targetId)
          )
      );

      toast.success(
        relationshipType === "heroes"
          ? "Hero removed"
          : "Requester removed"
      );
    } catch (error) {
      console.error(
        "Failed to remove relationship:",
        error
      );

      toast.error(
        "Could not update relationship."
      );
    }
  }

  // ==========================================================================
  // DERIVED DATA
  // ==========================================================================

  const kycApproved =
    normalizeStatus(
      kycData?.status
    ) === "approved";

  const displayName =
    profile?.full_name ||
    user?.fullName ||
    "Givethra User";

  const avatarUrl =
    profile?.avatar_url || null;

  const coverUrl =
    profile?.cover_url || null;

  const initials = useMemo(() => {
    return (
      displayName
        .split(" ")
        .filter(Boolean)
        .map(
          (name: string) =>
            name[0]
        )
        .join("")
        .toUpperCase()
        .slice(0, 2) || "G"
    );
  }, [displayName]);

  // --------------------------------------------------------------------------
  // IMPORTANT:
  // Use the profile's own role when available.
  // This prevents a Hero's public profile from incorrectly showing
  // Requester stats just because the visitor is a requester.
  // --------------------------------------------------------------------------

  const profileRole = String(
    profile?.role ||
      profile?.user_role ||
      profile?.account_role ||
      role ||
      ""
  ).toLowerCase();

  const isHeroProfile =
    profileRole === "hero" ||
    profile?.is_hero === true;

  const isRequesterProfile =
    profileRole === "requester" ||
    profileRole === "seeker" ||
    profile?.is_requester === true;

  const showHeroStats =
    isHeroProfile ||
    (!isRequesterProfile &&
      role === "hero");

  // --------------------------------------------------------------------------
  // CREDITS
  // --------------------------------------------------------------------------

  const creditCount = Math.floor(
    supportsCount /
      SUPPORTS_PER_CREDIT
  );

  const supportsIntoCurrentCredit =
    supportsCount %
    SUPPORTS_PER_CREDIT;

  const creditProgressPct = Math.min(
    100,
    Math.round(
      (supportsIntoCurrentCredit /
        SUPPORTS_PER_CREDIT) *
        100
    )
  );

  const rewardsUnlocked =
    Math.floor(
      creditCount /
        CREDITS_PER_REWARD
    );

  const creditsIntoCurrentReward =
    creditCount %
    CREDITS_PER_REWARD;

  const supportsToNextCredit =
    supportsIntoCurrentCredit === 0 &&
    supportsCount > 0
      ? SUPPORTS_PER_CREDIT
      : SUPPORTS_PER_CREDIT -
        supportsIntoCurrentCredit;

  // --------------------------------------------------------------------------
  // TRUST
  // --------------------------------------------------------------------------

  const trustLevel =
    calculateTrustLevel(
      caseStats.rejected,
      caseStats.completed,
      caseStats.expired
    );

  // --------------------------------------------------------------------------
  // VERIFICATION
  // --------------------------------------------------------------------------

  const verificationBadges = [
    {
      label: "Email Verified",
      icon: (
        <Mail className="h-3 w-3" />
      ),
      active: isOwnProfile
        ? Boolean(user?.email)
        : Boolean(
            profile?.email_verified
          ),
    },
    {
      label: "Mobile Verified",
      icon: (
        <Phone className="h-3 w-3" />
      ),
      active: Boolean(
        profile?.phone_verified ||
          profile?.phone_number
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
        profile?.institution_verified
      ),
    },
  ];

  // ==========================================================================
  // ACCOUNT MENU
  // ==========================================================================

  const menuItems = [
    {
      icon: (
        <Pencil className="h-5 w-5" />
      ),
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
      icon: (
        <Bell className="h-5 w-5" />
      ),
      label: "Notifications",
      to: "/notifications",
    },
    {
      icon: (
        <Wallet className="h-5 w-5" />
      ),
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
      icon: (
        <KeyRound className="h-5 w-5" />
      ),
      label: "Google Account Security",
      to: "/security",
    },
    {
      icon: (
        <Lock className="h-5 w-5" />
      ),
      label: "Privacy",
      to: "/account-privacy",
    },
    {
      icon: (
        <Settings className="h-5 w-5" />
      ),
      label: "Settings",
      to: "/settings",
    },
  ];

  // ==========================================================================
  // LOADING
  // ==========================================================================

  const profileReady =
    !profileLoading &&
    profile &&
    String(
      profile.user_id ??
        profile.id ??
        ""
    ) ===
      String(profileUserId);

  if (!profileReady) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 pt-8 pb-24">
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted animate-pulse" />

            <div className="mx-auto h-5 w-40 rounded bg-muted animate-pulse" />

            <div className="mx-auto mt-3 h-3 w-28 rounded bg-muted animate-pulse" />

            <p className="mt-5 text-sm text-muted-foreground">
              Loading profile...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // ==========================================================================
  // UI
  // ==========================================================================

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 pt-0 pb-24 space-y-4">

        {/* ================================================================== */}
        {/* PROFILE HEADER */}
        {/* ================================================================== */}

        <div className="rounded-b-3xl bg-card border border-border shadow-sm overflow-hidden">

          {/* COVER */}
          <div className="h-32 relative bg-gradient-to-br from-primary via-primary/80 to-primary/40">

            {coverUrl ? (
              <img
                src={coverUrl}
                alt="Profile cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-2 right-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute bottom-0 left-8 h-16 w-16 rounded-full bg-white/10 blur-xl" />
              </div>
            )}

            {isOwnProfile && (
              <button
                type="button"
                aria-label="Open profile menu"
                onClick={() =>
                  setShowMenu(true)
                }
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/25 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
              >
                <MoreHorizontal className="h-5 w-5 text-white" />
              </button>
            )}
          </div>

          {/* PROFILE CONTENT */}
          <div className="px-5 pb-5">

            {/* AVATAR + HERO BUTTON */}
            <div className="flex items-end justify-between -mt-12 mb-3">

              <div className="relative shrink-0">

                <div className="h-24 w-24 rounded-3xl border-4 border-card ring-1 ring-border flex items-center justify-center shadow-xl overflow-hidden bg-primary">

                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-2xl">
                      {initials}
                    </span>
                  )}

                </div>

                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/edit-profile",
                      })
                    }
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

                  {heroUpdating
                    ? "Updating..."
                    : isMyHero
                    ? "My Hero"
                    : "Hero"}
                </Button>
              )}
            </div>

            {/* NAME + BADGE + EDIT */}
            <div className="flex items-start justify-between gap-2">

              <div className="flex items-center gap-2 flex-wrap min-w-0">

                <h1 className="text-xl font-bold text-foreground break-words">
                  {displayName}
                </h1>

                {badge && (
                  <div className="flex items-center gap-1 shrink-0">

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}
                    >
                      {badge.icon}
                      {badge.title}
                    </span>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() =>
                              setBadgeInfoOpen(
                                true
                              )
                            }
                            className="text-muted-foreground hover:text-primary transition-colors"
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

              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/edit-profile",
                    })
                  }
                  title="Edit Profile"
                  aria-label="Edit Profile"
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-primary/15 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              )}
            </div>

            {/* LOCATION */}
            {(profile?.city ||
              profile?.country) && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 shrink-0" />

                {[
                  profile?.city,
                  profile?.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}

            {/* MEMBER + KYC */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground mt-1">

              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />

                Member since{" "}
                {profile?.member_since ||
                  profile?.created_at
                    ? new Date(
                        profile?.member_since ||
                          profile?.created_at
                      ).getFullYear()
                    : 2026}
              </span>

              {kycApproved && (
                <span className="flex items-center gap-1 text-teal-600 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  KYC Verified
                </span>
              )}
            </div>

            {/* BIO */}
            {profile?.bio && (
              <p className="text-sm text-muted-foreground italic pt-2">
                {profile.bio}
              </p>
            )}

            {/* ================================================================ */}
            {/* RELATIONSHIP COUNTS */}
            {/* ================================================================ */}

            <div className="grid grid-cols-3 gap-2 mt-4 rounded-2xl border border-border/70 bg-background/70 px-2 py-3 shadow-sm">

              {/* REQUESTERS */}
              <button
                type="button"
                onClick={() =>
                  openRelationshipList(
                    "requesters"
                  )
                }
                className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity"
              >
                <Users className="h-3.5 w-3.5 text-primary" />

                <span className="text-lg font-bold text-primary leading-tight">
                  {heroesCount.toLocaleString()}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  Requesters
                </span>
              </button>

              {/* HEROES */}
              <button
                type="button"
                onClick={() =>
                  openRelationshipList(
                    "heroes"
                  )
                }
                className="flex flex-col items-center gap-0.5 hover:opacity-70 transition-opacity border-x border-border/60"
              >
                <HeartHandshake className="h-3.5 w-3.5 text-foreground" />

                <span className="text-lg font-bold text-foreground leading-tight">
                  {followingCount.toLocaleString()}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  Heroes
                </span>
              </button>

              {/* SUPPORTS */}
              <div className="flex flex-col items-center gap-0.5">
                <Gift className="h-3.5 w-3.5 text-amber-600" />

                <span className="text-lg font-bold text-amber-600 leading-tight">
                  {supportsCount.toLocaleString()}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  Supports
                </span>
              </div>

            </div>

            {/* ================================================================ */}
            {/* VERIFICATION BADGES */}
            {/* ================================================================ */}

            <div className="mt-3 flex flex-wrap gap-2">

              {verificationBadges.map(
                (item) => (
                  <span
                    key={item.label}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.active
                        ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-800"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {item.active ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}

                    {item.label}
                  </span>
                )
              )}

            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* TRUST LEVEL */}
        {/* ================================================================== */}

        <div className="rounded-2xl bg-card border border-border p-4 space-y-2">

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Trust Level
            </span>

            <span className="text-sm font-bold text-primary">
              {trustLevel}%
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
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

          <div className="flex justify-between gap-2 text-[10px] text-muted-foreground">
            <span>
              Based on case history
            </span>

            <span className="text-right">
              +{caseStats.completed * 5} approvals
              {" · "}
              -{caseStats.rejected * 10} rejections
              {" · "}
              -{caseStats.expired * 5} expired
            </span>
          </div>
        </div>

        {/* ================================================================== */}
        {/* CREDITS */}
        {/* ================================================================== */}

        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">

          <div className="flex items-center justify-between">

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
                onClick={() =>
                  setCreditsInfoOpen(
                    true
                  )
                }
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="How credits work"
              >
                <Info className="h-3.5 w-3.5" />
              </button>

            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all"
              style={{
                width: `${creditProgressPct}%`,
              }}
            />
          </div>

          <p className="text-[11px] text-muted-foreground">
            {supportsToNextCredit} more Supports to your next Credit
            {" · "}
            {creditsIntoCurrentReward}/
            {CREDITS_PER_REWARD} Credits toward your next reward

            {rewardsUnlocked > 0 &&
              ` · ${rewardsUnlocked} reward${
                rewardsUnlocked > 1
                  ? "s"
                  : ""
              } unlocked`}
          </p>
        </div>

        {/* ================================================================== */}
        {/* STATS */}
        {/* ================================================================== */}

        {showHeroStats ? (
          <div className="grid grid-cols-2 gap-3">

            {/* TOTAL SPENT */}
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-lg sm:text-2xl font-bold text-foreground break-words">
                {formatAmountMap(
                  totalAmountSpent
                )}
              </div>

              <div className="text-[10px] text-muted-foreground leading-tight mt-1 flex items-center gap-1">
                <HandCoins className="h-3 w-3" />
                Total Spent
              </div>
            </div>

            {/* HELPED */}
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">
                {helpedCount}
              </div>

              <div className="text-[10px] text-muted-foreground leading-tight mt-1 flex items-center gap-1">
                <HeartHandshake className="h-3 w-3" />
                Helped
              </div>
            </div>

            {/* DIRECT */}
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">
                {directHelps}
              </div>

              <div className="text-[10px] text-muted-foreground leading-tight mt-1 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                Direct Helps
              </div>
            </div>

            {/* CONTRIBUTIONS */}
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">
                {contributions}
              </div>

              <div className="text-[10px] text-muted-foreground leading-tight mt-1 flex items-center gap-1">
                <HandCoins className="h-3 w-3" />
                Contributions
              </div>
            </div>

            {/* UNLOCKS */}
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm col-span-2">
              <div className="text-2xl font-bold text-foreground">
                {unlockCount}
              </div>

              <div className="text-[10px] text-muted-foreground leading-tight mt-1 flex items-center gap-1">
                <Unlock className="h-3 w-3" />
                Total Unlocks
              </div>
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">

            {/* SUBMITTED */}
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">
                {caseStats.submitted}
              </div>

              <div className="text-[10px] text-muted-foreground leading-tight mt-1 flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                Submitted
              </div>
            </div>

            {/* COMPLETED */}
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">
                {caseStats.completed}
              </div>

              <div className="text-[10px] text-muted-foreground leading-tight mt-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-blue-600" />
                Completed
              </div>
            </div>

            {/* REJECTED */}
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">
                {caseStats.rejected}
              </div>

              <div className="text-[10px] text-muted-foreground leading-tight mt-1 flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-600" />
                Rejected
              </div>
            </div>

            {/* EXPIRED */}
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
              <div className="text-2xl font-bold text-foreground">
                {caseStats.expired}
              </div>

              <div className="text-[10px] text-muted-foreground leading-tight mt-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-amber-600" />
                Expired
              </div>
            </div>

            {/* HELP RECEIVED */}
            <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm col-span-2">
              <div className="text-lg sm:text-2xl font-bold text-green-600">
                {formatAmountMap(
                  totalHelpReceived
                )}
              </div>

              <div className="text-[10px] text-muted-foreground leading-tight mt-1 flex items-center gap-1">
                <HeartHandshake className="h-3 w-3" />
                Total Help Received
              </div>
            </div>

          </div>
        )}

        {/* ================================================================== */}
        {/* CASES */}
        {/* ================================================================== */}

        {cases.length > 0 && (
          <div className="rounded-2xl bg-card border border-border p-4 space-y-3">

            <div className="flex items-center justify-between">

              <h2 className="font-semibold flex items-center gap-1.5">
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
                  className="text-xs text-primary font-medium flex items-center hover:underline"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="space-y-2">

              {cases
                .slice(0, 5)
                .map((item: any) => (
                  <div
                    key={String(
                      item.id
                    )}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium truncate">
                        {item.title ||
                          `Case #${item.id}`}
                      </p>

                      {(item.city ||
                        item.country) && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                          {[
                            item.city,
                            item.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCaseStatusStyle(
                        item.status
                      )}`}
                    >
                      {getCaseStatusLabel(
                        item.status
                      )}
                    </span>
                  </div>
                ))}

            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* HELPED CASES */}
        {/* ================================================================== */}

        {showHeroStats &&
          helpedCases.length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-4 space-y-3">

              <h2 className="font-semibold flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-primary" />
                Cases You Helped
              </h2>

              <div className="space-y-2">

                {helpedCases.map(
                  (resolution: any) => {
                    const amount =
                      getResolutionAmount(
                        resolution
                      );

                    const currency =
                      getResolutionCurrency(
                        resolution
                      );

                    return (
                      <div
                        key={String(
                          resolution.id ??
                            resolution.case_id
                        )}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                      >

                        <div className="min-w-0 flex-1">

                          <p className="text-sm font-medium truncate">
                            {resolution.case_title ||
                              `Case #${
                                resolution.case_id ??
                                resolution.id
                              }`}
                          </p>

                          {resolution.case_category && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {resolution.case_category}
                            </p>
                          )}

                        </div>

                        {amount > 0 && (
                          <span className="shrink-0 text-xs font-semibold text-green-600">
                            {formatMoney(
                              amount,
                              currency
                            )}
                          </span>
                        )}

                      </div>
                    );
                  }
                )}

              </div>
            </div>
          )}

        {/* ================================================================== */}
        {/* COMMUNITY POSTS */}
        {/* ================================================================== */}

        {Array.isArray(
          profile?.posts
        ) &&
          profile.posts.length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-4 space-y-3">

              <div className="flex items-center justify-between">

                <h2 className="font-semibold flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  Community Posts
                </h2>

                <span className="text-xs text-muted-foreground">
                  {profile.posts.length} posts
                </span>

              </div>

              {profile.posts.map(
                (post: any) => (
                  <article
                    key={String(
                      post.id
                    )}
                    className="rounded-xl border border-border p-3"
                  >

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">

                      {post.is_pinned && (
                        <Pin className="h-3 w-3 text-primary" />
                      )}

                      <span>
                        {post.is_pinned
                          ? "Pinned"
                          : "Community post"}
                      </span>

                    </div>

                    <p className="mt-2 text-sm whitespace-pre-wrap break-words">
                      {post.message}
                    </p>

                  </article>
                )
              )}

            </div>
          )}

        {/* ================================================================== */}
        {/* LOGOUT */}
        {/* ================================================================== */}

        {isOwnProfile && (
          <button
            type="button"
            onClick={() =>
              setShowLogout(true)
            }
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20 font-medium text-sm transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        )}

        <p className="text-center text-xs text-muted-foreground pb-2">
          Givethra v2.0 · Built with ❤️
        </p>
      </div>

      {/* ==================================================================== */}
      {/* ACCOUNT MENU */}
      {/* ==================================================================== */}

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
              Manage your profile and account settings.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-border overflow-hidden">

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
                  className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors ${
                    index <
                    menuItems.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  <span className="text-primary">
                    {item.icon}
                  </span>

                  <span className="flex-1 text-left">
                    {item.label}
                  </span>

                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              )
            )}

          </div>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* LOGOUT DIALOG */}
      {/* ==================================================================== */}

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
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>

          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* BADGE INFO */}
      {/* ==================================================================== */}

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
              Your Hero badge grows as you help the Givethra community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
              <div className="text-xl">
                🆕
              </div>

              <div>
                <p className="font-semibold text-sm">
                  Newborn Hero
                </p>

                <p className="text-xs text-muted-foreground">
                  You unlocked a case but have not completed a verified help yet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
              <div className="text-xl">
                ⭐
              </div>

              <div>
                <p className="font-semibold text-sm">
                  Young Hero
                </p>

                <p className="text-xs text-muted-foreground">
                  You contributed to a fundraising pool.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
              <div className="text-xl">
                🦸
              </div>

              <div>
                <p className="font-semibold text-sm">
                  Hero
                </p>

                <p className="text-xs text-muted-foreground">
                  You directly paid for someone's verified need.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
              <div className="text-xl">
                🌟
              </div>

              <div>
                <p className="font-semibold text-sm">
                  Super Hero
                </p>

                <p className="text-xs text-muted-foreground">
                  You have unlocked, contributed and provided direct help.
                </p>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button
              onClick={() =>
                setBadgeInfoOpen(
                  false
                )
              }
            >
              Got it
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* CREDITS INFO */}
      {/* ==================================================================== */}

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
              Community Supports can unlock platform rewards.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm text-muted-foreground">

            <p>
              Every{" "}
              <span className="font-semibold text-foreground">
                {SUPPORTS_PER_CREDIT} Supports
              </span>{" "}
              received by your posts or cases gives you{" "}
              <span className="font-semibold text-foreground">
                1 Credit
              </span>.
            </p>

            <p>
              Collect{" "}
              <span className="font-semibold text-foreground">
                {CREDITS_PER_REWARD} Credits
              </span>{" "}
              to unlock a reward such as submitting another case, unlocking a case, or clearing an eligible suspension.
            </p>

            <p className="text-xs">
              Credits shown here are calculated from the Supports reported by your account.
            </p>

          </div>

          <DialogFooter>
            <Button
              onClick={() =>
                setCreditsInfoOpen(
                  false
                )
              }
            >
              Got it
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* ==================================================================== */}
      {/* HERO / REQUESTER LIST */}
      {/* ==================================================================== */}

      <Dialog
        open={relationshipType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRelationshipType(
              null
            );
            setRelationshipUsers(
              []
            );
          }
        }}
      >
        <DialogContent className="max-w-md">

          <DialogHeader>

            <DialogTitle>
              {relationshipType ===
              "heroes"
                ? "Your Heroes"
                : "Your Requesters"}
            </DialogTitle>

            <DialogDescription>
              {relationshipType ===
              "heroes"
                ? "People you have chosen as Heroes."
                : "People who have chosen you as their Hero."}

              {!relationshipLoading &&
                relationshipUsers.length >
                  0 && (
                  <span className="block mt-1 text-xs font-medium text-foreground">
                    {
                      relationshipUsers.length
                    } total
                  </span>
                )}
            </DialogDescription>

          </DialogHeader>

          <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1">

            {relationshipLoading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />

                <p className="text-sm text-muted-foreground mt-3">
                  Loading...
                </p>
              </div>
            ) : relationshipUsers.length ===
              0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No{" "}
                {relationshipType} yet.
              </p>
            ) : (
              relationshipUsers.map(
                (
                  item: any,
                  index: number
                ) => {
                  const userId =
                    item.user_id ??
                    item.id ??
                    item.hero_id ??
                    item.requester_id ??
                    "";

                  const name =
                    item.full_name ??
                    item.name ??
                    item.user_name ??
                    "Givethra User";

                  const initials2 =
                    name
                      .split(" ")
                      .filter(Boolean)
                      .map(
                        (part: string) =>
                          part[0]
                      )
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                  function openProfile() {
                    setRelationshipType(
                      null
                    );

                    if (userId) {
                      navigate({
                        to: "/profile/$id",
                        params: {
                          id: String(
                            userId
                          ),
                        },
                      });
                    }
                  }

                  return (
                    <div
                      key={`${String(
                        userId
                      )}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-border p-3"
                    >

                      <button
                        type="button"
                        onClick={
                          openProfile
                        }
                        className="h-10 w-10 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center font-semibold shrink-0"
                      >
                        {item.avatar_url ? (
                          <img
                            src={
                              item.avatar_url
                            }
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initials2 ||
                          "G"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={
                          openProfile
                        }
                        className="flex-1 text-left min-w-0"
                      >
                        <span className="font-medium truncate block">
                          {name}

                          {item.is_verified && (
                            <span className="ml-1 text-teal-600">
                              ✓
                            </span>
                          )}
                        </span>

                        {item.city ||
                        item.country ? (
                          <span className="text-[10px] text-muted-foreground truncate block mt-0.5">
                            {[
                              item.city,
                              item.country,
                            ]
                              .filter(
                                Boolean
                              )
                              .join(
                                ", "
                              )}
                          </span>
                        ) : null}
                      </button>

                      {isOwnProfile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            removeRelationship(
                              String(
                                userId
                              )
                            )
                          }
                        >
                          {relationshipType ===
                          "heroes"
                            ? "Unhero"
                            : "Remove"}
                        </Button>
                      )}

                    </div>
                  );
                }
              )
            )}

          </div>
        </DialogContent>
      </Dialog>

    </Layout>
  );
}
