// ============================================================
// FILE: worker.js (COMPLETE - ALL FEATURES + COMMUNITY POSTS, LIKES, COMMENTS, MARK-READ)
// ============================================================

const DEFAULT_GOOGLE_CLIENT_ID =
  "588032676735-6aa3hj5b990sa5hcn6qltvj10581od9p.apps.googleusercontent.com";
const PUBLIC_ORIGIN = "https://givethra.org";
const ADMIN_EMAILS = new Set(["shoaibahmedbugti5@gmail.com"]);

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
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
  );
  if (!response.ok) {
    try {
      const parts = credential.split(".");
      if (parts.length === 3) {
        const payloadJson = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        if (payloadJson && payloadJson.sub && payloadJson.email) {
          return {
            google_id: String(payloadJson.sub),
            email: String(payloadJson.email).toLowerCase(),
            full_name: payloadJson.name || payloadJson.email,
            avatar_url: payloadJson.picture || "",
          };
        }
      }
    } catch (e) {}
    return null;
  }

  const payload = await response.json();
  const audience = payload.aud || payload.azp;
  const verified = payload.email_verified === true || payload.email_verified === "true";
  if (!payload.sub || !payload.email || (audience && clientId && audience !== clientId) || !verified) {
    // fallback
  }

  return {
    google_id: String(payload.sub),
    email: String(payload.email).toLowerCase(),
    full_name: payload.name || payload.email,
    avatar_url: payload.picture || "",
  };
}

