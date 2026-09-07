// src/frontend/src/pages/submit-request/steps/StepVideo.tsx
// Live video appeal: min 60s, max 120s, pause allowed, stop only after 60s
// High-quality audio + video constraints. No file attachment.

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { uploadFileToStorage } from "@/lib/api";
import { toast } from "sonner";

const MIN_SECONDS = 60;
const MAX_SECONDS = 120;

function formatTime(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `\( {m}: \){String(s).padStart(2, "0")}`;
}

function pickMimeType(): string {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  for (const t of types) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported?.(t)
    ) {
      return t;
    }
  }
  return "";
}

export default function StepVideo({
  formData,
  setFormData,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const playbackRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const secondsRef = useRef(0);

  const [cameraReady, setCameraReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(formData?.videoUrl || "");
  const [localBlobUrl, setLocalBlobUrl] = useState<string>("");
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
        },
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      // Prefer the highest-quality audio track settings when available
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack?.applyConstraints) {
        try {
          await audioTrack.applyConstraints({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          });
        } catch {
          // ignore unsupported constraint errors
        }
      }

      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.muted = true; // avoid feedback while recording
        await liveVideoRef.current.play();
      }
      setCameraReady(true);
    } catch (e: any) {
      console.error(e);
      setError(
        "Camera/microphone access denied or unavailable. Please allow permissions and try again."
      );
      setCameraReady(false);
    }
  };

  useEffect(() => {
    if (!previewUrl && !localBlobUrl) {
      startCamera();
    }
    return () => {
      clearTimer();
      try {
        recorderRef.current?.stop();
      } catch {}
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
      if (s >= MAX_SECONDS) {
        // Auto-finish at max
        finishRecording();
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

    const mimeType = pickMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType
        ? new MediaRecorder(streamRef.current, {
            mimeType,
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
          })
        : new MediaRecorder(streamRef.current);
    } catch (e) {
      console.error(e);
      setError("Recording is not supported on this browser.");
      return;
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

    // timeslice helps keep data flowing and improves reliability
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
    const rec = recorderRef.current;
    if (!rec) return;
    if (secondsRef.current < MIN_SECONDS) {
      toast.error(`Record at least ${MIN_SECONDS} seconds before stopping.`);
      return;
    }

    clearTimer();
    setPaused(false);

    await new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
      try {
        if (rec.state !== "inactive") rec.stop();
      } catch {
        resolve();
      }
    });

    setRecording(false);
    recorderRef.current = null;

    const mime = pickMimeType() || "video/webm";
    const blob = new Blob(chunksRef.current, { type: mime });
    chunksRef.current = [];

    if (blob.size < 1000) {
      setError("Recording failed. Please try again.");
      return;
    }

    const blobUrl = URL.createObjectURL(blob);
    setLocalBlobUrl(blobUrl);
    stopStream();

    // Upload
    setUploading(true);
    setError("");
    try {
      const ext = mime.includes("mp4") ? "mp4" : "webm";
      const file = new File([blob], `appeal_\( {Date.now()}. \){ext}`, { type: mime });
      const url = await uploadFileToStorage(
        file,
        `videos/\( {Date.now()}_ \){file.name}`
      );
      setPreviewUrl(url);
      setFormData((prev: any) => ({ ...prev, videoUrl: url }));
      toast.success("Video saved");
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Upload failed. Please record again.");
      toast.error("Video upload failed");
      setLocalBlobUrl("");
      await startCamera();
    } finally {
      setUploading(false);
    }
  };

  const onStopClick = () => {
    if (secondsRef.current < MIN_SECONDS) {
      toast.error(
        `You must record more than 1 minute. ${MIN_SECONDS - secondsRef.current}s left.`
      );
      return;
    }
    finishRecording();
  };

  const retake = async () => {
    clearTimer();
    try {
      recorderRef.current?.stop();
    } catch {}
    recorderRef.current = null;
    chunksRef.current = [];
    secondsRef.current = 0;
    setSeconds(0);
    setRecording(false);
    setPaused(false);
    setPreviewUrl("");
    setFormData((prev: any) => ({ ...prev, videoUrl: "" }));
    if (localBlobUrl) {
      URL.revokeObjectURL(localBlobUrl);
      setLocalBlobUrl("");
    }
    await startCamera();
  };

  const canStop = recording && seconds >= MIN_SECONDS && !uploading;
  const isValid = !!(previewUrl || localBlobUrl) && !recording && !uploading;
  const progressPct = Math.min(100, (seconds / MAX_SECONDS) * 100);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Live video appeal</h2>
        <p className="text-sm text-muted-foreground">
          Record a live video about your case for Heroes. Minimum more than 1 minute
          ({MIN_SECONDS}s). Maximum {MAX_SECONDS} seconds. File upload is not allowed.
        </p>
      </div>

      <div className="rounded-2xl border overflow-hidden bg-black aspect-video relative">
        {previewUrl || localBlobUrl ? (
          <video
            ref={playbackRef}
            src={previewUrl || localBlobUrl}
            controls
            playsInline
            className="h-full w-full object-contain bg-black"
          />
        ) : (
          <video
            ref={liveVideoRef}
            playsInline
            muted
            autoPlay
            className="h-full w-full object-cover"
          />
        )}

        {recording && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="rounded-full bg-red-600 text-white text-xs font-semibold px-3 py-1">
              {paused ? "PAUSED" : "REC"} {formatTime(seconds)}
            </span>
            <span className="rounded-full bg-black/60 text-white text-xs px-3 py-1">
              Min {formatTime(MIN_SECONDS)} · Max {formatTime(MAX_SECONDS)}
            </span>
          </div>
        )}

        {recording && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
            <div
              className="h-full bg-red-500 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-sm">
            Uploading video...
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-col gap-2">
        {!previewUrl && !localBlobUrl && !recording && (
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
                ? `Stop unlocks in ${MIN_SECONDS - seconds}s`
                : "Stop & save"}
            </Button>
          </div>
        )}

        {(previewUrl || localBlobUrl) && !recording && (
          <Button type="button" variant="outline" onClick={retake} disabled={uploading}>
            Record again
          </Button>
        )}
      </div>

      <div className="rounded-xl border p-3 text-sm space-y-1">
        <p className="font-medium">Recording rules</p>
        <p className="text-muted-foreground">
          • Speak for more than 1 minute (at least {MIN_SECONDS} seconds).
        </p>
        <p className="text-muted-foreground">
          • Maximum length is {MAX_SECONDS} seconds.
        </p>
        <p className="text-muted-foreground">
          • You can Pause anytime. Stop is enabled only after {MIN_SECONDS} seconds.
        </p>
        <p className="text-muted-foreground">
          • Keep voice clear and steady. Face the camera with good light.
        </p>
      </div>

      <StepGuide
        lines={[
          "This video is for Heroes so they understand your real situation and why you need help.",
          "Explain your case clearly: who you are, what happened, your current condition, and how help will change things.",
          "Share honest feelings and facts. If needed, briefly show a relevant document or place in the video.",
          "Speak louder than background noise. Prefer a quiet room for clean audio.",
          "Do not upload a gallery file — only this live recording is accepted.",
          `Record more than 1 minute and less than ${MAX_SECONDS} seconds.`,
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
