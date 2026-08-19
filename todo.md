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
- [ ] Investigate network/CORS or fetch failure in `/api/auth/google` under production domain/mobile networks
- [ ] Implement robust timeout, error catching, and retry logic on frontend fetch calls to prevent "Failed to fetch" freezes
- [ ] Ensure Google button and manual account chooser trigger are foolproof across all mobile and desktop browsers
- [ ] Run test suite and production build verification
