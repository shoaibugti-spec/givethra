// src/frontend/src/lib/api.ts
// Cloudflare Worker API client – all backend calls go through this file

// Use the public custom domain so browser requests are not sent through the
// Cloudflare Access-protected workers.dev hostname.
const WORKER_URL =
  typeof window !== "undefined" ? window.location.origin : "https://givethra.org";

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

// Stable anonymous identity for public feedback interactions. It contains no
// personal information and only keeps a guest's like/comment state consistent.
export function getGuestId(): string {
  const key = "givethra_guest_id";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const randomId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, randomId);
    return randomId;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

// Helper to build request headers with authorization
function headers(): HeadersInit {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readArrayResponse(res: Response): Promise<any[]> {
  const data = await res.json().catch(() => null);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

// ---------- AUTH ----------
export async function verifyToken(): Promise<{ valid: boolean; user?: any }> {
  const token = getAuthToken();
  if (!token) return { valid: false };
  const res = await fetch(`${WORKER_URL}/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ---------- CASES ----------
export async function getApprovedCases() {
  const res = await fetch(`${WORKER_URL}/api/cases/approved`, { headers: headers() });
  return readArrayResponse(res);
}

export async function getCasesByUser(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/cases?user_id=${userId}`, { headers: headers() });
  return readArrayResponse(res);
}

export async function getCaseById(id: string) {
  const res = await fetch(`${WORKER_URL}/api/cases/${id}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to load case details"); // if (!res.ok) throw new Error(data?.error || "Failed to load case details")
  return data;
}

export async function getCasesByIds(ids: string[]) {
  if (!ids.length) return [];
  const res = await fetch(
    `${WORKER_URL}/api/cases/by-ids?ids=${ids.join(",")}`,
    { headers: headers() }
  );
  return readArrayResponse(res);
}

export async function insertCaseSubmission(data: any) {
  const res = await fetch(`${WORKER_URL}/api/cases`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return readApiResponse(res);
}

export async function getCaseCounts(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/cases/counts?user_id=${userId}`, {
    headers: headers(),
  });
  return res.json();
}

export async function getCategoryCounts() {
  const res = await fetch(`${WORKER_URL}/api/cases/category-counts`, { headers: headers() });
  return res.json();
}

// ---------- CASE UNLOCKS ----------
export async function getCaseUnlock(
  caseId: string,
  heroId: string,
  paymentType: "full" | "partial" | "media" = "full"
) {
  const res = await fetch(
    `${WORKER_URL}/api/case-unlocks?case_id=${caseId}&hero_id=${heroId}&payment_type=${paymentType}`,
    { headers: headers() }
  );
  const data = await readArrayResponse(res);
  return data[0] || null;
}

export async function getUserUnlockCount(userId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/case-unlocks/count?hero_id=${userId}`,
    { headers: headers() }
  );
  const data = await res.json();
  return data.count ?? 0;
}

export async function getUnlockCount(userId: string) {
  return getUserUnlockCount(userId);
}

export async function getUserSuspension(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/user-suspension/${userId}`, {
    headers: headers(),
  });
  if (res.status === 404) return null;
  return res.json();
}

export async function upsertUserSuspension(data: Record<string, unknown>) {
  const userId = String(data.user_id || "").trim();
  if (!userId) throw new Error("A user ID is required to update suspension status");
  const res = await fetch(`${WORKER_URL}/api/user-suspension/${encodeURIComponent(userId)}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result?.error || `Suspension update failed (${res.status})`);
  return result;
}

export async function getCategoryOffer(category: string) {
  const res = await fetch(
    `${WORKER_URL}/api/offers?category=${encodeURIComponent(category)}`,
    { headers: headers() }
  );
  const data = await res.json();
  return Array.isArray(data) ? data[0] || null : data || null;
}

export async function getOfferClaimCount(userId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/offer-claims/count?user_id=${encodeURIComponent(userId)}`,
    { headers: headers() }
  );
  const data = await res.json();
  return typeof data === "number" ? data : data?.count ?? 0;
}

export async function insertOfferClaim(data: Record<string, unknown>) {
  const res = await fetch(`${WORKER_URL}/api/offer-claims`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCategoryOfferUsage(category: string, usedCount: number) {
  const res = await fetch(`${WORKER_URL}/api/offers/usage`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ category, used_count: usedCount }),
  });
  return res.json();
}

