// src/pages/PrivacyPage.tsx
// Premium Globalized Privacy & Account Page — GDPR, CCPA, Google Play Compliant.

import Layout from "@/components/Layout";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import {
  Database, Lock, Trash2, Download, ShieldCheck, Eye, FileText,
  UserCheck, Cookie, Clock, Mail, Globe, AlertTriangle, CheckCircle2,
  ChevronRight, Sparkles, KeyRound, Users, Building2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  getUserCases, getUserKycSubmissions, getUserDeposits, deleteUserAccount,
} from "@/lib/api";

export default function PrivacyPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleDataDownload() {
    if (!user) return;
    try {
      const [cases, kyc, deposits] = await Promise.all([
        getUserCases(user.id), getUserKycSubmissions(user.id), getUserDeposits(user.id),
      ]);
      const myData = {
        account: { id: user.id, email: user.email, name: user.fullName },
        kyc_submissions: kyc, cases, deposits,
        exported_at: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(myData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `givethra-my-data-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Your data has been downloaded.");
    } catch { toast.error("Failed to download data."); }
  }

  async function handleAccountDeletion() {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUserAccount(user.id);
      toast.success("Your account data has been deleted. Signing out...");
      setTimeout(async () => { await logout(); navigate({ to: "/" }); }, 2000);
    } catch { toast.error("Failed to delete account. Please contact support."); }
    finally { setDeleting(false); }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-emerald-700 to-teal-900 text-white">
          <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-amber-950 shadow-lg"
            >
              <Lock className="h-4 w-4" /> Privacy & Account
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 font-display text-4xl font-black leading-tight tracking-tight md:text-5xl"
            >
              Your Data.<br />
              <span className="bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 bg-clip-text text-transparent">
                Your Rights.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-teal-100"
            >
              Givethra is GDPR, CCPA, and Google Play compliant. You are in full control of your personal data — access, export, or delete anytime.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] font-bold"
            >
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm"><ShieldCheck className="mr-1.5 inline h-3 w-3" /> GDPR Compliant</span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm"><Globe className="mr-1.5 inline h-3 w-3" /> Global Coverage</span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm"><Lock className="mr-1.5 inline h-3 w-3" /> Encrypted</span>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">

          {/* ===== YOUR RIGHTS SUMMARY ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-6 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-black text-teal-900">Your Data Rights</h2>
                <p className="mt-1 text-sm leading-relaxed text-teal-800/80">
                  Under GDPR, CCPA, and other privacy laws, you have these rights at any time:
                </p>
                <ul className="mt-3 grid gap-2 text-sm font-medium text-teal-900 sm:grid-cols-2">
                  {[
                    "Right to Access — download your data",
                    "Right to Correct — update your profile",
                    "Right to Delete — remove your account",
                    "Right to Export — portable JSON format",
                  ].map(r => (
                    <li key={r} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* ===== DOWNLOAD DATA ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 text-white shadow-md">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black text-slate-900">Download Your Data</h2>
                <p className="text-xs font-medium text-slate-500">GDPR Article 20 · Data Portability</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Download a complete copy of your account data including: profile information, KYC documents, submitted cases, deposits, and transaction history. The file is in a machine-readable JSON format.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                onClick={handleDataDownload}
                className="h-12 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-6 font-black text-white shadow-md transition-transform hover:scale-105"
              >
                <Download className="mr-2 h-4 w-4" /> Download My Data
              </Button>
              <span className="text-xs font-medium text-slate-400">Usually delivered instantly</span>
            </div>
          </motion.div>

          {/* ===== DATA WE COLLECT ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-md">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black text-slate-900">What Data We Collect</h2>
                <p className="text-xs font-medium text-slate-500">Full transparency · GDPR Article 13</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { icon: UserCheck, t: "Account Identity", d: "Name, email, phone, country, city" },
                { icon: FileText, t: "KYC Documents", d: "ID card, selfie, video (encrypted)" },
                { icon: Database, t: "Usage Data", d: "Posts, cases, deposits, transactions" },
                { icon: Building2, t: "Payment Info", d: "Bank details (for withdrawals only)" },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900">{t}</p>
                    <p className="text-[11px] text-slate-500">{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800">
              <strong>⚠️ We never:</strong> sell your data, share it with advertisers, or transfer it outside lawful frameworks.
            </div>
          </motion.div>

          {/* ===== WHO SEES YOUR DATA ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black text-slate-900">Who Sees Your Data</h2>
                <p className="text-xs font-medium text-slate-500">Third-party disclosure · GDPR Article 30</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {[
                { who: "You", access: "All your data", color: "bg-emerald-100 text-emerald-700" },
                { who: "Givethra Verification Team", access: "KYC documents, cases (for review only)", color: "bg-blue-100 text-blue-700" },
                { who: "Verified Heroes (after unlock)", access: "Case story, appeal video (stream only)", color: "bg-amber-100 text-amber-700" },
                { who: "Payment Processors", access: "Bank info (only for withdrawals)", color: "bg-violet-100 text-violet-700" },
                { who: "Public Users", access: "Your posts, display name (if posted publicly)", color: "bg-slate-100 text-slate-700" },
                { who: "Legal Authorities", access: "Only when legally required by court order", color: "bg-red-100 text-red-700" },
              ].map(({ who, access, color }) => (
                <div key={who} className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${color}`}>{who}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-600">{access}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs font-medium text-teal-800">
              <strong>🔒 Your KYC is private.</strong> Only authorised Givethra staff can see your ID, selfie, and video — never public users, Heroes, or other members.
            </div>
          </motion.div>

          {/* ===== DATA RETENTION ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 text-white shadow-md">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black text-slate-900">How Long We Keep Your Data</h2>
                <p className="text-xs font-medium text-slate-500">Data retention · GDPR Article 5</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {[
                { t: "Active Account", d: "As long as your account is active", icon: CheckCircle2, color: "text-emerald-600" },
                { t: "After Deletion Request", d: "Deleted within 30 days (GDPR & CCPA)", icon: Trash2, color: "text-red-600" },
                { t: "Financial Records", d: "Kept 7 years (tax compliance requirement)", icon: FileText, color: "text-amber-600" },
                { t: "Legal Hold Data", d: "Kept while required by law enforcement", icon: Lock, color: "text-slate-600" },
              ].map(({ t, d, icon: Icon, color }) => (
                <div key={t} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-900">{t}</p>
                    <p className="text-[11px] text-slate-500">{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ===== COOKIE PREFERENCES ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md">
                <Cookie className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black text-slate-900">Cookie Preferences</h2>
                <p className="text-xs font-medium text-slate-500">Manage your consent · GDPR Article 7</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              You can change your cookie preferences at any time. Essential cookies (for login and security) cannot be disabled. Optional cookies (for analytics and improvements) require your consent.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="/cookies"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 text-sm font-black text-white shadow-md transition-transform hover:scale-105"
              >
                <Cookie className="h-4 w-4" /> Cookie Settings
              </a>
              <a
                href="/cookies"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" /> Cookie Policy
              </a>
            </div>
          </motion.div>

          {/* ===== ACCOUNT CORRECTION ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black text-slate-900">Correct Your Information</h2>
                <p className="text-xs font-medium text-slate-500">Right to rectification · GDPR Article 16</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Update your name, email, phone, address, or bio anytime — no support ticket needed. For KYC changes after approval, please contact support.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="/edit-profile"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 text-sm font-black text-white shadow-md transition-transform hover:scale-105"
              >
                <UserCheck className="h-4 w-4" /> Edit My Profile
              </a>
              <a
                href="/kyc"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <ShieldCheck className="h-4 w-4" /> Update KYC
              </a>
            </div>
          </motion.div>

          {/* ===== DELETE ACCOUNT ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black text-red-900">Delete Your Account</h2>
                <p className="text-xs font-medium text-red-700">Right to erasure · GDPR Article 17</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-red-800">
              Permanently delete your account and all associated data. This action cannot be undone. Financial records will be retained for 7 years per tax law, and content you've made public (posts) may remain visible.
            </p>
            <div className="mt-3 rounded-xl border border-red-200 bg-white p-3 text-xs font-medium text-red-700">
              <strong>⚠️ This will remove:</strong> your profile, KYC documents, cases, posts, deposits, wallet balance, and all activity. This is permanent.
            </div>
            <div className="mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="h-12 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-6 font-black shadow-md">
                    <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-xl font-black text-red-700">
                      <AlertTriangle className="h-5 w-5" /> Delete your account?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm leading-relaxed text-slate-600">
                      This permanently deletes your account and all data. Type <strong className="text-red-700">DELETE</strong> to confirm.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="h-12 rounded-xl border-slate-200 text-center font-black text-red-700"
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeleteConfirmText("")} className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleteConfirmText !== "DELETE" || deleting}
                      onClick={handleAccountDeletion}
                      className="rounded-xl bg-gradient-to-r from-red-500 to-rose-600 font-black text-white disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Delete Forever"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </motion.div>

          {/* ===== GLOBAL COMPLIANCE ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-md">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-black text-slate-900">Global Regulatory Compliance</h2>
                <p className="text-xs font-medium text-slate-500">International privacy standards</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { region: "EU", law: "GDPR", desc: "Full data subject rights" },
                { region: "California", law: "CCPA/CPRA", desc: "Right to know & delete" },
                { region: "Canada", law: "PIPEDA", desc: "Consent-based processing" },
                { region: "Singapore", law: "PDPA", desc: "Purpose limitation" },
                { region: "Brazil", law: "LGPD", desc: "Data protection rights" },
                { region: "Android", law: "Google Play", desc: "Data Safety policy" },
              ].map(({ region, law, desc }) => (
                <div key={law} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="text-xs font-black text-slate-900">{law} <span className="text-slate-400">· {region}</span></p>
                    <p className="text-[11px] text-slate-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ===== CONTACT DPO ===== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 p-8 text-center text-white shadow-2xl"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                <Mail className="h-7 w-7" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-black">Contact Our Data Protection</h2>
              <p className="mt-2 text-sm text-teal-100">Any data request is processed within 30 days as required by law.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <a
                  href="mailto:privacy@givethra.org"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 text-sm font-black text-amber-950 shadow-lg transition-transform hover:scale-105"
                >
                  <Mail className="h-4 w-4" /> privacy@givethra.org
                </a>
                <a
                  href="/contact"
                  className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  Contact Us <ChevronRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Note about Google */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-xs font-medium text-slate-500">
            🔐 Password change is not available because you sign in securely with Google OAuth.
          </div>
        </div>
      </div>
    </Layout>
  );
}
