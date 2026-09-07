import { describe, expect, it } from "vitest";
import { computeHeroStats, computeRequesterStats } from "./profileStats";

describe("profile statistics", () => {
  it("counts only truly completed Hero help and leaves unresolved unlocks active", () => {
    const stats = computeHeroStats(
      [{ case_id: "open" }, { case_id: "direct" }, { case_id: "contribution" }],
      [
        { case_id: "direct", case_status: "completed", payment_type: "direct", seeker_confirmed_amount: 1250 },
        { case_id: "contribution", case_status: "completed", payment_type: "partial", amount_paid: 750 },
        { case_id: "pending", case_status: "approved", payment_type: "direct", amount_paid: 500 },
      ],
    );

    expect(stats).toEqual({
      totalUnlocks: 3,
      directHelps: 1,
      contributions: 1,
      totalAmountHelped: 2000,
      activeUnlocked: 1,
    });
  });

  it("counts Requester approval and help received only from completed cases", () => {
    const stats = computeRequesterStats([
      { status: "rejected", amount_collected: 5000 },
      { status: "approved", amount_collected: 1000 },
      { status: "completed", amount_collected: 2750 },
    ]);

    expect(stats).toEqual({
      totalSubmitted: 3,
      totalApproved: 1,
      totalRejected: 1,
      totalCompleted: 1,
      totalExpired: 0,
      totalHelpReceived: 2750,
    });
  });
});
