import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const workerSource = fs.readFileSync(path.join(process.cwd(), "worker.js"), "utf8");

describe("public Worker routing", () => {
  it("serves uploads and static assets before the authentication-required API branch", () => {
    const uploadsIndex = workerSource.indexOf('if (url.pathname.startsWith("/uploads/"))');
    const assetsIndex = workerSource.indexOf('if (env.ASSETS && parts[0] !== "api" && request.method === "GET")');
    const authIndex = workerSource.indexOf('const user = await authenticate(request, env, DEFAULT_GOOGLE_CLIENT_ID);', assetsIndex);

    expect(uploadsIndex).toBeGreaterThan(-1);
    expect(assetsIndex).toBeGreaterThan(uploadsIndex);
    expect(authIndex).toBeGreaterThan(assetsIndex);
  });

  it("does not use the unconfigured BUCKET binding", () => {
    expect(workerSource).not.toContain("env.BUCKET");
    expect(workerSource).toContain("env.UPLOADS");
  });
});
