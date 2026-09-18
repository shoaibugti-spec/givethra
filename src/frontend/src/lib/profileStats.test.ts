import { describe, expect, it } from "vitest";
import { computeHeroStats, computeRequesterStats } from "./profileStats";

describe("profile stats", () => {
  it("counts only truly completed hero help and separates contributions", () => {
    expect(
      computeHeroStats(
        [{ id: "unlock-1" }, { id: "unlock-2" }],
        [
          { case_status: "completed", status: "completed", paid_to: "institute", amount_paid: 120 },
          { case_status: "completed", status: "completed", paid_to: "givethra", amount_paid: 30 },
          { case_status: "approved", status: "pending", paid_to: "institute", amount_paid: 500 },
        ]
      )
    ).toEqual({ totalUnlocks: 2, directHelps: 1, contributions: 1, totalAmountHelped: 150 });
  });

  it("counts requester outcomes and falls back to case amount fields", () => {
    expect(
      computeRequesterStats([
        { status: "pending" },
        { status: "approved" },
        { status: "rejected" },
        { status: "expired" },
        { status: "completed", amount_needed: 450 },
        { status: "completed", amount_collected: 125 },
      ])
    ).toEqual({
      totalSubmitted: 6,
      totalApproved: 1,
      totalRejected: 1,
      totalCompleted: 2,
      totalExpired: 1,
      totalHelpReceived: 575,
      });
  });

  it("counts admin-confirmed approved hero help and ignores pending help", () => {
    expect(
      computeHeroStats(
        [{ id: "unlock-1" }],
        [
          { case_status: "approved", status: "approved", admin_confirmed: true, paid_to: "institute", amount_paid: 80 },
          { case_status: "approved", status: "pending_confirmation", paid_to: "givethra", amount_paid: 40 },
        ],
      ),
    ).toEqual({ totalUnlocks: 1, directHelps: 1, contributions: 0, totalAmountHelped: 80 });
  });

  it("uses the worker's effective completed status for requester totals", () => {
    expect(computeRequesterStats([{ status: "approved", effective_status: "completed", amount_collected: 300 }])).toMatchObject({
      totalSubmitted: 1,
      totalCompleted: 1,
      totalHelpReceived: 300,
    });
  });
});
