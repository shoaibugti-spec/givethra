import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import assert from "node:assert/strict";
import { handleHelpMe, helpmeDailyCleanup, helpmeLeaderboardRows, helpmeWallRows } from "./helpme.js";

const sql = new DatabaseSync(":memory:");
sql.exec(`CREATE TABLE users(user_id TEXT PRIMARY KEY,email TEXT,full_name TEXT,avatar_url TEXT,kyc_status TEXT);
CREATE TABLE profiles(user_id TEXT PRIMARY KEY,full_name TEXT,avatar_url TEXT,username TEXT);
CREATE TABLE community_posts(id TEXT PRIMARY KEY,user_id TEXT,display_name TEXT,message TEXT,created_at TEXT);
CREATE TABLE community_post_likes(post_id TEXT);CREATE TABLE community_post_comments(post_id TEXT);
CREATE TABLE case_resolutions(case_id TEXT,hero_id TEXT,amount_paid REAL,paid_to TEXT,status TEXT,admin_confirmed INTEGER,completed_at TEXT,admin_confirmed_at TEXT,submitted_at TEXT);`);
sql.exec(fs.readFileSync("./migrations/0016_helpme.sql", "utf8"));
const stmt = (q) => { let b = []; const o = {
  bind: (...a) => { b = a.map((x) => (x === undefined ? null : x)); return o; },
  first: async () => sql.prepare(q).get(...b) ?? null,
  all: async () => ({ results: sql.prepare(q).all(...b) }),
  run: async () => { const r = sql.prepare(q).run(...b); return { meta: { changes: Number(r.changes) } }; },
  _exec: () => { const r = sql.prepare(q).run(...b); return { meta: { changes: Number(r.changes) } }; } }; return o; };