export async function getCaseUnlocksByHero(heroId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/case-unlocks?hero_id=${heroId}`,
    { headers: headers() }
  );
  return readArrayResponse(res);
}

export async function insertCaseUnlock(data: any) {
  const res = await fetch(`${WORKER_URL}/api/case-unlocks`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return readApiResponse(res);
}

// ---------- CASE RESOLUTIONS ----------
export async function getCaseResolutions(caseId: string, heroId?: string) {
  let url = `${WORKER_URL}/api/case-resolutions?case_id=${caseId}`;
  if (heroId) url += `&hero_id=${heroId}`;
  const res = await fetch(url, { headers: headers() });
  return readArrayResponse(res);
}

export async function getCaseResolutionsByHero(heroId: string) {
  const res = await fetch(`${WORKER_URL}/api/case-resolutions?hero_id=${encodeURIComponent(heroId)}`, { headers: headers() });
  return readArrayResponse(res);
}

export async function insertCaseResolution(data: any) {
  const res = await fetch(`${WORKER_URL}/api/case-resolutions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return readApiResponse(res);
}

export async function updateCaseResolution(id: string, data: any) {
  const res = await fetch(`${WORKER_URL}/api/case-resolutions/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// ---------- KYC SUBMISSIONS ----------
export async function getKycSubmission(userId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/kyc-submissions?user_id=${userId}&limit=1`,
    { headers: headers() }
  );
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `KYC status request failed (${res.status})`);
  const rows = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  return rows[0] || null;
}

