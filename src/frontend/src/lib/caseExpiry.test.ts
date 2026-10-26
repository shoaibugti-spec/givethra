import { describe, expect, it } from "vitest";
import { daysUntilCaseDeadline, getCaseCalendarDate, isCasePastDeadline, isExpiredCaseRecord } from "./caseExpiry";

describe("case expiry dates", () => {
  it("uses Pakistan local calendar dates for date-only case deadlines", () => {
    const instant = new Date("2026-10-26T20:00:00.000Z");
    expect(getCaseCalendarDate(instant)).toBe("2026-10-27");
    expect(isCasePastDeadline("2026-10-26", getCaseCalendarDate(instant))).toBe(true);
    expect(daysUntilCaseDeadline("2026-10-27", getCaseCalendarDate(instant))).toBe(0);
  });

  it("keeps a case available through its deadline date", () => {
    expect(isCasePastDeadline("2026-10-26", "2026-10-26")).toBe(false);
  });

  it("expires a case after its UTC deadline date", () => {
    expect(isCasePastDeadline("2026-10-25", "2026-10-26")).toBe(true);
    expect(isCasePastDeadline("2026-10-25T23:59:00Z", "2026-10-26")).toBe(true);
  });

  it("removes overdue approved cases from live status immediately", () => {
    expect(isExpiredCaseRecord({ status: "approved", deadline: "2026-10-25" }, "2026-10-26")).toBe(true);
    expect(isExpiredCaseRecord({ status: "published", deadline: "2026-10-26" }, "2026-10-26")).toBe(false);
  });

  it("does not expire missing or invalid deadlines", () => {
    expect(isCasePastDeadline(null, "2026-10-26")).toBe(false);
    expect(isCasePastDeadline("not-a-date", "2026-10-26")).toBe(false);
  });

  it("keeps explicit Expired cases expired but preserves paid completed cases after their deadline", () => {
    expect(isExpiredCaseRecord({ status: "expired" }, "2026-10-26")).toBe(true);
    expect(isExpiredCaseRecord({ status: "completed", closed_by_admin: 1, deadline: "2026-09-30" }, "2026-10-26")).toBe(false);
    expect(isExpiredCaseRecord({ status: "completed", closed_by_admin: 0, deadline: "2026-09-30" }, "2026-10-26")).toBe(false);
  });
});
