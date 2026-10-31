import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { consumeHelpMeReturnPath, rememberHelpMeReturnPath } from "./helpme";

const navSource = readFileSync(new URL("../components/BottomNav.tsx", import.meta.url), "utf8");
const reelSource = readFileSync(new URL("../pages/HelpMePage.tsx", import.meta.url), "utf8");

function mockSessionStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, String(value)),
    removeItem: (key: string) => { values.delete(key); },
    clear: () => values.clear(),
    key: (index: number) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  } as Storage;
}

describe("Help Me in-app back navigation", () => {
  const storage = mockSessionStorage();
  afterEach(() => {
    storage.clear();
    vi.unstubAllGlobals();
  });

  it("returns the originating internal screen, including query and hash, exactly once", () => {
    vi.stubGlobal("window", { location: { origin: "https://givethra.org" }, sessionStorage: storage });
    rememberHelpMeReturnPath("/my-cases?tab=expired#case-123");
    expect(consumeHelpMeReturnPath()).toBe("/my-cases?tab=expired#case-123");
    expect(consumeHelpMeReturnPath()).toBeNull();
  });

  it("rejects external, protocol-relative and Help Me paths", () => {
    vi.stubGlobal("window", { location: { origin: "https://givethra.org" }, sessionStorage: storage });
    rememberHelpMeReturnPath("https://evil.example/steal");
    expect(consumeHelpMeReturnPath()).toBeNull();
    rememberHelpMeReturnPath("//evil.example/steal");
    expect(consumeHelpMeReturnPath()).toBeNull();
    rememberHelpMeReturnPath("/helpme/new");
    expect(consumeHelpMeReturnPath()).toBeNull();
  });

  it("connects the center button to deterministic return navigation", () => {
    expect(navSource).toContain("rememberHelpMeReturnPath(");
    expect(reelSource).toContain("consumeHelpMeReturnPath()");
    expect(reelSource).not.toContain("window.history.back()");
  });
});
