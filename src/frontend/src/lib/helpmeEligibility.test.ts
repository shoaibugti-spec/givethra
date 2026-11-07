import { afterEach, expect, it, vi } from "vitest";
import { helpme } from "./helpme";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("fetches account-specific Help Me eligibility without using a cached response", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ can_post: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);

  await helpme.eligibility();

  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining("/api/helpme/eligibility"),
    expect.objectContaining({ cache: "no-store", credentials: "include" }),
  );
});
