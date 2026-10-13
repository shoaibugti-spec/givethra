import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (file: string) => readFileSync(new URL(file, import.meta.url), "utf8");

describe("mobile navigation touch targets", () => {
  it("keeps shared buttons touch-safe for homepage actions", () => {
    expect(read("./ui/button.tsx")).toContain("touch-manipulation");
    expect(read("./ui/button.tsx")).toContain("min-h-9");
  });

  it("uses full-width menu links and stable bottom-nav hit areas", () => {
    const layout = read("./Layout.tsx");
    const bottomNav = read("./BottomNav.tsx");
    expect(layout).toContain("w-full touch-manipulation select-none items-center gap-2 py-2.5");
    expect(layout).toContain("relative z-10");
    expect(bottomNav).toContain("md:hidden");
    expect(bottomNav).toContain("min-h-16 flex-1 touch-manipulation");
  });
});
