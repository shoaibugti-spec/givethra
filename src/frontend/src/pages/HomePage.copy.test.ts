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
