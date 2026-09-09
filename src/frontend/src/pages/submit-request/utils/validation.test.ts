import { describe, expect, it } from "vitest";
import { validateStep } from "./validation";

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
});