export async function insertKycSubmission(data: any) {
  const res = await fetch(`${WORKER_URL}/api/kyc-submissions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateKycSubmission(id: string, data: any) {
  const res = await fetch(`${WORKER_URL}/api/kyc-submissions/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// ---------- PROFILES ----------
async function readApiResponse<T = any>(res: Response): Promise<T> {
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = typeof payload?.error === "string" ? payload.error : `Request failed (HTTP ${res.status}).`;
    throw new Error(message);
  }
  return payload as T;
}

export async function getProfile(userId: string, profileRole?: "hero" | "requester" | null) {
  const query = profileRole ? `?profile_role=${encodeURIComponent(profileRole)}` : "";
  const res = await fetch(`${WORKER_URL}/api/profiles/${userId}${query}`, {
    headers: headers(),
    cache: "no-store",
  });
  return readApiResponse(res);
}

export async function updateProfile(userId: string, data: any, profileRole?: "hero" | "requester" | null) {
  const query = profileRole ? `?profile_role=${encodeURIComponent(profileRole)}` : "";
  const res = await fetch(`${WORKER_URL}/api/profiles/${userId}${query}`, {
    method: "PUT",
    headers: headers(),
    cache: "no-store",
    body: JSON.stringify(data),
  });
  return readApiResponse(res);
}

// ---------- WALLET ----------
export async function getUserSupports(userId: string): Promise<{ user_id: string; supports: number; creditsFromSupports: number }> {
  const res = await fetch(`${WORKER_URL}/api/user-supports/${encodeURIComponent(userId)}`, { headers: headers(), cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Support balance request failed (${res.status})`);
  return { user_id: String(data?.user_id || userId), supports: Number(data?.supports || 0), creditsFromSupports: Number(data?.creditsFromSupports || 0) };
}

export async function getWallet(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/wallets/${userId}`, { headers: headers() });
  return res.json();
}

export async function updateWalletBalance(userId: string, newBalance: number) {
  const res = await fetch(`${WORKER_URL}/api/wallets/${userId}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ balance: newBalance }),
  });
  return res.json();
}

// ---------- DEPOSITS ----------
export async function getDeposits(userId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/deposits?user_id=${userId}`,
    { headers: headers() }
  );
  return res.json();
}

export async function insertDeposit(data: any) {
  const res = await fetch(`${WORKER_URL}/api/deposits`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// ============================================================
//  TRANSACTIONS
// ============================================================
export async function getTransactions(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/transactions/${userId}`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

// ---------- PUBLIC IMPACT WALLS ----------
export async function getHeroesWall(limit = 24) {
  const res = await fetch(`${WORKER_URL}/api/heroes-wall?limit=${limit}`, { headers: headers(), cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Heroes Wall request failed (${res.status})`);
  return data;
}

export async function getCommunityPosts(tab: "for-you" | "my-heroes" | "my-posts" = "for-you") {
  const res = await fetch(`${WORKER_URL}/api/community/posts?tab=${encodeURIComponent(tab)}`, {
    headers: { ...headers(), "X-Guest-ID": getGuestId() },
    cache: "no-store",
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Community posts request failed (${res.status})`);
  return Array.isArray(data) ? data : Array.isArray(data?.posts) ? data.posts : [];
}

export async function followUser(targetUserId: string) {
  const res = await fetch(`${WORKER_URL}/api/follow`, { method: "POST", headers: headers(), body: JSON.stringify({ target_user_id: targetUserId }) });
  return readApiResponse(res);
}

export async function unfollowUser(targetUserId: string) {
  const res = await fetch(`${WORKER_URL}/api/follow`, { method: "DELETE", headers: headers(), body: JSON.stringify({ target_user_id: targetUserId }) });
  return readApiResponse(res);
}

export async function supportPost(postId: string) {
  const res = await fetch(`${WORKER_URL}/api/support`, {
    method: "POST",
    headers: { ...headers(), "X-Guest-ID": getGuestId() },
    body: JSON.stringify({ post_id: postId, guest_id: getGuestId() }),
  });
  return readApiResponse(res);
}

export async function getFollowStatus(targetUserId: string) {
  const res = await fetch(`${WORKER_URL}/api/follow/status?target=${encodeURIComponent(targetUserId)}`, { headers: headers() });
  return readApiResponse(res);
}

export async function getFollowCounts(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/follow/count?user=${encodeURIComponent(userId)}`, { headers: headers() });
  return readApiResponse(res);
}

export async function getFollowList(userId: string, type: "heroes" | "requesters") {
  const res = await fetch(`${WORKER_URL}/api/follow/list?user=${encodeURIComponent(userId)}&type=${type}`, { headers: headers(), cache: "no-store" });
  return readApiResponse(res);
}

export async function removeRequester(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/follow/requester`, { method: "DELETE", headers: headers(), body: JSON.stringify({ target_user_id: userId }) });
  return readApiResponse(res);
}

export async function pinCommunityPost(postId: string) {
  const res = await fetch(`${WORKER_URL}/api/community/posts/pin`, { method: "POST", headers: headers(), body: JSON.stringify({ post_id: postId }) });
  return readApiResponse(res);
}

export async function createCommunityPost(data: Record<string, unknown>) {
  const payload = { ...data, guest_id: data.guest_id || getGuestId() };
  const res = await fetch(`${WORKER_URL}/api/community/posts`, {
    method: "POST",
    headers: { ...headers(), "X-Guest-ID": String(payload.guest_id) },
    body: JSON.stringify(payload),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result?.error || `Community post request failed (${res.status})`);
  return result;
}

export async function toggleLike(postId: string) {
  const res = await fetch(`${WORKER_URL}/api/community/posts/${encodeURIComponent(postId)}/likes`, {
    method: "POST",
    headers: { ...headers(), "X-Guest-ID": getGuestId() },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Like request failed (${res.status})`);
  return data;
}

export async function getPostComments(postId: string) {
  const res = await fetch(`${WORKER_URL}/api/community/posts/${encodeURIComponent(postId)}/comments`, { headers: headers() });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || `Comments request failed (${res.status})`);
  return Array.isArray(data) ? data : Array.isArray(data?.comments) ? data.comments : [];
}

export async function addComment(postId: string, comment: string) {
  const res = await fetch(`${WORKER_URL}/api/community/posts/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    headers: { ...headers(), "X-Guest-ID": getGuestId() },
    body: JSON.stringify({ comment, guest_id: getGuestId() }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Comment request failed (${res.status})`);
  return data;
}

// ---------- FEEDBACK ----------
export async function getFeedbacks(limit = 50) {
  const res = await fetch(
    `${WORKER_URL}/api/feedbacks?limit=${limit}`,
    { headers: headers() }
  );
  return res.json();
}

export async function getLikes() {
  const res = await fetch(`${WORKER_URL}/api/feedback-likes`, { headers: headers() });
  return res.json();
}

export async function getComments() {
  const res = await fetch(`${WORKER_URL}/api/feedback-comments`, { headers: headers() });
  return res.json();
}

export async function toggleFeedbackLike(feedbackId: string, userId: string, likeId?: string) {
  if (likeId) {
    const res = await fetch(`${WORKER_URL}/api/feedback-likes/${likeId}`, {
      method: "DELETE",
      headers: headers(),
    });
    const data = await res.json();
    return { deleted: true, id: likeId };
  } else {
    const res = await fetch(`${WORKER_URL}/api/feedback-likes`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ feedback_id: feedbackId, user_id: userId }),
    });
    const data = await res.json();
    return { created: data };
  }
}

export async function createComment(data: any) {
  const res = await fetch(`${WORKER_URL}/api/feedback-comments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getFeedbackForCase(caseId: string, userId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/feedbacks?case_id=${caseId}&user_id=${userId}`,
    { headers: headers() }
  );
  const data = await res.json();
  return data[0] || null;
}

