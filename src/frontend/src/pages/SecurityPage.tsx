// src/pages/SecurityPage.tsx
// Premium Globalized Security Center — GDPR, Play Store, Best Practices compliant.

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck, Shield, Clock, CheckCircle2, XCircle, Monitor, LogOut,
  Mail, Phone, UserCheck, Lock, AlertTriangle, KeyRound, Smartphone,
  Eye, Globe, Fingerprint, FileText, ChevronRight, Activity, MapPin,
  Sparkles, BadgeCheck, Info, Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getKycSubmission } from "@/lib/api";

export default function SecurityPage() {
  const { user, isAuthenticated } = useAuth();
  const [kycData, setKycData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadKyc();
    else setIsLoading(false);
  }, [user]);

  async function loadKyc() {
    setIsLoading(true);
    try {
      const data = await getKycSubmission(user!.id);
      setKycData(data);
    } catch (err) {
      console.error("Failed to load KYC:", err);
      setKycData(null);
    } finally {
      setIsLoading(false);
    }
  }

  function StatusRow({
    label,
    description,
    status,
    action,
    icon: Icon = BadgeCheck,
  }: {
    label: string;
    description?: string;
    status: "verified" | "pending" | "unknown" | "failed";
    action?: React.ReactNode;
    icon?: React.ComponentType<{ className?: string }>;
  }) {
    const config = {
      verified: { icon: <CheckCircle2 className="h-4 w-4" />, text: "Verified", cls: "text-emerald-600 bg-emerald-50", ring: "ring-emerald-200" },
      pending: { icon: <Clock className="h-4 w-4" />, text: "Pending", cls: "text-amber-600 bg-amber-50", ring: "ring-amber-200" },
      failed: { icon: <XCircle className="h-4 w-4" />, text: "Rejected", cls: "text-red-600 bg-red-50", ring: "ring-red-200" },
      unknown: { icon: <Clock className="h-4 w-4" />, text: "Not Set", cls: "text-slate-500 bg-slate-50", ring: "ring-slate-200" },
    };
    const c = config[status];
    return (
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-4 last:border-0">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.cls}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-900">{label}</p>
            {description && <p className="mt-0.5 text-xs font-medium text-slate-500">{description}</p>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ${c.cls} ${c.ring}`}>
            {c.icon} {c.text}
          </div>
          {action}
        </div>
      </div>
    );
  }

  const kycStatus = kycData?.status ?? "unknown";
  const kycStatusKind =
    kycStatus === "approved" ? "verified" :
    kycStatus === "rejected" ? "failed" :
    kycData ? "pending" : "unknown";

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-900 text-white">
          <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-4 py-14 text-center md:py-16">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-lg"
            >
              <ShieldCheck className="h-4 w-4" /> Security Center
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-5 font-display text-3xl font-black leading-tight tracking-tight md:text-4xl"
            >
              Your Account is{" "}
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                Safe & Secure
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-teal-100"
            >
              Manage verification, view login activity, and protect your account with our security tools.
            </motion.p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">

          {/* ===== VERIFICATION STATUS ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-black text-slate-900">Verification Status</h2>
                  <p className="text-[11px] font-medium text-slate-500">Trust level & identity checks</p>
                </div>
              </div>
            </div>

            <div className="px-5">
              {isLoading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
                  <p className="mt-3 text-sm font-medium text-slate-500">Loading verification status...</p>
                </div>
              ) : (
                <>
                  <StatusRow
                    icon={Mail}
                    label="Email Verification"
                    description={user?.email ? user.email : "No email linked"}
                    status={user?.email ? "verified" : "unknown"}
                  />
                  <StatusRow
                    icon={Phone}
                    label="Phone Verification"
                    description={user?.phone || "No phone linked — add one for extra security"}
                    status={user?.phone ? "verified" : "unknown"}
                    action={!user?.phone ? (
                      <Link to="/edit-profile">
                        <Button size="sm" variant="outline" className="h-8 rounded-lg border-teal-200 text-[11px] font-bold text-teal-700">
                          Add Phone
                        </Button>
                      </Link>
                    ) : null}
                  />
                  <StatusRow
                    icon={UserCheck}
                    label="Identity Verification (KYC)"
                    description={kycStatus === "approved" ? "Government ID verified" : kycStatus === "rejected" ? "Please re-submit your KYC" : "Complete KYC to unlock all features"}
                    status={kycStatusKind}
                    action={kycStatus !== "approved" ? (
                      <Link to="/kyc">
                        <Button size="sm" className="h-8 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-600 text-[11px] font-bold text-white shadow-sm">
                          {kycStatus === "rejected" ? "Re-submit" : kycData ? "View KYC" : "Start KYC"}
                        </Button>
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> Trusted
                      </span>
                    )}
                  />
                </>
              )}
            </div>
          </motion.div>

          {/* ===== SESSION INFO ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-black text-slate-900">Session Information</h2>
                  <p className="text-[11px] font-medium text-slate-500">Your current signed-in account</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 font-black text-white shadow-md">
                      {(user?.fullName || "U").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">{user?.fullName || "User"}</p>
                      <p className="truncate text-xs font-medium text-slate-500">{user?.email}</p>
                    </div>
                    <BadgeCheck className="h-5 w-5 shrink-0 text-emerald-500" fill="currentColor" />
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-100 bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Signed in via</p>
                      <p className="mt-0.5 font-bold text-slate-900">Google OAuth</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Account Status</p>
                      <p className="mt-0.5 font-bold text-emerald-600">Active</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                  <Lock className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm font-bold text-slate-700">Not signed in</p>
                  <p className="mt-0.5 text-xs text-slate-500">Sign in to view session details</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* ===== ACTIVE SESSIONS ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-black text-slate-900">Active Sessions</h2>
                    <p className="text-[11px] font-medium text-slate-500">Devices signed into your account</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  1 Active
                </span>
              </div>
            </div>

            <div className="p-5">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-black text-slate-900">
                        This Device
                        <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-black text-white">CURRENT</span>
                      </p>
                      <p className="truncate text-xs font-medium text-slate-500">
                        {typeof navigator !== "undefined" ? navigator.platform || "Web Browser" : "Web"}
                      </p>
                    </div>
                  </div>
                  <p className="rounded-xl bg-slate-50 p-3 text-center text-xs font-medium text-slate-500">
                    💡 No other devices are signed into your account.
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-slate-500">Sign in to view active sessions.</p>
              )}
            </div>
          </motion.div>

          {/* ===== SESSION MANAGEMENT ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <LogOut className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-black text-slate-900">Session Management</h2>
                  <p className="text-[11px] font-medium text-slate-500">Sign out from all devices</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-bold text-amber-900">⚠️ When to use this:</p>
                <p className="mt-1 text-xs font-medium text-amber-800">
                  If you notice unusual activity, suspect your account is compromised, or you've signed in on a shared device.
                </p>
              </div>
              <Button
                variant="destructive"
                className="mt-3 h-11 w-full rounded-xl bg-gradient-to-r from-red-500 to-rose-600 font-black shadow-md"
                disabled
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out All Other Devices
              </Button>
              <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
                Currently unavailable — no other active sessions detected.
              </p>
            </div>
          </motion.div>

          {/* ===== SECURITY BEST PRACTICES ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-black text-slate-900">Security Best Practices</h2>
                  <p className="text-[11px] font-medium text-slate-500">Keep your account safe</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { icon: Fingerprint, t: "Enable 2FA", d: "Add an extra layer of security", tip: "Coming soon" },
                  { icon: Phone, t: "Verify Phone", d: "Add phone for account recovery", tip: user?.phone ? "✓ Done" : "Add now" },
                  { icon: KeyRound, t: "Google Account", d: "Manage security at myaccount.google.com", tip: "Recommended" },
                  { icon: Eye, t: "Review Activity", d: "Check login history regularly", tip: "Good practice" },
                  { icon: Lock, t: "Strong Password", d: "Use a password manager", tip: "Recommended" },
                  { icon: AlertTriangle, t: "Report Suspicious", d: "If you notice anything unusual", tip: "Contact support" },
                ].map(({ icon: Icon, t, d, tip }) => (
                  <div key={t} className="flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900">{t}</p>
                      <p className="text-[10px] font-medium text-slate-500">{d}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-emerald-600">{tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ===== PRIVACY & DATA ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-black text-slate-900">Privacy & Data Control</h2>
                  <p className="text-[11px] font-medium text-slate-500">Your data, your rights</p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <div className="space-y-2">
                <Link
                  to="/account-privacy"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3 transition hover:border-pink-300 hover:bg-pink-50/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Privacy & Account</p>
                      <p className="text-[10px] text-slate-500">Download data or delete account</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-pink-600" />
                </Link>
                <Link
                  to="/privacy-policy"
                  className="group flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white p-3 transition hover:border-pink-300 hover:bg-pink-50/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">Privacy Policy</p>
                      <p className="text-[10px] text-slate-500">How we protect your data</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-pink-600" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ===== REPORT PROBLEM ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 p-6 text-white shadow-lg"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-black">Notice Suspicious Activity?</h2>
                  <p className="mt-1 text-xs leading-relaxed text-teal-100">
                    If you believe your account has been compromised, contact our security team immediately. We respond within 1 hour for security incidents.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="mailto:security@givethra.org"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-4 text-xs font-black text-amber-950 shadow-md transition hover:scale-105"
                >
                  <Mail className="h-3.5 w-3.5" /> security@givethra.org
                </a>
                <Link
                  to="/report"
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  Report Issue <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ===== ACCOUNT PROTECTION NOTICE ===== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs font-medium text-blue-800"
          >
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-black">🔐 Your account is protected by:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5">
                  <li>Google OAuth — password never stored on our servers</li>
                  <li>Encrypted sessions (TLS 1.3)</li>
                  <li>Automatic session timeout</li>
                  <li>24/7 monitoring for suspicious activity</li>
                  <li>GDPR & Google Play compliant data handling</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
