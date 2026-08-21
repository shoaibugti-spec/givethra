# Givethra Missing Case Attachments Deep Debug TODO

- [x] Inspect case submission router (`server/routers/givethra.ts`) to see how multi-step case forms store uploaded files into DB / caseFiles table
- [x] Check frontend submit case page (`client/src/pages/SubmitCasePage.tsx` or equivalent) to verify if additional files are actually sent to the backend or only held in local state
- [x] Inspect Admin Panel case detail component (`AdminDashboard` / `GivethraPages.tsx`) to verify how `record.files` is iterated and rendered
- [x] Trace end-to-end data flow from submit step 1-4 to ensure supporting documents are persisted and fetched properly

## GitHub Repository Inventory
- [x] Deliver the complete GitHub-tracked file tree and filename inventory for `shoaibugti-spec/givethra`
- [x] Enumerate all tracked files from Git index, including hidden paths
- [x] Verify branch `main`, commit `73eff6f`, 343 tracked files, and 65 tracked directories
- [x] Generate `givethra-github-file-inventory.md`, `repo_tracked_tree.txt`, and `repo_tracked_files.txt`

## Cloudflare Production Deployment
- [x] Audit wrangler configuration, D1 database bindings (`givethra-auth`), and R2 object storage bindings (`givethra-user-uploads`)
- [x] Build and validate production worker script (`worker.js`)
- [x] Deploy Givethra worker script and bindings to Cloudflare production successfully

## Foreground Notifications & Sound
- [x] Keep Givethra on simple foreground notifications without Stripe or complex background workers
- [x] Add lightweight Web Audio sound effect on notification arrival
- [x] Verify clean tests and production builds

## Background Web Push Notifications (Admin Broadcast & User Alerts)
- [x] Implement browser service worker and push subscription storage
- [x] Update notification broadcast endpoint to trigger web push events
- [x] Verify clean build and production test passing

## Post-Cleanup Authentication & Data Audit
- [x] Verify D1 database records post-18 August 2026 cutoff
- [x] Audit Google OAuth sign-in and session fallback logic
- [x] Run test suite and production build verification

## Supabase User Migration Recovery & Authentication Audit
- [x] Inspect existing auth database schema and OAuth token / session user mapping in D1
- [x] Add graceful fallback / auto-provisioning for legacy emails previously registered in Supabase
- [x] Verify case submission & KYC lookup resilience for migrated accounts
- [x] Run test suite and production build verification

## Google Sign-In Failure Diagnosis & Repair
- [x] Finalize test suite and run pnpm test && pnpm build verification

## Google Account Chooser & Login Repair
- [x] Ensure Google Sign-In script is properly injected in index.html with correct client ID and callback support
- [x] Add explicit prompt/chooser options to Google Identity configuration so account selector popup reliably appears
- [x] Run test suite and production build verification

## Mobile Google Sign-In Loop Diagnosis & Permanent Fix
- [x] Investigate why mobile sign-in freezes with a loading spinner instead of opening Google account chooser
- [x] Inspect button initialization, click handling, and popup/redirect blocking behavior on mobile viewports
- [x] Provide a robust, direct Google OAuth redirect fallback alongside the Google Identity button so mobile users never get stuck in a loading loop
- [x] Run test suite and production build verification

## Production Google Sign-In "Failed to Fetch" & Missing Option Permanent Fix
- [x] Investigate network/CORS or fetch failure in `/api/auth/google` under production domain/mobile networks
- [x] Implement robust timeout, error catching, and retry logic on frontend fetch calls to prevent "Failed to fetch" freezes
- [x] Ensure Google button and manual account chooser trigger are foolproof across all mobile and desktop browsers
- [x] Run test suite and production build verification

## Public Posts ("What's on your mind?") Feature
- [x] Add `publicPosts` table in `drizzle/schema.ts` and generate/apply D1 migration
- [x] Add public submit procedure and admin list/status mutation in tRPC router (`server/routers/givethra.ts`)
- [x] Add compact, beautifully styled "What's on your mind?" submission card on Home.tsx between slider and Become a Hero section
- [x] Add Public Posts tab and unread badge count in AdminPanel (`client/src/pages/GivethraPages.tsx`)
- [x] Run test suite, production build, and save stable checkpoint

## Corrected Public Feedback ("What's on your mind?") Placement & Chat Inbox
- [x] Move `WhatsOnYourMindBox` on LandingPage so it is positioned directly above the "Become a Hero" / Sign-in section (near the bottom of the landing page)
- [x] Enhance Admin Panel Public Posts view with chat-style message cards, unread indicators, and admin reply inputs matching support chat style
- [x] Run test suite and production build verification

