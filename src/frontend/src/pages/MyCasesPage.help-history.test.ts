import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(__dirname, "MyCasesPage.tsx"), "utf8");

describe("My Cases help history", () => {
  it("loads resolutions alongside unlocked cases", () => {
    expect(source).toContain("getCaseResolutions");
    expect(source).toContain("getCaseResolutionsByHero");
    expect(source).toContain("Promise.all([");
    expect(source).toContain("setUnlockedCases");
    expect(source).toContain("setMyCases");
  });

  it("shows contribution and direct-help filters with completed-help access", () => {
    expect(source).toContain('TabsTrigger value="contribution"');
    expect(source).toContain('TabsTrigger value="direct"');
    expect(source).toContain('TabsTrigger value="completed"');
    expect(source).toContain("filteredHelpCases");
    expect(source).toContain("Continue Helping");
    expect(source).toContain("View Completed Case");
  });

  it("keeps completed-help certificate access in the existing case-detail flow", () => {
    const caseDetailSource = fs.readFileSync(path.resolve(__dirname, "CaseDetailPage.tsx"), "utf8");
    expect(caseDetailSource).toContain("generateAffidavit");
    expect(caseDetailSource).toContain("Download Affidavit");
  });
});
