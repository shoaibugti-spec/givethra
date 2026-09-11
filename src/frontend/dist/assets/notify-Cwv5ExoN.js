import { aP as checkNotificationExists, aQ as createNotification } from "./main-XWGl9bfu.js";
async function sendNotification(userId, type, title, message, link) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await createNotification({
        user_id: userId,
        type,
        title,
        message: message || null,
        link: link || null,
        is_read: false
      });
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  console.error("notify error", lastError);
  throw lastError instanceof Error ? lastError : new Error("Notification could not be sent");
}
async function sendGuideOnce(userId, type, title, message, link) {
  try {
    const exists = await checkNotificationExists(userId, type);
    if (exists) return;
    await createNotification({
      user_id: userId,
      type,
      title,
      message: message || null,
      link: link || null,
      is_read: false
    });
  } catch (e) {
    console.error("guide notify error", e);
  }
}
export {
  sendNotification as a,
  sendGuideOnce as s
};
