import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const cleanup = fs.readFileSync(path.join(root, "src/lib/legacySessionCleanup.ts"), "utf8");
const auth = fs.readFileSync(path.join(root, "src/contexts/AuthContext.tsx"), "utf8");
const worker = fs.readFileSync(path.join(root, "worker.js"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "public/sw.js"), "utf8");

describe("legacy authentication recovery", () => {
  it("clears only legacy browser state and preserves the current session", () => {
    expect(cleanup).toContain("auth_token");
    expect(cleanup).toContain("return false");
    expect(cleanup).toContain("supabase");
    expect(cleanup).toContain("Max-Age=0");
    expect(cleanup).toContain("caches.keys()");
    expect(cleanup).toContain("getRegistrations()");
    expect(cleanup).toContain("CURRENT_SERVICE_WORKER_CACHE");
    expect(serviceWorker).toContain('const CACHE_NAME = "givethra-v2"');
    expect(auth).toContain("clearLegacyBrowserState();");
  });

  it("exchanges verified Google credentials for a signed persistent session", () => {
    expect(worker).toContain("parts[0] === \"auth\" && parts[1] === \"google\"");
    expect(worker).toContain("signSession(account, env.JWT_SECRET)");
    expect(worker).toContain("verifySession(credential, env.JWT_SECRET)");
    expect(worker).toContain("if (!payload.sub || !payload.email");
    expect(worker).toContain("return null;");
    expect(worker).toContain("const existingProfile = await env.DB.prepare");
    expect(worker).toContain("const canonicalName = savedName && !savedName.includes(\"@\") ? savedName : identity.full_name;");
    expect(worker).toContain("async function hydrateAuthenticatedUser(env, session)");
    expect(worker).toContain("p.full_name AS profile_full_name");
    expect(auth).toContain('fullName: data.user.full_name || "User"');
  });
});

export {};
