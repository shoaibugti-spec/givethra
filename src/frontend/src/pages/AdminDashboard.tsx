// src/pages/AdminPage.tsx
// 🔥 Premium Admin Dashboard: Fast, Clean, Modern UI with All Features.
// All existing logic, API calls, and functionality are 100% preserved.

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { sendNotification } from "@/lib/notify";
import {
  Shield as ShieldIcon, CheckCircle, XCircle, ClipboardCheck, FileText, Download, ExternalLink, Heart, Coins, Users,
  ChevronDown, Wallet, Mail, Calendar, Send, ArrowLeft, Gift, AlertTriangle, Building2, Copy,
  Megaphone, HandCoins, Eye, User, Search, Paperclip, Loader2, X, RotateCw, Ban, MessageCircle, Sparkles, TrendingUp, Info,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import AdminDonationsPanel from "@/components/AdminDonationsPanel";
import AdminDreamsPanel from "@/components/AdminDreamsPanel";
import AdminHelpMePanel from "@/components/AdminHelpMePanel";
import { isExpiredCaseRecord } from "@/lib/caseExpiry";
import { helpme } from "@/lib/helpme";
import { countOpenHelpMeReports, countPendingDonationReviews, countPendingDreamSubmissions, countPendingHelpMeProofs, countPendingHelpMeVideos } from "@/lib/adminReviewCounts";
import {
  adminGetAllKyc, adminGetAllCases, adminGetAllResolutions, adminGetAllDeposits,
  adminGetAllProfiles, adminGetAllWallets, adminGetAllUnlocks, adminGetAllSupportMessages,
  adminMarkSupportMessagesAsRead, adminSendSupportReply, adminGetAllFeedbacks, adminGetAllOffers,
  adminGetAllSuspensions, adminUpdateKyc, adminUpdateCase, adminUpdateFeedback, adminUpdateResolution,
  adminUpdateDeposit, adminUpsertWallet, adminGetWithdrawals, adminUpdateWithdrawal, adminGetWalletsByUser,
  adminCloseCase, adminGetUserSuspension, adminUpsertUserSuspension, adminUpdateProfile,
  adminGetCategoryOffer, adminUpsertCategoryOffer, adminDeleteFiles, adminBroadcastNotification,
  uploadFileToStorage, adminGetDonations, adminGetDreamParticipations,
} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_EMAILS = new Set(["shoaibugti@gmail.com", "shoaibahmedbugti5@gmail.com"]);

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
  salary_slip: "Salary Slips (6 Months)", statement: "Account Statement (6 Months)", statement_url: "Account Statement (6 Months)", salary_slip_url: "Salary Slips (6 Months)",
  nikah_nama: "Nikah Nama", frc: "Family Registration Certificate (FRC)", b_form: "B-Form (Child ID)", orphan_proof: "Orphan Proof",
  father_death_cert: "Father's Death Certificate", mother_death_cert: "Mother's Death Certificate", husband_death_cert: "Husband's Death Certificate",
  wife_death_cert: "Wife's Death Certificate", divorce_cert: "Divorce Certificate", rental_agreement: "Rental Agreement", landlord_cnic: "Landlord's CNIC",
  disability_cnic: "Disability CNIC", disability_photo: "Disability Photo", product_receipt: "Product Quotation", bill: "Bill / Challan",
  student_id: "Student ID / B-Form", student_id_proof: "Student ID Proof", guardianProof: "Guardian Proof", childBirthCertificate: "Child Birth Certificate",
  contractor_agreement: "Contractor Agreement", hospital_bill: "Hospital Bill", medical_report: "Medical Report", relation_proof: "Relation Proof",
  photo_url: "Photo", admission_proof: "Admission / Selection Proof (Offer Letter)", fee_challan: "Fee Challan / Voucher",
  books_quotation: "Books Quotation", uniform_quotation: "Uniform Quotation", uniform_items: "Uniform Items List", doctor_report: "Doctor's Report / Prescription",
  owner_cnic: "Owner's CNIC", bill_owner_name: "Bill Owner Name", student_name: "Student Name", student_class: "Student Class/Grade",
  father_name: "Father Name", roll_no: "Roll No", class_grade: "Class/Grade", admission_type: "Admission Type", admission_status: "Admission Status",
  school_name: "School Name", college_name: "College Name", university_name: "University Name", program: "Program/Class", program_degree: "Program/Degree",
  year: "Year", semester_year: "Semester/Year", fee_month: "Fee Month", needed_items: "Items Needed", illness: "Illness", patient_name: "Patient Name",
  institute_name: "Institute Name", institute_contact: "Institute Contact", institute_address: "Institute Address", is_institute_in_list: "Institute in List",
  edu_sub_type: "Education Type", edu_admission_level: "Admission Level", edu_documents: "Education Documents", property_ownership: "Property Ownership",
  owner_relation: "Owner Relation", reference_number: "Reference Number", due_date: "Due Date", reference_type: "Reference Type", seeker_name: "Seeker Name",
  seeker_contact: "Seeker Contact", receiver_name: "Receiver Name", receiver_contact: "Receiver Contact", receiver_bank: "Receiver Bank",
  receiver_account: "Receiver Account", gender: "Gender", marital_status: "Marital Status", is_orphan: "Orphan", orphan_parent: "Orphan Parent",
  job_status: "Job Status", disability_mode: "Disability Mode", disability_type: "Disability Type", disability_reason: "Disability Reason",
  disability_shop_name: "Shop Name", disability_shop_contact: "Shop Contact", disability_hospital: "Hospital", treatment_amount: "Treatment Amount",
  treatment_expiry: "Treatment Expiry", treatment_patient_number: "Patient/Bill Number", disability_bank_title: "Bank Title", disability_bank_number: "Bank Number",
  selfie_url: "Case Selfie", video_url: "Case Appeal Video", paid_receipt_url: "Paid Receipt / Transaction Proof", medical_report_url: "Medical Report / Bill",
  electricity_bill_url: "Electricity Bill", cnic_front_url: "CNIC Front", cnic_back_url: "CNIC Back", income_certificate_url: "Income Certificate",
  death_certificate_url: "Death Certificate", fee_challan_url: "Fee Challan / Admission Letter", rental_agreement_url: "Rental Agreement",
  landlord_cnic_url: "Landlord CNIC", shop_agreement_url: "Shop Agreement", business_proof_url: "Business / Shop Verification",
  pension_proof_url: "Pension Slip / Pension Proof", previous_income_proof_url: "Previous Employment / Income Proof",
  disability_certificate_url: "Disability Certificate", selfie: "Case Selfie", video: "Case Appeal Video",
  salarySlipUrl: "Salary Slip (6 Months)", statementUrl: "Bank Statement (6 Months)", profession_proof_url: "Profession / App Profile Proof",
  support_declaration_url: "Household Provider Income Proof", pension_proof: "Pension Slip / Pension Proof", previous_income_proof: "Previous Employment / Income Proof",
  pensionProofUrl: "Pension Slip / Pension Proof", previousIncomeProofUrl: "Previous Employment / Income Proof", business_proof: "Business / Shop Verification",
  profession_proof: "Profession / App Profile Proof", support_declaration: "Household Provider Income Proof",
  rentalAgreementUrl: "Rental Agreement", landlordCnicUrl: "Landlord's CNIC", ownerCnicUrl: "Owner's CNIC",
  death_cert: "Death Certificate", death_certificate: "Death Certificate", medical_bill: "Medical Bill", medicine_estimate: "Medicine Estimate",
  groceries_estimate: "Grocery Estimate", repair_estimate: "Repair Estimate", business_quotation: "Business Quotation",
  livestock_quotation: "Livestock Quotation", livestock_proof: "Livestock Proof", marriage_quotation: "Marriage Quotation",
  debt_proof: "Debt Proof", emergency_proof: "Emergency Proof", child_b_form: "Child B-Form", parents_proof: "Parents' Proof",
  cnic: "CNIC", cat_doc_urls: "Category Documents", gender_doc_urls: "Identity Documents",
};

function getDocLabel(key: string): string {
  if (DOC_LABELS[key]) return DOC_LABELS[key];
  return key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

function sym(cur?: string) { return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$"); }
function cleanCnic(c?: string) { return (c || "").replace(/\D/g, ""); }

function asRows<T = any>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as any).results)) return (value as any).results as T[];
  return [];
}

function isContributionResolution(resolution: any): boolean {
  const marker = String(resolution?.paid_to ?? resolution?.paidTo ?? resolution?.payment_type ?? resolution?.paymentType ?? "").trim().toLowerCase();
  return ["givethra", "contribution", "partial", "fundraising"].includes(marker);
}

function normalizedResolutionStatus(resolution: any): string { return String(resolution?.status ?? "").trim().toLowerCase(); }
function normalizedAdminStatus(value: unknown): string { return String(value ?? "").trim().toLowerCase(); }

async function deleteStorageFiles(urls: (string | null | undefined)[]): Promise<{ ok: number; failed: number }> {
  const validUrls = urls.filter((u): u is string => !!u && u.startsWith("http"));
  if (validUrls.length === 0) return { ok: 0, failed: 0 };
  try { return await adminDeleteFiles(validUrls); } catch (e) { console.error("Delete files error:", e); return { ok: 0, failed: validUrls.length }; }
}

