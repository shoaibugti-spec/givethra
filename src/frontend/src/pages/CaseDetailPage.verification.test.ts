import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const caseDetailSource = readFileSync(new URL("./CaseDetailPage.tsx", import.meta.url), "utf8");

describe("public case verification presentation", () => {
  it("keeps identity-level badges out of the case header", () => {
    expect(caseDetailSource).not.toContain("> Identity Verified</span>");
    expect(caseDetailSource).not.toContain("> KYC Approved</span>");
    expect(caseDetailSource).not.toContain("> Givethra Verified</span>");
  });

  it("keeps the case-document section and document-specific labels", () => {
    expect(caseDetailSource).toContain("Case Verification Documents");
    expect(caseDetailSource).toContain("documentItems");
    expect(caseDetailSource).toContain("item.source === \"document\"");
  });
});
