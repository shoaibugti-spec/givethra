import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workerSource = fs.readFileSync(path.join(root, "worker.js"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "src/lib/api.ts"), "utf8");
const walletSource = fs.readFileSync(path.join(root, "src/pages/WalletPage.tsx"), "utf8");
const settingsSource = fs.readFileSync(path.join(root, "src/pages/SettingsPage.tsx"), "utf8");
const adminSource = fs.readFileSync(path.join(root, "src/pages/AdminDashboard.tsx"), "utf8");
const profileSource = fs.readFileSync(path.join(root, "src/pages/ProfilePage.tsx"), "utf8");

describe("dashboard operations repair", () => {
  it("submits deposits using the production D1 columns and keeps the proof filename", () => {
    expect(workerSource).toContain("INSERT INTO deposits (id, user_id, method, amount, currency, transaction_id, proof_url, status, credits, submitted_at)");
    expect(workerSource).not.toContain("INSERT INTO deposits (id, user_id, amount, currency, payment_method, payment_reference, status, deposit_date, created_at)");
    expect(walletSource).toContain("const safeProofName = proofFile.name.replace");
    expect(walletSource).toContain("proof_url: proofUrl");
    expect(walletSource).toContain("transaction_id: txId");
    expect(apiSource).toContain("Failed to submit deposit");
  });

  it("supports Admin deposit approval and rejection through a real update route", () => {
    expect(workerSource).toContain('parts[2] === "deposits" && recordId');
    expect(workerSource).toContain('"method", "amount", "currency", "transaction_id", "proof_url", "status", "credits", "reviewed_at", "reviewed_by", "rejection_reason"');
    expect(apiSource).toContain("/api/admin/deposits/${id}");
    expect(adminSource).toContain("adminUpdateDeposit(dep.id");
    expect(adminSource).toContain("adminUpdateDeposit(id");
  });

  it("restores the remaining Admin mutation routes without legacy placeholders", () => {
    expect(workerSource).toContain('parts[2] === "kyc" && recordId');
    expect(workerSource).toContain('parts[2] === "cases" && recordId');
    expect(workerSource).toContain('parts[2] === "resolutions" && recordId');
    expect(workerSource).toContain('parts[2] === "user-suspension" && request.method === "POST"');
    expect(workerSource).toContain('parts[2] === "offers" && request.method === "POST"');
    expect(workerSource).toContain('parts[2] === "delete-files" && request.method === "POST"');
    expect(workerSource).not.toContain("// ... other admin PUT routes (kyc, cases, etc.)");
    expect(workerSource).not.toContain("// ... admin POST and DELETE routes");
  });

  it("persists every SettingsPage field in the production user_settings table", () => {
    for (const field of [
      "timezone", "email_notifications", "inapp_notifications", "weekly_digest",
      "high_contrast", "larger_text", "reduced_animations",
    ]) {
      expect(settingsSource).toContain(field);
      expect(workerSource).toContain(field);
    }
    expect(workerSource).toContain("ON CONFLICT(user_id) DO UPDATE SET language = excluded.language");
    expect(settingsSource).toContain("Settings were not persisted");
    expect(apiSource).toContain("Failed to save settings");
  });

  it("clears Admin support unread messages without inserting a blank reply", () => {
    expect(workerSource).toContain("sender = 'admin' AND (is_read = 0 OR is_read IS NULL)");
    expect(workerSource).toContain('parts[2] === "support" && parts[3] === "mark-read"');
    expect(workerSource).toContain("sender = 'user' AND (is_read = 0 OR is_read IS NULL)");
    expect(workerSource).toContain('if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);');
    expect(apiSource).toContain("/api/admin/support/mark-read");
    expect(adminSource).toContain("adminMarkSupportMessagesAsRead(uid)");
    expect(adminSource).not.toContain("adminSendSupportReply({ user_id: uid, mark_read: true })");
  });

  it("keeps user support messages user-authored and attachment-capable", () => {
    expect(workerSource).toContain("VALUES (?, ?, 'user', ?, ?, ?, 0, ?)");
    expect(workerSource).toContain('if (!canAccessUser(user, target)) return json({ error: "Forbidden" }, 403, origin);');
    expect(workerSource).toContain("A message or attachment is required");
    expect(workerSource).not.toContain('body.sender || (body.is_from_user ? "user" : "admin")');
  });

  it("routes Google Account Security to the registered Security page", () => {
    expect(profileSource).toContain('label: "Google Account Security", to: "/security"');
    expect(profileSource).not.toContain('to: "/google-account-security"');
  });

  it("keeps exhaustive case attachment traversal and original-name metadata", () => {
    expect(adminSource).toContain("const walkFilesDeep =");
    expect(adminSource).toContain("original_name || file.filename || file.file_name || file.name");
    expect(adminSource).toContain("const candidate = file.url || file.file_url || file.download_url || file.href || file.path");
    expect(adminSource).toContain("const seen = new Set<string>()");
    expect(adminSource).toContain("const uniqueFiles = fileEntries.filter");
  });
});
