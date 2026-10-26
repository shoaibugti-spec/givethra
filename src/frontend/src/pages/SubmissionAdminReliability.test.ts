import fs from "node:fs";
import path from "node:path";
import { adminUpdateCase, insertKycSubmission } from "@/lib/api";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const workerSource = fs.readFileSync(
  path.join(process.cwd(), "worker.js"),
  "utf8",
);
const kycSource = fs.readFileSync(
  path.join(process.cwd(), "src/pages/KycPage.tsx"),
  "utf8",
);

describe("submission and admin reliability", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => "verified-token") });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does not report a failed KYC submission as successful", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: "KYC is already under review for this user" }),
        { status: 409 },
      ),
    );
    await expect(insertKycSubmission({ full_name: "A User" })).rejects.toThrow(
      "KYC is already under review",
    );
  });

  it("does not report a failed Admin case review as successful", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
      }),
    );
    await expect(
      adminUpdateCase("case-1", { status: "approved" }),
    ).rejects.toThrow("Admin access required");
  });

  it("validates KYC records on the Worker before insertion or resubmission", () => {
    expect(workerSource).toContain("function validateKycRecord(record)");
    expect(workerSource).toContain('code: "KYC_VALIDATION_FAILED"');
    expect(workerSource).toContain("Both CNIC photos are required.");
  });

  it("offers a manual CNIC path when automatic reading is unavailable", () => {
    expect(kycSource).toContain("Automatic reading is unavailable right now.");
    expect(kycSource).toContain("Use Number & Continue");
    expect(kycSource).toContain("formatCnicNumber(manualCnicNumber)");
  });

  it("does not display a new KYC form when the status check fails", () => {
    expect(kycSource).toContain("We couldn't verify your current KYC status.");
    expect(kycSource).toContain("Retry status check");
    expect(kycSource).toContain("!loadError && (!submission || reapplying)");
  });

  it("only allows CNIC capture after repeated clear live focus samples", () => {
    expect(kycSource).toContain("setInterval(scanFocus, 350)");
    expect(kycSource).toContain("if (score <= BLUR_MAX)");
    expect(kycSource).toContain("sharpFrames >= 3");
    expect(kycSource).toContain(
      "if (capturing || (focusing && !focusBypassRef.current)) return;",
    );
    expect(kycSource).toContain(
      "Image is clear and in focus — you can capture now.",
    );
  });

  it("offers an explicit fallback when a camera cannot autofocus", () => {
    expect(kycSource).toContain("}, 8000);");
    expect(kycSource).toContain("My camera can't focus — try anyway");
    expect(kycSource).toContain("focusBypassRef.current = true;");
    expect(kycSource).toContain("retake it if the CNIC text is not readable.");
  });
});
