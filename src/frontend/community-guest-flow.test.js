import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerSource = fs.readFileSync(path.join(root, "worker.js"), "utf8");
const pageSource = fs.readFileSync(path.join(root, "src/pages/CommunityPage.tsx"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "src/lib/api.ts"), "utf8");

describe("public Community Posts flow", () => {
  it("has a stable guest identity and public post/like/comment actors", () => {
    expect(apiSource).toContain('localStorage.getItem("givethra_guest_id")');
    expect(apiSource).toContain('"X-Guest-ID": getGuestId()');
    expect(workerSource).toContain("function guestIdentity(request, body = null)");
    expect(workerSource).toContain("const actorId = user?.user_id || guest?.id;");
    expect(workerSource).toContain("user?.user_id || null, displayName");
  });

  it("keeps the guest composer and public interactions enabled in the UI", () => {
    expect(pageSource).toContain("Public New Post Box: guests and signed-in users can post");
    expect(pageSource).toContain("Public Comment Input");
    expect(pageSource).not.toContain('toast.error("Please sign in to post.")');
    expect(pageSource).not.toContain('toast.error("Please sign in to like.")');
    expect(pageSource).not.toContain('toast.error("Please sign in to comment.")');
  });
});