export async function insertFeedback(data: any) {
  const res = await fetch(`${WORKER_URL}/api/feedbacks`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result?.error || `Feedback submission failed (${res.status})`);
  return result;
}

// ---------- NOTIFICATIONS ----------
export async function getNotifications(userId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/notifications?user_id=${userId}`,
    { headers: headers() }
  );
  return res.json();
}

export async function getUnreadNotificationsCount(userId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/notifications/unread-count?user_id=${userId}`,
    { headers: headers() }
  );
  const data = await res.json();
  return data.count ?? 0;
}

export async function markAllNotificationsAsRead(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/notifications/mark-read`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ user_id: userId }),
  });
  return res.json();
}

export async function deleteAllNotifications(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/notifications/clear`, {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({ user_id: userId }),
  });
  return res.json();
}

export async function createNotification(data: any) {
  const res = await fetch(`${WORKER_URL}/api/notifications`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function checkNotificationExists(userId: string, type: string) {
  const result = await getNotifications(userId);
  return Array.isArray(result) && result.some((n: any) => n.type === type);
}

// ---------- SUPPORT CHAT ----------
export async function getSupportMessages(userId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/support/messages?user_id=${userId}`,
    { headers: headers() }
  );
  return res.json();
}

export async function sendSupportMessage(data: any) {
  const res = await fetch(`${WORKER_URL}/api/support/messages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  const jsonRes = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(jsonRes.error || `Failed to send message (${res.status})`);
  }
  return jsonRes;
}

export async function markSupportMessagesAsRead(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/support/mark-read`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ user_id: userId }),
  });
  return res.json();
}

export async function getUnreadChatMessagesCount(userId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/support/unread-count?user_id=${userId}`,
    { headers: headers() }
  );
  const data = await res.json();
  return data.count ?? 0;
}

// ---------- USER SETTINGS ----------
export async function getUserSettings(userId: string) {
  const res = await fetch(
    `${WORKER_URL}/api/user-settings/${userId}`,
    { headers: headers() }
  );
  return res.json();
}

export async function updateUserSettings(userId: string, data: any) {
  const res = await fetch(`${WORKER_URL}/api/user-settings/${userId}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// ---------- FILE UPLOAD ----------
export async function uploadFileToStorage(file: File, path: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("path", path);
  const res = await fetch(`${WORKER_URL}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Upload failed");
  }
  const data = await res.json();
  if (!data.url) throw new Error("Upload failed – no URL returned");
  return data.url;
}

// ---------- ADMIN APIs ----------
export async function adminGetAllKyc() {
  const res = await fetch(`${WORKER_URL}/api/admin/kyc`, { headers: headers() });
  return res.json();
}

export async function adminGetAllCases() {
  const res = await fetch(`${WORKER_URL}/api/admin/cases`, { headers: headers() });
  return res.json();
}

export async function adminGetAllResolutions() {
  const res = await fetch(`${WORKER_URL}/api/admin/resolutions`, { headers: headers() });
  return res.json();
}

export async function adminGetAllDeposits() {
  const res = await fetch(`${WORKER_URL}/api/admin/deposits`, { headers: headers() });
  return res.json();
}

export async function adminGetAllProfiles() {
  const res = await fetch(`${WORKER_URL}/api/admin/profiles`, { headers: headers() });
  return res.json();
}

export async function adminGetAllWallets() {
  const res = await fetch(`${WORKER_URL}/api/admin/wallets`, { headers: headers() });
  return res.json();
}

export async function adminGetAllUnlocks() {
  const res = await fetch(`${WORKER_URL}/api/admin/unlocks`, { headers: headers() });
  return res.json();
}

export async function adminGetAllSupportMessages() {
  const res = await fetch(`${WORKER_URL}/api/admin/support-messages`, { headers: headers() });
  return res.json();
}

export async function adminSendSupportReply(data: Record<string, unknown>) {
  const res = await fetch(`${WORKER_URL}/api/admin/support/reply`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result?.error || "Failed to send support reply");
  return result;
}

