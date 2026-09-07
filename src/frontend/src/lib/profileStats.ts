// src/frontend/src/lib/profileStats.ts
// Shared stat-computation helpers for ProfilePage (Hero view + Requester view).
//
// 🔥 FIXED (this pass):
// 1. totalUnlocks / activeUnlocked now only count real "help" unlocks
//    (payment_type "full" or "partial"). A "media" unlock (paying 1 credit
//    just to view the verification selfie/video) is not a help-unlock and
//    was inflating the Hero's "Total Unlocks" counter before this fix.
// 2. totalHelpReceived (Requester stat) now falls back to the case's
//    amount_needed when amount_collected is missing/zero. Direct-payment
//    cases (one Hero pays the full bill at once) don't always update
//    amount_collected on the case row the way fundraising contributions do,
//    so relying on amount_collected alone under-reported (often to $0) the
//    money a requester actually received once their case was completed.

import { isContributionResolution, isTrulyCompletedHelp } from "./resolutionStatus";

export interface HeroStats {
  totalUnlocks: number;
  directHelps: number;
  contributions: number;
  totalAmountHelped: number;
  activeUnlocked: number;
}

export interface RequesterStats {
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  totalCompleted: number;
  totalExpired: number;
  totalHelpReceived: number;
}

// Unlock rows can have payment_type "full", "partial", or "media".
// Only "full" and "partial" represent a Hero actually stepping up to help —
// "media" is just a paid peek at the verification selfie/video.
function isHelpUnlock(unlock: any): boolean {
  const type = String(unlock?.payment_type || "").toLowerCase();
  return type === "full" || type === "partial";
}

export function computeHeroStats(unlocks: any[] = [], resolutions: any[] = []): HeroStats {
  const safeUnlocks = Array.isArray(unlocks) ? unlocks : [];
  const safeResolutions = Array.isArray(resolutions) ? resolutions : [];

  const helpUnlocks = safeUnlocks.filter(isHelpUnlock);

  const completedResolutions = safeResolutions.filter(isTrulyCompletedHelp);
  const resolvedCaseIds = new Set(completedResolutions.map((resolution) => String(resolution.case_id)));

  let directHelps = 0;
  let contributions = 0;
  let totalAmountHelped = 0;

  for (const resolution of completedResolutions) {
    totalAmountHelped += Number(resolution.seeker_confirmed_amount ?? resolution.amount_paid ?? 0) || 0;
    if (isContributionResolution(resolution)) contributions += 1;
    else directHelps += 1;
  }

  return {
    totalUnlocks: helpUnlocks.length,
    directHelps,
    contributions,
    totalAmountHelped,
    activeUnlocked: helpUnlocks.filter((unlock) => !resolvedCaseIds.has(String(unlock.case_id))).length,
  };
}

export function computeRequesterStats(cases: any[] = []): RequesterStats {
  const safeCases = Array.isArray(cases) ? cases : [];
  const norm = (item: any) => String(item?.status || "pending").trim().toLowerCase();
  const completedCases = safeCases.filter((item) => norm(item) === "completed");

  const totalHelpReceived = completedCases.reduce((sum, item) => {
    const collected = Number(item?.amount_collected ?? 0) || 0;
    const needed = Number(item?.amount_needed ?? 0) || 0;
    // A completed case means the full need was met — use whichever value is
    // actually populated, preferring amount_collected but falling back to
    // amount_needed so direct-payment cases (which may not update
    // amount_collected) still count correctly.
    const receivedForCase = collected > 0 ? collected : needed;
    return sum + receivedForCase;
  }, 0);

  return {
    totalSubmitted: safeCases.length,
    totalApproved: safeCases.filter((item) => norm(item) === "approved").length,
    totalRejected: safeCases.filter((item) => norm(item) === "rejected").length,
    totalCompleted: completedCases.length,
    totalExpired: safeCases.filter((item) => norm(item) === "expired").length,
    totalHelpReceived,
  };
}
