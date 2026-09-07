// src/frontend/src/pages/submit-request/steps/StepSelfie.tsx
// Live vertical selfie — same upload path as SubmitRequestPage

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { uploadFileToStorage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function StepSelfie({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Local preview (data URL) shows immediately; formData.selfieUrl is remote URL after upload
  const [localPreview, setLocalPreview] = useState<string>("");
  const remoteUrl = formData?.selfieUrl || "";
  const showPreview = localPreview || remoteUrl;
  const [error, setError] = useState("");

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
  };

  const startCamera = async () => {
    setError("");
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "user" },
          // Prefer portrait
          width: { ideal: 720 },
          height: { ideal: 1280 },
          aspectRatio: { ideal: 9 / 16 },
        },
      });
      streamRef.current = stream;

      // Wait a tick so the <video> is mounted
      await new Promise((r) => setTimeout(r, 50));
      const el = videoRef.current;
      if (!el) throw new Error("Video element not ready");
      el.srcObject = stream;
      el.muted = true;
      el.playsInline = true;
      await el.play();

      // Wait until we have real frames
      await new Promise<void>((resolve) => {
        if (el.videoWidth > 0) return resolve();
        const onMeta = () => {
          el.removeEventListener("loadedmetadata", onMeta);
          resolve();
        };
        el.addEventListener("loadedmetadata", onMeta);
        setTimeout(() => resolve(), 1500);
      });

      setCameraReady(true);
    } catch (e: any) {
      console.error(e);
      setError(
        "Camera access denied or unavailable. Allow camera permission and try again."
      );
      setCameraReady(false);
    }
  };

  useEffect(() => {
    if (!showPreview) startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureSelfie = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (!video.videoWidth || !video.videoHeight) {
      setError("Camera is still starting. Wait a second and try again.");
      return;
    }

    setError("");
    try {
      // Keep natural camera orientation (portrait if device gives portrait)
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Mirror for natural selfie look
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 1) Show preview immediately (same as SubmitRequestPage)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setLocalPreview(dataUrl);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("Failed to create image");

      // Stop camera after capture
      stopCamera();

      // 2) Upload with Page path: cases/{userId}/{ts}_selfie.jpg
      if (!user?.id) {
        throw new Error("Please sign in again before uploading.");
      }

      setUploading(true);
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      const path = `cases/\( {user.id}/ \){Date.now()}_selfie.jpg`;
      const url = await uploadFileToStorage(file, path);

      setFormData((prev: any) => ({ ...prev, selfieUrl: url }));
      toast.success("Selfie uploaded");
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Selfie upload failed — retake please.";
      setError(msg);
      toast.error(msg);
      setLocalPreview("");
      setFormData((prev: any) => ({ ...prev, selfieUrl: "" }));
      await startCamera();
    } finally {
      setUploading(false);
    }
  };

  const retake = async () => {
    setLocalPreview("");
    setFormData((prev: any) => ({ ...prev, selfieUrl: "" }));
    setError("");
    await startCamera();
  };

  const isValid = !!remoteUrl && !uploading;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Live selfie</h2>
        <p className="text-sm text-muted-foreground">
          Front camera opens for a live vertical selfie. Gallery upload is not allowed.
        </p>
      </div>

      {/* Hidden canvas used for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Vertical frame */}
      <div className="mx-auto w-full max-w-sm rounded-2xl border overflow-hidden bg-black aspect-[9/16] relative">
        {showPreview ? (
          <img
            src={showPreview}
            alt="Selfie preview"
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-sm">
            Uploading selfie...
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {remoteUrl && !uploading && (
        <p className="text-sm text-green-600 text-center">Selfie ready</p>
      )}

      <div className="flex flex-col gap-2 max-w-sm mx-auto w-full">
        {!showPreview ? (
          <>
            <Button
              type="button"
              onClick={captureSelfie}
              disabled={!cameraReady || uploading}
              className="w-full"
            >
              Capture live selfie
            </Button>
            {!cameraReady && (
              <Button type="button" variant="outline" onClick={startCamera} className="w-full">
                Enable camera
              </Button>
            )}
          </>
        ) : (
          <Button type="button" variant="outline" onClick={retake} disabled={uploading} className="w-full">
            Retake live selfie
          </Button>
        )}
      </div>

      <StepGuide
        lines={[
          "This is a live camera selfie only — no file attachment.",
          "Hold the phone upright (vertical). Keep your face centered.",
          "Good lighting, no sunglasses or mask.",
          "Wait until you see “Selfie ready” before tapping Next.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!isValid}
      />
    </div>
  );
}
