import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const pagesDirectory = path.resolve(__dirname);
const workerSource = fs.readFileSync(path.resolve(pagesDirectory, "../../worker.js"), "utf8");
const homeSource = fs.readFileSync(path.join(pagesDirectory, "HomePage.tsx"), "utf8");
const browseSource = fs.readFileSync(path.join(pagesDirectory, "CasesPage.tsx"), "utf8");

describe("live verified case visibility", () => {
  it("limits the server's public verified feed to unexpired approved cases", () => {
    expect(workerSource).toContain("lower(status) IN ('approved', 'published', 'active') AND (deadline IS NULL OR date(deadline) >= date(?))");
    expect(workerSource).toContain("ORDER BY submitted_at DESC\").bind(caseCalendarDate()).all()");
    expect(workerSource).toContain('timeZone: "Asia/Karachi"');
    expect(workerSource).toContain("AND deadline IS NOT NULL AND date(deadline) < date(?)");
    expect(workerSource).toContain(".bind(today).all()");
  });

  it("limits Home and Browse cards to live statuses and excludes expired records", () => {
    for (const source of [homeSource, browseSource]) {
      expect(source).toContain('["approved", "published", "active"].includes(String(item.status || "").toLowerCase())');
      expect(source).toContain("!isExpiredCaseRecord(item)");
    }
  });

  it("excludes past-deadline cases from Admin's Approved queue and count", () => {
    const adminSource = fs.readFileSync(path.resolve(pagesDirectory, "AdminDashboard.tsx"), "utf8");
    expect(adminSource).toContain('normalizedAdminStatus(c.status) === "approved" && !isExpiredCaseRecord(c)');
    expect(adminSource).toContain('(isExpiredCaseRecord(c) ? "expired" : normalizedAdminStatus(c.status)) === statusFilter');
  });
});
