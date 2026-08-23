import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const worker = fs.readFileSync(path.join(root, "worker.js"), "utf8");
const support = fs.readFileSync(path.join(root, "src/pages/SupportChatPage.tsx"), "utf8");
const community = fs.readFileSync(path.join(root, "src/pages/CommunityPage.tsx"), "utf8");
const layout = fs.readFileSync(path.join(root, "src/components/Layout.tsx"), "utf8");

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

  it("does not show a full-page spinner during background Community refresh", () => {
    expect(community).toContain("const fetchPosts = async (showLoader = false)");
    expect(community).toContain("setInterval(() => { void fetchPosts(false); }, 600000)");
    expect(community).toContain("void fetchPosts(true)");
  });

  it("keeps the configured WhatsApp channel in the footer", () => {
    expect(layout).toContain("https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J");
    expect(layout).toContain("aria-label=\"WhatsApp Channel\"");
  });
});

export {};