function collectCaseFileUrls(c: any): string[] {
  const urls: string[] = [];
  const push = (u: any) => { if (typeof u === "string" && u.trim().startsWith("http") && !urls.includes(u.trim())) urls.push(u.trim()); };
  push(c.selfie_url); push(c.video_url); push(c.paid_receipt_url);
  if (Array.isArray(c.photo_urls)) c.photo_urls.forEach(push);
  else if (c.photo_urls && typeof c.photo_urls === "object") Object.values(c.photo_urls).forEach(push);
  const walk = (obj: any) => { if (!obj || typeof obj !== "object") return; if (Array.isArray(obj)) { obj.forEach(walk); return; } for (const v of Object.values(obj)) { if (typeof v === "string") push(v); else if (v && typeof v === "object") walk(v); } };
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

function copyText(text?: string) { if (!text) return; navigator.clipboard.writeText(text); toast.success("Copied!"); }

function normalizeAdminMediaUrl(rawUrl: string): string {
  const url = String(rawUrl || "").trim();
  if (!url) return "";
  try {
    const parsed = new URL(url, window.location.origin);
    const queryKey = parsed.searchParams.get("key");
    if ((parsed.pathname === "/uploads" || parsed.pathname === "/api/uploads") && queryKey) {
      parsed.pathname = `/uploads/${queryKey.replace(/^\/+/, "")}`;
      parsed.search = "";
    }
    if (parsed.pathname.startsWith("/uploads/")) {
      parsed.protocol = window.location.protocol;
      parsed.host = window.location.host;
    }
    return parsed.toString();
  } catch { return url; }
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [kycList, setKycList] = useState<any[]>([]);
  const [caseList, setCaseList] = useState<any[]>([]);
  const [resolutions, setResolutions] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [unlocks, setUnlocks] = useState<any[]>([]);
  const [supportMsgs, setSupportMsgs] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [suspensions, setSuspensions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadSupport, setUnreadSupport] = useState(0);
  const [pendingHelpMeVideos, setPendingHelpMeVideos] = useState<number | null>(null);
  const [pendingHelpMeProofs, setPendingHelpMeProofs] = useState<number | null>(null);
  const [pendingHelpMeReports, setPendingHelpMeReports] = useState<number | null>(null);
  const [pendingDreamSubmissions, setPendingDreamSubmissions] = useState<number | null>(null);
  const [pendingDonationReviews, setPendingDonationReviews] = useState<number | null>(null);
  const [resolutionView, setResolutionView] = useState<"pending" | "rejected" | "completed">("pending");
  const [resolutionSearch, setResolutionSearch] = useState("");
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [caseStatusFilter, setCaseStatusFilter] = useState<"all" | "pending" | "approved" | "rejected" | "completed" | "expired">("all");
  const [payFilter, setPayFilter] = useState<"ready" | "paid" | "rejected" | "all">("ready");
  const [depositStatusFilter, setDepositStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<"all" | "pending_review" | "approved" | "rejected">("all");
  const [feedbackBusyId, setFeedbackBusyId] = useState<string | null>(null);
  const [kycBusyId, setKycBusyId] = useState<string | null>(null);
  const [withdrawalBusyId, setWithdrawalBusyId] = useState<string | null>(null);

  const refreshSubmissionCounts = useCallback(async () => {
    const [helpMeResult, dreamResult, donationResult] = await Promise.allSettled([helpme.admin.counts(), adminGetDreamParticipations(), adminGetDonations()]);
    if (helpMeResult.status === "fulfilled") { setPendingHelpMeVideos(countPendingHelpMeVideos(helpMeResult.value)); setPendingHelpMeProofs(countPendingHelpMeProofs(helpMeResult.value)); setPendingHelpMeReports(countOpenHelpMeReports(helpMeResult.value)); }
    if (dreamResult.status === "fulfilled") setPendingDreamSubmissions(countPendingDreamSubmissions(asRows(dreamResult.value)));
    if (donationResult.status === "fulfilled") setPendingDonationReviews(countPendingDonationReviews(asRows(donationResult.value)));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { navigate({ to: "/sign-in" }); return; }
    if (!ADMIN_EMAILS.has(String(user?.email || "").toLowerCase())) { navigate({ to: "/" }); return; }
    loadData(); void refreshSubmissionCounts();
    const interval = setInterval(() => { loadSupportMessages(); }, 5000);
    const reviewCountInterval = setInterval(() => { void refreshSubmissionCounts(); }, 30000);
    return () => { clearInterval(interval); clearInterval(reviewCountInterval); };
  }, [isAuthenticated, user, navigate, refreshSubmissionCounts]);

  async function loadData() {
    setLoading(true);
    try {
      const results = await Promise.allSettled([adminGetAllKyc(), adminGetAllCases(), adminGetAllResolutions(), adminGetAllDeposits(), adminGetAllProfiles(), adminGetAllWallets(), adminGetAllUnlocks(), adminGetAllSupportMessages(), adminGetAllFeedbacks(), adminGetAllOffers(), adminGetAllSuspensions(), adminGetWithdrawals()]);
      const rowsAt = (i: number) => results[i]?.status === "fulfilled" ? asRows(results[i].value) : null;
      const failed = results.filter((r) => r.status === "rejected").length;
      if (failed > 0) toast.warning(`${failed} Admin section${failed === 1 ? "" : "s"} could not be loaded.`);
      
      if (rowsAt(0)) setKycList(rowsAt(0)!);
      if (rowsAt(1)) setCaseList(rowsAt(1)!);
      if (rowsAt(2)) setResolutions(rowsAt(2)!);
      if (rowsAt(3)) setDeposits(rowsAt(3)!);
      if (rowsAt(4)) setProfiles(rowsAt(4)!);
      if (rowsAt(5)) setWallets(rowsAt(5)!);
      if (rowsAt(6)) setUnlocks(rowsAt(6)!);
      if (rowsAt(7)) { setSupportMsgs(rowsAt(7)!); setUnreadSupport(rowsAt(7)!.filter((m: any) => m.sender === "user" && !m.is_read).length); }
      if (rowsAt(8)) setFeedbacks(rowsAt(8)!.map((f: any) => ({ ...f, status: String(f.status || "pending_review").toLowerCase() === "pending" ? "pending_review" : String(f.status || "pending_review").toLowerCase() })));
      if (rowsAt(9)) setOffers(rowsAt(9)!);
      if (rowsAt(10)) setSuspensions(rowsAt(10)!);
      if (rowsAt(11)) setWithdrawals(rowsAt(11)!);
    } catch (err) { console.error("Admin data load error:", err); toast.error("Failed to load admin data."); }
    finally { setLoading(false); }
  }

  async function loadSupportMessages() {
    try {
      const data = await adminGetAllSupportMessages();
      setSupportMsgs(asRows(data)); setUnreadSupport(asRows(data).filter((m: any) => m.sender === "user" && !m.is_read).length);
    } catch (e) { console.error("Support messages load error:", e); }
  }

  async function reloadOffers() { setOffers(asRows(await adminGetAllOffers())); }

  const cnicCounts: Record<string, number> = {};
  for (const k of kycList) {
    if (["rejected", "duplicate"].includes(normalizedAdminStatus(k.status))) continue;
    const c = cleanCnic(k.cnic_number);
    if (c) cnicCounts[c] = (cnicCounts[c] ?? 0) + 1;
  }

  async function updateKyc(id: string, status: string, reason = "", action: "approve" | "reject" | "re_kyc" | "duplicate" = "approve") {
    const kyc = kycList.find((k) => k.id === id);
    if (!kyc || kycBusyId) return;
    setKycBusyId(id);
    try {
      if (action === "duplicate") {
        const cnic = cleanCnic(kyc.cnic_number);
        if (!cnic) { toast.error("No CNIC found to check duplicates"); return; }
        const dup = kycList.some((k) => cleanCnic(k.cnic_number) === cnic && normalizedAdminStatus(k.status) === "approved" && k.id !== id);
        if (dup) {
          await adminUpdateKyc(id, { status: "duplicate", reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: `Duplicate KYC - CNIC: ${kyc.cnic_number}` });
          await adminUpdateProfile(kyc.user_id, { is_suspended: true, suspended_reason: `Duplicate KYC detected (CNIC: ${kyc.cnic_number})`, suspended_at: new Date().toISOString() });
          const existingSusp = await adminGetUserSuspension(kyc.user_id);
          await adminUpsertUserSuspension({ user_id: kyc.user_id, suspension_count: (existingSusp?.suspension_count || 0) + 1, is_active: true, suspended_at: new Date().toISOString(), rejection_count_at_suspension: 0 });
          await sendNotification(kyc.user_id, "system", "🚫 Account Suspended (Duplicate KYC)", `Your account has been suspended because a duplicate KYC was detected with the same CNIC (${kyc.cnic_number}).`, "/support");
          toast.success("KYC marked as duplicate and user banned."); await loadData(); return;
        } else { toast.error("No approved KYC with this CNIC found to mark as duplicate."); return; }
      }
      const reviewedAt = new Date().toISOString();
      const result = await adminUpdateKyc(id, { status, reviewed_at: reviewedAt, reviewed_by: user?.email, rejection_reason: reason });
      setKycList((cur) => cur.map((row) => row.id === id ? { ...row, status, reviewed_at: reviewedAt, reviewed_by: user?.email, rejection_reason: reason } : row));
      if ((result as any)?.notification_sent === false) toast.error("KYC decision was saved, but user notification failed.");
      if (status === "re_kyc" && kyc.user_id) await sendNotification(kyc.user_id, "kyc_re_kyc", "KYC Requires Re-submission 🔄", `Please resubmit your KYC with correct information. Reason: ${reason || "CNIC mismatch or missing details"}.`, "/kyc");
      toast.success(`KYC ${status}!`);
    } catch (error: any) { await loadData(); toast.error(error?.message || "KYC update failed."); }
    finally { setKycBusyId(null); }
  }

  async function updateCase(id: string, status: string, reason = "") {
    const c = caseList.find((cs) => cs.id === id);
    try {
      await adminUpdateCase(id, { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: reason });
      setCaseList((cur) => cur.map((row) => row.id === id ? { ...row, status, rejection_reason: reason } : row));
      let notificationFailed = false;
      try {
        if (status === "rejected" && c) await checkAndSuspendUser(c.user_id);
        if (c?.user_id && status === "approved") await sendNotification(c.user_id, "case_approved", "Case Approved ✅", `Your case "${c.title}" is now live for Heroes.`, "/my-cases");
        else if (c?.user_id && status === "rejected") await sendNotification(c.user_id, "case_rejected", "Case Rejected", (reason ? `Reason: ${reason}. ` : "") + (c.was_free ? "Your free offer has been restored." : "Your 1 credit has been refunded."), "/my-cases");
        else if (c?.user_id && status === "completed") await sendNotification(c.user_id, "case_completed", "Case Completed ✅", `Your case "${c.title}" has been marked as completed.`, "/my-cases");
        else if (c?.user_id && status === "expired") await sendNotification(c.user_id, "case_expired", "Case Expired ⏰", `Your case "${c.title}" has expired. You can submit a new one.`, "/submit-request");
      } catch (error) { notificationFailed = true; console.error("Case decision saved; follow-up notification failed", error); }
      await loadData(); toast.success(`Case ${status}.`);
      if (notificationFailed) toast.error("Case decision saved, but notification failed.");
    } catch (error: any) { await loadData(); toast.error(error?.message || "Case review failed."); }
  }

  async function updateFeedback(fbId: string, status: string, reason = "") {
    if (status === "rejected" && !reason.trim()) { toast.error("Please provide a rejection reason."); return; }
    if (feedbackBusyId) return;
    const fb = feedbacks.find((f) => f.id === fbId);
    const reviewedAt = new Date().toISOString();
    setFeedbackBusyId(fbId);
    try {
      await adminUpdateFeedback(fbId, { status, reviewed_at: reviewedAt, reviewed_by: user?.email, rejection_reason: reason });
      setFeedbacks((cur) => cur.map((item) => item.id === fbId ? { ...item, status, reviewed_at: reviewedAt, reviewed_by: user?.email, rejection_reason: reason } : item));
      let notificationFailed = false;
      if (fb?.user_id && fb.case_id) try {
        if (status === "approved") await sendNotification(fb.user_id, "system", "Feedback Approved 🎉", "Your feedback is now live on the Givethra community wall. You can now submit a new case!", "/my-cases");
        else await sendNotification(fb.user_id, "system", "Feedback Needs Improvement", reason ? `Reason: ${reason}. Please re-record.` : "Please re-record your video and message.", `/cases/${fb.case_id}`);
      } catch { notificationFailed = true; }
      toast.success(status === "approved" ? "Feedback approved." : "Feedback rejected.");
      if (notificationFailed) toast.error("Feedback saved, but notification failed.");
    } catch (error: any) { await loadData(); toast.error(`Feedback update failed: ${error?.message || "Try again."}`); }
    finally { setFeedbackBusyId(null); }
  }

  async function checkAndSuspendUser(userId: string) {
    const rejectedCount = caseList.filter((c) => c.user_id === userId && c.status === "rejected").length;
    if (rejectedCount >= 5) {
      const existing = await adminGetUserSuspension(userId);
      const newCount = (existing?.suspension_count || 0) + 1;
      await adminUpsertUserSuspension({ user_id: userId, suspension_count: newCount, is_active: true, suspended_at: new Date().toISOString(), rejection_count_at_suspension: rejectedCount });
      await adminUpdateProfile(userId, { is_suspended: true, suspended_reason: `Suspended after ${rejectedCount} rejected cases (suspension #${newCount})`, suspended_at: new Date().toISOString() });
      await sendNotification(userId, "system", "🚫 Account Suspended", `Your account has been suspended due to ${rejectedCount} rejected cases.`, "/submit-request");
    }
  }

  async function manualUnlockUser(userId: string) {
    if (!confirm("Are you sure you want to manually unlock this user?")) return;
    try {
      await adminUpsertUserSuspension({ user_id: userId, is_active: false, unlocked_at: new Date().toISOString() });
      await adminUpdateProfile(userId, { is_suspended: false, suspended_reason: null });
      await sendNotification(userId, "system", "Account Unlocked by Givethra", "Givethra has unlocked your account. Please submit cases carefully.", "/dashboard");
      toast.success("User unlocked successfully!"); await loadData();
    } catch { toast.error("Failed to unlock user."); }
  }

  async function confirmResolution(res: any) {
    const c = caseList.find((cs) => cs.id === res.case_id);
    if (!c) { toast.error("Case not found"); return; }
    const confirmedAmt = Number(res.seeker_confirmed_amount ?? res.amount_paid ?? 0);
    if (!Number.isFinite(confirmedAmt) || confirmedAmt < 0) { toast.error("Invalid amount."); return; }
    const amountNeeded = Number(c.amount_needed ?? 0);
    const prevCollected = Number(c.amount_collected ?? 0);
    const newCollected = prevCollected + confirmedAmt;
    const isFundraising = isContributionResolution(res);
    try {
      await adminUpdateResolution(res.id, { status: "completed", admin_confirmed: true, admin_confirmed_at: new Date().toISOString(), completed_at: new Date().toISOString() });
      setResolutions((cur) => cur.map((row) => row.id === res.id ? { ...row, status: "completed", admin_confirmed: true } : row));
      const goalReached = amountNeeded > 0 && newCollected >= amountNeeded;
      const jobs: Promise<unknown>[] = [];
      if (res.hero_id) jobs.push(sendNotification(res.hero_id, "case_completed", "Help verified! 🎉", `Givethra verified your help of ${sym(c.currency)} ${confirmedAmt} on "${c.title}".`, `/cases/${res.case_id}`));
      if (res.seeker_id) {
        if (isFundraising) jobs.push(sendNotification(res.seeker_id, "system", goalReached ? "Goal reached! 🎉" : "More help received! 🤝", goalReached ? `Your case "${c.title}" fully funded!` : `Your case "${c.title}" received ${sym(c.currency)} ${confirmedAmt} more.`, `/cases/${res.case_id}`));
        else { const stillOpen = amountNeeded > 0 && newCollected < amountNeeded; jobs.push(sendNotification(res.seeker_id, "system", stillOpen ? "Partial help verified ✅" : "Your case is complete! 🎉", stillOpen ? `${sym(c.currency)} ${confirmedAmt} verified. ${sym(c.currency)} ${amountNeeded - newCollected} still remaining.` : `Your case "${c.title}" is now fully helped.`, `/cases/${res.case_id}`)); }
      }
      const results = await Promise.allSettled(jobs);
      const notificationFailed = results.some((r) => r.status === "rejected");
      toast.success(`Verified! ${sym(c.currency)} ${confirmedAmt} added.`);
      if (notificationFailed) toast.error("Verified, but notifications failed.");
      await loadData();
    } catch (error: any) { await loadData(); toast.error(`Failed: ${error?.message || "Try again."}`); }
  }

  async function rejectResolution(res: any, reason: string) {
    const trimmedReason = String(reason || "").trim();
    if (!trimmedReason) { toast.error("Provide a reason."); return; }
    try {
      await adminUpdateResolution(res.id, { status: "disputed", admin_confirmed: false, notes: trimmedReason });
      setResolutions((cur) => cur.map((row) => row.id === res.id ? { ...row, status: "disputed", admin_confirmed: false, notes: trimmedReason } : row));
      if (res.hero_id) try { await sendNotification(res.hero_id, "help_rejected", "Help proof needs correction", `Reason: ${trimmedReason}`, `/cases/${res.case_id}`); } catch { toast.error("Notification failed."); }
      toast.success("Resolution rejected."); await loadData();
    } catch (error: any) { await loadData(); toast.error(`Failed: ${error?.message || "Try again."}`); }
  }

  async function markAsPaidAndClose(c: any, receiptUrl: string) {
    if (!String(receiptUrl || c.paid_receipt_url || "").trim()) { toast.error("Upload receipt first."); return; }
    try {
      await adminCloseCase(c.id, { status: "completed", closed_by_admin: true, paid_receipt_url: receiptUrl || null });
      setCaseList((cur) => cur.map((row) => row.id === c.id ? { ...row, status: "completed", closed_by_admin: true, paid_receipt_url: receiptUrl || null } : row));
      if (c.user_id) await sendNotification(c.user_id, "case_completed", "Your bill is paid! 🎉", `Your case "${c.title}" is fully helped.`, `/cases/${c.id}`);
      toast.success("Case closed."); await loadData();
    } catch (error: any) { await loadData(); toast.error(`Failed: ${error?.message || "Try again."}`); }
  }

  async function rejectPayClose(c: any, reason: string) {
    const trimmed = String(reason || "").trim();
    if (!trimmed) { toast.error("Provide a reason."); return; }
    try {
      const nextStatus = isExpiredCaseRecord(c) ? "expired" : "approved";
      await adminCloseCase(c.id, { status: nextStatus, closed_by_admin: false, rejection_reason: trimmed, paid_receipt_url: null });
      setCaseList((cur) => cur.map((row) => row.id === c.id ? { ...row, status: nextStatus, closed_by_admin: false, rejection_reason: trimmed, paid_receipt_url: null } : row));
      toast.success("Case returned."); await loadData();
    } catch (error: any) { await loadData(); toast.error(`Failed: ${error?.message || "Try again."}`); }
  }

  async function approveDeposit(dep: any, finalCredits: number) {
    const credits = (finalCredits ?? (dep.credits ?? dep.amount)) || 0;
    try {
      await adminUpdateDeposit(dep.id, { status: "approved", credits, reviewed_at: new Date().toISOString(), reviewed_by: user?.email });
      setDeposits((cur) => cur.map((row) => row.id === dep.id ? { ...row, status: "approved", credits } : row));
      let notificationFailed = false;
      if (dep.user_id) try { await sendNotification(dep.user_id, "credits_added", "Credits Added 💰", `${credits} credit(s) have been added to your wallet.`, "/wallet"); } catch { notificationFailed = true; }
      await loadData(); toast.success(`Approved! ${credits} credits added.`);
      if (notificationFailed) toast.error("Deposit approved, but notification failed.");
    } catch (e: any) { await loadData(); toast.error(`Failed: ${e?.message || "Try again."}`); }
  }

  async function cleanupAllRejectedFiles() {
    if (!confirm("This will permanently delete all files associated with rejected records. Continue?")) return;
    setLoading(true);
    try {
      const result = await adminDeleteFiles([]);
      toast.success(`Cleaned ${Number(result?.deleted || 0)} files.`);
    } catch (e) { toast.error("Cleanup failed."); }
    await loadData();
  }

  async function rejectDeposit(id: string, reason: string) {
    const dep = deposits.find((d) => d.id === id);
    try {
      await adminUpdateDeposit(id, { status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: reason });
      setDeposits((cur) => cur.map((row) => row.id === id ? { ...row, status: "rejected", rejection_reason: reason } : row));
      let notificationFailed = false;
      if (dep?.user_id) try { await sendNotification(dep.user_id, "deposit_rejected", "Deposit Rejected", reason ? `Reason: ${reason}` : "Please check your payment proof.", "/wallet"); } catch { notificationFailed = true; }
      await loadData(); toast.success("Deposit rejected.");
      if (notificationFailed) toast.error("Deposit rejected, but notification failed.");
    } catch (error: any) { await loadData(); toast.error(error?.message || "Deposit rejection failed."); }
  }

  async function reviewWithdrawal(withdrawal: any, status: "approved" | "rejected" | "completed", proof?: string) {
    if (withdrawalBusyId) return;
    setWithdrawalBusyId(withdrawal.id);
    try {
      const result = await adminUpdateWithdrawal(withdrawal.id, { status, ...(proof ? { payment_proof_url: proof } : {}) });
      setWithdrawals((cur) => cur.map((row) => row.id === withdrawal.id ? { ...row, ...result, status } : row));
      await loadData(); toast.success(`Withdrawal ${status}.`);
      if ((result as any)?.notification_sent === false) toast.error("Saved, but notification failed.");
    } catch (error: any) { await loadData(); toast.error(error?.message || "Withdrawal failed."); }
    finally { setWithdrawalBusyId(null); }
  }

  // Computed Values
  const pendingKyc = kycList.filter((k) => normalizedAdminStatus(k.status) === "pending");
  const approvedKycCount = kycList.filter((k) => normalizedAdminStatus(k.status) === "approved").length;
  const rejectedKycCount = kycList.filter((k) => normalizedAdminStatus(k.status) === "rejected").length;
  const pendingCases = caseList.filter((c) => normalizedAdminStatus(c.status) === "pending");
  const approvedCasesCount = caseList.filter((c) => normalizedAdminStatus(c.status) === "approved" && !isExpiredCaseRecord(c)).length;
  const rejectedCasesCount = caseList.filter((c) => normalizedAdminStatus(c.status) === "rejected").length;
  const completedCasesCount = caseList.filter((c) => normalizedAdminStatus(c.status) === "completed" && !isExpiredCaseRecord(c)).length;
  const expiredCasesCount = caseList.filter((c) => isExpiredCaseRecord(c)).length;
  const pendingDeposits = deposits.filter((d) => normalizedAdminStatus(d.status) === "pending");
  const approvedDepositsCount = deposits.filter((d) => normalizedAdminStatus(d.status) === "approved").length;
  const rejectedDepositsCount = deposits.filter((d) => normalizedAdminStatus(d.status) === "rejected").length;
  const pendingResolutionStatuses = new Set(["pending", "pending_confirmation", "seeker_confirmed"]);
  const pendingResolutions = resolutions.filter((r) => pendingResolutionStatuses.has(normalizedResolutionStatus(r)));
  const pendingContributions = pendingResolutions.filter(isContributionResolution);
  const pendingDirectResolutions = pendingResolutions.filter((r) => !isContributionResolution(r));
  const pendingContributionCount = pendingContributions.length;
  const pendingDirectCount = pendingDirectResolutions.length;
  const rejectedContributions = resolutions.filter((r) => ["rejected", "disputed"].includes(normalizedResolutionStatus(r)) && isContributionResolution(r));
  const rejectedDirectResolutions = resolutions.filter((r) => ["rejected", "disputed"].includes(normalizedResolutionStatus(r)) && !isContributionResolution(r));
  const completedContributions = resolutions.filter((r) => ["approved", "completed"].includes(normalizedResolutionStatus(r)) && isContributionResolution(r));
  const completedDirectResolutions = resolutions.filter((r) => ["approved", "completed"].includes(normalizedResolutionStatus(r)) && !isContributionResolution(r));
  const completedResolutionsCount = resolutions.filter((r) => ["approved", "completed"].includes(normalizedResolutionStatus(r))).length;
  const visibleDirectResolutions = (resolutionView === "pending" ? pendingDirectResolutions : resolutionView === "rejected" ? rejectedDirectResolutions : completedDirectResolutions).filter((r) => { const q = resolutionSearch.trim().toLowerCase(); if (!q) return true; const c = caseList.find((cs) => cs.id === r.case_id); const p = profileMap[r.hero_id] || profileMap[r.seeker_id]; return [r.id, r.case_id, r.hero_id, r.seeker_id, r.hero_email, r.transaction_id, c?.title, c?.category, p?.full_name, p?.email].some((v) => String(v || "").toLowerCase().includes(q)); });
  const visibleContributionResolutions = (resolutionView === "pending" ? pendingContributions : resolutionView === "rejected" ? rejectedContributions : completedContributions).filter((r) => { const q = resolutionSearch.trim().toLowerCase(); if (!q) return true; const c = caseList.find((cs) => cs.id === r.case_id); const p = profileMap[r.hero_id] || profileMap[r.seeker_id]; return [r.id, r.case_id, r.hero_id, r.seeker_id, r.hero_email, r.transaction_id, c?.title, c?.category, p?.full_name, p?.email].some((v) => String(v || "").toLowerCase().includes(q)); });
  const completedCaseFeedbacks = feedbacks.filter((f) => !!f.case_id);
  const visibleFeedbacks = completedCaseFeedbacks.filter((fb) => { const q = feedbackSearch.trim().toLowerCase(); if (!q) return true; const c = caseList.find((cs) => cs.id === fb.case_id); const p = profileMap[fb.user_id]; return [fb.id, fb.case_id, fb.user_id, fb.first_name, fb.text_message, c?.title, p?.full_name, p?.email].some((v) => String(v || "").toLowerCase().includes(q)); });
  const approvedCases = caseList.filter((c) => normalizedAdminStatus(c.status) === "approved");
  const completedCases = caseList.filter((c) => normalizedAdminStatus(c.status) === "completed");
  const approvedKyc = kycList.filter((k) => normalizedAdminStatus(k.status) === "approved");
  const freeCases = caseList.filter((c) => c.was_free);
  const paidCases = caseList.filter((c) => !c.was_free);
  const readyToClose = caseList.filter((c) => { if (!["approved", "expired"].includes(String(c.status || '').toLowerCase())) return false; const needed = Number(c.amount_needed ?? 0); const collected = Number(c.amount_collected ?? 0); const expiredPartial = String(c.status || '').toLowerCase() === "expired" && collected > 0; return needed > 0 && !c.closed_by_admin && !c.rejection_reason && (collected >= needed || expiredPartial); });
  const paidPayClose = caseList.filter((c) => normalizedAdminStatus(c.status) === "completed" && c.closed_by_admin);
  const rejectedPayClose = caseList.filter((c) => ["approved", "expired"].includes(String(c.status || "").toLowerCase()) && !c.closed_by_admin && c.rejection_reason);
  const profileMap: Record<string, any> = {}; for (const p of profiles) profileMap[p.user_id] = p;
  const cnicByUser: Record<string, string> = {}; for (const k of kycList) if (k.user_id && k.cnic_number) cnicByUser[k.user_id] = k.cnic_number;
  for (const k of kycList) { if (!profileMap[k.user_id]?.full_name) profileMap[k.user_id] = { ...profileMap[k.user_id], full_name: k.full_name }; }
  const activeOffers = offers.filter((o) => o.is_active).length;
  const duplicateCnicCount = Object.values(cnicCounts).filter((n) => n > 1).length;
  const totalHeroHelps = unlocks.length;
  const resByCaseId: Record<string, any[]> = {};
  for (const r of resolutions) { if (!resByCaseId[r.case_id]) resByCaseId[r.case_id] = []; resByCaseId[r.case_id].push(r); }
  const activeSuspensions = suspensions.filter((s) => s.is_active).length;

  const usersList = profiles.map((p) => {
    const uid = p.user_id;
    const kyc = kycList.filter((k) => k.user_id === uid).sort((a, b) => Number(Boolean(b.is_current)) - Number(Boolean(a.is_current)) || new Date(b.submitted_at ?? 0).getTime() - new Date(a.submitted_at ?? 0).getTime())[0];
    const userCases = caseList.filter((c) => c.user_id === uid);
    const userUnlocks = unlocks.filter((u) => u.hero_id === uid);
    const userDeposits = deposits.filter((d) => d.user_id === uid);
    const wallet = wallets.find((w) => w.user_id === uid);
    const suspension = suspensions.find((s) => s.user_id === uid);
    const approvedDeps = userDeposits.filter((d) => d.status === "approved");
    return {
      user_id: uid, name: p.full_name || p.user_full_name || kyc?.full_name || "—", username: p.username || p.full_name || p.user_full_name || (p.email ? String(p.email).split("@")[0] : "—"),
      email: p.email || "—", phone: p.phone_number || "", country: p.country || "", city: p.city || "", bio: p.bio || "", avatar_url: p.avatar_url || p.user_avatar_url || "",
      kycId: kyc?.id || "", kycDetails: kyc || null, created_at: p.created_at || p.signed_up_at, kycStatus: kyc?.status ?? "none",
      casesSubmitted: userCases.length, rejectedCases: userCases.filter((c) => c.status === "rejected").length, casesUnlocked: userUnlocks.length,
      depositsCount: userDeposits.length, totalDeposited: approvedDeps.reduce((s, d) => s + (d.credits ?? d.amount ?? 0), 0),
      walletBalance: wallet?.balance ?? 0, cnic: kyc?.cnic_number || "", isSuspended: suspension?.is_active ?? false, suspendedReason: suspension?.suspended_reason || p.suspended_reason || "", suspensionCount: suspension?.suspension_count || 0,
    };
  }).sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());

  // 🔥 PREMIUM HEADER & TABS UI
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-3 py-6 pb-20 sm:px-5 sm:py-10">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg">
              <ShieldIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">Admin Control</h1>
              <p className="text-sm font-medium text-slate-500">Manage everything in one place.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={cleanupAllRejectedFiles}>
            🗑️ Cleanup Rejected Files
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Pending KYC", value: pendingKyc.length, icon: ShieldIcon, color: "from-amber-400 to-orange-500" },
            { label: "Pending Cases", value: pendingCases.length, icon: FileText, color: "from-blue-400 to-indigo-500" },
            { label: "Verify Help", value: pendingResolutions.length, icon: HandCoins, color: "from-pink-400 to-rose-500" },
            { label: "Ready to Pay", value: readyToClose.length, icon: Coins, color: "from-teal-400 to-emerald-500" },
            { label: "Active Suspensions", value: activeSuspensions, icon: Ban, color: "from-red-400 to-red-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} whileHover={{ y: -3 }} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-4 text-white shadow-lg`}>
              <Icon className="absolute right-2 top-2 h-12 w-12 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">{label}</p>
              <p className="mt-1 text-2xl font-black">{value}</p>
            </motion.div>
          ))}
        </div>

        {duplicateCnicCount > 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p><strong>{duplicateCnicCount} CNIC(s)</strong> are used in more than one active KYC.</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
              {[
                { v: "overview", l: "Overview" },
                { v: "users", l: "Users", c: usersList.length },
                { v: "kyc", l: "KYC", c: pendingKyc.length, badge: "amber" },
                { v: "cases", l: "Cases", c: pendingCases.length, badge: "amber" },
                { v: "verify", l: "Direct", c: pendingDirectCount, badge: "red" },
                { v: "contributions", l: "Contrib", c: pendingContributionCount, badge: "amber" },
                { v: "pay", l: "Pay & Close", c: readyToClose.length, badge: "teal" },
                { v: "deposits", l: "Deposits", c: pendingDeposits.length, badge: "amber" },
                { v: "notify", l: "Notify" },
                { v: "offers", l: "Offers", c: activeOffers },
                { v: "support", l: "Support", c: unreadSupport, badge: "red" },
                { v: "feedback", l: "Feedback", c: feedbacks.filter((f) => ["pending", "pending_review"].includes(normalizedAdminStatus(f.status))).length, badge: "red" },
                { v: "suspensions", l: "Suspensions" },
                { v: "earnings-withdrawals", l: "Withdrawals", c: withdrawals.filter(w => normalizedAdminStatus(w.status) === "pending").length, badge: "amber" },
                { v: "donations", l: "Donations", c: pendingDonationReviews ?? 0, badge: "red" },
                { v: "dreams", l: "Dreams", c: pendingDreamSubmissions ?? 0, badge: "red" },
                { v: "helpme", l: "Help Me", c: (pendingHelpMeVideos ?? 0) + (pendingHelpMeProofs ?? 0) + (pendingHelpMeReports ?? 0), badge: "red" },
              ].map((tab) => (
                <TabsTrigger key={tab.v} value={tab.v} className="rounded-xl px-3 py-2 text-xs font-bold sm:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                  {tab.l}
                  {tab.c !== undefined && tab.c > 0 && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-black ${tab.badge === "red" ? "bg-red-500 text-white" : tab.badge === "teal" ? "bg-teal-500 text-white" : "bg-amber-500 text-white"} data-[state=active]:bg-white/30`}>
                      {tab.c}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="donations" className="space-y-4"><AdminDonationsPanel onQueueChanged={refreshSubmissionCounts} /></TabsContent>
            <TabsContent value="dreams" className="space-y-4"><AdminDreamsPanel onQueueChanged={refreshSubmissionCounts} /></TabsContent>
            <TabsContent value="helpme" className="space-y-4"><AdminHelpMePanel onQueueChanged={refreshSubmissionCounts} /></TabsContent>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { label: "Total Users", value: usersList.length, icon: Users },
                  { label: "Verified KYC", value: approvedKyc.length, icon: ShieldIcon },
                  { label: "Total Cases", value: caseList.length, icon: FileText },
                  { label: "Approved Cases", value: approvedCases.length, icon: CheckCircle },
                  { label: "Completed Cases", value: completedCases.length, icon: Heart },
                  { label: "FREE Cases", value: freeCases.length, icon: Gift },
                  { label: "PAID Cases", value: paidCases.length, icon: Coins },
                  { label: "Hero Helps", value: totalHeroHelps, icon: Heart },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-teal-50 p-2 text-teal-600"><Icon className="h-4 w-4" /></div>
                      <p className="text-xs font-semibold text-slate-500">{label}</p>
                    </div>
                    <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users"><UserSearchBox usersList={usersList} onSuspendChange={loadData} onManualUnlock={manualUnlockUser} /></TabsContent>
            <TabsContent value="kyc"><KycSearchBox kycList={kycList} onUpdate={updateKyc} cnicCounts={cnicCounts} profileMap={profileMap} busyId={kycBusyId} /></TabsContent>
            <TabsContent value="cases"><CaseSearchBox caseList={caseList} onUpdate={updateCase} resolutions={resByCaseId} profileMap={profileMap} cnicByUser={cnicByUser} statusFilter={caseStatusFilter} setStatusFilter={setCaseStatusFilter} /></TabsContent>

            <TabsContent value="verify" className="space-y-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search..." value={resolutionSearch} onChange={(e) => setResolutionSearch(e.target.value)} className="h-11 rounded-xl pl-9" /></div>
              <div className="grid grid-cols-3 gap-2 rounded-xl border bg-slate-50 p-1 dark:bg-slate-800">
                {["pending", "rejected", "completed"].map((v) => (
                  <button key={v} onClick={() => setResolutionView(v as any)} className={`rounded-lg py-2 text-xs font-bold capitalize transition-all ${resolutionView === v ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>{v} ({v === "pending" ? pendingDirectCount : v === "rejected" ? rejectedDirectResolutions.length : completedDirectResolutions.length})</button>
                ))}
              </div>
              {visibleDirectResolutions.length === 0 ? <Empty text="Nothing here" /> : visibleDirectResolutions.map((r) => { const c = caseList.find((cs) => cs.id === r.case_id); return resolutionView === "pending" ? <VerifyCard key={r.id} r={r} c={c} profileMap={profileMap} onConfirm={confirmResolution} onReject={rejectResolution} /> : <ResolutionHistoryCard key={r.id} r={r} c={c} profileMap={profileMap} />; })}
            </TabsContent>

            <TabsContent value="contributions" className="space-y-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search..." value={resolutionSearch} onChange={(e) => setResolutionSearch(e.target.value)} className="h-11 rounded-xl pl-9" /></div>
              <div className="grid grid-cols-3 gap-2 rounded-xl border bg-slate-50 p-1 dark:bg-slate-800">
                {["pending", "rejected", "completed"].map((v) => (
                  <button key={v} onClick={() => setResolutionView(v as any)} className={`rounded-lg py-2 text-xs font-bold capitalize transition-all ${resolutionView === v ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>{v} ({v === "pending" ? pendingContributionCount : v === "rejected" ? rejectedContributions.length : completedContributions.length})</button>
                ))}
              </div>
              {visibleContributionResolutions.length === 0 ? <Empty text="Nothing here" /> : visibleContributionResolutions.map((r) => { const c = caseList.find((cs) => cs.id === r.case_id); return resolutionView === "pending" ? <VerifyCard key={r.id} r={r} c={c} profileMap={profileMap} onConfirm={confirmResolution} onReject={rejectResolution} /> : <ResolutionHistoryCard key={r.id} r={r} c={c} profileMap={profileMap} />; })}
            </TabsContent>

            <TabsContent value="pay" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[{ k: "ready", l: "Ready", c: readyToClose.length }, { k: "paid", l: "Paid", c: paidPayClose.length }, { k: "rejected", l: "Rejected", c: rejectedPayClose.length }, { k: "all", l: "All", c: caseList.length }].map((t) => (
                  <button key={t.k} onClick={() => setPayFilter(t.k as any)} className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${payFilter === t.k ? "bg-teal-600 text-white shadow-md" : "bg-white text-slate-600 border"}`}>{t.l} ({t.c})</button>
                ))}
              </div>
              {(() => {
                const displayCases = payFilter === "ready" ? readyToClose : payFilter === "paid" ? paidPayClose : payFilter === "rejected" ? rejectedPayClose : caseList;
                if (displayCases.length === 0) return <Empty text="No cases" />;
                return displayCases.map((c) => <PayCloseCard key={c.id} c={c} profileMap={profileMap} onClose={markAsPaidAndClose} onReject={rejectPayClose} />);
              })()}
            </TabsContent>

            <TabsContent value="deposits" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["all", "pending", "approved", "rejected"].map((s) => (
                  <button key={s} onClick={() => setDepositStatusFilter(s as any)} className={`rounded-xl px-4 py-2 text-sm font-bold capitalize ${depositStatusFilter === s ? "bg-teal-600 text-white shadow-md" : "bg-white text-slate-600 border"}`}>{s} ({deposits.filter((d: any) => s === "all" || d.status === s).length})</button>
                ))}
              </div>
              <DepositSearchBox deposits={deposits.filter((d: any) => depositStatusFilter === "all" || d.status === depositStatusFilter)} onApprove={approveDeposit} onReject={rejectDeposit} profileMap={profileMap} cnicByUser={cnicByUser} />
            </TabsContent>

            <TabsContent value="notify">
              <NotifyPanel profiles={profiles} kycList={kycList} caseList={caseList} />
            </TabsContent>

            <TabsContent value="offers"><OffersPanel offers={offers} onReload={reloadOffers} /></TabsContent>
            <TabsContent value="support"><SupportPanel allMsgs={supportMsgs} profileMap={profileMap} onNewMessage={loadSupportMessages} unreadCount={unreadSupport} /></TabsContent>

            <TabsContent value="feedback" className="space-y-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search feedback..." value={feedbackSearch} onChange={(e) => setFeedbackSearch(e.target.value)} className="h-11 rounded-xl pl-9" /></div>
              <div className="flex flex-wrap gap-2">
                {["all", "pending_review", "approved", "rejected"].map((s) => (
                  <button key={s} onClick={() => setFeedbackStatusFilter(s as any)} className={`rounded-xl px-4 py-2 text-sm font-bold ${feedbackStatusFilter === s ? "bg-teal-600 text-white shadow-md" : "bg-white text-slate-600 border"}`}>{s === "pending_review" ? "Pending" : s} ({feedbacks.filter((f: any) => s === "all" || f.status === s).length})</button>
                ))}
              </div>
              {visibleFeedbacks.filter((f) => feedbackStatusFilter === "all" || f.status === feedbackStatusFilter).length === 0 ? <Empty text="No feedback" /> : visibleFeedbacks.filter((f) => feedbackStatusFilter === "all" || f.status === feedbackStatusFilter).map((fb) => <FeedbackCard key={fb.id} fb={fb} profileMap={profileMap} caseList={caseList} onUpdate={updateFeedback} busyId={feedbackBusyId} />)}
            </TabsContent>

            <TabsContent value="suspensions"><SuspensionsPanel suspensions={suspensions} profiles={profiles} onUnlock={manualUnlockUser} onReload={loadData} /></TabsContent>

            <TabsContent value="earnings-withdrawals" className="space-y-4">
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 dark:bg-amber-950/10">
                <h2 className="text-xl font-black text-amber-900 dark:text-amber-300">Earnings Withdrawals</h2>
                <p className="mt-1 text-sm font-medium text-amber-800/70 dark:text-amber-300/70">Review the manual PKR payout and attach payment proof.</p>
              </div>
              <div className="grid gap-3">
                {withdrawals.length ? withdrawals.map((w: any) => (
                  <div key={w.id} className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{w.full_name || w.email || w.user_id}</p>
                        <p className="text-xs font-medium text-slate-500">{w.amount_pkr} PKR · {w.bank_name} · {w.account_title} · {w.account_number}</p>
                        <p className="mt-1 text-[11px] text-slate-400">Requested {w.requested_at ? new Date(w.requested_at).toLocaleString() : "—"}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{w.status}</span>
                    </div>
                    {w.payment_proof_url ? <a className="mt-2 inline-block text-xs font-semibold text-teal-600 underline" href={w.payment_proof_url} target="_blank" rel="noreferrer">View payment proof</a> : null}
                    {normalizedAdminStatus(w.status) === "pending" && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" disabled={withdrawalBusyId === w.id} onClick={() => void reviewWithdrawal(w, "approved")}>Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-600" disabled={withdrawalBusyId === w.id} onClick={() => void reviewWithdrawal(w, "rejected")}>Reject</Button>
                      </div>
                    )}
                    {normalizedAdminStatus(w.status) === "approved" && (
                      <div className="mt-3 flex gap-2">
                        <input placeholder="Payment proof URL" className="h-9 flex-1 rounded-lg border px-3 text-xs" id={`proof-${w.id}`} />
                        <Button size="sm" className="bg-teal-600" onClick={() => { const p = (document.getElementById(`proof-${w.id}`) as HTMLInputElement)?.value.trim(); if (p) void reviewWithdrawal(w, "completed", p); }}>Complete</Button>
                      </div>
                    )}
                  </div>
                )) : <Empty text="No withdrawal requests." />}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}

