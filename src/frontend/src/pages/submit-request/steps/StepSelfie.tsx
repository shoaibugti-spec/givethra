// src/frontend/src/pages/submit-request/steps/StepSelfie.tsx
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { uploadFileToStorage } from "@/lib/api";
import { toast } from "sonner";

export default function StepSelfie({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(formData?.selfieUrl || "");
  const [error, setError] = useState<string>("");

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
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch (e: any) {
      console.error(e);
      setError(
        "Camera access denied or unavailable. Please allow camera permission and try again."
      );
      setCameraReady(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureSelfie = async () => {
    if (!videoRef.current || !cameraReady) return;
    setCapturing(true);
    setError("");
    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const w = video.videoWidth || 1280;
      const h = video.videoHeight || 720;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Mirror like a real selfie view
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, w, h);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("Failed to capture image");

      setUploading(true);
      const file = new File([blob], `selfie_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const url = await uploadFileToStorage(file, `selfies/\( {Date.now()}_ \){file.name}`);
      setPreviewUrl(url);
      setFormData((prev: any) => ({ ...prev, selfieUrl: url }));
      toast.success("Selfie captured");
      stopCamera();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to capture selfie. Please try again.");
      toast.error("Selfie capture failed");
    } finally {
      setCapturing(false);
      setUploading(false);
    }
  };

  const retake = async () => {
    setPreviewUrl("");
    setFormData((prev: any) => ({ ...prev, selfieUrl: "" }));
    await startCamera();
  };

  const isValid = !!previewUrl && !uploading;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Live selfie</h2>
        <p className="text-sm text-muted-foreground">
          Your front camera will open. Capture a clear live photo of your face.
          File upload is not allowed.
        </p>
      </div>

      <div className="rounded-2xl border overflow-hidden bg-black aspect-[3/4] max-h-[420px] relative">
        {!previewUrl ? (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        ) : (
          <img
            src={previewUrl}
            alt="Selfie preview"
            className="h-full w-full object-cover"
          />
        )}

        {(uploading || capturing) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm">
            {uploading ? "Uploading..." : "Capturing..."}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex flex-col gap-2">
        {!previewUrl ? (
          <>
            <Button
              type="button"
              onClick={captureSelfie}
              disabled={!cameraReady || capturing || uploading}
              className="w-full"
            >
              {capturing || uploading ? "Please wait..." : "Capture live selfie"}
            </Button>
            {!cameraReady && (
              <Button type="button" variant="outline" onClick={startCamera} className="w-full">
                Enable camera
              </Button>
            )}
          </>
        ) : (
          <Button type="button" variant="outline" onClick={retake} className="w-full">
            Retake live selfie
          </Button>
        )}
      </div>

      <StepGuide
        lines={[
          "This must be a live camera selfie — gallery or file upload is not accepted.",
          "Look at the camera with good lighting. Keep your face fully visible.",
          "Remove sunglasses, mask, or heavy filters.",
          "If the camera does not open, allow camera permission in your browser and tap Enable camera.",
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
