// src/lib/consent.ts  - consent storage + Google Consent Mode v2 + Global Privacy Control
import { SITE } from "@/lib/siteConfig";

export type Consent = { necessary: true; preferences: boolean; analytics: boolean; marketing: boolean };
type Stored = Consent & { v: number; ts: string; source: "banner" | "settings" | "gpc" };

const KEY = "givethra_cookie_consent";
export const CONSENT_EVENT = "givethra:consent-changed";
export const OPEN_SETTINGS_EVENT = "givethra:open-cookie-settings";

export const hasGpc = () =>
  typeof navigator !== "undefined" && (navigator as any).globalPrivacyControl === true;

export function getConsent(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Stored;
    return c.v === SITE.consentVersion ? c : null; // re-ask if categories changed
  } catch { return null; }
}

export function saveConsent(c: Omit<Consent, "necessary">, source: Stored["source"]) {
  const value: Stored = { necessary: true, ...c, v: SITE.consentVersion, ts: new Date().toISOString(), source };
  try { localStorage.setItem(KEY, JSON.stringify(value)); } catch { /* storage blocked */ }
  applyConsent(value);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

// Call once at app start (before loading any analytics/ads script) to set safe defaults.
export function initConsentDefaults() {
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag = w.gtag || function () { w.dataLayer.push(arguments); };
  w.gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", functionality_storage: "denied", personalization_storage: "denied",
    security_storage: "granted", wait_for_update: 500,
  });
  const existing = getConsent();
  if (existing) applyConsent(existing);
  else if (hasGpc()) saveConsent({ preferences: false, analytics: false, marketing: false }, "gpc");
}

function applyConsent(c: Consent) {
  const gtag = (window as any).gtag;
  if (typeof gtag !== "function") return;
  gtag("consent", "update", {
    ad_storage: c.marketing ? "granted" : "denied",
    ad_user_data: c.marketing ? "granted" : "denied",
    ad_personalization: c.marketing ? "granted" : "denied",
    analytics_storage: c.analytics ? "granted" : "denied",
    functionality_storage: c.preferences ? "granted" : "denied",
    personalization_storage: c.preferences ? "granted" : "denied",
  });
}

// Gate any non-essential script behind consent:  if (canUse("analytics")) loadAnalytics();
export const canUse = (cat: "preferences" | "analytics" | "marketing") => !!getConsent()?.[cat];
export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
