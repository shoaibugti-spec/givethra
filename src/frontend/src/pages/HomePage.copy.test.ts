import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homePageSource = readFileSync(new URL("./HomePage.tsx", import.meta.url), "utf8");

describe("homepage public feedback composer copy", () => {
  it("explains that users can report any Givethra problem", () => {
    expect(homePageSource).toContain('id="public-post"');
    expect(homePageSource).toContain("Public Post");
    expect(homePageSource).toContain('placeholder="Write your message..."');
    expect(homePageSource).toContain("Share any message about Givethra here.");
    expect(homePageSource).toContain("<textarea");
  });

  it("does not expose internal dashboard visibility instructions", () => {
    expect(homePageSource).not.toContain("Visible only in Admin Dashboard");
    expect(homePageSource).not.toContain("Visible only in Givethra");
    expect(homePageSource).not.toContain("Public Help & Feedback Box");
  });

  it("keeps the public submission action available", () => {
    expect(homePageSource).toContain("Post Message");
    expect(homePageSource).toContain('fetch("/api/public-feedback"');
  });

  it("shows a clear success confirmation only after the server accepts the message", () => {
    expect(homePageSource).toContain('toast.success("Success! Your message has been sent to Givethra.");');
    expect(homePageSource).toContain("if (!res.ok)");
    expect(homePageSource).toContain("toast.error");
  });
});
