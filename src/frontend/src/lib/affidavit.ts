// src/frontend/src/lib/affidavit.ts
// One place that decides WHAT an affidavit contains and WHO sees what.
// Used by AffidavitPage (and by helpRecords for the same payment/receipt fields),
// so My Help, My Cases and the Affidavit page never disagree.
//
//   hero   -> only the viewer's own verified help (contribution and/or direct) on this case
//   seeker -> every verified help received on the viewer's own case (all contributors + totals)
//   admin  -> same as seeker (full case view)

import { isContributionResolution, isTrulyCompletedHelp } from "./resolutionStatus";

export type AffidavitRole = "seeker" | "hero" | "admin";
export type AffidavitKind = "contribution" | "direct";

export type AffidavitEntry = {
  key: string;
  kind: AffidavitKind;
  heroName: string;
  heroCnic: string;
  amount: number | null;
  transactionId: string;
  paymentMethod: string;
  verifiedAt: string | null;
  receiptUrl: string;
  code: string;
  /** Built from the case record itself because no resolution row exists. */
  generated: boolean;
};

export type AffidavitDoc = {
  role: AffidavitRole;
  caseId: string;
  title: string;
  category: string;
  currency: string;
  seekerName: string;
  seekerCnic: string;
  accountNumber: string;
  entries: AffidavitEntry[];
  totalAmount: number;
  hasAmount: boolean;
  code: string;
};

// ---------------------------------------------------------------------------
// Field pickers (shared with helpRecords so both screens read the same fields)
// ---------------------------------------------------------------------------
const lower = (v: unknown) => String(v ?? "").trim().toLowerCase();

export function isRejectedResolution(r: any): boolean {
  const s = lower(r?.status);
  return s === "rejected" || s === "disputed";
}

/** Same rule My Help uses: the shared "truly completed" helper, minus rejected rows. */
export function isVerifiedHelp(r: any): boolean {
  return !!r && !isRejectedResolution(r) && isTrulyCompletedHelp(r);
}

/**
 * Strict check on the resolution row itself (ignores the case's status). Used when a requester
 * or admin sees ALL contributors, so another person's unverified payment is never counted.
 */
export function isOwnVerifiedResolution(r: any): boolean {
  if (!r || isRejectedResolution(r)) return false;
  const s = lower(r.status);
  if (s === "completed") return true;
  const adminConfirmed = [1, "1", true, "true", "yes"].includes(r.admin_confirmed);
  return ["approved", "verified", "confirmed", "seeker_confirmed"].includes(s) && adminConfirmed;
}

export function resolutionTransactionId(r: any, c: any = {}): string {
  return (
    r?.transaction_id ||
    r?.txn_number ||
    r?.transaction_number ||
    r?.payment_reference ||
    r?.reference_number ||
    c?.payment_transaction_id ||
    c?.paid_transaction_id ||
    c?.transaction_id ||
    c?.txn_number ||
    c?.payment_reference ||
    c?.reference_number ||
    ""
  );
}

export function resolutionReceiptUrl(r: any, isContribution: boolean, c: any = {}): string | null {
  return isContribution
    ? r?.receipt_url || r?.payment_proof_url || r?.proof_url || c?.paid_receipt_url || null
    : r?.receipt_url ||
        r?.paid_receipt_url ||
        r?.payment_proof_url ||
        r?.proof_url ||
        c?.receipt_url ||
        c?.paid_receipt_url ||
        c?.payment_receipt_url ||
        c?.payment_proof_url ||
        c?.proof_url ||
        null;
}

export function resolutionAmount(r: any, isContribution: boolean, c: any = {}): number {
  return Number(
    isContribution
      ? r?.case_contribution_amount ?? r?.amount_paid ?? r?.amount ?? 0
      : r?.seeker_confirmed_amount ??
          r?.amount_paid ??
          r?.amount ??
          c?.amount_collected ??
          c?.amount_paid ??
          0
  );
}

/** Evidence an admin stored on the case itself when completing a direct payment. */
export function getAdminDirectEvidence(c: any = {}) {
  const transactionId: string =
    c?.reference_number ||
    c?.payment_transaction_id ||
    c?.paid_transaction_id ||
    c?.transaction_id ||
    c?.txn_number ||
    c?.payment_reference ||
    "";
  const receiptUrl: string | null =
    c?.receipt_url ||
    c?.paid_receipt_url ||
    c?.payment_receipt_url ||
    c?.payment_proof_url ||
    c?.proof_url ||
    null;
  return { transactionId, receiptUrl, hasEvidence: Boolean(transactionId || receiptUrl) };
}

/** Every field a case row might use for its owner (the requester). */
export function caseOwnerIds(c: any): string[] {
  return [c?.user_id, c?.seeker_id, c?.requester_id, c?.owner_id, c?.created_by]
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);
}

