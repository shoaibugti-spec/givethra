// src/frontend/src/pages/submit-request/steps/StepSelfie.tsx
// Live selfie — no zoom crop, upload path same as SubmitRequestPage

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
      // Same style as SubmitRequestPage — do NOT force 9:16 constraints (causes zoom)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });
      streamRef.current = stream;

      await new Promise((r) => setTimeout(r, 80));
      const el = videoRef.current;
      if (!el) throw new Error("Video element not ready");
      el.srcObject = stream;
      el.muted = true;
      el.setAttribute("playsinline", "true");
      await el.play().catch(() => undefined);

      await new Promise<void>((resolve) => {
        if (el.videoWidth > 0) return resolve();
        const onMeta = () => {
          el.removeEventListener("loadedmetadata", onMeta);
          resolve();
        };
        el.addEventListener("loadedmetadata", onMeta);
        setTimeout(() => resolve(), 2000);
      });

      setCameraReady(true);
    } catch (e: any) {
      console.error(e);
      setError("Camera access denied or unavailable. Allow camera permission and try again.");
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
      setError("Camera is still starting. Wait a moment and try again.");
      return;
    }

    setError("");
    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Natural capture (no forced crop). Mirror for selfie feel.
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setLocalPreview(dataUrl);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("Failed to create image");

      stopCamera();

      if (!user?.id) throw new Error("Please sign in again before uploading.");

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
          Open the front camera and take a clear live photo. Gallery upload is not allowed.
        </p>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* object-contain = no 2x zoom crop */}
      <div className="w-full rounded-xl border bg-black overflow-hidden">
        {showPreview ? (
          <img
            src={showPreview}
            alt="Selfie preview"
            className="w-full max-h-[420px] object-contain bg-black"
          />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="w-full max-h-[420px] object-contain bg-black"
            style={{ transform: "scaleX(-1)" }}
          />
        )}
      </div>

      {uploading && (
        <p className="text-sm text-amber-600 text-center">Uploading selfie...</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {remoteUrl && !uploading && (
        <p className="text-sm text-green-600 text-center">Selfie ready</p>
      )}

      <div className="flex flex-col gap-2">
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
          "Live camera only — no file attachment.",
          "Face the camera with good lighting.",
          "Wait for “Selfie ready” before Next.",
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
