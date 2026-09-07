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

export function computeHeroStats(unlocks: any[] = [], resolutions: any[] = []): HeroStats {
  const safeUnlocks = Array.isArray(unlocks) ? unlocks : [];
  const safeResolutions = Array.isArray(resolutions) ? resolutions : [];
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
    totalUnlocks: safeUnlocks.length,
    directHelps,
    contributions,
    totalAmountHelped,
    activeUnlocked: safeUnlocks.filter((unlock) => !resolvedCaseIds.has(String(unlock.case_id))).length,
  };
}

export function computeRequesterStats(cases: any[] = []): RequesterStats {
  const safeCases = Array.isArray(cases) ? cases : [];
  const norm = (item: any) => String(item?.status || "pending").trim().toLowerCase();
  const completedCases = safeCases.filter((item) => norm(item) === "completed");

  return {
    totalSubmitted: safeCases.length,
    totalApproved: safeCases.filter((item) => norm(item) === "approved").length,
    totalRejected: safeCases.filter((item) => norm(item) === "rejected").length,
    totalCompleted: completedCases.length,
    totalExpired: safeCases.filter((item) => norm(item) === "expired").length,
    totalHelpReceived: completedCases.reduce((sum, item) => sum + (Number(item.amount_collected ?? 0) || 0), 0),
  };
}
