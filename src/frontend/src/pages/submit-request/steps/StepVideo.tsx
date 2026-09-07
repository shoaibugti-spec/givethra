// src/frontend/src/pages/submit-request/steps/StepVideo.tsx
// Live vertical video: min 60s, max 120s, pause OK, stop after 60s
// Upload path matches SubmitRequestPage: cases/{userId}/{ts}_appeal.webm

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { uploadFileToStorage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MIN_SECONDS = 60;
const MAX_SECONDS = 120;

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function formatClock(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `\( {m}: \){pad2(s)}`;
}

function pickMimeType(): string {
  const types = [
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=vp9,opus",
    "video/webm",
    "video/mp4",
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
  const playbackSrc = remoteUrl || localBlobUrl;
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
        },
        video: {
          facingMode: { ideal: "user" },
          width: { ideal: 720 },
          height: { ideal: 1280 },
          aspectRatio: { ideal: 9 / 16 },
          frameRate: { ideal: 30, max: 30 },
        },
      });

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack?.applyConstraints) {
        try {
          await audioTrack.applyConstraints({
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          });
        } catch {
          // ignore
        }
      }

      streamRef.current = stream;
      await new Promise((r) => setTimeout(r, 50));
      const el = liveVideoRef.current;
      if (!el) throw new Error("Video element not ready");
      el.srcObject = stream;
      el.muted = true;
      el.playsInline = true;
      await el.play();
      setCameraReady(true);
    } catch (e: any) {
      console.error(e);
      setError(
        "Camera/microphone access denied. Allow permissions and try again."
      );
      setCameraReady(false);
    }
  };

  useEffect(() => {
    if (!playbackSrc) startCamera();
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
        audioBitsPerSecond: 128000,
        videoBitsPerSecond: 2500000,
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
      toast.error(`Record at least ${MIN_SECONDS} seconds before stopping.`);
      return;
    }

    stoppingRef.current = true;
    clearTimer();
    setPaused(false);

    await new Promise<void>((resolve) => {
      const prev = rec.onstop;
      rec.onstop = () => {
        if (typeof prev === "function") {
          try {
            prev.call(rec, new Event("stop") as any);
          } catch {
            // ignore
          }
        }
        resolve();
      };
      try {
        if (rec.state !== "inactive") {
          // Flush last data
          try {
            rec.requestData?.();
          } catch {
            // ignore
          }
          rec.stop();
        } else {
          resolve();
        }
      } catch {
        resolve();
      }
    });

    setRecording(false);
    recorderRef.current = null;

    const mime = pickMimeType() || "video/webm";
    const blob = new Blob(chunksRef.current, { type: mime.split(";")[0] });
    chunksRef.current = [];

    const sizeMB = blob.size / (1024 * 1024);
    if (blob.size < 1000) {
      setError("Recording failed. Please try again.");
      stoppingRef.current = false;
      await startCamera();
      return;
    }
    if (sizeMB > 48) {
      setError(`Video is ${sizeMB.toFixed(1)}MB (max 50MB). Record a shorter video.`);
      stoppingRef.current = false;
      await startCamera();
      return;
    }

    // Local preview first so user can play & check audio
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
      // Same path style as SubmitRequestPage
      const path = `cases/\( {user.id}/ \){Date.now()}_appeal.webm`;
      const url = await uploadFileToStorage(file, path);
      setFormData((prev: any) => ({ ...prev, videoUrl: url }));
      toast.success(`Video uploaded (${sizeMB.toFixed(1)} MB)`);
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Video upload failed. Please record again.";
      setError(msg);
      toast.error(msg);
      setFormData((prev: any) => ({ ...prev, videoUrl: "" }));
      // Keep local preview so user can still listen; allow retake
    } finally {
      setUploading(false);
      stoppingRef.current = false;
    }
  };

  const onStopClick = () => {
    if (secondsRef.current < MIN_SECONDS) {
      const left = MIN_SECONDS - secondsRef.current;
      toast.error(`You must record more than 1 minute. ${left}s left.`);
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

  const clock = formatClock(seconds);
  const minClock = formatClock(MIN_SECONDS);
  const maxClock = formatClock(MAX_SECONDS);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Live video appeal</h2>
        <p className="text-sm text-muted-foreground">
          Record a live vertical video about your case for Heroes. Minimum more than
          1 minute ({MIN_SECONDS}s). Maximum {MAX_SECONDS} seconds. File upload is not
          allowed.
        </p>
      </div>

      {/* Vertical frame */}
      <div className="mx-auto w-full max-w-sm rounded-2xl border overflow-hidden bg-black aspect-[9/16] relative">
        {playbackSrc ? (
          <video
            key={playbackSrc}
            src={playbackSrc}
            controls
            playsInline
            className="h-full w-full object-cover bg-black"
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
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <span className="rounded-full bg-red-600 text-white text-xs font-semibold px-3 py-1">
              {paused ? "PAUSED" : "REC"} {clock}
            </span>
            <span className="rounded-full bg-black/60 text-white text-xs px-3 py-1">
              Min {minClock} · Max {maxClock}
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
      {remoteUrl && !uploading && (
        <p className="text-sm text-green-600 text-center">
          Video ready — play it above to check your voice, then continue.
        </p>
      )}
      {localBlobUrl && !remoteUrl && !uploading && (
        <p className="text-sm text-amber-700 text-center">
          Preview is ready. Upload did not finish — tap Record again or check your connection.
        </p>
      )}

      <div className="flex flex-col gap-2 max-w-sm mx-auto w-full">
        {!playbackSrc && !recording && (
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

        {playbackSrc && !recording && (
          <Button type="button" variant="outline" onClick={retake} disabled={uploading}>
            Record again
          </Button>
        )}
      </div>

      <div className="rounded-xl border p-3 text-sm space-y-1 max-w-sm mx-auto w-full">
        <p className="font-medium">Recording rules</p>
        <p className="text-muted-foreground">• Speak for more than 1 minute (at least 60 seconds).</p>
        <p className="text-muted-foreground">• Maximum length is 120 seconds.</p>
        <p className="text-muted-foreground">• You can Pause anytime. Stop unlocks after 60 seconds.</p>
        <p className="text-muted-foreground">• After recording, play the video and check your voice.</p>
      </div>

      <StepGuide
        lines={[
          "This video is for Heroes so they understand your real situation and why you need help.",
          "Explain who you are, what happened, your current condition, and how help will change things.",
          "Share honest feelings and facts. If needed, briefly show a relevant document in the video.",
          "Speak clearly in a quiet place so audio is clean.",
          "After Stop, play the video once to confirm sound and picture, then continue.",
          "Do not upload a gallery file — only this live recording is accepted.",
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
