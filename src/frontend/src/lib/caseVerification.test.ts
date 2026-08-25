import { describe, expect, it } from "vitest";
import { getApprovedCaseItems } from "./caseVerification";

describe("approved case verification items", () => {
  it("lists present media and category documents once", () => {
    const items = getApprovedCaseItems({
      photo_urls: ["https://cdn.test/photo.jpg"],
      selfie_url: "https://cdn.test/selfie.jpg",
      video_url: "https://cdn.test/video.webm",
      category_details: {
        _documents: {
          rent_bill: { url: "https://cdn.test/rent.pdf", original_name: "rent-bill.pdf" },
          duplicate: { url: "https://cdn.test/other.pdf", original_name: "rent-bill.pdf" },
          income_proof: { url: "https://cdn.test/income.pdf" },
        },
      },
    });

    expect(items.map((item) => item.label)).toEqual([
      "Case Photos",
      "Live Selfie",
      "Video Statement",
      "Rent Bill Verification",
      "Income Proof Verification",
    ]);
  });

  it("handles empty or legacy payloads safely", () => {
    expect(getApprovedCaseItems({})).toEqual([]);
    expect(getApprovedCaseItems({ category_details: { _documents: { bill: true } } })).toEqual([
      { label: "Bill Verification", source: "document" },
    ]);
  });

  it("includes nested category document fields exactly once", () => {
    const items = getApprovedCaseItems({
      category_details: {
        _documents: { bill: { url: "https://cdn.test/bill.pdf" } },
        edu_documents: {
          student_id_proof: "https://cdn.test/id.pdf",
          fee_challan: "https://cdn.test/fee.pdf",
        },
      },
    });

    expect(items.map((item) => item.label)).toEqual([
      "Bill Verification",
      "Student ID Verification",
      "Fee Challan Verification",
    ]);
  });
});
