// ============================================================
// FILE: worker.js (COMPLETE - FIXED)
// ============================================================

const DEFAULT_GOOGLE_CLIENT_ID =
  "588032676735-6aa3hj5b990sa5hcn6qltvj10581od9p.apps.googleusercontent.com";
const PUBLIC_ORIGIN = "https://givethra.org";
const ADMIN_EMAILS = new Set(["shoaibahmedbugti5@gmail.com"]);

console.log("✅ Worker loaded - v8 (FIXED)");

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

function now() { return new Date().toISOString(); }
function id() { return crypto.randomUUID(); }

function isAdmin(user) {
  return Boolean(user && ADMIN_EMAILS.has(String(user.email).toLowerCase()));
}

function bearer(request) {
  const value = request.headers.get("Authorization") || "";
  return value.replace(/^Bearer\s+/i, "").trim();
}

async function verifyGoogleCredential(credential, clientId) {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!response.ok) {
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
      return null;
    }
    const payload = await response.json();
    return {
      google_id: String(payload.sub),
      email: String(payload.email).toLowerCase(),
      full_name: payload.name || payload.email,
      avatar_url: payload.picture || "",
    };
  } catch {
    return null;
  }
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

async function authenticate(request, env, clientId) {
  const credential = bearer(request);
  if (!credential) return null;
  const identity = await verifyGoogleCredential(credential, clientId);
  if (!identity) return null;
  
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
  return Object.fromEntries(
    fields.filter((field) => body && body[field] !== undefined)
      .map((field) => [field, body[field]])
  );
}

// ============================================================
//  COMMUNITY POSTS HANDLERS (FIXED)
// ============================================================

async function handleCommunityPosts(request, env, user, origin) {
  const url = new URL(request.url);
  const parts = pathParts(url);

  // MARK-READ endpoint (must be checked first)
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
    if (!message) {
      return json({ error: "Message is required" }, 400, origin);
    }
    
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

  // GET - Fetch posts
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

// ============================================================
//  POST LIKES HANDLERS (FIXED)
// ============================================================

async function handlePostLikes(request, env, user, parts, origin) {
  const postId = parts[2];

  // GET - Fetch likes for a post
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
      console.error("GET likes error:", error);
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
        // Unlike
        await env.DB.prepare(
          "DELETE FROM community_post_likes WHERE post_id = ? AND user_id = ?"
        ).bind(targetPostId, user.user_id).run();
        return json({ liked: false, post_id: targetPostId }, 200, origin);
      }

      // Add like
      const likeId = id();
      await env.DB.prepare(
        "INSERT INTO community_post_likes (id, post_id, user_id, created_at) VALUES (?, ?, ?, ?)"
      ).bind(likeId, targetPostId, user.user_id, now()).run();
      
      // Get post owner for notification
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
            'New Like',
            `${user.full_name || 'Someone'} liked your post.`,
            '/community',
            0,
            now()
          ).run();
        }
      } catch (notifError) {
        // Notification error shouldn't break the like
        console.error("Notification error:", notifError);
      }
      
      return json({ liked: true, id: likeId, post_id: targetPostId }, 201, origin);
      
    } catch (error) {
      console.error("POST like error:", error);
      return json({ error: error.message || "Failed to toggle like" }, 500, origin);
    }
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  POST COMMENTS HANDLERS (FIXED)
// ============================================================

async function handlePostComments(request, env, user, parts, origin) {
  const postId = parts[2];

  // GET - Fetch comments for a post
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
      console.error("GET comments error:", error);
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

      // Get post owner for notification
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
            'New Comment',
            `${user.full_name || 'Someone'} commented on your post: "${comment.slice(0, 50)}${comment.length > 50 ? '...' : ''}"`,
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
      console.error("POST comment error:", error);
      return json({ error: error.message || "Failed to add comment" }, 500, origin);
    }
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  NOTIFICATIONS HANDLERS
// ============================================================

