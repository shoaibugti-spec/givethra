import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({ getDb: vi.fn() }));
vi.mock("./storage", () => ({ storagePut: vi.fn() }));
vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn() }));

import { cases, kycSubmissions, notifications } from "../drizzle/schema";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import { appRouter } from "./routers";
import { storagePut } from "./storage";
import type { TrpcContext } from "./_core/context";
import { ENV } from "./_core/env";

type Write = { table: unknown; values: unknown };

const writes: Write[] = [];
const updates: Write[] = [];
const kycRecord = { id: 12, userId: 701 };
const caseRecord = { id: 22, userId: 702 };

const database = {
  select: () => ({
    from: (table: unknown) => ({
      where: () => ({
        limit: async () => table === kycSubmissions ? [kycRecord] : table === cases ? [caseRecord] : [],
      }),
    }),
  }),
  update: (table: unknown) => ({
    set: (values: unknown) => {
      updates.push({ table, values });
      return { where: async () => ({ affectedRows: 1 }) };
    },
  }),
  insert: (table: unknown) => ({
    values: async (values: unknown) => {
      writes.push({ table, values });
      return [{ insertId: writes.length + 40 }];
    },
  }),
};

function context(role: "user" | "admin", email = "person@example.com"): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "workflow-test-user",
      name: "Workflow Tester",
      email,
      loginMethod: "google",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const caseFile = {
  name: "supporting-document.png",
  mimeType: "image/png",
  dataUrl: "data:image/png;base64,AAAAAA==",
  purpose: "case" as const,
};

const kycFile = {
  name: "identity-document.png",
  mimeType: "image/png",
  dataUrl: "data:image/png;base64,AAAAAA==",
  purpose: "kyc" as const,
};

beforeEach(() => {
  writes.length = 0;
  updates.length = 0;
  vi.mocked(getDb).mockResolvedValue(database as never);
  vi.mocked(storagePut).mockImplementation(async (key: string) => ({ key, url: `https://storage.example/${key}` }));
  vi.mocked(notifyOwner).mockResolvedValue(undefined as never);
});

describe("Givethra workflow persistence and notification effects", () => {
  it("persists an approved KYC review and creates a user-facing KYC notification", async () => {
    const caller = appRouter.createCaller(context("admin", ENV.givethraOwnerEmail));
    await expect(caller.givethra.admin.reviewKyc({ id: 12, status: "approved", note: "Identity checks completed." })).resolves.toEqual({ success: true });

    expect(updates).toContainEqual(expect.objectContaining({ table: kycSubmissions, values: expect.objectContaining({ status: "approved", reviewedByUserId: 42 }) }));
    expect(writes).toContainEqual(expect.objectContaining({ table: notifications, values: expect.objectContaining({ userId: 701, type: "kyc", title: "KYC approved" }) }));
  });

  it("persists a rejected case review and creates a user-facing case notification", async () => {
    const caller = appRouter.createCaller(context("admin", ENV.givethraOwnerEmail));
    await expect(caller.givethra.admin.reviewCase({ id: 22, status: "rejected", note: "More supporting information is required." })).resolves.toEqual({ success: true });

    expect(updates).toContainEqual(expect.objectContaining({ table: cases, values: expect.objectContaining({ status: "rejected", reviewedByUserId: 42 }) }));
    expect(writes).toContainEqual(expect.objectContaining({ table: notifications, values: expect.objectContaining({ userId: 702, type: "case", title: "Case rejected" }) }));
  });

  it("stores a complete KYC submission as pending and alerts the owner", async () => {
    const caller = appRouter.createCaller(context("user", "applicant@example.com"));
    const result = await caller.givethra.kyc.submit({ fullName: "Applicant Name", nationalId: "12345-1234567-1", front: kycFile, back: kycFile, selfie: kycFile, video: { ...kycFile, name: "liveness.webm", mimeType: "video/webm", dataUrl: "data:video/webm;base64,AAAAAA==" } });
    await Promise.resolve();

    expect(result.status).toBe("pending");
    expect(writes).toContainEqual(expect.objectContaining({ table: kycSubmissions, values: expect.objectContaining({ userId: 42, status: "pending" }) }));
    expect(storagePut).toHaveBeenCalledTimes(4);
    expect(notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "New KYC submission" }));
  });

  it("stores a case and its evidence as pending, then alerts the owner", async () => {
    const caller = appRouter.createCaller(context("user", "applicant@example.com"));
    const result = await caller.givethra.cases.submit({ title: "Medical support needed after treatment", category: "Medical", description: "This submission describes the applicant’s treatment-related needs and the supporting evidence available for careful platform review.", documents: [caseFile, { ...caseFile, name: "proof-2.jpg" }, { ...caseFile, name: "proof-3.jpg" }], selfie: caseFile, video: { ...caseFile, name: "case-live.webm", mimeType: "video/webm", dataUrl: "data:video/webm;base64,AAAAAA==" } });
    await Promise.resolve();

    expect(result.status).toBe("pending");
    expect(writes).toContainEqual(expect.objectContaining({ table: cases, values: expect.objectContaining({ userId: 42, status: "pending", category: "Medical" }) }));
    expect(writes.some(write => Array.isArray(write.values))).toBe(true);
    expect(notifyOwner).toHaveBeenCalledWith(expect.objectContaining({ title: "New case submission" }));
  });
});
