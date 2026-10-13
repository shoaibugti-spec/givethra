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
  const original = image.dataset.originalSrc || image.currentSrc || image.src;
  const retryCount = Number(image.dataset.imageRetry || "0");

  // A mobile browser/CDN can briefly return a stale 404 or incomplete response.
  // Retry once with a cache-busting query before showing the placeholder.
  if (retryCount === 0 && original && !original.includes("placeholder.svg")) {
    image.dataset.originalSrc = original;
    image.dataset.imageRetry = "1";
    const separator = original.includes("?") ? "&" : "?";
    image.src = `${original}${separator}img_retry=${Date.now()}`;
    return;
  }

  if (image.dataset.fallbackApplied === "1") return;
  image.dataset.fallbackApplied = "1";
  image.src = FALLBACK_IMAGE;
}

export { FALLBACK_IMAGE };
