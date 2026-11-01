// src/frontend/helpme.js
// Help Me: short video appeals. Imported by worker.js; uses the existing D1 (DB) binding
// plus one NEW R2 bucket binding (HELPME_VIDEOS). Money never passes through Givethra:
// heroes pay the appeal owner directly and an admin verifies the proof.

const DEFAULTS = {
  goal_usd_cents: 210,
  post_gap_days: 3,
  helped_cooldown_days: 7,
  retention_days: 90,
  report_hide_threshold: 5,
  pending_expiry_days: 7,
};
const MAX_SECONDS = 20;
const MIN_STOP_SECONDS = 12;
const MAX_VIDEO_BYTES = 6 * 1024 * 1024;
const MAX_THUMBNAIL_BYTES = 1024 * 1024;
const VIDEO_TYPES = { "video/webm": "webm", "video/mp4": "mp4" };
const DAY = 86400000;
const FEED_PAGE = 8;
const PROOF_PREFIX = "https://givethra.org/uploads/helpme-proofs/";

function pendingPosterKey(videoKey) {
  return typeof videoKey === "string" && videoKey.startsWith("pending/") && /\.(mp4|webm)$/i.test(videoKey)
    ? videoKey.replace(/\.(mp4|webm)$/i, ".jpg")
    : null;
}

// Account country -> currency. Unknown countries fall back to USD.
const COUNTRY_CURRENCY = {
  PK: "PKR", IN: "INR", BD: "BDT", LK: "LKR", NP: "NPR", AE: "AED", SA: "SAR", QA: "QAR", KW: "KWD",
  TR: "TRY", EG: "EGP", NG: "NGN", KE: "KES", GH: "GHS", ZA: "ZAR", ID: "IDR", MY: "MYR", PH: "PHP",
  GB: "GBP", CA: "CAD", AU: "AUD", US: "USD",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR", IE: "EUR", PT: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
};

