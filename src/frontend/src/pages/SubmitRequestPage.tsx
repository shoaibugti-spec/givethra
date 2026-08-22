// src/frontend/src/pages/SubmitRequestPage.tsx
// Replaces Supabase with Cloudflare Worker APIs

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  getKycStatus,
  getWallet,
  getUserSettings,
  getCasesByUser,
  getUserSuspension,
  upsertUserSuspension,
  getCategoryOffer,
  getOfferClaimCount,
  insertOfferClaim,
  updateCategoryOfferUsage,
  getCaseCounts,
  insertCaseSubmission,
  uploadFileToStorage,
  updateWalletBalance,
  getUnreadNotificationsCount,
} from "@/lib/api";
import { sendNotification } from "@/lib/notify";
import { getCategoryConfig } from "@/lib/categoryFields";
import {
  ELECTRICITY_COMPANIES,
  GAS_COMPANIES,
  WATER_COMPANIES,
  EDUCATION_INSTITUTES,
  HEALTH_INSTITUTES,
  EDUCATION_REF_HINT,
  HEALTH_REF_HINT,
} from "@/lib/institutesList";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Camera,
  AlertCircle,
  Languages,
  Info,
  Gift,
  CheckCircle2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  MapPin,
  Phone,
  Building2,
  X,
  Calculator,
  Heart,
} from "lucide-react";

// ============================================================
//  CATEGORY ASSISTANCE LIMITS POLICY (unchanged)
// ============================================================
const CATEGORY_LIMITS: Record<
  string,
  {
    type: "fixed" | "verified" | "max" | "debt_percentage";
    amount?: number;
    maxAmount?: number;
    percentage?: number;
    label: string;
  }
> = {
  "Widow & Elderly Support": { type: "fixed", amount: 6000, label: "Fixed Stipend" },
  "Child Support": { type: "fixed", amount: 6000, label: "Fixed Stipend" },
  "Disability Support": { type: "fixed", amount: 6000, label: "Fixed Stipend" },
  "Electricity Bill": { type: "verified", label: "1 Month Verified Bill" },
  "Gas Bill": { type: "verified", label: "1 Month Verified Bill" },
  "Water Bill": { type: "verified", label: "1 Month Verified Bill" },
  "House Rent": { type: "verified", label: "1 Month Verified Rent" },
  "School, College & University Fees": { type: "verified", label: "1 Student / 1 Month Verified Fee" },
  "Education, Books & Admission": { type: "verified", label: "Verified Cost" },
  "Food & Groceries": { type: "max", maxAmount: 12000, label: "Max Rs 12,000 per family" },
  "Medicines": { type: "verified", label: "Verified Prescription Cost" },
  "Medical & Treatment": { type: "verified", label: "Verified Treatment Bill" },
  "Home Repair": { type: "max", maxAmount: 18000, label: "Max Rs 18,000" },
  "Debt Relief": { type: "debt_percentage", percentage: 5, maxAmount: 25000, label: "5% of debt (max Rs 25,000)" },
  "Business / Work Help": { type: "max", maxAmount: 20000, label: "Rs 8,000–20,000" },
  "Marriage Support": { type: "verified", label: "Verified Need" },
  "Funeral Expenses": { type: "verified", label: "Verified Need" },
  "Livestock / Farming": { type: "verified", label: "Verified Need" },
  "Emergency Help": { type: "verified", label: "Verified Need" },
};

// ============================================================
//  CATEGORIES
// ============================================================
const CATEGORIES = [
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
];

const STEPS = ["Basic Info", "Category Details", "Verification", "Review"];

const CASE_CURRENCIES = ["PKR", "USD", "SAR", "AED", "GBP", "EUR", "INR", "BDT", "TRY"];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  PKR: "Rs",
  SAR: "SAR",
  AED: "AED",
  GBP: "£",
  EUR: "€",
  INR: "₹",
  TRY: "₺",
  BDT: "৳",
  NPR: "Rs",
  LKR: "Rs",
};

const SS_KEY = "givethra_submit_draft_v4";

const COMMON_GUIDE_TAIL = [
  "Upload clear documents so Givethra can verify your case.",
  "Take a live selfie and record a video explaining your need in your own words.",
  "Your first case is FREE. After that, a 1 credit listing fee applies.",
];

// ===== SUSPENSION CONSTANTS =====
const MAX_REJECTIONS_BEFORE_SUSPENSION = 5;
const UNLOCK_CREDITS_REQUIRED = 5;
const MAX_FREE_CASES = 2;

