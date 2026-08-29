// src/frontend/src/pages/CaseDetailPage.tsx
// Full working code - Affidavit with TXN and Receipt for all approved help

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCaseById,
  getCaseUnlock,
  getUserUnlockCount,
  getCaseResolutions,
  getKycSubmission,
  getProfile,
  insertCaseUnlock,
  insertCaseResolution,
  updateCaseResolution,
  insertFeedback,
  getFeedbackForCase,
  getUserSuspension,
  uploadFileToStorage,
} from "@/lib/api";
import { sendNotification } from "@/lib/notify";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronLeft,
  Lock,
  Unlock,
  CheckCircle2,
  Heart,
  FileText,
  ExternalLink,
  Copy,
  Building2,
  Clock,
  HandCoins,
  Video,
  Star,
  AlertCircle,
  XCircle,
  RefreshCw,
  Eye,
  CalendarClock,
  MapPin,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹",
};

const GIVETHRA_NAYAPAY_TITLE = "Shoaib Ahmed";
const GIVETHRA_NAYAPAY_IBAN = "PK93NAYA1234503331641604";
const GIVETHRA_USDT_TRC20 = "TNjaCQjQ5Yzm5tiVF8s121rUv5BH7y6hAC";

function maskCnic(cnic?: string): string {
  if (!cnic) return "—";
  const digits = cnic.replace(/\D/g, "");
  if (digits.length < 6) return cnic;
  const shown = digits.slice(0, 4);
  const masked = "*".repeat(Math.max(digits.length - 4, 4));
  return `${shown}${masked}`;
}

function maskAccount(acc?: string): string {
  if (!acc) return "—";
  const d = acc.replace(/\s/g, "");
  if (d.length <= 4) return d;
  const last = d.slice(-4);
  return `${"*".repeat(Math.max(d.length - 4, 1))}${last}`;
}

