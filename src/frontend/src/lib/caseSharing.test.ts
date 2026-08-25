import { describe, expect, it } from "vitest";
import { buildCaseShareData } from "./caseSharing";

describe("case sharing", () => {
  it("builds a concise share payload with amount and direct case URL", () => {
    const payload = buildCaseShareData({
      id: "rent-123",
      title: "Help to Pay Rent",
      short_description: "A family needs urgent support to keep their home.",
      amount_needed: 45000,
      currency: "PKR",
    }, "https://givethra.org");

    expect(payload.title).toBe("Help: Help to Pay Rent");
    expect(payload.text).toContain("Help to Pay Rent");
    expect(payload.text).toContain("Rs 45,000");
    expect(payload.url).toBe("https://givethra.org/cases/rent-123");
  });

  it("falls back to the longer description and safe encoded case id", () => {
    const payload = buildCaseShareData({ id: "case/with spaces", description: "Please help this person today." }, "https://givethra.org");
    expect(payload.text).toContain("Please help this person today.");
    expect(payload.url).toBe("https://givethra.org/cases/case%2Fwith%20spaces");
  });
});

export {};
