import { describe, expect, it } from "vitest";
import { handleHelpMe } from "./helpme.js";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days) => new Date(Date.now() - days * DAY).toISOString();

function createDb(lastByUser = {}) {
  const queries = [];
  const DB = {
    prepare(sql) {
      const statement = {
        sql,
        params: [],
        bind(...params) {
          this.params = params;
          return this;
        },
        async all() {
          if (this.sql.includes("FROM helpme_settings")) {
            return { results: [
              { key: "post_gap_days", value: "3" },
              { key: "helped_cooldown_days", value: "7" },
            ] };
          }
          return { results: [] };
        },
        async first() {
          queries.push({ sql: this.sql, params: [...this.params] });
          if (this.sql.includes("status IN ('pending_review','published','under_review')")) return null;
          if (this.sql.includes("status IN ('helped','rejected')")) return lastByUser[this.params[0]] || null;
          return null;
        },
      };
      return statement;
    },
  };
  return { DB, queries };
}

const helpers = {
  json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json", Vary: "Origin" },
    });
  },
  id: () => "test-id",
  now: () => new Date().toISOString(),
  readJson: async () => ({}),
  sendNotification: async () => {},
  isAdmin: () => false,
  publicDisplayName: (name) => name || "User",
  getActiveSuspension: async () => null,
  suspendedActionResponse: () => new Response("Forbidden", { status: 403 }),
};

async function getEligibility(DB, userId) {
  const request = new Request("https://givethra.org/api/helpme/eligibility");
  const response = await handleHelpMe(
    request,
    { DB },
    {},
    { user_id: userId, kyc_status: "approved" },
    new URL(request.url),
    ["api", "helpme", "eligibility"],
    "https://givethra.org",
    helpers,
  );
  return { response, body: await response.json() };
}

describe("Help Me per-user eligibility cooldown", () => {
  it("starts the 3-day window at this user's rejection and does not borrow another user's rejection", async () => {
    const reviewedAt = daysAgo(1);
    const { DB, queries } = createDb({
      rejected_user: {
        status: "rejected",
        created_at: daysAgo(20),
        reviewed_at: reviewedAt,
        helped_at: null,
      },
    });

    const rejectedUser = await getEligibility(DB, "rejected_user");
    const unrelatedUser = await getEligibility(DB, "unrelated_user");

    expect(rejectedUser.body.can_post).toBe(false);
    expect(rejectedUser.body.code).toBe("COOLDOWN");
    expect(rejectedUser.body.next_allowed_at).toBe(new Date(Date.parse(reviewedAt) + 3 * DAY).toISOString());
    expect(unrelatedUser.body.can_post).toBe(true);
    expect(queries.filter((q) => q.sql.includes("status IN ('helped','rejected')")).map((q) => q.params[0]))
      .toEqual(["rejected_user", "unrelated_user"]);
  });

  it("starts the 7-day window from helped_at and marks eligibility as private, non-cacheable data", async () => {
    const helpedAt = daysAgo(6);
    const { DB } = createDb({
      helped_user: {
        status: "helped",
        created_at: daysAgo(30),
        reviewed_at: daysAgo(25),
        helped_at: helpedAt,
      },
    });

    const { response, body } = await getEligibility(DB, "helped_user");

    expect(body.can_post).toBe(false);
    expect(body.code).toBe("COOLDOWN");
    expect(body.next_allowed_at).toBe(new Date(Date.parse(helpedAt) + 7 * DAY).toISOString());
    expect(response.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");
    expect(response.headers.get("Vary")).toContain("Authorization");
    expect(response.headers.get("Vary")).toContain("Cookie");
  });

  it("requires sign-in for the private eligibility endpoint", async () => {
    const { DB } = createDb();
    const request = new Request("https://givethra.org/api/helpme/eligibility");
    const response = await handleHelpMe(
      request,
      { DB },
      {},
      null,
      new URL(request.url),
      ["api", "helpme", "eligibility"],
      "https://givethra.org",
      helpers,
    );
    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});
