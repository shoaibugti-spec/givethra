import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const adminSource = readFileSync(new URL("./AdminDashboard.tsx", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");

describe("rejected file cleanup contract", () => {
  it("uses the Admin cleanup action without sending an empty client-side file list as the implementation", () => {
    expect(adminSource).toContain("async function cleanupAllRejectedFiles()");
    expect(adminSource).toContain("const result = await adminDeleteFiles([]);");
    expect(adminSource).toContain("rejected_records");
    expect(adminSource).toContain("Cleanup Rejected Files (Free Storage Space)");
  });

  it("discovers rejected records across every file-bearing moderation area", () => {
    expect(workerSource).toContain("async function getRejectedFileCleanupRecords(env)");
    for (const table of [
      "kyc_submissions",
      "case_submissions",
      "deposits",
      "feedbacks",
      "case_resolutions",
      "donations",
      "dream_participations",
      "withdrawal_requests",
    ]) {
      expect(workerSource).toContain(`\"${table}\"`);
    }
    expect(workerSource).toContain("const uniqueUrls = [...new Set(records.flatMap((record) => record.urls))];");
  });

  it("only deletes files from the app's own uploads origin", () => {
    expect(workerSource).toContain("if (!PUBLIC_ORIGINS.has(parsed.origin))");
    expect(workerSource).toContain("await env.UPLOADS.delete(key)");
  });
});
