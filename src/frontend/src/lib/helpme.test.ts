// src/frontend/src/lib/helpme.test.ts
import { describe, expect, it } from "vitest";
import { viewerCurrency, niceGoal, formatMoney, type HelpMeConfig } from "./helpme";

const makeConfig = (country_code: string | null): HelpMeConfig => ({
  goal_usd_cents: 210,
  max_seconds: 20,
  min_stop_seconds: 12,
  max_bytes: 40 * 1024 * 1024,
  retention_days: 90,
  country_code,
  country_currency: {
    PK: "PKR", US: "USD", GB: "GBP", IN: "INR", AE: "AED", SA: "SAR",
    BD: "BDT", ID: "IDR", NG: "NGN", EG: "EGP", TR: "TRY",
  },
  rates: [
    { currency: "USD", per_usd: 1 },
    { currency: "PKR", per_usd: 278 },
    { currency: "GBP", per_usd: 0.79 },
    { currency: "INR", per_usd: 83 },
  ],
});

describe("Help Me country currency", () => {
  it("prefers Cloudflare's detected country over the browser locale", () => {
    expect(viewerCurrency(makeConfig("PK"))).toBe("PKR");
  });

  it("returns the currency for each supported country", () => {
    const cases: [string, string][] = [
      ["PK", "PKR"], ["GB", "GBP"], ["IN", "INR"], ["US", "USD"],
      ["AE", "AED"], ["SA", "SAR"], ["BD", "BDT"], ["ID", "IDR"],
      ["NG", "NGN"], ["EG", "EGP"], ["TR", "TRY"],
    ];
    for (const [cc, expected] of cases) {
      expect(viewerCurrency(makeConfig(cc))).toBe(expected);
    }
  });

  it("falls back to a known currency when the country is unknown", () => {
    const cfg = makeConfig(null);
    expect(Object.values(cfg.country_currency)).toContain(viewerCurrency(cfg));
  });
});

describe("Help Me goal conversion (2.1 USD → local)", () => {
  it("converts $2.10 to PKR", () => {
    // 2.10 * 278 = 583.8 → round to step 10 → 580
    expect(niceGoal(210, 278)).toBe(580);
    expect(formatMoney(580, "PKR")).toBe("Rs580");
  });

  it("converts $2.10 to GBP", () => {
    // 2.10 * 0.79 = 1.659 → step 0.1 → 1.7
    expect(niceGoal(210, 0.79)).toBe(1.7);
    expect(formatMoney(1.7, "GBP")).toBe("£1.7");
  });

  it("keeps USD unchanged", () => {
    expect(niceGoal(210, 1)).toBe(2.1);
    expect(formatMoney(2.1, "USD")).toBe("$2.1");
  });

  it("converts $2.10 to INR", () => {
    // 2.10 * 83 = 174.3 → step 1 → 174
    expect(niceGoal(210, 83)).toBe(174);
    expect(formatMoney(174, "INR")).toBe("₹174");
  });

  it("uses a bigger step for high-rate currencies", () => {
    // 2.10 * 16000 (IDR) = 33600 → step 100 → 33600
    expect(niceGoal(210, 16000)).toBe(33600);
  });
});
