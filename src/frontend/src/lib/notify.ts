// src/frontend/src/lib/notify.ts
// Replaces Supabase calls with Cloudflare Worker API calls

import {
  createNotification,
  checkNotificationExists,
} from "@/lib/api";

/**
 * Send a notification to a user
 * @param userId - The ID of the user to notify
 * @param type - Notification type (e.g., 'guide', 'update')
 * @param title - Notification title
 * @param message - Optional message
 * @param link - Optional link
 */
export async function sendNotification(
  userId: string,
  type: string,
  title: string,
  message?: string,
  link?: string
) {
  try {
    await createNotification({
      user_id: userId,
      type,
      title,
      message: message || null,
      link: link || null,
      is_read: false,
    });
  } catch (e) {
    console.error("notify error", e);
  }
}

/**
 * Send a guide notification only once per user/type
 * Checks if a notification of the same type already exists before inserting.
 */
export async function sendGuideOnce(
  userId: string,
  type: string,
  title: string,
  message?: string,
  link?: string
) {
  try {
    // Check if a notification of this type already exists for this user
    const exists = await checkNotificationExists(userId, type);
    if (exists) return; // already sent

    // Insert the new notification
    await createNotification({
      user_id: userId,
      type,
      title,
      message: message || null,
      link: link || null,
      is_read: false,
    });
  } catch (e) {
    console.error("guide notify error", e);
  }
}
