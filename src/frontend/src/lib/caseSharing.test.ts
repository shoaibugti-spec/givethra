import { describe, expect, it } from "vitest";
import { buildCaseShareData } from "./caseSharing";
import fs from "node:fs";
import path from "node:path";

const casesPageSource = fs.readFileSync(path.join(process.cwd(), "src/pages/CasesPage.tsx"), "utf8");
const detailPageSource = fs.readFileSync(path.join(process.cwd(), "src/pages/CaseDetailPage.tsx"), "utf8");

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

  it("keeps the published-case actions clear and compact", () => {
    expect(casesPageSource).toContain('<span className="text-[10px] font-semibold">Share</span>');
    expect(detailPageSource).toContain("Case Story (What You Need Help With)");
    expect(detailPageSource).toContain("Help Now — Pay Full");
    expect(detailPageSource).toContain("Help Now — Contribute");
    expect(detailPageSource).toContain("Only ${daysLeft} days left to help");
  });

  it("falls back to the longer description and safe encoded case id", () => {
    const payload = buildCaseShareData({ id: "case/with spaces", description: "Please help this person today." }, "https://givethra.org");
    expect(payload.text).toContain("Please help this person today.");
    expect(payload.url).toBe("https://givethra.org/cases/case%2Fwith%20spaces");
  });
});

export {};
