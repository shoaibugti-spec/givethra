import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const page = fs.readFileSync(path.join(root, "src/pages/SubmitRequestPage.tsx"), "utf8");
const worker = fs.readFileSync(path.join(root, "worker.js"), "utf8");

describe("Submit Request policy", () => {
  it("keeps two free cases and charges from the third onward", () => {
    expect(page).toContain("const MAX_FREE_CASES = 2;");
    expect(page).toContain("const firstFree = freshFreeUsed < MAX_FREE_CASES && !freeDisabled;");
    expect(page).toContain("Your first two cases are FREE.");
    expect(page).not.toContain("const firstFree = (freshCases?.length || 0) === 0");
  });

  it("suspends after five rejected cases and uses the configured five-credit unlock", () => {
    expect(page).toContain("const MAX_REJECTIONS_BEFORE_SUSPENSION = 5;");
    expect(page).toContain("const UNLOCK_CREDITS_REQUIRED = 5;");
    expect(page).toContain("const userSuspended = freshRejections >= MAX_REJECTIONS_BEFORE_SUSPENSION;");
  });

  it("writes only production suspension columns and guards wallet balance", () => {
    expect(worker).toContain("UPDATE wallets SET balance = balance - ?");
    expect(worker).toContain("credits_used_to_unlock");
    expect(worker).toContain("suspended_at");
    expect(worker).not.toContain("created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
  });
});

export {};
