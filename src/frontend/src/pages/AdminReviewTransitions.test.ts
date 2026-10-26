import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const frontend = path.join(process.cwd(), "src");
const worker = fs.readFileSync(path.join(process.cwd(), "worker.js"), "utf8");
const dashboard = fs.readFileSync(path.join(frontend, "pages/AdminDashboard.tsx"), "utf8");
const dreamsPanel = fs.readFileSync(path.join(frontend, "components/AdminDreamsPanel.tsx"), "utf8");
const donationsPanel = fs.readFileSync(path.join(frontend, "components/AdminDonationsPanel.tsx"), "utf8");

describe("Admin review decision reliability", () => {
  it("guards KYC, case, feedback, payment-proof, and deposit decisions against stale/repeated review", () => {
    expect(worker).toContain("lower(COALESCE(status,'')) = 'pending'");
    expect(worker).toContain("lower(COALESCE(status,'pending_review')) IN ('pending','pending_review')");
    expect(worker).toContain("lower(COALESCE(status,'')) IN ('pending','pending_confirmation','seeker_confirmed')");
    expect(worker).toContain("This KYC application has already been reviewed");
    expect(worker).toContain("lower(COALESCE(status,'')) = 'approved'");
    expect(worker).toContain("Re-KYC can only be requested for a currently approved application");
    expect(worker).toContain("This case has already been reviewed");
    expect(worker).toContain("This feedback has already been reviewed");
    expect(worker).toContain("This payment proof has already been reviewed");
    expect(worker).toContain("amount_collected=COALESCE(amount_collected,0)+?");
    expect(worker).toContain("This deposit was already reviewed by another admin");
  });

  it("couples contribution, withdrawal, and Dreams side effects to the winning review status", () => {
    expect(worker).toContain("This contribution was already reviewed by another admin");
    expect(worker).toContain("contribution_status_history");
    expect(worker).toContain("This withdrawal has already been reviewed or is not in a valid status");
    expect(worker).toContain("This Dream payment has already been reviewed");
    expect(worker).toContain("dream_participation_history");
    expect(worker).toContain("results?.[0]?.meta?.changes");
  });

  it("restores a rejected case's free offer or credit only after its pending-to-rejected transition wins", () => {
    expect(worker).toContain("UPDATE category_offers SET used_count=MAX(0,COALESCE(used_count,0)-1)");
    expect(worker).toContain("INSERT INTO wallets (user_id,balance,updated_at)");
    expect(worker).toContain("case_submissions WHERE id=? AND status='rejected' AND reviewed_at=?");
  });

  it("refreshes authoritative statuses after conflicts and counts queue statuses case-insensitively", () => {
    expect(dashboard).toContain("function normalizedAdminStatus(value: unknown)");
    expect(dashboard).toContain("await loadData();\n      toast.error(error?.message || \"Case review failed. Current status was refreshed.\")");
    expect(dashboard).toContain("withdrawalBusyId === w.id");
    expect(dashboard).toContain("notification_sent === false");
  });

  it("shows review notification failures separately from saved contribution and Dreams decisions", () => {
    expect(donationsPanel).toContain("notification_sent === false");
    expect(dreamsPanel).toContain("notification_sent === false");
    expect(dreamsPanel).toContain("reviewBusyId === p.id");
  });
});
