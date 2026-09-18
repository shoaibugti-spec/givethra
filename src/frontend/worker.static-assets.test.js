import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const workerSource = fs.readFileSync(path.join(process.cwd(), "worker.js"), "utf8");

describe("public Worker routing", () => {
  it("serves uploads and static assets before the authentication-required API branch", () => {
    const uploadsIndex = workerSource.indexOf('if (url.pathname.startsWith("/uploads/"))');
    const assetsIndex = workerSource.indexOf('if (env.ASSETS && parts[0] !== "api" && request.method === "GET")');
    const authIndex = workerSource.indexOf('const user = await authenticate(request, env, googleClientId(env));', assetsIndex);

    expect(uploadsIndex).toBeGreaterThan(-1);
    expect(assetsIndex).toBeGreaterThan(uploadsIndex);
    expect(authIndex).toBeGreaterThan(assetsIndex);
  });

  it("does not use the unconfigured BUCKET binding", () => {
    expect(workerSource).not.toContain("env.BUCKET");
    expect(workerSource).toContain("env.UPLOADS");
  });

  it("does not relabel SPA fallback HTML as an APK and ships the APK in frontend assets", () => {
    expect(workerSource).toContain("!assetContentType.toLowerCase().includes('text/html')");
    const apkPath = path.join(process.cwd(), "public", "Givethra.apk");
    expect(fs.existsSync(apkPath)).toBe(true);
    expect(fs.statSync(apkPath).size).toBeGreaterThan(1000000);
  });

  it("serves approved case detail and by-id data to guest visitors", () => {
    expect(workerSource).toContain('// Public approved case links are intentionally readable without a session.');
    expect(workerSource).toContain('const publicStatus = String(publicRow?.status || "").toLowerCase();');
    expect(workerSource).toContain('if (publicRow && ["approved", "published", "active"].includes(publicStatus))');
    expect(workerSource).toContain('const publicVisitor = !user;');
    expect(workerSource).toContain('isAdmin(user) || publicVisitor ? " AND lower(status) IN');
  });
});
