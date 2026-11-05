// src/pages/KycPage.tsx
// Givethra - Premium Globalized KYC Page (240+ countries with search)
// Camera, OCR, Selfie & Video Recording — All logic preserved.

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendNotification } from "@/lib/notify";
import { Shield, CheckCircle2, Clock, AlertTriangle, Camera, Eye, RefreshCw, ArrowRight, X, Globe, User, FileText, Video, Sparkles, Lock, ChevronRight, Check, Search } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import Tesseract from "tesseract.js";
import { formatCnicNumber, getKycOcrAssetPaths } from "@/lib/kycOcr";
import { getCountryProfile, COUNTRIES_LIST, ALL_COUNTRIES as COUNTRIES } from "@/lib/countryProfiles";
import {
  getKycSubmission,
  insertKycSubmission,
  updateKycSubmission,
  uploadFileToStorage,
} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

// ---------------------------------------------------------------------------
// OCR helpers (Original logic preserved)
// ---------------------------------------------------------------------------
function toOcrCanvas(src: HTMLCanvasElement, fx = 0, fy = 0, fw = 1, fh = 1, targetWidth = 1800, binarize = false): HTMLCanvasElement {
  const sx = Math.round(src.width * fx); const sy = Math.round(src.height * fy);
  const sw = Math.max(1, Math.round(src.width * fw)); const sh = Math.max(1, Math.round(src.height * fh));
  const scale = Math.min(targetWidth / sw, 3);
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(sw * scale)); out.height = Math.max(1, Math.round(sh * scale));
  const ctx = out.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null;
  if (!ctx) return out;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, out.width, out.height);
  try {
    const img = ctx.getImageData(0, 0, out.width, out.height); const d = img.data;
    const hist = new Uint32Array(256);
    for (let i = 0; i < d.length; i += 4) {
      const g = Math.round((d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000);
      d[i] = d[i + 1] = d[i + 2] = g; hist[g]++;
    }
    const total = out.width * out.height; let acc = 0, lo = 0, hi = 255;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.02) { lo = v; break; } }
    acc = 0;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.98) { hi = v; break; } }
    const range = Math.max(hi - lo, 1);
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.max(0, Math.min(255, Math.round(((d[i] - lo) * 255) / range)));
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    if (binarize) {
      const h = new Uint32Array(256);
      for (let i = 0; i < d.length; i += 4) h[d[i]]++;
      let sum = 0; for (let t = 0; t < 256; t++) sum += t * h[t];
      let sumB = 0, wB = 0, best = 0, thr = 128;
      for (let t = 0; t < 256; t++) {
        wB += h[t]; if (!wB) continue;
        const wF = total - wB; if (!wF) break;
        sumB += t * h[t];
        const mB = sumB / wB, mF = (sum - sumB) / wF;
        const between = wB * wF * (mB - mF) * (mB - mF);
        if (between > best) { best = between; thr = t; }
      }
      for (let i = 0; i < d.length; i += 4) { const v = d[i] > thr ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = v; }
    }
    ctx.putImageData(img, 0, 0);
  } catch {}
  return out;
}

const DIGITISH = "[0-9OoQDIil|SsBZzG]";
const CNIC_RE = new RegExp(`(${DIGITISH}{5})[\\s\\-._]{0,2}(${DIGITISH}{7})[\\s\\-._]{0,2}(${DIGITISH})(?![0-9])`, "g");
const DIGIT_FIX: Record<string, string> = { O: "0", o: "0", Q: "0", D: "0", I: "1", i: "1", l: "1", "|": "1", S: "5", s: "5", B: "8", Z: "2", z: "2", G: "6" };

function findCnicAll(text: string): Array<{ number: string; real: number }> {
  const found: Array<{ number: string; real: number }> = [];
  CNIC_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CNIC_RE.exec(text)) !== null) {
    const raw = m[1] + m[2] + m[3];
    const real = (raw.match(/[0-9]/g) || []).length;
    if (real < 9) continue;
    const digits = raw.split("").map((c) => DIGIT_FIX[c] ?? c).join("");
    if (!/^\d{13}$/.test(digits)) continue;
    found.push({ number: `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`, real });
  }
  return found;
}

const CNIC_STRONG = ["PAKISTAN", "IDENTITY", "ISLAMIC", "REPUBLIC", "FATHER", "HUSBAND", "GENDER", "COUNTRY", "SIGNATURE", "NATIONAL"];
const CNIC_WEAK = ["NUMBER", "BIRTH", "EXPIRY", "ISSUE", "CARD"];

function within1(a: string, b: string): boolean {
  if (a === b) return true;
  if (b.length < 6) return false;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

function looksLikeCnic(text: string): boolean {
  const words = text.toUpperCase().split(/[^A-Z]+/).filter((w) => w.length >= 5);
  const hit = (list: string[]) => list.filter((k) => words.some((w) => within1(w, k))).length;
  return hit(CNIC_STRONG) >= 1 || hit(CNIC_STRONG) + hit(CNIC_WEAK) >= 2;
}

function meanBrightness(src: HTMLCanvasElement): number {
  try {
    const w = 160;
    const h = Math.max(1, Math.round((src.height / src.width) * w));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null;
    if (!ctx) return 255;
    ctx.drawImage(src, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
    return sum / (w * h);
  } catch { return 255; }
}

async function readCnicNumber(card: HTMLCanvasElement, onStep?: (step: number, total: number) => void, onStatus?: (status: string) => void): Promise<{ number: string | null; isCnic: boolean }> {
  const passes: Array<[number, number, number, number, number, boolean]> = [
    [0, 0, 1, 1, 1800, false], [0, 0.3, 0.8, 0.65, 1600, false],
    [0, 0.45, 0.7, 0.4, 1600, false], [0, 0.45, 0.7, 0.4, 1600, true],
  ];
  const assetPaths = getKycOcrAssetPaths(import.meta.env.BASE_URL || "/");
  onStatus?.("Preparing the local ID reader...");
  const worker = await Tesseract.createWorker("eng", 1, {
    ...assetPaths, workerBlobURL: false, gzip: true,
    logger: (message) => {
      if (message.status === "loading tesseract core") onStatus?.("Loading the ID reader...");
      else if (message.status === "loading language traineddata") onStatus?.("Loading local OCR data...");
    },
  });
  try {
    const votes = new Map<string, { n: number; real: number }>();
    let allText = "";
    const pick = () => {
      let best: { number: string; n: number; real: number } | null = null;
      votes.forEach((v, number) => { if (!best || v.n > best.n || (v.n === best.n && v.real > best.real)) best = { number, ...v }; });
      return best as { number: string; n: number; real: number } | null;
    };
    for (let i = 0; i < passes.length; i++) {
      onStep?.(i + 1, passes.length);
      const [fx, fy, fw, fh, tw, bin] = passes[i];
      const result = await worker.recognize(toOcrCanvas(card, fx, fy, fw, fh, tw, bin));
      const text = result.data.text || "";
      allText += "\n" + text;
      for (const f of findCnicAll(text)) {
        const cur = votes.get(f.number);
        votes.set(f.number, { n: (cur?.n ?? 0) + 1, real: Math.max(cur?.real ?? 0, f.real) });
      }
      const best = pick();
      if (best && looksLikeCnic(allText) && (best.n >= 2 || best.real === 13)) return { number: best.number, isCnic: true };
    }
    const best = pick();
    return { number: best ? best.number : null, isCnic: looksLikeCnic(allText) };
  } finally { await worker.terminate(); }
}

function boxBlurH(src: Float32Array, W: number, H: number, r: number): Float32Array {
  const out = new Float32Array(W * H); const n = 2 * r + 1;
  for (let y = 0; y < H; y++) {
    const row = y * W; let sum = 0;
    for (let k = -r; k <= r; k++) sum += src[row + Math.min(W - 1, Math.max(0, k))];
    for (let x = 0; x < W; x++) {
      out[row + x] = sum / n;
      const add = Math.min(W - 1, x + r + 1); const rem = Math.max(0, x - r);
      sum += src[row + add] - src[row + rem];
    }
  }
  return out;
}
function boxBlurV(src: Float32Array, W: number, H: number, r: number): Float32Array {
  const out = new Float32Array(W * H); const n = 2 * r + 1;
  for (let x = 0; x < W; x++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += src[Math.min(H - 1, Math.max(0, k)) * W + x];
    for (let y = 0; y < H; y++) {
      out[y * W + x] = sum / n;
      const add = Math.min(H - 1, y + r + 1); const rem = Math.max(0, y - r);
      sum += src[add * W + x] - src[rem * W + x];
    }
  }
  return out;
}
function creteBlur(g: Float32Array, W: number, H: number): number {
  const bv = boxBlurV(g, W, H, 4); const bh = boxBlurH(g, W, H, 4);
  let sF = 0, sV = 0;
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const i = y * W + x;
      const dxF = Math.abs(g[i + 1] - g[i]); const dyF = Math.abs(g[i + W] - g[i]);
      const dxB = Math.abs(bh[i + 1] - bh[i]); const dyB = Math.abs(bv[i + W] - bv[i]);
      sF += dxF + dyF;
      sV += Math.max(0, dxF - dxB) + Math.max(0, dyF - dyB);
    }
  }
  return sF > 0 ? (sF - sV) / sF : 1;
}
const BLUR_MAX = 0.33;
function blurOfCanvas(src: HTMLCanvasElement): number {
  const ctx = src.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null;
  const d = ctx ? ctx.getImageData(0, 0, src.width, src.height) : null;
  if (!d) return 0;
  const g = new Float32Array(src.width * src.height);
  for (let i = 0, o = 0; i < g.length; i++, o += 4) g[i] = (d.data[o] * 299 + d.data[o + 1] * 587 + d.data[o + 2] * 114) / 1000;
  return creteBlur(g, src.width, src.height);
}

