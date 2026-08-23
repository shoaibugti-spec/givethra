import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const workerSource = fs.readFileSync(path.join(process.cwd(), "worker.js"), "utf8");

describe("Admin production data routes", () => {
  it("maps every Admin table to an existing production timestamp column", () => {
    const expected = [
      ['users: { table: "users", order: "updated_at" }', "users"],
      ['kyc: { table: "kyc_submissions", order: "submitted_at" }', "kyc"],
      ['cases: { table: "case_submissions", order: "submitted_at" }', "cases"],
      ['deposits: { table: "deposits", order: "submitted_at" }', "deposits"],
      ['profiles: { table: "profiles", order: "updated_at" }', "profiles"],
      ['wallets: { table: "wallets", order: "updated_at" }', "wallets"],
      ['unlocks: { table: "case_unlocks", order: "unlocked_at" }', "unlocks"],
      ['"support-messages": { table: "support_messages", order: "created_at" }', "support"],
      ['feedbacks: { table: "feedbacks", order: "created_at" }', "feedbacks"],
      ['offers: { table: "category_offers", order: "updated_at" }', "offers"],
      ['suspensions: { table: "user_suspensions", order: "suspended_at" }', "suspensions"],
    ];
    for (const [marker] of expected) expect(workerSource).toContain(marker);
    const adminBlock = workerSource.slice(workerSource.indexOf('if (parts[1] === "admin")'), workerSource.indexOf('// Case unlocks'));
    expect(adminBlock).not.toContain("ORDER BY created_at DESC");
  });

  it("keeps Admin authentication before data access", () => {
    const adminIndex = workerSource.indexOf('if (parts[1] === "admin")');
    const authIndex = workerSource.indexOf('if (!isAdmin(user)) return json({ error: "Admin access required" }', adminIndex);
    expect(adminIndex).toBeGreaterThan(-1);
    expect(authIndex).toBeGreaterThan(adminIndex);
  });
});
