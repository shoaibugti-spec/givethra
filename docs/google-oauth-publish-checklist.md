# Givethra Google OAuth — Publish Checklist

The platform uses **Google Identity Services** to obtain an ID token in the browser, then verifies the token on the server and creates Givethra’s secure session cookie. Do not place a Google client secret in frontend code.

## 1. Confirm the Google OAuth web client

In Google Cloud Console, open the OAuth 2.0 Client ID used by Givethra. Its application type must be **Web application**.

Add the final published Givethra URL in **Authorized JavaScript origins**, exactly including `https://` and without a trailing path. For example:

```text
https://your-givethra-domain.example
```

If a custom domain is used later, add that exact custom-domain origin too. Keep every approved production origin explicit; do not use wildcards.

## 2. Configure the application runtime values

In the project settings, set or verify these values through the Secrets panel:

| Variable | Purpose |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | The Google OAuth web-client ID used to render Google sign-in. This value is public by design. |
| `GIVETHRA_ADMIN_EMAIL` | Exact email address of the sole owner permitted to open the admin review dashboard. |

The user who is intended to be the owner must sign in with the exact email in `GIVETHRA_ADMIN_EMAIL`. The server requires both this email match and the `admin` role before exposing any admin procedure.

## 3. Verify in a browser after publishing

1. Open the published site in a private/incognito window.
2. Select **Continue with Google** and choose a permitted Google account.
3. Confirm the profile workspace opens after sign-in.
4. As the configured owner email, confirm `/admin` opens the review dashboard.
5. With any other account, confirm `/admin` displays **Owner access only** and does not load administrative records.

## 4. Security checks

- Treat CNIC, selfie, video, and case evidence as sensitive; the platform stores their bytes in S3 and only routes them through authenticated private access paths.
- Keep the Google OAuth client secret out of the browser and source repository. This ID-token flow only requires the web client ID in the frontend.
- If a credential has ever been exposed, rotate it in Google Cloud Console before production use.
- Use Google Cloud Console’s OAuth consent screen to keep the authorized app name, support email, privacy-policy URL, and test/production publishing status correct.
