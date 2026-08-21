import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { sendNotification } from "@/lib/notify";
import {
  Shield, CheckCircle, XCircle, ClipboardCheck, FileText, ExternalLink, Heart, Coins, Users,
  ChevronDown, Wallet, Mail, Calendar, Send, ArrowLeft, Gift, AlertTriangle, Building2, Copy,
  Megaphone, HandCoins, Eye, User, Search, Paperclip, Loader2, X, RotateCw, Ban, MessageCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import {
  adminGetAllKyc,
  adminGetAllCases,
  adminGetAllResolutions,
  adminGetAllDeposits,
  adminGetAllProfiles,
  adminGetAllWallets,
  adminGetAllUnlocks,
  adminGetAllSupportMessages,
  adminSendSupportReply,
  adminGetAllFeedbacks,
  adminGetAllOffers,
  adminGetAllSuspensions,
  adminUpdateKyc,
  adminUpdateCase,
  adminUpdateFeedback,
  adminUpdateResolution,
  adminUpdateDeposit,
  adminUpsertWallet,
  adminGetWalletsByUser,
  adminCloseCase,
  adminGetUserSuspension,
  adminUpsertUserSuspension,
  adminUpdateProfile,
  adminGetCategoryOffer,
  adminUpsertCategoryOffer,
  adminDeleteFiles,
  uploadFileToStorage,
} from "@/lib/api";

const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";

const ALL_CATEGORIES = [
  "Electricity Bill", "Gas Bill", "Water Bill", "House Rent",
  "School, College & University Fees", "Education, Books & Admission", "Medical & Treatment", "Medicines",
  "Food & Groceries", "Child Support", "Widow & Elderly Support", "Disability Support",
  "Marriage Support", "Business / Work Help", "Home Repair", "Funeral Expenses",
  "Livestock / Farming", "Debt Relief", "Emergency Help", "Other",
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", PKR: "Rs", SAR: "SAR", AED: "AED", GBP: "£", EUR: "€", INR: "₹",
  TRY: "₺", BDT: "৳", EGP: "E£", NGN: "₦", KES: "KSh", ZAR: "R", BRL: "R$",
  CAD: "C$", AUD: "A$", JPY: "¥", CNY: "¥", KRW: "₩", IDR: "Rp", MYR: "RM",
  THB: "฿", PHP: "₱", VND: "₫", SGD: "S$", AFN: "؋", NPR: "Rs", LKR: "Rs",
  QAR: "QAR", KWD: "KWD", BHD: "BHD", OMR: "OMR", JOD: "JOD", MAD: "MAD",
};

const DOC_LABELS: Record<string, string> = {
  selfie_url: "Selfie",
  video_url: "Video Appeal",
  salary_slip: "Salary Slip (6 Months)",
  statement: "Bank Statement (6 Months)",
  nikah_nama: "Nikah Nama",
  frc: "Family Registration Certificate (FRC)",
  b_form: "B-Form (Child ID)",
  orphan_proof: "Orphan Proof",
  father_death_cert: "Father's Death Certificate",
  mother_death_cert: "Mother's Death Certificate",
  husband_death_cert: "Husband's Death Certificate",
  wife_death_cert: "Wife's Death Certificate",
  divorce_cert: "Divorce Certificate",
  rental_agreement: "Rental Agreement",
  landlord_cnic: "Landlord's CNIC",
  disability_cnic: "Disability CNIC",
  disability_photo: "Disability Photo",
  product_receipt: "Product Quotation",
  bill: "Bill / Challan",
  student_id: "Student ID / B-Form",
  student_id_proof: "Student ID Proof",
  guardianProof: "Guardian Proof",
  childBirthCertificate: "Child Birth Certificate",
  contractor_agreement: "Contractor Agreement",
  hospital_bill: "Hospital Bill",
  medical_report: "Medical Report",
  relation_proof: "Relation Proof",
  paid_receipt_url: "Paid Receipt",
  photo_url: "Photo",
  admission_proof: "Admission / Selection Proof (Offer Letter)",
  fee_challan: "Fee Challan / Voucher",
  books_quotation: "Books Quotation",
  uniform_quotation: "Uniform Quotation",
  uniform_items: "Uniform Items List",
  doctor_report: "Doctor's Report / Prescription",
  owner_cnic: "Owner's CNIC",
  bill_owner_name: "Bill Owner Name",
  student_name: "Student Name",
  student_class: "Student Class/Grade",
  father_name: "Father Name",
  roll_no: "Roll No",
  class_grade: "Class/Grade",
  admission_type: "Admission Type",
  admission_status: "Admission Status",
  school_name: "School Name",
  college_name: "College Name",
  university_name: "University Name",
  program: "Program/Class",
  program_degree: "Program/Degree",
  year: "Year",
  semester_year: "Semester/Year",
  fee_month: "Fee Month",
  needed_items: "Items Needed",
  illness: "Illness",
  patient_name: "Patient Name",
  institute_name: "Institute Name",
  institute_contact: "Institute Contact",
  institute_address: "Institute Address",
  is_institute_in_list: "Institute in List",
  edu_sub_type: "Education Type",
  edu_admission_level: "Admission Level",
  edu_documents: "Education Documents",
  property_ownership: "Property Ownership",
  owner_relation: "Owner Relation",
  reference_number: "Reference Number",
  due_date: "Due Date",
  reference_type: "Reference Type",
  seeker_name: "Seeker Name",
  seeker_contact: "Seeker Contact",
  receiver_name: "Receiver Name",
  receiver_contact: "Receiver Contact",
  receiver_bank: "Receiver Bank",
  receiver_account: "Receiver Account",
  gender: "Gender",
  marital_status: "Marital Status",
  is_orphan: "Orphan",
  orphan_parent: "Orphan Parent",
  job_status: "Job Status",
  disability_mode: "Disability Mode",
  disability_type: "Disability Type",
  disability_reason: "Disability Reason",
  disability_shop_name: "Shop Name",
  disability_shop_contact: "Shop Contact",
  disability_hospital: "Hospital",
  treatment_amount: "Treatment Amount",
  treatment_expiry: "Treatment Expiry",
  treatment_patient_number: "Patient/Bill Number",
  disability_bank_title: "Bank Title",
  disability_bank_number: "Bank Number",
};

function getDocLabel(key: string): string {
  if (DOC_LABELS[key]) return DOC_LABELS[key];
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function sym(cur?: string) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}

function cleanCnic(c?: string) {
  return (c || "").replace(/\D/g, "");
}

function asRows<T = any>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as any).results)) {
    return (value as any).results as T[];
  }
  return [];
}

async function deleteStorageFiles(urls: (string | null | undefined)[]): Promise<{ ok: number; failed: number }> {
  const validUrls = urls.filter((u): u is string => !!u && u.startsWith("http"));
  if (validUrls.length === 0) return { ok: 0, failed: 0 };
  try {
    const result = await adminDeleteFiles(validUrls);
    return result;
  } catch (e) {
    console.error("Delete files error:", e);
    return { ok: 0, failed: validUrls.length };
  }
}

function collectCaseFileUrls(c: any): string[] {
  const urls: string[] = [];
  const push = (u: any) => {
    if (typeof u === "string" && u.trim().startsWith("http") && !urls.includes(u.trim())) {
      urls.push(u.trim());
    }
  };
  push(c.selfie_url);
  push(c.video_url);
  push(c.paid_receipt_url);

  if (Array.isArray(c.photo_urls)) {
    c.photo_urls.forEach(push);
  } else if (c.photo_urls && typeof c.photo_urls === "object") {
    Object.values(c.photo_urls).forEach(push);
  }

  const walk = (obj: any) => {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") {
        push(v);
      } else if (v && typeof v === "object") {
        walk(v);
      }
    }
  };
  walk(c.category_details);
  return urls;
}

function collectKycFileUrls(k: any): string[] {
  const urls: string[] = [];
  if (k.cnic_front_url) urls.push(k.cnic_front_url);
  if (k.cnic_back_url) urls.push(k.cnic_back_url);
  if (k.selfie_url) urls.push(k.selfie_url);
  if (k.passport_url) urls.push(k.passport_url);
  if (k.face_video_url) urls.push(k.face_video_url);
  return urls;
}

function copyText(text?: string) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  toast.success("Copied!");
}

