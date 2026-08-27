import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "src/pages/AdminDashboard.tsx"), "utf8");

describe("Admin payment review queues", () => {
  it("partitions direct help and contributions by pending, rejected, and completed status", () => {
    expect(source).toContain('const rejectedContributions = resolutions.filter');
    expect(source).toContain('const rejectedDirectResolutions = resolutions.filter');
    expect(source).toContain('const completedContributions = resolutions.filter');
    expect(source).toContain('const completedDirectResolutions = resolutions.filter');
    expect(source).toContain('aria-label="Direct payment status filters"');
    expect(source).toContain('aria-label="Contribution status filters"');
    expect(source).toContain('Rejected ({rejectedDirectResolutions.length})');
    expect(source).toContain('Rejected ({rejectedContributions.length})');
    expect(source).toContain('Completed ({completedDirectResolutions.length})');
    expect(source).toContain('Completed ({completedContributions.length})');
  });

  it("uses the legacy-safe Contribution classifier during approval transitions", () => {
    expect(source).toContain("const isFundraising = isContributionResolution(res);");
    expect(source).not.toContain('const isFundraising = res.paid_to === "givethra";');
  });

  it("recognizes legacy Contribution markers before queue classification", () => {
    expect(source).toContain("function isContributionResolution(resolution: any): boolean");
    expect(source).toContain('"contribution", "partial", "fundraising"');
    expect(source).toContain("function normalizedResolutionStatus(resolution: any): string");
    expect(source).toContain("pendingResolutions.filter(isContributionResolution)");
  });

  it("renders status-aware completed and rejected resolution summaries", () => {
    expect(source).toContain("function ResolutionHistoryCard({ r, c, profileMap }: any)");
    expect(source).toContain('const label = isRejected ? "REJECTED" : "APPROVED / COMPLETED"');
    expect(source).toContain('Case ID:</span> {r.case_id || "—"}');
    expect(source).toContain('Payment type:</span> {isContribution ? "Contribution to Givethra" : "Direct Help to provider"}');
    expect(source).toContain("Rejection reason: {r.rejection_reason || r.notes || \"Not provided\"}");
  });

  it("limits Pay & Close to approved fully funded cases that are not already closed", () => {
    expect(source).toContain("const readyToClose = caseList.filter((c) => {");
    expect(source).toContain('if (c.status !== "approved") return false;');
    expect(source).toContain("needed > 0 && collected >= needed && !c.closed_by_admin");
  });

  it("keeps existing approval and rejection actions on pending cards", () => {
    expect(source).toContain("onConfirm={confirmResolution}");
    expect(source).toContain("onReject={rejectResolution}");
    expect(source).toContain('status: "completed", admin_confirmed: true');
    expect(source).toContain('status: "disputed", admin_confirmed: false');
  });
});
