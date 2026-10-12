import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(__dirname, "AdminDashboard.tsx"), "utf8");

describe("Admin Dashboard media links", () => {
  it("converts legacy query-style upload URLs to the stable upload route", () => {
    expect(source).toContain('parsed.pathname === "/uploads" || parsed.pathname === "/api/uploads"');
    expect(source).toContain('parsed.pathname = `/uploads/${queryKey.replace(/^\\/+/, "")}`');
  });

  it("normalizes case files before preview and download links", () => {
    expect(source).toContain("const mediaUrl = normalizeAdminMediaUrl(url);");
    expect(source).toContain('href={mediaUrl}');
    expect(source).toContain('src={mediaUrl}');
  });

  it("normalizes feedback, receipts, KYC, and support attachments", () => {
    expect(source).toContain("normalizeAdminMediaUrl(fb.video_url)");
    expect(source).toContain("normalizeAdminMediaUrl(r.receipt_url)");
    expect(source).toContain("normalizeAdminMediaUrl(String(url))");
    expect(source).toContain("normalizeAdminMediaUrl(m.attachment_url)");
  });
});
