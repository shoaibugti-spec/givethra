// src/frontend/src/pages/MyCasesPage.tsx
// Replaces Supabase with Cloudflare Worker APIs

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Clock, CheckCircle2, XCircle, Eye, Heart, Plus, AlertTriangle, RefreshCw, ArrowRight, CalendarClock, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getCasesByUser,
  getCaseUnlocksByHero,
  getCaseResolutionsByHero,
  getCasesByIds,
} from "@/lib/api";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹",
  TRY: "₺", BDT: "৳", EGP: "E£", NGN: "₦", KES: "KSh", ZAR: "R", BRL: "R$",
  CAD: "C$", AUD: "A$", JPY: "¥", CNY: "¥", KRW: "₩", IDR: "Rp", MYR: "RM",
  THB: "฿", PHP: "₱", VND: "₫", SGD: "S$", AFN: "؋", NPR: "Rs", LKR: "Rs",
  QAR: "QAR", KWD: "KWD", BHD: "BHD", OMR: "OMR", JOD: "JOD", MAD: "MAD",
};

function sym(cur?: string) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}

export default function MyCasesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myCases, setMyCases] = useState<any[]>([]);
  const [unlockedCases, setUnlockedCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadData();

    // Reload when user returns to tab
    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isAuthenticated]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Load the user's own requests.
      const cases = await getCasesByUser(user.id);
      setMyCases(cases ?? []);

      // 2. Load both active unlocks and resolution history. Completed help is
      // deliberately retained in case_resolutions after the case leaves the
      // active unlock list, so it must be merged back into this history view.
      const [unlocksResult, resolutionsResult] = await Promise.all([
        getCaseUnlocksByHero(user.id),
        getCaseResolutionsByHero(user.id),
      ]);
      const unlocks = Array.isArray(unlocksResult) ? unlocksResult : [];
      const resolutions = Array.isArray(resolutionsResult) ? resolutionsResult : [];
      const caseIds = Array.from(new Set([
        ...unlocks.map((unlock: any) => String(unlock.case_id || "")).filter(Boolean),
        ...resolutions.map((resolution: any) => String(resolution.case_id || "")).filter(Boolean),
      ]));
      if (caseIds.length > 0) {
        const unlockedData = await getCasesByIds(caseIds);
        const resolutionByCase = new Map<string, any>();
        resolutions.forEach((resolution: any) => {
          const key = String(resolution.case_id || "");
          const current = resolutionByCase.get(key);
          if (!current || new Date(String(resolution.completed_at || resolution.admin_confirmed_at || resolution.submitted_at || 0)).getTime() > new Date(String(current.completed_at || current.admin_confirmed_at || current.submitted_at || 0)).getTime()) {
            resolutionByCase.set(key, resolution);
          }
        });
        const merged = (Array.isArray(unlockedData) ? unlockedData : []).map((caseRecord: any) => {
          const resolution = resolutionByCase.get(String(caseRecord.id));
          const resolutionStatus = String(resolution?.status || "").toLowerCase();
          const adminConfirmed = resolution?.admin_confirmed === true || resolution?.admin_confirmed === 1 || String(resolution?.admin_confirmed || "").toLowerCase() === "true" || String(resolution?.admin_confirmed || "") === "1";
          const isCompleted = resolutionStatus === "completed" || (adminConfirmed && resolutionStatus === "approved");
          return resolution && isCompleted ? {
            ...caseRecord,
            status: "completed",
            amount_collected: Number(resolution.amount_paid ?? resolution.seeker_confirmed_amount ?? caseRecord.amount_collected ?? 0),
            completed_at: resolution.completed_at || resolution.admin_confirmed_at || caseRecord.updated_at,
            resolution_id: resolution.id,
            affidavit_available: true,
          } : caseRecord;
        });
        setUnlockedCases(merged);
      } else {
        setUnlockedCases([]);
      }
    } catch (err) {
      console.error("Failed to load cases:", err);
      // keep existing state
    } finally {
      setLoading(false);
    }
  }

  const statusConfig: any = {
    pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Under Review", color: "bg-orange-100 text-orange-700" },
    approved: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Published", color: "bg-green-100 text-green-700" },
    rejected: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Rejected", color: "bg-red-100 text-red-700" },
    completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Completed", color: "bg-blue-100 text-blue-700" },
    expired: { icon: <CalendarClock className="h-3.5 w-3.5" />, label: "Expired", color: "bg-amber-100 text-amber-700" },
  };

  function CaseRow({ c, isHelping = false }: { c: any; isHelping?: boolean }) {
    const cfg = statusConfig[c.status] ?? statusConfig.pending;
    const cur = c.currency || "USD";
    const s = sym(cur);
    const needed = Number(c.amount_needed ?? 0);
    const collected = Number(c.amount_collected ?? 0);
    const pct = needed > 0 ? Math.min(Math.round((collected / needed) * 100), 100) : 0;
    const isRejected = c.status === "rejected";
    const isExpired = c.status === "expired";
    const isFree = c.was_free === true || c.submission_type === "free";

    return (
      <div className={`rounded-xl border p-4 space-y-3 ${isRejected ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : isExpired ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/10" : "bg-card"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                {cfg.icon} {cfg.label}
              </span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>
            </div>
            <p className="font-semibold">{c.title}</p>
            <p className="text-xs text-muted-foreground">📍 {c.city}, {c.country} {needed > 0 && `· ${s} ${needed} ${cur}`}</p>
          </div>
        </div>

        {needed > 0 && !isRejected && !isExpired && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium">
              <span className="text-green-600">{s} {collected} raised</span>
              <span className="text-muted-foreground">{pct}% · {s} {Math.max(needed - collected, 0)} left</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* ============================================================
            REJECTED CASE - FULL DETAILED NOTICE BOARD
            ============================================================ */}
        {isRejected && (
          <div className="space-y-3">
            {/* Main Rejection Banner */}
            <div className="rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 p-4 space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full shrink-0">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-red-800 dark:text-red-300">❌ Case Rejected</h4>
                  <p className="text-xs text-red-600 dark:text-red-400">Your case was reviewed and could not be approved</p>
                </div>
              </div>

              {/* Rejection Reason Box */}
              <div className="bg-white dark:bg-red-950/50 rounded-lg border-2 border-red-200 dark:border-red-800 p-4">
                <p className="text-[11px] font-semibold text-red-500 dark:text-red-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> Rejection Reason
                </p>
                <p className="text-sm text-red-900 dark:text-red-200 font-medium leading-relaxed whitespace-pre-line">
                  {c.rejection_reason || "No specific reason provided. Please contact support for details."}
                </p>
                {c.reviewed_at && (
                  <p className="text-[10px] text-red-400 dark:text-red-500 mt-2">
                    Reviewed on: {new Date(c.reviewed_at).toLocaleDateString()} at {new Date(c.reviewed_at).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* Refund/Free Status */}
              <div className={`rounded-lg border p-3 ${isFree ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"}`}>
                <div className="flex items-start gap-2">
                  {isFree ? (
                    <RefreshCw className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${isFree ? "text-green-800 dark:text-green-300" : "text-blue-800 dark:text-blue-300"}`}>
                      {isFree 
                        ? "🎁 Your free submission has been returned!" 
                        : "💳 1 credit has been refunded to your account!"}
                    </p>
                    <p className={`text-xs mt-0.5 ${isFree ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"}`}>
                      {isFree 
                        ? "You can submit a new case for FREE again. Your free case allowance is restored." 
                        : "You can re-submit this case using your refunded credit. No extra cost."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button 
                  size="sm" 
                  className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => navigate({ to: "/submit-request" })}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Edit & Re-submit Case
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  onClick={() => navigate({ to: "/support" })}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  Contact Support
                </Button>
              </div>
            </div>

            {/* ===== IMPORTANT: HIDE AMOUNT AND OTHER DETAILS FOR REJECTED CASES ===== */}
            <div className="text-center py-1">
              <p className="text-[11px] text-red-400 dark:text-red-500">
                ⚠️ All case details have been hidden. Please re-submit a new case.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================
            EXPIRED CASE - NOTICE BOARD
            ============================================================ */}
        {isExpired && (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 p-4 space-y-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full shrink-0">
                  <CalendarClock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-bold text-amber-800 dark:text-amber-300">⏰ Case Expired</h4>
                  <p className="text-xs text-amber-600 dark:text-amber-400">No one helped in time, but you can try again</p>
                </div>
              </div>

              <div className="bg-white dark:bg-amber-950/50 rounded-lg border-2 border-amber-200 dark:border-amber-800 p-4">
                <p className="text-[11px] font-semibold text-amber-500 dark:text-amber-400 uppercase tracking-wide mb-2">What happened?</p>
                <p className="text-sm text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                  Your case remained active until the deadline but no Hero stepped forward to help.
                  {isFree 
                    ? " Since this was your free case, you can submit a new case for FREE." 
                    : " The 1 credit you used has been refunded to your account."}
                </p>
                {c.deadline && (
                  <p className="text-[10px] text-amber-400 dark:text-amber-500 mt-2">
                    Expired on: {new Date(c.deadline).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className={`rounded-lg border p-3 ${isFree ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"}`}>
                <div className="flex items-start gap-2">
                  {isFree ? (
                    <RefreshCw className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${isFree ? "text-green-800 dark:text-green-300" : "text-blue-800 dark:text-blue-300"}`}>
                      {isFree 
                        ? "🎁 Your free submission is still available!" 
                        : "💳 1 credit has been refunded to your account!"}
                    </p>
                    <p className={`text-xs mt-0.5 ${isFree ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"}`}>
                      {isFree 
                        ? "You can submit a brand new case for FREE." 
                        : "You can submit a new case using your refunded credit."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button 
                  size="sm" 
                  className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => navigate({ to: "/submit-request" })}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Submit New Case
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full gap-2 border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  onClick={() => navigate({ to: "/cases" })}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Browse Other Cases
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Fallback for rejected without reason */}
        {isRejected && !c.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 inline mr-1.5" />
            This case was rejected. Please contact support for details.
          </div>
        )}

        {/* ===== VIEW DETAILS BUTTON - For non-rejected cases only ===== */}
        {!isRejected && (
          <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => navigate({ to: "/cases/$id", params: { id: c.id } })}>
            {isHelping ? <Heart className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {isHelping && c.status === "completed" ? "View Affidavit & Completed Help" : isHelping ? "Continue Helping" : "View Details"}
          </Button>
        )}
      </div>
    );
  }

  const myPending = myCases.filter(c => c.status === "pending");
  const myActive = myCases.filter(c => c.status === "approved");
  const myCompleted = myCases.filter(c => c.status === "completed");
  const myRejected = myCases.filter(c => c.status === "rejected");
  const myExpired = myCases.filter(c => c.status === "expired");

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">My Cases</h1>
          </div>
          <Button size="sm" onClick={() => navigate({ to: "/submit-request" })} className="gap-1.5">
            <Plus className="h-4 w-4" /> New Case
          </Button>
        </div>

        {loading ? <div className="text-center py-20 text-muted-foreground">Loading...</div> : (
          <Tabs defaultValue="requests">
            <TabsList className="w-full">
              <TabsTrigger value="requests" className="flex-1">My Requests ({myCases.length})</TabsTrigger>
              <TabsTrigger value="helping" className="flex-1">Helping ({unlockedCases.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="requests" className="space-y-5 mt-4">
              {myCases.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto opacity-30 mb-2" />
                  <p>No cases submitted yet.</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate({ to: "/submit-request" })}>Submit Your First Case</Button>
                </div>
              ) : (
                <>
                  {myExpired.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4" /> Expired ({myExpired.length})
                      </h3>
                      {myExpired.map(c => <CaseRow key={c.id} c={c} />)}
                    </div>
                  )}
                  {myRejected.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                        <XCircle className="h-4 w-4" /> Rejected ({myRejected.length})
                      </h3>
                      {myRejected.map(c => <CaseRow key={c.id} c={c} />)}
                    </div>
                  )}
                  {myPending.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">⏳ Under Review ({myPending.length})</h3>
                      {myPending.map(c => <CaseRow key={c.id} c={c} />)}
                    </div>
                  )}
                  {myActive.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">✅ Published ({myActive.length})</h3>
                      {myActive.map(c => <CaseRow key={c.id} c={c} />)}
                    </div>
                  )}
                  {myCompleted.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">🎉 Completed ({myCompleted.length})</h3>
                      {myCompleted.map(c => <CaseRow key={c.id} c={c} />)}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="helping" className="space-y-3 mt-4">
              {unlockedCases.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-10 w-10 mx-auto opacity-30 mb-2" />
                  <p>You haven't unlocked any cases yet.</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate({ to: "/cases" })}>Browse Cases</Button>
                </div>
              ) : (
                unlockedCases.map(c => <CaseRow key={c.id} c={c} isHelping />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
