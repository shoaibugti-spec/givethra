import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homePageSource = readFileSync(new URL("./HomePage.tsx", import.meta.url), "utf8");
const communityPageSource = readFileSync(new URL("./CommunityPage.tsx", import.meta.url), "utf8");
const myCasesPageSource = readFileSync(new URL("./MyCasesPage.tsx", import.meta.url), "utf8");

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


describe("homepage Heroes Wall", () => {
  it("renders Heroes Wall, Kindness Wall, and Social Wall immediately before Download App", () => {
    expect(homePageSource).toContain('import HeroesWall from "@/components/HeroesWall";');
    expect(homePageSource).toContain('import KindnessWall from "@/components/KindnessWall";');
    expect(homePageSource).toContain("<KindnessWall />");
    expect(homePageSource).toContain("<FeedbackWall />");
    expect(homePageSource).toContain("<HeroesWall />");
    expect(homePageSource.indexOf("<HeroesWall />")).toBeLessThan(homePageSource.indexOf("Download App"));
    expect(homePageSource.indexOf("<FeedbackWall />")).toBeLessThan(homePageSource.indexOf("Download App"));
  });

  it("keeps completed-case data and impact metrics privacy-safe", () => {
    const heroesWallSource = readFileSync(new URL("../components/HeroesWall.tsx", import.meta.url), "utf8");
    const apiSource = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8");
    const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
    expect(apiSource).toContain("/api/heroes-wall");
    expect(workerSource).toContain("lower(COALESCE(status, '')) = 'completed'");
    expect(workerSource).toContain("lower(COALESCE(r.status, '')) IN ('approved', 'completed')");
    expect(workerSource).toContain("verified_amount");
    expect(workerSource).toContain("solved_cases");
    expect(heroesWallSource).toContain("Heroes Wall");
    expect(heroesWallSource).toContain("Cases solved");
    expect(heroesWallSource).toContain("Total help delivered");
    expect(heroesWallSource).toContain('aria-label="Previous completed case"');
    expect(heroesWallSource).toContain('aria-label="Next completed case"');
  });

  it("keeps Kindness Wall on the approved feedback interaction contract", () => {
    const kindnessWallSource = readFileSync(new URL("../components/KindnessWall.tsx", import.meta.url), "utf8");
    const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
    expect(kindnessWallSource).toContain("getFeedbacks(100)");
    expect(kindnessWallSource).toContain("toggleFeedbackLike(current.id");
    expect(kindnessWallSource).toContain("createComment({ feedback_id: current.id");
    expect(kindnessWallSource).toContain("Kindness Wall");
    expect(workerSource).toContain('parts[0] === "api" && parts[1] === "feedbacks" && request.method === "GET"');
  });

  it("keeps the wall available when social counters or post sync are unavailable", () => {
    const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
    expect(workerSource).toContain("Heroes Wall social post sync failed");
    expect(workerSource).toContain("Heroes Wall social counters unavailable");
    expect(workerSource).toContain("caseRow.verified_amount");
  });

  it("retains completed helper resolutions and exposes the affidavit entry point", () => {
    const apiSource = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8");
    expect(apiSource).toContain("getCaseResolutionsByHero");
    expect(myCasesPageSource).toContain("getCaseResolutionsByHero(user.id)");
    expect(myCasesPageSource).toContain('status: "completed"');
    expect(myCasesPageSource).toContain("affidavit_available: true");
    expect(myCasesPageSource).toContain("View Affidavit & Completed Help");
  });

  it("uses public community interactions for each completed-case card", () => {
    const heroesWallSource = readFileSync(new URL("../components/HeroesWall.tsx", import.meta.url), "utf8");
    expect(heroesWallSource).toContain("toggleLike(current.post_id)");
    expect(heroesWallSource).toContain("getPostComments(current.post_id)");
    expect(heroesWallSource).toContain("addComment(current.post_id");
    expect(heroesWallSource).toContain('aria-label="Comment on completed case"');
  });
});

describe("homepage help slider", () => {
  it("keeps the hand hero as the first slide and includes every supported category", () => {
    expect(homePageSource).toContain('key: "hero"');
    expect(homePageSource).toContain('image: "/assets/generated/hero-givethra.dim_1200x500.jpg"');
    expect(homePageSource).toContain("...FILTER_CATEGORIES.map");
    expect(homePageSource).toContain('key: `category_${category}`');
    expect(homePageSource).toContain('to: "/need-help"');
  });

  it("hides completed free-case prompts and shows credits after the allowance is used", () => {
    expect(homePageSource).toContain("const freeCaseComplete = freeCasesUsed >= 2");
    expect(homePageSource).toContain("if (!freeCaseComplete)");
    expect(homePageSource).toContain('key: "credits"');
    expect(homePageSource).toContain('to: "/become-hero"');
    expect(homePageSource).toContain("getCasesByUser(user.id)");
  });

  it("keeps slide text readable and supports touch navigation without an oversized dot row", () => {
    expect(homePageSource).toContain("handleSliderTouchStart");
    expect(homePageSource).toContain("handleSliderTouchEnd");
    expect(homePageSource).not.toContain("visibleSlideIndexes");
    expect(homePageSource).not.toContain("slideIndex + 1");
    expect(homePageSource).toContain('className="relative h-52 w-full');
    expect(homePageSource).toContain("text-primary-foreground");
  });
});


describe("homepage slider refinement", () => {
  it("keeps the verified case help action prominent and urgency visible", () => {
    expect(homePageSource).toContain("Help Now");
    expect(homePageSource).toContain("bg-teal-600");
    expect(homePageSource).toContain("uppercase tracking-wide");
    expect(homePageSource).toContain("border-orange-300");
    expect(homePageSource).toContain("border-red-300");
  });

  it("uses distinct visual treatments for supported categories and direct category selection", () => {
    expect(homePageSource).toContain("CATEGORY_SLIDE_STYLE");
    expect(homePageSource).toContain("Battery");
    expect(homePageSource).toContain("Flame");
    expect(homePageSource).toContain("Droplets");
    expect(homePageSource).toContain("GraduationCap");
    expect(homePageSource).toContain("Stethoscope");
    expect(homePageSource).toContain("ShoppingCart");
    expect(homePageSource).toContain('navigate({ to: "/submit-request" })');
    expect(homePageSource).not.toContain("selectCategory(slide.category)");
  });

  it("speeds the automatic rotation moderately and removes the visible counter", () => {
    expect(homePageSource).toContain("}, 6000);");
    expect(homePageSource).not.toContain("slideIndex + 1");
    expect(homePageSource).not.toContain('aria-label="Slider navigation"');
    expect(homePageSource).toContain('className="relative h-52 w-full');
    expect(homePageSource).toContain('className="h-full w-full object-cover"');
  });
});
