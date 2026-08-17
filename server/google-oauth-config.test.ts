import { describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

describe("Google OAuth runtime configuration", () => {
  it("has a valid Web client ID and can load the Google Identity Services script", async () => {
    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;

    expect(clientId).toMatch(/^[\w-]+\.apps\.googleusercontent\.com$/);

    const { stdout } = await execFileAsync("curl", [
      "-sS",
      "-L",
      "-o",
      "/dev/null",
      "-w",
      "%{http_code}",
      `https://accounts.google.com/gsi/client?client_id=${encodeURIComponent(clientId ?? "")}`,
    ]);

    expect(stdout.trim()).toBe("200");
  });

  it("has an owner email for owner-only access control", () => {
    expect(process.env.GIVETHRA_ADMIN_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});
