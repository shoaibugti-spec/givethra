import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const homePageSource = readFileSync(new URL("./HomePage.tsx", import.meta.url), "utf8");

describe("homepage public feedback composer copy", () => {
  it("explains that users can report any Givethra problem", () => {
    expect(homePageSource).toContain("What's on your mind? (Any problem with Givethra?)");
    expect(homePageSource).toContain('placeholder="Describe the problem you are experiencing..."');
    expect(homePageSource).toContain("Report a problem with sign-in, sign-up, case submission, or any other part of Givethra.");
  });

  it("does not expose internal dashboard visibility instructions", () => {
    expect(homePageSource).not.toContain("Visible only in Admin Dashboard");
    expect(homePageSource).not.toContain("Visible only in Givethra");
  });

  it("keeps the public submission action available", () => {
    expect(homePageSource).toContain("Post Message");
    expect(homePageSource).toContain('fetch("/api/public-feedback"');
  });
});
