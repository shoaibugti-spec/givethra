export type ThumbnailSize = { width: number; height: number };

export function getHelpMeThumbnailSize(width: number, height: number, maxEdge = 720): ThumbnailSize {
  if (![width, height, maxEdge].every(Number.isFinite) || width <= 0 || height <= 0 || maxEdge <= 0) {
    throw new Error("Video dimensions are unavailable");
  }
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

function waitForLoadedFrame(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => finish(new Error("Video frame is not ready")), 10000);
    const loaded = () => finish();
    const failed = () => finish(new Error("Video frame could not be decoded"));
    const finish = (error?: Error) => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadeddata", loaded);
      video.removeEventListener("error", failed);
      error ? reject(error) : resolve();
    };
    video.addEventListener("loadeddata", loaded, { once: true });
    video.addEventListener("error", failed, { once: true });
  });
}

async function seekToPosterFrame(video: HTMLVideoElement): Promise<void> {
  const time = Math.min(0.5, Math.max(0, (Number.isFinite(video.duration) ? video.duration : 1) * 0.08));
  if (!time) return;
  await new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      video.removeEventListener("seeked", finish);
      resolve();
    };
    const timeout = window.setTimeout(finish, 1500);
    video.addEventListener("seeked", finish, { once: true });
    try { video.currentTime = time; } catch { finish(); }
  });
}

/** Capture a small local poster; callers may continue submitting the video if a device cannot decode it. */
export async function captureHelpMeThumbnail(videoBlob: Blob): Promise<Blob> {
  if (typeof document === "undefined" || typeof URL.createObjectURL !== "function") {
    throw new Error("Video thumbnail capture is unavailable");
  }
  const objectUrl = URL.createObjectURL(videoBlob);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = objectUrl;
  try {
    video.load();
    await waitForLoadedFrame(video);
    await seekToPosterFrame(video);
    const { width, height } = getHelpMeThumbnailSize(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Video thumbnail could not be created");
    context.drawImage(video, 0, 0, width, height);
    const poster = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Video thumbnail could not be encoded")), "image/jpeg", 0.82);
    });
    if (!poster.size) throw new Error("Video thumbnail is empty");
    return poster;
  } finally {
    video.pause();
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}
