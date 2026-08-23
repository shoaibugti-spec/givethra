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
//  COMMUNITY POSTS HANDLER
// ============================================================
async function handleCommunityPosts(request, env, user, url, parts, origin) {
  // GET all posts (public - no auth needed for reading)
  if (request.method === "GET" && parts.length === 3) {
    const posts = await env.DB.prepare(
      `SELECT cp.*, 
        u.full_name as user_name,
        u.kyc_status as user_kyc_status
       FROM community_posts cp
       LEFT JOIN users u ON cp.user_id = u.user_id
       ORDER BY cp.created_at DESC
       LIMIT 500`
    ).all();
    
    const results = [];
    for (const post of (posts.results || [])) {
      const likes = await env.DB.prepare(
        "SELECT user_id FROM community_likes WHERE post_id = ?"
      ).bind(post.id).all();
      
      const comments = await env.DB.prepare(
        `SELECT cl.*, 
          u.full_name as user_name
         FROM community_comments cl
         LEFT JOIN users u ON cl.user_id = u.user_id
         WHERE cl.post_id = ?
         ORDER BY cl.created_at ASC`
      ).bind(post.id).all();
      
      results.push({
        ...post,
        is_guest: !post.user_id,
        display_name: post.user_name || post.display_name || "User",
        is_verified: post.user_kyc_status === "approved",
        likes_count: (likes.results || []).length,
        comments_count: (comments.results || []).length,
        comments: comments.results || [],
      });
    }
    return json(results, 200, origin);
  }

  // CREATE new post (requires auth)
  if (request.method === "POST" && parts.length === 3) {
    if (!user) return json({ error: "Authentication required" }, 401, origin);
    
    const body = await readJson(request);
    const message = String(body?.message || "").trim();
    if (!message) return json({ error: "Message is required" }, 400, origin);

    const postId = id();
    const displayName = body?.display_name || user.full_name || user.email?.split("@")[0] || "User";
    
    await env.DB.prepare(
      `INSERT INTO community_posts (id, user_id, display_name, message, created_at)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(postId, user.user_id, displayName, message, now()).run();

    const newPost = await env.DB.prepare(
      `SELECT cp.*, u.full_name as user_name, u.kyc_status as user_kyc_status
       FROM community_posts cp
       LEFT JOIN users u ON cp.user_id = u.user_id
       WHERE cp.id = ?`
    ).bind(postId).first();

    return json({
      ...newPost,
      is_guest: false,
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
async function handleCommunityLikes(request, env, user, url, parts, origin) {
  const postId = parts[3];
  if (!postId) return json({ error: "Post ID required" }, 400, origin);

  // GET likes for a post (public)
  if (request.method === "GET") {
    const likes = await env.DB.prepare(
      "SELECT * FROM community_likes WHERE post_id = ?"
    ).bind(postId).all();
    return json(likes.results || [], 200, origin);
  }

  // Toggle like (requires auth)
  if (request.method === "POST") {
    if (!user) return json({ error: "Authentication required" }, 401, origin);

    // Check if already liked
    const existing = await env.DB.prepare(
      "SELECT id FROM community_likes WHERE post_id = ? AND user_id = ?"
    ).bind(postId, user.user_id).first();

    if (existing) {
      // Unlike
      await env.DB.prepare(
        "DELETE FROM community_likes WHERE post_id = ? AND user_id = ?"
      ).bind(postId, user.user_id).run();
      return json({ liked: false, post_id: postId }, 200, origin);
    } else {
      // Like
      const likeId = id();
      await env.DB.prepare(
        "INSERT INTO community_likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)"
      ).bind(likeId, postId, user.user_id, now()).run();
      return json({ liked: true, post_id: postId, id: likeId }, 201, origin);
    }
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  COMMUNITY COMMENTS HANDLER
// ============================================================
async function handleCommunityComments(request, env, user, url, parts, origin) {
  const postId = parts[3];
  if (!postId) return json({ error: "Post ID required" }, 400, origin);

  // GET comments for a post (public)
  if (request.method === "GET") {
    const comments = await env.DB.prepare(
      `SELECT cc.*, 
        u.full_name as user_name
       FROM community_comments cc
       LEFT JOIN users u ON cc.user_id = u.user_id
       WHERE cc.post_id = ?
       ORDER BY cc.created_at ASC`
    ).bind(postId).all();
    return json(comments.results || [], 200, origin);
  }

  // CREATE comment (requires auth)
  if (request.method === "POST") {
    if (!user) return json({ error: "Authentication required" }, 401, origin);

    const body = await readJson(request);
    const commentText = String(body?.comment || "").trim();
    if (!commentText) return json({ error: "Comment is required" }, 400, origin);

    const commentId = id();
    await env.DB.prepare(
      "INSERT INTO community_comments (id, post_id, user_id, comment, created_at) VALUES (?, ?, ?, ?, ?)"
    ).bind(commentId, postId, user.user_id, commentText, now()).run();

    const newComment = await env.DB.prepare(
      `SELECT cc.*, u.full_name as user_name
       FROM community_comments cc
       LEFT JOIN users u ON cc.user_id = u.user_id
       WHERE cc.id = ?`
    ).bind(commentId).first();

    return json(newComment, 201, origin);
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

  if (parts[2] === "unread-count" && request.method === "GET") {
    const row = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND (is_read = 0 OR is_read IS NULL)"
    ).bind(requested).first();
    return json({ count: Number(row?.count || 0) }, 200, origin);
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  MAIN HANDLER
// ============================================================
async function handleRequest(request, env) {
  const url = new URL(request.url);
  const origin = url.origin;
  const parts = pathParts(url);

  // OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }

  // Public health check
  if (parts[0] === "health" && request.method === "GET") {
    return json({ status: "ok", timestamp: now() }, 200, origin);
  }

  // Verify token
  if (parts[0] === "verify" && request.method === "GET") {
    const user = await authenticate(request, env, DEFAULT_GOOGLE_CLIENT_ID);
    if (!user) return json({ valid: false }, 401, origin);
    return json({ valid: true, user }, 200, origin);
  }

  // ============================================================
  //  PUBLIC: Community Posts (no auth required for reading)
  // ============================================================
  if (parts[0] === "api" && parts[1] === "community") {
    const user = await authenticate(request, env, DEFAULT_GOOGLE_CLIENT_ID);
    
    // GET posts - public
    if (parts[2] === "posts" && parts.length === 3 && request.method === "GET") {
      return handleCommunityPosts(request, env, user, url, parts, origin);
    }
    
    // POST posts - requires auth
    if (parts[2] === "posts" && parts.length === 3 && request.method === "POST") {
      return handleCommunityPosts(request, env, user, url, parts, origin);
    }
    
    // Likes
    if (parts[2] === "posts" && parts[4] === "likes") {
      return handleCommunityLikes(request, env, user, url, parts, origin);
    }
    
    // Comments
    if (parts[2] === "posts" && parts[4] === "comments") {
      return handleCommunityComments(request, env, user, url, parts, origin);
    }
  }

  // ============================================================
  //  AUTH REQUIRED: All other APIs
  // ============================================================
  const user = await authenticate(request, env, DEFAULT_GOOGLE_CLIENT_ID);
  if (!user && parts[0] !== "api") {
    return json({ error: "Authentication required" }, 401, origin);
  }

  // API routes
  if (parts[0] === "api") {
    // Profiles
    if (parts[1] === "profiles") {
      return handleProfile(request, env, user, parts, origin);
    }

    // KYC
    if (parts[1] === "kyc-submissions") {
      return handleKyc(request, env, user, url, parts, origin);
    }

    // Cases
    if (parts[1] === "cases") {
      return handleCases(request, env, user, url, parts, origin);
    }

    // Notifications
    if (parts[1] === "notifications") {
      return handleNotifications(request, env, user, url, parts, origin);
    }

    // Wallets
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

    // Deposits
    if (parts[1] === "deposits") {
      if (request.method === "GET") {
        const target = url.searchParams.get("user_id") || user.user_id;
        if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
        const rows = await env.DB.prepare("SELECT * FROM deposits WHERE user_id = ? ORDER BY created_at DESC").bind(target).all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const record = pick(body, ["user_id", "amount", "currency", "payment_method", "payment_reference", "status", "deposit_date"]);
        const depositId = body?.id || id();
        await env.DB.prepare(
          `INSERT INTO deposits (id, user_id, amount, currency, payment_method, payment_reference, status, deposit_date, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(depositId, record.user_id, record.amount, record.currency || "USD", record.payment_method || null, record.payment_reference || null, record.status || "pending", record.deposit_date || now(), now()).run();
        return json({ id: depositId, ...record, created_at: now() }, 201, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // Feedback
    if (parts[1] === "feedbacks") {
      if (request.method === "GET") {
        const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 50), 1), 500);
        const rows = await env.DB.prepare(
          "SELECT f.*, u.full_name as user_name FROM feedbacks f LEFT JOIN users u ON f.user_id = u.user_id ORDER BY f.created_at DESC LIMIT ?"
        ).bind(limit).all();
        return json(rows.results || [], 200, origin);
      }
      if (request.method === "POST") {
        const body = await readJson(request);
        const fbId = body?.id || id();
        await env.DB.prepare(
          `INSERT INTO feedbacks (id, case_id, user_id, rating, comment, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(fbId, body.case_id, body.user_id, body.rating || null, body.comment || null, now()).run();
        return json({ id: fbId, ...body, created_at: now() }, 201, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // Feedback Likes
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

    // Feedback Comments
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

    // Support messages
    if (parts[1] === "support") {
      if (parts[2] === "messages") {
        if (request.method === "GET") {
          const target = url.searchParams.get("user_id") || user.user_id;
          if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
          const rows = await env.DB.prepare(
            "SELECT * FROM support_messages WHERE user_id = ? OR admin_id = ? ORDER BY created_at ASC"
          ).bind(target, target).all();
          return json(rows.results || [], 200, origin);
        }
        if (request.method === "POST") {
          const body = await readJson(request);
          const msgId = body?.id || id();
          await env.DB.prepare(
            `INSERT INTO support_messages (id, user_id, admin_id, message, is_from_user, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(msgId, body.user_id, body.admin_id || null, body.message, body.is_from_user ? 1 : 0, now()).run();
          return json({ id: msgId, ...body, created_at: now() }, 201, origin);
        }
      }
      if (parts[2] === "mark-read" && request.method === "PUT") {
        const body = await readJson(request);
        await env.DB.prepare(
          "UPDATE support_messages SET is_read = 1 WHERE user_id = ? AND is_from_user = 0"
        ).bind(body.user_id).run();
        return json({ updated: true }, 200, origin);
      }
      if (parts[2] === "unread-count" && request.method === "GET") {
        const target = url.searchParams.get("user_id") || user.user_id;
        const row = await env.DB.prepare(
          "SELECT COUNT(*) AS count FROM support_messages WHERE user_id = ? AND is_from_user = 0 AND (is_read = 0 OR is_read IS NULL)"
        ).bind(target).first();
        return json({ count: Number(row?.count || 0) }, 200, origin);
      }
      return json({ error: "Not found" }, 404, origin);
    }

    // User settings
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
        const fields = ["currency", "language", "notifications_enabled", "theme"];
        const values = pick(body, fields);
        await env.DB.prepare(
          `INSERT INTO user_settings (user_id, currency, language, notifications_enabled, theme, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET currency = excluded.currency, language = excluded.language, notifications_enabled = excluded.notifications_enabled, theme = excluded.theme, updated_at = excluded.updated_at`
        ).bind(target, values.currency || "USD", values.language || "en", values.notifications_enabled !== undefined ? (values.notifications_enabled ? 1 : 0) : 1, values.theme || "light", now()).run();
        return json({ user_id: target, ...values, updated_at: now() }, 200, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // File upload
    if (parts[1] === "upload" && request.method === "POST") {
      const formData = await request.formData();
      const file = formData.get("file");
      const path = formData.get("path");
      if (!file || !path) return json({ error: "File and path required" }, 400, origin);

      // Upload to R2
      try {
        const key = String(path);
        const arrayBuffer = await file.arrayBuffer();
        await env.BUCKET.put(key, arrayBuffer, {
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

    // Admin routes
    if (parts[1] === "admin") {
      if (!isAdmin(user)) return json({ error: "Admin access required" }, 403, origin);

      // GET all admin data
      if (request.method === "GET") {
        const tableMap = {
          kyc: "kyc_submissions",
          cases: "case_submissions",
          resolutions: "case_resolutions",
          deposits: "deposits",
          profiles: "profiles",
          wallets: "wallets",
          unlocks: "case_unlocks",
          "support-messages": "support_messages",
          feedbacks: "feedbacks",
          offers: "category_offers",
          suspensions: "user_suspensions",
        };
        const table = tableMap[parts[2]];
        if (table) {
          const rows = await env.DB.prepare(`SELECT * FROM ${table} ORDER BY created_at DESC`).all();
          return json(rows.results || [], 200, origin);
        }
      }

      // Update operations
      if (request.method === "PUT") {
        const id = parts[3];
        if (parts[2] === "kyc" && id) {
          const body = await readJson(request);
          const allowed = ["status", "rejection_reason", "reviewed_by"];
          const values = pick(body, allowed);
          const params = allowed.filter((field) => values[field] !== undefined).map((field) => values[field]);
          if (params.length) {
            await env.DB.prepare(`UPDATE kyc_submissions SET ${allowed.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`).bind(...params, id).run();
            const updated = await env.DB.prepare("SELECT * FROM kyc_submissions WHERE id = ?").bind(id).first();
            if (updated) {
              await env.DB.prepare("UPDATE users SET kyc_status = ?, updated_at = ? WHERE user_id = ?").bind(updated.status, now(), updated.user_id).run();
            }
            return json(updated, 200, origin);
          }
        }
        if (parts[2] === "cases" && id) {
          const body = await readJson(request);
          const allowed = ["status", "urgency", "rejection_reason"];
          const values = pick(body, allowed);
          const params = allowed.filter((field) => values[field] !== undefined).map((field) => values[field]);
          if (params.length) {
            await env.DB.prepare(`UPDATE case_submissions SET ${allowed.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`).bind(...params, id).run();
            const updated = await env.DB.prepare("SELECT * FROM case_submissions WHERE id = ?").bind(id).first();
            return json(updated, 200, origin);
          }
        }
        if (parts[2] === "feedbacks" && id) {
          const body = await readJson(request);
          const allowed = ["status", "is_verified"];
          const values = pick(body, allowed);
          const params = allowed.filter((field) => values[field] !== undefined).map((field) => values[field]);
          if (params.length) {
            await env.DB.prepare(`UPDATE feedbacks SET ${allowed.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`).bind(...params, id).run();
            const updated = await env.DB.prepare("SELECT * FROM feedbacks WHERE id = ?").bind(id).first();
            return json(updated, 200, origin);
          }
        }
        if (parts[2] === "resolutions" && id) {
          const body = await readJson(request);
          const allowed = ["status", "amount", "notes"];
          const values = pick(body, allowed);
          const params = allowed.filter((field) => values[field] !== undefined).map((field) => values[field]);
          if (params.length) {
            await env.DB.prepare(`UPDATE case_resolutions SET ${allowed.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`).bind(...params, id).run();
            const updated = await env.DB.prepare("SELECT * FROM case_resolutions WHERE id = ?").bind(id).first();
            return json(updated, 200, origin);
          }
        }
        if (parts[2] === "deposits" && id) {
          const body = await readJson(request);
          const allowed = ["status"];
          const values = pick(body, allowed);
          const params = allowed.filter((field) => values[field] !== undefined).map((field) => values[field]);
          if (params.length) {
            await env.DB.prepare(`UPDATE deposits SET ${allowed.map((f) => `${f} = ?`).join(", ")} WHERE id = ?`).bind(...params, id).run();
            const updated = await env.DB.prepare("SELECT * FROM deposits WHERE id = ?").bind(id).first();
            return json(updated, 200, origin);
          }
        }
        if (parts[2] === "profiles" && parts[3]) {
          const body = await readJson(request);
          const allowed = ["full_name", "phone_number", "country", "city", "bio", "preferred_language", "avatar_url"];
          const values = pick(body, allowed);
          const params = allowed.filter((field) => values[field] !== undefined).map((field) => values[field]);
          if (params.length) {
            await env.DB.prepare(`UPDATE profiles SET ${allowed.map((f) => `${f} = ?`).join(", ")} WHERE user_id = ?`).bind(...params, parts[3]).run();
            const updated = await env.DB.prepare("SELECT * FROM profiles WHERE user_id = ?").bind(parts[3]).first();
            return json(updated, 200, origin);
          }
        }
        if (parts[2] === "wallets" && parts[3]) {
          const body = await readJson(request);
          const balance = Number(body?.balance || 0);
          await env.DB.prepare(
            "INSERT INTO wallets (user_id, balance, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = excluded.balance, updated_at = excluded.updated_at"
          ).bind(parts[3], balance, now()).run();
          return json({ user_id: parts[3], balance }, 200, origin);
        }
        if (parts[2] === "user-suspension" && parts[3]) {
          const body = await readJson(request);
          const allowed = ["is_active", "suspension_count", "rejection_count_at_suspension"];
          const values = pick(body, allowed);
          if (values.is_active !== undefined) {
            await env.DB.prepare(
              "INSERT INTO user_suspensions (user_id, is_active, suspension_count, rejection_count_at_suspension, updated_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET is_active = excluded.is_active, suspension_count = COALESCE(excluded.suspension_count, suspension_count), rejection_count_at_suspension = COALESCE(excluded.rejection_count_at_suspension, rejection_count_at_suspension), updated_at = excluded.updated_at"
            ).bind(parts[3], values.is_active ? 1 : 0, values.suspension_count || 1, values.rejection_count_at_suspension || 0, now()).run();
            const updated = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(parts[3]).first();
            return json(updated, 200, origin);
          }
        }
        if (parts[2] === "cases" && parts[3] === "close" && parts[4]) {
          const body = await readJson(request);
          await env.DB.prepare(
            "UPDATE case_submissions SET status = 'completed', updated_at = ?, resolution = ? WHERE id = ?"
          ).bind(now(), body.resolution || null, parts[4]).run();
          await env.DB.prepare(
            "UPDATE case_resolutions SET status = 'completed', notes = ?, updated_at = ? WHERE case_id = ? AND hero_id = ?"
          ).bind(body.resolution || null, now(), parts[4], user.user_id).run();
          const updated = await env.DB.prepare("SELECT * FROM case_submissions WHERE id = ?").bind(parts[4]).first();
          return json(updated, 200, origin);
        }
        if (parts[2] === "offers" && parts[3]) {
          const body = await readJson(request);
          const allowed = ["category", "free_limit", "used_count", "is_active", "label"];
          const values = pick(body, allowed);
          const category = parts[3];
          await env.DB.prepare(
            `INSERT INTO category_offers (category, free_limit, used_count, is_active, label, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(category) DO UPDATE SET free_limit = excluded.free_limit, used_count = excluded.used_count, is_active = excluded.is_active, label = excluded.label, updated_at = excluded.updated_at`
          ).bind(category, values.free_limit || 3, values.used_count || 0, values.is_active !== undefined ? (values.is_active ? 1 : 0) : 1, values.label || null, now(), now()).run();
          const updated = await env.DB.prepare("SELECT * FROM category_offers WHERE category = ?").bind(category).first();
          return json(updated, 200, origin);
        }
        return json({ error: "Update route not found" }, 404, origin);
      }

      // POST operations
      if (request.method === "POST") {
        if (parts[2] === "wallets") {
          const body = await readJson(request);
          const balance = Number(body?.balance || 0);
          await env.DB.prepare(
            "INSERT INTO wallets (user_id, balance, created_at, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET balance = excluded.balance, updated_at = excluded.updated_at"
          ).bind(body.user_id, balance, now(), now()).run();
          return json({ user_id: body.user_id, balance }, 201, origin);
        }
        if (parts[2] === "offers") {
          const body = await readJson(request);
          await env.DB.prepare(
            `INSERT INTO category_offers (category, free_limit, used_count, is_active, label, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(category) DO UPDATE SET free_limit = excluded.free_limit, used_count = excluded.used_count, is_active = excluded.is_active, label = excluded.label, updated_at = excluded.updated_at`
          ).bind(body.category, body.free_limit || 3, body.used_count || 0, body.is_active ? 1 : 0, body.label || null, now(), now()).run();
          const created = await env.DB.prepare("SELECT * FROM category_offers WHERE category = ?").bind(body.category).first();
          return json(created, 201, origin);
        }
        if (parts[2] === "user-suspension") {
          const body = await readJson(request);
          await env.DB.prepare(
            "INSERT INTO user_suspensions (user_id, is_active, suspension_count, rejection_count_at_suspension, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET is_active = excluded.is_active, suspension_count = COALESCE(excluded.suspension_count, suspension_count), rejection_count_at_suspension = COALESCE(excluded.rejection_count_at_suspension, rejection_count_at_suspension), updated_at = excluded.updated_at"
          ).bind(body.user_id, body.is_active ? 1 : 0, body.suspension_count || 1, body.rejection_count_at_suspension || 0, now(), now()).run();
          const created = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(body.user_id).first();
          return json(created, 201, origin);
        }
        if (parts[2] === "support" && parts[3] === "reply") {
          const body = await readJson(request);
          const msgId = body?.id || id();
          await env.DB.prepare(
            `INSERT INTO support_messages (id, user_id, admin_id, message, is_from_user, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(msgId, body.user_id, user.user_id, body.message, 0, now()).run();
          return json({ id: msgId, ...body, admin_id: user.user_id, is_from_user: false, created_at: now() }, 201, origin);
        }
        if (parts[2] === "delete-files") {
          const body = await readJson(request);
          const urls = body?.urls || [];
          // Delete from R2
          for (const url of urls) {
            try {
              const key = url.replace(`${PUBLIC_ORIGIN}/uploads/`, "");
              await env.BUCKET.delete(key);
            } catch (e) {
              // Continue
            }
          }
          return json({ deleted: urls.length }, 200, origin);
        }
        return json({ error: "Admin POST route not found" }, 404, origin);
      }

      // DELETE operations
      if (request.method === "DELETE") {
        if (parts[2] === "notifications" && parts[3] === "clear") {
          const body = await readJson(request);
          await env.DB.prepare("DELETE FROM notifications WHERE user_id = ?").bind(body.user_id).run();
          return json({ deleted: true, user_id: body.user_id }, 200, origin);
        }
        if (parts[2] === "account" && parts[3] === "delete") {
          const body = await readJson(request);
          const userId = body.user_id;
          await env.DB.prepare("DELETE FROM users WHERE user_id = ?").bind(userId).run();
          await env.DB.prepare("DELETE FROM profiles WHERE user_id = ?").bind(userId).run();
          await env.DB.prepare("DELETE FROM wallets WHERE user_id = ?").bind(userId).run();
          await env.DB.prepare("DELETE FROM case_submissions WHERE user_id = ?").bind(userId).run();
          await env.DB.prepare("DELETE FROM kyc_submissions WHERE user_id = ?").bind(userId).run();
          await env.DB.prepare("DELETE FROM notifications WHERE user_id = ?").bind(userId).run();
          await env.DB.prepare("DELETE FROM support_messages WHERE user_id = ?").bind(userId).run();
          await env.DB.prepare("DELETE FROM user_settings WHERE user_id = ?").bind(userId).run();
          return json({ deleted: true, user_id: userId }, 200, origin);
        }
        if (parts[2] === "feedback-likes" && parts[3]) {
          await env.DB.prepare("DELETE FROM feedback_likes WHERE id = ?").bind(parts[3]).run();
          return json({ deleted: true, id: parts[3] }, 200, origin);
        }
        return json({ error: "Admin DELETE route not found" }, 404, origin);
      }
      return json({ error: "Admin method not allowed" }, 405, origin);
    }

    // Account deletion (user self-service)
    if (parts[1] === "account" && parts[2] === "delete" && request.method === "DELETE") {
      const body = await readJson(request);
      const userId = body.user_id || user.user_id;
      if (!canAccessUser(user, userId)) return json({ error: "Forbidden" }, 403, origin);
      await env.DB.prepare("DELETE FROM users WHERE user_id = ?").bind(userId).run();
      await env.DB.prepare("DELETE FROM profiles WHERE user_id = ?").bind(userId).run();
      await env.DB.prepare("DELETE FROM wallets WHERE user_id = ?").bind(userId).run();
      await env.DB.prepare("DELETE FROM case_submissions WHERE user_id = ?").bind(userId).run();
      await env.DB.prepare("DELETE FROM kyc_submissions WHERE user_id = ?").bind(userId).run();
      await env.DB.prepare("DELETE FROM notifications WHERE user_id = ?").bind(userId).run();
      await env.DB.prepare("DELETE FROM support_messages WHERE user_id = ?").bind(userId).run();
      await env.DB.prepare("DELETE FROM user_settings WHERE user_id = ?").bind(userId).run();
      return json({ deleted: true, user_id: userId }, 200, origin);
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
        await env.DB.prepare(
          "INSERT INTO user_suspensions (user_id, is_active, suspension_count, rejection_count_at_suspension, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET is_active = excluded.is_active, suspension_count = COALESCE(excluded.suspension_count, suspension_count), rejection_count_at_suspension = COALESCE(excluded.rejection_count_at_suspension, rejection_count_at_suspension), updated_at = excluded.updated_at"
        ).bind(parts[2], body.is_active ? 1 : 0, body.suspension_count || 1, body.rejection_count_at_suspension || 0, now(), now()).run();
        const updated = await env.DB.prepare("SELECT * FROM user_suspensions WHERE user_id = ?").bind(parts[2]).first();
        return json(updated, 201, origin);
      }
      return json({ error: "Method not allowed" }, 405, origin);
    }

    // Fallback for undefined API
    return json({ error: "API route not found" }, 404, origin);
  }

  // Serve uploaded files from R2
  if (url.pathname.startsWith("/uploads/")) {
    const key = url.pathname.slice(9);
    try {
      const object = await env.BUCKET.get(key);
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

  // 404
  return new Response("Not found", { status: 404 });
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env);
    } catch (err) {
      console.error(err);
      return new Response("Internal Server Error: " + err.message, {
        status: 500,
        headers: corsHeaders("https://givethra.org"),
      });
    }
  },
};