// ============================================================
// SUB-COMPONENTS (Premium UI)
// ============================================================

function SuspensionsPanel({ suspensions, profiles, onUnlock, onReload }: any) {
  const active = suspensions.filter((s: any) => s.is_active);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/20">
        <p><strong>Total Suspensions:</strong> {suspensions.length} · <strong>Active:</strong> {active.length}</p>
      </div>
      {active.length === 0 ? <Empty text="No active suspensions" /> : active.map((s: any) => {
        const p = profiles.find((pr: any) => pr.user_id === s.user_id);
        return (
          <div key={s.id} className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-5 w-5 text-red-600" />
                <span className="font-bold">{p?.full_name || "Unknown"}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">Suspended #{s.suspension_count}</span>
              </div>
              <Button size="sm" variant="outline" className="text-teal-600 border-teal-300" onClick={() => onUnlock(s.user_id)}>Unlock</Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Rejections: {s.rejection_count_at_suspension} · Suspended: {new Date(s.suspended_at).toLocaleDateString()}</p>
          </div>
        );
      })}
    </div>
  );
}

function KycSearchBox({ kycList, onUpdate, cnicCounts, profileMap, busyId }: any) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const sorted = [...kycList].sort((a, b) => { const o: any = { pending: 0, approved: 1, rejected: 2 }; return (o[normalizedAdminStatus(a.status)] ?? 3) - (o[normalizedAdminStatus(b.status)] ?? 3); });
  const q = search.trim().toLowerCase(); const d = search.replace(/\D/g, "");
  const filtered = sorted.filter((k) => {
    if (filter !== "all" && normalizedAdminStatus(k.status) !== filter) return false;
    if (!q) return true;
    return [k.full_name, k.user_id, profileMap?.[k.user_id]?.email || k.email].some((v) => String(v || "").toLowerCase().includes(q)) || (!!d && String(k.cnic_number || "").replace(/\D/g, "").includes(d));
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search KYC..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-xl pl-9" /></div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button key={s} onClick={() => setFilter(s as any)} className={`rounded-xl px-3 py-2 text-xs font-bold capitalize ${filter === s ? "bg-teal-600 text-white shadow-md" : "bg-white text-slate-600 border"}`}>{s}</button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? <Empty text="No KYC" /> : filtered.map((k) => <KycCard key={k.id} kyc={k} onUpdate={onUpdate} dupCount={cnicCounts[cleanCnic(k.cnic_number)] ?? 0} busy={busyId === k.id} />)}
    </div>
  );
}

