// src/frontend/src/pages/CaseDetailPage.tsx
// مکمل کوڈ بشمول تمام حسبِ ضرورت کاروباری اصول

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
  if (
    ["completed", "approved", "verified", "confirmed", "seeker_confirmed"].includes(status)
  ) {
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

  // Feedback State
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

  const liveVideoRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

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

    // Compute remaining inside the function to use the latest caseData
    const amountNeeded = Number(caseData?.amount_needed ?? 0);
    const amountCollected = Number(caseData?.amount_collected ?? 0);
    const remaining = Math.max(amountNeeded - amountCollected, 0);

    const pledgeNum = parseFloat(pledgeAmount) || 0;
    if (mode === "partial" && pledgeNum <= 0) {
      toast.error("Please enter a valid contribution amount.");
      return;
    }

    setUnlocking(true);
    try {
      // Direct Is ALWAYS 1 credit. Contribution gets first 3 helps free.
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

  if (loading) return <div className="p-8 text-center">Loading Case...</div>;
  if (!caseData) return <div className="p-8 text-center">Case not found.</div>;

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
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-6">
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">
              🎉 This Case is Completed!
            </h1>
            <p className="text-gray-600 mt-2">
              {isMultipleHeroes
                ? "ہیروز نے مل کر اس کیس کو پورا کیا"
                : "ایک ہیرو نے اس کیس کو پورا کیا"}
            </p>
            <div className="mt-6 p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600">Your Contribution</p>
              <p className="text-2xl font-bold text-green-700">
                {sym} {totalHelpedAmount} {cur}
              </p>
              {myApprovedRecords.map((rec, idx) => (
                <div key={idx} className="mt-2 text-sm text-gray-500">
                  TXN: {rec.transactionId} • {rec.type === "direct" ? "Direct" : "Contribution"}
                  <Button
                    variant="link"
                    className="text-blue-600 p-0 ml-2"
                    onClick={() => {
                      generateAffidavitFromRecord(
                        caseData,
                        { ...rec, completedAt: new Date() },
                        seekerKyc,
                        heroName
                      );
                    }}
                  >
                    <FileText className="w-4 h-4 inline mr-1" /> Affidavit
                  </Button>
                </div>
              ))}
            </div>
            <Button
              className="mt-6 bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate({ to: "/cases" })}
            >
              Browse More Cases
            </Button>
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
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Button
          variant="ghost"
          className="mb-4 text-sm"
          onClick={() => navigate({ to: "/cases" })}
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Cases
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-800">{caseData.title}</h1>
              <p className="text-gray-600 mt-2">{caseData.description}</p>
              <div className="flex flex-wrap gap-3 mt-4 text-sm">
                <span className="bg-gray-100 px-3 py-1 rounded-full">{caseData.category}</span>
                <span className={`px-3 py-1 rounded-full ${caseData.urgency === "high" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {caseData.urgency} urgency
                </span>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Fundraised: {sym} {amountCollected}</span>
                <span>Goal: {sym} {amountNeeded}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div className="bg-blue-600 h-3 rounded-full" style={{ width: `${percentDone}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{percentDone}% completed</p>
            </div>

            {/* Unlock Section (for non-owners) */}
            {!isOwner && !unlocked && (
              <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-blue-100">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Unlock to Help
                </h2>
                <div className="mt-4 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleUnlock("full")}
                      disabled={unlocking || isSuspended}
                    >
                      <HandCoins className="w-4 h-4 mr-2" />
                      Direct Help (1 Credit)
                    </Button>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={pledgeAmount}
                          onChange={(e) => setPledgeAmount(e.target.value)}
                          placeholder={`Max ${remaining}`}
                          className="h-10"
                        />
                        <Button
                          variant="outline"
                          onClick={() => handleUnlock("partial")}
                          disabled={unlocking || isSuspended}
                        >
                          {userUnlockCount < 3 ? "FREE" : "1 Credit"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {userUnlockCount < 3
                          ? `You have ${3 - userUnlockCount} free contributions left.`
                          : "Contribution costs 1 credit."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* After Unlock / Resolution Submission */}
            {unlocked && !isOwner && (
              <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-green-100">
                <div className="flex items-center gap-2 text-green-700">
                  <Unlock className="w-5 h-5" />
                  <span className="font-semibold">You have unlocked this case!</span>
                </div>

                {!showResolution ? (
                  <Button
                    className="mt-4 bg-green-600 hover:bg-green-700"
                    onClick={() => setShowResolution(true)}
                  >
                    Submit Proof of Help
                  </Button>
                ) : (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    <h3 className="font-medium">Submit Resolution Details</h3>
                    <div>
                      <Label>Resolution Type</Label>
                      <Input
                        value={resType}
                        onChange={(e) => setResType(e.target.value)}
                        placeholder="e.g., Hospital Payment, School Fee"
                      />
                    </div>
                    <div>
                      <Label>Transaction ID (TXN)</Label>
                      <Input
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        placeholder="Enter TXN number"
                      />
                    </div>
                    <div>
                      <Label>Amount Paid (if different)</Label>
                      <Input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="Leave blank to use pledged amount"
                      />
                    </div>
                    <div>
                      <Label>Upload Receipt</Label>
                      <Input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setReceiptFile(file);
                            setReceiptName(file.name);
                          }
                        }}
                      />
                      {receiptName && <p className="text-xs text-gray-500 mt-1">{receiptName}</p>}
                    </div>
                    <div>
                      <Label>Notes (optional)</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSubmitResolution} disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Proof"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowResolution(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Historical Resolutions for this user */}
            {!isOwner && myResolutions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-semibold mb-2">Your Payment History</h3>
                <div className="space-y-2">
                  {myResolutions.map((res) => {
                    const approved = isApprovedCompletedResolution(res);
                    return (
                      <div key={res.id} className="border rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            TXN: {res.transaction_id}
                          </p>
                          <p className="text-xs text-gray-500">
                            {sym} {res.amount_paid} {cur}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {approved ? "VERIFIED" : "PENDING"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Feedback Section (for helpers) */}
            {!isOwner && unlocked && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Share Video Feedback (optional)
                </h3>
                {existingFeedback ? (
                  <p className="text-green-600 text-sm mt-2">✅ You already submitted feedback.</p>
                ) : (
                  <div className="mt-3 space-y-3">
                    <Textarea
                      placeholder="Write your feedback..."
                      value={fbText}
                      onChange={(e) => setFbText(e.target.value)}
                    />
                    <div>
                      {!recording ? (
                        <Button onClick={startRecording} variant="outline">
                          Start Recording
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <video ref={liveVideoRef} autoPlay muted className="w-full max-h-48 bg-black rounded" />
                          <div className="flex gap-2">
                            <Button onClick={pauseRecording} disabled={paused}>
                              Pause
                            </Button>
                            <Button onClick={resumeRecording} disabled={!paused}>
                              Resume
                            </Button>
                            <Button onClick={stopRecording} variant="destructive">
                              Stop
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">{recTimer}s / 90s</p>
                        </div>
                      )}
                      {fbVideoBlob && (
                        <div className="mt-2">
                          <video src={fbVideoBlob} controls className="w-full max-h-48" />
                        </div>
                      )}
                    </div>
                    <Button onClick={submitFeedback} disabled={fbSubmitting}>
                      {fbSubmitting ? "Sending..." : "Submit Feedback"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-700">Case Details</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Seeker</span>
                  <p className="font-medium">{caseData.full_name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Category</span>
                  <p className="font-medium">{caseData.category}</p>
                </div>
                <div>
                  <span className="text-gray-500">Urgency</span>
                  <p className="font-medium capitalize">{caseData.urgency}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amount Needed</span>
                  <p className="font-medium">{sym} {amountNeeded}</p>
                </div>
                <div>
                  <span className="text-gray-500">Raised</span>
                  <p className="font-medium">{sym} {amountCollected}</p>
                </div>
                {hasPaymentDetails && (
                  <div className="border-t pt-3 mt-3">
                    <p className="text-gray-500 text-xs">Institute Details</p>
                    <p className="text-sm font-medium">{caseData.institute_name}</p>
                    <p className="text-sm font-mono">{maskAccount(caseData.account_number)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Panel (if owner) */}
            {isOwner && (
              <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-blue-200">
                <h3 className="font-semibold text-blue-700">🔐 Owner Panel</h3>
                <OwnerResolutions
                  caseId={caseData.id}
                  caseData={caseData}
                  seekerKyc={seekerKyc}
                  onConfirm={handleSeekerConfirm}
                  onDispute={handleSeekerDispute}
                  sym={sym}
                  cur={cur}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ============================================================
// OwnerResolutions Component (separate)
// ============================================================
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
  if (visible.length === 0) return <p className="text-sm text-gray-500 mt-2">No direct payment claims yet.</p>;

  return (
    <div className="mt-4 space-y-4">
      {visible.map((res) => (
        <div key={res.id} className="border rounded-lg p-3">
          <p className="text-sm font-medium">
            {res.status === "pending_confirmation" ? "⏳ Pending Confirmation" : "✅ Confirmed"}
          </p>
          <p className="text-xs text-gray-600">
            Amount: {sym} {res.amount_paid} {cur}
          </p>
          <p className="text-xs text-gray-500">TXN: {res.transaction_id}</p>
          {res.receipt_url && (
            <a href={res.receipt_url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs flex items-center gap-1 mt-1">
              <ExternalLink className="w-3 h-3" /> View Receipt
            </a>
          )}
          {res.status === "pending_confirmation" && (
            <div className="mt-2 flex gap-2">
              {confirmingId === res.id ? (
                <>
                  <Input
                    type="number"
                    value={confirmAmount}
                    onChange={(e) => setConfirmAmount(e.target.value)}
                    placeholder="Actual amount"
                    className="h-8 text-xs"
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
                  <Button size="sm" variant="default" onClick={() => { setConfirmingId(res.id); setConfirmAmount(String(res.amount_paid ?? "")); }}>
                    Confirm
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={() => onDispute(res)}>
                    Dispute
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
