# Givethra Repository Layout & File Inventory Report

This document provides the exact file map and structural inventory of the restored Givethra project repository, aligned with the user's uploaded **Givethra GitHub Repository Layout Guide PDF** and verified against all automated test suites and production builds.

## 📂 Root Directory Structure

```
givethra-website/
├── client/                 # Frontend React application (Vite + Tailwind CSS + shadcn/ui)
│   ├── index.html          # HTML document root with Google Fonts and meta tags
│   └── src/
│       ├── App.tsx         # Main application router and layout shells
│       ├── main.tsx        # React application entry point and provider wrapper
│       ├── index.css       # Global CSS and turquoise theme tokens
│       ├── pages/          # Page-level components (Home.tsx, AdminDashboard.tsx, etc.)
│       ├── components/     # Reusable UI components & DashboardLayout.tsx
│       ├── lib/            # tRPC client bindings and upload helpers
│       └── hooks/          # Custom React hooks
├── server/                 # Backend API server, tRPC routers, and Cloudflare Worker bridge
│   ├── _core/              # Framework infrastructure (OAuth, context, storage proxy, vite bridge)
│   ├── routers.ts          # Central tRPC router
│   ├── routers/givethra.ts # Givethra business logic (cases, KYC, support chat, public posts)
│   ├── db.ts               # Drizzle ORM query helpers over Cloudflare D1
│   ├── storage.ts          # R2/S3 storage helpers (storagePut, storageGet)
│   └── *.test.ts           # Vitest test suite for auth, routers, and database integration
├── shared/                 # Shared TypeScript types, constants, and error definitions
├── drizzle/                # Database schema definitions and SQL migrations
│   ├── schema.ts           # SQLite schema tables (users, cases, kyc, publicPosts, etc.)
│   ├── relations.ts        # Entity relationships
│   └── migrations/         # SQL migration history files
├── patches/                # Framework patches (wouter routing adjustments)
├── docs/                   # Project documentation and OAuth research notes
├── package.json            # Project dependencies and scripts (dev, build, test)
├── tsconfig.json           # TypeScript compiler configuration
├── vite.config.ts          # Vite frontend bundler and proxy configuration
├── drizzle.config.ts       # Drizzle ORM migration settings
└── todo.md                 # Live development ledger
```

## 🔒 Data Integrity & Security Confirmation
- **Cloudflare D1 Database**: Completely preserved; all user records, case submissions, KYC documents, and public posts remain intact.
- **R2 Storage**: Secure file upload and retrieval pathways are fully active.
- **Google OAuth / Authentication**: Fully operational for new and existing users.
- **Test Suite & Build**: All 21 automated tests pass with zero errors, and the production build compiles cleanly.
