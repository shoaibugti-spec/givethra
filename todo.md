# Project TODO

- [x] Define the relational schema for profiles, KYC submissions, cases, case files, notifications, support messages, and file metadata.
- [x] Add owner-only role enforcement and authenticated access guards for non-public routes.
- [x] Enforce owner-only admin access using the configured owner email and add a focused owner-versus-non-owner admin test.
- [x] Prevent non-owner accounts from rendering empty admin data surfaces and show an explicit owner-only access state instead.
- [x] Replace the bare authenticated-route loading spinner with a graceful secure-session state that preserves the protected-route boundary.
- [x] Configure secure Google OAuth credentials and a callback flow for public sign-in.
- [x] Implement S3-backed upload procedures for profile images, KYC identity files, selfie media, and case evidence.
- [x] Build the refined public landing page with mission, approved-case highlights, and Google sign-in entry point.
- [x] Build public approved-case browse filters and a detailed public case view.
- [x] Build authenticated profile editing with display picture, cover photo, and personal details.
- [x] Build KYC upload and status tracking flow with exactly pending, approved, and rejected states.
- [x] Build case submission, evidence upload, personal case list, and case-status tracking.
- [x] Build in-app notifications for KYC updates, case updates, and administrator messages.
- [x] Build authenticated support chat between users and the support team.
- [x] Build the owner-only admin dashboard for KYC reviews, case reviews, users, and support messages.
- [x] Send an owner notification whenever a user submits KYC or a case.
- [x] Add Vitest coverage for permissions, workflow status transitions, and critical server procedures.
- [x] Add real-database Vitest coverage for successful KYC/case review transitions and persisted user notification rows.
- [x] Add isolated server coverage for owner-notification dispatch on new KYC and case submissions.
- [x] Run migrations, production build, tests, and desktop/mobile visual verification.
- [x] Save a release checkpoint and provide the Google OAuth configuration steps required before publishing.

- [x] Audit Submit Case fields (category, title, description, amount, expiry date, supporting files/videos)
- [x] Audit backend Worker and D1 schema / storage handling for case submission and attachments
- [x] Audit AdminDashboard case inspection view for missing attachments, category info, amounts, and dates
- [x] Implement robust payload handling and UI enhancements for case submission & admin review
- [x] Run build, verify tests, and create stable checkpoint

- [x] Audit and map all 4 steps of SubmitCasePage in client/src/pages/GivethraPages.tsx
- [x] Ensure all 4-step fields, document slots, selfie, and video are captured and sent in tRPC mutation
- [x] Expand database schema and D1 migration for all case step attributes (e.g. category, amount, location, bills/identity/medical proof files)
- [x] Upgrade Admin review queue to display every step detail, all attached documents, selfie, and video player
- [x] Run test suite, build, and save stable checkpoint
