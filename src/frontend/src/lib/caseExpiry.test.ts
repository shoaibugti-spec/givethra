import { describe, expect, it } from "vitest";
import { isCasePastDeadline } from "./caseExpiry";

describe("case expiry dates", () => {
  it("keeps a case available through its deadline date", () => {
    expect(isCasePastDeadline("2026-10-26", "2026-10-26")).toBe(false);
  });

  it("expires a case after its UTC deadline date", () => {
    expect(isCasePastDeadline("2026-10-25", "2026-10-26")).toBe(true);
    expect(isCasePastDeadline("2026-10-25T23:59:00Z", "2026-10-26")).toBe(true);
  });

  it("does not expire missing or invalid deadlines", () => {
    expect(isCasePastDeadline(null, "2026-10-26")).toBe(false);
    expect(isCasePastDeadline("not-a-date", "2026-10-26")).toBe(false);
  });
});
