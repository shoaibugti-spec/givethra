function isTrulyCompletedHelp(resolution) {
  if (!resolution) return false;
  const caseStatus = String((resolution == null ? void 0 : resolution.case_status) || "").trim().toLowerCase();
  if (caseStatus === "completed") return true;
  const status = String((resolution == null ? void 0 : resolution.status) || "").trim().toLowerCase();
  if (status === "completed") return true;
  const adminConfirmed = [1, "1", true, "true", "yes"].includes(resolution == null ? void 0 : resolution.admin_confirmed);
  if (["approved", "verified", "confirmed", "seeker_confirmed"].includes(status) && adminConfirmed) {
    return true;
  }
  return false;
}
function isContributionResolution(resolution) {
  if (!resolution) return false;
  const marker = String(
    (resolution == null ? void 0 : resolution.paid_to) ?? (resolution == null ? void 0 : resolution.paidTo) ?? (resolution == null ? void 0 : resolution.payment_type) ?? (resolution == null ? void 0 : resolution.paymentType) ?? ""
  ).trim().toLowerCase();
  return ["givethra", "contribution", "fundraising", "partial"].includes(marker);
}
function resolutionDisplayStatus(resolution) {
  if (isTrulyCompletedHelp(resolution)) return "completed";
  const status = String((resolution == null ? void 0 : resolution.status) || "").trim().toLowerCase();
  if (["rejected", "disputed"].includes(status)) return "rejected";
  return "pending";
}
export {
  isTrulyCompletedHelp as a,
  isContributionResolution as i,
  resolutionDisplayStatus as r
};
