// src/frontend/src/lib/helpRecords.ts
// Shared "My Help" data layer. Used by BOTH MyCasesPage (My Help tab) and MyHelpPage,
// so the two screens always show the same records, counts and statuses.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  getCaseResolutionsByHero,
  getCaseUnlocksByHero,
  getCasesByIds,
} from "@/lib/api";
import {
  isTrulyCompletedHelp,
  isContributionResolution,
  resolutionDisplayStatus,
} from "@/lib/resolutionStatus";
import { getCaseCalendarDate, isExpiredCaseRecord } from "@/lib/caseExpiry";
import {
  getAdminDirectEvidence,
  isRejectedResolution,
  resolutionAmount,
  resolutionReceiptUrl,
  resolutionTransactionId,
} from "@/lib/affidavit";

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹",
};

export function sym(cur?: string) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type HelpType = "contribution" | "direct";
export type HelpStatus = "pending" | "completed" | "rejected" | "expired";

export type HelpRecord = {
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
  type: HelpType;
  status: HelpStatus;
  isApproved: boolean;
  completedAt: string | null;
  /** Hero unlocked the case but has no payment of their own. */
  isUnlockOnly: boolean;
  /** Unlock-only, and the case was completed by someone else. */
  caseCompletedByOther: boolean;
};

type UserId = Parameters<typeof getCaseResolutionsByHero>[0];
type CalendarDate = ReturnType<typeof getCaseCalendarDate>;

export type HeroHelpData = {
  resolutions: any[];
  unlocks: any[];
  caseMap: Record<string, any>;
};

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------
export async function fetchHeroHelpData(userId: UserId): Promise<HeroHelpData> {
  const [resolutionsResult, unlocksResult] = await Promise.all([
    getCaseResolutionsByHero(userId),
    getCaseUnlocksByHero(userId),
  ]);
  const resolutions = Array.isArray(resolutionsResult) ? resolutionsResult : [];
  const unlocks = Array.isArray(unlocksResult) ? unlocksResult : [];

  const caseIds = Array.from(
    new Set([
      ...resolutions.map((r: any) => String(r?.case_id || "")).filter(Boolean),
      ...unlocks.map((u: any) => String(u?.case_id || "")).filter(Boolean),
    ])
  );

  const caseMap: Record<string, any> = {};
  if (caseIds.length > 0) {
    const casesData = await getCasesByIds(caseIds);
    (Array.isArray(casesData) ? casesData : []).forEach((c: any) => {
      if (c?.id) caseMap[String(c.id)] = c;
    });
  }

  return { resolutions, unlocks, caseMap };
}

// ---------------------------------------------------------------------------
// Building display records
// ---------------------------------------------------------------------------
function normalizeStatus(value: unknown): HelpStatus {
  const s = String(value || "").trim().toLowerCase();
  return s === "completed" || s === "rejected" || s === "expired" ? (s as HelpStatus) : "pending";
}

