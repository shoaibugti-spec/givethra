// src/frontend/src/lib/helpme.ts
// Help Me (video appeals): API client, types and small helpers. Everything goes through the
// same domain (/api/helpme/...), so no extra domain, CORS or CSP change is needed.

const BASE = typeof window !== "undefined" ? window.location.origin : "https://givethra.org";

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

export interface HelpMeConfig {
  goal_usd_cents: number;
  max_seconds: number;
  min_stop_seconds: number;
  max_bytes: number;
  retention_days: number;
  country_currency: Record<string, string>;
  rates: { currency: string; per_usd: number }[];
}

export interface Appeal {
  id: string;
  status: string;
  helped: boolean;
  description: string;
  video_url: string | null;
  currency: string;
  goal_local: number;
  raised_local: number;
  remaining_local: number;
  percent: number;
  counts: { prays: number; comments: number; reposts: number; shares: number; views: number };
  owner: { id: string; name: string; username: string | null; avatar_url: string | null; verified: boolean };
  published_at: string | null;
  helped_at: string | null;
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
  currency: string;
  pay_method: string;
  bank_name: string | null;
  account_title: string;
  account_number: string;
  goal_local: number;
  raised_local: number;
  remaining_local: number;
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

export const helpme = {
  config: () => call<HelpMeConfig>("config"),
  feed: (tab: "need" | "helped", cursor?: string | null) =>
    call<{ items: Appeal[]; next_cursor: string | null }>(`feed?tab=${tab}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`),
  appeal: (id: string) => call<Appeal>(`appeals/${encodeURIComponent(id)}`),
  user: (id: string) =>
    call<{ user: Appeal["owner"]; appeals: Appeal[]; reposts: Appeal[] }>(`users/${encodeURIComponent(id)}`),
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
  admin: {
    queue: () => call<any>("admin/queue"),
    appeal: (id: string, action: string, reason?: string) => call(`admin/appeals/${encodeURIComponent(id)}`, { method: "PUT", json: { action, reason } }),
    help: (id: string, action: string, amount?: number, reason?: string) => call(`admin/help/${encodeURIComponent(id)}`, { method: "PUT", json: { action, amount, reason } }),
    fx: (currency: string, per_usd: number) => call("admin/fx", { method: "PUT", json: { currency, per_usd } }),
    settings: (data: Record<string, number>) => call("admin/settings", { method: "PUT", json: data }),
    resolveReport: (type: string, id: string) => call(`admin/reports/${type}/${encodeURIComponent(id)}`, { method: "PUT", json: {} }),
  },
};

// ---------- money helpers ----------
const SYMBOL: Record<string, string> = { PKR: "Rs", INR: "₹", USD: "$", GBP: "£", EUR: "€", AED: "AED", SAR: "SAR" };

export function formatMoney(amount: number, currency: string): string {
  const n = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  const sym = SYMBOL[currency];
  if (!sym) return `${n} ${currency}`;
  return sym.length > 1 && /^[A-Z]+$/.test(sym) ? `${sym} ${n}` : `${sym}${n}`;
}

/** Viewer currency from the browser language (ur-PK -> PKR). Falls back to USD. */
export function viewerCurrency(cfg: HelpMeConfig | null): string {
  try {
    const lang = navigator.language || "";
    const region = (lang.split("-")[1] || "").toUpperCase();
    return (cfg && cfg.country_currency[region]) || "USD";
  } catch {
    return "USD";
  }
}

export function convert(amount: number, from: string, to: string, cfg: HelpMeConfig | null): number | null {
  if (!cfg || from === to) return null;
  const a = cfg.rates.find((r) => r.currency === from)?.per_usd;
  const b = to === "USD" ? 1 : cfg.rates.find((r) => r.currency === to)?.per_usd;
  if (!a || !b) return null;
  return (amount / a) * b;
}

/** Same rounding as the server so the goal shown while posting matches what is saved. */
export function niceGoal(usdCents: number, perUsd: number): number {
  const raw = (usdCents / 100) * perUsd;
  const step = perUsd >= 1000 ? 100 : perUsd >= 100 ? 10 : perUsd >= 10 ? 1 : perUsd >= 2 ? 0.5 : 0.1;
  return Math.round(Math.max(step, Math.round(raw / step) * step) * 100) / 100;
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

export const PAY_METHODS: Record<string, string[]> = {
  PK: ["Easypaisa", "JazzCash", "Bank transfer"],
  IN: ["UPI", "Bank transfer"],
  default: ["Bank transfer", "PayPal", "Wise", "Other"],
};

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
