// src/frontend/src/pages/MyCasesPage.tsx
// Replaces Supabase with Cloudflare Worker APIs

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { FileText, Clock, CheckCircle2, XCircle, Eye, Heart, Plus, RefreshCw, ArrowRight, CalendarClock, AlertCircle } from "lucide-react";
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

function isApprovedCompletedResolution(resolution: any): boolean {
  if (!resolution) return false;
  const status = String(resolution?.status || "").trim().toLowerCase();
  if (status === "completed" || status === "approved" || status === "verified" || status === "confirmed") {
    return true;
  }
  const adminConfirmed = resolution?.admin_confirmed === 1 || resolution?.admin_confirmed === true || resolution?.admin_confirmed === "1" || String(resolution?.admin_confirmed || "").toLowerCase() === "true";
  return adminConfirmed && !["rejected", "failed", "cancelled", "canceled", "pending", "pending_confirmation", "dispatched"].includes(status);
}

function isContributionResolution(resolution: any): boolean {
  if (!resolution) return false;
  const marker = String(resolution?.paid_to ?? resolution?.paidTo ?? resolution?.payment_type ?? resolution?.paymentType ?? "").trim().toLowerCase();
  return ["givethra", "contribution", "fundraising", "partial"].includes(marker);
}

export default function MyCasesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myCases, setMyCases] = useState<any[]>([]);
  const [unlockedCases, setUnlockedCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states for My Cases
  const [myCaseStatusFilter, setMyCaseStatusFilter] = useState<string>("pending");

  // Filter states for My Help
  const [helpTypeFilter, setHelpTypeFilter] = useState<string>("contribution");
  const [helpStatusFilter, setHelpStatusFilter] = useState<string>("pending");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadData();

    const onFocus = () => loadData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isAuthenticated]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      const cases = await getCasesByUser(user.id);
      setMyCases((Array.isArray(cases) ? cases : []).map((caseRecord: any) => ({
        ...caseRecord,
        status: String(caseRecord?.status || "pending").toLowerCase(),
      })));

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
        const recordsById = new Map<string, any>((Array.isArray(unlockedData) ? unlockedData : []).map((record: any) => [String(record?.id || ""), record]));
        resolutions.forEach((resolution: any) => {
          const caseId = String(resolution?.case_id || "");
          if (caseId && !recordsById.has(caseId)) {
            recordsById.set(caseId, {
              id: caseId,
              title: resolution.case_title || "Completed help",
              category: resolution.case_category || "Help",
              country: resolution.case_country || "",
              city: resolution.case_city || "",
              currency: resolution.currency || "PKR",
              amount_needed: resolution.amount_paid || 0,
              amount_collected: resolution.amount_paid || 0,
              status: "completed",
            });
          }
        });
        const merged = Array.from(recordsById.values()).map((caseRecord: any) => {
          const resolution = resolutionByCase.get(String(caseRecord.id));
          const isCompleted = isApprovedCompletedResolution(resolution);
          let helpStatus = "pending";
          if (resolution) {
            const resStatus = String(resolution.status || "").toLowerCase();
            if (isCompleted) helpStatus = "completed";
            else if (resStatus === "rejected" || resStatus === "disputed") helpStatus = "rejected";
            else helpStatus = "pending";
          } else {
            helpStatus = "pending";
          }
          const isContribution = resolution ? isContributionResolution(resolution) : false;
          const helpType = isContribution ? "contribution" : "direct";
          return {
            ...caseRecord,
            status: String(caseRecord?.status || "pending").toLowerCase(),
            amount_collected: Number(resolution?.amount_paid ?? resolution?.seeker_confirmed_amount ?? caseRecord.amount_collected ?? 0),
            completed_at: resolution?.completed_at || resolution?.admin_confirmed_at || caseRecord.updated_at,
            resolution_id: resolution?.id,
            affidavit_available: isCompleted && resolution?.id ? true : false,
            helpStatus,
            helpType,
            resolution,
          };
        });
        setUnlockedCases(merged);
      } else {
        setUnlockedCases([]);
      }
    } catch (err) {
      console.error("Failed to load cases:", err);
    } finally {
      setLoading(false);
    }
  }

  const statusConfig: any = {
    pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Pending", color: "bg-orange-100 text-orange-700" },
    rejected: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Rejected", color: "bg-red-100 text-red-700" },
    approved: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Approved", color: "bg-green-100 text-green-700" },
    completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Completed", color: "bg-blue-100 text-blue-700" },
    expired: { icon: <CalendarClock className="h-3.5 w-3.5" />, label: "Expired", color: "bg-amber-100 text-amber-700" },
  };

  function CaseRow({ c, isHelping = false }: { c: any; isHelping?: boolean }) {
    const statusKey = isHelping ? c.helpStatus : c.status;
    const cfg = statusConfig[statusKey] ?? statusConfig.pending;
    const cur = c.currency || "USD";
    const s = sym(cur);
    const needed = Number(c.amount_needed ?? 0);
    const collected = Number(c.amount_collected ?? 0);
    const pct = needed > 0 ? Math.min(Math.round((collected / needed) * 100), 100) : 0;
    const isRejected = statusKey === "rejected";
    const isExpired = !isHelping && c.status === "expired";
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
              {isHelping && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.helpType === "contribution" ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"}`}>
                  {c.helpType === "contribution" ? "🤝 Contribution" : "🦸 Direct Help"}
                </span>
              )}
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

        {isHelping && isRejected && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Your help was not verified</p>
              <p className="text-xs text-red-600">Don't lose hope! Browse other cases and become a Hero.</p>
            </div>
          </div>
        )}

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

        <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => navigate({ to: "/cases/$id", params: { id: c.id } })}>
          {isHelping ? <Heart className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {isHelping && c.helpStatus === "completed" && c.affidavit_available ? "View Affidavit & Completed Help" : isHelping && c.helpStatus === "completed" ? "View Completed Case" : isHelping ? "Continue Helping" : "View Details"}
        </Button>
      </div>
    );
  }

  // Helper to filter cases by status for My Cases (case-insensitive)
  const filteredMyCases = myCases.filter(c => {
    const status = String(c.status || "").toLowerCase();
    if (myCaseStatusFilter === "approved") {
      return status === "approved" || status === "published";
    }
    return status === myCaseStatusFilter;
  });

  // Helper to filter unlocked cases by type and status for My Help
  const filteredHelpCases = unlockedCases.filter(c => {
    const typeMatch = c.helpType === helpTypeFilter;
    const status = String(c.helpStatus || "").toLowerCase();
    let statusMatch = false;
    if (helpStatusFilter === "approved") {
      statusMatch = status === "approved" || status === "published" || status === "completed";
    } else {
      statusMatch = status === helpStatusFilter;
    }
    return typeMatch && statusMatch;
  });

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
          <Tabs defaultValue="mycases" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="mycases" className="flex-1">My Cases ({myCases.length})</TabsTrigger>
              <TabsTrigger value="myhelp" className="flex-1">My Help ({unlockedCases.length})</TabsTrigger>
            </TabsList>

            {/* ===== MY CASES TAB ===== */}
            <TabsContent value="mycases" className="space-y-4 mt-4">
              <Tabs value={myCaseStatusFilter} onValueChange={setMyCaseStatusFilter} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>

              {filteredMyCases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No {myCaseStatusFilter} cases.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMyCases.map(c => <CaseRow key={c.id} c={c} />)}
                </div>
              )}
            </TabsContent>

            {/* ===== MY HELP TAB ===== */}
            <TabsContent value="myhelp" className="space-y-4 mt-4">
              <Tabs value={helpTypeFilter} onValueChange={(val) => { setHelpTypeFilter(val); setHelpStatusFilter("pending"); }} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="contribution">🤝 Contribution</TabsTrigger>
                  <TabsTrigger value="direct">🦸 Direct Help</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs value={helpStatusFilter} onValueChange={setHelpStatusFilter} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>

              {filteredHelpCases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No {helpStatusFilter} {helpTypeFilter === "contribution" ? "contributions" : "direct helps"}.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHelpCases.map(c => <CaseRow key={c.id} c={c} isHelping />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
