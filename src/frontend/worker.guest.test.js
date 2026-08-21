import { describe, expect, it, vi } from "vitest";
import { handlePublicFeedback } from "./worker.js";

describe("public feedback guest flow", () => {
  it("stores an anonymous message with the Public identity", async () => {
    const run = vi.fn().mockResolvedValue({ success: true });
    const bind = vi.fn(() => ({ run }));
    const prepare = vi.fn(() => ({ bind }));
    const env = { DB: { prepare } };
    const request = new Request("https://givethra.org/api/public-feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://givethra.org",
      },
      body: JSON.stringify({ message: "The case submission page is not loading." }),
    });

    const response = await handlePublicFeedback(
      request,
      env,
      { user_id: "", email: "", full_name: "", avatar_url: "" },
      "https://givethra.org",
    );
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.user_id).toBe("public");
    expect(payload.first_name).toBe("Public Visitor");
    expect(payload.text_message).toBe("The case submission page is not loading.");
    expect(prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO feedbacks"));
    expect(bind).toHaveBeenCalledWith(
      expect.any(String),
      "public",
      "Public Visitor",
      "The case submission page is not loading.",
      expect.any(String),
    );
    expect(run).toHaveBeenCalledOnce();
  });

  it("rejects an empty guest message without touching D1", async () => {
    const prepare = vi.fn();
    const request = new Request("https://givethra.org/api/public-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "  " }),
    });

    const response = await handlePublicFeedback(
      request,
      { DB: { prepare } },
      { user_id: "", email: "", full_name: "", avatar_url: "" },
      "https://givethra.org",
    );

    expect(response.status).toBe(400);
    expect(prepare).not.toHaveBeenCalled();
  });
});
