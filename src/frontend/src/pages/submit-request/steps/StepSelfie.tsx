// src/frontend/src/pages/submit-request/steps/StepSelfie.tsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, CheckCircle2 } from "lucide-react";
import { StepNavigation } from "../shared/StepNavigation";
import { useState, useRef, useEffect } from "react";

export default function StepSelfie({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { selfieUrl } = formData;
  const [cameraOn, setCameraOn] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = s;
      setCameraOn(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 100);
    } catch {
      alert("Camera access denied. Please allow camera permissions.");
    }
  };

  const takeSelfie = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setPreview(dataUrl);
    canvas.toBlob(async (blob) => {
      if (blob) {
        setUploading(true);
        try {
          const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
          const url = await uploadFile(file, `selfies/${Date.now()}.jpg`);
          setFormData((prev: any) => ({ ...prev, selfieUrl: url }));
        } catch {
          alert("Selfie upload failed. Please retake.");
          setPreview(null);
        } finally {
          setUploading(false);
          stopCamera();
        }
      }
    }, "image/jpeg");
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      setCameraOn(false);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    // یہاں اپنی upload logic لگائیں (existing API call)
    return "https://example.com/selfie.jpg"; // placeholder
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">📸 Take a Live Selfie</h2>
        <p className="text-sm text-muted-foreground">
          Take a clear selfie to verify your identity. This must be a live photo, not a pre-existing image.
        </p>
        <Label>Live Selfie *</Label>

        {preview ? (
          <div className="space-y-3">
            <img src={preview} alt="Selfie" className="w-full rounded-xl border max-h-64 object-cover" />
            {uploading && <p className="text-xs text-amber-600">⏳ Uploading...</p>}
            {selfieUrl && !uploading && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Selfie ready ✓
              </p>
            )}
            <Button variant="outline" className="w-full" onClick={() => { setPreview(null); setFormData((prev: any) => ({ ...prev, selfieUrl: "" })); }}>
              Retake Selfie
            </Button>
          </div>
        ) : cameraOn ? (
          <div className="space-y-3">
            <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl border" />
            <div className="flex gap-2">
              <Button onClick={takeSelfie} className="flex-1"><Camera className="h-4 w-4 mr-2" /> Take Selfie</Button>
              <Button variant="outline" onClick={stopCamera}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button onClick={startCamera} className="w-full py-6" variant="outline">
            <Camera className="h-5 w-5 mr-2" /> Open Camera
          </Button>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!selfieUrl || uploading}
      />
    </div>
  );
}
