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

    const posts = await adminCaller.givethra.admin.publicPosts();
    expect(posts.length).toBeGreaterThan(0);
    const latest = posts[0];
    expect(latest.authorName).toBe("Visitor Ali");
    expect(latest.content).toContain("sign-in button");

    const updateRes = await adminCaller.givethra.admin.updatePublicPost({
      id: latest.id,
      status: "resolved",
      adminReply: "Thank you Ali, we have added a direct login link.",
    });
    expect(updateRes).toEqual({ success: true });
  });
