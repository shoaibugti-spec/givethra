// src/frontend/src/pages/MyCasesPage.tsx
// My Cases + My Help tabs. Tabs no longer overlap (scrollable pills), and the My Help tab
// uses the same shared data/UI as MyHelpPage.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Plus,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import FilterTabs from "@/components/FilterTabs";
import type { FilterOption } from "@/components/FilterTabs";
import HelpHistory from "@/components/HelpHistory";
import { getCasesByUser } from "@/lib/api";
import { sym, useHelpRecords, useRefreshOnReturn } from "@/lib/helpRecords";
import { isCasePastDeadline, isExpiredCaseRecord } from "@/lib/caseExpiry";

// ---------------------------------------------------------------------------
// Case status helpers
// ---------------------------------------------------------------------------
type CaseFilter = "all" | "pending" | "rejected" | "approved" | "completed" | "expired";
type CaseBucket = Exclude<CaseFilter, "all">;

const PUBLISHED_STATUSES = ["approved", "published", "active", "open", "in_progress"];

const CASE_STATUS_CONFIG: Record<CaseBucket, { icon: ReactNode; label: string; color: string }> = {
  pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Pending", color: "bg-orange-100 text-orange-700" },
  rejected: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Rejected", color: "bg-red-100 text-red-700" },
  approved: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Approved", color: "bg-green-100 text-green-700" },
  completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Completed", color: "bg-blue-100 text-blue-700" },
  expired: { icon: <CalendarClock className="h-3.5 w-3.5" />, label: "Expired", color: "bg-amber-100 text-amber-700" },
};

function displayCaseStatus(c: any, utcToday: any): string {
  const status = String(c?.status || "").toLowerCase();
  if (isExpiredCaseRecord(c, utcToday)) return "expired";
  if (PUBLISHED_STATUSES.includes(status) && isCasePastDeadline(c?.deadline, utcToday)) return "expired";
  return status;
}

function caseBucket(status: string): CaseBucket | null {
  if (PUBLISHED_STATUSES.includes(status)) return "approved";
  if (status === "pending" || status === "rejected" || status === "completed" || status === "expired") {
    return status as CaseBucket;
  }
  return null;
}