function copyToClipboard(text: string, label: string) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied!`),
    () => toast.error("Copy failed")
  );
}

function isApprovedCompletedResolution(resolution: any, caseCompleted: boolean = false): boolean {
  if (!resolution) return false;
  const status = String(resolution?.status || "").trim().toLowerCase();
  if (["completed", "approved", "verified", "confirmed", "seeker_confirmed"].includes(status)) return true;
  if ([1, true, "1", "true", "yes"].includes(resolution?.admin_confirmed)) return true;
  if (resolution?.admin_approved_at || resolution?.approved_at || resolution?.verified_at || 
      resolution?.completed_at || resolution?.admin_confirmed_at) return true;
  if (caseCompleted && status !== "rejected" && status !== "disputed") return true;
  return false;
}

function isContributionResolution(resolution: any): boolean {
  if (!resolution) return false;
  const marker = String(
    resolution?.paid_to ?? resolution?.paidTo ?? resolution?.payment_type ?? resolution?.paymentType ?? ""
  ).trim().toLowerCase();
  return ["givethra", "contribution", "fundraising", "partial"].includes(marker);
}

function generateAffidavitFromRecord(caseData: any, record: any, seekerKyc: any, heroName: string) {
  const resolution = record.resolution;
  const caseId = (caseData.id ?? "").slice(0, 8).toUpperCase();
  const today = new Date().toLocaleDateString();
  const seekerName = seekerKyc?.full_name || caseData.full_name || "Verified Help Seeker";
  const seekerCnic = maskCnic(seekerKyc?.cnic_number);
  const heroCnic = maskCnic(resolution?.hero_cnic_number);
  const completedDate = record.completedAt ? new Date(record.completedAt).toLocaleDateString() : today;
  const verifyCode = `GVT-${caseId}-${Date.now().toString(36).toUpperCase()}`;
  const cur = caseData.currency || "USD";
  const sym = CURRENCY_SYMBOLS[cur] ?? cur;
  const paidAmount = record.amount;
  const isFundraising = record.type === "contribution";

  const html = `
    <html>
    <head>
      <title>Givethra Affidavit - ${caseId}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; line-height: 1.6; }
        .header { text-align: center; border-bottom: 3px double #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .badge { background: #dcfce7; color: #15803d; padding: 6px 12px; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block; }
        h1 { margin: 10px 0; color: #111827; }
        h2 { border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; color: #1f2937; margin-top: 30px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
        .field { background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #f3f4f6; }
        .label { font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: bold; }
        .value { font-size: 16px; font-weight: 500; margin-top: 4px; }
        .receipt-btn { display: inline-block; background: #2563eb; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; margin-top: 8px; font-size: 14px; }
        .declarations { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; border-radius: 8px; margin: 30px 0; }
        .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="badge">✓ DIGITALLY VERIFIED AFFIDAVIT</div>
        <h1>Givethra Legal & Audit Receipt</h1>
        <p>Verified Help. Real Impact. Generated for Audit Tracking.</p>
      </div>

      <h2>Case Information</h2>
      <div class="grid">
        <div class="field"><div class="label">Case ID</div><div class="value">GVT-${caseId}</div></div>
        <div class="field"><div class="label">Category</div><div class="value">${caseData.category || "—"}</div></div>
        <div class="field" style="grid-column: span 2;"><div class="label">Title</div><div class="value">${caseData.title || "—"}</div></div>
      </div>

      <h2>Help Seeker (Beneficiary)</h2>
      <div class="grid">
        <div class="field"><div class="label">Full Name</div><div class="value">${seekerName}</div></div>
        <div class="field"><div class="label">CNIC (Masked)</div><div class="value">${seekerCnic}</div></div>
      </div>

      <h2>Assistance & Method Verification</h2>
      <div class="grid">
        <div class="field"><div class="label">Helper Name (Hero)</div><div class="value">${heroName}</div></div>
        <div class="field"><div class="label">Help Type</div><div class="value">${isFundraising ? "Contribution (Fundraising)" : "Direct Institute Payment"}</div></div>
        <div class="field"><div class="label">Amount Settled</div><div class="value" style="color:#16a34a; font-weight:bold;">${sym} ${paidAmount} ${cur}</div></div>
        <div class="field"><div class="label">TXN Number</div><div class="value">${record.transactionId || "—"}</div></div>
        <div class="field"><div class="label">Payment Route / Method</div><div class="value">${resolution?.resolution_type || caseData.payment_method || "Online Transfer"}</div></div>
        <div class="field"><div class="label">Verification Date</div><div class="value">${completedDate}</div></div>
      </div>

      ${record.receiptUrl ? `
      <h2>Payment Evidence File</h2>
      <div class="field" style="background: #eff6ff; border: 1px solid #bfdbfe;">
        <div class="label">Receipt Attachment</div>
        <p style="font-size:13px; margin: 4px 0 10px 0; color:#1e40af;">You can securely view the original image receipt submitted for this financial transaction below:</p>
        <a href="${record.receiptUrl}" target="_blank" class="receipt-btn">Open & View Uploaded Receipt File ↗</a>
      </div>
      ` : ""}

      <div class="declarations">
        <strong>Official Audit Guarantee:</strong> This document serves as legitimate proof that the stated amount was fully transferred to assist the beneficiary platform group. Both parties have verified completion electronically. This can be produced before any legal audit or inquiry.
      </div>

      <div class="footer">
        <p>Verification Security Code: <strong>${verifyCode}</strong></p>
        <p>© ${new Date().getFullYear()} Givethra Platform. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  } else {
    toast.error("Please allow pop-ups to open the affidavit.");
  }
}

function CopyRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium text-foreground truncate ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button type="button" onClick={() => copyToClipboard(value, label)}
        className="shrink-0 h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
        aria-label={`Copy ${label}`}>
        <Copy className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export default function CaseDetailPage() {
  const { id } = useParams({ from: "/cases/$id" });
  const navigate = useNavigate();
  const { user, userId, isAuthenticated } = useAuth();
  const durableUserId = String(userId || user?.id || "");
  const currentUserEmail = String(user?.email || "").toLowerCase().trim();

  const [caseData, setCaseData] = useState<any>(null);
  const [seekerKyc, setSeekerKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showResolution, setShowResolution] = useState(false);
  const [myResolutions, setMyResolutions] = useState<any[]>([]);
  const [myUnlock, setMyUnlock] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [heroName, setHeroName] = useState("Verified Hero");
  const [isSuspended, setIsSuspended] = useState(false);
  const [payMode, setPayMode] = useState<"choose" | "full" | "partial">("choose");
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [resType, setResType] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [txId, setTxId] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptName, setReceiptName] = useState("");
  const [userUnlockCount, setUserUnlockCount] = useState(0);

  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [fbText, setFbText] = useState("");
  const [fbVideoFile, setFbVideoFile] = useState<File | null>(null);
  const [fbVideoName, setFbVideoName] = useState("");
  const [fbVideoBlob, setFbVideoBlob] = useState<string | null>(null);
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [recTimer, setRecTimer] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    loadCase();
  }, [id, user]);

  useEffect(() => {
    if (caseData?.id && user?.id) {
      checkExistingFeedback();
    }
  }, [caseData, user]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stream]);

  async function checkExistingFeedback() {
    if (!user?.id || !caseData?.id) return;
    try {
      const data = await getFeedbackForCase(caseData.id, user.id);
      setExistingFeedback(data);
    } catch (err) {
      console.error("Error checking feedback:", err);
    }
  }

  async function loadCase() {
    setLoading(true);
    try {
      const data = await getCaseById(id);
      if (!data || data.error || !data.id) {
        throw new Error(data?.error || "Case details are unavailable");
      }
      setCaseData(data);

      if (user && durableUserId) {
        const owner = String(data.user_id || "") === durableUserId;
        const suspension = await getUserSuspension(durableUserId);
        setIsSuspended(Boolean(suspension?.is_active));
        const unlock = await getCaseUnlock(id, durableUserId);
        setMyUnlock(unlock);
        const count = await getUserUnlockCount(durableUserId);
        setUserUnlockCount(Number(count ?? 0));

        const res = await getCaseResolutions(id);
        const allResolutions = Array.isArray(res) ? res : [];
        const mine = allResolutions.filter((r) => {
          const heroId = String(r.hero_id || "").trim();
          const heroEmail = String(r.hero_email || "").toLowerCase().trim();
          return heroId === durableUserId || heroEmail === currentUserEmail;
        });
        setMyResolutions(mine.slice().reverse());

        const completed = String(data.status || "").toLowerCase() === "completed";
        setUnlocked(!!unlock || owner || (completed && mine.length > 0));

        const kyc = await getKycSubmission(data.user_id);
        setSeekerKyc(kyc);
        const prof = await getProfile(durableUserId);
        const nm = (prof?.full_name || "").split(" ")[0];
        if (nm) setHeroName(nm);
      }
    } catch (err) {
      console.error("Error loading case:", err);
      toast.error("Failed to load case details.");
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      setStream(s);
      setRecording(true);
      setPaused(false);
      setRecTimer(0);
      setFbVideoBlob(null);
      setFbVideoFile(null);
      setFbVideoName("");
      setTimeout(() => {
        if (liveVideoRef.current) liveVideoRef.current.srcObject = s;
      }, 100);
      const recorder = new MediaRecorder(s, { mimeType: "video/webm;codecs=vp8" });
      mediaRecorderRef.current = recorder;
      videoChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        setFbVideoFile(new File([blob], "feedback.webm", { type: "video/webm" }));
        setFbVideoBlob(URL.createObjectURL(blob));
        setFbVideoName("feedback.webm");
        s.getTracks().forEach((t) => t.stop());
        setStream(null);
        setRecording(false);
        setPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      recorder.start();
      timerRef.current = setInterval(() => {
        setRecTimer((prev) => {
          if (prev + 1 >= 90) {
            stopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      toast.error("Camera/microphone access denied.");
    }
  }

  function pauseRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }

  function resumeRecording() {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setPaused(false);
      timerRef.current = setInterval(() => {
        setRecTimer((prev) => {
          if (prev + 1 >= 90) {
            stopRecording();
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function discardVideo() {
    setFbVideoBlob(null);
    setFbVideoFile(null);
    setFbVideoName("");
  }

  async function handleUnlock(mode: "full" | "partial") {
    if (!user) {
      navigate({ to: "/sign-in" });
      return;
    }
    if (isSuspended) {
      toast.error("Account suspended. Cannot help.");
      return;
    }
    const pledgeNum = parseFloat(pledgeAmount) || 0;
    if (mode === "partial" && pledgeNum <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }
    setUnlocking(true);
    try {
      const isFreeContribution = mode === "partial" && userUnlockCount < 3;
      const charge = isFreeContribution ? 0 : 1;
      await insertCaseUnlock({
        case_id: id,
        hero_id: user.id,
        pledged_amount: mode === "partial" ? pledgeNum : Math.max(remaining, 0),
        credits_charged: charge,
        payment_type: mode,
      });
      if (mode === "partial") setAmountPaid(String(pledgeNum));
      else setAmountPaid(String(Math.max(remaining, 0)));
      setUnlocked(true);
      setPayMode(mode);
      if (isFreeContribution) {
        toast.success(`🎉 Free contribution #${userUnlockCount + 1}`);
      } else {
        toast.success(mode === "full" ? "Direct help unlocked! 1 credit." : "Contribution unlocked! 1 credit.");
      }
      loadCase();
    } catch (err: any) {
      toast.error("Failed to unlock: " + err.message);
    } finally {
      setUnlocking(false);
    }
  }

  async function handleSubmitResolution() {
    if (isSuspended) {
      toast.error("Account suspended.");
      return;
    }
    if (!resType || !txId) {
      toast.error("Select type and enter TXN ID");
      return;
    }
    setSubmitting(true);
    try {
      let receiptUrl = "";
      if (receiptFile) {
        receiptUrl = await uploadFileToStorage(receiptFile, `resolutions/${id}/${Date.now()}_receipt`);
      }
      const paidNum = amountPaid ? parseFloat(amountPaid) : (myUnlock?.pledged_amount ?? 0);
      const paidTo = myUnlock?.payment_type === "partial" ? "givethra" : "institute";
      await insertCaseResolution({
        case_id: id,
        hero_id: user?.id,
        hero_email: user?.email,
        seeker_id: caseData.user_id,
        resolution_type: resType,
        amount_paid: paidNum,
        transaction_id: txId,
        receipt_url: receiptUrl,
        notes,
        status: paidTo === "givethra" ? "seeker_confirmed" : "pending_confirmation",
        hero_confirmed: true,
        seeker_confirmed: paidTo === "givethra",
        seeker_confirmed_amount: paidTo === "givethra" ? paidNum : null,
        paid_to: paidTo,
      });
      toast.success("Proof submitted!");
      setShowResolution(false);
      setTxId("");
      setNotes("");
      setReceiptFile(null);
      setReceiptName("");
      loadCase();
    } catch (err) {
      toast.error("Error submitting.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSeekerConfirm(confirmedAmount: number, res: any) {
    try {
      await updateCaseResolution(res.id, {
        seeker_confirmed: true,
        seeker_confirmed_amount: confirmedAmount,
        status: "seeker_confirmed",
      });
      toast.success("Confirmed!");
      loadCase();
    } catch {
      toast.error("Failed to confirm.");
    }
  }

  async function handleSeekerDispute(res: any) {
    try {
      await updateCaseResolution(res.id, { seeker_confirmed: false, status: "disputed" });
      toast.success("Disputed.");
      loadCase();
    } catch {
      toast.error("Failed.");
    }
  }

  async function submitFeedback() {
    if (!fbText.trim() || !fbVideoFile) {
      toast.error("Write a message and record/upload a video.");
      return;
    }
    setFbSubmitting(true);
    try {
      const fbVideoUrl = await uploadFileToStorage(fbVideoFile, `feedbacks/${id}/${Date.now()}_video`);
      await insertFeedback({
        case_id: id,
        user_id: user?.id,
        first_name: heroName,
        text_message: fbText.trim(),
        video_url: fbVideoUrl,
        status: "pending_review",
      });
      toast.success("Feedback submitted for review.");
      setFbText("");
      setFbVideoFile(null);
      setFbVideoBlob(null);
      checkExistingFeedback();
    } catch {
      toast.error("Failed to post feedback.");
    } finally {
      setFbSubmitting(false);
    }
  }

  if (loading) return <Layout><div className="text-center py-20">Loading...</div></Layout>;
  if (!caseData) return <Layout><div className="text-center py-20 text-muted-foreground">Case not found.</div></Layout>;

  const cur = caseData?.currency || "USD";
  const sym = CURRENCY_SYMBOLS[cur] ?? cur;
  const amountNeeded = Number(caseData?.amount_needed ?? 0);
  const amountCollected = Number(caseData?.amount_collected ?? 0);
  const remaining = Math.max(amountNeeded - amountCollected, 0);
  const percentDone = amountNeeded > 0 ? Math.min(Math.round((amountCollected / amountNeeded) * 100), 100) : 0;
  const isOwner = user?.id === caseData?.user_id;
  const isCompleted = String(caseData?.status || "").toLowerCase() === "completed";
  const isRejected = String(caseData?.status || "").toLowerCase() === "rejected";
  const isExpired = String(caseData?.status || "").toLowerCase() === "expired";
  const hasPaymentDetails = caseData?.institute_name || caseData?.account_number;
  const unlockMode = myUnlock?.payment_type || payMode;

  function getHelpRecords() {
    const records: any[] = [];
    const isCaseCompleted = String(caseData?.status || "").toLowerCase() === "completed";

    myResolutions.forEach((res) => {
      const isDirect = !isContributionResolution(res);
      const status = String(res.status || "").toLowerCase();
      const isApproved = isApprovedCompletedResolution(res, isCaseCompleted);

      records.push({
        id: res.id,
        type: isDirect ? "direct" : "contribution",
        amount: Number(res.seeker_confirmed_amount ?? res.amount_paid ?? 0),
        transactionId: res.transaction_id,
        receiptUrl: res.receipt_url,
        status: status,
        completedAt: res.completed_at || res.admin_confirmed_at || res.submitted_at,
        resolution: res,
        unlock: null,
        isApproved: isApproved,
      });
    });

    if (myUnlock && !myResolutions.some((r) => r.unlock_id === myUnlock.id)) {
      if (isCaseCompleted) {
        const isPartial = myUnlock.payment_type === "partial";
        records.push({
          id: myUnlock.id,
          type: isPartial ? "contribution" : "direct",
          amount: Number(myUnlock.pledged_amount ?? 0),
          transactionId: "N/A",
          receiptUrl: null,
          status: "unlocked_only",
          completedAt: myUnlock.unlocked_at,
          resolution: null,
          unlock: myUnlock,
          isApproved: false,
        });
      }
    }

    return records;
  }

  const helpRecords = getHelpRecords();
  const approvedRecords = helpRecords.filter(r => r.isApproved === true);
  const hasApprovedDirect = approvedRecords.some(r => r.type === "direct");
  const hasApprovedContribution = approvedRecords.some(r => r.type === "contribution");
  const hasAnyApproved = approvedRecords.length > 0;
  const isOnlyUnlock = !hasAnyApproved && myUnlock;

  // ============================================================
  // COMPLETED HELP VIEW (Helper)
  // ============================================================
  if (isCompleted && !isOwner) {
    const totalDirectAmount = approvedRecords.filter(r => r.type === "direct").reduce((sum, r) => sum + r.amount, 0);
    const totalContributionAmount = approvedRecords.filter(r => r.type === "contribution").reduce((sum, r) => sum + r.amount, 0);
    const totalApprovedAmount = totalDirectAmount + totalContributionAmount;

    return (
      <Layout>
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <button type="button" onClick={() => navigate({ to: "/my-cases" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to My Cases
          </button>

          <section className="rounded-2xl border-2 border-green-200 bg-green-50 dark:bg-green-950/20 p-6 space-y-5">
            {hasApprovedDirect ? (
              <div className="text-center space-y-3">
                <div className="text-5xl">🦸‍♂️</div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">Direct Help Completed</p>
                <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">You are a true Hero!</h1>
                <p className="text-sm text-green-700 dark:text-green-300 max-w-xl mx-auto leading-relaxed">
                  Thank you for completing direct help of <strong>{sym} {totalDirectAmount} {cur}</strong>! 
                  Because of your unwavering generosity and courage, this family's burden has been lifted. 
                  You are an inspiration. We encourage you to continue this beautiful journey—explore new cases and create more smiles. May Allah bless you! 🤲
                </p>
                <Button variant="outline" className="mt-2 border-green-300 text-green-700 hover:bg-green-50" onClick={() => navigate({ to: "/cases" })}>
                  Continue Being a Hero
                </Button>
              </div>
            ) : hasApprovedContribution ? (
              <div className="text-center space-y-3">
                <div className="text-5xl">🌟</div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">Contribution Completed</p>
                <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">Thank you for your contribution!</h1>
                <p className="text-sm text-green-700 dark:text-green-300 max-w-xl mx-auto leading-relaxed">
                  Your generous contribution of <strong>{sym} {totalContributionAmount} {cur}</strong> helped complete this case! 
                  Combined with other heroes, you brought real relief. 
                  We encourage you to keep contributing to future cases. Your small act of kindness creates a massive impact. Keep being a hero! 🤲
                </p>
                <Button variant="outline" className="mt-2 border-green-300 text-green-700 hover:bg-green-50" onClick={() => navigate({ to: "/cases" })}>
                  Find More Cases to Support
                </Button>
              </div>
            ) : isOnlyUnlock ? (
              <div className="text-center space-y-3">
                <div className="text-5xl">💪</div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Encouragement for Heroes</p>
                <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-200">You unlocked this case!</h1>
                <p className="text-sm text-amber-700 dark:text-amber-300 max-w-xl mx-auto leading-relaxed">
                  Your help could not be verified or completed this time, but <strong>don't lose hope!</strong> 
                  Every hero's journey starts with a try. We encourage you to explore new cases and keep striving to make a difference. 
                  Your next opportunity to change a life is waiting for you. Stay determined and become a true Hero! 🤝
                </p>
                <Button variant="outline" className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => navigate({ to: "/cases" })}>
                  Browse More Cases
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <div className="text-4xl">🤲</div>
                <h1 className="text-2xl font-bold text-green-800">Thank you for engaging with this case.</h1>
                <p className="text-sm text-green-700">The case is complete. Check your records below.</p>
              </div>
            )}

            {/* Case summary */}
            <div className="rounded-xl bg-card border border-green-200 p-4 space-y-2">
              <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Case</span><span className="font-semibold text-right">{caseData.title || "Verified case"}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Category</span><span className="font-semibold text-right">{caseData.category || "—"}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Verified help delivered</span><span className="font-bold text-primary">{sym} {amountCollected || totalApprovedAmount} {cur}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Status</span><span className="font-semibold text-green-700">Completed ✓</span></div>
            </div>

            {/* ============================================================ */}
            {/* 🔥 AFFIDAVITS WITH TXN AND RECEIPT - THE FIX IS HERE 🔥 */}
            {/* ============================================================ */}
            {approvedRecords.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-green-800 dark:text-green-200">Your verified help records (Affidavits)</h2>
                {approvedRecords.map((record) => (
                  <div key={record.id} className="rounded-xl bg-card border border-green-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{sym} {record.amount} {cur}</p>
                      <p className="text-xs text-muted-foreground">Type: {record.type === "direct" ? "Direct Help" : "Contribution"}</p>
                      {record.transactionId && record.transactionId !== "N/A" && (
                        <p className="text-xs text-muted-foreground">TXN: <span className="font-mono">{record.transactionId}</span></p>
                      )}
                      {record.receiptUrl && (
                        <a href={record.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> View Receipt
                        </a>
                      )}
                    </div>
                    <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => generateAffidavitFromRecord(caseData, record, seekerKyc, heroName)}>
                      <FileText className="h-3.5 w-3.5" /> View & Download Affidavit
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!hasAnyApproved && myResolutions.length > 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                <p className="text-sm text-amber-700">Your submitted help is under review or was rejected. No affidavit is available until Givethra verifies it.</p>
              </div>
            )}
          </section>
        </main>
      </Layout>
    );
  }

  // ============================================================
  // REJECTED CASE
  // ============================================================
  if (isRejected) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button type="button" onClick={() => navigate({ to: "/my-cases" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="h-4 w-4" /> Back to My Cases
          </button>
          <div className="rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full shrink-0">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-red-800 dark:text-red-300">❌ Case Rejected</h1>
                <p className="text-sm text-red-600 dark:text-red-400">Your case was reviewed and could not be approved.</p>
              </div>
            </div>
            <div className="bg-white dark:bg-red-950/50 rounded-xl border-2 border-red-200 dark:border-red-800 p-6">
              <p className="text-sm font-semibold text-red-500 mb-1">Rejection Reason</p>
              <p className="text-base text-red-900 dark:text-red-200 font-medium whitespace-pre-line">
                {caseData.rejection_reason || "No specific reason provided. Please contact support."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button className="flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white" onClick={() => navigate({ to: "/submit-request" })}><RefreshCw className="h-4 w-4" /> Submit New Case</Button>
              <Button variant="outline" className="flex-1 gap-2 border-red-300 text-red-600" onClick={() => navigate({ to: "/support" })}><AlertCircle className="h-4 w-4" /> Contact Support</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ============================================================
  // EXPIRED CASE
  // ============================================================
  if (isExpired) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button type="button" onClick={() => navigate({ to: "/my-cases" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="h-4 w-4" /> Back to My Cases
          </button>
          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-full shrink-0">
                <CalendarClock className="h-8 w-8 text-amber-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-amber-800">⏰ Case Expired</h1>
                <p className="text-sm text-amber-600">No one helped in time, but you can try again.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-amber-200 p-6">
              <p className="text-sm text-amber-900">Your case remained active until the deadline but no Hero stepped forward. {caseData.was_free ? "Since this was your free case, you can submit a new case for FREE." : "The 1 credit you used has been refunded."}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => navigate({ to: "/submit-request" })}><RefreshCw className="h-4 w-4" /> Submit New Case</Button>
              <Button variant="outline" className="flex-1 gap-2 border-amber-300 text-amber-600" onClick={() => navigate({ to: "/cases" })}><Eye className="h-4 w-4" /> Browse Other Cases</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ============================================================
  // ACTIVE CASE VIEW (for non-completed, non-rejected, non-expired)
  // ============================================================
  const canHelpAgain = unlocked && !isOwner && !isCompleted && !isRejected && !isExpired;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <button type="button" onClick={() => navigate({ to: "/cases" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to cases
        </button>

        {!isCompleted && (
          <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border-2 border-green-400 p-4 text-sm text-green-700 dark:text-green-300 text-center font-medium">
            🎉 Your first <strong>3 helps are FREE</strong>! After that, 1 credit per help.
          </div>
        )}

        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${caseData.status === "approved" ? "bg-green-100 text-green-700" : caseData.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>{caseData.status?.toUpperCase()}</span>
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">{caseData.category}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${caseData.urgency === "Emergency" ? "bg-red-100 text-red-700" : caseData.urgency === "High" ? "bg-orange-100 text-orange-700" : "bg-muted text-muted-foreground"}`}>{caseData.urgency}</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">{caseData.title}</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /> {caseData.city}, {caseData.country}</div>
            </div>
            {!isCompleted && caseData.deadline && (() => {
              const daysLeft = Math.ceil((new Date(caseData.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              if (daysLeft < 0) return null;
              return (
                <div className={`rounded-xl p-3 flex items-center gap-2 ${daysLeft <= 3 ? "bg-red-50 dark:bg-red-950/20 border border-red-300" : "bg-amber-50 dark:bg-amber-950/20 border border-amber-300"}`}>
                  <span className="text-2xl">⏳</span>
                  <div>
                    <p className={`text-sm font-bold ${daysLeft <= 3 ? "text-red-700" : "text-amber-700"}`}>
                      {daysLeft === 0 ? "Expires TODAY!" : daysLeft === 1 ? "Only 1 day left to help!" : `Only ${daysLeft} days left to help!`}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {amountNeeded > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-green-600">{sym} {amountCollected} collected</span>
                <span className="text-muted-foreground">{percentDone}% · {sym} {remaining} left</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${percentDone}%` }} />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Identity Verified</span>
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> KYC Approved</span>
            <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> Givethra Verified</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
              <h2 className="font-semibold text-foreground">Case Story</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{caseData.description}</p>
            </div>

            {!unlocked && !isOwner ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 flex flex-col items-center text-center gap-4">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center"><Lock className="h-6 w-6 text-muted-foreground" /></div>
                <div>
                  <h3 className="font-bold text-foreground">Choose how you want to help</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userUnlockCount < 3 ? `🎉 This is your #${userUnlockCount + 1} unlock — it's FREE! (${3 - userUnlockCount} free remaining)` : `Unlock this case (1 credit) and help.`}
                  </p>
                </div>
                {!isAuthenticated ? (
                  <Button onClick={() => navigate({ to: "/sign-in" })} className="px-8">Sign in to help</Button>
                ) : (
                  <div className="w-full space-y-3">
                    {isSuspended && (
                      <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-700">Account suspended. You cannot help.</div>
                    )}
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                      <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h4 className="font-bold text-sm">Pay the full bill directly</h4></div>
                      <p className="text-xs text-muted-foreground">Pay the full amount {amountNeeded > 0 ? `(${sym} ${amountNeeded} ${cur})` : ""} directly to the institute. (Always 1 credit)</p>
                      <Button onClick={() => handleUnlock("full")} disabled={unlocking || isSuspended} className="w-full gap-2">
                        <Unlock className="h-4 w-4" />
                        {userUnlockCount < 3 ? `FREE (${3 - userUnlockCount} left)` : "1 Credit — Direct Help"}
                      </Button>
                    </div>
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                      <div className="flex items-center gap-2"><HandCoins className="h-5 w-5 text-primary" /><h4 className="font-bold text-sm">Contribute any amount (Fundraising)</h4></div>
                      <p className="text-xs text-muted-foreground">Contribute any amount to Givethra's fundraising. Many help together 🤝</p>
                      {amountNeeded > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <Label className="text-xs">How much? ({cur}) — {sym} {remaining} still needed</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">{sym}</span>
                            <Input type="number" value={pledgeAmount} onChange={(e) => setPledgeAmount(e.target.value)} placeholder={`Up to ${remaining}`} className="pl-12 bg-card" max={remaining} disabled={isSuspended} />
                          </div>
                        </div>
                      )}
                      <Button onClick={() => handleUnlock("partial")} disabled={unlocking || isSuspended} className="w-full gap-2">
                        <Unlock className="h-4 w-4" />
                        {userUnlockCount < 3 ? `FREE (${3 - userUnlockCount} left)` : "1 Credit — Unlock Pool"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {isSuspended && !isOwner && !isCompleted && (
                  <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-700">Account suspended. You can view but cannot help.</div>
                )}

                {!isOwner && !isCompleted && unlockMode === "full" && hasPaymentDetails && (
                  <div className="rounded-2xl bg-card border-2 border-primary/20 p-5 space-y-2">
                    <h2 className="font-semibold flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Institute Payment Details</h2>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-xs text-primary font-medium">Pay the full amount directly to the institute below.</div>
                    <CopyRow label="Institute / Provider" value={caseData.institute_name} />
                    <CopyRow label="Account / Bill Number" value={caseData.account_number} mono />
                    <CopyRow label="IBAN" value={caseData.account_iban} mono />
                    <CopyRow label="Account Title" value={caseData.account_title} />
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 mt-2">⚠️ Pay the institute directly. Keep your receipt — submit it below.</div>
                  </div>
                )}

                {!isOwner && !isCompleted && unlockMode === "partial" && (
                  <div className="rounded-2xl bg-card border-2 border-primary/20 p-5 space-y-2">
                    <h2 className="font-semibold flex items-center gap-2"><HandCoins className="h-5 w-5 text-primary" /> Contribute to Givethra Fundraising</h2>
                    <CopyRow label="NayaPay Title" value={GIVETHRA_NAYAPAY_TITLE} />
                    <CopyRow label="NayaPay IBAN" value={GIVETHRA_NAYAPAY_IBAN} mono />
                    <CopyRow label="Binance USDT (TRC20)" value={GIVETHRA_USDT_TRC20} mono />
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 mt-2">🤝 After sending, submit your receipt below.</div>
                  </div>
                )}

                {canHelpAgain && (
                  <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
                    <h2 className="font-semibold">🤝 {myResolutions.length > 0 ? "Help Again" : (unlockMode === "partial" ? "Submit Your Contribution Proof" : "Resolve This Case")}</h2>
                    {myResolutions.length > 0 && <p className="text-xs text-muted-foreground">You can help this case as many times as you like until it's complete. {sym} {remaining} still needed.</p>}
                    {!showResolution ? (
                      <Button onClick={() => setShowResolution(true)} className="w-full gap-2"><Heart className="h-4 w-4" /> {myResolutions.length > 0 ? "Add More Help" : (unlockMode === "partial" ? "I Contributed — Submit Proof" : "I Helped — Submit Proof")}</Button>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>{unlockMode === "partial" ? "Contribution Type *" : "Resolution Type *"}</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {(unlockMode === "partial" ? ["Contribution", "Partial Help", "Other"] : ["Bill Paid", "School Fee Paid", "Hospital Paid", "Bank Transfer", "Food Delivered", "Other"]).map(t => (
                              <button key={t} type="button" onClick={() => setResType(t)} className={`px-3 py-2 rounded-lg border text-xs font-medium text-left ${resType === t ? "bg-primary text-white border-primary" : "border-border"}`}>{t}</button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2"><Label>Amount ({cur})</Label><Input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder={`e.g. ${remaining || 500}`} /></div>
                        <div className="space-y-2"><Label>Transaction ID *</Label><Input value={txId} onChange={e => setTxId(e.target.value)} placeholder="TXN123456789" /></div>
                        <div className="space-y-2">
                          <Label>Upload Receipt</Label>
                          <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0] ?? null; setReceiptFile(f); setReceiptName(f?.name ?? ""); }} className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm" />
                          {receiptName && <p className="text-xs text-green-600">✓ {receiptName}</p>}
                        </div>
                        <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any details..." /></div>
                        <div className="flex gap-2">
                          <Button className="flex-1" onClick={handleSubmitResolution} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
                          <Button variant="outline" onClick={() => setShowResolution(false)}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!isOwner && myResolutions.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                    <h2 className="font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> My Help on this case ({myResolutions.length})</h2>
                    {myResolutions.map((r: any) => {
                      const isVerified = isApprovedCompletedResolution(r);
                      return (
                        <div key={r.id} className="rounded-xl border border-border p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isVerified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                              {isVerified ? "VERIFIED ✓" : "PENDING / REJECTED"}
                            </span>
                            <span className="text-sm font-bold text-primary">{sym} {r.seeker_confirmed_amount ?? r.amount_paid} {cur}</span>
                          </div>
                          {isVerified ? (
                            <Button size="sm" variant="outline" className="w-full gap-2 border-green-300 text-green-700" onClick={() => {
                              const record = { type: isContributionResolution(r) ? "contribution" : "direct", amount: r.seeker_confirmed_amount ?? r.amount_paid, transactionId: r.transaction_id, receiptUrl: r.receipt_url, resolution: r, isApproved: true };
                              generateAffidavitFromRecord(caseData, record, seekerKyc, r.hero_name || heroName);
                            }}><FileText className="h-3.5 w-3.5" /> View & Download Affidavit</Button>
                          ) : (
                            <p className="text-xs text-muted-foreground">This help is pending verification or was rejected. No affidavit is available yet.</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {isOwner && !isCompleted && (
                  <OwnerResolutions caseId={id} caseData={caseData} seekerKyc={seekerKyc} onConfirm={handleSeekerConfirm} onDispute={handleSeekerDispute} sym={sym} cur={cur} />
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="font-semibold">Case Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span className="font-medium">{caseData.category}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Urgency</span><span className="font-medium">{caseData.urgency}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium capitalize">{caseData.status}</span></div>
                {caseData.deadline && <div className="flex justify-between"><span className="text-muted-foreground">Deadline</span><span className="font-medium">{new Date(caseData.deadline).toLocaleDateString()}</span></div>}
                {amountNeeded > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-bold text-primary">{sym} {amountNeeded} {cur}</span></div>}
                {amountNeeded > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Collected</span><span className="font-bold text-green-600">{sym} {amountCollected} ({percentDone}%)</span></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function OwnerResolutions({ caseId, caseData, seekerKyc, onConfirm, onDispute, sym, cur }: any) {
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmAmount, setConfirmAmount] = useState("");

  useEffect(() => {
    getCaseResolutions(caseId)
      .then((data) => {
        setResolutions((data ?? []).slice().reverse());
      })
      .catch(() => {});
  }, [caseId]);

  const visible = resolutions.filter((r) => !isContributionResolution(r));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-4">
      {visible.map((res) => (
        <div key={res.id} className="rounded-2xl bg-card border-2 border-primary/30 p-5 space-y-4">
          {res.status === "pending_confirmation" ? (
            <>
              <h2 className="font-semibold text-primary">✅ A Hero Claims They Helped You</h2>
              <div className="text-sm space-y-2">
                <p><span className="text-muted-foreground">Type:</span> <span className="font-medium">{res.resolution_type}</span></p>
                <p><span className="text-muted-foreground">Hero says they paid:</span> <span className="font-medium">{sym} {res.amount_paid} {cur}</span></p>
                <p><span className="text-muted-foreground">TXN ID:</span> <span className="font-mono font-medium">{res.transaction_id}</span></p>
                {res.notes && <p><span className="text-muted-foreground">Notes:</span> {res.notes}</p>}
                {res.receipt_url && <a href={res.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-xs"><ExternalLink className="h-3 w-3" /> View Receipt</a>}
              </div>
              {confirmingId === res.id ? (
                <div className="space-y-3 rounded-xl bg-primary/5 border border-primary/20 p-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">How much help did you actually receive? ({cur})</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">{sym}</span>
                      <Input type="number" value={confirmAmount} onChange={(e) => setConfirmAmount(e.target.value)} placeholder={String(res.amount_paid ?? "")} className="pl-12" />
                    </div>
                    <button type="button" onClick={() => setConfirmAmount(String(res.amount_paid ?? ""))} className="text-xs px-2 py-1 rounded-lg border border-border hover:border-primary">Same as Hero ({sym}{res.amount_paid})</button>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { const amt = parseFloat(confirmAmount); if (!amt || amt <= 0) return; onConfirm(amt, res); setConfirmingId(null); }}><CheckCircle2 className="h-4 w-4 mr-2" /> Confirm</Button>
                    <Button variant="outline" onClick={() => setConfirmingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { setConfirmingId(res.id); setConfirmAmount(String(res.amount_paid ?? "")); }}><CheckCircle2 className="h-4 w-4 mr-2" /> Confirm Help</Button>
                  <Button variant="outline" className="flex-1 text-red-600 border-red-300" onClick={() => onDispute(res)}>Dispute</Button>
                </div>
              )}
            </>
          ) : res.status === "seeker_confirmed" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600"><Clock className="h-5 w-5" /><h2 className="font-bold">Confirmed — Under Verification</h2></div>
              <p className="text-sm text-muted-foreground">You confirmed receiving {sym} {res.seeker_confirmed_amount ?? res.amount_paid} {cur}. Givethra is verifying this help.</p>
            </div>
          ) : isApprovedCompletedResolution(res) ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-700"><CheckCircle2 className="h-5 w-5" /><h2 className="font-bold">Help Confirmed</h2></div>
              <p className="text-sm text-muted-foreground">{sym} {res.seeker_confirmed_amount ?? res.amount_paid} {cur} — {res.resolution_type}</p>
              <Button size="sm" variant="outline" className="w-full gap-2 border-green-300 text-green-700" onClick={() => {
                const record = { type: "direct", amount: res.seeker_confirmed_amount ?? res.amount_paid, transactionId: res.transaction_id, receiptUrl: res.receipt_url, resolution: res, isApproved: true };
                generateAffidavitFromRecord(caseData, record, seekerKyc, res.hero_name || "Verified Hero");
              }}><FileText className="h-3.5 w-3.5" /> Download Seeker Affidavit</Button>
            </div>
          ) : res.status === "disputed" ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600"><h2 className="font-bold">⚠️ Disputed</h2></div>
              <p className="text-sm text-muted-foreground">You marked this as disputed. Givethra will investigate.</p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
