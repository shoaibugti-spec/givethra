// src/frontend/src/pages/HelpMeCreatePage.tsx
// Create a video appeal: opens the PHONE'S OWN camera app (exactly like the normal camera: vertical, no zoom,
// good sound). Steps: check -> intro -> preview -> details -> done.
import { useAuth } from "@/contexts/AuthContext";
import { HelpMeError, isValidHelpMeAccountIdentifier, PAY_METHODS, formatMoney, helpme, niceGoal, regionName, type Eligibility, type HelpMeConfig } from "@/lib/helpme";
import { captureHelpMeThumbnail } from "@/lib/helpmeThumbnail";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, CheckCircle2, Loader2, RotateCcw, ShieldAlert, Video } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { toast } from "sonner";

type Step = "check" | "blocked" | "intro" | "preview" | "details" | "done";
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
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadId, setUploadId] = useState("");
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [desc, setDesc] = useState("");
  const [country, setCountry] = useState("PK");
  const [method, setMethod] = useState("");
  const [title, setTitle] = useState("");
  const [number, setNumber] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const durationRef = useRef(0);

  const maxSec = cfg?.max_seconds ?? 20;
  const minSec = cfg?.min_stop_seconds ?? 12;
  const countdown = useCountdown(elig?.next_allowed_at);

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

  function openCamera() {
    setCamError("");
    fileRef.current?.click();
  }

  async function onVideoPicked(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCamError("");
    if (!file.type.startsWith("video/")) { setCamError("Please record a video with the camera."); return; }
    const maxBytes = cfg?.max_bytes ?? 40 * 1024 * 1024;
    if (file.size > maxBytes) { setCamError(`This video is too large (${Math.round(file.size / 1048576)} MB, limit ${Math.round(maxBytes / 1048576)} MB). Set your camera to HD (720p) and record again.`); return; }
    const probeUrl = URL.createObjectURL(file);
    try {
      const meta = await new Promise<{ d: number; w: number; h: number }>((resolve, reject) => {
        const v = document.createElement("video");
        const timer = window.setTimeout(() => reject(new Error("timeout")), 10000);
        v.preload = "metadata"; v.muted = true;
        v.onloadedmetadata = () => { window.clearTimeout(timer); resolve({ d: v.duration, w: v.videoWidth, h: v.videoHeight }); };
        v.onerror = () => { window.clearTimeout(timer); reject(new Error("unreadable")); };
        v.src = probeUrl;
      });
      if (Number.isFinite(meta.d) && meta.d > maxSec + 0.5) { setCamError(`Video is ${Math.round(meta.d)}s. Please record at most ${maxSec} seconds.`); return; }
      if (Number.isFinite(meta.d) && meta.d < minSec - 0.5) { setCamError(`Video is only ${Math.round(meta.d)}s. Please record ${minSec} to ${maxSec} seconds.`); return; }
      if (!(meta.h > meta.w)) { setCamError("Please hold your phone upright (vertical) and record again."); return; }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      durationRef.current = Number.isFinite(meta.d) ? Math.round(meta.d * 1000) : minSec * 1000;
      setBlob(file);
      setUploadId("");
      setPreviewUrl(URL.createObjectURL(file));
      setStep("preview");
    } catch {
      setCamError("This video could not be read. Please record it again.");
    } finally {
      URL.revokeObjectURL(probeUrl);
    }
  }

  function retake() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setBlob(null);
    setUploadId("");
    openCamera();
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
    if (title.trim().length < 2 || !isValidHelpMeAccountIdentifier(number)) return setFormError("Enter the account title and a valid account, IBAN or wallet identifier.");
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
        pay_bank_name: "", pay_account_title: title.trim(), pay_account_number: number.trim(), duration_ms: Math.round(durationRef.current),
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

  const leave = () => navigate({ to: "/helpme" });

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
              <li>• Record {minSec} to {maxSec} seconds, with your phone upright.</li>
              <li>• Speak clearly: who you are and what you need.</li>
              <li>• Your normal phone camera will open. Record, then tap the tick to use the video.</li>
            </ul>
            {camError && <p className="max-w-[300px] text-sm text-amber-300">{camError}</p>}
            <button type="button" onClick={openCamera} className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 px-7 py-3.5 text-sm font-extrabold shadow-lg active:scale-95"><Video className="h-4 w-4" /> Open camera</button>
            <input ref={fileRef} type="file" accept="video/*" capture="user" onChange={onVideoPicked} className="hidden" />
          </div>
        )}

        {step === "preview" && (
          <div className="flex flex-1 flex-col px-4 pb-6">
            <div className="mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-2xl bg-black">
              <video src={previewUrl} controls playsInline className="h-full w-full object-contain" />
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
            <Field label="Preferred transfer type">
              <div className="flex flex-wrap gap-2">
                {methods.map((m) => <button key={m} type="button" onClick={() => setMethod(m)} className={`rounded-full border px-3.5 py-1.5 text-xs font-bold ${method === m ? "border-emerald-400 bg-emerald-500 text-white" : "border-white/20 bg-white/5 text-gray-200"}`}>{m}</button>)}
              </div>
            </Field>
            <Field label="Account title"><input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" /></Field>
            <Field label="Account number, IBAN or wallet ID"><input value={number} onChange={(e) => setNumber(e.target.value)} maxLength={40} inputMode="text" className="w-full rounded-xl border border-white/15 bg-slate-900 px-3 py-2.5 font-mono text-sm outline-none focus:border-emerald-400" /></Field>
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
