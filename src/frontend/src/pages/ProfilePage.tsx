// src/frontend/src/pages/ProfilePage.tsx
// Replaces Supabase with Cloudflare Worker APIs

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
  getCaseUnlocksByHero,
} from "@/lib/api";

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // ✅ Added for refresh detection
  const [kycData, setKycData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [caseStats, setCaseStats] = useState({ submitted: 0, approved: 0, completed: 0 });
  const [helpedCount, setHelpedCount] = useState(0);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadData();
  }, [isAuthenticated, location.key]); // ✅ Added location.key as dependency

  async function loadData() {
    if (!user) return;
    try {
      const [kyc, cases, prof, unlocks] = await Promise.all([
        getKycSubmission(user.id),
        getCasesByUser(user.id),
        getProfile(user.id),
        getCaseUnlocksByHero(user.id),
      ]);

      setKycData(kyc);
      setProfile(prof);

      if (cases) {
        setCaseStats({
          submitted: cases.length,
          approved: cases.filter((c: any) => c.status === "approved").length,
          completed: cases.filter((c: any) => c.status === "completed").length,
        });
      }
      setHelpedCount(unlocks?.length ?? 0);
    } catch (err) {
      console.error("Failed to load profile data:", err);
    }
  }

  const kycApproved = kycData?.status === "approved";
  const displayName = profile?.full_name || user?.fullName || "My Profile";
  const avatarUrl = profile?.avatar_url || null;
  const coverUrl = profile?.cover_url || null;
  const trustScore = (user?.email ? 20 : 0) + (kycApproved ? 60 : 0) + (caseStats.approved * 5);

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
    { icon: <KeyRound className="h-5 w-5" />, label: "Google Account Security", to: "/google-account-security" },
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
                  <span className="flex items-center gap-1 text-green-600 font-medium">
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
                      ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
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

        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white p-3 flex flex-col items-center justify-center text-center shadow-md">
            <Star className="h-4 w-4 mb-1 opacity-80" />
            <div className="text-2xl font-bold">{Math.min(trustScore, 100)}</div>
            <div className="text-[10px] opacity-80 leading-tight">Trust Score</div>
          </div>
          {[
            { label: "Submitted", value: caseStats.submitted },
            { label: "Helped", value: helpedCount },
            { label: "Completed", value: caseStats.completed },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl bg-card border border-border p-3 flex flex-col items-center justify-center text-center"
            >
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

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

        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email Address</p>
              <p className="text-sm font-semibold text-foreground">{user?.email ?? "Not set"}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />
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