function lastChars(value: unknown, n: number) {
  return String(value ?? "").slice(-n).toUpperCase();
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------
export function buildAffidavit(args: {
  caseId: string;
  caseData: any;
  resolutions: any[];
  unlocks: any[];
  user: { id: string; fullName?: string };
  role: AffidavitRole;
}): AffidavitDoc | null {
  const { caseId, role, user } = args;
  const c = args.caseData || {};
  const uid = String(user.id);
  const isHeroView = role === "hero";

  // Remove duplicate rows (the same resolution can arrive from two endpoints).
  const seen = new Set<string>();
  const rows = (args.resolutions || []).filter((r) => {
    if (!r) return false;
    const k = String(r.id ?? "");
    if (!k) return true;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const scoped = isHeroView ? rows.filter((r) => String(r.hero_id ?? "") === uid) : rows;
  const caseCompleted = lower(c.status) === "completed";
  // Hero view matches My Help: the shared completed rule, or direct help on a case admin completed.
  const heroVerified = (r: any) =>
    isVerifiedHelp(r) || (!isRejectedResolution(r) && !isContributionResolution(r) && caseCompleted);
  const verified = scoped.filter(isHeroView ? heroVerified : isOwnVerifiedResolution);

  const entries: AffidavitEntry[] = verified.map((r) => {
    const isContribution = isContributionResolution(r);
    const amount = resolutionAmount(r, isContribution, c);
    return {
      key: String(r.id ?? `${caseId}-${r.hero_id ?? "x"}`),
      kind: isContribution ? "contribution" : "direct",
      heroName: String(r.hero_name || (String(r.hero_id ?? "") === uid ? user.fullName || "" : "")),
      heroCnic: String(r.hero_cnic_number || r.hero_cnic || ""),
      amount: Number.isFinite(amount) && amount > 0 ? amount : null,
      transactionId: String(resolutionTransactionId(r, c)),
      paymentMethod: String(r.payment_method || c.payment_method || ""),
      verifiedAt: r.reviewed_at || r.admin_confirmed_at || r.completed_at || r.submitted_at || null,
      receiptUrl: String(resolutionReceiptUrl(r, isContribution, c) || ""),
      code: lastChars(r.verification_security_code || r.security_code || r.id || caseId, 16),
      generated: false,
    };
  });

  // No resolution row, but admin completed a direct payment on the case itself.
  if (!entries.length && caseCompleted) {
    const ev = getAdminDirectEvidence(c);
    const collected = Number(
      c.amount_collected || c.verified_amount || c.help_received_amount || c.amount_received || c.amount_paid || c.amount_needed || 0
    );
    const hasFullUnlock = (args.unlocks || []).some(
      (u) =>
        String(u?.case_id) === String(caseId) &&
        String(u?.hero_id ?? uid) === uid &&
        lower(u?.payment_type) !== "partial"
    );
    const allowed = isHeroView ? hasFullUnlock : ev.hasEvidence || Number(c.amount_collected || 0) > 0;
    if (allowed) {
      entries.push({
        key: `generated-direct-${c.id ?? caseId}`,
        kind: "direct",
        heroName: isHeroView ? user.fullName || "" : String(c.hero_name || c.helper_name || ""),
        heroCnic: "",
        amount: collected > 0 ? collected : null,
        transactionId: ev.transactionId,
        paymentMethod: String(c.payment_method || ""),
        verifiedAt: c.closed_at || c.reviewed_at || null,
        receiptUrl: String(ev.receiptUrl || ""),
        code: lastChars(`generated-direct-${c.id ?? caseId}`, 16),
        generated: true,
      });
    }
  }

  if (!entries.length) return null;

  const first = scoped.find((r) => r?.seeker_name || r?.seeker_cnic_number || r?.seeker_cnic) || scoped[0] || {};
  const totalAmount = entries.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  return {
    role,
    caseId,
    title: String(c.title || first.case_title || "Completed assistance"),
    category: String(c.category || first.case_category || "Community assistance"),
    currency: String(c.currency || first.currency || first.case_currency || "USD"),
    seekerName: String(
      first.seeker_name || c.full_name || c.user_name || (role === "seeker" ? user.fullName || "" : "")
    ),
    seekerCnic: String(first.seeker_cnic_number || first.seeker_cnic || c.cnic || c.cnic_number || ""),
    accountNumber: String(c.account_number || c.account_iban || ""),
    entries,
    totalAmount,
    hasAmount: entries.some((e) => e.amount !== null),
    code: entries.length === 1 ? entries[0].code : `GVT-${lastChars(caseId, 8)}-${entries.length}`,
  };
}
