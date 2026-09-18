// src/frontend/src/lib/completionCooldown.ts
// Cooldown rules after a COMPLETED case only

export const COOLDOWN_DAYS = 30;
export const EARLY_REQUEST_AFTER_DAYS = 15;

export type CooldownPhase =
  | "none" // no completed case / cooldown finished
  | "waiting" // 0–15 days after completion
  | "early_available" // 15–30 days: may request early review
  | "early_locked" // early request was rejected; wait until 30 days
  | "ready"; // 30+ days: normal submit allowed

export type CooldownState = {
  phase: CooldownPhase;
  lastCompletedCaseId: string | null;
  lastCompletedTitle: string | null;
  lastCompletedAt: string | null;
  remainingMs: number;
  remainingDays: number;
  remainingHours: number;
  remainingMinutes: number;
  elapsedDays: number;
  canSubmitNormal: boolean;
  canRequestEarly: boolean;
  messageTitle: string;
  messageBody: string;
};

const MS_DAY = 24 * 60 * 60 * 1000;

function parseDate(value?: string | null): number | null {
  if (!value) return null;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : null;
}

/** Format remaining time for UI */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return "0 Days 0 Hours";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  return `${days} Days ${hours} Hours Remaining`;
}

/**
 * Build cooldown state from the user's cases list.
 * Only the latest COMPLETED case starts the 30-day window.
 * Rejected / expired / pending never start this counter.
 */
export function buildCooldownState(
  cases: any[],
  options?: {
    /** If user already had an early request rejected for this completion cycle */
    earlyRequestRejected?: boolean;
  }
): CooldownState {
  const empty: CooldownState = {
    phase: "none",
    lastCompletedCaseId: null,
    lastCompletedTitle: null,
    lastCompletedAt: null,
    remainingMs: 0,
    remainingDays: 0,
    remainingHours: 0,
    remainingMinutes: 0,
    elapsedDays: 0,
    canSubmitNormal: true,
    canRequestEarly: false,
    messageTitle: "",
    messageBody: "",
  };

  const list = Array.isArray(cases) ? cases : [];
  const completed = list
    .filter((c) => String(c.status || "").toLowerCase() === "completed")
    .map((c) => ({
      id: String(c.id),
      title: String(c.title || "Your case"),
      at:
        parseDate(c.completed_at) ||
        parseDate(c.updated_at) ||
        parseDate(c.created_at) ||
        0,
      raw:
        c.completed_at ||
        c.updated_at ||
        c.created_at ||
        null,
    }))
    .filter((c) => c.at > 0)
    .sort((a, b) => b.at - a.at);

  if (completed.length === 0) return empty;

  const latest = completed[0];
  const now = Date.now();
  const elapsedMs = Math.max(0, now - latest.at);
  const elapsedDays = elapsedMs / MS_DAY;
  const remainingMs = Math.max(0, COOLDOWN_DAYS * MS_DAY - elapsedMs);
  const remainingDays = Math.floor(remainingMs / MS_DAY);
  const remainingHours = Math.floor((remainingMs % MS_DAY) / (60 * 60 * 1000));
  const remainingMinutes = Math.floor((remainingMs % (60 * 60 * 1000)) / 60000);

  const earlyRejected = !!options?.earlyRequestRejected;

  // Cooldown finished
  if (remainingMs <= 0) {
    return {
      phase: "ready",
      lastCompletedCaseId: latest.id,
      lastCompletedTitle: latest.title,
      lastCompletedAt: latest.raw ? String(latest.raw) : null,
      remainingMs: 0,
      remainingDays: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      elapsedDays: Math.floor(elapsedDays),
      canSubmitNormal: true,
      canRequestEarly: false,
      messageTitle: "You can now submit a new Help Request",
      messageBody:
        "Your previous waiting period is over. You may submit a new case if you still need help.",
    };
  }

  // Still inside 30 days
  const base = {
    lastCompletedCaseId: latest.id,
    lastCompletedTitle: latest.title,
    lastCompletedAt: latest.raw ? String(latest.raw) : null,
    remainingMs,
    remainingDays,
    remainingHours,
    remainingMinutes,
    elapsedDays: Math.floor(elapsedDays),
    canSubmitNormal: false,
  };

  // Early request already rejected → lock until 30 days
  if (earlyRejected) {
    return {
      ...base,
      phase: "early_locked",
      canRequestEarly: false,
      messageTitle: "Early request was not approved",
      messageBody:
        "Your early request was rejected. Please wait until the full 30-day period ends before submitting again.",
    };
  }

  // 15–30 days → early request available
  if (elapsedDays >= EARLY_REQUEST_AFTER_DAYS) {
    return {
      ...base,
      phase: "early_available",
      canRequestEarly: true,
      messageTitle: "Your Help Was Completed",
      messageBody:
        "You can submit another case after 30 days. After 15 days you may send one early request for admin review (approval is not guaranteed).",
    };
  }

  // 0–15 days → wait only
  return {
    ...base,
    phase: "waiting",
    canRequestEarly: false,
    messageTitle: "Your Help Was Completed",
    messageBody:
      "You can submit another case after 30 days. A limited early-request option appears after 15 days.",
  };
}

/**
 * Detect if the latest early request (case after last completion) was rejected.
 * Early cases should be flagged with category_details.is_early_request === true
 * or was_early_request === true on the case row.
 */
export function detectEarlyRequestRejected(cases: any[]): boolean {
  const list = Array.isArray(cases) ? cases : [];
  const completed = list
    .filter((c) => String(c.status || "").toLowerCase() === "completed")
    .map((c) => ({
      id: String(c.id),
      at:
        parseDate(c.completed_at) ||
        parseDate(c.updated_at) ||
        parseDate(c.created_at) ||
        0,
    }))
    .filter((c) => c.at > 0)
    .sort((a, b) => b.at - a.at);

  if (completed.length === 0) return false;
  const lastCompletedAt = completed[0].at;

  const earlyRejected = list.some((c) => {
    const st = String(c.status || "").toLowerCase();
    if (st !== "rejected") return false;
    const created =
      parseDate(c.created_at) || parseDate(c.submitted_at) || 0;
    if (created < lastCompletedAt) return false;
    const details = c.category_details || c.categoryDetails || {};
    return (
      details.is_early_request === true ||
      details.was_early_request === true ||
      c.is_early_request === true ||
      c.was_early_request === true
    );
  });

  return earlyRejected;
}
