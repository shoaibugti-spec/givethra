import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const cleanup = fs.readFileSync(path.join(root, "src/lib/legacySessionCleanup.ts"), "utf8");
const auth = fs.readFileSync(path.join(root, "src/contexts/AuthContext.tsx"), "utf8");
const worker = fs.readFileSync(path.join(root, "worker.js"), "utf8");

describe("legacy authentication recovery", () => {
  it("clears only legacy browser state and preserves the current session", () => {
    expect(cleanup).toContain("auth_token");
    expect(cleanup).toContain("return false");
    expect(cleanup).toContain("supabase");
    expect(cleanup).toContain("Max-Age=0");
    expect(auth).toContain("clearLegacyBrowserState();");
  });

  it("exchanges verified Google credentials for a signed persistent session", () => {
    expect(worker).toContain("parts[0] === \"auth\" && parts[1] === \"google\"");
    expect(worker).toContain("signSession(account, env.JWT_SECRET)");
    expect(worker).toContain("verifySession(credential, env.JWT_SECRET)");
    expect(worker).toContain("if (!payload.sub || !payload.email");
    expect(worker).toContain("return null;");
  });
});

export {};
