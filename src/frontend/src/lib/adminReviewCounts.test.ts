import { describe, expect, it } from "vitest";
import {
  countOpenHelpMeReports,
  countPendingDonationReviews,
  countPendingDreamSubmissions,
  countPendingHelpMeProofs,
  countPendingHelpMeVideos,
} from "./adminReviewCounts";

describe("admin user-submission review counts", () => {
  it("counts only Help Me videos awaiting first review", () => {
    expect(countPendingHelpMeVideos({ appeals: [
      { status: "pending_review" },
      { status: "PENDING_REVIEW" },
      { status: "under_review" },
      { status: "published" },
    ] })).toBe(2);
    expect(countPendingHelpMeVideos({ pending_videos: 137 })).toBe(137);
    expect(countPendingHelpMeVideos({ pending_videos: -4 })).toBe(0);
    expect(countPendingHelpMeVideos({ appeals: null })).toBe(0);
    expect(countPendingHelpMeProofs({ pending_payment_proofs: 124 })).toBe(124);
    expect(countPendingHelpMeProofs({ helps: [{ status: "pending" }, { status: "approved" }] })).toBe(1);
    expect(countOpenHelpMeReports({ open_reports: 3 })).toBe(3);
    expect(countOpenHelpMeReports({ reports: [{}, {}] })).toBe(2);
  });

  it("counts only Dreams payment submissions pending approval", () => {
    expect(countPendingDreamSubmissions([
      { status: "pending_approval" },
      { status: "approved" },
      { status: "rejected" },
    ])).toBe(1);
  });

  it("counts only community donation receipts still pending", () => {
    expect(countPendingDonationReviews([
      { status: "pending" },
      { status: "approved" },
      { status: "rejected" },
    ])).toBe(1);
  });
});
