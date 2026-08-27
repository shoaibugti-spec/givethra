import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workerSource = readFileSync(new URL("./worker.js", import.meta.url), "utf8");

describe("feedback persistence contract", () => {
  it("binds a submitted feedback row to the authenticated durable user", () => {
    expect(workerSource).toContain('const feedbackUserId = String(user?.user_id || body?.user_id || "").trim();');
    expect(workerSource).toContain('if (!user || !feedbackUserId) return json({ error: "Authentication required" }, 401, origin);');
    expect(workerSource).toContain('String(caseRow.user_id) !== feedbackUserId');
    expect(workerSource).toContain('body.case_id, feedbackUserId, body.rating || null');
  });

  it("accepts completed help proven by an approved admin-confirmed resolution", () => {
    expect(workerSource).toContain('const verifiedCompletion = caseRow');
    expect(workerSource).toContain("lower(COALESCE(status, '')) IN ('approved', 'completed')");
    expect(workerSource).toContain("COALESCE(admin_confirmed, 0) IN (1, '1', 'true')");
    expect(workerSource).toContain('String(caseRow?.status || "").toLowerCase() === "completed" || Boolean(verifiedCompletion?.id)');
  });

  it("creates pending_review feedback that Admin can read without auto-approval", () => {
    expect(workerSource).toContain('"pending_review", now()).run();');
    expect(workerSource).toContain('if (parts[2] === "feedbacks" && recordId)');
    expect(workerSource).toContain('const tableMap = {');
    expect(workerSource).toContain('feedbacks: { table: "feedbacks", order: "created_at" }');
  });
});

export {};

