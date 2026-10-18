import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const adminSource = readFileSync(new URL("./AdminDashboard.tsx", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
const communitySource = readFileSync(new URL("./CommunityPage.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("./HomePage.tsx", import.meta.url), "utf8");

describe("community-only Public Posts", () => {
  it("does not render an Admin Posts tab or public-post moderation card", () => {
    expect(adminSource).not.toContain('value="posts"');
    expect(adminSource).not.toContain("PublicPostCard");
  });

  it("writes new public posts as approved community content", () => {
    expect(workerSource).toContain("INSERT INTO community_posts");
    expect(workerSource).toContain("const displayName = user");
  });

  it("enforces one post per actor in a rolling 24-hour window on the server", () => {
    expect(workerSource).toContain("COMMUNITY_POST_LIMIT");
    expect(workerSource).toContain("julianday(created_at) > julianday('now', '-24 hours')");
    expect(workerSource).toContain("next_post_at");
  });

  it("allows only admins to delete community posts and cleans engagement rows", () => {
    expect(workerSource).toContain('request.method === "DELETE" && parts.length === 4');
    expect(workerSource).toContain("if (!isAdmin(user))");
    expect(workerSource).toContain("DELETE FROM community_post_comments");
    expect(workerSource).toContain("DELETE FROM community_post_likes");
    expect(communitySource).toContain('aria-label="Moderate post"');
    expect(communitySource).toContain("canModerateCommunity");
    expect(communitySource).toContain("<span>Delete</span>");
    expect(communitySource).toContain("shoaibugti@gmail.com");
    expect(communitySource).toContain("shoaibahmedbugti5@gmail.com");
  });

  it("keeps avatars available for posts and comments", () => {
    expect(workerSource).toContain("COALESCE(NULLIF(p.avatar_url, ''), NULLIF(u.avatar_url, '')) AS avatar_url");
    expect(communitySource).toContain("comment.avatar_url");
    expect(communitySource).toContain("avatar_url: user?.photo || null");
  });

  it("keeps the composer in Community Posts and the feedback wall on HomePage", () => {
    expect(communitySource).toContain("setNewPost");
    expect(communitySource).toContain("What's on your mind? Share your thoughts...");
    expect(homeSource).toContain("<KindnessWall />");
  });

  it("keeps the four feed tabs mapped to distinct server ranking contracts", () => {
    expect(communitySource).toContain('setFeedTab("latest")');
    expect(communitySource).toContain('setFeedTab("most-supported")');
    expect(communitySource).toContain('setFeedTab("my-posts")');
    expect(workerSource).toContain('tab === "latest"');
    expect(workerSource).toContain('tab === "most-supported"');
    expect(workerSource).toContain('tab === "my-posts"');
    expect(workerSource).toContain("cp.created_at DESC, cp.id DESC");
    expect(workerSource).toContain("COALESCE(sc.support_count, 0) DESC");
  });

  it("keeps separate Direct Payments and Contributions admin queues", () => {
    expect(adminSource).toContain('value="verify">Direct Payments');
    expect(adminSource).toContain('value="contributions">Contributions');
    expect(adminSource).toContain('value="contributions" className');
    expect(adminSource).toContain("pendingDirectCount");
    expect(adminSource).toContain("pendingContributionCount");
    expect(adminSource).toContain("completedDirectResolutions");
    expect(adminSource).toContain("completedContributions");
  });

  it("keeps approved seeker feedback in the Kindness Wall path", () => {
    expect(homeSource).toContain("<KindnessWall />");
  });
});
