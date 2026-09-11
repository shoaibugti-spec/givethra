import { w as createLucideIcon, e as useAuth, u as useNavigate, r as reactExports, a4 as adminGetAllKyc, a5 as adminGetAllCases, a6 as adminGetAllResolutions, a7 as adminGetAllDeposits, a8 as adminGetAllProfiles, a9 as adminGetAllWallets, aa as adminGetAllUnlocks, ab as adminGetAllSupportMessages, ac as adminGetAllFeedbacks, ad as adminGetAllOffers, ae as adminGetAllSuspensions, p as ue, l as jsxRuntimeExports, af as TriangleAlert, ag as adminUpdateKyc, ah as adminUpdateProfile, ai as adminGetUserSuspension, aj as adminUpsertUserSuspension, ak as adminUpdateCase, al as adminGetCategoryOffer, am as adminUpsertCategoryOffer, an as adminGetWalletsByUser, ao as adminUpsertWallet, ap as adminUpdateFeedback, aq as adminUpdateResolution, ar as adminCloseCase, as as adminUpdateDeposit, at as adminDeleteFiles, W as Wallet, au as User, J as uploadFileToStorage, av as adminBroadcastNotification, aw as adminSendSupportReply, ax as adminMarkSupportMessagesAsRead } from "./main-EspZtMZv.js";
import { L as Layout } from "./Layout-wYZkEQhc.js";
import { B as Button } from "./button-BrpTixLc.js";
import { I as Input } from "./input-DprFI1f6.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-DETzQsZW.js";
import { T as Textarea } from "./textarea-BqlLZurF.js";
import { a as sendNotification } from "./notify-dkf7JWdC.js";
import { S as Shield } from "./x-Br49mtL5.js";
import { U as Users } from "./users-_6SD4cVf.js";
import { F as FileText } from "./file-text-BcVokOSk.js";
import { C as CircleCheckBig } from "./circle-check-big-CYO7lxvw.js";
import { H as Heart } from "./heart-CaEhMUxo.js";
import { G as Gift } from "./gift-DyaKI6CV.js";
import { C as Coins } from "./coins-t36m0Y6L.js";
import { S as Search } from "./search-DlEEPgKI.js";
import { H as HandCoins } from "./hand-coins-Dd8RmQaF.js";
import { E as ExternalLink } from "./external-link-C_0p3t5T.js";
import { C as CircleX } from "./circle-x-B0-Jayhr.js";
import { B as Building2 } from "./building-2-BVCM5BrX.js";
import { S as Send } from "./send-52cEzfnD.js";
import { A as ArrowLeft } from "./arrow-left-l9Jk5DjR.js";
import { L as LoaderCircle } from "./loader-circle-RW_SqW6x.js";
import { C as Copy } from "./copy-D4uu5b68.js";
import { C as ChevronDown } from "./chevron-down-Dbk3kovR.js";
import { a as Mail } from "./message-circle-CqePZOv0.js";
import { C as Calendar } from "./calendar-BlVo-Q3F.js";
import { D as Download } from "./download-DKp_lO3H.js";
import "./index-D1NJSY4H.js";
import "./index-BjBsYUTf.js";
import "./index-D7zt7y2w.js";
import "./index-o8esZfzI.js";
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ban = createLucideIcon("Ban", [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m4.9 4.9 14.2 14.2", key: "1m5liu" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ClipboardCheck = createLucideIcon("ClipboardCheck", [
  ["rect", { width: "8", height: "4", x: "8", y: "2", rx: "1", ry: "1", key: "tgr4d6" }],
  [
    "path",
    {
      d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",
      key: "116196"
    }
  ],
  ["path", { d: "m9 14 2 2 4-4", key: "df797q" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Megaphone = createLucideIcon("Megaphone", [
  ["path", { d: "m3 11 18-5v12L3 14v-3z", key: "n962bs" }],
  ["path", { d: "M11.6 16.8a3 3 0 1 1-5.8-1.6", key: "1yl0tm" }]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Paperclip = createLucideIcon("Paperclip", [
  [
    "path",
    {
      d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48",
      key: "1u3ebp"
    }
  ]
]);
/**
 * @license lucide-react v0.460.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const RotateCw = createLucideIcon("RotateCw", [
  ["path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8", key: "1p45f6" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }]
]);
const ADMIN_EMAIL = "shoaibahmedbugti5@gmail.com";
const ALL_CATEGORIES = [
  "Electricity Bill",
  "Gas Bill",
  "Water Bill",
  "House Rent",
  "School, College & University Fees",
  "Education, Books & Admission",
  "Medical & Treatment",
  "Medicines",
  "Food & Groceries",
  "Child Support",
  "Widow & Elderly Support",
  "Disability Support",
  "Marriage Support",
  "Business / Work Help",
  "Home Repair",
  "Funeral Expenses",
  "Livestock / Farming",
  "Debt Relief",
  "Emergency Help",
  "Other"
];
const CURRENCY_SYMBOLS = {
  USD: "$",
  PKR: "Rs",
  SAR: "SAR",
  AED: "AED",
  GBP: "£",
  EUR: "€",
  INR: "₹",
  TRY: "₺",
  BDT: "৳",
  EGP: "E£",
  NGN: "₦",
  KES: "KSh",
  ZAR: "R",
  BRL: "R$",
  CAD: "C$",
  AUD: "A$",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  IDR: "Rp",
  MYR: "RM",
  THB: "฿",
  PHP: "₱",
  VND: "₫",
  SGD: "S$",
  AFN: "؋",
  NPR: "Rs",
  LKR: "Rs",
  QAR: "QAR",
  KWD: "KWD",
  BHD: "BHD",
  OMR: "OMR",
  JOD: "JOD",
  MAD: "MAD"
};
const DOC_LABELS = {
  salary_slip: "Salary Slip (6 Months)",
  statement: "Bank Statement (6 Months)",
  statement_url: "Bank Statement (6 Months)",
  salary_slip_url: "Salary Slip (6 Months)",
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
  selfie_url: "Case Selfie",
  video_url: "Case Appeal Video",
  paid_receipt_url: "Paid Receipt / Transaction Proof",
  medical_report_url: "Medical Report / Bill",
  electricity_bill_url: "Electricity Bill",
  cnic_front_url: "CNIC Front",
  cnic_back_url: "CNIC Back",
  income_certificate_url: "Income Certificate",
  death_certificate_url: "Death Certificate",
  fee_challan_url: "Fee Challan / Admission Letter",
  rental_agreement_url: "Rental Agreement",
  landlord_cnic_url: "Landlord CNIC",
  shop_agreement_url: "Shop Agreement",
  business_proof_url: "Business Proof",
  disability_certificate_url: "Disability Certificate",
  selfie: "Case Selfie",
  video: "Case Appeal Video",
  salarySlipUrl: "Salary Slip (6 Months)",
  statementUrl: "Bank Statement (6 Months)",
  rentalAgreementUrl: "Rental Agreement",
  landlordCnicUrl: "Landlord's CNIC",
  ownerCnicUrl: "Owner's CNIC",
  death_cert: "Death Certificate",
  death_certificate: "Death Certificate",
  medical_bill: "Medical Bill",
  medicine_estimate: "Medicine Estimate",
  groceries_estimate: "Grocery Estimate",
  repair_estimate: "Repair Estimate",
  business_quotation: "Business Quotation",
  business_proof: "Business Proof",
  livestock_quotation: "Livestock Quotation",
  livestock_proof: "Livestock Proof",
  marriage_quotation: "Marriage Quotation",
  debt_proof: "Debt Proof",
  emergency_proof: "Emergency Proof",
  child_b_form: "Child B-Form",
  parents_proof: "Parents' Proof",
  cnic: "CNIC",
  cat_doc_urls: "Category Documents",
  gender_doc_urls: "Identity Documents"
};
function getDocLabel(key) {
  if (DOC_LABELS[key]) return DOC_LABELS[key];
  return key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}
function sym(cur) {
  return CURRENCY_SYMBOLS[cur || "USD"] ?? (cur || "$");
}
function cleanCnic(c) {
  return (c || "").replace(/\D/g, "");
}
function asRows(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object" && Array.isArray(value.results)) {
    return value.results;
  }
  return [];
}
function isContributionResolution(resolution) {
  const marker = String(
    (resolution == null ? void 0 : resolution.paid_to) ?? (resolution == null ? void 0 : resolution.paidTo) ?? (resolution == null ? void 0 : resolution.payment_type) ?? (resolution == null ? void 0 : resolution.paymentType) ?? ""
  ).trim().toLowerCase();
  return ["givethra", "contribution", "partial", "fundraising"].includes(marker);
}
function normalizedResolutionStatus(resolution) {
  return String((resolution == null ? void 0 : resolution.status) ?? "").trim().toLowerCase();
}
async function deleteStorageFiles(urls) {
  const validUrls = urls.filter((u) => !!u && u.startsWith("http"));
  if (validUrls.length === 0) return { ok: 0, failed: 0 };
  try {
    const result = await adminDeleteFiles(validUrls);
    return result;
  } catch (e) {
    console.error("Delete files error:", e);
    return { ok: 0, failed: validUrls.length };
  }
}
function collectKycFileUrls(k) {
  const urls = [];
  if (k.cnic_front_url) urls.push(k.cnic_front_url);
  if (k.cnic_back_url) urls.push(k.cnic_back_url);
  if (k.selfie_url) urls.push(k.selfie_url);
  if (k.passport_url) urls.push(k.passport_url);
  if (k.face_video_url) urls.push(k.face_video_url);
  return urls;
}
function copyText(text) {
  if (!text) return;
  navigator.clipboard.writeText(text);
  ue.success("Copied!");
}
function AdminPage() {
  var _a;
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [kycList, setKycList] = reactExports.useState([]);
  const [caseList, setCaseList] = reactExports.useState([]);
  const [resolutions, setResolutions] = reactExports.useState([]);
  const [deposits, setDeposits] = reactExports.useState([]);
  const [profiles, setProfiles] = reactExports.useState([]);
  const [wallets, setWallets] = reactExports.useState([]);
  const [unlocks, setUnlocks] = reactExports.useState([]);
  const [supportMsgs, setSupportMsgs] = reactExports.useState([]);
  const [feedbacks, setFeedbacks] = reactExports.useState([]);
  const [offers, setOffers] = reactExports.useState([]);
  const [suspensions, setSuspensions] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [unreadSupport, setUnreadSupport] = reactExports.useState(0);
  const [resolutionView, setResolutionView] = reactExports.useState("pending");
  const [resolutionSearch, setResolutionSearch] = reactExports.useState("");
  const [feedbackSearch, setFeedbackSearch] = reactExports.useState("");
  const [caseStatusFilter, setCaseStatusFilter] = reactExports.useState("all");
  const [payFilter, setPayFilter] = reactExports.useState("ready");
  const [depositStatusFilter, setDepositStatusFilter] = reactExports.useState("all");
  const [feedbackStatusFilter, setFeedbackStatusFilter] = reactExports.useState("all");
  reactExports.useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    if ((user == null ? void 0 : user.email) !== ADMIN_EMAIL) {
      navigate({ to: "/" });
      return;
    }
    loadData();
    const interval = setInterval(() => {
      loadSupportMessages();
    }, 5e3);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);
  async function loadData() {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
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
        adminGetAllSuspensions()
      ]);
      const rowsAt = (index) => {
        const result = results[index];
        return (result == null ? void 0 : result.status) === "fulfilled" ? asRows(result.value) : [];
      };
      const kyc = rowsAt(0);
      const cases = rowsAt(1);
      const res = rowsAt(2);
      const deps = rowsAt(3);
      const profs = rowsAt(4);
      const wals = rowsAt(5);
      const unl = rowsAt(6);
      const sup = rowsAt(7);
      const fbs = rowsAt(8);
      const offs = rowsAt(9);
      const susp = rowsAt(10);
      setKycList(kyc);
      setCaseList(cases);
      setResolutions(res);
      setDeposits(deps);
      setProfiles(profs);
      setWallets(wals);
      setUnlocks(unl);
      setSupportMsgs(sup);
      setFeedbacks(fbs);
      setOffers(offs);
      setSuspensions(susp);
      setUnreadSupport(sup.filter((m) => m.sender === "user" && !m.is_read).length);
    } catch (err) {
      console.error("Admin data load error:", err);
      ue.error("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }
  async function loadSupportMessages() {
    try {
      const data = await adminGetAllSupportMessages();
      setSupportMsgs(asRows(data));
      setUnreadSupport(asRows(data).filter((m) => m.sender === "user" && !m.is_read).length);
    } catch (e) {
      console.error("Support messages load error:", e);
    }
  }
  async function reloadOffers() {
    const data = await adminGetAllOffers();
    setOffers(asRows(data));
  }
  const cnicCounts = {};
  for (const k of kycList) {
    if (k.status === "rejected" || k.status === "duplicate") continue;
    const c = cleanCnic(k.cnic_number);
    if (c) cnicCounts[c] = (cnicCounts[c] ?? 0) + 1;
  }
  async function updateKyc(id, status, reason = "", action = "approve") {
    const kyc = kycList.find((k) => k.id === id);
    if (!kyc) return;
    if (action === "duplicate") {
      const cnic = cleanCnic(kyc.cnic_number);
      if (!cnic) {
        ue.error("No CNIC found to check duplicates");
        return;
      }
      const duplicateFound = kycList.some((k) => k.cnic_number === kyc.cnic_number && k.status === "approved" && k.id !== id);
      if (duplicateFound) {
        await adminUpdateKyc(id, { status: "duplicate", reviewed_at: (/* @__PURE__ */ new Date()).toISOString(), reviewed_by: user == null ? void 0 : user.email, rejection_reason: `Duplicate KYC - CNIC: ${kyc.cnic_number}` });
        await adminUpdateProfile(kyc.user_id, { is_suspended: true, suspended_reason: `Duplicate KYC detected (CNIC: ${kyc.cnic_number})`, suspended_at: (/* @__PURE__ */ new Date()).toISOString() });
        const existingSusp = await adminGetUserSuspension(kyc.user_id);
        const newCount = ((existingSusp == null ? void 0 : existingSusp.suspension_count) || 0) + 1;
        await adminUpsertUserSuspension({ user_id: kyc.user_id, suspension_count: newCount, is_active: true, suspended_at: (/* @__PURE__ */ new Date()).toISOString(), rejection_count_at_suspension: 0 });
        await sendNotification(kyc.user_id, "system", "🚫 Account Suspended (Duplicate KYC)", `Your account has been suspended because a duplicate KYC submission was detected with the same CNIC (${kyc.cnic_number}). If you believe this is an error, please contact support.`, "/support");
        ue.success("KYC marked as duplicate and user banned.");
        loadData();
        return;
      } else {
        ue.error("No approved KYC with this CNIC found to mark as duplicate.");
        return;
      }
    }
    await adminUpdateKyc(id, { status, reviewed_at: (/* @__PURE__ */ new Date()).toISOString(), reviewed_by: user == null ? void 0 : user.email, rejection_reason: reason });
    if (kyc.user_id) {
      if (status === "approved") await sendNotification(kyc.user_id, "kyc_approved", "KYC Approved ✅", "Your identity has been verified. You can now submit and unlock cases.", "/kyc");
      else if (status === "rejected") await sendNotification(kyc.user_id, "kyc_rejected", "KYC Rejected", reason ? `Reason: ${reason}` : "Please submit clear, well-lit photos and try again.", "/kyc");
      else if (status === "re_kyc") await sendNotification(kyc.user_id, "kyc_re_kyc", "KYC Requires Re-submission 🔄", `Please resubmit your KYC with correct information. Reason: ${reason || "CNIC mismatch or missing details"}.`, "/kyc");
    }
    ue.success(`KYC ${status}!`);
    loadData();
  }
  async function updateCase(id, status, reason = "") {
    const c = caseList.find((cs) => cs.id === id);
    await adminUpdateCase(id, { status, reviewed_at: (/* @__PURE__ */ new Date()).toISOString(), reviewed_by: user == null ? void 0 : user.email, rejection_reason: reason });
    if (status === "rejected" && c) {
      await checkAndSuspendUser(c.user_id);
    }
    if (c == null ? void 0 : c.user_id) {
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
          const newBalance = ((wallet == null ? void 0 : wallet.balance) || 0) + 1;
          await adminUpsertWallet(c.user_id, newBalance);
          await sendNotification(c.user_id, "case_rejected", "Case Rejected", (reason ? `Reason: ${reason}. ` : "") + "Your 1 credit has been refunded — you can submit again.", "/my-cases");
        }
      } else if (status === "completed") {
        await sendNotification(c.user_id, "case_completed", "Case Completed ✅", `Your case "${c.title}" has been marked as completed.`, "/my-cases");
      } else if (status === "expired") {
        await sendNotification(c.user_id, "case_expired", "Case Expired ⏰", `Your case "${c.title}" has expired. You can submit a new one.`, "/submit-request");
      }
    }
    ue.success(`Case ${status}!`);
    loadData();
  }
  async function updateFeedback(fbId, status, reason = "") {
    if (status === "rejected" && !reason.trim()) {
      ue.error("Please provide a rejection reason.");
      return;
    }
    const fb = feedbacks.find((f) => f.id === fbId);
    await adminUpdateFeedback(fbId, { status, reviewed_at: (/* @__PURE__ */ new Date()).toISOString(), reviewed_by: user == null ? void 0 : user.email, rejection_reason: reason });
    if ((fb == null ? void 0 : fb.user_id) && fb.case_id) {
      if (status === "approved") {
        await sendNotification(fb.user_id, "system", "Feedback Approved 🎉", "Your feedback is now live on the Givethra community wall. You can now submit a new case!", "/my-cases");
      } else {
        await sendNotification(fb.user_id, "system", "Feedback Needs Improvement", reason ? `Reason: ${reason}. Please re-record your video and message.` : "Please re-record your video and message, then resubmit.", `/cases/${fb.case_id}`);
      }
    }
    ue.success(`Feedback ${status}!`);
    loadData();
  }
  async function checkAndSuspendUser(userId) {
    const casesForUser = caseList.filter((c) => c.user_id === userId);
    const rejectedCount = casesForUser.filter((c) => c.status === "rejected").length;
    if (rejectedCount >= 5) {
      const existing = await adminGetUserSuspension(userId);
      const newCount = ((existing == null ? void 0 : existing.suspension_count) || 0) + 1;
      await adminUpsertUserSuspension({ user_id: userId, suspension_count: newCount, is_active: true, suspended_at: (/* @__PURE__ */ new Date()).toISOString(), rejection_count_at_suspension: rejectedCount });
      await adminUpdateProfile(userId, { is_suspended: true, suspended_reason: `Suspended after ${rejectedCount} rejected cases (suspension #${newCount})`, suspended_at: (/* @__PURE__ */ new Date()).toISOString() });
      await sendNotification(userId, "system", "🚫 Account Suspended", `Your account has been suspended due to ${rejectedCount} rejected cases. To unlock, please deposit 5 credits and click "Unlock Account" in the submit page.`, "/submit-request");
    }
  }
  async function manualUnlockUser(userId) {
    if (!confirm("Are you sure you want to manually unlock this user?")) return;
    try {
      await adminUpsertUserSuspension({ user_id: userId, is_active: false, unlocked_at: (/* @__PURE__ */ new Date()).toISOString() });
      await adminUpdateProfile(userId, { is_suspended: false, suspended_reason: null });
      await sendNotification(userId, "system", "Account Unlocked by Givethra", "Givethra has unlocked your account. Please submit cases carefully.", "/dashboard");
      ue.success("User unlocked successfully!");
      loadData();
    } catch (err) {
      ue.error("Failed to unlock user.");
      console.error(err);
    }
  }
  async function confirmResolution(res) {
    const c = caseList.find((cs) => cs.id === res.case_id);
    if (!c) {
      ue.error("Case not found");
      return;
    }
    const confirmedAmt = Number(res.seeker_confirmed_amount ?? res.amount_paid ?? 0);
    if (!Number.isFinite(confirmedAmt) || confirmedAmt < 0) {
      ue.error("This proof has an invalid amount.");
      return;
    }
    const amountNeeded = Number(c.amount_needed ?? 0);
    const prevCollected = Number(c.amount_collected ?? 0);
    const newCollected = prevCollected + confirmedAmt;
    const isFundraising = isContributionResolution(res);
    try {
      await adminUpdateResolution(res.id, { status: "completed", admin_confirmed: true, admin_confirmed_at: (/* @__PURE__ */ new Date()).toISOString(), completed_at: (/* @__PURE__ */ new Date()).toISOString() });
      const updates = { amount_collected: newCollected };
      const goalReached = amountNeeded > 0 && newCollected >= amountNeeded;
      if (!isFundraising && (goalReached || amountNeeded === 0)) {
        updates.status = "completed";
      }
      await adminUpdateCase(c.id, updates);
      const notificationJobs = [];
      if (res.hero_id) notificationJobs.push(sendNotification(res.hero_id, "case_completed", "Help verified! 🎉", `Givethra verified your help of ${sym(c.currency)} ${confirmedAmt} on "${c.title}". ${!isFundraising ? "You can now download your affidavit." : "Thank you for contributing!"}`, `/cases/${res.case_id}`));
      if (res.seeker_id) {
        if (isFundraising) {
          const stillLeft = Math.max(amountNeeded - newCollected, 0);
          notificationJobs.push(sendNotification(res.seeker_id, "system", goalReached ? "Goal reached! 🎉" : "More help received! 🤝", goalReached ? `Great news! People have together raised the full amount for your case "${c.title}". Givethra will now pay the institute and close your case.` : `Your case "${c.title}" received ${sym(c.currency)} ${confirmedAmt} more. Total raised: ${sym(c.currency)} ${newCollected} of ${sym(c.currency)} ${amountNeeded}. ${sym(c.currency)} ${stillLeft} still needed.`, `/cases/${res.case_id}`));
        } else {
          const stillOpen = amountNeeded > 0 && newCollected < amountNeeded;
          notificationJobs.push(sendNotification(res.seeker_id, "system", stillOpen ? "Partial help verified ✅" : "Your case is complete! 🎉", stillOpen ? `${sym(c.currency)} ${confirmedAmt} verified. ${sym(c.currency)} ${amountNeeded - newCollected} still remaining — your case stays open for more Heroes.` : `Your case "${c.title}" is now fully helped. Thank you for using Givethra.`, `/cases/${res.case_id}`));
        }
      }
      const notificationResults = await Promise.allSettled(notificationJobs);
      const notificationFailed = notificationResults.some((result) => result.status === "rejected");
      if (notificationFailed) console.error("Help verification notification failure", notificationResults);
      ue.success(`Verified! ${sym(c.currency)} ${confirmedAmt} added.${isFundraising && goalReached ? " Goal reached — now Mark as Paid to close." : ""}`);
      if (notificationFailed) ue.error("Help was verified, but one or more notifications could not be sent.");
      await loadData();
    } catch (error) {
      console.error("Help verification failed:", error);
      ue.error(`Failed to verify payment proof: ${(error == null ? void 0 : error.message) || "Please try again."}`);
    }
  }
  async function rejectResolution(res, reason) {
    const trimmedReason = String(reason || "").trim();
    if (!trimmedReason) {
      ue.error("Please provide a rejection reason.");
      return;
    }
    try {
      await adminUpdateResolution(res.id, { status: "disputed", admin_confirmed: false, notes: trimmedReason });
      if (res.hero_id) {
        try {
          await sendNotification(res.hero_id, "help_rejected", "Help proof needs correction", `Givethra could not verify your payment proof. Reason: ${trimmedReason}`, `/cases/${res.case_id}`);
        } catch (notificationError) {
          console.error("Help rejection notification failed:", notificationError);
          ue.error("Proof was rejected, but the helper notification could not be sent.");
        }
      }
      ue.success("Resolution rejected with reason.");
      await loadData();
    } catch (error) {
      console.error("Help rejection failed:", error);
      ue.error(`Failed to reject payment proof: ${(error == null ? void 0 : error.message) || "Please try again."}`);
    }
  }
  async function markAsPaidAndClose(c, receiptUrl) {
    try {
      await adminCloseCase(c.id, { status: "completed", closed_by_admin: true, paid_receipt_url: receiptUrl || null });
      if (c.user_id) {
        await sendNotification(c.user_id, "case_completed", "Your bill is paid! 🎉", `Wonderful news! Many kind people came together and your case "${c.title}" is fully helped. Givethra has paid the institute. You can view the receipt on your case. May Allah bless everyone who helped. 🤲`, `/cases/${c.id}`);
      }
      ue.success("Case marked as PAID and closed! Seeker notified.");
      loadData();
    } catch (error) {
      console.error("Pay & Close failed:", error);
      ue.error(`Failed to close case: ${(error == null ? void 0 : error.message) || "Please try again."}`);
    }
  }
  async function rejectPayClose(c, reason) {
    const trimmed = String(reason || "").trim();
    if (!trimmed) {
      ue.error("Please provide a reason before returning this case.");
      return;
    }
    try {
      await adminCloseCase(c.id, { status: "approved", closed_by_admin: false, rejection_reason: trimmed, paid_receipt_url: null });
      ue.success("Pay & Close request returned for review.");
      loadData();
    } catch (error) {
      console.error("Pay & Close rejection failed:", error);
      ue.error(`Failed to return case: ${(error == null ? void 0 : error.message) || "Please try again."}`);
    }
  }
  async function approveDeposit(dep, finalCredits) {
    const credits = (finalCredits ?? (dep.credits ?? dep.amount)) || 0;
    try {
      await adminUpdateDeposit(dep.id, { status: "approved", credits, reviewed_at: (/* @__PURE__ */ new Date()).toISOString(), reviewed_by: user == null ? void 0 : user.email });
      if (dep.user_id) {
        await sendNotification(dep.user_id, "credits_added", "Credits Added 💰", `${credits} credit(s) have been added to your wallet.`, "/wallet");
      }
      ue.success(`Approved! ${credits} credits added.`);
      loadData();
    } catch (e) {
      console.error("Deposit approval failed:", e);
      ue.error(`Failed to approve deposit: ${(e == null ? void 0 : e.message) || "Unknown error"}`);
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
      ue.success(`Cleaned ${rejectedKyc.length} KYC cases!`);
    } catch (e) {
      ue.error("Cleanup failed, check console.");
      console.error(e);
    }
    await loadData();
  }
  async function rejectDeposit(id, reason) {
    const dep = deposits.find((d) => d.id === id);
    await adminUpdateDeposit(id, { status: "rejected", reviewed_at: (/* @__PURE__ */ new Date()).toISOString(), reviewed_by: user == null ? void 0 : user.email, rejection_reason: reason });
    if (dep == null ? void 0 : dep.user_id) {
      await sendNotification(dep.user_id, "deposit_rejected", "Deposit Rejected", reason ? `Reason: ${reason}` : "Please check your payment proof and try again.", "/wallet");
    }
    ue.success("Deposit rejected.");
    loadData();
  }
  const pendingKyc = kycList.filter((k) => k.status === "pending");
  const approvedKycCount = kycList.filter((k) => k.status === "approved").length;
  const rejectedKycCount = kycList.filter((k) => k.status === "rejected").length;
  const pendingCases = caseList.filter((c) => c.status === "pending");
  const approvedCasesCount = caseList.filter((c) => c.status === "approved").length;
  const rejectedCasesCount = caseList.filter((c) => c.status === "rejected").length;
  const completedCasesCount = caseList.filter((c) => c.status === "completed").length;
  const expiredCasesCount = caseList.filter((c) => c.status === "expired").length;
  const pendingDeposits = deposits.filter((d) => d.status === "pending");
  const approvedDepositsCount = deposits.filter((d) => d.status === "approved").length;
  const rejectedDepositsCount = deposits.filter((d) => d.status === "rejected").length;
  const pendingResolutionStatuses = /* @__PURE__ */ new Set(["pending", "pending_confirmation", "seeker_confirmed"]);
  const pendingResolutions = resolutions.filter((r) => pendingResolutionStatuses.has(String(r.status || "").toLowerCase()));
  const pendingContributions = pendingResolutions.filter(isContributionResolution);
  const pendingDirectResolutions = pendingResolutions.filter((r) => !isContributionResolution(r));
  const pendingContributionCount = pendingContributions.length;
  const pendingDirectCount = pendingDirectResolutions.length;
  const rejectedContributions = resolutions.filter((r) => ["rejected", "disputed"].includes(normalizedResolutionStatus(r)) && isContributionResolution(r));
  const rejectedDirectResolutions = resolutions.filter((r) => ["rejected", "disputed"].includes(normalizedResolutionStatus(r)) && !isContributionResolution(r));
  const completedContributions = resolutions.filter((r) => ["approved", "completed"].includes(normalizedResolutionStatus(r)) && isContributionResolution(r));
  const completedDirectResolutions = resolutions.filter((r) => ["approved", "completed"].includes(normalizedResolutionStatus(r)) && !isContributionResolution(r));
  resolutions.filter((r) => ["approved", "completed"].includes(normalizedResolutionStatus(r))).length;
  const visibleDirectResolutions = (resolutionView === "pending" ? pendingDirectResolutions : resolutionView === "rejected" ? rejectedDirectResolutions : completedDirectResolutions).filter((r) => {
    const q = resolutionSearch.trim().toLowerCase();
    if (!q) return true;
    const c = caseList.find((cs) => cs.id === r.case_id);
    const p = profileMap[r.hero_id] || profileMap[r.seeker_id];
    const values = [r.id, r.case_id, r.hero_id, r.seeker_id, r.hero_email, r.transaction_id, c == null ? void 0 : c.title, c == null ? void 0 : c.category, p == null ? void 0 : p.full_name, p == null ? void 0 : p.email];
    return values.some((v) => String(v || "").toLowerCase().includes(q));
  });
  const visibleContributionResolutions = (resolutionView === "pending" ? pendingContributions : resolutionView === "rejected" ? rejectedContributions : completedContributions).filter((r) => {
    const q = resolutionSearch.trim().toLowerCase();
    if (!q) return true;
    const c = caseList.find((cs) => cs.id === r.case_id);
    const p = profileMap[r.hero_id] || profileMap[r.seeker_id];
    const values = [r.id, r.case_id, r.hero_id, r.seeker_id, r.hero_email, r.transaction_id, c == null ? void 0 : c.title, c == null ? void 0 : c.category, p == null ? void 0 : p.full_name, p == null ? void 0 : p.email];
    return values.some((v) => String(v || "").toLowerCase().includes(q));
  });
  const visibleFeedbacks = feedbacks.filter((fb) => {
    const q = feedbackSearch.trim().toLowerCase();
    if (!q) return true;
    const c = caseList.find((cs) => cs.id === fb.case_id);
    const p = profileMap[fb.user_id];
    return [fb.id, fb.case_id, fb.user_id, fb.first_name, fb.text_message, c == null ? void 0 : c.title, p == null ? void 0 : p.full_name, p == null ? void 0 : p.email].some((v) => String(v || "").toLowerCase().includes(q));
  });
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
  const paidPayClose = caseList.filter((c) => c.status === "completed" && c.closed_by_admin);
  const rejectedPayClose = caseList.filter((c) => c.status === "approved" && !c.closed_by_admin && c.rejection_reason);
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
      name: p.full_name || (kyc == null ? void 0 : kyc.full_name) || "—",
      email: p.email || "—",
      created_at: p.created_at,
      kycStatus: (kyc == null ? void 0 : kyc.status) ?? "none",
      casesSubmitted: userCases.length,
      rejectedCases,
      casesUnlocked: userUnlocks.length,
      depositsCount: userDeposits.length,
      totalDeposited,
      walletBalance: (wallet == null ? void 0 : wallet.balance) ?? 0,
      cnic: (kyc == null ? void 0 : kyc.cnic_number) || "",
      isSuspended: (suspension == null ? void 0 : suspension.is_active) ?? false,
      suspendedReason: (suspension == null ? void 0 : suspension.suspended_reason) || p.suspended_reason || "",
      suspensionCount: (suspension == null ? void 0 : suspension.suspension_count) || 0
    };
  }).sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
  const profileMap = {};
  for (const p of profiles) profileMap[p.user_id] = p;
  const cnicByUser = {};
  for (const k of kycList) if (k.user_id && k.cnic_number) cnicByUser[k.user_id] = k.cnic_number;
  for (const k of kycList) {
    if (!((_a = profileMap[k.user_id]) == null ? void 0 : _a.full_name)) profileMap[k.user_id] = { ...profileMap[k.user_id], full_name: k.full_name };
  }
  const activeOffers = offers.filter((o) => o.is_active).length;
  const duplicateCnicCount = Object.values(cnicCounts).filter((n) => n > 1).length;
  const totalHeroHelps = unlocks.length;
  const resByCaseId = {};
  for (const r of resolutions) {
    if (!resByCaseId[r.case_id]) resByCaseId[r.case_id] = [];
    resByCaseId[r.case_id].push(r);
  }
  const activeSuspensions = suspensions.filter((s) => s.is_active).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Layout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 py-8 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-6 w-6 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Admin Panel" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
      { label: "Pending KYC", value: pendingKyc.length },
      { label: "Pending Cases", value: pendingCases.length },
      { label: "Verify Help", value: pendingResolutions.length },
      { label: "Pending Contributions", value: pendingContributionCount },
      { label: "Ready to Pay", value: readyToClose.length }
    ].map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label })
    ] }, label)) }),
    activeSuspensions > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          activeSuspensions,
          " user(s)"
        ] }),
        " are currently suspended. Go to the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Users" }),
        " tab to view and manage them."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "text-red-600 border-red-300", onClick: cleanupAllRejectedFiles, children: "🗑️ Cleanup Rejected Files (Free Storage Space)" }),
    duplicateCnicCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 text-sm text-red-700 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          duplicateCnicCount,
          " CNIC number(s)"
        ] }),
        " are used in more than one active KYC. Check the KYC tab — duplicate ones show a red warning."
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-20 text-muted-foreground", children: "Loading..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "overview", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "overview", children: "Overview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "users", children: [
          "Users ",
          usersList.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-muted text-foreground text-[10px] rounded-full px-1.5", children: usersList.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "kyc", children: [
          "KYC ",
          pendingKyc.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-primary text-white text-[10px] rounded-full px-1.5", children: pendingKyc.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "cases", children: [
          "Cases ",
          pendingCases.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-primary text-white text-[10px] rounded-full px-1.5", children: pendingCases.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "verify", children: [
          "Direct Payments ",
          pendingDirectCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5", children: pendingDirectCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "contributions", children: [
          "Contributions ",
          pendingContributionCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-primary text-white text-[10px] rounded-full px-1.5", children: pendingContributionCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "pay", children: [
          "Pay & Close ",
          readyToClose.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-teal-500 text-white text-[10px] rounded-full px-1.5", children: readyToClose.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "deposits", children: [
          "Deposits ",
          pendingDeposits.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-primary text-white text-[10px] rounded-full px-1.5", children: pendingDeposits.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabsTrigger, { value: "notify", children: "Notify" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "offers", children: [
          "Offers ",
          activeOffers > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-teal-500 text-white text-[10px] rounded-full px-1.5", children: activeOffers })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "support", children: [
          "Support ",
          unreadSupport > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5", children: unreadSupport })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "feedback", children: [
          "Feedback ",
          feedbacks.filter((f) => f.status === "pending_review" && f.case_id).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5", children: feedbacks.filter((f) => f.status === "pending_review" && f.case_id).length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "suspensions", children: [
          "Suspensions ",
          activeSuspensions > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 bg-red-500 text-white text-[10px] rounded-full px-1.5", children: activeSuspensions })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "overview", className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
          { label: "Total Users", value: usersList.length, icon: Users },
          { label: "Verified KYC", value: approvedKyc.length, icon: Shield },
          { label: "Total Cases", value: caseList.length, icon: FileText },
          { label: "Approved Cases", value: approvedCases.length, icon: CircleCheckBig },
          { label: "Completed Cases", value: completedCases.length, icon: Heart },
          { label: "FREE Cases", value: freeCases.length, icon: Gift },
          { label: "PAID Cases", value: paidCases.length, icon: Coins },
          { label: "Hero Helps (Unlocks)", value: totalHeroHelps, icon: Heart },
          { label: "Total Deposits", value: deposits.length, icon: Coins },
          { label: "Active Suspensions", value: activeSuspensions, icon: Shield }
        ].map(({ label, value, icon: Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold", children: value }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: label })
        ] }, label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "KYC" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-teal-600", children: [
                "✅ ",
                approvedKycCount
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600", children: [
                "❌ ",
                rejectedKycCount
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-orange-500", children: [
                "⏳ ",
                pendingKyc.length
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Cases" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-teal-600", children: [
                "✅ ",
                approvedCasesCount
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600", children: [
                "❌ ",
                rejectedCasesCount
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-blue-600", children: [
                "✅ ",
                completedCasesCount
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-orange-500", children: [
                "⏳ ",
                pendingCases.length
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-500", children: [
                "⌛ ",
                expiredCasesCount
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Deposits" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-teal-600", children: [
                "✅ ",
                approvedDepositsCount
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600", children: [
                "❌ ",
                rejectedDepositsCount
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-orange-500", children: [
                "⏳ ",
                pendingDeposits.length
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Suspensions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-red-600", children: [
              "🚫 ",
              activeSuspensions
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "users", className: "space-y-3 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserSearchBox, { usersList, onSuspendChange: loadData, onManualUnlock: manualUnlockUser }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "kyc", className: "space-y-4 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KycSearchBox, { kycList, onUpdate: updateKyc, cnicCounts, profileMap }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "cases", className: "space-y-4 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        CaseSearchBox,
        {
          caseList,
          onUpdate: updateCase,
          resolutions: resByCaseId,
          profileMap,
          cnicByUser,
          statusFilter: caseStatusFilter,
          setStatusFilter: setCaseStatusFilter
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "verify", className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search direct help by case, hero, email, CNIC, or TXN...", value: resolutionSearch, onChange: (e) => setResolutionSearch(e.target.value), className: "pl-9 h-11" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Review direct-help proofs, check the receipt and amount, then approve or reject each submission. Approved direct payments remain in the completed history." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-card border border-border px-3 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Pending Direct Payments" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "block text-lg text-primary", children: pendingDirectCount })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-card border border-border px-3 py-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Completed Direct Payments" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "block text-lg text-teal-600", children: completedDirectResolutions.length })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-1 rounded-xl border border-border bg-muted/30 p-1", role: "tablist", "aria-label": "Direct payment status filters", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", role: "tab", "aria-selected": resolutionView === "pending", onClick: () => setResolutionView("pending"), className: `rounded-lg px-2 py-2 text-xs font-semibold ${resolutionView === "pending" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`, children: [
            "Pending (",
            pendingDirectCount,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", role: "tab", "aria-selected": resolutionView === "rejected", onClick: () => setResolutionView("rejected"), className: `rounded-lg px-2 py-2 text-xs font-semibold ${resolutionView === "rejected" ? "bg-card text-red-700 shadow-sm" : "text-muted-foreground"}`, children: [
            "Rejected (",
            rejectedDirectResolutions.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", role: "tab", "aria-selected": resolutionView === "completed", onClick: () => setResolutionView("completed"), className: `rounded-lg px-2 py-2 text-xs font-semibold ${resolutionView === "completed" ? "bg-card text-teal-700 shadow-sm" : "text-muted-foreground"}`, children: [
            "Completed (",
            completedDirectResolutions.length,
            ")"
          ] })
        ] }),
        visibleDirectResolutions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: resolutionView === "pending" ? "No Direct Payments awaiting verification" : resolutionView === "rejected" ? "No rejected direct payments yet" : "No completed direct payments yet" }) : visibleDirectResolutions.map((r) => {
          const c = caseList.find((cs) => cs.id === r.case_id);
          return resolutionView === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsx(VerifyCard, { r, c, profileMap, onConfirm: confirmResolution, onReject: rejectResolution }, r.id) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResolutionHistoryCard, { r, c, profileMap }, r.id);
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "contributions", className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search contributions by case, hero, email, CNIC, or TXN...", value: resolutionSearch, onChange: (e) => setResolutionSearch(e.target.value), className: "pl-9 h-11" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Contributions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1", children: "Review every contribution receipt, amount, and transaction ID. Approved contributions remain visible in the completed history." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-1 rounded-xl border border-border bg-muted/30 p-1", role: "tablist", "aria-label": "Contribution status filters", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", role: "tab", "aria-selected": resolutionView === "pending", onClick: () => setResolutionView("pending"), className: `rounded-lg px-2 py-2 text-xs font-semibold ${resolutionView === "pending" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`, children: [
            "Pending (",
            pendingContributionCount,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", role: "tab", "aria-selected": resolutionView === "rejected", onClick: () => setResolutionView("rejected"), className: `rounded-lg px-2 py-2 text-xs font-semibold ${resolutionView === "rejected" ? "bg-card text-red-700 shadow-sm" : "text-muted-foreground"}`, children: [
            "Rejected (",
            rejectedContributions.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", role: "tab", "aria-selected": resolutionView === "completed", onClick: () => setResolutionView("completed"), className: `rounded-lg px-2 py-2 text-xs font-semibold ${resolutionView === "completed" ? "bg-card text-teal-700 shadow-sm" : "text-muted-foreground"}`, children: [
            "Completed (",
            completedContributions.length,
            ")"
          ] })
        ] }),
        visibleContributionResolutions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: resolutionView === "pending" ? "No Contributions awaiting verification" : resolutionView === "rejected" ? "No rejected contributions yet" : "No completed contributions yet" }) : visibleContributionResolutions.map((r) => {
          const c = caseList.find((cs) => cs.id === r.case_id);
          return resolutionView === "pending" ? /* @__PURE__ */ jsxRuntimeExports.jsx(VerifyCard, { r, c, profileMap, onConfirm: confirmResolution, onReject: rejectResolution }, r.id) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResolutionHistoryCard, { r, c, profileMap }, r.id);
        })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "pay", className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-teal-50 dark:bg-teal-950/20 p-4 text-sm text-teal-700 flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-4 w-4 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Fundraising cases that have reached their goal. After paying the institute, upload the receipt and close the case. The seeker will be notified." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 border-b border-border pb-3", role: "group", "aria-label": "Pay & Close filters", children: [
          { key: "ready", label: "Ready to Pay", count: readyToClose.length },
          { key: "paid", label: "Paid", count: paidPayClose.length },
          { key: "rejected", label: "Rejected", count: rejectedPayClose.length },
          { key: "all", label: "All", count: caseList.length }
        ].map(({ key, label, count }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setPayFilter(key),
            className: `px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${payFilter === key ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`,
            children: [
              label,
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs bg-muted/30 px-1.5 py-0.5 rounded-full", children: count })
            ]
          },
          key
        )) }),
        (() => {
          let displayCases = [];
          if (payFilter === "ready") displayCases = readyToClose;
          else if (payFilter === "paid") displayCases = paidPayClose;
          else if (payFilter === "rejected") displayCases = rejectedPayClose;
          else displayCases = caseList;
          if (displayCases.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: `No cases matching "${payFilter}"` });
          return displayCases.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            PayCloseCard,
            {
              c,
              profileMap,
              onClose: markAsPaidAndClose,
              onReject: rejectPayClose
            },
            c.id
          ));
        })()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "deposits", className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 border-b border-border pb-3", role: "group", "aria-label": "Deposit status filters", children: ["all", "pending", "approved", "rejected"].map((status) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setDepositStatusFilter(status),
            className: `px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${depositStatusFilter === status ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`,
            children: [
              status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs bg-muted/30 px-1.5 py-0.5 rounded-full", children: deposits.filter((d) => status === "all" || d.status === status).length })
            ]
          },
          status
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          DepositSearchBox,
          {
            deposits: deposits.filter((d) => depositStatusFilter === "all" || d.status === depositStatusFilter),
            onApprove: approveDeposit,
            onReject: rejectDeposit,
            profileMap,
            cnicByUser
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "notify", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NotifyPanel, { profiles, kycList, caseList }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "offers", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OffersPanel, { offers, onReload: reloadOffers }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "support", className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SupportPanel, { allMsgs: supportMsgs, profileMap, onNewMessage: loadSupportMessages, unreadCount: unreadSupport }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "feedback", className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search feedback by case, user, email, name, or text...", value: feedbackSearch, onChange: (e) => setFeedbackSearch(e.target.value), className: "pl-9 h-11" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 border-b border-border pb-3", role: "group", "aria-label": "Feedback status filters", children: ["all", "pending_review", "approved", "rejected"].map((status) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setFeedbackStatusFilter(status),
            className: `px-4 py-1.5 text-sm font-medium rounded-full border transition-colors ${feedbackStatusFilter === status ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:bg-muted"}`,
            children: [
              status === "all" ? "All" : status === "pending_review" ? "Pending Review" : status.charAt(0).toUpperCase() + status.slice(1),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs bg-muted/30 px-1.5 py-0.5 rounded-full", children: feedbacks.filter((f) => status === "all" || f.status === status).length })
            ]
          },
          status
        )) }),
        visibleFeedbacks.filter((f) => !!f.case_id && (feedbackStatusFilter === "all" || f.status === feedbackStatusFilter)).length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: "No matching feedback" }) : visibleFeedbacks.filter((f) => !!f.case_id && (feedbackStatusFilter === "all" || f.status === feedbackStatusFilter)).map((fb) => /* @__PURE__ */ jsxRuntimeExports.jsx(FeedbackCard, { fb, profileMap, caseList, onUpdate: updateFeedback }, fb.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "suspensions", className: "space-y-4 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SuspensionsPanel, { suspensions, profiles, onUnlock: manualUnlockUser, onReload: loadData }) })
    ] })
  ] }) });
}
function SuspensionsPanel({ suspensions, profiles, onUnlock, onReload }) {
  const activeSuspensions = suspensions.filter((s) => s.is_active);
  const totalSuspensions = suspensions.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-red-500 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Total Suspensions:" }),
          " ",
          totalSuspensions,
          " · ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Active:" }),
          " ",
          activeSuspensions.length
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Each suspension costs 5 credits to unlock. Users can unlock themselves from the submit page." })
      ] })
    ] }),
    activeSuspensions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: "No active suspensions" }) : activeSuspensions.map((s) => {
      const profile = profiles.find((p) => p.user_id === s.user_id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5 text-red-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: (profile == null ? void 0 : profile.full_name) || "Unknown User" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full", children: "Suspended" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "Suspension #",
            s.suspension_count
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "User ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-xs", children: [
              s.user_id.slice(0, 12),
              "..."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: (profile == null ? void 0 : profile.email) || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Rejections at Suspension" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-red-600", children: s.rejection_count_at_suspension })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Suspended At" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: new Date(s.suspended_at).toLocaleDateString() })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2 border-t border-red-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-teal-600 border-teal-300", onClick: () => onUnlock(s.user_id), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
            " Manually Unlock"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
            navigator.clipboard.writeText(s.user_id);
            ue.success("User ID copied!");
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5 mr-1" }),
            " Copy ID"
          ] })
        ] })
      ] }, s.id);
    })
  ] });
}
function KycSearchBox({ kycList, onUpdate, cnicCounts, profileMap }) {
  const [search, setSearch] = reactExports.useState("");
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const sortedKyc = [...kycList].sort((a, b) => {
    const order = { pending: 0, approved: 1, rejected: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });
  const query = search.trim().toLowerCase();
  const digits = search.replace(/\D/g, "");
  const filtered = sortedKyc.filter((k) => {
    var _a;
    const statusMatches = statusFilter === "all" || String(k.status || "").toLowerCase() === statusFilter;
    if (!statusMatches) return false;
    if (!query) return true;
    const email = ((_a = profileMap == null ? void 0 : profileMap[k.user_id]) == null ? void 0 : _a.email) || k.email || "";
    return [k.full_name, k.user_id, email].some((value) => String(value || "").toLowerCase().includes(query)) || !!digits && String(k.cnic_number || "").replace(/\D/g, "").includes(digits);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search KYC by name, CNIC, or email...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-11" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", role: "group", "aria-label": "KYC status filters", children: ["all", "pending", "approved", "rejected"].map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setStatusFilter(status), className: `rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${statusFilter === status ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`, children: status === "all" ? "All KYC" : status === "pending" ? "Pending" : status === "approved" ? "Approved" : "Rejected" }, status)) }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: "No matching KYC submissions" }) : filtered.map((kyc) => {
      const c = cleanCnic(kyc.cnic_number);
      const dupCount = c ? cnicCounts[c] ?? 0 : 0;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(KycCard, { kyc, onUpdate, dupCount }, kyc.id);
    })
  ] });
}
function CaseSearchBox({ caseList, onUpdate, resolutions, profileMap, cnicByUser, statusFilter, setStatusFilter }) {
  const [search, setSearch] = reactExports.useState("");
  const sortedCases = [...caseList].sort((a, b) => {
    const order = { pending: 0, approved: 1, rejected: 2, completed: 3, expired: 4 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });
  const filteredByStatus = statusFilter === "all" ? sortedCases : sortedCases.filter((c) => c.status === statusFilter);
  const query = search.trim().toLowerCase();
  const digits = search.replace(/\D/g, "");
  const filtered = filteredByStatus.filter((c) => {
    var _a, _b;
    if (!query) return true;
    return [c.title, c.category, c.user_id, (_a = profileMap[c.user_id]) == null ? void 0 : _a.full_name, (_b = profileMap[c.user_id]) == null ? void 0 : _b.email].some((value) => String(value || "").toLowerCase().includes(query)) || !!digits && [c.cnic_number, cnicByUser == null ? void 0 : cnicByUser[c.user_id]].some((value) => String(value || "").replace(/\D/g, "").includes(digits));
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", role: "group", "aria-label": "Case status filters", children: ["all", "pending", "approved", "rejected", "completed", "expired"].map((status) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: () => setStatusFilter(status),
        className: `rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${statusFilter === status ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`,
        children: [
          status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1 text-[10px] opacity-70", children: [
            "(",
            caseList.filter((c) => status === "all" || c.status === status).length,
            ")"
          ] })
        ]
      },
      status
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search cases by title, category, name, CNIC, or email...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-11" })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: `No matching cases (${statusFilter})` }) : filtered.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      CaseCard,
      {
        c,
        onUpdate,
        resolutions: resolutions[c.id] ?? [],
        profileMap
      },
      c.id
    ))
  ] });
}
function CaseCard({ c, onUpdate, resolutions, profileMap }) {
  var _a;
  const [reason, setReason] = reactExports.useState("");
  const [actionLoading, setActionLoading] = reactExports.useState(false);
  const cur = c.currency || "USD";
  const s = sym(cur);
  const seeker = profileMap[c.user_id];
  const hasPayment = c.institute_name || c.account_number || c.account_title || c.account_iban;
  const parseObject = (value) => {
    if (value && typeof value === "object") return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        return parsed && typeof parsed === "object" ? parsed : null;
      } catch {
        return null;
      }
    }
    return null;
  };
  const catDetails = parseObject(c.category_details);
  const catDocs = parseObject(catDetails == null ? void 0 : catDetails._documents) || {};
  const allFields = [];
  if (catDetails) {
    const excludeKeys = /* @__PURE__ */ new Set([
      "_documents",
      "edu_documents",
      "edu_sub_fields",
      "property_ownership",
      "rental_agreement_url",
      "landlord_cnic_url",
      "job_status",
      "gender",
      "statement_url",
      "salary_slip_url",
      "owner_cnic_url",
      "property_rental_agreement_url",
      "property_landlord_cnic_url",
      "property_owner_cnic_url",
      "owner_relation",
      "marital_status",
      "is_orphan",
      "orphan_parent",
      "seeker_name",
      "seeker_contact",
      "receiver_name",
      "receiver_contact",
      "receiver_bank",
      "receiver_account",
      "disability_mode",
      "disability_type",
      "disability_reason",
      "disability_shop_name",
      "disability_shop_contact",
      "disability_hospital",
      "treatment_amount",
      "treatment_expiry",
      "treatment_patient_number",
      "disability_bank_title",
      "disability_bank_number",
      "institute_name",
      "institute_contact",
      "institute_address",
      "is_institute_in_list",
      "reference_type",
      "reference_number",
      "due_date",
      "edu_sub_type",
      "edu_admission_level"
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
  const eduSubFields = (catDetails == null ? void 0 : catDetails.edu_sub_fields) || {};
  const eduFields = [];
  for (const [key, val] of Object.entries(eduSubFields)) {
    if (val) eduFields.push({ label: getDocLabel(key), value: val });
  }
  const personalDetails = [
    { label: "Job Status", value: (catDetails == null ? void 0 : catDetails.job_status) || "" },
    { label: "Gender", value: (catDetails == null ? void 0 : catDetails.gender) || "" },
    { label: "Marital Status", value: (catDetails == null ? void 0 : catDetails.marital_status) || "" },
    { label: "Orphan", value: (catDetails == null ? void 0 : catDetails.is_orphan) || "" },
    { label: "Orphan Parent", value: (catDetails == null ? void 0 : catDetails.orphan_parent) || "" },
    { label: "Seeker Name", value: (catDetails == null ? void 0 : catDetails.seeker_name) || "" },
    { label: "Seeker Contact", value: (catDetails == null ? void 0 : catDetails.seeker_contact) || "" }
  ].filter((d) => d.value);
  const receiverDetails = [
    { label: "Receiver Name", value: (catDetails == null ? void 0 : catDetails.receiver_name) || "" },
    { label: "Receiver Contact", value: (catDetails == null ? void 0 : catDetails.receiver_contact) || "" },
    { label: "Receiver Bank", value: (catDetails == null ? void 0 : catDetails.receiver_bank) || "" },
    { label: "Receiver Account", value: (catDetails == null ? void 0 : catDetails.receiver_account) || "" },
    { label: "Receiver Address", value: (catDetails == null ? void 0 : catDetails.receiver_address) || "" },
    { label: "Shop Name", value: (catDetails == null ? void 0 : catDetails.receiver_shop_name) || "" }
  ].filter((d) => d.value);
  const disabilityDetails = [
    { label: "Disability Mode", value: (catDetails == null ? void 0 : catDetails.disability_mode) || "" },
    { label: "Disability Type", value: (catDetails == null ? void 0 : catDetails.disability_type) || "" },
    { label: "Disability Reason", value: (catDetails == null ? void 0 : catDetails.disability_reason) || "" },
    { label: "Shop Name", value: (catDetails == null ? void 0 : catDetails.disability_shop_name) || "" },
    { label: "Shop Contact", value: (catDetails == null ? void 0 : catDetails.disability_shop_contact) || "" },
    { label: "Hospital", value: (catDetails == null ? void 0 : catDetails.disability_hospital) || "" },
    { label: "Treatment Amount", value: (catDetails == null ? void 0 : catDetails.treatment_amount) || "" },
    { label: "Treatment Expiry", value: (catDetails == null ? void 0 : catDetails.treatment_expiry) || "" },
    { label: "Patient/Bill Number", value: (catDetails == null ? void 0 : catDetails.treatment_patient_number) || "" },
    { label: "Bank Title (Stipend)", value: (catDetails == null ? void 0 : catDetails.disability_bank_title) || "" },
    { label: "Bank Number (Stipend)", value: (catDetails == null ? void 0 : catDetails.disability_bank_number) || "" }
  ].filter((d) => d.value);
  const propertyDetails = [
    { label: "Property Ownership", value: (catDetails == null ? void 0 : catDetails.property_ownership) === "rented" ? "Rented" : (catDetails == null ? void 0 : catDetails.property_ownership) === "owned" ? "Owned" : "" },
    { label: "Owner Relation", value: (catDetails == null ? void 0 : catDetails.owner_relation) || "" }
  ].filter((d) => d.value);
  const fileEntries = [];
  function getFileNameFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const key = urlObj.searchParams.get("key");
      if (key) {
        const parts = key.split("/");
        const lastPart = parts[parts.length - 1];
        if (lastPart) {
          let name = decodeURIComponent(lastPart).replace(/^[0-9]+[-_]/, "").replace(/^[a-f0-9]{8,}[-_]/, "");
          if (name && name.length > 0 && name !== "null") {
            return name;
          }
        }
      }
      const pathParts = urlObj.pathname.split("/");
      const last = pathParts[pathParts.length - 1];
      if (last) {
        let name = decodeURIComponent(last).replace(/^[0-9]+[-_]/, "").replace(/^[a-f0-9]{8,}[-_]/, "");
        if (name && name.length > 0 && name !== "null") {
          return name;
        }
      }
      return "File";
    } catch {
      return "File";
    }
  }
  function getFileLabel(key, url, explicitLabel) {
    if (explicitLabel == null ? void 0 : explicitLabel.trim()) return explicitLabel.trim();
    if (DOC_LABELS[key]) return DOC_LABELS[key];
    const fileName = getFileNameFromUrl(url);
    if (fileName === "File" || fileName === "photo" || fileName === "uploads" || fileName.match(/^[0-9a-f]{8,}$/i)) {
      const cleanKey = key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/\b\w/g, (c2) => c2.toUpperCase()).trim();
      if (cleanKey && cleanKey !== "Photo" && cleanKey !== "File") {
        return cleanKey;
      }
      return "Uploaded File";
    }
    return fileName;
  }
  const pushFile = (key, value, explicitLabel) => {
    let url = "";
    let label = explicitLabel;
    if (typeof value === "string") {
      url = value.trim();
    } else if (value && typeof value === "object") {
      const file = value;
      const candidate = file.url || file.file_url || file.download_url || file.href || file.path;
      if (typeof candidate === "string") url = candidate.trim();
      const name = file.original_name || file.filename || file.file_name || file.name;
      if (!label && typeof name === "string") label = name;
    }
    try {
      const parsed = new URL(url);
      if (parsed.pathname === "/uploads" && parsed.searchParams.get("key")) {
        const objectKey = parsed.searchParams.get("key") || "";
        parsed.pathname = `/uploads/${objectKey}`;
        parsed.search = "";
        url = parsed.toString();
      }
    } catch {
    }
    if (!url.startsWith("http")) return;
    if (fileEntries.some((f) => f.url === url)) return;
    fileEntries.push({ key, label: getFileLabel(key, url, label), url });
  };
  pushFile("selfie_url", c.selfie_url);
  pushFile("video_url", c.video_url);
  pushFile("paid_receipt_url", c.paid_receipt_url);
  pushFile("salary_slip", c.salary_slip_url || (catDetails == null ? void 0 : catDetails.salary_slip_url), "Salary Slip (6 Months)");
  pushFile("statement", c.statement_url || (catDetails == null ? void 0 : catDetails.statement_url), "Bank Statement (6 Months)");
  pushFile("rental_agreement", (catDetails == null ? void 0 : catDetails.rental_agreement_url) || (catDetails == null ? void 0 : catDetails.property_rental_agreement_url) || (catDetails == null ? void 0 : catDetails.rentalAgreementUrl), "Rental Agreement");
  pushFile("landlord_cnic", (catDetails == null ? void 0 : catDetails.landlord_cnic_url) || (catDetails == null ? void 0 : catDetails.property_landlord_cnic_url) || (catDetails == null ? void 0 : catDetails.landlordCnicUrl), "Landlord's CNIC");
  pushFile("owner_cnic", (catDetails == null ? void 0 : catDetails.owner_cnic_url) || (catDetails == null ? void 0 : catDetails.property_owner_cnic_url) || (catDetails == null ? void 0 : catDetails.ownerCnicUrl), "Owner's CNIC");
  const explicitDocuments = [
    ["gender_doc_urls", catDetails == null ? void 0 : catDetails.gender_doc_urls],
    ["cat_doc_urls", catDetails == null ? void 0 : catDetails.cat_doc_urls]
  ];
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
  const walkFilesDeep = (obj, prefix = "") => {
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
        const file = v;
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
  walkFilesDeep(parseObject(catDetails == null ? void 0 : catDetails.edu_documents) || {}, "education_documents");
  const seen = /* @__PURE__ */ new Set();
  const uniqueFiles = fileEntries.filter((file) => {
    if (seen.has(file.url)) return false;
    seen.add(file.url);
    return true;
  });
  const isRejected = c.status === "rejected";
  c.status === "completed";
  const isExpired = c.status === "expired";
  c.status === "approved";
  const isPending = c.status === "pending";
  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to APPROVE this case: "${c.title}"?`)) return;
    setActionLoading(true);
    try {
      await onUpdate(c.id, "approved");
    } catch (e) {
      ue.error("Failed to approve case.");
    } finally {
      setActionLoading(false);
    }
  };
  const handleReject = async () => {
    if (!reason.trim()) {
      ue.error("Please enter a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      await onUpdate(c.id, "rejected", reason.trim());
      setReason("");
    } catch (e) {
      ue.error("Failed to reject case.");
    } finally {
      setActionLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-4 space-y-3 ${isRejected ? "border-red-300 bg-red-50/50 dark:bg-red-950/10" : "bg-card"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: c.status }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full", children: c.category }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-muted px-2 py-0.5 rounded-full", children: c.urgency }),
      c.was_free ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold", children: "FREE" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold", children: "PAID" }),
      c.closed_by_admin && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold", children: "FUNDRAISED & PAID" }),
      isExpired && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-semibold", children: "EXPIRED" })
    ] }),
    isRejected && c.rejection_reason && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border-2 border-red-300 bg-red-100 dark:bg-red-950/30 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-5 w-5 text-red-600 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-red-700", children: "❌ Rejected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 max-h-32 overflow-y-auto whitespace-pre-line text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200", children: c.rejection_reason }),
        c.reviewed_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-500 mt-2", children: [
          "Reviewed on: ",
          new Date(c.reviewed_at).toLocaleString()
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: c.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: c.short_description }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
        "📍 ",
        c.city,
        ", ",
        c.country,
        " ",
        c.amount_needed && `· Needs: ${s} ${c.amount_needed} ${cur}`
      ] }),
      c.deadline && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold text-red-600 flex items-center gap-1", children: [
        "⏰ Bill / Case Due (Expiry) Date: ",
        new Date(c.deadline).toLocaleDateString()
      ] }),
      c.amount_needed > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600 font-medium", children: [
        "Collected: ",
        s,
        " ",
        c.amount_collected ?? 0,
        " / ",
        s,
        " ",
        c.amount_needed
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 rounded-lg bg-primary/5 border border-primary/10 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-semibold text-primary uppercase tracking-wide mb-1", children: "📋 Full Case Description" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground whitespace-pre-line leading-relaxed", children: c.description || "No description provided" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 border border-border p-2.5 text-xs space-y-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-foreground flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
        " Submitted by"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        (seeker == null ? void 0 : seeker.full_name) || "—",
        " · ",
        (seeker == null ? void 0 : seeker.email) || ((_a = c.user_id) == null ? void 0 : _a.slice(0, 8))
      ] })
    ] }),
    personalDetails.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 border border-border p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-primary flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-3 w-3" }),
        " Personal Details"
      ] }),
      personalDetails.map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label, value }, label))
    ] }),
    receiverDetails.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 border border-border p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-primary flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(HandCoins, { className: "h-3 w-3" }),
        " Payment Receiver"
      ] }),
      receiverDetails.map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label, value }, label))
    ] }),
    disabilityDetails.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 border border-border p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-primary flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-3 w-3" }),
        " Disability Details"
      ] }),
      disabilityDetails.map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label, value }, label))
    ] }),
    propertyDetails.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 border border-border p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-primary flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3 w-3" }),
        " Property Details"
      ] }),
      propertyDetails.map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label, value }, label)),
      (catDetails == null ? void 0 : catDetails.rental_agreement_url) && /* @__PURE__ */ jsxRuntimeExports.jsx(Img, { url: catDetails.rental_agreement_url, label: "Rental Agreement" }),
      (catDetails == null ? void 0 : catDetails.property_rental_agreement_url) && /* @__PURE__ */ jsxRuntimeExports.jsx(Img, { url: catDetails.property_rental_agreement_url, label: "Rental Agreement" }),
      (catDetails == null ? void 0 : catDetails.landlord_cnic_url) && /* @__PURE__ */ jsxRuntimeExports.jsx(Img, { url: catDetails.landlord_cnic_url, label: "Landlord's CNIC" }),
      (catDetails == null ? void 0 : catDetails.property_landlord_cnic_url) && /* @__PURE__ */ jsxRuntimeExports.jsx(Img, { url: catDetails.property_landlord_cnic_url, label: "Landlord's CNIC" }),
      (catDetails == null ? void 0 : catDetails.owner_cnic_url) && /* @__PURE__ */ jsxRuntimeExports.jsx(Img, { url: catDetails.owner_cnic_url, label: "Owner's CNIC" }),
      (catDetails == null ? void 0 : catDetails.property_owner_cnic_url) && /* @__PURE__ */ jsxRuntimeExports.jsx(Img, { url: catDetails.property_owner_cnic_url, label: "Owner's CNIC" })
    ] }),
    eduFields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-blue-700 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "h-3 w-3" }),
        " Education Details"
      ] }),
      eduFields.map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label, value }, label))
    ] }),
    allFields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 border border-border p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-primary flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-3 w-3" }),
        " Other Details"
      ] }),
      allFields.map(({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label, value }, label))
    ] }),
    uniqueFiles.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 p-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }),
          " Uploaded Files (",
          uniqueFiles.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => copyText(uniqueFiles.map((f) => f.url).join("\n")), className: "text-[10px] text-primary hover:underline flex items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" }),
          " Copy URLs"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-2", children: uniqueFiles.map(({ key, label, url }) => {
        const lowerFileName = `${url} ${label}`.toLowerCase();
        const isVideo = lowerFileName.match(/\.(mp4|webm|mov|avi)(?:$|\?)/i) || lowerFileName.includes("video");
        const isPdf = lowerFileName.match(/\.pdf(?:$|\?)/i);
        const isImage = lowerFileName.match(/\.(png|jpe?g|gif|webp|bmp|svg|heic|heif)(?:$|\?)/i) || lowerFileName.includes("image") || lowerFileName.includes("photo") || lowerFileName.includes("selfie");
        const downloadUrl = (() => {
          try {
            const parsed = new URL(url, window.location.origin);
            parsed.searchParams.set("download", "1");
            return parsed.toString();
          } catch {
            return url;
          }
        })();
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 bg-background/80 p-1.5 rounded border", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-medium text-foreground truncate", title: label, children: [
            "📎 ",
            label
          ] }),
          isVideo ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: url, controls: true, className: "w-full rounded border max-h-32 bg-black" }) : isPdf ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "block text-center py-4 bg-muted text-primary text-xs font-semibold rounded hover:underline", children: "📄 View PDF" }) : isImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: label, className: "w-full rounded border max-h-28 object-cover hover:opacity-95" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-28 flex-col items-center justify-center gap-2 rounded border bg-muted/60 p-3 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "Document file" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-[9px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", className: "text-primary hover:underline", children: isImage || isPdf || isVideo ? "Open in Full Size ↗" : "Open File ↗" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: downloadUrl, download: label, className: "inline-flex items-center gap-0.5 text-primary hover:underline", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3 w-3" }),
              " Download"
            ] })
          ] })
        ] }, key + url);
      }) })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-300 p-3 text-xs text-yellow-700", children: "⚠️ No files uploaded for this case." }),
    hasPayment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-sm flex items-center gap-1 text-amber-700", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-4 w-4" }),
        " Institute Payment Details"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Institute / Provider", value: c.institute_name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Payment Method", value: c.payment_method }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Account Title / Reference", value: c.account_title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Account / Bill Number", value: c.account_number, mono: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "IBAN", value: c.account_iban, mono: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Institute Contact", value: c.institute_contact, mono: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DetailRow, { label: "Institute Address", value: c.institute_address })
    ] }),
    resolutions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-sm flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4 text-primary" }),
        " All Helps / Payments"
      ] }),
      resolutions.map((r) => {
        var _a2;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs space-y-0.5 border-b border-border/50 last:border-0 pb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${r.status === "completed" ? "bg-teal-100 text-teal-700" : r.status === "disputed" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`, children: (_a2 = r.status) == null ? void 0 : _a2.toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-1 ${isContributionResolution(r) ? "bg-primary/10 text-primary" : "bg-blue-100 text-blue-700"}`, children: isContributionResolution(r) ? "FUNDRAISING" : "DIRECT" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount:" }),
            " ",
            s,
            " ",
            r.seeker_confirmed_amount ?? r.amount_paid,
            " ",
            cur,
            " · ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "TXN:" }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: r.transaction_id })
          ] }),
          r.receipt_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: r.receipt_url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-primary text-[10px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3 w-3" }),
            " Receipt"
          ] })
        ] }, r.id);
      })
    ] }),
    isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-2 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          placeholder: "Rejection reason (if rejecting)",
          value: reason,
          onChange: (e) => setReason(e.target.value),
          rows: 2,
          className: "text-sm"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            className: "bg-teal-600 hover:bg-teal-700 text-white",
            onClick: handleApprove,
            disabled: actionLoading,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
              " Approve"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            className: "text-red-600 border-red-300",
            onClick: handleReject,
            disabled: actionLoading,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 mr-1" }),
              " Reject"
            ]
          }
        )
      ] })
    ] }),
    !isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-border text-xs text-muted-foreground", children: [
      "This case is ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold capitalize", children: c.status }),
      ".",
      isRejected && " The rejection reason is shown above."
    ] })
  ] });
}
function KycCard({ kyc, onUpdate, dupCount }) {
  var _a;
  const [reason, setReason] = reactExports.useState("");
  const isDuplicate = dupCount > 1;
  const isPending = kyc.status === "pending";
  const isApproved = kyc.status === "approved";
  const isReKyc = kyc.status === "re_kyc";
  const isDuplicateStatus = kyc.status === "duplicate";
  const isRejected = kyc.status === "rejected";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border bg-card p-4 space-y-3 ${isDuplicate && isPending ? "border-red-300" : ""}`, children: [
    isDuplicate && isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 p-2.5 text-xs text-red-700 flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-4 w-4 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "⚠️ Duplicate CNIC!" }),
        " Used in ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          dupCount,
          " active KYC submissions"
        ] }),
        ". Review carefully."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: kyc.status }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: kyc.full_name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        "Type: ",
        (_a = kyc.document_type) == null ? void 0 : _a.toUpperCase(),
        " ",
        kyc.cnic_number && `· ${kyc.cnic_number}`
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground", children: kyc.address })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
      kyc.cnic_front_url && /* @__PURE__ */ jsxRuntimeExports.jsx(Img, { url: kyc.cnic_front_url, label: "CNIC Front" }),
      kyc.cnic_back_url && /* @__PURE__ */ jsxRuntimeExports.jsx(Img, { url: kyc.cnic_back_url, label: "CNIC Back" }),
      kyc.selfie_url && /* @__PURE__ */ jsxRuntimeExports.jsx(Img, { url: kyc.selfie_url, label: "Selfie" }),
      kyc.passport_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: kyc.passport_url, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-primary flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3" }),
        " Passport"
      ] }),
      kyc.face_video_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Face Video" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: kyc.face_video_url, controls: true, className: "w-full rounded border max-h-24" })
      ] })
    ] }),
    isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Rejection reason (if rejecting)", value: reason, onChange: (e) => setReason(e.target.value), rows: 2, className: "text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "bg-teal-600 hover:bg-teal-700 text-white", onClick: () => onUpdate(kyc.id, "approved", "", "approve"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
          " Approve"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-red-600 border-red-300", onClick: () => onUpdate(kyc.id, "rejected", reason, "reject"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 mr-1" }),
          " Reject"
        ] })
      ] })
    ] }),
    isApproved && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Reason for Re-KYC or Duplicate", value: reason, onChange: (e) => setReason(e.target.value), rows: 2, className: "text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-amber-600 border-amber-300", onClick: () => {
          if (!reason.trim()) {
            ue.error("Please provide a reason for re-kyc");
            return;
          }
          onUpdate(kyc.id, "re_kyc", reason, "re_kyc");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "h-3.5 w-3.5 mr-1" }),
          " Re-KYC"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "destructive", onClick: () => {
          if (!confirm("Are you sure you want to mark this as DUPLICATE and BAN the user?")) return;
          onUpdate(kyc.id, "duplicate", reason || "Duplicate KYC", "duplicate");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5 mr-1" }),
          " Duplicate - Ban"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
        "⚡ ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Re-KYC:" }),
        " User will be asked to resubmit KYC. ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Duplicate - Ban:" }),
        " Marks as duplicate and bans the user permanently."
      ] })
    ] }),
    isReKyc && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-300 p-3 text-sm text-blue-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🔄 Re-KYC Requested" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "User has been notified to resubmit KYC. Reason: ",
        kyc.rejection_reason || "CNIC correction needed"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-amber-600 border-amber-300", onClick: () => {
          if (!reason.trim()) {
            ue.error("Please provide a reason");
            return;
          }
          onUpdate(kyc.id, "re_kyc", reason, "re_kyc");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCw, { className: "h-3.5 w-3.5 mr-1" }),
          " Re-KYC Again"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "destructive", onClick: () => {
          if (!confirm("Are you sure you want to mark this as DUPLICATE and BAN the user?")) return;
          onUpdate(kyc.id, "duplicate", reason || "Duplicate KYC", "duplicate");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "h-3.5 w-3.5 mr-1" }),
          " Duplicate - Ban"
        ] })
      ] })
    ] }),
    isDuplicateStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 p-3 text-sm text-red-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "🚫 Duplicate KYC - User Banned" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "This KYC was marked as duplicate and the user account has been suspended." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 text-red-600", children: "User cannot submit any cases." })
    ] }),
    isRejected && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-300 p-3 text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "❌ KYC Rejected" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Reason: ",
        kyc.rejection_reason || "No reason provided"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "User can resubmit KYC." })
    ] })
  ] });
}
function DepositCard({ d, onApprove, onReject }) {
  var _a;
  const [reason, setReason] = reactExports.useState("");
  const [credits, setCredits] = reactExports.useState(String(d.credits ?? d.amount ?? ""));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: d.status }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full", children: d.method })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4 text-primary" }),
        " User claims: $",
        d.amount,
        " → ",
        d.credits ?? d.amount,
        " Credits"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs font-mono", children: [
        "TXN: ",
        d.transaction_id
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-xs", children: [
        "User: ",
        (_a = d.user_id) == null ? void 0 : _a.slice(0, 8),
        "..."
      ] })
    ] }),
    d.proof_url && /* @__PURE__ */ jsxRuntimeExports.jsx(Img, { url: d.proof_url, label: "Payment Proof" }),
    d.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-amber-700 dark:text-amber-400", children: "Credits to add (verify against receipt):" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "number",
            step: "0.01",
            min: "0",
            value: credits,
            onChange: (e) => setCredits(e.target.value),
            className: "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm",
            placeholder: "e.g. 0.99 or 10.1"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Rejection reason (if rejecting)", value: reason, onChange: (e) => setReason(e.target.value), rows: 2, className: "text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "bg-teal-600 hover:bg-teal-700 text-white", onClick: () => onApprove(d, parseFloat(credits) || 0), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
          " Approve & Add ",
          credits || 0,
          " Credits"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-red-600 border-red-300", onClick: () => onReject(d.id, reason), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 mr-1" }),
          " Reject"
        ] })
      ] })
    ] })
  ] });
}
function FeedbackCard({ fb, profileMap, caseList, onUpdate }) {
  var _a;
  const [reason, setReason] = reactExports.useState("");
  const p = profileMap[fb.user_id];
  const c = caseList.find((cs) => cs.id === fb.case_id);
  const status = fb.status || "pending_review";
  const identityName = fb.user_id === "public" ? "Public" : (p == null ? void 0 : p.full_name) || fb.first_name || "—";
  const identityDetail = fb.user_id === "public" ? "Public Visitor" : (p == null ? void 0 : p.email) || ((_a = fb.user_id) == null ? void 0 : _a.slice(0, 8));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${status === "approved" ? "bg-teal-100 text-teal-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`, children: status.replace("_", " ").toUpperCase() }),
      c && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full", children: c.category })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 border border-border p-2.5 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
        identityName,
        " · ",
        identityDetail
      ] }),
      c && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground mt-0.5", children: [
        "Case: ",
        c.title
      ] })
    ] }),
    fb.text_message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm whitespace-pre-line", children: fb.text_message }),
    fb.video_url && /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: fb.video_url, controls: true, className: "w-full rounded border max-h-56" }),
    status === "pending_review" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Rejection reason (e.g. 'video too short', 'unrelated content')", value: reason, onChange: (e) => setReason(e.target.value), rows: 2, className: "text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "bg-teal-600 hover:bg-teal-700 text-white", onClick: () => onUpdate(fb.id, "approved"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
          " Approve — Post to Wall"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-red-600 border-red-300", onClick: () => onUpdate(fb.id, "rejected", reason), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 mr-1" }),
          " Reject"
        ] })
      ] })
    ] })
  ] });
}
function UserSearchBox({ usersList, onSuspendChange, onManualUnlock }) {
  const [search, setSearch] = reactExports.useState("");
  const query = search.trim().toLowerCase();
  const digits = search.replace(/\D/g, "");
  const filtered = usersList.filter((u) => {
    if (!query) return true;
    return [u.email, u.name, u.user_id].some((value) => String(value || "").toLowerCase().includes(query)) || !!digits && String(u.cnic || "").replace(/\D/g, "").includes(digits);
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search users by email, CNIC, name, or user ID...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-11" })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: "No matching users" }) : filtered.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx(UserCard, { u, onSuspendChange, onManualUnlock }, u.user_id))
  ] });
}
function UserCard({ u, onSuspendChange, onManualUnlock }) {
  var _a;
  const [open, setOpen] = reactExports.useState(false);
  const [suspending, setSuspending] = reactExports.useState(false);
  const [reason, setReason] = reactExports.useState("");
  async function toggleSuspend() {
    setSuspending(true);
    try {
      const newStatus = !u.isSuspended;
      await adminUpdateProfile(u.user_id, {
        is_suspended: newStatus,
        suspended_reason: newStatus ? reason || "Repeated fraudulent cases/deposits" : null,
        suspended_at: newStatus ? (/* @__PURE__ */ new Date()).toISOString() : null
      });
      if (newStatus) {
        const existing = await adminGetUserSuspension(u.user_id);
        await adminUpsertUserSuspension({
          user_id: u.user_id,
          suspension_count: ((existing == null ? void 0 : existing.suspension_count) || 0) + 1,
          is_active: true,
          suspended_at: (/* @__PURE__ */ new Date()).toISOString(),
          rejection_count_at_suspension: u.rejectedCases || 0
        });
      } else {
        await adminUpsertUserSuspension({ user_id: u.user_id, is_active: false, unlocked_at: (/* @__PURE__ */ new Date()).toISOString() });
      }
      ue.success(newStatus ? "User suspended." : "User unsuspended.");
      onSuspendChange();
    } catch {
      ue.error("Failed to update suspension status.");
    } finally {
      setSuspending(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border bg-card overflow-hidden ${u.isSuspended ? "border-red-400" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpen(!open), className: "w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0", children: (((_a = u.name) == null ? void 0 : _a[0]) ?? "U").toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-sm truncate flex items-center gap-1.5", children: [
            u.name || "Unknown",
            u.isSuspended && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold", children: "SUSPENDED" }),
            u.suspensionCount > 0 && !u.isSuspended && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full", children: [
              "#",
              u.suspensionCount
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: u.email })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: u.kycStatus }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}` })
      ] })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pb-4 pt-1 border-t border-border bg-muted/20 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4" }), label: "KYC Status", value: u.kycStatus === "none" ? "Not submitted" : u.kycStatus }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4 w-4" }), label: "Wallet Balance", value: `${u.walletBalance} credits` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4 w-4" }), label: "Cases Submitted", value: u.casesSubmitted }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }), label: "Rejected Cases", value: u.rejectedCases }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-4 w-4" }), label: "Cases Helped", value: u.casesUnlocked }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "h-4 w-4" }), label: "Total Deposited", value: `${u.totalDeposited} credits` })
      ] }),
      u.suspensionCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 p-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 font-semibold", children: "🚫 Suspension History" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-red-600", children: [
          "Suspended ",
          u.suspensionCount,
          " time(s) · ",
          u.isSuspended ? "Currently suspended" : "Currently active"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground space-y-1 pt-2 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
          " ",
          u.email
        ] }),
        u.cnic && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono", children: [
          "CNIC: ",
          u.cnic
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }),
          " Joined: ",
          u.created_at ? new Date(u.created_at).toLocaleString() : "—"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-[10px]", children: [
          "ID: ",
          u.user_id
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        u.isSuspended && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-teal-600 border-teal-300 flex-1", onClick: () => onManualUnlock(u.user_id), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
          " Unlock Manually"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "flex-1", onClick: () => {
          navigator.clipboard.writeText(u.user_id);
          ue.success("User ID copied!");
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5 mr-1" }),
          " Copy ID"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-xl border p-3 space-y-2 ${u.isSuspended ? "bg-red-50 dark:bg-red-950/20 border-red-300" : "bg-card border-border"}`, children: u.isSuspended ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-red-700", children: "⛔ Account Suspended" }),
        u.suspendedReason && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-600", children: [
          "Reason: ",
          u.suspendedReason
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", disabled: suspending, onClick: toggleSuspend, className: "w-full", children: "Unsuspend Account" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Suspension reason (e.g. repeated fraudulent cases/deposits)", value: reason, onChange: (e) => setReason(e.target.value), rows: 2, className: "text-xs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "destructive", disabled: suspending, onClick: toggleSuspend, className: "w-full", children: "Suspend This Account" })
      ] }) })
    ] })
  ] });
}
function PayCloseCard({ c, profileMap, onClose, onReject }) {
  var _a;
  const cur = c.currency || "USD";
  const s = sym(cur);
  const seeker = profileMap[c.user_id];
  const [receiptUrl, setReceiptUrl] = reactExports.useState("");
  const [uploading, setUploading] = reactExports.useState(false);
  const [closing, setClosing] = reactExports.useState(false);
  const [reason, setReason] = reactExports.useState("");
  async function uploadReceipt(file) {
    if (!file) return;
    setUploading(true);
    try {
      const path = `paid_receipts/${c.id}/${Date.now()}_receipt`;
      const url = await uploadFileToStorage(file, path);
      setReceiptUrl(url);
      ue.success("Receipt uploaded!");
    } catch {
      ue.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }
  const paidReceiptUrl = c.paid_receipt_url;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-teal-300 bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700", children: "GOAL REACHED 🎉" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full", children: c.category }),
      c.closed_by_admin && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold", children: "PAID" }),
      c.rejection_reason && c.status !== "completed" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold", children: "REJECTED" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: c.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600 font-medium", children: [
      "Raised: ",
      s,
      " ",
      c.amount_collected,
      " of ",
      s,
      " ",
      c.amount_needed,
      " ✅"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 border border-border p-2.5 text-xs space-y-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }),
        " Seeker"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
        (seeker == null ? void 0 : seeker.full_name) || "—",
        " · ",
        (seeker == null ? void 0 : seeker.email) || ((_a = c.user_id) == null ? void 0 : _a.slice(0, 8))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-xs flex items-center gap-1 text-amber-700 dark:text-amber-400", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5" }),
        " Pay this institute:"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: c.institute_name }),
        " · ",
        c.payment_method
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-mono", children: [
        c.account_number,
        " ",
        c.account_iban ? `· ${c.account_iban}` : ""
      ] })
    ] }),
    paidReceiptUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-300 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-green-700 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4" }),
        " Payment Receipt"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: paidReceiptUrl, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary underline flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
        " View Receipt"
      ] })
    ] }),
    c.rejection_reason && c.status !== "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-300 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-red-700 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }),
        " Rejected"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: c.rejection_reason })
    ] }),
    !c.closed_by_admin && !c.rejection_reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium", children: "Upload your payment receipt (after you pay the bill):" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "file", accept: "image/*,.pdf", onChange: (e) => {
        var _a2;
        return uploadReceipt(((_a2 = e.target.files) == null ? void 0 : _a2[0]) ?? null);
      }, className: "text-sm" }),
      uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-amber-600", children: "⏳ Uploading..." }),
      receiptUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-teal-600 flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5" }),
        " Receipt uploaded"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          type: "button",
          size: "sm",
          className: "w-full bg-teal-600 hover:bg-teal-700 text-white",
          disabled: closing || uploading,
          onClick: async () => {
            setClosing(true);
            await onClose(c, receiptUrl);
            setClosing(false);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
            " Approve & Mark as Paid"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Reason for returning this Pay & Close request", value: reason, onChange: (e) => setReason(e.target.value), rows: 2, className: "text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", className: "w-full text-red-600 border-red-300", disabled: closing || uploading, onClick: async () => {
        setClosing(true);
        await onReject(c, reason);
        setClosing(false);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 mr-1" }),
        " Reject / Return to Review"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Pay the institute, upload the receipt, then close. The seeker sees the receipt and gets a thank-you notification." })
    ] })
  ] });
}
function ResolutionHistoryCard({ r, c, profileMap }) {
  const status = normalizedResolutionStatus(r);
  const isRejected = status === "rejected" || status === "disputed";
  const isContribution = isContributionResolution(r);
  const cur = (c == null ? void 0 : c.currency) || r.currency || "USD";
  const amount = Number(r.seeker_confirmed_amount ?? r.amount_paid ?? r.amount ?? 0);
  const helper = profileMap[r.hero_id];
  const seeker = profileMap[r.seeker_id];
  const label = isRejected ? "REJECTED" : "APPROVED / COMPLETED";
  const labelClass = isRejected ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: (c == null ? void 0 : c.title) || (isContribution ? "Contribution" : "Direct payment") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-1 text-xs font-semibold ${labelClass}`, children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1 text-sm text-muted-foreground sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Case ID:" }),
        " ",
        r.case_id || "—"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Category:" }),
        " ",
        (c == null ? void 0 : c.category) || r.case_category || "—"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Helper:" }),
        " ",
        (helper == null ? void 0 : helper.full_name) || r.hero_name || r.hero_id || "—"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Seeker:" }),
        " ",
        (seeker == null ? void 0 : seeker.full_name) || r.seeker_name || r.seeker_id || "—"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Payment type:" }),
        " ",
        isContribution ? "Contribution to Givethra" : "Direct Help to provider"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Amount:" }),
        " ",
        sym(cur),
        " ",
        amount.toLocaleString(),
        " ",
        cur
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Transaction ID:" }),
        " ",
        r.transaction_id || "—"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-foreground", children: "Completed:" }),
        " ",
        r.completed_at || r.admin_confirmed_at ? new Date(r.completed_at || r.admin_confirmed_at).toLocaleDateString() : "—"
      ] })
    ] }),
    isRejected && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700", children: [
      "Rejection reason: ",
      r.rejection_reason || r.notes || "Not provided"
    ] }),
    r.receipt_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: r.receipt_url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-primary text-sm font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
      " View payment receipt"
    ] })
  ] });
}
function VerifyCard({ r, c, profileMap, onConfirm, onReject }) {
  var _a, _b;
  const [rejectionReason, setRejectionReason] = reactExports.useState("");
  const cur = (c == null ? void 0 : c.currency) || "USD";
  const s = sym(cur);
  const helper = profileMap[r.hero_id];
  const seeker = profileMap[r.seeker_id];
  const confirmedAmt = r.seeker_confirmed_amount ?? r.amount_paid;
  const amountNeeded = Number((c == null ? void 0 : c.amount_needed) ?? 0);
  const collected = Number((c == null ? void 0 : c.amount_collected) ?? 0);
  const afterThis = collected + Number(confirmedAmt ?? 0);
  const isFundraising = r.paid_to === "givethra";
  const willClose = !isFundraising && amountNeeded > 0 && afterThis >= amountNeeded;
  const goalReached = amountNeeded > 0 && afterThis >= amountNeeded;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border-2 border-primary/30 bg-card p-4 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700", children: "AWAITING VERIFICATION" }),
      isFundraising ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary", children: "FUNDRAISING (paid to Givethra)" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700", children: "DIRECT (paid to institute)" }),
      c && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-muted px-2 py-0.5 rounded-full", children: c.category })
    ] }),
    c && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: c.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 border border-border p-2.5 text-xs space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Helper:" }),
        " ",
        (helper == null ? void 0 : helper.full_name) || "—",
        " · ",
        (helper == null ? void 0 : helper.email) || ((_a = r.hero_id) == null ? void 0 : _a.slice(0, 8))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Seeker:" }),
        " ",
        (seeker == null ? void 0 : seeker.full_name) || "—",
        " · ",
        (seeker == null ? void 0 : seeker.email) || ((_b = r.seeker_id) == null ? void 0 : _b.slice(0, 8))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Type:" }),
        " ",
        r.resolution_type
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Amount:" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-primary", children: [
          s,
          " ",
          confirmedAmt,
          " ",
          cur
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "TXN ID:" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: r.transaction_id })
      ] }),
      r.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Notes:" }),
        " ",
        r.notes
      ] })
    ] }),
    r.receipt_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: r.receipt_url, target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center gap-1 text-primary text-sm font-medium", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
      " View Payment Receipt"
    ] }),
    amountNeeded > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-primary/5 border border-primary/20 p-2.5 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Goal ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          s,
          " ",
          amountNeeded
        ] }),
        " · collected ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          s,
          " ",
          collected
        ] }),
        " → after this ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          s,
          " ",
          afterThis
        ] })
      ] }),
      isFundraising ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5", children: goalReached ? "→ Goal reached! Go to 'Pay & Close' after verifying ✅" : `→ ${s} ${amountNeeded - afterThis} still needed (keeps fundraising)` }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5", children: willClose ? "→ Case will COMPLETE ✅" : `→ ${s} ${amountNeeded - afterThis} remaining (stays open)` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { "aria-label": "Rejection reason", placeholder: "Rejection reason (required when rejecting)", value: rejectionReason, onChange: (e) => setRejectionReason(e.target.value), rows: 2, className: "text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", className: "w-full sm:flex-1 bg-teal-600 hover:bg-teal-700 text-white", onClick: () => onConfirm(r), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-3.5 w-3.5 mr-1" }),
          " Verify & Add ",
          s,
          " ",
          confirmedAmt
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", size: "sm", variant: "outline", className: "w-full sm:w-auto text-red-600 border-red-300", disabled: !rejectionReason.trim(), onClick: () => onReject(r, rejectionReason), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-3.5 w-3.5 mr-1" }),
          " Reject Proof"
        ] })
      ] }),
      !rejectionReason.trim() && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Add a clear reason before rejecting this payment proof." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
      "⚠️ Check the receipt before verifying. ",
      isFundraising ? "This money came to Givethra — you'll pay the institute once the goal is reached." : "This was paid directly to the institute."
    ] })
  ] });
}
function NotifyPanel({ profiles, kycList, caseList }) {
  const [group, setGroup] = reactExports.useState("all");
  const [title, setTitle] = reactExports.useState("");
  const [message, setMessage] = reactExports.useState("");
  const [link, setLink] = reactExports.useState("/");
  const [sending, setSending] = reactExports.useState(false);
  const kycByUser = {};
  for (const k of kycList) {
    if (!(k.user_id in kycByUser)) kycByUser[k.user_id] = k.status;
  }
  const caseCountByUser = {};
  for (const c of caseList) {
    if (["pending", "approved", "completed"].includes(c.status)) {
      caseCountByUser[c.user_id] = (caseCountByUser[c.user_id] ?? 0) + 1;
    }
  }
  function targetUsers() {
    const all = profiles.map((p) => p.user_id).filter(Boolean);
    if (group === "all") return all;
    if (group === "no_kyc") return all.filter((uid) => kycByUser[uid] !== "approved");
    if (group === "kyc_no_case") return all.filter((uid) => kycByUser[uid] === "approved" && !caseCountByUser[uid]);
    if (group === "kyc_approved") return all.filter((uid) => kycByUser[uid] === "approved");
    if (group === "submitted_case") return all.filter((uid) => (caseCountByUser[uid] ?? 0) > 0);
    return all;
  }
  const count = targetUsers().length;
  const GROUPS = [
    { key: "all", label: "All Users", desc: "Everyone who signed up" },
    { key: "no_kyc", label: "No KYC yet", desc: "Signed up but not verified" },
    { key: "kyc_no_case", label: "KYC done, no case", desc: "Verified but haven't submitted their free case" },
    { key: "kyc_approved", label: "All Verified", desc: "Everyone verified" },
    { key: "submitted_case", label: "Submitted a case", desc: "Users who already submitted a case" }
  ];
  const TEMPLATES = [
    { label: "Do your KYC", title: "Complete your KYC ✅", msg: "You're almost there! Complete your identity verification (KYC) to unlock Givethra. Tap here to finish.", link: "/kyc" },
    { label: "Submit free case", title: "Your First Case is FREE 🎉", msg: "Your KYC is approved! Now submit your first case completely FREE — no fee. Tap here to start.", link: "/submit-request" },
    { label: "Become a Hero", title: "Become a Hero 🤲", msg: "You can help someone in need — directly or by contributing any amount. Tap here to help.", link: "/cases" },
    { label: "Unlock Suspended", title: "Unlock Your Account 🔓", msg: "Your account is suspended. Deposit 5 credits and unlock your account to continue using Givethra.", link: "/submit-request" }
  ];
  async function send() {
    if (!title.trim() || !message.trim()) {
      ue.error("Please enter title and message");
      return;
    }
    const users = targetUsers();
    if (users.length === 0) {
      ue.error("No users in this group");
      return;
    }
    if (!confirm(`Send this notification to ${users.length} user(s)?`)) return;
    setSending(true);
    try {
      const result = await adminBroadcastNotification({
        user_ids: users,
        type: "admin_broadcast",
        title: title.trim(),
        message: message.trim(),
        link: link || "/"
      });
      const sent = Number((result == null ? void 0 : result.sent) || 0);
      const failed = Number((result == null ? void 0 : result.failed) || 0);
      if (failed > 0) ue.error(`Sent to ${sent} user(s); ${failed} could not be reached.`);
      else ue.success(`Sent to ${sent} user(s).`);
      if (sent > 0) {
        setTitle("");
        setMessage("");
      }
    } catch (error) {
      ue.error(error instanceof Error ? error.message : "Notification could not be sent.");
    } finally {
      setSending(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Megaphone, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Send a Givethra notification to a group of users. It appears in their notification bell and opens the page you choose." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase text-muted-foreground", children: "Quick fill (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: TEMPLATES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => {
            setTitle(t.title);
            setMessage(t.msg);
            setLink(t.link);
          },
          className: "text-xs border border-border rounded-full px-3 py-1.5 hover:bg-muted",
          children: t.label
        },
        t.label
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase text-muted-foreground", children: "Send to" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: GROUPS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setGroup(g.key),
          className: `w-full text-left rounded-xl border p-3 transition-colors ${group === g.key ? "border-primary bg-primary/5" : "border-border"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: g.label }),
              group === g.key && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-4 w-4 text-primary" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: g.desc })
          ]
        },
        g.key
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold uppercase text-muted-foreground", children: "Title" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: title, onChange: (e) => setTitle(e.target.value), placeholder: "e.g. Your First Case is FREE 🎉" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold uppercase text-muted-foreground", children: "Message" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: message, onChange: (e) => setMessage(e.target.value), rows: 3, placeholder: "Write your message..." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold uppercase text-muted-foreground", children: "When tapped, go to" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: link, onChange: (e) => setLink(e.target.value), className: "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "/", children: "Home" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "/kyc", children: "KYC page" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "/submit-request", children: "Submit a case" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "/cases", children: "Browse cases (Heroes)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "/wallet", children: "Wallet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "/my-cases", children: "My Cases" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full h-11 font-semibold", disabled: sending, onClick: send, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4 mr-2" }),
      sending ? "Sending..." : `Send to ${count} user(s)`
    ] })
  ] });
}
function OffersPanel({ offers, onReload }) {
  const offerMap = {};
  for (const o of offers) offerMap[o.category] = o;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border bg-primary/5 p-4 text-sm text-muted-foreground flex items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Turn on a free-listing offer for any category. (Note: every user's FIRST case is always free, separate from this.)" })
    ] }),
    ALL_CATEGORIES.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(OfferRow, { category: cat, offer: offerMap[cat], onReload }, cat))
  ] });
}
function OfferRow({ category, offer, onReload }) {
  const [active, setActive] = reactExports.useState((offer == null ? void 0 : offer.is_active) ?? false);
  const [limit, setLimit] = reactExports.useState(String((offer == null ? void 0 : offer.free_limit) ?? 50));
  const [label, setLabel] = reactExports.useState((offer == null ? void 0 : offer.label) ?? "");
  const [saving, setSaving] = reactExports.useState(false);
  const used = (offer == null ? void 0 : offer.used_count) ?? 0;
  reactExports.useEffect(() => {
    setActive((offer == null ? void 0 : offer.is_active) ?? false);
    setLimit(String((offer == null ? void 0 : offer.free_limit) ?? 50));
    setLabel((offer == null ? void 0 : offer.label) ?? "");
  }, [offer]);
  async function save(newActive) {
    setSaving(true);
    try {
      await adminUpsertCategoryOffer({ category, is_active: newActive, free_limit: parseInt(limit) || 0, label: label || null, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
      setActive(newActive);
      ue.success(newActive ? `Offer ON for ${category}` : `Offer OFF for ${category}`);
      onReload();
    } catch {
      ue.error("Failed to save offer.");
    } finally {
      setSaving(false);
    }
  }
  async function saveSettings() {
    setSaving(true);
    try {
      await adminUpsertCategoryOffer({ category, is_active: active, free_limit: parseInt(limit) || 0, label: label || null, updated_at: (/* @__PURE__ */ new Date()).toISOString() });
      ue.success(`Saved settings for ${category}`);
      onReload();
    } catch {
      ue.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-4 space-y-3 ${active ? "border-teal-300 bg-teal-50/50 dark:bg-teal-950/10" : "bg-card"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm", children: category }),
        offer && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          used,
          " / ",
          offer.free_limit,
          " free used"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", disabled: saving, className: active ? "bg-teal-600 hover:bg-teal-700 text-white" : "", variant: active ? "default" : "outline", onClick: () => save(!active), children: active ? "Offer ON" : "Offer OFF" })
    ] }),
    active && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 pt-1 border-t border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground", children: "Free limit (1–100)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", max: "100", value: limit, onChange: (e) => setLimit(e.target.value), className: "h-9" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground", children: "Label (e.g. Muharram)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: label, onChange: (e) => setLabel(e.target.value), placeholder: "Muharram Offer", className: "h-9" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "w-full", disabled: saving, onClick: saveSettings, children: "Save Settings" })
    ] })
  ] });
}
function SupportPanel({ allMsgs, profileMap, onNewMessage, unreadCount }) {
  const [activeUser, setActiveUser] = reactExports.useState(null);
  const [reply, setReply] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const [attachmentFile, setAttachmentFile] = reactExports.useState(null);
  const [attachmentPreview, setAttachmentPreview] = reactExports.useState(null);
  const [liveMsgs, setLiveMsgs] = reactExports.useState(allMsgs);
  const textareaRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    setLiveMsgs(allMsgs);
  }, [allMsgs]);
  reactExports.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [reply]);
  const byUser = {};
  for (const m of liveMsgs) {
    if (!byUser[m.user_id]) byUser[m.user_id] = [];
    byUser[m.user_id].push(m);
  }
  const conversations = Object.keys(byUser).map((uid) => {
    const msgs = byUser[uid];
    const last = msgs[msgs.length - 1];
    const unread = msgs.filter((m) => m.sender === "user" && !m.is_read).length;
    const p = profileMap[uid];
    return { uid, name: (p == null ? void 0 : p.full_name) || "Unknown", email: (p == null ? void 0 : p.email) || uid.slice(0, 8), last, unread, count: msgs.length };
  }).sort((a, b) => {
    var _a, _b;
    return new Date(((_a = b.last) == null ? void 0 : _a.created_at) ?? 0).getTime() - new Date(((_b = a.last) == null ? void 0 : _b.created_at) ?? 0).getTime();
  });
  async function openChat(uid) {
    setActiveUser(uid);
    try {
      await adminMarkSupportMessagesAsRead(uid);
      setLiveMsgs((prev) => prev.map((m) => m.user_id === uid && m.sender === "user" ? { ...m, is_read: true } : m));
      if (onNewMessage) onNewMessage();
    } catch (error) {
      console.error("Failed to mark support messages read:", error);
      ue.error("Conversation opened, but unread status could not be updated.");
    }
  }
  async function uploadAttachment(file) {
    const path = `support_attachments/${Date.now()}_${file.name}`;
    const url = await uploadFileToStorage(file, path);
    return url;
  }
  function handleFileSelect(event) {
    var _a;
    const file = (_a = event.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      ue.error("File too large! Maximum 10MB allowed.");
      return;
    }
    setAttachmentFile(file);
    setAttachmentPreview(URL.createObjectURL(file));
    ue.success(`📎 ${file.name} selected`);
  }
  function removeAttachment() {
    setAttachmentFile(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
  async function sendReply() {
    if (!reply.trim() && !attachmentFile || !activeUser) return;
    setSending(true);
    try {
      let attachmentUrl = "";
      if (attachmentFile) {
        try {
          attachmentUrl = await uploadAttachment(attachmentFile);
        } catch {
          ue.error("Failed to upload attachment");
          setSending(false);
          return;
        }
      }
      const newMsg = await adminSendSupportReply({
        user_id: activeUser,
        message: reply.trim() || null,
        attachment_url: attachmentUrl || null
      });
      setLiveMsgs((prev) => [...prev, newMsg]);
      await Promise.resolve(onNewMessage == null ? void 0 : onNewMessage());
      setReply("");
      setAttachmentFile(null);
      setAttachmentPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      ue.success("Reply sent!");
    } catch (err) {
      ue.error("Failed to send reply.");
      console.error(err);
    } finally {
      setSending(false);
    }
  }
  if (activeUser) {
    const msgs = byUser[activeUser] ?? [];
    const conv = conversations.find((c) => c.uid === activeUser);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border bg-card flex flex-col", style: { height: "70vh" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 p-3 border-b border-border bg-muted/20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setActiveUser(null);
          if (onNewMessage) onNewMessage();
        }, className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm truncate", children: conv == null ? void 0 : conv.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: conv == null ? void 0 : conv.email })
        ] }),
        conv && conv.unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-red-500 text-white text-xs px-2 py-0.5 rounded-full", children: [
          conv.unread,
          " new"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 bg-muted/10", children: msgs.map((m) => {
        const isAdmin = m.sender === "admin";
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${isAdmin ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[80%] rounded-2xl px-4 py-2.5 text-sm break-words ${isAdmin ? "bg-primary text-white rounded-br-sm" : "bg-white border border-border rounded-bl-sm"}`, children: [
          m.message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "whitespace-pre-wrap leading-relaxed", children: m.message }),
          m.attachment_url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: m.attachment_url.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: m.attachment_url, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: m.attachment_url, alt: "Attachment", className: "max-w-full max-h-48 rounded-lg border" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: m.attachment_url, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-1 text-xs underline bg-primary/10 px-2 py-1 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3" }),
            " View Attachment"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-[10px] mt-1 ${isAdmin ? "text-white/70" : "text-muted-foreground"}`, children: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) })
        ] }) }, m.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 p-3 border-t border-border bg-card", children: [
        attachmentPreview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-muted/50 rounded-lg p-2", children: [
          (attachmentFile == null ? void 0 : attachmentFile.type.startsWith("image/")) ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: attachmentPreview, alt: "Attachment preview", className: "h-10 w-10 rounded object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-8 w-8 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs flex-1 truncate", children: attachmentFile == null ? void 0 : attachmentFile.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: removeAttachment, className: "text-red-500 hover:text-red-700", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              ref: textareaRef,
              value: reply,
              onChange: (e) => setReply(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendReply();
                }
              },
              placeholder: "Type your reply... (Shift+Enter for new line)",
              className: "flex-1 min-h-[44px] max-h-[200px] resize-none overflow-y-auto",
              rows: 1
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileSelect, className: "hidden", accept: "image/*,.pdf,.doc,.docx,.txt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "icon", className: "h-11 w-11 shrink-0 text-muted-foreground hover:text-primary", onClick: () => {
              var _a;
              return (_a = fileInputRef.current) == null ? void 0 : _a.click();
            }, disabled: sending, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Paperclip, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: sendReply, disabled: sending || !reply.trim() && !attachmentFile, size: "icon", className: "shrink-0 rounded-full h-11 w-11", children: sending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Supported: Images, PDF, DOC, TXT (max 10MB)" }),
          attachmentFile && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-teal-600", children: [
            "📎 ",
            attachmentFile.name
          ] })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: conversations.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: "No support messages yet" }) : conversations.map((c) => {
    var _a, _b;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => openChat(c.uid),
        className: "w-full flex items-center justify-between gap-3 rounded-xl border bg-card p-4 hover:bg-muted/30 transition-colors text-left",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0", children: (((_a = c.name) == null ? void 0 : _a[0]) ?? "U").toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-sm truncate", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground truncate", children: ((_b = c.last) == null ? void 0 : _b.message) || "📎 Attachment" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-1 shrink-0", children: [
            c.unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-red-500 text-white text-[10px] rounded-full px-2 py-0.5 font-bold", children: [
              c.unread,
              " new"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: c.last ? new Date(c.last.created_at).toLocaleDateString() : "" })
          ] })
        ]
      },
      c.uid
    );
  }) });
}
function Empty({ text }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardCheck, { className: "h-10 w-10 mx-auto opacity-30 mb-2" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: text })
  ] });
}
function StatusBadge({ status }) {
  const c = { pending: "bg-orange-100 text-orange-700", approved: "bg-teal-100 text-teal-700", rejected: "bg-red-100 text-red-700", completed: "bg-blue-100 text-blue-700", expired: "bg-gray-300 text-gray-700", none: "bg-gray-100 text-gray-600" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full ${c[status] ?? "bg-gray-100"}`, children: status === "none" ? "NO KYC" : status == null ? void 0 : status.toUpperCase() });
}
function Stat({ icon, label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-card border border-border p-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-muted-foreground mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide", children: label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-foreground capitalize", children: value })
  ] });
}
function DetailRow({ label, value, mono }) {
  if (!value) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-medium break-all ${mono ? "font-mono" : ""}`, children: value })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => copyText(value),
        className: "shrink-0 h-7 w-7 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-primary",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3 w-3" })
      }
    )
  ] });
}
function Img({ url, label }) {
  let displayLabel = label;
  try {
    const urlObj = new URL(url);
    const key = urlObj.searchParams.get("key");
    if (key) {
      const parts = key.split("/");
      const lastPart = parts[parts.length - 1];
      if (lastPart) {
        let name = decodeURIComponent(lastPart).replace(/^[0-9]+[-_]/, "").replace(/^[a-f0-9]{8,}[-_]/, "");
        if (name && name.length > 0 && name !== "null") {
          displayLabel = name;
        }
      }
    }
  } catch {
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-medium text-muted-foreground truncate", title: displayLabel, children: [
      "📎 ",
      displayLabel
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, target: "_blank", rel: "noopener noreferrer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: displayLabel, className: "w-full rounded border max-h-24 object-cover" }) })
  ] });
}
function DepositSearchBox({ deposits, onApprove, onReject, profileMap = {}, cnicByUser = {} }) {
  const [search, setSearch] = reactExports.useState("");
  const filtered = search.trim() ? deposits.filter((d) => {
    const q = search.trim().toLowerCase();
    const p = profileMap[d.user_id] || {};
    return [d.id, d.user_id, d.transaction_id, d.amount, d.credits, p.full_name, p.email, cnicByUser[d.user_id]].some((value) => String(value || "").toLowerCase().includes(q));
  }) : deposits;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search deposits by user ID or transaction ID...", value: search, onChange: (e) => setSearch(e.target.value), className: "pl-9 h-11" })
    ] }),
    filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { text: "No matching deposits" }) : filtered.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(DepositCard, { d, onApprove, onReject }, d.id))
  ] });
}
function BookOpen({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" }) });
}
export {
  AdminPage as default
};
