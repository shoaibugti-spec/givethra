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
  getCasesByIds,
  getCaseResolutions,
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
  const [helpByCase, setHelpByCase] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [caseFilter, setCaseFilter] = useState<"all" | "pending" | "rejected" | "completed">("all");
  const [helpFilter, setHelpFilter] = useState<"all" | "active" | "completed">("all");

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
      // 1. Load user's own cases
      const cases = await getCasesByUser(user.id);
      setMyCases(cases ?? []);

      // 2. Load cases that the user has unlocked (as a Hero)
      const unlocks = await getCaseUnlocksByHero(user.id);
      if (unlocks && unlocks.length > 0) {
        const ids: string[] = Array.from(new Set(unlocks.map((u: any) => String(u.case_id || "")).filter(Boolean)));
        const [unlockedData, resolutionEntries] = await Promise.all([
          getCasesByIds(ids),
          Promise.all(ids.map(async (caseId) => [caseId, await getCaseResolutions(caseId, user.id)] as const)),
        ]);
        setUnlockedCases(unlockedData ?? []);
        setHelpByCase(Object.fromEntries(resolutionEntries.map(([caseId, rows]) => [caseId, Array.isArray(rows) ? rows : []])));
      } else {
        setUnlockedCases([]);
        setHelpByCase({});
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
    approved: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Published", color: "bg-teal-100 text-teal-700" },
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
    const helpRecords = isHelping ? (helpByCase[c.id] ?? []) : [];
    const helpStatus = (status: string) => status === "completed" ? { label: "Completed", color: "text-teal-700 bg-teal-50 border-teal-200" } : status === "seeker_confirmed" ? { label: "Confirmed — Under Verification", color: "text-amber-700 bg-amber-50 border-amber-200" } : status === "disputed" ? { label: "Disputed", color: "text-red-700 bg-red-50 border-red-200" } : { label: "Pending Givethra Review", color: "text-blue-700 bg-blue-50 border-blue-200" };

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

        {isHelping && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
            <p className="text-xs font-semibold text-primary flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> Your Help on this case</p>
            {helpRecords.length === 0 ? (
              <p className="text-xs text-muted-foreground">Help opened — receipt or payment proof has not been submitted yet.</p>
            ) : helpRecords.map((help: any) => {
              const status = helpStatus(String(help.status || "pending_confirmation"));
              const amount = help.seeker_confirmed_amount ?? help.amount_paid;
              return <div key={help.id} className="rounded-md border border-border bg-card/80 px-2.5 py-2 text-xs space-y-1">
                <div className="flex items-center justify-between gap-2"><span className="font-medium">{help.paid_to === "givethra" ? "Contribution / Fundraising" : "Direct Help"}</span><span className={`rounded-full border px-2 py-0.5 font-semibold ${status.color}`}>{status.label}</span></div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground"><span>Amount: {amount != null ? `${s} ${amount} ${cur}` : "Not submitted"}</span>{help.transaction_id && <span>Txn: {help.transaction_id}</span>}</div>
              </div>;
            })}
          </div>
        )}

        {needed > 0 && !isRejected && !isExpired && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium">
              <span className="text-teal-600">{s} {collected} raised</span>
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
              <div className={`rounded-lg border p-3 ${isFree ? "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800" : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"}`}>
                <div className="flex items-start gap-2">
                  {isFree ? (
                    <RefreshCw className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${isFree ? "text-teal-800 dark:text-teal-300" : "text-blue-800 dark:text-blue-300"}`}>
                      {isFree 
                        ? "🎁 Your free submission has been returned!" 
                        : "💳 1 credit has been refunded to your account!"}
                    </p>
                    <p className={`text-xs mt-0.5 ${isFree ? "text-teal-700 dark:text-teal-400" : "text-blue-700 dark:text-blue-400"}`}>
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

              <div className={`rounded-lg border p-3 ${isFree ? "bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800" : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"}`}>
                <div className="flex items-start gap-2">
                  {isFree ? (
                    <RefreshCw className="h-5 w-5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                  ) : (
                    <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-semibold ${isFree ? "text-teal-800 dark:text-teal-300" : "text-blue-800 dark:text-blue-300"}`}>
                      {isFree 
                        ? "🎁 Your free submission is still available!" 
                        : "💳 1 credit has been refunded to your account!"}
                    </p>
                    <p className={`text-xs mt-0.5 ${isFree ? "text-teal-700 dark:text-teal-400" : "text-blue-700 dark:text-blue-400"}`}>
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
            {isHelping ? "Continue Helping" : "View Details"}
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
  const showCaseStatus = (status: string) => caseFilter === "all" || caseFilter === status;
  const visibleHelping = unlockedCases.filter((c) => {
    const records = helpByCase[c.id] ?? [];
    if (helpFilter === "all") return true;
    if (helpFilter === "completed") return records.some((r: any) => r.status === "completed") || c.status === "completed";
    return !records.length || records.some((r: any) => r.status !== "completed" && r.status !== "disputed") || !["completed", "rejected", "expired"].includes(String(c.status));
  });
  const completedHelpCount = unlockedCases.filter((c) => (helpByCase[c.id] ?? []).some((r: any) => r.status === "completed") || c.status === "completed").length;
  const activeHelpCount = unlockedCases.length - completedHelpCount;

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
              <div className="grid grid-cols-4 gap-1 rounded-xl border border-border bg-muted/30 p-1" role="tablist" aria-label="My case status filters">
                {([
                  ["all", "All"],
                  ["pending", "Pending"],
                  ["rejected", "Rejected"],
                  ["completed", "Completed"],
                ] as const).map(([value, label]) => (
                  <button key={value} type="button" role="tab" aria-selected={caseFilter === value} onClick={() => setCaseFilter(value)} className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${caseFilter === value ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {label} ({value === "all" ? myCases.length : value === "pending" ? myPending.length : value === "rejected" ? myRejected.length : myCompleted.length})
                  </button>
                ))}
              </div>
              {myCases.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto opacity-30 mb-2" />
                  <p>No cases submitted yet.</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate({ to: "/submit-request" })}>Submit Your First Case</Button>
                </div>
              ) : (
                <>
                  {showCaseStatus("expired") && myExpired.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-amber-600 flex items-center gap-1.5">
                        <CalendarClock className="h-4 w-4" /> Expired ({myExpired.length})
                      </h3>
                      {myExpired.map(c => <CaseRow key={c.id} c={c} />)}
                    </div>
                  )}
                  {showCaseStatus("rejected") && myRejected.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                        <XCircle className="h-4 w-4" /> Rejected ({myRejected.length})
                      </h3>
                      {myRejected.map(c => <CaseRow key={c.id} c={c} />)}
                    </div>
                  )}
                  {showCaseStatus("pending") && myPending.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">⏳ Under Review ({myPending.length})</h3>
                      {myPending.map(c => <CaseRow key={c.id} c={c} />)}
                    </div>
                  )}
                  {showCaseStatus("approved") && myActive.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">✅ Published ({myActive.length})</h3>
                      {myActive.map(c => <CaseRow key={c.id} c={c} />)}
                    </div>
                  )}
                  {showCaseStatus("completed") && myCompleted.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">🎉 Completed ({myCompleted.length})</h3>
                      {myCompleted.map(c => <CaseRow key={c.id} c={c} />)}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="helping" className="space-y-3 mt-4">
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-muted/30 p-1" role="tablist" aria-label="Help status filters">
                {([
                  ["all", "All Help"],
                  ["active", "Active"],
                  ["completed", "Completed"],
                ] as const).map(([value, label]) => (
                  <button key={value} type="button" role="tab" aria-selected={helpFilter === value} onClick={() => setHelpFilter(value)} className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${helpFilter === value ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    {label} ({value === "all" ? unlockedCases.length : value === "active" ? activeHelpCount : completedHelpCount})
                  </button>
                ))}
              </div>
              {visibleHelping.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Heart className="h-10 w-10 mx-auto opacity-30 mb-2" />
                  <p>You haven't unlocked any cases yet.</p>
                  <Button size="sm" className="mt-3" onClick={() => navigate({ to: "/cases" })}>Browse Cases</Button>
                </div>
              ) : (
                visibleHelping.map(c => <CaseRow key={c.id} c={c} isHelping />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
