// src/frontend/src/config/auth.ts

/**
 * Google Identity Services Web client used by the public Givethra origin.
 * The client ID is intentionally public; no OAuth client secret belongs in
 * browser code. It must have https://givethra.org in its authorized origins.
 */
export const GOOGLE_CLIENT_ID =
  String(
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "588032676735-6aa3hj5b990sa5hcn6qltvj10581od9p.apps.googleusercontent.com",
  ).trim();
