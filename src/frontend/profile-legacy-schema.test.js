import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const worker = readFileSync(new URL("./worker.js", import.meta.url), "utf8");

describe("profile legacy-schema compatibility", () => {
  it("uses a safe fallback when support earnings is not yet migrated", () => {
    expect(worker).toContain("async function getProfileSupportData(env, userId)");
    expect(worker).toContain("Older production databases may not have the additive earnings column yet.");
    expect(worker).toContain('"SELECT COALESCE(supports_count, 0) AS supports_count FROM users WHERE user_id = ?"');
    expect(worker).toContain("const supportData = await getProfileSupportData(env, userId);");
  });
});

export {};
