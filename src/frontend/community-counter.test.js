import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerSource = fs.readFileSync(path.join(root, "worker.js"), "utf8");
const layoutSource = fs.readFileSync(path.join(root, "src/components/Layout.tsx"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "src/lib/api.ts"), "utf8");
const wallSource = fs.readFileSync(path.join(root, "src/components/FeedbackWall.tsx"), "utf8");
const supportSource = fs.readFileSync(path.join(root, "src/pages/SupportChatPage.tsx"), "utf8");
const feedbackWallSource = fs.readFileSync(path.join(root, "src/components/FeedbackWall.tsx"), "utf8");

describe("Community unread counter", () => {
  it("tracks per-actor seen posts and refreshes every ten minutes", () => {
    expect(layoutSource).toContain("givethra_community_seen_at:");
    expect(layoutSource).toContain("setInterval(fetchPostCount, 600000)");
    expect(layoutSource).toContain("setPostCount(0)");
    expect(layoutSource).toContain("getGuestId()");
  });

  it("shows only completed-case feedback on the Community Wall", () => {
    expect(workerSource).toContain("WHERE lower(COALESCE(c.status, '')) = 'completed'");
    expect(workerSource).toContain("INSERT INTO feedbacks (id, case_id, user_id, rating, comment, video_url, created_at)");
    expect(workerSource).toContain("Feedback is available only for your completed case");
    expect(feedbackWallSource).toContain("fb.comment || fb.text_message");
    expect(feedbackWallSource).toContain("Feedback for: {fb.case_title}");
    expect(feedbackWallSource).toContain("src={fb.video_url}");
  });

  it("shows a ranked popular slider and refreshes it hourly without blocking", () => {
    expect(wallSource).toContain("Popular posts");
    expect(wallSource).toContain(".slice(0, 10)");
    expect(wallSource).toContain("60 * 60 * 1000");
    expect(wallSource).toContain("loadWall(true)");
    expect(wallSource).toContain("Previous popular post");
    expect(wallSource).toContain("Next popular post");
  });

  it("reloads support messages without browser cache or page-level auto-scroll", () => {
    expect(apiSource).toContain('cache: "no-store"');
    expect(supportSource).not.toContain("scrollIntoView");
    expect(supportSource).toContain("await loadMessages()");
  });

  it("surfaces non-success posts responses instead of accepting an error object", () => {
    expect(apiSource).toContain("if (!res.ok) throw new Error");
    expect(apiSource).toContain("return Array.isArray(data) ? data : []");
  });
});
