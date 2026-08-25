import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const kycSource = fs.readFileSync(path.join(root, "src/pages/KycPage.tsx"), "utf8");
const caseSource = fs.readFileSync(path.join(root, "src/pages/CaseDetailPage.tsx"), "utf8");

describe("video recording audio quality", () => {
  it("uses clear-audio constraints and Opus bitrate for KYC proof video", () => {
    expect(kycSource).toContain("echoCancellation: true");
    expect(kycSource).toContain("noiseSuppression: true");
    expect(kycSource).toContain("autoGainControl: true");
    expect(kycSource).toContain("sampleRate: { ideal: 48000 }");
    expect(kycSource).toContain('const preferredMimeType = "video/webm;codecs=vp8,opus"');
    expect(kycSource).toContain("audioBitsPerSecond: 128000");
    expect(kycSource).toContain("const recordedType = recorder.mimeType || mimeType");
  });

  it("uses the same clear-audio path for feedback video", () => {
    expect(caseSource).toContain("echoCancellation: true");
    expect(caseSource).toContain("noiseSuppression: true");
    expect(caseSource).toContain("autoGainControl: true");
    expect(caseSource).toContain("sampleRate: { ideal: 48000 }");
    expect(caseSource).toContain('const preferredMimeType = "video/webm;codecs=vp8,opus"');
    expect(caseSource).toContain("audioBitsPerSecond: 128000");
    expect(caseSource).toContain("const recordedType = recorder.mimeType || mimeType");
  });
});

export {};