const dayMs = (n) => Number(n) * DAY;
const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
const norm = (v) => String(v ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const money = (n) => Math.round(Number(n) * 100) / 100;

// Description is a public caption: no phone numbers, e-mail or links (those belong in the payment box).
function hasPublicContact(value) {
  return /@|https?:\/\/|www\.|\d{7,}|whats?app|telegram|signal|wechat|\bimo\b|e-?mail/i.test(String(value || ""));
}

function niceGoal(usdCents, perUsd) {
  const raw = (usdCents / 100) * perUsd;
  const step = perUsd >= 1000 ? 100 : perUsd >= 100 ? 10 : perUsd >= 10 ? 1 : perUsd >= 2 ? 0.5 : 0.1;
  return money(Math.max(step, Math.round(raw / step) * step));
}

export async function handleHelpMe(request, env, ctx, user, url, parts, origin, h) {
  const { json, id, now, readJson, sendNotification, isAdmin, publicDisplayName, getActiveSuspension, suspendedActionResponse } = h;
  const method = request.method;
  const sub = parts[2];
  const db = env.DB;
  if (!db) return json({ error: "Database unavailable" }, 503, origin);

  // Videos are served from the SAME domain (givethra.org/api/helpme/media/...). No extra domain or subdomain is needed.
  const videoBase = "/api/helpme/media";
  const need = () => (user ? null : json({ error: "Please sign in to continue", code: "AUTH_REQUIRED" }, 401, origin));
  const adminOnly = () => (isAdmin(user) ? null : json({ error: "Administrator access required" }, 403, origin));
  const notify = async (...args) => { try { await sendNotification(env, ...args); } catch (e) { console.error("HelpMe notification failed", e); } };

  async function settings() {
    const out = { ...DEFAULTS };
    try {
      const rows = await db.prepare("SELECT key, value FROM helpme_settings").all();
      for (const r of rows.results || []) if (r.key in DEFAULTS && Number.isFinite(Number(r.value))) out[r.key] = Number(r.value);
    } catch (e) { console.error("HelpMe settings fallback", e); }
    return out;
  }

  async function fxRate(currency) {
    const row = await db.prepare("SELECT per_usd FROM helpme_fx WHERE currency = ?").bind(currency).first();
    return row ? Number(row.per_usd) : null;
  }

  const cardSelect = `a.id, a.user_id, a.status, a.description, a.currency, a.goal_local, a.raised_local, a.account_country,
      a.prays_count, a.comments_count, a.reposts_count, a.shares_count, a.views_count, a.video_key, a.video_deleted_at,
      a.created_at, a.published_at, a.helped_at, a.expires_at,
      COALESCE(NULLIF(TRIM(p.full_name), ''), NULLIF(TRIM(u.full_name), ''), 'User') AS owner_name,
      p.username AS owner_username, COALESCE(NULLIF(p.avatar_url, ''), u.avatar_url) AS owner_avatar,
      CASE WHEN lower(COALESCE(u.kyc_status, '')) = 'approved' THEN 1 ELSE 0 END AS owner_verified`;
  const cardFrom = `FROM helpme_appeals a JOIN users u ON u.user_id = a.user_id LEFT JOIN profiles p ON p.user_id = a.user_id`;

  function card(row) {
    const helped = row.status === "helped";
    const goal = Number(row.goal_local || 0);
    const raised = Math.min(Number(row.raised_local || 0), goal);
    return {
      id: row.id,
      status: row.status,
      helped,
      description: row.description,
      video_url: row.video_key && !row.video_deleted_at ? `${videoBase}/${row.video_key}` : null,
      thumbnail_url: row.video_key && !row.video_deleted_at ? `${videoBase.replace("/media", "/thumbnail")}/${row.id}` : null,
      currency: row.currency,
      goal_local: goal,
      raised_local: money(raised),
      remaining_local: money(Math.max(0, goal - raised)),
      percent: goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0,
      counts: { prays: row.prays_count, comments: row.comments_count, reposts: row.reposts_count, shares: row.shares_count, views: row.views_count },
      owner: { id: row.user_id, name: publicDisplayName(row.owner_name, "User"), username: row.owner_username || null, avatar_url: row.owner_avatar || null, verified: Boolean(row.owner_verified) },
      published_at: row.published_at, helped_at: row.helped_at, expires_at: row.expires_at,
      is_owner: Boolean(user && user.user_id === row.user_id),
      prayed: Boolean(row.prayed), reposted: Boolean(row.reposted),
    };
  }
  const viewerCols = () => (user
    ? { sql: `, EXISTS(SELECT 1 FROM helpme_prays x WHERE x.appeal_id = a.id AND x.user_id = ?) AS prayed, EXISTS(SELECT 1 FROM helpme_reposts x WHERE x.appeal_id = a.id AND x.user_id = ?) AS reposted`, binds: [user.user_id, user.user_id] }
    : { sql: ", 0 AS prayed, 0 AS reposted", binds: [] });

  // ───────────── PUBLIC READS ─────────────
  if (method === "GET" && sub === "config") {
    const S = await settings();
    const rates = await db.prepare("SELECT currency, per_usd FROM helpme_fx ORDER BY currency").all();
    const res = json({
      goal_usd_cents: S.goal_usd_cents, max_seconds: MAX_SECONDS, min_stop_seconds: MIN_STOP_SECONDS,
      max_bytes: MAX_VIDEO_BYTES, retention_days: S.retention_days, video_base: videoBase,
      country_currency: COUNTRY_CURRENCY, rates: rates.results || [],
    }, 200, origin);
    res.headers.set("Cache-Control", "public, max-age=300");
    return res;
  }

  if (method === "GET" && sub === "feed") {
    const tab = url.searchParams.get("tab") === "helped" ? "helped" : "need";
    const status = tab === "helped" ? "helped" : "published";
    const sortCol = tab === "helped" ? "a.helped_at" : "a.published_at";
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || FEED_PAGE), 1), 20);
    const [curTs, curId] = String(url.searchParams.get("cursor") || "").split("|");
    const v = viewerCols();
    const binds = [...v.binds, status];
    let where = "a.status = ? AND a.video_deleted_at IS NULL";
    if (curTs && curId) { where += ` AND (${sortCol} < ? OR (${sortCol} = ? AND a.id < ?))`; binds.push(curTs, curTs, curId); }
    binds.push(limit + 1);
    const rows = await db.prepare(`SELECT ${cardSelect}${v.sql} ${cardFrom} WHERE ${where} ORDER BY ${sortCol} DESC, a.id DESC LIMIT ?`).bind(...binds).all();
    const list = rows.results || [];
    const page = list.slice(0, limit);
    const last = page[page.length - 1];
    const res = json({ items: page.map(card), next_cursor: list.length > limit && last ? `${tab === "helped" ? last.helped_at : last.published_at}|${last.id}` : null }, 200, origin);
    if (!user) res.headers.set("Cache-Control", "public, max-age=20");
    return res;
  }

  if (method === "GET" && sub === "appeals" && parts[3] && !parts[4]) {
    const v = viewerCols();
    const row = await db.prepare(`SELECT ${cardSelect}${v.sql} ${cardFrom} WHERE a.id = ? AND a.status IN ('published','helped')`).bind(...v.binds, parts[3]).first();
    return row ? json(card(row), 200, origin) : json({ error: "This appeal is not available", code: "NOT_FOUND" }, 404, origin);
  }

  // Posters are private while staged and are only served after the matching video is published.
  if ((method === "GET" || method === "HEAD") && sub === "thumbnail" && parts[3]) {
    const appealId = String(parts[3]);
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(appealId)) return json({ error: "Thumbnail not found" }, 404, origin);
    const appeal = await db.prepare("SELECT status, video_deleted_at, expires_at FROM helpme_appeals WHERE id = ? AND status IN ('published','helped')").bind(appealId).first();
    if (!appeal || appeal.video_deleted_at || (appeal.expires_at && new Date(appeal.expires_at).getTime() <= Date.now())) return json({ error: "Thumbnail not found" }, 404, origin);
    const object = method === "HEAD"
      ? await env.HELPME_VIDEOS?.head(`thumbs/${appealId}.jpg`)
      : await env.HELPME_VIDEOS?.get(`thumbs/${appealId}.jpg`);
    if (!object) return json({ error: "Thumbnail not found" }, 404, origin);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Content-Type", "image/jpeg");
    headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Content-Length", String(object.size));
    return new Response(method === "HEAD" ? null : object.body, { headers });
  }

  if (method === "GET" && sub === "users" && parts[3]) {
    const v = viewerCols();
    const mine = await db.prepare(`SELECT ${cardSelect}${v.sql} ${cardFrom} WHERE a.user_id = ? AND a.status IN ('published','helped') AND a.video_deleted_at IS NULL ORDER BY COALESCE(a.helped_at, a.published_at) DESC LIMIT 50`).bind(...v.binds, parts[3]).all();
    const v2 = viewerCols();
    const reposts = await db.prepare(`SELECT ${cardSelect}${v2.sql} ${cardFrom} JOIN helpme_reposts r ON r.appeal_id = a.id WHERE r.user_id = ? AND a.status IN ('published','helped') AND a.video_deleted_at IS NULL ORDER BY r.created_at DESC LIMIT 50`).bind(...v2.binds, parts[3]).all();
    const who = await db.prepare(`SELECT COALESCE(NULLIF(TRIM(p.full_name), ''), NULLIF(TRIM(u.full_name), ''), 'User') AS name, p.username, COALESCE(NULLIF(p.avatar_url, ''), u.avatar_url) AS avatar_url, CASE WHEN lower(COALESCE(u.kyc_status,''))='approved' THEN 1 ELSE 0 END AS verified FROM users u LEFT JOIN profiles p ON p.user_id = u.user_id WHERE u.user_id = ?`).bind(parts[3]).first();
    if (!who) return json({ error: "User not found" }, 404, origin);
    return json({ user: { id: parts[3], name: publicDisplayName(who.name, "User"), username: who.username || null, avatar_url: who.avatar_url || null, verified: Boolean(who.verified) }, appeals: (mine.results || []).map(card), reposts: (reposts.results || []).map(card) }, 200, origin);
  }

  if (method === "GET" && sub === "appeals" && parts[4] === "comments") {
    const rows = await db.prepare(`SELECT c.id, c.user_id, c.body, c.created_at, COALESCE(NULLIF(TRIM(p.full_name), ''), NULLIF(TRIM(u.full_name), ''), 'User') AS name, COALESCE(NULLIF(p.avatar_url, ''), u.avatar_url) AS avatar_url
      FROM helpme_comments c JOIN users u ON u.user_id = c.user_id LEFT JOIN profiles p ON p.user_id = c.user_id
      WHERE c.appeal_id = ? AND c.status = 'visible' ORDER BY c.created_at DESC LIMIT 60`).bind(parts[3]).all();
    return json((rows.results || []).map((r) => ({ id: r.id, user_id: r.user_id, body: r.body, created_at: r.created_at, name: publicDisplayName(r.name, "User"), avatar_url: r.avatar_url || null, mine: Boolean(user && user.user_id === r.user_id) })), 200, origin);
  }

  // Public video stream (same domain). Only objects under v/ exist for approved appeals; rejected/removed/expired
  // videos are deleted from R2, so they stop working here too. Range support is required for iPhone Safari.
  if (method === "GET" && sub === "media" && parts.length >= 5) {
    const key = parts.slice(3).join("/");
    if (!env.HELPME_VIDEOS || !/^v\/[A-Za-z0-9_-]+\.(mp4|webm)$/.test(key)) return json({ error: "Video not found" }, 404, origin);
    let object;
    try { object = await env.HELPME_VIDEOS.get(key, { range: request.headers }); } catch { return new Response("Range not satisfiable", { status: 416 }); }
    if (!object) return json({ error: "Video not found" }, 404, origin);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=86400");
    headers.set("Content-Type", key.endsWith(".webm") ? "video/webm" : "video/mp4");
    let status = 200;
    if (object.range) {
      const r = object.range;
      const offset = r.suffix !== undefined ? Math.max(0, object.size - r.suffix) : (r.offset ?? 0);
      const length = r.suffix !== undefined ? Math.min(r.suffix, object.size) : (r.length ?? object.size - offset);
      headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
      headers.set("Content-Length", String(length));
      status = 206;
    } else headers.set("Content-Length", String(object.size));
    return new Response(object.body, { status, headers });
  }

  // Totals for a profile: what this person helped (hero) and what they received (appeal owner), in PKR-equivalent.
  if (method === "GET" && sub === "stats" && parts[3]) {
    const pkr = Number((await db.prepare("SELECT per_usd FROM helpme_fx WHERE currency = 'PKR'").first())?.per_usd) || 278;
    const helped = await db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(hh.amount_approved / a.fx_per_usd), 0) AS usd FROM helpme_help hh JOIN helpme_appeals a ON a.id = hh.appeal_id WHERE hh.helper_user_id = ? AND hh.status = 'approved'").bind(parts[3]).first();
    const got = await db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(hh.amount_approved / a.fx_per_usd), 0) AS usd FROM helpme_help hh JOIN helpme_appeals a ON a.id = hh.appeal_id WHERE a.user_id = ? AND hh.status = 'approved'").bind(parts[3]).first();
    const res = json({
      helped_count: Number(helped?.n || 0), helped_pkr: Math.round(Number(helped?.usd || 0) * pkr),
      received_count: Number(got?.n || 0), received_pkr: Math.round(Number(got?.usd || 0) * pkr),
    }, 200, origin);
    res.headers.set("Cache-Control", "public, max-age=30");
    return res;
  }

  // View counts are batched by the app (a few ids at a time) so D1 is not written on every swipe.
  if (method === "POST" && sub === "views") {
    const body = await readJson(request);
    const ids = [...new Set((Array.isArray(body?.ids) ? body.ids : []).map((x) => String(x).slice(0, 64)))].slice(0, 20);
    if (ids.length) await db.batch(ids.map((x) => db.prepare("UPDATE helpme_appeals SET views_count = views_count + 1 WHERE id = ? AND status IN ('published','helped')").bind(x)));
    return json({ ok: true }, 200, origin);
  }
  if (method === "POST" && sub === "appeals" && parts[4] === "share") {
    await db.prepare("UPDATE helpme_appeals SET shares_count = shares_count + 1 WHERE id = ? AND status IN ('published','helped')").bind(parts[3]).run();
    return json({ ok: true }, 200, origin);
  }

  // ───────────── EVERYTHING BELOW NEEDS SIGN-IN ─────────────
  const denied = need();
  if (denied) return denied;

  // Backfill: owner/admin can add the share poster for a LIVE appeal that has none (older videos). Never overwrites.
  if (method === "POST" && sub === "poster-backfill" && parts[3]) {
    const appealId = String(parts[3]);
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(appealId)) return json({ error: "Invalid appeal" }, 400, origin);
    const type = String(request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
    if (type !== "image/jpeg") return json({ error: "Only JPEG thumbnails are accepted", code: "BAD_THUMBNAIL_TYPE" }, 415, origin);
    const a = await db.prepare("SELECT user_id, status, video_deleted_at FROM helpme_appeals WHERE id = ? AND status IN ('published','helped')").bind(appealId).first();
    if (!a || a.video_deleted_at) return json({ error: "Appeal not found" }, 404, origin);
    if (a.user_id !== user.user_id && !isAdmin(user)) return json({ error: "Not allowed" }, 403, origin);
    if (!env.HELPME_VIDEOS) return json({ error: "Video storage is temporarily unavailable" }, 503, origin);
    if (await env.HELPME_VIDEOS.head(`thumbs/${appealId}.jpg`)) return json({ ok: true, existing: true }, 200, origin);
    const image = await request.arrayBuffer();
    const bytes = new Uint8Array(image);
    if (!bytes.length || bytes.length > MAX_THUMBNAIL_BYTES) return json({ error: "Thumbnail is too large or empty", code: "THUMBNAIL_TOO_LARGE" }, 413, origin);
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return json({ error: "Invalid JPEG thumbnail", code: "BAD_THUMBNAIL_TYPE" }, 415, origin);
    await env.HELPME_VIDEOS.put(`thumbs/${appealId}.jpg`, image, { httpMetadata: { contentType: "image/jpeg", cacheControl: "public, max-age=3600" } });
    return json({ ok: true }, 201, origin);
  }

  // Store a small poster next to the pending video. It stays inaccessible until admin approval.
  if (method === "POST" && sub === "upload-thumbnail" && parts[3]) {
    const uploadId = String(parts[3]);
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(uploadId)) return json({ error: "Invalid upload" }, 400, origin);
    const type = String(request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
    if (type !== "image/jpeg") return json({ error: "Only JPEG thumbnails are accepted", code: "BAD_THUMBNAIL_TYPE" }, 415, origin);
    const declaredSize = Number(request.headers.get("Content-Length") || 0);
    if (declaredSize > MAX_THUMBNAIL_BYTES) return json({ error: "Thumbnail is too large", code: "THUMBNAIL_TOO_LARGE" }, 413, origin);
    const upload = await db.prepare("SELECT id FROM helpme_uploads WHERE id = ? AND user_id = ? AND used_appeal_id IS NULL").bind(uploadId, user.user_id).first();
    if (!upload) return json({ error: "Recording not found", code: "UPLOAD_MISSING" }, 404, origin);
    const image = await request.arrayBuffer();
    const bytes = new Uint8Array(image);
    if (!bytes.length || bytes.length > MAX_THUMBNAIL_BYTES) return json({ error: "Thumbnail is too large or empty", code: "THUMBNAIL_TOO_LARGE" }, 413, origin);
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return json({ error: "Invalid JPEG thumbnail", code: "BAD_THUMBNAIL_TYPE" }, 415, origin);
    if (!env.HELPME_VIDEOS) return json({ error: "Video storage is temporarily unavailable" }, 503, origin);
    await env.HELPME_VIDEOS.put(`pending/${uploadId}.jpg`, image, { httpMetadata: { contentType: "image/jpeg" } });
    return json({ ok: true }, 201, origin);
  }

  // ---- owner/admin private video stream (supports Range so seeking works) ----
  if (method === "GET" && sub === "video" && parts[3]) {
    const a = await db.prepare("SELECT user_id, video_key, video_content_type, video_deleted_at FROM helpme_appeals WHERE id = ?").bind(parts[3]).first();
    if (!a || a.video_deleted_at) return json({ error: "Video not found" }, 404, origin);
    if (a.user_id !== user.user_id && !isAdmin(user)) return json({ error: "Not allowed" }, 403, origin);
    const object = await env.HELPME_VIDEOS.get(a.video_key, { range: request.headers });
    if (!object) return json({ error: "Video file is missing" }, 404, origin);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "private, no-store");
    headers.set("Content-Type", a.video_content_type || "video/mp4");
    let status = 200;
    if (object.range) {
      const r = object.range;
      const offset = r.suffix !== undefined ? Math.max(0, object.size - r.suffix) : (r.offset ?? 0);
      const length = r.suffix !== undefined ? Math.min(r.suffix, object.size) : (r.length ?? object.size - offset);
      headers.set("Content-Range", `bytes ${offset}-${offset + length - 1}/${object.size}`);
      headers.set("Content-Length", String(length));
      status = 206;
    } else headers.set("Content-Length", String(object.size));
    return new Response(object.body, { status, headers });
  }

  // ---- eligibility ----
  async function eligibility() {
    const S = await settings();
    const base = { goal_usd_cents: S.goal_usd_cents };
    if (String(user.kyc_status || "").toLowerCase() !== "approved") return { ...base, can_post: false, code: "KYC_REQUIRED", reason: "KYC approval is required before you can post an appeal." };
    const suspension = await getActiveSuspension(env, user.user_id);
    if (suspension) return { ...base, can_post: false, code: "ACCOUNT_SUSPENDED", reason: "Your account is suspended.", suspension };
    const live = await db.prepare("SELECT id, status FROM helpme_appeals WHERE user_id = ? AND status IN ('pending_review','published','under_review') LIMIT 1").bind(user.user_id).first();
    if (live) return { ...base, can_post: false, code: "ACTIVE_APPEAL", reason: live.status === "pending_review" ? "Your appeal is waiting for admin review." : "You already have a live appeal.", appeal_id: live.id };
    const last = await db.prepare("SELECT MAX(created_at) AS c, MAX(helped_at) AS h FROM helpme_appeals WHERE user_id = ? AND status NOT IN ('rejected')").bind(user.user_id).first();
    const gapAt = last?.c ? new Date(last.c).getTime() + dayMs(S.post_gap_days) : 0;
    const coolAt = last?.h ? new Date(last.h).getTime() + dayMs(S.helped_cooldown_days) : 0;
    const nextAt = Math.max(gapAt, coolAt);
    if (nextAt > Date.now()) return { ...base, can_post: false, code: "COOLDOWN", reason: "You can post your next appeal after the waiting period.", next_allowed_at: new Date(nextAt).toISOString() };
    return { ...base, can_post: true };
  }
  if (method === "GET" && sub === "eligibility") return json(await eligibility(), 200, origin);

  // ---- video upload: raw body straight into R2 (never buffered in the Worker) ----
  if (method === "POST" && sub === "upload") {
    const el = await eligibility();
    if (!el.can_post) return json({ error: el.reason, code: el.code, next_allowed_at: el.next_allowed_at }, el.code === "ACCOUNT_SUSPENDED" ? 403 : 409, origin);
    const type = String(request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
    const ext = VIDEO_TYPES[type];
    if (!ext) return json({ error: "Only recorded WebM or MP4 video is accepted", code: "BAD_TYPE" }, 415, origin);
    const size = Number(request.headers.get("Content-Length") || 0);
    if (!size || size > MAX_VIDEO_BYTES) return json({ error: "Video is too large. Please record again.", code: "TOO_LARGE" }, 413, origin);
    if (!env.HELPME_VIDEOS) return json({ error: "Video storage is temporarily unavailable" }, 503, origin);
    const recent = await db.prepare("SELECT COUNT(*) AS n FROM helpme_uploads WHERE user_id = ? AND created_at > ?").bind(user.user_id, new Date(Date.now() - DAY).toISOString()).first();
    if (Number(recent?.n || 0) >= 5) return json({ error: "Too many recordings today. Please try again tomorrow.", code: "UPLOAD_LIMIT" }, 429, origin);
    const uploadId = id();
    const key = `pending/${uploadId}.${ext}`;
    await env.HELPME_VIDEOS.put(key, request.body, { httpMetadata: { contentType: type } });
    await db.prepare("INSERT INTO helpme_uploads (id, user_id, video_key, content_type, size_bytes, created_at) VALUES (?,?,?,?,?,?)").bind(uploadId, user.user_id, key, type, size, now()).run();
    return json({ upload_id: uploadId }, 201, origin);
  }

  // ---- create appeal ----
  if (method === "POST" && sub === "appeals" && !parts[3]) {
    const el = await eligibility();
    if (!el.can_post) return json({ error: el.reason, code: el.code, next_allowed_at: el.next_allowed_at }, el.code === "ACCOUNT_SUSPENDED" ? 403 : 409, origin);
    const b = (await readJson(request)) || {};
    const description = clean(b.description, 300);
    const country = clean(b.account_country, 2).toUpperCase();
    const payMethod = clean(b.pay_method, 60);
    const bank = clean(b.pay_bank_name, 60);
    const title = clean(b.pay_account_title, 80);
    const number = clean(b.pay_account_number, 40);
    if (description.length < 10) return json({ error: "Please describe your need in 2-3 short lines (at least 10 characters).", code: "BAD_DESCRIPTION" }, 400, origin);
    if (hasPublicContact(description)) return json({ error: "Please remove phone numbers, e-mail and links from the description. Payment details go in the payment box.", code: "CONTACT_IN_DESCRIPTION" }, 400, origin);
    if (!/^[A-Z]{2}$/.test(country)) return json({ error: "Select the country of your payment account", code: "BAD_COUNTRY" }, 400, origin);
    if (payMethod.length < 2 || title.length < 2 || !/^[A-Za-z0-9 @\-+_./]{5,40}$/.test(number)) return json({ error: "Payment method, account title and a valid account identifier are required", code: "BAD_PAYMENT" }, 400, origin);
    const upload = await db.prepare("SELECT id, video_key, content_type, size_bytes FROM helpme_uploads WHERE id = ? AND user_id = ? AND used_appeal_id IS NULL").bind(String(b.upload_id || ""), user.user_id).first();
    if (!upload) return json({ error: "Recording not found. Please record again.", code: "UPLOAD_MISSING" }, 400, origin);
    const accountNorm = norm(number);
    const dup = await db.prepare("SELECT 1 AS x FROM helpme_appeals WHERE pay_account_norm = ? AND user_id <> ? AND status IN ('pending_review','published','under_review') LIMIT 1").bind(accountNorm, user.user_id).first();
    if (dup) return json({ error: "This payment account is already used by another live appeal.", code: "ACCOUNT_IN_USE" }, 409, origin);
    const S = await settings();
    const currency = COUNTRY_CURRENCY[country] || "USD";
    const rate = await fxRate(currency);
    if (!rate) return json({ error: "This currency is not available yet", code: "NO_RATE" }, 400, origin);
    const goalLocal = niceGoal(S.goal_usd_cents, rate);
    const appealId = id(); const ts = now();
    const duration = Math.min(Math.max(Math.round(Number(b.duration_ms) || 0), 0), (MAX_SECONDS + 1) * 1000);
    try {
      await db.batch([
        db.prepare(`INSERT INTO helpme_appeals (id,user_id,status,description,video_key,video_content_type,video_size,duration_ms,account_country,currency,fx_per_usd,goal_usd_cents,goal_local,pay_method,pay_bank_name,pay_account_title,pay_account_number,pay_account_norm,created_at)
          VALUES (?,?,'pending_review',?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(appealId, user.user_id, description, upload.video_key, upload.content_type, upload.size_bytes, duration, country, currency, rate, S.goal_usd_cents, goalLocal, payMethod, bank || null, title, number, accountNorm, ts),
        db.prepare("UPDATE helpme_uploads SET used_appeal_id = ? WHERE id = ? AND used_appeal_id IS NULL").bind(appealId, upload.id),
      ]);
    } catch (e) {
      if (/UNIQUE/i.test(String(e?.message))) return json({ error: "You already have a live appeal.", code: "ACTIVE_APPEAL" }, 409, origin);
      throw e;
    }
    await notify(user.user_id, "helpme_submitted", "Help Me appeal submitted", "Your video appeal was sent for review. You will be notified when it goes live.", "/helpme/my");
    return json({ id: appealId, status: "pending_review", goal_local: goalLocal, currency }, 201, origin);
  }

  // ---- reactions ----
  if (method === "POST" && sub === "appeals" && (parts[4] === "pray" || parts[4] === "repost")) {
    const table = parts[4] === "pray" ? "helpme_prays" : "helpme_reposts";
    const col = parts[4] === "pray" ? "prays_count" : "reposts_count";
    const a = await db.prepare("SELECT status, user_id FROM helpme_appeals WHERE id = ?").bind(parts[3]).first();
    if (!a || !["published", "helped"].includes(a.status)) return json({ error: "This appeal is not available" }, 404, origin);
    if (parts[4] === "repost" && a.user_id === user.user_id) return json({ error: "You cannot repost your own appeal" }, 400, origin);
    const had = await db.prepare(`SELECT 1 AS x FROM ${table} WHERE appeal_id = ? AND user_id = ?`).bind(parts[3], user.user_id).first();
    if (had) {
      const r = await db.prepare(`DELETE FROM ${table} WHERE appeal_id = ? AND user_id = ?`).bind(parts[3], user.user_id).run();
      if (Number(r?.meta?.changes || 0)) await db.prepare(`UPDATE helpme_appeals SET ${col} = MAX(0, ${col} - 1) WHERE id = ?`).bind(parts[3]).run();
      return json({ active: false }, 200, origin);
    }
    const r = await db.prepare(`INSERT OR IGNORE INTO ${table} (appeal_id, user_id, created_at) VALUES (?,?,?)`).bind(parts[3], user.user_id, now()).run();
    if (Number(r?.meta?.changes || 0)) await db.prepare(`UPDATE helpme_appeals SET ${col} = ${col} + 1 WHERE id = ?`).bind(parts[3]).run();
    return json({ active: true }, 200, origin);
  }

  // ---- comments ----
  if (method === "POST" && sub === "appeals" && parts[4] === "comments") {
    const suspension = await getActiveSuspension(env, user.user_id);
    if (suspension) return suspendedActionResponse(origin, suspension);
    const b = (await readJson(request)) || {};
    const text = clean(b.body, 300);
    if (text.length < 1) return json({ error: "Write a comment first" }, 400, origin);
    const a = await db.prepare("SELECT status FROM helpme_appeals WHERE id = ?").bind(parts[3]).first();
    if (!a || !["published", "helped"].includes(a.status)) return json({ error: "This appeal is not available" }, 404, origin);
    const recent = await db.prepare("SELECT COUNT(*) AS n FROM helpme_comments WHERE user_id = ? AND created_at > ?").bind(user.user_id, new Date(Date.now() - 3600000).toISOString()).first();
    if (Number(recent?.n || 0) >= 20) return json({ error: "Too many comments. Please wait a little.", code: "RATE_LIMIT" }, 429, origin);
    const cid = id();
    await db.batch([
      db.prepare("INSERT INTO helpme_comments (id, appeal_id, user_id, body, created_at) VALUES (?,?,?,?,?)").bind(cid, parts[3], user.user_id, text, now()),
      db.prepare("UPDATE helpme_appeals SET comments_count = comments_count + 1 WHERE id = ?").bind(parts[3]),
    ]);
    return json({ id: cid, body: text }, 201, origin);
  }
  if (method === "DELETE" && sub === "comments" && parts[3]) {
    const c = await db.prepare("SELECT id, appeal_id, user_id, status FROM helpme_comments WHERE id = ?").bind(parts[3]).first();
    if (!c || c.status !== "visible") return json({ error: "Comment not found" }, 404, origin);
    if (c.user_id !== user.user_id && !isAdmin(user)) return json({ error: "Not allowed" }, 403, origin);
    await db.batch([
      db.prepare("UPDATE helpme_comments SET status = 'deleted' WHERE id = ?").bind(c.id),
      db.prepare("UPDATE helpme_appeals SET comments_count = MAX(0, comments_count - 1) WHERE id = ?").bind(c.appeal_id),
    ]);
    return json({ ok: true }, 200, origin);
  }

  // ---- report (auto-hides an appeal once enough different people report it) ----
  if (method === "POST" && sub === "reports") {
    const b = (await readJson(request)) || {};
    const type = b.target_type === "comment" ? "comment" : b.target_type === "appeal" ? "appeal" : "";
    const targetId = clean(b.target_id, 64);
    if (!type || !targetId) return json({ error: "Invalid report" }, 400, origin);
    await db.prepare("INSERT OR IGNORE INTO helpme_reports (id, target_type, target_id, reporter_id, reason, created_at) VALUES (?,?,?,?,?,?)").bind(id(), type, targetId, user.user_id, clean(b.reason, 200) || null, now()).run();
    if (type === "appeal") {
      const S = await settings();
      const n = await db.prepare("SELECT COUNT(*) AS n FROM helpme_reports WHERE target_type='appeal' AND target_id = ? AND status = 'open'").bind(targetId).first();
      if (Number(n?.n || 0) >= S.report_hide_threshold) await db.prepare("UPDATE helpme_appeals SET status = 'under_review' WHERE id = ? AND status = 'published'").bind(targetId).run();
    }
    return json({ ok: true }, 200, origin);
  }

  // ---- payment details: only for signed-in users, only while the appeal still needs help ----
  if (method === "GET" && sub === "appeals" && parts[4] === "payment") {
    const a = await db.prepare("SELECT id, user_id, status, currency, goal_local, raised_local, pay_method, pay_bank_name, pay_account_title, pay_account_number, account_country FROM helpme_appeals WHERE id = ?").bind(parts[3]).first();
    if (!a || !["published", "helped"].includes(a.status)) return json({ error: "This appeal is not available", code: "NOT_FOUND" }, 404, origin);
    if (a.status === "helped") return json({ error: "This appeal has already been fully helped. Thank you!", code: "ALREADY_HELPED" }, 410, origin);
    if (a.user_id === user.user_id) return json({ error: "You cannot help your own appeal", code: "OWN_APPEAL" }, 400, origin);
    return json({
      appeal_id: a.id, currency: a.currency, account_country: a.account_country,
      pay_method: a.pay_method, bank_name: a.pay_bank_name || null, account_title: a.pay_account_title, account_number: a.pay_account_number,
      goal_local: a.goal_local, raised_local: money(a.raised_local), remaining_local: money(Math.max(0, a.goal_local - a.raised_local)),
    }, 200, origin);
  }

  // ---- hero submits proof of payment ----
  if (method === "POST" && sub === "appeals" && parts[4] === "help") {
    const suspension = await getActiveSuspension(env, user.user_id);
    if (suspension) return suspendedActionResponse(origin, suspension);
    const b = (await readJson(request)) || {};
    const a = await db.prepare("SELECT id, user_id, status, currency, goal_local, raised_local FROM helpme_appeals WHERE id = ?").bind(parts[3]).first();
    if (!a || a.status !== "published") return json({ error: a?.status === "helped" ? "This appeal has already been fully helped. Thank you!" : "This appeal is not available", code: a?.status === "helped" ? "ALREADY_HELPED" : "NOT_FOUND" }, 409, origin);
    if (a.user_id === user.user_id) return json({ error: "You cannot help your own appeal", code: "OWN_APPEAL" }, 400, origin);
    const amount = money(b.amount);
    const remaining = money(Math.max(0, a.goal_local - a.raised_local));
    if (!Number.isFinite(amount) || amount <= 0) return json({ error: "Enter the amount you sent", code: "BAD_AMOUNT" }, 400, origin);
    if (amount > remaining + 0.005) return json({ error: `Only ${remaining} ${a.currency} is still needed for this appeal.`, code: "OVER_REMAINING", remaining_local: remaining }, 400, origin);
    const trxRaw = clean(b.trx_id, 40);
    const trxNorm = norm(trxRaw);
    if (trxNorm.length < 6) return json({ error: "Enter the transaction ID shown on your payment receipt", code: "BAD_TRX" }, 400, origin);
    const proof = String(b.proof_url || "");
    if (!proof.startsWith(PROOF_PREFIX) || proof.length > 300) return json({ error: "Attach a screenshot of your payment", code: "BAD_PROOF" }, 400, origin);
    const mine = await db.prepare("SELECT COUNT(*) AS n FROM helpme_help WHERE helper_user_id = ? AND status = 'pending'").bind(user.user_id).first();
    if (Number(mine?.n || 0) >= 5) return json({ error: "You have several proofs waiting for review. Please wait for them to be verified.", code: "TOO_MANY_PENDING" }, 429, origin);
    const helpId = id();
    try {
      await db.prepare("INSERT INTO helpme_help (id, appeal_id, helper_user_id, amount_claimed, currency, trx_id, trx_norm, proof_url, created_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(helpId, a.id, user.user_id, amount, a.currency, trxRaw, trxNorm, proof, now()).run();
    } catch (e) {
      if (/UNIQUE/i.test(String(e?.message))) return json({ error: "This transaction ID has already been submitted.", code: "TRX_USED" }, 409, origin);
      throw e;
    }
    await notify(user.user_id, "helpme_proof_submitted", "Payment proof received", "Thank you for helping. An admin will verify your payment shortly.", "/helpme/my");
    return json({ id: helpId, status: "pending" }, 201, origin);
  }

  if (method === "GET" && sub === "my") {
    const el = await eligibility();
    const appeals = await db.prepare("SELECT * FROM helpme_appeals WHERE user_id = ? ORDER BY created_at DESC LIMIT 20").bind(user.user_id).all();
    const received = await db.prepare(`SELECT hh.id, hh.appeal_id, hh.amount_approved, hh.currency, hh.reviewed_at, COALESCE(NULLIF(TRIM(p.full_name), ''), NULLIF(TRIM(u.full_name), ''), 'A hero') AS hero_name
      FROM helpme_help hh JOIN helpme_appeals a ON a.id = hh.appeal_id LEFT JOIN users u ON u.user_id = hh.helper_user_id LEFT JOIN profiles p ON p.user_id = hh.helper_user_id
      WHERE a.user_id = ? AND hh.status = 'approved' ORDER BY hh.reviewed_at DESC LIMIT 50`).bind(user.user_id).all();
    const given = await db.prepare("SELECT id, appeal_id, amount_claimed, amount_approved, currency, status, rejection_reason, created_at, reviewed_at FROM helpme_help WHERE helper_user_id = ? ORDER BY created_at DESC LIMIT 50").bind(user.user_id).all();
    return json({
      eligibility: el,
      appeals: (appeals.results || []).map((a) => ({ id: a.id, status: a.status, description: a.description, currency: a.currency, goal_local: a.goal_local, raised_local: money(a.raised_local), rejection_reason: a.rejection_reason, created_at: a.created_at, published_at: a.published_at, helped_at: a.helped_at, expires_at: a.expires_at, video_url: a.video_key && !a.video_deleted_at && ["published", "helped"].includes(a.status) ? `${videoBase}/${a.video_key}` : null, counts: { prays: a.prays_count, comments: a.comments_count, reposts: a.reposts_count, shares: a.shares_count, views: a.views_count } })),
      helps_received: received.results || [],
      helps_given: given.results || [],
    }, 200, origin);
  }

  // ───────────── ADMIN ─────────────
  if (sub === "admin") {
    const no = adminOnly();
    if (no) return no;

    if (method === "GET" && parts[3] === "counts") {
      const [videos, proofs, reports] = await Promise.all([
        db.prepare("SELECT COUNT(*) AS count FROM helpme_appeals WHERE status = 'pending_review'").first(),
        db.prepare("SELECT COUNT(*) AS count FROM helpme_help WHERE status = 'pending'").first(),
        db.prepare("SELECT COUNT(DISTINCT target_type || ':' || target_id) AS count FROM helpme_reports WHERE status = 'open'").first(),
      ]);
      return json({
        pending_videos: Number(videos?.count || 0),
        pending_payment_proofs: Number(proofs?.count || 0),
        open_reports: Number(reports?.count || 0),
      }, 200, origin);
    }

    if (method === "GET" && parts[3] === "queue") {
      const appeals = await db.prepare(`SELECT a.*, COALESCE(NULLIF(TRIM(p.full_name), ''), u.full_name, u.email) AS owner_name, u.email AS owner_email, (SELECT COUNT(*) FROM helpme_reports r WHERE r.target_type='appeal' AND r.target_id=a.id AND r.status='open') AS open_reports
        FROM helpme_appeals a JOIN users u ON u.user_id = a.user_id LEFT JOIN profiles p ON p.user_id = a.user_id
        WHERE a.status IN ('pending_review','under_review') ORDER BY a.created_at ASC LIMIT 100`).all();
      const helps = await db.prepare(`SELECT hh.*, a.currency AS appeal_currency, a.goal_local, a.raised_local, a.pay_account_title, a.pay_account_number, a.pay_method, a.status AS appeal_status,
          COALESCE(NULLIF(TRIM(hp.full_name), ''), hu.full_name, hu.email) AS hero_name, COALESCE(NULLIF(TRIM(op.full_name), ''), ou.full_name, ou.email) AS owner_name
        FROM helpme_help hh JOIN helpme_appeals a ON a.id = hh.appeal_id
        LEFT JOIN users hu ON hu.user_id = hh.helper_user_id LEFT JOIN profiles hp ON hp.user_id = hh.helper_user_id
        LEFT JOIN users ou ON ou.user_id = a.user_id LEFT JOIN profiles op ON op.user_id = a.user_id
        WHERE hh.status = 'pending' ORDER BY hh.created_at ASC LIMIT 100`).all();
      const reports = await db.prepare("SELECT target_type, target_id, COUNT(*) AS n, MAX(created_at) AS last_at, GROUP_CONCAT(reason, ' | ') AS reasons FROM helpme_reports WHERE status = 'open' GROUP BY target_type, target_id ORDER BY n DESC, last_at DESC LIMIT 100").all();
      return json({ appeals: appeals.results || [], helps: helps.results || [], reports: reports.results || [] }, 200, origin);
    }

    if (method === "PUT" && parts[3] === "appeals" && parts[4]) {
      const b = (await readJson(request)) || {};
      const action = String(b.action || "");
      const reason = clean(b.reason, 300);
      const a = await db.prepare("SELECT * FROM helpme_appeals WHERE id = ?").bind(parts[4]).first();
      if (!a) return json({ error: "Appeal not found" }, 404, origin);
      const ts = now();
      const deleteVideo = async () => {
        try { await env.HELPME_VIDEOS.delete(a.video_key); } catch (e) { console.error("HelpMe video delete failed", e); }
        const posterKey = pendingPosterKey(a.video_key) || `thumbs/${a.id}.jpg`;
        try { await env.HELPME_VIDEOS.delete(posterKey); } catch (e) { console.error("HelpMe poster delete failed", e); }
      };

      if (action === "approve") {
        if (a.status !== "pending_review") return json({ error: "This appeal was already reviewed. Refresh the queue." }, 409, origin);
        const S = await settings();
        const object = await env.HELPME_VIDEOS.get(a.video_key);
        if (!object) return json({ error: "Video file is missing. Reject this appeal." }, 409, origin);
        const ext = VIDEO_TYPES[a.video_content_type] || "mp4";
        const liveKey = `v/${a.id}.${ext}`;
        await env.HELPME_VIDEOS.put(liveKey, object.body, { httpMetadata: { contentType: a.video_content_type, cacheControl: "public, max-age=31536000, immutable" } });
        const stagedPosterKey = pendingPosterKey(a.video_key);
        let posterPublished = false;
        if (stagedPosterKey) {
          try {
            const poster = await env.HELPME_VIDEOS.get(stagedPosterKey);
            if (poster) {
              await env.HELPME_VIDEOS.put(`thumbs/${a.id}.jpg`, poster.body, { httpMetadata: { contentType: "image/jpeg", cacheControl: "public, max-age=3600" } });
              posterPublished = true;
            }
          } catch (e) { console.error("HelpMe poster publish failed", e); }
        }
        const r = await db.prepare("UPDATE helpme_appeals SET status='published', video_key=?, published_at=?, expires_at=?, reviewed_by=?, reviewed_at=?, rejection_reason=NULL WHERE id=? AND status='pending_review'")
          .bind(liveKey, ts, new Date(Date.now() + dayMs(S.retention_days)).toISOString(), user.user_id, ts, a.id).run();
        if (!Number(r?.meta?.changes || 0)) { try { await env.HELPME_VIDEOS.delete(liveKey); if (posterPublished) await env.HELPME_VIDEOS.delete(`thumbs/${a.id}.jpg`); } catch {} return json({ error: "This appeal was already reviewed. Refresh the queue." }, 409, origin); }
        try { await env.HELPME_VIDEOS.delete(a.video_key); } catch {}
        if (stagedPosterKey) try { await env.HELPME_VIDEOS.delete(stagedPosterKey); } catch {}
        await notify(a.user_id, "helpme_published", "Your Help Me appeal is live", "Your video appeal was approved and is now visible to heroes.", "/helpme");
        return json({ ok: true, status: "published" }, 200, origin);
      }

      if (action === "reject" || action === "remove") {
        if (!["pending_review", "under_review", "published"].includes(a.status)) return json({ error: "This appeal can no longer be changed." }, 409, origin);
        const next = action === "reject" ? "rejected" : "removed";
        const r = await db.prepare("UPDATE helpme_appeals SET status=?, rejection_reason=?, reviewed_by=?, reviewed_at=?, video_deleted_at=?, pay_account_number='', pay_account_title='' WHERE id=? AND status IN ('pending_review','under_review','published')")
          .bind(next, reason || "Not approved", user.user_id, ts, ts, a.id).run();
        if (!Number(r?.meta?.changes || 0)) return json({ error: "This appeal was already reviewed. Refresh the queue." }, 409, origin);
        await deleteVideo();
        await db.prepare("UPDATE helpme_reports SET status='resolved' WHERE target_type='appeal' AND target_id=?").bind(a.id).run();
        await notify(a.user_id, "helpme_rejected", next === "rejected" ? "Help Me appeal not approved" : "Help Me appeal removed", `${reason || "Your video did not meet our guidelines."} You can record a new appeal.`, "/helpme/my");
        return json({ ok: true, status: next }, 200, origin);
      }

      if (action === "restore") {
        if (a.status !== "under_review") return json({ error: "Only an appeal under review can be restored" }, 409, origin);
        await db.batch([
          db.prepare("UPDATE helpme_appeals SET status='published' WHERE id=? AND status='under_review'").bind(a.id),
          db.prepare("UPDATE helpme_reports SET status='resolved' WHERE target_type='appeal' AND target_id=?").bind(a.id),
        ]);
        return json({ ok: true, status: "published" }, 200, origin);
      }

      if (action === "complete") {
        // Admin decision when the remaining amount is too small to chase.
        if (a.status !== "published") return json({ error: "Only a live appeal can be marked as helped" }, 409, origin);
        const r = await db.prepare("UPDATE helpme_appeals SET status='helped', helped_at=? WHERE id=? AND status='published'").bind(ts, a.id).run();
        if (!Number(r?.meta?.changes || 0)) return json({ error: "Already updated" }, 409, origin);
        await notify(a.user_id, "helpme_helped", "Your appeal is fully helped", "Thank you for your patience. Your appeal is marked as helped.", "/helpme/my");
        return json({ ok: true, status: "helped" }, 200, origin);
      }
      return json({ error: "Unknown action" }, 400, origin);
    }

    if (method === "PUT" && parts[3] === "help" && parts[4]) {
      const b = (await readJson(request)) || {};
      const action = String(b.action || "");
      const hh = await db.prepare("SELECT hh.*, a.user_id AS owner_id, a.status AS appeal_status, a.goal_local, a.raised_local, a.fx_per_usd FROM helpme_help hh JOIN helpme_appeals a ON a.id = hh.appeal_id WHERE hh.id = ?").bind(parts[4]).first();
      if (!hh) return json({ error: "Proof not found" }, 404, origin);
      if (hh.status !== "pending") return json({ error: "This proof was already reviewed. Refresh the queue." }, 409, origin);
      const ts = now();

      if (action === "reject") {
        const reason = clean(b.reason, 300) || "Payment could not be verified";
        const r = await db.prepare("UPDATE helpme_help SET status='rejected', rejection_reason=?, reviewed_by=?, reviewed_at=? WHERE id=? AND status='pending'").bind(reason, user.user_id, ts, hh.id).run();
        if (!Number(r?.meta?.changes || 0)) return json({ error: "Already reviewed by another admin." }, 409, origin);
        await notify(hh.helper_user_id, "helpme_proof_rejected", "Payment proof needs correction", `${reason}. If you did send the money, submit the proof again with the correct details.`, "/helpme/my");
        return json({ ok: true, status: "rejected" }, 200, origin);
      }

      if (action === "approve") {
        const amount = money(b.amount ?? hh.amount_claimed);
        if (!Number.isFinite(amount) || amount <= 0) return json({ error: "Enter the verified amount" }, 400, origin);
        if (hh.appeal_status !== "published") return json({ error: "This appeal is no longer collecting help. Reject the proof and return the money to the hero.", code: "APPEAL_CLOSED" }, 409, origin);
        const remaining = money(Math.max(0, hh.goal_local - hh.raised_local));
        if (amount > remaining + 0.005) return json({ error: `Only ${remaining} is still needed. Lower the amount or reject the proof.`, code: "OVER_REMAINING", remaining_local: remaining }, 409, origin);
        const usdCents = Math.round((amount / Number(hh.fx_per_usd)) * 100);
        const results = await db.batch([
          db.prepare("UPDATE helpme_help SET status='approved', amount_approved=?, reviewed_by=?, reviewed_at=? WHERE id=? AND status='pending'").bind(amount, user.user_id, ts, hh.id),
          db.prepare(`UPDATE helpme_appeals SET raised_local = raised_local + ?, raised_usd_cents = raised_usd_cents + ?,
              status = CASE WHEN raised_local + ? >= goal_local - 0.005 THEN 'helped' ELSE status END,
              helped_at = CASE WHEN raised_local + ? >= goal_local - 0.005 THEN ? ELSE helped_at END
            WHERE id = ? AND status = 'published' AND raised_local + ? <= goal_local + 0.005
              AND EXISTS (SELECT 1 FROM helpme_help WHERE id = ? AND status = 'approved' AND reviewed_at = ?)`)
            .bind(amount, usdCents, amount, amount, ts, hh.appeal_id, amount, hh.id, ts),
        ]);
        if (Number(results?.[0]?.meta?.changes || 0) !== 1) return json({ error: "Already reviewed by another admin." }, 409, origin);
        if (Number(results?.[1]?.meta?.changes || 0) !== 1) {
          await db.prepare("UPDATE helpme_help SET status='pending', amount_approved=NULL, reviewed_by=NULL, reviewed_at=NULL WHERE id=? AND reviewed_at=?").bind(hh.id, ts).run();
          return json({ error: "The appeal changed while you were reviewing (another proof was approved first). Refresh the queue.", code: "APPEAL_CHANGED" }, 409, origin);
        }
        const after = await db.prepare("SELECT status, raised_local, goal_local, currency FROM helpme_appeals WHERE id = ?").bind(hh.appeal_id).first();
        await notify(hh.helper_user_id, "helpme_proof_approved", "Your help was verified", "Your payment was verified. Thank you for being a hero.", "/helpme/my");
        // Kindness Wall: the existing community feed shows who helped, how much, and the short description.
        try {
          const who = await db.prepare("SELECT COALESCE(NULLIF(TRIM(p.full_name), ''), NULLIF(TRIM(u.full_name), ''), 'A hero') AS name FROM users u LEFT JOIN profiles p ON p.user_id = u.user_id WHERE u.user_id = ?").bind(hh.helper_user_id).first();
          const ap = await db.prepare("SELECT description FROM helpme_appeals WHERE id = ?").bind(hh.appeal_id).first();
          const heroName = publicDisplayName(who?.name, "A hero");
          await db.prepare("INSERT OR IGNORE INTO community_posts (id, user_id, display_name, message, created_at) VALUES (?,?,?,?,?)")
            .bind(`helpme-help-${hh.id}`, hh.helper_user_id, heroName, `🙏 ${heroName} helped ${money(amount)} ${hh.currency} on Help Me: ${clean(ap?.description, 300)}`, ts).run();
        } catch (e) { console.error("HelpMe kindness post failed", e); }
        if (after?.status === "helped") await notify(hh.owner_id, "helpme_helped", "Your appeal is fully helped", `You received ${amount} ${after.currency}; your goal is complete. Alhamdulillah.`, "/helpme/my");
        else await notify(hh.owner_id, "helpme_help_received", "You received help", `A hero helped you with ${amount} ${hh.currency}.`, "/helpme/my");
        return json({ ok: true, status: "approved", appeal_status: after?.status, raised_local: after?.raised_local }, 200, origin);
      }
      return json({ error: "Unknown action" }, 400, origin);
    }

    if (method === "PUT" && parts[3] === "fx") {
      const b = (await readJson(request)) || {};
      const cur = clean(b.currency, 3).toUpperCase(); const perUsd = Number(b.per_usd);
      if (!/^[A-Z]{3}$/.test(cur) || !(perUsd > 0)) return json({ error: "Invalid currency or rate" }, 400, origin);
      await db.prepare("INSERT INTO helpme_fx (currency, per_usd, updated_at) VALUES (?,?,?) ON CONFLICT(currency) DO UPDATE SET per_usd=excluded.per_usd, updated_at=excluded.updated_at").bind(cur, perUsd, now()).run();
      return json({ ok: true }, 200, origin);
    }
    if (method === "PUT" && parts[3] === "settings") {
      const b = (await readJson(request)) || {};
      const stmts = Object.keys(DEFAULTS).filter((k) => b[k] !== undefined && Number.isFinite(Number(b[k])) && Number(b[k]) >= 0).map((k) => db.prepare("INSERT INTO helpme_settings (key, value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(k, String(Number(b[k]))));
      if (stmts.length) await db.batch(stmts);
      return json({ ok: true }, 200, origin);
    }
    if (method === "PUT" && parts[3] === "reports" && parts[4] && parts[5]) {
      await db.prepare("UPDATE helpme_reports SET status='resolved' WHERE target_type = ? AND target_id = ?").bind(parts[4] === "comment" ? "comment" : "appeal", parts[5]).run();
      return json({ ok: true }, 200, origin);
    }
  }

  return json({ error: "API route not found" }, 404, origin);
}

// Runs from the existing daily cron. Keeps R2 and D1 small so the bill stays flat.
export async function helpmeDailyCleanup(env) {
  if (!env.DB || !env.HELPME_VIDEOS) return;
  const ts = new Date().toISOString();
  let retention = DEFAULTS.retention_days; let pendingDays = DEFAULTS.pending_expiry_days;
  try {
    const rows = await env.DB.prepare("SELECT key, value FROM helpme_settings WHERE key IN ('retention_days','pending_expiry_days')").all();
    for (const r of rows.results || []) { if (r.key === "retention_days") retention = Number(r.value) || retention; if (r.key === "pending_expiry_days") pendingDays = Number(r.value) || pendingDays; }
  } catch {}

  // 1. Videos older than the retention window (90 days): delete file, scrub payment details, keep the history row.
  const old = await env.DB.prepare("SELECT id, video_key FROM helpme_appeals WHERE status IN ('published','helped','under_review') AND expires_at IS NOT NULL AND expires_at <= ? AND video_deleted_at IS NULL LIMIT 100").bind(ts).all();
  for (const a of old.results || []) {
    try { await env.HELPME_VIDEOS.delete(a.video_key); } catch (e) { console.error("HelpMe expiry delete failed", a.id, e); continue; }
    try { await env.HELPME_VIDEOS.delete(`thumbs/${a.id}.jpg`); } catch {}
    await env.DB.prepare("UPDATE helpme_appeals SET status='expired', video_deleted_at=?, pay_account_number='', pay_account_title='' WHERE id=?").bind(ts, a.id).run();
  }
  // 2. Appeals nobody reviewed in time.
  const stale = await env.DB.prepare("SELECT id, user_id, video_key FROM helpme_appeals WHERE status='pending_review' AND created_at <= ? LIMIT 100").bind(new Date(Date.now() - dayMs(pendingDays)).toISOString()).all();
  for (const a of stale.results || []) {
    try { await env.HELPME_VIDEOS.delete(a.video_key); } catch {}
    const posterKey = pendingPosterKey(a.video_key);
    if (posterKey) try { await env.HELPME_VIDEOS.delete(posterKey); } catch {}
    await env.DB.prepare("UPDATE helpme_appeals SET status='rejected', rejection_reason='Not reviewed in time. Please record again.', video_deleted_at=?, pay_account_number='', pay_account_title='' WHERE id=? AND status='pending_review'").bind(ts, a.id).run();
  }
  // 3. Recordings that were never turned into an appeal.
  const orphans = await env.DB.prepare("SELECT id, video_key FROM helpme_uploads WHERE used_appeal_id IS NULL AND created_at <= ? LIMIT 200").bind(new Date(Date.now() - DAY).toISOString()).all();
  for (const o of orphans.results || []) {
    try { await env.HELPME_VIDEOS.delete(o.video_key); } catch {}
    try { await env.HELPME_VIDEOS.delete(`pending/${o.id}.jpg`); } catch {}
    await env.DB.prepare("DELETE FROM helpme_uploads WHERE id=?").bind(o.id).run();
  }
  // 4. Old upload bookkeeping rows.
  await env.DB.prepare("DELETE FROM helpme_uploads WHERE used_appeal_id IS NOT NULL AND created_at <= ?").bind(new Date(Date.now() - dayMs(30)).toISOString()).run();
}


// ───────────── Used by the existing Hero Leaderboard and Heroes Wall (additive; callers fall back safely) ─────────────
async function pkrPerUsd(db) {
  const r = await db.prepare("SELECT per_usd FROM helpme_fx WHERE currency = 'PKR'").first();
  return Number(r?.per_usd) || 278;
}

/** Same rows/ranking as the old leaderboard, plus verified Help Me payments (converted to PKR). */
export async function helpmeLeaderboardRows(env, limit) {
  const db = env.DB;
  const pkr = await pkrPerUsd(db);
  const rows = await db.prepare(
    `WITH helps AS (
       SELECT r.hero_id AS hero_id, r.case_id AS item_id, COALESCE(r.amount_paid, 0) AS amount, lower(COALESCE(r.paid_to, '')) AS paid_to,
              COALESCE(r.completed_at, r.admin_confirmed_at, r.submitted_at) AS at
       FROM case_resolutions r
       WHERE r.hero_id IS NOT NULL AND trim(r.hero_id) <> ''
         AND lower(COALESCE(r.status, '')) IN ('approved', 'completed')
         AND COALESCE(r.admin_confirmed, 0) IN (1, '1', 'true')
       UNION ALL
       SELECT hh.helper_user_id, hh.appeal_id, ROUND(hh.amount_approved / a.fx_per_usd * ?, 2), 'direct', hh.reviewed_at
       FROM helpme_help hh JOIN helpme_appeals a ON a.id = hh.appeal_id
       WHERE hh.status = 'approved' AND hh.amount_approved IS NOT NULL
     )
     SELECT h.hero_id AS user_id,
            COALESCE(NULLIF(u.full_name, ''), NULLIF(p.full_name, ''), 'Givethra Hero') AS full_name,
            COALESCE(NULLIF(u.avatar_url, ''), NULLIF(p.avatar_url, '')) AS avatar_url,
            COUNT(DISTINCT h.item_id) AS cases_helped,
            COALESCE(SUM(h.amount), 0) AS total_amount,
            COUNT(DISTINCT CASE WHEN h.paid_to <> 'givethra' THEN h.item_id END) AS direct_help_count,
            COUNT(DISTINCT CASE WHEN h.paid_to = 'givethra' THEN h.item_id END) AS contribution_count,
            MAX(h.at) AS last_helped_at
     FROM helps h
     LEFT JOIN users u ON u.user_id = h.hero_id
     LEFT JOIN profiles p ON p.user_id = h.hero_id
     GROUP BY h.hero_id, u.full_name, p.full_name, u.avatar_url, p.avatar_url
     HAVING COUNT(DISTINCT h.item_id) > 0
     ORDER BY cases_helped DESC, total_amount DESC, last_helped_at DESC
     LIMIT ?`
  ).bind(pkr, limit).all();
  return rows.results || [];
}

/** Helped appeals as Heroes Wall cards (amounts in PKR-equivalent, short text first, full text in `description`). */
export async function helpmeWallRows(env, limit) {
  const db = env.DB;
  const pkr = await pkrPerUsd(db);
  const list = await db.prepare(
    `SELECT a.id, a.user_id, a.description, a.currency, a.goal_local, a.raised_local, a.fx_per_usd, a.helped_at,
            COALESCE(NULLIF(p.avatar_url, ''), NULLIF(u.avatar_url, '')) AS avatar_url
     FROM helpme_appeals a JOIN users u ON u.user_id = a.user_id LEFT JOIN profiles p ON p.user_id = a.user_id
     WHERE a.helped_at IS NOT NULL AND a.status IN ('helped', 'expired')
     ORDER BY a.helped_at DESC LIMIT ?`
  ).bind(limit).all();
  const rows = []; let total = 0;
  for (const a of list.results || []) {
    const postId = `helpme-${a.id}`;
    const text = String(a.description || "");
    const goalPkr = Math.round((Number(a.goal_local) / Number(a.fx_per_usd)) * pkr);
    const raisedPkr = Math.round((Number(a.raised_local) / Number(a.fx_per_usd)) * pkr);
    total += raisedPkr;
    let post = null, likes = null, comments = null;
    try {
      await db.prepare("INSERT OR IGNORE INTO community_posts (id, user_id, display_name, message, created_at) VALUES (?, ?, 'Givethra Heroes', ?, ?)")
        .bind(postId, a.user_id, `Heroes helped complete a Help Me appeal: ${text}`, a.helped_at).run();
      [post, likes, comments] = await Promise.all([
        db.prepare("SELECT message, created_at FROM community_posts WHERE id = ?").bind(postId).first(),
        db.prepare("SELECT COUNT(*) AS count FROM community_post_likes WHERE post_id = ?").bind(postId).first(),
        db.prepare("SELECT COUNT(*) AS count FROM community_post_comments WHERE post_id = ?").bind(postId).first(),
      ]);
    } catch (e) { console.error("Help Me wall counters unavailable", e); }
    rows.push({
      id: a.id, user_id: a.user_id, source: "helpme", category: "Help Me",
      title: text.split(/\n/)[0].slice(0, 90), description: text,
      currency: "PKR", amount_needed: goalPkr, amount_collected: raisedPkr, verified_amount: raisedPkr,
      original_currency: a.currency, original_amount: Number(a.raised_local),
      selfie_url: null, avatar_url: a.avatar_url || null, updated_at: a.helped_at, completed_at: a.helped_at,
      post_id: postId, post_message: text, post_created_at: post?.created_at || a.helped_at,
      likes_count: Number(likes?.count || 0), comments_count: Number(comments?.count || 0),
    });
  }
  return { rows, total_pkr: total };
}
