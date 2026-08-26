import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const myCasesSource = readFileSync(new URL("./MyCasesPage.tsx", import.meta.url), "utf8");
const apiSource = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");

describe("completed help visibility", () => {
  it("loads helper resolution history separately from active unlocks", () => {
    expect(apiSource).toContain("getCaseResolutionsByHero");
    expect(apiSource).toContain("getHeroesWall");
    expect(apiSource).toContain("/api/heroes-wall");
    expect(apiSource).toContain("/api/community/posts/");
    expect(myCasesSource).toContain("getCaseResolutionsByHero(user.id)");
    expect(myCasesSource).toContain("caseIds = Array.from(new Set");
  });

  it("reclassifies an admin-confirmed resolution as completed history", () => {
    expect(myCasesSource).toContain('status: "completed"');
    expect(myCasesSource).toContain("adminConfirmed");
    expect(myCasesSource).toContain("amount_collected: Number(resolution.amount_paid");
  });

  it("keeps completed history linked to the affidavit entry point", () => {
    expect(myCasesSource).toContain("affidavit_available: true");
    expect(myCasesSource).toContain("View Affidavit & Completed Help");
  });

  it("keeps seeker feedback video recording at the requested 90 seconds", () => {
    const caseDetailSource = readFileSync(new URL("./CaseDetailPage.tsx", import.meta.url), "utf8");
    expect(caseDetailSource).toContain("recTimer}s / 90s");
    expect(caseDetailSource).toContain("(recTimer / 90) * 100");
    expect(caseDetailSource).toContain("Record a Video (up to 90s)");
  });

  it("publishes completed cases from either case or approved resolution state", () => {
    expect(workerSource).toContain("lower(COALESCE(r.status, '')) IN ('approved', 'completed')");
    expect(workerSource).toContain("verified_amount");
    expect(workerSource).toContain("c.submitted_at AS updated_at");
    expect(workerSource).toContain("ORDER BY COALESCE(completed_at, c.submitted_at) DESC");
    expect(workerSource).toContain("Heroes Wall social counters unavailable");
  });
});
