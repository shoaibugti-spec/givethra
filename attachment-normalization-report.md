# Givethra Admin Attachment Normalization & Repair Report

## Summary of Investigation & Fix
1. **Root Cause Identification**: 
   - Previously, Selfie and Video appeal files appeared correctly because they were stored as dedicated columns (`selfieUrl`, `videoUrl`) on the `cases` table.
   - Other supporting documents (such as House Rent agreements, utility bills, institute verification sheets) uploaded during case submission were saved into the `caseFiles` table (`caseId`, `storageUrl`, `fileName`, etc.). However, the admin tRPC endpoint (`server/routers/givethra.ts`) only queried `cases` without joining or appending `caseFiles`, causing the Admin Panel to only receive the 2 primary media items (`selfieUrl` and `videoUrl`).
2. **Backend Normalization Fix**:
   - Updated the `cases` admin query in `server/routers/givethra.ts` to fetch associated `caseFiles` for all retrieved cases and augment them with synthesized file entries for `selfieUrl` and `videoUrl` if present.
   - This ensures that every submitted file—whether uploaded as a supporting document or as selfie/video appeal—is bundled cleanly into `record.files` for the admin view.
3. **Frontend UI Rendering**:
   - `AdminDashboard` (`GivethraPages.tsx`) maps over `record.files` to render each supporting document in its own distinct review box with clickable download/view links.
4. **Build Verification**:
   - Ran `pnpm run build` successfully with zero TypeScript errors or compilation warnings.
   - Preserved the original turquoise UI design, D1 database schema, and R2 storage rules without disruption.
