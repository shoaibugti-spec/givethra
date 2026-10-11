import type { SyntheticEvent } from "react";

const FALLBACK_IMAGE = "/assets/images/placeholder.svg";

export function resolveMediaUrl(value: unknown): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return FALLBACK_IMAGE;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.pathname === "/uploads" && url.searchParams.get("key")) {
      const key = url.searchParams.get("key") || "";
      url.pathname = `/uploads/${key.split("/").map(encodeURIComponent).join("/")}`;
      url.search = "";
    }
    return url.toString();
  } catch {
    return raw.startsWith("/") ? raw : FALLBACK_IMAGE;
  }
}

export function handleImageError(event: SyntheticEvent<HTMLImageElement>): void {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === "1") return;
  image.dataset.fallbackApplied = "1";
  image.src = FALLBACK_IMAGE;
}

export { FALLBACK_IMAGE };
