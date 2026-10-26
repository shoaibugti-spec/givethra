export function isCasePastDeadline(deadline: unknown, todayUtc = new Date().toISOString().slice(0, 10)): boolean {
  const deadlineDate = String(deadline ?? "").trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(deadlineDate) && deadlineDate < todayUtc;
}

export function isExpiredCaseRecord(
  caseRecord: { status?: unknown; deadline?: unknown; closed_by_admin?: unknown } | null | undefined,
  todayUtc = new Date().toISOString().slice(0, 10),
): boolean {
  if (!caseRecord) return false;
  const status = String(caseRecord.status ?? "").trim().toLowerCase();
  if (status === "expired") return true;
  const closedValue = String(caseRecord.closed_by_admin ?? "").trim().toLowerCase();
  const closedByAdmin = closedValue === "1" || closedValue === "true";
  return status === "completed" && closedByAdmin && isCasePastDeadline(caseRecord.deadline, todayUtc);
}
