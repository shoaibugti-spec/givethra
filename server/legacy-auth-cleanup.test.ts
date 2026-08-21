import { describe, expect, it } from "vitest";
import { isLegacyAuthError, isLegacyAuthKey } from "../client/src/_core/legacyAuthCleanup";

describe("legacy Supabase browser cleanup predicates", () => {
  it("matches legacy Supabase storage and cookie keys case-insensitively", () => {
    expect(isLegacyAuthKey("sb-project-auth-token")).toBe(true);
    expect(isLegacyAuthKey("supabase.auth.token")).toBe(true);
    expect(isLegacyAuthKey("SB-ACCESS-TOKEN")).toBe(true);
    expect(isLegacyAuthKey("manus-cookie")).toBe(false);
    expect(isLegacyAuthKey("givethra-theme")).toBe(false);
  });

  it("recognizes legacy session errors without treating normal Cloudflare sessions as legacy", () => {
    expect(isLegacyAuthError(new Error("Supabase refresh token not found"))).toBe(true);
    expect(isLegacyAuthError({ message: "invalid refresh token for sb-access-token" })).toBe(true);
    expect(isLegacyAuthError(new Error("Please login (10001)"))).toBe(false);
    expect(isLegacyAuthError(new Error("Cloudflare session expired"))).toBe(false);
  });
});
