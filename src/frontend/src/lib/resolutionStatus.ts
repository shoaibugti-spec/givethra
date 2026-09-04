// src/frontend/src/lib/resolutionStatus.ts
// Single source of truth for "is this help truly completed?" across
// MyCasesPage, MyHelpPage, and ProfilePage. The case's own status
// (returned as `case_status` by the case-resolutions API) is the
// authoritative signal — a resolution can be admin_confirmed without
// the case itself being closed (e.g. contributions still fundraising).

export function isTrulyCompletedHelp(resolution: any): boolean {
  if (!resolution) return false;
  const caseStatus = String(resolution?.case_status || "").trim().toLowerCase();
  if (caseStatus === "completed") return true;
  // Additional safety: if the resolution itself says completed and admin confirmed
  const status = String(resolution?.status || "").trim().toLowerCase();
  const adminConfirmed = [1, "1", true, "true", "yes"].includes(resolution?.admin_confirmed);
  if (["completed", "approved", "verified", "confirmed", "seeker_confirmed"].includes(status) && adminConfirmed) {
    return true;
  }
  return false;
}

export function isContributionResolution(resolution: any): boolean {
  if (!resolution) return false;
  const marker = String(
    resolution?.paid_to ?? resolution?.paidTo ?? resolution?.payment_type ?? resolution?.paymentType ?? ""
  ).trim().toLowerCase();
  return ["givethra", "contribution", "fundraising", "partial"].includes(marker);
}

export function resolutionDisplayStatus(resolution: any): "completed" | "rejected" | "pending" {
  if (isTrulyCompletedHelp(resolution)) return "completed";
  const status = String(resolution?.status || "").trim().toLowerCase();
  if (["rejected", "disputed"].includes(status)) return "rejected";
  return "pending";
}
