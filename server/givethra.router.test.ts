import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { hasGivethraOwnerAccess } from "./_core/trpc";
import { ENV } from "./_core/env";

function createContext(role: "user" | "admin", email = "test@example.com"): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-open-id",
      name: "Test User",
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

const imageUpload = {
  name: "evidence.png",
  mimeType: "image/png",
  dataUrl: "data:image/png;base64,AAAAAA==",
  purpose: "case" as const,
};

describe("Givethra workflow permissions and validation", () => {
  it("grants the owner dashboard only to the configured owner with the admin role", () => {
    const ownerEmail = ENV.givethraOwnerEmail;
    expect(ownerEmail).not.toBe("");
    expect(hasGivethraOwnerAccess(createContext("admin", ownerEmail).user)).toBe(true);
    expect(hasGivethraOwnerAccess(createContext("admin", "another-admin@example.com").user)).toBe(false);
    expect(hasGivethraOwnerAccess(createContext("user", ownerEmail).user)).toBe(false);
  });

  it("returns the configured owner decision through the authenticated access-status procedure", async () => {
    const owner = appRouter.createCaller(createContext("admin", ENV.givethraOwnerEmail));
    const nonOwner = appRouter.createCaller(createContext("admin", "another-admin@example.com"));
    await expect(owner.givethra.account.ownerAccess()).resolves.toEqual({ isOwner: true });
    await expect(nonOwner.givethra.account.ownerAccess()).resolves.toEqual({ isOwner: false });
  });

  it("does not expose owner review procedures to standard users", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.givethra.admin.overview()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows only approved or rejected as final owner review outcomes", async () => {
    const caller = appRouter.createCaller(createContext("admin", ENV.givethraOwnerEmail));
    await expect(caller.givethra.admin.reviewKyc({ id: 1, status: "pending" as never })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects KYC evidence that is not explicitly assigned to the private KYC workflow", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    const incorrectFile = { ...imageUpload, purpose: "avatar" as const };
    await expect(caller.givethra.kyc.submit({ fullName: "Test Person", nationalId: "12345", front: incorrectFile, back: incorrectFile, selfie: incorrectFile, video: incorrectFile })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects case selfie media that does not belong to the private case workflow", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.givethra.cases.submit({ title: "A respectful medical support request", category: "Medical", description: "This description is intentionally long enough to pass the minimum validation requirements for a reviewable case.", documents: [imageUpload], selfie: { ...imageUpload, purpose: "avatar" } })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});


  it("rejects non-image or non-public-purpose attachments for guest feedback", async () => {
    const publicCaller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });

    await expect(publicCaller.givethra.publicPosts.uploadImage(imageUpload)).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(publicCaller.givethra.publicPosts.uploadImage({ ...imageUpload, purpose: "public", mimeType: "application/pdf" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("allows unauthenticated public visitors to submit feedback posts and allows admins to review and update them", async () => {
    const publicCaller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: {} as any,
    });
    const adminCaller = appRouter.createCaller(createContext("admin", ENV.givethraOwnerEmail));

    const submitRes = await publicCaller.givethra.publicPosts.submit({
      authorName: "Visitor Ali",
      authorEmail: "ali@example.com",
      content: "I cannot find the sign-in button on mobile browsers.",
    });
    expect(submitRes).toEqual({ success: true });

    const overview = await adminCaller.givethra.admin.overview();
    expect(overview.publicPosts).toBeGreaterThan(0);

    const posts = await adminCaller.givethra.admin.publicPosts();
    expect(posts.length).toBeGreaterThan(0);
    const latest = posts[0];
    expect(latest.authorName).toBe("Visitor Ali");
    expect(latest.content).toContain("sign-in button");
    expect(latest.status).toBe("pending");

    const updateRes = await adminCaller.givethra.admin.updatePublicPost({
      id: latest.id,
      status: "resolved",
      adminReply: "Thank you Ali, we have added a direct login link.",
    });
    expect(updateRes).toEqual({ success: true });
  });


describe("public feedback chat", () => {
  it("accepts a guest message, groups it into an admin thread, and supports an admin reply", async () => {
    let issuedSession = "";
    const publicCaller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: { "x-forwarded-for": "203.0.113.44" } } as any,
      res: { cookie: (_name: string, value: string) => { issuedSession = value; } } as any,
    });
    const adminCaller = appRouter.createCaller(createContext("admin", ENV.givethraOwnerEmail));
    const marker = `Guest feedback ${Date.now()}`;

    const submitted = await publicCaller.givethra.feedbacks.submit({ content: marker });
    expect(submitted.success).toBe(true);
    expect(issuedSession).toBeTruthy();

    const threads = await adminCaller.givethra.admin.feedbacks();
    const thread = threads.find(item => item.messages.some(message => message.content === marker));
    expect(thread).toBeDefined();
    expect(thread?.senderName).toBe("Guest Visitor");
    expect(thread?.ipAddress).toBe("203.0.113.44");
    expect(thread?.messages.some(message => message.status === "unread")).toBe(true);

    const message = thread?.messages.find(item => item.content === marker);
    expect(message).toBeDefined();
    await expect(adminCaller.givethra.admin.updateFeedback({ id: message!.id, status: "replied", adminReply: "Thanks for letting us know." })).resolves.toEqual({ success: true });
  });
});


describe("public feedback validation", () => {
  it("rejects empty messages before persistence", async () => {
    const publicCaller = appRouter.createCaller({
      user: null,
      req: { protocol: "https", headers: {} } as any,
      res: { cookie: () => undefined } as any,
    });
    await expect(publicCaller.givethra.feedbacks.submit({ content: "   " })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
