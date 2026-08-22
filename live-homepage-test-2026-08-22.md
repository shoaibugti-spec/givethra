# Live Homepage Inspection — 2026-08-22

The real `https://givethra.org/` was opened in the browser. The live page title is `Givethra — Verified Help. Real Impact.` and the rendered homepage contains the hero, search, category filters, verified cases, trust section, and footer.

The live page does **not** contain the requested `Public Post`, `What's on your mind?`, `Write your message...`, or `Post Message` content. Searching the live page for `Public Post` returned no matching text.

The live page still contains Urdu promotional banner text even when the visible language control says English, so the live artifact is also not the fully localized canonical build.

No form submission, D1 write, R2 write, or other production mutation was performed during this inspection.

Evidence screenshot: `/home/ubuntu/screenshots/givethra_org_2026-08-22_09-51-11_7431.webp`

Conclusion: the live domain is serving a different/older frontend artifact than the canonical source currently present in the active project. The next safe action is to compare the deployed asset identity and Worker route with the canonical deployment workflow, then deploy that source through the correct production Worker path.


## Asset and endpoint probe

The live page loads `https://givethra.org/assets/main-DQRtxtLj.js` and `https://givethra.org/assets/HomePage-D5BEUjb9.js`. Its resource list includes the older API family `/api/feedbacks`, `/api/feedback-likes`, `/api/feedback-comments`, `/api/cases/approved`, and `/api/cases/category-counts`; it does not expose a `Public Post` marker in the rendered body.

A safe GET probe of `https://givethra.org/api/public-feedback` returned HTTP `401` with `{"error":"Authentication required"}`. This request did not submit a message or change any data. The result confirms the live route is not behaving like the guest-safe canonical Public Post submission path, which requires the correct deployed Worker/frontend artifact rather than a browser-only refresh.


## Service-worker cache probe

The live page has an activated service worker at `https://givethra.org/sw.js` controlling `/`, with cache `givethra-v1`. The cache currently contains the root document URLs (`/` and `/index.html`). This confirms a live client-side cache layer exists, but the served HTML and asset names still identify the old build. A normal reload may therefore continue to show the old homepage until the correct Worker/assets deployment is made and the service worker receives the updated artifact.

No cache was cleared and no production resource was modified by this probe.


## Fresh browser verification

At 2026-08-22, a cache-busted browser visit to `https://givethra.org/?live_check=20260822_1` loaded the actual live domain. The visible page contains the announcement bar, GIVETHRA hero, Become a Hero / Request Help buttons, slider, filters, category chips, and the Verified Cases section. The exact string `Public Post` is absent from the live DOM; the keyword search returned no match. The current live homepage therefore does not render the requested composer, despite the canonical source containing it in `src/frontend/src/pages/HomePage.tsx`.

This was a read-only inspection. No post was submitted and no D1/R2 data was changed.