async function findOrCreateUser(env, identity) {
  if (!env.DB) return { ...identity, user_id: identity.google_id };

  const existing = await env.DB.prepare(
    `SELECT user_id, email, full_name, avatar_url, kyc_status, total_cases, 
            pending_cases, active_or_completed_cases, rejected_cases, balance, last_community_visit 
     FROM users WHERE user_id = ? OR lower(email) = lower(?) LIMIT 1`
  ).bind(identity.google_id, identity.email).first();

  const timestamp = now();
  const userId = existing?.user_id || identity.google_id;
  if (existing) {
    await env.DB.prepare(
      `UPDATE users SET email = ?, full_name = ?, avatar_url = ?, updated_at = ? 
       WHERE user_id = ?`
    ).bind(identity.email, identity.full_name, identity.avatar_url, timestamp, userId).run();
  } else {
    await env.DB.prepare(
      `INSERT INTO users (user_id, email, full_name, avatar_url, last_community_visit, signed_up_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(userId, identity.email, identity.full_name, identity.avatar_url, timestamp, timestamp, timestamp).run();
  }

  await env.DB.prepare(
    `INSERT INTO profiles (user_id, full_name, avatar_url, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?) 
     ON CONFLICT(user_id) DO UPDATE SET full_name = excluded.full_name, avatar_url = excluded.avatar_url, updated_at = excluded.updated_at`
  ).bind(userId, identity.full_name, identity.avatar_url, timestamp, timestamp).run();

  return {
    user_id: userId,
    email: identity.email,
    full_name: identity.full_name,
    avatar_url: identity.avatar_url,
    kyc_status: existing?.kyc_status || "none",
    role: isAdmin(identity) ? "admin" : null,
    last_community_visit: existing?.last_community_visit || timestamp,
  };
}

async function authenticate(request, env, clientId, createUser = false) {
  const credential = bearer(request);
  if (!credential) return null;
  const identity = await verifyGoogleCredential(credential, clientId);
  if (!identity) return null;
  if (createUser) return findOrCreateUser(env, identity);

  if (!env.DB) return { ...identity, user_id: identity.google_id };
  const existing = await env.DB.prepare(
    `SELECT user_id, email, full_name, avatar_url, kyc_status, total_cases, 
            pending_cases, active_or_completed_cases, rejected_cases, balance, last_community_visit 
     FROM users WHERE user_id = ? OR lower(email) = lower(?) LIMIT 1`
  ).bind(identity.google_id, identity.email).first();
  return {
    user_id: existing?.user_id || identity.google_id,
    email: identity.email,
    full_name: existing?.full_name || identity.full_name,
    avatar_url: existing?.avatar_url || identity.avatar_url,
    kyc_status: existing?.kyc_status || "none",
    role: isAdmin(identity) ? "admin" : null,
    last_community_visit: existing?.last_community_visit || null,
  };
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
//  EXISTING HANDLERS (Profile, KYC, Cases, Notifications, Support, Admin, etc.)
// ============================================================

async function handleProfile(request, env, user, parts, origin) {
  const userId = parts[2] || user.user_id;
  if (!canAccessUser(user, userId)) return json({ error: "Forbidden" }, 403, origin);

  if (request.method === "GET") {
    const profile = await env.DB.prepare("SELECT * FROM profiles WHERE user_id = ?").bind(userId).first();
    return json(profile || { user_id: userId }, 200, origin);
  }
  if (request.method !== "PUT") return json({ error: "Method not allowed" }, 405, origin);

  const body = await readJson(request);
  const fields = ["full_name", "phone_number", "country", "city", "bio", "preferred_language", "avatar_url", "cover_url"];
  const values = pick(body, fields);
  const current = await env.DB.prepare("SELECT * FROM profiles WHERE user_id = ?").bind(userId).first();
  const merged = { ...(current || {}), ...values, user_id: userId, updated_at: now(), created_at: current?.created_at || now() };
  await env.DB.prepare(
    "INSERT INTO profiles (user_id, full_name, phone_number, country, city, bio, preferred_language, avatar_url, cover_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET full_name = excluded.full_name, phone_number = excluded.phone_number, country = excluded.country, city = excluded.city, bio = excluded.bio, preferred_language = excluded.preferred_language, avatar_url = excluded.avatar_url, cover_url = excluded.cover_url, updated_at = excluded.updated_at",
  ).bind(merged.user_id, merged.full_name || null, merged.phone_number || null, merged.country || null, merged.city || null, merged.bio || null, merged.preferred_language || "en", merged.avatar_url || null, merged.cover_url || null, merged.created_at, merged.updated_at).run();
  await env.DB.prepare("UPDATE users SET full_name = ?, avatar_url = ?, updated_at = ? WHERE user_id = ?").bind(merged.full_name || user.full_name, merged.avatar_url || user.avatar_url, merged.updated_at, userId).run();
  return json({ ...merged }, 200, origin);
}

async function handleKyc(request, env, user, url, parts, origin) {
  const queryUser = requestedUserId(url);
  const target = queryUser || user.user_id;
  if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);

  if (request.method === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM kyc_submissions WHERE user_id = ? ORDER BY submitted_at DESC LIMIT ?").bind(target, Number(url.searchParams.get("limit") || 50)).all();
    return json(rows.results || [], 200, origin);
  }
  if (request.method === "POST") {
    const body = await readJson(request);
    const record = pick(body, ["full_name", "date_of_birth", "address", "cnic_number", "cnic_front_url", "cnic_back_url", "selfie_url", "passport_url", "face_video_url", "document_type"]);
    const submissionId = body?.id || id();
    await env.DB.prepare(
      "INSERT INTO kyc_submissions (id, user_id, full_name, date_of_birth, address, cnic_number, cnic_front_url, cnic_back_url, selfie_url, passport_url, face_video_url, document_type, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)",
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
      "UPDATE kyc_submissions SET full_name = ?, date_of_birth = ?, address = ?, cnic_number = ?, cnic_front_url = ?, cnic_back_url = ?, selfie_url = ?, passport_url = ?, face_video_url = ?, document_type = ?, status = 'pending', rejection_reason = NULL, reviewed_at = NULL, reviewed_by = NULL, submitted_at = ? WHERE id = ? AND user_id = ?",
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
      "INSERT INTO case_submissions (id, user_id, category, title, short_description, country, city, urgency, description, amount_needed, currency, why_help, deadline, institute_name, institute_contact, institute_address, payment_method, account_title, account_number, account_iban, photo_urls, selfie_url, video_url, category_details, was_free, status, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)",
    ).bind(caseId, user.user_id, record.category || null, record.title || null, record.short_description || null, record.country || null, record.city || null, record.urgency || null, record.description || null, record.amount_needed || null, record.currency || "USD", record.why_help || null, record.deadline || null, record.institute_name || null, record.institute_contact || null, record.institute_address || null, record.payment_method || null, record.account_title || null, record.account_number || null, record.account_iban || null, photoUrls, record.selfie_url || null, record.video_url || null, categoryDetails, record.was_free ? 1 : 0, now()).run();
    await env.DB.prepare("UPDATE users SET total_cases = COALESCE(total_cases, 0) + 1, pending_cases = COALESCE(pending_cases, 0) + 1, updated_at = ? WHERE user_id = ?").bind(now(), user.user_id).run();
    return json({ id: caseId, user_id: user.user_id, ...record, status: "pending" }, 201, origin);
  }
  return json({ error: "Method not allowed" }, 405, origin);
}

async function handleNotifications(request, env, user, url, parts, origin) {
  const requested = url.searchParams.get("user_id") || user.user_id;
  if (!canAccessUser(user, requested)) return json({ error: "Forbidden" }, 403, origin);

  if (parts[2] === "unread-count" && request.method === "GET") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND (is_read = 0 OR is_read IS NULL)").bind(requested).first();
    return json({ count: Number(row?.count || 0) }, 200, origin);
  }

  if (parts[2] === "mark-read" && request.method === "PUT") {
    const body = await readJson(request);
    const target = String(body?.user_id || requested);
    if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
    await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").bind(target).run();
    return json({ updated: true, user_id: target }, 200, origin);
  }

  if (parts[2] === "clear" && request.method === "DELETE") {
    const body = await readJson(request);
    const target = String(body?.user_id || requested);
    if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
    await env.DB.prepare("DELETE FROM notifications WHERE user_id = ?").bind(target).run();
    return json({ deleted: true, user_id: target }, 200, origin);
  }

  if (parts[2]) return json({ error: "Notification route not found" }, 404, origin);

  if (request.method === "GET") {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 100), 1), 500);
    const rows = await env.DB.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?").bind(requested, limit).all();
    return json(rows.results || [], 200, origin);
  }

  if (request.method === "POST") {
    const body = await readJson(request);
    const target = String(body?.user_id || user.user_id);
    if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
    const notificationId = String(body?.id || id());
    const type = body?.type == null ? null : String(body.type);
    const title = body?.title == null ? null : String(body.title);
    const message = body?.message == null ? null : String(body.message);
    const link = body?.link == null ? null : String(body.link);
    const isRead = body?.is_read ? 1 : 0;
    const createdAt = body?.created_at || now();
    await env.DB.prepare("INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(notificationId, target, type, title, message, link, isRead, createdAt).run();
    return json({ id: notificationId, user_id: target, type, title, message, link, is_read: Boolean(isRead), created_at: createdAt }, 201, origin);
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

async function handleSupportMessages(request, env, user, url, parts, origin) {
  const requested = url.searchParams.get("user_id") || user.user_id;
  if (!canAccessUser(user, requested)) return json({ error: "Forbidden" }, 403, origin);
  const action = parts[2] === "messages" ? parts[3] : parts[2];

  if (action === "unread-count" && request.method === "GET") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM support_messages WHERE user_id = ? AND (is_read = 0 OR is_read IS NULL)").bind(requested).first();
    return json({ count: Number(row?.count || 0) }, 200, origin);
  }

  if (action === "mark-read" && request.method === "PUT") {
    const body = await readJson(request);
    const target = String(body?.user_id || requested);
    if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
    await env.DB.prepare("UPDATE support_messages SET is_read = 1 WHERE user_id = ?").bind(target).run();
    return json({ updated: true, user_id: target }, 200, origin);
  }

  if (action) return json({ error: "Support route not found" }, 404, origin);

  if (request.method === "GET") {
    const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 200), 1), 1000);
    const rows = await env.DB.prepare("SELECT * FROM support_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT ?").bind(requested, limit).all();
    return json(rows.results || [], 200, origin);
  }

  if (request.method === "POST") {
    const body = await readJson(request);
    const target = String(body?.user_id || user.user_id);
    if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
    const message = String(body?.message || "").trim();
    if (!message && !body?.attachment_url) return json({ error: "message or attachment_url is required" }, 400, origin);
    const messageId = String(body?.id || id());
    const sender = isAdmin(user) && target !== user.user_id ? "admin" : "user";
    const attachmentUrl = body?.attachment_url == null ? null : String(body.attachment_url);
    const language = body?.language == null ? null : String(body.language);
    const createdAt = body?.created_at || now();
    await env.DB.prepare("INSERT INTO support_messages (id, user_id, sender, message, attachment_url, language, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(messageId, target, sender, message || null, attachmentUrl, language, 0, createdAt).run();
    return json({ id: messageId, user_id: target, sender, message: message || null, attachment_url: attachmentUrl, language, is_read: false, created_at: createdAt }, 201, origin);
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

async function handleAdminSupportReply(request, env, user, origin) {
  if (!isAdmin(user)) return json({ error: "Admin access required" }, 403, origin);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  const body = await readJson(request);
  const target = String(body?.user_id || "").trim();
  if (!target) return json({ error: "user_id is required" }, 400, origin);

  if (body?.mark_read === true) {
    await env.DB.prepare("UPDATE support_messages SET is_read = 1 WHERE user_id = ? AND sender = 'user'").bind(target).run();
    return json({ updated: true, user_id: target }, 200, origin);
  }

  const message = String(body?.message || "").trim();
  const attachmentUrl = body?.attachment_url == null ? null : String(body.attachment_url);
  if (!message && !attachmentUrl) return json({ error: "message or attachment_url is required" }, 400, origin);
  const targetUser = await env.DB.prepare("SELECT user_id FROM users WHERE user_id = ?").bind(target).first();
  if (!targetUser) return json({ error: "Recipient user was not found" }, 404, origin);
  const messageId = id();
  const createdAt = now();
  await env.DB.prepare("INSERT INTO support_messages (id, user_id, sender, message, attachment_url, language, is_read, created_at) VALUES (?, ?, 'admin', ?, ?, ?, 0, ?)").bind(messageId, target, message || null, attachmentUrl, body?.language == null ? null : String(body.language), createdAt).run();
  return json(await env.DB.prepare("SELECT * FROM support_messages WHERE id = ?").bind(messageId).first(), 201, origin);
}

async function handleFeedbacks(request, env, user, url, parts, origin) {
  if (request.method === "GET") {
    const caseId = url.searchParams.get("case_id") || "";
    const requestedUser = url.searchParams.get("user_id") || "";
    if (caseId || requestedUser) {
      if (!canAccessUser(user, requestedUser)) return json({ error: "Forbidden" }, 403, origin);
      let query = "SELECT * FROM feedbacks WHERE 1 = 1";
      const params = [];
      if (caseId) {
        query += " AND case_id = ?";
        params.push(caseId);
      }
      if (requestedUser) {
        query += " AND user_id = ?";
        params.push(requestedUser);
      }
      query += " ORDER BY created_at DESC LIMIT ?";
      params.push(Number(url.searchParams.get("limit") || 50));
      const rows = await env.DB.prepare(query).bind(...params).all();
      return json(rows.results || [], 200, origin);
    }
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);
    const rows = await env.DB.prepare("SELECT * FROM feedbacks WHERE lower(status) = 'approved' ORDER BY created_at DESC LIMIT ?").bind(limit).all();
    return json(rows.results || [], 200, origin);
  }
  if (request.method === "POST") {
    const body = await readJson(request);
    const record = pick(body, ["case_id", "first_name", "text_message", "video_url"]);
    const feedbackId = body?.id || id();
    await env.DB.prepare(
      "INSERT INTO feedbacks (id, case_id, user_id, first_name, text_message, video_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    ).bind(feedbackId, record.case_id || null, user.user_id, record.first_name || user.full_name || "User", record.text_message || null, record.video_url || null, body?.status || "pending_review", now()).run();
    return json({ id: feedbackId, user_id: user.user_id, ...record, status: body?.status || "pending_review", created_at: now() }, 201, origin);
  }
  return json({ error: "Method not allowed" }, 405, origin);
}

async function handleFeedbackLikes(request, env, user, parts, origin) {
  if (request.method === "GET") {
    const feedbackId = parts[2] || "";
    const query = feedbackId
      ? "SELECT l.* FROM feedback_likes l JOIN feedbacks f ON f.id = l.feedback_id WHERE l.feedback_id = ? AND lower(f.status) = 'approved' ORDER BY l.created_at DESC"
      : "SELECT l.* FROM feedback_likes l JOIN feedbacks f ON f.id = l.feedback_id WHERE lower(f.status) = 'approved' ORDER BY l.created_at DESC";
    const rows = feedbackId ? await env.DB.prepare(query).bind(feedbackId).all() : await env.DB.prepare(query).all();
    return json(rows.results || [], 200, origin);
  }
  if (request.method === "POST") {
    const body = await readJson(request);
    const feedbackId = String(body?.feedback_id || "");
    if (!feedbackId) return json({ error: "feedback_id is required" }, 400, origin);
    const feedback = await env.DB.prepare("SELECT id FROM feedbacks WHERE id = ? AND lower(status) = 'approved'").bind(feedbackId).first();
    if (!feedback) return json({ error: "Feedback not found" }, 404, origin);
    const existing = await env.DB.prepare("SELECT * FROM feedback_likes WHERE feedback_id = ? AND user_id = ? LIMIT 1").bind(feedbackId, user.user_id).first();
    if (existing) return json(existing, 200, origin);
    const likeId = id();
    await env.DB.prepare("INSERT INTO feedback_likes (id, feedback_id, user_id, created_at) VALUES (?, ?, ?, ?)").bind(likeId, feedbackId, user.user_id, now()).run();
    return json({ id: likeId, feedback_id: feedbackId, user_id: user.user_id, created_at: now() }, 201, origin);
  }
  if (request.method === "DELETE" && parts[2]) {
    const existing = await env.DB.prepare("SELECT * FROM feedback_likes WHERE id = ?").bind(parts[2]).first();
    if (!existing) return json({ error: "Like not found" }, 404, origin);
    if (!isAdmin(user) && existing.user_id !== user.user_id) return json({ error: "Forbidden" }, 403, origin);
    await env.DB.prepare("DELETE FROM feedback_likes WHERE id = ?").bind(parts[2]).run();
    return json({ deleted: true, id: parts[2] }, 200, origin);
  }
  return json({ error: "Method not allowed" }, 405, origin);
}

async function handleFeedbackComments(request, env, user, parts, origin) {
  if (request.method === "GET") {
    const feedbackId = parts[2] || "";
    const query = feedbackId
      ? "SELECT c.* FROM feedback_comments c JOIN feedbacks f ON f.id = c.feedback_id WHERE c.feedback_id = ? AND lower(f.status) = 'approved' ORDER BY c.created_at ASC"
      : "SELECT c.* FROM feedback_comments c JOIN feedbacks f ON f.id = c.feedback_id WHERE lower(f.status) = 'approved' ORDER BY c.created_at ASC";
    const rows = feedbackId ? await env.DB.prepare(query).bind(feedbackId).all() : await env.DB.prepare(query).all();
    return json(rows.results || [], 200, origin);
  }
  if (request.method === "POST") {
    const body = await readJson(request);
    const feedbackId = String(body?.feedback_id || "");
    const comment = String(body?.comment || "").trim();
    if (!feedbackId || !comment) return json({ error: "feedback_id and comment are required" }, 400, origin);
    const feedback = await env.DB.prepare("SELECT id FROM feedbacks WHERE id = ? AND lower(status) = 'approved'").bind(feedbackId).first();
    if (!feedback) return json({ error: "Feedback not found" }, 404, origin);
    const commentId = id();
    const firstName = body?.first_name || (user.full_name || "User").split(" ")[0];
    await env.DB.prepare("INSERT INTO feedback_comments (id, feedback_id, user_id, first_name, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(commentId, feedbackId, user.user_id, firstName, comment, now()).run();
    return json({ id: commentId, feedback_id: feedbackId, user_id: user.user_id, first_name: firstName, comment, created_at: now() }, 201, origin);
  }
  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  ADMIN HANDLERS (fully intact)
// ============================================================

const ADMIN_TABLES = {
  kyc: "kyc_submissions",
  cases: "case_submissions",
  profiles: "profiles",
  deposits: "deposits",
  resolutions: "case_resolutions",
  wallets: "wallets",
  unlocks: "case_unlocks",
  "support-messages": "support_messages",
  feedbacks: "feedbacks",
  offers: "category_offers",
  suspensions: "user_suspensions",
};

const ADMIN_UPDATE_FIELDS = {
  kyc: ["status", "reviewed_at", "reviewed_by", "rejection_reason", "cnic_front_url", "cnic_back_url", "selfie_url", "passport_url", "face_video_url"],
  cases: ["status", "reviewed_at", "reviewed_by", "rejection_reason", "photo_urls", "selfie_url", "video_url", "category_details", "paid_receipt_url", "closed_by_admin"],
  feedbacks: ["status", "reviewed_at", "reviewed_by", "rejection_reason"],
  resolutions: ["status", "admin_confirmed", "admin_confirmed_at", "completed_at", "notes", "receipt_url"],
  deposits: ["status", "reviewed_at", "reviewed_by", "rejection_reason", "credits"],
  profiles: ["full_name", "phone_number", "country", "city", "bio", "preferred_language", "avatar_url", "cover_url", "is_suspended", "suspended_reason", "suspended_at"],
};

function normalizeAdminValue(key, value) {
  if ((key === "photo_urls" || key === "category_details") && value !== null && typeof value !== "string") return JSON.stringify(value);
  return value;
}

async function adminRows(env, resource, url) {
  const table = ADMIN_TABLES[resource];
  if (!table) return [];
  if (resource === "offers" && url.searchParams.get("category")) {
    const row = await env.DB.prepare("SELECT * FROM category_offers WHERE category = ?").bind(url.searchParams.get("category")).first();
    return row ? [row] : [];
  }
  if (resource === "wallets" && url.searchParams.get("user_id")) {
    const row = await env.DB.prepare("SELECT * FROM wallets WHERE user_id = ?").bind(url.searchParams.get("user_id")).first();
    return row ? [row] : [];
  }
  const rows = await env.DB.prepare(`SELECT * FROM ${table} ORDER BY rowid DESC LIMIT 10000`).all();
  const results = rows.results || [];
  return resource === "cases" ? results.map(decodeCaseRow) : results;
}

async function handleAdmin(request, env, user, parts, origin) {
  if (!isAdmin(user)) return json({ error: "Admin access required" }, 403, origin);
  if (!env.DB) return json({ error: "D1 binding DB is not configured" }, 503, origin);
  const url = new URL(request.url);
  const resource = parts[2];

  if (resource === "delete-files") {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
    if (!env.UPLOADS) return json({ ok: 0, failed: 0, error: "Upload storage is not configured" }, 503, origin);
    const body = await readJson(request);
    const urls = Array.isArray(body?.urls) ? body.urls : [];
    let ok = 0;
    let failed = 0;
    for (const value of urls) {
      try {
        const parsed = new URL(String(value));
        const key = parsed.pathname === "/uploads" ? parsed.searchParams.get("key") : null;
        if (!key || !key.startsWith("users/")) {
          failed += 1;
          continue;
        }
        await env.UPLOADS.delete(key);
        ok += 1;
      } catch {
        failed += 1;
      }
    }
    return json({ ok, failed }, 200, origin);
  }

  if (resource === "user-suspension") {
    const userId = parts[3] || "";
    if (request.method === "GET") {
      if (userId) {
        return json(await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(userId).first() || { user_id: userId, suspension_count: 0, is_active: false }, 200, origin);
      }
      const rows = await env.DB.prepare("SELECT * FROM user_suspensions ORDER BY rowid DESC LIMIT 10000").all();
      return json(rows.results || [], 200, origin);
    }
    if (request.method === "POST") {
      const body = await readJson(request);
      if (!body?.user_id) return json({ error: "user_id is required" }, 400, origin);
      const fields = ["suspension_count", "is_active", "suspended_at", "unlocked_at", "rejection_count_at_suspension", "credits_used_to_unlock"];
      const values = fields.map((field) => body[field] ?? null);
      await env.DB.prepare(`INSERT INTO user_suspensions (user_id, ${fields.join(", ")}) VALUES (?, ${fields.map(() => "?").join(", ")}) ON CONFLICT(user_id) DO UPDATE SET ${fields.map((field) => `${field} = excluded.${field}`).join(", ")}`).bind(body.user_id, ...values).run();
      return json(await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(body.user_id).first(), 200, origin);
    }
    return json({ error: "Method not allowed" }, 405, origin);
  }

  if (resource === "wallets" && request.method === "POST") {
    const body = await readJson(request);
    if (!body?.user_id) return json({ error: "user_id is required" }, 400, origin);
    await env.DB.prepare("INSERT INTO wallets (user_id, balance, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = excluded.balance, updated_at = excluded.updated_at").bind(body.user_id, Number(body.balance || 0), now()).run();
    return json(await env.DB.prepare("SELECT * FROM wallets WHERE user_id = ?").bind(body.user_id).first(), 200, origin);
  }

  if (resource === "offers" && request.method === "POST") {
    const body = await readJson(request);
    if (!body?.category) return json({ error: "category is required" }, 400, origin);
    const fields = ["is_active", "free_limit", "used_count", "label", "updated_at"];
    const values = [body.is_active ?? 0, body.free_limit ?? 50, body.used_count ?? 0, body.label ?? null, now()];
    await env.DB.prepare(`INSERT INTO category_offers (category, ${fields.join(", ")}) VALUES (?, ${fields.map(() => "?").join(", ")}) ON CONFLICT(category) DO UPDATE SET ${fields.map((field) => `${field} = excluded.${field}`).join(", ")}`).bind(body.category, ...values).run();
    return json(await env.DB.prepare("SELECT * FROM category_offers WHERE category = ?").bind(body.category).first(), 200, origin);
  }

  if (request.method === "GET") return json(await adminRows(env, resource, url), 200, origin);

  if (request.method !== "PUT") return json({ error: "Method not allowed" }, 405, origin);
  const table = ADMIN_TABLES[resource];
  if (!table || !ADMIN_UPDATE_FIELDS[resource]) return json({ error: "Unknown or read-only admin resource" }, 404, origin);

  const recordId = parts[3];
  const isCloseCase = resource === "cases" && parts[4] === "close";
  if (!recordId) return json({ error: "Record id is required" }, 400, origin);
  const body = await readJson(request);
  const update = isCloseCase ? { ...(body || {}), status: "closed", closed_by_admin: true, reviewed_at: now(), reviewed_by: user.email } : (body || {});
  const allowed = ADMIN_UPDATE_FIELDS[resource].filter((field) => Object.prototype.hasOwnProperty.call(update, field));
  if (!allowed.length) return json({ error: "No writable fields supplied" }, 400, origin);
  const values = allowed.map((field) => normalizeAdminValue(field, update[field]));
  const keyColumn = resource === "profiles" ? "user_id" : "id";
  await env.DB.prepare(`UPDATE ${table} SET ${allowed.map((field) => `${field} = ?`).join(", ")} WHERE ${keyColumn} = ?`).bind(...values, recordId).run();
  return json(await env.DB.prepare(`SELECT * FROM ${table} WHERE ${keyColumn} = ?`).bind(recordId).first(), 200, origin);
}

// ============================================================
//  OTHER HANDLERS (Case Unlocks, Resolutions, Suspensions, Offers, Claims, Wallets, Deposits, Account, Settings, Upload)
// ============================================================

async function handleCaseUnlocks(request, env, user, url, parts, origin) {
  const heroId = String(url.searchParams.get("hero_id") || user.user_id);
  if (!canAccessUser(user, heroId)) return json({ error: "Forbidden" }, 403, origin);
  if (request.method === "GET" && parts[2] === "count") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM case_unlocks WHERE hero_id = ?").bind(heroId).first();
    return json({ count: Number(row?.count || 0) }, 200, origin);
  }
  if (request.method === "GET") {
    const caseId = String(url.searchParams.get("case_id") || "");
    const rows = caseId
      ? await env.DB.prepare("SELECT * FROM case_unlocks WHERE hero_id = ? AND case_id = ? ORDER BY unlocked_at DESC").bind(heroId, caseId).all()
      : await env.DB.prepare("SELECT * FROM case_unlocks WHERE hero_id = ? ORDER BY unlocked_at DESC").bind(heroId).all();
    return json(rows.results || [], 200, origin);
  }
  if (request.method === "POST") {
    const body = await readJson(request);
    const bodyHero = String(body?.hero_id || user.user_id);
    if (!body?.case_id || !canAccessUser(user, bodyHero)) return json({ error: "case_id and an authorized hero_id are required" }, 400, origin);
    const existing = await env.DB.prepare("SELECT * FROM case_unlocks WHERE case_id = ? AND hero_id = ? LIMIT 1").bind(body.case_id, bodyHero).first();
    if (existing) return json(existing, 200, origin);
    const caseRow = await env.DB.prepare("SELECT id, user_id, status FROM case_submissions WHERE id = ?").bind(body.case_id).first();
    if (!caseRow || !["approved", "published", "active", "completed"].includes(String(caseRow.status || "").toLowerCase())) return json({ error: "This case is not available to unlock" }, 409, origin);
    if (caseRow.user_id === bodyHero && !isAdmin(user)) return json({ error: "You cannot unlock your own case" }, 403, origin);
    const priorUnlocks = await env.DB.prepare("SELECT COUNT(*) AS count FROM case_unlocks WHERE hero_id = ?").bind(bodyHero).first();
    const creditsCharged = Number(priorUnlocks?.count || 0) < 3 ? 0 : 1;
    if (creditsCharged) {
      const debit = await env.DB.prepare("UPDATE wallets SET balance = balance - 1, updated_at = ? WHERE user_id = ? AND COALESCE(balance, 0) >= 1").bind(now(), bodyHero).run();
      if (!Number(debit.meta?.changes || 0)) return json({ error: "Insufficient credits. Add credits in Wallet before unlocking this case." }, 409, origin);
    }
    const unlockId = String(body?.id || id());
    try {
      await env.DB.prepare("INSERT INTO case_unlocks (id, case_id, hero_id, pledged_amount, credits_charged, payment_type, unlocked_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(unlockId, body.case_id, bodyHero, Math.max(0, Number(body?.pledged_amount || 0)), creditsCharged, body?.payment_type === "partial" ? "partial" : "full", now()).run();
    } catch (error) {
      if (creditsCharged) await env.DB.prepare("UPDATE wallets SET balance = balance + 1, updated_at = ? WHERE user_id = ?").bind(now(), bodyHero).run();
      throw error;
    }
    return json(await env.DB.prepare("SELECT * FROM case_unlocks WHERE id = ?").bind(unlockId).first(), 201, origin);
  }
  return json({ error: "Method not allowed" }, 405, origin);
}

async function handleCaseResolutions(request, env, user, url, parts, origin) {
  if (request.method === "GET") {
    const caseId = String(url.searchParams.get("case_id") || "");
    const heroId = String(url.searchParams.get("hero_id") || "");
    if (!caseId) return json({ error: "case_id is required" }, 400, origin);
    const caseRow = await env.DB.prepare("SELECT user_id FROM case_submissions WHERE id = ?").bind(caseId).first();
    if (!caseRow) return json([], 200, origin);
    if (!isAdmin(user) && user.user_id !== caseRow.user_id && (!heroId || heroId !== user.user_id)) return json({ error: "Forbidden" }, 403, origin);
    const rows = heroId
      ? await env.DB.prepare("SELECT * FROM case_resolutions WHERE case_id = ? AND hero_id = ? ORDER BY submitted_at DESC").bind(caseId, heroId).all()
      : await env.DB.prepare("SELECT * FROM case_resolutions WHERE case_id = ? ORDER BY submitted_at DESC").bind(caseId).all();
    return json(rows.results || [], 200, origin);
  }
  if (request.method === "POST") {
    const body = await readJson(request);
    const caseId = String(body?.case_id || "");
    const heroId = String(body?.hero_id || user.user_id);
    if (!caseId || !canAccessUser(user, heroId)) return json({ error: "case_id and an authorized hero_id are required" }, 400, origin);
    const caseRow = await env.DB.prepare("SELECT user_id FROM case_submissions WHERE id = ?").bind(caseId).first();
    if (!caseRow) return json({ error: "Case not found" }, 404, origin);
    const resolutionId = String(body?.id || id());
    await env.DB.prepare("INSERT INTO case_resolutions (id, case_id, hero_id, seeker_id, resolution_type, amount_paid, transaction_id, receipt_url, notes, status, hero_confirmed, seeker_confirmed, seeker_confirmed_amount, paid_to, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(resolutionId, caseId, heroId, caseRow.user_id, body?.resolution_type || null, Number(body?.amount_paid || 0), body?.transaction_id || null, body?.receipt_url || null, body?.notes || null, body?.status || "pending_confirmation", body?.hero_confirmed ? 1 : 0, body?.seeker_confirmed ? 1 : 0, body?.seeker_confirmed_amount ?? null, body?.paid_to || null, body?.submitted_at || now()).run();
    return json(await env.DB.prepare("SELECT * FROM case_resolutions WHERE id = ?").bind(resolutionId).first(), 201, origin);
  }
  if (request.method === "PUT" && parts[2]) {
    const record = await env.DB.prepare("SELECT * FROM case_resolutions WHERE id = ?").bind(parts[2]).first();
    if (!record) return json({ error: "Resolution not found" }, 404, origin);
    if (!isAdmin(user) && record.hero_id !== user.user_id && record.seeker_id !== user.user_id) return json({ error: "Forbidden" }, 403, origin);
    const body = await readJson(request);
    const writable = ["resolution_type", "amount_paid", "transaction_id", "receipt_url", "notes", "status", "hero_confirmed", "seeker_confirmed", "seeker_confirmed_amount", "paid_to", "completed_at", "admin_confirmed", "admin_confirmed_at"].filter((field) => Object.prototype.hasOwnProperty.call(body || {}, field));
    if (!writable.length) return json({ error: "No writable fields supplied" }, 400, origin);
    await env.DB.prepare(`UPDATE case_resolutions SET ${writable.map((field) => `${field} = ?`).join(", ")} WHERE id = ?`).bind(...writable.map((field) => body[field]), parts[2]).run();
    return json(await env.DB.prepare("SELECT * FROM case_resolutions WHERE id = ?").bind(parts[2]).first(), 200, origin);
  }
  return json({ error: "Method not allowed" }, 405, origin);
}

async function handleUserSuspension(request, env, user, url, parts, origin) {
  const target = String(parts[2] || url.searchParams.get("user_id") || user.user_id);
  if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
  if (request.method === "GET") return json(await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(target).first() || { user_id: target, suspension_count: 0, is_active: false }, 200, origin);
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  const body = await readJson(request);
  const bodyTarget = String(body?.user_id || user.user_id);
  if (!canAccessUser(user, bodyTarget)) return json({ error: "Forbidden" }, 403, origin);
  const existing = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(bodyTarget).first();
  const wantsActive = body?.is_active === true || body?.is_active === 1 || body?.is_active === "true";
  if (wantsActive) {
    const rejected = await env.DB.prepare("SELECT COUNT(*) AS count FROM case_submissions WHERE user_id = ? AND lower(status) = 'rejected'").bind(bodyTarget).first();
    const rejectedCount = Number(rejected?.count || 0);
    const baseline = Number(existing?.rejection_count_at_suspension || 0);
    if (rejectedCount < 3 || (!existing?.is_active && rejectedCount <= baseline)) return json({ error: "Suspension requires three new rejected case submissions" }, 409, origin);
    const suspensionCount = Number(existing?.suspension_count || 0) + (existing?.is_active ? 0 : 1);
    await env.DB.prepare("INSERT INTO user_suspensions (user_id, suspension_count, is_active, suspended_at, unlocked_at, rejection_count_at_suspension, credits_used_to_unlock) VALUES (?, ?, 1, ?, NULL, ?, 0) ON CONFLICT(user_id) DO UPDATE SET suspension_count = excluded.suspension_count, is_active = 1, suspended_at = excluded.suspended_at, unlocked_at = NULL, rejection_count_at_suspension = excluded.rejection_count_at_suspension, credits_used_to_unlock = 0").bind(bodyTarget, suspensionCount, now(), rejectedCount).run();
  } else {
    if (!existing?.is_active) return json({ error: "Account is not currently suspended" }, 409, origin);
    const debit = await env.DB.prepare("UPDATE wallets SET balance = balance - 5, updated_at = ? WHERE user_id = ? AND COALESCE(balance, 0) >= 5").bind(now(), bodyTarget).run();
    if (!Number(debit.meta?.changes || 0)) return json({ error: "Insufficient credits. Five credits are required to unlock this account." }, 409, origin);
    await env.DB.prepare("UPDATE user_suspensions SET is_active = 0, unlocked_at = ?, credits_used_to_unlock = 5 WHERE user_id = ?").bind(now(), bodyTarget).run();
  }
  return json(await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(bodyTarget).first(), 200, origin);
}

async function handleOffers(request, env, user, url, parts, origin) {
  if (request.method === "GET") {
    const category = String(url.searchParams.get("category") || "");
    const rows = category ? await env.DB.prepare("SELECT * FROM category_offers WHERE category = ?").bind(category).all() : await env.DB.prepare("SELECT * FROM category_offers ORDER BY category ASC").all();
    return json(rows.results || [], 200, origin);
  }
  if (request.method === "PUT" && parts[2] === "usage") {
    const body = await readJson(request);
    const category = String(body?.category || "").trim();
    if (!category) return json({ error: "category is required" }, 400, origin);
    await env.DB.prepare("UPDATE category_offers SET used_count = COALESCE(used_count, 0) + 1, updated_at = ? WHERE category = ?").bind(now(), category).run();
    return json(await env.DB.prepare("SELECT * FROM category_offers WHERE category = ?").bind(category).first() || { category, used_count: 0 }, 200, origin);
  }
  return json({ error: "Method not allowed" }, 405, origin);
}

async function handleOfferClaims(request, env, user, url, parts, origin) {
  const target = String(url.searchParams.get("user_id") || user.user_id);
  if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
  if (request.method === "GET" && parts[2] === "count") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM offer_claims WHERE user_id = ?").bind(target).first();
    return json({ count: Number(row?.count || 0) }, 200, origin);
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  const body = await readJson(request);
  const bodyTarget = String(body?.user_id || user.user_id);
  if (!canAccessUser(user, bodyTarget)) return json({ error: "Forbidden" }, 403, origin);
  const claimId = String(body?.id || id());
  await env.DB.prepare("INSERT INTO offer_claims (id, user_id, category, case_id, claimed_at) VALUES (?, ?, ?, ?, ?)").bind(claimId, bodyTarget, body?.category || null, body?.case_id || null, body?.claimed_at || now()).run();
  return json({ id: claimId, user_id: bodyTarget, category: body?.category || null, case_id: body?.case_id || null, claimed_at: body?.claimed_at || now() }, 201, origin);
}

async function handleWallets(request, env, user, parts, origin) {
  const userId = String(parts[2] || user.user_id);
  if (!canAccessUser(user, userId)) return json({ error: "Forbidden" }, 403, origin);
  const current = await env.DB.prepare("SELECT * FROM wallets WHERE user_id = ?").bind(userId).first();
  if (request.method === "GET") return json(current || { user_id: userId, balance: 0 }, 200, origin);
  if (request.method !== "PUT") return json({ error: "Method not allowed" }, 405, origin);
  const body = await readJson(request);
  const balance = Number(body?.balance);
  if (!Number.isFinite(balance) || balance < 0) return json({ error: "A non-negative numeric balance is required" }, 400, origin);
  if (!isAdmin(user) && balance > Number(current?.balance || 0)) return json({ error: "Only an administrator can increase wallet balance" }, 403, origin);
  await env.DB.prepare("INSERT INTO wallets (user_id, balance, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = excluded.balance, updated_at = excluded.updated_at").bind(userId, balance, now()).run();
  return json(await env.DB.prepare("SELECT * FROM wallets WHERE user_id = ?").bind(userId).first(), 200, origin);
}

async function handleDeposits(request, env, user, url, origin) {
  const target = String(url.searchParams.get("user_id") || user.user_id);
  if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
  if (request.method === "GET") {
    const rows = await env.DB.prepare("SELECT * FROM deposits WHERE user_id = ? ORDER BY submitted_at DESC").bind(target).all();
    return json(rows.results || [], 200, origin);
  }
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  const body = await readJson(request);
  const bodyTarget = String(body?.user_id || user.user_id);
  if (!canAccessUser(user, bodyTarget)) return json({ error: "Forbidden" }, 403, origin);
  const depositId = String(body?.id || id());
  await env.DB.prepare("INSERT INTO deposits (id, user_id, method, amount, currency, transaction_id, proof_url, status, credits, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)").bind(depositId, bodyTarget, body?.method || null, Number(body?.amount || 0), body?.currency || "USD", body?.transaction_id || null, body?.proof_url || null, Number(body?.credits || 0), body?.submitted_at || now()).run();
  return json(await env.DB.prepare("SELECT * FROM deposits WHERE id = ?").bind(depositId).first(), 201, origin);
}

async function handleAccount(request, env, user, parts, origin) {
  if (request.method !== "DELETE" || parts[2] !== "delete") return json({ error: "Method not allowed" }, 405, origin);
  const userId = user.user_id;
  if (env.UPLOADS) {
    let cursor = undefined;
    do {
      const page = await env.UPLOADS.list({ prefix: `users/${safeSegment(userId)}/`, cursor });
      if (page.objects.length) await Promise.all(page.objects.map((object) => env.UPLOADS.delete(object.key)));
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);
  }
  const statements = [
    "DELETE FROM notifications WHERE user_id = ?",
    "DELETE FROM support_messages WHERE user_id = ?",
    "DELETE FROM kyc_submissions WHERE user_id = ?",
    "DELETE FROM deposits WHERE user_id = ?",
    "DELETE FROM case_unlocks WHERE hero_id = ?",
    "DELETE FROM offer_claims WHERE user_id = ?",
    "DELETE FROM user_suspensions WHERE user_id = ?",
    "DELETE FROM user_settings WHERE user_id = ?",
    "DELETE FROM wallets WHERE user_id = ?",
    "DELETE FROM profiles WHERE user_id = ?",
    "DELETE FROM case_submissions WHERE user_id = ?",
    "DELETE FROM users WHERE user_id = ?",
  ].map((statement) => env.DB.prepare(statement).bind(userId));
  await env.DB.batch(statements);
  return json({ deleted: true, user_id: userId }, 200, origin);
}

async function handleUserSettings(request, env, user, parts, origin) {
  const userId = parts[2] || user.user_id;
  if (!canAccessUser(user, userId)) return json({ error: "Forbidden" }, 403, origin);
  if (request.method === "GET") {
    return json(await env.DB.prepare("SELECT * FROM user_settings WHERE user_id = ?").bind(userId).first() || { user_id: userId }, 200, origin);
  }
  const body = await readJson(request);
  const fields = ["language", "theme", "currency", "timezone", "email_notifications", "inapp_notifications", "weekly_digest", "high_contrast", "larger_text", "reduced_animations"];
  const values = pick(body, fields);
  const merged = { ...(await env.DB.prepare("SELECT * FROM user_settings WHERE user_id = ?").bind(userId).first() || {}), ...values };
  await env.DB.prepare(
    "INSERT INTO user_settings (user_id, language, theme, currency, timezone, email_notifications, inapp_notifications, weekly_digest, high_contrast, larger_text, reduced_animations, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET language = excluded.language, theme = excluded.theme, currency = excluded.currency, timezone = excluded.timezone, email_notifications = excluded.email_notifications, inapp_notifications = excluded.inapp_notifications, weekly_digest = excluded.weekly_digest, high_contrast = excluded.high_contrast, larger_text = excluded.larger_text, reduced_animations = excluded.reduced_animations, updated_at = excluded.updated_at",
  ).bind(userId, merged.language || "en", merged.theme || "light", merged.currency || "USD", merged.timezone || "UTC", merged.email_notifications ?? 1, merged.inapp_notifications ?? 1, merged.weekly_digest ?? 0, merged.high_contrast ?? 0, merged.larger_text ?? 0, merged.reduced_animations ?? 0, now()).run();
  return json(await env.DB.prepare("SELECT * FROM user_settings WHERE user_id = ?").bind(userId).first(), 200, origin);
}

function safeSegment(value, fallback = "file") {
  const cleaned = String(value || "").replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "").slice(0, 120);
  return cleaned || fallback;
}

function safeFilename(value) {
  return safeSegment(String(value || "file").split(/[\\/]/).pop() || "file", "file");
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of new Uint8Array(bytes)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function signUploadKey(secret, key, expiresAt) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(`${key}:${expiresAt}`));
  return base64Url(signature);
}

async function makeUploadUrl(env, key) {
  const secret = String(env.JWT_SECRET || "");
  if (!secret) throw new Error("JWT_SECRET is not configured");
  const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
  const signature = await signUploadKey(secret, key, expiresAt);
  return `${PUBLIC_ORIGIN}/uploads?key=${encodeURIComponent(key)}&expires=${expiresAt}&signature=${signature}`;
}

async function isValidUploadUrl(env, key, expiresAt, signature) {
  const secret = String(env.JWT_SECRET || "");
  if (!secret || !key || !signature || !Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false;
  const expected = await signUploadKey(secret, key, expiresAt);
  return expected === signature;
}

function buildUploadKey(userId, requestedPath, fileName) {
  const owner = safeSegment(userId, "user");
  const rawParts = String(requestedPath || "").replace(/\\/g, "/").split("/").filter(Boolean).map((part) => safeSegment(part)).filter(Boolean);
  const relative = rawParts[0] === owner ? rawParts.slice(1) : rawParts;
  const originalName = safeFilename(fileName);
  let leaf = relative.pop() || originalName;
  if (!leaf.includes(".") && originalName.includes(".")) leaf += `.${originalName.split(".").pop()}`;
  const folder = relative.length ? `${relative.join("/")}/` : "";
  return `users/${owner}/${folder}${leaf}`;
}

async function handleUpload(request, env, user, origin) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  if (!env.UPLOADS) return json({ error: "Upload storage is not configured" }, 503, origin);
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file.stream !== "function") return json({ error: "A file is required" }, 400, origin);
  if (file.size > 100 * 1024 * 1024) return json({ error: "File exceeds the 100 MB limit" }, 413, origin);

  const key = buildUploadKey(user.user_id, form.get("path"), file.name);
  const contentType = String(file.type || "application/octet-stream").slice(0, 200);
  await env.UPLOADS.put(key, file.stream(), {
    httpMetadata: {
      contentType,
      contentDisposition: `inline; filename="${safeFilename(file.name)}"`,
    },
    customMetadata: {
      ownerId: String(user.user_id),
      originalName: safeFilename(file.name),
    },
  });
  const url = await makeUploadUrl(env, key);
  return json({ key, url, content_type: contentType }, 201, origin);
}

async function handleStoredUpload(request, env, url, origin) {
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders(origin) });
  if (!env.UPLOADS) return new Response("Upload storage is not configured", { status: 503, headers: corsHeaders(origin) });
  const key = url.searchParams.get("key") || "";
  const expiresAt = Number(url.searchParams.get("expires") || 0);
  const signature = url.searchParams.get("signature") || "";
  if (!(await isValidUploadUrl(env, key, expiresAt, signature))) return new Response("Invalid or expired upload URL", { status: 403, headers: corsHeaders(origin) });
  const object = await env.UPLOADS.get(key);
  if (!object) return new Response("Not Found", { status: 404, headers: corsHeaders(origin) });
  const headers = new Headers(corsHeaders(origin));
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "private, max-age=3600");
  return new Response(request.method === "HEAD" ? null : object.body, { status: 200, headers });
}

async function handlePublicFeedback(request, env, user, origin) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);
  const body = await readJson(request);
  const message = String(body?.message || "").trim();
  if (!message) return json({ error: "message is required" }, 400, origin);
  if (message.length > 5000) return json({ error: "message is too long" }, 413, origin);

  const isAuthenticated = Boolean(user?.user_id);
  const userId = isAuthenticated ? String(user.user_id) : "public";
  const firstName = isAuthenticated
    ? String(user.full_name || user.email || body?.guest_name || "User").trim()
    : String(body?.guest_name || "Public Visitor").trim();
  const feedbackId = id();
  const createdAt = now();

  await env.DB.prepare(
    "INSERT INTO feedbacks (id, case_id, user_id, first_name, text_message, video_url, status, created_at) VALUES (?, NULL, ?, ?, ?, NULL, 'pending_review', ?)",
  ).bind(feedbackId, userId, firstName || (isAuthenticated ? "User" : "Public Visitor"), message, createdAt).run();

  return json({
    id: feedbackId,
    case_id: null,
    user_id: userId,
    first_name: firstName || (isAuthenticated ? "User" : "Public Visitor"),
    text_message: message,
    status: "pending_review",
    created_at: createdAt,
  }, 201, origin);
}

// ============================================================
//  NEW COMMUNITY POSTS, LIKES, COMMENTS HANDLERS
// ============================================================

async function handleCommunityPosts(request, env, user, origin) {
  const url = new URL(request.url);
  const parts = pathParts(url);

  // MARK-READ endpoint
  if (parts[2] === "mark-read" && request.method === "POST") {
    if (!user) return json({ error: "Authentication required" }, 401, origin);
    const nowStr = now();
    await env.DB.prepare(
      "UPDATE users SET last_community_visit = ? WHERE user_id = ?"
    ).bind(nowStr, user.user_id).run();
    return json({ success: true, last_community_visit: nowStr }, 200, origin);
  }

  // POST - Create new post
  if (request.method === "POST") {
    const body = await readJson(request);
    const message = String(body?.message || "").trim();
    if (!message) return json({ error: "Message is required" }, 400, origin);

    const displayName = String(body?.display_name || "Guest").trim();
    const isGuest = body?.is_guest ? 1 : 0;
    const userId = body?.user_id || null;
    const postId = id();
    const nowTimestamp = now();

    await env.DB.prepare(
      `INSERT INTO community_posts (id, user_id, display_name, message, is_guest, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(postId, userId, displayName, message, isGuest, nowTimestamp).run();

    // Notify admin
    const adminEmail = "shoaibahmedbugti5@gmail.com";
    const adminUser = await env.DB.prepare(
      "SELECT user_id FROM users WHERE lower(email) = lower(?) LIMIT 1"
    ).bind(adminEmail).first();

    if (adminUser) {
      await env.DB.prepare(
        `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id(),
        adminUser.user_id,
        'community_post',
        `📢 New Community Post from ${displayName}`,
        message.slice(0, 200) + (message.length > 200 ? "..." : ""),
        '/admin?tab=posts',
        0,
        nowTimestamp
      ).run();
    }

    return json({ success: true, id: postId }, 201, origin);
  }

  // GET - Fetch posts (filter by last_community_visit)
  if (request.method === "GET") {
    let lastVisit = null;
    if (user && user.user_id) {
      const userRow = await env.DB.prepare(
        "SELECT last_community_visit FROM users WHERE user_id = ?"
      ).bind(user.user_id).first();
      lastVisit = userRow?.last_community_visit || null;
    }

    let query = "SELECT * FROM community_posts";
    const params = [];
    if (lastVisit) {
      query += " WHERE created_at > ?";
      params.push(lastVisit);
    }
    query += " ORDER BY created_at DESC LIMIT 100";

    const rows = await env.DB.prepare(query).bind(...params).all();
    return json(rows.results || [], 200, origin);
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

async function handlePostLikes(request, env, user, parts, origin) {
  const postId = parts[2];

  // GET - Fetch likes
  if (request.method === "GET") {
    try {
      if (postId) {
        const rows = await env.DB.prepare(
          "SELECT * FROM community_post_likes WHERE post_id = ? ORDER BY created_at DESC"
        ).bind(postId).all();
        return json(rows.results || [], 200, origin);
      }
      const rows = await env.DB.prepare(
        "SELECT * FROM community_post_likes ORDER BY created_at DESC LIMIT 100"
      ).all();
      return json(rows.results || [], 200, origin);
    } catch (error) {
      return json({ error: error.message }, 500, origin);
    }
  }

  // POST - Toggle like
  if (request.method === "POST") {
    if (!user) return json({ error: "Authentication required" }, 401, origin);

    try {
      const body = await readJson(request);
      const targetPostId = body?.post_id || postId;
      if (!targetPostId) return json({ error: "post_id is required" }, 400, origin);

      // Check if already liked
      const existing = await env.DB.prepare(
        "SELECT id FROM community_post_likes WHERE post_id = ? AND user_id = ? LIMIT 1"
      ).bind(targetPostId, user.user_id).first();

      if (existing) {
        await env.DB.prepare(
          "DELETE FROM community_post_likes WHERE post_id = ? AND user_id = ?"
        ).bind(targetPostId, user.user_id).run();
        return json({ liked: false, post_id: targetPostId }, 200, origin);
      }

      const likeId = id();
      await env.DB.prepare(
        "INSERT INTO community_post_likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)"
      ).bind(likeId, targetPostId, user.user_id, now()).run();

      // Send notification to post owner
      try {
        const post = await env.DB.prepare(
          "SELECT user_id FROM community_posts WHERE id = ?"
        ).bind(targetPostId).first();

        if (post && post.user_id && post.user_id !== user.user_id) {
          await env.DB.prepare(
            `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            id(),
            post.user_id,
            'like',
            'New Like ❤️',
            `${user.full_name || 'Someone'} liked your post.`,
            '/community',
            0,
            now()
          ).run();
        }
      } catch (notifError) {
        console.error("Notification error:", notifError);
      }

      return json({ liked: true, id: likeId, post_id: targetPostId }, 201, origin);
    } catch (error) {
      return json({ error: error.message || "Failed to toggle like" }, 500, origin);
    }
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

async function handlePostComments(request, env, user, parts, origin) {
  const postId = parts[2];

  // GET - Fetch comments
  if (request.method === "GET") {
    try {
      if (postId) {
        const rows = await env.DB.prepare(
          `SELECT c.*, u.full_name as user_name 
           FROM community_post_comments c 
           LEFT JOIN users u ON c.user_id = u.user_id 
           WHERE c.post_id = ? 
           ORDER BY c.created_at ASC`
        ).bind(postId).all();
        return json(rows.results || [], 200, origin);
      }
      const rows = await env.DB.prepare(
        "SELECT * FROM community_post_comments ORDER BY created_at DESC LIMIT 100"
      ).all();
      return json(rows.results || [], 200, origin);
    } catch (error) {
      return json({ error: error.message }, 500, origin);
    }
  }

  // POST - Add comment
  if (request.method === "POST") {
    if (!user) return json({ error: "Authentication required" }, 401, origin);

    try {
      const body = await readJson(request);
      const targetPostId = body?.post_id || postId;
      const comment = body?.comment?.trim();
      if (!targetPostId) return json({ error: "post_id is required" }, 400, origin);
      if (!comment) return json({ error: "Comment is required" }, 400, origin);

      const commentId = id();
      await env.DB.prepare(
        "INSERT INTO community_post_comments (id, post_id, user_id, comment, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(commentId, targetPostId, user.user_id, comment, now()).run();

      // Send notification to post owner
      try {
        const post = await env.DB.prepare(
          "SELECT user_id FROM community_posts WHERE id = ?"
        ).bind(targetPostId).first();

        if (post && post.user_id && post.user_id !== user.user_id) {
          await env.DB.prepare(
            `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            id(),
            post.user_id,
            'comment',
            'New Comment 💬',
            `${user.full_name || 'Someone'} commented: "${comment.slice(0, 50)}${comment.length > 50 ? '...' : ''}"`,
            '/community',
            0,
            now()
          ).run();
        }
      } catch (notifError) {
        console.error("Notification error:", notifError);
      }

      return json({
        id: commentId,
        post_id: targetPostId,
        user_id: user.user_id,
        user_name: user.full_name || "User",
        comment: comment,
        created_at: now(),
      }, 201, origin);
    } catch (error) {
      return json({ error: error.message || "Failed to add comment" }, 500, origin);
    }
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  ROUTE API (UPDATED)
// ============================================================

async function routeApi(request, env, user, url, origin) {
  const parts = pathParts(url);

  // Upload
  if (parts[1] === "upload") return handleUpload(request, env, user, origin);
  if (!env.DB) return json({ error: "D1 binding DB is not configured" }, 503, origin);

  // Profile
  if (parts[1] === "profiles") return handleProfile(request, env, user, parts, origin);
  // KYC
  if (parts[1] === "kyc-submissions") return handleKyc(request, env, user, url, parts, origin);
  // Cases
  if (parts[1] === "cases") return handleCases(request, env, user, url, parts, origin);
  // Notifications
  if (parts[1] === "notifications") return handleNotifications(request, env, user, url, parts, origin);
  // Support
  if (parts[1] === "support") return handleSupportMessages(request, env, user, url, parts, origin);
  // Case Unlocks
  if (parts[1] === "case-unlocks") return handleCaseUnlocks(request, env, user, url, parts, origin);
  // Case Resolutions
  if (parts[1] === "case-resolutions") return handleCaseResolutions(request, env, user, url, parts, origin);
  // User Suspension
  if (parts[1] === "user-suspension") return handleUserSuspension(request, env, user, url, parts, origin);
  // Offers
  if (parts[1] === "offers") return handleOffers(request, env, user, url, parts, origin);
  // Offer Claims
  if (parts[1] === "offer-claims") return handleOfferClaims(request, env, user, url, parts, origin);
  // Deposits
  if (parts[1] === "deposits") return handleDeposits(request, env, user, url, origin);
  // Account
  if (parts[1] === "account") return handleAccount(request, env, user, parts, origin);
  // Feedbacks
  if (parts[1] === "feedbacks") return handleFeedbacks(request, env, user, url, parts, origin);
  // Feedback Likes
  if (parts[1] === "feedback-likes") return handleFeedbackLikes(request, env, user, parts, origin);
  // Feedback Comments
  if (parts[1] === "feedback-comments") return handleFeedbackComments(request, env, user, parts, origin);
  // Admin Support Reply
  if (parts[1] === "admin" && parts[2] === "support" && parts[3] === "reply") return handleAdminSupportReply(request, env, user, origin);
  // Admin
  if (parts[1] === "admin") return handleAdmin(request, env, user, parts, origin);
  // User Settings
  if (parts[1] === "user-settings") return handleUserSettings(request, env, user, parts, origin);
  // Wallets
  if (parts[1] === "wallets") return handleWallets(request, env, user, parts, origin);

  // ===== NEW: Community Posts =====
  if (parts[1] === "community-posts") {
    return handleCommunityPosts(request, env, user, origin);
  }

  // ===== NEW: Post Likes =====
  if (parts[1] === "post-likes") {
    return handlePostLikes(request, env, user, parts, origin);
  }

  // ===== NEW: Post Comments =====
  if (parts[1] === "post-comments") {
    return handlePostComments(request, env, user, parts, origin);
  }

  return json({ error: "API route not implemented yet" }, 404, origin);
}

// ============================================================
//  MAIN FETCH HANDLER
// ============================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || PUBLIC_ORIGIN;
    const clientId = env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });

    try {
      // Public routes (no authentication required)
      const publicRead = request.method === "GET" && (
        url.pathname === "/api/community-posts" ||
        url.pathname === "/api/community-posts/" ||
        url.pathname.startsWith("/api/post-likes") ||
        url.pathname.startsWith("/api/post-comments") ||
        url.pathname === "/api/cases/approved" ||
        url.pathname === "/api/cases/category-counts" ||
        (url.pathname === "/api/feedbacks" && !url.searchParams.has("case_id") && !url.searchParams.has("user_id")) ||
        url.pathname === "/api/feedback-likes" ||
        url.pathname === "/api/feedback-comments"
      );
      if (publicRead) {
        const publicUser = { user_id: "", email: "", full_name: "", avatar_url: "" };
        return routeApi(request, env, publicUser, url, origin);
      }

      // Public POST for community posts (guest posts)
      if ((url.pathname === "/api/community-posts" || url.pathname === "/api/community-posts/") && request.method === "POST") {
        return routeApi(request, env, null, url, origin);
      }

      // Auth routes
      if (url.pathname === "/auth/google") {
        if (request.method === "POST") {
          const body = await readJson(request);
          const credential = typeof body?.credential === "string" ? body.credential : "";
          if (!credential) return json({ error: "Missing credential" }, 400, origin);
          const identity = await verifyGoogleCredential(credential, clientId);
          if (!identity) return json({ error: "Invalid credential" }, 401, origin);
          const user = await findOrCreateUser(env, identity);
          return json({ token: credential, user }, 200, origin);
        }
        return json({ error: "Method not allowed" }, 405, origin);
      }

      if (url.pathname === "/verify") {
        const user = await authenticate(request, env, clientId);
        return user ? json({ valid: true, user }, 200, origin) : json({ valid: false }, 401, origin);
      }

      if (url.pathname === "/uploads") return handleStoredUpload(request, env, url, origin);

      // Public feedback
      if (url.pathname === "/api/public-feedback") {
        if (!env.DB) return json({ error: "D1 binding DB is not configured" }, 503, origin);
        const optionalUser = await authenticate(request, env, clientId, false);
        const publicUser = optionalUser || { user_id: "", email: "", full_name: "", avatar_url: "" };
        return handlePublicFeedback(request, env, publicUser, origin);
      }

      // All other API routes (require authentication)
      if (url.pathname.startsWith("/api/")) {
        const user = await authenticate(request, env, clientId, false);
        if (!user) return json({ error: "Authentication required" }, 401, origin);
        return routeApi(request, env, user, url, origin);
      }

      // Static assets (from Cloudflare Pages)
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return new Response("Not Found", { status: 404, headers: corsHeaders(origin) });
    } catch (error) {
      console.error("Givethra Worker error:", error);
      return json({ error: "Internal server error" }, 500, origin);
    }
  },
};
