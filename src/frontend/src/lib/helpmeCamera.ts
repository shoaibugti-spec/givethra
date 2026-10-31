export type HelpMeCameraFacing = "user" | "environment";

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
    },
    audio: true,
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
