// src/frontend/src/lib/helpStats.ts
// "Your impact" numbers for the mobile menu: how much help the user GAVE (as a
// Hero) and how much they RECEIVED (as a Requester), shown in the currency of
// the country they are in right now.
//
// Country: Cloudflare's own /cdn-cgi/trace (the site is already behind
// Cloudflare), then the country saved on the profile, then the browser locale.
// Currency conversion: a free public rates file (cached for 12 hours). If rates
// cannot be loaded, amounts are shown in their own currency instead of guessing.
//
// If a number looks wrong, the only place to adjust is the "FIELD READERS"
// section below (names of the columns the API returns).

import {
  getCaseResolutionsByHero,
  getCasesByIds,
  getCasesByUser,
  getProfile,
} from "@/lib/api";

export type ImpactSide = {
  amount: number;
  currency: string;
  cases: number;
  /** true when amounts in other currencies were converted using today's rate */
  approx: boolean;
};

export type HelpImpact = {
  currency: string;
  country: string | null;
  /** null = could not be loaded (show "—", never a fake zero) */
  given: ImpactSide | null;
  received: ImpactSide | null;
};

// ---------------------------------------------------------------------------
// Country -> currency
// ---------------------------------------------------------------------------
const COUNTRY_CURRENCY: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  const add = (currency: string, countries: string) =>
    countries.split(" ").forEach((code) => (map[code] = currency));
  add("EUR", "AT BE HR CY EE FI FR DE GR IE IT LV LT LU MT NL PT SK SI ES AD MC SM VA ME XK");
  add("USD", "US EC SV PA PR GU VI AS");
  add("PKR", "PK");
  add("GBP", "GB IM JE GG");
  add("SAR", "SA");
  add("AED", "AE");
  add("QAR", "QA");
  add("KWD", "KW");
  add("BHD", "BH");
  add("OMR", "OM");
  add("JOD", "JO");
  add("EGP", "EG");
  add("TRY", "TR");
  add("INR", "IN");
  add("BDT", "BD");
  add("LKR", "LK");
  add("NPR", "NP");
  add("AFN", "AF");
  add("IDR", "ID");
  add("MYR", "MY");
  add("THB", "TH");
  add("PHP", "PH");
  add("VND", "VN");
  add("SGD", "SG");
  add("CNY", "CN");
  add("JPY", "JP");
  add("KRW", "KR");
  add("AUD", "AU");
  add("NZD", "NZ");
  add("CAD", "CA");
  add("BRL", "BR");
  add("MXN", "MX");
  add("ARS", "AR");
  add("CLP", "CL");
  add("COP", "CO");
  add("PEN", "PE");
  add("NGN", "NG");
  add("KES", "KE");
  add("ZAR", "ZA");
  add("GHS", "GH");
  add("MAD", "MA");
  add("DZD", "DZ");
  add("TND", "TN");
  add("IQD", "IQ");
  add("IRR", "IR");
  add("LBP", "LB");
  add("YER", "YE");
  add("SDG", "SD");
  add("ETB", "ET");
  add("TZS", "TZ");
  add("UGX", "UG");
  add("RUB", "RU");
  add("UAH", "UA");
  add("PLN", "PL");
  add("CZK", "CZ");
  add("HUF", "HU");
  add("RON", "RO");
  add("BGN", "BG");
  add("CHF", "CH LI");
  add("SEK", "SE");
  add("NOK", "NO");
  add("DKK", "DK");
  add("ILS", "IL PS");
  add("AZN", "AZ");
  add("KZT", "KZ");
  add("UZS", "UZ");
  return map;
})();

const FALLBACK_CURRENCY = "USD";

export function currencyForCountry(country: string | null | undefined): string {
  if (!country) return FALLBACK_CURRENCY;
  return COUNTRY_CURRENCY[country.toUpperCase()] || FALLBACK_CURRENCY;
}

// ---------------------------------------------------------------------------
// Safe storage helpers (private mode / blocked storage must never crash)
// ---------------------------------------------------------------------------
function readStore(kind: "local" | "session", key: string): string | null {
  try {
    const store = kind === "local" ? globalThis.localStorage : globalThis.sessionStorage;
    return store.getItem(key);
  } catch {
    return null;
  }
}
function writeStore(kind: "local" | "session", key: string, value: string): void {
  try {
    const store = kind === "local" ? globalThis.localStorage : globalThis.sessionStorage;
    store.setItem(key, value);
  } catch {
    /* storage unavailable - fine */
  }
}

