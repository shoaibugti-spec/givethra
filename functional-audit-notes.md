# Givethra Functional Audit Notes

## Initial repository state — 2026-08-17

- GitHub repository: `shoaibugti-spec/givethra`; default branch `main`.
- Local current commit: `5e82184` — `fix: harden Google login and post-login API routes`.
- The user explicitly requires fixes only in this original Cloudflare/GitHub website; do not replace its existing turquoise/light visual design with the separately scaffolded website.
- Cloudflare and Cloudflare Worker Bindings connectors are enabled for this task.

## Existing visual constraints

`DESIGN.md` requires the established light, verification-first humanitarian design using turquoise primary `#00A896`, deep blue secondary `#028090`, and the current website structure. Functional work must preserve this design.

## Frontend API inventory discovered

`src/frontend/src/lib/api.ts` uses same-origin Worker calls and a bearer token in `localStorage` under `auth_token`. Existing calls cover Google session verification; case browse/detail/submit/counts; case unlocks/resolutions/offers; KYC read/create/update; profiles; wallets/deposits; feedback; notifications; support messages; user settings; S3/R2-style upload endpoint; and admin list/review actions.

## Next audit focus

1. Compare every API call in the full frontend client to `worker.js` dispatcher and D1 table schema.
2. Query D1 inventory and R2 object listings without modifying or deleting historical data.
3. Repair only confirmed functional gaps, then run existing frontend build and Worker syntax validation before a live smoke test.

## Confirmed frontend-to-Worker contract gaps

- The React API client calls authenticated route families that are absent from the Worker dispatcher: `case-unlocks`, `case-resolutions`, `deposits`, `user-suspension`, `offers`, `offer-claims`, and `account/delete`.
- `GET /api/cases/by-ids` is currently interpreted as a literal case-ID lookup instead of returning the requested collection.
- Support chat calls `/api/support/messages` and `/api/support/mark-read`, but the Worker only recognizes `/api/support` and direct subpaths; the `messages` route therefore returns 404.
- Wallet reads exist, but the frontend’s `PUT /api/wallets/:userId` balance-update action is missing.
- Notifications, profiles, KYC submission/reapply, basic case list/detail/counts, upload, and generic admin review routes exist and now need compatibility testing rather than replacement.

All repairs must preserve current D1/R2 data and existing turquoise/light UI design.

## D1 inventory — read-only query, 2026-08-17

The current bound database has **60 users**, **60 profiles**, and **48 notifications**. It has **0** KYC submissions, **0** case submissions, **0** case resolutions, **0** case unlocks, **0** deposits, **0** wallets, **0** category offers, **0** support messages, and **0** user suspensions. The query wrote no records.

This confirms that the currently bound D1 database does not contain the previously reported historical KYC/case workflows. The audit will next check available D1 databases and R2 bucket metadata for an alternate recoverable source, without deleting or recreating data.

The account contains only two D1 databases: `givethra-auth` (the active bound database) and `givethra-api` (created 2026-08-16 with a 12 KB file size and no tables). There is therefore no alternate D1 database holding the historical KYC/case records.

The account has one R2 bucket, `givethra-user-uploads`, created on 2026-08-17. The available connector exposes bucket metadata but not an object listing operation, so no claim is made about the presence or absence of individual historical files. No R2 object has been modified.

## Live D1 schema contracts relevant to repair

- `case_submissions` already supports review outcomes through `status`, `reviewed_at`, `reviewed_by`, and `rejection_reason`, as well as photos, selfie/video, category details, payment details, and free-case fields.
- `kyc_submissions` already supports the exact KYC media fields, `status`, `rejection_reason`, `reviewed_at`, and `reviewed_by`.
- `notifications` stores `type`, `title`, `message`, `link`, and `is_read`, which is sufficient for a dashboard-visible review outcome and written reason.
- `support_messages`, `case_unlocks`, `case_resolutions`, `deposits`, `category_offers`, `user_suspensions`, and `wallets` all already exist. The functional gaps are Worker handlers and client-contract normalization, not database table creation.

## Build validation note

- `node --check worker.js`, `pnpm run build`, and `git diff --check` pass after the compatibility-route and server-side credit/suspension repairs.
- The focused Vitest suite passes for the administrative support-reply client, including same-origin routing, bearer-token forwarding, and Worker error propagation.
- A direct `pnpm exec tsc --noEmit` remains red because the repository currently resolves incompatible duplicate React 18 and React 19 type packages, causing existing `TS2786` JSX-component errors across numerous unrelated pages/components. It also reports existing `VerifyEmailPage` route/AuthContext contract errors. No errors were reported in the new `api.ts` helper or `api.test.ts`. The Vite production build remains successful; these typecheck issues are tracked separately from the functional Worker fixes.
