// src/frontend/src/pages/HelpMeCreatePage.tsx
// Create a video appeal: LIVE CAMERA ONLY (no file picker, no gallery). Works on iPhone Safari,
// Android Chrome and desktop webcams. Steps: check -> record -> preview -> details -> done.
import { useAuth } from "@/contexts/AuthContext";
import { HelpMeError, PAY_METHODS, formatMoney, helpme, niceGoal, pickRecorderMime, regionName, type Eligibility, type HelpMeConfig } from "@/lib/helpme";
import { resetHelpMeCameraZoom } from "@/lib/helpmeCamera";
import { captureHelpMeThumbnail } from "@/lib/helpmeThumbnail";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, CheckCircle2, Loader2, Pause, Play, RefreshCw, RotateCcw, ShieldAlert, Square, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

type Step = "check" | "blocked" | "intro" | "record" | "preview" | "details" | "done";
// Reel size: always vertical 9:16.
const REEL_W = 720;
const REEL_H = 1280;
function portraitConstraints(mode: "user" | "environment"): MediaStreamConstraints {
  return {
    video: { facingMode: { ideal: mode }, width: { ideal: REEL_W }, height: { ideal: REEL_H }, aspectRatio: { ideal: 9 / 16 }, frameRate: { ideal: 30, max: 30 } },
    audio: { echoCancellation: true, noiseSuppression: true },
  };
}
const CONTACT_RE = /@|https?:\/\/|www\.|\d{7,}|whats?app|telegram|signal|wechat|\bimo\b|e-?mail/i;

