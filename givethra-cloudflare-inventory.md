# Givethra Cloudflare Infrastructure & Resource Inventory

**Author:** Manus AI  
**Project:** Givethra (`givethra-website`)  
**Platform:** Cloudflare Workers, D1 Database, R2 Object Storage, and GitHub CI/CD  
**Date:** August 2026  

---

## Executive Summary

This document provides a comprehensive, security-conscious inventory of all Cloudflare resources, database schemas, object storage buckets, deployment workflows, and environment configurations associated with the Givethra platform. It is structured to ensure complete operational visibility and disaster recovery preparedness without exposing sensitive secrets or private API tokens.

---

## 1. Cloudflare Worker Configuration

The Givethra Cloudflare Worker serves both the single-page React frontend assets and the backend API logic at the edge.

| Configuration Parameter | Target Value / Specification |
|-------------------------|------------------------------|
| **Worker Name** | `givethra` |
| **Main Entry Script** | `./worker.js` (bundled via Vite & esbuild) |
| **Compatibility Date** | `2024-11-01` |
| **Assets Directory** | `./dist` |
| **Assets Binding** | `ASSETS` |
| **Not Found Handling** | `single-page-application` (SPA routing enabled) |

---

## 2. Cloudflare Bindings & Storage Infrastructure

The application relies on Cloudflare's serverless database and storage bindings to persist user profiles, KYC records, case files, support chats, and notifications.

### A. D1 SQLite Database
- **Binding Name:** `DB`
- **Database Name:** `givethra-auth`
- **Database ID:** `5ad1094c-3288-4519-aeec-0446d82126f6`
- **Core Tables:**
  - `users`: Stores user profiles, authentication credentials, roles (`admin` | `user`), verification statuses, and suspension counters.
  - `cases`: Stores fundraising case submissions, titles, categories, descriptions, institute details, target amounts, expiry dates, collection amounts, and approval statuses.
  - `caseFiles`: Stores file attachments (selfies, video appeals, bills, agreements, CNIC scans) linked to specific cases.
  - `kycSubmissions`: Stores KYC verification records and review logs.
  - `supportMessages`: Stores private support chat transcripts and `is_read` status flags between users and admin.
  - `notifications`: Stores system alerts and notification counts.
  - `deposits`: Stores wallet deposit requests and transaction approvals.

### B. R2 Object Storage
- **Binding Name:** `UPLOADS`
- **Bucket Name:** `givethra-user-uploads`
- **Purpose:** Stores user-uploaded media (profile pictures, KYC identity documents, video appeals, and case supporting files) securely in private object storage with presigned or proxied access.

### C. Environment Variables & Public Config
- `GOOGLE_CLIENT_ID`: `588032676735-6aa3hj5b990sa5hcn6qltvj10581od9p.apps.googleusercontent.com`
- Runtime secrets (`JWT_SECRET`, database credentials, and Cloudflare API tokens) are securely injected via Cloudflare Worker secrets and GitHub Actions repository secrets.

---

## 3. CI/CD Pipeline & Deployment Architecture

Automated deployments are orchestrated via GitHub Actions to ensure seamless edge updates.

- **Workflow File:** `.github/workflows/deploy-givethra.yml`
- **Trigger:** Push to `main` branch or manual `workflow_dispatch`
- **Concurrency Group:** `givethra-production` (cancel-in-progress enabled)
- **Runner Environment:** `ubuntu-latest`
- **Build Toolchain:** Node.js 22, pnpm 10.4.1
- **Deployment Command:** `pnpm exec wrangler deploy`
- **Required Secrets:** `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

---

## 4. Security & Compliance Scope

- **Credential Masking:** API tokens, signing secrets, and database encryption keys are omitted from this inventory.
- **Access Control:** Production worker publishing requires authenticated Cloudflare API tokens with Worker and D1/R2 permissions.
- **Data Integrity:** All database migrations are version-controlled under `drizzle/` and synchronized with D1.

---

## References

- Cloudflare Workers Documentation: https://developers.cloudflare.com/workers/
- Cloudflare D1 Database Documentation: https://developers.cloudflare.com/d1/
- Cloudflare R2 Object Storage Documentation: https://developers.cloudflare.com/r2/
