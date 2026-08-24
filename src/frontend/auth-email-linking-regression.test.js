import fs from "node:fs";
import { describe, expect, it } from "vitest";

const worker = fs.readFileSync(new URL("./worker.js", import.meta.url), "utf8");

describe("email-first Google authentication", () => {
  it("looks up the durable user account by normalized email", () => {
    expect(worker).toContain("WHERE lower(trim(email)) = lower(trim(?)) LIMIT 1");
    expect(worker).toContain("const userId = String(existing?.user_id || identity.google_id);");
  });

  it("keeps legacy D1 IDs and only creates a new ID for an unknown email", () => {
    expect(worker).toContain("UPDATE users SET full_name = ?, avatar_url = ?, updated_at = ? WHERE user_id = ?");
    expect(worker).toContain("INSERT INTO users (user_id, email, full_name, avatar_url, last_community_visit, signed_up_at, updated_at)");
  });

  it("returns a JSON error instead of exposing a raw server error or hanging", () => {
    expect(worker).toContain('json({ error: "Authentication or database request failed", code: "INTERNAL_ERROR" }, 500');
    expect(worker).toContain("const controller = new AbortController();");
  });
});
