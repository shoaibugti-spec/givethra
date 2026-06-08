/**
 * Google OAuth Configuration
 *
 * HOW TO SET YOUR GOOGLE CLIENT ID:
 * 1. Go to https://console.cloud.google.com/
 * 2. Select your project (or create one)
 * 3. Navigate to APIs & Services → Credentials
 * 4. Create an OAuth 2.0 Client ID (Web application type)
 * 5. Add your deployed app URL to:
 *    - Authorized JavaScript Origins: https://givethra.com
 *    - Authorized Redirect URIs: https://givethra.com
 * 6. Copy the Client ID and paste it below
 *
 * For local development, also add:
 *    - Authorized JavaScript Origins: http://localhost:5173
 */
export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  "588032676735-0rhdu34aujbftunbiovhn3r5gvia6isf.apps.googleusercontent.com";

/**
 * Returns true if Google Sign-In is properly configured.
 * When false, the Google sign-in button will show a configuration notice.
 */
export const isGoogleAuthConfigured = (): boolean =>
  GOOGLE_CLIENT_ID.length > 0 && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID";
