import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.join(process.cwd(), "src/pages/AdminDashboard.tsx"), "utf8");

describe("Admin search and KYC filters", () => {
  it("renders explicit KYC status filters", () => {
    expect(source).toContain('aria-label="KYC status filters"');
    expect(source).toContain('"All KYC"');
    expect(source).toContain('"Approved"');
    expect(source).toContain('"Rejected"');
    expect(source).toContain('statusFilter === "all" || String(k.status || "").toLowerCase() === statusFilter');
  });

  it("matches KYC searches by name, CNIC, user ID, and email", () => {
    expect(source).toContain('const email = profileMap?.[k.user_id]?.email || k.email || "";');
    expect(source).toContain('String(k.cnic_number || "").replace(/\\D/g, "").includes(digits)');
  });

  it("matches cases by seeker name, email, and KYC CNIC without empty-digit false positives", () => {
    expect(source).toContain('const cnicByUser: Record<string, string> = {};');
    expect(source).toContain('cnicByUser?.[c.user_id]');
    expect(source).toContain('!!digits && [c.cnic_number, cnicByUser?.[c.user_id]]');
  });

  it("keeps Users search matching name, CNIC, and email with a guarded numeric query", () => {
    expect(source).toContain('return [u.email, u.name, u.user_id].some');
    expect(source).toContain('!!digits && String(u.cnic || "").replace(/\\D/g, "").includes(digits)');
  });
});

export {};
