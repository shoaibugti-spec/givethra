# Live Cloudflare stale-build diagnosis

**Audit date:** 2026-08-22. **Canonical domain:** [https://givethra.org](https://givethra.org). This document records read-only evidence only. No Cloudflare deployment, D1 mutation, R2 mutation, or GitHub push was performed by this audit.

## Confirmed live symptom

The live homepage at `givethra.org` is serving an older frontend bundle: the visible **Public Post** composer is absent and older bilingual UI content remains. A read-only request to `https://givethra.org/api/public-feedback` returned an authentication-required response from the old Worker path. The current canonical Worker is designed to accept anonymous `POST /api/public-feedback` requests, so the live response proves that the current Worker artifact is not serving the domain.

## Cloudflare production evidence

Read-only Cloudflare account inspection identified the production Worker as `givethra`. Its latest deployment was created at `2026-08-21T23:11:59.184195Z`, with 100% traffic routed to version `59ecb48e-0965-49f3-8ab5-745f5c588c7c`. The active Worker content was 72,043 serialized characters and did not contain `public-feedback`, `handlePublicFeedback`, `Public Post`, or `community_posts`; it contained only a generic `Support` marker. This is an older Worker artifact than the canonical source.

The canonical Wrangler configuration remains non-destructive and targets the intended resources:

| Resource | Canonical configuration |
|---|---|
| Worker | `givethra`, entrypoint `./worker.js` |
| Static assets | `./dist`, single-page-application fallback |
| D1 binding | `DB` → database `givethra-auth`, ID `5ad1094c-3288-4519-aeec-0446d82126f6` |
| R2 binding | `UPLOADS` → bucket `givethra-user-uploads` |

No schema, database, bucket, or binding change is required to activate the existing Public Post route.

## Source and GitHub comparison

The verified local source checkpoint is `8186ac5a63380ef414d8171beb8c239204844b3b`. The fetched GitHub `main` ref is `a04fe16bfd49da347bb5f571323e9f9310d60405`. GitHub `main` is **13 commits behind** the verified local source. The local source contains the visible homepage composer in `src/frontend/src/pages/HomePage.tsx` with the label **Public Post**, the guest-safe request to `/api/public-feedback`, the success message, the Admin **Posts** tab, repaired Support Chat calls, and the current Worker dispatch. The GitHub `main` tree inspected during this audit did not contain the `Public Post` or `/api/public-feedback` markers in the homepage/Admin source comparison, even though its older Worker source contains a different public-feedback handler.

The verified local workflow is `.github/workflows/deploy-givethra.yml`. It runs from `src/frontend`, uses pnpm `10.4.1`, installs from the tracked `src/frontend/pnpm-lock.yaml` with `--frozen-lockfile`, builds the SPA, validates `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, and runs `pnpm exec wrangler deploy` using `src/frontend/wrangler.toml`. The duplicate legacy root workflow was removed in the verified local source. GitHub `main` still has the older workflow version using `--no-frozen-lockfile --ignore-workspace` and retains the duplicate workflow, so a deployment started from that ref cannot be treated as the verified canonical build.

## GitHub Actions failure

The latest visible GitHub Actions runs for commit `a04fe16bfd49da347bb5f571323e9f9310d60405` failed at approximately `2026-08-22T00:48:58Z`. The validation job had no completed steps and the Cloudflare deployment job was skipped. This indicates that the run did not reach the build or deploy command. GitHub's API did not permit this session to enumerate Actions secret values or names (`HTTP 403`), so the presence and correctness of `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` cannot be confirmed from this environment. The repository page also displayed an account-billing warning, which is consistent with runner allocation failure, but the account owner should confirm that independently.

## Root cause and safe repair

The stale live site is caused by **source and deployment lineage mismatch**, not by D1 or R2 data. The current verified source is local at checkpoint `8186ac5a`, while GitHub `main` is at older commit `a04fe16`, and the latest GitHub Actions runs fail before Cloudflare deployment. Consequently, Cloudflare continues serving the older Worker and asset version from 2026-08-21.

The safe repair is to synchronize the verified checkpoint to GitHub `main`, confirm the two Cloudflare Actions secrets and GitHub Actions runner/billing availability, and run the single canonical `Deploy Givethra to Cloudflare` workflow. The workflow deploys the Worker and the built `dist` assets together using the existing D1/R2 bindings; it does not drop tables, migrate data, delete R2 objects, or change live records.

After deployment, verify `https://givethra.org` in a private browser window or with a hard refresh, confirm the homepage contains **Public Post**, submit one harmless guest message, and confirm it appears in Admin **Posts**. Verify the deployed API with a real `POST` request rather than a `GET`, because the route is a write endpoint. Do not use any preview domain as evidence for the production result.

## Manual deployment log received after the regression

The user-provided Cloudflare build log confirms that the environment installed Node.js 20.20.2 and pnpm 10.4.1, then failed only at the configured user build command:

```text
Executing user build command: pnmp run build
/bin/sh: 1: pnmp: not found
Failed: error occurred while running build command
```

`pnmp` is a typo; the canonical frontend command is `pnpm run build`, executed from `src/frontend`. Because the build stopped before Vite generated the current `dist` assets and before Wrangler deployed the Worker, Cloudflare retained or continued serving the last successful older artifact. The dependency install completed; this is not a D1/R2 or application-code failure.

A read-only Cloudflare API check also reports that no Workers Build configuration is attached to the active script tag `givethra`. Therefore the `pnmp` setting is not the active Worker build configuration. The production domain `givethra.org` is mapped to the `givethra` Worker, which must be updated through the canonical Wrangler deployment path. The repository root build must not be used because it targets the managed template rather than the canonical Givethra `src/frontend` application.

No Cloudflare mutation, Worker deployment, D1 query, or R2 operation was performed during this diagnosis.
