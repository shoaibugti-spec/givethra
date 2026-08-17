import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq } from "drizzle-orm";
import { cases, kycSubmissions, notifications, users } from "../drizzle/schema";
import { getDb } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ENV } from "./_core/env";

const databaseSuite = process.env.RUN_GIVETHRA_DB_INTEGRATION === "1" ? describe : describe.skip;
const marker = `givethra-integration-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

let db: NonNullable<Awaited<ReturnType<typeof getDb>>>;
let applicantId = 0;
let ownerId = 0;
let kycId = 0;
let caseId = 0;

function ownerContext(): TrpcContext {
  return {
    user: {
      id: ownerId,
      openId: `${marker}-owner-context`,
      name: "Integration Owner",
      email: ENV.givethraOwnerEmail,
      loginMethod: "google",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

databaseSuite("Givethra real-database review integration", () => {
  beforeAll(async () => {
    const connection = await getDb();
    if (!connection) throw new Error("Database connection is required for integration tests");
    db = connection;
    const applicant = await db.insert(users).values({ openId: `${marker}-applicant`, name: "Integration Applicant", email: `${marker}@example.invalid`, loginMethod: "test", role: "user" });
    applicantId = Number(applicant[0].insertId);
    const owner = await db.insert(users).values({ openId: `${marker}-owner`, name: "Integration Owner", email: ENV.givethraOwnerEmail, loginMethod: "test", role: "admin" });
    ownerId = Number(owner[0].insertId);

    const kyc = await db.insert(kycSubmissions).values({
      userId: applicantId,
      fullName: "Integration Applicant",
      nationalId: marker,
      frontKey: `${marker}/front`, frontUrl: `https://example.invalid/${marker}/front`,
      backKey: `${marker}/back`, backUrl: `https://example.invalid/${marker}/back`,
      selfieKey: `${marker}/selfie`, selfieUrl: `https://example.invalid/${marker}/selfie`,
      videoKey: `${marker}/video`, videoUrl: `https://example.invalid/${marker}/video`,
      status: "pending",
    });
    kycId = Number(kyc[0].insertId);

    const submittedCase = await db.insert(cases).values({
      userId: applicantId,
      title: `Integration case ${marker}`,
      category: "Medical",
      description: "Temporary integration-test case created only to verify review status and notification persistence, then removed in cleanup.",
      status: "pending",
    });
    caseId = Number(submittedCase[0].insertId);
  });

  afterAll(async () => {
    if (!db || !applicantId) return;
    await db.delete(notifications).where(eq(notifications.userId, applicantId));
    if (kycId) await db.delete(kycSubmissions).where(eq(kycSubmissions.id, kycId));
    if (caseId) await db.delete(cases).where(eq(cases.id, caseId));
    await db.delete(users).where(eq(users.id, applicantId));
    if (ownerId) await db.delete(users).where(eq(users.id, ownerId));
  });

  it("persists an approved KYC decision and its user notification", async () => {
    const caller = appRouter.createCaller(ownerContext());
    await expect(caller.givethra.admin.reviewKyc({ id: kycId, status: "approved", note: "Integration approval" })).resolves.toEqual({ success: true });

    const reviewed = await db.select().from(kycSubmissions).where(eq(kycSubmissions.id, kycId)).limit(1);
    const alert = await db.select().from(notifications).where(and(eq(notifications.userId, applicantId), eq(notifications.type, "kyc"))).limit(1);
    expect(reviewed[0]).toMatchObject({ status: "approved", adminNote: "Integration approval", reviewedByUserId: ownerId });
    expect(alert[0]).toMatchObject({ title: "KYC approved", content: "Integration approval" });
  });

  it("persists a rejected case decision and its user notification", async () => {
    const caller = appRouter.createCaller(ownerContext());
    await expect(caller.givethra.admin.reviewCase({ id: caseId, status: "rejected", note: "Integration rejection" })).resolves.toEqual({ success: true });

    const reviewed = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
    const alert = await db.select().from(notifications).where(and(eq(notifications.userId, applicantId), eq(notifications.type, "case"))).limit(1);
    expect(reviewed[0]).toMatchObject({ status: "rejected", adminNote: "Integration rejection", reviewedByUserId: ownerId });
    expect(alert[0]).toMatchObject({ title: "Case rejected", content: "Integration rejection" });
  });
});
