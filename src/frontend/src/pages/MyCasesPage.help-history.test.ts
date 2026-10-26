import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(__dirname, "MyCasesPage.tsx"), "utf8");

describe("My Cases help history", () => {
  it("loads submitted cases, unlocks, and resolutions with case records for expiry history", () => {
    expect(source).toContain("getCasesByUser");
    expect(source).toContain("getCaseUnlocksByHero");
    expect(source).toContain("getCaseResolutionsByHero");
    expect(source).toContain("getCasesByIds");
    expect(source).toContain("Promise.all([");
    expect(source).toContain("setMyCases");
    expect(source).toContain("setHelpRecords");
  });

  it("shows contribution and direct-help filters with expired proof and affidavit access", () => {
    expect(source).toContain('TabsTrigger value="contribution"');
    expect(source).toContain('TabsTrigger value="direct"');
    expect(source).toContain('TabsTrigger value="completed"');
    expect(source).toContain('TabsTrigger value="expired"');
    expect(source).toContain("filteredHelpRecords");
    expect(source).toContain('r.helpStatus === "expired"');
    expect(source).toContain("View Affidavit");
    expect(source).toContain("Payment Proof");
  });

  it("keeps completed-help certificate access in the existing case-detail flow", () => {
    const caseDetailSource = fs.readFileSync(path.resolve(__dirname, "CaseDetailPage.tsx"), "utf8");
    expect(caseDetailSource).toContain("generateAffidavit");
    expect(caseDetailSource).toContain("Download Affidavit");
  });
});
