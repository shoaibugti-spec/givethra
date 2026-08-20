# Givethra Workspace Pages Inventory

This file documents the modular page and component structure of the Givethra project, ensuring all views and files are clearly navigable for the user.

## Frontend Directory Map (`client/src/`)
- `App.tsx`: Main routing and layout integration.
- `main.tsx`: React root mounting with providers.
- `index.css`: Tailwind v4 theme and custom base styles.
- `components/`:
  - `DashboardLayout.tsx`: Admin and user navigation sidebar shell.
  - `AIChatBox.tsx`: Conversational support widget.
  - `GoogleSignIn.tsx`: Google OAuth authentication trigger.
  - `Map.tsx`: Location mapping support.
- `pages/`:
  - `GivethraPages.tsx`: Contains LandingPage, AdminPanel, KYC verification, Case Submission, and Public Feedback (`WhatsOnYourMindBox`).
  - `NotFound.tsx`: 404 fallback page.

## Backend Directory Map (`server/`)
- `routers/givethra.ts`: Core tRPC procedures including public posts, admin moderation, case attachments, and KYC.
- `db.ts`: Drizzle ORM query helpers.
- `routers.ts`: Root tRPC router binding.
