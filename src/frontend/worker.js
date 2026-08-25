// ============================================================
// FILE: worker.js (COMPLETE - ALL FEATURES + COMMUNITY POSTS, LIKES, COMMENTS, MARK-READ + PROFILE FIXED)
// ============================================================

const DEFAULT_GOOGLE_CLIENT_ID =
  "588032676735-6aa3hj5b990sa5hcn6qltvj10581od9p.apps.googleusercontent.com";
const PUBLIC_ORIGIN = "https://givethra.org";
const ADMIN_EMAILS = new Set(["shoaibahmedbugti5@gmail.com"]);

function googleClientId(env) {
  return String(env?.GOOGLE_CLIENT_ID || env?.VITE_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID).trim();
}

function corsHeaders(origin) {
  const allowOrigin = origin === PUBLIC_ORIGIN ? origin : PUBLIC_ORIGIN;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(data, status = 200, origin = "") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  });
}

function now() {
  return new Date().toISOString();
}

function id() {
  return crypto.randomUUID();
}

function base64UrlEncode(value) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signSession(user, secret) {
  if (!secret) return null;
  const payload = base64UrlEncode(JSON.stringify({
    user_id: user.user_id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  }));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `v2.${payload}.${base64UrlEncode(signature)}`;
}

async function verifySession(token, secret) {
  if (!secret || !token?.startsWith("v2.")) return null;
  try {
    const [, payload, encodedSignature] = token.split(".");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(encodedSignature), new TextEncoder().encode(payload));
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    if (!data.user_id || !data.email || !Number.isFinite(data.exp) || data.exp <= Math.floor(Date.now() / 1000)) return null;
    return { user_id: String(data.user_id), email: String(data.email).toLowerCase(), full_name: data.full_name || data.email, avatar_url: data.avatar_url || "", role: isAdmin(data) ? "admin" : null };
  } catch {
    return null;
  }
}

function isAdmin(user) {
  return Boolean(user && ADMIN_EMAILS.has(String(user.email).toLowerCase()));
}

function bearer(request) {
  const value = request.headers.get("Authorization") || "";
  return value.replace(/^Bearer\s+/i, "").trim();
}

