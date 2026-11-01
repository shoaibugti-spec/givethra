// src/frontend/src/lib/helpmeThumbnail.ts
// Share-preview poster: a SQUARE 600x600 JPEG that shows the WHOLE vertical frame (no zoom/crop).
// WhatsApp / Telegram / Facebook show square posters as a small card (like YouTube Shorts links),
// so the full 9:16 frame sits in the middle on a soft colour-matched background.
const SIZE = 600;

// kept from the previous version in case other files import it
export type ThumbnailSize = { width: number; height: number };
export function getHelpMeThumbnailSize(width: number, height: number, maxEdge = 720): ThumbnailSize {
  if (![width, height, maxEdge].every(Number.isFinite) || width <= 0 || height <= 0 || maxEdge <= 0) {
    throw new Error("Video dimensions are unavailable");
  }
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function waitFor(video: HTMLVideoElement, ok: "loadeddata" | "seeked", ms: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => (ok === "seeked" ? resolve() : reject(new Error("Video poster timeout"))), ms);
    video.addEventListener(ok, () => { window.clearTimeout(t); resolve(); }, { once: true });
    video.addEventListener("error", () => { window.clearTimeout(t); reject(new Error("Video poster failed")); }, { once: true });
  });
}

export async function captureHelpMeThumbnail(blob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(blob);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = url;
  try {
    await waitFor(video, "loadeddata", 8000);
    const target = Number.isFinite(video.duration) && video.duration > 0 ? Math.min(1, video.duration * 0.3) : 0.8;
    const seeked = waitFor(video, "seeked", 3000);
    try { video.currentTime = target; await seeked; } catch { /* use the first frame */ }

    return await posterFromVideo(video);
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}

/** Draws the current frame of any <video> as the square share poster (whole vertical frame, nothing cropped). */
export async function posterFromVideo(video: HTMLVideoElement): Promise<Blob> {
  const vw = video.videoWidth, vh = video.videoHeight;
  if (!vw || !vh) throw new Error("No video frame");
  const canvas = document.createElement("canvas");
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas");

  // soft background: shrink the frame to 24px, stretch it back (works on every browser, no ctx.filter needed)
  const tiny = document.createElement("canvas");
  tiny.width = 24; tiny.height = 24;
  tiny.getContext("2d")?.drawImage(video, 0, 0, 24, 24);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(tiny, 0, 0, SIZE, SIZE);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(0, 0, SIZE, SIZE);

  // the whole frame, never cropped
  const scale = Math.min(SIZE / vw, SIZE / vh);
  const w = vw * scale, h = vh * scale;
  ctx.drawImage(video, (SIZE - w) / 2, (SIZE - h) / 2, w, h);

  const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!out || out.size < 500) throw new Error("Poster could not be created");
  return out;
}