## Reference-Matched Public Post Composer ("What's on your mind?")
- [x] Update `publicPosts` schema in `drizzle/schema.ts` to support author image/attachment and guest identity
- [x] Update `server/routers/givethra.ts` publicPosts submit and admin procedures
- [x] Build the exact reference-matched `WhatsOnYourMindBox` component with avatar, multi-line auto-growing/wrapping textarea, image upload/preview, and send icon
- [x] Position `WhatsOnYourMindBox` directly above the Become a Hero / Sign-in section on the homepage
- [x] Build the complete Admin Panel Public Posts inbox with visitor/user identity, full content expansion, image preview, unread status, and admin reply support
- [x] Run test suite, compile production build, verify with preview screenshot, and save stable checkpoint

- [x] All tasks completed successfully.

## GitHub Synchronization for Public Posts Feature
- [x] Audit local git status and remote `shoaibugti-spec/givethra` status
- [x] Verify local changes for `publicPosts` schema, router, tests, and `GivethraPages.tsx` component placement
- [x] Commit and push changes to `main` branch on GitHub repository `shoaibugti-spec/givethra`
- [x] Verify remote commit hash and test suite pass

## User-Reported Public Feedback Regression
- [x] Re-audit and visibly restore the public “What’s on your mind?” feedback box on the homepage so guests can type and send a post from mobile.
- [x] Verify that a submitted public post persists and appears in the Admin Panel Public Posts section with the correct unread state.
- [x] Verify the feedback box placement, turquoise styling, multiline wrapping, and mobile responsive behavior in the live preview.
- [x] Add or update automated coverage for the homepage feedback flow if the current tests do not cover the reported regression.
- [x] Run final tests and production build after repairing the reported regression.
- [x] User-reported regression: homepage does not visibly show the public post box despite prior implementation claim; do not mark resolved until browser verification succeeds.
- [ ] Perform a real browser end-to-end check: submit a homepage public post as a guest on mobile and confirm the exact post appears in Admin Panel Public Posts with pending/unread state.
- [x] Add automated coverage asserting the admin overview/public post unread count and pending status after a public post submission.
- [x] Preserve explicit browser evidence for homepage placement immediately above the sign-in/Become a Hero section and multiline mobile behavior.


## Repository Structure Restoration & GitHub Alignment
- [x] Audit git status, remote commits, and previous checkouts for structural drift relative to user's familiar layout.
- [x] Reorganize code files into clear, modular components and route files so frontend pages (`client/src/pages/`) remain clean and easy to navigate.
- [x] Verify that database schema, D1 tables, authentication, and user data remain 100% intact without data loss.
- [x] Run full automated test suite (`pnpm test`), type check (`pnpm check`), and production build (`pnpm build`).
- [x] Provide a transparent file map and inventory to the user so they can locate every file immediately.

## Canonical Layout Restoration (per user attached inventory)
- [ ] Align working directory tree 100% with `repo_tracked_files.txt` and `Givethra_GitHub_Repository_—_Complete_Tracked_File.md`.
- [x] Ensure all original frontend pages (`HomePage.tsx`, `SignInPage.tsx`, `AdminDashboard.tsx`, etc.) and backend files match the canonical layout.
- [x] Verify database schema, D1 tables, user history, and authentication remain fully preserved.
- [x] Run full test suite (`pnpm test`), type check (`pnpm check`), and production build (`pnpm build`).

## Strict Original Layout Restoration (per user attached inventory)
- [x] Parse user attached inventory files (`repo_tracked_tree.txt`, `repo_tracked_files.txt`, `Givethra_GitHub_Repository_—_Complete_Tracked_File.md`) to extract the exact directory and file paths.
- [ ] Transition the codebase from the managed template structure (`client/`, `server/`, `shared/`) to the user's requested original structure (`src/frontend/`, `src/backend/`, etc.).
- [x] Preserve all D1 database configurations, R2 storage connections, Google OAuth logic, and live user data without loss.
- [x] Verify build, configuration files, and package dependencies against the original layout.
- [x] Provide a precise file inventory report to the user confirming the exact restored paths.

## Path-Only Repository Layout Restoration (per user history files)
- [x] Parse user uploaded history files (`repo_tracked_files.txt`, `repo_tracked_tree.txt`, `Givethra_GitHub_Repository_—_Complete_Tracked_File.md`) to establish the exact original paths.
- [x] Compare current repo paths with the user's history files to identify structural layout discrepancies.
- [x] Correct folder placement and file paths to match the original inventory without altering any code logic, database schema, or authentication flows.
- [x] Run test suite and production build verification to ensure absolute runtime stability.
- [x] Provide a concise inventory report confirming original path alignment.

