// src/frontend/src/pages/KycPage.tsx
// Givethra - Complete KYC Page with Camera, OCR, Selfie, and Video Recording
// Fully functional with Cloudflare Worker APIs

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendNotification } from "@/lib/notify";
import { Shield, CheckCircle2, Clock, AlertTriangle, Camera, Eye, RefreshCw, ArrowRight, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Tesseract from "tesseract.js";
import {
  getKycSubmission,
  insertKycSubmission,
  updateKycSubmission,
  uploadFileToStorage,
} from "@/lib/api";

export default function KycPage() {
  const { user } = useAuth();
  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  async function loadSubmission() {
    if (!user) return;
    try {
      const data = await getKycSubmission(user.id);
      setSubmission(data);
    } catch (err) {
      console.error("Failed to load KYC submission", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function startPhotoCamera(target: string) {
    try {
      setOcrError(null);
      setCapturedImage(null);
      setCapturedKind(null);
      setCapturedCanvas(null);
      
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: target === "selfie" ? "user" : "environment",
          advanced: [{ focusMode: "continuous" }],
        },
      });

      try {
        const [track] = s.getVideoTracks();
        const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities?.focusMode?.includes?.("continuous")) {
          await track.applyConstraints({ advanced: [{ focusMode: "continuous" } as any] });
        }
      } catch {
        // ignore
      }

      setStream(s);
      setActiveCamera(target);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch {
      toast.error("Camera access denied.");
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

  function grabFrame(): HTMLCanvasElement | null {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const rect = getCropRect();
    if (!video || !canvas || !rect || rect.w <= 0 || rect.h <= 0) return null;
    canvas.width = rect.w;
    canvas.height = rect.h;
    canvas.getContext("2d")?.drawImage(video, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
    return canvas;
  }

  function captureImage() {
    setOcrError(null);
    const canvas = grabFrame();
    if (!canvas) {
      toast.error("Tasveer nahi li ja saki. Dobara koshish karein.");
      return;
    }
    
    const imageData = canvas.toDataURL("image/jpeg");
    setCapturedImage(imageData);
    setCapturedCanvas(canvas);
    setCapturedKind(activeCamera as "front" | "back" | "selfie");
    
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
      try {
        const result = await Tesseract.recognize(capturedCanvas, "eng");
        const text = result.data.text || "";
        const match = text.match(/\d{5}[\s-]?\d{7}[\s-]?\d{1}/);
        const letterCount = (text.match(/[A-Za-z]/g) || []).length;
        const fullCardVisible = letterCount >= 20;

        if (match && fullCardVisible) {
          const digits = match[0].replace(/\D/g, "");
          const formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
          setOcrProcessing(false);
          setForm(p => ({ ...p, cnic_number: formatted }));
          finalizeCapture(capturedKind, capturedCanvas);
          toast.success(`CNIC number parh liya: ${formatted}. Agar galat hai to khud durust kar lein.`);
        } else {
          setOcrProcessing(false);
          setOcrError("CNIC number saaf nahi parha gaya. CNIC ko seedha, poora aur roshni mein rakh kar dobara capture karein.");
          toast.error("CNIC number saaf nahi parha gaya. Dobara koshish karein.");
          setCapturedImage(null);
          setCapturedCanvas(null);
          setCapturedKind(null);
        }
      } catch {
        setOcrProcessing(false);
        setOcrError("OCR fail ho gaya. Dobara koshish karein.");
        toast.error("OCR fail ho gaya. Dobara koshish karein.");
        setCapturedImage(null);
        setCapturedCanvas(null);
        setCapturedKind(null);
      }
    } else {
      finalizeCapture(capturedKind, capturedCanvas);
    }
  }

  function finalizeCapture(kind: "front" | "back" | "selfie", canvas: HTMLCanvasElement) {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `${kind}.jpg`, { type: "image/jpeg" });
      const preview = canvas.toDataURL("image/jpeg");

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
      setOcrError(null);
      
      toast.success(`${kind === "front" ? "CNIC Front" : kind === "back" ? "CNIC Back" : "Selfie"} captured successfully!`);
    }, "image/jpeg");
  }

  function cancelCaptured() {
    setCapturedImage(null);
    setCapturedCanvas(null);
    setCapturedKind(null);
    setOcrError(null);
    if (capturedKind) {
      startPhotoCamera(capturedKind);
    }
  }

  async function startVideoRecording() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: { ideal: 1 },
          sampleRate: { ideal: 48000 },
        },
      });
      setStream(s);
      setVideoRecording(true);
      setVideoTimer(0);
      setTimeout(() => { if (liveVideoRef.current) liveVideoRef.current.srcObject = s; }, 100);
      const preferredMimeType = "video/webm;codecs=vp8,opus";
      const mimeType = typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(preferredMimeType)
        ? preferredMimeType
        : "video/webm";
      const recorder = new MediaRecorder(s, {
        mimeType,
        videoBitsPerSecond: 1500000,
        audioBitsPerSecond: 128000,
      });
      mediaRecorderRef.current = recorder;
      videoChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) videoChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const recordedType = recorder.mimeType || mimeType;
        const blob = new Blob(videoChunksRef.current, { type: recordedType });
        setVideoFile(new File([blob], "face.webm", { type: recordedType }));
        setVideoBlob(URL.createObjectURL(blob));
        s.getTracks().forEach(t => t.stop());
        setVideoRecording(false);
      };
      recorder.start();
      let sec = 0;
      const interval = setInterval(() => {
        sec++;
        setVideoTimer(sec);
        if (sec >= 15) { clearInterval(interval); recorder.stop(); }
      }, 1000);
    } catch {
      toast.error("Camera/mic access denied.");
    }
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

  // Camera view with capture
  if (activeCamera && !capturedImage) {
    const isSelfie = activeCamera === "selfie";
    const isFront = activeCamera === "front";
    const isBack = activeCamera === "back";

    return (
      <Layout>
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
            <video ref={videoRef} autoPlay playsInline className="w-full block" />

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

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { stream?.getTracks().forEach(t => t.stop()); setActiveCamera(null); setOcrError(null); }}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={captureImage}>
              <Camera className="h-4 w-4 mr-2" />
              Capture
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Captured image preview with verify option
  if (capturedImage && capturedKind) {
    const isFront = capturedKind === "front";
    
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
          <h2 className="font-bold text-lg text-center">
            {isFront ? "CNIC Front — Preview" : capturedKind === "back" ? "CNIC Back — Preview" : "Selfie — Preview"}
          </h2>

          {isFront && (
            <div className="rounded-xl bg-teal-500/10 border border-teal-500/20 p-3 text-sm text-teal-800 dark:text-teal-300">
              ✅ Tasveer capture ho gayi hai. "Verify & Confirm" dabayein — OCR number parh kar auto-fill kar dega. Agar koi ghalti ho to baad mein khud durust kar sakte hain.
            </div>
          )}

          <div className="relative w-full rounded-xl overflow-hidden border">
            <img src={capturedImage} alt="Captured" className="w-full block" />
          </div>

          {isFront && ocrProcessing && (
            <div className="text-center text-sm text-primary py-2 flex items-center justify-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
              Tasveer se number parha ja raha hai...
            </div>
          )}
          
          {isFront && ocrError && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-300 p-3 text-sm text-amber-700 text-center">
              ⚠️ {ocrError}
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
              {ocrProcessing ? "Processing..." : isFront ? "Verify & Confirm" : "Confirm"}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const showStatusCard = submission && !reapplying;
  const isRejected = submission?.status === "rejected";

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
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
                      <CheckCircle2 className="h-3.5 w-3.5" /> OCR se number auto-fill ho gaya hai. Agar koi ghalti hai to khud durust kar lein.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">CNIC front capture ke baad OCR number auto-fill kar dega. Agar ghalti ho to khud theek kar sakte hain.</p>
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
              ) : videoRecording ? (
                <div className="space-y-2">
                  <video ref={liveVideoRef} autoPlay playsInline muted className="w-full rounded-lg border" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-500">● Recording... {videoTimer}s / 15s</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${(videoTimer / 15) * 100}%` }} />
                  </div>
                </div>
              ) : (
                <Button variant="outline" className="w-full" onClick={startVideoRecording}>🎥 Record 15s Face Video</Button>
              )}
            </div>

            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit KYC Verification"}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
