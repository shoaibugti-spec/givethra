// src/frontend/src/components/FilterTabs.tsx
// Pill tabs that never overlap: each tab keeps its full text and the row scrolls sideways
// when the screen is too narrow. The active tab is scrolled into view automatically.

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

export type FilterOption<T extends string> = {
  value: T;
  label: ReactNode;
  count?: number;
};

type Props<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: FilterOption<T>[];
  ariaLabel?: string;
  /** Stretch tabs to fill the row when there is enough space (default true). */
  fill?: boolean;
};

export default function FilterTabs<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  fill = true,
}: Props<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const btn = activeRef.current;
    if (!list || !btn) return;
    const target = btn.offsetLeft - (list.clientWidth - btn.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(target, 0), behavior: "smooth" });
  }, [value]);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      className="relative flex gap-1 overflow-x-auto rounded-xl bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={active ? activeRef : undefined}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={`${fill ? "flex-1" : ""} shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
            {typeof o.count === "number" && (
              <span
                className={`ml-1.5 inline-flex min-w-[1.25rem] justify-center rounded-full px-1.5 text-xs tabular-nums ${
                  active ? "bg-primary/10 text-primary" : "bg-background/60"
                }`}
              >
                {o.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
