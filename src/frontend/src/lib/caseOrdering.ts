export type CaseSort = "newest" | "oldest" | "amount_low" | "amount_high" | "urgent";

function normalized(value: unknown): string {
  return String(value ?? "").trim().toLocaleLowerCase();
}

export function orderCasesForViewer<T extends Record<string, any>>(
  cases: T[],
  preferredCountry: string | null | undefined,
  sortBy: CaseSort | string
): T[] {
  const country = normalized(preferredCountry);
  const urgencyOrder: Record<string, number> = { Emergency: 4, High: 3, Medium: 2, Low: 1 };
  return [...cases].sort((a, b) => {
    if (country) {
      const localDifference = Number(normalized(b.country) === country) - Number(normalized(a.country) === country);
      if (localDifference !== 0) return localDifference;
    }
    if (sortBy === "newest") return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    if (sortBy === "oldest") return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    if (sortBy === "amount_low") return (a.amount_needed ?? 0) - (b.amount_needed ?? 0);
    if (sortBy === "amount_high") return (b.amount_needed ?? 0) - (a.amount_needed ?? 0);
    if (sortBy === "urgent") return (urgencyOrder[b.urgency] ?? 0) - (urgencyOrder[a.urgency] ?? 0);
    return 0;
  });
}
