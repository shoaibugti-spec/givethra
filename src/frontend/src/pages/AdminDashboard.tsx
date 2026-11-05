// src/pages/AdminPage.tsx
// Complete Admin Panel — FULLY PRESERVED CaseCard, KYC details, Documents view.
// ONLY improvement: Approve/Reject are now instant (no full reload).

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { sendNotification } from "@/lib/notify";
import {
  Shield as ShieldIcon, CheckCircle, XCircle, ClipboardCheck, FileText, Download,
  ExternalLink, Heart, Coins, Users, ChevronDown, Wallet, Mail, Calendar, Send,
  ArrowLeft, Gift, AlertTriangle, Building2, Copy, Megaphone, HandCoins, Eye, User,
  Search, Paperclip, Loader2, X, RotateCw, Ban, MessageCircle, Sparkles, TrendingUp, Info,
  BookOpen, MapPin,
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
  const [caseBusyId, setCaseBusyId] = useState<string | null>(null);
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

  // ⚡ FAST KYC UPDATE — instant state update, no reload
  async function updateKyc(id: string, status: string, reason = "", action: "approve" | "reject" | "re_kyc" | "duplicate" = "approve") {
    const kyc = kycList.find((k) => k.id === id);
    if (!kyc || kycBusyId) return;
    setKycBusyId(id);
    try {
      if (action === "duplicate") {
        const cnic = cleanCnic(kyc.cnic_number);
        if (!cnic) { toast.error("No CNIC found"); return; }
        const dup = kycList.some((k) => cleanCnic(k.cnic_number) === cnic && normalizedAdminStatus(k.status) === "approved" && k.id !== id);
        if (dup) {
          await adminUpdateKyc(id, { status: "duplicate", reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: `Duplicate KYC - CNIC: ${kyc.cnic_number}` });
          await adminUpdateProfile(kyc.user_id, { is_suspended: true, suspended_reason: `Duplicate KYC`, suspended_at: new Date().toISOString() });
          const existingSusp = await adminGetUserSuspension(kyc.user_id);
          await adminUpsertUserSuspension({ user_id: kyc.user_id, suspension_count: (existingSusp?.suspension_count || 0) + 1, is_active: true, suspended_at: new Date().toISOString(), rejection_count_at_suspension: 0 });
          await sendNotification(kyc.user_id, "system", "🚫 Account Suspended (Duplicate KYC)", `Duplicate KYC detected.`, "/support");
          setKycList((cur) => cur.map((row) => row.id === id ? { ...row, status: "duplicate", rejection_reason: "Duplicate KYC" } : row));
          toast.success("Marked duplicate & banned."); return;
        } else { toast.error("No approved KYC with this CNIC found."); return; }
      }
      const reviewedAt = new Date().toISOString();
      await adminUpdateKyc(id, { status, reviewed_at: reviewedAt, reviewed_by: user?.email, rejection_reason: reason });
      setKycList((cur) => cur.map((row) => row.id === id ? { ...row, status, reviewed_at: reviewedAt, reviewed_by: user?.email, rejection_reason: reason } : row));
      if (status === "re_kyc" && kyc.user_id) await sendNotification(kyc.user_id, "kyc_re_kyc", "KYC Requires Re-submission 🔄", `Reason: ${reason}`, "/kyc");
      toast.success(`✅ KYC ${status}`);
    } catch (error: any) {
      toast.error(error?.message || "KYC update failed.");
    } finally { setKycBusyId(null); }
  }

  // ⚡ FAST CASE UPDATE — optimistic state update, no reload
  async function updateCase(id: string, status: string, reason = "") {
    const c = caseList.find((cs) => cs.id === id);
    if (!c || caseBusyId) return;
    setCaseBusyId(id);
    const previousStatus = c.status;
    setCaseList((cur) => cur.map((row) => row.id === id ? { ...row, status, rejection_reason: reason } : row));
    try {
      await adminUpdateCase(id, { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: reason });
      if (c?.user_id && status === "approved") sendNotification(c.user_id, "case_approved", "Case Approved ✅", `Your case "${c.title}" is now live for Heroes.`, "/my-cases").catch(() => {});
      else if (c?.user_id && status === "rejected") {
        sendNotification(c.user_id, "case_rejected", "Case Rejected", (reason ? `Reason: ${reason}. ` : "") + (c.was_free ? "Free offer restored." : "1 credit refunded."), "/my-cases").catch(() => {});
        checkAndSuspendUser(c.user_id).catch(() => {});
      } else if (c?.user_id && status === "completed") sendNotification(c.user_id, "case_completed", "Case Completed ✅", `Your case "${c.title}" is completed.`, "/my-cases").catch(() => {});
      else if (c?.user_id && status === "expired") sendNotification(c.user_id, "case_expired", "Case Expired ⏰", `Your case "${c.title}" expired.`, "/submit-request").catch(() => {});
      toast.success(`✅ Case ${status}`);
    } catch (error: any) {
      setCaseList((cur) => cur.map((row) => row.id === id ? { ...row, status: previousStatus, rejection_reason: c.rejection_reason } : row));
      toast.error(error?.message || "Case review failed.");
    } finally { setCaseBusyId(null); }
  }

  async function updateFeedback(fbId: string, status: string, reason = "") {
    if (status === "rejected" && !reason.trim()) { toast.error("Provide a rejection reason."); return; }
    if (feedbackBusyId) return;
    const fb = feedbacks.find((f) => f.id === fbId);
    const previousStatus = fb?.status;
    setFeedbackBusyId(fbId);
    setFeedbacks((cur) => cur.map((item) => item.id === fbId ? { ...item, status, rejection_reason: reason } : item));
    try {
      await adminUpdateFeedback(fbId, { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: reason });
      if (fb?.user_id && fb.case_id) {
        if (status === "approved") sendNotification(fb.user_id, "system", "Feedback Approved 🎉", "Your feedback is now live!", "/my-cases").catch(() => {});
        else sendNotification(fb.user_id, "system", "Feedback Needs Improvement", `Reason: ${reason}`, `/cases/${fb.case_id}`).catch(() => {});
      }
      toast.success(status === "approved" ? "✅ Feedback approved" : "❌ Feedback rejected");
    } catch (error: any) {
      setFeedbacks((cur) => cur.map((item) => item.id === fbId ? { ...item, status: previousStatus || "pending_review" } : item));
      toast.error("Feedback update failed.");
    } finally { setFeedbackBusyId(null); }
  }

  async function checkAndSuspendUser(userId: string) {
    const rejectedCount = caseList.filter((c) => c.user_id === userId && c.status === "rejected").length;
    if (rejectedCount >= 5) {
      const existing = await adminGetUserSuspension(userId);
      const newCount = (existing?.suspension_count || 0) + 1;
      await adminUpsertUserSuspension({ user_id: userId, suspension_count: newCount, is_active: true, suspended_at: new Date().toISOString(), rejection_count_at_suspension: rejectedCount });
      await adminUpdateProfile(userId, { is_suspended: true, suspended_reason: `${rejectedCount} rejected cases`, suspended_at: new Date().toISOString() });
      await sendNotification(userId, "system", "🚫 Account Suspended", `${rejectedCount} cases rejected.`, "/submit-request");
    }
  }

  async function manualUnlockUser(userId: string) {
    if (!confirm("Manually unlock this user?")) return;
    try {
      await adminUpsertUserSuspension({ user_id: userId, is_active: false, unlocked_at: new Date().toISOString() });
      await adminUpdateProfile(userId, { is_suspended: false, suspended_reason: null });
      await sendNotification(userId, "system", "Account Unlocked", "Account unlocked by Admin.", "/dashboard");
      setSuspensions((cur) => cur.map((s) => s.user_id === userId ? { ...s, is_active: false } : s));
      toast.success("User unlocked.");
    } catch { toast.error("Failed to unlock."); }
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
    setResolutions((cur) => cur.map((row) => row.id === res.id ? { ...row, status: "completed", admin_confirmed: true } : row));
    try {
      await adminUpdateResolution(res.id, { status: "completed", admin_confirmed: true, admin_confirmed_at: new Date().toISOString(), completed_at: new Date().toISOString() });
      const goalReached = amountNeeded > 0 && newCollected >= amountNeeded;
      if (res.hero_id) sendNotification(res.hero_id, "case_completed", "Help verified! 🎉", `Verified ${sym(c.currency)} ${confirmedAmt}`, `/cases/${res.case_id}`).catch(() => {});
      if (res.seeker_id) {
        if (isFundraising) sendNotification(res.seeker_id, "system", goalReached ? "Goal reached! 🎉" : "More help received", goalReached ? `Case fully funded!` : `${sym(c.currency)} ${confirmedAmt} more received.`, `/cases/${res.case_id}`).catch(() => {});
        else { const stillOpen = amountNeeded > 0 && newCollected < amountNeeded; sendNotification(res.seeker_id, "system", stillOpen ? "Partial help" : "Complete! 🎉", stillOpen ? `Remaining: ${sym(c.currency)} ${amountNeeded - newCollected}` : `Fully helped!`, `/cases/${res.case_id}`).catch(() => {}); }
      }
      toast.success(`✅ Verified ${sym(c.currency)} ${confirmedAmt}`);
    } catch (error: any) {
      setResolutions((cur) => cur.map((row) => row.id === res.id ? { ...row, status: res.status } : row));
      toast.error(error?.message || "Verification failed.");
    }
  }

  async function rejectResolution(res: any, reason: string) {
    const trimmed = String(reason || "").trim();
    if (!trimmed) { toast.error("Provide a reason."); return; }
    setResolutions((cur) => cur.map((row) => row.id === res.id ? { ...row, status: "disputed", notes: trimmed } : row));
    try {
      await adminUpdateResolution(res.id, { status: "disputed", admin_confirmed: false, notes: trimmed });
      if (res.hero_id) sendNotification(res.hero_id, "help_rejected", "Proof needs correction", `Reason: ${trimmed}`, `/cases/${res.case_id}`).catch(() => {});
      toast.success("Proof rejected.");
    } catch (error: any) {
      setResolutions((cur) => cur.map((row) => row.id === res.id ? { ...row, status: res.status } : row));
      toast.error(error?.message || "Rejection failed.");
    }
  }

  async function markAsPaidAndClose(c: any, receiptUrl: string) {
    if (!String(receiptUrl || c.paid_receipt_url || "").trim()) { toast.error("Upload receipt."); return; }
    setCaseList((cur) => cur.map((row) => row.id === c.id ? { ...row, status: "completed", closed_by_admin: true, paid_receipt_url: receiptUrl || null } : row));
    try {
      await adminCloseCase(c.id, { status: "completed", closed_by_admin: true, paid_receipt_url: receiptUrl || null });
      if (c.user_id) sendNotification(c.user_id, "case_completed", "Bill paid! 🎉", `Case "${c.title}" closed.`, `/cases/${c.id}`).catch(() => {});
      toast.success("Case closed.");
    } catch (error: any) {
      setCaseList((cur) => cur.map((row) => row.id === c.id ? { ...row, status: c.status } : row));
      toast.error(error?.message || "Failed to close.");
    }
  }

  async function rejectPayClose(c: any, reason: string) {
    const trimmed = String(reason || "").trim();
    if (!trimmed) { toast.error("Provide a reason."); return; }
    const nextStatus = isExpiredCaseRecord(c) ? "expired" : "approved";
    try {
      await adminCloseCase(c.id, { status: nextStatus, closed_by_admin: false, rejection_reason: trimmed, paid_receipt_url: null });
      setCaseList((cur) => cur.map((row) => row.id === c.id ? { ...row, status: nextStatus, closed_by_admin: false, rejection_reason: trimmed } : row));
      toast.success("Returned to review.");
    } catch (error: any) { toast.error(error?.message || "Failed."); }
  }

  async function approveDeposit(dep: any, finalCredits: number) {
    const credits = (finalCredits ?? (dep.credits ?? dep.amount)) || 0;
    setDeposits((cur) => cur.map((row) => row.id === dep.id ? { ...row, status: "approved", credits } : row));
    try {
      await adminUpdateDeposit(dep.id, { status: "approved", credits, reviewed_at: new Date().toISOString(), reviewed_by: user?.email });
      if (dep.user_id) sendNotification(dep.user_id, "credits_added", "Credits Added 💰", `${credits} credit(s) added.`, "/wallet").catch(() => {});
      toast.success(`✅ ${credits} credits added.`);
    } catch (e: any) {
      setDeposits((cur) => cur.map((row) => row.id === dep.id ? { ...row, status: dep.status } : row));
      toast.error(e?.message || "Failed.");
    }
  }

  async function cleanupAllRejectedFiles() {
    if (!confirm("Delete all files associated with rejected records?")) return;
    setLoading(true);
    try { const result = await adminDeleteFiles([]); toast.success(`Cleaned ${Number(result?.deleted || 0)} files.`); }
    catch { toast.error("Cleanup failed."); }
    await loadData();
  }

  async function rejectDeposit(id: string, reason: string) {
    const dep = deposits.find((d) => d.id === id);
    setDeposits((cur) => cur.map((row) => row.id === id ? { ...row, status: "rejected", rejection_reason: reason } : row));
    try {
      await adminUpdateDeposit(id, { status: "rejected", reviewed_at: new Date().toISOString(), reviewed_by: user?.email, rejection_reason: reason });
      if (dep?.user_id) sendNotification(dep.user_id, "deposit_rejected", "Deposit Rejected", reason || "Please try again.", "/wallet").catch(() => {});
      toast.success("Deposit rejected.");
    } catch (error: any) {
      setDeposits((cur) => cur.map((row) => row.id === id ? { ...row, status: dep?.status } : row));
      toast.error(error?.message || "Failed.");
    }
  }

  async function reviewWithdrawal(withdrawal: any, status: "approved" | "rejected" | "completed", proof?: string) {
    if (withdrawalBusyId) return;
    setWithdrawalBusyId(withdrawal.id);
    try {
      const result = await adminUpdateWithdrawal(withdrawal.id, { status, ...(proof ? { payment_proof_url: proof } : {}) });
      setWithdrawals((cur) => cur.map((row) => row.id === withdrawal.id ? { ...row, ...result, status } : row));
      toast.success(`Withdrawal ${status}.`);
    } catch (error: any) { toast.error(error?.message || "Failed."); }
    finally { setWithdrawalBusyId(null); }
  }

  // Computed values
  const pendingKyc = kycList.filter((k) => normalizedAdminStatus(k.status) === "pending");
  const approvedKycCount = kycList.filter((k) => normalizedAdminStatus(k.status) === "approved").length;
  const rejectedKycCount = kycList.filter((k) => normalizedAdminStatus(k.status) === "rejected").length;
  const pendingCases = caseList.filter((c) => normalizedAdminStatus(c.status) === "pending");
  const approvedCasesCount = caseList.filter((c) => normalizedAdminStatus(c.status) === "approved" && !isExpiredCaseRecord(c)).length;
  const rejectedCasesCount = caseList.filter((c) => normalizedAdminStatus(c.status) === "rejected").length;
  const completedCasesCount = caseList.filter((c) => normalizedAdminStatus(c.status) === "completed" && !isExpiredCaseRecord(c)).length;
  const expiredCasesCount = caseList.filter((c) => isExpiredCaseRecord(c)).length;
  const pendingDeposits = deposits.filter((d) => normalizedAdminStatus(d.status) === "pending");
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

  const resByCaseId: Record<string, any[]> = {};
  for (const r of resolutions) { if (!resByCaseId[r.case_id]) resByCaseId[r.case_id] = []; resByCaseId[r.case_id].push(r); }

  // ============================================================
  // MAIN PREMIUM UI
  // ============================================================
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-3 py-6 pb-20 sm:px-5 sm:py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg">
              <ShieldIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">Admin Control</h1>
              <p className="text-sm font-medium text-slate-500">Full admin panel with all details.</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={cleanupAllRejectedFiles}>
            🗑️ Cleanup Rejected Files
          </Button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Pending KYC", value: pendingKyc.length, icon: ShieldIcon, color: "from-amber-400 to-orange-500" },
            { label: "Pending Cases", value: pendingCases.length, icon: FileText, color: "from-blue-400 to-indigo-500" },
            { label: "Verify Help", value: pendingResolutions.length, icon: HandCoins, color: "from-pink-400 to-rose-500" },
            { label: "Ready to Pay", value: readyToClose.length, icon: Coins, color: "from-teal-400 to-emerald-500" },
            { label: "Suspensions", value: activeSuspensions, icon: Ban, color: "from-red-400 to-red-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <motion.div key={label} whileHover={{ y: -3 }} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-4 text-white shadow-lg`}>
              <Icon className="absolute right-2 top-2 h-12 w-12 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">{label}</p>
              <p className="mt-1 text-2xl font-black">{value}</p>
            </motion.div>
          ))}
        </div>

        {duplicateCnicCount > 0 && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p><strong>{duplicateCnicCount} CNIC(s)</strong> used multiple times.</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-1 rounded-2xl bg-slate-100 p-1.5">
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
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-black ${tab.badge === "red" ? "bg-red-500 text-white" : tab.badge === "teal" ? "bg-teal-500 text-white" : "bg-amber-500 text-white"} data-[state=active]:bg-white/30`}>{tab.c}</span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="donations" className="space-y-4"><AdminDonationsPanel onQueueChanged={refreshSubmissionCounts} /></TabsContent>
            <TabsContent value="dreams" className="space-y-4"><AdminDreamsPanel onQueueChanged={refreshSubmissionCounts} /></TabsContent>
            <TabsContent value="helpme" className="space-y-4"><AdminHelpMePanel onQueueChanged={refreshSubmissionCounts} /></TabsContent>

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
                  { label: "Hero Helps", value: unlocks.length, icon: Heart },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-teal-50 p-2 text-teal-600"><Icon className="h-4 w-4" /></div>
                      <p className="text-xs font-semibold text-slate-500">{label}</p>
                    </div>
                    <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="users"><UserSearchBox usersList={usersList} onSuspendChange={loadData} onManualUnlock={manualUnlockUser} /></TabsContent>
            <TabsContent value="kyc"><KycSearchBox kycList={kycList} onUpdate={updateKyc} cnicCounts={cnicCounts} profileMap={profileMap} busyId={kycBusyId} /></TabsContent>
            <TabsContent value="cases"><CaseSearchBox caseList={caseList} onUpdate={updateCase} resolutions={resByCaseId} profileMap={profileMap} cnicByUser={cnicByUser} statusFilter={caseStatusFilter} setStatusFilter={setCaseStatusFilter} busyId={caseBusyId} /></TabsContent>

            <TabsContent value="verify" className="space-y-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search..." value={resolutionSearch} onChange={(e) => setResolutionSearch(e.target.value)} className="h-11 rounded-xl pl-9" /></div>
              <div className="grid grid-cols-3 gap-2 rounded-xl border bg-slate-50 p-1">
                {["pending", "rejected", "completed"].map((v) => (
                  <button key={v} onClick={() => setResolutionView(v as any)} className={`rounded-lg py-2 text-xs font-bold capitalize transition-all ${resolutionView === v ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>{v} ({v === "pending" ? pendingDirectCount : v === "rejected" ? rejectedDirectResolutions.length : completedDirectResolutions.length})</button>
                ))}
              </div>
              {visibleDirectResolutions.length === 0 ? <Empty text="Nothing here" /> : visibleDirectResolutions.map((r) => { const c = caseList.find((cs) => cs.id === r.case_id); return resolutionView === "pending" ? <VerifyCard key={r.id} r={r} c={c} profileMap={profileMap} onConfirm={confirmResolution} onReject={rejectResolution} /> : <ResolutionHistoryCard key={r.id} r={r} c={c} profileMap={profileMap} />; })}
            </TabsContent>

            <TabsContent value="contributions" className="space-y-4">
              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search..." value={resolutionSearch} onChange={(e) => setResolutionSearch(e.target.value)} className="h-11 rounded-xl pl-9" /></div>
              <div className="grid grid-cols-3 gap-2 rounded-xl border bg-slate-50 p-1">
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

            <TabsContent value="notify"><NotifyPanel profiles={profiles} kycList={kycList} caseList={caseList} /></TabsContent>
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
              <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5">
                <h2 className="text-xl font-black text-amber-900">Earnings Withdrawals</h2>
                <p className="mt-1 text-sm font-medium text-amber-800/70">Review manual PKR payouts and attach payment proof.</p>
              </div>
              <div className="grid gap-3">
                {withdrawals.length ? withdrawals.map((w: any) => (
                  <div key={w.id} className="rounded-2xl border bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{w.full_name || w.email || w.user_id}</p>
                        <p className="text-xs font-medium text-slate-500">{w.amount_pkr} PKR · {w.bank_name} · {w.account_title} · {w.account_number}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{w.status}</span>
                    </div>
                    {w.payment_proof_url ? <a className="mt-2 inline-block text-xs font-semibold text-teal-600 underline" href={w.payment_proof_url} target="_blank" rel="noreferrer">View proof</a> : null}
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
// SUB-COMPONENTS (FULL DETAILS PRESERVED)
// ============================================================

function SuspensionsPanel({ suspensions, profiles, onUnlock, onReload }: any) {
  const active = suspensions.filter((s: any) => s.is_active);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p><strong>Total:</strong> {suspensions.length} · <strong>Active:</strong> {active.length}</p>
      </div>
      {active.length === 0 ? <Empty text="No active suspensions" /> : active.map((s: any) => {
        const p = profiles.find((pr: any) => pr.user_id === s.user_id);
        return (
          <div key={s.id} className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-5 w-5 text-red-600" />
                <span className="font-bold">{p?.full_name || "Unknown"}</span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">#{s.suspension_count}</span>
              </div>
              <Button size="sm" variant="outline" className="text-teal-600 border-teal-300" onClick={() => onUnlock(s.user_id)}>Unlock</Button>
            </div>
            <p className="mt-2 text-xs text-slate-500">Rejections: {s.rejection_count_at_suspension} · {new Date(s.suspended_at).toLocaleDateString()}</p>
          </div>
        );
      })}
    </div>
  );
}

function KycSearchBox({ kycList, onUpdate, cnicCounts, profileMap, busyId }: any) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
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

function CaseSearchBox({ caseList, onUpdate, resolutions, profileMap, cnicByUser, statusFilter, setStatusFilter, busyId }: any) {
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
      {filtered.length === 0 ? <Empty text="No cases" /> : filtered.map((c: any) => <CaseCard key={c.id} c={isExpiredCaseRecord(c) ? { ...c, status: "expired" } : c} onUpdate={onUpdate} resolutions={resolutions[c.id] ?? []} profileMap={profileMap} busy={busyId === c.id} />)}
    </div>
  );
}

function KycCard({ kyc, onUpdate, dupCount, busy }: any) {
  const [reason, setReason] = useState("");
  const status = normalizedAdminStatus(kyc.status);
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${dupCount > 1 && status === "pending" ? "border-red-300 bg-red-50/30" : "border-slate-200"}`}>
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${status === "approved" ? "bg-emerald-100 text-emerald-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{status}</span>
        {dupCount > 1 && status === "pending" && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">⚠️ Duplicate ({dupCount})</span>}
      </div>
      <p className="text-base font-bold text-slate-900">{kyc.full_name}</p>
      <p className="text-xs font-medium text-slate-500">{kyc.document_type?.toUpperCase()} · {kyc.cnic_number}</p>
      <p className="text-xs text-slate-500 mt-1">{kyc.address}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kyc.cnic_front_url && <Img url={kyc.cnic_front_url} label="CNIC Front" />}
        {kyc.cnic_back_url && <Img url={kyc.cnic_back_url} label="CNIC Back" />}
        {kyc.selfie_url && <Img url={kyc.selfie_url} label="Selfie" />}
        {kyc.passport_url && <a href={normalizeAdminMediaUrl(kyc.passport_url)} target="_blank" rel="noopener noreferrer" className="text-xs text-teal-600 flex items-center gap-1"><FileText className="h-3 w-3" /> Passport</a>}
        {kyc.face_video_url && (
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500">Face Video</p>
            <video src={normalizeAdminMediaUrl(kyc.face_video_url)} controls preload="metadata" className="w-full rounded border max-h-32 bg-black" />
          </div>
        )}
      </div>
      {status === "pending" && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <Textarea
            placeholder="Rejection reason (optional — required when rejecting)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-200"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold" disabled={busy} onClick={() => onUpdate(kyc.id, "approved", "", "approve")}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />} Approve
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300 font-bold" disabled={busy || !reason.trim()} onClick={() => onUpdate(kyc.id, "rejected", reason, "reject")}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <XCircle className="h-3.5 w-3.5 mr-1" />} Reject
            </Button>
            <Button size="sm" variant="outline" className="text-amber-600 border-amber-300 font-bold" disabled={busy || !reason.trim()} onClick={() => onUpdate(kyc.id, "re_kyc", reason, "re_kyc")}>
              <RotateCw className="h-3.5 w-3.5 mr-1" /> Re-KYC
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// COMPLETE CaseCard — WITH ALL DETAILS (Documents, Category, Receiver, etc.)
// ============================================================
function CaseCard({ c, onUpdate, resolutions, profileMap, busy }: any) {
  const [reason, setReason] = useState("");
  const cur = c.currency || "USD";
  const s = sym(cur);
  const seeker = profileMap[c.user_id];
  const hasPayment = c.institute_name || c.account_number || c.account_title || c.account_iban;
  const parseObject = (value: unknown): any => {
    if (value && typeof value === "object") return value;
    if (typeof value === "string") {
      try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" ? parsed : null; } catch { return null; }
    }
    return null;
  };
  const catDetails = parseObject(c.category_details);
  const catDocs = parseObject(catDetails?._documents) || {};

  const allFields: { label: string; value: any }[] = [];
  if (catDetails) {
    const excludeKeys = new Set([
      "_documents", "edu_documents", "edu_sub_fields", "property_ownership",
      "rental_agreement_url", "landlord_cnic_url", "job_status", "gender",
      "statement_url", "salary_slip_url", "pension_proof_url", "previous_income_proof_url", "owner_cnic_url", "property_rental_agreement_url",
      "property_landlord_cnic_url", "property_owner_cnic_url", "owner_relation",
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
      if (key.startsWith("_") || key.endsWith("_url") || /url$/i.test(key)) continue;
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
    { label: "Owner Relation", value: catDetails?.owner_relation || "" },
  ].filter((d) => d.value);

  const electricAppliances = catDetails?.appliances && typeof catDetails.appliances === "string"
    ? parseObject(catDetails.appliances)
    : catDetails?.appliances;
  const electricApplianceText = electricAppliances && typeof electricAppliances === "object"
    ? Object.entries(electricAppliances).filter(([, count]) => Number(count) > 0).map(([key, count]) => `${getDocLabel(key)}: ${count}`).join(", ")
    : "";
  const utilityDetails = ["Electricity Bill", "Gas Bill", "Water Bill"].includes(c.category) ? [
    { label: "Monthly Units", value: catDetails?.monthly_units ? `${catDetails.monthly_units} units` : "—" },
    { label: "Eligibility", value: Number(catDetails?.monthly_units) >= 1 && Number(catDetails?.monthly_units) <= 300 ? "Eligible (1–300 units)" : "Not eligible" },
    ...(c.category === "Electricity Bill" ? [{ label: "Appliances", value: electricApplianceText || "None selected" }] : []),
  ] : [];

  const fileEntries: { key: string; label: string; url: string }[] = [];
  
  function getFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const key = urlObj.searchParams.get("key");
      if (key) {
        const parts = key.split("/");
        const lastPart = parts[parts.length - 1];
        if (lastPart) {
          let name = decodeURIComponent(lastPart).replace(/^[0-9]+[-_]/, "").replace(/^[a-f0-9]{8,}[-_]/, "");
          if (name && name.length > 0 && name !== "null") return name;
        }
      }
      const pathParts = urlObj.pathname.split("/");
      const last = pathParts[pathParts.length - 1];
      if (last) {
        let name = decodeURIComponent(last).replace(/^[0-9]+[-_]/, "").replace(/^[a-f0-9]{8,}[-_]/, "");
        if (name && name.length > 0 && name !== "null") return name;
      }
      return "File";
    } catch { return "File"; }
  }

  function getFileLabel(key: string, url: string, explicitLabel?: string): string {
    if (explicitLabel?.trim()) return explicitLabel.trim();
    if (DOC_LABELS[key]) return DOC_LABELS[key];
    const fileName = getFileNameFromUrl(url);
    if (fileName === "File" || fileName === "photo" || fileName === "uploads" || fileName.match(/^[0-9a-f]{8,}$/i)) {
      const cleanKey = key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
      if (cleanKey && cleanKey !== "Photo" && cleanKey !== "File") return cleanKey;
      return "Uploaded File";
    }
    return fileName;
  }

  const pushFile = (key: string, value: unknown, explicitLabel?: string) => {
    let url = "";
    let label = explicitLabel;
    if (typeof value === "string") { url = value.trim(); }
    else if (value && typeof value === "object") {
      const file = value as Record<string, unknown>;
      const candidate = file.url || file.file_url || file.download_url || file.href || file.path;
      if (typeof candidate === "string") url = candidate.trim();
      const name = file.original_name || file.filename || file.file_name || file.name;
      if (!label && typeof name === "string") label = name;
    }
    url = normalizeAdminMediaUrl(url);
    if (!url.startsWith("http")) return;
    if (fileEntries.some((f) => f.url === url)) return;
    fileEntries.push({ key, label: getFileLabel(key, url, label), url });
  };

  pushFile("selfie_url", c.selfie_url);
  pushFile("video_url", c.video_url);
  pushFile("paid_receipt_url", c.paid_receipt_url);
  pushFile("salary_slip", c.salary_slip_url || catDetails?.salary_slip_url, "Salary Slip (6 Months)");
  pushFile("statement", c.statement_url || catDetails?.statement_url, "Bank Statement (6 Months)");
  pushFile("pension_proof", c.pension_proof_url || catDetails?.pension_proof_url, "Pension Slip / Pension Proof");
  pushFile("previous_income_proof", c.previous_income_proof_url || catDetails?.previous_income_proof_url, "Previous Employment / Income Proof");
  pushFile("rental_agreement", catDetails?.rental_agreement_url || catDetails?.property_rental_agreement_url || catDetails?.rentalAgreementUrl, "Rental Agreement");
  pushFile("landlord_cnic", catDetails?.landlord_cnic_url || catDetails?.property_landlord_cnic_url || catDetails?.landlordCnicUrl, "Landlord's CNIC");
  pushFile("owner_cnic", catDetails?.owner_cnic_url || catDetails?.property_owner_cnic_url || catDetails?.ownerCnicUrl, "Owner's CNIC");

  const explicitDocuments = [
    ["gender_doc_urls", catDetails?.gender_doc_urls],
    ["cat_doc_urls", catDetails?.cat_doc_urls],
  ] as const;
  for (const [, value] of explicitDocuments) {
    if (value && typeof value === "object") {
      for (const [key, url] of Object.entries(value)) pushFile(key, url, getDocLabel(key));
    }
  }

  const photoPayload = Array.isArray(c.photo_urls) ? c.photo_urls : parseObject(c.photo_urls);
  if (Array.isArray(photoPayload)) {
    photoPayload.forEach((val, idx) => pushFile(`photo_${idx + 1}`, val));
  } else if (photoPayload && typeof photoPayload === "object") {
    for (const [k, val] of Object.entries(photoPayload)) pushFile(k, val);
  }

  const walkFilesDeep = (obj: any, prefix = "") => {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) { obj.forEach((item, idx) => walkFilesDeep(item, `${prefix}_${idx + 1}`)); return; }
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === "string") {
        const trimmed = v.trim();
        if (trimmed.startsWith("http")) pushFile(prefix ? `${prefix}_${k}` : k, trimmed);
      } else if (v && typeof v === "object") {
        const file = v as Record<string, unknown>;
        const candidate = file.url || file.file_url || file.download_url || file.href || file.path;
        if (typeof candidate === "string" && candidate.trim().startsWith("http")) {
          pushFile(prefix ? `${prefix}_${k}` : k, file);
        } else {
          walkFilesDeep(v, prefix ? `${prefix}_${k}` : k);
        }
      }
    }
  };
  walkFilesDeep(c);
  walkFilesDeep(catDocs, "documents");
  walkFilesDeep(parseObject(catDetails?.edu_documents) || {}, "education_documents");

  const seen = new Set<string>();
  const uniqueFiles = fileEntries.filter((file) => { if (seen.has(file.url)) return false; seen.add(file.url); return true; });

  const isRejected = c.status === "rejected";
  const isCompleted = c.status === "completed";
  const isExpired = c.status === "expired";
  const isApproved = c.status === "approved";
  const isPending = c.status === "pending";

  const handleApprove = async () => {
    if (!confirm(`Approve case: "${c.title}"?`)) return;
    await onUpdate(c.id, "approved");
  };

  const handleReject = async () => {
    if (!reason.trim()) { toast.error("Please enter a rejection reason."); return; }
    await onUpdate(c.id, "rejected", reason.trim());
    setReason("");
  };

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${isRejected ? "border-red-300 bg-red-50/50" : "bg-white"}`}>
      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${isApproved ? "bg-emerald-100 text-emerald-700" : isRejected ? "bg-red-100 text-red-700" : isPending ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>{c.status}</span>
        <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">{c.category}</span>
        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold">{c.urgency}</span>
        {c.was_free ? <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-black">FREE</span> : <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-black">PAID</span>}
        {c.closed_by_admin && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-black">FUNDRAISED & PAID</span>}
        {isExpired && <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-black">EXPIRED</span>}
      </div>

      {isRejected && c.rejection_reason && (
        <div className="rounded-lg border-2 border-red-300 bg-red-100 p-4">
          <div className="flex items-start gap-2">
            <XCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700">❌ Rejected</p>
              <div className="mt-1 max-h-32 overflow-y-auto whitespace-pre-line text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200">{c.rejection_reason}</div>
              {c.reviewed_at && <p className="text-xs text-red-500 mt-2">Reviewed on: {new Date(c.reviewed_at).toLocaleString()}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Basic info */}
      <div className="text-sm space-y-1">
        <p className="font-bold text-base">{c.title}</p>
        <p className="text-slate-500">{c.short_description}</p>
        <p className="text-slate-500 text-xs">📍 {c.city}, {c.country} {c.amount_needed && `· Needs: ${s} ${c.amount_needed} ${cur}`}</p>
        {c.deadline && <p className="text-xs font-bold text-red-600">⏰ Due: {new Date(c.deadline).toLocaleDateString()}</p>}
        {c.amount_needed > 0 && <p className="text-xs text-teal-600 font-medium">Collected: {s} {c.amount_collected ?? 0} / {s} {c.amount_needed}</p>}
        <div className="mt-2 rounded-lg bg-teal-50 border border-teal-100 p-3">
          <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wide mb-1">📋 Full Description</p>
          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{c.description || "No description provided"}</p>
        </div>
      </div>

      {/* Submitted by */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs space-y-0.5">
        <p className="font-bold text-slate-800 flex items-center gap-1"><Users className="h-3 w-3" /> Submitted by</p>
        <p className="text-slate-600">{seeker?.full_name || "—"} · {seeker?.email || c.user_id?.slice(0, 8)}</p>
      </div>

      {/* Personal details */}
      {personalDetails.length > 0 && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
          <p className="text-xs font-bold text-teal-700 flex items-center gap-1"><User className="h-3 w-3" /> Personal Details</p>
          {personalDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* Utility details */}
      {utilityDetails.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1">
          <p className="text-xs font-bold text-amber-700 flex items-center gap-1">⚡ {c.category} Details</p>
          {utilityDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* Receiver details */}
      {receiverDetails.length > 0 && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
          <p className="text-xs font-bold text-teal-700 flex items-center gap-1"><HandCoins className="h-3 w-3" /> Payment Receiver</p>
          {receiverDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* Disability details */}
      {disabilityDetails.length > 0 && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
          <p className="text-xs font-bold text-teal-700 flex items-center gap-1"><Heart className="h-3 w-3" /> Disability Details</p>
          {disabilityDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* Property details */}
      {propertyDetails.length > 0 && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
          <p className="text-xs font-bold text-teal-700 flex items-center gap-1"><Building2 className="h-3 w-3" /> Property Details</p>
          {propertyDetails.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* Education details */}
      {eduFields.length > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 space-y-1">
          <p className="text-xs font-bold text-blue-700 flex items-center gap-1"><BookOpen className="h-3 w-3" /> Education Details</p>
          {eduFields.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* Other details */}
      {allFields.length > 0 && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1">
          <p className="text-xs font-bold text-teal-700 flex items-center gap-1"><ClipboardCheck className="h-3 w-3" /> Other Details</p>
          {allFields.map(({ label, value }) => <DetailRow key={label} label={label} value={value} />)}
        </div>
      )}

      {/* ALL FILES/IMAGES/VIDEOS */}
      {uniqueFiles.length > 0 ? (
        <div className="rounded-lg bg-gray-100 border border-gray-300 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold flex items-center gap-1"><FileText className="h-4 w-4" /> Uploaded Files ({uniqueFiles.length})</p>
            <button onClick={() => copyText(uniqueFiles.map((f) => f.url).join("\n"))} className="text-[10px] text-teal-600 hover:underline flex items-center gap-0.5"><Copy className="h-3 w-3" /> Copy URLs</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {uniqueFiles.map(({ key, label, url }) => {
              const mediaUrl = normalizeAdminMediaUrl(url);
              const lowerFileName = `${mediaUrl} ${label}`.toLowerCase();
              const isVideo = lowerFileName.match(/\.(mp4|webm|mov|avi)(?:$|\?)/i) || lowerFileName.includes("video");
              const isPdf = lowerFileName.match(/\.pdf(?:$|\?)/i);
              const isImage = lowerFileName.match(/\.(png|jpe?g|gif|webp|bmp|svg|heic|heif)(?:$|\?)/i) || lowerFileName.includes("image") || lowerFileName.includes("photo") || lowerFileName.includes("selfie");
              const downloadUrl = (() => { try { const parsed = new URL(url, window.location.origin); parsed.searchParams.set("download", "1"); return parsed.toString(); } catch { return url; } })();
              return (
                <div key={key + url} className="space-y-1 bg-white/80 p-1.5 rounded border">
                  <p className="text-[10px] font-medium text-slate-800 truncate" title={label}>📎 {label}</p>
                  {isVideo ? (
                    <video src={mediaUrl} controls className="w-full rounded border max-h-32 bg-black" />
                  ) : isPdf ? (
                    <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="block text-center py-4 bg-slate-100 text-teal-600 text-xs font-bold rounded hover:underline">📄 View PDF</a>
                  ) : isImage ? (
                    <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
                      <img src={mediaUrl} alt={label} onError={(event) => { event.currentTarget.style.display = "none"; event.currentTarget.parentElement?.classList.add("hidden"); }} className="w-full rounded border max-h-28 object-cover hover:opacity-95" />
                    </a>
                  ) : (
                    <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded border bg-slate-100 p-3 text-center">
                      <FileText className="h-8 w-8 text-teal-600" />
                      <span className="text-[10px] text-slate-500">Document</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-[9px]">
                    <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">Open ↗</a>
                    <a href={normalizeAdminMediaUrl(downloadUrl)} download={label} className="inline-flex items-center gap-0.5 text-teal-600 hover:underline"><Download className="h-3 w-3" /> Download</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-yellow-50 border border-yellow-300 p-3 text-xs text-yellow-700">⚠️ No files uploaded for this case.</div>
      )}

      {/* Institute payment details */}
      {hasPayment && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-1">
          <p className="font-bold text-sm flex items-center gap-1 text-amber-700"><Building2 className="h-4 w-4" /> Institute Payment Details</p>
          <DetailRow label="Institute / Provider" value={c.institute_name} />
          <DetailRow label="Payment Method" value={c.payment_method} />
          <DetailRow label="Account Title / Reference" value={c.account_title} />
          <DetailRow label="Account / Bill Number" value={c.account_number} mono />
          <DetailRow label="IBAN" value={c.account_iban} mono />
          <DetailRow label="Institute Contact" value={c.institute_contact} mono />
          <DetailRow label="Institute Address" value={c.institute_address} />
        </div>
      )}

      {/* Resolution History */}
      {resolutions.length > 0 && (
        <div className="rounded-lg bg-teal-50 border border-teal-200 p-3 space-y-2">
          <p className="font-bold text-sm flex items-center gap-1"><Heart className="h-4 w-4 text-teal-600" /> All Helps / Payments</p>
          {resolutions.map((r: any) => (
            <div key={r.id} className="text-xs space-y-0.5 border-b border-teal-200/50 last:border-0 pb-2">
              <p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.status === "completed" ? "bg-teal-200 text-teal-800" : r.status === "disputed" ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"}`}>{r.status?.toUpperCase()}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${isContributionResolution(r) ? "bg-teal-100 text-teal-700" : "bg-blue-100 text-blue-700"}`}>{isContributionResolution(r) ? "FUNDRAISING" : "DIRECT"}</span>
              </p>
              <p><span className="text-slate-500">Amount:</span> {s} {r.seeker_confirmed_amount ?? r.amount_paid} {cur} · <span className="text-slate-500">TXN:</span> <span className="font-mono">{r.transaction_id}</span></p>
              {r.receipt_url && <a href={normalizeAdminMediaUrl(r.receipt_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-600 text-[10px]"><ExternalLink className="h-3 w-3" /> Receipt</a>}
            </div>
          ))}
        </div>
      )}

      {/* Approve/Reject Actions */}
      {isPending && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <Textarea
            placeholder="Rejection reason (optional — required when rejecting)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-200"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold" onClick={handleApprove} disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />} Approve
            </Button>
            <Button size="sm" variant="outline" className="text-red-600 border-red-300 font-bold" onClick={handleReject} disabled={busy || !reason.trim()}>
              {busy ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <XCircle className="h-3.5 w-3.5 mr-1" />} Reject
            </Button>
          </div>
          {!reason.trim() && <p className="text-[11px] text-slate-400">Rejection reason required if rejecting.</p>}
        </div>
      )}

      {!isPending && (
        <div className="pt-2 border-t border-slate-200 text-xs text-slate-500">
          This case is <span className="font-bold capitalize">{c.status}</span>. {isRejected && "The rejection reason is shown above."}
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
    <div className="rounded-2xl border-2 border-teal-300 bg-white p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-700">PENDING</span>
        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold text-teal-700">{c?.category}</span>
      </div>
      <p className="font-bold text-slate-900">{c?.title}</p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Helper</p><p className="font-semibold">{helper?.full_name || "—"}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Amount</p><p className="font-black text-teal-600">{s} {amt} {cur}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400">TXN ID</p><p className="font-mono text-xs">{r.transaction_id}</p></div>
        <div><p className="text-[10px] font-bold uppercase text-slate-400">Type</p><p className="capitalize text-xs">{isContributionResolution(r) ? "Fundraising" : "Direct"}</p></div>
      </div>
      {r.receipt_url && <a href={normalizeAdminMediaUrl(r.receipt_url)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-teal-600 underline"><ExternalLink className="h-4 w-4" /> View Receipt</a>}
      <div className="mt-4 space-y-3 border-t pt-4">
        <Textarea placeholder="Rejection reason (required when rejecting)" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full resize-none rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-200" />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold" onClick={() => onConfirm(r)}>Verify & Add {s} {amt}</Button>
          <Button size="sm" variant="outline" className="text-red-600 border-red-300 font-bold" disabled={!reason.trim()} onClick={() => onReject(r, reason)}>Reject</Button>
        </div>
      </div>
    </div>
  );
}

function ResolutionHistoryCard({ r, c, profileMap }: any) {
  const cur = c?.currency || "USD"; const s = sym(cur); const helper = profileMap[r.hero_id];
  const amt = Number(r.seeker_confirmed_amount ?? r.amount_paid ?? 0); const isRej = ["rejected", "disputed"].includes(normalizedResolutionStatus(r));
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${isRej ? "border-red-200" : "border-slate-200"}`}>
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-900">{c?.title || "Direct payment"}</p>
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
    <div className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${u.isSuspended ? "border-red-300" : "border-slate-200"}`}>
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
        <div className="space-y-4 border-t bg-slate-50/50 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[10px] font-bold uppercase text-slate-400">KYC</p><p className="text-sm font-bold capitalize">{u.kycStatus}</p></div>
            <div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[10px] font-bold uppercase text-slate-400">Wallet</p><p className="text-sm font-bold">{u.walletBalance} cr</p></div>
            <div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[10px] font-bold uppercase text-slate-400">Cases</p><p className="text-sm font-bold">{u.casesSubmitted}</p></div>
            <div className="rounded-xl bg-white p-2.5 shadow-sm"><p className="text-[10px] font-bold uppercase text-slate-400">Helps</p><p className="text-sm font-bold">{u.casesUnlocked}</p></div>
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
    <div className="rounded-2xl border-2 border-teal-300 bg-white p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[10px] font-black text-teal-700">READY TO PAY</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold">{c.category}</span>
      </div>
      <p className="font-bold text-slate-900">{c.title}</p>
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
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="font-bold">{d.method}</p>
        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">{d.status}</span>
      </div>
      <p className="mt-1 text-xs font-mono text-slate-500">TXN: {d.transaction_id} · Amount: ${d.amount} → {d.credits ?? d.amount} Credits</p>
      {d.status === "pending" && (
        <div className="mt-3 space-y-2">
          <Textarea placeholder="Rejection reason (required when rejecting)" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full resize-none rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-200" />
          <div className="flex gap-2">
            <Input type="number" value={credits} onChange={(e) => setCredits(e.target.value)} className="h-10 w-24 rounded-xl" />
            <Button size="sm" className="bg-teal-600" onClick={() => onApprove(d, parseFloat(credits))}>Approve</Button>
            <Button size="sm" variant="outline" className="text-red-600" disabled={!reason.trim()} onClick={() => onReject(d.id, reason)}>Reject</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackCard({ fb, profileMap, caseList, onUpdate, busyId }: any) {
  const [reason, setReason] = useState(""); const p = profileMap[fb.user_id]; const c = caseList.find((cs: any) => cs.id === fb.case_id);
  const busy = busyId === fb.id;
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${fb.status === "approved" ? "bg-teal-100 text-teal-700" : fb.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{fb.status}</span>
        {c && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold">{c.category}</span>}
      </div>
      <p className="text-xs font-bold text-slate-600">From: {p?.full_name || fb.first_name || "—"} · Case: {c?.title}</p>
      {fb.text_message && <p className="mt-2 text-sm text-slate-800">{fb.text_message}</p>}
      {fb.video_url && <video src={normalizeAdminMediaUrl(fb.video_url)} controls className="mt-3 w-full rounded-xl max-h-56" />}
      {fb.status === "pending_review" && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <Textarea placeholder="Rejection reason (required when rejecting)" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="w-full resize-none rounded-xl border-slate-200 bg-slate-50 text-sm focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-200" />
          <div className="flex gap-2">
            <Button size="sm" className="bg-teal-600" disabled={busy} onClick={() => onUpdate(fb.id, "approved")}>Approve</Button>
            <Button size="sm" variant="outline" className="text-red-600" disabled={busy || !reason.trim()} onClick={() => onUpdate(fb.id, "rejected", reason)}>Reject</Button>
          </div>
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

  const TEMPLATES = [
    { label: "Complete KYC", title: "Complete your KYC ✅", msg: "You're almost there! Complete your identity verification to unlock Givethra.", link: "/kyc" },
    { label: "Submit Free Case", title: "Your First Case is FREE 🎉", msg: "Your KYC is approved! Submit your first case FREE.", link: "/submit-request" },
    { label: "Become a Hero", title: "Become a Hero 🤲", msg: "You can help someone in need.", link: "/cases" },
    { label: "Wallet Deposit", title: "Add Credits 💰", msg: "Deposit to your Givethra wallet.", link: "/wallet" },
    { label: "Unlock Account", title: "Unlock Your Account 🔓", msg: "Deposit 5 credits to unlock.", link: "/submit-request" },
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
    <div className="space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3 rounded-2xl bg-teal-50 p-4">
        <Megaphone className="h-5 w-5 text-teal-600" />
        <div>
          <p className="text-sm font-black text-teal-800">Send Notifications</p>
          <p className="mt-1 text-xs font-medium text-teal-700/80">Broadcast important messages to users of your choice.</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">⚡ Quick Templates</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.label} onClick={() => { setTitle(t.title); setMessage(t.msg); setLink(t.link); }} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-teal-50 hover:border-teal-300">{t.label}</button>
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
            <button key={g.k} onClick={() => setGroup(g.k)} className={`rounded-xl border p-3 text-left text-sm font-bold transition ${group === g.k ? "border-teal-500 bg-teal-50 ring-1 ring-teal-500" : "border-slate-200 hover:border-teal-300"}`}>{g.l}</button>
          ))}
        </div>
      </div>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-12 rounded-xl" />
      <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Message..." className="rounded-xl" />
      <select value={link} onChange={(e) => setLink(e.target.value)} className="h-12 w-full rounded-xl border bg-white px-3 text-sm">
        <option value="/">Home</option><option value="/kyc">KYC page</option><option value="/submit-request">Submit a case</option>
        <option value="/cases">Browse cases</option><option value="/wallet">Wallet</option><option value="/my-cases">My Cases</option>
      </select>
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
      <div className="rounded-2xl bg-teal-50 p-4 text-sm text-teal-800"><strong>Free-Listing Offers</strong> — Turn on for a category.</div>
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
    <div className={`rounded-2xl border p-4 ${active ? "border-teal-300 bg-teal-50/40" : "border-slate-200 bg-white"}`}>
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
      <div className="flex h-[70vh] flex-col rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b p-3">
          <button onClick={() => setActiveUser(null)}><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex-1"><p className="font-bold">{conv?.name}</p><p className="text-xs text-slate-500">{conv?.email}</p></div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50 p-4">
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
        <button key={c.uid} onClick={() => openChat(c.uid)} className="flex w-full items-center justify-between gap-3 rounded-2xl border bg-white p-4 text-left hover:bg-slate-50">
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

function DetailRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-2 py-1 border-b border-slate-200/50 last:border-0">
      <div className="min-w-0">
        <p className="text-[10px] uppercase text-slate-400 font-bold">{label}</p>
        <p className={`text-sm font-medium break-all ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
      <button type="button" onClick={() => copyText(value)} className="shrink-0 h-7 w-7 rounded border border-slate-200 flex items-center justify-center text-slate-400 hover:text-teal-600">
        <Copy className="h-3 w-3" />
      </button>
    </div>
  );
}