function scaleCanvas(src: HTMLCanvasElement, maxWidth: number): HTMLCanvasElement {
  if (src.width <= maxWidth) return src;
  const out = document.createElement("canvas"); out.width = maxWidth;
  out.height = Math.round((src.height * maxWidth) / src.width);
  const ctx = out.getContext("2d");
  if (ctx) { ctx.imageSmoothingQuality = "high"; ctx.drawImage(src, 0, 0, out.width, out.height); return out; }
  return src;
}

function enhanceRGBA(d: Uint8ClampedArray, W: number, H: number): void {
  const n = W * H;
  const hist = new Uint32Array(256);
  for (let i = 0; i < n; i++) { const o = i * 4; hist[Math.round((d[o] * 299 + d[o + 1] * 587 + d[o + 2] * 114) / 1000)]++; }
  let acc = 0, lo = 0, hi = 255;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= n * 0.01) { lo = v; break; } }
  acc = 0;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= n * 0.99) { hi = v; break; } }
  const gain = Math.min(1.6, 239 / Math.max(hi - lo, 1));
  if (gain > 1.05) {
    for (let i = 0; i < n; i++) { const o = i * 4; d[o] = (d[o] - lo) * gain + 8; d[o + 1] = (d[o + 1] - lo) * gain + 8; d[o + 2] = (d[o + 2] - lo) * gain + 8; }
  }
  const amount = 0.9;
  for (let c = 0; c < 3; c++) {
    const ch = new Float32Array(n);
    for (let i = 0; i < n; i++) ch[i] = d[i * 4 + c];
    let b = boxBlurH(ch, W, H, 2); b = boxBlurV(b, W, H, 2); b = boxBlurH(b, W, H, 2); b = boxBlurV(b, W, H, 2);
    for (let i = 0; i < n; i++) { const diff = ch[i] - b[i]; if (Math.abs(diff) > 2) d[i * 4 + c] = ch[i] + amount * diff; else d[i * 4 + c] = ch[i]; }
  }
}

const BLUR_MESSAGE = "This photo is blurry. Hold the phone steady, wait for the camera to focus, keep the card flat in good light, and retake it.";
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
function isPermissionError(err: any): boolean { const n = err?.name; return n === "NotAllowedError" || n === "PermissionDeniedError" || n === "SecurityError"; }

function pickRecorderMime(): string {
  const MR: any = (window as any).MediaRecorder;
  if (!MR || typeof MR.isTypeSupported !== "function") return "";
  const candidates = ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4;codecs=avc1,mp4a.40.2", "video/mp4"];
  return candidates.find((t) => MR.isTypeSupported(t)) || "";
}

