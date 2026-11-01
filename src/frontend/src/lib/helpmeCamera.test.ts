import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { getHelpMeCameraConstraints, resetHelpMeCameraZoom } from "./helpmeCamera";

const recorderSource = readFileSync(new URL("../pages/HelpMeCreatePage.tsx", import.meta.url), "utf8");

describe("Help Me camera framing", () => {
  it.each(["user", "environment"] as const)("requests portrait framing for the %s camera", (facing) => {
    const constraints = getHelpMeCameraConstraints(facing);
    expect(constraints.audio).toMatchObject({ echoCancellation: true, noiseSuppression: true });
    expect(constraints.video).toMatchObject({
      facingMode: { exact: facing },
      width: { ideal: 720 },
      height: { ideal: 1280 },
      aspectRatio: { ideal: 9 / 16 },
      frameRate: { ideal: 30, max: 30 },
    });
  });

  it("resets a supported camera to its natural 1x zoom", async () => {
    const applyConstraints = vi.fn().mockResolvedValue(undefined);
    const track = {
      getCapabilities: () => ({ zoom: { min: 1, max: 4 } }),
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await resetHelpMeCameraZoom(track);

    expect(applyConstraints).toHaveBeenCalledWith({ advanced: [{ zoom: 1 }] });
  });

  it("uses the lowest available zoom when a device cannot reach 1x", async () => {
    const applyConstraints = vi.fn().mockResolvedValue(undefined);
    const track = {
      getCapabilities: () => ({ zoom: { min: 1.5, max: 4 } }),
      applyConstraints,
    } as unknown as MediaStreamTrack;

    await resetHelpMeCameraZoom(track);

    expect(applyConstraints).toHaveBeenCalledWith({ advanced: [{ zoom: 1.5 }] });
  });

  it("keeps working when zoom controls are unavailable or rejected", async () => {
    const unsupportedTrack = {} as MediaStreamTrack;
    await expect(resetHelpMeCameraZoom(unsupportedTrack)).resolves.toBeUndefined();

    const track = {
      getCapabilities: () => ({ zoom: { min: 1, max: 4 } }),
      applyConstraints: vi.fn().mockRejectedValue(new Error("unsupported constraint")),
    } as unknown as MediaStreamTrack;
    await expect(resetHelpMeCameraZoom(track)).resolves.toBeUndefined();
  });

  it("uses the zoom-safe constraints and displays the full live camera frame", () => {
    expect(recorderSource).toContain("getHelpMeCameraConstraints(mode)");
    expect(recorderSource).toContain("resetHelpMeCameraZoom(track)");
    expect(recorderSource).toContain("Math.min(canvas.width / recordVideo.videoWidth");
    expect(recorderSource).not.toContain("Math.max(canvas.width / recordVideo.videoWidth");
    expect(recorderSource).toContain("object-contain");
    expect(recorderSource).not.toContain("object-cover");
  });
});
