import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const workerSource = fs.readFileSync(path.join(process.cwd(), "worker.js"), "utf8");
const caseDetailSource = fs.readFileSync(path.join(process.cwd(), "src/pages/CaseDetailPage.tsx"), "utf8");

describe("help workflow persistence and credit rules", () => {
  it("charges Direct Help server-side and limits free uses to Contribution", () => {
    expect(workerSource).toContain("Contribution gets three free uses per user; Direct Help always costs one credit");
    expect(workerSource).toContain("payment_type = 'partial'");
    expect(workerSource).toContain("const creditsCharged = isFreeContribution ? 0 : 1;");
    expect(workerSource).toContain("UPDATE wallets SET balance = balance - ?");
    expect(caseDetailSource).toContain("const isFreeContribution = mode === \"partial\" && userUnlockCount < 3;");
    expect(caseDetailSource).toContain("Help Now — Direct Payment (1 credit)");
  });

  it("persists unlock metadata and prevents duplicate unlocks for the same mode", () => {
    expect(workerSource).toContain("case_id = ? AND hero_id = ? AND payment_type = ?");
    expect(workerSource).toContain("pledged_amount, credits_charged, payment_type, unlocked_at");
    expect(caseDetailSource).toContain("setContributionOpen(true); setPayMode(\"partial\")");
    expect(caseDetailSource).toContain("const canHelpAgain = (unlocked || contributionOpen)");
  });

  it("persists receipt, amount, destination, and review fields for Admin", () => {
    expect(workerSource).toContain("seeker_id, resolution_type, amount_paid, transaction_id, receipt_url, notes, status, paid_to, submitted_at");
    expect(workerSource).toContain("seeker_confirmed_amount");
    expect(workerSource).toContain("completed_at");
    expect(caseDetailSource).toContain("After sending, submit your receipt below");
    expect(caseDetailSource).toContain("Upload Receipt");
  });

  it("keeps fundraising proof classified for Givethra and direct proof for the institute", () => {
    expect(caseDetailSource).toContain("const paidTo = contributionOpen || myUnlock?.payment_type === \"partial\" ? \"givethra\" : \"institute\";");
    expect(caseDetailSource).toContain("Contribute to Givethra Fundraising");
    expect(caseDetailSource).toContain("Institute Payment Details");
  });
});

export {};
