import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { getHelpMeCameraConstraints, getHelpMeCameraFrameLayout, getHelpMeContainedFrameRect, isHelpMePortraitRecording, isHelpMePortraitViewport, resetHelpMeCameraZoom } from "./helpmeCamera";

const recorderSource = readFileSync(new URL("../pages/HelpMeCreatePage.tsx", import.meta.url), "utf8");
const cameraHelperSource = readFileSync(new URL("./helpmeCamera.ts", import.meta.url), "utf8");

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
    expect(cameraHelperSource).toContain("getHelpMeContainedFrameRect");
    expect(recorderSource).toContain("object-contain");
    expect(recorderSource).not.toContain("object-cover");
    expect(recorderSource).toContain("canvas.captureStream(30)");
    expect(recorderSource).not.toContain("recordingStream = stream");
    expect(recorderSource).toContain("isHelpMePortraitRecording");
    expect(recorderSource).toContain("isHelpMePortraitViewport");
    expect(recorderSource).toContain("getHelpMeCameraFrameLayout");
    expect(recorderSource).toContain("context.rotate(frame.rotationDegrees * Math.PI / 180)");
    expect(recorderSource).toContain('const landscapeRotation = mode === "user" ? -90 : 90');
    expect(recorderSource).toContain('if (mode === "user")');
    expect(recorderSource).toContain("context.scale(-1, 1)");
    expect(recorderSource).not.toContain("-scale-x-100");
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

  it("prefers the current viewport and falls back to screen orientation", () => {
    expect(isHelpMePortraitViewport(400, 800, "landscape-primary")).toBe(true);
    expect(isHelpMePortraitViewport(800, 400, "portrait-primary")).toBe(false);
    expect(isHelpMePortraitViewport(400, 800)).toBe(true);
    expect(isHelpMePortraitViewport(800, 400)).toBe(false);
    expect(isHelpMePortraitViewport(0, 0, "portrait-primary")).toBe(true);
  });

  it("rotates a landscape-reported camera frame to fill 9:16 on an upright phone", () => {
    expect(getHelpMeCameraFrameLayout(1920, 1080, 720, 1280, true)).toEqual({
      x: 0, y: 0, width: 720, height: 1280, rotationDegrees: 90,
    });
    expect(getHelpMeCameraFrameLayout(1920, 1080, 720, 1280, true, -90)).toEqual({
      x: 0, y: 0, width: 720, height: 1280, rotationDegrees: -90,
    });
    expect(getHelpMeCameraFrameLayout(1280, 720, 720, 1280, false)).toBeNull();
  });

  it("keeps portrait footage unrotated and fits non-9:16 frames without cropping", () => {
    expect(getHelpMeCameraFrameLayout(720, 1280, 720, 1280, true)).toEqual({
      x: 0, y: 0, width: 720, height: 1280, rotationDegrees: 0,
    });
    expect(getHelpMeCameraFrameLayout(640, 480, 720, 1280, true)).toEqual({
      x: 0, y: 160, width: 720, height: 960, rotationDegrees: 90,
    });
    expect(getHelpMeCameraFrameLayout(0, 720, 720, 1280, true)).toBeNull();
  });

  it("fits the whole camera frame into 9:16 without cropping or zooming", () => {
    expect(getHelpMeContainedFrameRect(720, 1280)).toEqual({ x: 0, y: 0, width: 720, height: 1280 });
    expect(getHelpMeContainedFrameRect(1920, 1080)).toEqual({ x: 0, y: 437.5, width: 720, height: 405 });
    expect(getHelpMeContainedFrameRect(0, 1080)).toBeNull();
  });
});
