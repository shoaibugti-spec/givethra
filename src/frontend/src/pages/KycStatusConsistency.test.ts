import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const worker = fs.readFileSync(path.join(process.cwd(), "worker.js"), "utf8");

describe("KYC status consistency", () => {
  it("uses the newest current submission rather than status-priority ordering", () => {
    expect(worker).toContain("WHERE user_id = ? AND COALESCE(is_current, 1) = 1\n     ORDER BY submitted_at DESC, rowid DESC LIMIT 1");
    expect(worker).not.toContain("WHEN 'approved' THEN 1 WHEN 'pending' THEN 2 WHEN 'rejected' THEN 3");
  });

  it("syncs the user gate to the Admin decision immediately", () => {
    expect(worker).toContain('bind(String(values.status || effectiveKyc?.status || "none").toLowerCase(), now(), current.user_id)');
    expect(worker).toContain('"UPDATE users SET kyc_status = ?, updated_at = ? WHERE user_id = ?"');
  });

  it("returns KYC submissions newest-first for the user status API", () => {
    expect(worker).toContain("SELECT * FROM kyc_submissions WHERE user_id = ? ORDER BY submitted_at DESC, rowid DESC LIMIT ?");
  });
});
