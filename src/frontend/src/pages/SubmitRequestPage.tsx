// src/frontend/src/pages/SubmitRequestPage.tsx
// Premium UI + Fully Global + 60s Video Lock + 100% No Pakistan-specific labels.

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { COUNTRIES } from "@/lib/countries";
import { getCountryProfile, scaleFromPKR, isPhoneValid, CURRENCY_CODES, CURRENCY_SYMBOLS } from "@/lib/countryProfiles";
import {
  getKycStatus, getWallet, getUserSettings, getCasesByUser, getUserSuspension, upsertUserSuspension,
  getCategoryOffer, getOfferClaimCount, insertOfferClaim, updateCategoryOfferUsage, getCaseCounts,
  getFeedbacks, insertCaseSubmission, uploadFileToStorage,
} from "@/lib/api";
import { sendNotification } from "@/lib/notify";
import { getCategoryConfig } from "@/lib/categoryFields";
import { ELECTRICITY_APPLIANCES, ELECTRICITY_MAX_ELIGIBLE_UNITS, normalizeElectricityAppliances } from "./submit-request/electricity";
import { EMPLOYMENT_OPTIONS } from "./submit-request/employment";
import { ELECTRICITY_COMPANIES, GAS_COMPANIES, WATER_COMPANIES, EDUCATION_INSTITUTES, HEALTH_INSTITUTES, EDUCATION_REF_HINT, HEALTH_REF_HINT } from "@/lib/institutesList";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Camera, AlertCircle, Languages, Info, Gift, CheckCircle2, Search, ShieldAlert, ShieldCheck,
  Wallet, MapPin, Phone, Building2, Calculator, Heart, Lock, Globe, FileText, UploadCloud,
  Briefcase, ChevronRight, Check, Video, Square, Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { checkCreditGate } from "@/lib/creditGate";

const CATEGORY_LIMITS: Record<string, { type: "fixed" | "verified" | "max" | "debt_percentage"; amount?: number; minAmount?: number; maxAmount?: number; percentage?: number; label: string; }> = {
  "Widow & Elderly Support": { type: "fixed", amount: 3000, label: "Fixed Stipend" },
  "Child Support": { type: "fixed", amount: 2000, label: "Fixed Stipend" },
  "Orphan Support": { type: "fixed", amount: 3000, label: "Fixed Orphan Support" },
  "Disability Support": { type: "fixed", amount: 3000, label: "Fixed Stipend" },
  "Food & Groceries": { type: "fixed", amount: 6000, label: "Fixed amount per family" },
  "Electricity Bill": { type: "verified", label: "1 Month Verified Bill" },
  "Gas Bill": { type: "verified", label: "1 Month Verified Bill" },
  "Water Bill": { type: "verified", label: "1 Month Verified Bill" },
  "House Rent": { type: "verified", label: "1 Month Verified Rent" },
  "School, College & University Fees": { type: "verified", label: "1 Student / 1 Month Verified Fee" },
  "Education, Books & Admission": { type: "verified", label: "Admission: manual amount · Books/Uniform: fixed amount" },
  "Medicines": { type: "fixed", amount: 3000, label: "Fixed Medicine Help" },
  "Medical & Treatment": { type: "verified", label: "Verified Treatment Bill" },
  "Home Repair": { type: "fixed", amount: 10000, label: "Fixed Home Repair Help" },
  "Debt Relief": { type: "debt_percentage", percentage: 5, maxAmount: 25000, label: "5% of debt (capped)" },
  "Business / Work Help": { type: "fixed", amount: 10000, label: "Fixed Business / Work Help" },
  "Marriage Support": { type: "max", minAmount: 1000, maxAmount: 30000, label: "One selected marriage item (capped)" },
  "Funeral Expenses": { type: "fixed", amount: 5000, label: "Fixed Funeral Help" },
  "Livestock / Farming": { type: "fixed", amount: 10000, label: "Fixed Farming Help" },
  "Emergency Help": { type: "fixed", amount: 3000, label: "Fixed Emergency Help" },
};

const CATEGORIES = ["Electricity Bill", "Gas Bill", "Water Bill", "House Rent", "School, College & University Fees", "Education, Books & Admission", "Medical & Treatment", "Medicines", "Food & Groceries", "Child Support", "Orphan Support", "Widow & Elderly Support", "Disability Support", "Marriage Support", "Business / Work Help", "Home Repair", "Funeral Expenses", "Livestock / Farming", "Debt Relief", "Emergency Help"];
const STEPS = ["Basic Info", "Category Details", "Verification", "Review"];
const CASE_CURRENCIES = CURRENCY_CODES;
const SS_KEY = "givethra_submit_draft_v4";

const MAX_REJECTIONS_BEFORE_SUSPENSION = 5;
const UNLOCK_CREDITS_REQUIRED = 5;
const MAX_FREE_CASES = 2;

const UTILITY_CATS: Record<string, { companies: { name: string; ref: string; refHint: string }[] }> = {
  "Electricity Bill": { companies: ELECTRICITY_COMPANIES },
  "Gas Bill": { companies: GAS_COMPANIES },
  "Water Bill": { companies: WATER_COMPANIES },
};

const EDUCATION_SUB_OPTIONS = [{ value: "admission", label: "🎓 Admission Fee" }, { value: "books", label: "📚 Books / Study Materials" }, { value: "uniform", label: "👕 Uniform / Shoes" }];
const FEE_SUB_OPTIONS = [{ value: "school", label: "🏫 School Fee" }, { value: "college", label: "🎓 College Fee" }, { value: "university", label: "🏛️ University Fee" }];

