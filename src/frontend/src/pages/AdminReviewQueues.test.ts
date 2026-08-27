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

  it("recognizes legacy Contribution markers before queue classification", () => {
    expect(source).toContain("function isContributionResolution(resolution: any): boolean");
    expect(source).toContain('"contribution", "partial", "fundraising"');
    expect(source).toContain("function normalizedResolutionStatus(resolution: any): string");
    expect(source).toContain("pendingResolutions.filter(isContributionResolution)");
  });

  it("keeps existing approval and rejection actions on pending cards", () => {
    expect(source).toContain("onConfirm={confirmResolution}");
    expect(source).toContain("onReject={rejectResolution}");
    expect(source).toContain('status: "completed", admin_confirmed: true');
    expect(source).toContain('status: "disputed", admin_confirmed: false');
  });
});
