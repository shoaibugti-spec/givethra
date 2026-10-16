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
  contactEmail: "info@givethra.org",
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

// One list for every footer / social section of the app (Home, Layout footer, About, Contact).
// Empty URL = icon hidden automatically.
export const SOCIALS = [
  { key: "facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61590715263595" },
  { key: "instagram", label: "Instagram", url: "https://www.instagram.com/givethra.community" },
  { key: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/company/givethra-org/" },
  { key: "x", label: "X (Twitter)", url: "https://x.com/GivethraXorg" },
  { key: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@givethra.org" },
  { key: "youtube", label: "YouTube", url: "https://youtube.com/@givethra" },
  { key: "threads", label: "Threads", url: "https://www.threads.com/@givethra.community" },
  { key: "reddit", label: "Reddit", url: "https://www.reddit.com/user/givethra" },
  { key: "telegram", label: "Telegram", url: "https://t.me/givethra" },
  { key: "whatsapp", label: "WhatsApp Channel", url: "https://whatsapp.com/channel/0029Vb8k4u02v1IyortPNw2J" },
] as const;
