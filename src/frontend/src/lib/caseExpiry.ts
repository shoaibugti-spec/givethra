export function isCasePastDeadline(deadline: unknown, todayUtc = new Date().toISOString().slice(0, 10)): boolean {
  const deadlineDate = String(deadline ?? "").trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(deadlineDate) && deadlineDate < todayUtc;
}
