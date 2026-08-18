import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  caseFiles,
  cases,
  kycSubmissions,
  notifications,
  profiles,
  supportMessages,
  users,
} from "../../drizzle/schema";
import { getDb } from "../db";
import { notifyOwner } from "../_core/notification";
import { storagePut } from "../storage";
import { adminProcedure, hasGivethraOwnerAccess, protectedProcedure, publicProcedure, router } from "../_core/trpc";

const CASE_CATEGORIES = ["Medical", "Education", "Emergency", "Livelihood", "Housing", "Other"] as const;
const reviewStatus = z.enum(["approved", "rejected"]);
const status = z.enum(["pending", "approved", "rejected"]);

const uploadInput = z.object({
  name: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  dataUrl: z.string().min(24).max(45_000_000),
  purpose: z.enum(["avatar", "cover", "kyc", "case"]),
});

type StoredFile = { key: string; url: string; name: string; mimeType: string };

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database is unavailable" });
  return db;
}

function parseDataUrl(input: z.infer<typeof uploadInput>) {
  const match = /^data:([^;]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(input.dataUrl);
  if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid file upload format" });
  const mimeType = match[1];
  const file = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (file.length === 0 || file.length > 30 * 1024 * 1024) {
    throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Files must be smaller than 30 MB" });
  }
  return { mimeType, file };
}

async function storeFile(userId: number, input: z.infer<typeof uploadInput>): Promise<StoredFile> {
  const { mimeType, file } = parseDataUrl(input);
  if (mimeType !== input.mimeType) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "File metadata does not match its content" });
  }
  const safeName = input.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-160);
  const { key, url } = await storagePut(
    `givethra/${userId}/${input.purpose}/${Date.now()}-${safeName}`,
    file,
    mimeType,
  );
  return { key, url, name: safeName, mimeType };
}

async function addNotification(
  userId: number,
  type: "kyc" | "case" | "message" | "system",
  title: string,
  content: string,
) {
  const db = await requireDb();
  await db.insert(notifications).values({ userId, type, title, content });
}

function ownerAlert(title: string, content: string) {
  void notifyOwner({ title, content }).catch(error => {
    console.warn("[Givethra] Owner notification could not be sent", error);
  });
}

