import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const adminSource = readFileSync(new URL("./AdminDashboard.tsx", import.meta.url), "utf8");
const detailSource = readFileSync(new URL("./CaseDetailPage.tsx", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");

describe("seeker feedback moderation contract", () => {
  it("routes completed-case feedback into the Admin Feedback tab", () => {
    expect(adminSource).toContain('TabsTrigger value="feedback"');
    expect(adminSource).toContain('feedbacks.filter((f) => !!f.case_id)');
    expect(adminSource).toContain("onUpdate={updateFeedback}");
  });

  it("explains when no completed-case feedback has been submitted", () => {
    expect(adminSource).toContain("No seeker feedback submitted yet");
    expect(adminSource).toContain("required caption and video");
  });

  it("keeps the seeker submission pending until Admin approval", () => {
    expect(detailSource).toContain('status: "pending_review"');
    expect(workerSource).toContain('"pending_review"');
    expect(workerSource).toContain("case_status");
  });
});