// ---------------------------------------------------------------------------
// One case card
// ---------------------------------------------------------------------------
function CaseRow({ c }: { c: any }) {
  const navigate = useNavigate();
  const bucket: CaseBucket = c.bucket ?? "pending";
  const cfg = CASE_STATUS_CONFIG[bucket];
  const cur = c.currency || "USD";
  const s = sym(cur);
  const needed = Number(c.amount_needed ?? 0);
  const collected = Number(c.amount_collected ?? 0);
  const pct = needed > 0 ? Math.min(Math.round((collected / needed) * 100), 100) : 0;
  const isRejected = bucket === "rejected";
  const isExpired = bucket === "expired";
  const place = [c.city, c.country].filter(Boolean).join(", ");

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        isRejected ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : isExpired ? "border-amber-300 bg-amber-50/50" : "bg-card"
      }`}
    >
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
          {c.category && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>}
        </div>
        <p className="font-semibold break-words">{c.title}</p>
        <p className="text-xs text-muted-foreground">
          {place && <>📍 {place}</>}
          {place && needed > 0 && " · "}
          {needed > 0 && `${s} ${needed.toLocaleString()} ${cur}`}
        </p>
      </div>

      {needed > 0 && !isRejected && !isExpired && (
        <div className="space-y-1">
          <div className="flex justify-between gap-2 text-[11px] font-medium">
            <span className="text-green-600">
              {s} {collected.toLocaleString()} settled
            </span>
            <span className="text-muted-foreground">
              {pct}% · {s} {Math.max(needed - collected, 0).toLocaleString()} left
            </span>
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

      {isExpired && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          {collected > 0 ? (
            <>
              <p className="font-semibold">
                Expired · verified help recorded: {s} {collected.toLocaleString()} {cur}
              </p>
              <p className="mt-1 text-xs">Open case details to view any payment proof or affidavit available for confirmed help.</p>
            </>
          ) : (
            <>
              <p className="font-semibold">
                Expired with no confirmed help · {s} 0 {cur}
              </p>
              <p className="mt-1 text-xs">You can submit a new request so Heroes can try to help.</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full gap-1.5"
                onClick={() => navigate({ to: "/submit-request" })}
              >
                <Plus className="h-3.5 w-3.5" /> Submit a new request
              </Button>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(bucket === "completed" || (isExpired && collected > 0)) && (
          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
            onClick={() => navigate({ to: "/affidavit/$caseId", params: { caseId: c.id } })}
          >
            <FileText className="h-3.5 w-3.5" /> View Affidavit
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 min-w-[120px]"
          onClick={() => navigate({ to: "/cases/$id", params: { id: c.id } })}
        >
          <Eye className="h-3.5 w-3.5" /> View Details
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function MyCasesPage() {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"mycases" | "myhelp">("mycases");
  const [caseFilter, setCaseFilter] = useState<CaseFilter>("all");

  const [myCases, setMyCases] = useState<any[]>([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const casesReq = useRef(0);

  // Help history (shared with MyHelpPage). Also gives us the live "today" used for expiry.
  const help = useHelpRecords(user?.id, isAuthenticated);
  const utcToday = help.utcToday;

  const loadCases = useCallback(
    async (silent = false) => {
      if (!user?.id) return;
      const id = ++casesReq.current;
      if (!silent) setCasesLoading(true);
      try {
        const cases = await getCasesByUser(user.id);
        if (id !== casesReq.current) return;
        setMyCases(
          (Array.isArray(cases) ? cases : []).map((c: any) => ({
            ...c,
            status: String(c?.status || "pending").toLowerCase(),
          }))
        );
      } catch (err) {
        console.error("Failed to load cases:", err);
        if (id === casesReq.current && !silent) toast.error("Could not load your cases.");
      } finally {
        if (id === casesReq.current) setCasesLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    loadCases();
  }, [isAuthenticated, isInitializing, loadCases]);

  useRefreshOnReturn(() => {
    if (isAuthenticated) loadCases(true);
  });

  // Cases with their live status + the tab (bucket) they belong to.
  const casesWithStatus = useMemo(
    () =>
      myCases.map((c) => {
        const status = displayCaseStatus(c, utcToday);
        return { ...c, status, bucket: caseBucket(status) };
      }),
    [myCases, utcToday]
  );

  const caseCounts = useMemo(() => {
    const counts: Record<CaseFilter, number> = {
      all: casesWithStatus.length,
      pending: 0,
      rejected: 0,
      approved: 0,
      completed: 0,
      expired: 0,
    };
    casesWithStatus.forEach((c) => {
      if (c.bucket) counts[c.bucket as CaseBucket] += 1;
    });
    return counts;
  }, [casesWithStatus]);

  const filteredCases = useMemo(
    () => (caseFilter === "all" ? casesWithStatus : casesWithStatus.filter((c) => c.bucket === caseFilter)),
    [casesWithStatus, caseFilter]
  );

  const mainTabs: FilterOption<"mycases" | "myhelp">[] = [
    { value: "mycases", label: "My Cases", count: casesLoading ? undefined : myCases.length },
    { value: "myhelp", label: "My Help", count: help.loading ? undefined : help.records.length },
  ];

  const caseTabs: FilterOption<CaseFilter>[] = [
    { value: "all", label: "All", count: caseCounts.all },
    { value: "pending", label: "Pending", count: caseCounts.pending },
    { value: "rejected", label: "Rejected", count: caseCounts.rejected },
    { value: "approved", label: "Approved", count: caseCounts.approved },
    { value: "completed", label: "Completed", count: caseCounts.completed },
    { value: "expired", label: "Expired", count: caseCounts.expired },
  ];

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="h-6 w-6 text-primary shrink-0" />
            <h1 className="text-2xl font-bold truncate">My Cases</h1>
          </div>
          <Button size="sm" onClick={() => navigate({ to: "/submit-request" })} className="gap-1.5 shrink-0">
            <Plus className="h-4 w-4" /> New Case
          </Button>
        </div>

        <FilterTabs ariaLabel="My Cases or My Help" value={activeTab} onChange={setActiveTab} options={mainTabs} />

        {/* ---------- My Cases ---------- */}
        {activeTab === "mycases" && (
          <div className="space-y-4">
            {casesLoading ? (
              <div className="text-center py-20 text-muted-foreground">Loading...</div>
            ) : (
              <>
                <FilterTabs ariaLabel="Case status" value={caseFilter} onChange={setCaseFilter} options={caseTabs} />

                {filteredCases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{caseFilter === "all" ? "You haven't submitted any cases yet." : `No ${caseFilter} cases.`}</p>
                    {myCases.length === 0 ? (
                      <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => navigate({ to: "/submit-request" })}>
                        <Plus className="h-3.5 w-3.5" /> Submit your first case
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => setCaseFilter("all")}>
                        Show all cases
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCases.map((c) => (
                      <CaseRow key={c.id} c={c} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ---------- My Help ---------- */}
        {activeTab === "myhelp" &&
          (help.loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading your help history...</div>
          ) : (
            <HelpHistory records={help.records} />
          ))}
      </div>
    </Layout>
  );
}