export function buildHelpRecords(data: HeroHelpData, utcToday: CalendarDate): HelpRecord[] {
  const records: HelpRecord[] = [];

  // ---- Resolutions (contribution + direct help with payment proof) ----
  for (const resolution of data.resolutions) {
    const caseId = String(resolution?.case_id || "");
    if (!caseId) continue;

    const caseRecord: any = data.caseMap[caseId] ?? {
      id: caseId,
      title: resolution.case_title || "Unknown case",
      category: resolution.case_category || "Other",
      country: resolution.case_country || "",
      city: resolution.case_city || "",
      currency: resolution.case_currency || resolution.currency || "PKR",
      amount_needed: resolution.amount_paid || 0,
    };

    const rawStatus = String(resolution?.status || "").trim().toLowerCase();
    const wasRejected = isRejectedResolution(resolution);
    const isContribution = isContributionResolution(resolution);
    const caseCompleted = String(caseRecord.status || "").toLowerCase() === "completed";

    // A rejected resolution can never count as approved. A contribution only counts once
    // this hero's own proof is verified; direct help may also be closed by admin on the case.
    const isApproved =
      !wasRejected &&
      (isTrulyCompletedHelp(resolution) ||
        rawStatus === "completed" ||
        (!isContribution && caseCompleted));

    const isExpired = isContribution && isApproved && isExpiredCaseRecord(caseRecord, utcToday);

    const status: HelpStatus = isExpired
      ? "expired"
      : isApproved
      ? "completed"
      : wasRejected
      ? "rejected"
      : normalizeStatus(resolutionDisplayStatus(resolution as any));

    records.push({
      id: `res-${resolution.id}`,
      caseId,
      caseTitle: caseRecord.title || "Unknown case",
      caseCategory: caseRecord.category || "Other",
      caseCity: caseRecord.city || "",
      caseCountry: caseRecord.country || "",
      currency: isContribution
        ? resolution.case_contribution_currency || caseRecord.currency || "PKR"
        : caseRecord.currency || "PKR",
      amount: resolutionAmount(resolution, isContribution, caseRecord),
      transactionId: String(resolutionTransactionId(resolution, caseRecord)),
      receiptUrl: resolutionReceiptUrl(resolution, isContribution, caseRecord),
      type: isContribution ? "contribution" : "direct",
      status,
      isApproved,
      completedAt: resolution.completed_at || resolution.admin_confirmed_at || resolution.submitted_at || null,
      isUnlockOnly: false,
      caseCompletedByOther: false,
    });
  }

  // ---- Unlock-only records (hero has no resolution for that case) ----
  for (const unlock of data.unlocks) {
    const caseId = String(unlock?.case_id || "");
    if (!caseId) continue;
    if (data.resolutions.some((r: any) => String(r?.case_id) === caseId)) continue;

    const caseRecord: any = data.caseMap[caseId] ?? {
      id: caseId,
      title: "Unlocked case",
      category: "Other",
      currency: "PKR",
      status: "pending",
    };

    const isPartial = String(unlock.payment_type || "").toLowerCase() === "partial";
    const caseIsCompleted = String(caseRecord.status || "").toLowerCase() === "completed";

    // Some admin flows store verified direct-payment evidence on the case itself.
    // Only a full/direct unlock may use it; a contribution unlock stays unlock-only
    // until this hero submits their own proof.
    const { transactionId: adminTransactionId, receiptUrl: adminReceiptUrl, hasEvidence } =
      getAdminDirectEvidence(caseRecord);
    const hasVerifiedDirectPayment =
      !isPartial && caseIsCompleted && hasEvidence;

    records.push({
      id: `unlock-${unlock.id}`,
      caseId,
      caseTitle: caseRecord.title || "Unlocked case",
      caseCategory: caseRecord.category || "Other",
      caseCity: caseRecord.city || "",
      caseCountry: caseRecord.country || "",
      currency: caseRecord.currency || "PKR",
      amount: hasVerifiedDirectPayment
        ? Number(caseRecord.amount_collected || caseRecord.amount_needed || unlock.pledged_amount || 0)
        : Number(unlock.pledged_amount ?? 0),
      transactionId: hasVerifiedDirectPayment ? adminTransactionId : "",
      receiptUrl: hasVerifiedDirectPayment ? adminReceiptUrl : null,
      type: hasVerifiedDirectPayment ? "direct" : isPartial ? "contribution" : "direct",
      status: caseIsCompleted ? "completed" : "pending",
      isApproved: hasVerifiedDirectPayment,
      completedAt: hasVerifiedDirectPayment
        ? caseRecord.closed_at || caseRecord.reviewed_at || unlock.unlocked_at || null
        : unlock.unlocked_at || null,
      isUnlockOnly: !hasVerifiedDirectPayment,
      caseCompletedByOther: caseIsCompleted && !hasVerifiedDirectPayment,
    });
  }

  records.sort((a, b) => {
    const ta = a.completedAt ? new Date(a.completedAt).getTime() || 0 : 0;
    const tb = b.completedAt ? new Date(b.completedAt).getTime() || 0 : 0;
    return tb - ta;
  });

  return records;
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Calls `cb` when the user comes back to the tab/app (throttled). Works on mobile too. */
export function useRefreshOnReturn(cb: () => void, minGapMs = 5000) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  const lastRun = useRef(Date.now());

  useEffect(() => {
    const run = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRun.current < minGapMs) return;
      lastRun.current = now;
      cbRef.current();
    };
    window.addEventListener("focus", run);
    document.addEventListener("visibilitychange", run);
    return () => {
      window.removeEventListener("focus", run);
      document.removeEventListener("visibilitychange", run);
    };
  }, [minGapMs]);
}

/** Loads the hero's help history. `loading` is true only for the first load (no flicker on refresh). */
export function useHelpRecords(userId: UserId | undefined, active: boolean) {
  const [data, setData] = useState<HeroHelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [utcToday, setUtcToday] = useState(() => getCaseCalendarDate());
  const reqId = useRef(0);

  const refresh = useCallback(
    async (silent = false) => {
      if (!userId) return;
      const id = ++reqId.current;
      if (!silent) setLoading(true);
      try {
        const result = await fetchHeroHelpData(userId);
        if (id === reqId.current) setData(result);
      } catch (err) {
        console.error("Failed to load help records:", err);
        if (id === reqId.current && !silent) toast.error("Could not load your help history.");
      } finally {
        if (id === reqId.current) setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (active) refresh();
  }, [active, refresh]);

  useRefreshOnReturn(() => {
    if (active) refresh(true);
  });

  // Keeps "expired" status live without a reload (state only changes when the date changes).
  useEffect(() => {
    const timer = window.setInterval(() => setUtcToday(getCaseCalendarDate()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const records = useMemo(() => (data ? buildHelpRecords(data, utcToday) : []), [data, utcToday]);

  return { records, loading, utcToday, refresh };
}
