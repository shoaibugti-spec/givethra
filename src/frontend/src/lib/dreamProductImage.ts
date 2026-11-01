const GIVETHRA_UPLOAD_HOSTS = new Set(["givethra.org", "www.givethra.org"]);
const CANONICAL_MEDIA_ORIGIN = "https://www.givethra.org";
const FALLBACK_IMAGE = "/assets/images/placeholder.svg";

/**
 * Dream images are stored under /uploads. The apex host currently sends
 * Cross-Origin-Resource-Policy: same-origin, which blocks these images on the
 * www storefront. Always read first-party uploads from the www host instead.
 */
export function resolveDreamProductImage(value: unknown, pageOrigin?: string): string {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return FALLBACK_IMAGE;

  try {
    const base = pageOrigin || (typeof window !== "undefined" ? window.location.origin : CANONICAL_MEDIA_ORIGIN);
    const url = new URL(raw, base);

    if (url.pathname === "/uploads" && url.searchParams.has("key")) {
      const key = url.searchParams.get("key") || "";
      url.pathname = `/uploads/${key.split("/").map(encodeURIComponent).join("/")}`;
      url.search = "";
    }

    if (GIVETHRA_UPLOAD_HOSTS.has(url.hostname.toLowerCase()) && url.pathname.startsWith("/uploads/")) {
      url.protocol = "https:";
      url.hostname = "www.givethra.org";
      url.port = "";
    }

    return url.toString();
  } catch {
    return raw.startsWith("/") ? raw : FALLBACK_IMAGE;
  }
}

export { FALLBACK_IMAGE as DREAM_PRODUCT_IMAGE_FALLBACK };
