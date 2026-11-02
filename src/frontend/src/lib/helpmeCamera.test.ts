import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { getHelpMeCameraConstraints, getHelpMeContainedFrameRect, isHelpMePortraitCameraFrame, isHelpMePortraitRecording, resetHelpMeCameraZoom } from "./helpmeCamera";

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
    expect(recorderSource).toContain("getHelpMeContainedFrameRect");
    expect(recorderSource).toContain("object-contain");
    expect(recorderSource).not.toContain("object-cover");
    expect(recorderSource).toContain("canvas.captureStream(30)");
    expect(recorderSource).not.toContain("recordingStream = stream");
    expect(recorderSource).toContain("isHelpMePortraitRecording");
    expect(recorderSource).toContain("isHelpMePortraitCameraFrame");
    expect(recorderSource).toContain("portraitCanvasRef");
    expect(recorderSource).toContain("cameraRequestIdRef");
    expect(recorderSource).toMatch(/try\s*\{\s*rec\.start\(1000\);\s*\}\s*catch/);
    expect(recorderSource).not.toContain("getUserMedia({ video: true, audio: true })");
  });

  it("accepts only vertical 9:16 recording metadata", () => {
    expect(isHelpMePortraitRecording(720, 1280)).toBe(true);
    expect(isHelpMePortraitRecording(576, 1024)).toBe(true);
    expect(isHelpMePortraitRecording(1280, 720)).toBe(false);
    expect(isHelpMePortraitRecording(720, 1080)).toBe(false);
    expect(isHelpMePortraitRecording(0, 1280)).toBe(false);
  });

  it("does not disguise landscape camera footage as a vertical canvas recording", () => {
    expect(isHelpMePortraitCameraFrame(720, 1280)).toBe(true);
    expect(isHelpMePortraitCameraFrame(720, 960)).toBe(true);
    expect(isHelpMePortraitCameraFrame(1280, 720)).toBe(false);
    expect(isHelpMePortraitCameraFrame(0, 1280)).toBe(false);
  });

  it("fits the whole camera frame into 9:16 without cropping or zooming", () => {
    expect(getHelpMeContainedFrameRect(720, 1280)).toEqual({ x: 0, y: 0, width: 720, height: 1280 });
    expect(getHelpMeContainedFrameRect(1920, 1080)).toEqual({ x: 0, y: 437.5, width: 720, height: 405 });
    expect(getHelpMeContainedFrameRect(0, 1080)).toBeNull();
  });
});
