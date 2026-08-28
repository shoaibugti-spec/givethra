// src/frontend/src/pages/CaseDetailPage.tsx
// Replaces Supabase with Cloudflare Worker APIs

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
  getWallet,
  getUserSuspension,
  updateWalletBalance,
  uploadFileToStorage,
} from "@/lib/api";
import { sendNotification } from "@/lib/notify";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ChevronLeft, Lock, Unlock, MapPin, CheckCircle2,
  Heart, FileText, ExternalLink, Copy, Building2, Clock, HandCoins, Star, Video, AlertCircle, XCircle, RefreshCw, Eye, CalendarClock,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹",
  TRY: "₺", BDT: "৳", EGP: "E£", NGN: "₦", KES: "KSh", ZAR: "R", BRL: "R$",
  CAD: "C$", AUD: "A$", JPY: "¥", CNY: "¥", KRW: "₩", IDR: "Rp", MYR: "RM",
  THB: "฿", PHP: "₱", VND: "₫", SGD: "S$", AFN: "؋", NPR: "Rs", LKR: "Rs",
  QAR: "QAR", KWD: "KWD", BHD: "BHD", OMR: "OMR", JOD: "JOD", MAD: "MAD",
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
  if (d.length <= 3) return d;
  const last = d.slice(-3);
  return `${"*".repeat(Math.max(d.length - 3, 1))}${last}`;
}