function CaseSearchBox({ caseList, onUpdate, resolutions, profileMap, cnicByUser, statusFilter, setStatusFilter }: any) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase(); const d = search.replace(/\D/g, "");
  const filteredByStatus = statusFilter === "all" ? caseList : caseList.filter((c: any) => (isExpiredCaseRecord(c) ? "expired" : normalizedAdminStatus(c.status)) === statusFilter);
  const filtered = filteredByStatus.filter((c: any) => {
    if (!q) return true;
    return [c.title, c.category, c.user_id, profileMap[c.user_id]?.full_name, profileMap[c.user_id]?.email].some((v) => String(v || "").toLowerCase().includes(q)) || (!!d && [c.cnic_number, cnicByUser?.[c.user_id]].some((v) => String(v || "").replace(/\D/g, "").includes(d)));
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search cases..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-xl pl-9" /></div>
        <div className="flex gap-2 overflow-x-auto">
          {["all", "pending", "approved", "rejected", "completed", "expired"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold capitalize ${statusFilter === s ? "bg-teal-600 text-white shadow-md" : "bg-white text-slate-600 border"}`}>{s}</button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? <Empty text="No cases" /> : filtered.map((c: any) => <CaseCard key={c.id} c={isExpiredCaseRecord(c) ? { ...c, status: "expired" } : c} onUpdate={onUpdate} resolutions={resolutions[c.id] ?? []} profileMap={profileMap} />)}
    </div>
  );
}

function KycCard({ kyc, onUpdate, dupCount, busy }: any) {
  const [reason, setReason] = useState("");
  const status = normalizedAdminStatus(kyc.status);
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900 ${dupCount > 1 && status === "pending" ? "border-red-300 bg-red-50/30" : "border-slate-200 dark:border-slate-800"}`}>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${status === "approved" ? "bg-emerald-100 text-emerald-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{status}</span>
        {dupCount > 1 && status === "pending" && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">⚠️ Duplicate ({dupCount})</span>}
      </div>
      <p className="text-base font-bold text-slate-900 dark:text-white">{kyc.full_name}</p>
      <p className="text-xs font-medium text-slate-500">{kyc.document_type?.toUpperCase()} · {kyc.cnic_number}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kyc.cnic_front_url && <Img url={kyc.cnic_front_url} label="CNIC Front" />}
        {kyc.cnic_back_url && <Img url={kyc.cnic_back_url} label="CNIC Back" />}
        {kyc.selfie_url && <Img url={kyc.selfie_url} label="Selfie" />}
        {kyc.face_video_url && <video src={normalizeAdminMediaUrl(kyc.face_video_url)} controls className="w-full rounded-lg border max-h-32" />}
      </div>
      {status === "pending" && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <Textarea placeholder="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="rounded-xl text-sm" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => onUpdate(kyc.id, "approved", "", "approve")}>Approve</Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => onUpdate(kyc.id, "rejected", reason, "reject")}>Reject</Button>
            <Button size="sm" variant="outline" className="text-amber-600" onClick={() => onUpdate(kyc.id, "re_kyc", reason || "CNIC correction", "re_kyc")}>Re-KYC</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function CaseCard({ c, onUpdate, resolutions, profileMap }: any) {
  const [reason, setReason] = useState("");
  const cur = c.currency || "USD"; const s = sym(cur); const seeker = profileMap[c.user_id];
  const isPending = c.status === "pending"; const isRejected = c.status === "rejected";
  
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900 ${isRejected ? "border-red-200 bg-red-50/20" : "border-slate-200 dark:border-slate-800"}`}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${c.status === "approved" ? "bg-emerald-100 text-emerald-700" : c.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{c.status}</span>
        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700">{c.category}</span>
        {c.was_free ? <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-[10px] font-black text-yellow-800">FREE</span> : <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black text-blue-800">PAID</span>}
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{c.title}</h3>
      <p className="text-sm text-slate-500">{c.short_description}</p>
      <p className="mt-2 text-xs font-semibold text-slate-600">📍 {c.city}, {c.country} · Needs: {s} {c.amount_needed} {cur} · Seeker: {seeker?.full_name || "—"}</p>
      
      {isRejected && c.rejection_reason && <div className="mt-3 rounded-xl border border-red-200 bg-red-100 p-3 text-sm text-red-800"><strong>Rejected:</strong> {c.rejection_reason}</div>}

      {isPending && (
        <div className="mt-4 flex flex-col gap-3 border-t pt-4">
          <Textarea placeholder="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="rounded-xl text-sm" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => { if (confirm("Approve?")) onUpdate(c.id, "approved"); }}>Approve</Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => { if (!reason.trim()) { toast.error("Reason required"); return; } onUpdate(c.id, "rejected", reason); setReason(""); }}>Reject</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function VerifyCard({ r, c, profileMap, onConfirm, onReject }: any) {
  const [reason, setReason] = useState("");
  const cur = c?.currency || "USD"; const s = sym(cur); const helper = profileMap[r.hero_id];
  const amt = Number(r.seeker_confirmed_amount ?? r.amount_paid ?? 0);
  return (
    <div className="rounded-2xl border-2 border-teal-300 bg-white p-5 shadow-lg dark:bg-slate-900">
      <div className="flex items-center gap-2 mb-3">
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-700">PENDING</span>
        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700">{c?.category}</span>
      </div>
      <p className="font-bold text-slate-900 dark:text-white">{c?.title}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Helper</p><p className="font-semibold">{helper?.full_name || "—"}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Amount</p><p className="font-black text-teal-600">{s} {amt} {cur}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400">TXN ID</p><p className="font-mono text-xs">{r.transaction_id}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Type</p><p className="capitalize text-xs">{isContributionResolution(r) ? "Fundraising" : "Direct"}</p></div>
      </div>
      {r.receipt_url && <a href={normalizeAdminMediaUrl(r.receipt_url)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-600 underline"><ExternalLink className="h-4 w-4" /> View Receipt</a>}
      <div className="mt-4 space-y-3 border-t pt-4">
        <Textarea placeholder="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="rounded-xl text-sm" />
        <div className="flex gap-2">
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => onConfirm(r)}>Verify & Add {s} {amt}</Button>
          <Button size="sm" variant="outline" className="text-red-600 border-red-300" disabled={!reason.trim()} onClick={() => onReject(r, reason)}>Reject</Button>
        </div>
      </div>
    </div>
  );
}

function ResolutionHistoryCard({ r, c, profileMap }: any) {
  const cur = c?.currency || "USD"; const s = sym(cur); const helper = profileMap[r.hero_id];
  const amt = Number(r.seeker_confirmed_amount ?? r.amount_paid ?? 0); const isRej = ["rejected", "disputed"].includes(normalizedResolutionStatus(r));
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900 ${isRej ? "border-red-200" : "border-slate-200"}`}>
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-900 dark:text-white">{c?.title || "Direct payment"}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${isRej ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700"}`}>{isRej ? "Rejected" : "Completed"}</span>
      </div>
      <p className="mt-2 text-sm text-slate-500">Helper: {helper?.full_name || "—"} · Amount: {s} {amt} {cur} · TXN: {r.transaction_id}</p>
    </div>
  );
}

function UserSearchBox({ usersList, onSuspendChange, onManualUnlock }: any) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();
  const filtered = usersList.filter((u: any) => { if (!q) return true; return [u.email, u.name, u.user_id, u.cnic].some((v) => String(v || "").toLowerCase().includes(q)); });
  return (
    <div className="space-y-4">
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-xl pl-9" /></div>
      {filtered.length === 0 ? <Empty text="No users" /> : filtered.map((u: any) => <UserCard key={u.user_id} u={u} onSuspendChange={onSuspendChange} onManualUnlock={onManualUnlock} />)}
    </div>
  );
}

function UserCard({ u, onSuspendChange, onManualUnlock }: any) {
  const [open, setOpen] = useState(false); const [reason, setReason] = useState("");
  async function toggle() {
    try {
      const newStatus = !u.isSuspended;
      await adminUpdateProfile(u.user_id, { is_suspended: newStatus, suspended_reason: newStatus ? (reason || "Repeated fraudulent cases") : null });
      if (newStatus) await adminUpsertUserSuspension({ user_id: u.user_id, suspension_count: (u.suspensionCount || 0) + 1, is_active: true, suspended_at: new Date().toISOString() });
      else await adminUpsertUserSuspension({ user_id: u.user_id, is_active: false, unlocked_at: new Date().toISOString() });
      toast.success(newStatus ? "Suspended." : "Unsuspended."); onSuspendChange();
    } catch { toast.error("Failed"); }
  }
  return (
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900 ${u.isSuspended ? "border-red-300" : "border-slate-200"}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-slate-50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-black text-teal-700">{u.name?.[0]?.toUpperCase() || "U"}</div>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate text-sm font-bold">{u.name} {u.isSuspended && <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-black text-white">SUSPENDED</span>}</p>
            <p className="truncate text-xs text-slate-500">{u.email}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-4 border-t bg-slate-50/50 p-4 dark:bg-slate-950/50">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[10px] font-bold uppercase text-slate-400">KYC</p><p className="text-sm font-bold capitalize">{u.kycStatus}</p></div>
            <div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[10px] font-bold uppercase text-slate-400">Wallet</p><p className="text-sm font-bold">{u.walletBalance} cr</p></div>
            <div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[10px] font-bold uppercase text-slate-400">Cases</p><p className="text-sm font-bold">{u.casesSubmitted}</p></div>
            <div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[10px] font-bold uppercase text-slate-400">Helps</p><p className="text-sm font-bold">{u.casesUnlocked}</p></div>
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">CNIC: {u.cnic || "—"} · Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</p>
          </div>
          {u.isSuspended ? (
            <Button size="sm" className="w-full bg-teal-600" onClick={() => onManualUnlock(u.user_id)}>Unlock Manually</Button>
          ) : (
            <div className="flex gap-2">
              <Input placeholder="Suspension reason" value={reason} onChange={(e) => setReason(e.target.value)} className="h-10 rounded-xl text-xs" />
              <Button size="sm" variant="destructive" onClick={toggle}>Suspend</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PayCloseCard({ c, profileMap, onClose, onReject }: any) {
  const cur = c.currency || "USD"; const s = sym(cur); const seeker = profileMap[c.user_id];
  const [receipt, setReceipt] = useState(""); const [reason, setReason] = useState(""); const [uploading, setUploading] = useState(false);
  async function upload(f: File | null) { if (!f) return; setUploading(true); try { setReceipt(await uploadFileToStorage(f, `paid_receipts/${c.id}/${Date.now()}`)); toast.success("Uploaded"); } catch { toast.error("Failed"); } finally { setUploading(false); } }
  return (
    <div className="rounded-2xl border-2 border-teal-300 bg-white p-5 shadow-lg dark:bg-slate-900">
      <div className="flex items-center gap-2 mb-3">
        <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-black text-teal-700">READY TO PAY</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold">{c.category}</span>
      </div>
      <p className="font-bold text-slate-900 dark:text-white">{c.title}</p>
      <p className="mt-1 text-sm text-slate-500">Collected: {s} {c.amount_collected} / {s} {c.amount_needed} · Seeker: {seeker?.full_name}</p>
      <div className="mt-4 space-y-3 border-t pt-4">
        <input type="file" onChange={(e) => upload(e.target.files?.[0] || null)} className="text-xs" />
        {uploading && <p className="text-xs text-amber-600">Uploading...</p>}
        <Button className="w-full bg-teal-600" disabled={!receipt && !c.paid_receipt_url} onClick={() => onClose(c, receipt)}>Mark as Paid & Close</Button>
      </div>
    </div>
  );
}

function DepositSearchBox({ deposits, onApprove, onReject, profileMap = {}, cnicByUser = {} }: any) {
  const [search, setSearch] = useState("");
  const filtered = search.trim() ? deposits.filter((d: any) => { const q = search.toLowerCase(); const p = profileMap[d.user_id] || {}; return [d.id, d.user_id, d.transaction_id, p.full_name, p.email, cnicByUser[d.user_id]].some((v) => String(v || "").toLowerCase().includes(q)); }) : deposits;
  return (
    <div className="space-y-3">
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search deposits..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 rounded-xl pl-9" /></div>
      {filtered.length === 0 ? <Empty text="No deposits" /> : filtered.map((d: any) => <DepositCard key={d.id} d={d} onApprove={onApprove} onReject={onReject} />)}
    </div>
  );
}

function DepositCard({ d, onApprove, onReject }: any) {
  const [reason, setReason] = useState(""); const [credits, setCredits] = useState(String(d.credits ?? d.amount ?? ""));
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="font-bold">{d.method}</p>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">{d.status}</span>
      </div>
      <p className="mt-1 text-xs font-mono text-slate-500">TXN: {d.transaction_id} · Amount: ${d.amount} → {d.credits ?? d.amount} Credits</p>
      {d.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <Input type="number" value={credits} onChange={(e) => setCredits(e.target.value)} className="h-10 w-24 rounded-xl" />
          <Button size="sm" className="bg-teal-600" onClick={() => onApprove(d, parseFloat(credits))}>Approve</Button>
          <Button size="sm" variant="outline" className="text-red-600" onClick={() => onReject(d.id, reason)}>Reject</Button>
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ fb, profileMap, caseList, onUpdate, busyId }: any) {
  const [reason, setReason] = useState(""); const p = profileMap[fb.user_id]; const c = caseList.find((cs: any) => cs.id === fb.case_id);
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900">
      <div className="flex items-center gap-2 mb-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${fb.status === "approved" ? "bg-teal-100 text-teal-700" : fb.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{fb.status}</span>
        {c && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold">{c.category}</span>}
      </div>
      <p className="text-xs font-bold text-slate-600">From: {p?.full_name || fb.first_name || "—"} · Case: {c?.title}</p>
      {fb.text_message && <p className="mt-2 text-sm text-slate-800">{fb.text_message}</p>}
      {fb.video_url && <video src={normalizeAdminMediaUrl(fb.video_url)} controls className="mt-3 w-full rounded-xl max-h-56" />}
      {fb.status === "pending_review" && (
        <div className="mt-4 flex gap-2 border-t pt-4">
          <Input placeholder="Rejection reason" value={reason} onChange={(e) => setReason(e.target.value)} className="h-10 rounded-xl" />
          <Button size="sm" className="bg-teal-600" onClick={() => onUpdate(fb.id, "approved")}>Approve</Button>
          <Button size="sm" variant="outline" className="text-red-600" onClick={() => onUpdate(fb.id, "rejected", reason)}>Reject</Button>
        </div>
      )}
    </div>
  );
}

function NotifyPanel({ profiles, kycList, caseList }: any) {
  const [group, setGroup] = useState("all"); const [title, setTitle] = useState(""); const [message, setMessage] = useState(""); const [link, setLink] = useState("/"); const [sending, setSending] = useState(false);
  const kycByUser: any = {}; for (const k of kycList) if (!(k.user_id in kycByUser)) kycByUser[k.user_id] = k.status;
  const caseCountByUser: any = {}; for (const c of caseList) if (["pending", "approved", "completed"].includes(c.status)) caseCountByUser[c.user_id] = (caseCountByUser[c.user_id] ?? 0) + 1;
  
  function targetUsers() {
    const all = profiles.map((p: any) => p.user_id).filter(Boolean);
    if (group === "all") return all;
    if (group === "no_kyc") return all.filter((u: string) => kycByUser[u] !== "approved");
    if (group === "kyc_no_case") return all.filter((u: string) => kycByUser[u] === "approved" && !caseCountByUser[u]);
    if (group === "kyc_approved") return all.filter((u: string) => kycByUser[u] === "approved");
    if (group === "submitted_case") return all.filter((u: string) => (caseCountByUser[u] ?? 0) > 0);
    return all;
  }
  const count = targetUsers().length;

  // 🔥 Ready-made Templates for every facility
  const TEMPLATES = [
    { label: "Complete KYC", title: "Complete your KYC ✅", msg: "You're almost there! Complete your identity verification (KYC) to unlock Givethra. Tap here to finish.", link: "/kyc" },
    { label: "Submit Free Case", title: "Your First Case is FREE 🎉", msg: "Your KYC is approved! Now submit your first case completely FREE — no fee. Tap here to start.", link: "/submit-request" },
    { label: "Become a Hero", title: "Become a Hero 🤲", msg: "You can help someone in need — directly or by contributing any amount. Tap here to help.", link: "/cases" },
    { label: "Wallet Deposit", title: "Add Credits to Your Wallet 💰", msg: "You need more credits? Deposit to your Givethra wallet now. Tap here to add credits.", link: "/wallet" },
    { label: "Unlock Account", title: "Unlock Your Account 🔓", msg: "Your account is suspended. Deposit 5 credits and unlock your account to continue using Givethra.", link: "/submit-request" },
    { label: "Check Notifications", title: "You have new notifications 🔔", msg: "Open Givethra to see your latest notifications — new helps, approvals, and messages.", link: "/notifications" },
    { label: "Join Community", title: "Join the Givethra Community 💬", msg: "Share your story, support others, and connect with our community. Tap here to explore.", link: "/community" },
    { label: "Shop Dreams", title: "Shop Dreams Now 🎁", msg: "Explore products under Rs 500 and support a good cause. Tap here to shop.", link: "/dreams" },
  ];

  async function send() {
    if (!title.trim() || !message.trim()) { toast.error("Fill title & message"); return; }
    const users = targetUsers(); if (users.length === 0) { toast.error("No users"); return; }
    if (!confirm(`Send to ${users.length} users?`)) return;
    setSending(true);
    try {
      const res = await adminBroadcastNotification({ user_ids: users, type: "admin_broadcast", title: title.trim(), message: message.trim(), link: link || "/" });
      toast.success(`Sent to ${res?.sent || 0} user(s).`); setTitle(""); setMessage("");
    } catch (e: any) { toast.error(e?.message || "Failed"); }
    finally { setSending(false); }
  }

  return (
    <div className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm dark:bg-slate-900">
      <div className="flex items-start gap-3 rounded-2xl bg-teal-50 p-4">
        <Megaphone className="h-5 w-5 text-teal-600" />
        <div>
          <p className="text-sm font-black text-teal-800">Send Notifications</p>
          <p className="mt-1 text-xs font-medium text-teal-700/80">Broadcast important messages to users of your choice.</p>
        </div>
      </div>

      {/* 🔥 Quick Fill Templates */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">⚡ Quick Templates</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.label} onClick={() => { setTitle(t.title); setMessage(t.msg); setLink(t.link); }} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-teal-50 hover:border-teal-300">
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Send to Group</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { k: "all", l: "All Users" }, { k: "no_kyc", l: "No KYC yet" },
            { k: "kyc_no_case", l: "KYC done, no case" }, { k: "kyc_approved", l: "All Verified" },
            { k: "submitted_case", l: "Submitted a case" },
          ].map((g) => (
            <button key={g.k} onClick={() => setGroup(g.k)} className={`rounded-xl border p-3 text-left text-sm font-bold transition ${group === g.k ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500" : "border-slate-200 hover:border-teal-300"}`}>
              {g.l}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. Your First Case is FREE 🎉)" className="h-12 rounded-xl" /></div>
      <div className="space-y-2"><Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Message..." className="rounded-xl" /></div>
      <div className="space-y-2">
        <select value={link} onChange={(e) => setLink(e.target.value)} className="h-12 w-full rounded-xl border bg-white px-3 text-sm dark:bg-slate-800">
          <option value="/">Home</option><option value="/kyc">KYC page</option><option value="/submit-request">Submit a case</option>
          <option value="/cases">Browse cases (Heroes)</option><option value="/wallet">Wallet</option><option value="/my-cases">My Cases</option>
          <option value="/community">Community</option><option value="/dreams">Dreams</option><option value="/notifications">Notifications</option>
        </select>
      </div>
      <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-base font-bold" disabled={sending} onClick={send}>
        <Send className="mr-2 h-4 w-4" /> {sending ? "Sending..." : `Send to ${count} user(s)`}
      </Button>
    </div>
  );
}

function OffersPanel({ offers, onReload }: any) {
  const offerMap: any = {}; for (const o of offers) offerMap[o.category] = o;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-teal-50 p-4 text-sm text-teal-800"><strong>Free-Listing Offers</strong> — Turn on for a category. (Note: every user's FIRST case is always free.)</div>
      {ALL_CATEGORIES.map((cat) => <OfferRow key={cat} category={cat} offer={offerMap[cat]} onReload={onReload} />)}
    </div>
  );
}

function OfferRow({ category, offer, onReload }: any) {
  const [active, setActive] = useState(offer?.is_active ?? false); const [limit, setLimit] = useState(String(offer?.free_limit ?? 50)); const [label, setLabel] = useState(offer?.label ?? ""); const [saving, setSaving] = useState(false);
  async function save(n: boolean) {
    setSaving(true);
    try { await adminUpsertCategoryOffer({ category, is_active: n, free_limit: parseInt(limit) || 0, label: label || null, updated_at: new Date().toISOString() }); setActive(n); toast.success(`Offer ${n ? "ON" : "OFF"}`); onReload(); }
    catch { toast.error("Failed"); } finally { setSaving(false); }
  }
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-teal-300 bg-teal-50/40 dark:bg-teal-950/10" : "border-slate-200 bg-white dark:bg-slate-900"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-bold">{category}</p>
        <Button size="sm" variant={active ? "default" : "outline"} className={active ? "bg-teal-600" : ""} disabled={saving} onClick={() => save(!active)}>{active ? "ON" : "OFF"}</Button>
      </div>
      {active && (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
          <Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="Limit" className="h-9 rounded-lg" />
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="h-9 rounded-lg" />
        </div>
      )}
    </div>
  );
}

