export type HelpMeCameraFacing = "user" | "environment";

/** Accept only a true vertical 9:16 recording; display CSS must not disguise landscape uploads. */
export function isHelpMePortraitRecording(width: number, height: number): boolean {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0 || height <= width) return false;
  return Math.abs(width / height - 9 / 16) <= 0.01;
}

export function isHelpMePortraitViewport(width: number, height: number, orientationType?: string): boolean {
  if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0 && width !== height) return height > width;
  const orientation = orientationType?.toLowerCase();
  if (orientation?.startsWith("portrait")) return true;
  if (orientation?.startsWith("landscape")) return false;
  return false;
}

export function getHelpMeContainedFrameRect(sourceWidth: number, sourceHeight: number, targetWidth = 720, targetHeight = 1280) {
  if (![sourceWidth, sourceHeight, targetWidth, targetHeight].every(Number.isFinite) || sourceWidth <= 0 || sourceHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) return null;
  const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  return { x: (targetWidth - width) / 2, y: (targetHeight - height) / 2, width, height };
}

export function getHelpMeCameraFrameLayout(sourceWidth: number, sourceHeight: number, targetWidth = 720, targetHeight = 1280, rotateLandscapeToPortrait = false) {
  if (![sourceWidth, sourceHeight, targetWidth, targetHeight].every(Number.isFinite) || sourceWidth <= 0 || sourceHeight <= 0 || targetWidth <= 0 || targetHeight <= 0) return null;
  const rotationDegrees = sourceWidth > sourceHeight ? 90 : 0;
  if (rotationDegrees === 90 && !rotateLandscapeToPortrait) return null;
  const frame = rotationDegrees === 90
    ? getHelpMeContainedFrameRect(sourceHeight, sourceWidth, targetWidth, targetHeight)
    : getHelpMeContainedFrameRect(sourceWidth, sourceHeight, targetWidth, targetHeight);
  return frame ? { ...frame, rotationDegrees: rotationDegrees as 0 | 90 } : null;
}

type ZoomRange = { min: number; max: number };
type CameraCapabilitiesWithZoom = MediaTrackCapabilities & { zoom?: ZoomRange };
type CameraConstraintWithZoom = MediaTrackConstraintSet & { zoom?: number };

/** Ask for a portrait camera stream, preferring a normal, un-cropped sensor view. */
export function getHelpMeCameraConstraints(facing: HelpMeCameraFacing): MediaStreamConstraints {
  return {
    video: {
      facingMode: { exact: facing },
      width: { ideal: 720 },
      height: { ideal: 1280 },
      aspectRatio: { ideal: 9 / 16 },
      frameRate: { ideal: 30, max: 30 },
    },
    audio: { echoCancellation: true, noiseSuppression: true },
  };
}

/** Reset optical/digital zoom when the browser exposes camera zoom controls. */
export async function resetHelpMeCameraZoom(track: MediaStreamTrack): Promise<void> {
  try {
    if (typeof track.getCapabilities !== "function" || typeof track.applyConstraints !== "function") return;
    const zoom = (track.getCapabilities() as CameraCapabilitiesWithZoom).zoom;
    if (!zoom || !Number.isFinite(zoom.min) || !Number.isFinite(zoom.max)) return;

    // 1x is the natural, unzoomed view. Some devices have a minimum above 1x.
    const naturalZoom = Math.max(zoom.min, Math.min(1, zoom.max));
    await track.applyConstraints({ advanced: [{ zoom: naturalZoom } as CameraConstraintWithZoom] });
  } catch {
    // Zoom constraints are optional and must never prevent camera preview/recording.
  }
}
