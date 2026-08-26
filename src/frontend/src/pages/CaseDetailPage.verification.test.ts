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
    expect(caseDetailSource).toContain("const [fullUnlock, contributionUnlock, mediaUnlock, count, res, kyc, prof] = await Promise.all([");
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
    expect(caseDetailSource).toContain("{mediaUnlocked ? (");
  });

  it("shows wallet guidance and enforces Contribution amount and free-use rules", () => {
    expect(caseDetailSource).toContain("const [walletBalance, setWalletBalance] = useState(0);");
    expect(caseDetailSource).toContain("You have 0 credits.");
    expect(caseDetailSource).toContain('navigate({ to: "/wallet" })');
    expect(caseDetailSource).toContain("const freeContributionRemaining = Math.max(3 - userUnlockCount, 0);");
    expect(caseDetailSource).toContain("freeContributionRemaining > 0");
    expect(caseDetailSource).toContain("paidNum < 100");
    expect(caseDetailSource).toContain("min={100}");
    expect(caseDetailSource).toContain("max={remaining}");
    expect(caseDetailSource).toContain("Unlock this Contribution first. The amount field and Givethra payment details will open after the unlock.");
    expect(caseDetailSource).toContain("setContributionOpen(true);");
    expect(caseDetailSource).toContain("setAmountPaid(e.target.value)");
    expect(caseDetailSource).toContain("unlockMode === \"partial\" && paidNum < 100");
    expect(caseDetailSource).toContain("unlockMode === \"partial\" && paidNum > remaining");
  });

  it("uses the case Category instead of free-form Resolution Type for Direct Payment", () => {
    expect(caseDetailSource).toContain('const submittedResType = unlockMode === "full" ? String(caseData?.category || "Direct Payment") : resType;');
    expect(caseDetailSource).toContain("Payment Category *");
    expect(caseDetailSource).toContain("{caseData?.category || \"Direct Payment\"}");
    expect(caseDetailSource).toContain("resolution_type: submittedResType");
    expect(caseDetailSource).toContain('["Contribution", "Partial Help", "Other"]');
    expect(caseDetailSource).not.toContain('"Bill Paid", "School Fee Paid", "Hospital Paid"');
  });

  it("restores Direct Payment receiver details and mandatory proof submission", () => {
    expect(caseDetailSource).toContain("Direct Payment Receiver Details");
    expect(caseDetailSource).toContain("receiver_name");
    expect(caseDetailSource).toContain("receiver_bank");
    expect(caseDetailSource).toContain("receiver_account");
    expect(caseDetailSource).toContain("Consumer / Reference Number");
    expect(caseDetailSource).toContain("Amount Paid ({cur}) *");
    expect(caseDetailSource).toContain("Transaction ID / Payment Reference *");
    expect(caseDetailSource).toContain("Attach Payment Receipt *");
    expect(caseDetailSource).toContain('accept="image/*,.pdf"');
    expect(caseDetailSource).toContain("Submit Direct Payment Proof");
    expect(caseDetailSource).toContain("Please attach your payment receipt before submitting proof.");
    expect(caseDetailSource).toContain('paid_to: paidTo');
  });

  it("keeps first-help proof controls directly visible without a hidden CTA", () => {
    expect(caseDetailSource).toContain("(!showResolution && myResolutions.length > 0) ? (");
    expect(caseDetailSource).toContain('type="file" accept="image/*,.pdf"');
    expect(caseDetailSource).toContain("Transaction ID / Payment Reference *");
    expect(caseDetailSource).toContain("Amount Paid ({cur}) *");
    expect(caseDetailSource).toContain("Submit Contribution Proof");
    expect(caseDetailSource).toContain("Submit Direct Payment Proof");
  });

  it("auto-opens the first-help proof form after unlock", () => {
    expect(caseDetailSource).toContain("setShowResolution(Boolean(activeUnlock && loadedResolutions.length === 0));");
    expect(caseDetailSource).toContain("setShowResolution(true);");
    expect(caseDetailSource).toContain("Submit Direct Payment Proof");
    expect(caseDetailSource).toContain("Submit Contribution Proof");
    expect(caseDetailSource).toContain("Attach Payment Receipt *");
  });

  it("keeps unlocked help content in the requested mobile-safe order", () => {
    const mediaPosition = caseDetailSource.indexOf("order-1 min-w-0 overflow-hidden rounded-2xl bg-card border border-border");
    const receiverPosition = caseDetailSource.indexOf("order-2 min-w-0 overflow-hidden rounded-2xl bg-card border-2 border-primary/20");
    const proofPosition = caseDetailSource.indexOf("order-3 min-w-0 overflow-hidden rounded-2xl bg-card border border-border");
    expect(mediaPosition).toBeGreaterThan(-1);
    expect(receiverPosition).toBeGreaterThan(-1);
    expect(proofPosition).toBeGreaterThan(-1);
    expect(caseDetailSource).toContain("flex min-w-0 flex-col gap-4");
    expect(caseDetailSource).toContain("break-words whitespace-normal");
    expect(caseDetailSource).toContain("flex flex-col gap-2 sm:flex-row");
    expect(caseDetailSource).toContain("order-1 min-w-0 overflow-hidden rounded-2xl bg-card border border-border");
    expect(caseDetailSource).toContain("order-2 min-w-0 overflow-hidden rounded-2xl bg-card border-2 border-primary/20");
    expect(caseDetailSource).toContain("order-3 min-w-0 overflow-hidden rounded-2xl bg-card border border-border");
  });

  it("keeps verification appeal video view-only after unlock", () => {
    expect(caseDetailSource).toContain("Verification Appeal Video (View Only)");
    expect(caseDetailSource).toContain('controlsList="nodownload noplaybackrate"');
    expect(caseDetailSource).toContain("disablePictureInPicture");
    expect(caseDetailSource).toContain("onContextMenu={e => e.preventDefault()}");
  });

  it("grants media from Direct Payment but keeps Contribution media separately locked", () => {
    expect(caseDetailSource).toContain('getCaseUnlock(id, user.id, "media")');
    expect(caseDetailSource).toContain('payment_type: "media"');
    expect(caseDetailSource).toContain("Verification Media is locked.");
    expect(caseDetailSource).toContain("Unlock Verification Media (1 credit)");
    expect(caseDetailSource).toContain("view verification media");
    expect(caseDetailSource).toContain("setMediaUnlocked(!!mediaUnlock || !!fullUnlock || owner)");
    expect(caseDetailSource).toContain("Contribution remains separately gated behind its own media credit.");
    expect(caseDetailSource).toContain("setWalletBalance(prev => Math.max(prev - 1, 0))");
  });

  it("keeps the Direct Payment lookup isolated from Contribution unlocks", () => {
    const apiSource = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8");
    const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
    expect(apiSource).toContain("paymentType: \"full\" | \"partial\" | \"media\" = \"full\"");
    expect(apiSource).toContain("payment_type=${paymentType}");
    expect(workerSource).toContain('filters.push("payment_type = ?")');
    expect(workerSource).toContain('requestedType === "media"');
    expect(workerSource).toContain('body?.payment_type === "media"');
  });
});
