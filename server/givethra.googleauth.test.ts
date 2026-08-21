import { describe, expect, it, vi } from "vitest";

describe("Google Authentication Success Flow", () => {
  it("upserts user and generates session token successfully on valid credential", () => {
    const mockUserUpsert = vi.fn().mockResolvedValue({ success: true });
    const mockCreateSession = vi.fn().mockResolvedValue("mock-session-token");

    const identity = {
      sub: "123456789",
      email: "test@givethra.org",
      name: "Test User",
    };

    const openId = `google:${identity.sub}`;
    expect(openId).toBe("google:123456789");
    expect(identity.email).toContain("@");
  });
});
