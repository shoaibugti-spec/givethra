// src/frontend/src/lib/profileStats.ts
import { isContributionResolution, isTrulyCompletedHelp } from "./resolutionStatus";

export interface HeroStats {
  totalUnlocks: number;
  directHelps: number;
  contributions: number;
  totalAmountHelped: number;
}

export interface RequesterStats {
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  totalCompleted: number;
  totalExpired: number;
  totalHelpReceived: number;
}

function firstPositiveAmount(...values: unknown[]): number {
  for (const value of values) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) return amount;
  }
  return 0;
}

export function computeHeroStats(unlocks: any[] = [], resolutions: any[] = []): HeroStats {
  const safeUnlocks = Array.isArray(unlocks) ? unlocks : [];
  const safeResolutions = Array.isArray(resolutions) ? resolutions : [];
  const completed = safeResolutions.filter(isTrulyCompletedHelp);
  const contributions = completed.filter(isContributionResolution).length;
  const directHelps = completed.length - contributions;
  const totalAmountHelped = completed.reduce(
    (sum, resolution) =>
      sum + Number(
        resolution?.seeker_confirmed_amount ??
        resolution?.verified_amount ??
        resolution?.amount_paid ??
        resolution?.amount ??
        0
      ),
    0
  );

  return { totalUnlocks: safeUnlocks.length, directHelps, contributions, totalAmountHelped };
}

export function computeRequesterStats(cases: any[] = []): RequesterStats {
  const safeCases = Array.isArray(cases) ? cases : [];
  const norm = (item: any) => String(item?.effective_status || item?.status || "pending").trim().toLowerCase();
  const completedCases = safeCases.filter((item) => norm(item) === "completed");

  return {
    totalSubmitted: safeCases.length,
    totalApproved: safeCases.filter((item) => norm(item) === "approved").length,
    totalRejected: safeCases.filter((item) => norm(item) === "rejected").length,
    totalCompleted: completedCases.length,
    totalExpired: safeCases.filter((item) => norm(item) === "expired").length,
    totalHelpReceived: completedCases.reduce(
      (sum, item) =>
        sum + firstPositiveAmount(item?.amount_collected, item?.verified_amount, item?.amount_needed),
      0
    ),
  };
}
