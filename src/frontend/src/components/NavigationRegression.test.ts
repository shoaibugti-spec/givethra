import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const layoutSource = readFileSync(new URL("./Layout.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const switcherSource = readFileSync(new URL("./RoleSwitcher.tsx", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");

describe("navigation and support search regression", () => {
  it("keeps the mobile menu and a non-overflowing centered switcher", () => {
    expect(layoutSource).toContain('aria-label="Toggle menu"');
    expect(layoutSource).toContain("min-w-0 flex-1 flex items-center justify-center");
    expect(switcherSource).toContain('onClick={() => handleSwitch("support")}');
    expect(switcherSource).toContain("min-h-10 min-w-10");
  });

  it("keeps the floating support action above the authenticated bottom nav", () => {
    expect(layoutSource).toContain('isAuthenticated ? "bottom-[calc(4.5rem+env(safe-area-inset-bottom))]" : "bottom-5"');
  });

  it("keeps support search keyboard/button submission and profile result links", () => {
    expect(homeSource).toContain('placeholder="Search name or @username"');
    expect(homeSource).toContain('inputMode="search"');
    expect(homeSource).toContain('to="/profile/$id"');
    expect(homeSource).toContain("setSubmittedUserQuery(userQuery)");
  });

  it("keeps the server-side search authenticated and bounded", () => {
    expect(workerSource).toContain('parts[1] === "user-search"');
    expect(workerSource).toContain('if (!user) return json({ error: "Authentication required" }, 401, origin);');
    expect(workerSource).toContain("LIMIT 25");
  });
});
