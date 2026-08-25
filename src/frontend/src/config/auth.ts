// src/frontend/src/config/auth.ts

/**
 * Google Identity Services Web client used by the public Givethra origin.
 * The client ID is intentionally public; no OAuth client secret belongs in
 * browser code. It must have https://givethra.org in its authorized origins.
 */
export const GOOGLE_CLIENT_ID =
  String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