// ---------------------------------------------------------------------------
// Where is the user right now?
// ---------------------------------------------------------------------------
export function parseTraceCountry(text: string): string | null {
  const match = text.match(/^loc=([A-Za-z]{2})$/m);
  if (!match) return null;
  const code = match[1].toUpperCase();
  return code === "XX" || code === "T1" ? null : code; // XX unknown, T1 Tor
}

async function fetchJson(url: string, timeoutMs: number): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function countryFromCloudflare(): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch("/cdn-cgi/trace", { cache: "no-store", signal: controller.signal });
    if (!res.ok) return null;
    return parseTraceCountry(await res.text());
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function countryFromLocale(): string | null {
  try {
    const languages = [...(navigator.languages || []), navigator.language];
    for (const tag of languages) {
      const region = String(tag || "").split("-")[1];
      if (region && /^[A-Za-z]{2}$/.test(region)) return region.toUpperCase();
    }
  } catch {
    /* ignore */
  }
  return null;
}

const COUNTRY_CACHE_KEY = "givethra_impact_country_v1";

async function detectCountry(userId: string): Promise<string | null> {
  const cached = readStore("session", COUNTRY_CACHE_KEY);
  if (cached && /^[A-Z]{2}$/.test(cached)) return cached;

  let country = await countryFromCloudflare();

  if (!country) {
    try {
      const profile = await getProfile(userId);
      const raw = String(profile?.country_code ?? profile?.countryCode ?? "").trim();
      if (/^[A-Za-z]{2}$/.test(raw)) country = raw.toUpperCase();
    } catch {
      /* fall through to locale */
    }
  }
  if (!country) country = countryFromLocale();

  if (country) writeStore("session", COUNTRY_CACHE_KEY, country);
  return country;
}

// ---------------------------------------------------------------------------
// Exchange rates (USD base), cached 12h
// ---------------------------------------------------------------------------
const RATES_KEY = "givethra_fx_rates_v1";
const RATES_TTL_MS = 12 * 60 * 60 * 1000;
const RATE_URLS = [
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
  "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
];

type Rates = Record<string, number>;

function readCachedRates(allowStale: boolean): Rates | null {
  const raw = readStore("local", RATES_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.rates || typeof parsed.at !== "number") return null;
    if (!allowStale && Date.now() - parsed.at > RATES_TTL_MS) return null;
    return parsed.rates as Rates;
  } catch {
    return null;
  }
}

async function getRates(): Promise<Rates | null> {
  const fresh = readCachedRates(false);
  if (fresh) return fresh;
  for (const url of RATE_URLS) {
    try {
      const data = await fetchJson(url, 6000);
      const table = data?.usd;
      if (!table || typeof table !== "object") continue;
      const rates: Rates = {};
      for (const [code, value] of Object.entries(table)) {
        const rate = Number(value);
        if (Number.isFinite(rate) && rate > 0) rates[code.toUpperCase()] = rate;
      }
      rates.USD = 1;
      writeStore("local", RATES_KEY, JSON.stringify({ at: Date.now(), rates }));
      return rates;
    } catch {
      /* try next source */
    }
  }
  return readCachedRates(true); // stale rates are better than none
}

// ---------------------------------------------------------------------------
// Money helpers
// ---------------------------------------------------------------------------
export function collapseBuckets(
  buckets: Record<string, number>,
  target: string,
  rates: Rates | null
): { amount: number; currency: string; approx: boolean } {
  const entries = Object.entries(buckets).filter(([, value]) => value > 0);
  if (entries.length === 0) return { amount: 0, currency: target, approx: false };

  if (entries.every(([currency]) => currency === target)) {
    return { amount: entries.reduce((sum, [, value]) => sum + value, 0), currency: target, approx: false };
  }

  if (rates && rates[target] && entries.every(([currency]) => rates[currency])) {
    const total = entries.reduce(
      (sum, [currency, value]) => sum + (currency === target ? value : (value / rates[currency]) * rates[target]),
      0
    );
    return { amount: total, currency: target, approx: entries.some(([currency]) => currency !== target) };
  }

  // Cannot convert: show the biggest currency as it is rather than a wrong total.
  const [currency, amount] = entries.sort((a, b) => b[1] - a[1])[0];
  return { amount, currency, approx: false };
}

