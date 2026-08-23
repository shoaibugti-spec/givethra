import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homePageSource = readFileSync(new URL("./HomePage.tsx", import.meta.url), "utf8");
const communityPageSource = readFileSync(new URL("./CommunityPage.tsx", import.meta.url), "utf8");

describe("public Community composer placement", () => {
  it("keeps the homepage focused on cases and does not render a duplicate post composer", () => {
    expect(homePageSource).not.toContain('id="public-post"');
    expect(homePageSource).not.toContain('fetch("/api/public-feedback"');
    expect(homePageSource).not.toContain("Public New Post Box");
  });

  it("keeps the public composer available in Community for guests and signed-in users", () => {
    expect(communityPageSource).toContain("Public New Post Box: guests and signed-in users can post");
    expect(communityPageSource).toContain("What's on your mind? Share your thoughts...");
    expect(communityPageSource).toContain("createCommunityPost(payload)");
    expect(communityPageSource).toContain("Post shared!");
    expect(communityPageSource).toContain("toast.error");
    expect(communityPageSource).toContain("<Textarea");
  });

  it("does not expose internal dashboard visibility instructions", () => {
    expect(homePageSource).not.toContain("Visible only in Admin Dashboard");
    expect(homePageSource).not.toContain("Visible only in Givethra");
    expect(communityPageSource).not.toContain("Visible only in Admin Dashboard");
    expect(communityPageSource).not.toContain("Visible only in Givethra");
  });
});
