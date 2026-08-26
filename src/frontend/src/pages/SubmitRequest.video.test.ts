import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const submitSource = readFileSync(new URL("./SubmitRequestPage.tsx", import.meta.url), "utf8");
const supportSource = readFileSync(new URL("./SupportChatPage.tsx", import.meta.url), "utf8");

describe("case submission video contract", () => {
  it("keeps the required appeal recording at up to 90 seconds", () => {
    expect(submitSource).toContain("sec >= 90");
    expect(submitSource).toContain("videoTimer}s / 90s");
    expect(submitSource).toContain("(videoTimer / 90) * 100");
    expect(submitSource).toContain("video appeal (up to 90 seconds)");
  });

  it("keeps the required selfie, video, and confirmation guards", () => {
    expect(submitSource).toContain('if (!selfieUrl)');
    expect(submitSource).toContain('if (!videoUrl)');
    expect(submitSource).toContain('if (!confirmed)');
    expect(submitSource).toContain("video_url: videoUrl");
  });

  it("does not give support users the old 60-second instruction", () => {
    expect(supportSource).toContain("video appeal of up to 90 seconds");
    expect(supportSource).not.toContain("60-second video appeal");
  });
});