function SupportPanel({ allMsgs, profileMap, onNewMessage, unreadCount }: any) {
  const [activeUser, setActiveUser] = useState<string | null>(null); const [reply, setReply] = useState(""); const [sending, setSending] = useState(false); const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [liveMsgs, setLiveMsgs] = useState<any[]>(allMsgs); const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setLiveMsgs(allMsgs), [allMsgs]);
  
  const byUser: any = {}; for (const m of liveMsgs) { if (!byUser[m.user_id]) byUser[m.user_id] = []; byUser[m.user_id].push(m); }
  const conversations = Object.keys(byUser).map((uid) => { const m = byUser[uid]; const l = m[m.length - 1]; const p = profileMap[uid]; return { uid, name: p?.full_name || "Unknown", email: p?.email || uid.slice(0, 8), last: l, unread: m.filter((x: any) => x.sender === "user" && !x.is_read).length }; }).sort((a, b) => new Date(b.last?.created_at ?? 0).getTime() - new Date(a.last?.created_at ?? 0).getTime());

  async function openChat(uid: string) { setActiveUser(uid); try { await adminMarkSupportMessagesAsRead(uid); setLiveMsgs((prev) => prev.map((m) => (m.user_id === uid && m.sender === "user") ? { ...m, is_read: true } : m)); onNewMessage?.(); } catch {} }
  async function sendReply() {
    if ((!reply.trim() && !attachmentFile) || !activeUser || sending) return;
    setSending(true);
    try {
      let url = "";
      if (attachmentFile) url = await uploadFileToStorage(attachmentFile, `support_attachments/${Date.now()}_${attachmentFile.name}`);
      const msg = await adminSendSupportReply({ user_id: activeUser, message: reply.trim() || null, attachment_url: url || null });
      setLiveMsgs((p) => [...p, msg]); setReply(""); setAttachmentFile(null); onNewMessage?.(); toast.success("Sent!");
    } catch { toast.error("Failed"); } finally { setSending(false); }
  }

  if (activeUser) {
    const msgs = byUser[activeUser] ?? []; const conv = conversations.find((c) => c.uid === activeUser);
    return (
      <div className="flex h-[70vh] flex-col rounded-2xl border bg-white shadow-sm dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b p-3">
          <button onClick={() => setActiveUser(null)}><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex-1"><p className="font-bold">{conv?.name}</p><p className="text-xs text-slate-500">{conv?.email}</p></div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50 p-4 dark:bg-slate-950">
          {msgs.map((m) => (
            <div key={m.id} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.sender === "admin" ? "bg-teal-600 text-white" : "bg-white border"}`}>
                {m.message && <p className="whitespace-pre-wrap">{m.message}</p>}
                {m.attachment_url && <a href={normalizeAdminMediaUrl(m.attachment_url)} target="_blank" rel="noreferrer" className="mt-1 block underline text-xs">📎 Attachment</a>}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2 border-t p-3">
          <input type="file" ref={fileInputRef} onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)} className="hidden" />
          <Button size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()}><Paperclip className="h-4 w-4" /></Button>
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={1} className="flex-1 rounded-xl" placeholder="Reply..." />
          <Button size="icon" className="rounded-full bg-teal-600" onClick={sendReply} disabled={sending}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.length === 0 ? <Empty text="No messages" /> : conversations.map((c) => (
        <button key={c.uid} onClick={() => openChat(c.uid)} className="flex w-full items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-left hover:bg-slate-50 dark:bg-slate-900">
          <div className="min-w-0 flex-1"><p className="truncate font-bold">{c.name}</p><p className="truncate text-xs text-slate-500">{c.last?.message || "📎 Attachment"}</p></div>
          {c.unread > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">{c.unread}</span>}
        </button>
      ))}
    </div>
  );
}

function Empty({ text }: { text: string }) { return <div className="py-12 text-center"><ClipboardCheck className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-400">{text}</p></div>; }

function Img({ url, label }: { url: string; label: string }) {
  const u = normalizeAdminMediaUrl(url);
  return (
    <div className="space-y-1">
      <p className="truncate text-[10px] font-bold text-slate-500">📎 {label}</p>
      <a href={u} target="_blank" rel="noreferrer"><img src={u} alt={label} className="h-24 w-full rounded-lg border object-cover" /></a>
    </div>
  );
}