export const givethraRouter = router({
  account: router({
    ownerAccess: protectedProcedure.query(({ ctx }) => ({ isOwner: hasGivethraOwnerAccess(ctx.user) })),
  }),
  public: router({
    approvedCases: publicProcedure
      .input(z.object({ category: z.enum(CASE_CATEGORIES).optional() }).optional())
      .query(async ({ input }) => {
        const db = await requireDb();
        const filters = [eq(cases.status, "approved")];
        if (input?.category) filters.push(eq(cases.category, input.category));
        return db.select().from(cases).where(and(...filters)).orderBy(desc(cases.submittedAt));
      }),
    caseById: publicProcedure.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
      const db = await requireDb();
      const rows = await db
        .select()
        .from(cases)
        .where(and(eq(cases.id, input.id), eq(cases.status, "approved")))
        .limit(1);
      return rows[0] ?? null;
    }),
  }),

  files: router({
    upload: protectedProcedure.input(uploadInput).mutation(async ({ ctx, input }) => storeFile(ctx.user.id, input)),
  }),

  profile: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      const rows = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
      return rows[0] ?? null;
    }),
    save: protectedProcedure
      .input(z.object({
        displayName: z.string().trim().min(2).max(160).optional(),
        phone: z.string().trim().max(40).optional(),
        city: z.string().trim().max(120).optional(),
        country: z.string().trim().max(120).optional(),
        bio: z.string().trim().max(1200).optional(),
        avatarKey: z.string().max(500).nullable().optional(),
        avatarUrl: z.string().max(1000).nullable().optional(),
        coverKey: z.string().max(500).nullable().optional(),
        coverUrl: z.string().max(1000).nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await requireDb();
        await db.insert(profiles).values({ userId: ctx.user.id, ...input }).onDuplicateKeyUpdate({ set: input });
        const rows = await db.select().from(profiles).where(eq(profiles.userId, ctx.user.id)).limit(1);
        return rows[0];
      }),
  }),

  kyc: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      const rows = await db.select().from(kycSubmissions).where(eq(kycSubmissions.userId, ctx.user.id)).orderBy(desc(kycSubmissions.submittedAt)).limit(1);
      return rows[0] ?? null;
    }),
    submit: protectedProcedure
      .input(z.object({
        fullName: z.string().trim().min(3).max(180),
        nationalId: z.string().trim().min(5).max(80),
        front: uploadInput,
        back: uploadInput,
        selfie: uploadInput,
        video: uploadInput,
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.front.purpose !== "kyc" || input.back.purpose !== "kyc" || input.selfie.purpose !== "kyc" || input.video.purpose !== "kyc") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "KYC files were not assigned correctly" });
        }
        const [front, back, selfie, video] = await Promise.all([
          storeFile(ctx.user.id, input.front),
          storeFile(ctx.user.id, input.back),
          storeFile(ctx.user.id, input.selfie),
          storeFile(ctx.user.id, input.video),
        ]);
        const db = await requireDb();
        const result = await db.insert(kycSubmissions).values({
          userId: ctx.user.id,
          fullName: input.fullName,
          nationalId: input.nationalId,
          frontKey: front.key,
          frontUrl: front.url,
          backKey: back.key,
          backUrl: back.url,
          selfieKey: selfie.key,
          selfieUrl: selfie.url,
          videoKey: video.key,
          videoUrl: video.url,
          status: "pending",
        });
        ownerAlert("New KYC submission", `${ctx.user.email ?? "A user"} submitted identity verification for review.`);
        return { id: Number(result[0].insertId), status: "pending" as const };
      }),
  }),

  cases: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      return db.select().from(cases).where(eq(cases.userId, ctx.user.id)).orderBy(desc(cases.submittedAt));
    }),
    submit: protectedProcedure
      .input(z.object({
        title: z.string().trim().min(5).max(180),
        category: z.enum(CASE_CATEGORIES),
        description: z.string().trim().min(40).max(12000),
        targetAmount: z.number().int().min(500).max(1000000).default(6000),
        expiryDate: z.string().trim().max(50).optional(),
        location: z.string().trim().max(160).optional(),
        selfie: uploadInput.optional(),
        video: uploadInput.optional(),
        documents: z.array(uploadInput).min(1).max(5),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.documents.some(document => document.purpose !== "case") || (input.selfie && input.selfie.purpose !== "case") || (input.video && input.video.purpose !== "case")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Case files were not assigned correctly" });
        }
        const [documents, selfie, video] = await Promise.all([
          Promise.all(input.documents.map(document => storeFile(ctx.user.id, document))),
          input.selfie ? storeFile(ctx.user.id, input.selfie) : undefined,
          input.video ? storeFile(ctx.user.id, input.video) : undefined,
        ]);
        const db = await requireDb();
        const result = await db.insert(cases).values({
          userId: ctx.user.id,
          title: input.title,
          category: input.category,
          description: input.description,
          targetAmount: input.targetAmount,
          expiryDate: input.expiryDate ?? "8/23/2026",
          location: input.location ?? "Karachi, Pakistan",
          selfieKey: selfie?.key,
          selfieUrl: selfie?.url,
          videoKey: video?.key,
          videoUrl: video?.url,
          status: "pending",
        });
        const caseId = Number(result[0].insertId);
        if (documents.length) {
          await db.insert(caseFiles).values(documents.map(document => ({
            caseId,
            fileName: document.name,
            mimeType: document.mimeType,
            storageKey: document.key,
            storageUrl: document.url,
          })));
        }
        ownerAlert("New case submission", `${ctx.user.email ?? "A user"} submitted “${input.title}” for review.`);
        return { id: caseId, status: "pending" as const };
      }),
  }),

  notifications: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      return db.select().from(notifications).where(eq(notifications.userId, ctx.user.id)).orderBy(desc(notifications.createdAt));
    }),
    markRead: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.update(notifications).set({ isRead: 1 }).where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)));
      return { success: true };
    }),
  }),

  support: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      return db.select().from(supportMessages).where(eq(supportMessages.userId, ctx.user.id)).orderBy(supportMessages.createdAt);
    }),
    send: protectedProcedure.input(z.object({ body: z.string().trim().min(1).max(4000) })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const result = await db.insert(supportMessages).values({ userId: ctx.user.id, senderRole: "user", body: input.body });
      ownerAlert("New support message", `${ctx.user.email ?? "A user"} sent a support message.`);
      return { id: Number(result[0].insertId) };
    }),
  }),

  admin: router({
    overview: adminProcedure.query(async () => {
      const db = await requireDb();
      const [userCount, kycCount, caseCount, messageCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(users),
        db.select({ count: sql<number>`count(*)` }).from(kycSubmissions).where(eq(kycSubmissions.status, "pending")),
        db.select({ count: sql<number>`count(*)` }).from(cases).where(eq(cases.status, "pending")),
        db.select({ count: sql<number>`count(*)` }).from(supportMessages).where(eq(supportMessages.senderRole, "user")),
      ]);
      return { users: Number(userCount[0]?.count ?? 0), pendingKyc: Number(kycCount[0]?.count ?? 0), pendingCases: Number(caseCount[0]?.count ?? 0), supportMessages: Number(messageCount[0]?.count ?? 0) };
    }),
    kyc: adminProcedure.input(z.object({ state: status.optional() }).optional()).query(async ({ input }) => {
      const db = await requireDb();
      return db.select().from(kycSubmissions).where(input?.state ? eq(kycSubmissions.status, input.state) : undefined).orderBy(desc(kycSubmissions.submittedAt));
    }),
    reviewKyc: adminProcedure.input(z.object({ id: z.number().int().positive(), status: reviewStatus, note: z.string().trim().max(2000).optional() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const reviewer = ctx.user;
      if (!reviewer) throw new TRPCError({ code: "UNAUTHORIZED" });
      const record = await db.select().from(kycSubmissions).where(eq(kycSubmissions.id, input.id)).limit(1);
      if (!record[0]) throw new TRPCError({ code: "NOT_FOUND", message: "KYC submission was not found" });
      await db.update(kycSubmissions).set({ status: input.status, adminNote: input.note ?? null, reviewedByUserId: reviewer.id, reviewedAt: new Date() }).where(eq(kycSubmissions.id, input.id));
      await addNotification(record[0].userId, "kyc", `KYC ${input.status}`, input.note || `Your KYC submission has been ${input.status}.`);
      return { success: true };
    }),
    cases: adminProcedure.input(z.object({ state: status.optional() }).optional()).query(async ({ input }) => {
      const db = await requireDb();
      const records = await db.select().from(cases).where(input?.state ? eq(cases.status, input.state) : undefined).orderBy(desc(cases.submittedAt));
      const ids = records.map(record => record.id);
      const files = ids.length ? await db.select().from(caseFiles).where(inArray(caseFiles.caseId, ids)) : [];
      return records.map(record => ({ ...record, files: files.filter(file => file.caseId === record.id) }));
    }),
    reviewCase: adminProcedure.input(z.object({ id: z.number().int().positive(), status: reviewStatus, note: z.string().trim().max(2000).optional() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const reviewer = ctx.user;
      if (!reviewer) throw new TRPCError({ code: "UNAUTHORIZED" });
      const record = await db.select().from(cases).where(eq(cases.id, input.id)).limit(1);
      if (!record[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Case submission was not found" });
      await db.update(cases).set({ status: input.status, adminNote: input.note ?? null, reviewedByUserId: reviewer.id, reviewedAt: new Date() }).where(eq(cases.id, input.id));
      await addNotification(record[0].userId, "case", `Case ${input.status}`, input.note || `Your case submission has been ${input.status}.`);
      return { success: true };
    }),
    users: adminProcedure.query(async () => {
      const db = await requireDb();
      return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.createdAt));
    }),
    support: adminProcedure.query(async () => {
      const db = await requireDb();
      return db.select().from(supportMessages).orderBy(desc(supportMessages.createdAt));
    }),
    replySupport: adminProcedure.input(z.object({ userId: z.number().int().positive(), body: z.string().trim().min(1).max(4000) })).mutation(async ({ input }) => {
      const db = await requireDb();
      await db.insert(supportMessages).values({ userId: input.userId, senderRole: "admin", body: input.body });
      await addNotification(input.userId, "message", "Support replied", "You have a new message from the Givethra support team.");
      return { success: true };
    }),
  }),
});
