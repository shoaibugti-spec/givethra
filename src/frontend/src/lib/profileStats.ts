// src/frontend/src/lib/profileStats.ts
// Shared stat-computation helpers for ProfilePage (Hero view + Requester view).
//
// Verified against:
//   - lib/api.ts        → getCasesByUser, getCaseUnlocksByHero, getCaseResolutionsByHero
//   - lib/resolutionStatus.ts → isTrulyCompletedHelp, isContributionResolution
//
// 🔥 FIXED (this pass):
// 1. totalUnlocks / activeUnlocked now only count real "help" unlocks
//    (payment_type "full" or "partial"). A "media" unlock (paying 1 credit
//    just to view the verification selfie/video, via getCaseUnlock's
//    payment_type param in api.ts) is not a help-unlock and was inflating
//    the Hero's "Total Unlocks" counter before this fix.
//
// 2. totalHelpReceived (Requester stat) now falls back to the case's
//    amount_needed when amount_collected is missing/zero. Direct-payment
//    cases (one Hero pays the full bill at once) don't always update
//    amount_collected on the case row the way fundraising contributions do,
//    so relying on amount_collected alone under-reported (often to $0) the
//    money a requester actually received once their case was completed.
//
// 3. totalApproved now also counts cases whose status is "published" or
//    "active", not just literally "approved". getCasesByUser returns the
//    raw case row from the backend, and MyCasesPage.tsx already treats
//    "approved" and "published" as the same bucket for a requester's own
//    dashboard — this keeps ProfilePage's count consistent with that page
//    instead of silently under-counting approved-but-not-yet-completed cases.

import { isContributionResolution, isTrulyCompletedHelp } from "./resolutionStatus";

export interface HeroStats {
  totalUnlocks: number;
  directHelps: number;
  contributions: number;
  totalAmountHelped: number;
  amountByCurrency: Record<string, number>;
  activeUnlocked: number;
}

export interface RequesterStats {
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  totalCompleted: number;
  totalExpired: number;
  totalHelpReceived: number;
  helpByCurrency: Record<string, number>;
}

// Unlock rows can have payment_type "full", "partial", or "media"
// (see getCaseUnlock / insertCaseUnlock in lib/api.ts). Only "full" and
// "partial" represent a Hero actually stepping up to help — "media" is
// just a paid peek at the verification selfie/video.
function isHelpUnlock(unlock: any): boolean {
  const type = String(unlock?.payment_type || "").toLowerCase();
  return type === "full" || type === "partial";
}

// Cases can sit in an "approved" state under more than one literal string
// depending on where in the pipeline they are (see MyCasesPage.tsx and
// CaseDetailPage.tsx's isPublishedCase check) — treat all of them as
// "approved" for the requester's stat card.
function isApprovedCaseStatus(status: string): boolean {
  return status === "approved" || status === "published" || status === "active";
}

export function computeHeroStats(unlocks: any[] = [], resolutions: any[] = []): HeroStats {
  const safeUnlocks = Array.isArray(unlocks) ? unlocks : [];
  const safeResolutions = Array.isArray(resolutions) ? resolutions : [];

  const completedResolutions = safeResolutions.filter(isTrulyCompletedHelp);
  const resolvedCaseIds = new Set(completedResolutions.map((resolution) => String(resolution.case_id)));
  const helpCaseIds = new Set([
    ...safeUnlocks
      .filter((unlock) => isHelpUnlock(unlock) || resolvedCaseIds.has(String(unlock?.case_id)))
      .map((unlock) => String(unlock.case_id)),
    ...completedResolutions.map((resolution) => String(resolution.case_id)),
  ].filter((caseId) => caseId && caseId !== "undefined"));

  let directHelps = 0;
  let contributions = 0;
  let totalAmountHelped = 0;
  const amountByCurrency: Record<string, number> = {};
  const unlockAmountByCase = new Map<string, { amount: number; currency: string }>();
  for (const unlock of safeUnlocks) {
    const caseId = String(unlock?.case_id || "");
    const amount = Number(unlock?.pledged_amount ?? 0) || 0;
    if (caseId && amount > 0 && !unlockAmountByCase.has(caseId)) {
      unlockAmountByCase.set(caseId, { amount, currency: String(unlock?.currency || "USD").toUpperCase() });
    }
  }

  for (const resolution of completedResolutions) {
    const fallback = unlockAmountByCase.get(String(resolution.case_id));
    const amount = Number(resolution.seeker_confirmed_amount ?? resolution.amount_paid ?? fallback?.amount ?? 0) || 0;
    const currency = String(resolution.currency || resolution.case_currency || fallback?.currency || "USD").toUpperCase();
    totalAmountHelped += amount;
    amountByCurrency[currency] = (amountByCurrency[currency] || 0) + amount;
    if (isContributionResolution(resolution)) contributions += 1;
    else directHelps += 1;
  }

  return {
    totalUnlocks: helpCaseIds.size,
    directHelps,
    contributions,
    totalAmountHelped,
    amountByCurrency,
    activeUnlocked: [...helpCaseIds].filter((caseId) => !resolvedCaseIds.has(caseId)).length,
  };
}

export function computeRequesterStats(cases: any[] = []): RequesterStats {
  const safeCases = Array.isArray(cases) ? cases : [];
  const norm = (item: any) => String(item?.status || "pending").trim().toLowerCase();
  const completedCases = safeCases.filter((item) => norm(item) === "completed");

  const helpByCurrency: Record<string, number> = {};
  const totalHelpReceived = completedCases.reduce((sum, item) => {
    const collected = Number(item?.amount_collected ?? 0) || 0;
    const needed = Number(item?.amount_needed ?? 0) || 0;
    // A completed case means the full need was met — use whichever value is
    // actually populated, preferring amount_collected but falling back to
    // amount_needed so direct-payment cases (which may not update
    // amount_collected) still count correctly.
    const receivedForCase = collected > 0 ? collected : needed;
    const currency = String(item?.currency || "PKR").toUpperCase();
    helpByCurrency[currency] = (helpByCurrency[currency] || 0) + receivedForCase;
    return sum + receivedForCase;
  }, 0);

  return {
    totalSubmitted: safeCases.length,
    totalApproved: safeCases.filter((item) => isApprovedCaseStatus(norm(item))).length,
    totalRejected: safeCases.filter((item) => norm(item) === "rejected").length,
    totalCompleted: completedCases.length,
    totalExpired: safeCases.filter((item) => norm(item) === "expired").length,
    totalHelpReceived,
    helpByCurrency,
  };
}
