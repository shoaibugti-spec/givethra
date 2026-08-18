# Givethra GitHub Repository Layout Guide

This guide provides a comprehensive overview of the file structure, folders, and core components in the Givethra project repository. Every directory and key file is organized below by its functional role in the full-stack architecture (React frontend, Express/Cloudflare backend, D1 database, R2 storage, and configuration).

---

## 📂 Root Directory Structure

| Path / Folder | Role & Description |
|---|---|
| `client/` | Frontend React application (Vite + Tailwind CSS + shadcn/ui). |
| `server/` | Backend API server, tRPC routers, database queries, and Cloudflare Worker entry point. |
| `shared/` | Shared TypeScript types, constants, and error definitions used by both client and server. |
| `drizzle/` | Database schema definitions, Drizzle ORM configurations, and SQL migration files. |
| `patches/` | Framework patches (such as wouter routing adjustments). |
| `docs/` | Project documentation and technical research notes. |
| `package.json` | Project dependencies, scripts (`dev`, `build`, `test`), and metadata. |
| `tsconfig.json` | TypeScript compiler configuration. |
| `vite.config.ts` | Vite frontend bundler and proxy configuration. |
| `drizzle.config.ts` | Drizzle ORM migration and connection settings. |
| `todo.md` | Task tracking ledger for development and outage recovery. |

---

## 🎨 1. Frontend (`client/`)

The frontend is built with React 19, Tailwind CSS, and shadcn/ui components, communicating with the backend via tRPC hooks.

- **`client/index.html`** — HTML document root, including Google Fonts and meta tags.
- **`client/src/main.tsx`** — React application entry point and provider wrapper.
- **`client/src/App.tsx`** — Main application router, layout shells, and navigation wiring.
- **`client/src/index.css`** — Global CSS styles, Tailwind theme definitions, and color tokens (turquoise theme).
- **`client/src/pages/`** — Page-level React components:
  - `Home.tsx` — Public landing page and feature entry points.
  - `AdminDashboard.tsx` — Owner/admin review queue, KYC verification, and recursive attachment gallery.
  - `SupportChatPage.tsx` — User-facing support chat with multiline textarea support.
- **`client/src/components/`** — Reusable UI elements (shadcn/ui buttons, dialogs, cards, inputs, and `DashboardLayout.tsx`).
- **`client/src/lib/trpc.ts`** — tRPC type-safe client binding to the backend API.
- **`client/src/hooks/`** — Custom React hooks (e.g., mobile detection, composition handling).

---

## ⚙️ 2. Backend & API (`server/`)

The backend handles API requests, authentication, tRPC procedures, and integration with Cloudflare Workers, D1, and R2.

- **`server/_core/`** — Framework-level infrastructure (OAuth handling, context building, cookies, storage proxy, LLM wrappers, and Vite development server bridge).
- **`server/routers.ts`** — Central tRPC router aggregating all sub-routers and procedure definitions (`publicProcedure`, `protectedProcedure`, `adminProcedure`).
- **`server/routers/givethra.ts`** — Dedicated tRPC router for Givethra-specific business logic (cases, KYC, support chat, unread notification counts, and suspension rules).
- **`server/db.ts`** — Database query helper functions using Drizzle ORM over Cloudflare D1.
- **`server/storage.ts`** — S3/R2 storage integration helpers (`storagePut`, `storageGet`) for secure document uploads (selfies, videos, bills, and ID proofs).
- **`server/googleAuth.ts`** — Google Sign-in authentication verification.
- **`server/*.test.ts`** — Vitest test files for auth, workflows, routers, and database integration.

---

## 🗄️ 3. Database & Migrations (`drizzle/`)

Managed via Drizzle ORM and deployed to Cloudflare D1 (SQLite).

- **`drizzle/schema.ts`** — Database table definitions (`users`, `cases`, `kyc`, `support_messages`, `notifications`, `deposits`).
- **`drizzle/relations.ts`** — Entity relationship definitions between users, cases, and support threads.
- **`drizzle/migrations/`** — SQL migration history files (`0000_light_may_parker.sql`, `0001_optimal_ultimatum.sql`).
- **`drizzle.config.ts`** — Configuration file for generating Drizzle migrations.

---

## ☁️ 4. Storage & Configuration Files

- **`server/storage.ts` & `server/_core/storageProxy.ts`** — Handle private document storage, secure file URLs, and streaming retrieval from Cloudflare R2 / S3-compatible buckets.
- **`template.json` & `components.json`** — Template scaffolding metadata and UI component styling configurations.
- **`todo.md`** — Live progress tracking ledger.
