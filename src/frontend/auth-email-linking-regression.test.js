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

  it("uses the deployed OAuth client configuration and rejects mismatched audiences clearly", () => {
    expect(worker).toContain("function googleClientId(env)");
    expect(worker).toContain("env?.GOOGLE_CLIENT_ID || env?.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID");
    expect(worker).toContain("audience !== clientId");
    expect(worker).toContain('code: "GOOGLE_CREDENTIAL_INVALID"');
  });
});

const authContext = fs.readFileSync(new URL("./src/contexts/AuthContext.tsx", import.meta.url), "utf8");
describe("frontend authentication recovery", () => {
  it("bounds verify and Google login requests", () => {
    expect(authContext).toContain("async function fetchWithTimeout");
    expect(authContext).toContain("/auth/google");
    expect(authContext).toContain("Google sign-in timed out. Please try again.");
  });

  it("clears login loading when Google returns no credential or cannot open", () => {
    expect(authContext).toContain("Google did not return a sign-in credential. Please try again.");
    expect(authContext).toContain("Google sign-in could not open. Please allow Google prompts/pop-ups and try again.");
    expect(authContext).toContain("setIsLoggingIn(false)");
  });
});
