import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(__dirname, "MyCasesPage.tsx"), "utf8");

describe("My Cases help history", () => {
  it("loads resolutions alongside unlocked cases", () => {
    expect(source).toContain("getCaseResolutions");
    expect(source).toContain("Promise.all(ids.map(async (caseId)");
    expect(source).toContain("setHelpByCase");
  });

  it("shows contribution and direct-help records with review status and amount", () => {
    expect(source).toContain("Your Help on this case");
    expect(source).toContain("Contribution / Fundraising");
    expect(source).toContain("Direct Help");
    expect(source).toContain("Pending Givethra Review");
    expect(source).toContain("Confirmed — Under Verification");
    expect(source).toContain("Amount:");
    expect(source).toContain("Txn:");
  });
});
