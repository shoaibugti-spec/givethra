import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { adminSendSupportReply } from "./api";

describe("adminSendSupportReply", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => (key === "auth_token" ? "verified-token" : null)),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses the deployed same-origin admin reply endpoint with the current bearer token", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "reply-1", sender: "admin" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      adminSendSupportReply({ user_id: "recipient-1", message: "Your request has been reviewed." }),
    ).resolves.toMatchObject({ id: "reply-1", sender: "admin" });

    expect(fetchMock).toHaveBeenCalledWith("https://givethra.org/api/admin/support/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer verified-token",
      },
      body: JSON.stringify({ user_id: "recipient-1", message: "Your request has been reviewed." }),
    });
  });

  it("sends the persisted mark-read action when an admin opens a conversation", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ updated: true, user_id: "recipient-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      adminSendSupportReply({ user_id: "recipient-1", mark_read: true }),
    ).resolves.toMatchObject({ updated: true, user_id: "recipient-1" });

    expect(fetchMock).toHaveBeenCalledWith("https://givethra.org/api/admin/support/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer verified-token",
      },
      body: JSON.stringify({ user_id: "recipient-1", mark_read: true }),
    });
  });

  it("surfaces a Worker error instead of accepting a failed reply request", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      adminSendSupportReply({ user_id: "recipient-1", message: "Your request has been reviewed." }),
    ).rejects.toThrow("Admin access required");
  });
});