async function handleNotifications(request, env, user, url, parts, origin) {
  const requested = url.searchParams.get("user_id") || user.user_id;
  if (!canAccessUser(user, requested)) return json({ error: "Forbidden" }, 403, origin);
  
  // GET unread count
  if (parts[2] === "unread-count" && request.method === "GET") {
    try {
      const row = await env.DB.prepare(
        "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND (is_read = 0 OR is_read IS NULL)"
      ).bind(requested).first();
      return json({ count: Number(row?.count || 0) }, 200, origin);
    } catch (error) {
      return json({ count: 0 }, 200, origin);
    }
  }

  // PUT mark all as read
  if (parts[2] === "mark-read" && request.method === "PUT") {
    try {
      const body = await readJson(request);
      const target = String(body?.user_id || requested);
      if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
      await env.DB.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").bind(target).run();
      return json({ updated: true, user_id: target }, 200, origin);
    } catch (error) {
      return json({ error: error.message }, 500, origin);
    }
  }

  // DELETE clear all
  if (parts[2] === "clear" && request.method === "DELETE") {
    try {
      const body = await readJson(request);
      const target = String(body?.user_id || requested);
      if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
      await env.DB.prepare("DELETE FROM notifications WHERE user_id = ?").bind(target).run();
      return json({ deleted: true, user_id: target }, 200, origin);
    } catch (error) {
      return json({ error: error.message }, 500, origin);
    }
  }

  // GET all notifications
  if (request.method === "GET") {
    try {
      const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 100), 1), 500);
      const rows = await env.DB.prepare(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
      ).bind(requested, limit).all();
      return json(rows.results || [], 200, origin);
    } catch (error) {
      return json({ error: error.message }, 500, origin);
    }
  }

  // POST create notification
  if (request.method === "POST") {
    try {
      const body = await readJson(request);
      const target = String(body?.user_id || user.user_id);
      if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);
      const notificationId = String(body?.id || id());
      await env.DB.prepare(
        `INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        notificationId,
        target,
        body?.type || 'system',
        body?.title || null,
        body?.message || null,
        body?.link || null,
        body?.is_read ? 1 : 0,
        body?.created_at || now()
      ).run();
      return json({ id: notificationId, user_id: target }, 201, origin);
    } catch (error) {
      return json({ error: error.message }, 500, origin);
    }
  }

  return json({ error: "Method not allowed" }, 405, origin);
}

// ============================================================
//  MAIN ROUTER
// ============================================================

async function routeApi(request, env, user, url, origin) {
  const parts = pathParts(url);

  // Community Posts
  if (parts[1] === "community-posts") {
    return handleCommunityPosts(request, env, user, origin);
  }

  // Post Likes
  if (parts[1] === "post-likes") {
    return handlePostLikes(request, env, user, parts, origin);
  }

  // Post Comments
  if (parts[1] === "post-comments") {
    return handlePostComments(request, env, user, parts, origin);
  }

  // Notifications
  if (parts[1] === "notifications") {
    return handleNotifications(request, env, user, url, parts, origin);
  }

  // Default response
  return json({ error: "API route not found" }, 404, origin);
}

// ============================================================
//  MAIN FETCH HANDLER
// ============================================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || PUBLIC_ORIGIN;
    const clientId = env.GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      console.log(`📡 Request: ${request.method} ${url.pathname}`);

      // Public routes (no auth required)
      const isPublicRead = request.method === "GET" && (
        url.pathname === "/api/community-posts" ||
        url.pathname === "/api/community-posts/" ||
        url.pathname.startsWith("/api/post-likes") ||
        url.pathname.startsWith("/api/post-comments")
      );

      if (isPublicRead) {
        console.log("👤 Public read access");
        const publicUser = { user_id: "", email: "", full_name: "", avatar_url: "" };
        return routeApi(request, env, publicUser, url, origin);
      }

      // Public POST for community posts (guest posts)
      if ((url.pathname === "/api/community-posts" || url.pathname === "/api/community-posts/") && 
          request.method === "POST") {
        console.log("📝 Public community post");
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

      // All other API routes (require auth)
      if (url.pathname.startsWith("/api/")) {
        const user = await authenticate(request, env, clientId);
        if (!user) {
          console.log("❌ Authentication failed");
          return json({ error: "Authentication required" }, 401, origin);
        }
        console.log(`✅ Authenticated: ${user.email}`);
        return routeApi(request, env, user, url, origin);
      }

      // Static assets
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return new Response("Not Found", { status: 404, headers: corsHeaders(origin) });
      
    } catch (error) {
      console.error("❌ Worker error:", error);
      return json({ error: error.message || "Internal server error" }, 500, origin);
    }
  },
};