// ============================================================
//  MAIN ADMIN PAGE
// ============================================================
export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [kycList, setKycList] = useState<any[]>([]);
  const [caseList, setCaseList] = useState<any[]>([]);
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [unlocks, setUnlocks] = useState<any[]>([]);
  const [supportMsgs, setSupportMsgs] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [suspensions, setSuspensions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadSupport, setUnreadSupport] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { navigate({ to: "/sign-in" }); return; }
    if (user?.email !== ADMIN_EMAIL) { navigate({ to: "/" }); return; }
    loadData();
    const interval = setInterval(() => { loadSupportMessages(); }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  async function loadData() {
    setLoading(true);
    try {
      const [kyc, cases, res, deps, profs, wals, unl, sup, fbs, offs, susp] = await Promise.all([
        adminGetAllKyc(),
        adminGetAllCases(),
        adminGetAllResolutions(),
        adminGetAllDeposits(),
        adminGetAllProfiles(),
        adminGetAllWallets(),
        adminGetAllUnlocks(),
        adminGetAllSupportMessages(),
        adminGetAllFeedbacks(),
        adminGetAllOffers(),
        adminGetAllSuspensions(),
      ]);
      setKycList(asRows(kyc));
      setCaseList(asRows(cases));
      setResolutions(asRows(res));
      setDeposits(asRows(deps));
      setProfiles(asRows(profs));
      setWallets(asRows(wals));
      setUnlocks(asRows(unl));
      setSupportMsgs(asRows(sup));
      setFeedbacks(asRows(fbs));
      setOffers(asRows(offs));
      setSuspensions(asRows(susp));
      setUnreadSupport(asRows(sup).filter((m: any) => m.sender === "user" && !m.is_read).length);
    } catch (err) {
      console.error("Admin data load error:", err);
      toast.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSupportMessages() {
    try {
      const data = await adminGetAllSupportMessages();
      setSupportMsgs(asRows(data));
      setUnreadSupport(asRows(data).filter((m: any) => m.sender === "user" && !m.is_read).length);
    } catch (e) {
      console.error("Support messages load error:", e);
    }
  }

  async function reloadOffers() {
    const data = await adminGetAllOffers();
    setOffers(asRows(data));
  }

  const cnicCounts: Record<string, number> = {};
  for (const k of kycList) {
    if (k.status === "rejected" || k.status === "duplicate") continue;
    const c = cleanCnic(k.cnic_number);
    if (c) cnicCounts[c] = (cnicCounts[c] ?? 0) + 1;
  }

  async function updateKyc(id: string, status: string, reason = "", action: "approve" | "reject" | "re_kyc" | "duplicate" = "approve") {
    const kyc = kycList.find((k) => k.id === id);
    if (!kyc) return;

    if (action === "duplicate") {
      const cnic = cleanCnic(kyc.cnic_number);
      if (!cnic) { toast.error("No CNIC found to check duplicates"); return; }
      const duplicateFound = kycList.some((k) => k.cnic_number === kyc.cnic_number && k.status === "approved" && k.id !== id);
      if (duplicateFound) {
        await adminUpdateKyc(id, { status: "duplicate", reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: `Duplicate KYC - CNIC: ${kyc.cnic_number}` });
        await adminUpdateProfile(kyc.user_id, { is_suspended: true, suspended_reason: `Duplicate KYC detected (CNIC: ${kyc.cnic_number})`, suspended_at: new Date().toISOString() });
        const existingSusp = await adminGetUserSuspension(kyc.user_id);
        const newCount = (existingSusp?.suspension_count || 0) + 1;
        await adminUpsertUserSuspension({ user_id: kyc.user_id, suspension_count: newCount, is_active: true, suspended_at: new Date().toISOString(), rejection_count_at_suspension: 0 });
        await sendNotification(kyc.user_id, "system", "🚫 Account Suspended (Duplicate KYC)", `Your account has been suspended because a duplicate KYC submission was detected with the same CNIC (${kyc.cnic_number}). If you believe this is an error, please contact support.`, "/support");
        toast.success("KYC marked as duplicate and user banned.");
        loadData();
        return;
      } else {
        toast.error("No approved KYC with this CNIC found to mark as duplicate.");
        return;
      }
    }

    await adminUpdateKyc(id, { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: reason });
    if (kyc.user_id) {
      if (status === "approved") await sendNotification(kyc.user_id, "kyc_approved", "KYC Approved ✅", "Your identity has been verified. You can now submit and unlock cases.", "/kyc");
      else if (status === "rejected") await sendNotification(kyc.user_id, "kyc_rejected", "KYC Rejected", reason ? `Reason: ${reason}` : "Please submit clear, well-lit photos and try again.", "/kyc");
      else if (status === "re_kyc") await sendNotification(kyc.user_id, "kyc_re_kyc", "KYC Requires Re-submission 🔄", `Please resubmit your KYC with correct information. Reason: ${reason || "CNIC mismatch or missing details"}.`, "/kyc");
    }
    toast.success(`KYC ${status}!`);
    loadData();
  }

  async function updateCase(id: string, status: string, reason = "") {
    const c = caseList.find((cs) => cs.id === id);
    await adminUpdateCase(id, { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: reason });

    if (status === "rejected" && c) {
      await checkAndSuspendUser(c.user_id);
    }

    if (c?.user_id) {
      if (status === "approved") {
        await sendNotification(c.user_id, "case_approved", "Case Approved ✅", `Your case "${c.title}" is now live for Heroes.`, "/my-cases");
      } else if (status === "rejected") {
        if (c.was_free) {
          const off = await adminGetCategoryOffer(c.category);
          if (off && off.used_count > 0) {
            await adminUpsertCategoryOffer({ category: c.category, used_count: off.used_count - 1 });
          }
          await sendNotification(c.user_id, "case_rejected", "Case Rejected", (reason ? `Reason: ${reason}. ` : "") + "Your free offer has been restored — you can submit again for free.", "/my-cases");
        } else {
          const wallet = await adminGetWalletsByUser(c.user_id);
          const newBalance = (wallet?.balance || 0) + 1;
          await adminUpsertWallet(c.user_id, newBalance);
          await sendNotification(c.user_id, "case_rejected", "Case Rejected", (reason ? `Reason: ${reason}. ` : "") + "Your 1 credit has been refunded — you can submit again.", "/my-cases");
        }
      }
    }
    toast.success(`Case ${status}!`);
    loadData();
  }

  async function updateFeedback(fbId: string, status: string, reason = "") {
    const fb = feedbacks.find((f) => f.id === fbId);
    await adminUpdateFeedback(fbId, { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: reason });
    if (fb?.user_id) {
      if (status === "approved") {
        await sendNotification(fb.user_id, "system", "Feedback Approved 🎉", "Your feedback is now live on the Givethra community wall. You can now submit a new case!", "/my-cases");
      } else {
        await sendNotification(fb.user_id, "system", "Feedback Needs Improvement", reason ? `Reason: ${reason}. Please re-record your video and message.` : "Please re-record your video and message, then resubmit.", `/cases/${fb.case_id}`);
      }
    }
    toast.success(`Feedback ${status}!`);
    loadData();
  }

  async function checkAndSuspendUser(userId: string) {
    const casesForUser = caseList.filter((c) => c.user_id === userId);
    const rejectedCount = casesForUser.filter((c) => c.status === "rejected").length;
    if (rejectedCount >= 5) {
      const existing = await adminGetUserSuspension(userId);
      const newCount = (existing?.suspension_count || 0) + 1;
      await adminUpsertUserSuspension({ user_id: userId, suspension_count: newCount, is_active: true, suspended_at: new Date().toISOString(), rejection_count_at_suspension: rejectedCount });
      await adminUpdateProfile(userId, { is_suspended: true, suspended_reason: `Suspended after ${rejectedCount} rejected cases (suspension #${newCount})`, suspended_at: new Date().toISOString() });
      await sendNotification(userId, "system", "🚫 Account Suspended", `Your account has been suspended due to ${rejectedCount} rejected cases. To unlock, please deposit 5 credits and click "Unlock Account" in the submit page.`, "/submit-request");
    }
  }

  async function manualUnlockUser(userId: string) {
    if (!confirm("Are you sure you want to manually unlock this user?")) return;
    try {
      await adminUpsertUserSuspension({ user_id: userId, is_active: false, unlocked_at: new Date().toISOString() });
      await adminUpdateProfile(userId, { is_suspended: false, suspended_reason: null });
      await sendNotification(userId, "system", "🔓 Account Unlocked (Admin)", "Your account has been manually unlocked by the admin. Please submit cases carefully.", "/dashboard");
      toast.success("User unlocked successfully!");
      loadData();
    } catch (err) {
      toast.error("Failed to unlock user.");
      console.error(err);
    }
  }

  async function confirmResolution(res: any) {
    const c = caseList.find((cs) => cs.id === res.case_id);
    if (!c) { toast.error("Case not found"); return; }
    const confirmedAmt = Number(res.seeker_confirmed_amount ?? res.amount_paid ?? 0);
    const amountNeeded = Number(c.amount_needed ?? 0);
    const prevCollected = Number(c.amount_collected ?? 0);
    const newCollected = prevCollected + confirmedAmt;
    const isFundraising = res.paid_to === "givethra";

    await adminUpdateResolution(res.id, { status: "completed", admin_confirmed: true, admin_confirmed_at: new Date().toISOString(), completed_at: new Date().toISOString() });
    const updates: any = { amount_collected: newCollected };
    const goalReached = amountNeeded > 0 && newCollected >= amountNeeded;
    if (!isFundraising && (goalReached || amountNeeded === 0)) { updates.status = "completed"; }
    await adminUpdateCase(c.id, updates);

    if (res.hero_id) {
      await sendNotification(res.hero_id, "case_completed", "Help verified! 🎉", `Givethra verified your help of ${sym(c.currency)} ${confirmedAmt} on "${c.title}". ${!isFundraising ? "You can now download your affidavit." : "Thank you for contributing!"}`, `/cases/${res.case_id}`);
    }
    if (res.seeker_id) {
      if (isFundraising) {
        const stillLeft = Math.max(amountNeeded - newCollected, 0);
        await sendNotification(res.seeker_id, "system", goalReached ? "Goal reached! 🎉" : "More help received! 🤝", goalReached ? `Great news! People have together raised the full amount for your case "${c.title}". Givethra will now pay the institute and close your case.` : `Your case "${c.title}" received ${sym(c.currency)} ${confirmedAmt} more. Total raised: ${sym(c.currency)} ${newCollected} of ${sym(c.currency)} ${amountNeeded}. ${sym(c.currency)} ${stillLeft} still needed.`, `/cases/${res.case_id}`);
      } else {
        const stillOpen = amountNeeded > 0 && newCollected < amountNeeded;
        await sendNotification(res.seeker_id, "system", stillOpen ? "Partial help verified ✅" : "Your case is complete! 🎉", stillOpen ? `${sym(c.currency)} ${confirmedAmt} verified. ${sym(c.currency)} ${amountNeeded - newCollected} still remaining — your case stays open for more Heroes.` : `Your case "${c.title}" is now fully helped. Thank you for using Givethra.`, `/cases/${res.case_id}`);
      }
    }
    toast.success(`Verified! ${sym(c.currency)} ${confirmedAmt} added.${isFundraising && goalReached ? " Goal reached — now Mark as Paid to close." : ""}`);
    loadData();
  }

  async function rejectResolution(res: any) {
    await adminUpdateResolution(res.id, { status: "disputed", admin_confirmed: false });
    toast.success("Resolution marked disputed.");
    loadData();
  }

  async function markAsPaidAndClose(c: any, receiptUrl: string) {
    await adminCloseCase(c.id, { status: "completed", closed_by_admin: true, paid_receipt_url: receiptUrl || null });
    if (c.user_id) {
      await sendNotification(c.user_id, "case_completed", "Your bill is paid! 🎉", `Wonderful news! Many kind people came together and your case "${c.title}" is fully helped. Givethra has paid the institute. You can view the receipt on your case. May Allah bless everyone who helped. 🤲`, `/cases/${c.id}`);
    }
    toast.success("Case marked as PAID and closed! Seeker notified.");
    loadData();
  }

  async function approveDeposit(dep: any, finalCredits: number) {
    const credits = (finalCredits ?? (dep.credits ?? dep.amount)) || 0;
    try {
      const wallet = await adminGetWalletsByUser(dep.user_id);
      const newBalance = (wallet?.balance ?? 0) + credits;
      await adminUpsertWallet(dep.user_id, newBalance);
      await adminUpdateDeposit(dep.id, { status: "approved", credits, reviewed_at: new Date().toISOString(), reviewed_by: user?.email });
      if (dep.user_id) {
        await sendNotification(dep.user_id, "credits_added", "Credits Added 💰", `${credits} credit(s) have been added to your wallet.`, "/wallet");
      }
      toast.success(`Approved! ${credits} credits added.`);
      loadData();
    } catch (e: any) {
      console.error("Deposit approval failed:", e);
      toast.error(`Failed to approve deposit: ${e?.message || "Unknown error"}`);
    }
  }

  async function cleanupAllRejectedFiles() {
    if (!confirm("This will permanently delete all files associated with rejected KYC and cases. Are you sure?")) return;
    setLoading(true);
    try {
      const rejectedKyc = kycList.filter((k) => k.status === "rejected");
      for (const k of rejectedKyc) {
        const urls = collectKycFileUrls(k);
        if (urls.length) await deleteStorageFiles(urls);
        await adminUpdateKyc(k.id, { cnic_front_url: null, cnic_back_url: null, selfie_url: null, passport_url: null, face_video_url: null });
      }
      toast.success(`Cleaned ${rejectedKyc.length} KYC cases!`);
    } catch (e) {
      toast.error("Cleanup failed, check console.");
      console.error(e);
    }
    await loadData();
  }

  async function rejectDeposit(id: string, reason: string) {
    const dep = deposits.find((d) => d.id === id);
    await adminUpdateDeposit(id, { status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: reason });
    if (dep?.user_id) {
      await sendNotification(dep.user_id, "deposit_rejected", "Deposit Rejected", reason ? `Reason: ${reason}` : "Please check your payment proof and try again.", "/wallet");
    }
    toast.success("Deposit rejected.");
    loadData();
  }

  // ---- Counts ----
  const pendingKyc = kycList.filter((k) => k.status === "pending");
  const approvedKycCount = kycList.filter((k) => k.status === "approved").length;
  const rejectedKycCount = kycList.filter((k) => k.status === "rejected").length;

  const pendingCases = caseList.filter((c) => c.status === "pending");
  const approvedCasesCount = caseList.filter((c) => c.status === "approved").length;
  const rejectedCasesCount = caseList.filter((c) => c.status === "rejected").length;
  const completedCasesCount = caseList.filter((c) => c.status === "completed").length;

  const pendingDeposits = deposits.filter((d) => d.status === "pending");
  const approvedDepositsCount = deposits.filter((d) => d.status === "approved").length;
  const rejectedDepositsCount = deposits.filter((d) => d.status === "rejected").length;

  const pendingResolutions = resolutions.filter((r) => r.status === "seeker_confirmed");
  const completedResolutionsCount = resolutions.filter((r) => r.status === "completed").length;

  const approvedCases = caseList.filter((c) => c.status === "approved");
  const completedCases = caseList.filter((c) => c.status === "completed");
  const approvedKyc = kycList.filter((k) => k.status === "approved");
  const freeCases = caseList.filter((c) => c.was_free);
  const paidCases = caseList.filter((c) => !c.was_free);

  const readyToClose = caseList.filter((c) => {
    if (c.status !== "approved") return false;
    const needed = Number(c.amount_needed ?? 0);
    const collected = Number(c.amount_collected ?? 0);
    return needed > 0 && collected >= needed && !c.closed_by_admin;
  });

  const usersList = profiles.map((p) => {
    const uid = p.user_id;
    const kyc = kycList.find((k) => k.user_id === uid);
    const userCases = caseList.filter((c) => c.user_id === uid);
    const userUnlocks = unlocks.filter((u) => u.hero_id === uid);
    const userDeposits = deposits.filter((d) => d.user_id === uid);
    const wallet = wallets.find((w) => w.user_id === uid);
    const suspension = suspensions.find((s) => s.user_id === uid);
    const approvedDeps = userDeposits.filter((d) => d.status === "approved");
    const totalDeposited = approvedDeps.reduce((s, d) => s + (d.credits ?? d.amount ?? 0), 0);
    const rejectedCases = userCases.filter((c) => c.status === "rejected").length;
    return {
      user_id: uid,
      name: p.full_name || kyc?.full_name || "—",
      email: p.email || "—",
      created_at: p.created_at,
      kycStatus: kyc?.status ?? "none",
      casesSubmitted: userCases.length,
      rejectedCases,
      casesUnlocked: userUnlocks.length,
      depositsCount: userDeposits.length,
      totalDeposited,
      walletBalance: wallet?.balance ?? 0,
      cnic: kyc?.cnic_number || "",
      isSuspended: suspension?.is_active ?? false,
      suspendedReason: suspension?.suspended_reason || p.suspended_reason || "",
      suspensionCount: suspension?.suspension_count || 0,
    };
  }).sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());

  const profileMap: Record<string, any> = {};
  for (const p of profiles) profileMap[p.user_id] = p;
  for (const k of kycList) { if (!profileMap[k.user_id]?.full_name) profileMap[k.user_id] = { ...profileMap[k.user_id], full_name: k.full_name }; }

  const activeOffers = offers.filter((o) => o.is_active).length;
  const duplicateCnicCount = Object.values(cnicCounts).filter((n) => n > 1).length;
  const totalHeroHelps = unlocks.length;

  const resByCaseId: Record<string, any[]> = {};
  for (const r of resolutions) {
    if (!resByCaseId[r.case_id]) resByCaseId[r.case_id] = [];
    resByCaseId[r.case_id].push(r);
  }

  const activeSuspensions = suspensions.filter((s) => s.is_active).length;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Pending KYC", value: pendingKyc.length },
            { label: "Pending Cases", value: pendingCases.length },
            { label: "Verify Help", value: pendingResolutions.length },
            { label: "Ready to Pay", value: readyToClose.length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border bg-card p-4">
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        {activeSuspensions > 0 && (
          <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p><strong>{activeSuspensions} user(s)</strong> are currently suspended. Go to the <strong>Users</strong> tab to view and manage them.</p>
          </div>
        )}

        <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={cleanupAllRejectedFiles}>
          🗑️ Cleanup Rejected Files (Free Storage Space)
        </Button>

        {duplicateCnicCount > 0 && (
          <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p><strong>{duplicateCnicCount} CNIC number(s)</strong> are used in more than one active KYC. Check the KYC tab — duplicate ones show a red warning.</p>
          </div>
        )}

        {loading ? <div className="text-center py-20 text-muted-foreground">Loading...</div> : (
          <Tabs defaultValue="overview">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">Users {usersList.length > 0 && <span className="ml-1 bg-muted text-foreground text-[10px] rounded-full px-1.5">{usersList.length}</span>}</TabsTrigger>
              <TabsTrigger value="kyc">KYC {pendingKyc.length > 0 && <span className="ml-1 bg-primary text-white text-[10px] rounded-full px-1.5">{pendingKyc.length}</span>}</TabsTrigger>
              <TabsTrigger value="cases">Cases {pendingCases.length > 0 && <span className="ml-1 bg-primary text-white text-[10px] rounded-full px-1.5">{pendingCases.length}</span>}</TabsTrigger>
              <TabsTrigger value="verify">Verify Help {pendingResolutions.length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">{pendingResolutions.length}</span>}</TabsTrigger>
              <TabsTrigger value="pay">Pay & Close {readyToClose.length > 0 && <span className="ml-1 bg-green-500 text-white text-[10px] rounded-full px-1.5">{readyToClose.length}</span>}</TabsTrigger>
              <TabsTrigger value="deposits">Deposits {pendingDeposits.length > 0 && <span className="ml-1 bg-primary text-white text-[10px] rounded-full px-1.5">{pendingDeposits.length}</span>}</TabsTrigger>
              <TabsTrigger value="notify">Notify</TabsTrigger>
              <TabsTrigger value="offers">Offers {activeOffers > 0 && <span className="ml-1 bg-green-500 text-white text-[10px] rounded-full px-1.5">{activeOffers}</span>}</TabsTrigger>
              <TabsTrigger value="support">Support {unreadSupport > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">{unreadSupport}</span>}</TabsTrigger>
              <TabsTrigger value="feedback">Feedback {feedbacks.filter((f) => f.status === "pending_review").length > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">{feedbacks.filter((f) => f.status === "pending_review").length}</span>}</TabsTrigger>
              <TabsTrigger value="suspensions">Suspensions {activeSuspensions > 0 && <span className="ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5">{activeSuspensions}</span>}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Total Users", value: usersList.length, icon: Users },
                  { label: "Verified KYC", value: approvedKyc.length, icon: Shield },
                  { label: "Total Cases", value: caseList.length, icon: FileText },
                  { label: "Approved Cases", value: approvedCases.length, icon: CheckCircle },
                  { label: "Completed Cases", value: completedCases.length, icon: Heart },
                  { label: "FREE Cases", value: freeCases.length, icon: Gift },
                  { label: "PAID Cases", value: paidCases.length, icon: Coins },
                  { label: "Hero Helps (Unlocks)", value: totalHeroHelps, icon: Heart },
                  { label: "Total Deposits", value: deposits.length, icon: Coins },
                  { label: "Active Suspensions", value: activeSuspensions, icon: Shield },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border bg-card p-4 space-y-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-xs text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="rounded-xl border bg-card p-3">
                  <p className="text-xs text-muted-foreground">KYC</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">✅ {approvedKycCount}</span>
                    <span className="text-red-600">❌ {rejectedKycCount}</span>
                    <span className="text-orange-500">⏳ {pendingKyc.length}</span>
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Cases</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">✅ {approvedCasesCount}</span>
                    <span className="text-red-600">❌ {rejectedCasesCount}</span>
                    <span className="text-blue-600">✅ {completedCasesCount}</span>
                    <span className="text-orange-500">⏳ {pendingCases.length}</span>
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Deposits</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-green-600">✅ {approvedDepositsCount}</span>
                    <span className="text-red-600">❌ {rejectedDepositsCount}</span>
                    <span className="text-orange-500">⏳ {pendingDeposits.length}</span>
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Suspensions</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-red-600">🚫 {activeSuspensions}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-3 mt-4">
              <UserSearchBox usersList={usersList} onSuspendChange={loadData} onManualUnlock={manualUnlockUser} />
            </TabsContent>

            <TabsContent value="kyc" className="space-y-4 mt-4">
              <KycSearchBox kycList={kycList} onUpdate={updateKyc} cnicCounts={cnicCounts} />
            </TabsContent>

            <TabsContent value="cases" className="space-y-4 mt-4">
              <CaseSearchBox caseList={caseList} onUpdate={updateCase} resolutions={resByCaseId} profileMap={profileMap} />
            </TabsContent>

            <TabsContent value="verify" className="space-y-4 mt-4">
              <div className="rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Verify each help — check the receipt and amount, then confirm to add it to the case's collected total. <strong>Direct</strong> helps close the case when full. <strong>Fundraising</strong> contributions add up; when the goal is reached, go to "Pay & Close" to pay the institute yourself.</p>
              </div>
              {pendingResolutions.length === 0 ? <Empty text="No help awaiting verification" /> :
                pendingResolutions.map((r) => {
                  const c = caseList.find((cs) => cs.id === r.case_id);
                  return <VerifyCard key={r.id} r={r} c={c} profileMap={profileMap} onConfirm={confirmResolution} onReject={rejectResolution} />;
                })}
            </TabsContent>

            <TabsContent value="pay" className="space-y-4 mt-4">
              <div className="rounded-xl border bg-green-50 dark:bg-green-950/20 p-4 text-sm text-green-700 flex items-start gap-2">
                <HandCoins className="h-4 w-4 shrink-0 mt-0.5" />
                <p>These fundraising cases have reached their goal! Pay the institute's bill yourself, upload the receipt, and close the case. The seeker will be notified that everyone helped together.</p>
              </div>
              {readyToClose.length === 0 ? <Empty text="No cases ready to pay yet" /> :
                readyToClose.map((c) => <PayCloseCard key={c.id} c={c} profileMap={profileMap} onClose={markAsPaidAndClose} />)}
            </TabsContent>

            <TabsContent value="deposits" className="space-y-4 mt-4">
              <DepositSearchBox deposits={deposits} onApprove={approveDeposit} onReject={rejectDeposit} />
            </TabsContent>

            <TabsContent value="notify" className="mt-4">
              <NotifyPanel profiles={profiles} kycList={kycList} caseList={caseList} />
            </TabsContent>

            <TabsContent value="offers" className="mt-4">
              <OffersPanel offers={offers} onReload={reloadOffers} />
            </TabsContent>

            <TabsContent value="support" className="mt-4">
              <SupportPanel allMsgs={supportMsgs} profileMap={profileMap} onNewMessage={loadSupportMessages} unreadCount={unreadSupport} />
            </TabsContent>

            <TabsContent value="feedback" className="space-y-4 mt-4">
              {feedbacks.length === 0 ? <Empty text="No feedback yet" /> :
                feedbacks.map((fb) => <FeedbackCard key={fb.id} fb={fb} profileMap={profileMap} caseList={caseList} onUpdate={updateFeedback} />)}
            </TabsContent>

            <TabsContent value="suspensions" className="space-y-4 mt-4">
              <SuspensionsPanel suspensions={suspensions} profiles={profiles} onUnlock={manualUnlockUser} onReload={loadData} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}

// ============================================================
//  SUSPENSIONS PANEL
// ============================================================
function SuspensionsPanel({ suspensions, profiles, onUnlock, onReload }: any) {
  const activeSuspensions = suspensions.filter((s: any) => s.is_active);
  const totalSuspensions = suspensions.length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground flex items-start gap-2">
        <Shield className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p><strong>Total Suspensions:</strong> {totalSuspensions} · <strong>Active:</strong> {activeSuspensions.length}</p>
          <p className="text-xs mt-1">Each suspension costs 5 credits to unlock. Users can unlock themselves from the submit page.</p>
        </div>
      </div>

      {activeSuspensions.length === 0 ? <Empty text="No active suspensions" /> :
        activeSuspensions.map((s: any) => {
          const profile = profiles.find((p: any) => p.user_id === s.user_id);
          return (
            <div key={s.id} className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  <span className="font-semibold">{profile?.full_name || "Unknown User"}</span>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Suspended</span>
                </div>
                <span className="text-xs text-muted-foreground">Suspension #{s.suspension_count}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                <div><p className="text-xs text-muted-foreground">User ID</p><p className="font-mono text-xs">{s.user_id.slice(0, 12)}...</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm">{profile?.email || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Rejections at Suspension</p><p className="text-sm font-semibold text-red-600">{s.rejection_count_at_suspension}</p></div>
                <div><p className="text-xs text-muted-foreground">Suspended At</p><p className="text-sm">{new Date(s.suspended_at).toLocaleDateString()}</p></div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-red-200">
                <Button size="sm" variant="outline" className="text-green-600 border-green-300" onClick={() => onUnlock(s.user_id)}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Manually Unlock
                </Button>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(s.user_id); toast.success("User ID copied!"); }}>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy ID
                </Button>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

// ============================================================
//  SEARCH BOXES
// ============================================================
function KycSearchBox({ kycList, onUpdate, cnicCounts }: any) {
  const [search, setSearch] = useState("");
  const sortedKyc = [...kycList].sort((a: any, b: any) => {
    const order: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });
  const filtered = search.trim()
    ? sortedKyc.filter((k: any) =>
        k.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        k.cnic_number?.replace(/\D/g, "").includes(search.replace(/\D/g, "")) ||
        k.user_id?.toLowerCase().includes(search.toLowerCase()))
    : sortedKyc;
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search KYC by name, CNIC, or user ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11" />
      </div>
      {filtered.length === 0 ? <Empty text="No matching KYC submissions" /> :
        filtered.map((kyc: any) => {
          const c = cleanCnic(kyc.cnic_number);
          const dupCount = c ? (cnicCounts[c] ?? 0) : 0;
          return <KycCard key={kyc.id} kyc={kyc} onUpdate={onUpdate} dupCount={dupCount} />;
        })
      }
    </div>
  );
}

function CaseSearchBox({ caseList, onUpdate, resolutions, profileMap }: any) {
  const [search, setSearch] = useState("");
  const sortedCases = [...caseList].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, approved: 1, rejected: 2, completed: 3 };
    return (order[a.status] ?? 4) - (order[b.status] ?? 4);
  });
  const filtered = search.trim()
    ? sortedCases.filter((c: any) =>
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.category?.toLowerCase().includes(search.toLowerCase()) ||
        c.user_id?.toLowerCase().includes(search.toLowerCase()) ||
        c.cnic_number?.replace(/\D/g, "").includes(search.replace(/\D/g, "")) ||
        profileMap[c.user_id]?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        profileMap[c.user_id]?.email?.toLowerCase().includes(search.toLowerCase()))
    : sortedCases;
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search cases by title, category, name, CNIC, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11" />
      </div>
      {filtered.length === 0 ? <Empty text="No matching cases" /> :
        filtered.map((c: any) => <CaseCard key={c.id} c={c} onUpdate={onUpdate} resolutions={resolutions[c.id] ?? []} profileMap={profileMap} />)
      }
    </div>
  );
}

function DepositSearchBox({ deposits, onApprove, onReject }: any) {
  const [search, setSearch] = useState("");
  const sorted = [...deposits].sort((a, b) => {
    const order: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });
  const filtered = search.trim()
    ? sorted.filter((d: any) =>
        d.user_id?.toLowerCase().includes(search.toLowerCase()) ||
        d.transaction_id?.toLowerCase().includes(search.toLowerCase()))
    : sorted;
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search deposits by user ID or transaction ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11" />
      </div>
      {filtered.length === 0 ? <Empty text="No matching deposits" /> :
        filtered.map((d: any) => <DepositCard key={d.id} d={d} onApprove={onApprove} onReject={onReject} />)
      }
    </div>
  );
}

function UserSearchBox({ usersList, onSuspendChange, onManualUnlock }: any) {
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? usersList.filter((u: any) =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.cnic?.replace(/\D/g, "").includes(search.replace(/\D/g, "")) ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.user_id?.toLowerCase().includes(search.toLowerCase()))
    : usersList;
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users by email, CNIC, name, or user ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-11" />
      </div>
      {filtered.length === 0 ? <Empty text="No matching users" /> :
        filtered.map((u: any) => <UserCard key={u.user_id} u={u} onSuspendChange={onSuspendChange} onManualUnlock={onManualUnlock} />)
      }
    </div>
  );
}

// ============================================================
//  USER CARD
// ============================================================
function UserCard({ u, onSuspendChange, onManualUnlock }: any) {
  const [open, setOpen] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [reason, setReason] = useState("");

  async function toggleSuspend() {
    setSuspending(true);
    try {
      const newStatus = !u.isSuspended;
      await adminUpdateProfile(u.user_id, {
        is_suspended: newStatus,
        suspended_reason: newStatus ? (reason || "Repeated fraudulent cases/deposits") : null,
        suspended_at: newStatus ? new Date().toISOString() : null,
      });
      if (newStatus) {
        const existing = await adminGetUserSuspension(u.user_id);
        await adminUpsertUserSuspension({
          user_id: u.user_id,
          suspension_count: (existing?.suspension_count || 0) + 1,
          is_active: true,
          suspended_at: new Date().toISOString(),
          rejection_count_at_suspension: u.rejectedCases || 0,
        });
      } else {
        await adminUpsertUserSuspension({ user_id: u.user_id, is_active: false, unlocked_at: new Date().toISOString() });
      }
      toast.success(newStatus ? "User suspended." : "User unsuspended.");
      onSuspendChange();
    } catch { toast.error("Failed to update suspension status."); }
    finally { setSuspending(false); }
  }

  return (
    <div className={`rounded-xl border bg-card overflow-hidden ${u.isSuspended ? "border-red-400" : ""}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors text-left">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {(u.name?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate flex items-center gap-1.5">
              {u.name || "Unknown"}
              {u.isSuspended && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">SUSPENDED</span>}
              {u.suspensionCount > 0 && !u.isSuspended && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">#{u.suspensionCount}</span>}
            </p>
            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={u.kycStatus} />
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 gap-2 pt-3">
            <Stat icon={<Shield className="h-4 w-4" />} label="KYC Status" value={u.kycStatus === "none" ? "Not submitted" : u.kycStatus} />
            <Stat icon={<Wallet className="h-4 w-4" />} label="Wallet Balance" value={`${u.walletBalance} credits`} />
            <Stat icon={<FileText className="h-4 w-4" />} label="Cases Submitted" value={u.casesSubmitted} />
            <Stat icon={<XCircle className="h-4 w-4" />} label="Rejected Cases" value={u.rejectedCases} />
            <Stat icon={<Heart className="h-4 w-4" />} label="Cases Helped" value={u.casesUnlocked} />
            <Stat icon={<Coins className="h-4 w-4" />} label="Total Deposited" value={`${u.totalDeposited} credits`} />
          </div>
          {u.suspensionCount > 0 && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 p-2 text-xs">
              <p className="text-red-700 font-semibold">🚫 Suspension History</p>
              <p className="text-red-600">Suspended {u.suspensionCount} time(s) · {u.isSuspended ? "Currently suspended" : "Currently active"}</p>
            </div>
          )}
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
            <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {u.email}</p>
            {u.cnic && <p className="font-mono">CNIC: {u.cnic}</p>}
            <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined: {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}</p>
            <p className="font-mono text-[10px]">ID: {u.user_id}</p>
          </div>

          <div className="flex gap-2">
            {u.isSuspended && (
              <Button size="sm" variant="outline" className="text-green-600 border-green-300 flex-1" onClick={() => onManualUnlock(u.user_id)}>
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Unlock Manually
              </Button>
            )}
            <Button size="sm" variant="outline" className="flex-1" onClick={() => { navigator.clipboard.writeText(u.user_id); toast.success("User ID copied!"); }}>
              <Copy className="h-3.5 w-3.5 mr-1" /> Copy ID
            </Button>
          </div>

          <div className={`rounded-xl border p-3 space-y-2 ${u.isSuspended ? "bg-red-50 dark:bg-red-950/20 border-red-300" : "bg-card border-border"}`}>
            {u.isSuspended ? (
              <>
                <p className="text-xs font-semibold text-red-700">⛔ Account Suspended</p>
                {u.suspendedReason && <p className="text-xs text-red-600">Reason: {u.suspendedReason}</p>}
                <Button size="sm" variant="outline" disabled={suspending} onClick={toggleSuspend} className="w-full">Unsuspend Account</Button>
              </>
            ) : (
              <>
                <Textarea placeholder="Suspension reason (e.g. repeated fraudulent cases/deposits)" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="text-xs" />
                <Button size="sm" variant="destructive" disabled={suspending} onClick={toggleSuspend} className="w-full">Suspend This Account</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  PAY & CLOSE CARD
// ============================================================
function PayCloseCard({ c, profileMap, onClose }: any) {
  const cur = c.currency || "USD";
  const s = sym(cur);
  const seeker = profileMap[c.user_id];
  const [receiptUrl, setReceiptUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [closing, setClosing] = useState(false);

  async function uploadReceipt(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      const path = `paid_receipts/${c.id}/${Date.now()}_receipt`;
      const url = await uploadFileToStorage(file, path);
      setReceiptUrl(url);
      toast.success("Receipt uploaded!");
    } catch { toast.error("Upload failed."); }
    finally { setUploading(false); }
  }

  return (
    <div className="rounded-xl border-2 border-green-300 bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">GOAL REACHED 🎉</span>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>
      </div>
      <p className="font-semibold text-sm">{c.title}</p>
      <p className="text-xs text-green-600 font-medium">Raised: {s} {c.amount_collected} of {s} {c.amount_needed} ✅</p>

      <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-xs space-y-0.5">
        <p className="font-semibold flex items-center gap-1"><Users className="h-3 w-3" /> Seeker</p>
        <p className="text-muted-foreground">{seeker?.full_name || "—"} · {seeker?.email || c.user_id?.slice(0, 8)}</p>
      </div>

      <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 space-y-1">
        <p className="font-semibold text-xs flex items-center gap-1 text-amber-700 dark:text-amber-400"><Building2 className="h-3.5 w-3.5" /> Pay this institute:</p>
        <p className="text-xs"><strong>{c.institute_name}</strong> · {c.payment_method}</p>
        <p className="text-xs font-mono">{c.account_number} {c.account_iban ? `· ${c.account_iban}` : ""}</p>
      </div>

      <div className="space-y-2 pt-1 border-t border-border">
        <label className="text-xs font-medium">Upload your payment receipt (after you pay the bill):</label>
        <Input type="file" accept="image/*,.pdf" onChange={(e) => uploadReceipt(e.target.files?.[0] ?? null)} className="text-sm" />
        {uploading && <p className="text-xs text-amber-600">⏳ Uploading...</p>}
        {receiptUrl && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Receipt uploaded</p>}
        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={closing || uploading}
          onClick={async () => { setClosing(true); await onClose(c, receiptUrl); setClosing(false); }}>
          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark as Paid & Close Case
        </Button>
        <p className="text-[11px] text-muted-foreground">Pay the institute, upload the receipt, then close. The seeker sees the receipt and gets a thank-you notification.</p>
      </div>
    </div>
  );
}

// ============================================================
//  VERIFY CARD
// ============================================================
function VerifyCard({ r, c, profileMap, onConfirm, onReject }: any) {
  const cur = c?.currency || "USD";
  const s = sym(cur);
  const helper = profileMap[r.hero_id];
  const seeker = profileMap[r.seeker_id];
  const confirmedAmt = r.seeker_confirmed_amount ?? r.amount_paid;
  const amountNeeded = Number(c?.amount_needed ?? 0);
  const collected = Number(c?.amount_collected ?? 0);
  const afterThis = collected + Number(confirmedAmt ?? 0);
  const isFundraising = r.paid_to === "givethra";
  const willClose = !isFundraising && amountNeeded > 0 && afterThis >= amountNeeded;
  const goalReached = amountNeeded > 0 && afterThis >= amountNeeded;

  return (
    <div className="rounded-xl border-2 border-primary/30 bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">AWAITING VERIFICATION</span>
        {isFundraising
          ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">FUNDRAISING (paid to Givethra)</span>
          : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">DIRECT (paid to institute)</span>}
        {c && <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{c.category}</span>}
      </div>

      {c && <p className="font-semibold text-sm">{c.title}</p>}

      <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-xs space-y-1">
        <p><span className="text-muted-foreground">Helper:</span> {helper?.full_name || "—"} · {helper?.email || r.hero_id?.slice(0, 8)}</p>
        <p><span className="text-muted-foreground">Seeker:</span> {seeker?.full_name || "—"} · {seeker?.email || r.seeker_id?.slice(0, 8)}</p>
      </div>

      <div className="text-sm space-y-1">
        <p><span className="text-muted-foreground">Type:</span> {r.resolution_type}</p>
        <p><span className="text-muted-foreground">Amount:</span> <strong className="text-primary">{s} {confirmedAmt} {cur}</strong></p>
        <p><span className="text-muted-foreground">TXN ID:</span> <span className="font-mono">{r.transaction_id}</span></p>
        {r.notes && <p><span className="text-muted-foreground">Notes:</span> {r.notes}</p>}
      </div>

      {r.receipt_url && (
        <a href={r.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary text-sm font-medium">
          <ExternalLink className="h-4 w-4" /> View Payment Receipt
        </a>
      )}

      {amountNeeded > 0 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-xs">
          <p>Goal <strong>{s} {amountNeeded}</strong> · collected <strong>{s} {collected}</strong> → after this <strong>{s} {afterThis}</strong></p>
          {isFundraising
            ? <p className="mt-0.5">{goalReached ? "→ Goal reached! Go to 'Pay & Close' after verifying ✅" : `→ ${s} ${amountNeeded - afterThis} still needed (keeps fundraising)`}</p>
            : <p className="mt-0.5">{willClose ? "→ Case will COMPLETE ✅" : `→ ${s} ${amountNeeded - afterThis} remaining (stays open)`}</p>}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => onConfirm(r)}>
          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Verify & Add {s} {confirmedAmt}
        </Button>
        <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => onReject(r)}>
          <XCircle className="h-3.5 w-3.5 mr-1" /> Dispute
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">⚠️ Check the receipt before verifying. {isFundraising ? "This money came to Givethra — you'll pay the institute once the goal is reached." : "This was paid directly to the institute."}</p>
    </div>
  );
}

// ============================================================
//  NOTIFY PANEL
// ============================================================
function NotifyPanel({ profiles, kycList, caseList }: any) {
  const [group, setGroup] = useState("all");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("/");
  const [sending, setSending] = useState(false);

  const kycByUser: Record<string, string> = {};
  for (const k of kycList) { if (!(k.user_id in kycByUser)) kycByUser[k.user_id] = k.status; }
  const caseCountByUser: Record<string, number> = {};
  for (const c of caseList) {
    if (["pending", "approved", "completed"].includes(c.status)) {
      caseCountByUser[c.user_id] = (caseCountByUser[c.user_id] ?? 0) + 1;
    }
  }

  function targetUsers(): string[] {
    const all = profiles.map((p: any) => p.user_id).filter(Boolean);
    if (group === "all") return all;
    if (group === "no_kyc") return all.filter((uid: string) => kycByUser[uid] !== "approved");
    if (group === "kyc_no_case") return all.filter((uid: string) => kycByUser[uid] === "approved" && !caseCountByUser[uid]);
    if (group === "kyc_approved") return all.filter((uid: string) => kycByUser[uid] === "approved");
    if (group === "submitted_case") return all.filter((uid: string) => (caseCountByUser[uid] ?? 0) > 0);
    return all;
  }

  const count = targetUsers().length;

  const GROUPS = [
    { key: "all", label: "All Users", desc: "Everyone who signed up" },
    { key: "no_kyc", label: "No KYC yet", desc: "Signed up but not verified" },
    { key: "kyc_no_case", label: "KYC done, no case", desc: "Verified but haven't submitted their free case" },
    { key: "kyc_approved", label: "All Verified", desc: "Everyone verified" },
    { key: "submitted_case", label: "Submitted a case", desc: "Users who already submitted a case" },
  ];

  const TEMPLATES = [
    { label: "Do your KYC", title: "Complete your KYC ✅", msg: "You're almost there! Complete your identity verification (KYC) to unlock Givethra. Tap here to finish.", link: "/kyc" },
    { label: "Submit free case", title: "Your First Case is FREE 🎉", msg: "Your KYC is approved! Now submit your first case completely FREE — no fee. Tap here to start.", link: "/submit-request" },
    { label: "Become a Hero", title: "Become a Hero 🤲", msg: "You can help someone in need — directly or by contributing any amount. Tap here to help.", link: "/cases" },
    { label: "Unlock Suspended", title: "Unlock Your Account 🔓", msg: "Your account is suspended. Deposit 5 credits and unlock your account to continue using Givethra.", link: "/submit-request" },
  ];

  async function send() {
    if (!title.trim() || !message.trim()) { toast.error("Please enter title and message"); return; }
    const users = targetUsers();
    if (users.length === 0) { toast.error("No users in this group"); return; }
    if (!confirm(`Send this notification to ${users.length} user(s)?`)) return;
    setSending(true);
    try {
      let ok = 0;
      for (const uid of users) {
        try { await sendNotification(uid, "admin_broadcast", title.trim(), message.trim(), link || "/"); ok++; } catch {}
      }
      toast.success(`Sent to ${ok} user(s)!`);
      setTitle(""); setMessage("");
    } catch { toast.error("Something went wrong."); }
    finally { setSending(false); }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground flex items-start gap-2">
        <Megaphone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>Send a notification to a group of users. It appears in their bell 🔔 and takes them to the page you choose.</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Quick fill (optional)</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.label} type="button" onClick={() => { setTitle(t.title); setMessage(t.msg); setLink(t.link); }}
              className="text-xs border border-border rounded-full px-3 py-1.5 hover:bg-muted">{t.label}</button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Send to</p>
        <div className="space-y-2">
          {GROUPS.map((g) => (
            <button key={g.key} type="button" onClick={() => setGroup(g.key)}
              className={`w-full text-left rounded-xl border p-3 transition-colors ${group === g.key ? "border-primary bg-primary/5" : "border-border"}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{g.label}</span>
                {group === g.key && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">{g.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-muted-foreground">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Your First Case is FREE 🎉" />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-muted-foreground">Message</label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Write your message..." />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-muted-foreground">When tapped, go to</label>
        <select value={link} onChange={(e) => setLink(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm">
          <option value="/">Home</option>
          <option value="/kyc">KYC page</option>
          <option value="/submit-request">Submit a case</option>
          <option value="/cases">Browse cases (Heroes)</option>
          <option value="/wallet">Wallet</option>
          <option value="/my-cases">My Cases</option>
        </select>
      </div>
      <Button className="w-full h-11 font-semibold" disabled={sending} onClick={send}>
        <Send className="h-4 w-4 mr-2" />{sending ? "Sending..." : `Send to ${count} user(s)`}
      </Button>
    </div>
  );
}

// ============================================================
//  OFFERS PANEL
// ============================================================
function OffersPanel({ offers, onReload }: any) {
  const offerMap: Record<string, any> = {};
  for (const o of offers) offerMap[o.category] = o;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground flex items-start gap-2">
        <Gift className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>Turn on a free-listing offer for any category. (Note: every user's FIRST case is always free, separate from this.)</p>
      </div>
      {ALL_CATEGORIES.map((cat) => (
        <OfferRow key={cat} category={cat} offer={offerMap[cat]} onReload={onReload} />
      ))}
    </div>
  );
}

function OfferRow({ category, offer, onReload }: any) {
  const [active, setActive] = useState(offer?.is_active ?? false);
  const [limit, setLimit] = useState<string>(String(offer?.free_limit ?? 50));
  const [label, setLabel] = useState(offer?.label ?? "");
  const [saving, setSaving] = useState(false);
  const used = offer?.used_count ?? 0;

  useEffect(() => {
    setActive(offer?.is_active ?? false);
    setLimit(String(offer?.free_limit ?? 50));
    setLabel(offer?.label ?? "");
  }, [offer]);

  async function save(newActive: boolean) {
    setSaving(true);
    try {
      await adminUpsertCategoryOffer({ category, is_active: newActive, free_limit: parseInt(limit) || 0, label: label || null, updated_at: new Date().toISOString() });
      setActive(newActive);
      toast.success(newActive ? `Offer ON for ${category}` : `Offer OFF for ${category}`);
      onReload();
    } catch { toast.error("Failed to save offer."); }
    finally { setSaving(false); }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await adminUpsertCategoryOffer({ category, is_active: active, free_limit: parseInt(limit) || 0, label: label || null, updated_at: new Date().toISOString() });
      toast.success(`Saved settings for ${category}`);
      onReload();
    } catch { toast.error("Failed to save."); }
    finally { setSaving(false); }
  }

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${active ? "border-green-300 bg-green-50/50 dark:bg-green-950/10" : "bg-card"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-sm">{category}</p>
          {offer && <p className="text-xs text-muted-foreground">{used} / {offer.free_limit} free used</p>}
        </div>
        <Button size="sm" disabled={saving} className={active ? "bg-green-600 hover:bg-green-700 text-white" : ""} variant={active ? "default" : "outline"} onClick={() => save(!active)}>
          {active ? "Offer ON" : "Offer OFF"}
        </Button>
      </div>
      {active && (
        <div className="space-y-2 pt-1 border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Free limit (1–100)</label>
              <Input type="number" min="1" max="100" value={limit} onChange={(e) => setLimit(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Label (e.g. Muharram)</label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Muharram Offer" className="h-9" />
            </div>
          </div>
          <Button size="sm" variant="outline" className="w-full" disabled={saving} onClick={saveSettings}>Save Settings</Button>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  SUPPORT PANEL (FIXED CHAT)
// ============================================================
function SupportPanel({ allMsgs, profileMap, onNewMessage, unreadCount }: any) {
  const [activeUser, setActiveUser] = useState<string | null>(null);


  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [liveMsgs, setLiveMsgs] = useState<any[]>(allMsgs);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLiveMsgs(allMsgs); }, [allMsgs]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [reply]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMsgs, activeUser]);

  const byUser: Record<string, any[]> = {};
  for (const m of liveMsgs) {
    if (!byUser[m.user_id]) byUser[m.user_id] = [];
    byUser[m.user_id].push(m);
  }

  const conversations = Object.keys(byUser).map((uid) => {
    const msgs = byUser[uid];
    const last = msgs[msgs.length - 1];
    const unread = msgs.filter((m) => m.sender === "user" && !m.is_read).length;
    const p = profileMap[uid];
    return { uid, name: p?.full_name || "Unknown", email: p?.email || uid.slice(0, 8), last, unread, count: msgs.length };
  }).sort((a, b) => new Date(b.last?.created_at ?? 0).getTime() - new Date(a.last?.created_at ?? 0).getTime());

  async function openChat(uid: string) {
    setActiveUser(uid);
    await adminSendSupportReply({ user_id: uid, mark_read: true });
    setLiveMsgs((prev) => prev.map((m) => (m.user_id === uid && m.sender === "user") ? { ...m, is_read: true } : m));
    if (onNewMessage) onNewMessage();
  }

  async function uploadAttachment(file: File): Promise<string> {
    const path = `support_attachments/${Date.now()}_${file.name}`;
    const url = await uploadFileToStorage(file, path);
    return url;
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large! Maximum 10MB allowed.");
      return;
    }
    setAttachmentFile(file);
    setAttachmentPreview(URL.createObjectURL(file));
    toast.success(`📎 ${file.name} selected`);
  }

  function removeAttachment() {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function sendReply() {
    if ((!reply.trim() && !attachmentFile) || !activeUser) return;
    setSending(true);
    try {
      let attachmentUrl = "";
      if (attachmentFile) {
        try {
          attachmentUrl = await uploadAttachment(attachmentFile);
        } catch { toast.error("Failed to upload attachment"); setSending(false); return; }
      }

      const newMsg = await adminSendSupportReply({
        user_id: activeUser,
        message: reply.trim() || null,
        attachment_url: attachmentUrl || null,
      });

      setLiveMsgs((prev) => [...prev, newMsg]);
      setReply("");
      setAttachmentFile(null);
      setAttachmentPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("Reply sent!");
    } catch (err) {
      toast.error("Failed to send reply.");
      console.error(err);
    } finally {
      setSending(false);
    }
  }

  if (activeUser) {
    const msgs = byUser[activeUser] ?? [];
    const conv = conversations.find((c) => c.uid === activeUser);
    return (
      <div className="rounded-2xl border bg-card flex flex-col" style={{ height: "70vh" }}>
        <div className="flex items-center gap-2 p-3 border-b border-border bg-muted/20">
          <button onClick={() => { setActiveUser(null); if (onNewMessage) onNewMessage(); }} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate">{conv?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{conv?.email}</p>
          </div>
          {conv?.unread > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{conv.unread} new</span>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10">
          {msgs.map((m) => {
            const isAdmin = m.sender === "admin";
            return (
              <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm break-words ${isAdmin ? "bg-primary text-white rounded-br-sm" : "bg-white border border-border rounded-bl-sm"}`}>
                  {m.message && <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>}
                  {m.attachment_url && (
                    <div className="mt-2">
                      {m.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                        <a href={m.attachment_url} target="_blank" rel="noopener noreferrer">
                          <img src={m.attachment_url} alt="Attachment" className="max-w-full max-h-48 rounded-lg border" />
                        </a>
                      ) : (
                        <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs underline bg-primary/10 px-2 py-1 rounded-lg">
                          <FileText className="h-3 w-3" /> View Attachment
                        </a>
                      )}
                    </div>
                  )}
                  <p className={`text-[10px] mt-1 ${isAdmin ? "text-white/70" : "text-muted-foreground"}`}>
                    {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div className="flex flex-col gap-2 p-3 border-t border-border bg-card">
          {attachmentPreview && (
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
              {attachmentFile?.type.startsWith("image/") ? (
                <img src={attachmentPreview} alt="Attachment preview" className="h-10 w-10 rounded object-cover" />
              ) : (
                <FileText className="h-8 w-8 text-muted-foreground" />
              )}
              <span className="text-xs flex-1 truncate">{attachmentFile?.name}</span>
              <button onClick={removeAttachment} className="text-red-500 hover:text-red-700">
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
              placeholder="Type your reply... (Shift+Enter for new line)"
              className="flex-1 min-h-[44px] max-h-[200px] resize-none overflow-y-auto"
              rows={1}
            />
            <div className="flex items-center gap-1">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" />
              <Button type="button" variant="ghost" size="icon" className="h-11 w-11 shrink-0 text-muted-foreground hover:text-primary" onClick={() => fileInputRef.current?.click()} disabled={sending}>
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button onClick={sendReply} disabled={sending || (!reply.trim() && !attachmentFile)} size="icon" className="shrink-0 rounded-full h-11 w-11">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground px-1">
            <span>Supported: Images, PDF, DOC, TXT (max 10MB)</span>
            {attachmentFile && <span className="text-green-600">📎 {attachmentFile.name}</span>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.length === 0 ? <Empty text="No support messages yet" /> :
        conversations.map((c) => (
          <button key={c.uid} onClick={() => openChat(c.uid)}
            className="w-full flex items-center justify-between gap-3 rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {(c.name?.[0] ?? "U").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{c.name}</p>
                <p className="text-xs text-muted-foreground truncate">{c.last?.message || "📎 Attachment"}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {c.unread > 0 && <span className="bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 font-bold">{c.unread} new</span>}
              <span className="text-[10px] text-muted-foreground">{c.last ? new Date(c.last.created_at).toLocaleDateString() : ""}</span>
            </div>
          </button>
        ))
      }
    </div>
  );
}

// ============================================================
//  GENERIC HELPERS
// ============================================================
function Empty({ text }: { text: string }) {
  return <div className="text-center py-12 text-muted-foreground"><ClipboardCheck className="h-10 w-10 mx-auto opacity-30 mb-2" /><p>{text}</p></div>;
}

function StatusBadge({ status }: { status: string }) {
  const c: any = { pending: "bg-orange-100 text-orange-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700", completed: "bg-blue-100 text-blue-700", none: "bg-gray-100 text-gray-600" };
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c[status] ?? "bg-gray-100"}`}>{status === "none" ? "NO KYC" : status?.toUpperCase()}</span>;
}

function Stat({ icon, label, value }: any) {
  return (
    <div className="rounded-lg bg-card border border-border p-2.5">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        <span className="text-primary">{icon}</span>
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-bold text-foreground capitalize">{value}</p>
    </div>
  );
}

// ============================================================
//  KYC CARD
// ============================================================
function KycCard({ kyc, onUpdate, dupCount }: any) {
  const [reason, setReason] = useState("");
  const isDuplicate = dupCount > 1;
  const isPending = kyc.status === "pending";
  const isApproved = kyc.status === "approved";
  const isReKyc = kyc.status === "re_kyc";
  const isDuplicateStatus = kyc.status === "duplicate";
  const isRejected = kyc.status === "rejected";

  return (
    <div className={`rounded-xl border bg-card p-4 space-y-3 ${isDuplicate && isPending ? "border-red-300" : ""}`}>
      {isDuplicate && isPending && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 p-2.5 text-xs text-red-700 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <p><strong>⚠️ Duplicate CNIC!</strong> Used in <strong>{dupCount} active KYC submissions</strong>. Review carefully.</p>
        </div>
      )}
      <StatusBadge status={kyc.status} />
      <div className="text-sm space-y-1">
        <p className="font-semibold">{kyc.full_name}</p>
        <p className="text-muted-foreground">Type: {kyc.document_type?.toUpperCase()} {kyc.cnic_number && `· ${kyc.cnic_number}`}</p>
        <p className="text-muted-foreground">{kyc.address}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {kyc.cnic_front_url && <Img url={kyc.cnic_front_url} label="CNIC Front" />}
        {kyc.cnic_back_url && <Img url={kyc.cnic_back_url} label="CNIC Back" />}
        {kyc.selfie_url && <Img url={kyc.selfie_url} label="Selfie" />}
        {kyc.passport_url && <a href={kyc.passport_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1"><FileText className="h-3 w-3" /> Passport</a>}
        {kyc.face_video_url && (
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Face Video</p>
            <video src={kyc.face_video_url} controls className="w-full rounded border max-h-24" />
          </div>
        )}
      </div>

      {isPending && (
        <div className="space-y-2">
          <Textarea placeholder="Rejection reason (if rejecting)" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="text-sm" />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onUpdate(kyc.id, "approved", "", "approve")}>
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => onUpdate(kyc.id, "rejected", reason, "reject")}>
              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
            </Button>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="space-y-2">
          <Textarea placeholder="Reason for Re-KYC or Duplicate" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="text-sm" />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="text-amber-600 border-amber-300" onClick={() => {
              if (!reason.trim()) { toast.error("Please provide a reason for re-kyc"); return; }
              onUpdate(kyc.id, "re_kyc", reason, "re_kyc");
            }}>
              <RotateCw className="h-3.5 w-3.5 mr-1" /> Re-KYC
            </Button>
            <Button size="sm" variant="destructive" onClick={() => {
              if (!confirm("Are you sure you want to mark this as DUPLICATE and BAN the user?")) return;
              onUpdate(kyc.id, "duplicate", reason || "Duplicate KYC", "duplicate");
            }}>
              <Ban className="h-3.5 w-3.5 mr-1" /> Duplicate - Ban
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">⚡ <strong>Re-KYC:</strong> User will be asked to resubmit KYC. <strong>Duplicate - Ban:</strong> Marks as duplicate and bans the user permanently.</p>
        </div>
      )}

      {isReKyc && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-300 p-3 text-sm text-blue-700">
          <p><strong>🔄 Re-KYC Requested</strong></p>
          <p>User has been notified to resubmit KYC. Reason: {kyc.rejection_reason || "CNIC correction needed"}</p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" className="text-amber-600 border-amber-300" onClick={() => {
              if (!reason.trim()) { toast.error("Please provide a reason"); return; }
              onUpdate(kyc.id, "re_kyc", reason, "re_kyc");
            }}>
              <RotateCw className="h-3.5 w-3.5 mr-1" /> Re-KYC Again
            </Button>
            <Button size="sm" variant="destructive" onClick={() => {
              if (!confirm("Are you sure you want to mark this as DUPLICATE and BAN the user?")) return;
              onUpdate(kyc.id, "duplicate", reason || "Duplicate KYC", "duplicate");
            }}>
              <Ban className="h-3.5 w-3.5 mr-1" /> Duplicate - Ban
            </Button>
          </div>
        </div>
      )}

      {isDuplicateStatus && (
        <div className="rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 p-3 text-sm text-red-700">
          <p><strong>🚫 Duplicate KYC - User Banned</strong></p>
          <p>This KYC was marked as duplicate and the user account has been suspended.</p>
          <p className="text-xs mt-1 text-red-600">User cannot submit any cases.</p>
        </div>
      )}

      {isRejected && (
        <div className="rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-300 p-3 text-sm text-muted-foreground">
          <p><strong>❌ KYC Rejected</strong></p>
          <p>Reason: {kyc.rejection_reason || "No reason provided"}</p>
          <p className="text-xs mt-1">User can resubmit KYC.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  DETAIL ROW
// ============================================================
function DetailRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
        <p className={`text-sm font-medium break-all ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button type="button" onClick={() => copyText(value)}
        className="shrink-0 h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-primary">
        <Copy className="h-3 w-3" />
      </button>
    </div>
  );
}

// ============================================================
//  CASE CARD (FULLY COMPLETE - ALL FIELDS VISIBLE)
// ============================================================
function CaseCard({ c, onUpdate, resolutions, profileMap }: any) {
  const [reason, setReason] = useState("");
  const cur = c.currency || "USD";
  const s = sym(cur);
  const seeker = profileMap[c.user_id];
  const hasPayment = c.institute_name || c.account_number || c.account_title || c.account_iban;
  const catDetails = c.category_details && typeof c.category_details === "object" ? c.category_details : null;
  const catDocs = catDetails?._documents && typeof catDetails._documents === "object" ? catDetails._documents : {};

  const allFields: { label: string; value: any }[] = [];
  if (catDetails) {
    const excludeKeys = new Set([
      "_documents", "edu_documents", "edu_sub_fields", "property_ownership",
      "rental_agreement_url", "landlord_cnic_url", "job_status", "gender",
      "marital_status", "is_orphan", "orphan_parent", "seeker_name",
      "seeker_contact", "receiver_name", "receiver_contact", "receiver_bank",
      "receiver_account", "disability_mode", "disability_type", "disability_reason",
      "disability_shop_name", "disability_shop_contact", "disability_hospital",
      "treatment_amount", "treatment_expiry", "treatment_patient_number",
      "disability_bank_title", "disability_bank_number", "institute_name",
      "institute_contact", "institute_address", "is_institute_in_list",
      "reference_type", "reference_number", "due_date", "edu_sub_type",
      "edu_admission_level",
    ]);
    for (const [key, val] of Object.entries(catDetails)) {
      if (excludeKeys.has(key)) continue;
      if (key.startsWith("_")) continue;
      if (typeof val === "string" && val.trim()) {
        allFields.push({ label: getDocLabel(key), value: val });
      } else if (typeof val === "number" || typeof val === "boolean") {
        allFields.push({ label: getDocLabel(key), value: String(val) });
      }
    }
  }

  const eduSubFields = catDetails?.edu_sub_fields || {};
  const eduFields: { label: string; value: any }[] = [];
  for (const [key, val] of Object.entries(eduSubFields)) {
    if (val) eduFields.push({ label: getDocLabel(key), value: val });
  }

  const personalDetails = [
    { label: "Job Status", value: catDetails?.job_status || "" },
    { label: "Gender", value: catDetails?.gender || "" },
    { label: "Marital Status", value: catDetails?.marital_status || "" },
    { label: "Orphan", value: catDetails?.is_orphan || "" },
    { label: "Orphan Parent", value: catDetails?.orphan_parent || "" },
    { label: "Seeker Name", value: catDetails?.seeker_name || "" },
    { label: "Seeker Contact", value: catDetails?.seeker_contact || "" },
  ].filter((d) => d.value);

  const receiverDetails = [
    { label: "Receiver Name", value: catDetails?.receiver_name || "" },
    { label: "Receiver Contact", value: catDetails?.receiver_contact || "" },
    { label: "Receiver Bank", value: catDetails?.receiver_bank || "" },
    { label: "Receiver Account", value: catDetails?.receiver_account || "" },
    { label: "Receiver Address", value: catDetails?.receiver_address || "" },
    { label: "Shop Name", value: catDetails?.receiver_shop_name || "" },
  ].filter((d) => d.value);

  const disabilityDetails = [
    { label: "Disability Mode", value: catDetails?.disability_mode || "" },
    { label: "Disability Type", value: catDetails?.disability_type || "" },
    { label: "Disability Reason", value: catDetails?.disability_reason || "" },
    { label: "Shop Name", value: catDetails?.disability_shop_name || "" },
    { label: "Shop Contact", value: catDetails?.disability_shop_contact || "" },
    { label: "Hospital", value: catDetails?.disability_hospital || "" },
    { label: "Treatment Amount", value: catDetails?.treatment_amount || "" },
    { label: "Treatment Expiry", value: catDetails?.treatment_expiry || "" },
    { label: "Patient/Bill Number", value: catDetails?.treatment_patient_number || "" },
    { label: "Bank Title (Stipend)", value: catDetails?.disability_bank_title || "" },
    { label: "Bank Number (Stipend)", value: catDetails?.disability_bank_number || "" },
  ].filter((d) => d.value);

  const propertyDetails = [
    { label: "Property Ownership", value: catDetails?.property_ownership === "rented" ? "Rented" : catDetails?.property_ownership === "owned" ? "Owned" : "" },
  ].filter((d) => d.value);

  const fileEntries: { key: string; label: string; url: string }[] = [];
  const pushFile = (key: string, value: unknown) => {
    if (typeof value !== "string") return;
    const url = value.trim();
    if (!url.startsWith("http")) return;
    
    // Extract original filename if present in url pathname or query
        let label = getDocLabel(key);
    try {
      const parsedUrl = new URL(url);
      // Check query parameter like filename or name if present
      const qName = parsedUrl.searchParams.get("filename") || parsedUrl.searchParams.get("name");
      let extracted = qName || "";
      if (!extracted) {
        const segments = parsedUrl.pathname.split("/");
        const lastSeg = segments[segments.length - 1];
        if (lastSeg) extracted = decodeURIComponent(lastSeg);
      }
      if (extracted) {
        // Strip leading timestamp / uuid prefix numbers if any
        const cleanName = extracted.replace(/^[0-9]{10,}[-_]?/, "").replace(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}[-_]?/i, "");
        if (cleanName && !cleanName.match(/^[0-9a-f]{8,}$/i)) {
          label = cleanName;
        } else if (extracted && !extracted.match(/^[0-9a-f]{8,}$/i)) {
          label = extracted;
        }
      }
    } catch (e) {
      // fallback to getDocLabel(key)
    }

    if (!fileEntries.some((f) => f.url === url)) {
      fileEntries.push({ key, label, url });
    }
  };

  // Top-level evidence fields
  pushFile("selfie_url", c.selfie_url);
  pushFile("video_url", c.video_url);
  pushFile("paid_receipt_url", c.paid_receipt_url);

  // photo_urls array or object
  if (Array.isArray(c.photo_urls)) {
    c.photo_urls.forEach((val, idx) => pushFile(`photo_${idx + 1}`, val));
  } else if (c.photo_urls && typeof c.photo_urls === "object") {
    for (const [k, val] of Object.entries(c.photo_urls)) pushFile(k, val);
  }

  // Deep recursive walk over category_details for any document or URL field
  const walkFilesDeep = (obj: any, prefix = "") => {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => walkFilesDeep(item, `${prefix}_${idx + 1}`));
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed.startsWith("http")) {
          pushFile(prefix ? `${prefix}_${k}` : k, trimmed);
        }
      } else if (v && typeof v === "object") {
        walkFilesDeep(v, prefix ? `${prefix}_${k}` : k);
      }
    }
  };
  walkFilesDeep(catDetails);

  const seen = new Set<string>();
  const uniqueFiles = fileEntries.filter((file) => {
    if (seen.has(file.url)) return false;
    seen.add(file.url);
    return true;
  });

  const isRejected = c.status === "rejected";

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${isRejected ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : "bg-card"}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={c.status} />
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>
        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{c.urgency}</span>
        {c.was_free
          ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">FREE</span>
          : <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">PAID</span>}
        {c.closed_by_admin && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">FUNDRAISED & PAID</span>}
      </div>

      {isRejected && c.rejection_reason && (
        <div className="rounded-lg border-2 border-red-300 bg-red-100 dark:bg-red-950/30 p-4">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700">❌ Case Rejected</p>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-line">{c.rejection_reason}</p>
              {c.reviewed_at && <p className="text-xs text-red-500 mt-2">Reviewed on: {new Date(c.reviewed_at).toLocaleString()}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="text-sm space-y-1">
        <p className="font-semibold">{c.title}</p>
        <p className="text-muted-foreground">{c.short_description}</p>
        <p className="text-muted-foreground text-xs">📍 {c.city}, {c.country} {c.amount_needed && `· Needs: ${s} ${c.amount_needed} ${cur}`}</p>
        {c.deadline && (
          <p className="text-xs font-bold text-red-600 flex items-center gap-1">
            ⏰ Bill / Case Due (Expiry) Date: {new Date(c.deadline).toLocaleDateString()}
          </p>
        )}
        {c.amount_needed > 0 && <p className="text-xs text-green-600 font-medium">Collected: {s} {c.amount_collected ?? 0} / {s} {c.amount_needed}</p>}

        {!isRejected && (
          <div className="mt-2 rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-1">📋 Full Case Description</p>
            <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
              {c.description || "No description provided"}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-xs space-y-0.5">
        <p className="font-semibold text-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Submitted by</p>
        <p className="text-muted-foreground">{seeker?.full_name || "—"} · {seeker?.email || c.user_id?.slice(0, 8)}</p>
      </div>

      {personalDetails.length > 0 && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
          <p className="text-xs font-semibold text-primary flex items-center gap-1"><User className="h-3 w-3" /> Personal Details</p>
          {personalDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {receiverDetails.length > 0 && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
          <p className="text-xs font-semibold text-primary flex items-center gap-1"><HandCoins className="h-3 w-3" /> Payment Receiver</p>
          {receiverDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {disabilityDetails.length > 0 && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
          <p className="text-xs font-semibold text-primary flex items-center gap-1"><Heart className="h-3 w-3" /> Disability Details</p>
          {disabilityDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {propertyDetails.length > 0 && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
          <p className="text-xs font-semibold text-primary flex items-center gap-1"><Building2 className="h-3 w-3" /> Property Details</p>
          {propertyDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
          {catDetails?.rental_agreement_url && <Img url={catDetails.rental_agreement_url} label="Rental Agreement" />}
          {catDetails?.landlord_cnic_url && <Img url={catDetails.landlord_cnic_url} label="Landlord's CNIC" />}
        </div>
      )}

      {eduFields.length > 0 && (
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 p-3 space-y-1">
          <p className="text-xs font-semibold text-blue-700 flex items-center gap-1"><BookOpen className="h-3 w-3" /> Education Details</p>
          {eduFields.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {allFields.length > 0 && (
        <div className="rounded-lg bg-muted/40 border border-border p-3 space-y-1">
          <p className="text-xs font-semibold text-primary flex items-center gap-1"><ClipboardCheck className="h-3 w-3" /> Other Details</p>
          {allFields.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {uniqueFiles.length > 0 ? (
        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold flex items-center gap-1"><FileText className="h-4 w-4" /> Uploaded Files ({uniqueFiles.length})</p>
            <div className="flex gap-1">
              <button onClick={() => copyText(uniqueFiles.map((f) => f.url).join("\n"))} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                <Copy className="h-3 w-3" /> Copy URLs
              </button>
              <button onClick={() => copyText(JSON.stringify(c, null, 2))} className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                <Copy className="h-3 w-3" /> Copy Raw Data
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {uniqueFiles.map(({ key, label, url }) => {
              const isVideo = url.match(/\.(mp4|webm|mov|avi)$/i) || url.includes("video");
              const isPdf = url.match(/\.pdf$/i);
              return (
                <div key={key + url} className="space-y-1 bg-background/80 p-1.5 rounded border">
                  <p className="text-[10px] font-medium text-foreground truncate" title={label}>📎 {label}</p>
                  {isVideo ? (
                    <video src={url} controls className="w-full rounded border max-h-32 bg-black" />
                  ) : isPdf ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block text-center py-4 bg-muted text-primary text-xs font-semibold rounded hover:underline">
                      📄 View PDF
                    </a>
                  ) : (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={label} className="w-full rounded border max-h-28 object-cover hover:opacity-95" />
                    </a>
                  )}
                  <a href={url} target="_blank" rel="noopener noreferrer" className="block text-[9px] text-primary hover:underline text-center">
                    Open in Full Size ↗
                  </a>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground">📌 Click any image to enlarge.</p>
        </div>
      ) : (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 p-3 text-xs text-yellow-700">
          ⚠️ No files uploaded for this case.
        </div>
      )}

      {hasPayment && (
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 space-y-1">
          <p className="font-semibold text-sm flex items-center gap-1 text-amber-700"><Building2 className="h-4 w-4" /> Institute Payment Details</p>
          <DetailRow label="Institute / Provider" value={c.institute_name} />
          <DetailRow label="Payment Method" value={c.payment_method} />
          <DetailRow label="Account Title / Reference" value={c.account_title} />
          <DetailRow label="Account / Bill Number" value={c.account_number} mono />
          <DetailRow label="IBAN" value={c.account_iban} mono />
          <DetailRow label="Institute Contact" value={c.institute_contact} mono />
          <DetailRow label="Institute Address" value={c.institute_address} />
        </div>
      )}

      {resolutions.length > 0 && (
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-2">
          <p className="font-semibold text-sm flex items-center gap-1"><Heart className="h-4 w-4 text-primary" /> All Helps on this case</p>
          {resolutions.map((r: any) => (
            <div key={r.id} className="text-xs space-y-0.5 border-b border-border/50 last:border-0 pb-2">
              <p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.status === "completed" ? "bg-green-100 text-green-700" : r.status === "disputed" ? "bg-red-100 text-red-700" : r.status === "seeker_confirmed" ? "bg-amber-100 text-amber-700" : "bg-orange-100 text-orange-700"}`}>{r.status?.toUpperCase()}</span>
                {" "}
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.paid_to === "givethra" ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-700"}`}>{r.paid_to === "givethra" ? "FUNDRAISING" : "DIRECT"}</span>
              </p>
              <p><span className="text-muted-foreground">Amount:</span> {s} {r.seeker_confirmed_amount ?? r.amount_paid} {cur} · <span className="text-muted-foreground">TXN:</span> <span className="font-mono">{r.transaction_id}</span></p>
              {r.receipt_url && <a href={r.receipt_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary"><ExternalLink className="h-3 w-3" /> Receipt</a>}
            </div>
          ))}
        </div>
      )}

      {c.status === "pending" && (
        <div className="space-y-2">
          <Textarea placeholder="Rejection reason (e.g. 'video missing', 'bill not clear', 'account seems personal')" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="text-sm" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onUpdate(c.id, "approved")}><CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve & Publish</Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => onUpdate(c.id, "rejected", reason)}><XCircle className="h-3.5 w-3.5 mr-1" /> Reject</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  DEPOSIT CARD
// ============================================================
function DepositCard({ d, onApprove, onReject }: any) {
  const [reason, setReason] = useState("");
  const [credits, setCredits] = useState<string>(String(d.credits ?? d.amount ?? ""));
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <StatusBadge status={d.status} />
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{d.method}</span>
      </div>
      <div className="text-sm space-y-1">
        <p className="font-semibold flex items-center gap-1"><Coins className="h-4 w-4 text-primary" /> User claims: ${d.amount} → {d.credits ?? d.amount} Credits</p>
        <p className="text-muted-foreground text-xs font-mono">TXN: {d.transaction_id}</p>
        <p className="text-muted-foreground text-xs">User: {d.user_id?.slice(0, 8)}...</p>
      </div>
      {d.proof_url && <Img url={d.proof_url} label="Payment Proof" />}
      {d.status === "pending" && (
        <div className="space-y-2">
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 space-y-1.5">
            <label className="text-xs font-medium text-amber-700 dark:text-amber-400">Credits to add (verify against receipt):</label>
            <input type="number" step="0.01" min="0" value={credits} onChange={(e) => setCredits(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm" placeholder="e.g. 0.99 or 10.1" />
          </div>
          <Textarea placeholder="Rejection reason (if rejecting)" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="text-sm" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onApprove(d, parseFloat(credits) || 0)}>
              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve & Add {credits || 0} Credits
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => onReject(d.id, reason)}>
              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  FEEDBACK CARD
// ============================================================
function FeedbackCard({ fb, profileMap, caseList, onUpdate }: any) {
  const [reason, setReason] = useState("");
  const p = profileMap[fb.user_id];
  const c = caseList.find((cs: any) => cs.id === fb.case_id);
  const status = fb.status || "pending_review";

  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status === "approved" ? "bg-green-100 text-green-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>{status.replace("_", " ").toUpperCase()}</span>
        {c && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span>}
      </div>
      <div className="rounded-lg bg-muted/40 border border-border p-2.5 text-xs">
        <p className="font-semibold">{p?.full_name || fb.first_name || "—"} · {p?.email || fb.user_id?.slice(0, 8)}</p>
        {c && <p className="text-muted-foreground mt-0.5">Case: {c.title}</p>}
      </div>
      {fb.text_message && <p className="text-sm whitespace-pre-line">{fb.text_message}</p>}
      {fb.video_url && <video src={fb.video_url} controls className="w-full rounded border max-h-56" />}
      {status === "pending_review" && (
        <div className="space-y-2 pt-1 border-t border-border">
          <Textarea placeholder="Rejection reason (e.g. 'video too short', 'unrelated content')" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="text-sm" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => onUpdate(fb.id, "approved")}><CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve — Post to Wall</Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => onUpdate(fb.id, "rejected", reason)}><XCircle className="h-3.5 w-3.5 mr-1" /> Reject</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
//  IMAGE COMPONENT
// ============================================================
function Img({ url, label }: { url: string; label: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-muted-foreground truncate">{label}</p>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt={label} className="w-full rounded border max-h-24 object-cover" />
      </a>
    </div>
  );
}

// ============================================================
//  ICON HELPERS
// ============================================================
function BookOpen({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
