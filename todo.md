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