export function formatAmount(amount: number): string {
  const value = Math.max(0, Math.round(Number(amount) || 0));
  try {
    if (value >= 10000000) {
      return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
    }
    return new Intl.NumberFormat("en").format(value);
  } catch {
    return String(value);
  }
}

// ---------------------------------------------------------------------------
// FIELD READERS - adjust here if your API uses different column names
// ---------------------------------------------------------------------------
const RESOLUTION_AMOUNT_KEYS = ["amount_paid", "paid_amount", "amount", "amount_contributed"];
const RESOLUTION_CURRENCY_KEYS = ["currency", "paid_currency"];
// A resolution in one of these states is not help that was actually given.
const NOT_GIVEN_STATUSES = new Set(["rejected", "cancelled", "canceled", "failed", "declined", "pending"]);

function firstNumber(row: any, keys: string[]): number {
  for (const key of keys) {
    const value = Number(row?.[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return 0;
}

function firstCurrency(row: any, keys: string[]): string | null {
  for (const key of keys) {
    const value = String(row?.[key] ?? "").trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(value)) return value;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------
async function loadGiven(userId: string, target: string, rates: Rates | null): Promise<ImpactSide> {
  const rows = await getCaseResolutionsByHero(userId);
  const valid = (Array.isArray(rows) ? rows : []).filter(
    (row) => !NOT_GIVEN_STATUSES.has(String(row?.status ?? "").trim().toLowerCase())
  );

  const needsCaseCurrency = valid.some((row) => !firstCurrency(row, RESOLUTION_CURRENCY_KEYS));
  const caseCurrency: Record<string, string> = {};
  if (needsCaseCurrency) {
    const ids = Array.from(new Set(valid.map((row) => String(row?.case_id ?? "")).filter(Boolean))).slice(0, 60);
    if (ids.length) {
      try {
        const cases = await getCasesByIds(ids);
        for (const item of Array.isArray(cases) ? cases : []) {
          const currency = firstCurrency(item, ["currency"]);
          if (item?.id && currency) caseCurrency[String(item.id)] = currency;
        }
      } catch {
        /* amounts without a known currency are treated as local currency */
      }
    }
  }

  const buckets: Record<string, number> = {};
  const caseIds = new Set<string>();
  for (const row of valid) {
    const amount = firstNumber(row, RESOLUTION_AMOUNT_KEYS);
    const currency =
      firstCurrency(row, RESOLUTION_CURRENCY_KEYS) || caseCurrency[String(row?.case_id ?? "")] || target;
    if (amount > 0) buckets[currency] = (buckets[currency] || 0) + amount;
    if (row?.case_id != null) caseIds.add(String(row.case_id));
  }

  const total = collapseBuckets(buckets, target, rates);
  return { ...total, cases: caseIds.size };
}

async function loadReceived(userId: string, target: string, rates: Rates | null): Promise<ImpactSide> {
  const rows = await getCasesByUser(userId);
  const own = (Array.isArray(rows) ? rows : []).filter(
    (row) => row?.user_id == null || String(row.user_id) === String(userId)
  );

  const buckets: Record<string, number> = {};
  let cases = 0;
  for (const row of own) {
    const collected = Number(row?.amount_collected ?? 0);
    if (!Number.isFinite(collected) || collected <= 0) continue;
    const currency = firstCurrency(row, ["currency"]) || "USD"; // same default as the Home page
    buckets[currency] = (buckets[currency] || 0) + collected;
    cases += 1;
  }

  return { ...collapseBuckets(buckets, target, rates), cases };
}

export async function loadHelpImpact(userId: string): Promise<HelpImpact> {
  const country = await detectCountry(userId);
  const currency = currencyForCountry(country);
  const rates = await getRates();

  const [given, received] = await Promise.allSettled([
    loadGiven(userId, currency, rates),
    loadReceived(userId, currency, rates),
  ]);

  if (given.status === "rejected" && received.status === "rejected") {
    throw new Error("Impact numbers could not be loaded.");
  }

  return {
    currency,
    country,
    given: given.status === "fulfilled" ? given.value : null,
    received: received.status === "fulfilled" ? received.value : null,
  };
}
