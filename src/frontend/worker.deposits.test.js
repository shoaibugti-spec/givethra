import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const workerSource = fs.readFileSync(path.join(process.cwd(), "worker.js"), "utf8");

describe("deposits authentication safety", () => {
  it("guards deposits before reading the session user", () => {
    const routeIndex = workerSource.indexOf('if (parts[1] === "deposits")');
    const guardIndex = workerSource.indexOf('if (!user) return json({ error: "Authentication required", code: "AUTH_REQUIRED" }, 401, origin);', routeIndex);
    const userIdIndex = workerSource.indexOf('user.user_id', routeIndex);

    expect(routeIndex).toBeGreaterThan(-1);
    expect(guardIndex).toBeGreaterThan(routeIndex);
    expect(guardIndex).toBeLessThan(userIdIndex);
  });
});
