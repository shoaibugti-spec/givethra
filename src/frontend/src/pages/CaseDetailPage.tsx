// src/frontend/src/pages/CaseDetailPage.tsx
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
  Building2,
  Clock,
  HandCoins,
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  PKR: "Rs",
  SAR: "SAR",
  AED: "AED",
  GBP: "£",
  EUR: "€",
  INR: "₹",
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

function isApprovedCompletedResolution(resolution: any): boolean {
  if (!resolution) return false;
  const status = String(resolution?.status || "").trim().toLowerCase();
  if (["completed", "approved", "verified", "confirmed", "seeker_confirmed"].includes(status)) {
    return true;
  }
  return [1, true, "1", "true", "yes"].includes(resolution?.admin_confirmed);
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

export default function CaseDetailPage() {
  const { id } = useParams({ from: "/cases/$id" });
  const navigate = useNavigate();
  const { user, userId, isAuthenticated } = useAuth();
  const durableUserId = String(userId || user?.id || "");

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
  const [allResolutionsForCase, setAllResolutionsForCase] = useState<any[]>([]);
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
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [userUnlockCount, setUserUnlockCount] = useState(0);

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
        const resolutions = Array.isArray(res) ? res : [];
        setAllResolutionsForCase(resolutions);
        const mine = resolutions.filter((r) => String(r.hero_id) === durableUserId);
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

  async function handleUnlock(mode: "full" | "partial") {
    if (!user) {
      navigate({ to: "/sign-in" });
      return;
    }
    if (isSuspended) {
      toast.error("Your account is suspended.");
      return;
    }
    const remaining = Math.max(
      Number(caseData?.amount_needed || 0) - Number(caseData?.amount_collected || 0),
      0
    );
    const pledgeNum = parseFloat(pledgeAmount) || 0;
    if (mode === "partial" && pledgeNum <= 0) {
      toast.error("Please enter a valid contribution amount.");
      return;
    }
    setUnlocking(true);
    try {
      // Direct is ALWAYS 1 credit. Contribution gets first 3 helps free.
      const isFreeContribution = mode === "partial" && userUnlockCount < 3;
      const charge = isFreeContribution ? 0 : 1;
      await insertCaseUnlock({
        case_id: id,
        hero_id: user.id,
        pledged_amount: mode === "partial" ? pledgeNum : remaining,
        credits_charged: charge,
        payment_type: mode,
      });
      if (mode === "partial") setAmountPaid(String(pledgeNum));
      else setAmountPaid(String(remaining));
      setUnlocked(true);
      setPayMode(mode);
      if (isFreeContribution) {
        toast.success(`🎉 Case unlocked FREE! This is your free Contribution #${userUnlockCount + 1}.`);
      } else {
        toast.success(mode === "full" ? "Direct help unlocked! 1 credit deducted." : "Contribution unlocked! 1 credit deducted.");
      }
      loadCase();
    } catch (err: any) {
      toast.error("Failed to unlock case: " + err.message);
    } finally {
      setUnlocking(false);
    }
  }

  async function handleSubmitResolution() {
    if (isSuspended) return;
    if (!resType || !txId) {
      toast.error("Please select a type and enter Transaction ID");
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
      toast.success("Help verification proof submitted successfully!");
      setShowResolution(false);
      setTxId("");
      setNotes("");
      setReceiptFile(null);
      setReceiptName("");
      loadCase();
    } catch (err) {
      toast.error("Error submitting proof.");
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
      toast.success("Help confirmed successfully!");
      loadCase();
    } catch {
      toast.error("Failed to confirm.");
    }
  }

  async function handleSeekerDispute(res: any) {
    try {
      await updateCaseResolution(res.id, { seeker_confirmed: false, status: "disputed" });
      toast.success("Marked as disputed.");
      loadCase();
    } catch {
      toast.error("Failed to dispute.");
    }
  }

  async function submitFeedback() {
    if (!fbText.trim() || !fbVideoFile) {
      toast.error("Write a message and record/upload a video appeal response.");
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
      toast.success("Thank you! Feedback submitted for review.");
      checkExistingFeedback();
    } catch {
      toast.error("Failed to post feedback.");
    } finally {
      setFbSubmitting(false);
    }
  }

  if (loading) return <div className="p-10 text-center">Loading Case...</div>;
  if (!caseData) return <div className="p-10 text-center">Case not found.</div>;

  const cur = caseData?.currency || "USD";
  const sym = CURRENCY_SYMBOLS[cur] ?? cur;
  const amountNeeded = Number(caseData?.amount_needed ?? 0);
  const amountCollected = Number(caseData?.amount_collected ?? 0);
  const remaining = Math.max(amountNeeded - amountCollected, 0);
  const percentDone = amountNeeded > 0 ? Math.min(Math.round((amountCollected / amountNeeded) * 100), 100) : 0;
  const isOwner = user?.id === caseData?.user_id;
  const isCompleted = String(caseData?.status || "").toLowerCase() === "completed";
  const hasPaymentDetails = caseData?.institute_name || caseData?.account_number;
  const unlockMode = myUnlock?.payment_type || payMode;

  // Process approved records for this user to render historical affidavits
  const myApprovedRecords = myResolutions
    .filter((r) => isApprovedCompletedResolution(r))
    .map((r) => ({
      id: r.id,
      type: isContributionResolution(r) ? "contribution" : "direct",
      amount: Number(r.seeker_confirmed_amount ?? r.amount_paid ?? 0),
      transactionId: r.transaction_id,
      receiptUrl: r.receipt_url,
      resolution: r,
      completedAt: r.completed_at || r.admin_confirmed_at,
    }));

  const totalApprovedResolutionsCount = allResolutionsForCase.filter((r) =>
    isApprovedCompletedResolution(r)
  ).length;
  const isMultipleHeroes = totalApprovedResolutionsCount > 1;

  // ============================================================
  // COMPLETED VIEW SCREEN (Helper Path)
  // ============================================================
  if (isCompleted && !isOwner) {
    const totalHelpedAmount = myApprovedRecords.reduce((sum, r) => sum + r.amount, 0);
    const hasDirectRecord = myApprovedRecords.some((r) => r.type === "direct");
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          <Button variant="ghost" className="gap-1" onClick={() => navigate({ to: "/cases" })}>
            <ChevronLeft className="h-4 w-4" /> Back to Cases
          </Button>
          <div className="bg-white rounded-xl shadow-lg border p-6 space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <h1 className="text-2xl font-bold">Case Completed ✓</h1>
                <p className="text-sm text-gray-500">
                  This case has been successfully resolved.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">Case Title</p>
                <p className="font-semibold">{caseData.title}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">Total Amount Helped</p>
                <p className="font-semibold">{sym} {totalHelpedAmount} {cur}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">Your Help Type</p>
                <p className="font-semibold">{hasDirectRecord ? "Direct Payment" : "Contribution (Fundraising)"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500">Completed On</p>
                <p className="font-semibold">{new Date(caseData.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
            {/* Affidavit Button for Approved Records */}
            {myApprovedRecords.length > 0 && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium">Your Official Audit Documents</p>
                {myApprovedRecords.map((rec, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      const seekerKycData = seekerKyc || {};
                      generateAffidavitFromRecord(
                        caseData,
                        { ...rec, type: rec.type },
                        seekerKycData,
                        heroName
                      );
                    }}
                  >
                    <FileText className="h-4 w-4" />
                    {rec.type === "direct" ? "Direct Help" : "Contribution"} - {sym}{rec.amount} {cur} (TXN: {rec.transactionId})
                  </Button>
                ))}
                <p className="text-xs text-center text-muted-foreground pt-2">
                  {isMultipleHeroes ? "Heroes joined together" : "A single hero"} completed this case.
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={() => navigate({ to: "/cases" })} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                Browse More Cases
              </Button>
              <Button variant="outline" onClick={() => navigate({ to: "/my-cases" })} className="w-full sm:w-auto">
                View My Cases
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ============================================================
  // NORMAL FLOW RENDERING
  // ============================================================
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
        <Button variant="ghost" className="gap-1 mb-4" onClick={() => navigate({ to: "/cases" })}>
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Header */}
            <div className="bg-white rounded-xl shadow border p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    {caseData.category}
                  </span>
                  <h1 className="text-2xl font-bold mt-2">{caseData.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {caseData.city}, {caseData.country}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Urgency</span>
                  <p className="font-medium">{caseData.urgency || "Standard"}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded-full">📅 {new Date(caseData.submitted_at).toLocaleDateString()}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">🎯 Target: {sym}{amountNeeded} {cur}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">💰 Raised: {sym}{amountCollected} {cur}</span>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percentDone}%` }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">{percentDone}% funded</p>
              </div>
              {!isOwner && !unlocked && (
                <div className="mt-6 border-t pt-4">
                  {isSuspended ? (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="text-red-600">Your account is suspended. You cannot unlock this case.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
                          onClick={() => handleUnlock("full")}
                          disabled={unlocking}
                        >
                          <Unlock className="h-4 w-4" /> Direct Help (1 Credit)
                        </Button>
                        <div className="flex-1 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={pledgeAmount}
                              onChange={(e) => setPledgeAmount(e.target.value)}
                              placeholder={`Max ${remaining}`}
                              className="h-9"
                            />
                            <span className="text-sm whitespace-nowrap">{cur}</span>
                          </div>
                          <Button
                            className="w-full bg-green-600 hover:bg-green-700 gap-2"
                            onClick={() => handleUnlock("partial")}
                            disabled={unlocking || isSuspended}
                          >
                            {userUnlockCount < 3 ? "🎉 FREE Contribution Unlock" : "1 Credit — Unlock Pool"}
                          </Button>
                        </div>
                      </div>
                      {userUnlockCount < 3 && (
                        <p className="text-xs text-green-600">✨ This is your {userUnlockCount + 1}st free contribution. You have {3 - (userUnlockCount + 1)} free unlocks left.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{caseData.description}</p>
            </div>

            {/* Payment Details (if owner) */}
            {isOwner && hasPaymentDetails && (
              <div className="bg-white rounded-xl shadow border p-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" /> Institute Payment Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {caseData.institute_name && (
                    <div>
                      <p className="text-xs text-gray-500">Institute Name</p>
                      <p className="font-medium">{caseData.institute_name}</p>
                    </div>
                  )}
                  {caseData.account_title && (
                    <div>
                      <p className="text-xs text-gray-500">Account Title</p>
                      <p className="font-medium">{caseData.account_title}</p>
                    </div>
                  )}
                  {caseData.account_number && (
                    <div>
                      <p className="text-xs text-gray-500">Account Number</p>
                      <p className="font-medium">{maskAccount(caseData.account_number)}</p>
                    </div>
                  )}
                  {caseData.account_iban && (
                    <div>
                      <p className="text-xs text-gray-500">IBAN</p>
                      <p className="font-medium">{maskAccount(caseData.account_iban)}</p>
                    </div>
                  )}
                  {caseData.payment_method && (
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="font-medium">{caseData.payment_method}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* My Resolutions History (for helpers) */}
            {!isOwner && myResolutions.length > 0 && (
              <div className="bg-white rounded-xl shadow border p-6">
                <h2 className="text-lg font-semibold">Your Contribution History ({myResolutions.length})</h2>
                <div className="space-y-3 mt-3">
                  {myResolutions.map((res) => {
                    const approved = isApprovedCompletedResolution(res);
                    return (
                      <div key={res.id} className="border rounded-lg p-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">
                            {isContributionResolution(res) ? "Contribution" : "Direct"} - {sym}{res.amount_paid} {cur}
                          </p>
                          <p className="text-xs text-gray-500">TXN: {res.transaction_id}</p>
                          <p className="text-xs text-gray-500">Status: {res.status}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {approved ? "VERIFIED" : "PENDING AUDIT"}
                        </span>
                        {approved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const seekerKycData = seekerKyc || {};
                              generateAffidavitFromRecord(
                                caseData,
                                {
                                  type: isContributionResolution(res) ? "contribution" : "direct",
                                  amount: res.seeker_confirmed_amount ?? res.amount_paid,
                                  transactionId: res.transaction_id,
                                  receiptUrl: res.receipt_url,
                                  resolution: res,
                                  completedAt: res.completed_at || res.admin_confirmed_at,
                                },
                                seekerKycData,
                                heroName
                              );
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" /> View Affidavit
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Case Info */}
            <div className="bg-white rounded-xl shadow border p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Case Info</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium capitalize">{caseData.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Urgency</span>
                  <span className="font-medium">{caseData.urgency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Needed</span>
                  <span className="font-medium">{sym}{amountNeeded} {cur}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Collected</span>
                  <span className="font-medium">{sym}{amountCollected} {cur}</span>
                </div>
              </div>
            </div>

            {/* Seeker Info */}
            <div className="bg-white rounded-xl shadow border p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Help Seeker</h3>
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-medium">{seekerKyc?.full_name || caseData.full_name || "Anonymous"}</p>
                {seekerKyc?.cnic_number && (
                  <p className="text-gray-500">CNIC: {maskCnic(seekerKyc.cnic_number)}</p>
                )}
                {seekerKyc?.address && <p className="text-gray-500">{seekerKyc.address}</p>}
              </div>
            </div>

            {/* Owner Controls */}
            {isOwner && (
              <div className="bg-white rounded-xl shadow border p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Owner Panel</h3>
                <div className="mt-4">
                  <OwnerResolutions
                    caseId={id}
                    caseData={caseData}
                    seekerKyc={seekerKyc}
                    onConfirm={handleSeekerConfirm}
                    onDispute={handleSeekerDispute}
                    sym={sym}
                    cur={cur}
                  />
                </div>
              </div>
            )}
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
      <h4 className="font-medium">Claims Received</h4>
      {visible.map((res) => (
        <div key={res.id} className="border rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium">Amount: {sym}{res.amount_paid} {cur}</p>
              <p className="text-xs text-gray-500">TXN: {res.transaction_id}</p>
              {res.receipt_url && (
                <a
                  href={res.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-xs flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> Open Receipt
                </a>
              )}
            </div>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{res.status}</span>
          </div>
          {res.status === "pending_confirmation" ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {confirmingId === res.id ? (
                <>
                  <Input
                    type="number"
                    value={confirmAmount}
                    onChange={(e) => setConfirmAmount(e.target.value)}
                    placeholder={`Amount (${cur})`}
                    className="h-8 w-32 text-sm"
                  />
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      const val = parseFloat(confirmAmount);
                      if (!val || val <= 0) return;
                      onConfirm(val, res);
                      setConfirmingId(null);
                    }}
                  >
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirmingId(null)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setConfirmingId(res.id);
                      setConfirmAmount(String(res.amount_paid ?? ""));
                    }}
                  >
                    Confirm Help
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 border-red-200" onClick={() => onDispute(res)}>
                    Dispute
                  </Button>
                </>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Status: {res.status.replace("_", " ")}</p>
          )}
        </div>
      ))}
    </div>
  );
}
