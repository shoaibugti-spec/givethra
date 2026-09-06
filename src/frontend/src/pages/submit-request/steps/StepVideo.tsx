// src/frontend/src/pages/submit-request/steps/StepVideo.tsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { useState, useRef, useEffect } from "react";

export default function StepVideo({ formData, setFormData, onNext, onBack, isFirst, isLast }: any) {
  const { videoUrl } = formData;
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = s;
      setRecording(true);
      setTimer(0);
      setTimeout(() => {
        if (liveVideoRef.current) liveVideoRef.current.srcObject = s;
      }, 100);

      const recorder = new MediaRecorder(s, { mimeType: "video/webm;codecs=vp8,opus" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setPreview(url);
        setUploading(true);
        try {
          const file = new File([blob], "appeal.webm", { type: "video/webm" });
          const uploadedUrl = await uploadFile(file, `videos/${Date.now()}.webm`);
          setFormData((prev: any) => ({ ...prev, videoUrl: uploadedUrl }));
        } catch {
          alert("Video upload failed. Please re-record.");
          setPreview(null);
        } finally {
          setUploading(false);
        }
        s.getTracks().forEach((t) => t.stop());
        setRecording(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
      recorder.start(1000);

      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev + 1 >= 90) {
            stopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert("Camera/microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    // یہاں اپنی upload logic لگائیں
    return "https://example.com/video.webm";
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">🎥 Record a Video Statement</h2>
        <p className="text-sm text-muted-foreground">
          Explain your situation clearly in a video. This will be shown only to Heroes who unlock your case.
        </p>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>What challenge are you facing?</li>
          <li>What is your financial situation?</li>
          <li>What do you hope to achieve?</li>
        </ul>
        <p className="text-xs text-amber-600 mt-1">⚠️ Video must be up to 90 seconds (max 50MB).</p>

        <Label>Video Statement *</Label>

        {preview ? (
          <div className="space-y-3">
            <video src={preview} controls className="w-full rounded-xl border max-h-64" />
            {uploading && <p className="text-xs text-amber-600">⏳ Uploading...</p>}
            {videoUrl && !uploading && (
              <p className="text-xs text-green-600 flex items-center gap-1">✅ Video ready ✓</p>
            )}
            <Button variant="outline" className="w-full" onClick={() => { setPreview(null); setFormData((prev: any) => ({ ...prev, videoUrl: "" })); }}>
              Re-record Video
            </Button>
          </div>
        ) : recording ? (
          <div className="space-y-3">
            <video ref={liveVideoRef} autoPlay playsInline muted className="w-full rounded-xl border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-500">● Recording... {timer}s / 90s</span>
              <Button variant="destructive" size="sm" onClick={stopRecording}>Stop</Button>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${(timer / 90) * 100}%` }} />
            </div>
          </div>
        ) : (
          <Button onClick={startRecording} className="w-full py-6" variant="outline">
            🎥 Start Recording
          </Button>
        )}
      </div>
      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!videoUrl || uploading}
      />
    </div>
  );
}
