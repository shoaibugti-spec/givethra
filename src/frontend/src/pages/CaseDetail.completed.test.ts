import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(new URL("./CaseDetailPage.tsx", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
const apiSource = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8");
const myCasesSource = readFileSync(new URL("./MyCasesPage.tsx", import.meta.url), "utf8");

describe("completed helper detail flow", () => {
  it("allows completed helpers to reopen a case through an unlock or resolution", () => {
    expect(workerSource).toContain("case_unlocks WHERE case_id = ? AND hero_id = ?");
    expect(workerSource).toContain("case_resolutions WHERE case_id = ? AND hero_id = ?");
    expect(workerSource).toContain('status === "completed"');
  });

  it("renders a read-only completed helper view with an approved-help-only affidavit action", () => {
    expect(pageSource).toContain("COMPLETED HELP VIEW (helper only)");
    expect(pageSource).toContain("verifiedResolutions.length > 0");
    expect(pageSource).toContain("View & Download Affidavit");
    expect(pageSource).toContain("Your payment and contribution actions are now closed");
    expect(pageSource).toContain("!isOwner && !isCompleted && unlockMode");
    expect(pageSource).toContain("!isCompleted && <div className=\"rounded-2xl bg-card border border-border p-5 space-y-3\">");
  });

  it("requires explicit Admin confirmation and hides affidavit links for rejected or unconfirmed help", () => {
    expect(pageSource).toContain("function isApprovedCompletedResolution(resolution: any): boolean");
    expect(pageSource).toContain('return adminConfirmed && ["approved", "completed"].includes(status);');
    expect(pageSource).toContain("const verifiedResolutions = myResolutions.filter(isApprovedCompletedResolution);");
    expect(pageSource).toContain("This was disputed — no affidavit is available.");
    expect(myCasesSource).toContain('c.affidavit_available ? "View Affidavit & Completed Help" :');
  });

  it("keeps each approved Contribution resolution eligible for its own affidavit details", () => {
    expect(pageSource).toContain("function isContributionResolution(resolution: any): boolean");
    expect(pageSource).toContain('["givethra", "contribution", "fundraising", "partial"]');
    expect(pageSource).toContain("verifiedResolutions.map");
    expect(pageSource).toContain("View & Download Affidavit");
    expect(pageSource).toContain("const last = d.slice(-3);");
    expect(pageSource).toContain("last 3 digits of an account/reference");
    expect(pageSource).toContain("const visible = resolutions.filter(r => !isContributionResolution(r));");
  });

  it("does not pass a 404 case payload into the detail renderer", () => {
    expect(apiSource).toContain('if (!res.ok) throw new Error(data?.error || "Failed to load case details")');
    expect(pageSource).toContain('if (!data || data.error || !data.id)');
  });

  it("keeps the public Help Now layout complete and limited to two help controls", () => {
    expect(pageSource).toContain("Identity Verified");
    expect(pageSource).toContain("KYC Approved");
    expect(pageSource).toContain("Givethra Verified");
    expect(pageSource).toContain("Case Story");
    expect(pageSource).toContain("amountCollected");
    expect(pageSource).toContain("caseData.deadline");
    expect(pageSource).toContain("Pay the full bill directly");
    expect(pageSource).toContain("Contribute any amount (Fundraising)");
  });

  it("keeps seeker feedback required and pending review", () => {
    expect(pageSource).toContain("Please write a message AND record a 90-second video");
    expect(pageSource).toContain('status: "pending_review"');
    expect(pageSource).toContain('const savedFeedback = await insertFeedback({');
    expect(pageSource).toContain('setExistingFeedback({');
    expect(pageSource).toContain('type="button" className="w-full min-h-12 touch-manipulation select-none"');
    expect(apiSource).toContain('if (!res.ok) throw new Error(result?.error || `Feedback submission failed (${res.status})`);');
  });
});
