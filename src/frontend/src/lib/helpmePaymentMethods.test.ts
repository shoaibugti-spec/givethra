import { describe, expect, it } from "vitest";
import { displayHelpMePaymentMethod, isValidHelpMeAccountIdentifier, PAY_METHODS } from "./helpme";

describe("global Help Me transfer labels", () => {
  it("offers the same provider-neutral choices for every country", () => {
    expect(Object.keys(PAY_METHODS)).toEqual(["default"]);
    expect(PAY_METHODS.default).toEqual(["Account transfer", "Digital wallet", "Online transfer", "Other"]);
    expect(PAY_METHODS.default.join(" ")).not.toMatch(/easypaisa|jazzcash|paypal|wise|upi/i);
  });

  it("normalizes legacy provider and bank values without displaying their names", () => {
    expect(displayHelpMePaymentMethod("Easypaisa")).toBe("Digital wallet");
    expect(displayHelpMePaymentMethod("JazzCash")).toBe("Digital wallet");
    expect(displayHelpMePaymentMethod("PayPal")).toBe("Online transfer");
    expect(displayHelpMePaymentMethod("UPI")).toBe("Online transfer");
    expect(displayHelpMePaymentMethod("Example Bank Ltd")).toBe("Account transfer");
    expect(displayHelpMePaymentMethod("Unknown provider")).toBe("Other");
    expect(displayHelpMePaymentMethod(null)).toBe("Account transfer");
  });

  it("accepts common international account identifiers without accepting arbitrary punctuation", () => {
    expect(isValidHelpMeAccountIdentifier("GB82 WEST 1234" )).toBe(true);
    expect(isValidHelpMeAccountIdentifier("hero@example.com")).toBe(true);
    expect(isValidHelpMeAccountIdentifier("wallet-12345")).toBe(true);
    expect(isValidHelpMeAccountIdentifier("bad!identifier")).toBe(false);
  });
});
