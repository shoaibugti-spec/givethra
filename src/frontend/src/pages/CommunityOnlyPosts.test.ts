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
    expect(workerSource).toContain("INSERT INTO community_posts (id, user_id, display_name, message, created_at)");
    expect(workerSource).toContain("const displayName = user");
  });

  it("keeps the composer in Community Posts and the feedback wall on HomePage", () => {
    expect(communitySource).toContain("<PublicPostComposer />");
    expect(homeSource).toContain("<FeedbackWall />");
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
    expect(homeSource).toContain("<FeedbackWall />");
  });
});
