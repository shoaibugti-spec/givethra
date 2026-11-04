// src/frontend/src/lib/helpme.ts
// Help Me (video appeals): API client, types and small helpers. Everything goes through the
// same domain (/api/helpme/...), so no extra domain, CORS or CSP change is needed.

const BASE = typeof window !== "undefined" ? window.location.origin : "https://givethra.org";
const RETURN_PATH_KEY = "givethra_helpme_return_path";

export function buildHelpMeShareUrl(appealId: string, origin = BASE): string {
  const url = new URL(`/share/helpme/${encodeURIComponent(appealId)}`, origin);
  url.searchParams.set("preview", "2");
  return url.toString();
}

function safeHelpMeReturnPath(value: string): string | null {
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE || url.pathname === "/helpme" || url.pathname.startsWith("/helpme/")) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/** Remember the internal screen that launched Help Me; never store external or Help Me routes. */
export function rememberHelpMeReturnPath(value: string): void {
  try {
    const safe = safeHelpMeReturnPath(value);
    if (safe) window.sessionStorage.setItem(RETURN_PATH_KEY, safe);
  } catch {
    // Storage can be disabled; Help Me will use the safe home fallback.
  }
}

/** Consume the saved in-app destination once, preventing stale or external back targets. */
export function consumeHelpMeReturnPath(): string | null {
  try {
    const value = window.sessionStorage.getItem(RETURN_PATH_KEY);
    window.sessionStorage.removeItem(RETURN_PATH_KEY);
    return value ? safeHelpMeReturnPath(value) : null;
  } catch {
    return null;
  }
}

function token(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

export class HelpMeError extends Error {
  status: number;
  code?: string;
  data: Record<string, unknown>;
  constructor(message: string, status: number, code?: string, data: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

async function call<T = any>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const t = token();
  const headers: Record<string, string> = { ...(init.headers as Record<string, string> | undefined) };
  if (t) headers.Authorization = `Bearer ${t}`;
  let body = init.body;
  if (init.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  }
  let res: Response;
  try {
    res = await fetch(`${BASE}/api/helpme/${path}`, { ...init, headers, body, credentials: "include" });
  } catch {
    throw new HelpMeError("No internet connection. Please try again.", 0, "NETWORK");
  }
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new HelpMeError(
      typeof payload?.error === "string" ? payload.error : `Request failed (HTTP ${res.status}).`,
      res.status,
      payload?.code,
      payload || {},
    );
  }
  return payload as T;
}

// ─────────────────────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface HelpMeConfig {
  goal_usd_cents: number;
  max_seconds: number;
  min_stop_seconds: number;
  max_bytes: number;
  retention_days: number;
  country_code?: string | null;
  viewer_currency?: string;
  country_currency: Record<string, string>;
  rates: { currency: string; per_usd: number; updated_at?: string }[];
  /** Fallback table so display works even before the daily FX job has run. */
  fallback_rates?: Record<string, number>;
}

export interface Appeal {
  id: string;
  status: string;
  helped: boolean;
  description: string;
  video_url: string | null;
  thumbnail_url: string | null;
  /** Owner's native currency — the currency the money is actually sent in. */
  currency: string;
  goal_local: number;
  raised_local: number;
  /** Viewer-converted display values (server-computed, in the viewer's currency). */
  viewer_currency: string;
  viewer_goal: number;
  viewer_raised: number;
  viewer_remaining: number;
  percent: number;
  counts: { prays: number; comments: number; reposts: number; shares: number; views: number };
  owner: { id: string; name: string; username: string | null; avatar_url: string | null; verified: boolean };
  published_at: string | null;
  helped_at: string | null;
  expires_at?: string | null;
  is_owner: boolean;
  prayed: boolean;
  reposted: boolean;
}

export interface Eligibility {
  can_post: boolean;
  code?: "KYC_REQUIRED" | "ACCOUNT_SUSPENDED" | "ACTIVE_APPEAL" | "COOLDOWN";
  reason?: string;
  next_allowed_at?: string;
  appeal_id?: string;
}

