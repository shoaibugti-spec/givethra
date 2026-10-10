import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./AdminDashboard.tsx", import.meta.url), "utf8");

describe("Admin KYC media previews", () => {
  it("normalizes legacy upload query URLs for inline documents and video", () => {
    expect(source).toContain("function normalizeAdminMediaUrl");
    expect(source).toContain('parsed.pathname === "/uploads"');
    expect(source).toContain("parsed.searchParams.get(\"key\")");
    expect(source).toContain("normalizeAdminMediaUrl(kyc.face_video_url)");
    expect(source).toContain("preload=\"metadata\"");
  });

  it("keeps KYC image previews openable and visibly sized", () => {
    expect(source).toContain("href={normalizedUrl}");
    expect(source).toContain("src={normalizedUrl}");
    expect(source).toContain("min-h-20");
  });
});
