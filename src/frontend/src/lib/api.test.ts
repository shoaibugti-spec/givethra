import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { adminMarkSupportMessagesAsRead, adminSendSupportReply, getCaseById } from "./api";

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
        "X-Guest-ID": "session-guest",
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
      adminMarkSupportMessagesAsRead("recipient-1"),
    ).resolves.toMatchObject({ updated: true });

    expect(fetchMock).toHaveBeenCalledWith("https://givethra.org/api/admin/support/mark-read", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer verified-token",
        "X-Guest-ID": "session-guest",
      },
      body: JSON.stringify({ user_id: "recipient-1" }),
    });
  });

  it("falls back to the approved case index for a public case link when direct detail fails", async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: "Authentication or database request failed" }), { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: "case-1", status: "approved", title: "Help to pay rent." }]), { status: 200 }));

    await expect(getCaseById("case-1")).resolves.toMatchObject({ id: "case-1", status: "approved" });
    expect(fetchMock).toHaveBeenNthCalledWith(1, "https://givethra.org/api/cases/case-1", expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "https://givethra.org/api/cases/approved", expect.any(Object));
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
