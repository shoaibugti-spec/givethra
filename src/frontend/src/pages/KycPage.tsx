// src/frontend/src/pages/KycPage.tsx
// Givethra - Complete KYC Page with Camera, OCR, Selfie, and Video Recording
// Fully functional with Cloudflare Worker APIs

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendNotification } from "@/lib/notify";
import { Shield, CheckCircle2, Clock, AlertTriangle, Camera, Eye, RefreshCw, ArrowRight, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import Tesseract from "tesseract.js";
import { formatCnicNumber, getKycOcrAssetPaths } from "@/lib/kycOcr";
import {
  getKycSubmission,
  insertKycSubmission,
  updateKycSubmission,
  uploadFileToStorage,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// OCR helpers
// Phone-camera frames are small and uneven. Before OCR we upscale the image,
// convert to grayscale and stretch the contrast, then try the whole card and
// then two crops around where the CNIC number is printed. Tesseract confuses
// digits with look-alike letters (O/0, I/1, S/5, B/8), so those are mapped back.
// ---------------------------------------------------------------------------
function toOcrCanvas(
  src: HTMLCanvasElement,
  fx = 0, fy = 0, fw = 1, fh = 1,
  targetWidth = 1800,
  binarize = false,
): HTMLCanvasElement {
  const sx = Math.round(src.width * fx);
  const sy = Math.round(src.height * fy);
  const sw = Math.max(1, Math.round(src.width * fw));
  const sh = Math.max(1, Math.round(src.height * fh));
  const scale = Math.min(targetWidth / sw, 3);
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(sw * scale));
  out.height = Math.max(1, Math.round(sh * scale));
  const ctx = out.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null;
  if (!ctx) return out;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, out.width, out.height);
  try {
    const img = ctx.getImageData(0, 0, out.width, out.height);
    const d = img.data;
    const hist = new Uint32Array(256);
    for (let i = 0; i < d.length; i += 4) {
      const g = Math.round((d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000);
      d[i] = d[i + 1] = d[i + 2] = g;
      hist[g]++;
    }
    const total = out.width * out.height;
    let acc = 0, lo = 0, hi = 255;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.02) { lo = v; break; } }
    acc = 0;
    for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= total * 0.98) { hi = v; break; } }
    const range = Math.max(hi - lo, 1);
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.max(0, Math.min(255, Math.round(((d[i] - lo) * 255) / range)));
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    if (binarize) {
      // Otsu threshold: pure black text on white, helps on dim or low-contrast cards.
      const h = new Uint32Array(256);
      for (let i = 0; i < d.length; i += 4) h[d[i]]++;
      let sum = 0;
      for (let t = 0; t < 256; t++) sum += t * h[t];
      let sumB = 0, wB = 0, best = 0, thr = 128;
      for (let t = 0; t < 256; t++) {
        wB += h[t];
        if (!wB) continue;
        const wF = total - wB;
        if (!wF) break;
        sumB += t * h[t];
        const mB = sumB / wB, mF = (sum - sumB) / wF;
        const between = wB * wF * (mB - mF) * (mB - mF);
        if (between > best) { best = between; thr = t; }
      }
      for (let i = 0; i < d.length; i += 4) {
        const v = d[i] > thr ? 255 : 0;
        d[i] = d[i + 1] = d[i + 2] = v;
      }
    }
    ctx.putImageData(img, 0, 0);
  } catch {
    // If pixel access fails, the plain resized image is still used.
  }
  return out;
}

const DIGITISH = "[0-9OoQDIil|SsBZzG]";
const CNIC_RE = new RegExp(`(${DIGITISH}{5})[\\s\\-._]{0,2}(${DIGITISH}{7})[\\s\\-._]{0,2}(${DIGITISH})(?![0-9])`, "g");
const DIGIT_FIX: Record<string, string> = {
  O: "0", o: "0", Q: "0", D: "0",
  I: "1", i: "1", l: "1", "|": "1",
  S: "5", s: "5", B: "8", Z: "2", z: "2", G: "6",
};

function findCnicAll(text: string): Array<{ number: string; real: number }> {
  const found: Array<{ number: string; real: number }> = [];
  CNIC_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CNIC_RE.exec(text)) !== null) {
    const raw = m[1] + m[2] + m[3];
    const real = (raw.match(/[0-9]/g) || []).length;
    if (real < 9) continue; // too many guessed characters: probably not a number
    const digits = raw.split("").map((c) => DIGIT_FIX[c] ?? c).join("");
    if (!/^\d{13}$/.test(digits)) continue;
    found.push({ number: `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`, real });
  }
  return found;
}

// Words printed on a CNIC. A number is only trusted when the photo also shows
// CNIC text, so a random object or a dark/blank photo is never accepted.
const CNIC_STRONG = ["PAKISTAN", "IDENTITY", "ISLAMIC", "REPUBLIC", "FATHER", "HUSBAND", "GENDER", "COUNTRY", "SIGNATURE", "NATIONAL"];
const CNIC_WEAK = ["NUMBER", "BIRTH", "EXPIRY", "ISSUE", "CARD"];

