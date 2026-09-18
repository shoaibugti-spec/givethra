import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const worker = readFileSync(new URL("./worker.js", import.meta.url), "utf8");
const home = readFileSync(new URL("./src/pages/HomePage.tsx", import.meta.url), "utf8");

describe("community support and feed contract", () => {
  it("uses an idempotent source-user/post support record", () => {
    expect(worker).toContain("SELECT id FROM user_supports WHERE source_user_id = ? AND post_id = ? LIMIT 1");
    expect(worker).toContain("INSERT OR IGNORE INTO user_supports");
    expect(home).toContain("supported_by_me");
  });

  it("converts received Supports to earnings rather than wallet credits", () => {
    expect(worker).toContain("supports / 10000");
    expect(worker).toContain("support_earnings_usd");
    expect(worker).toContain("supportsPerDollar: 10000");
    expect(home).toContain("10,000 = $1");
  });

  it("enforces one authenticated post per 24 hours and supports the four feed tabs", () => {
    expect(worker).toContain("POST_COOLDOWN");
    expect(worker).toContain("datetime('now', '-24 hours')");
    expect(worker).toContain('tab === "latest"');
    expect(worker).toContain('tab === "most-supported"');
    expect(home).toContain('"Most Supported"');
    expect(home).toContain('"My Posts"');
  });

  it("keeps Latest chronological and Most Supported ranked by support count", () => {
    expect(worker).toContain('tab === "latest"');
    expect(worker).toContain("cp.created_at DESC, cp.id DESC");
    expect(worker).toContain('tab === "most-supported"');
    expect(worker).toContain("COALESCE(sc.support_count, 0) DESC, cp.created_at DESC, cp.id DESC");
  });

  it("keeps Support usable before the additive earnings migration is applied", () => {
    expect(worker).toContain("const current = await getProfileSupportData(env, originalUserId);");
    expect(worker).toContain("UPDATE users SET supports_count = ?, updated_at = ? WHERE user_id = ?");
    expect(worker).toContain("const row = await getProfileSupportData(env, target);");
  });

  it("shows a live one-post-per-24-hours countdown in the composer", () => {
    expect(home).toContain('getCommunityPosts("my-posts")');
    expect(home).toContain("Post locked");
    expect(home).toContain("cooldownHours");
    expect(home).toContain("postLocked");
  });
});
