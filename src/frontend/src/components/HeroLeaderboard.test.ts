import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const componentSource = readFileSync(new URL("./HeroLeaderboard.tsx", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("../pages/HomePage.tsx", import.meta.url), "utf8");
const apiSource = readFileSync(new URL("../lib/api.ts", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");

describe("Hero Ranking Leaderboard", () => {
  it("uses the read-only public top-100 endpoint and keeps verified help filters", () => {
    expect(apiSource).toContain("/api/hero-leaderboard?limit=");
    expect(workerSource).toContain("handleHeroLeaderboard");
    expect(workerSource).toContain("admin_confirmed");
    expect(workerSource).toContain("COUNT(DISTINCT r.case_id)");
    expect(workerSource).toContain("SUM(COALESCE(r.amount_paid, 0))");
  });

  it("renders the requested tier filters, amount/case sorting, badge info, and profile links", () => {
    expect(componentSource).toContain("Super Hero");
    expect(componentSource).toContain("Young Hero");
    expect(componentSource).toContain("New Hero");
    expect(componentSource).toContain("Top 100 Heroes");
    expect(componentSource).toContain("Most cases");
    expect(componentSource).toContain("Highest amount");
    expect(componentSource).toContain('to="/profile/$id"');
    expect(componentSource).toContain("overflow-y-auto");
    expect(componentSource).toContain("grid-cols-[auto,minmax(0,1fr),auto,auto]");
    expect(componentSource).toContain("break-words font-bold");
    expect(componentSource).toContain("whitespace-nowrap text-right");
    expect(homeSource).toContain('import HeroLeaderboard from "@/components/HeroLeaderboard";');
    expect(homeSource.indexOf("<HeroLeaderboard />")).toBeLessThan(homeSource.indexOf("<HeroesWall />"));
  });
});