const EDUCATION_ADMISSION_FIELDS = {
  School: [{ key: "institute_name", label: "School Name", required: true, placeholder: "Full name of the school" }, { key: "class_grade", label: "Class / Grade", required: true, placeholder: "e.g. Grade 8" }, { key: "admission_type", label: "Admission Type", required: true, choices: ["New Admission", "Re-admission", "Transfer"] }, { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed"] }],
  College: [{ key: "institute_name", label: "College Name", required: true, placeholder: "Full name of the college" }, { key: "program", label: "Program / Class", required: true, choices: ["High School / Secondary", "Pre-university (A-Level, FA/FSc, etc.)", "Diploma / Vocational", "Other"] }, { key: "year", label: "Year", required: true, choices: ["1st Year", "2nd Year", "Other"] }, { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed"] }],
  University: [{ key: "institute_name", label: "University Name", required: true, placeholder: "Full name of the university" }, { key: "program_degree", label: "Program / Degree", required: true, placeholder: "e.g. BS Psychology" }, { key: "semester_year", label: "Semester / Year", required: true, placeholder: "e.g. Fall 2026" }, { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed", "Waiting List"] }],
};

const EDUCATION_FEE_FIELDS = {
  School: [{ key: "institute_name", label: "School Name", required: true, placeholder: "Full name of the school" }, { key: "class_grade", label: "Class / Grade", required: true, placeholder: "e.g. Grade 8" }, { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" }],
  College: [{ key: "institute_name", label: "College Name", required: true, placeholder: "Full name of the college" }, { key: "program", label: "Program / Class", required: true, choices: ["High School / Secondary", "Pre-university (A-Level, FA/FSc, etc.)", "Diploma / Vocational", "Other"] }, { key: "year", label: "Year", required: true, choices: ["1st Year", "2nd Year", "Other"] }, { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" }],
  University: [{ key: "institute_name", label: "University Name", required: true, placeholder: "Full name of the university" }, { key: "program_degree", label: "Program / Degree", required: true, placeholder: "e.g. BS Psychology" }, { key: "semester_year", label: "Semester / Year", required: true, placeholder: "e.g. Fall 2026" }, { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" }],
};

function getEducationDocs(type: string, subType: string) {
  const docs: { key: string; label: string; required: boolean; hint?: string }[] = [];
  if (type === "admission") {
    docs.push({ key: "admission_proof", label: "Admission / Selection Proof (Offer Letter / Acceptance Letter / Merit List)", required: true, hint: "Clear photo of offer letter or merit list" });
    docs.push({ key: "fee_challan", label: "Fee Invoice / Challan / Voucher (with amount & due date)", required: true, hint: "Challan should clearly show amount and due date" });
    docs.push({ key: "student_id_proof", label: "Student ID proof (school ID, birth certificate or national ID)", required: true, hint: "Clear proof of student identity" });
  } else if (type === "fee") {
    docs.push({ key: "fee_challan", label: "Fee Invoice / Challan / Voucher (with amount & due date)", required: true, hint: "Challan should clearly show amount and due date" });
    docs.push({ key: "student_id_proof", label: "Student ID proof (school ID, birth certificate or national ID)", required: true, hint: "Clear proof of student identity" });
  } else if (type === "books") {
    docs.push({ key: "books_quotation", label: "Books List / Quotation from Shop", required: true, hint: "Clear photo of book list and price quotation" });
    docs.push({ key: "student_id_proof", label: "Student ID proof (school/college ID or birth certificate)", required: true, hint: "Student identity proof" });
  } else if (type === "uniform") {
    docs.push({ key: "uniform_quotation", label: "Uniform List / Quotation from Shop", required: true, hint: "Clear photo of uniform items and price quotation" });
    docs.push({ key: "student_id_proof", label: "Student ID proof (school/college ID or birth certificate)", required: true, hint: "Student identity proof" });
    docs.push({ key: "uniform_items", label: "Items Needed (List photo or written)", required: true, hint: "List of uniform items (shoes, bag, winter uniform etc.)" });
  }
  return docs;
}

const PAYMENT_RECEIVER_CATS = new Set(["House Rent", "Food & Groceries", "Medicines", "Home Repair", "Debt Relief", "Business / Work Help", "Marriage Support", "Funeral Expenses", "Livestock / Farming", "Emergency Help", "Other"]);

const LIST_CATS: Record<string, any> = {
  "School, College & University Fees": {
    list: EDUCATION_INSTITUTES, refLabel: "Fee Challan / Voucher Number", refHint: EDUCATION_REF_HINT,
    personFields: [{ key: "student_name", label: "Student's Name (ONE student)", required: true, placeholder: "Full name of student" }, { key: "father_name", label: "Father's Name", required: true, placeholder: "Father's full name" }, { key: "roll_no", label: "Roll No / Registration No", required: true, placeholder: "Student's roll number" }],
    billLabel: "Fee Challan / Voucher Photo", isEducationCategory: true, subOptions: FEE_SUB_OPTIONS,
    getSubFields: (subType: string) => subType === "school" ? EDUCATION_FEE_FIELDS.School : subType === "college" ? EDUCATION_FEE_FIELDS.College : subType === "university" ? EDUCATION_FEE_FIELDS.University : [],
    getSubDocs: (subType: string) => getEducationDocs("fee", subType),
  },
  "Education, Books & Admission": {
    list: EDUCATION_INSTITUTES, refLabel: "Challan / Reference Number", refHint: "If available, enter the challan or quotation reference number",
    personFields: [{ key: "student_name", label: "Student's Name (ONE student)", required: true, placeholder: "Full name of student" }, { key: "student_class", label: "Class / Grade / Program", required: true, placeholder: "e.g. Grade 8, FA, BS" }],
    billLabel: "Bill / Challan / Quotation Photo", isEducationCategory: true, subOptions: EDUCATION_SUB_OPTIONS,
    getSubFields: (subType: string, subValue: string) => {
      if (subType === "admission") {
        if (subValue === "School") return EDUCATION_ADMISSION_FIELDS.School;
        if (subValue === "College") return EDUCATION_ADMISSION_FIELDS.College;
        if (subValue === "University") return EDUCATION_ADMISSION_FIELDS.University;
      }
      return [];
    },
    getSubDocs: (subType: string, subValue: string) => getEducationDocs(subType, subValue),
  },
  "Medical & Treatment": {
    list: HEALTH_INSTITUTES, refLabel: "Bill / Invoice / MR Number", refHint: HEALTH_REF_HINT,
    personFields: [{ key: "patient_name", label: "Patient's Name (ONE patient)", required: true, placeholder: "Full name of patient" }, { key: "illness", label: "Illness / Treatment Needed", required: true, placeholder: "Brief description of illness" }],
    billLabel: "Hospital Bill / Medical Receipt Photo",
  },
  "Medicines": {
    list: HEALTH_INSTITUTES, refLabel: "Invoice / Prescription Number (if any)", refHint: HEALTH_REF_HINT,
    personFields: [{ key: "patient_name", label: "Patient's Name (ONE patient)", required: true, placeholder: "Full name of patient" }, { key: "illness", label: "Illness / Condition", required: true, placeholder: "Brief description of condition" }],
    billLabel: "Prescription / Medicine Estimate Photo",
    extraDocs: [{ key: "doctor_report", label: "Doctor's Report / Prescription", required: true, hint: "Clear photo of the doctor's written report or prescription" }],
  },
};

function isEasyCat(cat: string) { return !!UTILITY_CATS[cat] || !!LIST_CATS[cat]; }
const DISABILITY_STIPEND_AMOUNT = 3000;
const PROPERTY_RELEVANT_CATS = new Set(["Electricity Bill", "Gas Bill", "Water Bill", "House Rent", "Food & Groceries"]);
const PERSONAL_PAYMENT_CATS = new Set(["House Rent", "Marriage Support", "Business / Work Help", "Home Repair", "Funeral Expenses", "Livestock / Farming", "Debt Relief", "Emergency Help", "Other", "Food & Groceries", "Medicines"]);
const FIXED_STIPEND_CATS = new Set(["Child Support", "Orphan Support", "Widow & Elderly Support", "Disability Support"]);
const SKIP_FIELDS = new Set(["provider_name", "provider_contact", "landlord_name", "landlord_contact", "creditor_name", "creditor_contact", "receiver_name", "receiver_contact"]);

function getCategoryLimit(category: string) { return CATEGORY_LIMITS[category] || null; }
function isFixedAmountCategory(category: string): boolean { return getCategoryLimit(category)?.type === "fixed"; }
function getFixedAmount(category: string, currency = "PKR"): number | null { const limit = getCategoryLimit(category); return limit?.type === "fixed" && limit.amount ? scaleFromPKR(limit.amount, currency) : null; }
function getMaxAmount(category: string, currency = "PKR"): number | null { const limit = getCategoryLimit(category); if ((limit?.type === "max" || limit?.type === "debt_percentage") && limit.maxAmount) return scaleFromPKR(limit.maxAmount, currency); return null; }
function getMinAmount(category: string, currency = "PKR"): number | null { const min = getCategoryLimit(category)?.minAmount; return min ? scaleFromPKR(min, currency) : null; }
function isDebtPercentageCategory(category: string): boolean { return getCategoryLimit(category)?.type === "debt_percentage"; }
function calculateDebtAmount(debtTotal: number, currency = "PKR"): number {
  const limit = CATEGORY_LIMITS["Debt Relief"];
  if (!limit || limit.type !== "debt_percentage") return 0;
  const percentage = limit.percentage || 5;
  const maxAmount = scaleFromPKR(limit.maxAmount || 25000, currency);
  return Math.min((debtTotal * percentage) / 100, maxAmount);
}
function urgencyFromDue(due: string): string {
  if (!due) return "";
  const days = Math.ceil((new Date(due).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 31) return "Emergency";
  if (days <= 62) return "Medium";
  return "Low";
}

function saveDraft(data: any) { try { sessionStorage.setItem(SS_KEY, JSON.stringify(data)); } catch {} }
function loadDraft(): any { try { const s = sessionStorage.getItem(SS_KEY); return s ? JSON.parse(s) : null; } catch { return null; } }
function clearDraft() { try { sessionStorage.removeItem(SS_KEY); } catch {} }

const YES_NO_FIELDS = new Set(["job_status", "wife_status"]);
const COUNTER_FIELDS = new Set(["sons", "daughters"]);
const CHOICE_FIELDS: Record<string, string[]> = {
  parents_status: ["Both alive", "Father passed away", "Mother passed away", "Both passed away"],
  support_type: ["One-time help", "Monthly support"],
  disability_type: ["Physical", "Visual", "Hearing", "Intellectual", "Other"],
  relation: ["My daughter", "My son", "My sister", "My brother", "Myself", "Other relative"],
  deceased_relation: ["My father", "My mother", "My husband", "My wife", "My child", "Other relative"],
  pay_to_type: ["Shopkeeper", "Person", "Organization / Institute"],
};
const GENDER_OPTIONS = ["Male", "Female", "Child"];
const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Widow", "Divorced"];

export default function SubmitRequestPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("PKR");

  const [userRejectionCount, setUserRejectionCount] = useState(0);
  const [userTotalCases, setUserTotalCases] = useState(0);
  const [userFreeCasesUsed, setUserFreeCasesUsed] = useState(0);
  const [isFreeDisabled, setIsFreeDisabled] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionCount, setSuspensionCount] = useState(0);
  const [loadingUserStats, setLoadingUserStats] = useState(true);
  const [unlocking, setUnlocking] = useState(false);

  const [tried1, setTried1] = useState(false);
  const [tried2, setTried2] = useState(false);

  const [category, setCategory] = useState(() => { try { const value = localStorage.getItem("givethra_prefill_category") || ""; localStorage.removeItem("givethra_prefill_category"); return value; } catch { return ""; } });
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [urgency, setUrgency] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [debtTotalAmount, setDebtTotalAmount] = useState("");
  const [calculatedDebtAmount, setCalculatedDebtAmount] = useState(0);
  const [deadline, setDeadline] = useState("");

  const [instituteName, setInstituteName] = useState("");
  const [instituteSearch, setInstituteSearch] = useState("");
  const [isOtherInstituteState, setIsOtherInstitute] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [otherAddress, setOtherAddress] = useState("");
  const [refNumber, setRefNumber] = useState("");

  const [jobStatus, setJobStatus] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female" | "Child" | "">("");
  const [maritalStatus, setMaritalStatus] = useState<"Single" | "Married" | "Widow" | "Divorced" | "">("");
  const [isOrphan, setIsOrphan] = useState<"Yes" | "No" | "">("");
  const [orphanParent, setOrphanParent] = useState<"Father" | "Mother" | "Both" | "">("");

  const [seekerName, setSeekerName] = useState("");
  const [seekerContact, setSeekerContact] = useState("");

  const [receiverName, setReceiverName] = useState("");
  const [receiverContact, setReceiverContact] = useState("");
  const [receiverBank, setReceiverBank] = useState("");
  const [receiverAccount, setReceiverAccount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverShopName, setReceiverShopName] = useState("");

  const [disabilityMode, setDisabilityMode] = useState<"product" | "treatment" | "stipend" | "">("");
  const [disabilityShopName, setDisabilityShopName] = useState("");
  const [disabilityShopContact, setDisabilityShopContact] = useState("");
  const [disabilityHospital, setDisabilityHospital] = useState("");
  const [disabilityHospitalSearch, setDisabilityHospitalSearch] = useState("");
  const [disabilityHospitalOther, setDisabilityHospitalOther] = useState(false);
  const [disabilityBankTitle, setDisabilityBankTitle] = useState("");
  const [disabilityBankNumber, setDisabilityBankNumber] = useState("");
  const [treatmentAmount, setTreatmentAmount] = useState("");
  const [treatmentExpiry, setTreatmentExpiry] = useState("");
  const [treatmentPatientNumber, setTreatmentPatientNumber] = useState("");
  const [disabilityType, setDisabilityType] = useState("");
  const [disabilityReason, setDisabilityReason] = useState("");

  const [eduSubType, setEduSubType] = useState<"admission" | "books" | "uniform" | "school" | "college" | "university" | "">("");
  const [eduAdmissionLevel, setEduAdmissionLevel] = useState<"School" | "College" | "University" | "">("");
  const [eduSubFields, setEduSubFields] = useState<Record<string, string>>({});

  const [propertyOwnership, setPropertyOwnership] = useState<"owned" | "rented" | "">("");
  const [catFields, setCatFields] = useState<Record<string, any>>({});
  const [catDocUrls, setCatDocUrls] = useState<Record<string, string>>({});
  const [catDocNames, setCatDocNames] = useState<Record<string, string>>({});
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const [selfieUrl, setSelfieUrl] = useState("");
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [uploadingSelfie, setUploadingSelfie] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [cameraOn, setCameraOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [videoRecording, setVideoRecording] = useState(false);
  const [videoTimer, setVideoTimer] = useState(0);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoTimerRef = useRef(0);
  const videoStartTimeRef = useRef<number | null>(null);

  const [offer, setOffer] = useState<any>(null);
  const [hasClaimedOfferBefore, setHasClaimedOfferBefore] = useState(false);
  const [activeCaseCount, setActiveCaseCount] = useState(0);
  const [restored, setRestored] = useState(false);
  const [blockedByFeedback, setBlockedByFeedback] = useState<{ caseId: string; caseTitle: string } | null>(null);
  const [checkingFeedback, setCheckingFeedback] = useState(true);

  const easy = isEasyCat(category);
  const profile = getCountryProfile(country);
  const localLists = profile.hasLocalProviderLists;
  const unitCap = localLists ? ELECTRICITY_MAX_ELIGIBLE_UNITS : null;
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  const money = (n: number | null | undefined) => `${sym} ${Number(n ?? 0).toLocaleString()}`;
  const stipendAmount = scaleFromPKR(DISABILITY_STIPEND_AMOUNT, currency);
  const capDebt = scaleFromPKR(25000, currency);
  const isOtherInstitute = isOtherInstituteState || (easy && !localLists && !!country);
  const utilCompanies = localLists ? UTILITY_CATS[category]?.companies ?? [] : [];
  const utilityNoun = category === "Electricity Bill" ? "electricity" : category === "Gas Bill" ? "gas" : "water";
  const utilCfg = UTILITY_CATS[category];
  const listCfg = LIST_CATS[category];
  const config = category && !easy ? getCategoryConfig(category) : null;
  const cfgFields = config?.fields ?? [];
  const cfgDocs = config?.documents ?? [];
  const cfgGuide = config?.guide ?? [];
  const cfgOneCase = config?.oneCaseNote ?? "";

  const selectedCompany = utilCfg?.companies.find((c) => c.name === instituteName);
  const autoUrgency = easy ? urgencyFromDue(deadline) : "";
  const treatmentAutoUrgency = treatmentExpiry ? urgencyFromDue(treatmentExpiry) : "";

  const isEducationCategory = category === "Education, Books & Admission" || category === "School, College & University Fees";
  const needsPaymentReceiver = PAYMENT_RECEIVER_CATS.has(category);

  const canUseFreeCase = () => { if (isSuspended || isFreeDisabled) return false; return userFreeCasesUsed < MAX_FREE_CASES; };
  const hasFixedStipend = () => { if (category === "Disability Support" && disabilityMode === "stipend") return true; if (FIXED_STIPEND_CATS.has(category)) return true; return false; };
  const shouldShowPaymentReceiver = () => { return PERSONAL_PAYMENT_CATS.has(category) && !hasFixedStipend(); };

  const isFixedAmount = (cat: string) => {
    if (cat === "Disability Support" && disabilityMode === "stipend") return true;
    if (cat === "Education, Books & Admission" && ["books", "uniform"].includes(eduSubType)) return true;
    return isFixedAmountCategory(cat);
  };
  const getFixedAmountValue = (cat: string): number | null => {
    if (cat === "Disability Support" && disabilityMode === "stipend") return stipendAmount;
    if (cat === "Education, Books & Admission" && ["books", "uniform"].includes(eduSubType)) return scaleFromPKR(3000, currency);
    return getFixedAmount(cat, currency);
  };
  const getMaxLimit = (cat: string): number | null => getMaxAmount(cat, currency);
  const isDebtCategory = (cat: string): boolean => cat === "Debt Relief";

  useEffect(() => {
    if (isDebtCategory(category) && debtTotalAmount) {
      const total = parseFloat(debtTotalAmount);
      if (!isNaN(total) && total > 0) {
        const calculated = calculateDebtAmount(total, currency);
        setCalculatedDebtAmount(calculated);
        setAmount(calculated.toString());
      } else {
        setCalculatedDebtAmount(0);
        setAmount("");
      }
    }
  }, [debtTotalAmount, category, currency]);

  useEffect(() => {
    if (isFixedAmount(category)) {
      const fixedVal = getFixedAmountValue(category);
      if (fixedVal) setAmount(fixedVal.toString());
    }
  }, [category, disabilityMode, eduSubType, currency]);

  async function loadUserStats() {
    if (!user?.id) { setLoadingUserStats(false); return; }
    setLoadingUserStats(true);
    try {
      const cases = await getCasesByUser(user.id);
      const totalCases = cases?.length || 0;
      const rejectedCases = cases?.filter((c: any) => c.status === "rejected").length || 0;
      const freeCasesUsed = cases?.filter((c: any) => c.was_free === true).length || 0;

      setUserTotalCases(totalCases); setUserRejectionCount(rejectedCases); setUserFreeCasesUsed(freeCasesUsed);

      const lastFreeRejected = cases?.some((c: any) => c.was_free === true && String(c.status || "").toLowerCase() === "rejected") || false;
      const canUseFree = freeCasesUsed === 0 || (freeCasesUsed === 1 && lastFreeRejected);
      const freeDisabled = rejectedCases >= 3 || freeCasesUsed >= MAX_FREE_CASES || !canUseFree;
      setIsFreeDisabled(freeDisabled);

      const suspensionData = await getUserSuspension(user.id);
      if (suspensionData) { setIsSuspended(suspensionData.is_active); setSuspensionCount(suspensionData.suspension_count || 0); }
      else if (rejectedCases >= MAX_REJECTIONS_BEFORE_SUSPENSION) {
        await upsertUserSuspension({ user_id: user.id, suspension_count: 1, is_active: true, suspended_at: new Date().toISOString(), rejection_count_at_suspension: rejectedCases });
        setIsSuspended(true); setSuspensionCount(1);
      }
    } catch (err) { console.error("Error loading user stats:", err); }
    finally { setLoadingUserStats(false); }
  }

  async function handleUnlockAccount() {
    if (!user?.id) return;
    setUnlocking(true);
    try {
      await upsertUserSuspension({ user_id: user.id, is_active: false });
      setIsSuspended(false); setSuspensionCount(suspensionCount + 1); setUserRejectionCount(0);
      await sendNotification(user.id, "system", "🔓 Account Unlocked", `Your account has been unlocked using ${UNLOCK_CREDITS_REQUIRED} credits.`, "/dashboard");
      toast.success(`✅ Account unlocked! ${UNLOCK_CREDITS_REQUIRED} credits deducted.`);
      await loadUserStats();
    } catch (err) { toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`); }
    finally { setUnlocking(false); }
  }

  function extraConditionalDocs(): { key: string; label: string; hint?: string }[] {
    const list: { key: string; label: string; hint?: string }[] = [];
    if (category === "Child Support") {
      const ps = catFields.parents_status;
      if (ps === "Father passed away" || ps === "Both passed away") list.push({ key: "father_death_cert", label: "Father's Death Certificate", hint: "Required since you selected father as deceased" });
      if (ps === "Mother passed away" || ps === "Both passed away") list.push({ key: "mother_death_cert", label: "Mother's Death Certificate", hint: "Required since you selected mother as deceased" });
    }
    if (category === "Funeral Expenses") {
      const rel = catFields.deceased_relation;
      if (rel === "My husband" || rel === "My wife") list.push({ key: "nikah_nama", label: profile.marriageCertLabel, hint: "Proof of relation to spouse" });
      else if (rel === "My father" || rel === "My mother" || rel === "My child") list.push({ key: "relation_proof", label: "Proof of relation (birth certificate or family registration)", hint: "Proof of relation to parent/child" });
    }
    if (category === "Home Repair" && catFields.contractor_name?.trim()) list.push({ key: "contractor_agreement", label: "Contractor Agreement / Work Order", hint: "If you have a contractor, attach the agreement" });
    if (category === "Marriage Support") {
      if (catFields.relation && catFields.relation !== "Myself") list.push({ key: "relation_proof", label: "Proof of relation (birth certificate or family registration)", hint: "Proof that you are related to the person getting married" });
      list.push({ key: "marriage_quotation", label: "Marriage Expenses Quotation / List", hint: "List of items needed for the marriage" });
    }
    if (category === "Business / Work Help") {
      list.push({ key: "business_quotation", label: "Business Equipment / Supply Quotation", hint: "Quotation for the items needed for business" });
      list.push({ key: "business_proof", label: "Business Proof (License / Registration)", hint: "Proof that you have a business" });
    }
    if (category === "Livestock / Farming") {
      list.push({ key: "livestock_quotation", label: "Livestock / Farming Equipment Quotation", hint: "Quotation for the animals or equipment needed" });
      list.push({ key: "livestock_proof", label: "Proof of Livestock / Farming", hint: "Photo or document showing your livestock/farming" });
    }
    if (gender === "Male") {
      if (maritalStatus === "Single") list.push({ key: "frc", label: profile.familyProofLabel, hint: "Required for single male" });
      if (maritalStatus === "Married") { list.push({ key: "nikah_nama", label: profile.marriageCertLabel, hint: "Required for married male" }); list.push({ key: "frc", label: profile.familyProofLabel, hint: "Required for married male" }); }
      if (maritalStatus === "Widow") { list.push({ key: "wife_death_cert", label: "Wife's Death Certificate", hint: "Required for widow" }); list.push({ key: "nikah_nama", label: `${profile.marriageCertLabel} (from wife)`, hint: "Required" }); list.push({ key: "frc", label: profile.familyProofLabel, hint: "Required" }); }
      if (maritalStatus === "Divorced") { list.push({ key: "divorce_cert", label: "Divorce Certificate (Court issued)", hint: "Required" }); list.push({ key: "nikah_nama", label: `${profile.marriageCertLabel} (from ex-spouse)`, hint: "Required" }); list.push({ key: "frc", label: profile.familyProofLabel, hint: "Required" }); }
    }
    if (gender === "Female") {
      if (maritalStatus === "Single") list.push({ key: "frc", label: profile.familyProofLabel, hint: "Required for single female" });
      if (maritalStatus === "Married") { list.push({ key: "nikah_nama", label: profile.marriageCertLabel, hint: "Required for married female" }); list.push({ key: "frc", label: profile.familyProofLabel, hint: "Required for married female" }); }
      if (maritalStatus === "Widow") { list.push({ key: "husband_death_cert", label: "Husband's Death Certificate", hint: "Required" }); list.push({ key: "nikah_nama", label: `${profile.marriageCertLabel} (from husband)`, hint: "Required" }); list.push({ key: "frc", label: profile.familyProofLabel, hint: "Required" }); }
      if (maritalStatus === "Divorced") { list.push({ key: "divorce_cert", label: "Divorce Certificate (Court issued)", hint: "Required" }); list.push({ key: "nikah_nama", label: `${profile.marriageCertLabel} (from ex-spouse)`, hint: "Required" }); list.push({ key: "frc", label: profile.familyProofLabel, hint: "Required" }); }
      if (isOrphan === "Yes") list.push({ key: "orphan_proof", label: "Orphan Proof (Parent's Death Certificate)", hint: "Required since you selected orphan" });
    }
    if (gender === "Child") {
      if (isOrphan === "Yes") list.push({ key: "orphan_proof", label: "Orphan Proof (Parent's Death Certificate)", hint: "Required" });
      list.push({ key: "b_form", label: profile.childIdLabel, hint: "Required for child" });
      list.push({ key: "frc", label: profile.familyProofLabel, hint: "Required for child" });
    }
    return list;
  }

  useEffect(() => {
    const d = loadDraft();
    if (d && d.category) {
      setStep(Math.min(d.step ?? 1, 4)); setCategory(d.category ?? ""); setTitle(d.title ?? ""); setShortDesc(d.shortDesc ?? ""); setCountry(d.country ?? ""); setCity(d.city ?? ""); setUrgency(d.urgency ?? ""); setDescription(d.description ?? ""); setAmount(d.amount ?? ""); setDebtTotalAmount(d.debtTotalAmount ?? ""); setDeadline(d.deadline ?? ""); setInstituteName(d.instituteName ?? ""); setIsOtherInstitute(d.isOtherInstitute ?? false); setOtherName(d.otherName ?? ""); setOtherContact(d.otherContact ?? ""); setOtherAddress(d.otherAddress ?? ""); setRefNumber(d.refNumber ?? ""); setJobStatus(d.jobStatus ?? ""); setGender(d.gender ?? ""); setMaritalStatus(d.maritalStatus ?? ""); setIsOrphan(d.isOrphan ?? ""); setOrphanParent(d.orphanParent ?? ""); setSeekerName(d.seekerName ?? ""); setSeekerContact(d.seekerContact ?? ""); setReceiverName(d.receiverName ?? ""); setReceiverContact(d.receiverContact ?? ""); setReceiverBank(d.receiverBank ?? ""); setReceiverAccount(d.receiverAccount ?? ""); setReceiverAddress(d.receiverAddress ?? ""); setReceiverShopName(d.receiverShopName ?? ""); setCatFields(d.catFields ?? {}); setCatDocUrls(d.catDocUrls ?? {}); setCatDocNames(d.catDocNames ?? {}); setSelfieUrl(d.selfieUrl ?? ""); setSelfiePreview(d.selfieUrl || null); setVideoUrl(d.videoUrl ?? ""); setVideoPreview(d.videoUrl || null);
      if (d.eduSubType) setEduSubType(d.eduSubType); if (d.eduAdmissionLevel) setEduAdmissionLevel(d.eduAdmissionLevel); if (d.eduSubFields) setEduSubFields(d.eduSubFields); if (d.currency) setCurrency(d.currency); if (d.propertyOwnership) setPropertyOwnership(d.propertyOwnership); if (d.disabilityMode) setDisabilityMode(d.disabilityMode); if (d.disabilityShopName) setDisabilityShopName(d.disabilityShopName); if (d.disabilityShopContact) setDisabilityShopContact(d.disabilityShopContact); if (d.disabilityHospital) setDisabilityHospital(d.disabilityHospital); if (d.disabilityHospitalOther) setDisabilityHospitalOther(d.disabilityHospitalOther); if (d.disabilityBankTitle) setDisabilityBankTitle(d.disabilityBankTitle); if (d.disabilityBankNumber) setDisabilityBankNumber(d.disabilityBankNumber); if (d.treatmentAmount) setTreatmentAmount(d.treatmentAmount); if (d.treatmentExpiry) setTreatmentExpiry(d.treatmentExpiry); if (d.treatmentPatientNumber) setTreatmentPatientNumber(d.treatmentPatientNumber); if (d.disabilityType) setDisabilityType(d.disabilityType); if (d.disabilityReason) setDisabilityReason(d.disabilityReason);
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    saveDraft({ step, category, title, shortDesc, country, city, urgency, description, amount, debtTotalAmount, deadline, instituteName, isOtherInstitute, otherName, otherContact, otherAddress, refNumber, jobStatus, gender, maritalStatus, isOrphan, orphanParent, seekerName, seekerContact, receiverName, receiverContact, receiverBank, receiverAccount, receiverAddress, receiverShopName, catFields, catDocUrls, catDocNames, selfieUrl, videoUrl, currency, propertyOwnership, disabilityMode, disabilityShopName, disabilityShopContact, disabilityHospital, disabilityHospitalOther, disabilityBankTitle, disabilityBankNumber, treatmentAmount, treatmentExpiry, treatmentPatientNumber, disabilityType, disabilityReason, eduSubType, eduAdmissionLevel, eduSubFields });
  }, [restored, step, category, title, shortDesc, country, city, urgency, description, amount, debtTotalAmount, deadline, instituteName, isOtherInstitute, otherName, otherContact, otherAddress, refNumber, jobStatus, gender, maritalStatus, isOrphan, orphanParent, seekerName, seekerContact, receiverName, receiverContact, receiverBank, receiverAccount, receiverAddress, receiverShopName, catFields, catDocUrls, catDocNames, selfieUrl, videoUrl, currency, propertyOwnership, disabilityMode, disabilityShopName, disabilityShopContact, disabilityHospital, disabilityHospitalOther, disabilityBankTitle, disabilityBankNumber, treatmentAmount, treatmentExpiry, treatmentPatientNumber, disabilityType, disabilityReason, eduSubType, eduAdmissionLevel, eduSubFields]);

  useEffect(() => { if (restored && step >= 2 && !category) setStep(1); }, [restored, step, category]);
  useEffect(() => { if (!isAuthenticated) { navigate({ to: "/sign-in" }); return; } if (user?.id) { loadData(); checkPendingFeedback(); loadUserStats(); } }, [isAuthenticated, user]);
  useEffect(() => { return () => { if (stream) stream.getTracks().forEach((t) => t.stop()); }; }, [stream]);
  useEffect(() => { if (!category || !user?.id) { setOffer(null); return; } checkOffer(category); }, [category, user]);

  async function checkOffer(cat: string) { if (!user?.id) return; const off = await getCategoryOffer(cat); setOffer(off ?? null); const count = await getOfferClaimCount(user.id); setHasClaimedOfferBefore((count ?? 0) > 0); }

  const isFirstCaseFree = canUseFreeCase();
  const offerApplies = !!offer && offer.is_active && (offer.used_count ?? 0) < (offer.free_limit ?? 0) && !hasClaimedOfferBefore && canUseFreeCase();
  const willBeFree = offerApplies || isFirstCaseFree;

  async function checkPendingFeedback() {
    if (!user?.id) { setCheckingFeedback(false); return; }
    setCheckingFeedback(true);
    try {
      const cases = await getCasesByUser(user.id);
      const completedCases = cases?.filter((c: any) => c.status === "completed") || [];
      if (completedCases.length > 0) {
        const feedbackRows = await getFeedbacks(200);
        const feedbackList = Array.isArray(feedbackRows) ? feedbackRows : (Array.isArray((feedbackRows as any)?.data) ? (feedbackRows as any).data : []);
        const now = Date.now();
        const overdue = completedCases.find((completed: any) => {
          const completedAt = new Date(String(completed.completed_at || completed.updated_at || completed.created_at || "")).getTime();
          if (!Number.isFinite(completedAt) || now - completedAt < 24 * 60 * 60 * 1000) return false;
          const caseId = String(completed.id);
          const submitted = feedbackList.some((feedback: any) => String(feedback.case_id) === caseId && String(feedback.user_id) === String(user.id) && ["pending_review", "approved"].includes(String(feedback.status || "").toLowerCase()));
          return !submitted;
        });
        setBlockedByFeedback(overdue ? { caseId: String(overdue.id), caseTitle: String(overdue.title || "your completed case") } : null);
      } else setBlockedByFeedback(null);
    } catch (err) { setBlockedByFeedback(null); } finally { setCheckingFeedback(false); }
  }

  async function loadData() {
    if (!user?.id) { setKycLoading(false); return; }
    setKycLoading(true);
    try {
      const kyc = await getKycStatus(user.id); setKycStatus(kyc?.status ?? null);
      const wallet = await getWallet(user.id); setBalance(wallet?.balance ?? 0);
      const settings = await getUserSettings(user.id); if (settings?.currency && settings.currency !== "USD") setCurrency(settings.currency);
      const counts = await getCaseCounts(user.id); setActiveCaseCount((counts?.pending || 0) + (counts?.approved || 0) + (counts?.completed || 0));
    } catch (err) {} finally { setKycLoading(false); }
  }

  async function uploadFile(file: File, path: string): Promise<string> {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 48) throw new Error(`File size (${fileSizeMB.toFixed(1)}MB) exceeds 50MB limit.`);
    try { return await uploadFileToStorage(file, path); } catch (error: any) {
      if (error.message.includes("limit") || error.message.includes("size")) throw new Error(`File too large: ${fileSizeMB.toFixed(1)}MB`);
      throw new Error(error.message);
    }
  }

  async function handleDocSelect(key: string, file: File | null) {
    if (!file) return;
    setUploadingDoc(key);
    try {
      const url = await uploadFile(file, `cases/${user?.id}/${Date.now()}_${key}`);
      setCatDocUrls((p) => ({ ...p, [key]: url })); setCatDocNames((p) => ({ ...p, [key]: file.name })); toast.success("Uploaded ✓");
    } catch {
      toast.error("Upload failed — please attach again.");
      setCatDocUrls((p) => { const n = { ...p }; delete n[key]; return n; });
      setCatDocNames((p) => { const n = { ...p }; delete n[key]; return n; });
    } finally { setUploadingDoc(null); }
  }

  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(s); setCameraOn(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 100);
    } catch { toast.error("Camera access denied."); }
  }

  async function takeSelfie() {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current; canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        stream?.getTracks().forEach((t) => t.stop()); setCameraOn(false); setSelfiePreview(canvas.toDataURL("image/jpeg")); setUploadingSelfie(true);
        try {
          const url = await uploadFile(new File([blob], "selfie.jpg", { type: "image/jpeg" }), `cases/${user?.id}/${Date.now()}_selfie.jpg`);
          setSelfieUrl(url);
        } catch { toast.error("Selfie upload failed — retake please."); setSelfiePreview(null); } finally { setUploadingSelfie(false); }
      }
    }, "image/jpeg");
  }

  async function startVideoRecording() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices(); const hasCamera = devices.some((d) => d.kind === "videoinput");
      if (!hasCamera) { toast.error("No camera found on your device."); return; }
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } }, audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1, sampleRate: 44100 } });
      setStream(s); setVideoRecording(true); setVideoTimer(0); videoTimerRef.current = 0; videoStartTimeRef.current = Date.now();
      setTimeout(() => { if (liveVideoRef.current) { liveVideoRef.current.srcObject = s; liveVideoRef.current.onloadedmetadata = () => { liveVideoRef.current?.play().catch(() => {}); }; } }, 50);
      
      const preferredMime = "video/webm;codecs=vp9,opus"; const fallbackMime = "video/webm;codecs=vp8,opus";
      const recorder = new MediaRecorder(s, { mimeType: MediaRecorder.isTypeSupported(preferredMime) ? preferredMime : fallbackMime, videoBitsPerSecond: 2200000, audioBitsPerSecond: 128000 });
      mediaRecorderRef.current = recorder; videoChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) videoChunksRef.current.push(e.data); };
      
      recorder.onstop = async () => {
        const wallClockSeconds = videoStartTimeRef.current ? Math.floor((Date.now() - videoStartTimeRef.current) / 1000) : 0;
        const estimate = Math.max(videoTimerRef.current, wallClockSeconds, videoTimer);
        videoStartTimeRef.current = null;
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        let actualDuration = estimate;
        try {
          actualDuration = await new Promise<number>((resolve) => {
            const v = document.createElement("video"); v.preload = "metadata";
            const timeout = setTimeout(() => resolve(estimate), 3000);
            v.onloadedmetadata = () => { clearTimeout(timeout); const dur = Math.floor(v.duration) || estimate; URL.revokeObjectURL(v.src); resolve(dur); };
            v.onerror = () => { clearTimeout(timeout); URL.revokeObjectURL(v.src); resolve(estimate); };
            v.src = URL.createObjectURL(blob);
          });
        } catch { actualDuration = estimate; }

        if (actualDuration < 60) {
          toast.error(`Please record at least 60 seconds. Current: ${actualDuration}s`);
          setVideoRecording(false); setUploadingVideo(false); s.getTracks().forEach((t) => t.stop()); videoChunksRef.current = []; videoTimerRef.current = 0; setVideoTimer(0); return;
        }
        const fileSizeMB = blob.size / (1024 * 1024);
        if (fileSizeMB > 48) {
          toast.error(`Video is ${fileSizeMB.toFixed(1)}MB (max 50MB). Please record shorter video.`);
          setVideoPreview(URL.createObjectURL(blob)); setUploadingVideo(false); setVideoRecording(false); s.getTracks().forEach((t) => t.stop()); return;
        }
        s.getTracks().forEach((t) => t.stop()); setVideoRecording(false); setVideoPreview(URL.createObjectURL(blob)); setUploadingVideo(true);
        try {
          const url = await uploadFile(new File([blob], "appeal.webm", { type: "video/webm" }), `cases/${user?.id}/${Date.now()}_appeal.webm`);
          setVideoUrl(url); toast.success(`Video uploaded successfully! (${fileSizeMB.toFixed(1)}MB, ${actualDuration}s)`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          toast.error(`Video upload failed: ${msg}`); setVideoPreview(null);
        } finally { setUploadingVideo(false); }
      };
      recorder.start(1000);
      let sec = 0;
      const interval = setInterval(() => {
        sec++; setVideoTimer(sec); videoTimerRef.current = sec;
        if (sec >= 90) { clearInterval(interval); if (recorder.state === "recording") recorder.stop(); toast.info("Recording stopped at 90 seconds."); }
      }, 1000);
      (window as any)._videoInterval = interval;
    } catch (err) { toast.error("Camera/microphone access denied. Please allow permissions and try again."); }
  }

  function stopVideoRecording() {
    if (videoTimerRef.current < 60) {
      toast.error("You must record for at least 60 seconds before stopping.");
      return;
    }
    if (videoStartTimeRef.current) { const wallClockSeconds = Math.floor((Date.now() - videoStartTimeRef.current) / 1000); videoTimerRef.current = Math.max(videoTimerRef.current, wallClockSeconds); }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") mediaRecorderRef.current.stop();
    if ((window as any)._videoInterval) clearInterval((window as any)._videoInterval);
  }

  function getReceiverLabel(): string {
    const labels: Record<string, string> = { "House Rent": "Landlord", "Food & Groceries": "Shop Owner", "Medicines": "Pharmacy / Shop Owner", "Home Repair": "Contractor / Material Shop", "Debt Relief": "Creditor", "Business / Work Help": "Business Owner / Supplier", "Marriage Support": "Marriage Vendor", "Funeral Expenses": "Funeral Service Provider", "Livestock / Farming": "Supplier / Farm Owner", "Emergency Help": "Emergency Recipient", "Other": "Recipient" };
    return labels[category] || "Payment Receiver";
  }

  function validateStep2(): string | null {
    if (!jobStatus) return "Please select your current source of income.";
    const employmentOption = EMPLOYMENT_OPTIONS.find((option) => option.value === jobStatus);
    const employmentKeyMap: Record<string, string> = { salarySlipUrl: "salary_slip", statementUrl: "statement", businessProofUrl: "business_proof", professionProofUrl: "profession_proof", supportDeclarationUrl: "support_declaration", pensionProofUrl: "pension_proof", previousIncomeProofUrl: "previous_income_proof" };
    const missingEmploymentDoc = employmentOption?.documents.find((document) => document.required && !catDocUrls[employmentKeyMap[document.key]]);
    if (missingEmploymentDoc) return `Please attach: ${missingEmploymentDoc.label}.`;
    if (!gender) return "Please select the gender (Male/Female/Child).";
    if (gender === "Male" || gender === "Female") if (!maritalStatus) return "Please select marital status (Single/Married/Widow/Divorced).";
    if (gender === "Female") { if (!isOrphan) return "Please select: Are you an orphan?"; if (isOrphan === "Yes" && !orphanParent) return "Please select which parent passed away."; }
    if (gender === "Child") if (!isOrphan) return "Please select: Is this child an orphan?";
    if (!seekerName.trim()) return "Please enter your full name.";
    if (!seekerContact.trim()) return "Please enter your contact number.";
    if (!isPhoneValid(seekerContact)) return "Please enter a valid phone number with country code.";
    if (needsPaymentReceiver) {
      if (!receiverName.trim()) return `Please enter the ${getReceiverLabel()} name.`;
      if (!receiverContact.trim()) return `Please enter the ${getReceiverLabel()} contact number.`;
      if (!receiverBank.trim()) return `Please enter the ${getReceiverLabel()} bank name.`;
      if (!receiverAccount.trim()) return `Please enter the ${getReceiverLabel()} account number.`;
      if (!receiverAddress.trim()) return `Please enter the ${getReceiverLabel()} address / shop address.`;
      if (category === "Food & Groceries" || category === "Medicines" || category === "Home Repair") if (!receiverShopName.trim()) return `Please enter the shop name.`;
    }
    if (category === "Disability Support") {
      if (!catDocUrls["disability_cnic"]) return "Please attach the disability ID or certificate.";
      if (!catDocUrls["disability_photo"]) return "Please attach a clear photo of the disability.";
      if (!disabilityType) return "Please select the type of disability.";
      if (!disabilityMode) return "Please choose: Product, Treatment, or Monthly Stipend.";
      if (disabilityMode === "product") { if (!disabilityShopName.trim() || !disabilityShopContact.trim()) return "Please enter the shop's name and contact number."; if (!catDocUrls["product_receipt"]) return "Please attach the shop's quotation/receipt."; }
      if (disabilityMode === "treatment") { if (!disabilityHospital.trim() && !disabilityHospitalOther) return "Please select the hospital."; if (disabilityHospitalOther && !disabilityHospital.trim()) return "Please enter the hospital name."; if (!treatmentAmount.trim() || parseFloat(treatmentAmount) <= 0) return "Please enter the treatment amount."; if (!treatmentExpiry) return "Please select the bill expiry date."; if (!treatmentPatientNumber.trim()) return "Please enter the patient / bill number."; }
      if (disabilityMode === "stipend") if (!disabilityBankTitle.trim() || !disabilityBankNumber.trim()) return "Please enter your bank/account title and number.";
    }
    if (isEducationCategory && listCfg) {
      if (!eduSubType) return "Please select what you need help with.";
      for (const f of listCfg.personFields) if (f.required && !(catFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
      if (category === "Education, Books & Admission" && eduSubType === "admission") {
        if (!eduAdmissionLevel) return "Please select School, College, or University for admission.";
        const subFields = listCfg.getSubFields?.(eduSubType, eduAdmissionLevel) || [];
        for (const f of subFields) if (f.required && !(eduSubFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
      }
      if (category === "School, College & University Fees") {
        const subFields = listCfg.getSubFields?.(eduSubType, "") || [];
        for (const f of subFields) if (f.required && !(eduSubFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
      }
      if (isOtherInstitute) { if (!otherName.trim()) return "Please enter the institute name."; if (!otherContact.trim()) return "Please enter the institute contact number."; if (!otherAddress.trim()) return "Please enter the institute address (city, area, street)."; }
      let subDocs: { key: string; label: string; required: boolean; hint?: string }[] = [];
      if (category === "Education, Books & Admission") subDocs = listCfg.getSubDocs?.(eduSubType, eduSubType === "admission" ? eduAdmissionLevel : "") || [];
      else if (category === "School, College & University Fees") subDocs = listCfg.getSubDocs?.(eduSubType, "") || [];
      for (const doc of subDocs) if (doc.required && !catDocUrls[doc.key]) return `Please attach: ${doc.label}`;
      if (!catDocUrls["student_id_proof"] && !catDocUrls["student_id"]) { const hasStudentId = subDocs.some((d) => d.key === "student_id_proof" || d.key === "student_id"); if (!hasStudentId) if (!catDocUrls["student_id"]) return "Please attach the student's ID proof."; }
      if (!isFixedAmount(category)) { if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed."; const maxLimit = getMaxLimit(category); if (maxLimit && parseFloat(amount) > maxLimit) return `Amount cannot exceed ${sym} ${maxLimit.toLocaleString()}.`; }
      if (!deadline) return "Please select the expiry date.";
      return null;
    }
    if (easy) {
      const selectedInstitute = (instituteName || catFields.institute_name || "").trim();
      if (!isOtherInstitute && !selectedInstitute) return "Please select your institute/company from the list.";
      if (isOtherInstitute) { if (!otherName.trim()) return "Please enter the institute name."; if (!otherContact.trim()) return "Please enter the institute contact number."; if (!otherAddress.trim()) return "Please enter the institute address (city, area, street)."; }
      if (utilCfg) {
        if (!refNumber.trim()) return `Please enter your ${selectedCompany?.ref ?? "Consumer/Reference Number"}.`;
        if (!(catFields.bill_owner_name || "").trim()) return "Please enter the bill owner name as it appears on the bill.";
        if (["Electricity Bill", "Gas Bill", "Water Bill"].includes(category)) {
          const units = Number(catFields.monthly_units);
          if (!Number.isFinite(units) || units < 1) return `Please enter monthly ${utilityNoun} usage in units.`;
          if (unitCap !== null && units > unitCap) return `You are not eligible for this help request because usage is above ${unitCap} units.`;
          if (category === "Electricity Bill" && Object.keys(normalizeElectricityAppliances(catFields.appliances)).length === 0) return "Please select at least one appliance and its quantity.";
        }
      }
      if (listCfg && !isEducationCategory) {
        for (const f of listCfg.personFields) if (f.required && !(catFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
        if (listCfg.extraDocs) for (const doc of listCfg.extraDocs) if (doc.required && !catDocUrls[doc.key]) return `Please attach: ${doc.label}`;
      }
      if (!catDocUrls["bill"]) return "Please attach the bill/challan photo.";
      if (category === "Medical & Treatment" && !catDocUrls["doctor_prescription"]) return "Please attach the Doctor's written prescription/report.";
      if (!isFixedAmount(category)) {
        if (isDebtCategory(category)) { if (!debtTotalAmount.trim() || parseFloat(debtTotalAmount) <= 0) return "Please enter your total outstanding debt amount."; if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter your total outstanding debt amount to calculate 5%."; }
        else { if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed."; const maxLimit = getMaxLimit(category); if (maxLimit && parseFloat(amount) > maxLimit) return `Amount cannot exceed ${sym} ${maxLimit.toLocaleString()}.`; }
      }
    }
    if (!easy && config && category !== "Disability Support" && !isEducationCategory) {
      for (const f of cfgFields) { if (f.key === "job_status") continue; if (SKIP_FIELDS.has(f.key)) continue; if (f.required && !(catFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`; }
      for (const d of cfgDocs) { if (d.key === "salary_slip" || d.key === "statement") continue; if (d.required && !catDocUrls[d.key]) return `Please attach: ${d.label}`; }
      for (const d of extraConditionalDocs()) if (!catDocUrls[d.key]) return `Please attach: ${d.label}`;
      if (!isFixedAmount(category)) {
        if (isDebtCategory(category)) { if (!debtTotalAmount.trim() || parseFloat(debtTotalAmount) <= 0) return "Please enter your total outstanding debt amount."; if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter your total outstanding debt amount to calculate 5%."; }
        else { if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed."; const minLimit = getMinAmount(category, currency); if (minLimit && parseFloat(amount) < minLimit) return `Amount must be at least ${sym} ${minLimit.toLocaleString()}.`; const maxLimit = getMaxLimit(category); if (maxLimit && parseFloat(amount) > maxLimit) return `Amount cannot exceed ${sym} ${maxLimit.toLocaleString()}.`; }
      }
    }
    if (!description.trim()) return "Please explain your situation.";
    if (!isFixedAmount(category) && !isEducationCategory) if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed.";
    if (!deadline) return "Please select the expiry date.";
    if (PROPERTY_RELEVANT_CATS.has(category) && !isEducationCategory) {
      if (!propertyOwnership) return "Please select property ownership (Owned or Rented).";
      if (propertyOwnership === "rented") { if (!catDocUrls["rental_agreement"]) return "Please attach the Rental Agreement."; if (!catDocUrls["landlord_cnic"]) return "Please attach the landlord's ID."; }
      if (propertyOwnership === "owned") { if (!catFields.owner_relation) return "Please select whose name the house is in."; if (!catDocUrls["owner_cnic"]) return "Please attach the owner's ID."; }
    }
    return null;
  }

  async function handleSubmit() {
    if (!confirmed) { toast.error("You must agree to the Terms & Conditions."); return; }
    if (!selfieUrl) { toast.error("Please take a live selfie"); return; }
    if (!videoUrl) { toast.error("Please record a video appeal (up to 90 seconds)"); return; }
    if (isSuspended) { toast.error("Your account is suspended. Please unlock it first."); return; }
    if (!user?.id) { toast.error("User not authenticated."); return; }

    setSubmitting(true);
    try {
      const uid = user.id;
      const freshCases = await getCasesByUser(uid);
      const freshRejections = freshCases?.filter((c: any) => c.status === "rejected").length || 0;
      const freshFreeUsed = freshCases?.filter((c: any) => c.was_free === true).length || 0;
      const lastFreeRejected = freshCases?.some((c: any) => c.was_free === true && String(c.status || "").toLowerCase() === "rejected") || false;
      const canUseFree = freshFreeUsed === 0 || (freshFreeUsed === 1 && lastFreeRejected);
      const freeDisabled = freshRejections >= 3 || freshFreeUsed >= MAX_FREE_CASES || !canUseFree;
      const userSuspended = freshRejections >= MAX_REJECTIONS_BEFORE_SUSPENSION;

      if (userSuspended) {
        await upsertUserSuspension({ user_id: uid, suspension_count: suspensionCount + 1, is_active: true, suspended_at: new Date().toISOString(), rejection_count_at_suspension: freshRejections });
        setIsSuspended(true); toast.error("Your account has been suspended due to multiple rejections."); setSubmitting(false); return;
      }

      const firstFree = canUseFree && !freeDisabled;
      let offerFree = false; let currentOffer: any = null;
      if (category && !firstFree) {
        const off = await getCategoryOffer(category); currentOffer = off;
        const claimCount = await getOfferClaimCount(uid);
        offerFree = !!off && off.is_active && (off.used_count ?? 0) < (off.free_limit ?? 0) && (claimCount ?? 0) === 0 && !freeDisabled;
      }
      const free = firstFree || offerFree;

      if (!free) {
        const result = checkCreditGate({ balance, required: 1, isFreeAllowed: false, navigate, context: "case_submit" });
        if (!result) { setSubmitting(false); return; }
      }

      const allDocUrls: Record<string, string> = { ...catDocUrls };
      const photoUrls: string[] = Object.values(allDocUrls);
      const docMeta: Record<string, string> = {};
      Object.keys(allDocUrls).forEach((k) => { docMeta[k] = allDocUrls[k]; });

      const finalInstitute = easy ? (isOtherInstitute ? otherName : (instituteName || catFields.institute_name || "")) : catFields.institute_name || catFields.hospital_name || catFields.provider || catFields.provider_name || catFields.landlord_name || catFields.pharmacy_name || catFields.lender_name || "";
      const finalContact = easy ? (isOtherInstitute ? otherContact : "") : catFields.institute_contact || catFields.hospital_contact || catFields.provider_contact || catFields.landlord_contact || catFields.pharmacy_contact || catFields.lender_contact || "";
      const finalAddress = isOtherInstitute ? otherAddress : catFields.institute_address || "";
      const finalUrgency = easy ? autoUrgency || "Medium" : urgency;

      const categoryDetails: Record<string, any> = {
        ...catFields, _documents: docMeta, property_ownership: propertyOwnership, rental_agreement_url: catDocUrls["rental_agreement"] || "", landlord_cnic_url: catDocUrls["landlord_cnic"] || "", job_status: jobStatus, salary_slip_url: catDocUrls["salary_slip"] || "", statement_url: catDocUrls["statement"] || "", business_proof_url: catDocUrls["business_proof"] || "", profession_proof_url: catDocUrls["profession_proof"] || "", support_declaration_url: catDocUrls["support_declaration"] || "", pension_proof_url: catDocUrls["pension_proof"] || "", previous_income_proof_url: catDocUrls["previous_income_proof"] || "", gender: gender, marital_status: maritalStatus, is_orphan: isOrphan, orphan_parent: orphanParent, seeker_name: seekerName, seeker_contact: seekerContact, institute_name: finalInstitute, institute_contact: finalContact, institute_address: finalAddress, is_institute_in_list: !isOtherInstitute,
      };

      if (needsPaymentReceiver) { categoryDetails.receiver_name = receiverName; categoryDetails.receiver_contact = receiverContact; categoryDetails.receiver_bank = receiverBank; categoryDetails.receiver_account = receiverAccount; categoryDetails.receiver_address = receiverAddress; categoryDetails.receiver_shop_name = receiverShopName; }
      if (isDebtCategory(category)) { categoryDetails.debt_total_amount = parseFloat(debtTotalAmount) || 0; categoryDetails.debt_percentage = 5; categoryDetails.debt_calculated_amount = calculatedDebtAmount; categoryDetails.debt_max_limit = capDebt; }
      if (isEducationCategory) { categoryDetails.edu_sub_type = eduSubType; categoryDetails.edu_sub_fields = eduSubFields; if (eduSubType === "admission") categoryDetails.edu_admission_level = eduAdmissionLevel; categoryDetails.edu_documents = { admission_proof: catDocUrls["admission_proof"] || "", fee_challan: catDocUrls["fee_challan"] || "", student_id_proof: catDocUrls["student_id_proof"] || "", books_quotation: catDocUrls["books_quotation"] || "", uniform_quotation: catDocUrls["uniform_quotation"] || "", uniform_items: catDocUrls["uniform_items"] || "" }; }
      if (shouldShowPaymentReceiver()) { categoryDetails.receiver_name = receiverName; categoryDetails.receiver_contact = receiverContact; categoryDetails.receiver_bank = receiverBank; categoryDetails.receiver_account = receiverAccount; }
      if (category === "Disability Support") {
        categoryDetails.disability_mode = disabilityMode; categoryDetails.disability_shop_name = disabilityShopName; categoryDetails.disability_shop_contact = disabilityShopContact; categoryDetails.disability_hospital = disabilityHospital; categoryDetails.disability_stipend_amount = disabilityMode === "stipend" ? stipendAmount : undefined; categoryDetails.disability_bank_title = disabilityBankTitle; categoryDetails.disability_bank_number = disabilityBankNumber; categoryDetails.disability_type = disabilityType; categoryDetails.disability_reason = disabilityReason;
        if (disabilityMode === "treatment") { categoryDetails.treatment_amount = parseFloat(treatmentAmount); categoryDetails.treatment_expiry = treatmentExpiry; categoryDetails.treatment_patient_number = treatmentPatientNumber; categoryDetails.treatment_urgency = treatmentAutoUrgency; }
      }
      if (easy && !isEducationCategory) { categoryDetails.institute = finalInstitute; categoryDetails.institute_in_list = !isOtherInstitute; categoryDetails.reference_type = utilCfg ? selectedCompany?.ref ?? "Reference" : listCfg?.refLabel ?? "Reference"; categoryDetails.reference_number = refNumber; categoryDetails.due_date = deadline; }

      let finalAmount: number;
      if (isFixedAmount(category)) finalAmount = getFixedAmountValue(category) || 0;
      else if (hasFixedStipend()) finalAmount = stipendAmount;
      else if (isDebtCategory(category)) finalAmount = calculatedDebtAmount;
      else finalAmount = parseFloat(amount) || 0;

      const caseData = { user_id: uid, category, title, short_description: shortDesc, country, city, urgency: finalUrgency, description, amount_needed: finalAmount, currency, why_help: description, deadline: deadline || null, institute_name: finalInstitute, institute_contact: finalContact, institute_address: finalAddress, payment_method: easy ? "1Bill / Direct" : needsPaymentReceiver ? "Direct to Receiver" : "Direct to Provider", account_title: "", account_number: refNumber || "", account_iban: "", category_details: categoryDetails, photo_urls: photoUrls, selfie_url: selfieUrl, video_url: videoUrl, status: "pending", submitted_at: new Date().toISOString(), was_free: free };

      await insertCaseSubmission(caseData);
      await loadUserStats();

      if (firstFree) {
        if (uid) await sendNotification(uid, "system", "Case Submitted FREE 🎉", `Your case "${title}" was submitted FREE and is under review.`, "/my-cases");
        toast.success("🎉 Your case is FREE! Submitted for review.");
      } else if (offerFree && currentOffer) {
        await insertOfferClaim({ user_id: uid, category }); await updateCategoryOfferUsage(category, (currentOffer.used_count ?? 0) + 1);
        if (uid) await sendNotification(uid, "system", "Case Submitted (FREE) 🎉", `Your case "${title}" was submitted FREE!`, "/my-cases");
        toast.success(`🎉 Free under ${currentOffer.label || "offer"}! Case submitted.`);
      } else {
        if (uid) await sendNotification(uid, "system", "Case Submitted ⏳", `Your case "${title}" was submitted and is under review.`, "/my-cases");
        toast.success("Case submitted! 1 credit deducted. Under review.");
      }
      clearDraft(); navigate({ to: "/my-cases" });
    } catch (err) { toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`); } finally { setSubmitting(false); }
  }

  function renderField(f: any) {
    if (YES_NO_FIELDS.has(f.key)) {
      const questionLabel = f.key === "wife_status" ? "Do you have a wife / spouse in this household?" : f.label;
      return (
        <div key={f.key} className="space-y-2">
          <Label className="font-semibold text-slate-700 dark:text-slate-300">{questionLabel} {f.required && <span className="text-red-500">*</span>}</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Yes", "No"].map((opt) => (
              <button key={opt} type="button" onClick={() => setCatFields((p) => ({ ...p, [f.key]: opt }))} className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all ${catFields[f.key] === opt ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300"}`}>{opt}</button>
            ))}
          </div>
        </div>
      );
    }
    if (COUNTER_FIELDS.has(f.key)) {
      const val = parseInt(catFields[f.key] || "0", 10);
      return (
        <div key={f.key} className="space-y-2">
          <Label className="font-semibold text-slate-700 dark:text-slate-300">{f.label}</Label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setCatFields((p) => ({ ...p, [f.key]: String(Math.max(0, val - 1)) }))} className="h-10 w-10 rounded-xl border border-slate-200 font-bold text-lg hover:bg-slate-50">−</button>
            <span className="w-10 text-center font-bold text-lg">{val}</span>
            <button type="button" onClick={() => setCatFields((p) => ({ ...p, [f.key]: String(Math.min(15, val + 1)) }))} className="h-10 w-10 rounded-xl border border-slate-200 font-bold text-lg hover:bg-slate-50">+</button>
          </div>
        </div>
      );
    }
    if (f.choices || CHOICE_FIELDS[f.key]) {
      const opts = f.choices || CHOICE_FIELDS[f.key];
      return (
        <div key={f.key} className="space-y-2">
          <Label className="font-semibold text-slate-700 dark:text-slate-300">{f.label} {f.required && <span className="text-red-500">*</span>}</Label>
          <div className="grid grid-cols-2 gap-2">
            {opts.map((opt: string) => (
              <button key={opt} type="button" onClick={() => setCatFields((p) => ({ ...p, [f.key]: opt }))} className={`px-3 py-3 rounded-xl border text-xs font-bold text-left transition-all ${catFields[f.key] === opt ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300"}`}>{opt}</button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div key={f.key} className="space-y-2">
        <Label className="font-semibold text-slate-700 dark:text-slate-300">{f.label} {f.required && <span className="text-red-500">*</span>}</Label>
        {f.type === "textarea" ? (
          <Textarea value={catFields[f.key] ?? ""} onChange={(e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} rows={3} className="rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-teal-500" />
        ) : (
          <Input type={f.type === "number" ? "number" : "text"} value={catFields[f.key] ?? ""} onChange={(e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-teal-500" />
        )}
      </div>
    );
  }

  const filteredInstitutes = listCfg && localLists ? listCfg.list.filter((n: string) => n.toLowerCase().includes(instituteSearch.toLowerCase())).slice(0, 8) : [];

  const docBox = (key: string, label: string, required: boolean, hint?: string, accept = "image/*,.pdf") => {
    const isUploaded = !!catDocUrls[key];
    const isUploading = uploadingDoc === key;
    return (
      <div className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${isUploaded ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20" : "border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800"}`}>
        <label className="flex flex-col items-center justify-center p-5 cursor-pointer">
          <input type="file" accept={accept} onChange={(e) => handleDocSelect(key, e.target.files?.[0] ?? null)} className="hidden" />
          <div className={`flex h-12 w-12 items-center justify-center rounded-full mb-3 transition-colors ${isUploaded ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50" : "bg-white text-slate-400 shadow-sm dark:bg-slate-800"}`}>
            {isUploaded ? <CheckCircle2 className="h-6 w-6" /> : isUploading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" /> : <UploadCloud className="h-6 w-6" />}
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 text-center">{label} {required && <span className="text-red-500">*</span>}</span>
          {hint && <span className="text-xs text-slate-500 text-center mt-1">{hint}</span>}
          {isUploading && <span className="mt-2 text-xs font-semibold text-teal-600 animate-pulse">Uploading...</span>}
          {isUploaded && !isUploading && <span className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">✓ {catDocNames[key] || "Uploaded"}</span>}
          {!isUploaded && !isUploading && <span className="mt-3 text-xs font-semibold text-teal-600 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">Tap to browse</span>}
        </label>
        {tried2 && required && !catDocUrls[key] && !isUploading && (
          <div className="absolute top-2 right-2 text-red-500 bg-white rounded-full p-1 shadow-sm"><AlertCircle className="h-4 w-4" /></div>
        )}
      </div>
    );
  };

  function TermsAndConditions() {
    return (
      <div className="mt-6 space-y-4 rounded-3xl border border-teal-100 bg-teal-50/30 p-5 dark:border-teal-900/30 dark:bg-teal-950/10">
        <h3 className="flex items-center gap-2 text-base font-black text-teal-800 dark:text-teal-300"><ShieldCheck className="h-5 w-5" /> Terms & Conditions</h3>
        <div className="max-h-60 overflow-y-auto rounded-xl border border-teal-200/50 bg-white p-4 text-xs space-y-3 leading-relaxed text-slate-600 dark:border-teal-900/50 dark:bg-slate-900 dark:text-slate-400 custom-scrollbar">
          <p><strong className="text-slate-900 dark:text-white">1. Truthfulness & Accuracy</strong><br />I confirm that all information, documents, and statements provided in my case are completely true and accurate. Any falsehood or fraud will result in permanent account closure.</p>
          <p><strong className="text-slate-900 dark:text-white">2. Video Privacy & Access</strong><br />a. My identity documents ({profile.idLabel}) and my selfie will <strong className="text-teal-600">never</strong> be shown to any contributor. They are only for Givethra's verification team.<br />b. My verification video (the appeal video I record) will be shown only to the Hero who unlocks my case.<br />c. The video is provided in stream-only mode — it cannot be downloaded.<br />d. Once my case is completed, the video will be permanently hidden.</p>
          <p><strong className="text-slate-900 dark:text-white">3. Feedback Mandate</strong><br />If my case is successfully completed, I must submit a feedback video (min 60s) + written caption within 24 hours. Failure will result in suspension. Unlocking costs 5 credits.</p>
          <p><strong className="text-slate-900 dark:text-white">4. Public Usage Rights</strong><br />I grant Givethra the right to use my case description, feedback video, and caption as public property on social media.</p>
          <p><strong className="text-slate-900 dark:text-white">5. Listing Fee</strong><br />I understand that if my case is not free, a 1 credit non-refundable fee applies.</p>
        </div>
        <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-teal-200 bg-white p-3 hover:bg-teal-50 dark:border-teal-900 dark:bg-slate-900 dark:hover:bg-slate-800 transition-colors">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">I have read all the Terms & Conditions and I agree to them.</span>
        </label>
      </div>
    );
  }

  if (kycLoading || loadingUserStats) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" /></div></Layout>;
  if (checkingFeedback) return <Layout><div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" /></div></Layout>;

  if (blockedByFeedback) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-8 space-y-5 shadow-sm dark:border-amber-900/30 dark:bg-amber-950/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50"><Heart className="h-8 w-8 text-amber-600 dark:text-amber-400" /></div>
            <h1 className="text-2xl font-black text-amber-900 dark:text-amber-200">Please Share Your Feedback First</h1>
            <p className="text-sm font-medium text-amber-800/80 dark:text-amber-300/80">Your case "<strong>{blockedByFeedback.caseTitle}</strong>" was completed with a Hero's help. Before submitting a new case, please share your feedback (message + 90-second video) to build trust.</p>
            <Button asChild className="h-12 w-full rounded-xl bg-amber-600 font-bold text-white hover:bg-amber-700"><Link to="/cases/$id" params={{ id: blockedByFeedback.caseId }}>Go to My Completed Case</Link></Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (kycStatus === "pending") {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-3xl border border-blue-200 bg-blue-50/50 p-8 space-y-5 shadow-sm dark:border-blue-900/30 dark:bg-blue-950/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50"><AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" /></div>
            <h1 className="text-2xl font-black text-blue-900 dark:text-blue-200">KYC Under Review</h1>
            <p className="text-sm font-medium text-blue-800/80 dark:text-blue-300/80">Your KYC is being reviewed. Please wait for approval before submitting a case.</p>
            <Button asChild className="h-12 w-full rounded-xl bg-blue-600 font-bold text-white hover:bg-blue-700"><Link to="/">Go to Home</Link></Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (kycStatus !== "approved") {
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"><ShieldAlert className="h-8 w-8 text-slate-600 dark:text-slate-400" /></div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">KYC Verification Required</h1>
            <p className="text-sm font-medium text-slate-500">Complete identity verification before submitting a request.</p>
            <Button asChild className="h-12 w-full rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 font-bold text-white shadow-lg">
              <Link to="/kyc" onClick={() => { try { sessionStorage.setItem("givethra_kyc_return_to", "/submit-request"); } catch { /* ignore */ } }}>Complete KYC</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isSuspended) {
    const canUnlock = balance >= UNLOCK_CREDITS_REQUIRED;
    return (
      <Layout>
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 space-y-6 shadow-sm dark:border-red-900/30 dark:bg-red-950/20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"><ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" /></div>
            <h1 className="text-2xl font-black text-red-700 dark:text-red-300">🚫 Account Suspended</h1>
            <div className="space-y-2 text-sm font-medium text-red-800/80 dark:text-red-300/80">
              <p>Your account has been suspended due to <strong>{MAX_REJECTIONS_BEFORE_SUSPENSION}</strong> rejected cases.</p>
              <p>This is your <strong>#{suspensionCount}</strong> suspension.</p>
              <p>Total rejected cases: <strong>{userRejectionCount}</strong></p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-white p-5 text-left shadow-sm dark:border-red-900/50 dark:bg-slate-900">
              <p className="font-bold text-slate-900 dark:text-white mb-2">🔓 How to Unlock Your Account:</p>
              <p className="text-xs font-medium text-slate-500 mb-4">Deposit <strong>{UNLOCK_CREDITS_REQUIRED} credits</strong> to your wallet and click the button below.</p>
              <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3 mb-4 dark:bg-slate-800">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Your Balance:</span>
                <span className={`font-black text-lg ${canUnlock ? "text-emerald-600" : "text-red-600"}`}>{balance} credits</span>
              </div>
              {canUnlock ? (
                <Button className="w-full h-12 font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md" onClick={handleUnlockAccount} disabled={unlocking}>
                  {unlocking ? "Unlocking..." : `🔓 Unlock Account (${UNLOCK_CREDITS_REQUIRED} Credits)`}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button className="w-full h-12 font-bold rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md" onClick={() => navigate({ to: "/wallet" })}><Wallet className="h-4 w-4 mr-2" /> Add Credits to Wallet</Button>
                  <p className="text-xs font-semibold text-center text-slate-500">You need {UNLOCK_CREDITS_REQUIRED - balance} more credits to unlock.</p>
                </div>
              )}
            </div>
            <Button variant="outline" className="w-full h-12 rounded-xl font-bold" onClick={() => navigate({ to: "/" })}>Go to Dashboard</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-3 py-6 pb-24 sm:px-5 sm:py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">Submit a Help Request</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Your first case is FREE. After that, a 1 credit listing fee applies.</p>
        </div>

        {!loadingUserStats && user && (
          <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-2 divide-x divide-slate-100 sm:grid-cols-4 dark:divide-slate-800">
              <div className="p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Cases</p><p className="text-xl font-black text-slate-900 dark:text-white">{userTotalCases}</p></div>
              <div className="p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rejected</p><p className="text-xl font-black text-red-600">{userRejectionCount}</p></div>
              <div className="p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Free Cases</p><p className="text-xl font-black text-emerald-600">{userFreeCasesUsed}/{MAX_FREE_CASES}</p></div>
              <div className="p-4 text-center"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p><p className={`text-sm font-black mt-1 ${isFreeDisabled ? "text-red-600" : "text-emerald-600"}`}>{isFreeDisabled ? "🔒 Disabled" : "✅ Active"}</p></div>
            </div>
            {isFreeDisabled && !isSuspended && <div className="bg-red-50 p-2 text-center text-xs font-bold text-red-600 dark:bg-red-950/30">⚠️ Free case access disabled. You can still use credits.</div>}
            {userRejectionCount >= 3 && userRejectionCount < MAX_REJECTIONS_BEFORE_SUSPENSION && <div className="bg-amber-50 p-2 text-center text-xs font-bold text-amber-700 dark:bg-amber-950/30">⚠️ Warning: {userRejectionCount} rejections. Account suspends at {MAX_REJECTIONS_BEFORE_SUSPENSION}.</div>}
          </div>
        )}

        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"><Languages className="h-4 w-4" /></div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Don't understand English? In your phone browser menu, tap <strong>"Translate"</strong> to read this page in Urdu or any language.</p>
        </div>

        {willBeFree && !isFreeDisabled && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 shadow-sm dark:border-emerald-800/50 dark:bg-emerald-950/30">
            <Gift className="h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <p className="text-base font-black text-emerald-800 dark:text-emerald-300">🎉 This Case is FREE!</p>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{isFirstCaseFree ? "Your first case is FREE!" : "This category has a FREE offer!"} {userFreeCasesUsed > 0 && ` (Used ${userFreeCasesUsed}/${MAX_FREE_CASES})`}</p>
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center justify-between px-2">
          {STEPS.map((label, i) => {
            const isActive = i + 1 === step;
            const isDone = i + 1 < step;
            return (
              <div key={label} className="flex flex-col items-center relative z-10 w-1/4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-black transition-all duration-300 ${isDone ? "bg-teal-600 text-white shadow-lg" : isActive ? "bg-white text-teal-600 border-2 border-teal-600 shadow-lg scale-110" : "bg-slate-100 text-slate-400 border-2 border-transparent dark:bg-slate-800"}`}>
                  {isDone ? <Check className="h-5 w-5" /> : i + 1}
                </div>
                <span className={`mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isActive ? "text-teal-700 dark:text-teal-400" : isDone ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}`}>{label}</span>
                {i < STEPS.length - 1 && <div className={`absolute top-5 left-1/2 w-full h-1 -z-10 ${isDone ? "bg-teal-600" : "bg-slate-200 dark:bg-slate-700"}`} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white"><FileText className="h-5 w-5 text-teal-600" /> Basic Information</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Help Category *</Label>
                  <div className="notranslate" translate="no">
                    <Select value={category} onValueChange={(v) => {
                        setCategory(v); setInstituteName(""); setIsOtherInstitute(false); setInstituteSearch(""); setEduSubType(""); setEduAdmissionLevel(""); setEduSubFields({}); setRefNumber(""); setOtherName(""); setOtherContact(""); setOtherAddress(""); setCatFields({}); setCatDocUrls({}); setCatDocNames({}); setPropertyOwnership(""); setGender(""); setMaritalStatus(""); setIsOrphan(""); setOrphanParent(""); setSeekerName(""); setSeekerContact(""); setReceiverName(""); setReceiverContact(""); setReceiverBank(""); setReceiverAccount(""); setReceiverAddress(""); setReceiverShopName(""); setDisabilityMode(""); setAmount(""); setDebtTotalAmount(""); setEduSubType(""); setEduAdmissionLevel(""); setEduSubFields({});
                      }}>
                      <SelectTrigger className={`h-14 rounded-xl border-slate-200 bg-slate-50 text-base font-semibold focus:bg-white focus:ring-teal-500 ${!category ? "border-red-400" : ""}`}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="py-3 text-base">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {category && (
                    <div className="mt-3 rounded-xl bg-teal-50 border border-teal-100 p-3 text-sm dark:bg-teal-900/20 dark:border-teal-800">
                      <p className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-2"><Info className="h-4 w-4" /> {CATEGORY_LIMITS[category]?.label || "Verified Need"}</p>
                      {isFixedAmount(category) && <p className="text-emerald-600 font-bold mt-1">💰 Fixed Amount: {money(getFixedAmountValue(category))}</p>}
                      {getMaxLimit(category) && <p className="text-amber-600 font-semibold mt-1">⚠️ Maximum Limit: {money(getMaxLimit(category))}</p>}
                      {isDebtCategory(category) && <p className="text-blue-600 font-semibold mt-1">📊 5% of total debt (max {money(capDebt)})</p>}
                    </div>
                  )}
                </div>

                <div className="space-y-2"><Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Request Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Help with School Fee" className="h-14 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:border-teal-500 focus:ring-teal-500" /></div>
                <div className="space-y-2"><Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Short Description *</Label><Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} placeholder="One line summary" className="h-14 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:border-teal-500 focus:ring-teal-500" /></div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Country *</Label>
                    <Select value={country} onValueChange={(name) => { setCountry(name); setCurrency(getCountryProfile(name).currency); setInstituteName(""); setIsOtherInstitute(false); setRefNumber(""); }}>
                      <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:ring-teal-500"><SelectValue placeholder="Select country" /></SelectTrigger>
                      <SelectContent className="max-h-72">
                        {COUNTRIES.map((option) => <SelectItem key={option.code} value={option.name} className="py-3 text-base">{option.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label className="text-sm font-bold text-slate-700 dark:text-slate-300">City *</Label><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={profile.cityExample || "e.g. Your City"} className="h-14 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:border-teal-500 focus:ring-teal-500" /></div>
                </div>

                {country && (
                  <div className="flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs text-teal-800 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-300">
                    <Globe className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>Request for <strong>{country}</strong>. Amounts are in <strong>{currency}</strong>. Main ID we accept: <strong>{profile.idLabel}</strong>.</p>
                  </div>
                )}

                {!easy && category && category !== "Disability Support" && !isEducationCategory && (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Urgency Level *</Label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {["Low", "Medium", "High", "Emergency"].map((u) => (
                        <button key={u} type="button" onClick={() => setUrgency(u)} className={`h-12 rounded-xl border text-sm font-bold transition-all ${urgency === u ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300"}`}>{u}</button>
                      ))}
                    </div>
                  </div>
                )}
                {(easy && !isEducationCategory) && <p className="text-xs font-semibold text-slate-500">ℹ️ Urgency will be set automatically from your bill's due date.</p>}
              </div>

              <Button className="mt-8 h-14 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]" onClick={() => {
                  setTried1(true);
                  if (!category || !title.trim() || !shortDesc.trim() || !country.trim() || !city.trim()) { toast.error("Please fill all required fields (marked red)"); return; }
                  if (!easy && category !== "Disability Support" && !isEducationCategory && !urgency) { toast.error("Please choose urgency level"); return; }
                  setStep(2);
                }}>Continue <ChevronRight className="ml-2 h-5 w-5" /></Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-900/30"><Briefcase className="h-6 w-6" /></div>
                  <div><h2 className="text-xl font-black text-slate-900 dark:text-white">{category || "Category"}</h2><p className="text-sm font-medium text-slate-500">Please provide the required details below.</p></div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-base font-black text-slate-800 dark:text-slate-200">1. What is your current source of income? *</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {EMPLOYMENT_OPTIONS.map((opt) => (
                        <button key={opt.value} type="button" onClick={() => setJobStatus(opt.value)} className={`flex flex-col items-start px-4 py-3 rounded-xl border text-left transition-all ${jobStatus === opt.value ? "bg-teal-50 border-teal-500 ring-1 ring-teal-500 dark:bg-teal-900/20" : "bg-white border-slate-200 hover:border-teal-300 dark:bg-slate-950 dark:border-slate-800"}`}>
                          <span className={`text-sm font-bold ${jobStatus === opt.value ? "text-teal-700 dark:text-teal-400" : "text-slate-800 dark:text-slate-200"}`}>{opt.label}</span>
                          <span className="mt-1 text-xs text-slate-500">{opt.description}</span>
                        </button>
                      ))}
                    </div>
                    {jobStatus && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {(EMPLOYMENT_OPTIONS.find((opt) => opt.value === jobStatus)?.documents || []).map((document) => {
                          const keyMap: Record<string, string> = { salarySlipUrl: "salary_slip", statementUrl: "statement", businessProofUrl: "business_proof", professionProofUrl: "profession_proof", supportDeclarationUrl: "support_declaration", pensionProofUrl: "pension_proof", previousIncomeProofUrl: "previous_income_proof" };
                          return docBox(keyMap[document.key], document.label, document.required, document.hint, ".pdf,image/*");
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Label className="text-base font-black text-slate-800 dark:text-slate-200">2. Personal Background *</Label>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-600 dark:text-slate-400">Gender</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {GENDER_OPTIONS.map((g) => (
                          <button key={g} type="button" onClick={() => setGender(g as any)} className={`h-12 rounded-xl border text-sm font-bold transition-all ${gender === g ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300 dark:bg-slate-950 dark:border-slate-800"}`}>{g}</button>
                        ))}
                      </div>
                    </div>
                    {(gender === "Male" || gender === "Female") && (
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-600 dark:text-slate-400">Marital Status</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {MARITAL_STATUS_OPTIONS.map((m) => (
                            <button key={m} type="button" onClick={() => setMaritalStatus(m as any)} className={`h-12 rounded-xl border text-sm font-bold transition-all ${maritalStatus === m ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300 dark:bg-slate-950 dark:border-slate-800"}`}>{m}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {(gender === "Female" || gender === "Child") && (
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-600 dark:text-slate-400">Is {gender === "Child" ? "this child" : "she"} an orphan?</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {["Yes", "No"].map((o) => (
                            <button key={o} type="button" onClick={() => setIsOrphan(o as any)} className={`h-12 rounded-xl border text-sm font-bold transition-all ${isOrphan === o ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300 dark:bg-slate-950 dark:border-slate-800"}`}>{o === "Yes" ? "✅ Yes" : "❌ No"}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {gender === "Female" && isOrphan === "Yes" && (
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-600 dark:text-slate-400">Which parent passed away?</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {["Father", "Mother", "Both"].map((p) => (
                            <button key={p} type="button" onClick={() => setOrphanParent(p as any)} className={`h-12 rounded-xl border text-sm font-bold transition-all ${orphanParent === p ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300 dark:bg-slate-950 dark:border-slate-800"}`}>{p}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {gender && extraConditionalDocs().length > 0 && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">{extraConditionalDocs().map((d) => docBox(d.key, d.label, true, d.hint))}</div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Label className="text-base font-black text-slate-800 dark:text-slate-200">3. Your Details (Seeker)</Label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2"><Label className="text-sm font-bold text-slate-600 dark:text-slate-400">Full Name *</Label><Input value={seekerName} onChange={(e) => setSeekerName(e.target.value)} placeholder="Enter your full name" className="h-14 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:border-teal-500 focus:ring-teal-500" /></div>
                      <div className="space-y-2"><Label className="text-sm font-bold text-slate-600 dark:text-slate-400">Contact Number *</Label><Input value={seekerContact} onChange={(e) => setSeekerContact(e.target.value)} placeholder={`Phone number with country code${profile.dialCode ? ` (${profile.dialCode} …)` : ""}`} className="h-14 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:border-teal-500 focus:ring-teal-500" /></div>
                    </div>
                  </div>

                  {needsPaymentReceiver && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200 border border-amber-200 dark:border-amber-800">💡 Provide the official {getReceiverLabel().toLowerCase()} details where funds should be sent so Givethra can verify.</div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2"><Label className="text-sm font-bold">{getReceiverLabel()} Name *</Label><Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder={`Enter ${getReceiverLabel()} name`} className="h-12 rounded-xl bg-slate-50" /></div>
                        <div className="space-y-2"><Label className="text-sm font-bold">{getReceiverLabel()} Contact *</Label><Input value={receiverContact} onChange={(e) => setReceiverContact(e.target.value)} placeholder="Phone number" className="h-12 rounded-xl bg-slate-50" /></div>
                        <div className="space-y-2"><Label className="text-sm font-bold">Bank Name *</Label><Input value={receiverBank} onChange={(e) => setReceiverBank(e.target.value)} placeholder={profile.walletHint ? `Bank or ${profile.walletHint}` : "Bank name"} className="h-12 rounded-xl bg-slate-50" /></div>
                        <div className="space-y-2"><Label className="text-sm font-bold">Account Number *</Label><Input value={receiverAccount} onChange={(e) => setReceiverAccount(e.target.value)} placeholder="Account number" className="h-12 rounded-xl bg-slate-50" /></div>
                        {["Food & Groceries", "Medicines", "Home Repair"].includes(category) && (
                          <div className="space-y-2 sm:col-span-2"><Label className="text-sm font-bold">Shop / Business Name *</Label><Input value={receiverShopName} onChange={(e) => setReceiverShopName(e.target.value)} placeholder="Shop name" className="h-12 rounded-xl bg-slate-50" /></div>
                        )}
                        <div className="space-y-2 sm:col-span-2"><Label className="text-sm font-bold">Address / Shop Address *</Label><Textarea value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} placeholder="Complete address" rows={2} className="rounded-xl bg-slate-50" /></div>
                      </div>
                    </div>
                  )}

                  {utilCfg && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 border border-red-200">⚠️ One case = ONE bill only.</div>
                      {utilCompanies.length > 0 && !isOtherInstitute && (
                        <div className="space-y-3">
                          <Label className="text-base font-black text-slate-800 dark:text-slate-200">Select Your Company *</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {utilCompanies.map((c) => (
                              <button key={c.name} type="button" onClick={() => { setInstituteName(c.name); setCatFields((p) => ({ ...p, institute_name: c.name })); setIsOtherInstitute(false); }} className={`px-3 py-3 rounded-xl border text-xs font-bold text-left transition-all ${instituteName === c.name ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300 dark:bg-slate-950 dark:border-slate-800"}`}>{c.name}</button>
                            ))}
                            <button type="button" onClick={() => { setInstituteName(""); setIsOtherInstitute(true); }} className="px-3 py-3 rounded-xl border border-dashed border-teal-300 text-xs font-bold text-left text-teal-600 hover:bg-teal-50">My company is not listed</button>
                          </div>
                        </div>
                      )}
                      {isOtherInstitute && (
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                          <div className="flex items-center justify-between"><p className="text-sm font-bold">Your {utilityNoun} company</p>{localLists && (<button type="button" onClick={() => { setIsOtherInstitute(false); setOtherName(""); setOtherContact(""); setOtherAddress(""); }} className="text-xs font-bold text-teal-600 underline">Back to list</button>)}</div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1"><Label className="text-xs font-bold">Company Name *</Label><Input value={otherName} onChange={(e) => setOtherName(e.target.value)} placeholder="Name printed on your bill" className="h-12 rounded-xl bg-white" /></div>
                            <div className="space-y-1"><Label className="text-xs font-bold">Company Contact Number *</Label><Input value={otherContact} onChange={(e) => setOtherContact(e.target.value)} placeholder="Customer-service number" className="h-12 rounded-xl bg-white" /></div>
                            <div className="space-y-1 sm:col-span-2"><Label className="text-xs font-bold">Company Address / Website *</Label><Textarea value={otherAddress} onChange={(e) => setOtherAddress(e.target.value)} placeholder="Office address or official website" rows={2} className="rounded-xl bg-white" /></div>
                          </div>
                        </div>
                      )}
                      {(selectedCompany || isOtherInstitute) && (
                        <div className="space-y-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2"><Label className="text-sm font-bold">{selectedCompany?.ref ?? "Customer / Account / Reference Number"} *</Label><Input value={refNumber} onChange={(e) => setRefNumber(e.target.value)} placeholder={selectedCompany?.refHint ?? "As printed on your bill"} className="h-12 rounded-xl bg-slate-50" /></div>
                            <div className="space-y-2"><Label className="text-sm font-bold">Bill Owner Name (as on bill) *</Label><Input value={catFields.bill_owner_name || ""} onChange={(e) => setCatFields((p) => ({ ...p, bill_owner_name: e.target.value }))} placeholder="Name exactly as printed" className="h-12 rounded-xl bg-slate-50" /></div>
                          </div>
                          {category === "Electricity Bill" && (
                            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                              <Label className="text-sm font-bold">Appliances used in the home *</Label>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {ELECTRICITY_APPLIANCES.map(({ key, label }) => {
                                  const counts = normalizeElectricityAppliances(catFields.appliances);
                                  const count = counts[key] || 0;
                                  return (
                                    <div key={key} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm border border-slate-100">
                                      <span className="text-sm font-semibold text-slate-700">{label}</span>
                                      <div className="flex items-center gap-2">
                                        <button type="button" onClick={() => setCatFields((p) => ({ ...p, appliances: { ...counts, [key]: Math.max(0, count - 1) } }))} className="h-8 w-8 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 text-slate-700">−</button>
                                        <span className="w-6 text-center text-sm font-bold">{count}</span>
                                        <button type="button" onClick={() => setCatFields((p) => ({ ...p, appliances: { ...counts, [key]: count + 1 } }))} className="h-8 w-8 rounded-lg bg-slate-100 font-bold hover:bg-slate-200 text-slate-700">+</button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <div className="space-y-2">
                            <Label className="text-sm font-bold">Monthly {utilityNoun} units *</Label>
                            <Input type="number" min={1} max={unitCap ?? undefined} value={catFields.monthly_units || ""} onChange={(e) => setCatFields((p) => ({ ...p, monthly_units: e.target.value }))} placeholder={unitCap ? `1–${unitCap} units` : "Units shown on your bill"} className="h-12 rounded-xl bg-slate-50" />
                            {unitCap !== null && Number(catFields.monthly_units) > unitCap && <p className="text-sm font-bold text-red-500">Not eligible because usage is above {unitCap} units.</p>}
                          </div>
                        </div>
                      )}
                      <div className="mt-3">{docBox("bill", "Bill Photo (clear & readable)", true, "Bill should clearly show consumer number and amount")}</div>
                    </div>
                  )}

                  {listCfg && !isEducationCategory && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 border border-red-200">⚠️ One case = ONE {category.includes("Medic") ? "patient" : "student"} only.</div>
                      {!isOtherInstitute && !instituteName && (
                        <div className="space-y-3">
                          <Label className="text-base font-black text-slate-800 dark:text-slate-200">Search & Select Your Institute *</Label>
                          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" /><Input value={instituteSearch} onChange={(e) => setInstituteSearch(e.target.value)} placeholder="Type institute name..." className="h-14 pl-10 rounded-xl bg-slate-50 text-base" /></div>
                          {instituteSearch.trim().length >= 2 && (
                            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden max-h-48 overflow-y-auto bg-white dark:border-slate-800 dark:divide-slate-800 dark:bg-slate-900">
                              {filteredInstitutes.map((n: string) => (
                                <button key={n} type="button" onClick={() => { setInstituteName(n); setInstituteSearch(""); }} className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-teal-50 hover:text-teal-700">{n}</button>
                              ))}
                              {filteredInstitutes.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No match found.</p>}
                            </div>
                          )}
                          <button type="button" onClick={() => setIsOtherInstitute(true)} className="text-sm font-bold text-teal-600 hover:underline">My institute is not in the list — add manually</button>
                        </div>
                      )}
                      {instituteName && !isOtherInstitute && (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">✓ {instituteName}</p>
                          <button type="button" onClick={() => setInstituteName("")} className="text-xs font-bold text-teal-600 underline">Change</button>
                        </div>
                      )}
                      {isOtherInstitute && (
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                          <div className="flex items-center justify-between"><p className="text-sm font-bold">Add Institute Manually</p>{localLists && (<button type="button" onClick={() => { setIsOtherInstitute(false); setOtherName(""); setOtherContact(""); setOtherAddress(""); }} className="text-xs font-bold text-teal-600 underline">Back to list</button>)}</div>
                          <div className="space-y-3">
                            <div className="space-y-1"><Label className="text-xs font-bold">Institute Full Name *</Label><Input value={otherName} onChange={(e) => setOtherName(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                            <div className="space-y-1"><Label className="text-xs font-bold">Institute Contact Number *</Label><Input value={otherContact} onChange={(e) => setOtherContact(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                            <div className="space-y-1"><Label className="text-xs font-bold">Institute Address *</Label><Textarea value={otherAddress} onChange={(e) => setOtherAddress(e.target.value)} rows={2} className="rounded-xl bg-white" /></div>
                          </div>
                        </div>
                      )}
                      {(instituteName || isOtherInstitute) && (
                        <div className="space-y-4 pt-3">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {listCfg.personFields.map((f: any) => (
                              <div key={f.key} className="space-y-2"><Label className="text-sm font-bold">{f.label} {f.required && "*"}</Label><Input value={catFields[f.key] ?? ""} onChange={(e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder || f.label} className="h-12 rounded-xl bg-slate-50" /></div>
                            ))}
                            <div className="space-y-2 sm:col-span-2"><Label className="text-sm font-bold">{listCfg.refLabel}</Label><Input value={refNumber} onChange={(e) => setRefNumber(e.target.value)} placeholder={listCfg.refHint} className="h-12 rounded-xl bg-slate-50" /></div>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {docBox("bill", listCfg.billLabel, true)}
                            {listCfg.extraDocs && listCfg.extraDocs.map((doc: any) => docBox(doc.key, doc.label, doc.required, doc.hint))}
                            {category === "Medical & Treatment" && docBox("doctor_prescription", "Doctor's Written Prescription / Report", true, "Clear photo of the doctor's report")}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isEducationCategory && listCfg && (
                    <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="space-y-3">
                        <Label className="text-base font-black text-slate-800 dark:text-slate-200">What do you need help with? *</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {listCfg.subOptions?.map((opt: any) => (
                            <button key={opt.value} type="button" onClick={() => { setEduSubType(opt.value as any); setEduAdmissionLevel(""); setEduSubFields({}); }} className={`px-3 py-3 rounded-xl border text-sm font-bold text-center transition-all ${eduSubType === opt.value ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300 dark:bg-slate-950 dark:border-slate-800"}`}>{opt.label}</button>
                          ))}
                        </div>
                      </div>
                      {!isOtherInstitute && !instituteName && (
                        <div className="space-y-3">
                          <Label className="text-sm font-bold">Search & Select Institute *</Label>
                          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" /><Input value={instituteSearch} onChange={(e) => setInstituteSearch(e.target.value)} placeholder="Type institute name..." className="h-14 pl-10 rounded-xl bg-slate-50 text-base" /></div>
                          {instituteSearch.trim().length >= 2 && (
                            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden max-h-48 overflow-y-auto bg-white">
                              {filteredInstitutes.map((n: string) => (
                                <button key={n} type="button" onClick={() => { setInstituteName(n); setCatFields((p) => ({ ...p, institute_name: n })); setInstituteSearch(""); }} className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-teal-50 hover:text-teal-700">{n}</button>
                              ))}
                              {filteredInstitutes.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No match found.</p>}
                            </div>
                          )}
                          <button type="button" onClick={() => setIsOtherInstitute(true)} className="text-sm font-bold text-teal-600 hover:underline">My institute is not in the list — add manually</button>
                        </div>
                      )}
                      {instituteName && !isOtherInstitute && (
                        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                          <p className="text-sm font-bold text-emerald-800">✓ {instituteName}</p>
                          <button type="button" onClick={() => setInstituteName("")} className="text-xs font-bold text-teal-600 underline">Change</button>
                        </div>
                      )}
                      {isOtherInstitute && (
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between"><p className="text-sm font-bold">Add Institute Manually</p>{localLists && (<button type="button" onClick={() => { setIsOtherInstitute(false); setOtherName(""); setOtherContact(""); setOtherAddress(""); }} className="text-xs font-bold text-teal-600 underline">Back to list</button>)}</div>
                          <div className="space-y-3">
                            <div className="space-y-1"><Label className="text-xs font-bold">Institute Full Name *</Label><Input value={otherName} onChange={(e) => setOtherName(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                            <div className="space-y-1"><Label className="text-xs font-bold">Institute Contact Number *</Label><Input value={otherContact} onChange={(e) => setOtherContact(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                            <div className="space-y-1"><Label className="text-xs font-bold">Institute Address *</Label><Textarea value={otherAddress} onChange={(e) => setOtherAddress(e.target.value)} rows={2} className="rounded-xl bg-white" /></div>
                          </div>
                        </div>
                      )}
                      {(instituteName || isOtherInstitute) && (
                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {listCfg.personFields.map((f: any) => (
                              <div key={f.key} className="space-y-2"><Label className="text-sm font-bold">{f.label} {f.required && "*"}</Label><Input value={catFields[f.key] ?? ""} onChange={(e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder || f.label} className="h-12 rounded-xl bg-slate-50" /></div>
                            ))}
                          </div>
                          {category === "Education, Books & Admission" && eduSubType === "admission" && (
                            <div className="space-y-2">
                              <Label className="text-sm font-bold">Where are you seeking admission? *</Label>
                              <div className="grid grid-cols-3 gap-2">
                                {["School", "College", "University"].map((level) => (
                                  <button key={level} type="button" onClick={() => { setEduAdmissionLevel(level as any); setEduSubFields({}); }} className={`h-12 rounded-xl border text-sm font-bold transition-all ${eduAdmissionLevel === level ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300"}`}>{level}</button>
                                ))}
                              </div>
                            </div>
                          )}
                          {((category === "Education, Books & Admission" && eduSubType === "admission" && eduAdmissionLevel) || (category === "School, College & University Fees" && eduSubType)) && (
                            <div className="space-y-4 rounded-xl border border-teal-100 bg-teal-50/30 p-4">
                              <p className="text-sm font-bold text-teal-800">📋 Details</p>
                              <div className="grid gap-4 sm:grid-cols-2">
                                {listCfg.getSubFields?.(eduSubType, category === "Education, Books & Admission" ? eduAdmissionLevel : "")?.map((f: any) => {
                                  if (f.choices) {
                                    return (
                                      <div key={f.key} className="space-y-2 sm:col-span-2">
                                        <Label className="text-xs font-bold">{f.label} *</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                          {f.choices.map((choice: string) => (
                                            <button key={choice} type="button" onClick={() => setEduSubFields((p) => ({ ...p, [f.key]: choice }))} className={`px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all ${eduSubFields[f.key] === choice ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700"}`}>{choice}</button>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div key={f.key} className="space-y-2">
                                      <Label className="text-xs font-bold">{f.label} *</Label>
                                      <Input value={eduSubFields[f.key] ?? ""} onChange={(e) => setEduSubFields((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder || f.label} className="h-12 rounded-xl bg-white" />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <div className="space-y-2"><Label className="text-sm font-bold">{listCfg.refLabel}</Label><Input value={refNumber} onChange={(e) => setRefNumber(e.target.value)} placeholder={listCfg.refHint} className="h-12 rounded-xl bg-slate-50" /></div>
                          {((category === "Education, Books & Admission" && eduSubType === "admission" && eduAdmissionLevel) || (category === "School, College & University Fees" && eduSubType)) && (
                            <div className="grid gap-3 sm:grid-cols-2 pt-2">
                              {listCfg.getSubDocs?.(eduSubType, category === "Education, Books & Admission" ? eduAdmissionLevel : "")?.map((doc: any) => docBox(doc.key, doc.label, doc.required, doc.hint))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!easy && config && category !== "Disability Support" && !isEducationCategory && (
                    <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {cfgOneCase && <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 border border-red-200">⚠️ {cfgOneCase}</div>}
                      <div className="grid gap-4 sm:grid-cols-2">{cfgFields.filter((f) => f.key !== "job_status" && !SKIP_FIELDS.has(f.key)).map((f) => renderField(f))}</div>
                      <div className="grid gap-3 sm:grid-cols-2">{cfgDocs.filter((d) => d.key !== "salary_slip" && d.key !== "statement").map((d) => docBox(d.key, d.label, !!d.required, d.hint))}</div>
                    </div>
                  )}

                  {category === "Disability Support" && (
                    <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {docBox("disability_cnic", "Disability ID or official Disability Certificate", true, "REQUIRED — official ID or certificate")}
                        {docBox("disability_photo", "Clear Photo of Disability", true, "A clear photo showing the disability")}
                      </div>
                      <div className="space-y-3">
                        <Label className="text-base font-black text-slate-800 dark:text-slate-200">What kind of help is needed? *</Label>
                        <div className="grid grid-cols-1 gap-2">
                          {[{ v: "product", l: "🦽 Equipment / Product (e.g. wheelchair)" }, { v: "treatment", l: "🏥 Hospital Treatment" }, { v: "stipend", l: `💰 Monthly Stipend (${money(stipendAmount)})` }].map((o) => (
                            <button key={o.v} type="button" onClick={() => setDisabilityMode(o.v as any)} className={`px-4 py-3 rounded-xl border text-sm font-bold text-left transition-all ${disabilityMode === o.v ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300"}`}>{o.l}</button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold">Type of Disability *</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {CHOICE_FIELDS.disability_type.map((opt) => (
                            <button key={opt} type="button" onClick={() => setDisabilityType(opt)} className={`px-3 py-2 rounded-xl border text-xs font-bold text-left transition-all ${disabilityType === opt ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700"}`}>{opt}</button>
                          ))}
                        </div>
                      </div>
                      {disabilityMode === "product" && (
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-bold text-teal-700">🛒 Shop Details</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1"><Label className="text-xs font-bold">Shop Name *</Label><Input value={disabilityShopName} onChange={(e) => setDisabilityShopName(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                            <div className="space-y-1"><Label className="text-xs font-bold">Shop Contact *</Label><Input value={disabilityShopContact} onChange={(e) => setDisabilityShopContact(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                          </div>
                          {docBox("product_receipt", "Shop Quotation / Price Estimate", true, "Photo of the shop's quotation")}
                        </div>
                      )}
                      {disabilityMode === "treatment" && (
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-bold text-teal-700">🏥 Treatment Details</p>
                          {!disabilityHospitalOther && !disabilityHospital && (
                            <div className="space-y-3">
                              <Label className="text-sm font-bold">Search Hospital *</Label>
                              <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" /><Input value={disabilityHospitalSearch} onChange={(e) => setDisabilityHospitalSearch(e.target.value)} placeholder="Type hospital name..." className="h-14 pl-10 rounded-xl bg-white text-base" /></div>
                              {disabilityHospitalSearch.trim().length >= 2 && (
                                <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden max-h-48 overflow-y-auto bg-white">
                                  {HEALTH_INSTITUTES.filter((n) => n.toLowerCase().includes(disabilityHospitalSearch.toLowerCase())).slice(0, 8).map((n) => (
                                    <button key={n} type="button" onClick={() => { setDisabilityHospital(n); setDisabilityHospitalSearch(""); }} className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-teal-50 hover:text-teal-700">{n}</button>
                                  ))}
                                </div>
                              )}
                              <button type="button" onClick={() => setDisabilityHospitalOther(true)} className="text-xs font-bold text-teal-600 hover:underline">Not in list — add manually</button>
                            </div>
                          )}
                          {disabilityHospital && !disabilityHospitalOther && (
                            <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                              <p className="text-sm font-bold text-emerald-800">✓ {disabilityHospital}</p>
                              <button type="button" onClick={() => setDisabilityHospital("")} className="text-xs font-bold text-teal-600 underline">Change</button>
                            </div>
                          )}
                          {disabilityHospitalOther && (
                            <div className="space-y-2">
                              <Label className="text-xs font-bold">Hospital Name *</Label>
                              <Input value={disabilityHospital} onChange={(e) => setDisabilityHospital(e.target.value)} className="h-12 rounded-xl bg-white" />
                              <button type="button" onClick={() => { setDisabilityHospitalOther(false); setDisabilityHospital(""); }} className="text-xs font-bold text-teal-600 underline">Back to list</button>
                            </div>
                          )}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1"><Label className="text-xs font-bold">Treatment Amount *</Label><Input type="number" value={treatmentAmount} onChange={(e) => setTreatmentAmount(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                            <div className="space-y-1"><Label className="text-xs font-bold">Bill Expiry Date *</Label><Input type="date" value={treatmentExpiry} onChange={(e) => setTreatmentExpiry(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                            <div className="space-y-1 sm:col-span-2"><Label className="text-xs font-bold">Patient / Bill Number *</Label><Input value={treatmentPatientNumber} onChange={(e) => setTreatmentPatientNumber(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                          </div>
                        </div>
                      )}
                      {disabilityMode === "stipend" && (
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-bold text-teal-700">💰 Monthly Stipend (${money(stipendAmount)})</p>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1"><Label className="text-xs font-bold">Account Title *</Label><Input value={disabilityBankTitle} onChange={(e) => setDisabilityBankTitle(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                            <div className="space-y-1"><Label className="text-xs font-bold">Bank / {profile.walletHint || "Wallet"} *</Label><Input value={disabilityBankNumber} onChange={(e) => setDisabilityBankNumber(e.target.value)} className="h-12 rounded-xl bg-white" /></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {PROPERTY_RELEVANT_CATS.has(category) && !isEducationCategory && (
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Label className="text-base font-black text-slate-800 dark:text-slate-200">🏠 Property Ownership *</Label>
                      <p className="text-xs font-medium text-slate-500">Is the property where you live owned by you or are you renting?</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setPropertyOwnership("owned")} className={`h-12 rounded-xl border text-sm font-bold transition-all ${propertyOwnership === "owned" ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300"}`}>🏠 Owned</button>
                        <button type="button" onClick={() => setPropertyOwnership("rented")} className={`h-12 rounded-xl border text-sm font-bold transition-all ${propertyOwnership === "rented" ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-teal-300"}`}>🏢 Rented (Tenant)</button>
                      </div>
                      {propertyOwnership === "rented" && (
                        <div className="grid gap-3 sm:grid-cols-2 mt-3">
                          {docBox("rental_agreement", "Rental Agreement / Contract", true, "Clear photo of your rental agreement")}
                          {docBox("landlord_cnic", "Landlord's ID", true, "ID of the landlord")}
                        </div>
                      )}
                      {propertyOwnership === "owned" && (
                        <div className="space-y-3 mt-3">
                          <Label className="text-sm font-bold">House is in whose name? *</Label>
                          <div className="grid grid-cols-3 gap-2">
                            {["Myself", "Father", "Mother"].map((opt) => (
                              <button key={opt} type="button" onClick={() => setCatFields((p) => ({ ...p, owner_relation: opt }))} className={`h-12 rounded-xl border text-xs font-bold transition-all ${catFields.owner_relation === opt ? "bg-teal-600 text-white border-teal-600 shadow-md" : "bg-white border-slate-200 text-slate-700"}`}>{opt}</button>
                            ))}
                          </div>
                          {docBox("owner_cnic", `${catFields.owner_relation || "Owner"}'s ID`, true, "ID of the person whose name the house is registered")}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-2">
                      <Label className="text-base font-black text-slate-800 dark:text-slate-200">Why do you need this help? *</Label>
                      <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe your situation in detail — Heroes read this to understand your need..." className="rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:border-teal-500 focus:ring-teal-500" />
                      <p className="text-xs font-medium text-slate-500">💡 Write in detail so Heroes understand your situation and can help better.</p>
                    </div>
                    {isFixedAmount(category) ? (
                      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-5 text-white shadow-lg">
                        <p className="text-sm font-bold opacity-90">💰 Fixed Amount</p>
                        <p className="text-3xl font-black mt-1">{money(getFixedAmountValue(category))}</p>
                        <p className="text-xs font-medium opacity-80 mt-1">This amount is fixed for this category. You cannot change it.</p>
                      </div>
                    ) : isDebtCategory(category) ? (
                      <div className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                        <p className="text-sm font-bold text-blue-800 flex items-center gap-2"><Calculator className="h-5 w-5" /> 5% of Total Debt (Max {money(capDebt)})</p>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-blue-900">Total Outstanding Debt Amount *</Label>
                          <div className="flex gap-2">
                            <Select value={currency} onValueChange={setCurrency}>
                              <SelectTrigger className="h-14 w-28 rounded-xl bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>{CASE_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                            </Select>
                            <div className="relative flex-1">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-500 pointer-events-none">{sym}</span>
                              <Input type="number" value={debtTotalAmount} onChange={(e) => setDebtTotalAmount(e.target.value)} placeholder="e.g. 500000" className="h-14 pl-14 rounded-xl bg-white text-base font-bold" />
                            </div>
                          </div>
                        </div>
                        {debtTotalAmount && parseFloat(debtTotalAmount) > 0 && (
                          <div className="rounded-xl bg-white p-4 shadow-sm border border-blue-100">
                            <div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-700">Calculated 5% Amount:</span><span className="text-xl font-black text-blue-700">{sym} {calculatedDebtAmount.toLocaleString()}</span></div>
                            <p className="text-xs text-slate-500 mt-1">5% of {parseFloat(debtTotalAmount).toLocaleString()} (Max limit: {money(capDebt)})</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-base font-black text-slate-800 dark:text-slate-200">Amount Needed *</Label>
                        <div className="flex gap-2">
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="h-14 w-28 rounded-xl bg-slate-50 font-bold text-base"><SelectValue /></SelectTrigger>
                            <SelectContent>{CASE_CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                          <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-bold text-slate-500 pointer-events-none">{sym}</span>
                            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min={getMinAmount(category, currency) ?? undefined} max={getMaxLimit(category) ?? undefined} placeholder="e.g. 5000" className="h-14 pl-14 rounded-xl bg-slate-50 text-base font-bold focus:bg-white focus:border-teal-500 focus:ring-teal-500" />
                          </div>
                        </div>
                        {getMaxLimit(category) && <p className="text-xs font-bold text-amber-600">⚠️ Maximum allowed: {money(getMaxLimit(category))}</p>}
                        {getMinAmount(category, currency) && <p className="text-xs font-bold text-blue-600">ℹ️ Minimum allowed: {money(getMinAmount(category, currency))}</p>}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="text-base font-black text-slate-800 dark:text-slate-200">{easy ? "Bill / Challan Due Date *" : "Expected Resolution Date *"}</Label>
                      <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-14 rounded-xl border-slate-200 bg-slate-50 text-base focus:bg-white focus:border-teal-500 focus:ring-teal-500" />
                      {easy && deadline && <p className="text-xs font-bold text-teal-600">Urgency (auto): {autoUrgency}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="h-14 flex-1 rounded-2xl font-bold text-base" onClick={() => setStep(1)}>Back</Button>
                <Button className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]" onClick={() => {
                    setTried2(true);
                    if (uploadingDoc) { toast.error("Please wait — a document is still uploading."); return; }
                    const err = validateStep2();
                    if (err) { toast.error(err); return; }
                    setStep(3);
                  }}>Continue <ChevronRight className="ml-2 h-5 w-5" /></Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white"><ShieldCheck className="h-6 w-6 text-teal-600" /> Identity Verification</h2>
              <div className="space-y-8">
                <div className="space-y-3">
                  <div>
                    <Label className="text-base font-black text-slate-800 dark:text-slate-200 flex items-center gap-2"><Camera className="h-5 w-5 text-teal-600" /> Take Live Selfie *</Label>
                    <p className="text-sm font-medium text-slate-500 mt-1">Take a clear selfie to verify your identity. Must be a live photo.</p>
                  </div>
                  {!selfiePreview ? (
                    <div className="space-y-3">
                      {!cameraOn ? (
                        <Button onClick={startCamera} variant="outline" className="h-16 w-full rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 text-teal-700 hover:bg-teal-50"><Camera className="h-6 w-6 mr-2" /> Open Camera</Button>
                      ) : (
                        <div className="space-y-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 relative">
                          <video ref={videoRef} autoPlay playsInline className="w-full aspect-square object-cover" />
                          <div className="absolute inset-0 border-[40px] border-black/40 rounded-full pointer-events-none" />
                          <div className="p-3 bg-slate-900 flex justify-center"><Button onClick={takeSelfie} className="h-14 w-full max-w-xs rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 text-lg"><Camera className="h-5 w-5 mr-2" /> Capture Photo</Button></div>
                        </div>
                      )}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <img src={selfiePreview} alt="Selfie" className="w-full max-h-64 object-cover rounded-xl shadow-sm mb-4" />
                      {uploadingSelfie ? <p className="text-sm font-bold text-amber-600 flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" /> Uploading...</p>
                        : selfieUrl ? <p className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5" /> Selfie Ready</p> : null}
                      <Button variant="outline" className="w-full mt-4 h-12 rounded-xl font-bold" onClick={() => { setSelfiePreview(null); setSelfieUrl(""); }}>Retake Photo</Button>
                    </div>
                  )}
                </div>
                <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <Label className="text-base font-black text-slate-800 dark:text-slate-200 flex items-center gap-2"><Video className="h-5 w-5 text-teal-600" /> Video Statement (60-90 Seconds) *</Label>
                    <p className="text-sm font-medium text-slate-500 mt-1">Explain your situation, financial challenge, and why you need this help.</p>
                    <div className="mt-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800 border border-amber-200">⚠️ The video must be up to 90 seconds to keep file size under 50 MB.</div>
                  </div>
                  {!videoPreview ? (
                    <div className="space-y-3">
                      {!videoRecording ? (
                        <Button onClick={startVideoRecording} variant="outline" className="h-16 w-full rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 text-teal-700 hover:bg-teal-50"><Video className="h-6 w-6 mr-2" /> Start Recording</Button>
                      ) : (
                        <div className="space-y-3 rounded-2xl overflow-hidden border border-red-200 bg-slate-900 relative">
                          <video ref={liveVideoRef} autoPlay playsInline muted className="w-full aspect-video object-cover" />
                          <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse"><div className="h-2 w-2 rounded-full bg-white" /> REC {videoTimer}s / 90s</div>
                          <div className="p-3 bg-slate-900">
                            {videoTimer < 60 ? (
                              <p className="text-center text-sm font-bold text-amber-400 py-4">
                                Recording... Please wait {60 - videoTimer} more seconds before you can stop.
                              </p>
                            ) : (
                              <Button size="lg" variant="destructive" onClick={stopVideoRecording} className="w-full h-14 rounded-xl font-bold text-lg"><Square className="h-5 w-5 mr-2" /> Stop Recording</Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <video src={videoPreview} controls className="w-full rounded-xl shadow-sm mb-4 aspect-video object-cover" />
                      {uploadingVideo ? <p className="text-sm font-bold text-amber-600 flex items-center justify-center gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" /> Uploading video...</p>
                        : videoUrl ? <p className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-2"><CheckCircle2 className="h-5 w-5" /> Video Ready</p> : null}
                      <Button variant="outline" className="w-full mt-4 h-12 rounded-xl font-bold" onClick={() => { setVideoPreview(null); setVideoUrl(""); }}>Re-record Video</Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <Button variant="outline" className="h-14 flex-1 rounded-2xl font-bold text-base" onClick={() => setStep(2)}>Back</Button>
                <Button className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99]" onClick={() => {
                    if (uploadingSelfie || uploadingVideo) { toast.error("Please wait — upload in progress."); return; }
                    if (!selfieUrl) { toast.error("Please take a live selfie"); return; }
                    if (!videoUrl) { toast.error("Please record a video appeal"); return; }
                    setStep(4);
                  }}>Continue <ChevronRight className="ml-2 h-5 w-5" /></Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white"><CheckCircle2 className="h-6 w-6 text-teal-600" /> Review & Submit</h2>
              <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</p><p className="text-sm font-bold text-slate-900 dark:text-white">{category}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Title</p><p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p><p className="text-sm font-bold text-slate-900 dark:text-white">{city}, {country}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Urgency</p><p className="text-sm font-bold text-slate-900 dark:text-white">{easy ? (autoUrgency || "—") + " (auto)" : urgency}</p></div>
                  {isFixedAmount(category) ? (
                    <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount (Fixed)</p><p className="text-sm font-black text-emerald-600">{money(getFixedAmountValue(category))}</p></div>
                  ) : isDebtCategory(category) ? (
                    <><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Debt</p><p className="text-sm font-bold text-slate-900 dark:text-white">{sym} {parseFloat(debtTotalAmount || "0").toLocaleString()} {currency}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">5% Assistance</p><p className="text-sm font-black text-teal-600">{sym} {calculatedDebtAmount.toLocaleString()} {currency}</p></div></>
                  ) : (
                    <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount Needed</p><p className="text-sm font-black text-teal-600">{sym} {amount} {currency}</p></div>
                  )}
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiry</p><p className="text-sm font-bold text-slate-900 dark:text-white">{deadline}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seeker Name</p><p className="text-sm font-bold text-slate-900 dark:text-white">{seekerName || "—"}</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Documents</p><p className="text-sm font-bold text-emerald-600">{Object.keys(catDocUrls).length} uploaded ✓</p></div>
                  <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selfie & Video</p><p className="text-sm font-bold text-emerald-600">{selfieUrl && videoUrl ? "✓ Both Ready" : "Missing"}</p></div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-teal-50 p-4">
                <p className="text-base font-black text-teal-900 dark:text-teal-300">Listing Fee</p>
                {willBeFree ? <p className="text-lg font-black text-emerald-600">FREE 🎉 {isFirstCaseFree ? "(First Case)" : `(${offer?.label || "Offer"})`}</p> : <p className="text-lg font-black text-teal-700">1 Credit</p>}
              </div>
              <TermsAndConditions />
              <div className="mt-6 flex flex-col gap-3">
                <Button className="h-16 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-xl font-black text-white shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]" disabled={submitting} onClick={handleSubmit}>
                  {submitting ? "Submitting..." : willBeFree ? "Submit Request — FREE 🎉" : "Pay 1 Credit & Submit"}
                </Button>
                <Button variant="ghost" className="h-12 w-full rounded-xl font-bold text-slate-500" onClick={() => setStep(3)}>Back to Edit</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
