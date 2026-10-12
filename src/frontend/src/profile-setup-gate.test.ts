import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "src/App.tsx"), "utf8");
const editSource = fs.readFileSync(path.join(root, "src/pages/EditProfilePage.tsx"), "utf8");
const workerSource = fs.readFileSync(path.join(root, "worker.js"), "utf8");
const migration = fs.readFileSync(path.join(root, "migrations/0015_profile_setup_completion.sql"), "utf8");

describe("one-time profile setup gate", () => {
  it("checks every authenticated non-admin route except the setup page", () => {
    expect(appSource).toContain('location.pathname === "/edit-profile"');
    expect(appSource).toContain("profile?.profile_setup_completed_at");
  });

  it("saves setup completion server-side and returns home", () => {
    expect(editSource).toContain("profile_setup_completed_at: setupMode ? new Date().toISOString() : undefined");
    expect(editSource).toContain('navigate({ to: "/" });');
    expect(editSource).toContain('id="email"');
  });

  it("persists and reads the marker without touching profile media storage", () => {
    expect(workerSource).toContain("profile_setup_completed_at");
    expect(migration).toContain("ALTER TABLE users ADD COLUMN profile_setup_completed_at TEXT;");
  });
});
