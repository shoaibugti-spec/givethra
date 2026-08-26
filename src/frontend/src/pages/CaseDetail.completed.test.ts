import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(new URL("./CaseDetailPage.tsx", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
const apiSource = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8");

describe("completed helper detail flow", () => {
  it("allows completed helpers to reopen a case through an unlock or resolution", () => {
    expect(workerSource).toContain("case_unlocks WHERE case_id = ? AND hero_id = ?");
    expect(workerSource).toContain("case_resolutions WHERE case_id = ? AND hero_id = ?");
    expect(workerSource).toContain('status === "completed"');
  });

  it("renders a read-only completed helper view with an affidavit action", () => {
    expect(pageSource).toContain("COMPLETED HELP VIEW (helper only)");
    expect(pageSource).toContain("Your affidavit");
    expect(pageSource).toContain("Download Affidavit");
    expect(pageSource).toContain("Your payment and contribution actions are now closed");
    expect(pageSource).toContain("!isOwner && !isCompleted && unlockMode");
    expect(pageSource).toContain("!isCompleted && <div className=\"rounded-2xl bg-card border border-border p-5 space-y-3\">");
  });

  it("does not pass a 404 case payload into the detail renderer", () => {
    expect(apiSource).toContain('if (!res.ok) throw new Error(data?.error || "Failed to load case details")');
    expect(pageSource).toContain('if (!data || data.error || !data.id)');
  });

  it("keeps seeker feedback required and pending review", () => {
    expect(pageSource).toContain("Please write a message AND record a 90-second video");
    expect(pageSource).toContain('status: "pending_review"');
  });
});