async function verifyGoogleCredential(credential, clientId) {
  if (credential && credential.length > 100 && !credential.startsWith("eyJhbGciOi")) {
    // Custom session token fallback
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  let response;
  try {
    response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
      { signal: controller.signal },
    );
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
  if (!response.ok) return null;

  const payload = await response.json();
  const audience = String(payload.aud || "").trim();
  const verified = payload.email_verified === true || payload.email_verified === "true";
  if (!clientId || !payload.sub || !payload.email || audience !== clientId || !verified) return null;

  return {
    google_id: String(payload.sub),
    email: String(payload.email).toLowerCase(),
    full_name: payload.name || "User",
    avatar_url: payload.picture || "",
  };
}

async function findOrCreateUser(env, identity) {
  if (!env.DB) return { ...identity, user_id: identity.google_id };

  // Email is the durable legacy identity. The current production users table
  // intentionally does not require a google_id column: the verified Google
  // credential is exchanged for a signed session whose user_id is this D1 row.
  const existing = await env.DB.prepare(
    `SELECT user_id, email, full_name, avatar_url, kyc_status, total_cases,
            pending_cases, active_or_completed_cases, rejected_cases, balance, last_community_visit
     FROM users WHERE lower(trim(email)) = lower(trim(?)) LIMIT 1`
  ).bind(identity.email).first();

  const timestamp = now();
  const userId = String(existing?.user_id || identity.google_id);
  const existingProfile = await env.DB.prepare(
    "SELECT full_name, avatar_url FROM profiles WHERE user_id = ?"
  ).bind(userId).first();
  const savedName = String(existingProfile?.full_name || existing?.full_name || "").trim();
  const savedAvatar = String(existingProfile?.avatar_url || existing?.avatar_url || "").trim();
  const canonicalName = savedName && !savedName.includes("@") ? savedName : identity.full_name;
  const canonicalAvatar = savedAvatar || identity.avatar_url;

  if (existing) {
    await env.DB.prepare(
      `UPDATE users SET full_name = ?, avatar_url = ?, updated_at = ? WHERE user_id = ?`
    ).bind(canonicalName, canonicalAvatar, timestamp, userId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO users (user_id, email, full_name, avatar_url, last_community_visit, signed_up_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(userId, identity.email, canonicalName, canonicalAvatar, timestamp, timestamp, timestamp).run();
  }

  await env.DB.prepare(
    `INSERT INTO profiles (user_id, full_name, avatar_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET full_name = excluded.full_name, avatar_url = excluded.avatar_url, updated_at = excluded.updated_at`
  ).bind(userId, canonicalName, canonicalAvatar, timestamp, timestamp).run();

  return {
    user_id: userId,
    email: identity.email,
    full_name: canonicalName,
    avatar_url: canonicalAvatar,
    kyc_status: existing?.kyc_status || "none",
    role: isAdmin(identity) ? "admin" : null,
    last_community_visit: existing?.last_community_visit || timestamp,
  };
}

async function hydrateAuthenticatedUser(env, session) {
  if (!env.DB || !session?.user_id) return session;
  try {
    const row = await env.DB.prepare(
      `SELECT u.user_id, u.email, u.full_name, u.avatar_url, u.kyc_status,
              u.total_cases, u.pending_cases, u.active_or_completed_cases, u.rejected_cases,
              u.balance, u.last_community_visit,
              p.full_name AS profile_full_name, p.avatar_url AS profile_avatar_url
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.user_id
       WHERE u.user_id = ? LIMIT 1`
    ).bind(session.user_id).first();
    if (!row) return session;
    const candidateName = String(row.profile_full_name || row.full_name || session.full_name || "").trim();
    const fullName = candidateName && !candidateName.includes("@") ? candidateName : "User";
    return {
      ...session,
      user_id: String(row.user_id || session.user_id),
      email: String(row.email || session.email).toLowerCase(),
      full_name: fullName,
      avatar_url: row.profile_avatar_url || row.avatar_url || session.avatar_url || "",
      kyc_status: row.kyc_status || session.kyc_status || "none",
      total_cases: row.total_cases,
      pending_cases: row.pending_cases,
      active_or_completed_cases: row.active_or_completed_cases,
      rejected_cases: row.rejected_cases,
      balance: row.balance,
      last_community_visit: row.last_community_visit,
      role: isAdmin(row) ? "admin" : session.role || null,
    };
  } catch {
    return session;
  }
}

async function authenticate(request, env, clientId, createUser = false) {
  const credential = bearer(request);
  if (!credential) return null;
  const session = await verifySession(credential, env.JWT_SECRET);
  if (session) return hydrateAuthenticatedUser(env, session);
  const identity = await verifyGoogleCredential(credential, clientId);
  if (!identity) return null;
  if (createUser) return findOrCreateUser(env, identity);

  if (!env.DB) return { ...identity, user_id: identity.google_id };
  const existing = await env.DB.prepare(
    `SELECT user_id, email, full_name, avatar_url, kyc_status, total_cases,
            pending_cases, active_or_completed_cases, rejected_cases, balance, last_community_visit
     FROM users WHERE lower(trim(email)) = lower(trim(?)) LIMIT 1`
  ).bind(identity.email).first();
  return hydrateAuthenticatedUser(env, {
    user_id: existing?.user_id || identity.google_id,
    email: identity.email,
    full_name: existing?.full_name || identity.full_name,
    avatar_url: existing?.avatar_url || identity.avatar_url,
    kyc_status: existing?.kyc_status || "none",
    role: isAdmin(identity) ? "admin" : null,
    last_community_visit: existing?.last_community_visit || null,
  });
}

function pathParts(url) {
  return url.pathname.split("/").filter(Boolean);
}

function requestedUserId(url) {
  return url.searchParams.get("user_id") || "";
}

function canAccessUser(user, userId) {
  return isAdmin(user) || !userId || user.user_id === userId;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function pick(body, fields) {
  return Object.fromEntries(fields.filter((field) => body && body[field] !== undefined).map((field) => [field, body[field]]));
}

// ============================================================
//  PROFILE HANDLER - FIXED
// ============================================================
async function handleProfile(request, env, user, parts, origin) {
  const userId = String(parts[2] || user.user_id || "");
  if (!userId || !canAccessUser(user, userId)) {
    return json({ error: "Forbidden" }, 403, origin);
  }

  if (request.method === "GET") {
    const profile = await env.DB.prepare(
      "SELECT * FROM profiles WHERE user_id = ?"
    ).bind(userId).first();
    return json(profile || { user_id: userId }, 200, origin);
  }

  if (request.method !== "PUT") {
    return json({ error: "Method not allowed" }, 405, origin);
  }

  const body = await readJson(request);
  const allowedFields = [
    "full_name", "phone_number", "country", "city",
    "bio", "preferred_language", "avatar_url", "cover_url"
  ];
  const values = pick(body, allowedFields);
  if (Object.keys(values).length === 0) {
    return json({ error: "No valid fields to update" }, 400, origin);
  }

  const current = await env.DB.prepare(
    "SELECT * FROM profiles WHERE user_id = ?"
  ).bind(userId).first();
  const merged = {
    ...(current || {}),
    ...values,
    user_id: userId,
    created_at: current?.created_at || now(),
    updated_at: now()
  };

  // Upsert preserves existing rows and repairs accounts without a profile row.
  // It does not delete or migrate any existing data.
  await env.DB.prepare(
    `INSERT INTO profiles
      (user_id, full_name, phone_number, country, city, bio, preferred_language, avatar_url, cover_url, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
      full_name = excluded.full_name,
      phone_number = excluded.phone_number,
      country = excluded.country,
      city = excluded.city,
      bio = excluded.bio,
      preferred_language = excluded.preferred_language,
      avatar_url = excluded.avatar_url,
      cover_url = excluded.cover_url,
      updated_at = excluded.updated_at`
  ).bind(
    userId,
    merged.full_name || null,
    merged.phone_number || null,
    merged.country || null,
    merged.city || null,
    merged.bio || null,
    merged.preferred_language || "en",
    merged.avatar_url || null,
    merged.cover_url || null,
    merged.created_at,
    merged.updated_at
  ).run();

  await env.DB.prepare(
    "UPDATE users SET full_name = ?, avatar_url = ?, updated_at = ? WHERE user_id = ?"
  ).bind(
    merged.full_name || user.full_name || null,
    merged.avatar_url || user.avatar_url || null,
    merged.updated_at,
    userId
  ).run();

  const persisted = await env.DB.prepare(
    "SELECT * FROM profiles WHERE user_id = ?"
  ).bind(userId).first();
  if (!persisted) {
    return json({ error: "Profile update could not be verified" }, 500, origin);
  }
  return json(persisted, 200, origin);
}

// ============================================================
//  KYC HANDLER
// ============================================================
async function handleKyc(request, env, user, url, parts, origin) {
  const queryUser = requestedUserId(url);
  const target = queryUser || user.user_id;
  if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);

  if (request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT * FROM kyc_submissions WHERE user_id = ? ORDER BY submitted_at DESC LIMIT ?"
    ).bind(target, Number(url.searchParams.get("limit") || 50)).all();
    return json(rows.results || [], 200, origin);
  }
  if (request.method === "POST") {
    const body = await readJson(request);
    const record = pick(body, ["full_name", "date_of_birth", "address", "cnic_number", "cnic_front_url", "cnic_back_url", "selfie_url", "passport_url", "face_video_url", "document_type"]);
    const submissionId = body?.id || id();
    await env.DB.prepare(
      "INSERT INTO kyc_submissions (id, user_id, full_name, date_of_birth, address, cnic_number, cnic_front_url, cnic_back_url, selfie_url, passport_url, face_video_url, document_type, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)"
    ).bind(submissionId, user.user_id, record.full_name || null, record.date_of_birth || null, record.address || null, record.cnic_number || null, record.cnic_front_url || null, record.cnic_back_url || null, record.selfie_url || null, record.passport_url || null, record.face_video_url || null, record.document_type || null, now()).run();
    await env.DB.prepare("UPDATE users SET kyc_status = 'pending', updated_at = ? WHERE user_id = ?").bind(now(), user.user_id).run();
    return json({ id: submissionId, user_id: user.user_id, ...record, status: "pending" }, 201, origin);
  }
  if (request.method === "PUT" && parts[2]) {
    const existing = await env.DB.prepare("SELECT * FROM kyc_submissions WHERE id = ?").bind(parts[2]).first();
    if (!existing) return json({ error: "KYC submission not found" }, 404, origin);

    if (isAdmin(user)) {
      const body = await readJson(request);
      const values = pick(body, ["status", "rejection_reason", "reviewed_at", "reviewed_by"]);
      const allowed = ["status", "rejection_reason", "reviewed_at", "reviewed_by"];
      const assignments = allowed.filter((field) => values[field] !== undefined).map((field) => `${field} = ?`);
      const params = allowed.filter((field) => values[field] !== undefined).map((field) => values[field]);
      if (assignments.length) {
        await env.DB.prepare(`UPDATE kyc_submissions SET ${assignments.join(", ")} WHERE id = ?`).bind(...params, parts[2]).run();
      }
      return json(await env.DB.prepare("SELECT * FROM kyc_submissions WHERE id = ?").bind(parts[2]).first(), 200, origin);
    }

    if (existing.user_id !== user.user_id) return json({ error: "Forbidden" }, 403, origin);
    if (String(existing.status || "").toLowerCase() !== "rejected") {
      return json({ error: "Only a rejected KYC submission can be resubmitted" }, 409, origin);
    }
    const body = await readJson(request);
    const record = pick(body, ["full_name", "date_of_birth", "address", "cnic_number", "cnic_front_url", "cnic_back_url", "selfie_url", "passport_url", "face_video_url", "document_type"]);
    await env.DB.prepare(
      "UPDATE kyc_submissions SET full_name = ?, date_of_birth = ?, address = ?, cnic_number = ?, cnic_front_url = ?, cnic_back_url = ?, selfie_url = ?, passport_url = ?, face_video_url = ?, document_type = ?, status = 'pending', rejection_reason = NULL, reviewed_at = NULL, reviewed_by = NULL, submitted_at = ? WHERE id = ? AND user_id = ?"
    ).bind(record.full_name || null, record.date_of_birth || null, record.address || null, record.cnic_number || null, record.cnic_front_url || null, record.cnic_back_url || null, record.selfie_url || null, record.passport_url || null, record.face_video_url || null, record.document_type || null, now(), parts[2], user.user_id).run();
    await env.DB.prepare("UPDATE users SET kyc_status = 'pending', updated_at = ? WHERE user_id = ?").bind(now(), user.user_id).run();
    return json(await env.DB.prepare("SELECT * FROM kyc_submissions WHERE id = ?").bind(parts[2]).first(), 200, origin);
  }
  return json({ error: "Method not allowed" }, 405, origin);
}

function decodeCaseRow(row) {
  if (!row) return row;
  const result = { ...row };
  for (const field of ["photo_urls", "category_details"]) {
    if (typeof result[field] === "string" && result[field]) {
      try { result[field] = JSON.parse(result[field]); } catch { /* preserve legacy plain strings */ }
    }
  }
  return result;
}

// ============================================================
//  CASES HANDLER
// ============================================================
async function handleCases(request, env, user, url, parts, origin) {
  if (request.method === "GET") {
    if (parts[2] === "approved") {
      const rows = await env.DB.prepare("SELECT * FROM case_submissions WHERE lower(status) IN ('approved', 'published', 'active') ORDER BY submitted_at DESC").all();
      return json((rows.results || []).map(decodeCaseRow), 200, origin);
    }
    if (parts[2] === "by-ids") {
      const ids = String(url.searchParams.get("ids") || "").split(",").map((value) => value.trim()).filter(Boolean).slice(0, 100);
      if (!ids.length) return json([], 200, origin);
      const placeholders = ids.map(() => "?").join(", ");
      const visibility = isAdmin(user) ? "" : " AND (user_id = ? OR lower(status) IN ('approved', 'published', 'active'))";
      const params = isAdmin(user) ? ids : [...ids, user.user_id];
      const rows = await env.DB.prepare(`SELECT * FROM case_submissions WHERE id IN (${placeholders})${visibility}`).bind(...params).all();
      const found = new Map((rows.results || []).map((row) => [row.id, decodeCaseRow(row)]));
      return json(ids.map((value) => found.get(value)).filter(Boolean), 200, origin);
    }
    const target = requestedUserId(url);
    if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
    if (parts[2] && parts[2] !== "approved" && parts[2] !== "counts" && parts[2] !== "category-counts") {
      const row = await env.DB.prepare("SELECT * FROM case_submissions WHERE id = ?").bind(parts[2]).first();
      if (!row || (!isAdmin(user) && row.user_id !== user.user_id && !["approved", "published", "active"].includes(String(row.status).toLowerCase()))) return json({ error: "Not found" }, 404, origin);
      return json(decodeCaseRow(row), 200, origin);
    }
    if (parts[2] === "counts") {
      const row = await env.DB.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status IN ('approved','published','active') THEN 1 ELSE 0 END) AS active_or_completed, SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected FROM case_submissions WHERE user_id = ?").bind(target || user.user_id).first();
      return json(row || {}, 200, origin);
    }
    if (parts[2] === "category-counts") {
      const rows = await env.DB.prepare("SELECT category, COUNT(*) AS count FROM case_submissions WHERE lower(status) IN ('approved', 'published', 'active') GROUP BY category").all();
      const counts = Object.fromEntries((rows.results || []).filter((row) => row.category).map((row) => [row.category, Number(row.count || 0)]));
      return json(counts, 200, origin);
    }
    const sql = target ? "SELECT * FROM case_submissions WHERE user_id = ? ORDER BY submitted_at DESC" : "SELECT * FROM case_submissions ORDER BY submitted_at DESC";
    const rows = target ? await env.DB.prepare(sql).bind(target).all() : await env.DB.prepare(sql).all();
    return json((rows.results || []).map(decodeCaseRow), 200, origin);
  }
  if (request.method === "POST" && !parts[2]) {
    const body = await readJson(request);
    const record = pick(body, ["category", "title", "short_description", "country", "city", "urgency", "description", "amount_needed", "currency", "why_help", "deadline", "institute_name", "institute_contact", "institute_address", "payment_method", "account_title", "account_number", "account_iban", "photo_urls", "selfie_url", "video_url", "category_details", "was_free"]);
    const caseId = body?.id || id();
    const photoUrls = Array.isArray(record.photo_urls) || (record.photo_urls && typeof record.photo_urls === "object") ? JSON.stringify(record.photo_urls) : (record.photo_urls || null);
    const categoryDetails = Array.isArray(record.category_details) || (record.category_details && typeof record.category_details === "object") ? JSON.stringify(record.category_details) : (record.category_details || null);
    await env.DB.prepare(
      "INSERT INTO case_submissions (id, user_id, category, title, short_description, country, city, urgency, description, amount_needed, currency, why_help, deadline, institute_name, institute_contact, institute_address, payment_method, account_title, account_number, account_iban, photo_urls, selfie_url, video_url, category_details, was_free, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)"
    ).bind(caseId, user.user_id, record.category || null, record.title || null, record.short_description || null, record.country || null, record.city || null, record.urgency || null, record.description || null, record.amount_needed || null, record.currency || "USD", record.why_help || null, record.deadline || null, record.institute_name || null, record.institute_contact || null, record.institute_address || null, record.payment_method || null, record.account_title || null, record.account_number || null, record.account_iban || null, photoUrls, record.selfie_url || null, record.video_url || null, categoryDetails, record.was_free ? 1 : 0, now()).run();
    await env.DB.prepare("UPDATE users SET total_cases = COALESCE(total_cases, 0) + 1, pending_cases = COALESCE(pending_cases, 0) + 1, updated_at = ? WHERE user_id = ?").bind(now(), user.user_id).run();
    return json({ id: caseId, user_id: user.user_id, ...record, status: "pending" }, 201, origin);
  }
  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  COMMUNITY POSTS HANDLER
// ============================================================
function guestIdentity(request, body = null) {
  const raw = request.headers.get("X-Guest-ID") || body?.guest_id || "";
  const normalized = String(raw).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  if (!normalized) return null;
  const suffix = normalized.replace(/[^0-9]/g, "").slice(-6) || normalized.slice(-6);
  return { id: `guest:${normalized}`, name: `Guest ${suffix}` };
}

function publicDisplayName(value, fallback = "User") {
  const name = String(value || "").trim();
  if (!name || name.includes("@")) return fallback;
  return name.slice(0, 120);
}

function queueCommunityNotification(ctx, task) {
  const safeTask = Promise.resolve(task).catch((error) => console.error("Community notification failed:", error));
  if (ctx?.waitUntil) ctx.waitUntil(safeTask);
  else void safeTask;
}

async function insertCommunityNotification(env, ctx, recipientId, actorId, actorName, type, title, message) {
  if (!recipientId || recipientId === actorId) return;
  queueCommunityNotification(ctx, env.DB.prepare(
    `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`
  ).bind(id(), recipientId, type, title, `${publicDisplayName(actorName, "A Givethra member")}: ${message}`, "/community", now()).run());
}

async function handleCommunityPosts(request, env, user, url, parts, origin) {
  if (request.method === "GET" && parts.length === 3) {
    const guest = user ? null : guestIdentity(request);
    const actorId = user?.user_id || guest?.id || "";
    const posts = await env.DB.prepare(
      `WITH like_counts AS (
         SELECT post_id,
           COUNT(*) AS likes_count,
           MAX(CASE WHEN user_id = ? THEN 1 ELSE 0 END) AS is_liked
         FROM community_post_likes
         GROUP BY post_id
       ), comment_counts AS (
         SELECT post_id, COUNT(*) AS comments_count
         FROM community_post_comments
         GROUP BY post_id
       )
       SELECT cp.*,
        u.full_name as user_name,
        u.kyc_status as user_kyc_status,
        COALESCE(lc.likes_count, 0) AS likes_count,
        COALESCE(cc.comments_count, 0) AS comments_count,
        COALESCE(lc.is_liked, 0) AS is_liked
       FROM community_posts cp
       LEFT JOIN users u ON cp.user_id = u.user_id
       LEFT JOIN like_counts lc ON lc.post_id = cp.id
       LEFT JOIN comment_counts cc ON cc.post_id = cp.id
       ORDER BY cp.created_at DESC
       LIMIT 500`
    ).bind(actorId).all();

    return json((posts.results || []).map((post) => ({
      ...post,
      is_guest: !post.user_id,
      display_name: publicDisplayName(post.user_name, publicDisplayName(post.display_name, "User")),
      is_verified: post.user_kyc_status === "approved",
      likes_count: Number(post.likes_count || 0),
      comments_count: Number(post.comments_count || 0),
      is_liked: Boolean(post.is_liked),
    })), 200, origin);
  }

    if (request.method === "POST" && parts.length === 3) {
    const body = await readJson(request);
    const message = String(body?.message || "").trim();
    if (!message) return json({ error: "Message is required" }, 400, origin);
    const guest = user ? null : guestIdentity(request, body);
    if (!user && !guest) return json({ error: "Guest identity is required" }, 400, origin);
    const postId = id();
    const displayName = user
      ? publicDisplayName(user.full_name, "User")
      : guest.name;
    await env.DB.prepare(
      `INSERT INTO community_posts (id, user_id, display_name, message, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(postId, user?.user_id || null, displayName, message, now()).run();

    const newPost = await env.DB.prepare(
      `SELECT cp.*, u.full_name as user_name, u.kyc_status as user_kyc_status
       FROM community_posts cp
       LEFT JOIN users u ON cp.user_id = u.user_id
       WHERE cp.id = ?`
    ).bind(postId).first();

    return json({
      ...newPost,
      is_guest: !user,
      display_name: displayName,
      is_verified: newPost?.user_kyc_status === "approved",
      likes_count: 0,
      comments_count: 0,
      comments: [],
    }, 201, origin);
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  COMMUNITY LIKES HANDLER
// ============================================================
async function handleCommunityLikes(request, env, user, url, parts, origin, ctx) {
  const postId = parts[3];
  if (!postId) return json({ error: "Post ID required" }, 400, origin);

  if (request.method === "GET") {
    const likes = await env.DB.prepare(
      "SELECT * FROM community_post_likes WHERE post_id = ?"
    ).bind(postId).all();
    return json(likes.results || [], 200, origin);
  }

    if (request.method === "POST") {
    const guest = user ? null : guestIdentity(request);
    const actorId = user?.user_id || guest?.id;
    if (!actorId) return json({ error: "Guest identity is required" }, 400, origin);
    const post = await env.DB.prepare("SELECT user_id FROM community_posts WHERE id = ?").bind(postId).first();
    const actorName = user ? publicDisplayName(user.full_name, "User") : guest.name;
    const existing = await env.DB.prepare(
      "SELECT id FROM community_post_likes WHERE post_id = ? AND user_id = ?"
    ).bind(postId, actorId).first();

    if (existing) {
      await env.DB.prepare(
        "DELETE FROM community_post_likes WHERE post_id = ? AND user_id = ?"
      ).bind(postId, actorId).run();
      return json({ liked: false, post_id: postId }, 200, origin);
    } else {
      const likeId = id();
      await env.DB.prepare(
        "INSERT INTO community_post_likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)"
      ).bind(likeId, postId, actorId, now()).run();
      await insertCommunityNotification(
        env,
        ctx,
        post?.user_id,
        actorId,
        actorName,
        "like",
        "New Community Like",
        "liked your post"
      );
      return json({ liked: true, post_id: postId, id: likeId }, 201, origin);
    }
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  COMMUNITY COMMENTS HANDLER
// ============================================================
async function handleCommunityComments(request, env, user, url, parts, origin, ctx) {
  const postId = parts[3];
  if (!postId) return json({ error: "Post ID required" }, 400, origin);

  if (request.method === "GET") {
    const comments = await env.DB.prepare(
      `SELECT cc.*,
        CASE WHEN cc.user_id LIKE 'guest:%' THEN 'Guest ' || substr(cc.user_id, 7) ELSE u.full_name END as user_name
       FROM community_post_comments cc
       LEFT JOIN users u ON cc.user_id = u.user_id
       WHERE cc.post_id = ?
       ORDER BY cc.created_at ASC`
    ).bind(postId).all();
    return json((comments.results || []).map((comment) => ({
      ...comment,
      user_name: publicDisplayName(comment.user_name, String(comment.user_id || "").startsWith("guest:") ? `Guest ${String(comment.user_id).slice(-6)}` : "User"),
    })), 200, origin);
  }

  if (request.method === "POST") {
    const body = await readJson(request);
    const guest = user ? null : guestIdentity(request, body);
    const actorId = user?.user_id || guest?.id;
    if (!actorId) return json({ error: "Guest identity is required" }, 400, origin);
    const commentText = String(body?.comment || "").trim();
    if (!commentText) return json({ error: "Comment is required" }, 400, origin);
    const post = await env.DB.prepare("SELECT user_id FROM community_posts WHERE id = ?").bind(postId).first();
    const actorName = user ? publicDisplayName(user.full_name, "User") : guest.name;

    const commentId = id();
    await env.DB.prepare(
      "INSERT INTO community_post_comments (id, post_id, user_id, comment, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(commentId, postId, actorId, commentText, now()).run();

    const newComment = await env.DB.prepare(
      `SELECT cc.*,
        CASE WHEN cc.user_id LIKE 'guest:%' THEN 'Guest ' || substr(cc.user_id, 7) ELSE u.full_name END as user_name
       FROM community_post_comments cc
       LEFT JOIN users u ON cc.user_id = u.user_id
       WHERE cc.id = ?`
    ).bind(commentId).first();

    await insertCommunityNotification(
      env,
      ctx,
      post?.user_id,
      actorId,
      actorName,
      "comment",
      "New Community Comment",
      `commented: "${commentText.slice(0, 80)}${commentText.length > 80 ? "..." : ""}"`
    );
    return json(newComment ? {
      ...newComment,
      user_name: publicDisplayName(newComment.user_name, guest ? guest.name : "User"),
    } : { id: commentId, post_id: postId, user_id: actorId, user_name: actorName, comment: commentText, created_at: now() }, 201, origin);
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  NOTIFICATIONS HANDLER
// ============================================================
async function handleNotifications(request, env, user, url, parts, origin) {
  const requested = url.searchParams.get("user_id") || user?.user_id;
  if (!requested || !canAccessUser(user, requested)) {
    return json({ error: "Unauthorized" }, 403, origin);
  }

  if (parts[2] === "unread-count" && request.method === "GET") {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND (is_read = 0 OR is_read IS NULL)"
    ).bind(requested).first();
    return json({ count: Number(row?.count || 0) }, 200, origin);
  }

  if (request.method === "GET") {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 100), 1), 500);
    const rows = await env.DB.prepare(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
    ).bind(requested, limit).all();
    return json(rows.results || [], 200, origin);
  }

  if (request.method === "POST") {
    const body = await readJson(request);
    const notification = pick(body, ["user_id", "type", "title", "message", "link", "is_read"]);
    if (!notification.user_id || !notification.title) {
      return json({ error: "user_id and title are required" }, 400, origin);
    }
    const nid = id();
    await env.DB.prepare(
      `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(nid, notification.user_id, notification.type || null, notification.title, notification.message || null, notification.link || null, notification.is_read ? 1 : 0, now()).run();
    return json({ id: nid, ...notification, created_at: now() }, 201, origin);
  }

  if (parts[2] === "mark-read" && request.method === "PUT") {
    await env.DB.prepare(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ?"
    ).bind(requested).run();
    return json({ updated: true, user_id: requested }, 200, origin);
  }

  if (parts[2] === "clear" && request.method === "DELETE") {
    await env.DB.prepare(
      "DELETE FROM notifications WHERE user_id = ?"
    ).bind(requested).run();
    return json({ deleted: true, user_id: requested }, 200, origin);
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  MAIN HANDLER
// ============================================================
async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const origin = url.origin;
  const parts = pathParts(url);

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

    if (parts[0] === "health" && request.method === "GET") {
    return json({ status: "ok", timestamp: now() }, 200, origin);
  }

  if (parts[0] === "auth" && parts[1] === "google" && request.method === "POST") {
    const body = await readJson(request);
    const identity = await verifyGoogleCredential(body?.credential || body?.id_token, googleClientId(env));
    if (!identity) return json({ error: "Google credential could not be verified for this website", code: "GOOGLE_CREDENTIAL_INVALID" }, 401, origin);
    const account = await findOrCreateUser(env, identity);
    const token = await signSession(account, env.JWT_SECRET);
    if (!token) return json({ error: "Authentication is not configured" }, 500, origin);
    return json({ token, user: account }, 200, origin);
  }

  if (parts[0] === "verify" && request.method === "GET") {
    const user = await authenticate(request, env, googleClientId(env));
    if (!user) return json({ valid: false }, 401, origin);
    return json({ valid: true, user }, 200, origin);
  }

  // Public static assets must be served before the auth-required API branch.
  // Otherwise anonymous visitors receive JSON { error: "Authentication required" }
  // instead of the SPA HTML/JavaScript bundle.
  if (url.pathname.startsWith("/uploads/")) {
    const key = url.pathname.slice(9);
    try {
      const object = await env.UPLOADS.get(key);
      if (!object) return new Response("File not found", { status: 404 });
      return new Response(object.body, {
        headers: {
          "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  }
  if (env.ASSETS && parts[0] !== "api" && request.method === "GET") {
    return env.ASSETS.fetch(request);
  }

  // ============================================================
  //  PUBLIC: Community Posts (no auth required for reading)
  // ============================================================
  if (parts[0] === "api" && parts[1] === "community") {
    const user = await authenticate(request, env, googleClientId(env));
    if (parts[2] === "mark-read" && request.method === "PUT") {
      if (!user) return json({ error: "Authentication required" }, 401, origin);
      await env.DB.prepare(
        "UPDATE users SET last_community_visit = ?, updated_at = ? WHERE user_id = ?"
      ).bind(now(), now(), user.user_id).run();
      return json({ updated: true, user_id: user.user_id }, 200, origin);
    }
    
    if (parts[2] === "posts" && parts.length === 3 && request.method === "GET") {
      return handleCommunityPosts(request, env, user, url, parts, origin);
    }
    if (parts[2] === "posts" && parts.length === 3 && request.method === "POST") {
      return handleCommunityPosts(request, env, user, url, parts, origin);
    }
    if (parts[2] === "posts" && parts[4] === "likes") {
      return handleCommunityLikes(request, env, user, url, parts, origin, ctx);
    }
    if (parts[2] === "posts" && parts[4] === "comments") {
      return handleCommunityComments(request, env, user, url, parts, origin, ctx);
    }
  }

  // ============================================================
  //  AUTH REQUIRED: All other APIs
  // ============================================================
  const user = await authenticate(request, env, googleClientId(env));
  if (!user && parts[0] !== "api") {
    return json({ error: "Authentication required" }, 401, origin);
  }

  if (parts[0] === "api") {
    // ✅ PROFILES - NOW FIXED
    if (parts[1] === "profiles") {
      return handleProfile(request, env, user, parts, origin);
    }

    if (parts[1] === "kyc-submissions") {
      return handleKyc(request, env, user, url, parts, origin);
    }

    if (parts[1] === "cases") {
      return handleCases(request, env, user, url, parts, origin);
    }

    if (parts[1] === "notifications") {
      return handleNotifications(request, env, user, url, parts, origin);
    }

    if (parts[1] === "wallets" && parts[2]) {
      if (request.method === "GET") {
        if (!canAccessUser(user, parts[2])) return json({ error: "Forbidden" }, 403, origin);
        const wallet = await env.DB.prepare("SELECT * FROM wallets WHERE user_id = ?").bind(parts[2]).first();
        return json(wallet || { user_id: parts[2], balance: 0 }, 200, origin);
      }
      if (request.method === "PUT") {
        if (!canAccessUser(user, parts[2])) return json({ error: "Forbidden" }, 403, origin);
        const body = await readJson(request);
        const balance = Number(body?.balance || 0);
        await env.DB.prepare(
          "INSERT INTO wallets (user_id, balance, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = excluded.balance, updated_at = excluded.updated_at"
        ).bind(parts[2], balance, now()).run();
        return json({ user_id: parts[2], balance }, 200, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    if (parts[1] === "deposits") {
      if (request.method === "GET") {
        const target = url.searchParams.get("user_id") || user.user_id;
        if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
        const rows = await env.DB.prepare("SELECT * FROM deposits WHERE user_id = ? ORDER BY submitted_at DESC").bind(target).all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const target = body?.user_id || user.user_id;
        if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
        const amount = Number(body?.amount);
        const transactionId = String(body?.transaction_id ?? body?.payment_reference ?? "").trim();
        const proofUrl = String(body?.proof_url ?? "").trim();
        if (!Number.isFinite(amount) || amount <= 0) return json({ error: "A valid deposit amount is required" }, 400, origin);
        if (!transactionId) return json({ error: "Transaction ID or reference is required" }, 400, origin);
        if (!proofUrl) return json({ error: "Payment proof is required" }, 400, origin);
        const depositId = body?.id || id();
        const submittedAt = body?.submitted_at || body?.deposit_date || now();
        await env.DB.prepare(
          `INSERT INTO deposits (id, user_id, method, amount, currency, transaction_id, proof_url, status, credits, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
        ).bind(
          depositId,
          target,
          body?.method || body?.payment_method || null,
          amount,
          body?.currency || "USD",
          transactionId,
          proofUrl,
          Number.isFinite(Number(body?.credits)) ? Number(body.credits) : amount,
          submittedAt,
        ).run();
        const created = await env.DB.prepare("SELECT * FROM deposits WHERE id = ?").bind(depositId).first();
        return json(created || { id: depositId, user_id: target, amount, currency: body?.currency || "USD", transaction_id: transactionId, proof_url: proofUrl, status: "pending", credits: amount, submitted_at: submittedAt }, 201, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    if (parts[1] === "feedbacks") {
      if (request.method === "GET") {
        const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 500);
        const caseId = url.searchParams.get("case_id");
        const feedbackUserId = url.searchParams.get("user_id");
        if (caseId && feedbackUserId) {
          const row = await env.DB.prepare(
            "SELECT f.*, c.title as case_title, c.status as case_status FROM feedbacks f LEFT JOIN case_submissions c ON c.id = f.case_id WHERE f.case_id = ? AND f.user_id = ? ORDER BY f.created_at DESC LIMIT 1"
          ).bind(caseId, feedbackUserId).first();
          return json(row ? [row] : [], 200, origin);
        }
        const rows = await env.DB.prepare(
          "SELECT f.*, u.full_name as user_name, c.title as case_title, c.status as case_status FROM feedbacks f LEFT JOIN users u ON f.user_id = u.user_id LEFT JOIN case_submissions c ON c.id = f.case_id WHERE lower(COALESCE(c.status, '')) = 'completed' ORDER BY f.created_at DESC LIMIT ?"
        ).bind(limit).all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const caseRow = await env.DB.prepare(
          "SELECT id, user_id, status FROM case_submissions WHERE id = ?"
        ).bind(body?.case_id).first();
        if (!caseRow || caseRow.user_id !== body?.user_id || String(caseRow.status).toLowerCase() !== "completed") {
          return json({ error: "Feedback is available only for your completed case" }, 400, origin);
        }
        const fbId = body?.id || id();
        await env.DB.prepare(
          `INSERT INTO feedbacks (id, case_id, user_id, rating, comment, video_url, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(fbId, body.case_id, body.user_id, body.rating || null, body.comment || null, body.video_url || null, now()).run();
        const created = await env.DB.prepare("SELECT * FROM feedbacks WHERE id = ?").bind(fbId).first();
        return json(created || { id: fbId, ...body, created_at: now() }, 201, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    if (parts[1] === "feedback-likes") {
      if (request.method === "GET") {
        const rows = await env.DB.prepare("SELECT * FROM feedback_likes").all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const likeId = body?.id || id();
        await env.DB.prepare(
          "INSERT INTO feedback_likes (id, feedback_id, user_id, created_at) VALUES (?, ?, ?, ?)"
        ).bind(likeId, body.feedback_id, body.user_id, now()).run();
        return json({ id: likeId, ...body, created_at: now() }, 201, origin);
      }
      if (request.method === "DELETE" && parts[2]) {
        await env.DB.prepare("DELETE FROM feedback_likes WHERE id = ?").bind(parts[2]).run();
        return json({ deleted: true, id: parts[2] }, 200, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    if (parts[1] === "feedback-comments") {
      if (request.method === "GET") {
        const rows = await env.DB.prepare("SELECT fc.*, u.full_name as user_name FROM feedback_comments fc LEFT JOIN users u ON fc.user_id = u.user_id").all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const commentId = body?.id || id();
        await env.DB.prepare(
          "INSERT INTO feedback_comments (id, feedback_id, user_id, comment, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(commentId, body.feedback_id, body.user_id, body.comment, now()).run();
        return json({ id: commentId, ...body, created_at: now() }, 201, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    if (parts[1] === "support") {
      if (parts[2] === "messages") {
        if (request.method === "GET") {
          const target = url.searchParams.get("user_id") || user.user_id;
          if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
          const rows = await env.DB.prepare(
            "SELECT * FROM support_messages WHERE user_id = ? ORDER BY created_at ASC"
          ).bind(target).all();
          return json(rows.results || [], 200, origin);
        }
        if (request.method === "POST") {
          const body = await readJson(request);
          const target = body?.user_id || user.user_id;
          if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
          if (!String(body?.message || "").trim() && !body?.attachment_url) {
            return json({ error: "A message or attachment is required" }, 400, origin);
          }
          const msgId = body?.id || id();
          await env.DB.prepare(
            `INSERT INTO support_messages (id, user_id, sender, message, attachment_url, language, is_read, created_at)
             VALUES (?, ?, 'user', ?, ?, ?, 0, ?)`
          ).bind(msgId, target, body.message ? String(body.message).trim() : null, body.attachment_url || null, body.language || "en", now()).run();
          const created = await env.DB.prepare("SELECT * FROM support_messages WHERE id = ?").bind(msgId).first();
          return json(created || { id: msgId, user_id: target, sender: "user", message: body.message || null, attachment_url: body.attachment_url || null, is_read: 0 }, 201, origin);
        }
      }
      if (parts[2] === "mark-read" && request.method === "PUT") {
        const body = await readJson(request);
        const target = body?.user_id || user.user_id;
        if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
        const result = await env.DB.prepare(
          "UPDATE support_messages SET is_read = 1 WHERE user_id = ? AND sender = 'admin' AND (is_read = 0 OR is_read IS NULL)"
        ).bind(target).run();
        return json({ updated: Number(result?.meta?.changes || 0) }, 200, origin);
      }
      if (parts[2] === "unread-count" && request.method === "GET") {
        const target = url.searchParams.get("user_id") || user.user_id;
        if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
        const row = await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM support_messages WHERE user_id = ? AND sender = 'admin' AND (is_read = 0 OR is_read IS NULL)"
        ).bind(target).first();
        return json({ count: Number(row?.count || 0) }, 200, origin);
      }
      return json({ error: "Not found" }, 404, origin);
    }

    if (parts[1] === "user-settings") {
      if (request.method === "GET") {
        const target = parts[2] || user.user_id;
        if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
        const settings = await env.DB.prepare("SELECT * FROM user_settings WHERE user_id = ?").bind(target).first();
        return json(settings || { user_id: target }, 200, origin);
      }
      if (request.method === "PUT") {
        const target = parts[2] || user.user_id;
        if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
        const body = await readJson(request);
        const fields = [
          "language", "theme", "currency", "timezone", "email_notifications",
          "inapp_notifications", "weekly_digest", "high_contrast", "larger_text",
          "reduced_animations",
        ];
        const existing = await env.DB.prepare("SELECT * FROM user_settings WHERE user_id = ?").bind(target).first();
        const values = { ...existing, ...pick(body, fields) };
        const bool = (value, fallback) => value === undefined || value === null ? fallback : (value ? 1 : 0);
        const updatedAt = now();
        await env.DB.prepare(
          `INSERT INTO user_settings (user_id, language, theme, currency, timezone, email_notifications, inapp_notifications, weekly_digest, high_contrast, larger_text, reduced_animations, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, theme = excluded.theme, currency = excluded.currency, timezone = excluded.timezone, email_notifications = excluded.email_notifications, inapp_notifications = excluded.inapp_notifications, weekly_digest = excluded.weekly_digest, high_contrast = excluded.high_contrast, larger_text = excluded.larger_text, reduced_animations = excluded.reduced_animations, updated_at = excluded.updated_at`
        ).bind(
          target,
          values.language || "en",
          values.theme || "light",
          values.currency || "USD",
          values.timezone || "UTC",
          bool(values.email_notifications, 1),
          bool(values.inapp_notifications, 1),
          bool(values.weekly_digest, 0),
          bool(values.high_contrast, 0),
          bool(values.larger_text, 0),
          bool(values.reduced_animations, 0),
          updatedAt,
        ).run();
        const saved = await env.DB.prepare("SELECT * FROM user_settings WHERE user_id = ?").bind(target).first();
        return json(saved || { user_id: target, ...values, updated_at: updatedAt }, 200, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    if (parts[1] === "upload" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      const path = formData.get("path");
      if (!file || !path) return json({ error: "File and path required" }, 400, origin);

      try {
        const key = String(path);
        const arrayBuffer = await file.arrayBuffer();
        await env.UPLOADS.put(key, arrayBuffer, {
          httpMetadata: {
            contentType: file.type || "application/octet-stream",
          },
        });
        const url = `${PUBLIC_ORIGIN}/uploads/${key}`;
        return json({ url, key }, 200, origin);
      } catch (err) {
        return json({ error: "Upload failed: " + err.message }, 500, origin);
      }
    }

    if (parts[1] === "admin") {
      if (!isAdmin(user)) return json({ error: "Admin access required" }, 403, origin);

      if (parts[2] === "support" && parts[3] === "mark-read" && request.method === "PUT") {
        const body = await readJson(request);
        if (!body?.user_id) return json({ error: "User ID is required" }, 400, origin);
        const result = await env.DB.prepare(
          "UPDATE support_messages SET is_read = 1 WHERE user_id = ? AND sender = 'user' AND (is_read = 0 OR is_read IS NULL)"
        ).bind(body.user_id).run();
        return json({ updated: Number(result?.meta?.changes || 0) }, 200, origin);
      }

      if (parts[2] === "support" && parts[3] === "reply" && request.method === "POST") {
        const body = await readJson(request);
        if (!body?.user_id || (!String(body.message || "").trim() && !body.attachment_url)) {
          return json({ error: "A reply message or attachment is required" }, 400, origin);
        }
        const msgId = body?.id || id();
        await env.DB.batch([
          env.DB.prepare(
            `INSERT INTO support_messages (id, user_id, sender, message, attachment_url, language, is_read, created_at)
             VALUES (?, ?, 'admin', ?, ?, ?, 1, ?)`
          ).bind(msgId, body.user_id, body.message ? String(body.message).trim() : null, body.attachment_url || null, body.language || "en", now()),
          env.DB.prepare(
            `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
             VALUES (?, ?, 'support_reply', 'New message from Givethra', ?, '/support', 0, ?)`
          ).bind(id(), body.user_id, body.message ? String(body.message).trim() : "A support attachment was sent.", now()),
        ]);
        const created = await env.DB.prepare("SELECT * FROM support_messages WHERE id = ?").bind(msgId).first();
        return json(created || { id: msgId, ...body, sender: "admin", is_read: 1 }, 201, origin);
      }

      if (parts[2] === "notifications" && parts[3] === "broadcast" && request.method === "POST") {
        const body = await readJson(request);
        const userIds = [...new Set((Array.isArray(body?.user_ids) ? body.user_ids : []).map((value) => String(value).trim()).filter(Boolean))].slice(0, 1000);
        const title = String(body?.title || "").trim();
        const message = String(body?.message || "").trim();
        if (!userIds.length || !title || !message) return json({ error: "Recipients, title, and message are required" }, 400, origin);
        const type = String(body?.type || "admin_broadcast").slice(0, 80);
        const link = String(body?.link || "/").slice(0, 500);
        let sent = 0;
        for (let start = 0; start < userIds.length; start += 50) {
          const batch = userIds.slice(start, start + 50).map((target) => env.DB.prepare(
            `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
             VALUES (?, ?, ?, ?, ?, ?, 0, ?)`
          ).bind(id(), target, type, title, message, link, now()));
          await env.DB.batch(batch);
          sent += batch.length;
        }
        return json({ sent, failed: userIds.length - sent }, 201, origin);
      }

      if (parts[2] === "wallets") {
        if (request.method === "GET") {
          const target = url.searchParams.get("user_id");
          const rows = target
            ? await env.DB.prepare("SELECT * FROM wallets WHERE user_id = ?").bind(target).all()
            : await env.DB.prepare("SELECT * FROM wallets ORDER BY updated_at DESC").all();
          return json(rows.results || [], 200, origin);
        }
        if (request.method === "POST") {
          const body = await readJson(request);
          const target = String(body?.user_id || "").trim();
          const balance = Number(body?.balance);
          if (!target || !Number.isFinite(balance) || balance < 0) return json({ error: "A valid user and wallet balance are required" }, 400, origin);
          const updatedAt = body?.updated_at || now();
          await env.DB.prepare(
            `INSERT INTO wallets (user_id, balance, updated_at) VALUES (?, ?, ?)
             ON CONFLICT(user_id) DO UPDATE SET balance = excluded.balance, updated_at = excluded.updated_at`
          ).bind(target, balance, updatedAt).run();
          const saved = await env.DB.prepare("SELECT * FROM wallets WHERE user_id = ?").bind(target).first();
          return json(saved || { user_id: target, balance, updated_at: updatedAt }, 200, origin);
        }
        return json({ error: "Method not allowed" }, 405, origin);
      }

      if (request.method === "GET") {
        const tableMap = {
          users: { table: "users", order: "updated_at" },
          kyc: { table: "kyc_submissions", order: "submitted_at" },
          cases: { table: "case_submissions", order: "submitted_at" },
          resolutions: { table: "case_resolutions", order: "created_at" },
          deposits: { table: "deposits", order: "submitted_at" },
          profiles: { table: "profiles", order: "updated_at" },
          wallets: { table: "wallets", order: "updated_at" },
          unlocks: { table: "case_unlocks", order: "unlocked_at" },
          "support-messages": { table: "support_messages", order: "created_at" },
          feedbacks: { table: "feedbacks", order: "created_at" },
          offers: { table: "category_offers", order: "updated_at" },
          suspensions: { table: "user_suspensions", order: "suspended_at" },
        };
        const entry = tableMap[parts[2]];
        if (entry) {
          const rows = await env.DB.prepare(`SELECT * FROM ${entry.table} ORDER BY ${entry.order} DESC`).all();
          return json(rows.results || [], 200, origin);
        }
      }

      if (parts[2] === "user-suspension" && parts[3] && request.method === "GET") {
        const row = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ? ORDER BY suspended_at DESC LIMIT 1").bind(parts[3]).first();
        return json(row || null, 200, origin);
      }

      if (parts[2] === "user-suspension" && request.method === "POST") {
        const body = await readJson(request);
        const target = String(body?.user_id || "").trim();
        if (!target) return json({ error: "User ID is required" }, 400, origin);
        const existing = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ? ORDER BY suspended_at DESC LIMIT 1").bind(target).first();
        const active = body?.is_active ? 1 : 0;
        const suspensionCount = body?.suspension_count ?? existing?.suspension_count ?? 0;
        const suspendedAt = body?.suspended_at ?? existing?.suspended_at ?? (active ? now() : null);
        const unlockedAt = body?.unlocked_at ?? existing?.unlocked_at ?? null;
        await env.DB.prepare(
          `INSERT INTO user_suspensions (user_id, suspension_count, is_active, suspended_at, unlocked_at, rejection_count_at_suspension)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET suspension_count = excluded.suspension_count, is_active = excluded.is_active, suspended_at = excluded.suspended_at, unlocked_at = excluded.unlocked_at, rejection_count_at_suspension = excluded.rejection_count_at_suspension`
        ).bind(target, suspensionCount, active, suspendedAt, unlockedAt, body?.rejection_count_at_suspension ?? existing?.rejection_count_at_suspension ?? 0).run();
        return json(await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(target).first(), 200, origin);
      }

      if (request.method === "PUT") {
        const recordId = parts[3];
        if (parts[2] === "deposits" && recordId) {
          const body = await readJson(request);
          const current = await env.DB.prepare("SELECT * FROM deposits WHERE id = ?").bind(recordId).first();
          if (!current) return json({ error: "Deposit not found" }, 404, origin);
          const requestedStatus = body?.status === undefined ? current.status : String(body.status);
          if (!["pending", "approved", "rejected"].includes(requestedStatus)) return json({ error: "Invalid deposit status" }, 400, origin);
          if (current.status === "approved" && requestedStatus === "rejected") return json({ error: "An approved deposit cannot be rejected" }, 409, origin);
          const allowed = ["method", "amount", "currency", "transaction_id", "proof_url", "status", "credits", "reviewed_at", "reviewed_by", "rejection_reason"];
          const values = pick(body, allowed);
          values.status = requestedStatus;
          if (requestedStatus === "approved") {
            values.reviewed_at = values.reviewed_at ?? now();
            values.reviewed_by = values.reviewed_by ?? user.email;
            values.rejection_reason = null;
          }
          const fields = allowed.filter((field) => values[field] !== undefined);
          const params = fields.map((field) => values[field]);
          await env.DB.prepare(`UPDATE deposits SET ${fields.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`).bind(...params, recordId).run();
          if (requestedStatus === "approved" && current.status !== "approved") {
            const credits = Number(values.credits ?? current.credits ?? current.amount ?? 0);
            if (!Number.isFinite(credits) || credits < 0) return json({ error: "Invalid deposit credits" }, 400, origin);
            await env.DB.prepare(
              `INSERT INTO wallets (user_id, balance, updated_at) VALUES (?, ?, ?)
               ON CONFLICT(user_id) DO UPDATE SET balance = COALESCE(wallets.balance, 0) + excluded.balance, updated_at = excluded.updated_at`
            ).bind(current.user_id, credits, now()).run();
          }
          return json(await env.DB.prepare("SELECT * FROM deposits WHERE id = ?").bind(recordId).first(), 200, origin);
        }
        if (parts[2] === "profiles" && recordId) {
          const body = await readJson(request);
          const allowed = ["full_name", "phone_number", "country", "city", "bio", "preferred_language", "avatar_url", "cover_url", "is_suspended", "suspended_reason", "suspended_at"];
          const values = pick(body, allowed);
          const fields = allowed.filter((field) => values[field] !== undefined);
          if (!fields.length) return json({ error: "No profile fields to update" }, 400, origin);
          const existing = await env.DB.prepare("SELECT * FROM profiles WHERE user_id = ?").bind(recordId).first();
          if (existing) {
            await env.DB.prepare(`UPDATE profiles SET ${fields.map((field) => `${field} = ?`).join(", ")} WHERE user_id = ?`).bind(...fields.map((field) => values[field]), recordId).run();
          } else {
            const profileFields = ["user_id", ...fields, "created_at", "updated_at"];
            await env.DB.prepare(`INSERT INTO profiles (${profileFields.join(", ")}) VALUES (${profileFields.map(() => "?").join(", ")})`).bind(recordId, ...fields.map((field) => values[field]), now(), now()).run();
          }
          if (values.full_name !== undefined || values.avatar_url !== undefined) {
            await env.DB.prepare("UPDATE users SET full_name = COALESCE(?, full_name), avatar_url = COALESCE(?, avatar_url), updated_at = ? WHERE user_id = ?").bind(values.full_name ?? null, values.avatar_url ?? null, now(), recordId).run();
          }
          return json(await env.DB.prepare("SELECT * FROM profiles WHERE user_id = ?").bind(recordId).first(), 200, origin);
        }
        if (parts[2] === "kyc" && recordId) {
          const body = await readJson(request);
          const current = await env.DB.prepare("SELECT * FROM kyc_submissions WHERE id = ?").bind(recordId).first();
          if (!current) return json({ error: "KYC submission not found" }, 404, origin);
          const allowed = ["status", "rejection_reason", "reviewed_at", "reviewed_by"];
          const values = pick(body, allowed);
          const fields = allowed.filter((field) => values[field] !== undefined);
          if (!fields.length) return json({ error: "No KYC fields to update" }, 400, origin);
          await env.DB.prepare(`UPDATE kyc_submissions SET ${fields.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`).bind(...fields.map((field) => values[field]), recordId).run();
          if (values.status !== undefined) await env.DB.prepare("UPDATE users SET kyc_status = ?, updated_at = ? WHERE user_id = ?").bind(values.status, now(), current.user_id).run();
          return json(await env.DB.prepare("SELECT * FROM kyc_submissions WHERE id = ?").bind(recordId).first(), 200, origin);
        }
        if (parts[2] === "cases" && recordId) {
          const body = await readJson(request);
          const current = await env.DB.prepare("SELECT * FROM case_submissions WHERE id = ?").bind(recordId).first();
          if (!current) return json({ error: "Case not found" }, 404, origin);
          const allowed = ["status", "amount_collected", "reviewed_at", "reviewed_by", "rejection_reason"];
          if (parts[4] === "close") allowed.push("closed_by_admin", "paid_receipt_url");
          const values = pick(body, allowed);
          const fields = allowed.filter((field) => values[field] !== undefined);
          if (!fields.length) return json({ error: "No case fields to update" }, 400, origin);
          await env.DB.prepare(`UPDATE case_submissions SET ${fields.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`).bind(...fields.map((field) => values[field]), recordId).run();
          const counts = await env.DB.prepare(
            `SELECT COUNT(*) AS total_cases,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_cases,
                    SUM(CASE WHEN status IN ('approved', 'completed') THEN 1 ELSE 0 END) AS active_or_completed_cases,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_cases
             FROM case_submissions WHERE user_id = ?`
          ).bind(current.user_id).first();
          await env.DB.prepare(
            "UPDATE users SET total_cases = ?, pending_cases = ?, active_or_completed_cases = ?, rejected_cases = ?, updated_at = ? WHERE user_id = ?"
          ).bind(Number(counts?.total_cases || 0), Number(counts?.pending_cases || 0), Number(counts?.active_or_completed_cases || 0), Number(counts?.rejected_cases || 0), now(), current.user_id).run();
          return json(await env.DB.prepare("SELECT * FROM case_submissions WHERE id = ?").bind(recordId).first(), 200, origin);
        }
        if (parts[2] === "feedbacks" && recordId) {
          const body = await readJson(request);
          const allowed = ["status", "reviewed_at", "reviewed_by", "rejection_reason"];
          const values = pick(body, allowed);
          const fields = allowed.filter((field) => values[field] !== undefined);
          if (!fields.length) return json({ error: "No feedback fields to update" }, 400, origin);
          await env.DB.prepare(`UPDATE feedbacks SET ${fields.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`).bind(...fields.map((field) => values[field]), recordId).run();
          return json(await env.DB.prepare("SELECT * FROM feedbacks WHERE id = ?").bind(recordId).first(), 200, origin);
        }
        if (parts[2] === "resolutions" && recordId) {
          const body = await readJson(request);
          const allowed = ["status", "admin_confirmed", "admin_confirmed_at", "completed_at"];
          const values = pick(body, allowed);
          const fields = allowed.filter((field) => values[field] !== undefined);
          if (!fields.length) return json({ error: "No resolution fields to update" }, 400, origin);
          await env.DB.prepare(`UPDATE case_resolutions SET ${fields.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`).bind(...fields.map((field) => values[field]), recordId).run();
          return json(await env.DB.prepare("SELECT * FROM case_resolutions WHERE id = ?").bind(recordId).first(), 200, origin);
        }
      }

      if (parts[2] === "offers" && request.method === "POST") {
        const body = await readJson(request);
        const category = String(body?.category || "").trim();
        if (!category) return json({ error: "Category is required" }, 400, origin);
        const allowed = ["is_active", "free_limit", "used_count", "label", "updated_at"];
        const values = pick(body, allowed);
        values.updated_at = values.updated_at ?? now();
        const fields = ["category", ...allowed].filter((field) => field === "category" || values[field] !== undefined);
        await env.DB.prepare(
          `INSERT INTO category_offers (${fields.join(", ")}) VALUES (${fields.map(() => "?").join(", ")})
           ON CONFLICT(category) DO UPDATE SET ${allowed.filter((field) => values[field] !== undefined).map((field) => `${field} = excluded.${field}`).join(", ")}`
        ).bind(...fields.map((field) => field === "category" ? category : values[field])).run();
        return json(await env.DB.prepare("SELECT * FROM category_offers WHERE category = ?").bind(category).first(), 200, origin);
      }

      if (parts[2] === "delete-files" && request.method === "POST") {
        const body = await readJson(request);
        const urls = Array.isArray(body?.urls) ? body.urls : [];
        let deleted = 0;
        for (const value of urls) {
          try {
            const parsed = new URL(String(value));
            const marker = "/uploads/";
            const index = parsed.pathname.indexOf(marker);
            if (index < 0) continue;
            const key = decodeURIComponent(parsed.pathname.slice(index + marker.length));
            if (key) { await env.UPLOADS.delete(key); deleted += 1; }
          } catch { /* Ignore malformed or external URLs. */ }
        }
        return json({ deleted }, 200, origin);
      }
    }

    // Case unlocks
    if (parts[1] === "case-unlocks") {
      if (request.method === "GET") {
        const caseId = url.searchParams.get("case_id");
        const heroId = url.searchParams.get("hero_id");
        const sql = caseId && heroId ? "SELECT * FROM case_unlocks WHERE case_id = ? AND hero_id = ?" : "SELECT * FROM case_unlocks";
        const bind = caseId && heroId ? [caseId, heroId] : [];
        const rows = await env.DB.prepare(sql).bind(...bind).all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const unlockId = body?.id || id();
        await env.DB.prepare(
          `INSERT INTO case_unlocks (id, case_id, hero_id, status, created_at)
           VALUES (?, ?, ?, ?, ?)`
        ).bind(unlockId, body.case_id, body.hero_id, body.status || "pending", now()).run();
        return json({ id: unlockId, ...body, created_at: now() }, 201, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // Case resolutions
    if (parts[1] === "case-resolutions") {
      if (request.method === "GET") {
        const caseId = url.searchParams.get("case_id");
        const heroId = url.searchParams.get("hero_id");
        const sql = "SELECT * FROM case_resolutions WHERE case_id = ?" + (heroId ? " AND hero_id = ?" : "");
        const bind = heroId ? [caseId, heroId] : [caseId];
        const rows = await env.DB.prepare(sql).bind(...bind).all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const resolutionId = body?.id || id();
        await env.DB.prepare(
          `INSERT INTO case_resolutions (id, case_id, hero_id, amount, currency, status, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(resolutionId, body.case_id, body.hero_id, body.amount, body.currency || "USD", body.status || "pending", body.notes || null, now()).run();
        return json({ id: resolutionId, ...body, created_at: now() }, 201, origin);
      }
      if (request.method === "PUT" && parts[2]) {
        const body = await readJson(request);
        const allowed = ["status", "amount", "notes"];
        const values = pick(body, allowed);
        const params = allowed.filter((field) => values[field] !== undefined).map((field) => values[field]);
        if (params.length) {
          await env.DB.prepare(`UPDATE case_resolutions SET ${allowed.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`).bind(...params, parts[2]).run();
          const updated = await env.DB.prepare("SELECT * FROM case_resolutions WHERE id = ?").bind(parts[2]).first();
          return json(updated, 200, origin);
        }
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // Offers
    if (parts[1] === "offers") {
      if (request.method === "GET") {
        const category = url.searchParams.get("category");
        const sql = category ? "SELECT * FROM category_offers WHERE category = ?" : "SELECT * FROM category_offers";
        const bind = category ? [category] : [];
        const rows = await env.DB.prepare(sql).bind(...bind).all();
        return json(rows.results || [], 200, origin);
      }
      if (parts[1] === "offers" && parts[2] === "usage" && request.method === "PUT") {
        const body = await readJson(request);
        await env.DB.prepare(
          "UPDATE category_offers SET used_count = ? WHERE category = ?"
        ).bind(body.used_count, body.category).run();
        const updated = await env.DB.prepare("SELECT * FROM category_offers WHERE category = ?").bind(body.category).first();
        return json(updated, 200, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // Offer claims
    if (parts[1] === "offer-claims") {
      if (request.method === "GET" && parts[2] === "count") {
        const userId = url.searchParams.get("user_id");
        if (!userId) return json({ error: "user_id required" }, 400, origin);
        const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM offer_claims WHERE user_id = ?").bind(userId).first();
        return json({ count: Number(row?.count || 0) }, 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const claimId = body?.id || id();
        await env.DB.prepare(
          `INSERT INTO offer_claims (id, user_id, category, claimed_at)
           VALUES (?, ?, ?, ?)`
        ).bind(claimId, body.user_id, body.category, now()).run();
        return json({ id: claimId, ...body, claimed_at: now() }, 201, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // User suspension
    if (parts[1] === "user-suspension" && parts[2]) {
      if (request.method === "GET") {
        const row = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(parts[2]).first();
        if (!row) return json({ error: "Not found" }, 404, origin);
        return json(row, 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const userId = parts[2];
        const existing = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(userId).first();

        if (body.is_active === false) {
          if (!existing?.is_active) return json(existing || { user_id: userId, is_active: false }, 200, origin);
          const wallet = await env.DB.prepare("SELECT balance FROM wallets WHERE user_id = ?").bind(userId).first();
          const balance = Number(wallet?.balance || 0);
          const unlockCost = 5;
          if (balance < unlockCost) {
            return json({ error: `Insufficient credits. ${unlockCost} credits are required to unlock this account.`, required: unlockCost, balance }, 402, origin);
          }
          await env.DB.batch([
            env.DB.prepare("UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE user_id = ? AND balance >= ?").bind(unlockCost, now(), userId, unlockCost),
            env.DB.prepare("UPDATE user_suspensions SET is_active = 0, unlocked_at = ?, credits_used_to_unlock = COALESCE(credits_used_to_unlock, 0) + ? WHERE user_id = ? AND is_active = 1").bind(now(), unlockCost, userId),
          ]);
        } else {
          await env.DB.prepare(
            "INSERT INTO user_suspensions (user_id, is_active, suspension_count, suspended_at, rejection_count_at_suspension, unlocked_at, credits_used_to_unlock) VALUES (?, 1, ?, ?, ?, NULL, 0) ON CONFLICT(user_id) DO UPDATE SET is_active = 1, suspension_count = excluded.suspension_count, suspended_at = excluded.suspended_at, rejection_count_at_suspension = excluded.rejection_count_at_suspension"
          ).bind(userId, body.suspension_count || 1, body.suspended_at || now(), body.rejection_count_at_suspension || 0).run();
        }
        const updated = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(userId).first();
        return json(updated, 201, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    return json({ error: "API route not found" }, 404, origin);
  }

  return new Response("Not found", { status: 404 });
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (err) {
      console.error(err);
      return json({ error: "Authentication or database request failed", code: "INTERNAL_ERROR" }, 500, "https://givethra.org");
    }
  },
};
