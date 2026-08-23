# Navigation visual verification — 2026-08-24

The correct canonical Vite preview is running on port 4174; port 4173 was owned by an older unrelated preview process and was not used for final verification.

At `http://127.0.0.1:4174/`, the updated shared Layout header renders successfully above the homepage. The visible DOM includes the Givethra home link, `Search verified cases...` field, English translation control, Community link with unread count, and desktop sign-in/get-started controls. The screenshot confirms the page is not black and the header is present.

The direct deep link `/community` returned `Not Found` only because standalone Vite dev mode did not provide history fallback for a direct deep-link request. Client-side navigation from the root is the appropriate local verification path; the production Wrangler asset configuration already specifies SPA fallback.

The reference header source is updated in `src/components/Layout.tsx`. Automated assertions cover the hamburger, brand, search, translation, Community, notifications, active route state, and Community shell/loading behavior.