export async function adminMarkSupportMessagesAsRead(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/admin/support/mark-read`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ user_id: userId }),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result?.error || "Failed to mark support messages as read");
  return result;
}

export async function adminGetAllFeedbacks() {
  const res = await fetch(`${WORKER_URL}/api/admin/feedbacks`, { headers: headers() });
  return res.json();
}

export async function adminBroadcastNotification(data: Record<string, unknown>) {
  const res = await fetch(`${WORKER_URL}/api/admin/notifications/broadcast`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(result?.error || "Failed to broadcast notification");
  return result;
}

export async function adminGetAllOffers() {
  const res = await fetch(`${WORKER_URL}/api/admin/offers`, { headers: headers() });
  return res.json();
}

export async function adminGetAllSuspensions() {
  const res = await fetch(`${WORKER_URL}/api/admin/suspensions`, { headers: headers() });
  return res.json();
}

export async function adminUpdateKyc(id: string, data: any) {
  const res = await fetch(`${WORKER_URL}/api/admin/kyc/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminUpdateCase(id: string, data: any) {
  const res = await fetch(`${WORKER_URL}/api/admin/cases/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminUpdateFeedback(id: string, data: any) {
  const res = await fetch(`${WORKER_URL}/api/admin/feedbacks/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminUpdateResolution(id: string, data: any) {
  const res = await fetch(`${WORKER_URL}/api/admin/resolutions/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminUpdateDeposit(id: string, data: any) {
  const res = await fetch(`${WORKER_URL}/api/admin/deposits/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminCloseCase(id: string, data: any) {
  const res = await fetch(`${WORKER_URL}/api/admin/cases/${id}/close`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminGetUserSuspension(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/admin/user-suspension/${userId}`, {
    headers: headers(),
  });
  return res.json();
}

export async function adminUpsertUserSuspension(data: any) {
  const res = await fetch(`${WORKER_URL}/api/admin/user-suspension`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminUpdateProfile(userId: string, data: any) {
  const res = await fetch(`${WORKER_URL}/api/admin/profiles/${userId}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminGetWalletsByUser(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/admin/wallets?user_id=${userId}`, {
    headers: headers(),
  });
  const data = await res.json();
  return data[0] || null;
}

export async function adminUpsertWallet(userId: string, balance: number) {
  const res = await fetch(`${WORKER_URL}/api/admin/wallets`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ user_id: userId, balance }),
  });
  return res.json();
}

export async function adminGetCategoryOffer(category: string) {
  const res = await fetch(`${WORKER_URL}/api/admin/offers?category=${category}`, {
    headers: headers(),
  });
  const data = await res.json();
  return data[0] || null;
}

export async function adminUpsertCategoryOffer(data: any) {
  const res = await fetch(`${WORKER_URL}/api/admin/offers`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function adminDeleteFiles(urls: string[]) {
  const res = await fetch(`${WORKER_URL}/api/admin/delete-files`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ urls }),
  });
  return res.json();
}

// ---------- USER DATA (for privacy page) ----------
export async function getUserCases(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/cases?user_id=${userId}`, {
    headers: headers(),
  });
  return res.json();
}

export async function getUserKycSubmissions(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/kyc-submissions?user_id=${userId}`, {
    headers: headers(),
  });
  return res.json();
}

export async function getUserDeposits(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/deposits?user_id=${userId}`, {
    headers: headers(),
  });
  return res.json();
}

export async function deleteUserAccount(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/account/delete`, {
    method: "DELETE",
    headers: headers(),
    body: JSON.stringify({ user_id: userId }),
  });
  return res.json();
}

// ========== EXTRA FUNCTIONS FOR userGuide.ts ==========
export async function getKycStatus(userId: string): Promise<{ status: string }> {
  try {
    const submission = await getKycSubmission(userId);
    return { status: String(submission?.status || 'none').trim().toLowerCase() };
  } catch {
    return { status: 'unknown' };
  }
}

export async function getHelpCount(userId: string): Promise<number> {
  try {
    const unlocks = await getCaseUnlocksByHero(userId);
    return Array.isArray(unlocks) ? unlocks.length : 0;
  } catch {
    return 0;
  }
}

export async function getCaseCount(userId: string): Promise<number> {
  try {
    const counts = await getCaseCounts(userId);
    return counts?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function getChatMessages(userId: string) {
  const res = await fetch(`${WORKER_URL}/api/support/messages?user_id=${userId}`, {
    headers: headers(),
  });
  return res.json();
}

export async function sendChatMessage(data: any) {
  return sendSupportMessage(data);
}

// ---------- ONBOARDING STATUS ----------
export async function getOnboardingStatus(userId: string): Promise<boolean> {
  const res = await fetch(`${WORKER_URL}/api/onboarding-status/${userId}`, {
    headers: headers(),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data.completed === true;
}

export async function setOnboardingStatus(userId: string, completed: boolean): Promise<void> {
  const res = await fetch(`${WORKER_URL}/api/onboarding-status/${userId}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Failed to update onboarding status");
}
