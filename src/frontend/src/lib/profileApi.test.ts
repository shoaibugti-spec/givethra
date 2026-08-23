import { afterEach, describe, expect, it, vi } from "vitest";
import { getProfile, updateProfile } from "./api";

describe("profile persistence API", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses fresh reads and returns the profile persisted by the worker", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({
        user_id: "user-1",
        full_name: "Updated User",
        phone_number: "+1 555 0100",
        country: "Pakistan",
        bio: "A persisted bio",
        avatar_url: "/uploads/avatar-new",
        cover_url: "/uploads/cover-new",
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        user_id: "user-1",
        full_name: "Updated User",
      }), { status: 200 }));

    await expect(updateProfile("user-1", {
      full_name: "Updated User",
      phone_number: "+1 555 0100",
      country: "Pakistan",
      bio: "A persisted bio",
      avatar_url: "/uploads/avatar-new",
      cover_url: "/uploads/cover-new",
    })).resolves.toMatchObject({ user_id: "user-1", full_name: "Updated User" });
    await expect(getProfile("user-1")).resolves.toMatchObject({ user_id: "user-1", full_name: "Updated User" });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "https://givethra.org/api/profiles/user-1", expect.objectContaining({
      method: "PUT",
      cache: "no-store",
    }));
    expect(fetchMock).toHaveBeenNthCalledWith(2, "https://givethra.org/api/profiles/user-1", expect.objectContaining({
      cache: "no-store",
    }));
  });

  it("surfaces a failed profile write instead of allowing a false success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: "Profile update could not be verified" }), { status: 500 }));
    await expect(updateProfile("user-1", { full_name: "Will Not Persist" })).rejects.toThrow("Profile update could not be verified");
  });
});
