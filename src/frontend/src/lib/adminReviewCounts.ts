type StatusRow = { status?: unknown };

function hasStatus(rows: unknown, expected: string): number {
  if (!Array.isArray(rows)) return 0;
  return rows.filter((row): row is StatusRow => !!row && typeof row === "object")
    .filter((row) => String(row.status ?? "").trim().toLowerCase() === expected).length;
}

/** Only new Help Me video appeals awaiting a decision; reported/under-review appeals are separate work. */
export function countPendingHelpMeVideos(queue: unknown): number {
  if (queue && typeof queue === "object" && typeof (queue as { pending_videos?: unknown }).pending_videos === "number") {
    return Math.max(0, Math.floor((queue as { pending_videos: number }).pending_videos));
  }
  const appeals = queue && typeof queue === "object" ? (queue as { appeals?: unknown }).appeals : null;
  return hasStatus(appeals, "pending_review");
}

export function countPendingHelpMeProofs(queue: unknown): number {
  if (queue && typeof queue === "object" && typeof (queue as { pending_payment_proofs?: unknown }).pending_payment_proofs === "number") {
    return Math.max(0, Math.floor((queue as { pending_payment_proofs: number }).pending_payment_proofs));
  }
  const helps = queue && typeof queue === "object" ? (queue as { helps?: unknown }).helps : null;
  return hasStatus(helps, "pending");
}

export function countOpenHelpMeReports(queue: unknown): number {
  if (queue && typeof queue === "object" && typeof (queue as { open_reports?: unknown }).open_reports === "number") {
    return Math.max(0, Math.floor((queue as { open_reports: number }).open_reports));
  }
  const reports = queue && typeof queue === "object" ? (queue as { reports?: unknown }).reports : null;
  return Array.isArray(reports) ? reports.length : 0;
}

/** Dream payment submissions use `pending_approval` until an admin reviews the receipt. */
export function countPendingDreamSubmissions(rows: unknown): number {
  return hasStatus(rows, "pending_approval");
}

/** Community contribution receipts use `pending` until an admin approves or rejects them. */
export function countPendingDonationReviews(rows: unknown): number {
  return hasStatus(rows, "pending");
}
