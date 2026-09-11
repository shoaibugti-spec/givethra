// src/frontend/src/pages/submit-request/steps/StepVideo.tsx
// Live video: min 60s, max 120s, pause OK, stop after 60s
// Playback uses LOCAL blob (reliable). Remote URL only for form submit.
// No text overlay inside the video frame.

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { uploadFileToStorage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MIN_SECONDS = 60;
const MAX_SECONDS = 120;
// Medium mobile-friendly capture: clear enough for admin review without 720p/1080p-sized uploads.
const VIDEO_WIDTH = 854;
const VIDEO_HEIGHT = 480;
const VIDEO_BITRATE = 900_000;
const AUDIO_BITRATE = 64_000;
const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function formatClock(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return m + ":" + pad2(s);
}

function pickMimeType(): string {
  const types = [
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9,opus",
    "video/webm",
  ];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(t)) {
      return t;
    }
  }
  return "video/webm";
}

export default function StepVideo({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const { user } = useAuth();
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const secondsRef = useRef(0);
  const stoppingRef = useRef(false);

  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [localBlobUrl, setLocalBlobUrl] = useState<string>("");
  const remoteUrl = formData?.videoUrl || "";
  const [error, setError] = useState("");

  const clearTimer = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
    setCameraReady(false);
  };

  const startCamera = async () => {
    setError("");
    try {
      stopStream();
      // Medium 480p capture keeps the case video practical for admins on slower connections.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: VIDEO_WIDTH, max: VIDEO_WIDTH },
          height: { ideal: VIDEO_HEIGHT, max: VIDEO_HEIGHT },
          frameRate: { ideal: 24, max: 24 },
          resizeMode: "crop-and-scale",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      await new Promise((r) => setTimeout(r, 80));
      const el = liveVideoRef.current;
      if (!el) throw new Error("Video element not ready");
      el.srcObject = stream;
      el.muted = true;
      el.setAttribute("playsinline", "true");
      el.onloadedmetadata = () => {
        el.play().catch(() => undefined);
      };
      await el.play().catch(() => undefined);
      setCameraReady(true);
    } catch (e: any) {
      console.error(e);
      setError("Camera/microphone access denied. Allow permissions and try again.");
      setCameraReady(false);
    }
  };

  useEffect(() => {
    if (!localBlobUrl) startCamera();
    return () => {
      clearTimer();
      try {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
        }
      } catch {
        // ignore
      }
      stopStream();
      if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = () => {
    clearTimer();
    timerRef.current = window.setInterval(() => {
      secondsRef.current += 1;
      const s = secondsRef.current;
      setSeconds(s);
      if (s >= MAX_SECONDS && !stoppingRef.current) {
        void finishRecording();
      }
    }, 1000);
  };

  const startRecording = () => {
    if (!streamRef.current) {
      setError("Camera is not ready.");
      return;
    }
    setError("");
    chunksRef.current = [];
    secondsRef.current = 0;
    setSeconds(0);
    setPaused(false);
    stoppingRef.current = false;

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
        recorder = new MediaRecorder(streamRef.current, {
          mimeType,
          videoBitsPerSecond: VIDEO_BITRATE,
          audioBitsPerSecond: AUDIO_BITRATE,
      });
    } catch {
      try {
        recorder = new MediaRecorder(streamRef.current);
      } catch (e) {
        console.error(e);
        setError("Recording is not supported on this browser.");
        return;
      }
    }

    recorderRef.current = recorder;
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
    };
    recorder.onerror = () => {
      setError("Recording error. Please try again.");
      setRecording(false);
      setPaused(false);
      clearTimer();
    };

    recorder.start(1000);
    setRecording(true);
    startTimer();
  };

  const pauseRecording = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state !== "recording") return;
    rec.pause();
    setPaused(true);
    clearTimer();
  };

  const resumeRecording = () => {
    const rec = recorderRef.current;
    if (!rec || rec.state !== "paused") return;
    rec.resume();
    setPaused(false);
    startTimer();
  };

  const finishRecording = async () => {
    if (stoppingRef.current) return;
    const rec = recorderRef.current;
    if (!rec) return;

    if (secondsRef.current < MIN_SECONDS) {
      toast.error("Record at least 60 seconds before stopping.");
      return;
    }

    stoppingRef.current = true;
    clearTimer();
    setPaused(false);

    await new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
      try {
        if (rec.state !== "inactive") {
          try {
            rec.requestData?.();
          } catch {
            // ignore
          }
          rec.stop();
        } else resolve();
      } catch {
        resolve();
      }
    });

    setRecording(false);
    recorderRef.current = null;

    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    chunksRef.current = [];
    const sizeMB = blob.size / (1024 * 1024);

    if (blob.size < 1000) {
      setError("Recording failed. Please try again.");
      stoppingRef.current = false;
      await startCamera();
      return;
    }
    if (blob.size > MAX_VIDEO_BYTES) {
      setError("Video is too large (max 20MB). Please record again in a well-lit place.");
      stoppingRef.current = false;
      await startCamera();
      return;
    }

    // Always keep LOCAL preview for reliable play/listen (like SubmitRequestPage videoPreview)
    if (localBlobUrl) URL.revokeObjectURL(localBlobUrl);
    const blobUrl = URL.createObjectURL(blob);
    setLocalBlobUrl(blobUrl);
    stopStream();

    if (!user?.id) {
      setError("Please sign in again before uploading.");
      stoppingRef.current = false;
      return;
    }

    setUploading(true);
    setError("");
    try {
      const file = new File([blob], "appeal.webm", { type: "video/webm" });
      const path = `cases/${user.id}/${Date.now()}_appeal.webm`;
      const url = await uploadFileToStorage(file, path);
      setFormData((prev: any) => ({ ...prev, videoUrl: url }));
      toast.success("Video uploaded successfully (" + sizeMB.toFixed(1) + " MB)");
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Video upload failed. Please record again.";
      setError(msg);
      toast.error(msg);
      setFormData((prev: any) => ({ ...prev, videoUrl: "" }));
    } finally {
      setUploading(false);
      stoppingRef.current = false;
    }
  };

  const onStopClick = () => {
    if (secondsRef.current < MIN_SECONDS) {
      toast.error("You must record more than 1 minute. " + (MIN_SECONDS - secondsRef.current) + "s left.");
      return;
    }
    void finishRecording();
  };

  const retake = async () => {
    clearTimer();
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch {
      // ignore
    }
    recorderRef.current = null;
    chunksRef.current = [];
    secondsRef.current = 0;
    setSeconds(0);
    setRecording(false);
    setPaused(false);
    setFormData((prev: any) => ({ ...prev, videoUrl: "" }));
    if (localBlobUrl) {
      URL.revokeObjectURL(localBlobUrl);
      setLocalBlobUrl("");
    }
    setError("");
    await startCamera();
  };

  const canStop = recording && seconds >= MIN_SECONDS && !uploading;
  const isValid = !!remoteUrl && !recording && !uploading;
  const progressPct = Math.min(100, (seconds / MAX_SECONDS) * 100);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Live video appeal</h2>
        <p className="text-sm text-muted-foreground">
          Record a live video about your case for Heroes. Medium 480p quality keeps upload and review fast.
          Minimum 1 minute (60s), maximum 120 seconds. File upload is not allowed.
        </p>
      </div>

      {/* VIDEO FRAME ONLY — no text overlays inside */}
      <div className="w-full rounded-xl border bg-black overflow-hidden">
        {localBlobUrl ? (
          <video
            key={localBlobUrl}
            src={localBlobUrl}
            controls
            playsInline
            preload="metadata"
            className="w-full max-h-[420px] object-contain bg-black"
          />
        ) : (
          <video
            ref={liveVideoRef}
            playsInline
            muted
            autoPlay
            className="w-full max-h-[420px] object-contain bg-black"
          />
        )}
      </div>

      {/* Status OUTSIDE the video frame */}
      {recording && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-red-600">
              {paused ? "Paused" : "Recording"} {formatClock(seconds)}
            </span>
            <span className="text-muted-foreground">
              Min {formatClock(MIN_SECONDS)} · Max {formatClock(MAX_SECONDS)}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{ width: progressPct + "%" }}
            />
          </div>
        </div>
      )}

      {uploading && (
        <p className="text-sm text-amber-600 text-center">Uploading video...</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {remoteUrl && !uploading && localBlobUrl && (
        <p className="text-sm text-green-600 text-center">
          Video ready — press play above to check picture and sound, then continue.
        </p>
      )}
      {localBlobUrl && !remoteUrl && !uploading && (
        <p className="text-sm text-amber-700 text-center">
          Preview is available. Upload did not finish — record again or check your connection.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {!localBlobUrl && !recording && (
          <>
            <Button
              type="button"
              onClick={startRecording}
              disabled={!cameraReady || uploading}
              className="w-full"
            >
              Start live recording
            </Button>
            {!cameraReady && (
              <Button type="button" variant="outline" onClick={startCamera} className="w-full">
                Enable camera & microphone
              </Button>
            )}
          </>
        )}

        {recording && (
          <div className="grid grid-cols-2 gap-2">
            {!paused ? (
              <Button type="button" variant="outline" onClick={pauseRecording}>
                Pause
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={resumeRecording}>
                Resume
              </Button>
            )}
            <Button
              type="button"
              onClick={onStopClick}
              disabled={!canStop}
              variant={canStop ? "default" : "secondary"}
            >
              {seconds < MIN_SECONDS
                ? "Stop unlocks in " + (MIN_SECONDS - seconds) + "s"
                : "Stop & save"}
            </Button>
          </div>
        )}

        {localBlobUrl && !recording && (
          <Button type="button" variant="outline" onClick={retake} disabled={uploading}>
            Record again
          </Button>
        )}
      </div>

      <StepGuide
        lines={[
          "This video is for Heroes so they understand your situation and why you need help.",
          "Explain who you are, what happened, your current condition, and how help will help.",
          "Speak clearly in a quiet place.",
          "After recording, press play and listen once to confirm sound is clear.",
          "Medium 480p video with clear audio is used to keep uploads manageable for admin review.",
          "Minimum 1 minute. Maximum 120 seconds. Pause is allowed. Stop unlocks after 60 seconds.",
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
