import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const caseDetailSource = readFileSync(new URL("./CaseDetailPage.tsx", import.meta.url), "utf8");

describe("public case verification presentation", () => {
  it("keeps all three platform-level verification badges in the case header", () => {
    expect(caseDetailSource).toContain("> Identity Verified</span>");
    expect(caseDetailSource).toContain("> KYC Approved</span>");
    expect(caseDetailSource).toContain("> Givethra Verified</span>");
  });

  it("keeps the case-document section and document-specific labels", () => {
    expect(caseDetailSource).toContain("Case Verification Documents");
    expect(caseDetailSource).toContain("const isPublishedCase");
    expect(caseDetailSource).toContain("No additional case-specific documents are recorded in this case.");
    expect(caseDetailSource).toContain("documentItems");
    expect(caseDetailSource).toContain("item.source === \"document\"");
  });

  it("uses one combined case-story heading and deduplicates repeated story text", () => {
    expect(caseDetailSource.match(/Case Story \(What You Need Help With\)/g)).toHaveLength(1);
    expect(caseDetailSource).toContain("values.findIndex");
  });

  it("loads independent Case Detail data requests in parallel", () => {
    expect(caseDetailSource).toContain("const [unlock, count, res, kyc, prof] = await Promise.all([");
  });
});
