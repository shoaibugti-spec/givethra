// src/frontend/src/main.tsx
// Givethra - Application Entry Point

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { clearLegacyBrowserState } from "./lib/legacySessionCleanup";

// Clean only stale first-party Givethra/Supabase state before auth initializes.
clearLegacyBrowserState();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on "store not initialized" type errors
        if (error instanceof Error && error.message.includes("__store")) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    // Fallback: create a root element and attach to body
    const fallback = document.createElement("div");
    fallback.id = "root";
    document.body.appendChild(fallback);
    console.error("[Givethra] Root element #root not found — created fallback");
  }

  const mountTarget = document.getElementById("root")!;
  ReactDOM.createRoot(mountTarget).render(
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>,
  );
} catch (err) {
  // Last-resort: show a plain HTML error if React itself fails to mount
  console.error("[Givethra] Fatal mount error:", err);
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;font-family:system-ui,sans-serif;padding:1rem">
      <div style="max-width:480px;text-align:center">
        <div style="width:36px;height:36px;border-radius:8px;background:#0166FF;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem">
          <span style="color:#fff;font-weight:700;font-size:18px">G</span>
        </div>
        <h1 style="color:#fff;font-size:20px;font-weight:700;margin-bottom:0.5rem">Givethra failed to start</h1>
        <p style="color:#a1a1aa;font-size:14px;margin-bottom:1.5rem">Something went wrong. Our team has been notified.</p>
        <code style="display:block;background:#111;border:1px solid #27272a;border-radius:8px;padding:0.75rem;color:#f87171;font-size:12px;text-align:left;word-break:break-word;margin-bottom:1.5rem">
          ${err instanceof Error ? err.message : String(err)}
        </code>
        <button onclick="window.location.reload()" style="padding:10px 24px;border-radius:8px;background:#0166FF;color:#fff;font-weight:600;font-size:14px;border:none;cursor:pointer">
          Reload Application
        </button>
      </div>
    </div>
  `;
}
