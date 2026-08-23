import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerSource = fs.readFileSync(path.join(root, "worker.js"), "utf8");
const communitySource = fs.readFileSync(path.join(root, "src/pages/CommunityPage.tsx"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "src/lib/api.ts"), "utf8");

describe("public Community guest flow", () => {
  it("keeps guest identity and public Community writes available", () => {
    expect(apiSource).toContain('localStorage.getItem("givethra_guest_id")');
    expect(apiSource).toContain('"X-Guest-ID": getGuestId()');
    expect(workerSource).toContain("function guestIdentity(request, body = null)");
    expect(workerSource).toContain("guest_id");
    expect(communitySource).toContain("Public New Post Box: guests and signed-in users can post");
    expect(communitySource).toContain("createCommunityPost(payload)");
  });

  it("keeps guest likes/comments public and rejects empty post copy in the Community UI", () => {
    expect(communitySource).toContain("toggleLike(postId)");
    expect(communitySource).toContain("addComment(postId");
    expect(communitySource).toContain('toast.error("Please write something.")');
    expect(communitySource).not.toContain('toast.error("Please sign in to post.")');
    expect(communitySource).not.toContain('toast.error("Please sign in to like.")');
    expect(communitySource).not.toContain('toast.error("Please sign in to comment.")');
  });
});
