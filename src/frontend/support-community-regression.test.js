import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const worker = fs.readFileSync(path.join(root, "worker.js"), "utf8");
const support = fs.readFileSync(path.join(root, "src/pages/SupportChatPage.tsx"), "utf8");
const community = fs.readFileSync(path.join(root, "src/pages/CommunityPage.tsx"), "utf8");
const layout = fs.readFileSync(path.join(root, "src/components/Layout.tsx"), "utf8");
const bottomNav = fs.readFileSync(path.join(root, "src/components/BottomNav.tsx"), "utf8");

describe("support, community performance, and footer regressions", () => {
  it("uses production support_messages columns for user and admin messages", () => {
    expect(worker).toContain("sender, message, attachment_url, language, is_read, created_at");
    expect(worker).toContain("sender = 'admin'");
    expect(worker).toContain("parts[2] === \"support\" && parts[3] === \"reply\"");
    expect(worker).not.toContain("admin_id, message, is_from_user");
  });

  it("keeps support attachments and a multiline composer", () => {
    expect(support).toContain("uploadFileToStorage");
    expect(support).toContain("attachment_url");
    expect(support).toContain("type=\"file\"");
    expect(support).toContain("<textarea");
    expect(support).toContain("rows={3}");
  });

  it("keeps Community shell interactive while deferring comment requests", () => {
    expect(community).toContain("const fetchPosts = async (showLoader = false)");
    expect(community).toContain("setInterval(() => { void fetchPosts(false); }, 600000)");
    expect(community).toContain("void fetchPosts(true)");
    expect(community).not.toContain("data?.forEach((post: Post) => { fetchLikes(post.id); });");
    expect(community).toContain("const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({})");
    expect(community).toContain("{loading ? (");
    expect(community).toContain("Loading posts...");
    expect(community).toContain("Loading comments...");
  });

  it("matches the requested reference header and marks active icon routes", () => {
    expect(layout).toContain("aria-label=\"Toggle menu\"");
    expect(layout).toContain("aria-label=\"Givethra home\"");
    expect(layout).toContain("aria-label=\"Search verified cases\"");
    expect(layout).toContain("aria-label=\"Community\"");
    expect(layout).toContain("aria-label=\"Notifications\"");
    expect(layout).toContain("aria-current={isRouteActive(\"/community\") ? \"page\" : undefined}");
    expect(layout).toContain("aria-current={isRouteActive(\"/notifications\") ? \"page\" : undefined}");
    expect(layout).toContain("Reference layout: translation, Community, notifications");
    expect(layout).toContain("max-w-2xl");
    expect(layout).not.toContain('aria-label="Help & Support"');
    expect(layout).not.toContain("getUnreadChatMessagesCount");
    expect(bottomNav).toContain('aria-current={isActive ? "page" : undefined}');
    expect(bottomNav).toContain('data-active={isActive ? "true" : "false"}');
  });

  it("returns Community counts in one read without per-post query fan-out", () => {
    expect(worker).toContain("WITH like_counts AS (");
    expect(worker).toContain("COUNT(*) AS likes_count");
    expect(worker).toContain("COUNT(*) AS comments_count");
    expect(worker).toContain("MAX(CASE WHEN user_id = ? THEN 1 ELSE 0 END) AS is_liked");
    expect(worker).not.toContain("for (const post of (posts.results || []))");
  });

  it("keeps the configured WhatsApp channel in the footer", () => {
    expect(layout).toContain("https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J");
    expect(layout).toContain("aria-label=\"WhatsApp Channel\"");
  });
});

export {};
