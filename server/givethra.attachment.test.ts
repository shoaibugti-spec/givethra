import { describe, it, expect } from "vitest";

describe("Case Attachment Normalization", () => {
  it("should correctly aggregate multiple supporting caseFiles (Bill, Agreement, ID) with selfieUrl and videoUrl", () => {
    const record = {
      id: 202,
      selfieUrl: "https://example.com/selfie.jpg",
      selfieKey: "selfie_key",
      videoUrl: "https://example.com/video.mp4",
      videoKey: "video_key",
      submittedAt: Date.now(),
    };

    const files = [
      { id: 1, caseId: 202, fileName: "Electricity Bill", mimeType: "image/png", storageKey: "bill_key", storageUrl: "https://example.com/bill.png", createdAt: Date.now() },
      { id: 2, caseId: 202, fileName: "Rental Agreement", mimeType: "application/pdf", storageKey: "agreement_key", storageUrl: "https://example.com/agreement.pdf", createdAt: Date.now() },
      { id: 3, caseId: 202, fileName: "Landlord CNIC", mimeType: "image/jpeg", storageKey: "cnic_key", storageUrl: "https://example.com/cnic.jpg", createdAt: Date.now() },
    ];

    const augmented = [...files];
    if (record.selfieUrl && !augmented.some(f => f.storageUrl === record.selfieUrl)) {
      augmented.push({ id: -1, caseId: record.id, fileName: "Selfie Appeal", mimeType: "image/jpeg", storageKey: record.selfieKey || "", storageUrl: record.selfieUrl, createdAt: record.submittedAt });
    }
    if (record.videoUrl && !augmented.some(f => f.storageUrl === record.videoUrl)) {
      augmented.push({ id: -2, caseId: record.id, fileName: "Video Appeal", mimeType: "video/mp4", storageKey: record.videoKey || "", storageUrl: record.videoUrl, createdAt: record.submittedAt });
    }

    expect(augmented.length).toBe(5);
    expect(augmented.map(f => f.fileName)).toEqual([
      "Electricity Bill",
      "Rental Agreement",
      "Landlord CNIC",
      "Selfie Appeal",
      "Video Appeal",
    ]);
  });
});
