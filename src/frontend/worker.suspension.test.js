import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workerSource = readFileSync(new URL("./worker.js", import.meta.url), "utf8");

describe("account suspension enforcement contract", () => {
  it("centralizes active suspension detection and returns a clear five-credit action error", () => {
    expect(workerSource).toContain("async function getActiveSuspension(env, userId)");
    expect(workerSource).toContain('code: "ACCOUNT_SUSPENDED"');
    expect(workerSource).toContain("required_credits: 5");
    expect(workerSource).toContain("profile_is_suspended");
  });

  it("blocks case submission, case unlocks, and help resolutions for suspended users", () => {
    expect(workerSource).toContain('if (request.method === "POST" && !parts[2]) {\n    if (!user) return json({ error: "Authentication required" }, 401, origin);');
    expect(workerSource).toContain('if (suspension) return suspendedActionResponse(origin, suspension);');
    expect(workerSource).toContain('Unauthorized unlock request');
    expect(workerSource).toContain('Unauthorized help submission');
    expect(workerSource.match(/suspendedActionResponse\(origin, suspension\)/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it("binds self-reactivation to the authenticated user and charges five credits atomically", () => {
    expect(workerSource).toContain('if (!user || (!isAdmin(user) && user.user_id !== userId)) return json({ error: "Forbidden" }, 403, origin);');
    expect(workerSource).toContain('const unlockCost = 5;');
    expect(workerSource).toContain('UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE user_id = ? AND balance >= ?');
    expect(workerSource).toContain('if (!Number(charged?.meta?.changes || 0))');
    expect(workerSource).toContain('UPDATE user_suspensions SET is_active = 0');
    expect(workerSource).toContain('UPDATE profiles SET is_suspended = 0, suspended_reason = NULL');
    expect(workerSource).toContain('UPDATE wallets SET balance = balance + ?, updated_at = ?');
  });
});

export {};
