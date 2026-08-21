import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserByEmail: vi.fn(),
  getUserByOpenId: vi.fn(),
  upsertUser: vi.fn(),
  createSessionToken: vi.fn(),
}));

vi.mock("./db", () => ({
  getUserByEmail: mocks.getUserByEmail,
  getUserByOpenId: mocks.getUserByOpenId,
  upsertUser: mocks.upsertUser,
}));

vi.mock("./_core/sdk", () => ({
  sdk: { createSessionToken: mocks.createSessionToken },
}));

import { registerGoogleAuthRoutes } from "./googleAuth";
import { COOKIE_NAME } from "../shared/const";

type Handler = (req: any, res: any) => Promise<unknown>;

function registerHandler() {
  let handler: Handler | undefined;
  const app = {
    post: vi.fn((path: string, routeHandler: Handler) => {
      if (path === "/api/auth/google") handler = routeHandler;
    }),
  };
  registerGoogleAuthRoutes(app as any);
  if (!handler) throw new Error("Google auth route was not registered");
  return handler;
}

function createResponse() {
  const response = {
    cookie: vi.fn(),
    status: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
}

describe("Google Authentication Upsert Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VITE_GOOGLE_CLIENT_ID = "test-google-client-id";
    process.env.GIVETHRA_ADMIN_EMAIL = "admin@givethra.org";
    mocks.upsertUser.mockResolvedValue(undefined);
    mocks.createSessionToken.mockResolvedValue("mock-session-token");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sub: "google-sub-123",
        email: "legacy@example.com",
        email_verified: true,
        name: "Legacy User",
      }),
    }));
  });

  it("creates a fresh D1 user when the Google email is not present", async () => {
    mocks.getUserByOpenId.mockResolvedValue(undefined);
    mocks.getUserByEmail.mockResolvedValue(undefined);
    const response = createResponse();

    await registerHandler()(
      { body: { credential: "ya29.new-user-token" }, protocol: "https" },
      response,
    );

    expect(mocks.getUserByOpenId).toHaveBeenCalledWith("google:google-sub-123");
    expect(mocks.getUserByEmail).toHaveBeenCalledWith("legacy@example.com");
    expect(mocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({
      openId: "google:google-sub-123",
      email: "legacy@example.com",
      loginMethod: "google",
      role: "user",
    }));
    expect(mocks.createSessionToken).toHaveBeenCalledWith("google:google-sub-123", { name: "Legacy User" });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.cookie).toHaveBeenCalledWith(COOKIE_NAME, "mock-session-token", expect.any(Object));
  });

  it("reuses the legacy user's existing openId when the email already exists", async () => {
    mocks.getUserByOpenId.mockResolvedValue(undefined);
    mocks.getUserByEmail.mockResolvedValue({
      id: 77,
      openId: "legacy-open-id-77",
      email: "legacy@example.com",
      name: "Old Profile",
      role: "user",
    });
    const response = createResponse();

    await registerHandler()(
      { body: { credential: "ya29.legacy-user-token" }, protocol: "https" },
      response,
    );

    expect(mocks.upsertUser).toHaveBeenCalledWith(expect.objectContaining({
      openId: "legacy-open-id-77",
      email: "legacy@example.com",
      name: "Legacy User",
      loginMethod: "google",
    }));
    expect(mocks.createSessionToken).toHaveBeenCalledWith("legacy-open-id-77", { name: "Legacy User" });
    expect(mocks.upsertUser).toHaveBeenCalledTimes(1);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({
      user: expect.objectContaining({ email: "legacy@example.com" }),
    }));
  });
});
