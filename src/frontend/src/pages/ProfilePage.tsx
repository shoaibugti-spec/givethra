// src/frontend/src/pages/ProfilePage.tsx
// Enhanced with detailed stats: Direct Helps, Contributions, Unlocks, Rejected, etc.

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
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
  Star,
  Wallet,
  HandCoins,
  HeartHandshake,
  Unlock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
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
} from "@/lib/api";

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [kycData, setKycData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [caseStats, setCaseStats] = useState({
    submitted: 0,
    completed: 0,
    rejected: 0,
  });
  const [helpedCount, setHelpedCount] = useState(0);
  const [directHelps, setDirectHelps] = useState(0);
  const [contributions, setContributions] = useState(0);
  const [unlockCount, setUnlockCount] = useState(0);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadData();
  }, [isAuthenticated, location.pathname]);

  async function loadData() {
    if (!user) return;
    try {
      const [kyc, cases, prof, resolutions, unlocks] = await Promise.all([
        getKycSubmission(user.id),
        getCasesByUser(user.id),
        getProfile(user.id),
        getCaseResolutionsByHero(user.id),
        getCaseUnlocksByHero(user.id),
      ]);

      setKycData(kyc);
      setProfile(prof);

      if (cases) {
        setCaseStats({
          submitted: cases.length,
          completed: cases.filter((c: any) => c.status === "completed").length,
          rejected: cases.filter((c: any) => c.status === "rejected").length,
        });
      }

      // Count all resolutions except rejected and disputed
      const validResolutions = (resolutions || []).filter(
        (r: any) =>
          String(r.status || "").toLowerCase() !== "rejected" &&
          String(r.status || "").toLowerCase() !== "disputed"
      );
      setHelpedCount(validResolutions.length);

      // Direct helps: paid_to = 'institute'
      const direct = validResolutions.filter(
        (r: any) => String(r.paid_to || "").toLowerCase() === "institute"
      );
      setDirectHelps(direct.length);

      // Contributions: paid_to = 'givethra'
      const contrib = validResolutions.filter(
        (r: any) => String(r.paid_to || "").toLowerCase() === "givethra"
      );
      setContributions(contrib.length);

      // Unlock count (total case unlocks)
      setUnlockCount((unlocks || []).length);
    } catch (err) {
      console.error("Failed to load profile data:", err);
    }
  }

  const kycApproved = kycData?.status === "approved";
  const displayName = profile?.full_name || user?.fullName || "My Profile";
  const avatarUrl = profile?.avatar_url || null;
  const coverUrl = profile?.cover_url || null;
  const trustScore = (user?.email ? 20 : 0) + (kycApproved ? 60 : 0) + (caseStats.completed * 5);

  const verificationBadges = [
    { label: "Email Verified", icon: <Mail className="h-3 w-3" />, active: !!user?.email },
    { label: "Mobile Verified", icon: <Phone className="h-3 w-3" />, active: !!profile?.phone_number },
    { label: "Identity Verified", icon: <ShieldCheck className="h-3 w-3" />, active: kycApproved },
    { label: "Institution Verified", icon: <Building2 className="h-3 w-3" />, active: false },
  ];

  const menuItems = [
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

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 pt-0 pb-24 space-y-4">
        <div className="rounded-b-3xl bg-card border border-border shadow-sm">
          {/* Cover */}
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

          {/* Avatar */}
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-14 mb-3">
              <div className="h-28 w-28 rounded-3xl border-4 border-card ring-1 ring-border flex items-center justify-center shadow-xl overflow-hidden bg-primary relative z-10">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-white font-bold text-3xl">{initials}</span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/edit-profile" })}
                className="gap-1.5 h-8 text-xs rounded-xl mb-2"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
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

        {/* ===== STATS GRID ===== */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
            <div className="text-2xl font-bold text-foreground">{caseStats.submitted}</div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> Submitted
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
            <div className="text-2xl font-bold text-foreground">{helpedCount}</div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
              <HeartHandshake className="h-3 w-3 text-green-600" /> Helped
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
            <div className="text-2xl font-bold text-foreground">{directHelps}</div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
              <Building2 className="h-3 w-3 text-purple-600" /> Direct Helps
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm">
            <div className="text-2xl font-bold text-foreground">{contributions}</div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
              <HandCoins className="h-3 w-3 text-amber-600" /> Contributions
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center text-center shadow-sm col-span-2">
            <div className="text-2xl font-bold text-foreground">{unlockCount}</div>
            <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 flex items-center gap-1">
              <Unlock className="h-3 w-3 text-indigo-600" /> Total Unlocks
            </div>
          </div>
        </div>

        {/* ===== QUICK ACTIONS ===== */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Pencil className="h-4 w-4" />, label: "Edit Profile", to: "/edit-profile" },
            { icon: <ShieldCheck className="h-4 w-4" />, label: "Security", to: "/security" },
            { icon: <Settings className="h-4 w-4" />, label: "Settings", to: "/settings" },
          ].map(({ icon, label, to }) => (
            <button
              key={label}
              type="button"
              onClick={() => navigate({ to: to as "/" })}
              className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <span className="text-primary">{icon}</span>
              <span className="text-xs font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>

        {/* ===== CONTACT INFO ===== */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email Address</p>
              <p className="text-sm font-semibold text-foreground">{user?.email ?? "Not set"}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-teal-500 ml-auto" />
          </div>
          {profile?.phone_number && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-sm font-semibold text-foreground">{profile.phone_number}</p>
              </div>
            </div>
          )}
        </div>

        {/* ===== MENU ===== */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          {menuItems.map((item, idx) => (
            <button
              key={item.label}
              type="button"
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

        {/* ===== LOGOUT ===== */}
        <button
          type="button"
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/20 font-medium text-sm transition-colors"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>

        <p className="text-center text-xs text-muted-foreground pb-2">
          Givethra v1.0 · Built with ❤️
        </p>
      </div>

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
                navigate({ to: "/sign-in" });
              }}
            >
              <LogOut className="h-4 w-4 mr-1.5" /> Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
