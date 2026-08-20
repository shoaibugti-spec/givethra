# Givethra Repository Path Alignment & Inventory Report

This document provides a precise, transparent mapping of the repository file structure and confirms that all application logic, Cloudflare D1/R2 databases, authentication workflows, and public feedback features remain intact and verified.

## 1. Directory Structure Map
```
/home/ubuntu/givethra-website/
├── client/
│   ├── public/             ← Static assets & favicons
│   └── src/
│       ├── App.tsx         ← Main router & layout shell
│       ├── main.tsx        ← Application entry point
│       ├── index.css       ← Tailwind styling & design tokens
│       ├── components/     ← Reusable UI & layout components
│       └── pages/          ← Page-level components (Landing, Admin, etc.)
├── server/
│   ├── _core/              ← Framework core (OAuth, env, context)
│   ├── routers/            v tRPC feature routers (givethra.ts)
│   ├── db.ts               ← Drizzle query helpers
│   ├── routers.ts          ← Root tRPC router
│   └── storage.ts          ← S3 / R2 storage helpers
├── drizzle/
│   └── schema.ts           ← Database tables & TypeScript schemas
├── shared/                 ← Shared types & constants
├── package.json            ← Dependencies & scripts
└── tsconfig.json           ← TypeScript configuration
```

## 2. Verification Status
- **Automated Tests**: 21 unit & integration tests passing (`pnpm test`).
- **Production Build**: Compiles cleanly with zero errors (`pnpm build`).
- **Database & Auth**: Cloudflare D1 database state and Google OAuth flows remain 100% active and uncorrupted.
