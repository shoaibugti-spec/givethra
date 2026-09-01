// src/frontend/worker.js
// Givethra - Complete Cloudflare Worker with all APIs including Onboarding Status

const PUBLIC_ORIGIN = "https://givethra.org";
const ADMIN_EMAILS = new Set(["shoaibahmedbugti5@gmail.com"]);

function googleClientId(env) {
  return String(env?.GOOGLE_CLIENT_ID || env?.VITE_GOOGLE_CLIENT_ID || "").trim();
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
  const issuer = String(payload.iss || "").trim();
  const verified = payload.email_verified === true || payload.email_verified === "true";
  const trustedIssuer = issuer === "accounts.google.com" || issuer === "https://accounts.google.com";
  if (!clientId || !payload.sub || !payload.email || audience !== clientId || !trustedIssuer || !verified) return null;

  return {
    google_id: String(payload.sub),
    email: String(payload.email).toLowerCase(),
    full_name: payload.name || "User",
    avatar_url: payload.picture || "",
  };
}

async function findOrCreateUser(env, identity) {
  if (!env.DB) return { ...identity, user_id: id() };
  const selectExisting = () => env.DB.prepare(
    `SELECT user_id, email, full_name, avatar_url, kyc_status, total_cases,
            pending_cases, active_or_completed_cases, rejected_cases, balance, last_community_visit,
            onboarding_completed
     FROM users WHERE lower(trim(email)) = lower(trim(?)) LIMIT 1`
  ).bind(identity.email).first();
  const existing = await selectExisting();

  if (existing) {
    return {
      user_id: String(existing.user_id),
      email: String(existing.email || identity.email).toLowerCase(),
      full_name: existing.full_name || identity.full_name,
      avatar_url: existing.avatar_url || identity.avatar_url,
      kyc_status: existing.kyc_status || "none",
      role: isAdmin(existing) || isAdmin(identity) ? "admin" : null,
      last_community_visit: existing.last_community_visit || null,
      onboarding_completed: existing.onboarding_completed === 1,
    };
  }

  const timestamp = now();
  const userId = id();
  try {
    await env.DB.prepare(
      `INSERT INTO users (user_id, email, full_name, avatar_url, last_community_visit, signed_up_at, updated_at, onboarding_completed)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
    ).bind(userId, identity.email, identity.full_name, identity.avatar_url, timestamp, timestamp, timestamp).run();
    await env.DB.prepare(
      `INSERT INTO profiles (user_id, full_name, avatar_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(userId, identity.full_name, identity.avatar_url, timestamp, timestamp).run();
  } catch (error) {
    const raced = await selectExisting();
    if (!raced) throw error;
    return {
      user_id: String(raced.user_id),
      email: String(raced.email || identity.email).toLowerCase(),
      full_name: raced.full_name || identity.full_name,
      avatar_url: raced.avatar_url || identity.avatar_url,
      kyc_status: raced.kyc_status || "none",
      role: isAdmin(raced) || isAdmin(identity) ? "admin" : null,
      last_community_visit: raced.last_community_visit || null,
      onboarding_completed: raced.onboarding_completed === 1,
    };
  }
  return {
    user_id: userId,
    email: identity.email,
    full_name: identity.full_name,
    avatar_url: identity.avatar_url,
    kyc_status: "none",
    role: isAdmin(identity) ? "admin" : null,
    last_community_visit: timestamp,
    onboarding_completed: false,
  };
}

async function hydrateAuthenticatedUser(env, session) {
  if (!env.DB || !session?.user_id) return session;
  try {
    const row = await env.DB.prepare(
      `SELECT u.user_id, u.email, u.full_name, u.avatar_url, u.kyc_status,
              u.total_cases, u.pending_cases, u.active_or_completed_cases, u.rejected_cases,
              u.balance, u.last_community_visit, u.onboarding_completed,
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
      onboarding_completed: row.onboarding_completed === 1,
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
            pending_cases, active_or_completed_cases, rejected_cases, balance, last_community_visit,
            onboarding_completed
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
    onboarding_completed: existing?.onboarding_completed === 1,
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

async function maybeAutoSuspendForMissingFeedback(env, userId) {
  try {
    const nowIso = new Date().toISOString();
    const overdue = await env.DB.prepare(
      `SELECT c.id FROM case_submissions c
       WHERE c.user_id = ? AND lower(COALESCE(c.status,'')) = 'completed'
         AND c.feedback_deadline IS NOT NULL AND c.feedback_deadline < ?
         AND NOT EXISTS (
           SELECT 1 FROM feedbacks f
           WHERE f.case_id = c.id AND f.user_id = c.user_id
             AND lower(COALESCE(f.status,'')) IN ('approved','pending_review')
         )
       LIMIT 1`
    ).bind(userId, nowIso).all();
    if (!overdue?.results?.length) return;
    await env.DB.prepare(
      `INSERT INTO user_suspensions (user_id, suspension_count, is_active, suspended_at, rejection_count_at_suspension, credits_used_to_unlock)
       VALUES (?, 1, 1, ?, 0, 0)
       ON CONFLICT(user_id) DO UPDATE SET
         is_active = 1,
         suspension_count = user_suspensions.suspension_count + 1,
         suspended_at = excluded.suspended_at`
    ).bind(userId, nowIso).run();
    await env.DB.prepare(
      `UPDATE profiles SET is_suspended = 1, suspended_reason = ?, suspended_at = ? WHERE user_id = ?`
    ).bind("Missing 24-hour gratitude feedback after case completion.", nowIso, userId).run();
  } catch (err) {
    // Migration column may be missing -> skip gracefully.
  }
}

async function getActiveSuspension(env, userId) {
  if (!env.DB || !userId) return null;
  await maybeAutoSuspendForMissingFeedback(env, userId);
  const row = await env.DB.prepare(
    `SELECT u.user_id, s.is_active, s.suspension_count, s.suspended_at,
            s.rejection_count_at_suspension, s.credits_used_to_unlock,
            p.is_suspended AS profile_is_suspended, p.suspended_reason
     FROM users u
     LEFT JOIN user_suspensions s ON s.user_id = u.user_id
     LEFT JOIN profiles p ON p.user_id = u.user_id
     WHERE u.user_id = ? LIMIT 1`
  ).bind(userId).first();
  const active = [1, "1", true, "true"].includes(row?.is_active) || [1, "1", true, "true"].includes(row?.profile_is_suspended);
  return active ? row : null;
}

function suspendedActionResponse(origin, suspension) {
  return json({
    error: "Your account is suspended. You cannot submit a case or provide help until the account is reactivated.",
    code: "ACCOUNT_SUSPENDED",
    required_credits: 5,
    suspension,
  }, 403, origin);
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
//  CREDIT TRANSACTIONS HELPERS
// ============================================================
async function getWalletBalance(env, userId) {
  const row = await env.DB.prepare(
    "SELECT balance FROM wallets WHERE user_id = ?"
  ).bind(userId).first();
  return Number(row?.balance || 0);
}

async function addTransaction(env, userId, amount, type, description, referenceId = null) {
  const txId = id();
  const timestamp = now();
  await env.DB.prepare(
    `INSERT INTO credit_transactions (id, user_id, amount, type, description, reference_id, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?)`
  ).bind(txId, userId, amount, type, description, referenceId, timestamp, timestamp).run();
  return txId;
}

async function deductCredits(env, userId, amount, type, description, referenceId = null) {
  const balance = await getWalletBalance(env, userId);
  if (balance < amount) {
    throw new Error(`Insufficient credits. Required: ${amount}, Available: ${balance}`);
  }
  await env.DB.prepare(
    "UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE user_id = ? AND balance >= ?"
  ).bind(amount, now(), userId, amount).run();
  await addTransaction(env, userId, -amount, type, description, referenceId);
}

async function addCredits(env, userId, amount, type, description, referenceId = null) {
  await env.DB.prepare(
    "UPDATE wallets SET balance = balance + ?, updated_at = ? WHERE user_id = ?"
  ).bind(amount, now(), userId).run();
  await addTransaction(env, userId, amount, type, description, referenceId);
}

// ============================================================
//  PROFILE HANDLER
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
      const publicVisitor = !user;
      const visibility = isAdmin(user) || publicVisitor ? " AND lower(status) IN ('approved', 'published', 'active', 'completed')" : " AND (user_id = ? OR lower(status) IN ('approved', 'published', 'active', 'completed'))";
      const params = isAdmin(user) || publicVisitor ? ids : [...ids, user.user_id];
      const rows = await env.DB.prepare(`SELECT * FROM case_submissions WHERE id IN (${placeholders})${visibility}`).bind(...params).all();
      const found = new Map((rows.results || []).map((row) => [row.id, decodeCaseRow(row)]));
      return json(ids.map((value) => found.get(value)).filter(Boolean), 200, origin);
    }
    if (parts[2] && parts[2] !== "counts" && parts[2] !== "category-counts") {
      const publicRow = await env.DB.prepare("SELECT * FROM case_submissions WHERE id = ?").bind(parts[2]).first();
      const publicStatus = String(publicRow?.status || "").toLowerCase();
      if (publicRow && ["approved", "published", "active"].includes(publicStatus)) {
        return json(decodeCaseRow(publicRow), 200, origin);
      }
    }
    const target = requestedUserId(url);
    if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
    if (parts[2] && parts[2] !== "approved" && parts[2] !== "counts" && parts[2] !== "category-counts") {
      const row = await env.DB.prepare("SELECT * FROM case_submissions WHERE id = ?").bind(parts[2]).first();
      if (!row) return json({ error: "Not found" }, 404, origin);

      const status = String(row.status || "").toLowerCase();
      let allowed = isAdmin(user) || row.user_id === user.user_id || ["approved", "published", "active"].includes(status);

      if (!allowed && status === "completed" && user?.user_id) {
        const access = await env.DB.prepare(
          `SELECT 1 AS allowed FROM case_unlocks WHERE case_id = ? AND hero_id = ?
           UNION ALL
           SELECT 1 AS allowed FROM case_resolutions WHERE case_id = ? AND hero_id = ?
           LIMIT 1`
        ).bind(parts[2], user.user_id, parts[2], user.user_id).first();
        allowed = Boolean(access);
      }

      if (!allowed) return json({ error: "Not found" }, 404, origin);
      return json(decodeCaseRow(row), 200, origin);
    }
    if (parts[2] === "counts") {
      const countUserId = target || user?.user_id;
      if (!countUserId) {
        return json({ total: 0, pending: 0, active_or_completed: 0, rejected: 0 }, 200, origin);
      }
      const row = await env.DB.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status IN ('approved','published','active') THEN 1 ELSE 0 END) AS active_or_completed, SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected FROM case_submissions WHERE user_id = ?").bind(countUserId).first();
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
    if (!user) return json({ error: "Authentication required" }, 401, origin);
    if (!isAdmin(user)) {
      const suspension = await getActiveSuspension(env, user.user_id);
      if (suspension) return suspendedActionResponse(origin, suspension);
    }
    const body = await readJson(request);
    const record = pick(body, ["category", "title", "short_description", "country", "city", "urgency", "description", "amount_needed", "currency", "why_help", "deadline", "institute_name", "institute_contact", "institute_address", "payment_method", "account_title", "account_number", "account_iban", "photo_urls", "selfie_url", "video_url", "category_details", "was_free"]);
    const caseId = body?.id || id();
    const photoUrls = Array.isArray(record.photo_urls) || (record.photo_urls && typeof record.photo_urls === "object") ? JSON.stringify(record.photo_urls) : (record.photo_urls || null);
    const categoryDetails = Array.isArray(record.category_details) || (record.category_details && typeof record.category_details === "object") ? JSON.stringify(record.category_details) : (record.category_details || null);

    const isFree = body?.was_free === true;
    if (!isFree) {
      const balance = await getWalletBalance(env, user.user_id);
      if (balance < 1) {
        return json({ error: "Insufficient credits. You need 1 credit to submit a case." }, 402, origin);
      }
    }

    await env.DB.prepare(
      "INSERT INTO case_submissions (id, user_id, category, title, short_description, country, city, urgency, description, amount_needed, currency, why_help, deadline, institute_name, institute_contact, institute_address, payment_method, account_title, account_number, account_iban, photo_urls, selfie_url, video_url, category_details, was_free, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)"
    ).bind(caseId, user.user_id, record.category || null, record.title || null, record.short_description || null, record.country || null, record.city || null, record.urgency || null, record.description || null, record.amount_needed || null, record.currency || "USD", record.why_help || null, record.deadline || null, record.institute_name || null, record.institute_contact || null, record.institute_address || null, record.payment_method || null, record.account_title || null, record.account_number || null, record.account_iban || null, photoUrls, record.selfie_url || null, record.video_url || null, categoryDetails, record.was_free ? 1 : 0, now()).run();
    await env.DB.prepare("UPDATE users SET total_cases = COALESCE(total_cases, 0) + 1, pending_cases = COALESCE(pending_cases, 0) + 1, updated_at = ? WHERE user_id = ?").bind(now(), user.user_id).run();

    if (!isFree) {
      await deductCredits(env, user.user_id, 1, 'case_submission', `Case "${record.title || caseId}" submission fee`, caseId);
    }

    return json({ id: caseId, user_id: user.user_id, ...record, status: "pending" }, 201, origin);
  }
  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  HEROES WALL HANDLER
// ============================================================
async function handleHeroesWall(request, env, origin) {
  if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, origin);
  const url = new URL(request.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 24), 1), 100);
  const rows = await env.DB.prepare(
    `SELECT c.id, c.user_id, c.title, c.category, c.currency, c.amount_needed,
            c.amount_collected, c.submitted_at AS updated_at,
            COALESCE(
              NULLIF(c.amount_collected, 0),
              (SELECT SUM(COALESCE(r.amount_paid, 0)) FROM case_resolutions r
               WHERE r.case_id = c.id
                 AND lower(COALESCE(r.status, '')) IN ('approved', 'completed')
                 AND COALESCE(r.admin_confirmed, 0) IN (1, '1', 'true')),
              c.amount_needed, 0
            ) AS verified_amount,
            COALESCE(
              (SELECT MAX(COALESCE(r.completed_at, r.admin_confirmed_at, r.submitted_at))
               FROM case_resolutions r
               WHERE r.case_id = c.id
                 AND lower(COALESCE(r.status, '')) IN ('approved', 'completed')
                 AND COALESCE(r.admin_confirmed, 0) IN (1, '1', 'true')),
              c.submitted_at
            ) AS completed_at
     FROM case_submissions c
     WHERE lower(COALESCE(c.status, '')) = 'completed'
        OR EXISTS (
          SELECT 1 FROM case_resolutions r
          WHERE r.case_id = c.id
            AND lower(COALESCE(r.status, '')) IN ('approved', 'completed')
            AND COALESCE(r.admin_confirmed, 0) IN (1, '1', 'true')
        )
     ORDER BY COALESCE(completed_at, c.submitted_at) DESC
     LIMIT ?`
  ).bind(limit).all();
  const completedCases = (rows.results || []).map((row) => ({
    ...row,
    amount_collected: Number(row.verified_amount || row.amount_collected || row.amount_needed || 0),
  }));
  if (!completedCases.length) return json({ cases: [], metrics: { solved_cases: 0, total_amount: 0, currency: "PKR" } }, 200, origin);

  for (const caseRow of completedCases) {
    try {
      await env.DB.prepare(
        `INSERT OR IGNORE INTO community_posts (id, user_id, display_name, message, created_at)
         VALUES (?, ?, 'Givethra Heroes', ?, ?)`
      ).bind(`hero-${caseRow.id}`, caseRow.user_id || null, `Heroes helped complete: ${caseRow.title || "A Givethra case"}`, caseRow.completed_at || caseRow.updated_at || caseRow.submitted_at || now()).run();
    } catch (error) {
      console.error("Heroes Wall social post sync failed", error);
    }
  }
  const wallCases = [];
  for (const caseRow of completedCases) {
    const postId = `hero-${caseRow.id}`;
    let post = null;
    let likes = null;
    let comments = null;
    try {
      [post, likes, comments] = await Promise.all([
        env.DB.prepare("SELECT id, message, created_at FROM community_posts WHERE id = ?").bind(postId).first(),
        env.DB.prepare("SELECT COUNT(*) AS count FROM community_post_likes WHERE post_id = ?").bind(postId).first(),
        env.DB.prepare("SELECT COUNT(*) AS count FROM community_post_comments WHERE post_id = ?").bind(postId).first(),
      ]);
    } catch (error) {
      console.error("Heroes Wall social counters unavailable", error);
    }
    wallCases.push({
      ...caseRow,
      post_id: postId,
      post_message: post?.message || `Heroes helped complete: ${caseRow.title || "A Givethra case"}`,
      post_created_at: post?.created_at || caseRow.completed_at || caseRow.updated_at || caseRow.submitted_at,
      likes_count: Number(likes?.count || 0),
      comments_count: Number(comments?.count || 0),
    });
  }
  const totalAmount = completedCases.reduce((sum, caseRow) => sum + Math.max(Number(caseRow.verified_amount || caseRow.amount_collected || caseRow.amount_needed || 0), 0), 0);
  return json({ cases: wallCases, metrics: { solved_cases: completedCases.length, total_amount: totalAmount, currency: completedCases[0]?.currency || "PKR" } }, 200, origin);
}

// ============================================================
//  COMMUNITY POSTS HANDLER
// ============================================================
async function signSessionPayload(payload, secret) {
  if (!secret) return null;
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signingInput));
  return `givethra.${header}.${body}.${base64UrlEncode(signature)}`;
}

async function verifySessionToken(token, secret) {
  if (!secret || !token?.startsWith("givethra.")) return null;
  try {
    const [, header, body, encodedSignature] = token.split(".");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, base64UrlDecode(encodedSignature), new TextEncoder().encode(`${header}.${body}`));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(body)));
    if (!payload?.sub || !payload?.email || !Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function handlePublicFeedback(request, env, user, origin) {
  const body = await readJson(request);
  const message = String(body?.message || "").trim();
  if (!message) return json({ error: "Message is required" }, 400, origin);
  const userId = user?.user_id || "public";
  const firstName = user?.full_name?.trim() || "Public Visitor";
  const feedbackId = id();
  const createdAt = now();
  await env.DB.prepare(
    `INSERT INTO feedbacks (id, user_id, first_name, text_message, status, created_at)
     VALUES (?, ?, ?, ?, 'approved', ?)`
  ).bind(feedbackId, userId, firstName, message, createdAt).run();
  return json({ id: feedbackId, user_id: userId, first_name: firstName, text_message: message, status: "approved", created_at: createdAt }, 201, origin);
}

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
//  SYNC COMPLETED CASE
// ============================================================
async function synchronizeCompletedCase(env, resolutionId) {
  const resolution = await env.DB.prepare(
    "SELECT case_id, paid_to, status, admin_confirmed FROM case_resolutions WHERE id = ?"
  ).bind(resolutionId).first();
  if (!resolution?.case_id) return null;
  const approved = String(resolution.status || "").toLowerCase() === "completed" && [1, "1", true, "true"].includes(resolution.admin_confirmed);
  if (!approved) return null;
  const totals = await env.DB.prepare(
    `SELECT c.amount_needed, c.amount_collected,
            COALESCE((SELECT SUM(COALESCE(r.amount_paid, 0)) FROM case_resolutions r
                      WHERE r.case_id = c.id
                        AND lower(COALESCE(r.status, '')) IN ('approved', 'completed')
                        AND COALESCE(r.admin_confirmed, 0) IN (1, '1', 'true')), 0) AS verified_total
     FROM case_submissions c WHERE c.id = ?`
  ).bind(resolution.case_id).first();
  if (!totals) return null;
  const verifiedTotal = Math.max(Number(totals.verified_total || 0), Number(totals.amount_collected || 0));
  const directPayment = String(resolution.paid_to || "").toLowerCase() !== "givethra";
  const goalReached = Number(totals.amount_needed || 0) <= 0 || verifiedTotal >= Number(totals.amount_needed || 0);
  const nextStatus = directPayment && goalReached ? "completed" : undefined;
  if (nextStatus) {
    await env.DB.prepare(
      "UPDATE case_submissions SET amount_collected = ?, status = ?, feedback_deadline = ? WHERE id = ?"
    ).bind(verifiedTotal, nextStatus, new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), resolution.case_id).run();
  } else {
    await env.DB.prepare(
      "UPDATE case_submissions SET amount_collected = ? WHERE id = ?"
    ).bind(verifiedTotal, resolution.case_id).run();
  }
  return { case_id: resolution.case_id, amount_collected: verifiedTotal, status: nextStatus || "open" };
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
    try {
      const body = await readJson(request);
      const configuredClientId = googleClientId(env);
      if (!configuredClientId) return json({ error: "Google authentication is not configured", code: "AUTH_NOT_CONFIGURED" }, 500, origin);
      const identity = await verifyGoogleCredential(body?.credential || body?.id_token, configuredClientId);
      if (!identity) return json({ error: "Google credential could not be verified for this website", code: "GOOGLE_CREDENTIAL_INVALID" }, 401, origin);
      const account = await findOrCreateUser(env, identity);
      const token = await signSession(account, env.JWT_SECRET);
      if (!token) return json({ error: "Authentication is not configured", code: "AUTH_NOT_CONFIGURED" }, 500, origin);
      return json({ token, user: account }, 200, origin);
    } catch (error) {
      console.error("Google authentication reconciliation failed", error);
      return json({ error: "Authentication or database request failed", code: "AUTH_RECONCILIATION_FAILED" }, 500, origin);
    }
  }

  if (parts[0] === "verify" && request.method === "GET") {
    const user = await authenticate(request, env, googleClientId(env));
    if (!user) return json({ valid: false }, 401, origin);
    return json({ valid: true, user }, 200, origin);
  }

  // Public static assets
  if (url.pathname.startsWith("/uploads/")) {
    const key = url.pathname.slice(9);
    try {
      const object = await env.UPLOADS.get(key);
      if (!object) return new Response("File not found", { status: 404 });
      const headers = new Headers({
        "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000",
        "X-Content-Type-Options": "nosniff",
      });
      if (url.searchParams.get("download") === "1") {
        const fileName = decodeURIComponent(key.split("/").pop() || "download")
          .replace(/[\\r\\n\\\"]+/g, "_")
          .slice(0, 180) || "download";
        headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
      }
      return new Response(object.body, { headers });
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
  if (parts[0] === "api" && parts[1] === "heroes-wall") {
    return handleHeroesWall(request, env, origin);
  }

  if (parts[0] === "api" && parts[1] === "feedbacks" && request.method === "GET" && !url.searchParams.get("case_id") && !url.searchParams.get("user_id")) {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 500);
    const rows = await env.DB.prepare(
      "SELECT f.*, u.full_name as user_name, c.title as case_title, c.status as case_status FROM feedbacks f LEFT JOIN users u ON f.user_id = u.user_id LEFT JOIN case_submissions c ON c.id = f.case_id WHERE lower(COALESCE(c.status, '')) = 'completed' AND lower(COALESCE(f.status, '')) = 'approved' ORDER BY f.created_at DESC LIMIT ?"
    ).bind(limit).all();
    return json(rows.results || [], 200, origin);
  }
  if (parts[0] === "api" && parts[1] === "feedback-likes" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM feedback_likes").all();
    return json(rows.results || [], 200, origin);
  }
  if (parts[0] === "api" && parts[1] === "feedback-comments" && request.method === "GET") {
    const rows = await env.DB.prepare("SELECT fc.*, u.full_name as user_name FROM feedback_comments fc LEFT JOIN users u ON fc.user_id = u.user_id").all();
    return json(rows.results || [], 200, origin);
  }
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
    // ✅ PROFILES
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
          "SELECT f.*, u.full_name as user_name, c.title as case_title, c.status as case_status FROM feedbacks f LEFT JOIN users u ON f.user_id = u.user_id LEFT JOIN case_submissions c ON c.id = f.case_id WHERE lower(COALESCE(c.status, '')) = 'completed' AND lower(COALESCE(f.status, '')) = 'approved' ORDER BY f.created_at DESC LIMIT ?"
        ).bind(limit).all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const feedbackUserId = String(user?.user_id || body?.user_id || "").trim();
        if (!user || !feedbackUserId) return json({ error: "Authentication required" }, 401, origin);
        const caseRow = await env.DB.prepare(
          "SELECT id, user_id, status FROM case_submissions WHERE id = ?"
        ).bind(body?.case_id).first();
        const verifiedCompletion = caseRow
          ? await env.DB.prepare(
              `SELECT id FROM case_resolutions
               WHERE case_id = ?
                 AND lower(COALESCE(status, '')) IN ('approved', 'completed')
                 AND COALESCE(admin_confirmed, 0) IN (1, '1', 'true')
               LIMIT 1`
            ).bind(body?.case_id).first()
          : null;
        const caseIsCompleted = String(caseRow?.status || "").toLowerCase() === "completed" || Boolean(verifiedCompletion?.id);
        if (!caseRow || String(caseRow.user_id) !== feedbackUserId || !caseIsCompleted) {
          return json({ error: "Feedback is available only for your completed case" }, 400, origin);
        }
        if (!String(body?.text_message ?? body?.comment ?? "").trim()) {
          return json({ error: "Feedback caption is required" }, 400, origin);
        }
        let feedbackDeadline = null;
        try {
          const dn = await env.DB.prepare("SELECT feedback_deadline FROM case_submissions WHERE id = ?").bind(body?.case_id).first();
          feedbackDeadline = dn?.feedback_deadline || null;
        } catch { /* migration not applied yet */ }
        if (feedbackDeadline && String(feedbackDeadline) < new Date().toISOString()) {
          return json({ error: "The 24-hour feedback window has passed. Your account is suspended; reactivate with 5 credits.", code: "FEEDBACK_WINDOW_EXPIRED", required_credits: 5 }, 403, origin);
        }
        const fbId = body?.id || id();
        await env.DB.prepare(
          `INSERT INTO feedbacks (id, case_id, user_id, rating, text_message, video_url, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(fbId, body.case_id, feedbackUserId, body.rating || null, body.text_message ?? body.comment ?? null, body.video_url || null, "pending_review", now()).run();
        const created = await env.DB.prepare("SELECT * FROM feedbacks WHERE id = ?").bind(fbId).first();
        return json(created || { id: fbId, ...body, user_id: feedbackUserId, created_at: now() }, 201, origin);
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
          resolutions: { table: "case_resolutions", order: "submitted_at" },
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
            await addCredits(env, current.user_id, credits, 'deposit', `Deposit #${recordId} approved`, recordId);
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
          if (values.status !== undefined) {
            await env.DB.prepare("UPDATE users SET kyc_status = ?, updated_at = ? WHERE user_id = ?").bind(values.status, now(), current.user_id).run();
            // Send notification for KYC approval with onboarding link
            if (values.status === "approved") {
              await sendNotification(
                current.user_id,
                "kyc_approved",
                "✅ KYC Approved!",
                "Your identity has been verified. Please complete the onboarding guide to get started.",
                "/onboarding"
              );
            }
          }
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
          const requestedStatus = String(body?.status || "").toLowerCase();
          if (requestedStatus === "rejected" && !String(body?.rejection_reason || "").trim()) {
            return json({ error: "A rejection reason is required" }, 400, origin);
          }
          const allowed = ["status", "reviewed_at", "reviewed_by", "rejection_reason"];
          const values = pick(body, allowed);
          const fields = allowed.filter((field) => values[field] !== undefined);
          if (!fields.length) return json({ error: "No feedback fields to update" }, 400, origin);
          await env.DB.prepare(`UPDATE feedbacks SET ${fields.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`).bind(...fields.map((field) => values[field]), recordId).run();
          return json(await env.DB.prepare("SELECT * FROM feedbacks WHERE id = ?").bind(recordId).first(), 200, origin);
        }
        if (parts[2] === "resolutions" && recordId) {
          const body = await readJson(request);
          const allowed = ["status", "admin_confirmed", "admin_confirmed_at", "completed_at", "notes"];
          const values = pick(body, allowed);
          const fields = allowed.filter((field) => values[field] !== undefined);
          if (!fields.length) return json({ error: "No resolution fields to update" }, 400, origin);
          await env.DB.prepare(`UPDATE case_resolutions SET ${fields.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`).bind(...fields.map((field) => values[field]), recordId).run();
          const updated = await env.DB.prepare("SELECT * FROM case_resolutions WHERE id = ?").bind(recordId).first();
          if (updated && String(updated.status || "").toLowerCase() === "completed" && [1, "1", true, "true"].includes(updated.admin_confirmed)) {
            await synchronizeCompletedCase(env, recordId);
          }
          return json(updated, 200, origin);
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

    // ============================================================
    //  CREDIT TRANSACTIONS
    // ============================================================
    if (parts[1] === "transactions" && parts[2]) {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, origin);
      const target = parts[2];
      if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
      const rows = await env.DB.prepare(
        "SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC"
      ).bind(target).all();
      return json(rows.results || [], 200, origin);
    }

    // ============================================================
    //  ONBOARDING STATUS
    // ============================================================
    if (parts[1] === "onboarding-status" && parts[2]) {
      const target = parts[2];
      if (!canAccessUser(user, target)) {
        return json({ error: "Forbidden" }, 403, origin);
      }

      if (request.method === "GET") {
        const row = await env.DB.prepare(
          "SELECT onboarding_completed FROM users WHERE user_id = ?"
        ).bind(target).first();
        return json({ completed: row?.onboarding_completed === 1 }, 200, origin);
      }

      if (request.method === "PUT") {
        const body = await readJson(request);
        const completed = body?.completed === true ? 1 : 0;
        await env.DB.prepare(
          "UPDATE users SET onboarding_completed = ? WHERE user_id = ?"
        ).bind(completed, target).run();
        return json({ completed: completed === 1 }, 200, origin);
      }

      return json({ error: "Method not allowed" }, 405, origin);
    }

    // ============================================================
    //  CASE UNLOCKS
    // ============================================================
    if (parts[1] === "case-unlocks") {
      if (parts[2] === "count" && request.method === "GET") {
        const heroId = String(url.searchParams.get("hero_id") || "").trim();
        if (!heroId) return json({ count: 0 }, 200, origin);
        const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM case_unlocks WHERE hero_id = ? AND payment_type = 'partial'").bind(heroId).first();
        return json({ count: Number(row?.count || 0) }, 200, origin);
      }
      if (request.method === "GET") {
        const caseId = url.searchParams.get("case_id");
        const heroId = url.searchParams.get("hero_id");
        const requestedType = url.searchParams.get("payment_type");
        const paymentType = requestedType === "full" || requestedType === "partial" || requestedType === "media" ? requestedType : null;
        const filters = [];
        const bind = [];
        if (caseId) { filters.push("case_id = ?"); bind.push(caseId); }
        if (heroId) { filters.push("hero_id = ?"); bind.push(heroId); }
        if (paymentType) { filters.push("payment_type = ?"); bind.push(paymentType); }
        const sql = `SELECT * FROM case_unlocks${filters.length ? ` WHERE ${filters.join(" AND ")}` : ""} ORDER BY unlocked_at DESC`;
        const rows = await env.DB.prepare(sql).bind(...bind).all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const caseId = String(body?.case_id || "").trim();
        const heroId = String(body?.hero_id || "").trim();
        const paymentType = body?.payment_type === "full" ? "full" : body?.payment_type === "media" ? "media" : "partial";
        if (!user || !caseId || !heroId || user.user_id !== heroId) return json({ error: "Unauthorized unlock request" }, 403, origin);
        if (!isAdmin(user)) {
          const suspension = await getActiveSuspension(env, user.user_id);
          if (suspension) return suspendedActionResponse(origin, suspension);
        }
        const existing = await env.DB.prepare("SELECT * FROM case_unlocks WHERE case_id = ? AND hero_id = ? AND payment_type = ? ORDER BY unlocked_at DESC LIMIT 1").bind(caseId, heroId, paymentType).first();
        if (existing) return json(existing, 200, origin);
        const prior = await env.DB.prepare("SELECT COUNT(*) AS count FROM case_unlocks WHERE hero_id = ? AND payment_type = 'partial'").bind(heroId).first();
        const isFreeContribution = paymentType === "partial" && Number(prior?.count || 0) < 3;
        const creditsCharged = isFreeContribution ? 0 : 1;
        const wallet = await env.DB.prepare("SELECT balance FROM wallets WHERE user_id = ?").bind(heroId).first();
        const balance = Number(wallet?.balance || 0);
        if (creditsCharged > 0 && balance < creditsCharged) return json({ error: "Insufficient credits", required: creditsCharged, balance }, 402, origin);
        if (creditsCharged > 0) {
          const deducted = await env.DB.prepare("UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE user_id = ? AND balance >= ?").bind(creditsCharged, now(), heroId, creditsCharged).run();
          if (!Number(deducted?.meta?.changes || 0)) return json({ error: "Insufficient credits", required: creditsCharged, balance }, 402, origin);
        }
        const unlockId = body?.id || id();
        try {
          await env.DB.prepare(
            `INSERT INTO case_unlocks (id, case_id, hero_id, pledged_amount, credits_charged, payment_type, unlocked_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(unlockId, caseId, heroId, body.pledged_amount ?? null, creditsCharged, paymentType, now()).run();
        } catch (error) {
          if (creditsCharged > 0) await env.DB.prepare("UPDATE wallets SET balance = balance + ?, updated_at = ? WHERE user_id = ?").bind(creditsCharged, now(), heroId).run();
          throw error;
        }
        if (creditsCharged > 0) {
          const type = paymentType === 'full' ? 'direct_help' : 'contribution';
          const desc = paymentType === 'full' ? `Direct help for case ${caseId}` : `Contribution to case ${caseId}`;
          await addTransaction(env, heroId, -creditsCharged, type, desc, unlockId);
        }
        const saved = await env.DB.prepare("SELECT * FROM case_unlocks WHERE id = ?").bind(unlockId).first();
        return json(saved || { id: unlockId, case_id: caseId, hero_id: heroId, pledged_amount: body.pledged_amount ?? null, credits_charged: creditsCharged, payment_type: paymentType, unlocked_at: now() }, 201, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // ============================================================
    //  CASE RESOLUTIONS
    // ============================================================
    if (parts[1] === "case-resolutions") {
      if (request.method === "GET") {
        const caseId = String(url.searchParams.get("case_id") || "").trim();
        const heroId = String(url.searchParams.get("hero_id") || "").trim();
        const filters = [];
        const bind = [];
        if (caseId) {
          filters.push("r.case_id = ?");
          bind.push(caseId);
          if (!heroId && user) {
            filters.push("(r.hero_id = ? OR lower(u.email) = lower(?) OR c.user_id = ?)");
            bind.push(user.user_id, String(user.email || ""), user.user_id);
          }
        }
        if (heroId) {
          if (user?.user_id === heroId) {
            filters.push("r.hero_id = ?");
            bind.push(heroId);
          } else if (String(user?.email || "").trim()) {
            filters.push("lower(u.email) = lower(?)");
            bind.push(String(user.email).trim());
          } else {
            return json({ error: "Forbidden" }, 403, origin);
          }
        }
        if (!filters.length) return json({ error: "case_id or hero_id is required" }, 400, origin);
        const sql = "SELECT r.*, c.title AS case_title, c.category AS case_category, c.city AS case_city, c.country AS case_country, c.institute_name AS case_institute_name, c.payment_method AS case_payment_method, c.account_number AS case_account_number, c.account_iban AS case_account_iban, c.reference_number AS case_reference_number, COALESCE(p.full_name, u.full_name) AS hero_name, (SELECT k.cnic_number FROM kyc_submissions k WHERE k.user_id = r.hero_id AND lower(COALESCE(k.status, '')) = 'approved' ORDER BY k.reviewed_at DESC LIMIT 1) AS hero_cnic_number, COALESCE(sp.full_name, su.full_name) AS seeker_name, (SELECT k.cnic_number FROM kyc_submissions k WHERE k.user_id = r.seeker_id AND lower(COALESCE(k.status, '')) = 'approved' ORDER BY k.reviewed_at DESC LIMIT 1) AS seeker_cnic_number FROM case_resolutions r LEFT JOIN case_submissions c ON c.id = r.case_id LEFT JOIN profiles p ON p.user_id = r.hero_id LEFT JOIN users u ON u.user_id = r.hero_id LEFT JOIN profiles sp ON sp.user_id = r.seeker_id LEFT JOIN users su ON su.user_id = r.seeker_id WHERE " + filters.join(" AND ") + " ORDER BY r.submitted_at DESC";
        const rows = await env.DB.prepare(sql).bind(...bind).all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const resolutionId = body?.id || id();
        const caseId = String(body?.case_id || "").trim();
        const heroId = String(body?.hero_id || "").trim();
        if (!user || !caseId || !heroId || user.user_id !== heroId) return json({ error: "Unauthorized help submission" }, 403, origin);
        if (!isAdmin(user)) {
          const suspension = await getActiveSuspension(env, user.user_id);
          if (suspension) return suspendedActionResponse(origin, suspension);
        }
        await env.DB.prepare(
          `INSERT INTO case_resolutions
            (id, case_id, hero_id, hero_email, seeker_id, resolution_type, amount_paid, transaction_id, receipt_url, notes, status, paid_to, submitted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          resolutionId,
          caseId,
          heroId,
          body.hero_email || null,
          body.seeker_id || null,
          body.resolution_type || null,
          body.amount_paid ?? body.amount ?? null,
          body.transaction_id || null,
          body.receipt_url || null,
          body.notes || null,
          body.status || "pending_confirmation",
          body.paid_to === "givethra" ? "givethra" : "institute",
          now()
        ).run();
        const saved = await env.DB.prepare("SELECT * FROM case_resolutions WHERE id = ?").bind(resolutionId).first();
        return json(saved || { id: resolutionId, ...body, status: body.status || "pending_confirmation", submitted_at: now() }, 201, origin);
      }
      if (request.method === "PUT" && parts[2]) {
        const body = await readJson(request);
        const allowed = ["status", "amount_paid", "seeker_confirmed_amount", "transaction_id", "receipt_url", "paid_to", "notes", "hero_confirmed", "seeker_confirmed", "completed_at", "admin_confirmed", "admin_confirmed_at"];
        const values = pick(body, allowed);
        const fields = allowed.filter((field) => values[field] !== undefined);
        if (fields.length) {
          const params = fields.map((field) => values[field]);
          await env.DB.prepare(`UPDATE case_resolutions SET ${fields.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`).bind(...params, parts[2]).run();
          const updated = await env.DB.prepare("SELECT * FROM case_resolutions WHERE id = ?").bind(parts[2]).first();
          if (updated && String(updated.status || "").toLowerCase() === "completed" && [1, "1", true, "true"].includes(updated.admin_confirmed)) {
            await synchronizeCompletedCase(env, parts[2]);
          }
          return json(updated, 200, origin);
        }
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // ============================================================
    //  OFFERS
    // ============================================================
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

    // ============================================================
    //  OFFER CLAIMS
    // ============================================================
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

    // ============================================================
    //  USER SUSPENSION
    // ============================================================
    if (parts[1] === "user-suspension" && parts[2]) {
      if (request.method === "GET") {
        const row = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(parts[2]).first();
        if (!row) return json({ error: "Not found" }, 404, origin);
        return json(row, 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const userId = parts[2];
        if (!user || (!isAdmin(user) && user.user_id !== userId)) return json({ error: "Forbidden" }, 403, origin);
        const existing = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(userId).first();

        if (body.is_active === false) {
          if (!existing?.is_active) {
            await env.DB.prepare("UPDATE profiles SET is_suspended = 0, suspended_reason = NULL, suspended_at = NULL WHERE user_id = ?").bind(userId).run();
            return json(existing || { user_id: userId, is_active: false }, 200, origin);
          }
          const unlockCost = 5;
          const wallet = await env.DB.prepare("SELECT balance FROM wallets WHERE user_id = ?").bind(userId).first();
          const balance = Number(wallet?.balance || 0);
          if (balance < unlockCost) {
            return json({ error: `Insufficient credits. ${unlockCost} credits are required to unlock this account.`, required: unlockCost, balance }, 402, origin);
          }
          const charged = await env.DB.prepare(
            "UPDATE wallets SET balance = balance - ?, updated_at = ? WHERE user_id = ? AND balance >= ?"
          ).bind(unlockCost, now(), userId, unlockCost).run();
          if (!Number(charged?.meta?.changes || 0)) {
            return json({ error: `Insufficient credits. ${unlockCost} credits are required to unlock this account.`, required: unlockCost, balance }, 402, origin);
          }
          await addTransaction(env, userId, -unlockCost, 'suspension_unlock', 'Account suspension unlock (5 credits)', userId);
          try {
            const unlocked = await env.DB.prepare(
              "UPDATE user_suspensions SET is_active = 0, unlocked_at = ?, credits_used_to_unlock = COALESCE(credits_used_to_unlock, 0) + ? WHERE user_id = ? AND is_active = 1"
            ).bind(now(), unlockCost, userId).run();
            if (!Number(unlocked?.meta?.changes || 0)) throw new Error("Suspension could not be updated");
            await env.DB.prepare("UPDATE profiles SET is_suspended = 0, suspended_reason = NULL, suspended_at = NULL WHERE user_id = ?").bind(userId).run();
          } catch (error) {
            await env.DB.prepare("UPDATE wallets SET balance = balance + ?, updated_at = ? WHERE user_id = ?").bind(unlockCost, now(), userId).run();
            throw error;
          }
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

export { signSessionPayload, verifySessionToken, handlePublicFeedback };

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
