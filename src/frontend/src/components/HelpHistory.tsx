// src/frontend/src/components/HelpHistory.tsx
// The whole "help history" UI (filters + cards + empty states), shared by
// MyHelpPage and the "My Help" tab inside MyCasesPage.

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  HandCoins,
  HeartHandshake,
  MapPin,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterTabs from "@/components/FilterTabs";
import type { FilterOption } from "@/components/FilterTabs";
import { sym } from "@/lib/helpRecords";
import type { HelpRecord, HelpStatus, HelpType } from "@/lib/helpRecords";

const STATUS_CONFIG: Record<HelpStatus, { icon: ReactNode; label: string; color: string }> = {
  pending: { icon: <Clock className="h-3.5 w-3.5" />, label: "Pending", color: "bg-orange-100 text-orange-700" },
  rejected: { icon: <XCircle className="h-3.5 w-3.5" />, label: "Rejected", color: "bg-red-100 text-red-700" },
  completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Completed", color: "bg-green-100 text-green-700" },
  expired: { icon: <CalendarClock className="h-3.5 w-3.5" />, label: "Expired", color: "bg-amber-100 text-amber-800" },
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

function outcomeMessage(r: HelpRecord): string {
  if (r.isUnlockOnly) {
    return "🤲 Newborn Hero — you unlocked this case and took the first step toward helping.";
  }
  if (r.status === "expired") {
    return "This case expired after your verified contribution. Your contribution record, payment proof, and affidavit remain available here.";
  }
  if (r.status === "completed") {
    return r.type === "contribution"
      ? "🌱 Young Hero — your contribution joined other kind hearts and helped complete this case. May Allah accept your share."
      : "🦸 Hero — you completed direct help and brought real relief to this family. May Allah reward your generosity.";
  }
  if (r.status === "pending") {
    return "⏳ Your help is waiting for verification. This will update once it is confirmed.";
  }
  return "";
}

// ---------------------------------------------------------------------------
// One record card
// ---------------------------------------------------------------------------
function HelpRecordCard({ record }: { record: HelpRecord }) {
  const navigate = useNavigate();
  const cfg = STATUS_CONFIG[record.status] ?? STATUS_CONFIG.pending;
  const s = sym(record.currency);
  const { status, isUnlockOnly } = record;

  const hasProof = !isUnlockOnly && (status === "completed" || status === "expired");
  const message = outcomeMessage(record);
  const date = formatDate(record.completedAt);
  const place = [record.caseCity, record.caseCountry].filter(Boolean).join(", ");

  const tone =
    status === "rejected" && !isUnlockOnly
      ? "border-red-300 bg-red-50/50 dark:bg-red-950/10"
      : status === "expired"
      ? "border-amber-300 bg-amber-50/50"
      : status === "completed"
      ? "border-green-300 bg-green-50/50 dark:bg-green-950/10"
      : "bg-card";

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${tone}`}>
      <div className="space-y-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {record.type === "contribution" ? "🤝 Contribution" : "🦸 Direct Help"}
          </span>
          {isUnlockOnly && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">🔓 Unlock Only</span>
          )}
        </div>

        <p className="font-semibold text-sm break-words">{record.caseTitle}</p>
        {message && <p className="text-xs leading-relaxed text-teal-700 dark:text-teal-300">{message}</p>}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {record.caseCategory && <span>{record.caseCategory}</span>}
          {place && (
            <span className="flex items-center gap-0.5">
              <MapPin className="h-3 w-3" /> {place}
            </span>
          )}
          {record.amount > 0 && (
            <span className="font-medium text-foreground">
              {s} {record.amount.toLocaleString()} {record.currency}
            </span>
          )}
        </div>

        {record.transactionId && record.transactionId !== "N/A" && (
          <p className="text-xs text-muted-foreground">
            TXN: <span className="font-mono">{record.transactionId}</span>
          </p>
        )}
        {date && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {date}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {hasProof && (
          <Button
            size="sm"
            className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
            onClick={() => navigate({ to: "/affidavit/$caseId", params: { caseId: record.caseId } })}
          >
            <FileText className="h-3.5 w-3.5" /> View Affidavit
          </Button>
        )}
        {hasProof && record.receiptUrl && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 min-w-[120px]"
            onClick={() => navigate({ to: "/payment-proof/$caseId", params: { caseId: record.caseId } })}
          >
            <HandCoins className="h-3.5 w-3.5" /> Payment Proof
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-1.5 min-w-[100px]"
          onClick={() => navigate({ to: "/cases/$id", params: { id: record.caseId } })}
        >
          <Eye className="h-3.5 w-3.5" /> View Case
        </Button>
      </div>

      {status === "rejected" && !isUnlockOnly && (
        <div className="rounded-lg bg-red-100 dark:bg-red-950/30 p-2 text-xs text-red-700 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          This help was not verified. You can try helping again on another case.
        </div>
      )}

      {isUnlockOnly && record.caseCompletedByOther && (
        <div className="rounded-lg bg-blue-100 dark:bg-blue-950/30 p-2 text-xs text-blue-700 space-y-2">
          <p>
            🙏 This case has been completed — someone else helped to complete it. Your unlock was also part of this
            journey, thank you! Find a new case and become a complete Hero.
          </p>
          <Button size="sm" variant="outline" onClick={() => navigate({ to: "/cases" })}>
            Browse More Cases
          </Button>
        </div>
      )}
      {isUnlockOnly && !record.caseCompletedByOther && (
        <div className="rounded-lg bg-amber-100 dark:bg-amber-950/30 p-2 text-xs text-amber-700">
          💪 You unlocked this case but didn't complete a payment. Browse more cases and become a full Hero!
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filters + list
// ---------------------------------------------------------------------------
export default function HelpHistory({ records }: { records: HelpRecord[] }) {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<"all" | HelpType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | HelpStatus>("all");

  const typeCounts = useMemo(
    () => ({
      all: records.length,
      contribution: records.filter((r) => r.type === "contribution").length,
      direct: records.filter((r) => r.type === "direct").length,
    }),
    [records]
  );

  // Status counts respect the selected type, so numbers always match what you will see.
  const statusCounts = useMemo(() => {
    const base = typeFilter === "all" ? records : records.filter((r) => r.type === typeFilter);
    return {
      all: base.length,
      pending: base.filter((r) => r.status === "pending").length,
      completed: base.filter((r) => r.status === "completed").length,
      rejected: base.filter((r) => r.status === "rejected").length,
      expired: base.filter((r) => r.status === "expired").length,
    };
  }, [records, typeFilter]);

  const filtered = useMemo(
    () =>
      records.filter(
        (r) => (typeFilter === "all" || r.type === typeFilter) && (statusFilter === "all" || r.status === statusFilter)
      ),
    [records, typeFilter, statusFilter]
  );

  if (records.length === 0) {
    return (
      <div className="text-center py-14 rounded-xl border border-dashed bg-muted/20">
        <HeartHandshake className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
        <p className="font-semibold">You haven't helped anyone yet.</p>
        <p className="text-sm text-muted-foreground mt-1">Browse cases and become a Hero today!</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/cases" })}>
          Browse Cases
        </Button>
      </div>
    );
  }

  const typeOptions: FilterOption<"all" | HelpType>[] = [
    { value: "all", label: "All", count: typeCounts.all },
    { value: "contribution", label: "🤝 Contribution", count: typeCounts.contribution },
    { value: "direct", label: "🦸 Direct", count: typeCounts.direct },
  ];
  const statusOptions: FilterOption<"all" | HelpStatus>[] = [
    { value: "all", label: "All Status", count: statusCounts.all },
    { value: "pending", label: "Pending", count: statusCounts.pending },
    { value: "completed", label: "Completed", count: statusCounts.completed },
    { value: "rejected", label: "Rejected", count: statusCounts.rejected },
    { value: "expired", label: "Expired", count: statusCounts.expired },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FilterTabs ariaLabel="Help type" value={typeFilter} onChange={setTypeFilter} options={typeOptions} />
        <FilterTabs ariaLabel="Help status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>
            No {typeFilter !== "all" ? `${typeFilter} ` : ""}
            {statusFilter !== "all" ? `${statusFilter} ` : ""}records found.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setTypeFilter("all");
              setStatusFilter("all");
            }}
          >
            Show all
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <HelpRecordCard key={r.id} record={r} />
          ))}
        </div>
      )}
    </div>
  );
}
