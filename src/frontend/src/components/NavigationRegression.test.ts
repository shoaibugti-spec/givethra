import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layoutSource = readFileSync(new URL("./Layout.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");

describe("requested navigation regression", () => {
  it("keeps the requested notification, community, and translation controls", () => {
    const notification = layoutSource.indexOf('aria-label="Notifications"');
    const community = layoutSource.indexOf('aria-label="Community Posts"');
    const translation = layoutSource.indexOf("<LanguageSwitcher />");
    expect(notification).toBeGreaterThan(-1);
    expect(community).toBeGreaterThan(notification);
    expect(translation).toBeGreaterThan(community);
  });

  it("uses the shared top navigation and keeps dedicated wall links on homepage", () => {
    expect(homeSource).toContain('import Layout from "@/components/Layout"');
    expect(homeSource).toContain("<Layout>");
    expect(homeSource).toContain('to="/heroes-wall"');
    expect(homeSource).toContain('to="/kindness-wall"');
    expect(homeSource).not.toContain("<FeedbackWall />");
    expect(homeSource).not.toContain("Public Post");
  });

  it("keeps the hamburger menu and centered search controls", () => {
    expect(layoutSource).toContain('aria-label="Toggle menu"');
    expect(layoutSource).toContain('type="search"');
    expect(layoutSource).toContain('placeholder="Search verified cases..."');
  });
});
