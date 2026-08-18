import { describe, it, expect } from "vitest";

describe("Case Attachment Normalization", () => {
  it("should correctly aggregate supporting caseFiles with selfieUrl and videoUrl", () => {
    const record = {
      id: 101,
      selfieUrl: "https://example.com/selfie.jpg",
      selfieKey: "selfie_key",
      videoUrl: "https://example.com/video.mp4",
      videoKey: "video_key",
      submittedAt: Date.now(),
    };

    const files = [
      { id: 1, caseId: 101, fileName: "Electricity Bill", mimeType: "image/png", storageKey: "bill_key", storageUrl: "https://example.com/bill.png", createdAt: Date.now() }
    ];

    const augmented = [...files];
    if (record.selfieUrl && !augmented.some(f => f.storageUrl === record.selfieUrl)) {
      augmented.push({ id: -1, caseId: record.id, fileName: "Selfie Appeal", mimeType: "image/jpeg", storageKey: record.selfieKey || "", storageUrl: record.selfieUrl, createdAt: record.submittedAt });
    }
    if (record.videoUrl && !augmented.some(f => f.storageUrl === record.videoUrl)) {
      augmented.push({ id: -2, caseId: record.id, fileName: "Video Appeal", mimeType: "video/mp4", storageKey: record.videoKey || "", storageUrl: record.videoUrl, createdAt: record.submittedAt });
    }

    expect(augmented.length).toBe(3);
    expect(augmented.map(f => f.fileName)).toContain("Electricity Bill");
    expect(augmented.map(f => f.fileName)).toContain("Selfie Appeal");
    expect(augmented.map(f => f.fileName)).toContain("Video Appeal");
  });
});
