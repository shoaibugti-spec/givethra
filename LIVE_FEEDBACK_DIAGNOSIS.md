# Live public message diagnosis

Source checked: https://givethra.org/api/public-feedback (read-only GET, 2026-08-21).

Observed response: `{"error":"Authentication required"}`.

The canonical source at `src/frontend/worker.js` contains an anonymous-safe `POST /api/public-feedback` dispatcher branch that calls `authenticate(..., false)` and passes a public fallback user into `handlePublicFeedback`. The deployed `givethra` Worker bundle inspected through the configured Cloudflare Worker read API did not contain `public-feedback` or `handlePublicFeedback`; its dispatcher required authentication for other `/api/*` routes. This explains why guest Post Message submissions fail on givethra.org until the canonical Worker source is deployed.

Live D1 schema checked read-only: `feedbacks.user_id` is NOT NULL, while `case_id`, `first_name`, `text_message`, `video_url`, `status`, and timestamp/review fields are nullable. The canonical handler stores guest identity as the non-null string `public`, so it does not require deleting or altering existing data.

## 2026-08-22 GitHub-to-Live Public Post Visibility Audit

Source checked: https://github.com/shoaibugti-spec/givethra

The local verified checkpoint is `638045b`, while GitHub `main` currently resolves to commit `435fe64484cd35750851a0f9f95edcec95740e58`. GitHub `main` does contain the public composer in `src/frontend/src/pages/HomePage.tsx`, including the Public Post UI and `/api/public-feedback` request path. The local checkpoint additionally has the stable `id="public-post"` anchor and final `Public Post` heading.

GitHub has two deployment workflows: `.github/workflows/deploy.yml` and `.github/workflows/deploy-givethra.yml`. Both workflow runs for commit `435fe644` failed around 2026-08-21T20:50:09Z, and the Cloudflare deploy job was skipped because validation/build failed. The canonical workflow requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` GitHub Actions secrets before deployment. Reading the Actions secret list returned HTTP 403, so secret presence/value could not be confirmed. The commit status endpoint reports `pending` with zero status contexts.

Conclusion: the live site not showing Public Post is consistent with the GitHub deployment workflow failing before Cloudflare deployment, not with the Public Post JSX being absent from GitHub main. No GitHub push, deployment, or live data modification was performed during this audit.

## Official pnpm v10 CI guidance consulted

Sources: https://pnpm.io/10.x/cli/approve-builds, https://pnpm.io/10.x/settings, https://pnpm.io/package_json

The official pnpm v10 guidance confirms that dependency lifecycle scripts are blocked by default and approved packages should be listed under `onlyBuiltDependencies` in `pnpm-workspace.yaml`. The canonical frontend install aborted with `ERR_PNPM_IGNORED_BUILDS` for required build dependencies including `@biomejs/biome`, `esbuild`, `sharp`, `tesseract.js`, and `workerd`. This is the immediate CI blocker preventing the Cloudflare deployment workflow from reaching its deploy step.