const DB = { prepare: stmt, batch: async (list) => { sql.exec("BEGIN"); try { const out = list.map((s) => s._exec()); sql.exec("COMMIT"); return out; } catch (e) { sql.exec("ROLLBACK"); throw e; } } };
const store = new Map();
const R2 = {
  put: async (k, body, opts) => { const chunks = []; if (body && body.getReader) { const r = body.getReader(); for (;;) { const { value, done } = await r.read(); if (done) break; chunks.push(value); } } else if (body) chunks.push(body); store.set(k, { data: Buffer.concat(chunks.map((c) => Buffer.from(c))), ct: opts?.httpMetadata?.contentType }); },
  get: async (k, o) => { const x = store.get(k); if (!x) return null; return { size: x.data.length, body: new Blob([x.data]).stream(), writeHttpMetadata() {}, httpEtag: "e", range: o?.range?.get?.("range") ? { offset: 0, length: 4 } : undefined }; },
  delete: async (k) => { store.delete(k); },
};
const env = { DB, HELPME_VIDEOS: R2 };
const admin = { user_id: "admin", email: "a@x", kyc_status: "approved" };
let suspended = null;
const h = {
  json: (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json" } }),
  id: () => crypto.randomUUID(), now: () => new Date().toISOString(),
  readJson: async (r) => { try { return await r.json(); } catch { return null; } },
  sendNotification: async () => {}, isAdmin: (u) => u?.email === "a@x",
  publicDisplayName: (v, f) => (v && !String(v).includes("@") ? v : f),
  getActiveSuspension: async () => suspended, suspendedActionResponse: (o) => h.json({ code: "ACCOUNT_SUSPENDED" }, 403),
};
const call = async (user, method, path, body, raw) => {
  const url = new URL("https://givethra.org" + path);
  const init = { method, headers: {} };
  if (raw) { init.body = raw.body; init.headers["Content-Type"] = raw.type; init.headers["Content-Length"] = String(raw.body.length); }
  else if (body) { init.body = JSON.stringify(body); init.headers["Content-Type"] = "application/json"; }
  const res = await handleHelpMe(new Request(url, init), env, {}, user, url, url.pathname.split("/").filter(Boolean), "https://givethra.org", h);
  return { status: res.status, body: await res.json().catch(() => null) };
};
for (const [i, n] of [["u1", "Ali"], ["u2", "Sara"], ["u3", "Omar"], ["u4", "Zed"]]) {
  sql.prepare("INSERT INTO users VALUES (?,?,?,?,?)").run(i, i + "@x", n, null, i === "u4" ? "none" : "approved");
  sql.prepare("INSERT INTO profiles VALUES (?,?,?,?)").run(i, n, null, i);
}
const ali = { user_id: "u1", email: "u1@x", kyc_status: "approved" }, sara = { user_id: "u2", email: "u2@x", kyc_status: "approved" }, omar = { user_id: "u3", email: "u3@x", kyc_status: "approved" }, zed = { user_id: "u4", email: "u4@x", kyc_status: "none" };
const video = Buffer.alloc(2_000_000, 1);

let r = await call(null, "GET", "/api/helpme/config"); assert.equal(r.status, 200); assert.equal(r.body.goal_usd_cents, 210);
r = await call(zed, "GET", "/api/helpme/eligibility"); assert.equal(r.body.code, "KYC_REQUIRED");
r = await call(ali, "POST", "/api/helpme/upload", null, { body: Buffer.alloc(10), type: "image/png" }); assert.equal(r.status, 415);
r = await call(ali, "POST", "/api/helpme/upload", null, { body: Buffer.alloc(7_000_000), type: "video/webm" }); assert.equal(r.status, 413);
r = await call(ali, "POST", "/api/helpme/upload", null, { body: video, type: "video/webm;codecs=vp8" }); assert.equal(r.status, 201);
const uploadId = r.body.upload_id;
const pay = { account_country: "PK", pay_method: "Easypaisa", pay_account_title: "Ali Khan", pay_account_number: "03001234567" };
r = await call(ali, "POST", "/api/helpme/appeals", { upload_id: uploadId, description: "Call me on 03001234567", ...pay }); assert.equal(r.body.code, "CONTACT_IN_DESCRIPTION");
r = await call(ali, "POST", "/api/helpme/appeals", { upload_id: uploadId, description: "I need help with school fees for my kids", ...pay }); assert.equal(r.status, 201); assert.equal(r.body.goal_local, 580); assert.equal(r.body.currency, "PKR");
const appealId = r.body.id;
r = await call(ali, "GET", "/api/helpme/eligibility"); assert.equal(r.body.code, "ACTIVE_APPEAL");
r = await call(ali, "POST", "/api/helpme/upload", null, { body: video, type: "video/webm" }); assert.equal(r.status, 409);
// another user cannot reuse the account
r = await call(sara, "POST", "/api/helpme/upload", null, { body: video, type: "video/mp4" }); const up2 = r.body.upload_id;
r = await call(sara, "POST", "/api/helpme/appeals", { upload_id: up2, description: "Need medicine for my mother", ...pay }); assert.equal(r.body.code, "ACCOUNT_IN_USE");
// not in feed yet
r = await call(null, "GET", "/api/helpme/feed"); assert.equal(r.body.items.length, 0);
r = await call(omar, "GET", `/api/helpme/appeals/${appealId}/payment`); assert.equal(r.status, 404);
r = await call(omar, "GET", `/api/helpme/admin/queue`); assert.equal(r.status, 403);
r = await call(admin, "GET", `/api/helpme/video/${appealId}`); assert.equal(r.status, 200);
r = await call(admin, "GET", `/api/helpme/admin/queue`); assert.equal(r.body.appeals.length, 1);
r = await call(admin, "PUT", `/api/helpme/admin/appeals/${appealId}`, { action: "approve" }); assert.equal(r.status, 200);
r = await call(admin, "PUT", `/api/helpme/admin/appeals/${appealId}`, { action: "approve" }); assert.equal(r.status, 409);
assert.ok([...store.keys()].some((k) => k.startsWith("v/")) && ![...store.keys()].some((k) => k.startsWith("pending/") && k.includes(uploadId)));
r = await call(null, "GET", "/api/helpme/feed"); assert.equal(r.body.items.length, 1); const it = r.body.items[0];
assert.ok(it.video_url.startsWith("/api/helpme/media/v/")); assert.equal(JSON.stringify(it).includes("03001234567"), false); assert.equal(it.percent, 0);
// same-domain video stream: public guest can fetch an approved video, but not a pending/unknown key
{ const u = new URL("https://givethra.org" + it.video_url); const res = await handleHelpMe(new Request(u, { method: "GET", headers: { Range: "bytes=0-3" } }), env, {}, null, u, u.pathname.split("/").filter(Boolean), "https://givethra.org", h); assert.equal(res.status, 206); assert.equal(res.headers.get("Accept-Ranges"), "bytes"); }
{ const u = new URL("https://givethra.org/api/helpme/media/pending/x.mp4"); const res = await handleHelpMe(new Request(u), env, {}, null, u, u.pathname.split("/").filter(Boolean), "https://givethra.org", h); assert.equal(res.status, 404); }
r = await call(null, "GET", `/api/helpme/appeals/${appealId}/payment`); assert.equal(r.status, 401);
r = await call(ali, "GET", `/api/helpme/appeals/${appealId}/payment`); assert.equal(r.status, 400);
r = await call(omar, "GET", `/api/helpme/appeals/${appealId}/payment`); assert.equal(r.status, 200); assert.equal(r.body.account_number, "03001234567"); assert.equal(r.body.remaining_local, 580);
// reactions
r = await call(omar, "POST", `/api/helpme/appeals/${appealId}/pray`); assert.equal(r.body.active, true);
r = await call(omar, "POST", `/api/helpme/appeals/${appealId}/pray`); assert.equal(r.body.active, false);
await call(omar, "POST", `/api/helpme/appeals/${appealId}/pray`);
await call(omar, "POST", `/api/helpme/appeals/${appealId}/repost`);
r = await call(ali, "POST", `/api/helpme/appeals/${appealId}/repost`); assert.equal(r.status, 400);
r = await call(omar, "POST", `/api/helpme/appeals/${appealId}/comments`, { body: "Allah help you" }); assert.equal(r.status, 201);
await call(null, "POST", "/api/helpme/views", { ids: [appealId, appealId] });
r = await call(omar, "GET", "/api/helpme/feed"); assert.deepEqual(r.body.items[0].counts, { prays: 1, comments: 1, reposts: 1, shares: 0, views: 1 }); assert.equal(r.body.items[0].prayed, true);
// help
const proof = "https://givethra.org/uploads/helpme-proofs/u3/a.jpg";
r = await call(omar, "POST", `/api/helpme/appeals/${appealId}/help`, { amount: 700, trx_id: "TX123456", proof_url: proof }); assert.equal(r.body.code, "OVER_REMAINING");
r = await call(omar, "POST", `/api/helpme/appeals/${appealId}/help`, { amount: 100, trx_id: "TX123456", proof_url: "https://evil.com/x.jpg" }); assert.equal(r.body.code, "BAD_PROOF");
r = await call(omar, "POST", `/api/helpme/appeals/${appealId}/help`, { amount: 100, trx_id: "TX123456", proof_url: proof }); assert.equal(r.status, 201); const h1 = r.body.id;
r = await call(sara, "POST", `/api/helpme/appeals/${appealId}/help`, { amount: 480, trx_id: "tx-123456", proof_url: proof }); assert.equal(r.body.code, "TRX_USED");
r = await call(sara, "POST", `/api/helpme/appeals/${appealId}/help`, { amount: 480, trx_id: "ZZ998877", proof_url: proof }); assert.equal(r.status, 201); const h2 = r.body.id;
r = await call(admin, "PUT", `/api/helpme/admin/help/${h1}`, { action: "approve", amount: 100 }); assert.equal(r.status, 200); assert.equal(r.body.appeal_status, "published");
r = await call(admin, "PUT", `/api/helpme/admin/help/${h1}`, { action: "approve" }); assert.equal(r.status, 409);
r = await call(null, "GET", "/api/helpme/feed"); assert.equal(r.body.items[0].percent, 17);
r = await call(admin, "PUT", `/api/helpme/admin/help/${h2}`, { action: "approve", amount: 480 }); assert.equal(r.body.appeal_status, "helped");
r = await call(null, "GET", "/api/helpme/feed?tab=need"); assert.equal(r.body.items.length, 0);
r = await call(null, "GET", "/api/helpme/feed?tab=helped"); assert.equal(r.body.items.length, 1); assert.equal(r.body.items[0].percent, 100); assert.equal(r.body.items[0].helped, true);
// Walls, leaderboard, kindness wall and profile totals
sql.prepare("INSERT INTO case_resolutions VALUES ('c1','old-hero',1000,'user','completed',1,'2026-01-01T00:00:00.000Z',NULL,NULL)").run();
{
  const lb = await helpmeLeaderboardRows(env, 10);
  assert.ok(lb.some((x) => x.user_id === "old-hero" && x.total_amount === 1000), "old case-based heroes stay on the leaderboard");
  const hm = lb.filter((x) => x.user_id !== "old-hero"); assert.ok(hm.length >= 1 && hm.every((x) => x.total_amount > 0 && x.direct_help_count >= 1), "Help Me heroes are ranked");
  const wall = await helpmeWallRows(env, 10); assert.equal(wall.rows.length, 1); assert.equal(wall.rows[0].currency, "PKR"); assert.ok(wall.total_pkr > 0); assert.ok(wall.rows[0].description.length >= 10);
  assert.ok(sql.prepare("SELECT COUNT(*) AS n FROM community_posts WHERE id LIKE 'helpme-help-%'").get().n >= 2, "kindness wall posts were created");
  r = await call(null, "GET", `/api/helpme/stats/${hm[0].user_id}`); assert.equal(r.status, 200); assert.ok(r.body.helped_count >= 1 && r.body.helped_pkr > 0);
}
r = await call(omar, "GET", `/api/helpme/appeals/${appealId}/payment`); assert.equal(r.status, 410);
r = await call(omar, "POST", `/api/helpme/appeals/${appealId}/help`, { amount: 10, trx_id: "NEW99887", proof_url: proof }); assert.equal(r.status, 409);
// cooldown 7 days after help
r = await call(ali, "GET", "/api/helpme/eligibility"); assert.equal(r.body.code, "COOLDOWN"); assert.ok(new Date(r.body.next_allowed_at) > new Date(Date.now() + 6 * 86400000));
r = await call(ali, "GET", "/api/helpme/my"); assert.equal(r.body.helps_received.length, 2);
r = await call(ali, "GET", `/api/helpme/users/u1`); assert.equal(r.body.appeals.length, 1); assert.equal(r.body.reposts.length, 0);
r = await call(sara, "GET", `/api/helpme/users/u3`); assert.equal(r.body.reposts.length, 1);
// reports hide a live appeal; admin restore
sql.prepare("UPDATE helpme_appeals SET status='published', helped_at=NULL WHERE id=?").run(appealId);
for (const u of ["a", "b", "c", "d", "e"]) await call({ user_id: u, email: u + "@x" }, "POST", "/api/helpme/reports", { target_type: "appeal", target_id: appealId, reason: "bad" });
assert.equal(sql.prepare("SELECT status FROM helpme_appeals WHERE id=?").get(appealId).status, "under_review");
r = await call(admin, "PUT", `/api/helpme/admin/appeals/${appealId}`, { action: "restore" }); assert.equal(r.body.status, "published");
// reject deletes video + scrubs account
r = await call(admin, "PUT", `/api/helpme/admin/appeals/${appealId}`, { action: "reject", reason: "Not clear" }); assert.equal(r.body.status, "rejected");
assert.equal([...store.keys()].some((k) => k.startsWith("v/")), false);
assert.equal(sql.prepare("SELECT pay_account_number n FROM helpme_appeals WHERE id=?").get(appealId).n, "");
// rejected user can retry right away (3-day gap does not apply to rejected)
sql.prepare("UPDATE helpme_appeals SET helped_at=NULL").run();
r = await call(ali, "GET", "/api/helpme/eligibility"); assert.equal(r.body.can_post, true);
// expiry cleanup
r = await call(ali, "POST", "/api/helpme/upload", null, { body: video, type: "video/mp4" }); const up3 = r.body.upload_id;
r = await call(ali, "POST", "/api/helpme/appeals", { upload_id: up3, description: "Second appeal for rent help", ...pay }); const a2 = r.body.id;
await call(admin, "PUT", `/api/helpme/admin/appeals/${a2}`, { action: "approve" });
sql.prepare("UPDATE helpme_appeals SET expires_at='2020-01-01T00:00:00.000Z' WHERE id=?").run(a2);
await helpmeDailyCleanup(env);
const x = sql.prepare("SELECT status, pay_account_number n, video_deleted_at d FROM helpme_appeals WHERE id=?").get(a2);
assert.equal(x.status, "expired"); assert.ok(x.d); assert.equal(x.n, ""); assert.equal([...store.keys()].some((k) => k.startsWith("v/")), false);
// orphan upload cleanup
r = await call(sara, "POST", "/api/helpme/upload", null, { body: video, type: "video/mp4" });
sql.prepare("UPDATE helpme_uploads SET created_at='2020-01-01T00:00:00.000Z' WHERE used_appeal_id IS NULL").run();
await helpmeDailyCleanup(env);
assert.equal(store.size, 0);
console.log("ALL HELPME BACKEND TESTS PASSED");
