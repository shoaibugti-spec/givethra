export function getCaseCalendarDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function daysUntilCaseDeadline(deadline: unknown, today = getCaseCalendarDate()): number | null {
  const deadlineDate = String(deadline ?? "").trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadlineDate) || !/^\d{4}-\d{2}-\d{2}$/.test(today)) return null;
  return Math.round((Date.parse(`${deadlineDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

export function isCasePastDeadline(deadline: unknown, today = getCaseCalendarDate()): boolean {
  const deadlineDate = String(deadline ?? "").trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(deadlineDate) && deadlineDate < today;
}

export function isExpiredCaseRecord(
  caseRecord: { status?: unknown; deadline?: unknown; closed_by_admin?: unknown } | null | undefined,
  today = getCaseCalendarDate(),
): boolean {
  if (!caseRecord) return false;
  const status = String(caseRecord.status ?? "").trim().toLowerCase();
  if (status === "expired") return true;
  const publishedStatuses = new Set(["approved", "published", "active", "open", "in_progress", "live"]);
  if (publishedStatuses.has(status) && isCasePastDeadline(caseRecord.deadline, today)) return true;
  return false;
}
