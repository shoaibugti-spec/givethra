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
    expect(caseDetailSource).toContain("max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-6");
  });

  it("uses one combined case-story heading and deduplicates repeated story text", () => {
    expect(caseDetailSource.match(/Case Story \(What You Need Help With\)/g)).toHaveLength(1);
    expect(caseDetailSource).toContain("values.findIndex");
  });

  it("loads independent Case Detail data requests in parallel", () => {
    expect(caseDetailSource).toContain("const [unlock, count, res, kyc, prof] = await Promise.all([");
  });

  it("keeps the three badges before the visible case-document block and prevents deadline wrapping", () => {
    expect(caseDetailSource.indexOf("Identity Verified")).toBeLessThan(caseDetailSource.indexOf("Case Verification Documents"));
    expect(caseDetailSource).toContain("whitespace-nowrap text-xs font-bold");
    expect(caseDetailSource).toContain("flex min-w-0 flex-1 items-center justify-center gap-2");
  });

  it("opens contribution instructions without consuming an unlock while full payment stays credit-gated", () => {
    expect(caseDetailSource).toContain("const [contributionOpen, setContributionOpen] = useState(false);");
    expect(caseDetailSource).toContain("!unlocked && !isOwner && !contributionOpen");
    expect(caseDetailSource).toContain("setContributionOpen(true);");
    expect(caseDetailSource).toContain("onClick={() => handleUnlock(\"partial\")}");
    expect(caseDetailSource).toContain("onClick={() => handleUnlock(\"full\")}");
    expect(caseDetailSource).toContain("Contribute to Givethra Fundraising");
    expect(caseDetailSource).toContain("GIVETHRA_NAYAPAY_IBAN");
    expect(caseDetailSource).toContain("const paidTo = contributionOpen || myUnlock?.payment_type === \"partial\" ? \"givethra\" : \"institute\";");
    expect(caseDetailSource).toContain("contributionOpen ? pledgeNum");
    expect(caseDetailSource).toContain('const isFreeContribution = mode === "partial" && userUnlockCount < 3;');
    expect(caseDetailSource).toContain("Help Now — Direct Payment (1 credit)");
    expect(caseDetailSource).toContain("3 contribution helps are FREE");
    expect(caseDetailSource).toContain("Contribution helps after the first 3 require 1 credit.");
    expect(caseDetailSource).toContain("(myUnlock || unlockMode !== \"choose\") && (");
  });

  it("shows wallet guidance and enforces Contribution amount and free-use rules", () => {
    expect(caseDetailSource).toContain("const [walletBalance, setWalletBalance] = useState(0);");
    expect(caseDetailSource).toContain("You have 0 credits.");
    expect(caseDetailSource).toContain('navigate({ to: "/wallet" })');
    expect(caseDetailSource).toContain("const freeContributionRemaining = Math.max(3 - userUnlockCount, 0);");
    expect(caseDetailSource).toContain("freeContributionRemaining > 0");
    expect(caseDetailSource).toContain("pledgeNum < 100");
    expect(caseDetailSource).toContain("min={100}");
    expect(caseDetailSource).toContain("max={remaining}");
  });

  it("keeps verification appeal video view-only after unlock", () => {
    expect(caseDetailSource).toContain("Verification Appeal Video (View Only)");
    expect(caseDetailSource).toContain('controlsList="nodownload noplaybackrate"');
    expect(caseDetailSource).toContain("disablePictureInPicture");
    expect(caseDetailSource).toContain("onContextMenu={e => e.preventDefault()}");
  });

  it("keeps the Direct Payment lookup isolated from Contribution unlocks", () => {
    const apiSource = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8");
    const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
    expect(apiSource).toContain("paymentType: \"full\" | \"partial\" = \"full\"");
    expect(apiSource).toContain("payment_type=${paymentType}");
    expect(workerSource).toContain('filters.push("payment_type = ?")');
  });
});
