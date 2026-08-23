import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const layoutSource = fs.readFileSync(path.join(root, "src/components/Layout.tsx"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "src/lib/api.ts"), "utf8");

describe("Community unread counter", () => {
  it("tracks per-actor seen posts and refreshes every ten minutes", () => {
    expect(layoutSource).toContain("givethra_community_seen_at:");
    expect(layoutSource).toContain("setInterval(fetchPostCount, 600000)");
    expect(layoutSource).toContain("setPostCount(0)");
    expect(layoutSource).toContain("getGuestId()");
  });

  it("surfaces non-success posts responses instead of accepting an error object", () => {
    expect(apiSource).toContain("if (!res.ok) throw new Error");
    expect(apiSource).toContain("return Array.isArray(data) ? data : []");
  });
});
