# Navigation and Community visual verification — 2026-08-24

The correct canonical preview is running on port 4174. After client-side navigation from `/` to `/community`, the header shows the Givethra brand, usable search field, translation control, Community control, and no Support icon in the top bar. The Community page renders its title and guest composer immediately, while only the feed area shows `Loading posts...`.

This confirms the top-bar removal and non-blocking shell behavior. The first feed request still determines when cards/counts appear for a fresh browser with no local cache; the next optimization is to verify the request path/latency and use the Worker’s aggregate counts plus stale-while-revalidate cache for returning visitors. The existing guest/user post, like, comment, multiline-editor, and ten-minute-refresh code paths remain intact.

## Focused refinement verification

After the latest HMR refresh and client-side navigation, the Community page displayed 31 posts with like/comment counts and no `Loading posts...` spinner remaining. The top bar contained the Givethra brand, search, translation, Community, and notification controls; the Support icon was absent. The search field accepted the text `electricity` while the Community page remained rendered, confirming that the compact header search is writable.

## Likes, privacy, header, and legacy-state repair verification

The updated local homepage now has no top-header search input. The homepage case-search input remains present below the hero and filters. Navigating to Community keeps the compact header and shows 31 loaded posts with visible like/comment counts and the guest composer. The Community page did not remain behind a feed loading spinner during this check.