function useCountdown(iso?: string) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!iso) return;
    const tick = () => setLeft(Math.max(0, new Date(iso).getTime() - Date.now()));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [iso]);
  const s = Math.floor(left / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${s % 60}s`;
}

export default function HelpMeCreatePage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing } = useAuth();
  const [step, setStep] = useState<Step>("check");
  const [elig, setElig] = useState<Eligibility | null>(null);
  const [cfg, setCfg] = useState<HelpMeConfig | null>(null);
  const [camError, setCamError] = useState("");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0); // recorded milliseconds only (paused time excluded)
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [desc, setDesc] = useState("");
  const [country, setCountry] = useState("PK");
  const [method, setMethod] = useState("");
  const [bank, setBank] = useState("");
  const [title, setTitle] = useState("");
  const [number, setNumber] = useState("");

  const liveRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const lastTickRef = useRef(0);
  const durationRef = useRef(0);
  const drawFrameRef = useRef<number | null>(null);
  const canvasStreamRef = useRef<MediaStream | null>(null);

  const maxMs = (cfg?.max_seconds ?? 20) * 1000;
  const minStopMs = (cfg?.min_stop_seconds ?? 12) * 1000;
  const countdown = useCountdown(elig?.next_allowed_at);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (liveRef.current) liveRef.current.srcObject = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  useEffect(() => () => { clearTimer(); stopStream(); }, [clearTimer, stopStream]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  // eligibility + config
  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      navigate({ to: "/sign-in", search: { redirect: "/helpme/new" } as never, replace: true });
      return;
    }
    let live = true;
    Promise.all([helpme.eligibility(), helpme.config()])
      .then(([e, c]) => {
        if (!live) return;
        setElig(e);
        setCfg(c);
        const cc = (navigator.language.split("-")[1] || "").toUpperCase();
        if (c.country_currency[cc]) setCountry(cc);
        setStep(e.can_post ? "intro" : "blocked");
      })
      .catch((e) => { if (live) { setElig({ can_post: false, reason: e.message || "Could not check your account. Please try again." }); setStep("blocked"); } });
    return () => { live = false; };
  }, [isAuthenticated, isInitializing, navigate]);

  async function openCamera(mode: "user" | "environment" = facing) {
    setCamError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setCamError("This browser cannot record video. Please update your browser (Chrome, Safari 14.5+, Edge or Firefox) and try again.");
      setStep("record");
      return;
    }
    stopStream();
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(portraitConstraints(mode));
      } catch (e) {
        if ((e as DOMException)?.name === "OverconstrainedError" || (e as DOMException)?.name === "NotFoundError") {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        } else throw e;
      }
      await Promise.all(stream.getVideoTracks().map((track) => resetHelpMeCameraZoom(track)));
      streamRef.current = stream;
      setFacing(mode);
      setStep("record");
      requestAnimationFrame(() => {
        const v = liveRef.current;
        if (v) { v.srcObject = stream; v.muted = true; void v.play().catch(() => undefined); }
      });
    } catch (e) {
      const name = (e as DOMException)?.name;
      setStep("record");
      if (name === "NotAllowedError" || name === "SecurityError") setCamError("Camera or microphone permission was denied. Tap the lock icon in your browser's address bar, allow Camera and Microphone, then try again.");
      else if (name === "NotFoundError") setCamError("No camera or microphone was found on this device.");
      else if (name === "NotReadableError") setCamError("Your camera is being used by another app. Close it and try again.");
      else setCamError("The camera could not be started. Please try again.");
    }
  }

  async function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    let recordingStream = stream;
    let recordVideo: HTMLVideoElement | null = null;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = REEL_W;
      canvas.height = REEL_H;
      const context = canvas.getContext("2d");
      if (!context || typeof canvas.captureStream !== "function") throw new Error("Portrait recording is unavailable");
      recordVideo = document.createElement("video");
      recordVideo.srcObject = stream;
      recordVideo.muted = true;
      recordVideo.playsInline = true;
      await recordVideo.play();
      const draw = () => {
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        if (recordVideo && recordVideo.videoWidth > 0 && recordVideo.videoHeight > 0) {
          const scale = Math.max(canvas.width / recordVideo.videoWidth, canvas.height / recordVideo.videoHeight); // cover: fill the vertical frame
          const width = recordVideo.videoWidth * scale;
          const height = recordVideo.videoHeight * scale;
          context.drawImage(recordVideo, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
        }
        drawFrameRef.current = requestAnimationFrame(draw);
      };
      const portraitStream = canvas.captureStream(30);
      stream.getAudioTracks().forEach((track) => portraitStream.addTrack(track));
      canvasStreamRef.current = portraitStream;
      recordingStream = portraitStream;
      draw();
    } catch {
      // Older browsers can still use the original stream; modern mobile browsers use the portrait canvas above.
      recordVideo = null;
      canvasStreamRef.current = null;
    }
    const mime = pickRecorderMime();
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(recordingStream, { ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 800000, audioBitsPerSecond: 64000 });
    } catch {
      try { rec = new MediaRecorder(recordingStream); } catch { setCamError("Recording is not supported on this browser."); return; }
    }
    chunksRef.current = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
    rec.onstop = () => {
      clearTimer();
      if (drawFrameRef.current !== null) cancelAnimationFrame(drawFrameRef.current);
      drawFrameRef.current = null;
      canvasStreamRef.current?.getVideoTracks().forEach((track) => track.stop());
      canvasStreamRef.current = null;
      if (recordVideo) recordVideo.srcObject = null;
      const type = (rec.mimeType || mime || "video/mp4").split(";")[0];
      const out = new Blob(chunksRef.current, { type: type.startsWith("video/webm") ? "video/webm" : "video/mp4" });
      durationRef.current = elapsedRef.current;
      setRecording(false);
      setPaused(false);
      stopStream();
      if (out.size < 2000) { setCamError("Nothing was recorded. Please try again."); setStep("record"); return; }
      setBlob(out);
      setPreviewUrl(URL.createObjectURL(out));
      setStep("preview");
    };
    recRef.current = rec;
    elapsedRef.current = 0;
    setElapsed(0);
    lastTickRef.current = performance.now();
    rec.start(1000);
    setRecording(true);
    setPaused(false);
    clearTimer();
    timerRef.current = window.setInterval(() => {
      const now = performance.now();
      if (recRef.current?.state === "recording") elapsedRef.current += now - lastTickRef.current;
      lastTickRef.current = now;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= maxMs) stopRecording(true);
    }, 100);
  }

  function stopRecording(force = false) {
    if (!force && elapsedRef.current < minStopMs) return;
    const rec = recRef.current;
    if (rec && rec.state !== "inactive") rec.stop();
  }

  function togglePause() {
    const rec = recRef.current;
    if (!rec) return;
    if (rec.state === "recording") { rec.pause(); setPaused(true); }
    else if (rec.state === "paused") { lastTickRef.current = performance.now(); rec.resume(); setPaused(false); }
  }

  function retake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setBlob(null);
    setUploadId("");
    setElapsed(0);
    void openCamera();
  }

  const methods = PAY_METHODS[country] || PAY_METHODS.default;
  useEffect(() => { setMethod(methods[0]); }, [country]); // eslint-disable-line react-hooks/exhaustive-deps
  const currency = cfg?.country_currency[country] || "USD";
  const goal = useMemo(() => {
    const rate = currency === "USD" ? 1 : cfg?.rates.find((r) => r.currency === currency)?.per_usd;
    return cfg && rate ? niceGoal(cfg.goal_usd_cents, rate) : null;
  }, [cfg, currency]);
  const countries = useMemo(() => Object.keys(cfg?.country_currency || {}).sort((a, b) => regionName(a).localeCompare(regionName(b))), [cfg]);

  async function submit() {
    setFormError("");
    if (!blob) return;
    if (desc.trim().length < 10) return setFormError("Please describe your need in 2-3 short lines (at least 10 characters).");
    if (CONTACT_RE.test(desc)) return setFormError("Please remove phone numbers, e-mail and links from the description. Payment details go in the boxes below.");
    if (title.trim().length < 2 || !/^[A-Za-z0-9 \-+_./]{5,40}$/.test(number.trim())) return setFormError("Enter the account title and a valid account number (letters, numbers, - + _ . / only).");
    setBusy(true);
    try {
      let uid = uploadId;
      if (!uid) {
        setProgress(1);
        uid = await helpme.uploadVideo(blob, setProgress);
        setUploadId(uid);
      }
      try {
        const thumbnail = await captureHelpMeThumbnail(blob);
        await helpme.uploadThumbnail(uid, thumbnail);
      } catch (thumbnailError) {
        console.warn("Help Me poster could not be uploaded; the appeal will still be submitted.", thumbnailError);
      }
      await helpme.createAppeal({
        upload_id: uid, description: desc.trim(), account_country: country, pay_method: method,
        pay_bank_name: bank.trim(), pay_account_title: title.trim(), pay_account_number: number.trim(), duration_ms: Math.round(durationRef.current),
      });
      setStep("done");
      toast.success("Sent for review");
      window.setTimeout(() => navigate({ to: "/helpme" }), 2600);
    } catch (e) {
      const err = e as HelpMeError;
      setFormError(err.message || "Could not send. Please try again.");
      if (err.code === "UPLOAD_MISSING") setUploadId("");
    } finally {
      setBusy(false);
    }
  }

  const leave = () => { clearTimer(); stopStream(); navigate({ to: "/helpme" }); };
  const seconds = Math.floor(elapsed / 1000);
  const ring = Math.min(1, elapsed / maxMs);
  const canStop = elapsed >= minStopMs;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black text-white" style={{ height: "100dvh" }}>
      <div className="relative mx-auto flex min-h-full w-full max-w-[480px] flex-col" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="z-30 flex items-center justify-between px-3 py-3">
          <button type="button" onClick={step === "details" ? () => setStep("preview") : leave} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 active:scale-95"><ArrowLeft className="h-4 w-4" /></button>
          <h1 className="text-sm font-extrabold tracking-wide">Video appeal</h1>
          <div className="w-9" />
        </div>

        {step === "check" && <div className="flex flex-1 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-400" /></div>}

        {step === "blocked" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <ShieldAlert className="h-12 w-12 text-amber-400" />
            <p className="text-sm text-gray-200">{elig?.reason || "You cannot post an appeal right now."}</p>
            {elig?.code === "COOLDOWN" && elig.next_allowed_at && <p className="rounded-xl bg-white/10 px-4 py-2 text-lg font-extrabold text-emerald-300">{countdown}</p>}
            {elig?.code === "KYC_REQUIRED" && <button type="button" onClick={() => navigate({ to: "/kyc" })} className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-extrabold">Complete KYC</button>}
            {elig?.code === "ACTIVE_APPEAL" && <button type="button" onClick={() => navigate({ to: "/helpme/my" })} className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-extrabold">View my appeal</button>}
            <button type="button" onClick={leave} className="text-xs text-gray-400 underline">Back to videos</button>
          </div>
        )}

        {step === "intro" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-400/50"><Camera className="h-9 w-9 text-emerald-300" /></div>
            <h2 className="text-xl font-extrabold">Record your appeal</h2>
            <ul className="max-w-[300px] space-y-1.5 text-left text-sm text-gray-200">
              <li>• Record live, up to {cfg?.max_seconds ?? 20} seconds (stop is possible after {cfg?.min_stop_seconds ?? 12}s).</li>
              <li>• Speak clearly: who you are and what you need.</li>
              <li>• When your browser asks, tap <b>Allow</b> for camera and microphone.</li>
            </ul>
            <button type="button" onClick={() => void openCamera()} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-7 py-3.5 text-sm font-extrabold shadow-lg active:scale-95"><Video className="h-4 w-4" /> Open camera</button>
          </div>
        )}

        {step === "record" && (
          <div className="relative flex flex-1 flex-col items-center justify-center">
            {camError ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <ShieldAlert className="h-10 w-10 text-amber-400" />
                <p className="text-sm text-gray-200">{camError}</p>
                <button type="button" onClick={() => void openCamera()} className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-extrabold">Try again</button>
              </div>
            ) : (
              <>
                <div className="relative mx-auto flex w-full shrink-0 flex-col overflow-hidden bg-black" style={{ aspectRatio: "9 / 16", maxHeight: "calc(100dvh - 64px)", maxWidth: "calc((100dvh - 64px) * 9 / 16)" }}>
                <video ref={liveRef} playsInline muted autoPlay className={`absolute inset-0 h-full w-full bg-black object-cover ${facing === "user" ? "-scale-x-100" : ""}`} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
                <div className="relative z-10 mt-2 flex justify-center">
                  <span className="rounded-full bg-black/60 px-3 py-1 text-sm font-extrabold tabular-nums">{recording && <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />}{seconds}s / {cfg?.max_seconds ?? 20}s</span>
                </div>
                <div className="relative z-10 mt-auto flex items-center justify-center gap-6 pb-8">
                  {!recording ? (
                    <>
                      <button type="button" onClick={() => void openCamera(facing === "user" ? "environment" : "user")} aria-label="Flip camera" className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 active:scale-95"><RefreshCw className="h-5 w-5" /></button>
                      <button type="button" onClick={() => void startRecording()} aria-label="Start recording" className="flex h-[74px] w-[74px] items-center justify-center rounded-full border-4 border-white active:scale-95"><span className="h-14 w-14 rounded-full bg-red-500" /></button>
                      <div className="w-12" />
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={togglePause} aria-label={paused ? "Resume" : "Pause"} className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 active:scale-95">{paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}</button>
                      <div className="relative flex h-[84px] w-[84px] items-center justify-center">
                        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 84 84"><circle cx="42" cy="42" r="38" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="5" /><circle cx="42" cy="42" r="38" fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 * (1 - ring)} /></svg>
                        <button type="button" disabled={!canStop} onClick={() => stopRecording()} aria-label="Stop recording" className={`flex h-14 w-14 items-center justify-center rounded-full ${canStop ? "bg-red-500 active:scale-95" : "bg-red-500/40"}`}><Square className="h-5 w-5 fill-white" /></button>
                      </div>
                      <div className="w-12 text-center text-[10px] leading-tight text-white/80">{canStop ? "Tap ■ to finish" : `Stop in ${Math.max(0, Math.ceil((minStopMs - elapsed) / 1000))}s`}</div>
                    </>
                  )}
                </div>
                </div>
              </>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="flex flex-1 flex-col px-4 pb-6">
            <div className="mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-2xl bg-black">
              <video src={previewUrl} controls playsInline className="h-full w-full object-cover" />
            </div>
            <p className="mt-3 text-center text-xs text-gray-300">Watch and listen to your recording. Is it clear?</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" onClick={retake} className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 py-3 text-sm font-bold active:scale-95"><RotateCcw className="h-4 w-4" /> Retake</button>
              <button type="button" onClick={() => setStep("details")} className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-sm font-extrabold active:scale-95">Use this video</button>
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="flex-1 space-y-3 px-5 pb-8">
            <Field label="Your need (2–3 short lines)" hint={`${desc.length}/300 · no phone numbers, e-mail or links`}>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value.slice(0, 300))} rows={3} className="w-full resize-none rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" placeholder="Example: I need help to pay my child's school fee this month." />
            </Field>
            <Field label="Country of your payment account">
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm outline-none">
                {countries.map((c) => <option key={c} value={c}>{regionName(c)}</option>)}
              </select>
            </Field>
            <Field label="Payment method">
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => <button key={m} type="button" onClick={() => setMethod(m)} className={`rounded-full border px-3.5 py-1.5 text-xs font-bold ${method === m ? "border-emerald-400 bg-emerald-500 text-white" : "border-white/20 bg-white/5 text-gray-200"}`}>{m}</button>)}
              </div>
            </Field>
            <Field label="Bank name (if any)"><input value={bank} onChange={(e) => setBank(e.target.value)} maxLength={60} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" /></Field>
            <Field label="Account title"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" /></Field>
            <Field label="Account number / mobile account"><input value={number} onChange={(e) => setNumber(e.target.value)} maxLength={40} inputMode="text" className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 font-mono text-sm outline-none focus:border-emerald-400" /></Field>
            {goal !== null && cfg && (
              <div className="rounded-xl bg-lime-500 px-3 py-2 text-center text-xs font-extrabold text-black">Goal: {formatMoney(goal, currency)}{currency !== "USD" && ` (≈ $${(cfg.goal_usd_cents / 100).toFixed(2)})`}</div>
            )}
            <p className="text-[11px] text-gray-400">Your account details are shown only to signed-in heroes who tap “Help Me”, and disappear when your appeal is fully helped. Heroes send money directly to you; Givethra never holds it.</p>
            {formError && <p className="rounded-xl bg-red-500/15 p-3 text-sm text-red-200">{formError}</p>}
            {busy && progress > 0 && progress < 100 && <div className="h-2 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} /></div>}
            <button type="button" disabled={busy} onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3.5 text-sm font-extrabold shadow-lg active:scale-[0.99] disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{busy ? (progress < 100 && !uploadId ? `Uploading ${progress}%` : "Sending…") : "Submit for review"}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-400" />
            <h2 className="text-xl font-extrabold">Sent for review</h2>
            <p className="text-sm text-gray-300">Once an admin approves your video it will appear in the reel. We will notify you.</p>
            <button type="button" onClick={() => navigate({ to: "/helpme" })} className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-extrabold">Watch videos</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wide text-emerald-400">{label}</span>{hint && <span className="text-[10px] text-gray-500">{hint}</span>}</div>
      {children}
    </div>
  );
}
