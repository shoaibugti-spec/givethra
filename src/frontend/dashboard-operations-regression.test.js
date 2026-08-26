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
const myCasesSource = fs.readFileSync(path.join(root, "src/pages/MyCasesPage.tsx"), "utf8");

describe("dashboard operations repair", () => {
  it("submits deposits using the production D1 columns and keeps the proof filename", () => {
    expect(workerSource).toContain("INSERT INTO deposits (id, user_id, method, amount, currency, transaction_id, proof_url, status, credits, submitted_at)");
    expect(workerSource).not.toContain("INSERT INTO deposits (id, user_id, amount, currency, payment_method, payment_reference, status, deposit_date, created_at)");
    expect(walletSource).toContain("const safeProofName = proofFile.name.replace");
    expect(walletSource).toContain("proof_url: proofUrl");
    expect(walletSource).toContain("transaction_id: txId");
    expect(apiSource).toContain("Failed to submit deposit");
  });

  it("provides a dedicated Contributions review tab separate from Direct Payments", () => {
    expect(adminSource).toContain('value="contributions"');
    expect(adminSource).toContain('>Contributions {pendingContributionCount > 0');
    expect(adminSource).toContain('No Contributions awaiting verification');
    expect(adminSource).toContain('pendingContributions.map');
    expect(adminSource).toContain('value="verify">Direct Payments');
  });

  it("shows a dedicated pending Contribution count separate from Direct Payments", () => {
    expect(adminSource).toContain('const pendingContributions = pendingResolutions.filter((r) => r.paid_to === "givethra");');
    expect(adminSource).toContain('const pendingDirectResolutions = pendingResolutions.filter((r) => r.paid_to !== "givethra");');
    expect(adminSource).toContain('const pendingContributionCount = pendingContributions.length;');
    expect(adminSource).toContain('const pendingDirectCount = pendingDirectResolutions.length;');
    expect(adminSource).toContain('label: "Pending Contributions", value: pendingContributionCount');
    expect(adminSource).toContain("Pending Direct Payments");
    expect(adminSource).toContain("{pendingContributionCount}");
  });

  it("loads all Admin resolutions through the real submitted_at ordering column", () => {
    expect(apiSource).toContain("/api/admin/resolutions");
    expect(workerSource).toContain('resolutions: { table: "case_resolutions", order: "submitted_at" }');
    expect(workerSource).not.toContain('resolutions: { table: "case_resolutions", order: "created_at" }');
  });

  it("keeps Admin proof actions wired to persisted status and rejection-note updates", () => {
    expect(adminSource).toContain('<Button type="button" size="sm" className="w-full sm:flex-1 bg-teal-600 hover:bg-teal-700 text-white" onClick={() => onConfirm(r)}>');
    expect(adminSource).toContain('<Button type="button" size="sm" variant="outline" className="w-full sm:w-auto text-red-600 border-red-300" disabled={!rejectionReason.trim()} onClick={() => onReject(r, rejectionReason)}>');
    expect(adminSource).toContain('status: "completed", admin_confirmed: true');
    expect(adminSource).toContain('status: "disputed", admin_confirmed: false, notes: trimmedReason');
    expect(workerSource).toContain('const allowed = ["status", "admin_confirmed", "admin_confirmed_at", "completed_at", "notes"];');
    expect(adminSource).toContain('try {\n      await adminUpdateResolution');
    expect(adminSource).toContain('await loadData();');
  });

  it("shows submitted Contributions in Verify Help with proof details and reason-gated rejection", () => {
    expect(adminSource).toContain('const pendingResolutionStatuses = new Set(["pending", "pending_confirmation", "seeker_confirmed"])');
    expect(adminSource).toContain("const pendingResolutions = resolutions.filter");
    expect(adminSource).toContain('View Payment Receipt');
    expect(adminSource).toContain('TXN ID:</span>');
    expect(adminSource).toContain('aria-label="Rejection reason"');
    expect(adminSource).toContain('disabled={!rejectionReason.trim()}');
    expect(adminSource).toContain('status: "disputed", admin_confirmed: false, notes: trimmedReason');
    expect(adminSource).toContain('"help_rejected"');
  });

  it("supports Admin deposit approval and rejection through a real update route", () => {
    expect(workerSource).toContain('parts[2] === "deposits" && recordId');
    expect(workerSource).toContain('"method", "amount", "currency", "transaction_id", "proof_url", "status", "credits", "reviewed_at", "reviewed_by", "rejection_reason"');
    expect(apiSource).toContain("/api/admin/deposits/${id}");
    expect(adminSource).toContain("adminUpdateDeposit(dep.id");
    expect(adminSource).toContain("adminUpdateDeposit(id");
  });

  it("uses a batch Admin broadcast route and does not swallow send failures", () => {
    expect(workerSource).toContain('parts[2] === "notifications" && parts[3] === "broadcast"');
    expect(workerSource).toContain("await env.DB.batch(batch)");
    expect(apiSource).toContain("/api/admin/notifications/broadcast");
    expect(fs.readFileSync(path.join(root, "src/lib/notify.ts"), "utf8")).toContain("throw lastError");
    expect(adminSource).toContain("adminBroadcastNotification");
    expect(adminSource).not.toContain("for (const uid of users)");
  });

  it("refreshes the bell after notification changes and keeps user copy branded as Givethra", () => {
    const layoutSource = fs.readFileSync(path.join(root, "src/components/Layout.tsx"), "utf8");
    const notificationsSource = fs.readFileSync(path.join(root, "src/pages/NotificationsPage.tsx"), "utf8");
    const walletSourceText = fs.readFileSync(path.join(root, "src/pages/WalletPage.tsx"), "utf8");
    expect(layoutSource).toContain('window.addEventListener("notification-updated"');
    expect(apiSource).toContain('window.dispatchEvent(new Event("notification-updated"))');
    expect(notificationsSource).toContain("admin_broadcast");
    expect(walletSourceText).not.toContain("admin approval");
  });

  it("creates a user bell alert when an Admin reply is persisted", () => {
    expect(workerSource).toContain("'support_reply', 'New message from Givethra'");
    expect(workerSource).toContain("A support attachment was sent.");
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

  it("adds nested Cases and Help status filters", () => {
    expect(myCasesSource).toContain('aria-label="My case status filters"');
    expect(myCasesSource).toContain('aria-label="Help status filters"');
    expect(myCasesSource).toContain('["pending", "Pending"]');
    expect(myCasesSource).toContain('["rejected", "Rejected"]');
    expect(myCasesSource).toContain('["completed", "Completed"]');
    expect(myCasesSource).toContain('["active", "Active"]');
    expect(myCasesSource).toContain("visibleHelping");
  });

  it("keeps exhaustive case attachment traversal and original-name metadata", () => {
    expect(adminSource).toContain("const walkFilesDeep =");
    expect(adminSource).toContain("original_name || file.filename || file.file_name || file.name");
    expect(adminSource).toContain("const candidate = file.url || file.file_url || file.download_url || file.href || file.path");
    expect(adminSource).toContain("const seen = new Set<string>()");
    expect(adminSource).toContain("const uniqueFiles = fileEntries.filter");
    expect(adminSource).toContain("parseObject(c.photo_urls)");
    expect(adminSource).toContain('walkFilesDeep(catDocs, "documents")');
    expect(adminSource).toContain('walkFilesDeep(parseObject(catDetails?.edu_documents) || {}, "education_documents")');
    expect(workerSource).toContain("await env.DB.batch([");
    expect(adminSource).toContain("const isImage =");
    expect(adminSource).toContain('download={label}');
    expect(adminSource).toContain('parsed.searchParams.set("download", "1")');
    expect(workerSource).toContain('url.searchParams.get("download") === "1"');
    expect(workerSource).toContain("Content-Disposition");
  });
});


describe("case attachment filename persistence", () => {
  it("includes original names in the submitted document metadata", () => {
    const submitSource = fs.readFileSync(path.join(root, "src/pages/SubmitRequestPage.tsx"), "utf8");
    expect(submitSource).toContain("const docMeta: Record<string, { url: string; original_name: string }> = {};");
    expect(submitSource).toContain("original_name: catDocNames[k] || k");
    expect(submitSource).toContain("_documents: docMeta");
  });
});
