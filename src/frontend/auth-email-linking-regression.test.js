import fs from "node:fs";
import { describe, expect, it } from "vitest";

const worker = fs.readFileSync(new URL("./worker.js", import.meta.url), "utf8");

describe("email-first Google authentication", () => {
  it("looks up the durable user account by normalized email", () => {
    expect(worker).toContain("WHERE lower(trim(email)) = lower(trim(?)) LIMIT 1");
    expect(worker).toContain("const existing = await selectExisting();");
    expect(worker).toContain("user_id: String(existing.user_id)");
  });

  it("keeps legacy D1 IDs read-only and creates a UUID only for an unknown email", () => {
    expect(worker).toContain("// Existing imported users are read-only during login.");
    expect(worker).toContain("const userId = id();");
    expect(worker).toContain("INSERT INTO users (user_id, email, full_name, avatar_url, last_community_visit, signed_up_at, updated_at)");
    expect(worker).toContain("const raced = await selectExisting();");
    const reconciliation = worker.slice(worker.indexOf("async function findOrCreateUser"), worker.indexOf("async function hydrateAuthenticatedUser"));
    expect(reconciliation).not.toContain("UPDATE users SET full_name = ?, avatar_url = ?, updated_at = ? WHERE user_id = ?");
  });

  it("returns a structured JSON error instead of exposing a raw server error or hanging", () => {
    expect(worker).toContain('json({ error: "Authentication or database request failed", code: "AUTH_RECONCILIATION_FAILED" }, 500');
    expect(worker).toContain("try {\n      const body = await readJson(request);");
    expect(worker).toContain("const controller = new AbortController();");
  });

  it("uses the deployed OAuth client configuration and rejects mismatched audiences clearly", () => {
    expect(worker).toContain("function googleClientId(env)");
    expect(worker).toContain("env?.GOOGLE_CLIENT_ID || env?.VITE_GOOGLE_CLIENT_ID || \"\"");
    expect(worker).toContain("audience !== clientId");
    expect(worker).toContain("trustedIssuer");
    expect(worker).toContain('code: "GOOGLE_CREDENTIAL_INVALID"');
  });

  it("uses the same deployed client configuration for authenticated API verification", () => {
    expect(worker).toContain("authenticate(request, env, googleClientId(env))");
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

  it("cleans legacy browser state at click time and recovers once from reconciliation errors", () => {
    expect(authContext).toContain("clearLegacyBrowserState();\n    const googleIdentity");
    expect(authContext).toContain('message.includes("Authentication or database request failed")');
    expect(authContext).toContain('sessionStorage.getItem("givethra_auth_recovery_reload")');
    expect(authContext).toContain("window.location.reload()");
  });
});