export interface PaymentInfo {
  appeal_id: string;
  /** Owner's currency — this is the currency you must actually send. */
  currency: string;
  account_country: string;
  pay_method: string;
  bank_name: string | null;
  account_title: string;
  account_number: string;
  goal_local: number;
  raised_local: number;
  remaining_local: number;
  /** Viewer-converted equivalents (display only). */
  viewer_currency: string;
  viewer_remaining: number | null;
}

/** Feed response now includes the local-first phase and the viewer's currency. */
export interface FeedResponse {
  items: Appeal[];
  next_cursor: string | null;
  phase: "local" | "global";
  viewer_currency: string;
  viewer_country: string | null;
}

/** Keep legacy/admin payment labels readable while preserving the submitted value. */
export function displayHelpMePaymentMethod(value: string | null | undefined): string {
  return value?.trim() || "Payment account";
}

export interface HelpComment {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  name: string;
  avatar_url: string | null;
  mine: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  API CLIENT
// ─────────────────────────────────────────────────────────────────────────────
export const helpme = {
  config: () => call<HelpMeConfig>("config"),
  feed: (tab: "need" | "helped", cursor?: string | null) =>
    call<FeedResponse>(`feed?tab=${tab}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`),
  appeal: (id: string) => call<Appeal>(`appeals/${encodeURIComponent(id)}`),
  user: (id: string) =>
    call<{ user: Appeal["owner"]; appeals: Appeal[]; reposts: Appeal[]; viewer_currency?: string }>(`users/${encodeURIComponent(id)}`),
  comments: (id: string) => call<HelpComment[]>(`appeals/${encodeURIComponent(id)}/comments`),
  addComment: (id: string, body: string) => call(`appeals/${encodeURIComponent(id)}/comments`, { method: "POST", json: { body } }),
  deleteComment: (id: string) => call(`comments/${encodeURIComponent(id)}`, { method: "DELETE" }),
  pray: (id: string) => call<{ active: boolean }>(`appeals/${encodeURIComponent(id)}/pray`, { method: "POST" }),
  repost: (id: string) => call<{ active: boolean }>(`appeals/${encodeURIComponent(id)}/repost`, { method: "POST" }),
  share: (id: string) => call(`appeals/${encodeURIComponent(id)}/share`, { method: "POST" }).catch(() => null),
  views: (ids: string[]) =>
    fetch(`${BASE}/api/helpme/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
      keepalive: true,
    }).catch(() => null),
  report: (target_type: "appeal" | "comment", target_id: string, reason: string) =>
    call("reports", { method: "POST", json: { target_type, target_id, reason } }),
  payment: (id: string) => call<PaymentInfo>(`appeals/${encodeURIComponent(id)}/payment`),
  submitHelp: (id: string, data: { amount: number; trx_id: string; proof_url: string }) =>
    call(`appeals/${encodeURIComponent(id)}/help`, { method: "POST", json: data }),
  eligibility: () => call<Eligibility>("eligibility"),
  createAppeal: (data: Record<string, unknown>) => call<{ id: string; goal_local: number; currency: string }>("appeals", { method: "POST", json: data }),
  my: () => call<any>("my"),
  stats: (userId: string) => call<{ helped_count: number; helped_pkr: number; received_count: number; received_pkr: number }>(`stats/${encodeURIComponent(userId)}`),
  // Private stream for the owner / admin: an <video src> cannot send the auth header, so fetch a blob.
  privateVideoBlob: async (appealId: string): Promise<string> => {
    const t = token();
    const res = await fetch(`${BASE}/api/helpme/video/${encodeURIComponent(appealId)}`, {
      headers: t ? { Authorization: `Bearer ${t}` } : {},
      credentials: "include",
    });
    if (!res.ok) throw new HelpMeError("Video could not be loaded", res.status);
    return URL.createObjectURL(await res.blob());
  },
  // Raw video upload with progress (XHR gives upload progress; fetch does not).
  uploadVideo: (blob: Blob, onProgress: (p: number) => void): Promise<string> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${BASE}/api/helpme/upload`);
      const t = token();
      if (t) xhr.setRequestHeader("Authorization", `Bearer ${t}`);
      xhr.setRequestHeader("Content-Type", blob.type.split(";")[0] || "video/mp4");
      xhr.withCredentials = true;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onerror = () => reject(new HelpMeError("Upload failed. Check your internet and try again.", 0, "NETWORK"));
      xhr.ontimeout = xhr.onerror;
      xhr.timeout = 120000;
      xhr.onload = () => {
        let payload: any = {};
        try {
          payload = JSON.parse(xhr.responseText);
        } catch {
          /* ignore */
        }
        if (xhr.status >= 200 && xhr.status < 300 && payload.upload_id) resolve(payload.upload_id as string);
        else reject(new HelpMeError(payload?.error || `Upload failed (HTTP ${xhr.status}).`, xhr.status, payload?.code, payload || {}));
      };
      xhr.send(blob);
    }),
  uploadThumbnail: (uploadId: string, blob: Blob) =>
    call<{ ok: true }>(`upload-thumbnail/${encodeURIComponent(uploadId)}`, {
      method: "POST",
      headers: { "Content-Type": "image/jpeg" },
      body: blob,
    }),
  backfillPoster: (appealId: string, blob: Blob) =>
    call<{ ok: true }>(`poster-backfill/${encodeURIComponent(appealId)}`, {
      method: "POST",
      headers: { "Content-Type": "image/jpeg" },
      body: blob,
    }),
  admin: {
    queue: () => call<any>("admin/queue"),
    counts: () => call<{ pending_videos: number; pending_payment_proofs: number; open_reports: number }>("admin/counts"),
    appeal: (id: string, action: string, reason?: string) => call(`admin/appeals/${encodeURIComponent(id)}`, { method: "PUT", json: { action, reason } }),
    help: (id: string, action: string, amount?: number, reason?: string) => call(`admin/help/${encodeURIComponent(id)}`, { method: "PUT", json: { action, amount, reason } }),
    fx: (currency: string, per_usd: number) => call("admin/fx", { method: "PUT", json: { currency, per_usd } }),
    settings: (data: Record<string, number>) => call("admin/settings", { method: "PUT", json: data }),
    resolveReport: (type: string, id: string) => call(`admin/reports/${type}/${encodeURIComponent(id)}`, { method: "PUT", json: {} }),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  MONEY HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const SYMBOL: Record<string, string> = {
  PKR: "Rs", INR: "₹", USD: "$", GBP: "£", EUR: "€", AED: "AED", SAR: "SAR",
  BDT: "৳", LKR: "Rs", NPR: "Rs", QAR: "QAR", KWD: "KWD", TRY: "₺", EGP: "E£",
  NGN: "₦", KES: "KSh", GHS: "₵", ZAR: "R", IDR: "Rp", MYR: "RM", PHP: "₱",
  CAD: "C$", AUD: "A$",
};

export function formatMoney(amount: number, currency: string): string {
  const n = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  const sym = SYMBOL[currency];
  if (!sym) return `${n} ${currency}`;
  return sym.length > 1 && /^[A-Z]+$/.test(sym) ? `${sym} ${n}` : `${sym}${n}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  COUNTRY / CURRENCY DETECTION (viewer side)
//
//  Priority chain (most accurate first):
//   1. Cloudflare's CF-IPCountry, forwarded by /api/helpme/config as `country_code`
//   2. Browser time zone (works even when the language is en-US)
//   3. Browser language region (last-resort)
//   4. "USD" fallback
// ─────────────────────────────────────────────────────────────────────────────
const TZ_TO_COUNTRY: Record<string, string> = {
  "Asia/Karachi": "PK",
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Asia/Dhaka": "BD",
  "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP",
  "Asia/Kabul": "AF",
  "Asia/Tehran": "IR",
  "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA",
  "Asia/Qatar": "QA",
  "Asia/Kuwait": "KW",
  "Asia/Bahrain": "BH",
  "Asia/Muscat": "OM",
  "Asia/Amman": "JO",
  "Asia/Beirut": "LB",
  "Asia/Jerusalem": "IL",
  "Europe/Istanbul": "TR", "Asia/Istanbul": "TR",
  "Africa/Cairo": "EG",
  "Africa/Lagos": "NG",
  "Africa/Nairobi": "KE",
  "Africa/Accra": "GH",
  "Africa/Johannesburg": "ZA",
  "Africa/Casablanca": "MA",
  "Asia/Jakarta": "ID",
  "Asia/Kuala_Lumpur": "MY",
  "Asia/Manila": "PH",
  "Asia/Singapore": "SG",
  "Asia/Bangkok": "TH",
  "Asia/Ho_Chi_Minh": "VN",
  "Asia/Shanghai": "CN",
  "Asia/Hong_Kong": "HK",
  "Asia/Taipei": "TW",
  "Asia/Seoul": "KR",
  "Asia/Tokyo": "JP",
  "Europe/London": "GB",
  "Europe/Dublin": "IE",
  "Europe/Paris": "FR",
  "Europe/Berlin": "DE",
  "Europe/Madrid": "ES",
  "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE",
  "Europe/Lisbon": "PT",
  "Europe/Vienna": "AT",
  "Europe/Zurich": "CH",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Warsaw": "PL",
  "Europe/Prague": "CZ",
  "Europe/Athens": "GR",
  "Europe/Moscow": "RU",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Montreal": "CA",
  "America/Mexico_City": "MX",
  "America/Sao_Paulo": "BR",
  "America/Argentina/Buenos_Aires": "AR",
  "America/Buenos_Aires": "AR",
  "America/Santiago": "CL",
  "America/Bogota": "CO",
  "America/Lima": "PE",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Pacific/Auckland": "NZ",
};

/** The currency the viewer is likely to be showing. Server-detected country wins. */
export function viewerCurrency(cfg: HelpMeConfig | null): string {
  // 1. Cloudflare-detected country (forwarded by the backend as cfg.country_code).
  const cfgCC = String(cfg?.country_code || "").toUpperCase();
  if (cfgCC && cfg?.country_currency[cfgCC]) return cfg.country_currency[cfgCC];
  // 2. Browser time zone — works even when the browser language is "en-US".
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cc = TZ_TO_COUNTRY[tz];
    if (cc && cfg?.country_currency[cc]) return cfg.country_currency[cc];
  } catch {
    /* ignore */
  }
  // 3. Language region.
  try {
    const parts = String(navigator.language || "").split("-");
    const cc = (parts[1] || "").toUpperCase();
    if (cc && cfg?.country_currency[cc]) return cfg.country_currency[cc];
  } catch {
    /* ignore */
  }
  return "USD";
}

export function convert(amount: number, from: string, to: string, cfg: HelpMeConfig | null): number | null {
  if (!cfg || from === to) return null;
  const rateFor = (cur: string): number | null => {
    if (cur === "USD") return 1;
    const fromApi = cfg.rates.find((r) => r.currency === cur)?.per_usd;
    if (fromApi && fromApi > 0) return fromApi;
    const fromFallback = cfg.fallback_rates?.[cur];
    if (fromFallback && fromFallback > 0) return fromFallback;
    return null;
  };
  const a = rateFor(from);
  const b = rateFor(to);
  if (!a || !b) return null;
  return (amount / a) * b;
}

/** Same rounding as the server so the goal shown while posting matches what is saved. */
export function niceGoal(usdCents: number, perUsd: number): number {
  const raw = (usdCents / 100) * perUsd;
  const step = perUsd >= 1000 ? 100 : perUsd >= 100 ? 10 : perUsd >= 10 ? 1 : perUsd >= 2 ? 0.5 : 0.1;
  return Math.round(Math.max(step, Math.round(raw / step) * step) * 100) / 100;
}

/** What the viewer should SEE on a card (already converted by the server). */
export function displayGoal(appeal: Appeal): { amount: number; currency: string } {
  return { amount: appeal.viewer_goal, currency: appeal.viewer_currency };
}
export function displayRaised(appeal: Appeal): { amount: number; currency: string } {
  return { amount: appeal.viewer_raised, currency: appeal.viewer_currency };
}
export function displayRemaining(appeal: Appeal): { amount: number; currency: string } {
  return { amount: appeal.viewer_remaining, currency: appeal.viewer_currency };
}

export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export function regionName(code: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code;
  } catch {
    return code;
  }
}

export function isValidHelpMeAccountIdentifier(value: string): boolean {
  return /^[A-Za-z0-9 @\-+_./]{5,40}$/.test(value.trim());
}

/** Picks the best recording format this browser supports (mp4 first: it plays on every phone). */
export function pickRecorderMime(): string {
  const list = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  if (typeof MediaRecorder === "undefined") return "";
  return list.find((m) => MediaRecorder.isTypeSupported(m)) || "";
}

/** Shrinks a payment screenshot to max 1280px JPEG q0.7 before upload (saves data + storage). */
export async function compressImage(file: File): Promise<File> {
  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("This image could not be read. Choose a screenshot (JPG or PNG)."));
      i.src = bitmapUrl;
    });
    const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.7));
    if (!blob) throw new Error("Image compression failed. Try another screenshot.");
    return new File([blob], "proof.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}

export type HelpMeCameraFacing = "user" | "environment";

/** Accept only a true vertical 9:16 recording; display CSS must not disguise landscape uploads. */
export function isHelpMePortraitRecording(width: number, height: number): boolean {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || height <= width) return false;
  return Math.abs(width / height - 9 / 16) <= 0.01;
}

export function isHelpMePortraitViewport(width: number, height: number, orientationType?: string): boolean {
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0 && width !== height) return height > width;
  const orientation = orientationType?.toLowerCase();
  if (orientation?.startsWith("portrait")) return true;
  if (orientation?.startsWith("landscape")) return false;
  return false;
}

export function getHelpMeContainedFrameRect(sourceWidth: number, sourceHeight: number, targetWidth = 720, targetHeight = 1280) {
  if (![sourceWidth, sourceHeight, targetWidth, targetHeight].every(Number.isFinite) || sourceWidth <= 0 || sourceHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) return null;
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return { x: (targetWidth - width) / 2, y: (targetHeight - height) / 2, width, height };
}

export function getHelpMeCameraFrameLayout(sourceWidth: number, sourceHeight: number, targetWidth = 720, targetHeight = 1280, rotateLandscapeToPortrait = false, landscapeRotationDegrees: -90 | 90 = 90) {
  if (![sourceWidth, sourceHeight, targetWidth, targetHeight].every(Number.isFinite) || sourceWidth <= 0 || sourceHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) return null;
  const rotationDegrees = sourceWidth > sourceHeight ? landscapeRotationDegrees : 0;
  if (rotationDegrees === 90 && !rotateLandscapeToPortrait) return null;
  if (rotationDegrees === -90 && !rotateLandscapeToPortrait) return null;
  const frame = rotationDegrees === 90
    ? getHelpMeContainedFrameRect(sourceHeight, sourceWidth, targetWidth, targetHeight)
    : rotationDegrees === -90
      ? getHelpMeContainedFrameRect(sourceHeight, sourceWidth, targetWidth, targetHeight)
      : getHelpMeContainedFrameRect(sourceWidth, sourceHeight, targetWidth, targetHeight);
  return frame ? { ...frame, rotationDegrees } : null;
}

type ZoomRange = { min: number; max: number };
type CameraCapabilitiesWithZoom = MediaTrackCapabilities & { zoom?: ZoomRange };
type CameraConstraintWithZoom = MediaTrackConstraintSet & { zoom?: number };

/** Ask for a portrait camera stream, preferring a normal, un-cropped sensor view. */
export function getHelpMeCameraConstraints(facing: HelpMeCameraFacing): MediaStreamConstraints {
  return {
    video: {
      facingMode: { exact: facing },
      width: { ideal: 720 },
      height: { ideal: 1280 },
      aspectRatio: { ideal: 9 / 16 },
      frameRate: { ideal: 30, max: 30 },
    },
    audio: { echoCancellation: true, noiseSuppression: true },
  };
}

/** Reset optical/digital zoom when the browser exposes camera zoom controls. */
export async function resetHelpMeCameraZoom(track: MediaStreamTrack): Promise<void> {
  try {
    if (typeof track.getCapabilities !== "function" || typeof track.applyConstraints !== "function") return;
    const zoom = (track.getCapabilities() as CameraCapabilitiesWithZoom).zoom;
    if (!zoom || !Number.isFinite(zoom.min) || !Number.isFinite(zoom.max)) return;

    // 1x is the natural, unzoomed view. Some devices have a minimum above 1x.
    const naturalZoom = Math.max(zoom.min, Math.min(1, zoom.max));
    await track.applyConstraints({ advanced: [{ zoom: naturalZoom } as CameraConstraintWithZoom] });
  } catch {
    // Zoom constraints are optional and must never prevent camera preview/recording.
  }
}
