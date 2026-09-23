// src/frontend/src/pages/MyCasesPage.tsx
// Restored: My Help tab is back, using the shared resolutionStatus helpers.

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  ArrowRight,
  CalendarClock,
  AlertCircle,
  HeartHandshake,
  HandCoins,
  Unlock,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  getCasesByUser,
  getCaseUnlocksByHero,
  getCaseResolutionsByHero,
  getCasesByIds,
} from "@/lib/api";
import { isTrulyCompletedHelp, isContributionResolution } from "@/lib/resolutionStatus";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹",
};

function sym(cur?: string) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type HelpRecord = {
  id: string;
  caseId: string;
  caseTitle: string;
  caseCategory: string;
  caseCity: string;
  caseCountry: string;
  currency: string;
  amount: number;
  transactionId: string;
  receiptUrl: string | null;
  helpType: "contribution" | "direct" | "unlock";
  helpStatus: "completed" | "pending" | "rejected";
  isApproved: boolean;
  completedAt: string | null;
  hasAffidavit: boolean;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MyCasesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [myCases, setMyCases] = useState<any[]>([]);
  const [helpRecords, setHelpRecords] = useState<HelpRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"mycases" | "myhelp">("mycases");
  const [myCaseStatusFilter, setMyCaseStatusFilter] = useState("completed");
  const [helpTypeFilter, setHelpTypeFilter] = useState<"all" | "contribution" | "direct">("all");
  const [helpStatusFilter, setHelpStatusFilter] = useState<"all" | "pending" | "completed" | "rejected">("all");

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
      // --- My submitted cases ---
      const cases = await getCasesByUser(user.id);
      setMyCases(
        (Array.isArray(cases) ? cases : []).map((c: any) => ({
          ...c,
          status: String(c?.status || "pending").toLowerCase(),
        }))
      );

      // --- My help (unlocks + resolutions) ---
      const [unlocksResult, resolutionsResult] = await Promise.all([
        getCaseUnlocksByHero(user.id),
        getCaseResolutionsByHero(user.id),
      ]);
      const unlocks = Array.isArray(unlocksResult) ? unlocksResult : [];
      const resolutions = Array.isArray(resolutionsResult) ? resolutionsResult : [];

      const caseIds = Array.from(
        new Set([
          ...unlocks.map((u: any) => String(u.case_id || "")).filter(Boolean),
          ...resolutions.map((r: any) => String(r.case_id || "")).filter(Boolean),
        ])
      );

      let caseMap = new Map<string, any>();
      if (caseIds.length > 0) {
        const casesData = await getCasesByIds(caseIds);
        (Array.isArray(casesData) ? casesData : []).forEach((c: any) => {
          if (c?.id) caseMap.set(String(c.id), c);
        });
      }

      // Add fallback case records for resolutions
      resolutions.forEach((r: any) => {
        const cid = String(r.case_id || "");
        if (cid && !caseMap.has(cid)) {
          caseMap.set(cid, {
            id: cid,
            title: r.case_title || "Completed help",
            category: r.case_category || "Help",
            country: r.case_country || "",
            city: r.case_city || "",
            currency: r.case_currency || r.currency || "PKR",
            amount_needed: r.case_amount_needed || r.amount_paid || 0,
            amount_collected: r.case_amount_collected || r.amount_paid || 0,
            status: r.case_status || "completed",
          });
        }
      });

      const records: HelpRecord[] = [];

      // --- From resolutions (contributions + direct helps with payment proof) ---
      for (const resolution of resolutions) {
        const caseId = String(resolution.case_id || "");
        if (!caseId) continue;
        const c = caseMap.get(caseId);
        const isApproved = isTrulyCompletedHelp(resolution);
        const isContribution = isContributionResolution(resolution);
        const rawStatus = String(resolution.status || "").toLowerCase();
        const helpStatus: HelpRecord["helpStatus"] = isApproved
          ? "completed"
          : ["rejected", "disputed"].includes(rawStatus)
          ? "rejected"
          : "pending";

        records.push({
          id: `res-${resolution.id}`,
          caseId,
          caseTitle: c?.title || resolution.case_title || "Help",
          caseCategory: c?.category || resolution.case_category || "Help",
          caseCity: c?.city || resolution.case_city || "",
          caseCountry: c?.country || resolution.case_country || "",
          currency: c?.currency || resolution.case_currency || "PKR",
          amount: Number(
            resolution.seeker_confirmed_amount ??
              resolution.amount_paid ??
              resolution.amount ??
              0
          ),
          transactionId: resolution.transaction_id || "",
          receiptUrl: resolution.receipt_url || resolution.case_paid_receipt_url || null,
          helpType: isContribution ? "contribution" : "direct",
          helpStatus,
          isApproved,
          completedAt: resolution.completed_at || resolution.admin_confirmed_at || resolution.submitted_at || null,
          hasAffidavit: isApproved,
        });
      }

      // --- From unlock-only records (no resolution for that case) ---
      for (const unlock of unlocks) {
        const caseId = String(unlock.case_id || "");
        if (!caseId) continue;
        // Skip if there's already a resolution for this case from this hero
        if (resolutions.some((r: any) => String(r.case_id) === caseId && String(r.hero_id) === String(unlock.hero_id))) continue;

        const c = caseMap.get(caseId) || { id: caseId, title: "Unlocked case", category: "Other", currency: "PKR" };
        const isPartial = String(unlock.payment_type || "").toLowerCase() === "partial";
        const caseIsCompleted = String(c.status || "").toLowerCase() === "completed";

        records.push({
          id: `unlock-${unlock.id}`,
          caseId,
          caseTitle: c.title || "Unlocked case",
          caseCategory: c.category || "Other",
          caseCity: c.city || "",
          caseCountry: c.country || "",
          currency: c.currency || "PKR",
          amount: Number(unlock.pledged_amount ?? 0),
          transactionId: "",
          receiptUrl: null,
          helpType: isPartial ? "contribution" : "unlock",
          helpStatus: caseIsCompleted ? "completed" : "pending",
          isApproved: false,
          completedAt: unlock.unlocked_at || null,
          hasAffidavit: false,
        });
      }

      // Sort by completedAt (newest first)
      records.sort((a, b) => {
        const ta = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const tb = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return tb - ta;
      });

      setHelpRecords(records);
    } catch (err) {
      console.error("Failed to load cases dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Status config
  // ---------------------------------------------------------------------------
  const statusConfig: any = {
    pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Pending", color: "bg-orange-100 text-orange-700" },
    rejected: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Rejected", color: "bg-red-100 text-red-700" },
    approved: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Approved", color: "bg-green-100 text-green-700" },
    completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Completed", color: "bg-blue-100 text-blue-700" },
    expired: { icon: <CalendarClock className="h-3.5 w-3.5" />, label: "Expired", color: "bg-amber-100 text-amber-700" },
  };

  // ---------------------------------------------------------------------------
  // My Cases: individual row
  // ---------------------------------------------------------------------------
  function CaseRow({ c }: { c: any }) {
    const statusKey = c.status;
    const cfg = statusConfig[statusKey] ?? statusConfig.pending;
    const cur = c.currency || "USD";
    const s = sym(cur);
    const needed = Number(c.amount_needed ?? 0);
    const collected = Number(c.amount_collected ?? 0);
    const pct = needed > 0 ? Math.min(Math.round((collected / needed) * 100), 100) : 0;
    const isRejected = statusKey === "rejected";
    const isExpired = c.status === "expired";

    return (
      <div className={`rounded-xl border p-4 space-y-3 ${isRejected ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : isExpired ? "border-amber-300 bg-amber-50/50" : "bg-card"}`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>
          </div>
          <p className="font-semibold">{c.title}</p>
          <p className="text-xs text-muted-foreground">📍 {c.city}, {c.country} {needed > 0 && `· ${s} ${needed} ${cur}`}</p>
        </div>

        {needed > 0 && !isRejected && !isExpired && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-medium">
              <span className="text-green-600">{s} {collected} settled</span>
              <span className="text-muted-foreground">{pct}% · {s} {Math.max(needed - collected, 0)} left</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {isRejected && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Case Rejected</p>
              <p className="text-xs text-red-600">{c.rejection_reason || "No reason provided."}</p>
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => navigate({ to: "/cases/$id", params: { id: c.id } })}>
          <Eye className="h-3.5 w-3.5" /> View Details
        </Button>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // My Help: individual row
  // ---------------------------------------------------------------------------
  function HelpRow({ r }: { r: HelpRecord }) {
    const cfg = statusConfig[r.helpStatus] ?? statusConfig.pending;
    const s = sym(r.currency);
    const isCompleted = r.helpStatus === "completed";
    const isRejected = r.helpStatus === "rejected";
    const typeLabel = r.helpType === "contribution" ? "🤝 Contribution" : r.helpType === "unlock" ? "🔓 Unlock Only" : "🦸 Direct Help";

    return (
      <div className={`rounded-xl border p-4 space-y-3 ${isRejected ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : isCompleted ? "border-green-300 bg-green-50/50 dark:bg-green-950/10" : "bg-card"}`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
              {cfg.icon} {cfg.label}
            </span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{typeLabel}</span>
            {r.caseCategory && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{r.caseCategory}</span>}
          </div>
          <p className="font-semibold text-sm truncate">{r.caseTitle}</p>
          {(r.caseCity || r.caseCountry) && (
            <p className="text-xs text-muted-foreground">📍 {[r.caseCity, r.caseCountry].filter(Boolean).join(", ")}</p>
          )}
          {r.amount > 0 && (
            <p className="text-xs font-medium text-foreground">{s} {r.amount} {r.currency}</p>
          )}
          {r.transactionId && r.transactionId !== "N/A" && (
            <p className="text-xs text-muted-foreground">TXN: <span className="font-mono">{r.transactionId}</span></p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {isCompleted && r.hasAffidavit && (
            <Button
              size="sm"
              className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
              onClick={() => navigate({ to: "/affidavit/$caseId", params: { caseId: r.caseId } })}
            >
              <FileText className="h-3.5 w-3.5" /> View Affidavit
            </Button>
          )}
          {isCompleted && r.receiptUrl && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5 min-w-[120px]"
              onClick={() => navigate({ to: "/payment-proof/$caseId", params: { caseId: r.caseId } })}
            >
              <HandCoins className="h-3.5 w-3.5" /> Payment Proof
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 min-w-[100px]"
            onClick={() => navigate({ to: "/cases/$id", params: { id: r.caseId } })}
          >
            <Eye className="h-3.5 w-3.5" /> View Case
          </Button>
        </div>

        {r.helpType === "unlock" && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-700">
            🔓 You unlocked this case but did not complete a payment.
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Filtered lists
  // ---------------------------------------------------------------------------
  const filteredMyCases = myCases.filter((c) => {
    const status = String(c.status || "").toLowerCase();
    if (myCaseStatusFilter === "approved") {
      return ["approved", "published", "active", "open", "in_progress"].includes(status);
    }
    return status === myCaseStatusFilter;
  });

  const filteredHelpRecords = helpRecords.filter((r) => {
    if (helpTypeFilter !== "all" && r.helpType !== helpTypeFilter) return false;
    if (helpStatusFilter !== "all" && r.helpStatus !== helpStatusFilter) return false;
    return true;
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
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

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="mycases" className="flex-1">My Cases ({myCases.length})</TabsTrigger>
              <TabsTrigger value="myhelp" className="flex-1">My Help ({helpRecords.length})</TabsTrigger>
            </TabsList>

            {/* ---------- My Cases tab ---------- */}
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
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => navigate({ to: "/submit-request" })}>
                    <Plus className="h-3.5 w-3.5" /> Submit your first case
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">{filteredMyCases.map((c) => <CaseRow key={c.id} c={c} />)}</div>
              )}
            </TabsContent>

            {/* ---------- My Help tab ---------- */}
            <TabsContent value="myhelp" className="space-y-4 mt-4">
              <Tabs value={helpTypeFilter} onValueChange={(v) => setHelpTypeFilter(v as any)} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">All Types</TabsTrigger>
                  <TabsTrigger value="contribution">🤝 Contribution</TabsTrigger>
                  <TabsTrigger value="direct">🦸 Direct Help</TabsTrigger>
                </TabsList>
              </Tabs>

              <Tabs value={helpStatusFilter} onValueChange={(v) => setHelpStatusFilter(v as any)} className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">All Status</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>

              {filteredHelpRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No {helpTypeFilter !== "all" ? `${helpTypeFilter} ` : ""}{helpStatusFilter !== "all" ? `${helpStatusFilter} ` : ""}records.</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => navigate({ to: "/cases" })}>
                    <HeartHandshake className="h-3.5 w-3.5" /> Browse cases to help
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">{filteredHelpRecords.map((r) => <HelpRow key={r.id} r={r} />)}</div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}