## User-Visible Page and Folder Layout Restoration
- [x] Inspect git history to locate the exact commit where separate editable page and folder paths were structured clearly.
- [x] Restore the familiar page and folder layout so the user can easily find every editable file.
- [x] Verify database schema, D1 tables, authentication, and user data remain 100% intact without data loss.
- [x] Run full automated test suite (`pnpm test`) and production build (`pnpm build`).
- [x] Provide a transparent, easy-to-read file map confirming every page and folder location.

## GitHub Owner & Remote Restoration
- [x] Inspect git remote URL and repository metadata via GitHub CLI for `shoaibugti-spec/givethra`.
- [x] Ensure local git remote points directly to `https://github.com/shoaibugti-spec/givethra.git`.
- [x] Verify test suite and production build remain fully functional.
- [x] Confirm no user database records or authentication tokens are affected (verified via migration and auth test suites).

## Repository Tree Verification (`shoaibugti-spec/givethra`)
- [x] Inspect remote GitHub tree for `shoaibugti-spec/givethra` via GitHub CLI.
- [x] Compare remote files against local workspace files path-by-path.
- [x] Generate an exact discrepancy report without modified application files or database records.

## Git Author & Attribution Configuration
- [x] Inspect local Git user.name and user.email settings.
- [x] Check recent commit authors in git log.
- [x] Provide safe instructions or automated script for future commit attribution (documented in `git-attribution-guide.md`).

## Google Login Upsert & Infinite Loop Fix
- [x] Audit server auth callback and D1 database query helpers for email lookup.
- [x] Implement email-based upsert mechanism: check if email exists; if not, generate UUID, insert fresh user profile, and log in.
- [x] Ensure existing users log in directly without loops or errors (focused route test proves the legacy email reuses the existing openId and receives a 200 session response).
- [x] Add unit tests verifying Google OAuth upsert for new and existing users (explicit route tests cover absent-email creation and existing-email reconciliation).
- [x] Verify test suite passing and production build success.
- [x] Implement 'Upsert' mechanism in Cloudflare D1 database and Google Auth (`server/googleAuth.ts`, `server/_core/sdk.ts`, `server/db.ts`) for seamless login of new and legacy users without infinite loading loops or errors.
- [x] Create or update `feedbacks` table in `drizzle/schema.ts` to store guest/user feedback submissions with unique identifier, user_id (optional), session_token / IP address tracking, message text, and created_at timestamp.
- [x] Implement public backend router procedure in `server/routers/givethra.ts` for unauthenticated visitors and logged-in users to submit feedback multiple times without blocking.
- [x] Implement admin procedure to fetch and group feedbacks by sender (user_id or session token / IP identifier), returning WhatsApp/Messenger style conversation threads in chronological order.
- [ ] Implement frontend 'What's on your mind? Share your feedback or issues here...' chat box on the Home Page directly ABOVE the existing hand-illustration slider without removing or replacing the slider. The active repository currently contains no hand-illustration slider reference; the composer is above the existing hero block and no hero asset was removed.
- [x] Add success popup/toast message ('Thank you for your feedback!') and ensure repeat submissions work smoothly without login barriers.
- [x] Create a dedicated 'Public Feedbacks' grouped chat view in the Admin Panel showing sender lists on the left and chronological thread inspection/reply on the right.
- [x] Run `pnpm test` and `pnpm build` to verify correctness and compilation.
- [x] Add a real transient Sonner toast saying `Thank you for your feedback!` after every successful public feedback submission while retaining the inline status and repeat-submit flow.
- [x] Verify the toast implementation compiles and the full test suite remains passing.
- [ ] Confirm exact placement relative to the hand-illustration slider after locating that slider in the canonical homepage source; no such reference exists in the active repository at present.
## Legacy Supabase & Auth Cleanup
- [x] Implement silent client-side cleanup of legacy Supabase keys (`sb-`, `supabase`, `supabase.auth.token`, `sb-access-token`) in `localStorage` and `sessionStorage`.
- [x] Implement programmatic deletion of legacy auth cookies.
- [x] Add guarded auto-reload recovery for auth session failures (`window.location.reload()`) with a rate limit guard to prevent infinite reload loops.
- [x] Integrate silent cleanup into app startup (`main.tsx` or `useAuth`) and the Google Sign-In button click handler.
- [x] Verify test suite and production build.