function within1(a: string, b: string): boolean {
  if (a === b) return true;
  if (b.length < 6) return false; // short words must match exactly
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

// Average brightness 0-255 of a small copy of the image.
function meanBrightness(src: HTMLCanvasElement): number {
  try {
    const w = 160;
    const h = Math.max(1, Math.round((src.height / src.width) * w));
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null;
    if (!ctx) return 255;
    ctx.drawImage(src, 0, 0, w, h);
    const d = ctx.getImageData(0, 0, w, h).data;
    let sum = 0;
    for (let i = 0; i < d.length; i += 4) sum += (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
    return sum / (w * h);
  } catch {
    return 255;
  }
}

// Reads the CNIC number with several differently prepared copies of the photo
// and lets them vote, so one wrong digit in one pass is outvoted by the others.
// All runtime assets are served from this site; no document image or OCR model
// is fetched from a third-party CDN while verification runs.
async function readCnicNumber(
  card: HTMLCanvasElement,
  onStep?: (step: number, total: number) => void,
  onStatus?: (status: string) => void,
): Promise<{ number: string | null; isCnic: boolean }> {
  // [x, y, w, h, targetWidth, binarize]  (x/y/w/h as fractions of the card)
  const passes: Array<[number, number, number, number, number, boolean]> = [
    [0, 0, 1, 1, 1800, false],       // whole card
    [0, 0.3, 0.8, 0.65, 1600, false], // lower-left, where the number is
    [0, 0.45, 0.7, 0.4, 1600, false], // tight band around the number
    [0, 0.45, 0.7, 0.4, 1600, true],  // same band, black-and-white
  ];
  const assetPaths = getKycOcrAssetPaths(import.meta.env.BASE_URL || "/");
  onStatus?.("Preparing the local CNIC reader...");
  const worker = await Tesseract.createWorker("eng", 1, {
    ...assetPaths,
    workerBlobURL: false,
    gzip: true,
    logger: (message) => {
      if (message.status === "loading tesseract core") onStatus?.("Loading the CNIC reader...");
      else if (message.status === "loading language traineddata") onStatus?.("Loading local OCR data...");
    },
  });
  try {
    const votes = new Map<string, { n: number; real: number }>();
    let allText = "";
    const pick = () => {
      let best: { number: string; n: number; real: number } | null = null;
      votes.forEach((v, number) => {
        if (!best || v.n > best.n || (v.n === best.n && v.real > best.real)) best = { number, ...v };
      });
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
      // Stop early: two passes agree, or all 13 characters were genuine digits.
      if (best && looksLikeCnic(allText) && (best.n >= 2 || best.real === 13)) {
        return { number: best.number, isCnic: true };
      }
    }
    const best = pick();
    return { number: best ? best.number : null, isCnic: looksLikeCnic(allText) };
  } finally {
    await worker.terminate();
  }
}

// ---------------------------------------------------------------------------
// Sharpness + review-copy helpers
// ---------------------------------------------------------------------------
function boxBlurH(src: Float32Array, W: number, H: number, r: number): Float32Array {
  const out = new Float32Array(W * H);
  const n = 2 * r + 1;
  for (let y = 0; y < H; y++) {
    const row = y * W;
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += src[row + Math.min(W - 1, Math.max(0, k))];
    for (let x = 0; x < W; x++) {
      out[row + x] = sum / n;
      const add = Math.min(W - 1, x + r + 1);
      const rem = Math.max(0, x - r);
      sum += src[row + add] - src[row + rem];
    }
  }
  return out;
}

function boxBlurV(src: Float32Array, W: number, H: number, r: number): Float32Array {
  const out = new Float32Array(W * H);
  const n = 2 * r + 1;
  for (let x = 0; x < W; x++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += src[Math.min(H - 1, Math.max(0, k)) * W + x];
    for (let y = 0; y < H; y++) {
      out[y * W + x] = sum / n;
      const add = Math.min(H - 1, y + r + 1);
      const rem = Math.max(0, y - r);
      sum += src[add * W + x] - src[rem * W + x];
    }
  }
  return out;
}

// Blur measure after Crete et al.: 0 = very sharp, 1 = very blurry. It compares
// how much the image's edges weaken when it is blurred once more, so it does not
// depend on what is printed on the card.
function creteBlur(g: Float32Array, W: number, H: number): number {
  const bv = boxBlurV(g, W, H, 4); // vertical blur
  const bh = boxBlurH(g, W, H, 4); // horizontal blur
  let sF = 0, sV = 0;
  for (let y = 0; y < H - 1; y++) {
    for (let x = 0; x < W - 1; x++) {
      const i = y * W + x;
      const dxF = Math.abs(g[i + 1] - g[i]);
      const dyF = Math.abs(g[i + W] - g[i]);
      const dxB = Math.abs(bh[i + 1] - bh[i]);
      const dyB = Math.abs(bv[i + W] - bv[i]);
      sF += dxF + dyF;
      sV += Math.max(0, dxF - dxB) + Math.max(0, dyF - dyB);
    }
  }
  return sF > 0 ? (sF - sV) / sF : 1;
}

// Photos blurrier than this cannot be read by the review team and are retaken.
// 0 = razor sharp, 1 = very blurry; measured on an 800 px wide copy of the card.
// (Calibrated on real samples: sharp CNIC back 0.24, soft CNIC front 0.37.)
const BLUR_MAX = 0.33;

function blurOfCanvas(src: HTMLCanvasElement): number {
  const ctx = src.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null;
  const d = ctx ? ctx.getImageData(0, 0, src.width, src.height) : null;
  if (!d) return 0;
  const g = new Float32Array(src.width * src.height);
  for (let i = 0, o = 0; i < g.length; i++, o += 4) {
    g[i] = (d.data[o] * 299 + d.data[o + 1] * 587 + d.data[o + 2] * 114) / 1000;
  }
  return creteBlur(g, src.width, src.height);
}

function scaleCanvas(src: HTMLCanvasElement, maxWidth: number): HTMLCanvasElement {
  if (src.width <= maxWidth) return src;
  const out = document.createElement("canvas");
  out.width = maxWidth;
  out.height = Math.round((src.height * maxWidth) / src.width);
  const ctx = out.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(src, 0, 0, out.width, out.height);
    return out;
  }
  return src;
}

function enhanceRGBA(d: Uint8ClampedArray, W: number, H: number): void {
  const n = W * H;
  // 1) contrast stretch on luminance percentiles (same gain on all channels keeps colours)
  const hist = new Uint32Array(256);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    hist[Math.round((d[o] * 299 + d[o + 1] * 587 + d[o + 2] * 114) / 1000)]++;
  }
  let acc = 0, lo = 0, hi = 255;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= n * 0.01) { lo = v; break; } }
  acc = 0;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= n * 0.99) { hi = v; break; } }
  const gain = Math.min(1.6, 239 / Math.max(hi - lo, 1));
  if (gain > 1.05) {
    for (let i = 0; i < n; i++) {
      const o = i * 4;
      d[o] = (d[o] - lo) * gain + 8;
      d[o + 1] = (d[o + 1] - lo) * gain + 8;
      d[o + 2] = (d[o + 2] - lo) * gain + 8;
    }
  }
  // 2) unsharp mask: original + amount * (original - blurred)
  const amount = 0.9;
  for (let c = 0; c < 3; c++) {
    const ch = new Float32Array(n);
    for (let i = 0; i < n; i++) ch[i] = d[i * 4 + c];
    let b = boxBlurH(ch, W, H, 2);
    b = boxBlurV(b, W, H, 2);
    b = boxBlurH(b, W, H, 2);
    b = boxBlurV(b, W, H, 2);
    for (let i = 0; i < n; i++) {
      const diff = ch[i] - b[i];
      if (Math.abs(diff) > 2) d[i * 4 + c] = ch[i] + amount * diff;
      else d[i * 4 + c] = ch[i];
    }
  }
}

const BLUR_MESSAGE =
  "This photo is blurry, so the text cannot be read clearly. Hold the phone steady, wait a second for the camera to focus, keep the card flat in good light, and retake it.";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function isPermissionError(err: any): boolean {
  const n = err?.name;
  return n === "NotAllowedError" || n === "PermissionDeniedError" || n === "SecurityError";
}

// Safari/iPhone cannot record WebM, so the format is picked from what the
// browser supports (WebM first, then MP4).
function pickRecorderMime(): string {
  const MR: any = (window as any).MediaRecorder;
  if (!MR || typeof MR.isTypeSupported !== "function") return "";
  const candidates = [
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4;codecs=avc1,mp4a.40.2",
    "video/mp4",
  ];
  return candidates.find((t) => MR.isTypeSupported(t)) || "";
}

const VIDEO_STEPS: Array<{ until: number; en: string; ur: string }> = [
  { until: 3, en: "Look straight at the camera", ur: "Seedha camera ki taraf dekhein" },
  { until: 6, en: "Slowly turn your face to the RIGHT", ur: "Chehra aahista se DAYEIN taraf ghumayein" },
  { until: 9, en: "Slowly turn your face to the LEFT", ur: "Chehra aahista se BAYEIN taraf ghumayein" },
  { until: 12, en: "Look slightly UP", ur: "Thoda UPAR dekhein" },
  { until: 99, en: "Look straight again — almost done", ur: "Dobara seedha dekhein — bas khatam" },
];