// ===== UTILITY CATEGORIES =====
const UTILITY_CATS: Record<
  string,
  { companies: { name: string; ref: string; refHint: string }[] }
> = {
  "Electricity Bill": { companies: ELECTRICITY_COMPANIES },
  "Gas Bill": { companies: GAS_COMPANIES },
  "Water Bill": { companies: WATER_COMPANIES },
};

// ===== EDUCATION SUB-OPTIONS =====
const EDUCATION_SUB_OPTIONS = [
  { value: "admission", label: "🎓 Admission Fee" },
  { value: "books", label: "📚 Books / Study Materials" },
  { value: "uniform", label: "👕 Uniform / Shoes" },
];

const FEE_SUB_OPTIONS = [
  { value: "school", label: "🏫 School Fee" },
  { value: "college", label: "🎓 College Fee" },
  { value: "university", label: "🏛️ University Fee" },
];

// ===== EDUCATION FIELDS (unchanged) =====
const EDUCATION_ADMISSION_FIELDS = {
  School: [
    { key: "institute_name", label: "School Name", required: true, placeholder: "e.g. Beaconhouse School System" },
    { key: "class_grade", label: "Class / Grade", required: true, placeholder: "e.g. Grade 8" },
    { key: "admission_type", label: "Admission Type", required: true, choices: ["New Admission", "Re-admission", "Transfer"] },
    { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed"] },
  ],
  College: [
    { key: "institute_name", label: "College Name", required: true, placeholder: "e.g. Government College University" },
    { key: "program", label: "Program / Class", required: true, choices: ["FA", "FSc", "ICS", "I.Com", "Other"] },
    { key: "year", label: "Year", required: true, choices: ["1st Year", "2nd Year"] },
    { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed"] },
  ],
  University: [
    { key: "institute_name", label: "University Name", required: true, placeholder: "e.g. National University of Modern Languages" },
    { key: "program_degree", label: "Program / Degree", required: true, placeholder: "e.g. BS Psychology" },
    { key: "semester_year", label: "Semester / Year", required: true, placeholder: "e.g. Fall 2026" },
    { key: "admission_status", label: "Admission Status", required: true, choices: ["Selected", "Admission Offered", "Confirmed", "Waiting List"] },
  ],
};

const EDUCATION_FEE_FIELDS = {
  School: [
    { key: "institute_name", label: "School Name", required: true, placeholder: "e.g. Beaconhouse School System" },
    { key: "class_grade", label: "Class / Grade", required: true, placeholder: "e.g. Grade 8" },
    { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" },
  ],
  College: [
    { key: "institute_name", label: "College Name", required: true, placeholder: "e.g. Government College University" },
    { key: "program", label: "Program / Class", required: true, choices: ["FA", "FSc", "ICS", "I.Com", "Other"] },
    { key: "year", label: "Year", required: true, choices: ["1st Year", "2nd Year"] },
    { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" },
  ],
  University: [
    { key: "institute_name", label: "University Name", required: true, placeholder: "e.g. National University of Modern Languages" },
    { key: "program_degree", label: "Program / Degree", required: true, placeholder: "e.g. BS Psychology" },
    { key: "semester_year", label: "Semester / Year", required: true, placeholder: "e.g. Fall 2026" },
    { key: "fee_month", label: "Fee Month", required: true, placeholder: "e.g. August 2026" },
  ],
};

function getEducationDocs(type: string, subType: string) {
  const docs: { key: string; label: string; required: boolean; hint?: string }[] = [];

  if (type === "admission") {
    docs.push({
      key: "admission_proof",
      label: "Admission / Selection Proof (Offer Letter / Merit List)",
      required: true,
      hint: "Admission milne ka saboot — Offer Letter ya Merit List ki clear photo",
    });
    docs.push({
      key: "fee_challan",
      label: "Fee Challan / Voucher (with amount & due date)",
      required: true,
      hint: "Challan par amount aur due date saaf nazar aani chahiye",
    });
    docs.push({
      key: "student_id_proof",
      label: "Student B-Form / CNIC / School ID",
      required: true,
      hint: "Student ki identity ka clear proof",
    });
  } else if (type === "fee") {
    docs.push({
      key: "fee_challan",
      label: "Fee Challan / Voucher (with amount & due date)",
      required: true,
      hint: "Challan par amount aur due date saaf nazar aani chahiye",
    });
    docs.push({
      key: "student_id_proof",
      label: "Student B-Form / CNIC / School ID",
      required: true,
      hint: "Student ki identity ka clear proof",
    });
  } else if (type === "books") {
    docs.push({
      key: "books_quotation",
      label: "Books List / Quotation from Shop",
      required: true,
      hint: "Kitabon ki list aur price quotation ki clear photo",
    });
    docs.push({
      key: "student_id_proof",
      label: "Student B-Form / School/College ID",
      required: true,
      hint: "Student ka identity proof",
    });
  } else if (type === "uniform") {
    docs.push({
      key: "uniform_quotation",
      label: "Uniform List / Quotation from Shop",
      required: true,
      hint: "Uniform items ki list aur price quotation ki clear photo",
    });
    docs.push({
      key: "student_id_proof",
      label: "Student B-Form / School/College ID",
      required: true,
      hint: "Student ka identity proof",
    });
    docs.push({
      key: "uniform_items",
      label: "Items Needed (List photo or written)",
      required: true,
      hint: "Uniform, Shoes, Bag, Winter Uniform etc. ki list",
    });
  }

  return docs;
}

// ===== CATEGORIES THAT NEED PAYMENT RECEIVER DETAILS =====
const PAYMENT_RECEIVER_CATS = new Set([
  "House Rent",
  "Food & Groceries",
  "Medicines",
  "Home Repair",
  "Debt Relief",
  "Business / Work Help",
  "Marriage Support",
  "Funeral Expenses",
  "Livestock / Farming",
  "Emergency Help",
  "Other",
]);

// ===== LIST_CATS (unchanged) =====
const LIST_CATS: Record<
  string,
  {
    list: string[];
    refLabel: string;
    refHint: string;
    personFields: { key: string; label: string; required: boolean; placeholder?: string }[];
    billLabel: string;
    extraDocs?: { key: string; label: string; required: boolean; hint?: string }[];
    subOptions?: { value: string; label: string }[];
    getSubFields?: (subType: string, subValue: string) => any[];
    getSubDocs?: (subType: string, subValue: string) => any[];
    isEducationCategory?: boolean;
  }
> = {
  "School, College & University Fees": {
    list: EDUCATION_INSTITUTES,
    refLabel: "Fee Challan / Voucher Number",
    refHint: EDUCATION_REF_HINT,
    personFields: [
      { key: "student_name", label: "Student's Name (ONE student)", required: true, placeholder: "Full name of student" },
      { key: "father_name", label: "Father's Name", required: true, placeholder: "Father's full name" },
      { key: "roll_no", label: "Roll No / Registration No", required: true, placeholder: "Student's roll number" },
    ],
    billLabel: "Fee Challan / Voucher Photo",
    isEducationCategory: true,
    subOptions: FEE_SUB_OPTIONS,
    getSubFields: (subType: string, subValue: string) => {
      if (subType === "school") return EDUCATION_FEE_FIELDS.School;
      if (subType === "college") return EDUCATION_FEE_FIELDS.College;
      if (subType === "university") return EDUCATION_FEE_FIELDS.University;
      return [];
    },
    getSubDocs: (subType: string, subValue: string) => {
      return getEducationDocs("fee", subType);
    },
  },

  "Education, Books & Admission": {
    list: EDUCATION_INSTITUTES,
    refLabel: "Challan / Reference Number",
    refHint: "Fee challan ya quotation ka reference number (agar hai to)",
    personFields: [
      { key: "student_name", label: "Student's Name (ONE student)", required: true, placeholder: "Full name of student" },
      { key: "student_class", label: "Class / Grade / Program", required: true, placeholder: "e.g. Grade 8, FA, BS" },
    ],
    billLabel: "Bill / Challan / Quotation Photo",
    isEducationCategory: true,
    subOptions: EDUCATION_SUB_OPTIONS,
    getSubFields: (subType: string, subValue: string) => {
      if (subType === "admission") {
        if (subValue === "School") return EDUCATION_ADMISSION_FIELDS.School;
        if (subValue === "College") return EDUCATION_ADMISSION_FIELDS.College;
        if (subValue === "University") return EDUCATION_ADMISSION_FIELDS.University;
        return [];
      }
      return [];
    },
    getSubDocs: (subType: string, subValue: string) => {
      return getEducationDocs(subType, subValue);
    },
  },

  "Medical & Treatment": {
    list: HEALTH_INSTITUTES,
    refLabel: "Bill / Invoice / MR Number",
    refHint: HEALTH_REF_HINT,
    personFields: [
      { key: "patient_name", label: "Patient's Name (ONE patient)", required: true, placeholder: "Full name of patient" },
      { key: "illness", label: "Illness / Treatment Needed", required: true, placeholder: "Brief description of illness" },
    ],
    billLabel: "Hospital Bill / Medical Receipt Photo",
  },

  "Medicines": {
    list: HEALTH_INSTITUTES,
    refLabel: "Invoice / Prescription Number (if any)",
    refHint: HEALTH_REF_HINT,
    personFields: [
      { key: "patient_name", label: "Patient's Name (ONE patient)", required: true, placeholder: "Full name of patient" },
      { key: "illness", label: "Illness / Condition", required: true, placeholder: "Brief description of condition" },
    ],
    billLabel: "Prescription / Medicine Estimate Photo",
    extraDocs: [
      {
        key: "doctor_report",
        label: "Doctor's Report / Prescription",
        required: true,
        hint: "Doctor ki likhayi hui report ya prescription ki clear photo",
      },
    ],
  },
};

function isEasyCat(cat: string) {
  return !!UTILITY_CATS[cat] || !!LIST_CATS[cat];
}
const DISABILITY_STIPEND_AMOUNT = 6000;
const PROPERTY_RELEVANT_CATS = new Set([
  "Electricity Bill",
  "Gas Bill",
  "Water Bill",
  "House Rent",
  "Food & Groceries",
]);

const PERSONAL_PAYMENT_CATS = new Set([
  "House Rent",
  "Marriage Support",
  "Business / Work Help",
  "Home Repair",
  "Funeral Expenses",
  "Livestock / Farming",
  "Debt Relief",
  "Emergency Help",
  "Other",
  "Food & Groceries",
  "Medicines",
]);

const FIXED_STIPEND_CATS = new Set(["Child Support", "Widow & Elderly Support", "Disability Support"]);

const SKIP_FIELDS = new Set([
  "provider_name",
  "provider_contact",
  "landlord_name",
  "landlord_contact",
  "creditor_name",
  "creditor_contact",
  "receiver_name",
  "receiver_contact",
]);

// ============================================================
//  HELPER: Get category limit info
// ============================================================
function getCategoryLimit(category: string) {
  return CATEGORY_LIMITS[category] || null;
}

function isFixedAmountCategory(category: string): boolean {
  const limit = getCategoryLimit(category);
  return limit?.type === "fixed";
}

function getFixedAmount(category: string): number | null {
  const limit = getCategoryLimit(category);
  return limit?.type === "fixed" ? limit.amount || null : null;
}

function getMaxAmount(category: string): number | null {
  const limit = getCategoryLimit(category);
  if (limit?.type === "max") return limit.maxAmount || null;
  if (limit?.type === "debt_percentage") return limit.maxAmount || null;
  return null;
}

function isDebtPercentageCategory(category: string): boolean {
  const limit = getCategoryLimit(category);
  return limit?.type === "debt_percentage";
}

function calculateDebtAmount(debtTotal: number): number {
  const limit = CATEGORY_LIMITS["Debt Relief"];
  if (!limit || limit.type !== "debt_percentage") return 0;
  const percentage = limit.percentage || 5;
  const maxAmount = limit.maxAmount || 25000;
  const calculated = (debtTotal * percentage) / 100;
  return Math.min(calculated, maxAmount);
}

function urgencyFromDue(due: string): string {
  if (!due) return "";
  const days = Math.ceil((new Date(due).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days <= 31) return "Emergency";
  if (days <= 62) return "Medium";
  return "Low";
}

function StepGuide({ lines }: { lines: string[] }) {
  return (
    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm text-foreground/80 space-y-1.5">
      <div className="flex items-center gap-1.5 text-primary font-semibold text-xs uppercase tracking-wide">
        <Info className="h-3.5 w-3.5" /> How to fill this page
      </div>
      {lines.map((l, i) => (
        <p key={i}>• {l}</p>
      ))}
    </div>
  );
}

function saveDraft(data: any) {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(data));
  } catch {}
}
function loadDraft(): any {
  try {
    const s = sessionStorage.getItem(SS_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}
function clearDraft() {
  try {
    sessionStorage.removeItem(SS_KEY);
  } catch {}
}

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

  // ===== SUSPENSION STATE =====
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

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = us
