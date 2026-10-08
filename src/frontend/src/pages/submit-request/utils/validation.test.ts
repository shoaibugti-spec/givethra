import { describe, expect, it } from "vitest";
import { validateStep } from "./validation";
import { getRequiredEmploymentDocumentKeys } from "../employment";

const base = {
  category: "Food & Groceries",
  title: "Food support",
  shortDesc: "Monthly groceries",
  country: "Pakistan",
  city: "Karachi",
  urgency: "Medium",
  gender: "Female",
  maritalStatus: "Single",
  isOrphan: "No",
  genderDocUrls: { frc: "https://files.test/frc.jpg" },
  seekerName: "Test User",
  seekerContact: "03000000000",
  jobStatus: "No",
  statementUrl: "https://files.test/statement.pdf",
  catFields: { family_members: "4", shop_name: "Test Shop", groceries_amount: "5000" },
  catDocUrls: { groceries_estimate: "https://files.test/estimate.jpg" },
  propertyOwnership: "owned",
  ownerCnicUrl: "https://files.test/owner.jpg",
  ownerRelation: "Myself",
  receiverName: "Test Shop",
  receiverContact: "03000000000",
  receiverBank: "Test Bank",
  receiverAccount: "123456",
  receiverAddress: "Karachi",
  receiverShopName: "Test Shop",
  description: Array.from({ length: 200 }, () => "help").join(" "),
  amount: "5000",
  currency: "PKR",
  deadline: "2099-01-01",
  selfieUrl: "https://files.test/selfie.jpg",
  videoUrl: "https://files.test/video.webm",
  confirmed: true,
};

describe("submit request validation", () => {
  it("accepts uploaded URL strings without requiring a new file selection", () => {
    expect(validateStep("categoryDetails", base)).toBeNull();
    expect(validateStep("ownedDocuments", base)).toBeNull();
    expect(validateStep("genderDocuments", base)).toBeNull();
  });

  it("accepts a checked Terms value and rejects an unchecked value", () => {
    expect(validateStep("terms", { ...base, confirmed: true })).toBeNull();
    expect(validateStep("terms", { ...base, confirmed: false })).toContain("agree");
  });

  it("uses the same nested keys written by category forms", () => {
    const form = { ...base, category: "Emergency Help", catFields: { emergency_type: "Fire", emergency_description: "Urgent help needed" }, catDocUrls: { emergency_proof: "https://files.test/proof.jpg" } };
    expect(validateStep("categoryDetails", form)).toBeNull();
  });

  it("requires the fixed Rs 3,000 Emergency amount", () => {
    expect(validateStep("amount", { ...base, category: "Emergency Help", amount: "3000" })).toBeNull();
    expect(validateStep("amount", { ...base, category: "Emergency Help", amount: "2500" })).toContain("fixed at Rs 3,000");
  });

  it("requires 1–300 units for Gas and Water without requiring appliances", () => {
    for (const category of ["Gas Bill", "Water Bill"]) {
      const fields = { monthly_units: "120", bill_owner_name: "Test User", company: "Utility Company" };
      const valid = { ...base, category, instituteName: "Utility Company", refNumber: "REF-123", catFields: fields, catDocUrls: { bill: "https://files.test/bill.jpg" } };
      expect(validateStep("categoryDetails", valid)).toBeNull();
      expect(validateStep("categoryDetails", { ...valid, catFields: { ...fields, monthly_units: "" } })).toContain("usage in units");
      expect(validateStep("categoryDetails", { ...valid, catFields: { ...fields, monthly_units: "301" } })).toContain("above 300");
    }
  });

  it("keeps appliances exclusive to Electricity", () => {
    const common = { ...base, instituteName: "Utility Company", refNumber: "REF-123", catDocUrls: { bill: "https://files.test/bill.jpg" } };
    expect(validateStep("categoryDetails", { ...common, category: "Electricity Bill", catFields: { monthly_units: "120", bill_owner_name: "Test User", company: "Utility Company" } })).toContain("appliance");
    expect(validateStep("categoryDetails", { ...common, category: "Electricity Bill", catFields: { monthly_units: "120", bill_owner_name: "Test User", company: "Utility Company", appliances: { fan: 1 } } })).toBeNull();
  });

  it("requires pension proof for Retired and previous-income proof for former workers", () => {
    expect(getRequiredEmploymentDocumentKeys("Retired")).toEqual(["pensionProofUrl", "statementUrl"]);
    expect(getRequiredEmploymentDocumentKeys("Previously Employed / Left Job / Laid Off")).toEqual(["previousIncomeProofUrl", "statementUrl"]);
    expect(getRequiredEmploymentDocumentKeys("Unemployed / Housewife")).toContain("supportDeclarationUrl");
  });
});