function copyToClipboard(text: string, label: string) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied!`),
    () => toast.error("Copy failed")
  );
}

function isApprovedCompletedResolution(resolution: any): boolean {
  const status = String(resolution?.status || "").trim().toLowerCase();
  const adminConfirmed = [1, true, "1", "true", "yes"].includes(resolution?.admin_confirmed);
  const hasApprovalEvidence = Boolean(
    resolution?.admin_approved_at ||
    resolution?.approved_at ||
    resolution?.verified_at ||
    resolution?.completed_at
  );
  const approvedStatus = ["approved", "completed", "verified", "confirmed"].includes(status);
  const excludedStatus = ["rejected", "failed", "cancelled", "canceled", "pending", "dispatched"].includes(status);
  return approvedStatus && !excludedStatus && (adminConfirmed || hasApprovalEvidence);
}

function isContributionResolution(resolution: any): boolean {
  const marker = String(resolution?.paid_to ?? resolution?.paidTo ?? resolution?.payment_type ?? resolution?.paymentType ?? "").trim().toLowerCase();
  return ["givethra", "contribution", "fundraising", "partial"].includes(marker);
}

function generateAffidavit(caseData: any, resolution: any, seekerKyc: any, heroName: string) {
  const caseId = (caseData.id ?? "").slice(0, 8).toUpperCase();
  const today = new Date().toLocaleDateString();
  const seekerName = seekerKyc?.full_name || caseData.full_name || "Verified Help Seeker";
  const seekerCnic = maskCnic(seekerKyc?.cnic_number);
  const heroCnic = maskCnic(resolution?.hero_cnic_number);
  const completedDate = resolution?.completed_at ? new Date(resolution.completed_at).toLocaleDateString() : today;
  const verifyCode = `GVT-${caseId}-${Date.now().toString(36).toUpperCase()}`;
  const cur = caseData.currency || "USD";
  const sym = CURRENCY_SYMBOLS[cur] ?? cur;
  const paidAmount = resolution?.seeker_confirmed_amount ?? resolution?.amount_paid;
  const isFundraising = isContributionResolution(resolution);

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Givethra Affidavit - ${caseId}</title>
<style>
body{font-family:Georgia,serif;max-width:800px;margin:0 auto;padding:40px;color:#1a1a1a;line-height:1.7}
.header{text-align:center;border-bottom:3px solid #03707B;padding-bottom:20px;margin-bottom:25px}
.logo{width:54px;height:54px;background:#03707B;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:bold}
h1{color:#03707B;font-size:24px;margin:12px 0 4px;letter-spacing:1px}
.subtitle{color:#666;font-size:13px}
.seal{display:inline-block;border:2px solid #03707B;border-radius:30px;padding:6px 16px;color:#03707B;font-size:11px;font-weight:bold;margin-top:10px;letter-spacing:.5px}
.intro{font-size:13.5px;text-align:justify;margin:18px 0}
.section{margin:22px 0}
.section h2{font-size:14px;color:#03707B;border-bottom:1px solid #ddd;padding-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.row{display:flex;justify-content:space-between;padding:5px 0;font-size:13.5px;border-bottom:1px dotted #eee}
.row .label{color:#666}
.row .value{font-weight:bold;text-align:right}
.note{background:#f0f9fa;border-left:4px solid #03707B;padding:10px 14px;margin:14px 0;font-size:12px;color:#444}
.declaration{background:#f7f7f7;border-left:4px solid #999;padding:12px 15px;margin:12px 0;font-size:12.5px;font-style:italic}
.signatures{display:flex;justify-content:space-between;margin-top:45px}
.sig-box{width:45%;text-align:center}
.sig-line{border-top:2px solid #333;margin-top:40px;padding-top:8px;font-size:12.5px;font-weight:bold}
.footer{text-align:center;margin-top:35px;padding-top:18px;border-top:1px solid #ddd;font-size:10.5px;color:#999}
.verify{text-align:center;margin:18px 0;font-family:monospace;font-size:11px;color:#03707B;background:#f0f9fa;padding:10px;border-radius:8px}
@media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div class="logo">G+</div>
  <h1>AFFIDAVIT OF ASSISTANCE</h1>
  <div class="subtitle">Givethra — Verified Help. Real Impact.</div>
  <div class="seal">✓ DIGITALLY VERIFIED</div>
</div>

<p class="intro">This affidavit certifies that, through the <strong>Givethra</strong> platform, a verified act of assistance was completed between the parties named below, with mutual consent and confirmation. Personal identifiers are partially masked to protect privacy; full records are retained securely by Givethra and released only upon a formal audit or dispute.</p>

<div class="section">
  <h2>Case Information</h2>
  <div class="row"><span class="label">Case ID</span><span class="value">GVT-${caseId}</span></div>
  <div class="row"><span class="label">Category</span><span class="value">${caseData.category || "—"}</span></div>
  <div class="row"><span class="label">Title</span><span class="value">${caseData.title || "—"}</span></div>
  <div class="row"><span class="label">Location</span><span class="value">${caseData.city || ""}, ${caseData.country || ""}</span></div>
  <div class="row"><span class="label">Date Issued</span><span class="value">${today}</span></div>
</div>

<div class="section">
  <h2>Help Seeker (Beneficiary)</h2>
  <div class="row"><span class="label">Full Name</span><span class="value">${seekerName}</span></div>
  <div class="row"><span class="label">CNIC (partially masked)</span><span class="value">${seekerCnic}</span></div>
  <div class="row"><span class="label">Country</span><span class="value">${caseData.country || "—"}</span></div>
  <div class="note">Note: Only the first 4 digits of each CNIC and the last 3 digits of an account/reference are shown. Remaining digits and contact details are kept private.</div>
</div>

<div class="section">
  <h2>${isFundraising ? "Contribution Details" : "Institute / Provider Paid"}</h2>
  ${isFundraising
    ? `<div class="row"><span class="label">Contributed Via</span><span class="value">Givethra Fundraising</span></div>
       <div class="row"><span class="label">For Institute</span><span class="value">${caseData.institute_name || "—"}</span></div>`
    : `<div class="row"><span class="label">Institute / Provider</span><span class="value">${caseData.institute_name || "—"}</span></div>
       <div class="row"><span class="label">Payment Method</span><span class="value">${caseData.payment_method || "—"}</span></div>
       <div class="row"><span class="label">Account / Reference (masked)</span><span class="value">${maskAccount(caseData.account_number)}</span></div>`}
</div>

<div class="section">
  <h2>Resolution Details</h2>
  <div class="row"><span class="label">Helped By (Hero)</span><span class="value">${heroName || "Verified Hero"}</span></div>
  <div class="row"><span class="label">Hero CNIC (partially masked)</span><span class="value">${heroCnic}</span></div>
  <div class="row"><span class="label">Type</span><span class="value">${resolution?.resolution_type || "—"}</span></div>
  <div class="row"><span class="label">Amount Provided</span><span class="value">${paidAmount ? sym + " " + paidAmount + " " + cur : "—"}</span></div>
  <div class="row"><span class="label">Completion Date</span><span class="value">${completedDate}</span></div>
</div>

<div class="section">
  <h2>Declarations</h2>
  <div class="declaration"><strong>Help Seeker:</strong> "I confirm that I have received the assistance described above through the Givethra platform, and that all information I provided was true and accurate."</div>
  <div class="declaration"><strong>Hero (Helper):</strong> "I, ${heroName || "the helper"}, confirm that I provided the assistance described above ${isFundraising ? "through Givethra's fundraising for this case" : "directly to the institute"}, willingly and in good faith."</div>
  <div class="note">By accepting this resolution, both parties agree this matter is fully and finally settled. Neither party shall contact or solicit the other outside Givethra. Disputes must be raised through Givethra's official audit process.</div>
</div>

<div class="signatures">
  <div class="sig-box"><div class="sig-line">Help Seeker</div><div style="font-size:11px;color:#666;">Digitally Confirmed</div></div>
  <div class="sig-box"><div class="sig-line">${heroName || "Hero (Helper)"}</div><div style="font-size:11px;color:#666;">Digitally Confirmed</div></div>
</div>

<div class="verify">Verification Code: ${verifyCode}<br>Issued by Givethra · givethra.org</div>

<div class="footer">
  This is a digitally generated affidavit issued by Givethra.<br>
  © ${new Date().getFullYear()} Givethra · Verified Help. Real Impact.
</div>
<script>window.onload=()=>window.print();</script>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) { win.document.write(html); win.document.close(); }
  else toast.error("Please allow pop-ups to download the affidavit.");
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

  // Get user's total unlock count (across all cases) for free unlock logic
  const [userUnlockCount, setUserUnlockCount] = useState(0);
  const isFirstThreeUnlocks = userUnlockCount < 3;

  // ===== MAIN LOAD EFFECT =====
  useEffect(() => { 
    loadCase(); 
  }, [id, user]);

  // ===== FEEDBACK CHECK EFFECT - separate from loadCase =====
  useEffect(() => {
    if (caseData?.id && user?.id) {
      checkExistingFeedback();
    }
  }, [caseData, user]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stream]);

  // ===== CHECK EXISTING FEEDBACK =====
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

      if (user && data && durableUserId) {
        const owner = String(data.user_id || "") === durableUserId;
        const suspension = await getUserSuspension(durableUserId);
        setIsSuspended(Boolean(suspension?.is_active));
        const unlock = await getCaseUnlock(id, durableUserId);
        setMyUnlock(unlock);

        // A completed helper may have a resolution even when the legacy unlock row is missing.
        // Keep that verified history open so the affidavit remains accessible.
        const count = await getUserUnlockCount(durableUserId);
        setUserUnlockCount(Number(count ?? 0));

        const res = await getCaseResolutions(id, owner ? undefined : durableUserId);
        const resolutions = Array.isArray(res) ? res : [];
        setMyResolutions(resolutions.slice().reverse());
        const completed = String(data.status || "").toLowerCase() === "completed";
        setUnlocked(!!unlock || owner || (completed && resolutions.length > 0));

        const kyc = await getKycSubmission(data.user_id);
        setSeekerKyc(kyc);

        const prof = await getProfile(durableUserId);
        const nm = (prof?.full_name || "").split(" ")[0];
        if (nm) setHeroName(nm);

        // ✅ Feedback check moved to separate useEffect above
      }
    } catch (err) {
      console.error("Error loading case:", err);
      toast.error("Failed to load case details.");
    } finally {
      setLoading(false);
    }
  }

  // File upload helper (uses the worker endpoint)
  async function uploadFile(file: File, path: string): Promise<string> {
    return await uploadFileToStorage(file, path);
  }

  async function startRecording() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });
      setStream(s);
      setRecording(true);
      setPaused(false);
      setRecTimer(0);

      setFbVideoBlob(null);
      setFbVideoFile(null);
      setFbVideoName("");
      setTimeout(() => { if (liveVideoRef.current) liveVideoRef.current.srcObject = s; }, 100);

      const recorder = new MediaRecorder(s, {
        mimeType: "video/webm;codecs=vp8",
        videoBitsPerSecond: 1500000,
      });
      mediaRecorderRef.current = recorder;
      videoChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) videoChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        setFbVideoFile(new File([blob], "feedback.webm", { type: "video/webm" }));
        setFbVideoBlob(URL.createObjectURL(blob));
        setFbVideoName("feedback.webm");
        s.getTracks().forEach(t => t.stop());
        setStream(null);
        setRecording(false);
        setPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };
      recorder.start();
      timerRef.current = setInterval(() => {
        setRecTimer(prev => { if (prev + 1 >= 90) { stopRecording(); return 90; } return prev + 1; });
      }, 1000);
    } catch { toast.error("Camera/microphone access denied."); }
  }

  function pauseRecording() {
    const r = mediaRecorderRef.current;
    if (r && r.state === "recording") { r.pause(); setPaused(true); if (timerRef.current) clearInterval(timerRef.current); }
  }
  function resumeRecording() {
    const r = mediaRecorderRef.current;
    if (r && r.state === "paused") {
      r.resume(); setPaused(false);
      timerRef.current = setInterval(() => {
        setRecTimer(prev => { if (prev + 1 >= 90) { stopRecording(); return 90; } return prev + 1; });
      }, 1000);
    }
  }
  function stopRecording() {
    const r = mediaRecorderRef.current;
    if (r && r.state !== "inactive") r.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }
  function discardVideo() { setFbVideoBlob(null); setFbVideoFile(null); setFbVideoName(""); }

  const cur = caseData?.currency || "USD";
  const sym = CURRENCY_SYMBOLS[cur] ?? cur;
  const amountNeeded = Number(caseData?.amount_needed ?? 0);
  const amountCollected = Number(caseData?.amount_collected ?? 0);
  const remaining = Math.max(amountNeeded - amountCollected, 0);
  const percentDone = amountNeeded > 0 ? Math.min(Math.round((amountCollected / amountNeeded) * 100), 100) : 0;
  const fundraisingStarted = amountCollected > 0;
  const pledgeNum = parseFloat(pledgeAmount) || 0;

  const normalizedStatus = String(caseData?.status || "").toLowerCase();
  const isRejected = normalizedStatus === "rejected";
  const isExpired = normalizedStatus === "expired";
  const isOwner = user?.id === caseData?.user_id;
  const isCompleted = normalizedStatus === "completed";
  const verifiedResolutions = myResolutions.filter(isApprovedCompletedResolution);
  const hasPaymentDetails = caseData?.institute_name || caseData?.account_number || caseData?.account_title || caseData?.account_iban;
  const unlockMode = myUnlock?.payment_type || payMode;
  const canHelpAgain = unlocked && !isOwner && !isCompleted && !isRejected && !isExpired;

  async function handleUnlock(mode: "full" | "partial") {
    if (!user) { navigate({ to: "/sign-in" }); return; }
    if (isSuspended) { toast.error("Your account is suspended. You can view this case, but you cannot provide help until you reactivate it with 5 credits."); return; }
    if (mode === "partial") {
      if (!pledgeNum || pledgeNum <= 0) { toast.error("Please enter how much you want to help with."); return; }
      if (amountNeeded > 0 && pledgeNum > remaining) { toast.error(`Only ${sym} ${remaining} ${cur} is remaining for this case.`); return; }
    }
    setUnlocking(true);
    try {
      // First 3 unlocks are FREE, then 1 credit per unlock
      const isFree = userUnlockCount < 3;
      const charge = isFree ? 0 : 1;

      await insertCaseUnlock({
        case_id: id,
        hero_id: user.id,
        pledged_amount: mode === "partial" ? pledgeNum : (amountNeeded > 0 ? remaining : 0),
        credits_charged: charge,
        payment_type: mode,
      });

      if (mode === "partial") setAmountPaid(String(pledgeNum));
      else if (amountNeeded > 0) setAmountPaid(String(remaining));

      setUnlocked(true);
      setPayMode(mode);
      toast.success(isFree ? "🎉 Case unlocked FREE! This is your #" + (userUnlockCount + 1) + " free help." : `Case unlocked! 1 credit deducted.`);
      loadCase();
    } catch (err: any) {
      toast.error("Failed to unlock case: " + err.message);
    }
    finally { setUnlocking(false); }
  }

  async function handleSubmitResolution() {
    if (isSuspended) { toast.error("Your account is suspended. You can view this case, but you cannot submit help until you reactivate it with 5 credits."); return; }
    if (!resType) { toast.error("Please select what you did"); return; }
    if (!txId) { toast.error("Please enter transaction ID"); return; }
    setSubmitting(true);
    try {
      let receiptUrl = "";
      if (receiptFile) receiptUrl = await uploadFile(receiptFile, `resolutions/${id}/${Date.now()}_receipt`);

      const paidNum = amountPaid ? parseFloat(amountPaid) : (myUnlock?.pledged_amount ?? null);
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
        seeker_confirmed: paidTo === "givethra" ? true : false,
        seeker_confirmed_amount: paidTo === "givethra" ? paidNum : null,
        paid_to: paidTo,
      });

      if (paidTo === "givethra") {
        if (caseData?.user_id) await sendNotification(caseData.user_id, "system", "Someone is helping your case! 🤝", `A kind person contributed towards your case "${caseData.title}". Givethra is verifying it — you'll see your fundraising progress soon.`, `/cases/${id}`);
        toast.success("Thank you! Givethra will verify your contribution and add it to the fundraising.");
      } else {
        if (caseData?.user_id) await sendNotification(caseData.user_id, "system", "Please confirm help received ✅", `A Hero submitted proof of paying your case "${caseData.title}". Please review and confirm.`, `/cases/${id}`);
        toast.success("Resolution submitted! Waiting for seeker confirmation.");
      }

      setShowResolution(false);
      setResType(""); setTxId(""); setNotes(""); setReceiptFile(null); setReceiptName("");
      loadCase();
    } catch (err) { toast.error(`Error: ${err instanceof Error ? err.message : "Unknown"}`); }
    finally { setSubmitting(false); }
  }

  async function handleSeekerConfirm(confirmedAmount: number, res: any) {
    if (!res) return;
    try {
      await updateCaseResolution(res.id, {
        seeker_confirmed: true,
        seeker_confirmed_amount: confirmedAmount,
        status: "seeker_confirmed",
      });
      if (res.hero_id) await sendNotification(res.hero_id, "system", "Seeker confirmed your help ✅", `The seeker confirmed receiving ${sym} ${confirmedAmount} ${cur} on "${caseData.title}". Givethra will now verify and finalize.`, `/cases/${id}`);
      toast.success("Confirmed! Givethra will verify and finalize this help.");
    } catch (err) {
      toast.error("Failed to confirm.");
    }
    loadCase();
  }

  async function handleSeekerDispute(res: any) {
    if (!res) return;
    try {
      await updateCaseResolution(res.id, { seeker_confirmed: false, status: "disputed" });
      toast.success("Marked as disputed. Givethra will investigate.");
    } catch (err) {
      toast.error("Failed to dispute.");
    }
    loadCase();
  }

  async function submitFeedback() {
    if (!fbText.trim() || !fbVideoFile) { toast.error("Please write a message AND record a 90-second video — both are required."); return; }
    if (recording) { toast.error("Please finish (Done) your video first."); return; }
    if (!user?.id) {
      toast.error("Please sign in before submitting feedback.");
      return;
    }
    setFbSubmitting(true);
    try {
      let fbVideoUrl = "";
      if (fbVideoFile) fbVideoUrl = await uploadFile(fbVideoFile, `feedbacks/${id}/${Date.now()}_video`);
      const prof = await getProfile(user.id);
      const firstName = (prof?.full_name || seekerKyc?.full_name || "A grateful person").split(" ")[0];
      const savedFeedback = await insertFeedback({
        case_id: id,
        user_id: user?.id,
        first_name: firstName,
        text_message: fbText.trim() || null,
        video_url: fbVideoUrl || null,
        status: "pending_review",
      });
      if (savedFeedback?.error) throw new Error(savedFeedback.error);
      // Move immediately to the waiting state from the successful POST response.
      // Do not follow it with a second GET that can transiently return an empty row
      // and make the form appear again on mobile.
      setExistingFeedback({
        ...(savedFeedback || {}),
        case_id: id,
        user_id: user.id,
        text_message: fbText.trim(),
        video_url: fbVideoUrl,
        status: "pending_review",
      });
      toast.success("Thank you! Your feedback is submitted for Givethra's review. Once approved, it will appear on the wall and you can submit a new case.");
      setFbText(""); setFbVideoFile(null); setFbVideoName(""); setFbVideoBlob(null);
    } catch (err) { toast.error(`Error: ${err instanceof Error ? err.message : "Unknown"}`); }
    finally { setFbSubmitting(false); }
  }

  if (loading) return <Layout><div className="text-center py-20">Loading...</div></Layout>;
  if (!caseData) return <Layout><div className="text-center py-20 text-muted-foreground">Case not found.</div></Layout>;

  // ============================================================
  //  REJECTED CASE - FULL PAGE REPLACEMENT
  // ============================================================
  if (isRejected) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button type="button" onClick={() => navigate({ to: "/my-cases" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="h-4 w-4" /> Back to My Cases
          </button>

          <div className="rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20 p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full shrink-0">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-red-800 dark:text-red-300">❌ Case Rejected</h1>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Your case was reviewed and could not be approved for the following reason(s)
                </p>
              </div>
            </div>

            {/* Rejection Reason - MAIN */}
            <div className="bg-white dark:bg-red-950/50 rounded-xl border-2 border-red-200 dark:border-red-800 p-6 space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <h2 className="font-bold text-red-700 dark:text-red-300">Rejection Reason</h2>
              </div>
              <p className="text-base text-red-900 dark:text-red-200 font-medium leading-relaxed whitespace-pre-line">
                {caseData.rejection_reason || "No specific reason provided. Please contact support for details."}
              </p>
              {caseData.reviewed_at && (
                <p className="text-xs text-red-400 dark:text-red-500 mt-2 border-t border-red-100 dark:border-red-800 pt-2">
                  Reviewed on: {new Date(caseData.reviewed_at).toLocaleDateString()} at {new Date(caseData.reviewed_at).toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Refund/Free Status */}
            <div className={`rounded-xl border p-4 ${caseData.was_free ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" : "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800"}`}>
              <div className="flex items-start gap-3">
                <RefreshCw className={`h-5 w-5 mt-0.5 shrink-0 ${caseData.was_free ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"}`} />
                <div>
                  <p className={`text-sm font-semibold ${caseData.was_free ? "text-green-800 dark:text-green-300" : "text-blue-800 dark:text-blue-300"}`}>
                    {caseData.was_free 
                      ? "🎁 Your free submission has been returned!" 
                      : "💳 1 credit has been refunded to your account!"}
                  </p>
                  <p className={`text-xs mt-0.5 ${caseData.was_free ? "text-green-700 dark:text-green-400" : "text-blue-700 dark:text-blue-400"}`}>
                    {caseData.was_free 
                      ? "You can submit a new case for FREE again. Your free case allowance is restored." 
                      : "You can re-submit this case using your refunded credit. No extra cost."}
                  </p>
                </div>
              </div>
            </div>

            {/* What to do next */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <h3 className="font-semibold text-amber-800 dark:text-amber-300 text-sm mb-2">📌 What to do next?</h3>
              <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Review the rejection reason above carefully</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Fix the issues mentioned in the reason</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Submit a new case with corrected information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <span>If you need help, contact our support team</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                className="flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white h-12"
                onClick={() => navigate({ to: "/submit-request" })}
              >
                <RefreshCw className="h-4 w-4" />
                Submit New Case
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-12"
                onClick={() => navigate({ to: "/support" })}
              >
                <AlertCircle className="h-4 w-4" />
                Contact Support
              </Button>
            </div>

            {/* Note: All case details hidden */}
            <div className="text-center pt-2 border-t border-red-200 dark:border-red-800">
              <p className="text-xs text-red-400 dark:text-red-500">
                ⚠️ All case details have been hidden for rejected cases. Please submit a new case.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ============================================================
  //  EXPIRED CASE
  // ============================================================
  if (isExpired) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <button type="button" onClick={() => navigate({ to: "/my-cases" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft className="h-4 w-4" /> Back to My Cases
          </button>

          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full shrink-0">
                <CalendarClock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-amber-800 dark:text-amber-300">⏰ Case Expired</h1>
                <p className="text-sm text-amber-600 dark:text-amber-400">No one helped in time, but you can try again</p>
              </div>
            </div>

            <div className="bg-white dark:bg-amber-950/50 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-6">
              <p className="text-base text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
                Your case remained active until the deadline but no Hero stepped forward to help.
                {caseData.was_free 
                  ? " Since this was your free case, you can submit a new case for FREE." 
                  : " The 1 credit you used has been refunded to your account."}
              </p>
              {caseData.deadline && (
                <p className="text-xs text-amber-400 dark:text-amber-500 mt-3 border-t border-amber-100 dark:border-amber-800 pt-2">
                  Expired on: {new Date(caseData.deadline).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white h-12"
                onClick={() => navigate({ to: "/submit-request" })}
              >
                <RefreshCw className="h-4 w-4" />
                Submit New Case
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2 border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 h-12"
                onClick={() => navigate({ to: "/cases" })}
              >
                <Eye className="h-4 w-4" />
                Browse Other Cases
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ============================================================
  //  COMPLETED HELP VIEW (helper only)
  // ============================================================
  // Once a case is complete, a Hero keeps the verified history and affidavit
  // but must not see actionable payment, contribution, receiver, or media controls.
  if (isCompleted && !isOwner) {
    return (
      <Layout>
        <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <button type="button" onClick={() => navigate({ to: "/my-cases" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> Back to My Cases
          </button>
          <section className="rounded-2xl border-2 border-green-200 bg-green-50 dark:bg-green-950/20 p-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="text-4xl">🤲</div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">Verified completed help</p>
              <h1 className="text-2xl font-bold text-green-800 dark:text-green-200">Thank you for helping this case.</h1>
              <p className="text-sm text-green-700 dark:text-green-300">The case is complete. Your payment and contribution actions are now closed. Your verified affidavit is available below only if your help was approved.</p>
            </div>
            <div className="rounded-xl bg-card border border-green-200 p-4 space-y-2">
              <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Case</span><span className="font-semibold text-right">{caseData.title || "Verified case"}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Category</span><span className="font-semibold text-right">{caseData.category || "—"}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Verified help delivered</span><span className="font-bold text-primary">{sym} {amountCollected || myResolutions.reduce((sum, r) => sum + Number(r.seeker_confirmed_amount ?? r.amount_paid ?? 0), 0)} {cur}</span></div>
              <div className="flex items-center justify-between gap-3"><span className="text-xs text-muted-foreground">Status</span><span className="font-semibold text-green-700">Completed ✓</span></div>
            </div>
            {verifiedResolutions.length > 0 && <div className="rounded-xl border-2 border-green-300 bg-white p-4 text-center shadow-sm">
              <p className="text-sm font-bold text-green-800">Affidavit Download</p>
              <p className="mt-1 text-xs text-muted-foreground">Your approved help has been verified. Download your complete affidavit below.</p>
              <div className="mt-3 space-y-2">{verifiedResolutions.map((resolution: any) => <Button key={resolution.id} size="sm" className="w-full gap-2 bg-green-600 hover:bg-green-700" onClick={() => generateAffidavit(caseData, resolution, seekerKyc, resolution.hero_name || heroName)}><FileText className="h-3.5 w-3.5" /> View &amp; Download Affidavit</Button>)}</div>
            </div>}
            {verifiedResolutions.length > 0 && <div className="space-y-3">
              <h2 className="font-semibold text-green-800 dark:text-green-200">Your affidavit</h2>
              {verifiedResolutions.map((r: any) => (
                <div key={r.id} className="rounded-xl bg-card border border-green-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{sym} {r.seeker_confirmed_amount ?? r.amount_paid ?? 0} {cur}</p>
                    <p className="text-xs text-muted-foreground">{r.resolution_type || "Verified assistance"} · Admin verified</p>
                  </div>
                  <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => generateAffidavit(caseData, r, seekerKyc, r.hero_name || heroName)}><FileText className="h-3.5 w-3.5" /> View & Download Affidavit</Button>
                </div>
              ))}
            </div>}
          </section>
        </main>
      </Layout>
    );
  }

  // ============================================================
  //  NORMAL CASE VIEW (for all non-rejected, non-expired cases)
  // ============================================================
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <button type="button" onClick={() => navigate({ to: "/cases" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to cases
        </button>

        {/* === FREE UNLOCK ANNOUNCEMENT - TOP OF PAGE === */}
        {!isCompleted && <div className="rounded-xl bg-green-50 dark:bg-green-950/20 border-2 border-green-400 p-4 text-sm text-green-700 dark:text-green-300 text-center font-medium">
          🎉 Your first <strong>3 helps are FREE</strong>! After that, 1 credit per help.
        </div>}

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
                  <p className="text-xs text-muted-foreground">If no one helps in time, this case will expire and this person will have to wait again. Be their Hero today.</p>
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
              {caseData.why_help && <div className="mt-3 pt-3 border-t border-border"><p className="text-xs font-medium text-foreground mb-1">Why they need help:</p><p className="text-sm text-muted-foreground whitespace-pre-line">{caseData.why_help}</p></div>}
            </div>

            {isOwner && isCompleted && (
              <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 border-2 border-green-200 p-5 space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-4xl">🎉🤲</div>
                  <h2 className="font-bold text-lg text-green-700">Your case is complete!</h2>
                  <p className="text-sm text-green-700">
                    {caseData.closed_by_admin ? "Many kind people came together and Givethra paid your bill. May Allah bless everyone who helped." : "A kind Hero helped you directly. May Allah bless them."}
                  </p>
                </div>
                {caseData.paid_receipt_url && (
                  <a href={caseData.paid_receipt_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-lg bg-card border border-green-300 p-3 text-sm text-green-700 font-medium">
                    <FileText className="h-4 w-4" /> View Payment Receipt
                  </a>
                )}
                {existingFeedback && existingFeedback.status !== "rejected" ? (
                  <div className="rounded-xl bg-card border border-border p-4 text-center space-y-1">
                    <Star className="h-6 w-6 text-amber-400 mx-auto" fill="currentColor" />
                    <p className="text-sm font-semibold text-foreground">Thank you for sharing your feedback! 🤲</p>
                    <p className="text-xs text-muted-foreground">{existingFeedback.status === "approved" ? "Your approved feedback is now on the Kindness Wall." : "Your feedback is awaiting Admin review before it appears on the Kindness Wall."}</p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-card border border-border p-4 space-y-3">
                    <div className="text-center">
                      {existingFeedback?.status === "rejected" && <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">Your previous feedback was rejected{existingFeedback.rejection_reason ? `: ${existingFeedback.rejection_reason}` : "."} You can submit a new video and caption.</p>}
                      <h3 className="font-bold text-sm text-foreground">Share your feedback 🙏</h3>
                      <p className="text-xs text-muted-foreground">Tell everyone how Givethra helped you. Your message (with your first name) will appear on our community wall.</p>
                    </div>
                    <Textarea value={fbText} onChange={e => setFbText(e.target.value)} rows={4} placeholder="Write your thank-you message..." />
                    <div className="space-y-2">
                      <Label className="text-xs">Add a video (required)</Label>
                      {fbVideoBlob ? (
                        <div className="space-y-2">
                          <video src={fbVideoBlob} controls className="w-full rounded-lg border max-h-48" />
                          <Button type="button" variant="outline" size="sm" className="w-full" onClick={discardVideo}>Remove / Re-record</Button>
                        </div>
                      ) : recording ? (
                        <div className="space-y-2">
                          <video ref={liveVideoRef} autoPlay playsInline muted className="w-full rounded-lg border" />
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-red-500">{paused ? "⏸ Paused" : "● Recording"} {recTimer}s / 90s</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2"><div className="bg-red-500 h-2 rounded-full transition-all" style={{ width: `${(recTimer / 90) * 100}%` }} /></div>
                          <div className="flex gap-2">
                            {!paused ? <Button type="button" variant="outline" className="flex-1" onClick={pauseRecording}>⏸ Pause</Button> : <Button type="button" variant="outline" className="flex-1" onClick={resumeRecording}>▶ Resume</Button>}
                            <Button type="button" className="flex-1 bg-green-600 hover:bg-green-700" onClick={stopRecording}>✓ Done</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button type="button" variant="outline" className="w-full gap-2" onClick={startRecording}><Video className="h-4 w-4" /> Record a Video (up to 90s)</Button>
                          <p className="text-[11px] text-muted-foreground text-center">Or upload a video file</p>
                          <Input type="file" accept="video/*" onChange={e => { const f = e.target.files?.[0] ?? null; setFbVideoFile(f); setFbVideoName(f?.name ?? ""); setFbVideoBlob(f ? URL.createObjectURL(f) : null); }} />
                          {fbVideoName && !fbVideoBlob && <p className="text-xs text-green-600">✓ {fbVideoName}</p>}
                        </div>
                      )}
                    </div>
                    <Button type="button" className="w-full min-h-12 touch-manipulation select-none" onClick={submitFeedback} disabled={fbSubmitting || recording} aria-busy={fbSubmitting}>{fbSubmitting ? "Posting..." : "Post Feedback to Community Wall 🤲"}</Button>
                  </div>
                )}
              </div>
            )}

            {!unlocked && !isOwner ? (
              <div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 p-6 flex flex-col items-center text-center gap-4">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center"><Lock className="h-6 w-6 text-muted-foreground" /></div>
                <div>
                  <h3 className="font-bold text-foreground">Choose how you want to help</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isFirstThreeUnlocks
                      ? `🎉 This is your #${userUnlockCount + 1} unlock — it's FREE! (${3 - userUnlockCount} free remaining)`
                      : `Unlock this case (1 credit) and help.`}
                  </p>
                </div>
                {!isAuthenticated ? (
                  <Button onClick={() => navigate({ to: "/sign-in" })} className="px-8">Sign in to help</Button>
                ) : (
                  <div className="w-full space-y-3">
                    {isSuspended && (
                      <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
                        <p className="font-semibold">Account suspended</p>
                        <p className="mt-1">You can view this case, but helping is disabled. Reactivate your account with 5 credits from the Submit page.</p>
                      </div>
                    )}
                    {/* DIRECT HELP - always visible */}
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                      <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h4 className="font-bold text-sm">Pay the full bill directly</h4></div>
                      <p className="text-xs text-muted-foreground">You'll get the institute's payment details and pay the full amount {amountNeeded > 0 ? `(${sym} ${amountNeeded} ${cur})` : ""} directly. Best if you can cover it all at once.</p>
                      <Button onClick={() => handleUnlock("full")} disabled={unlocking || isSuspended} className="w-full gap-2 mt-1">
                        <Unlock className="h-4 w-4" />
                        {isFirstThreeUnlocks ? `FREE (${3 - userUnlockCount} left)` : "Pay Full — Unlock"}
                      </Button>
                    </div>

                    {/* CONTRIBUTION - always visible */}
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                      <div className="flex items-center gap-2"><HandCoins className="h-5 w-5 text-primary" /><h4 className="font-bold text-sm">Contribute any amount (Fundraising)</h4></div>
                      <p className="text-xs text-muted-foreground">Contribute any amount to Givethra's fundraising. When the goal is reached, Givethra pays the institute. Many help together 🤝</p>
                      {amountNeeded > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <Label className="text-xs">How much will you contribute? ({cur}) — {sym} {remaining} still needed</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">{sym}</span>
                            <Input type="number" value={pledgeAmount} onChange={e => setPledgeAmount(e.target.value)} placeholder={`Up to ${remaining}`} className="pl-12 bg-card" max={remaining} disabled={isSuspended} />
                          </div>
                        </div>
                      )}
                      <Button onClick={() => handleUnlock("partial")} disabled={unlocking || isSuspended} className="w-full gap-2 mt-1">
                        <Unlock className="h-4 w-4" />
                        {isFirstThreeUnlocks ? `FREE (${3 - userUnlockCount} left)` : "Contribute — Unlock"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {isSuspended && !isOwner && !isCompleted && (
                  <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-300">
                    <p className="font-semibold">Account suspended</p>
                    <p className="mt-1">You may view this case and its records, but help proof submission is disabled until you reactivate with 5 credits.</p>
                  </div>
                )}
                {!isOwner && !isCompleted && unlockMode === "full" && hasPaymentDetails && (
                  <div className="rounded-2xl bg-card border-2 border-primary/20 p-5 space-y-2">
                    <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h2 className="font-semibold">Institute Payment Details</h2></div>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-xs text-primary font-medium mb-1">Pay the full amount {amountNeeded > 0 ? `(${sym} ${amountNeeded} ${cur})` : ""} directly to the institute below.</div>
                    <CopyRow label="Institute / Provider" value={caseData.institute_name} />
                    <CopyRow label="Payment Method" value={caseData.payment_method} />
                    <CopyRow label="Account Title / Reference" value={caseData.account_title} />
                    <CopyRow label="Account / Bill Number" value={caseData.account_number} mono />
                    <CopyRow label="IBAN" value={caseData.account_iban} mono />
                    <CopyRow label="Institute Contact" value={caseData.institute_contact} mono />
                    <CopyRow label="Institute Address" value={caseData.institute_address} />
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400 mt-2">⚠️ Pay the institute directly. Keep your receipt — submit it below.</div>
                  </div>
                )}

                {!isOwner && !isCompleted && unlockMode === "partial" && (
                  <div className="rounded-2xl bg-card border-2 border-primary/20 p-5 space-y-2">
                    <div className="flex items-center gap-2"><HandCoins className="h-5 w-5 text-primary" /><h2 className="font-semibold">Contribute to Givethra Fundraising</h2></div>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-xs text-primary font-medium mb-1">Send your contribution to Givethra. We collect all contributions and pay the institute once the goal is reached. You can contribute as many times as you like until the case is complete.</div>
                    <CopyRow label="NayaPay Title" value={GIVETHRA_NAYAPAY_TITLE} />
                    <CopyRow label="NayaPay Account / IBAN" value={GIVETHRA_NAYAPAY_IBAN} mono />
                    <CopyRow label="Binance USDT (TRC20) — International" value={GIVETHRA_USDT_TRC20} mono />
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400 mt-2">🤝 After sending, submit your receipt below. Givethra verifies it and adds your contribution. When the goal is reached, Givethra pays the bill.</div>
                  </div>
                )}

                {(caseData.photo_urls?.length > 0) && (() => {
                  const catDocs = caseData.category_details?._documents && typeof caseData.category_details._documents === "object" ? caseData.category_details._documents : {};
                  const docNames = Object.keys(catDocs).map(k => k.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "));
                  const cur2 = caseData.currency || "USD";
                  const sym2 = CURRENCY_SYMBOLS[cur2] ?? cur2;
                  return (
                    <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-300 p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <h2 className="font-semibold text-green-700">Givethra Verification Summary</h2>
                      </div>
                      <p className="text-sm text-green-700 leading-relaxed">
                        This case was submitted by a KYC-verified user for <strong>{caseData.category}</strong> ({sym2} {caseData.amount_needed} {cur2} needed{caseData.institute_name ? `, via ${caseData.institute_name}` : ""}). Givethra reviewed the bill/reference, income proof, live selfie, and video statement before approving this case for Heroes.
                      </p>
                      {docNames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {docNames.map(n => (
                            <span key={n} className="text-xs font-medium bg-white dark:bg-green-900/30 text-green-700 border border-green-300 rounded-full px-2.5 py-1">✅ {n}</span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-green-600">
                        For the beneficiary's privacy, the content of these documents is not shown publicly — only reviewed and verified by Givethra's team.
                      </p>
                    </div>
                  );
                })()}

                {!isCompleted && <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                  <h2 className="font-semibold">🎥 Verification Media</h2>
                  {(myUnlock?.credits_charged ?? 0) > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {caseData.selfie_url && <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground">Live Selfie</p><img src={caseData.selfie_url} alt="Selfie" className="w-full rounded-lg border max-h-40 object-cover" /></div>}
                      {caseData.video_url && <div className="space-y-1"><p className="text-xs font-medium text-muted-foreground">Video Appeal</p><video src={caseData.video_url} controls className="w-full rounded-lg border max-h-40" /></div>}
                    </div>
                  )}
                </div>}

                {!isOwner && myResolutions.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border p-5 space-y-3">
                    <h2 className="font-semibold flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> My Help on this case ({myResolutions.length})</h2>
                    {myResolutions.map((r: any) => {
                      const resolutionStatus = String(r.status || "").trim().toLowerCase();
                      const isVerified = isApprovedCompletedResolution(r);
                      return (
                        <div key={r.id} className="rounded-xl border border-border p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isVerified ? "bg-green-100 text-green-700" : resolutionStatus === "disputed" ? "bg-red-100 text-red-700" : resolutionStatus === "seeker_confirmed" ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-700"}`}>
                              {isVerified ? "VERIFIED ✓" : resolutionStatus === "seeker_confirmed" ? "UNDER VERIFICATION" : resolutionStatus === "disputed" ? "DISPUTED" : "PENDING"}
                            </span>
                            <span className="text-sm font-bold text-primary">{sym} {r.seeker_confirmed_amount ?? r.amount_paid} {cur}</span>
                          </div>
                          {isVerified ? (
                            <Button size="sm" variant="outline" className="w-full gap-2 border-green-300 text-green-700" onClick={() => generateAffidavit(caseData, r, seekerKyc, r.hero_name || heroName)}><FileText className="h-3.5 w-3.5" /> View & Download Affidavit</Button>
                          ) : (
                            <p className="text-xs text-muted-foreground">{resolutionStatus === "seeker_confirmed" ? "Givethra is verifying this contribution." : resolutionStatus === "disputed" ? "This was disputed — no affidavit is available." : "Waiting for confirmation."}</p>
                          )}
                        </div>
                      );
                    })}
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
                          <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0] ?? null; setReceiptFile(f); setReceiptName(f?.name ?? ""); }} className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm" />
                          {receiptName && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {receiptName} (will upload when you submit)</p>}
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

                {!isOwner && isCompleted && myResolutions.length > 0 && (
                  <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 p-5 text-center space-y-2">
                    <div className="text-3xl">🤲</div>
                    <h2 className="font-bold text-green-700">This case is complete!</h2>
                    <p className="text-sm text-green-700">Thank you for your help. May Allah reward you. Your affidavits are above.</p>
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
    // Load resolutions for this case (all heroes)
    getCaseResolutions(caseId).then(data => {
      setResolutions((data ?? []).slice().reverse());
    }).catch(() => {});
  }, [caseId]);

  const visible = resolutions.filter(r => !isContributionResolution(r));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-4">
      {visible.map(res => (
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
                      <Input type="number" value={confirmAmount} onChange={e => setConfirmAmount(e.target.value)} placeholder={String(res.amount_paid ?? "")} className="pl-12" />
                    </div>
                    <button type="button" onClick={() => setConfirmAmount(String(res.amount_paid ?? ""))} className="text-xs px-2 py-1 rounded-lg border border-border hover:border-primary">Same as Hero ({sym}{res.amount_paid})</button>
                    <p className="text-[11px] text-muted-foreground">Enter the amount you truly received. Givethra will verify this.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => { const amt = parseFloat(confirmAmount); if (!amt || amt <= 0) { toast.error("Please enter the amount you received."); return; } onConfirm(amt, res); }}><CheckCircle2 className="h-4 w-4 mr-2" /> Confirm this amount</Button>
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
              <Button size="sm" variant="outline" className="w-full gap-2 border-green-300 text-green-700" onClick={() => generateAffidavit(caseData, res, seekerKyc, res.hero_name || "Verified Hero")}><FileText className="h-3.5 w-3.5" /> Download Seeker Affidavit</Button>
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
