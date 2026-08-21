# Givethra Canonical Source Comparison Report

## Overview
This report establishes a read-only comparison between the actual live production deployment (`givethra.org` running Cloudflare Worker v3.1) and the GitHub repository `shoaibugti-spec/givethra` (`main` branch).

## Key Architectural Findings

| Dimension | Live Production (`givethra.org`) | GitHub Repository (`shoaibugti-spec/givethra`) |
|---|---|---|
| **Deployment Type** | Standalone compiled Cloudflare Worker (`worker.js`) with embedded REST handlers and frontend HTML string generation | Managed full-stack React 19 + tRPC + Drizzle template (`client/`, `server/`, `drizzle/`) |
| **Authentication Flow** | Native Google ID token verification (`verifyGoogleCredential`) with `findOrCreateUser` D1 upsert | tRPC procedure router with Manus OAuth bridge and custom cookie management |
| **Case Submissions & Reviews** | Direct D1 SQL execution (`handleCases`, `handleKyc`, `rejection_reason` updates) | Drizzle ORM model queries mapped through tRPC routers |
| **Layout & Presentation** | Server-rendered HTML strings inside the Worker script | Client-side React SPA rendered via Vite and Express dev server |

## Conclusion
The reason the user observed missing elements and layout discrepancies in the managed workspace is that the live site is powered by a compiled backend Worker script rather than the React template currently present in the active repository branch. 

No changes or publishing actions have been performed on the live production environment. The live Worker v3.1 has been safely backed up locally (`/home/ubuntu/givethra-canonical-backup/live_worker_v3.1.js`) for reference.
