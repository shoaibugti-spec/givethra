import type {
  Achievement,
  HelpSeekerStatsPublic,
  HeroStatsPublic,
  UserPublic,
} from "@/backend";
import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useBackendActor } from "@/hooks/useBackend";
import { useNavigate } from "@tanstack/react-router";
import {
  Award,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  FileText,
  HandHeart,
  Heart,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Settings,
  Shield,
  ShieldCheck,
  Star,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

const ACHIEVEMENT_LABELS: Record<Achievement, { label: string; icon: string }> =
  {
    FirstSupport: { label: "First Support", icon: "🏅" },
    TenPeopleHelped: { label: "10 People Helped", icon: "🌟" },
    FiftyPeopleHelped: { label: "50 People Helped", icon: "🌠" },
    EducationHero: { label: "Education Hero", icon: "📚" },
    MedicalHero: { label: "Medical Hero", icon: "🏥" },
    CommunityHero: { label: "Community Hero", icon: "🤝" },
    TrustedHero: { label: "Trusted Hero", icon: "🛡️" },
  };

export default function ProfilePage() {
  const { isAuthenticated, isHero, isHelpSeeker, logout } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [heroStats, setHeroStats] = useState<HeroStatsPublic | null>(null);
  const [seekerStats, setSeekerStats] = useState<HelpSeekerStatsPublic | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    setLoading(true);
    actor
      .getAllUsers()
      .then((users) => {
        const u = users[0] ?? null;
        setUser(u);
        if (!u) return;
        if (isHero) {
          actor
            .getHeroStats(u.id)
            .then((s) => setHeroStats(s ?? null))
            .catch(() => null);
        }
        if (isHelpSeeker) {
          actor
            .getHelpSeekerStats(u.id)
            .then((s) => setSeekerStats(s ?? null))
            .catch(() => null);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [actor, isFetching, isHero, isHelpSeeker]);

  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }

  if (loading) {
    return (
      <Layout>
        <div
          className="flex justify-center py-20"
          data-ocid="profile.loading_state"
        >
          <LoadingSpinner label="Loading profile..." />
        </div>
      </Layout>
    );
  }

  const memberYear = user?.createdAt
    ? new Date(Number(user.createdAt) / 1_000_000).getFullYear()
    : new Date().getFullYear();

  const verificationBadges = [
    {
      label: "Email Verified",
      icon: <Mail className="h-3 w-3" />,
      active: true,
    },
    {
      label: "Mobile Verified",
      icon: <Phone className="h-3 w-3" />,
      active: true,
    },
    {
      label: "Identity Verified",
      icon: <ShieldCheck className="h-3 w-3" />,
      active: false,
    },
    {
      label: "Institution Verified",
      icon: <Building2 className="h-3 w-3" />,
      active: false,
    },
  ];

  const profileStats = isHero
    ? [
        { label: "Proud ❤️", value: String(heroStats?.proudHeartCount ?? 0) },
        { label: "People Helped", value: String(heroStats?.peopleHelped ?? 0) },
        { label: "Cases Done", value: String(heroStats?.casesCompleted ?? 0) },
      ]
    : [
        {
          label: "Submitted",
          value: String(seekerStats?.requestsSubmitted ?? 0),
        },
        {
          label: "Approved",
          value: String(seekerStats?.requestsApproved ?? 0),
        },
        {
          label: "Completed",
          value: String(seekerStats?.requestsCompleted ?? 0),
        },
      ];

  const menuItems = [
    {
      icon: <FileText className="h-5 w-5" />,
      label: "My Requests",
      to: "/my-requests",
      ocid: "profile.my_requests_link",
    },
    {
      icon: <HandHeart className="h-5 w-5" />,
      label: "My Supports",
      to: "/my-supports",
      ocid: "profile.my_supports_link",
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: "My Cases",
      to: "/my-cases",
      ocid: "profile.my_cases_link",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "Notifications",
      to: "/notifications",
      ocid: "profile.notifications_link",
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      label: "Wallet",
      to: "/wallet",
      ocid: "profile.wallet_link",
    },
    {
      icon: <Lock className="h-5 w-5" />,
      label: "Privacy",
      to: "/privacy",
      ocid: "profile.privacy_link",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      label: "Security",
      to: "/security",
      ocid: "profile.security_link",
    },
    {
      icon: <KeyRound className="h-5 w-5" />,
      label: "Google Account Security",
      to: "/google-account-security",
      ocid: "profile.google_account_security_link",
    },
  ] as { icon: React.ReactNode; label: string; to: string; ocid: string }[];

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 pt-6 pb-24 space-y-5">
        {/* Profile Header Card */}
        <div
          data-ocid="profile.header_section"
          className="rounded-2xl bg-card border border-border overflow-hidden"
        >
          {/* Cover banner */}
          <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />

          <div className="px-5 pb-5">
            {/* Avatar */}
            <div className="-mt-10 mb-3 flex items-end justify-between">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 border-4 border-card flex items-center justify-center shadow-md">
                <Shield className="h-9 w-9 text-primary" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  data-ocid="profile.edit_profile_button"
                  onClick={() => navigate({ to: "/edit-profile" })}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Name & role */}
            <div className="space-y-1">
              <h1 className="font-display text-xl font-bold text-foreground leading-tight">
                {user?.fullName ?? "My Profile"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {user?.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.country}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {memberYear}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isHero ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 text-xs gap-1">
                    <Heart className="h-3 w-3" /> Hero
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    Help Seeker
                  </Badge>
                )}
              </div>
            </div>

            {/* Verification badges */}
            <div
              className="mt-4 flex flex-wrap gap-2"
              data-ocid="profile.verification_badges"
            >
              {verificationBadges.map((badge) => (
                <span
                  key={badge.label}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    badge.active
                      ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {badge.active ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Score + Stats */}
        <div
          className="grid grid-cols-4 gap-3"
          data-ocid="profile.stats_section"
        >
          <div className="col-span-1 rounded-2xl bg-primary text-primary-foreground p-3 flex flex-col items-center justify-center text-center">
            <Star className="h-5 w-5 mb-1 opacity-80" />
            <div className="font-display text-xl font-bold">82</div>
            <div className="text-xs opacity-80 leading-tight">Trust Score</div>
          </div>
          {profileStats.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center justify-center text-center"
            >
              <div className="font-display text-xl font-bold text-foreground">
                {value}
              </div>
              <div className="text-xs text-muted-foreground leading-tight mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Quick action buttons */}
        <div
          className="grid grid-cols-3 gap-3"
          data-ocid="profile.action_buttons"
        >
          <Button
            variant="outline"
            className="flex-col h-auto py-3 gap-1.5 rounded-xl border-border"
            data-ocid="profile.edit_profile_action_button"
            onClick={() => navigate({ to: "/edit-profile" })}
          >
            <Pencil className="h-4 w-4 text-primary" />
            <span className="text-xs">Edit Profile</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto py-3 gap-1.5 rounded-xl border-border"
            data-ocid="profile.security_action_button"
            onClick={() => navigate({ to: "/security" })}
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-xs">Security</span>
          </Button>
          <Button
            variant="outline"
            className="flex-col h-auto py-3 gap-1.5 rounded-xl border-border"
            data-ocid="profile.settings_action_button"
            onClick={() => navigate({ to: "/settings" })}
          >
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>

        {/* Achievements */}
        {isHero && (heroStats?.achievements ?? []).length > 0 && (
          <div
            data-ocid="profile.achievements_section"
            className="rounded-2xl border border-border bg-card p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h2 className="font-display font-semibold text-sm text-foreground">
                Achievements
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {(heroStats?.achievements ?? []).map((a) => {
                const info = ACHIEVEMENT_LABELS[a];
                return (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-sm text-foreground border border-border"
                  >
                    {info?.icon} {info?.label ?? a}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Profile Menu */}
        <div
          data-ocid="profile.menu_section"
          className="rounded-2xl border border-border bg-card overflow-hidden"
        >
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              type="button"
              data-ocid={item.ocid}
              onClick={() => navigate({ to: item.to as "/" })}
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

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 gap-2 rounded-xl"
          data-ocid="profile.logout_button"
          onClick={() => setShowLogoutDialog(true)}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="max-w-sm" data-ocid="profile.logout_dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-destructive" />
              Logout
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to logout? You will need to sign in again to
              access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              data-ocid="profile.logout_cancel_button"
              onClick={() => setShowLogoutDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 sm:flex-none"
              data-ocid="profile.logout_confirm_button"
              onClick={() => {
                logout();
                setShowLogoutDialog(false);
                navigate({ to: "/sign-in" });
              }}
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
