# Live public message diagnosis

Source checked: https://givethra.org/api/public-feedback (read-only GET, 2026-08-21).

Observed response: `{"error":"Authentication required"}`.

The canonical source at `src/frontend/worker.js` contains an anonymous-safe `POST /api/public-feedback` dispatcher branch that calls `authenticate(..., false)` and passes a public fallback user into `handlePublicFeedback`. The deployed `givethra` Worker bundle inspected through the configured Cloudflare Worker read API did not contain `public-feedback` or `handlePublicFeedback`; its dispatcher required authentication for other `/api/*` routes. This explains why guest Post Message submissions fail on givethra.org until the canonical Worker source is deployed.

Live D1 schema checked read-only: `feedbacks.user_id` is NOT NULL, while `case_id`, `first_name`, `text_message`, `video_url`, `status`, and timestamp/review fields are nullable. The canonical handler stores guest identity as the non-null string `public`, so it does not require deleting or altering existing data.