export default function KycPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const returnTo = (() => {
    try { return sessionStorage.getItem("givethra_kyc_return_to") || "/home"; } catch { return "/home"; }
  })();
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [docType, setDocType] = useState<"cnic" | "passport">("cnic");
  const [reapplying, setReapplying] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    address: "",
    cnic_number: "",
  });

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
  const [manualEntryAllowed, setManualEntryAllowed] = useState(false);
  const [manualCnicNumber, setManualCnicNumber] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [focusing, setFocusing] = useState(false);
  const [focusHint, setFocusHint] = useState("");
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

  useEffect(() => {
    if (user) {
      loadSubmission();
      const interval = setInterval(loadSubmission, 30000);
      const onFocus = () => loadSubmission();
      window.addEventListener("focus", onFocus);
      document.addEventListener("visibilitychange", onFocus);
      return () => {
        clearInterval(interval);
        window.removeEventListener("focus", onFocus);
        document.removeEventListener("visibilitychange", onFocus);
      };
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()); };
  }, [stream]);

  // Ask for camera + microphone once, as soon as the KYC form is shown, so the
  // browser prompt appears right away (one combined prompt) instead of failing
  // later when the user taps a camera button. A website cannot force-allow it:
  // the user must tap "Allow", and a previously blocked site can only be
  // unblocked in the browser settings (the page shows how).
  const showForm = !!user && !isLoading && !loadError && (!submission || reapplying);
  useEffect(() => {
    if (!showForm) return;
    let cancelled = false;
    let status: any = null;
    (async () => {
      try {
        status = await (navigator as any).permissions?.query?.({ name: "camera" });
        if (status) {
          status.onchange = () => {
            if (cancelled) return;
            setCamPerm(status.state === "granted" ? "granted" : status.state === "denied" ? "denied" : "prompt");
          };
          if (status.state === "granted") { setCamPerm("granted"); return; }
          if (status.state === "denied") { setCamPerm("denied"); return; }
          setCamPerm("prompt");
        }
      } catch { /* Permissions API not available (older Safari) */ }
      if (!cancelled) await requestCameraAccess();
    })();
    return () => { cancelled = true; if (status) status.onchange = null; };
  }, [showForm]);

  // Attach the live video preview once its <video> exists.
  useEffect(() => {
    const v = liveVideoRef.current;
    if (videoOpen && liveStream && v) {
      v.srcObject = liveStream;
      const p = v.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, [videoOpen, liveStream]);

  // Never leave a recorder or camera running when the page is left.
  useEffect(() => {
    return () => {
      runIdRef.current++;
      videoCancelledRef.current = true;
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      try {
        const r = mediaRecorderRef.current;
        if (r && r.state !== "inactive") r.stop();
      } catch { /* ignore */ }
      videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // After a refusal: was the site really blocked, or was the popup only dismissed?
  async function markDeniedIfBlocked(): Promise<boolean> {
    try {
      const st = await (navigator as any).permissions?.query?.({ name: "camera" });
      if (st && st.state !== "denied") { setCamPerm("prompt"); return false; }
    } catch { /* Permissions API not available (older Safari) */ }
    setCamPerm("denied");
    return true;
  }

  // One place that turns every camera failure into a clear message and a way forward.
  async function cameraFail(err: any, kind: "photo" | "video", target?: string) {
    console.error("KYC camera problem", err);
    let message = "The camera could not be started. Close other apps that use the camera and try again.";
    let canRetry = true;
    if (typeof window !== "undefined" && (!window.isSecureContext || !navigator.mediaDevices)) {
      message = "Camera only works on a secure (https://) link. Please open the official Givethra link in Chrome or Safari.";
      canRetry = false;
    } else if (err?.name === "NotSupportedError" || err?.name === "TypeError") {
      message = "This browser cannot open the camera inside the page. Use your phone's camera instead, or open Givethra in Chrome (Android) / Safari (iPhone).";
      canRetry = false;
    } else if (isPermissionError(err)) {
      const blocked = await markDeniedIfBlocked();
      message = blocked
        ? "Camera / microphone is blocked for this site. Follow the steps shown on the page, or use your phone's camera instead."
        : "Permission was not given. Tap Try Again and press Allow when the browser asks. If no popup appears, open phone Settings → Apps → Chrome → Permissions and allow Camera and Microphone.";
    } else if (err?.name === "NotFoundError" || err?.name === "DevicesNotFoundError") {
      message = "No camera was found on this device. You can use your phone's camera instead.";
      canRetry = false;
    }
    setCameraProblem({ kind, target, message, canRetry });
  }

  // Safety net that always works: the phone's own camera app.
  function openNativeCapture() {
    const prob = cameraProblem;
    setCameraProblem(null);
    if (!prob) return;
    if (prob.kind === "video") {
      videoInputRef.current?.click();
    } else if (photoInputRef.current) {
      photoInputRef.current.setAttribute("capture", prob.target === "selfie" ? "user" : "environment");
      photoInputRef.current.dataset.kind = prob.target || "front";
      photoInputRef.current.click();
    }
  }

  function retryCamera() {
    const prob = cameraProblem;
    setCameraProblem(null);
    if (!prob) return;
    if (prob.kind === "video") void startVideoRecording();
    else void startPhotoCamera(prob.target || "front");
  }

  function handleNativePhoto(file: File, kind: "front" | "back" | "selfie") {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 3000 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")?.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      setOcrError(null);
      setOcrFailed(false);
      setManualEntryAllowed(false);
      setManualCnicNumber("");
      setCapturedBlur(kind === "selfie" ? null : blurOfCanvas(scaleCanvas(c, 800)));
      setCapturedImage(scaleCanvas(c, 1200).toDataURL("image/jpeg", 0.88));
      setCapturedCanvas(c);
      setCapturedKind(kind);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      toast.error("The photo could not be opened. Please try again.");
    };
    img.src = url;
  }

  function handleNativeVideo(file: File) {
    if (file.size > 150 * 1024 * 1024) {
      toast.error("The video is too large. Please record a short (about 15 second) video.");
      return;
    }
    setVideoFile(file);
    setVideoBlob(URL.createObjectURL(file));
  }

  async function requestCameraAccess(): Promise<boolean> {
    if (!navigator.mediaDevices?.getUserMedia) return false;
    let s: MediaStream | null = null;
    let lastErr: any = null;
    for (const c of [{ video: true, audio: true }, { video: true }] as MediaStreamConstraints[]) {
      try { s = await navigator.mediaDevices.getUserMedia(c); break; } catch (err) {
        lastErr = err;
        // A refusal must not trigger a second popup.
        if (isPermissionError(err)) break;
      }
    }
    s?.getTracks().forEach((t) => t.stop());
    if (s) { setCamPerm("granted"); return true; }
    if (isPermissionError(lastErr)) await markDeniedIfBlocked();
    return false;
  }

  // Attach the stream once the <video> element exists. Document capture stays
  // disabled until several consecutive live frames inside the guide are sharp.
  useEffect(() => {
    const v = videoRef.current;
    if (activeCamera && stream && v) {
      v.srcObject = stream;
      const p = v.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
      setFocusing(true);
      setFocusHint(activeCamera === "selfie"
        ? "Camera is settling — hold still for a moment."
        : "Checking focus — hold the phone steady and keep the whole CNIC inside the frame.");

      let sharpFrames = 0;
      let cancelled = false;
      let selfieReadyTimer: ReturnType<typeof setTimeout> | undefined;
      const scanFocus = () => {
        if (cancelled || activeCamera === "selfie") return;
        let sample: HTMLCanvasElement | null = null;
        let score = 1;
        try {
          // Match the 800 px scale used to calibrate BLUR_MAX on captured cards.
          sample = grabFrame(800);
          if (sample) score = blurOfCanvas(sample);
        } catch {
          score = 1;
        } finally {
          if (sample) { sample.width = 0; sample.height = 0; }
        }

        if (score <= BLUR_MAX) {
          sharpFrames++;
          if (sharpFrames >= 3) {
            setFocusing(false);
            setFocusHint("Image is clear and in focus — you can capture now.");
          } else {
            setFocusHint("Image is getting clear — keep the phone steady.");
          }
        } else {
          sharpFrames = 0;
          setFocusing(true);
          setFocusHint("Still focusing — hold steady, flatten the CNIC, and improve the light if needed.");
        }
      };

      const scanTimer = activeCamera === "selfie" ? undefined : setInterval(scanFocus, 350);
      if (activeCamera === "selfie") {
        selfieReadyTimer = setTimeout(() => {
          if (cancelled) return;
          setFocusing(false);
          setFocusHint("Camera is ready — you can capture now.");
        }, 1200);
      }
      return () => {
        cancelled = true;
        if (scanTimer) clearInterval(scanTimer);
        if (selfieReadyTimer) clearTimeout(selfieReadyTimer);
      };
    }
  }, [activeCamera, stream]);

  async function loadSubmission() {
    if (!user) return;
    try {
      const data = await getKycSubmission(user.id);
      setSubmission(data ? { ...data, status: String(data.status || "none").trim().toLowerCase() } : null);
      setLoadError(null);
    } catch (err) {
      console.error("Failed to load KYC submission", err);
      setLoadError("We couldn't verify your current KYC status. Please retry; no new request has been started.");
    } finally {
      setIsLoading(false);
    }
  }

  async function startPhotoCamera(target: string) {
    setCameraProblem(null);
    setFocusing(true);
    setFocusHint("Starting camera and checking focus...");
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        throw new DOMException("Camera API unavailable", "NotSupportedError");
      }
      // Release any camera still held from before (e.g. after Retake).
      stream?.getTracks().forEach((t) => t.stop());
      setOcrError(null);
      setCapturedImage(null);
      setCapturedKind(null);
      setCapturedCanvas(null);
      
      setCameraRes(null);
      setOcrFailed(false);

      const facing = target === "selfie" ? "user" : "environment";
      let s: MediaStream;
      try {
        // Ask for a high resolution. Without this most phones give 640x480,
        // which is too blurry for the CNIC text to be read.
        s = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facing },
            // CNIC photos: ask for the best the phone offers (the browser picks
            // the closest supported size); selfie: 1080p is plenty.
            width: { ideal: target === "selfie" ? 1920 : 3840 },
            height: { ideal: target === "selfie" ? 1080 : 2160 },
            advanced: [{ focusMode: "continuous" } as any],
          },
        });
      } catch (err: any) {
        if (isPermissionError(err)) throw err;
        // Some devices reject the extra constraints: retry with the basics,
        // and finally with "any camera" (some phones reject facingMode).
        try {
          s = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: facing },
          });
        } catch (err2: any) {
          if (isPermissionError(err2)) throw err2;
          s = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        }
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
        setTorchSupported(!!caps?.torch);
        setTorchOn(false);
      } catch {
        // optional improvements only
      }

      setStream(s);
      setActiveCamera(target);
    } catch (err: any) {
      await cameraFail(err, "photo", target);
    }
  }

  async function toggleTorch() {
    const track = stream?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as any] });
      setTorchOn((v) => !v);
    } catch {
      toast.error("The flashlight is not available on this camera.");
    }
  }

  function getCropRect(): { x: number; y: number; w: number; h: number } | null {
    const video = videoRef.current;
    const frame = frameRef.current;
    if (!video || !frame || video.videoWidth === 0 || video.videoHeight === 0) return null;
    const videoRect = video.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    if (videoRect.width === 0 || videoRect.height === 0) return null;
    const scaleX = video.videoWidth / videoRect.width;
    const scaleY = video.videoHeight / videoRect.height;
    const x = (frameRect.left - videoRect.left) * scaleX;
    const y = (frameRect.top - videoRect.top) * scaleY;
    const w = frameRect.width * scaleX;
    const h = frameRect.height * scaleY;
    return { x, y, w, h };
  }

  function grabFrame(maxWidth?: number): HTMLCanvasElement | null {
    const video = videoRef.current;
    const rect = getCropRect();
    if (!video || !rect || rect.w <= 0 || rect.h <= 0) return null;
    // Keep the crop inside the real video frame and use whole pixels.
    const x = Math.max(0, Math.round(rect.x));
    const y = Math.max(0, Math.round(rect.y));
    const w = Math.min(video.videoWidth - x, Math.round(rect.w));
    const h = Math.min(video.videoHeight - y, Math.round(rect.h));
    if (w <= 0 || h <= 0) return null;
    // A fresh canvas per capture: the cropped pixels are kept at the camera's
    // full native resolution (no downscaling) for OCR and upload.
    const cw = maxWidth && w > maxWidth ? maxWidth : w;
    const ch = maxWidth && w > maxWidth ? Math.round((h * maxWidth) / w) : h;
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d", { willReadFrequently: !!maxWidth } as any) as CanvasRenderingContext2D | null;
    if (!ctx) return null;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(video, x, y, w, h, 0, 0, cw, ch);
    return canvas;
  }

  async function captureImage() {
    if (capturing || focusing) return;
    setOcrError(null);
    setOcrFailed(false);
    setManualEntryAllowed(false);
    setManualCnicNumber("");
    const kind = activeCamera as "front" | "back" | "selfie";
    const runId = ++captureRunRef.current;

    let best: HTMLCanvasElement | null = null;
    let bestBlur = 1;
    if (kind === "selfie") {
      best = grabFrame();
    } else {
      // A moving hand or a camera still refocusing blurs single frames. Take a
      // burst of frames over about one second and keep the sharpest one.
      setCapturing(true);
      const FRAMES = 8;
      for (let i = 0; i < FRAMES; i++) {
        const small = grabFrame(800);
        if (small) {
          const score = blurOfCanvas(small);
          if (!best || score < bestBlur) {
            const full = grabFrame();
            if (full) {
              if (best) { best.width = 0; best.height = 0; } // free the previous frame's memory
              best = full;
              bestBlur = score;
            }
          }
        }
        if (i < FRAMES - 1) await sleep(110);
        if (runId !== captureRunRef.current) { setCapturing(false); return; }
      }
      setCapturing(false);
    }
    if (runId !== captureRunRef.current) return;

    if (!best) {
      toast.error("The photo could not be captured. Please try again.");
      return;
    }

    setOcrFailed(false);
    setCapturedBlur(kind === "selfie" ? null : bestBlur);
    setCapturedImage(scaleCanvas(best, 1200).toDataURL("image/jpeg", 0.88));
    setCapturedCanvas(best);
    setCapturedKind(kind);

    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setActiveCamera(null);
  }

  async function verifyCapturedImage() {
    if (!capturedCanvas || !capturedKind) {
      toast.error("Pehle tasveer capture karein.");
      return;
    }

    if (capturedKind === "front") {
      setOcrProcessing(true);
      setOcrError(null);
      setOcrFailed(false);
      setManualEntryAllowed(false);
      setOcrStatus("Preparing the local CNIC reader...");
      try {
        // The photo is NOT rejected for being slightly blurry or dim: older phones
        // often take soft photos. If the number can be read, the photo is accepted.
        const { number, isCnic } = await readCnicNumber(
          capturedCanvas,
          (step, total) => setOcrStatus(`Reading the number from the photo... (${step}/${total})`),
          (status) => setOcrStatus(status),
        );
        setOcrProcessing(false);
        setOcrStatus("");

        if (number && isCnic) {
          setForm(p => ({ ...p, cnic_number: number }));
          finalizeCapture(capturedKind, capturedCanvas);
          toast.success(`CNIC number detected: ${number}. You can correct it manually if needed.`);
        } else {
          setOcrFailed(true);
          setManualEntryAllowed(isCnic && !number);
          setOcrError(
            number
              ? "This does not look like the front of a CNIC. Photograph the CNIC card itself, with the whole card inside the frame."
              : capturedBlur !== null && capturedBlur > BLUR_MAX
                ? BLUR_MESSAGE
                : meanBrightness(capturedCanvas) < 55
                  ? "The CNIC number could not be read because the photo is too dark. Move to a bright place (or use the flashlight button) and retake it."
                  : "The CNIC number could not be read. Place the CNIC flat inside the frame, in good light, hold the phone steady for a second, and retake.",
          );
        }
      } catch (error) {
        const details = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
        console.error("CNIC OCR engine failed", details);
        setOcrProcessing(false);
        setOcrStatus("");
        setOcrFailed(true);
        setManualEntryAllowed(true);
        setOcrError("Automatic reading is unavailable right now. Your photo is still saved here. Retry, or enter the 13-digit CNIC manually; our verification team will review the photo.");
      }
    } else {
      finalizeCapture(capturedKind, capturedCanvas);
    }
  }

  function continueWithManualCnic() {
    if (!capturedCanvas || capturedKind !== "front") return;
    const formatted = formatCnicNumber(manualCnicNumber);
    if (!formatted) {
      toast.error("Enter all 13 CNIC digits exactly as printed on the card.");
      return;
    }
    setForm((current) => ({ ...current, cnic_number: formatted }));
    finalizeCapture("front", capturedCanvas);
    toast.success("CNIC number saved. Our verification team will check it against your photo.");
  }

  function finalizeCapture(kind: "front" | "back" | "selfie", canvas: HTMLCanvasElement) {
    // OCR used the full-resolution frame; the stored copy is capped at 2000 px
    // wide (still sharp enough to read) to keep uploads small on mobile data.
    const out = scaleCanvas(canvas, 2000);
    if (kind !== "selfie") {
      // Review copy: gentle contrast and sharpening so the verification team
      // can read the small printed text (does not change what the card says).
      try {
        const octx = out.getContext("2d", { willReadFrequently: true } as any) as CanvasRenderingContext2D | null;
        if (octx) {
          const img = octx.getImageData(0, 0, out.width, out.height);
          enhanceRGBA(img.data, out.width, out.height);
          octx.putImageData(img, 0, 0);
        }
      } catch { /* keep the unenhanced image */ }
    }
    out.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${kind}.jpg`, { type: "image/jpeg" });
      const preview = out.toDataURL("image/jpeg", 0.85);

      if (kind === "front") {
        setCnicFront(file);
        setCnicFrontPreview(preview);
      } else if (kind === "back") {
        setCnicBack(file);
        setCnicBackPreview(preview);
      } else {
        setSelfie(file);
        setSelfiePreview(preview);
      }

      setCapturedImage(null);
      setCapturedCanvas(null);
      setCapturedKind(null);
      setCapturedBlur(null);
      setOcrError(null);
      setOcrFailed(false);
      setManualEntryAllowed(false);
      setManualCnicNumber("");

      toast.success(`${kind === "front" ? "CNIC Front" : kind === "back" ? "CNIC Back" : "Selfie"} captured successfully!`);
    }, "image/jpeg", 0.92);
  }

  function cancelCaptured() {
    setCapturedImage(null);
    setCapturedCanvas(null);
    setCapturedKind(null);
    setCapturedBlur(null);
    setOcrError(null);
    setOcrFailed(false);
    setManualEntryAllowed(false);
    setManualCnicNumber("");
    if (capturedKind) {
      startPhotoCamera(capturedKind);
    }
  }

  // ---- Automatic face video (3-2-1 countdown, 15 s, auto stop) ------------
  function clearRecordTimer() {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  }

  function stopVideoStream() {
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current = null;
    setLiveStream(null);
  }

  function cancelVideoRecording() {
    videoCancelledRef.current = true;
    runIdRef.current++; // aborts a running countdown
    clearRecordTimer();
    const r = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    try { if (r && r.state !== "inactive") r.stop(); } catch { /* ignore */ }
    stopVideoStream();
    setVideoRecording(false);
    setVideoCountdown(null);
    setVideoTimer(0);
    setVideoOpen(false);
  }

  // A still frame from the video becomes the selfie if the user has none yet,
  // so the user does not have to take a separate selfie.
  function grabAutoSelfie() {
    const v = liveVideoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, 0, 0);
    c.toBlob((blob) => {
      if (!blob) return;
      const f = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      const preview = c.toDataURL("image/jpeg", 0.85);
      setSelfie((prev) => prev ?? f);
      setSelfiePreview((prev) => prev ?? preview);
    }, "image/jpeg", 0.92);
  }

  async function startVideoRecording() {
    setCameraProblem(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      await cameraFail(window.isSecureContext ? { name: "NotSupportedError" } : null, "video");
      return;
    }
    const runId = ++runIdRef.current;
    videoCancelledRef.current = false;
    setOcrError(null);

    // 1280x720 / 24 fps is enough for liveness and keeps the upload small.
    const attempts: MediaStreamConstraints[] = [
      {
        video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 24, max: 30 } },
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: { ideal: 1 } },
      },
      { video: { facingMode: "user" }, audio: true },
      { video: { facingMode: "user" } }, // microphone unavailable or refused
    ];
    let s: MediaStream | null = null;
    let lastErr: any = null;
    for (const c of attempts) {
      try { s = await navigator.mediaDevices.getUserMedia(c); break; } catch (err) {
        lastErr = err;
        // A refusal must not trigger more popups.
        if (isPermissionError(err)) break;
      }
    }
    if (!s) {
      await cameraFail(lastErr, "video");
      return;
    }
    if (runId !== runIdRef.current) { s.getTracks().forEach((t) => t.stop()); return; }

    setCamPerm("granted");
    videoStreamRef.current = s;
    setLiveStream(s);
    setVideoTimer(0);
    setVideoRecording(false);
    setVideoOpen(true);

    for (let n = 3; n >= 1; n--) {
      setVideoCountdown(n);
      await sleep(1000);
      if (runId !== runIdRef.current) return;
    }
    setVideoCountdown(null);

    const mime = pickRecorderMime();
    const opts: any = { videoBitsPerSecond: 1200000, audioBitsPerSecond: 64000 };
    if (mime) opts.mimeType = mime;
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(s, opts);
    } catch {
      try {
        recorder = new MediaRecorder(s);
      } catch {
        cancelVideoRecording();
        await cameraFail({ name: "NotSupportedError" }, "video");
        return;
      }
    }
    mediaRecorderRef.current = recorder;
    videoChunksRef.current = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) videoChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      clearRecordTimer();
      stopVideoStream();
      setVideoRecording(false);
      setVideoCountdown(null);
      setVideoOpen(false);
      if (videoCancelledRef.current) return;
      const fullType = recorder.mimeType || mime || "video/webm";
      const blob = new Blob(videoChunksRef.current, { type: fullType });
      if (blob.size < 1000) {
        toast.error("The video could not be recorded. Please try again.");
        return;
      }
      const baseType = fullType.split(";")[0] || "video/webm";
      const ext = baseType.includes("mp4") ? "mp4" : "webm";
      setVideoFile(new File([blob], `face.${ext}`, { type: baseType }));
      setVideoBlob(URL.createObjectURL(blob));
      toast.success("Face video recorded.");
    };

    recorder.start(1000);
    setVideoRecording(true);
    let sec = 0;
    recordTimerRef.current = setInterval(() => {
      sec++;
      setVideoTimer(sec);
      if (sec === 2) grabAutoSelfie();
      if (sec >= 15) {
        clearRecordTimer();
        try { if (recorder.state !== "inactive") recorder.stop(); } catch { /* ignore */ }
      }
    }, 1000);
  }

  async function uploadFile(file: File, path: string): Promise<string> {
    try {
      const url = await uploadFileToStorage(file, path);
      return url;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  function startReapply() {
    if (submission) {
      setForm({
        full_name: submission.full_name || "",
        date_of_birth: submission.date_of_birth || "",
        address: submission.address || "",
        cnic_number: submission.cnic_number || "",
      });
      if (submission.document_type) {
        setDocType(submission.document_type === "passport" ? "passport" : "cnic");
      }
    }
    setCnicFront(null); setCnicFrontPreview(null);
    setCnicBack(null); setCnicBackPreview(null);
    setSelfie(null); setSelfiePreview(null);
    setPassportFile(null);
    setVideoFile(null); setVideoBlob(null);
    setReapplying(true);
  }

  function isValidCnic(cnic: string): boolean {
    const cleaned = cnic.replace(/-/g, "");
    return /^\d{13}$/.test(cleaned);
  }

  async function handleSubmit() {
    if (!form.full_name) { toast.error("Full name is required"); return; }
    if (!videoFile) { toast.error("Please record a 15-second face video"); return; }

    if (docType === "cnic") {
      if (!form.cnic_number || !cnicFront || !cnicBack || !selfie) {
        toast.error("All CNIC fields, photos and selfie are required");
        return;
      }
      if (!isValidCnic(form.cnic_number)) {
        toast.error("CNIC number must be 13 digits (format: 00000-0000000-0)");
        return;
      }
    } else {
      if (!passportFile) { toast.error("Please upload your passport PDF"); return; }
    }

    setIsSubmitting(true);
    try {
      const uid = user?.id;
      const stamp = Date.now();
      const videoUrl = await uploadFile(videoFile, `${uid}/face_video_${stamp}`);
      let frontUrl = "", backUrl = "", selfieUrl = "", passportUrl = "";

      if (docType === "cnic") {
        frontUrl = await uploadFile(cnicFront!, `${uid}/cnic_front_${stamp}`);
        backUrl = await uploadFile(cnicBack!, `${uid}/cnic_back_${stamp}`);
        selfieUrl = await uploadFile(selfie!, `${uid}/selfie_${stamp}`);
      } else {
        passportUrl = await uploadFile(passportFile!, `${uid}/passport_${stamp}`);
      }

      const payload: any = {
        user_id: uid,
        full_name: form.full_name,
        date_of_birth: form.date_of_birth || null,
        address: form.address,
        cnic_number: docType === "cnic" ? form.cnic_number : null,
        cnic_front_url: frontUrl || null,
        cnic_back_url: backUrl || null,
        selfie_url: selfieUrl || null,
        passport_url: passportUrl || null,
        face_video_url: videoUrl,
        document_type: docType,
        status: "pending",
        rejection_reason: null,
        submitted_at: new Date().toISOString(),
      };

      if (submission?.id) {
        await updateKycSubmission(submission.id, payload);
      } else {
        await insertKycSubmission(payload);
      }

      if (uid) await sendNotification(uid, "kyc_pending", "KYC Received ✅", "Thank you! Your identity verification is under review. This usually takes 1-3 days.", "/kyc");

      toast.success("KYC submitted! Review takes 1-3 business days.");
      setReapplying(false);
      loadSubmission();
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  const statusConfig: any = {
    pending: { icon: <Clock className="h-4 w-4" />, label: "Under Review", color: "bg-orange-100 text-orange-700" },
    approved: { icon: <CheckCircle2 className="h-4 w-4" />, label: "Approved", color: "bg-teal-100 text-teal-700" },
    rejected: { icon: <AlertTriangle className="h-4 w-4" />, label: "Rejected", color: "bg-red-100 text-red-700" },
  };

  // Full-screen automatic face video: countdown -> 15 s recording -> auto stop
  if (videoOpen) {
    const step = VIDEO_STEPS.find((st) => videoTimer < st.until) ?? VIDEO_STEPS[VIDEO_STEPS.length - 1];
    return (
      <div className="fixed inset-0 z-[120] flex flex-col bg-black text-white">
        <div
          className="shrink-0 space-y-1 bg-black/80 px-4 pb-2 text-center text-xs"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <p className="font-semibold text-amber-300">Remove glasses, cap, hat or mask. Keep your full face in the oval, in good light.</p>
          <p className="text-white/70">Chasma, topi ya mask utaar dein. Poora chehra oval ke andar rakhein.</p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <video
            ref={liveVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="rounded-[50%] border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
              style={{ width: "72%", maxWidth: 340, aspectRatio: "3 / 4" }}
            />
          </div>

          {videoCountdown !== null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
              <span className="text-8xl font-extrabold drop-shadow">{videoCountdown}</span>
              <span className="mt-2 text-sm font-medium">Recording starts… / Recording shuru hone wali hai</span>
            </div>
          )}

          {videoRecording && (
            <>
              <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold">
                <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                REC {videoTimer}s / 15s
              </div>
              <div className="absolute inset-x-3 bottom-4 rounded-xl bg-black/65 px-4 py-3 text-center">
                <p className="text-lg font-bold leading-tight">{step.en}</p>
                <p className="mt-0.5 text-sm text-white/75">{step.ur}</p>
              </div>
            </>
          )}
        </div>

        <div
          className="shrink-0 space-y-3 bg-black px-4 pt-3"
          style={{ paddingBottom: "max(0.875rem, env(safe-area-inset-bottom))" }}
        >
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-2 rounded-full bg-red-500 transition-all" style={{ width: `${(videoTimer / 15) * 100}%` }} />
          </div>
          <Button variant="outline" className="w-full bg-transparent text-white" onClick={cancelVideoRecording}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Camera view with capture
  if (activeCamera && !capturedImage) {
    const isSelfie = activeCamera === "selfie";
    const isFront = activeCamera === "front";
    const isBack = activeCamera === "back";

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <h2 className="font-bold text-lg text-center">
            {isFront ? "CNIC Front — Capture" : isBack ? "CNIC Back — Capture" : "Selfie — Capture"}
          </h2>

          {isFront && (
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-800 dark:text-blue-300">
              📇 CNIC ko frame ke andar seedha, poora aur roshni mein rakhein — phir neeche "Capture" button dabayein.
            </div>
          )}
          {isBack && (
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-sm text-blue-800 dark:text-blue-300">
              📇 CNIC ka back side frame mein rakhein — phir neeche "Capture" button dabayein.
            </div>
          )}
          {isSelfie && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-800 dark:text-amber-300">
              📸 Glasses, cap, hat, mask hata dein. Chehra oval ke andar rakhein — phir neeche "Capture" button dabayein.
            </div>
          )}

          <div className="relative w-full rounded-xl overflow-hidden border">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full block"
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                setCameraRes({ w: v.videoWidth, h: v.videoHeight });
              }}
            />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-2">
              {!isSelfie ? (
                <div ref={frameRef} className="relative w-[96%] max-w-none" style={{ aspectRatio: "1.586 / 1" }}>
                  <div className="absolute inset-0 rounded-xl border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-md" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-md" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-md" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-md" />
                  <p className="absolute -bottom-8 left-0 right-0 text-center text-xs font-medium text-white drop-shadow">
                    {isFront ? "CNIC ko frame ke andar seedha rakhein" : "CNIC Back ko frame mein rakhein"}
                  </p>
                </div>
              ) : (
                <div ref={frameRef} className="relative w-[85%] max-w-sm" style={{ aspectRatio: "3 / 4" }}>
                  <div className="absolute inset-0 rounded-[50%] border-4 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
                  <p className="absolute -bottom-8 left-0 right-0 text-center text-xs font-medium text-white drop-shadow">
                    Chehra oval ke andar rakhein
                  </p>
                </div>
              )}
            </div>
          </div>

          {cameraRes && (
            Math.max(cameraRes.w, cameraRes.h) < 1280 ? (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 p-2 text-xs text-amber-700 text-center">
                ⚠️ This camera is giving a low-quality image ({cameraRes.w}×{cameraRes.h}). Move to better light, clean the lens, or open this page in Chrome / Safari.
              </div>
            ) : (
              <p className="text-center text-[11px] text-muted-foreground">Camera quality: {cameraRes.w}×{cameraRes.h}</p>
            )
          )}

          <div
            role="status"
            aria-live="polite"
            className={`rounded-lg border p-3 text-center text-sm ${
              !focusing
                ? "border-teal-300 bg-teal-50 text-teal-800 dark:bg-teal-950/20 dark:text-teal-300"
                : "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300"
            }`}
          >
            {focusHint || "Hold steady while the camera checks image focus."}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { captureRunRef.current++; setCapturing(false); stream?.getTracks().forEach(t => t.stop()); setActiveCamera(null); setOcrError(null); }}>
              Cancel
            </Button>
            {torchSupported && activeCamera !== "selfie" && (
              <Button variant="outline" onClick={toggleTorch}>
                {torchOn ? "Light: ON" : "Light"}
              </Button>
            )}
            <Button className="flex-1" onClick={captureImage} disabled={capturing || focusing}>
              <Camera className="h-4 w-4 mr-2" />
              {capturing ? "Hold still..." : focusing ? "Checking focus..." : "Capture"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Captured image preview with verify option
  if (capturedImage && capturedKind) {
    const isFront = capturedKind === "front";
    const isBlurry = capturedKind !== "selfie" && capturedBlur !== null && capturedBlur > BLUR_MAX;
    
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <h2 className="font-bold text-lg text-center">
            {isFront ? "CNIC Front — Preview" : capturedKind === "back" ? "CNIC Back — Preview" : "Selfie — Preview"}
          </h2>

          {isFront && (
            <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-3 text-sm text-teal-800 dark:text-teal-300">
              ✅ Photo captured. Select "Verify & Confirm" to detect and fill the CNIC number. You can correct it manually if needed.
            </div>
          )}

          <div className="relative w-full rounded-xl overflow-hidden border">
            <img src={capturedImage} alt="Captured" className="w-full block" />
          </div>

          {capturedKind !== "selfie" && !isBlurry && (
            <p className="text-xs text-muted-foreground text-center">
              Check that all the small text (name, father's name, number, dates) is easy to read. If not, press Retake.
            </p>
          )}

          {isBlurry && !ocrError && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 p-3 text-sm text-amber-700 text-center">
              {isFront
                ? "ℹ️ The photo is a little soft. Press Verify & Confirm — if the CNIC number can be read, it will be accepted. If not, you will be asked to retake it."
                : "ℹ️ The photo is a little soft. If the card text is readable you can Confirm, otherwise press Retake."}
            </div>
          )}

          {isFront && ocrProcessing && (
            <div className="text-center text-sm text-primary py-2 flex items-center justify-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
              {ocrStatus || "Reading the number from the photo..."}
            </div>
          )}
          
          {ocrError && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 p-3 text-sm text-amber-700 text-center">
              ⚠️ {ocrError}
            </div>
          )}

          {isFront && manualEntryAllowed && (
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-foreground">
                If the full CNIC front is clear, enter the number as printed. Keep the photo attached; our verification team will check it before approval.
              </p>
              <Input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                maxLength={13}
                aria-label="13-digit CNIC number"
                placeholder="13-digit CNIC number"
                value={manualCnicNumber}
                onChange={(event) => setManualCnicNumber(event.target.value.replace(/\D/g, "").slice(0, 13))}
              />
              <Button className="w-full" onClick={continueWithManualCnic}>
                Use Number & Continue
              </Button>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={cancelCaptured} disabled={ocrProcessing}>
              <X className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button 
              className="flex-1" 
              onClick={verifyCapturedImage}
              disabled={ocrProcessing}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {ocrProcessing ? "Processing..." : isFront ? (ocrFailed ? "Try Reading Again" : "Verify & Confirm") : "Confirm"}
            </Button>
          </div>

        </div>
      </div>
    );
  }

  const inAppBrowser =
    typeof navigator !== "undefined" &&
    /FBAN|FBAV|FB_IAB|Instagram|Snapchat|TikTok|MicroMessenger|Line\/|; wv\)/i.test(navigator.userAgent);
  const showStatusCard = submission && !reapplying;
  const isRejected = submission?.status === "rejected";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            const kind = (e.target.dataset.kind || "front") as "front" | "back" | "selfie";
            e.target.value = "";
            if (f) handleNativePhoto(f, kind);
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="user"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) handleNativeVideo(f);
          }}
        />

        {cameraProblem && (
          <div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true">
            <div className="w-full max-w-md space-y-3 rounded-2xl border bg-card p-5 shadow-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm font-medium">{cameraProblem.message}</p>
              </div>
              <div className="grid gap-2">
                {cameraProblem.canRetry && (
                  <Button onClick={retryCamera}><RefreshCw className="mr-2 h-4 w-4" /> Try Again</Button>
                )}
                <Button variant="outline" onClick={openNativeCapture}>
                  <Camera className="mr-2 h-4 w-4" /> Use Phone Camera
                </Button>
                <Button variant="ghost" onClick={() => setCameraProblem(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        <Button variant="ghost" size="sm" className="mb-4 -ml-2" onClick={() => { try { sessionStorage.removeItem("givethra_kyc_return_to"); } catch { /* ignore */ } navigate({ to: returnTo as any }); }}>
          ← Back
        </Button>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary/10"><Shield className="h-5 w-5 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">KYC Verification</h1>
            <p className="text-sm text-muted-foreground">Identity verification required</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : !user ? (
          <div className="text-center py-12 text-muted-foreground">Please sign in first</div>
        ) : loadError && (!submission || reapplying) ? (
          <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-center dark:bg-amber-950/20">
            <p className="mb-4 text-sm text-amber-800 dark:text-amber-200">{loadError}</p>
            <Button onClick={() => { setIsLoading(true); void loadSubmission(); }}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry status check
            </Button>
          </div>
        ) : showStatusCard ? (
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg ${statusConfig[submission.status]?.color}`}>
              {statusConfig[submission.status]?.icon}
              <span className="font-semibold">{statusConfig[submission.status]?.label}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{submission.full_name}</span></div>
              <div><span className="text-muted-foreground">Document:</span> <span className="font-medium uppercase">{submission.document_type}</span></div>
              {submission.cnic_number && <div><span className="text-muted-foreground">CNIC:</span> <span className="font-medium">{submission.cnic_number}</span></div>}
              <div><span className="text-muted-foreground">Submitted:</span> <span className="font-medium">{submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : "—"}</span></div>
            </div>

            {isRejected && submission.rejection_reason && (
              <div className="rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 p-1.5 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-800">KYC Rejected</h4>
                    <p className="text-[11px] text-red-600">Please review the reason below before re-submitting</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-red-200 p-4">
                  <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wide mb-2">Rejection Reason</p>
                  <p className="text-sm text-red-900 font-medium leading-relaxed">{submission.rejection_reason}</p>
                </div>

                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <Eye className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">How to fix this:</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Make sure all photos are clear, well-lit, and your full face is visible without glasses, cap, or mask. Your face must match the photo on your document.
                    </p>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                  onClick={startReapply}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Submit KYC Again
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {isRejected && !submission.rejection_reason && (
              <div className="rounded-xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="bg-red-100 p-1.5 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-800">KYC Rejected</h4>
                    <p className="text-[11px] text-red-600">Please re-submit your verification documents</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                  onClick={startReapply}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Submit KYC Again
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {submission.status === "approved" && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm text-teal-700">
                ✓ Your identity is verified. You can now submit and unlock cases.
              </div>
            )}

            {submission.status === "pending" && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
                ⏳ Your KYC is under review. This usually takes 1-3 business days.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {reapplying && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-sm text-primary flex items-center justify-between">
                <span>Re-submitting your KYC with new photos.</span>
                <button onClick={() => setReapplying(false)} className="text-xs underline">Cancel</button>
              </div>
            )}

            {inAppBrowser && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                ⚠️ You seem to be inside an app's built-in browser (WhatsApp, Facebook, etc.), which often blocks the camera.
                Please open <strong>givethra.org</strong> in Chrome (Android) or Safari (iPhone).
              </div>
            )}

            {camPerm === "denied" && (
              <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 space-y-2 text-sm text-red-900">
                <p className="font-bold">Camera / microphone is blocked for this site</p>
                <p className="text-xs">
                  The browser remembers a previous "Block". Only you can switch it on once:
                </p>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li><strong>Android Chrome:</strong> tap the lock / settings icon next to the address bar → Permissions → set Camera and Microphone to <strong>Allow</strong>.</li>
                  <li><strong>iPhone Safari:</strong> tap the “aA” icon in the address bar → Website Settings → Camera and Microphone → <strong>Allow</strong>.</li>
                </ul>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { requestCameraAccess(); }}>Ask again</Button>
                  <Button size="sm" className="flex-1" onClick={() => window.location.reload()}>I allowed it — reload</Button>
                </div>
              </div>
            )}

            {camPerm !== "denied" && camPerm !== "granted" && (
              <div className="rounded-xl border border-blue-300 bg-blue-50 p-3 text-xs text-blue-800 flex items-center justify-between gap-3">
                <span>📷 When your browser asks, please tap <strong>Allow</strong> for camera and microphone. Browser poochay to <strong>Allow</strong> dabayein.</span>
                <Button size="sm" variant="outline" onClick={() => { requestCameraAccess(); }}>Allow</Button>
              </div>
            )}

            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <Eye className="h-4 w-4" /> Important — Please read before taking photo & video
              </div>
              <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
                <li>Remove <strong>glasses, cap, hat, mask, or any face cover</strong> when taking the selfie and recording the video.</li>
                <li>Your <strong>full face must be clearly visible</strong>, in good light.</li>
                <li>Your face should <strong>match the photo on your CNIC</strong>.</li>
                <li>If your face is covered or unclear, your KYC will be rejected.</li>
              </ul>
              <p className="text-xs text-amber-700 dark:text-amber-400 pt-1 border-t border-amber-500/20">
                🔒 Your photo and video are <strong>completely private and secure</strong> — only seen by our verification team for confirming your identity. No other user or Hero can ever see them.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Document Type *</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setDocType("cnic")}
                  className={`px-3 py-3 rounded-lg border text-sm font-medium ${docType === "cnic" ? "bg-primary text-white border-primary" : "border-border"}`}>
                  🆔 National ID (CNIC)
                </button>
                <button type="button" onClick={() => setDocType("passport")}
                  className={`px-3 py-3 rounded-lg border text-sm font-medium ${docType === "passport" ? "bg-primary text-white border-primary" : "border-border"}`}>
                  📘 Passport (International)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={form.full_name} onChange={e => setForm(p => ({...p, full_name: e.target.value}))} placeholder="As on document" />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={e => setForm(p => ({...p, date_of_birth: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={e => setForm(p => ({...p, address: e.target.value}))} placeholder="Full address" />
            </div>

            {docType === "cnic" ? (
              <>
                <div className="space-y-2">
                  <Label>CNIC Number *</Label>
                  <Input 
                    value={form.cnic_number} 
                    onChange={e => setForm(p => ({...p, cnic_number: e.target.value}))} 
                    placeholder="00000-0000000-0"
                  />
                  {form.cnic_number && cnicFrontPreview ? (
                    <p className="text-xs text-teal-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> The number was filled automatically. Please correct it manually if needed.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">The CNIC front scan will fill the number automatically. You can correct it manually if needed.</p>
                  )}
                  {form.cnic_number && !/^\d{5}-\d{7}-\d{1}$/.test(form.cnic_number) && (
                    <p className="text-xs text-red-500">⚠️ Format: 00000-0000000-0 (13 digits)</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>CNIC Front Photo *</Label>
                  {cnicFrontPreview ? (
                    <div className="space-y-2">
                      <img src={cnicFrontPreview} alt="Front" className="w-full rounded-lg border max-h-40 object-cover" />
                      <Button variant="outline" size="sm" className="w-full" onClick={() => { setCnicFront(null); setCnicFrontPreview(null); setForm(p => ({...p, cnic_number: ""})); }}>Retake</Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => startPhotoCamera("front")}><Camera className="h-4 w-4 mr-2" /> Scan CNIC Front</Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>CNIC Back Photo *</Label>
                  {cnicBackPreview ? (
                    <div className="space-y-2">
                      <img src={cnicBackPreview} alt="Back" className="w-full rounded-lg border max-h-40 object-cover" />
                      <Button variant="outline" size="sm" className="w-full" onClick={() => { setCnicBack(null); setCnicBackPreview(null); }}>Retake</Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => startPhotoCamera("back")}><Camera className="h-4 w-4 mr-2" /> Capture CNIC Back</Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Selfie *</Label>
                  <p className="text-xs text-muted-foreground">Remove glasses, cap, or face cover. Your full face must be clearly visible.</p>
                  {selfiePreview ? (
                    <div className="space-y-2">
                      <img src={selfiePreview} alt="Selfie" className="w-full rounded-lg border max-h-40 object-cover" />
                      <Button variant="outline" size="sm" className="w-full" onClick={() => { setSelfie(null); setSelfiePreview(null); }}>Retake</Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={() => startPhotoCamera("selfie")}><Camera className="h-4 w-4 mr-2" /> Take Selfie</Button>
                  )}
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Passport (PDF) *</Label>
                <Input type="file" accept=".pdf,image/*" onChange={e => setPassportFile(e.target.files?.[0] ?? null)} />
                {passportFile && <p className="text-xs text-teal-600">✓ {passportFile.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>15-Second Face Video *</Label>
              <p className="text-xs text-muted-foreground">Remove glasses, cap, or face cover. Record a short video of your face for liveness verification.</p>
              {videoBlob ? (
                <div className="space-y-2">
                  <video src={videoBlob} controls className="w-full rounded-lg border max-h-40" />
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setVideoBlob(null); setVideoFile(null); }}>Re-record</Button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Button variant="outline" className="w-full" onClick={startVideoRecording}>🎥 Record 15s Face Video</Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Recording starts by itself after a 3-2-1 countdown and stops automatically after 15 seconds.
                  </p>
                </div>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit KYC Verification"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
