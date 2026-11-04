import { describe, expect, it } from "vitest";
import { viewerCurrency, type HelpMeConfig } from "./helpme";

describe("Help Me country currency", () => {
  it("prefers Cloudflare's detected country over the browser locale", () => {
    const config: HelpMeConfig = {
      goal_usd_cents: 210,
      max_seconds: 20,
      min_stop_seconds: 12,
      max_bytes: 40 * 1024 * 1024,
      retention_days: 90,
      country_code: "PK",
      country_currency: { PK: "PKR", US: "USD" },
      rates: [
        { currency: "USD", per_usd: 1 },
        { currency: "PKR", per_usd: 278 },
      ],
    };

    expect(viewerCurrency(config)).toBe("PKR");
  });
});
