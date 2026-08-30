import { TRPCError } from "@trpc/server";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { z } from "zod";
import {
  caseFiles,
  cases,
  caseFeedback,
  caseInteractions,
  kycSubmissions,
  notifications,
  profiles,
  pushSubscriptions,
  publicPosts,
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
const workflowStatus = z.enum(["pending", "approved", "rejected", "complete", "expired"]);
const interactionKind = z.enum(["unlock", "contribution", "direct_help"]);
const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";
const ASSISTANT_EMAIL = "shoaibugti@gmail.com";

const uploadInput = z.object({
  name: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  dataUrl: z.string().min(24).max(45_000_000),
  purpose: z.enum(["avatar", "cover", "kyc", "case", "public"]),
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
    assistantAccess: protectedProcedure.query(({ ctx }) => ({ isAssistant: (ctx.user.email ?? "").toLowerCase() === ASSISTANT_EMAIL })),
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
        selfie: uploadInput,
        video: uploadInput,
        documents: z.array(uploadInput).length(3),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.documents.some(document => document.purpose !== "case") || input.selfie.purpose !== "case" || input.video.purpose !== "case") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Case files were not assigned correctly" });
        }
        const [documents, selfie, video] = await Promise.all([
          Promise.all(input.documents.map(document => storeFile(ctx.user.id, document))),
          storeFile(ctx.user.id, input.selfie),
          storeFile(ctx.user.id, input.video),
        ]);
        const db = await requireDb();
        const result = await db.insert(cases).values({
          userId: ctx.user.id,
          title: input.title,
          category: input.category,
          description: input.description,
          selfieKey: selfie.key,
          selfieUrl: selfie.url,
          videoKey: video.key,
          videoUrl: video.url,
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

  help: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      const rows = await db.select({ interaction: caseInteractions, case: cases }).from(caseInteractions).innerJoin(cases, eq(caseInteractions.caseId, cases.id)).where(eq(caseInteractions.userId, ctx.user.id)).orderBy(desc(caseInteractions.createdAt));
      return rows.map(row => ({ ...row.interaction, case: row.case }));
    }),
    unlock: protectedProcedure.input(z.object({ caseId: z.number().int().positive(), kind: z.enum(["contribution", "direct_help"]) })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const target = await db.select().from(cases).where(and(eq(cases.id, input.caseId), eq(cases.status, "approved"))).limit(1);
      if (!target[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Approved case was not found" });
      if (target[0].userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot help your own case" });
      const existing = await db.select().from(caseInteractions).where(and(eq(caseInteractions.caseId, input.caseId), eq(caseInteractions.userId, ctx.user.id), eq(caseInteractions.kind, input.kind))).limit(1);
      if (existing[0]) return existing[0];
      const isDirect = input.kind === "direct_help";
      const previousFree = await db.select({ count: sql<number>`count(*)` }).from(caseInteractions).where(and(eq(caseInteractions.userId, ctx.user.id), eq(caseInteractions.kind, "contribution"), eq(caseInteractions.unlockCost, 0)));
      const freeUsed = Number(previousFree[0]?.count ?? 0);
      const unlockCost = isDirect ? 1 : freeUsed < 3 ? 0 : 1;
      if (unlockCost > 0 && ctx.user.credits < unlockCost) throw new TRPCError({ code: "FORBIDDEN", message: "A credit is required to unlock this help flow" });
      if (unlockCost > 0) await db.update(users).set({ credits: sql`${users.credits} - ${unlockCost}` }).where(eq(users.id, ctx.user.id));
      const result = await db.insert(caseInteractions).values({ caseId: input.caseId, userId: ctx.user.id, kind: input.kind, status: "pending", unlockCost });
      return { id: Number(result[0].insertId), caseId: input.caseId, kind: input.kind, status: "pending", unlockCost };
    }),
    submit: protectedProcedure.input(z.object({ interactionId: z.number().int().positive(), amount: z.number().int().positive(), txnNumber: z.string().trim().min(3).max(180), paymentProof: uploadInput })).mutation(async ({ ctx, input }) => {
      if (input.paymentProof.purpose !== "case") throw new TRPCError({ code: "BAD_REQUEST", message: "Payment proof was not assigned correctly" });
      const db = await requireDb();
      const row = await db.select().from(caseInteractions).where(and(eq(caseInteractions.id, input.interactionId), eq(caseInteractions.userId, ctx.user.id))).limit(1);
      if (!row[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Help unlock was not found" });
      const proof = await storeFile(ctx.user.id, input.paymentProof);
      await db.update(caseInteractions).set({ amount: input.amount, txnNumber: input.txnNumber, paymentProofKey: proof.key, paymentProofUrl: proof.url, status: "pending" }).where(eq(caseInteractions.id, row[0].id));
      ownerAlert("New help payment submission", `${ctx.user.email ?? "A user"} submitted a ${row[0].kind} payment for case #${row[0].caseId}.`);
      return { success: true };
    }),
    feedback: protectedProcedure.input(z.object({ caseId: z.number().int().positive(), video: uploadInput, caption: z.string().trim().min(1).max(2000) })).mutation(async ({ ctx, input }) => {
      if (input.video.purpose !== "case" || !input.video.mimeType.startsWith("video/")) throw new TRPCError({ code: "BAD_REQUEST", message: "Feedback must include a video file" });
      const db = await requireDb();
      const target = await db.select().from(cases).where(and(eq(cases.id, input.caseId), eq(cases.status, "complete"))).limit(1);
      if (!target[0]) throw new TRPCError({ code: "BAD_REQUEST", message: "Feedback is available only after case completion" });
      const proof = await storeFile(ctx.user.id, input.video);
      const result = await db.insert(caseFeedback).values({ caseId: input.caseId, userId: ctx.user.id, videoKey: proof.key, videoUrl: proof.url, caption: input.caption, status: "pending" });
      ownerAlert("New case feedback", `${ctx.user.email ?? "A user"} submitted feedback for case #${input.caseId}.`);
      return { id: Number(result[0].insertId), status: "pending" as const };
    }),
  }),

  notifications: router({
    mine: protectedProcedure.query(async ({ ctx }) => {
      const db = await requireDb();
      return db.select().from(notifications).where(eq(notifications.userId, ctx.user.id)).orderBy(desc(notifications.createdAt));
    }),
    savePushSubscription: protectedProcedure.input(z.object({
      endpoint: z.string().min(1),
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.userId, ctx.user.id), eq(pushSubscriptions.endpoint, input.endpoint)));
      await db.insert(pushSubscriptions).values({
        userId: ctx.user.id,
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
      });
      return { success: true };
    }),
    markRead: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.update(notifications).set({ isRead: 1 }).where(and(eq(notifications.id, input.id), eq(notifications.userId, ctx.user.id)));
      return { success: true };
    }),
  }),

  publicPosts: router({
    uploadImage: publicProcedure.input(uploadInput).mutation(async ({ ctx, input }) => {
      if (input.purpose !== "public" || !input.mimeType.startsWith("image/")) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Public feedback attachments must be images." });
      }
      return storeFile(ctx.user?.id ?? 0, input);
    }),
    submit: publicProcedure
      .input(
        z.object({
          authorName: z.string().trim().min(1).max(160),
          authorEmail: z.string().trim().email().optional().or(z.literal("")),
          content: z.string().trim().min(1).max(2000),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await requireDb();
        const userId = ctx.user?.id ?? null;
        await db.insert(publicPosts).values({
          userId,
          authorName: input.authorName || (ctx.user?.name ?? "Guest Visitor"),
          authorEmail: input.authorEmail ? input.authorEmail : (ctx.user?.email ?? null),
          content: input.content,
          imageUrl: input.imageUrl ?? null,
          status: "pending",
        });
        ownerAlert("New Public Post ('What's on your mind')", `${input.authorName} posted: "${input.content.slice(0, 100)}..."`);
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
      const [userCount, kycCount, caseCount, messageCount, publicPostCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(users),
        db.select({ count: sql<number>`count(*)` }).from(kycSubmissions).where(eq(kycSubmissions.status, "pending")),
        db.select({ count: sql<number>`count(*)` }).from(cases).where(eq(cases.status, "pending")),
        db.select({ count: sql<number>`count(*)` }).from(supportMessages).where(eq(supportMessages.senderRole, "user")),
        db.select({ count: sql<number>`count(*)` }).from(publicPosts).where(eq(publicPosts.status, "pending")),
      ]);
      return {
        users: Number(userCount[0]?.count ?? 0),
        pendingKyc: Number(kycCount[0]?.count ?? 0),
        pendingCases: Number(caseCount[0]?.count ?? 0),
        supportMessages: Number(messageCount[0]?.count ?? 0),
        publicPosts: Number(publicPostCount[0]?.count ?? 0),
      };
    }),
    publicPosts: adminProcedure.query(async () => {
      const db = await requireDb();
      return db.select().from(publicPosts).orderBy(desc(publicPosts.createdAt));
    }),
    updatePublicPost: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum(["pending", "read", "resolved"]),
          adminReply: z.string().trim().max(2000).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = await requireDb();
        await db
          .update(publicPosts)
          .set({
            status: input.status,
            adminReply: input.adminReply !== undefined ? input.adminReply : undefined,
          })
          .where(eq(publicPosts.id, input.id));
        return { success: true };
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
    cases: adminProcedure.input(z.object({ state: workflowStatus.optional(), query: z.string().trim().max(180).optional() }).optional()).query(async ({ input }) => {
      const db = await requireDb();
      const filters = [] as any[];
      if (input?.state) filters.push(eq(cases.status, input.state));
      if (input?.query) { const term = `%${input.query}%`; filters.push(or(like(cases.title, term), like(cases.category, term), like(cases.description, term), like(sql<string>`cast(${cases.id} as char)`, term), like(sql<string>`cast(${users.id} as char)`, term), like(users.name, term), like(users.email, term))); }
      const joined = await db.select({ case: cases, user: users }).from(cases).innerJoin(users, eq(cases.userId, users.id)).where(filters.length ? and(...filters) : undefined).orderBy(desc(cases.submittedAt));
      const records = joined.map(row => ({ ...row.case, owner: row.user }));
      const ids = records.map(record => record.id);
      const files = ids.length ? await db.select().from(caseFiles).where(inArray(caseFiles.caseId, ids)) : [];
      const ownerIds = Array.from(new Set(records.map(record => record.userId)));
      const identities = ownerIds.length ? await db.select({ userId: kycSubmissions.userId, nationalId: kycSubmissions.nationalId }).from(kycSubmissions).where(inArray(kycSubmissions.userId, ownerIds)).orderBy(desc(kycSubmissions.submittedAt)) : [];
      return records.map(record => {
        const itemFiles = files.filter(file => file.caseId === record.id);
        const augmented = [...itemFiles];
        if (record.selfieUrl && !augmented.some(f => f.storageUrl === record.selfieUrl)) {
          augmented.push({ id: -1, caseId: record.id, fileName: "Selfie Appeal", mimeType: "image/jpeg", storageKey: record.selfieKey || "", storageUrl: record.selfieUrl, createdAt: record.submittedAt });
        }
        if (record.videoUrl && !augmented.some(f => f.storageUrl === record.videoUrl)) {
          augmented.push({ id: -2, caseId: record.id, fileName: "Video Appeal", mimeType: "video/mp4", storageKey: record.videoKey || "", storageUrl: record.videoUrl, createdAt: record.submittedAt });
        }
        const identity = identities.find(item => item.userId === record.userId);
        return { ...record, owner: { ...record.owner, nationalId: identity?.nationalId ?? null }, files: augmented };
      });
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
    interactions: adminProcedure.input(z.object({ query: z.string().trim().max(180).optional(), kind: interactionKind.optional(), state: workflowStatus.optional() }).optional()).query(async ({ input }) => {
      const db = await requireDb();
      const filters = [] as any[];
      if (input?.kind) filters.push(eq(caseInteractions.kind, input.kind));
      if (input?.state) filters.push(eq(caseInteractions.status, input.state));
      if (input?.query) {
        const term = `%${input.query}%`;
        filters.push(or(like(cases.title, term), like(sql<string>`cast(${cases.id} as char)`, term), like(sql<string>`cast(${users.id} as char)`, term), like(users.name, term), like(users.email, term), like(caseInteractions.txnNumber, term)));
      }
      const rows = await db.select({ interaction: caseInteractions, case: cases, user: users }).from(caseInteractions).innerJoin(cases, eq(caseInteractions.caseId, cases.id)).innerJoin(users, eq(caseInteractions.userId, users.id)).where(filters.length ? and(...filters) : undefined).orderBy(desc(caseInteractions.createdAt));
      return rows.map(row => ({ ...row.interaction, case: row.case, user: row.user }));
    }),
    updateInteraction: adminProcedure.input(z.object({ id: z.number().int().positive(), status: workflowStatus, note: z.string().trim().max(2000).optional() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const reviewer = ctx.user;
      if (!reviewer) throw new TRPCError({ code: "UNAUTHORIZED" });
      const row = await db.select().from(caseInteractions).where(eq(caseInteractions.id, input.id)).limit(1);
      if (!row[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Help interaction was not found" });
      const isComplete = input.status === "complete";
      const grade = row[0].kind === "direct_help" ? "Hero of complete direct help" : input.status === "approved" || isComplete ? "Contribution hero" : "Unlock hero";
      await db.update(caseInteractions).set({ status: input.status, adminNote: input.note ?? null, grade, reviewedByUserId: reviewer.id, reviewedAt: new Date(), completedAt: isComplete ? new Date() : null }).where(eq(caseInteractions.id, input.id));
      if (isComplete) await db.update(cases).set({ status: "complete", reviewedByUserId: reviewer.id, reviewedAt: new Date() }).where(eq(cases.id, row[0].caseId));
      await addNotification(row[0].userId, "system", `Help ${input.status}`, input.note || `Your ${row[0].kind} help record is now ${input.status}.`);
      return { success: true };
    }),
    feedback: adminProcedure.input(z.object({ query: z.string().trim().max(180).optional(), state: z.enum(["pending", "approved", "rejected"]).optional() }).optional()).query(async ({ input }) => {
      const db = await requireDb();
      const filters = [] as any[];
      if (input?.state) filters.push(eq(caseFeedback.status, input.state));
      if (input?.query) { const term = `%${input.query}%`; filters.push(or(like(cases.title, term), like(sql<string>`cast(${cases.id} as char)`, term), like(users.name, term), like(users.email, term), like(caseFeedback.caption, term))); }
      const rows = await db.select({ feedback: caseFeedback, case: cases, user: users }).from(caseFeedback).innerJoin(cases, eq(caseFeedback.caseId, cases.id)).innerJoin(users, eq(caseFeedback.userId, users.id)).where(filters.length ? and(...filters) : undefined).orderBy(desc(caseFeedback.createdAt));
      return rows.map(row => ({ ...row.feedback, case: row.case, user: row.user }));
    }),
    reviewFeedback: adminProcedure.input(z.object({ id: z.number().int().positive(), status: reviewStatus, note: z.string().trim().max(2000).optional() })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      const reviewer = ctx.user;
      if (!reviewer) throw new TRPCError({ code: "UNAUTHORIZED" });
      const row = await db.select().from(caseFeedback).where(eq(caseFeedback.id, input.id)).limit(1);
      if (!row[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Case feedback was not found" });
      await db.update(caseFeedback).set({ status: input.status, adminNote: input.note ?? null, reviewedByUserId: reviewer.id, reviewedAt: new Date() }).where(eq(caseFeedback.id, input.id));
      await addNotification(row[0].userId, "system", `Feedback ${input.status}`, input.note || `Your case feedback has been ${input.status}.`);
      return { success: true };
    }),
    suspendUser: adminProcedure.input(z.object({ userId: z.number().int().positive(), note: z.string().trim().min(1).max(2000) })).mutation(async ({ ctx, input }) => {
      const db = await requireDb();
      await db.update(users).set({ accountStatus: "suspended", suspendedAt: new Date(), suspensionNote: input.note }).where(eq(users.id, input.userId));
      await addNotification(input.userId, "system", "Account suspended", input.note);
      return { success: true };
    }),
    reactivateUser: protectedProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      if ((ctx.user.email ?? "").toLowerCase() !== ASSISTANT_EMAIL && !hasGivethraOwnerAccess(ctx.user)) throw new TRPCError({ code: "FORBIDDEN", message: "Only the configured assistant or owner can reactivate an account" });
      const db = await requireDb();
      const target = await db.select({ credits: users.credits }).from(users).where(eq(users.id, input.userId)).limit(1);
      if (!target[0] || target[0].credits < 5) throw new TRPCError({ code: "FORBIDDEN", message: "Five credits are required for reactivation" });
      await db.update(users).set({ accountStatus: "active", credits: sql`${users.credits} - 5`, suspendedAt: null, suspensionNote: null }).where(eq(users.id, input.userId));
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