const VIDEO_STEPS = [
  { until: 3, en: "Look straight at the camera", ur: "Seedha camera ki taraf dekhein" },
  { until: 6, en: "Slowly turn your face to the RIGHT", ur: "Chehra aahista se DAYEIN taraf ghumayein" },
  { until: 9, en: "Slowly turn your face to the LEFT", ur: "Chehra aahista se BAYEIN taraf ghumayein" },
  { until: 12, en: "Look slightly UP", ur: "Thoda UPAR dekhein" },
  { until: 99, en: "Look straight again — almost done", ur: "Dobara seedha dekhein — bas khatam" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function KycPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const returnTo = (() => { try { return sessionStorage.getItem("givethra_kyc_return_to") || "/home"; } catch { return "/home"; } })();
  
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const [countryName, setCountryName] = useState("Pakistan");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [docType, setDocType] = useState<"cnic" | "passport">("cnic");
  const [reapplying, setReapplying] = useState(false);

  const [form, setForm] = useState({ full_name: "", date_of_birth: "", address: "", cnic_number: "" });
  const [cnicFront, setCnicFront] = useState<File | null>(null);
  const [cnicFrontPreview, setCnicFrontPreview] = useState<string | null>(null);
  const [cnicBack, setCnicBack] = useState<File | null>(null);
  const [cnicBackPreview, setCnicBackPreview] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [passportFile, setPassportFile] = useState<File | null>(null);

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoBlob, setVideoBlob] = useState<string | null>(null);
  const [videoRecording, setVideoRecording] = useState(false);
  const [videoTimer, setVideoTimer] = useState(0);

  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<string>("");
  const [ocrFailed, setOcrFailed] = useState(false);
  const [ocrDetectedNumber, setOcrDetectedNumber] = useState<string | null>(null);
  const [manualEntryAllowed, setManualEntryAllowed] = useState(false);
  const [manualCnicNumber, setManualCnicNumber] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const [focusHint, setFocusHint] = useState("");
  const [focusFallbackAvailable, setFocusFallbackAvailable] = useState(false);
  const [focusBypass, setFocusBypass] = useState(false);
  const focusBypassRef = useRef(false);
  const [capturedBlur, setCapturedBlur] = useState<number | null>(null);
  const captureRunRef = useRef(0);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraRes, setCameraRes] = useState<{ w: number; h: number } | null>(null);
  const [camPerm, setCamPerm] = useState<"unknown" | "granted" | "denied" | "prompt">("unknown");
  const [videoOpen, setVideoOpen] = useState(false);
  const [cameraProblem, setCameraProblem] = useState<{ kind: "photo" | "video"; target?: string; message: string; canRetry: boolean } | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoCountdown, setVideoCountdown] = useState<number | null>(null);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoCancelledRef = useRef(false);
  const runIdRef = useRef(0);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedKind, setCapturedKind] = useState<"front" | "back" | "selfie" | null>(null);
  const [capturedCanvas, setCapturedCanvas] = useState<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);

  const countryProfile = getCountryProfile(countryName);
  const isPakistan = countryName.toLowerCase() === "pakistan";

  // 🌍 All 240+ countries with search
  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [countrySearch]);

  useEffect(() => {
    if (user) {
      loadSubmission();
      const interval = setInterval(loadSubmission, 30000);
      const onFocus = () => loadSubmission();
      window.addEventListener("focus", onFocus);
      document.addEventListener("visibilitychange", onFocus);
      return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onFocus); };
    } else { setIsLoading(false); }
  }, [user]);

  useEffect(() => { return () => { if (stream) stream.getTracks().forEach(t => t.stop()); }; }, [stream]);

  const showForm = !!user && !isLoading && !loadError && (!submission || reapplying);
  useEffect(() => {
    if (!showForm) return;
    let cancelled = false; let status: any = null;
    (async () => {
      try {
        status = await (navigator as any).permissions?.query?.({ name: "camera" });
        if (status) {
          status.onchange = () => { if (cancelled) return; setCamPerm(status.state === "granted" ? "granted" : status.state === "denied" ? "denied" : "prompt"); };
          if (status.state === "granted") { setCamPerm("granted"); return; }
          if (status.state === "denied") { setCamPerm("denied"); return; }
          setCamPerm("prompt");
        }
      } catch {}
      if (!cancelled) await requestCameraAccess();
    })();
    return () => { cancelled = true; if (status) status.onchange = null; };
  }, [showForm]);

  useEffect(() => {
    const v = liveVideoRef.current;
    if (videoOpen && liveStream && v) {
      v.srcObject = liveStream;
      const p = v.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, [videoOpen, liveStream]);

  useEffect(() => {
    return () => {
      runIdRef.current++; videoCancelledRef.current = true;
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      try { const r = mediaRecorderRef.current; if (r && r.state !== "inactive") r.stop(); } catch {}
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function markDeniedIfBlocked(): Promise<boolean> {
    try {
      const st = await (navigator as any).permissions?.query?.({ name: "camera" });
      if (st && st.state !== "denied") { setCamPerm("prompt"); return false; }
    } catch {}
    setCamPerm("denied"); return true;
  }

  async function cameraFail(err: any, kind: "photo" | "video", target?: string) {
    console.error("KYC camera problem", err);
    let message = "The camera could not be started. Close other apps that use the camera and try again.";
    let canRetry = true;
    if (typeof window !== "undefined" && (!window.isSecureContext || !navigator.mediaDevices)) {
      message = "Camera only works on a secure (https://) link. Please open the official Givethra link in Chrome or Safari."; canRetry = false;
    } else if (err?.name === "NotSupportedError" || err?.name === "TypeError") {
      message = "This browser cannot open the camera inside the page. Use your phone's camera instead."; canRetry = false;
    } else if (isPermissionError(err)) {
      const blocked = await markDeniedIfBlocked();
      message = blocked ? "Camera / microphone is blocked for this site. Follow the steps shown on the page." : "Permission was not given. Tap Try Again and press Allow.";
    } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
      message = "No camera was found on this device. You can use your phone's camera instead."; canRetry = false;
    }
    setCameraProblem({ kind, target, message, canRetry });
  }

  function openNativeCapture() {
    const prob = cameraProblem; setCameraProblem(null);
    if (!prob) return;
    if (prob.kind === "video") videoInputRef.current?.click();
    else if (photoInputRef.current) { photoInputRef.current.setAttribute("capture", prob.target === "selfie" ? "user" : "environment"); photoInputRef.current.dataset.kind = prob.target || "front"; photoInputRef.current.click(); }
  }
  function retryCamera() {
    const prob = cameraProblem; setCameraProblem(null);
    if (!prob) return;
    if (prob.kind === "video") void startVideoRecording();
    else void startPhotoCamera(prob.target || "front");
  }

  function handleNativePhoto(file: File, kind: "front" | "back" | "selfie") {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 3000 / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      setOcrError(null); setOcrFailed(false); setManualEntryAllowed(false); setManualCnicNumber("");
      setCapturedBlur(kind === "selfie" ? null : blurOfCanvas(scaleCanvas(c, 800)));
      setCapturedImage(scaleCanvas(c, 1200).toDataURL("image/jpeg", 0.88));
      setCapturedCanvas(c); setCapturedKind(kind);
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast.error("The photo could not be opened. Please try again."); };
    img.src = url;
  }
  function handleNativeVideo(file: File) {
    if (file.size > 150 * 1024 * 1024) { toast.error("The video is too large. Please record a short video."); return; }
    setVideoFile(file); setVideoBlob(URL.createObjectURL(file));
  }

  async function requestCameraAccess(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    let s: MediaStream | null = null; let lastErr: any = null;
    for (const c of [{ video: true, audio: true }, { video: true }] as MediaStreamConstraints[]) {
      try { s = await navigator.mediaDevices.getUserMedia(c); break; } catch (err) { lastErr = err; if (isPermissionError(err)) break; }
    }
    s?.getTracks().forEach((t) => t.stop());
    if (s) { setCamPerm("granted"); return true; }
    if (isPermissionError(lastErr)) await markDeniedIfBlocked();
    return false;
  }

  useEffect(() => {
    const v = videoRef.current;
    if (activeCamera && stream && v) {
      v.srcObject = stream;
      const p = v.play?.(); if (p && typeof p.catch === "function") p.catch(() => {});
      setFocusing(true); focusBypassRef.current = false; setFocusBypass(false); setFocusFallbackAvailable(false);
      setFocusHint(activeCamera === "selfie" ? "Camera is settling — hold still for a moment." : "Checking focus — hold the phone steady and keep the whole ID inside the frame.");
      let sharpFrames = 0, cancelled = false; let selfieReadyTimer: ReturnType<typeof setTimeout> | undefined;
      const scanFocus = () => {
        if (cancelled || activeCamera === "selfie" || focusBypassRef.current) return;
        let sample: HTMLCanvasElement | null = null; let score = 1;
        try { sample = grabFrame(800); if (sample) score = blurOfCanvas(sample); } catch { score = 1; }
        finally { if (sample) { sample.width = 0; sample.height = 0; } }
        if (score <= BLUR_MAX) {
          sharpFrames++;
          if (sharpFrames >= 3) { setFocusing(false); setFocusFallbackAvailable(false); setFocusHint("Image is clear and in focus — you can capture now."); }
          else { setFocusHint("Image is getting clear — keep the phone steady."); }
        } else { sharpFrames = 0; setFocusing(true); setFocusHint("Still focusing — hold steady and improve the light if needed."); }
      };
      const scanTimer = activeCamera === "selfie" ? undefined : setInterval(scanFocus, 350);
      const fallbackTimer = activeCamera === "selfie" ? undefined : setTimeout(() => {
        if (cancelled || focusBypassRef.current || sharpFrames >= 3) return;
        setFocusFallbackAvailable(true);
        setFocusHint("Focus could not be confirmed. Move slightly closer/farther; if the card text looks readable, you can use the fallback below.");
      }, 8000);
      if (activeCamera === "selfie") {
        selfieReadyTimer = setTimeout(() => { if (cancelled) return; setFocusing(false); setFocusHint("Camera is ready — you can capture now."); }, 1200);
      }
      return () => { cancelled = true; if (scanTimer) clearInterval(scanTimer); if (fallbackTimer) clearTimeout(fallbackTimer); if (selfieReadyTimer) clearTimeout(selfieReadyTimer); };
    }
  }, [activeCamera, stream]);

  async function loadSubmission() {
    if (!user) return;
    try {
      const data = await getKycSubmission(user.id);
      setSubmission(data ? { ...data, status: String(data.status || "none").trim().toLowerCase() } : null);
      setLoadError(null);
    } catch (err) { console.error("Failed to load KYC submission", err); setLoadError("We couldn't verify your current KYC status. Please retry."); }
    finally { setIsLoading(false); }
  }

  async function startPhotoCamera(target: string) {
    setCameraProblem(null); setFocusing(true); setFocusFallbackAvailable(false); setFocusBypass(false); focusBypassRef.current = false;
    setFocusHint("Starting camera and checking focus...");
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new DOMException("Camera API unavailable", "NotSupportedError");
      stream?.getTracks().forEach((t) => t.stop());
      setOcrError(null); setCapturedImage(null); setCapturedKind(null); setCapturedCanvas(null); setCameraRes(null); setOcrFailed(false);
      const facing = target === "selfie" ? "user" : "environment";
      let s: MediaStream;
      try {
        s = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: facing }, width: { ideal: target === "selfie" ? 1920 : 3840 }, height: { ideal: target === "selfie" ? 1080 : 2160 }, advanced: [{ focusMode: "continuous" } as any] } });
      } catch (err: any) {
        if (isPermissionError(err)) throw err;
        try { s = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: facing } }); }
        catch (err2: any) { if (isPermissionError(err2)) throw err2; s = await navigator.mediaDevices.getUserMedia({ audio: false, video: true }); }
      }
      setCamPerm("granted");
      try {
        const [track] = s.getVideoTracks();
        const caps: any = track.getCapabilities ? track.getCapabilities() : {};
        const adv: any = {};
        if (caps?.focusMode?.includes?.("continuous")) adv.focusMode = "continuous";
        if (caps?.exposureMode?.includes?.("continuous")) adv.exposureMode = "continuous";
        if (caps?.whiteBalanceMode?.includes?.("continuous")) adv.whiteBalanceMode = "continuous";
        if (Object.keys(adv).length) await track.applyConstraints({ advanced: [adv] });
        setTorchSupported(!!caps?.torch); setTorchOn(false);
      } catch {}
      setStream(s); setActiveCamera(target);
    } catch (err: any) { await cameraFail(err, "photo", target); }
  }

  async function toggleTorch() {
    const track = stream?.getVideoTracks()[0]; if (!track) return;
    try { await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] }); setTorchOn((v) => !v); }
    catch { toast.error("The flashlight is not available on this camera."); }
  }

  function getCropRect(): { x: number; y: number; w: number; h: number } | null {
    const video = videoRef.current; const frame = frameRef.current;
    if (!video || !frame || video.videoWidth === 0 || video.videoHeight === 0) return null;
    const videoRect = video.getBoundingClientRect(); const frameRect = frame.getBoundingClientRect();
    if (videoRect.width === 0 || videoRect.height === 0) return null;
    const scaleX = video.videoWidth / videoRect.width; const scaleY = video.videoHeight / videoRect.height;
    const x = (frameRect.left - videoRect.left) * scaleX; const y = (frameRect.top - videoRect.top) * scaleY;
    const w = frameRect.width * scaleX; const h = frameRect.height * scaleY;
    return { x, y, w, h };
  }

  function grabFrame(maxWidth?: number): HTMLCanvasElement | null {
    const video = videoRef.current; const rect = getCropRect();
    if (!video || !rect || rect.w <= 0 || rect.h <= 0) return null;
    const x = Math.max(0, Math.round(rect.x)); const y = Math.max(0, Math.round(rect.y));
    const w = Math.min(video.videoWidth - x, Math.round(rect.w)); const h = Math.min(video.videoHeight - y, Math.round(rect.h));
    if (w <= 0 || h <= 0) return null;
    const cw = maxWidth && w > maxWidth ? maxWidth : w;
    const ch = maxWidth && w > maxWidth ? Math.round((h * maxWidth) / w) : h;
    const canvas = document.createElement("canvas"); canvas.width = cw; canvas.height = ch;
    const ctx = canvas.getContext("2d", { willReadFrequently: !!maxWidth } as any) as CanvasRenderingContext2D | null;
    if (!ctx) return null;
    ctx.imageSmoothingQuality = "high"; ctx.drawImage(video, x, y, w, h, 0, 0, cw, ch);
    return canvas;
  }

  async function captureImage() {
    if (capturing || (focusing && !focusBypassRef.current)) return;
    setOcrError(null); setOcrFailed(false); setOcrDetectedNumber(null); setManualEntryAllowed(false); setManualCnicNumber("");
    const kind = activeCamera as "front" | "back" | "selfie"; const runId = ++captureRunRef.current;
    let best: HTMLCanvasElement | null = null; let bestBlur = 1;
    if (kind === "selfie") { best = grabFrame(); }
    else {
      setCapturing(true); const FRAMES = 8;
      for (let i = 0; i < FRAMES; i++) {
        const small = grabFrame(800);
        if (small) {
          const score = blurOfCanvas(small);
          if (!best || score < bestBlur) {
            const full = grabFrame();
            if (full) { if (best) { best.width = 0; best.height = 0; } best = full; bestBlur = score; }
          }
        }
        if (i < FRAMES - 1) await sleep(110);
        if (runId !== captureRunRef.current) { setCapturing(false); return; }
      }
      setCapturing(false);
    }
    if (runId !== captureRunRef.current) return;
    if (!best) { toast.error("The photo could not be captured. Please try again."); return; }
    setOcrFailed(false);
    setCapturedBlur(kind === "selfie" ? null : bestBlur);
    setCapturedImage(scaleCanvas(best, 1200).toDataURL("image/jpeg", 0.88));
    setCapturedCanvas(best); setCapturedKind(kind);
    if (kind === "front") void verifyCapturedImage(best, kind, bestBlur);
    stream?.getTracks().forEach(t => t.stop()); setStream(null); setActiveCamera(null);
  }

  async function verifyCapturedImage(imageCanvas: HTMLCanvasElement | null = capturedCanvas, imageKind: "front" | "back" | "selfie" | null = capturedKind, imageBlur: number | null = capturedBlur) {
    if (!imageCanvas || !imageKind) { toast.error("Please capture the photo first."); return; }
    if (imageKind === "front") {
      setOcrProcessing(true); setOcrError(null); setOcrFailed(false); setManualEntryAllowed(false);
      setOcrStatus("Preparing the local ID reader...");
      try {
        const { number, isCnic } = await readCnicNumber(imageCanvas, (step, total) => setOcrStatus(`Reading the number from the photo... (${step}/${total})`), (status) => setOcrStatus(status));
        setOcrProcessing(false); setOcrStatus("");
        if (number && isCnic) { setOcrDetectedNumber(number); setManualCnicNumber(number.replace(/\D/g, "")); setManualEntryAllowed(false); toast.success("ID number scanned. Review it below and correct any digit before confirming."); }
        else {
          setOcrFailed(true); setManualEntryAllowed(isCnic && !number);
          setOcrError(number ? "This does not look like the front of an ID card." : imageBlur !== null && imageBlur > BLUR_MAX ? BLUR_MESSAGE : meanBrightness(imageCanvas) < 55 ? "The ID number could not be read because the photo is too dark." : "The ID number could not be read. Please retake.");
        }
      } catch (error) {
        setOcrProcessing(false); setOcrStatus(""); setOcrFailed(true); setManualEntryAllowed(true);
        setOcrError("Automatic reading is unavailable. Your photo is saved here. Retry, or enter the number manually.");
      }
    } else { finalizeCapture(imageKind, imageCanvas); }
  }

  function continueWithManualCnic() {
    if (!capturedCanvas || capturedKind !== "front") return;
    const formatted = formatCnicNumber(manualCnicNumber);
    if (!formatted) { toast.error("Enter all 13 ID digits exactly as printed on the card."); return; }
    setForm((current) => ({ ...current, cnic_number: formatted }));
    finalizeCapture("front", capturedCanvas);
    toast.success("ID number confirmed. Photo saved for verification.");
  }

  function finalizeCapture(kind: "front" | "back" | "selfie", canvas: HTMLCanvasElement) {
    const out = scaleCanvas(canvas, 2000);
    if (kind !== "selfie") {
      try {
        const octx = out.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null;
        if (octx) { const img = octx.getImageData(0, 0, out.width, out.height); enhanceRGBA(img.data, out.width, out.height); octx.putImageData(img, 0, 0); }
      } catch {}
    }
    out.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${kind}.jpg`, { type: "image/jpeg" });
      const preview = out.toDataURL("image/jpeg", 0.85);
      if (kind === "front") { setCnicFront(file); setCnicFrontPreview(preview); }
      else if (kind === "back") { setCnicBack(file); setCnicBackPreview(preview); }
      else { setSelfie(file); setSelfiePreview(preview); }
      setCapturedImage(null); setCapturedCanvas(null); setCapturedKind(null); setCapturedBlur(null);
      setOcrError(null); setOcrFailed(false); setOcrDetectedNumber(null); setManualEntryAllowed(false); setManualCnicNumber("");
      toast.success(`${kind === "front" ? "ID Front" : kind === "back" ? "ID Back" : "Selfie"} captured!`);
    }, "image/jpeg", 0.92);
  }

  function cancelCaptured() {
    setCapturedImage(null); setCapturedCanvas(null); setCapturedKind(null); setCapturedBlur(null);
    setOcrError(null); setOcrFailed(false); setOcrDetectedNumber(null); setManualEntryAllowed(false); setManualCnicNumber("");
    if (capturedKind) startPhotoCamera(capturedKind);
  }

  function clearRecordTimer() { if (recordTimerRef.current) { clearInterval(recordTimerRef.current); recordTimerRef.current = null; } }
  function stopVideoStream() { videoStreamRef.current?.getTracks().forEach((t) => t.stop()); videoStreamRef.current = null; setLiveStream(null); }

  function cancelVideoRecording() {
    videoCancelledRef.current = true; runIdRef.current++; clearRecordTimer();
    const r = mediaRecorderRef.current; mediaRecorderRef.current = null;
    try { if (r && r.state !== "inactive") r.stop(); } catch {}
    stopVideoStream(); setVideoRecording(false); setVideoCountdown(null); setVideoTimer(0); setVideoOpen(false);
  }

  function grabAutoSelfie() {
    const v = liveVideoRef.current; if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d"); if (!ctx) return; ctx.drawImage(v, 0, 0);
    c.toBlob((blob) => {
      if (!blob) return;
      const f = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      const preview = c.toDataURL("image/jpeg", 0.85);
      setSelfie((prev) => prev ?? f); setSelfiePreview((prev) => prev ?? preview);
    }, "image/jpeg", 0.92);
  }

  async function startVideoRecording() {
    setCameraProblem(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { await cameraFail(window.isSecureContext ? { name: "NotSupportedError" } : null, "video"); return; }
    const runId = ++runIdRef.current; videoCancelledRef.current = false; setOcrError(null);
    const attempts: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24, max: 30 } }, audio: { echoCancellation: true, noiseSuppression: true, channelCount: { ideal: 1 } } },
      { video: { facingMode: "user" }, audio: true }, { video: { facingMode: "user" } },
    ];
    let s: MediaStream | null = null; let lastErr: any = null;
    for (const c of attempts) { try { s = await navigator.mediaDevices.getUserMedia(c); break; } catch (err) { lastErr = err; if (isPermissionError(err)) break; } }
    if (!s) { await cameraFail(lastErr, "video"); return; }
    if (runId !== runIdRef.current) { s.getTracks().forEach((t) => t.stop()); return; }
    setCamPerm("granted"); videoStreamRef.current = s; setLiveStream(s); setVideoTimer(0); setVideoRecording(false); setVideoOpen(true);
    for (let n = 3; n >= 1; n--) { setVideoCountdown(n); await sleep(1000); if (runId !== runIdRef.current) return; }
    setVideoCountdown(null);
    const mime = pickRecorderMime(); const opts: any = { videoBitsPerSecond: 1200000, audioBitsPerSecond: 64000 }; if (mime) opts.mimeType = mime;
    let recorder: MediaRecorder;
    try { recorder = new MediaRecorder(s, opts); }
    catch { try { recorder = new MediaRecorder(s); } catch { cancelVideoRecording(); await cameraFail({ name: "NotSupportedError" }, "video"); return; } }
    mediaRecorderRef.current = recorder; videoChunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) videoChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      clearRecordTimer(); stopVideoStream(); setVideoRecording(false); setVideoCountdown(null); setVideoOpen(false);
      if (videoCancelledRef.current) return;
      const fullType = recorder.mimeType || mime || "video/webm";
      const blob = new Blob(videoChunksRef.current, { type: fullType });
      if (blob.size < 1000) { toast.error("The video could not be recorded. Please try again."); return; }
      const baseType = fullType.split(";")[0] || "video/webm";
      const ext = baseType.includes("mp4") ? "mp4" : "webm";
      setVideoFile(new File([blob], `face.${ext}`, { type: baseType })); setVideoBlob(URL.createObjectURL(blob));
      toast.success("Face video recorded.");
    };
    recorder.start(1000); setVideoRecording(true);
    let sec = 0;
    recordTimerRef.current = setInterval(() => {
      sec++; setVideoTimer(sec);
      if (sec === 2 || sec === 5 || sec === 9) grabAutoSelfie();
      if (sec >= 15) { clearRecordTimer(); try { if (recorder.state !== "inactive") recorder.stop(); } catch {} }
    }, 1000);
  }

  async function uploadFile(file: File, path: string): Promise<string> {
    try { return await uploadFileToStorage(file, path); }
    catch (error: any) { throw new Error(error.message); }
  }

  function startReapply() {
    if (submission) {
      setForm({ full_name: submission.full_name || "", date_of_birth: submission.date_of_birth || "", address: submission.address || "", cnic_number: submission.cnic_number || "" });
      if (submission.document_type) setDocType(submission.document_type === "passport" ? "passport" : "cnic");
    }
    setCnicFront(null); setCnicFrontPreview(null); setCnicBack(null); setCnicBackPreview(null); setSelfie(null); setSelfiePreview(null); setPassportFile(null); setVideoFile(null); setVideoBlob(null);
    setReapplying(true);
  }

  function isValidCnic(cnic: string): boolean { return /^\d{13}$/.test(cnic.replace(/-/g, "")); }

  function selfieFromVideoFile(file: File): Promise<File | null> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file); const v = document.createElement("video");
      let finished = false;
      const done = (f: File | null) => { if (finished) return; finished = true; URL.revokeObjectURL(url); resolve(f); };
      v.muted = true; v.playsInline = true; v.preload = "auto";
      v.onerror = () => done(null);
      v.onloadeddata = () => { try { v.currentTime = 1; } catch { done(null); } };
      v.onseeked = () => {
        try {
          if (!v.videoWidth) { done(null); return; }
          const c = document.createElement("canvas"); c.width = v.videoWidth; c.height = v.videoHeight;
          c.getContext("2d")?.drawImage(v, 0, 0);
          c.toBlob((blob) => done(blob ? new File([blob], "selfie.jpg", { type: "image/jpeg" }) : null), "image/jpeg", 0.92);
        } catch { done(null); }
      };
      window.setTimeout(() => done(null), 6000);
      v.src = url;
    });
  }

  async function handleSubmit() {
    if (!form.full_name) { toast.error("Full name is required"); return; }
    if (!videoFile) { toast.error("Please record a 15-second face video"); return; }
    let selfieFile = selfie;
    if (!selfieFile) {
      selfieFile = await selfieFromVideoFile(videoFile);
      if (selfieFile) setSelfie(selfieFile);
    }
    if (!selfieFile) { toast.error("Your face could not be captured from the video. Please re-record the video with your full face clearly visible."); return; }

    if (docType === "cnic") {
      if (!form.cnic_number || !cnicFront || !cnicBack) { toast.error("All ID fields, photos and selfie are required"); return; }
      if (!isValidCnic(form.cnic_number)) { toast.error("ID number must be 13 digits"); return; }
    } else {
      if (!passportFile) { toast.error("Please upload your passport PDF"); return; }
    }

    setIsSubmitting(true);
    try {
      const uid = user?.id; const stamp = Date.now();
      const videoUrl = await uploadFile(videoFile, `${uid}/face_video_${stamp}`);
      let frontUrl = "", backUrl = "", selfieUrl = "", passportUrl = "";
      if (docType === "cnic") {
        frontUrl = await uploadFile(cnicFront!, `${uid}/cnic_front_${stamp}`);
        backUrl = await uploadFile(cnicBack!, `${uid}/cnic_back_${stamp}`);
      } else {
        passportUrl = await uploadFile(passportFile!, `${uid}/passport_${stamp}`);
      }
      selfieUrl = await uploadFile(selfieFile!, `${uid}/selfie_${stamp}`);
      const payload: any = {
        user_id: uid, full_name: form.full_name, date_of_birth: form.date_of_birth || null, address: form.address,
        cnic_number: docType === "cnic" ? form.cnic_number : null,
        cnic_front_url: frontUrl || null, cnic_back_url: backUrl || null, selfie_url: selfieUrl || null,
        passport_url: passportUrl || null, face_video_url: videoUrl, document_type: docType,
        country: countryName,
        status: "pending", rejection_reason: null, submitted_at: new Date().toISOString(),
      };
      if (submission?.id) await updateKycSubmission(submission.id, payload);
      else await insertKycSubmission(payload);
      if (uid) await sendNotification(uid, "kyc_pending", "KYC Received ✅", "Thank you! Your identity verification is under review. This usually takes 1-3 days.", "/kyc");
      toast.success("KYC submitted! Review takes 1-3 business days.");
      setReapplying(false); loadSubmission();
    } catch (err) { toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`); }
    finally { setIsSubmitting(false); }
  }

  const statusConfig: any = {
    pending: { icon: <Clock className="h-4 w-4" />, label: "Under Review", color: "bg-amber-100 text-amber-700" },
    approved: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Approved", color: "bg-teal-100 text-teal-700" },
    rejected: { icon: <AlertTriangle className="h-4 w-4" />, label: "Rejected", color: "bg-red-100 text-red-700" },
  };

  // ---- VIDEO RECORDING VIEW ----
  if (videoOpen) {
    const videoStep = VIDEO_STEPS.find((st) => videoTimer < st.until) ?? VIDEO_STEPS[VIDEO_STEPS.length - 1];
    return (
      <div className="fixed inset-0 z-[120] flex flex-col bg-black text-white">
        <div className="shrink-0 space-y-1 bg-black/80 px-4 pb-2 text-center text-xs" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
          <p className="font-bold text-amber-300">Remove glasses, cap, hat or mask. Keep your full face in the oval, in good light.</p>
        </div>
        <div className="relative min-h-0 flex-1 overflow-hidden">
          <video ref={liveVideoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" style={{ transform: "scaleX(-1)" }} />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-[50%] border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" style={{ width: "72%", maxWidth: 340, aspectRatio: "3 / 4" }} />
          </div>
          {videoCountdown !== null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
              <span className="text-8xl font-black drop-shadow">{videoCountdown}</span>
              <span className="mt-2 text-sm font-medium">Recording starts…</span>
            </div>
          )}
          {videoRecording && (
            <>
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold backdrop-blur">
                <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
                REC {videoTimer}s / 15s
              </div>
              <div className="absolute inset-x-3 bottom-4 rounded-2xl border border-white/20 bg-black/70 px-4 py-3 text-center backdrop-blur">
                <p className="text-lg font-black leading-tight">{videoStep.en}</p>
                <p className="mt-0.5 text-sm text-white/75">{videoStep.ur}</p>
              </div>
            </>
          )}
        </div>
        <div className="shrink-0 space-y-3 bg-black px-4 pt-3" style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all" style={{ width: `${(videoTimer / 15) * 100}%` }} />
          </div>
          <Button variant="outline" className="w-full border-white/30 bg-transparent text-white hover:bg-white/10" onClick={cancelVideoRecording}>Cancel</Button>
        </div>
      </div>
    );
  }

  // ---- CAMERA VIEW ----
  if (activeCamera && !capturedImage) {
    const isSelfie = activeCamera === "selfie";
    const isFront = activeCamera === "front";
    const isBack = activeCamera === "back";
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
          <h2 className="text-center font-display text-xl font-black">
            {isFront ? "Scan ID Front" : isBack ? "Scan ID Back" : "Take Selfie"}
          </h2>
          <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-3 text-sm text-blue-100">
            {isFront ? "📇 Place your ID flat inside the frame, in good light, then tap Capture." :
             isBack ? "📇 Place your ID back inside the frame, then tap Capture." :
             "📸 Remove glasses, cap, hat, mask. Keep your full face inside the oval."}
          </div>
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/20">
            <video ref={videoRef} autoPlay playsInline muted className="block w-full" onLoadedMetadata={(e) => setCameraRes({ w: e.currentTarget.videoWidth, h: e.currentTarget.videoHeight })} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2">
              {!isSelfie ? (
                <div ref={frameRef} className="relative w-[96%] max-w-none" style={{ aspectRatio: "1.586 / 1" }}>
                  <div className="absolute inset-0 rounded-xl border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                  <div className="absolute -top-1 -left-1 h-6 w-6 rounded-tl-md border-l-4 border-t-4 border-teal-400" />
                  <div className="absolute -top-1 -right-1 h-6 w-6 rounded-tr-md border-r-4 border-t-4 border-teal-400" />
                  <div className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-md border-b-4 border-l-4 border-teal-400" />
                  <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-md border-b-4 border-r-4 border-teal-400" />
                </div>
              ) : (
                <div ref={frameRef} className="relative w-[85%] max-w-sm" style={{ aspectRatio: "3 / 4" }}>
                  <div className="absolute inset-0 rounded-[50%] border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                </div>
              )}
            </div>
          </div>
          {cameraRes && (Math.max(cameraRes.w, cameraRes.h) < 1280 ? (
            <div className="rounded-lg border border-amber-300 bg-amber-950/30 p-2 text-center text-xs text-amber-200">⚠️ Low quality camera ({cameraRes.w}×{cameraRes.h}). Move to better light or open in Chrome/Safari.</div>
          ) : (<p className="text-center text-[11px] text-white/50">Camera: {cameraRes.w}×{cameraRes.h}</p>))}
          <div role="status" aria-live="polite" className={`rounded-xl border p-3 text-center text-sm ${!focusing ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-amber-400/40 bg-amber-500/10 text-amber-200"}`}>
            {focusHint || "Hold steady while the camera checks focus."}
          </div>
          {focusFallbackAvailable && focusing && !isSelfie && (
            <div className="space-y-2 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-center">
              <p className="text-xs text-amber-200">Some cameras cannot autofocus on close-up cards. You may continue, but review the captured image carefully.</p>
              <Button type="button" variant="outline" className="w-full border-amber-400/50 bg-transparent text-amber-200 hover:bg-amber-500/20" onClick={() => { focusBypassRef.current = true; setFocusBypass(true); setFocusing(false); setFocusHint("Focus could not be confirmed. Capture only if the card text looks readable."); }}>My camera can't focus — try anyway</Button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 border-white/30 bg-transparent text-white hover:bg-white/10" onClick={() => { captureRunRef.current++; setCapturing(false); stream?.getTracks().forEach(t => t.stop()); setActiveCamera(null); setOcrError(null); }}>Cancel</Button>
            {torchSupported && activeCamera !== "selfie" && (
              <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" onClick={toggleTorch}>{torchOn ? "🔦 ON" : "🔦 Light"}</Button>
            )}
            <Button className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-500 font-bold text-white" onClick={captureImage} disabled={capturing || (focusing && !focusBypass)}>
              <Camera className="mr-2 h-4 w-4" />
              {capturing ? "Hold still..." : focusing ? "Checking..." : focusBypass ? "Capture anyway" : "Capture"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---- CAPTURED IMAGE PREVIEW ----
  if (capturedImage && capturedKind) {
    const isFront = capturedKind === "front";
    const isBlurry = capturedKind !== "selfie" && capturedBlur !== null && capturedBlur > BLUR_MAX;
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
          <h2 className="text-center font-display text-xl font-black text-slate-900">
            {isFront ? "ID Front — Preview" : capturedKind === "back" ? "ID Back — Preview" : "Selfie — Preview"}
          </h2>
          {isFront && (
            <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-4 text-sm text-teal-800">
              {ocrDetectedNumber ? "✅ ID number read from your photo. Check every digit below, correct anything wrong, then confirm." : "✅ Photo captured. Reading the ID number automatically..."}
            </div>
          )}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <img src={capturedImage} alt="Captured" className="block w-full" />
          </div>
          {isBlurry && !ocrError && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-700">
              {isFront ? "ℹ️ Slightly soft. Press Verify — if the ID number can be read, it will be accepted." : "ℹ️ Slightly soft. Confirm if the card text is readable."}
            </div>
          )}
          {isFront && ocrProcessing && (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 py-3 text-sm font-semibold text-teal-700">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-teal-600" />
              {ocrStatus || "Reading the number from the photo..."}
            </div>
          )}
          {isFront && ocrDetectedNumber && !ocrProcessing && (
            <div className="space-y-3 rounded-2xl border border-teal-300 bg-teal-50 p-4">
              <p className="text-sm font-bold text-teal-900">Is this the correct ID number?</p>
              <p className="text-xs text-teal-800">We read <strong>{ocrDetectedNumber}</strong>. Correct any digit before confirming.</p>
              <Input type="text" inputMode="numeric" autoComplete="off" maxLength={13} placeholder="13 ID digits" value={manualCnicNumber} onChange={(e) => setManualCnicNumber(e.target.value.replace(/\D/g, "").slice(0, 13))} className="h-12 rounded-xl border-teal-300 bg-white text-center font-mono text-lg font-bold" />
              <p className="text-center text-xs font-semibold text-teal-800">Formatted: <strong>{formatCnicNumber(manualCnicNumber) || "enter all 13 digits"}</strong></p>
            </div>
          )}
          {ocrError && <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-center text-sm text-amber-700">⚠️ {ocrError}</div>}
          {isFront && manualEntryAllowed && (
            <div className="space-y-3 rounded-2xl border border-teal-300 bg-teal-50 p-4">
              <p className="text-sm text-slate-700">If the front is clear, enter the number as printed. The photo will still be reviewed.</p>
              <Input type="text" inputMode="numeric" autoComplete="off" maxLength={13} placeholder="13-digit ID number" value={manualCnicNumber} onChange={(e) => setManualCnicNumber(e.target.value.replace(/\D/g, "").slice(0, 13))} className="h-12 rounded-xl border-teal-300 bg-white text-center font-mono text-lg" />
              <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={continueWithManualCnic}>Use Number & Continue</Button>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={cancelCaptured} disabled={ocrProcessing}>
              <X className="mr-2 h-4 w-4" /> Retake
            </Button>
            <Button className="flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 font-bold" onClick={() => { if (isFront && ocrDetectedNumber) continueWithManualCnic(); else void verifyCapturedImage(); }} disabled={ocrProcessing || Boolean(isFront && ocrDetectedNumber && !formatCnicNumber(manualCnicNumber))}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              {ocrProcessing ? "Processing..." : isFront ? (ocrDetectedNumber ? "Confirm number" : ocrFailed ? "Try Reading Again" : "Verify & Confirm") : "Confirm"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const inAppBrowser = typeof navigator !== "undefined" && /FBAN|FBAV|FB_IAB|Instagram|Snapchat|TikTok|MicroMessenger|Line\/|; wv\)/i.test(navigator.userAgent);
  const showStatusCard = submission && !reapplying;
  const isRejected = submission?.status === "rejected";

  // ============================================================
  // MAIN PREMIUM UI
  // ============================================================
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <input ref={photoInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; const kind = (e.target.dataset.kind || "front") as "front" | "back" | "selfie"; e.target.value = ""; if (f) handleNativePhoto(f, kind); }} />
      <input ref={videoInputRef} type="file" accept="video/*" capture="user" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) handleNativeVideo(f); }} />

      {cameraProblem && (
        <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-md space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><p className="text-sm font-medium text-slate-800">{cameraProblem.message}</p></div>
            <div className="grid gap-2">
              {cameraProblem.canRetry && <Button onClick={retryCamera} className="h-11 rounded-xl bg-teal-600 font-bold"><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button>}
              <Button variant="outline" onClick={openNativeCapture} className="h-11 rounded-xl"><Camera className="mr-2 h-4 w-4" /> Use Phone Camera</Button>
              <Button variant="ghost" onClick={() => setCameraProblem(null)} className="h-11 rounded-xl">Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="-ml-2 rounded-lg" onClick={() => { try { sessionStorage.removeItem("givethra_kyc_return_to"); } catch {} navigate({ to: returnTo as any }); }}>← Back</Button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">KYC Verification</h1>
            <p className="text-sm text-slate-500">Identity verification for global users</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" /></div>
        ) : !user ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">Please sign in first</div>
        ) : loadError && (!submission || reapplying) ? (
          <div className="rounded-3xl border border-amber-300 bg-amber-50 p-6 text-center">
            <p className="mb-4 text-sm text-amber-800">{loadError}</p>
            <Button onClick={() => { setIsLoading(true); void loadSubmission(); }} className="bg-amber-600"><RefreshCw className="mr-2 h-4 w-4" /> Retry</Button>
          </div>
        ) : showStatusCard ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${statusConfig[submission.status]?.color || "bg-slate-100 text-slate-700"}`}>
                {statusConfig[submission.status]?.icon}
                <span className="font-bold">{statusConfig[submission.status]?.label || submission.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</p><p className="font-semibold text-slate-900">{submission.full_name}</p></div>
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Document</p><p className="font-semibold uppercase text-slate-900">{submission.document_type}</p></div>
                {submission.cnic_number && <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ID Number</p><p className="font-semibold text-slate-900">{submission.cnic_number}</p></div>}
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submitted</p><p className="font-semibold text-slate-900">{submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : "—"}</p></div>
              </div>
              {isRejected && submission.rejection_reason && (
                <div className="mt-4 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">Rejection Reason</p>
                  <p className="text-sm font-medium text-red-900">{submission.rejection_reason}</p>
                </div>
              )}
              {isRejected && (
                <Button size="sm" className="mt-4 w-full rounded-xl bg-red-600 hover:bg-red-700" onClick={startReapply}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" /> Submit KYC Again <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              )}
              {submission.status === "approved" && (
                <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-medium text-teal-800">✓ Your identity is verified. You can now submit and unlock cases.</div>
              )}
              {submission.status === "pending" && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">⏳ Your KYC is under review. This usually takes 1-3 business days.</div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {reapplying && (
              <div className="flex items-center justify-between rounded-2xl border border-teal-200 bg-teal-50 p-3 text-sm font-semibold text-teal-800">
                <span>Re-submitting your KYC with new photos.</span>
                <button onClick={() => setReapplying(false)} className="text-xs underline">Cancel</button>
              </div>
            )}

            {inAppBrowser && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-medium text-amber-900">
                ⚠️ You're inside an app's browser (WhatsApp, Facebook). Please open <strong>givethra.org</strong> in Chrome or Safari for camera access.
              </div>
            )}

            {camPerm === "denied" && (
              <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 space-y-2 text-sm text-red-900">
                <p className="font-bold">Camera / microphone is blocked for this site</p>
                <p className="text-xs">The browser remembers a previous "Block". Only you can switch it on:</p>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li><strong>Android:</strong> Lock icon → Permissions → set Camera/Mic to <strong>Allow</strong>.</li>
                  <li><strong>iPhone:</strong> "aA" icon → Website Settings → Camera/Mic → <strong>Allow</strong>.</li>
                </ul>
                <div className="flex gap-2"><Button size="sm" variant="outline" className="flex-1" onClick={() => requestCameraAccess()}>Ask again</Button><Button size="sm" className="flex-1 bg-red-600" onClick={() => window.location.reload()}>I allowed — reload</Button></div>
              </div>
            )}

            {camPerm === "prompt" && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs font-semibold text-blue-900">
                <span>📷 Tap <strong>Allow</strong> when your browser asks for camera & microphone.</span>
                <Button size="sm" className="bg-blue-600" onClick={() => requestCameraAccess()}>Allow</Button>
              </div>
            )}

            {/* STEP INDICATOR */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              {["Identity", "Documents", "Face Video", "Submit"].map((label, i) => {
                const n = i + 1; const active = n === step; const done = n < step;
                return (
                  <div key={label} className="flex flex-1 flex-col items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all ${done ? "bg-teal-600 text-white shadow-md" : active ? "bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-md ring-2 ring-teal-200" : "bg-slate-100 text-slate-400"}`}>
                      {done ? <Check className="h-4 w-4" /> : n}
                    </div>
                    <span className={`mt-1 text-[9px] font-bold uppercase tracking-wider ${active ? "text-teal-700" : done ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
                  </div>
                );
              })}
            </div>

            {/* STEP 1: IDENTITY + COUNTRY (240+ COUNTRIES WITH SEARCH) */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-900"><Globe className="h-5 w-5 text-teal-600" /> Identity Information</h2>
                
                <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 p-3 text-xs text-teal-900">
                  <p className="font-bold">🌍 This platform supports users from all countries.</p>
                  <p className="mt-0.5">Please select your country and provide the ID type accepted there.</p>
                </div>

                {/* Country Selector with Search */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Country *</Label>
                  <button
                    type="button"
                    onClick={() => setCountryOpen(true)}
                    className="flex h-12 w-full items-center justify-between rounded-xl border-2 border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 transition hover:border-teal-300"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-teal-600" />
                      {countryName || "Select country"}
                    </span>
                    <ChevronRight className="h-4 w-4 rotate-90 text-slate-400" />
                  </button>
                </div>

                {/* Country picker modal */}
                <AnimatePresence>
                  {countryOpen && (
                    <>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setCountryOpen(false); setCountrySearch(""); }} className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" />
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-x-4 top-1/2 z-[110] mx-auto max-h-[85vh] max-w-lg -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="border-b border-slate-100 p-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-black text-slate-900">Select your country</h3>
                            <button onClick={() => { setCountryOpen(false); setCountrySearch(""); }} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
                          </div>
                          <div className="relative mt-3">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              autoFocus
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search your country..."
                              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium outline-none focus:border-teal-500 focus:bg-white"
                            />
                          </div>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                          {filteredCountries.length === 0 ? (
                            <p className="py-8 text-center text-sm font-medium text-slate-400">No country matches "{countrySearch}"</p>
                          ) : filteredCountries.map((c) => (
                            <button
                              key={c.code}
                              onClick={() => {
                                setCountryName(c.name);
                                setDocType(c.name.toLowerCase() === "pakistan" ? "cnic" : "passport");
                                setCountryOpen(false);
                                setCountrySearch("");
                              }}
                              className={`flex w-full items-center justify-between border-b border-slate-50 px-4 py-3 text-left text-sm font-semibold transition hover:bg-slate-50 ${countryName === c.name ? "bg-teal-50 text-teal-700" : "text-slate-700"}`}
                            >
                              <span>{c.name}</span>
                              {countryName === c.name && <Check className="h-4 w-4 text-teal-600" />}
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-center text-[11px] font-medium text-slate-500">
                          {COUNTRIES.length} countries supported
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>

                {/* Document Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Document Type *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setDocType("cnic")} className={`rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${docType === "cnic" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-700 hover:border-teal-300"}`}>
                      🆔 {isPakistan ? "CNIC" : "National ID"}
                    </button>
                    <button type="button" onClick={() => setDocType("passport")} className={`rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${docType === "passport" ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-700 hover:border-teal-300"}`}>
                      📘 Passport
                    </button>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">Selected: {countryProfile.idLabel}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</Label>
                  <Input value={form.full_name} onChange={e => setForm(p => ({...p, full_name: e.target.value}))} placeholder="As on your ID document" className="h-12 rounded-xl" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date of Birth</Label><Input type="date" value={form.date_of_birth} onChange={e => setForm(p => ({...p, date_of_birth: e.target.value}))} className="h-12 rounded-xl" /></div>
                  <div className="space-y-2"><Label className="text-xs font-bold uppercase tracking-wider text-slate-500">City / Address</Label><Input value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} placeholder="Full address" className="h-12 rounded-xl" /></div>
                </div>

                <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 font-bold shadow-lg" onClick={() => { if (!form.full_name.trim()) { toast.error("Full name is required"); return; } setStep(2); }}>
                  Continue to Documents <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* STEP 2: DOCUMENTS */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-900"><FileText className="h-5 w-5 text-teal-600" /> Upload Your Documents</h2>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <p className="font-bold">💡 Before you begin:</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    <li>Remove glasses, cap, hat, mask or face cover.</li>
                    <li>Good light, clear focus — your face must match the ID.</li>
                    <li>Your documents are <strong>private</strong> — only the verification team sees them.</li>
                  </ul>
                </div>

                {docType === "cnic" ? (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isPakistan ? "CNIC" : "ID"} Number *</Label>
                      <Input value={form.cnic_number} onChange={e => setForm(p => ({...p, cnic_number: e.target.value}))} placeholder="Enter 13-digit number" className="h-12 rounded-xl font-mono text-center text-base" />
                      {form.cnic_number && cnicFrontPreview && <p className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Auto-filled from scan — correct if needed</p>}
                      {form.cnic_number && !/^\d{5}-\d{7}-\d{1}$/.test(form.cnic_number) && <p className="text-xs font-bold text-red-500">⚠️ Format: 00000-0000000-0 (13 digits)</p>}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">ID Front *</Label>
                        {cnicFrontPreview ? (
                          <div className="space-y-2">
                            <img src={cnicFrontPreview} alt="Front" className="w-full rounded-xl border max-h-40 object-cover" />
                            <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => { setCnicFront(null); setCnicFrontPreview(null); setForm(p => ({...p, cnic_number: ""})); }}>Retake</Button>
                          </div>
                        ) : (
                          <Button variant="outline" className="h-32 w-full rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 text-teal-700 hover:bg-teal-50" onClick={() => startPhotoCamera("front")}>
                            <div className="flex flex-col items-center gap-1"><Camera className="h-6 w-6" /><span className="text-xs font-bold">Scan Front</span></div>
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">ID Back *</Label>
                        {cnicBackPreview ? (
                          <div className="space-y-2">
                            <img src={cnicBackPreview} alt="Back" className="w-full rounded-xl border max-h-40 object-cover" />
                            <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => { setCnicBack(null); setCnicBackPreview(null); }}>Retake</Button>
                          </div>
                        ) : (
                          <Button variant="outline" className="h-32 w-full rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 text-teal-700 hover:bg-teal-50" onClick={() => startPhotoCamera("back")}>
                            <div className="flex flex-col items-center gap-1"><Camera className="h-6 w-6" /><span className="text-xs font-bold">Scan Back</span></div>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Selfie *</Label>
                      <p className="text-xs text-slate-500">Full face, no glasses/cap/mask.</p>
                      {selfiePreview ? (
                        <div className="space-y-2">
                          <img src={selfiePreview} alt="Selfie" className="w-full rounded-xl border max-h-40 object-cover" />
                          <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => { setSelfie(null); setSelfiePreview(null); }}>Retake</Button>
                        </div>
                      ) : (
                        <Button variant="outline" className="h-24 w-full rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 text-teal-700 hover:bg-teal-50" onClick={() => startPhotoCamera("selfie")}>
                          <div className="flex flex-col items-center gap-1"><User className="h-6 w-6" /><span className="text-xs font-bold">Take Selfie</span></div>
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Passport (PDF or Image) *</Label>
                    <input type="file" accept=".pdf,image/*" onChange={e => setPassportFile(e.target.files?.[0] ?? null)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm" />
                    {passportFile && <p className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> {passportFile.name}</p>}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => setStep(1)}>Back</Button>
                  <Button className="h-12 flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 font-bold shadow-lg" onClick={() => {
                    if (docType === "cnic" && (!form.cnic_number || !cnicFront || !cnicBack || !selfie)) { toast.error("All ID documents and selfie are required"); return; }
                    if (docType === "passport" && !passportFile) { toast.error("Passport is required"); return; }
                    setStep(3);
                  }}>Continue <ChevronRight className="ml-1 h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: FACE VIDEO */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-900"><Video className="h-5 w-5 text-teal-600" /> Face Video (Liveness)</h2>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900">
                  <p className="font-bold">🎥 You'll record a 15-second video:</p>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    <li>Look straight, then turn right, then left, then up.</li>
                    <li>Remove glasses, cap, hat, mask.</li>
                    <li>Recording starts after 3-2-1 countdown and stops automatically.</li>
                  </ul>
                </div>

                {videoBlob ? (
                  <div className="space-y-2">
                    <video src={videoBlob} controls className="w-full rounded-xl border max-h-52" />
                    <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={() => { setVideoBlob(null); setVideoFile(null); if (docType === "passport") { setSelfie(null); setSelfiePreview(null); } }}>Re-record</Button>
                  </div>
                ) : (
                  <Button variant="outline" className="h-32 w-full rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 text-teal-700 hover:bg-teal-50" onClick={startVideoRecording}>
                    <div className="flex flex-col items-center gap-1"><Video className="h-8 w-8" /><span className="text-sm font-bold">Start Recording</span><span className="text-xs">15 second liveness check</span></div>
                  </Button>
                )}

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => setStep(2)}>Back</Button>
                  <Button className="h-12 flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 font-bold shadow-lg" onClick={() => { if (!videoFile) { toast.error("Please record the face video"); return; } setStep(4); }}>Continue <ChevronRight className="ml-1 h-4 w-4" /></Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-900"><CheckCircle2 className="h-5 w-5 text-teal-600" /> Review & Submit</h2>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-[10px] font-bold uppercase text-slate-400">Country</p><p className="font-bold text-slate-900">{countryName}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-400">Document</p><p className="font-bold uppercase text-slate-900">{docType}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-400">Name</p><p className="font-bold text-slate-900">{form.full_name}</p></div>
                    {docType === "cnic" && <div><p className="text-[10px] font-bold uppercase text-slate-400">ID Number</p><p className="font-mono font-bold text-slate-900">{form.cnic_number}</p></div>}
                    <div><p className="text-[10px] font-bold uppercase text-slate-400">Documents</p><p className="font-bold text-emerald-600">{docType === "cnic" ? "✓ ID Front + Back + Selfie" : "✓ Passport"}</p></div>
                    <div><p className="text-[10px] font-bold uppercase text-slate-400">Face Video</p><p className="font-bold text-emerald-600">✓ Recorded</p></div>
                  </div>
                </div>

                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-900">
                  <p className="font-bold">🔒 Your privacy is protected.</p>
                  <p className="mt-0.5">Documents and video are only seen by the verification team. No user or Hero can access them.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => setStep(3)}>Back</Button>
                  <Button disabled={isSubmitting} onClick={handleSubmit} className="h-12 flex-1 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 font-bold shadow-lg">
                    {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit KYC"}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
