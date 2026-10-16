// src/lib/siteConfig.ts
// Single source of truth for legal pages. Fill every value marked CONFIRM before launch.
export const SITE = {
  name: "Givethra",
  tagline: "From Need to Help.",
  url: "https://www.givethra.org",
  lastUpdated: "October 2026",
  minAge: 18,
  creditValueUsd: 1,
  // CONFIRM: real, monitored mailboxes
  supportEmail: "support@givethra.org",
  privacyEmail: "privacy@givethra.org",
  legalEmail: "legal@givethra.org",
  // CONFIRM: operating location (province/country) and, if you wish, the legal operator name
  operatorRegion: "Pakistan",
  operatorProvince: "", // e.g. "Punjab" - leave empty to hide
  operatorLegalName: "", // e.g. "Shoaib Ahmed (Sole Proprietor)" - shown only if filled
  governingLaw: "the laws of Pakistan",
  consentVersion: 1, // bump when cookie categories change, to re-ask everyone
};

// Empty URL = icon hidden automatically. Add Facebook/Instagram/LinkedIn/WhatsApp once confirmed.
export const SOCIALS = [
  { key: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@givethra.org" },
  { key: "x", label: "X (Twitter)", url: "https://x.com/GivethraXorg" },
  { key: "threads", label: "Threads", url: "https://www.threads.com/@givethra.community" },
  { key: "youtube", label: "YouTube", url: "https://youtube.com/@givethra" },
  { key: "reddit", label: "Reddit", url: "https://www.reddit.com/user/givethra" },
  { key: "telegram", label: "Telegram", url: "https://t.me/givethra" },
  { key: "facebook", label: "Facebook", url: "" },
  { key: "instagram", label: "Instagram", url: "" },
  { key: "linkedin", label: "LinkedIn", url: "" },
  { key: "whatsapp", label: "WhatsApp Support", url: "" },
] as const;
