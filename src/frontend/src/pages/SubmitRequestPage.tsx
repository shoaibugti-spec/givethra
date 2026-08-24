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

// ============================================================
//  COUNTRIES LIST (moved outside component)
// ============================================================
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Congo-Brazzaville)", "Congo (DRC)", "Costa Rica", "Croatia", "Cuba",
  "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia",
  "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran",
  "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan",
  "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho",
  "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar",
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
  "Zambia", "Zimbabwe",
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
  "Your first two cases are FREE. From the third case onward, a 1 credit listing fee applies.",
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

// ===== EDUCATION FIELDS =====
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

// ===== LIST_CATS =====
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
  const [city, setCity] = useState("");
  const [urgency, setUrgency] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [debtTotalAmount, setDebtTotalAmount] = useState("");
  const [calculatedDebtAmount, setCalculatedDebtAmount] = useState(0);
  const [deadline, setDeadline] = useState("");

  const [instituteName, setInstituteName] = useState("");
  const [instituteSearch, setInstituteSearch] = useState("");
  const [isOtherInstitute, setIsOtherInstitute] = useState(false);
  const [otherName, setOtherName] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const [otherAddress, setOtherAddress] = useState("");

  const [refNumber, setRefNumber] = useState("");

  const [jobStatus, setJobStatus] = useState<"Yes" | "No" | "">("");
  const [gender, setGender] = useState<"Male" | "Female" | "Child" | "">("");
  const [maritalStatus, setMaritalStatus] = useState<"Single" | "Married" | "Widow" | "Divorced" | "">("");
  const [isOrphan, setIsOrphan] = useState<"Yes" | "No" | "">("");
  const [orphanParent, setOrphanParent] = useState<"Father" | "Mother" | "Both" | "">("");

  const [seekerName, setSeekerName] = useState("");
  const [seekerContact, setSeekerContact] = useState("");

  // ===== PAYMENT RECEIVER DETAILS =====
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

  const [eduSubType, setEduSubType] = useState<"admission" | "books" | "uniform" | "school" | "college" | "university" | "">(
    ""
  );
  const [eduAdmissionLevel, setEduAdmissionLevel] = useState<"School" | "College" | "University" | "">("");
  const [eduSubFields, setEduSubFields] = useState<Record<string, string>>({});

  const [propertyOwnership, setPropertyOwnership] = useState<"owned" | "rented" | "">("");

  const [catFields, setCatFields] = useState<Record<string, string>>({});
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

  const [offer, setOffer] = useState<any>(null);
  const [hasClaimedOfferBefore, setHasClaimedOfferBefore] = useState(false);
  const [activeCaseCount, setActiveCaseCount] = useState(0);
  const [restored, setRestored] = useState(false);
  const [blockedByFeedback, setBlockedByFeedback] = useState<{ caseId: string; caseTitle: string } | null>(null);
  const [checkingFeedback, setCheckingFeedback] = useState(true);

  const easy = isEasyCat(category);
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

  // ===== Check if user can use free case =====
  const canUseFreeCase = () => {
    if (isSuspended) return false;
    if (isFreeDisabled) return false;
    if (userFreeCasesUsed >= MAX_FREE_CASES) return false;
    return true;
  };

  const hasFixedStipend = () => {
    if (category === "Disability Support" && disabilityMode === "stipend") return true;
    if (FIXED_STIPEND_CATS.has(category)) return true;
    return false;
  };

  const shouldShowPaymentReceiver = () => {
    return PERSONAL_PAYMENT_CATS.has(category) && !hasFixedStipend();
  };

  // ============================================================
  //  AMOUNT POLICY HELPERS
  // ============================================================
  const isFixedAmount = (cat: string) => {
    if (cat === "Disability Support" && disabilityMode === "stipend") return true;
    return isFixedAmountCategory(cat);
  };

  const getFixedAmountValue = (cat: string): number | null => {
    if (cat === "Disability Support" && disabilityMode === "stipend") return DISABILITY_STIPEND_AMOUNT;
    return getFixedAmount(cat);
  };

  const getMaxLimit = (cat: string): number | null => {
    return getMaxAmount(cat);
  };

  const isDebtCategory = (cat: string): boolean => {
    return cat === "Debt Relief";
  };

  // ===== Calculate debt amount on change =====
  useEffect(() => {
    if (isDebtCategory(category) && debtTotalAmount) {
      const total = parseFloat(debtTotalAmount);
      if (!isNaN(total) && total > 0) {
        const calculated = calculateDebtAmount(total);
        setCalculatedDebtAmount(calculated);
        setAmount(calculated.toString());
      } else {
        setCalculatedDebtAmount(0);
        setAmount("");
      }
    }
  }, [debtTotalAmount, category]);

  // ===== LOAD USER STATS =====
  async function loadUserStats() {
    if (!user?.id) {
      setLoadingUserStats(false);
      return;
    }

    setLoadingUserStats(true);
    try {
      const cases = await getCasesByUser(user.id);
      const totalCases = cases?.length || 0;
      const rejectedCases = cases?.filter((c: any) => c.status === "rejected").length || 0;
      
      // ✅ FIX: Count all free cases regardless of status (including rejected)
      const freeCasesUsed = cases?.filter((c: any) => c.was_free === true).length || 0;

      setUserTotalCases(totalCases);
      setUserRejectionCount(rejectedCases);
      setUserFreeCasesUsed(freeCasesUsed);

      // Free disabled if free cases used >= 2 OR rejections >= 3
      const freeDisabled = freeCasesUsed >= MAX_FREE_CASES;
      setIsFreeDisabled(freeDisabled);

      const suspensionData = await getUserSuspension(user.id);

      if (suspensionData) {
        setIsSuspended(suspensionData.is_active);
        setSuspensionCount(suspensionData.suspension_count || 0);
      } else if (rejectedCases >= MAX_REJECTIONS_BEFORE_SUSPENSION) {
        await upsertUserSuspension({
          user_id: user.id,
          suspension_count: 1,
          is_active: true,
          suspended_at: new Date().toISOString(),
          rejection_count_at_suspension: rejectedCases,
        });
        setIsSuspended(true);
        setSuspensionCount(1);
      }
    } catch (err) {
      console.error("Error loading user stats:", err);
    } finally {
      setLoadingUserStats(false);
    }
  }

  // ===== UNLOCK ACCOUNT =====
  async function handleUnlockAccount() {
    if (!user?.id) return;

    setUnlocking(true);
    try {
      await upsertUserSuspension({
        user_id: user.id,
        is_active: false,
      });

      setIsSuspended(false);
      setSuspensionCount(0);
      setUserRejectionCount(0);
      // Reset free cases used when unlocked
      setUserFreeCasesUsed(0);
      setIsFreeDisabled(false);

      await sendNotification(
        user.id,
        "system",
        "🔓 Account Unlocked",
        `Your account has been unlocked using ${UNLOCK_CREDITS_REQUIRED} credits. Your free case quota has been reset.`,
        "/dashboard"
      );

      toast.success(`✅ Account unlocked! ${UNLOCK_CREDITS_REQUIRED} credits deducted. Free cases reset.`);
      await loadUserStats();
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUnlocking(false);
    }
  }

  // ============================================================
  //  EXTRA CONDITIONAL DOCS
  // ============================================================
  function extraConditionalDocs(): { key: string; label: string; hint?: string }[] {
    const list: { key: string; label: string; hint?: string }[] = [];

    if (category === "Child Support") {
      const ps = catFields.parents_status;
      if (ps === "Father passed away" || ps === "Both passed away") {
        list.push({ key: "father_death_cert", label: "Father's Death Certificate", hint: "Required since you selected father as deceased" });
      }
      if (ps === "Mother passed away" || ps === "Both passed away") {
        list.push({ key: "mother_death_cert", label: "Mother's Death Certificate", hint: "Required since you selected mother as deceased" });
      }
    }

    if (category === "Funeral Expenses") {
      const rel = catFields.deceased_relation;
      if (rel === "My husband" || rel === "My wife") {
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate)", hint: "Proof of relation to spouse" });
      } else if (rel === "My father" || rel === "My mother" || rel === "My child") {
        list.push({ key: "relation_proof", label: "B-Form / FRC (Proof of Relation)", hint: "Proof of relation to parent/child" });
      }
    }

    if (category === "Home Repair") {
      if (catFields.contractor_name && catFields.contractor_name.trim()) {
        list.push({ key: "contractor_agreement", label: "Contractor Agreement / Work Order", hint: "If you have a contractor, attach the agreement" });
      }
    }

    if (category === "Marriage Support") {
      if (catFields.relation && catFields.relation !== "Myself") {
        list.push({ key: "relation_proof", label: "Proof of Relation (B-Form / FRC)", hint: "Proof that you are related to the person getting married" });
      }
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

    // Gender-based documents
    if (gender === "Male") {
      if (maritalStatus === "Single") {
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for single male" });
      }
      if (maritalStatus === "Married") {
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate)", hint: "Required for married male" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for married male" });
      }
      if (maritalStatus === "Widow") {
        list.push({ key: "wife_death_cert", label: "Wife's Death Certificate", hint: "Required for widow - death certificate of wife" });
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate from wife)", hint: "Required for widow - marriage certificate from deceased wife" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for widow - family registration certificate" });
      }
      if (maritalStatus === "Divorced") {
        list.push({ key: "divorce_cert", label: "Divorce Certificate (Court issued)", hint: "Required for divorced - court issued divorce certificate" });
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate from ex-spouse)", hint: "Required for divorced - marriage certificate from ex-spouse" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for divorced - family registration certificate" });
      }
    }

    if (gender === "Female") {
      if (maritalStatus === "Single") {
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for single female" });
      }
      if (maritalStatus === "Married") {
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate)", hint: "Required for married female" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for married female" });
      }
      if (maritalStatus === "Widow") {
        list.push({ key: "husband_death_cert", label: "Husband's Death Certificate", hint: "Required for widow - death certificate of husband" });
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate from husband)", hint: "Required for widow - marriage certificate from deceased husband" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for widow - family registration certificate" });
      }
      if (maritalStatus === "Divorced") {
        list.push({ key: "divorce_cert", label: "Divorce Certificate (Court issued)", hint: "Required for divorced - court issued divorce certificate" });
        list.push({ key: "nikah_nama", label: "Nikah Nama (Marriage Certificate from ex-spouse)", hint: "Required for divorced - marriage certificate from ex-spouse" });
        list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for divorced - family registration certificate" });
      }
      if (isOrphan === "Yes") {
        list.push({ key: "orphan_proof", label: "Orphan Proof (Parent's Death Certificate)", hint: "Required since you selected orphan" });
      }
    }

    if (gender === "Child") {
      if (isOrphan === "Yes") {
        list.push({ key: "orphan_proof", label: "Orphan Proof (Parent's Death Certificate)", hint: "Required since child is orphan" });
      }
      list.push({ key: "b_form", label: "B-Form (Child's ID)", hint: "Required for child" });
      list.push({ key: "frc", label: "Family Registration Certificate (FRC)", hint: "Required for child" });
    }

    return list;
  }

  useEffect(() => {
    const d = loadDraft();
    if (d && d.category) {
      setStep(Math.min(d.step ?? 1, 4));
      setCategory(d.category ?? "");
      setTitle(d.title ?? "");
      setShortDesc(d.shortDesc ?? "");
      setCountry(d.country ?? "");
      setCity(d.city ?? "");
      setUrgency(d.urgency ?? "");
      setDescription(d.description ?? "");
      setAmount(d.amount ?? "");
      setDebtTotalAmount(d.debtTotalAmount ?? "");
      setDeadline(d.deadline ?? "");
      setInstituteName(d.instituteName ?? "");
      setIsOtherInstitute(d.isOtherInstitute ?? false);
      setOtherName(d.otherName ?? "");
      setOtherContact(d.otherContact ?? "");
      setOtherAddress(d.otherAddress ?? "");
      setRefNumber(d.refNumber ?? "");
      setJobStatus(d.jobStatus ?? "");
      setGender(d.gender ?? "");
      setMaritalStatus(d.maritalStatus ?? "");
      setIsOrphan(d.isOrphan ?? "");
      setOrphanParent(d.orphanParent ?? "");
      setSeekerName(d.seekerName ?? "");
      setSeekerContact(d.seekerContact ?? "");
      setReceiverName(d.receiverName ?? "");
      setReceiverContact(d.receiverContact ?? "");
      setReceiverBank(d.receiverBank ?? "");
      setReceiverAccount(d.receiverAccount ?? "");
      setReceiverAddress(d.receiverAddress ?? "");
      setReceiverShopName(d.receiverShopName ?? "");
      setCatFields(d.catFields ?? {});
      setCatDocUrls(d.catDocUrls ?? {});
      setCatDocNames(d.catDocNames ?? {});
      setSelfieUrl(d.selfieUrl ?? "");
      setSelfiePreview(d.selfieUrl || null);
      setVideoUrl(d.videoUrl ?? "");
      setVideoPreview(d.videoUrl || null);
      if (d.eduSubType) setEduSubType(d.eduSubType);
      if (d.eduAdmissionLevel) setEduAdmissionLevel(d.eduAdmissionLevel);
      if (d.eduSubFields) setEduSubFields(d.eduSubFields);
      if (d.currency) setCurrency(d.currency);
      if (d.propertyOwnership) setPropertyOwnership(d.propertyOwnership);
      if (d.disabilityMode) setDisabilityMode(d.disabilityMode);
      if (d.disabilityShopName) setDisabilityShopName(d.disabilityShopName);
      if (d.disabilityShopContact) setDisabilityShopContact(d.disabilityShopContact);
      if (d.disabilityHospital) setDisabilityHospital(d.disabilityHospital);
      if (d.disabilityHospitalOther) setDisabilityHospitalOther(d.disabilityHospitalOther);
      if (d.disabilityBankTitle) setDisabilityBankTitle(d.disabilityBankTitle);
      if (d.disabilityBankNumber) setDisabilityBankNumber(d.disabilityBankNumber);
      if (d.treatmentAmount) setTreatmentAmount(d.treatmentAmount);
      if (d.treatmentExpiry) setTreatmentExpiry(d.treatmentExpiry);
      if (d.treatmentPatientNumber) setTreatmentPatientNumber(d.treatmentPatientNumber);
      if (d.disabilityType) setDisabilityType(d.disabilityType);
      if (d.disabilityReason) setDisabilityReason(d.disabilityReason);
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    saveDraft({
      step,
      category,
      title,
      shortDesc,
      country,
      city,
      urgency,
      description,
      amount,
      debtTotalAmount,
      deadline,
      instituteName,
      isOtherInstitute,
      otherName,
      otherContact,
      otherAddress,
      refNumber,
      jobStatus,
      gender,
      maritalStatus,
      isOrphan,
      orphanParent,
      seekerName,
      seekerContact,
      receiverName,
      receiverContact,
      receiverBank,
      receiverAccount,
      receiverAddress,
      receiverShopName,
      catFields,
      catDocUrls,
      catDocNames,
      selfieUrl,
      videoUrl,
      currency,
      propertyOwnership,
      disabilityMode,
      disabilityShopName,
      disabilityShopContact,
      disabilityHospital,
      disabilityHospitalOther,
      disabilityBankTitle,
      disabilityBankNumber,
      treatmentAmount,
      treatmentExpiry,
      treatmentPatientNumber,
      disabilityType,
      disabilityReason,
      eduSubType,
      eduAdmissionLevel,
      eduSubFields,
    });
  }, [
    restored,
    step,
    category,
    title,
    shortDesc,
    country,
    city,
    urgency,
    description,
    amount,
    debtTotalAmount,
    deadline,
    instituteName,
    isOtherInstitute,
    otherName,
    otherContact,
    otherAddress,
    refNumber,
    jobStatus,
    gender,
    maritalStatus,
    isOrphan,
    orphanParent,
    seekerName,
    seekerContact,
    receiverName,
    receiverContact,
    receiverBank,
    receiverAccount,
    receiverAddress,
    receiverShopName,
    catFields,
    catDocUrls,
    catDocNames,
    selfieUrl,
    videoUrl,
    currency,
    propertyOwnership,
    disabilityMode,
    disabilityShopName,
    disabilityShopContact,
    disabilityHospital,
    disabilityHospitalOther,
    disabilityBankTitle,
    disabilityBankNumber,
    treatmentAmount,
    treatmentExpiry,
    treatmentPatientNumber,
    disabilityType,
    disabilityReason,
    eduSubType,
    eduAdmissionLevel,
    eduSubFields,
  ]);

  useEffect(() => {
    if (restored && step >= 2 && !category) setStep(1);
  }, [restored, step, category]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in" });
      return;
    }
    if (user?.id) {
      loadData();
      checkPendingFeedback();
      loadUserStats();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  useEffect(() => {
    if (!category || !user?.id) {
      setOffer(null);
      return;
    }
    checkOffer(category);
  }, [category, user]);

  async function checkOffer(cat: string) {
    if (!user?.id) return;

    const off = await getCategoryOffer(cat);
    setOffer(off ?? null);
    const count = await getOfferClaimCount(user.id);
    setHasClaimedOfferBefore((count ?? 0) > 0);
  }

  const isFirstCaseFree = userFreeCasesUsed < MAX_FREE_CASES && canUseFreeCase();
  const offerApplies =
    !!offer &&
    offer.is_active &&
    (offer.used_count ?? 0) < (offer.free_limit ?? 0) &&
    !hasClaimedOfferBefore &&
    canUseFreeCase();
  const willBeFree = offerApplies || isFirstCaseFree;

  async function checkPendingFeedback() {
    if (!user?.id) {
      setCheckingFeedback(false);
      return;
    }

    setCheckingFeedback(true);
    try {
      const cases = await getCasesByUser(user.id);
      const completedCases = cases?.filter((c: any) => c.status === "completed") || [];

      if (completedCases.length > 0) {
        setBlockedByFeedback(null);
      } else {
        setBlockedByFeedback(null);
      }
    } catch (err) {
      console.error("Error checking feedback:", err);
      setBlockedByFeedback(null);
    } finally {
      setCheckingFeedback(false);
    }
  }

  async function loadData() {
    if (!user?.id) {
      setKycLoading(false);
      return;
    }

    setKycLoading(true);
    try {
      const kyc = await getKycStatus(user.id);
      setKycStatus(kyc?.status ?? null);
      const wallet = await getWallet(user.id);
      setBalance(wallet?.balance ?? 0);
      const settings = await getUserSettings(user.id);
      if (settings?.currency && settings.currency !== "USD") setCurrency(settings.currency);
      const counts = await getCaseCounts(user.id);
      const activeCount = (counts?.pending || 0) + (counts?.approved || 0) + (counts?.completed || 0);
      setActiveCaseCount(activeCount);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setKycLoading(false);
    }
  }

  // ============================================================
  //  UPLOAD FILE WITH SIZE CHECK
  // ============================================================
  async function uploadFile(file: File, path: string): Promise<string> {
    const fileSizeMB = file.size / (1024 * 1024);
    console.log(`Uploading file: ${file.name}, Size: ${fileSizeMB.toFixed(2)} MB`);

    if (fileSizeMB > 48) {
      throw new Error(`File size (${fileSizeMB.toFixed(1)}MB) exceeds 50MB limit. Please record a shorter video.`);
    }

    try {
      const url = await uploadFileToStorage(file, path);
      return url;
    } catch (error: any) {
      if (error.message.includes("limit") || error.message.includes("size")) {
        throw new Error(`File too large: ${fileSizeMB.toFixed(1)}MB (max 50MB)`);
      }
      throw new Error(error.message);
    }
  }

  // ============================================================
  //  DOCUMENT UPLOAD HANDLER
  // ============================================================
  async function handleDocSelect(key: string, file: File | null) {
    if (!file) return;
    setUploadingDoc(key);
    try {
      const url = await uploadFile(file, `cases/${user?.id}/${Date.now()}_${key}`);
      setCatDocUrls((p) => ({ ...p, [key]: url }));
      setCatDocNames((p) => ({ ...p, [key]: file.name }));
      toast.success("Uploaded ✓");
    } catch {
      toast.error("Upload failed — please attach again.");
      setCatDocUrls((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
      setCatDocNames((p) => {
        const n = { ...p };
        delete n[key];
        return n;
      });
    } finally {
      setUploadingDoc(null);
    }
  }

  // ============================================================
  //  CAMERA / SELFIE
  // ============================================================
  async function startCamera() {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(s);
      setCameraOn(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 100);
    } catch {
      toast.error("Camera access denied.");
    }
  }

  async function takeSelfie() {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        stream?.getTracks().forEach((t) => t.stop());
        setCameraOn(false);
        setSelfiePreview(canvas.toDataURL("image/jpeg"));
        setUploadingSelfie(true);
        try {
          const url = await uploadFile(
            new File([blob], "selfie.jpg", { type: "image/jpeg" }),
            `cases/${user?.id}/${Date.now()}_selfie.jpg`
          );
          setSelfieUrl(url);
        } catch {
          toast.error("Selfie upload failed — retake please.");
          setSelfiePreview(null);
        } finally {
          setUploadingSelfie(false);
        }
      }
    }, "image/jpeg");
  }

  async function handleSelfieFile(file: File | null) {
    if (!file) return;
    setSelfiePreview(URL.createObjectURL(file));
    setUploadingSelfie(true);
    try {
      const url = await uploadFile(file, `cases/${user?.id}/${Date.now()}_selfie.jpg`);
      setSelfieUrl(url);
    } catch {
      toast.error("Selfie upload failed — try again.");
      setSelfiePreview(null);
    } finally {
      setUploadingSelfie(false);
    }
  }

  // ============================================================
  //  VIDEO RECORDING - FIXED (60 seconds max, with audio improvements)
  // ============================================================
  async function startVideoRecording() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((d) => d.kind === "videoinput");

      if (!hasCamera) {
        toast.error("No camera found on your device.");
        return;
      }

      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 48000,
        },
      });

      setStream(s);
      setVideoRecording(true);
      setVideoTimer(0);

      setTimeout(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = s;
          liveVideoRef.current.onloadedmetadata = () => {
            liveVideoRef.current?.play().catch((err) => console.warn("Auto-play failed:", err));
          };
        }
      }, 50);

      const recorder = new MediaRecorder(s, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: 1500000,
        audioBitsPerSecond: 128000, // ✅ Better audio quality
      });

      mediaRecorderRef.current = recorder;
      videoChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(videoChunksRef.current, { type: "video/webm" });
        const fileSizeMB = blob.size / (1024 * 1024);
        console.log(`Video size: ${fileSizeMB.toFixed(2)} MB`);

        if (fileSizeMB > 48) {
          toast.error(`Video is ${fileSizeMB.toFixed(1)}MB (max 50MB). Please record shorter video.`);
          setVideoPreview(URL.createObjectURL(blob));
          setUploadingVideo(false);
          setVideoRecording(false);
          s.getTracks().forEach((t) => t.stop());
          return;
        }

        s.getTracks().forEach((t) => t.stop());
        setVideoRecording(false);
        setVideoPreview(URL.createObjectURL(blob));
        setUploadingVideo(true);
        try {
          const url = await uploadFile(
            new File([blob], "appeal.webm", { type: "video/webm" }),
            `cases/${user?.id}/${Date.now()}_appeal.webm`
          );
          setVideoUrl(url);
          toast.success(`Video uploaded successfully! (${fileSizeMB.toFixed(1)}MB)`);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unknown error";
          if (msg.includes("size") || msg.includes("limit")) {
            toast.error(`Video too large (${fileSizeMB.toFixed(1)}MB). Please record shorter video.`);
          } else {
            toast.error(`Video upload failed: ${msg}`);
          }
          setVideoPreview(null);
        } finally {
          setUploadingVideo(false);
        }
      };

      recorder.start(1000);

      let sec = 0;
      const interval = setInterval(() => {
        sec++;
        setVideoTimer(sec);
        if (sec >= 60) {
          clearInterval(interval);
          if (recorder.state === "recording") recorder.stop();
          toast.info("Auto-stopped at 60 seconds to keep file size small.");
        }
      }, 1000);

      (window as any)._videoInterval = interval;
    } catch (err) {
      console.error("Recording error:", err);
      toast.error("Camera/microphone access denied. Please allow permissions and try again.");
    }
  }

  function stopVideoRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if ((window as any)._videoInterval) {
      clearInterval((window as any)._videoInterval);
    }
  }

  async function handleVideoFile(file: File | null) {
    if (!file) return;
    setVideoPreview(URL.createObjectURL(file));
    setUploadingVideo(true);
    try {
      const url = await uploadFile(file, `cases/${user?.id}/${Date.now()}_appeal.webm`);
      setVideoUrl(url);
      toast.success("Video uploaded successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("size") || msg.includes("limit")) {
        toast.error("Video file too large (max 50MB). Please use a shorter video.");
      } else {
        toast.error(`Video upload failed: ${msg}`);
      }
      setVideoPreview(null);
    } finally {
      setUploadingVideo(false);
    }
  }

  // ============================================================
  //  HELPER FUNCTIONS
  // ============================================================
  function getReceiverLabel(): string {
    const labels: Record<string, string> = {
      "House Rent": "Landlord",
      "Food & Groceries": "Shop Owner",
      "Medicines": "Pharmacy / Shop Owner",
      "Home Repair": "Contractor / Material Shop",
      "Debt Relief": "Creditor",
      "Business / Work Help": "Business Owner / Supplier",
      "Marriage Support": "Marriage Vendor",
      "Funeral Expenses": "Funeral Service Provider",
      "Livestock / Farming": "Supplier / Farm Owner",
      "Emergency Help": "Emergency Recipient",
      "Other": "Recipient",
    };
    return labels[category] || "Payment Receiver";
  }

  // ============================================================
  //  VALIDATE STEP 2
  // ============================================================
  function validateStep2(): string | null {
    if (!jobStatus) return "Please answer: Do you have a job?";
    if (jobStatus === "Yes" && !catDocUrls["salary_slip"]) return "Please attach your last 6 months salary slip.";
    if (jobStatus === "Yes" && !catDocUrls["statement"]) return "Please attach your last 6 months bank statement.";
    if (jobStatus === "No" && !catDocUrls["statement"]) return "Please attach your last 6 months bank statement.";

    if (!gender) return "Please select the gender (Male/Female/Child).";
    if (gender === "Male" || gender === "Female") {
      if (!maritalStatus) return "Please select marital status (Single/Married/Widow/Divorced).";
    }
    if (gender === "Female") {
      if (!isOrphan) return "Please select: Are you an orphan?";
      if (isOrphan === "Yes" && !orphanParent) return "Please select which parent passed away.";
    }
    if (gender === "Child") {
      if (!isOrphan) return "Please select: Is this child an orphan?";
    }

    if (!seekerName.trim()) return "Please enter your full name.";
    if (!seekerContact.trim()) return "Please enter your contact number.";

    // ===== PAYMENT RECEIVER VALIDATION =====
    if (needsPaymentReceiver) {
      if (!receiverName.trim()) return `Please enter the ${getReceiverLabel()} name.`;
      if (!receiverContact.trim()) return `Please enter the ${getReceiverLabel()} contact number.`;
      if (!receiverBank.trim()) return `Please enter the ${getReceiverLabel()} bank name.`;
      if (!receiverAccount.trim()) return `Please enter the ${getReceiverLabel()} account number.`;
      if (!receiverAddress.trim()) return `Please enter the ${getReceiverLabel()} address / shop address.`;
      if (category === "Food & Groceries" || category === "Medicines" || category === "Home Repair") {
        if (!receiverShopName.trim()) return `Please enter the shop name.`;
      }
    }

    if (category === "Disability Support") {
      if (!catDocUrls["disability_cnic"]) return "Please attach Disability CNIC (Front & Back).";
      if (!catDocUrls["disability_photo"]) return "Please attach a clear photo of the disability.";
      if (!disabilityType) return "Please select the type of disability.";
      if (!disabilityMode) return "Please choose: Product, Treatment, or Monthly Stipend.";
      if (disabilityMode === "product") {
        if (!disabilityShopName.trim() || !disabilityShopContact.trim()) return "Please enter the shop's name and contact number.";
        if (!catDocUrls["product_receipt"]) return "Please attach the shop's quotation/receipt.";
      }
      if (disabilityMode === "treatment") {
        if (!disabilityHospital.trim() && !disabilityHospitalOther) return "Please select the hospital.";
        if (disabilityHospitalOther && !disabilityHospital.trim()) return "Please enter the hospital name.";
        if (!treatmentAmount.trim() || parseFloat(treatmentAmount) <= 0) return "Please enter the treatment amount.";
        if (!treatmentExpiry) return "Please select the bill expiry date.";
        if (!treatmentPatientNumber.trim()) return "Please enter the patient / bill number.";
      }
      if (disabilityMode === "stipend") {
        if (!disabilityBankTitle.trim() || !disabilityBankNumber.trim()) return "Please enter your bank/account title and number.";
      }
    }

    if (isEducationCategory && listCfg) {
      if (!eduSubType) return "Please select what you need help with.";

      for (const f of listCfg.personFields) {
        if (f.required && !(catFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
      }

      if (category === "Education, Books & Admission" && eduSubType === "admission") {
        if (!eduAdmissionLevel) return "Please select School, College, or University for admission.";
        const subFields = listCfg.getSubFields?.(eduSubType, eduAdmissionLevel) || [];
        for (const f of subFields) {
          if (f.required && !(eduSubFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
        }
      }

      if (category === "School, College & University Fees") {
        const subFields = listCfg.getSubFields?.(eduSubType, "") || [];
        for (const f of subFields) {
          if (f.required && !(eduSubFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
        }
      }

      if (isOtherInstitute) {
        if (!otherName.trim()) return "Please enter the institute name.";
        if (!otherContact.trim()) return "Please enter the institute contact number.";
        if (!otherAddress.trim()) return "Please enter the institute address (city, area, street).";
      }

      let subDocs: { key: string; label: string; required: boolean; hint?: string }[] = [];
      if (category === "Education, Books & Admission") {
        subDocs = listCfg.getSubDocs?.(eduSubType, eduSubType === "admission" ? eduAdmissionLevel : "") || [];
      } else if (category === "School, College & University Fees") {
        subDocs = listCfg.getSubDocs?.(eduSubType, "") || [];
      }

      for (const doc of subDocs) {
        if (doc.required && !catDocUrls[doc.key]) return `Please attach: ${doc.label}`;
      }

      if (!catDocUrls["student_id_proof"] && !catDocUrls["student_id"]) {
        const hasStudentId = subDocs.some((d) => d.key === "student_id_proof" || d.key === "student_id");
        if (!hasStudentId) {
          if (!catDocUrls["student_id"]) return "Please attach student's B-Form / ID card.";
        }
      }

      // ===== AMOUNT VALIDATION FOR EDUCATION =====
      if (!isFixedAmount(category)) {
        if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed.";
        const maxLimit = getMaxLimit(category);
        if (maxLimit && parseFloat(amount) > maxLimit) {
          return `Amount cannot exceed Rs ${maxLimit.toLocaleString()}. Please enter a valid amount.`;
        }
      }

      if (!deadline) return "Please select the expiry date.";

      return null;
    }

    if (easy) {
      if (!isOtherInstitute && !instituteName) return "Please select your institute/company from the list.";
      if (isOtherInstitute) {
        if (!otherName.trim()) return "Please enter the institute name.";
        if (!otherContact.trim()) return "Please enter the institute contact number.";
        if (!otherAddress.trim()) return "Please enter the institute address (city, area, street).";
      }
      if (utilCfg) {
        if (!refNumber.trim()) return `Please enter your ${selectedCompany?.ref ?? "Consumer/Reference Number"}.`;
        if (!(catFields.bill_owner_name || "").trim()) return "Please enter the bill owner name as it appears on the bill.";
      }
      if (listCfg && !isEducationCategory) {
        for (const f of listCfg.personFields) {
          if (f.required && !(catFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
        }
        if (listCfg.extraDocs) {
          for (const doc of listCfg.extraDocs) {
            if (doc.required && !catDocUrls[doc.key]) return `Please attach: ${doc.label}`;
          }
        }
      }
      if (!catDocUrls["bill"]) return "Please attach the bill/challan photo.";
      if (category === "Medical & Treatment" && !catDocUrls["doctor_prescription"])
        return "Please attach the Doctor's written prescription/report.";

      // ===== AMOUNT VALIDATION FOR EASY CATEGORIES =====
      if (!isFixedAmount(category)) {
        if (isDebtCategory(category)) {
          if (!debtTotalAmount.trim() || parseFloat(debtTotalAmount) <= 0) {
            return "Please enter your total outstanding debt amount.";
          }
          if (!amount.trim() || parseFloat(amount) <= 0) {
            return "Please enter your total outstanding debt amount to calculate 5%.";
          }
        } else {
          if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed.";
          const maxLimit = getMaxLimit(category);
          if (maxLimit && parseFloat(amount) > maxLimit) {
            return `Amount cannot exceed Rs ${maxLimit.toLocaleString()}. Please enter a valid amount.`;
          }
        }
      }
    }

    if (!easy && config && category !== "Disability Support" && !isEducationCategory) {
      for (const f of cfgFields) {
        if (f.key === "job_status") continue;
        if (SKIP_FIELDS.has(f.key)) continue;
        if (f.required && !(catFields[f.key] ?? "").trim()) return `Please fill: ${f.label}`;
      }
      for (const d of cfgDocs) {
        if (d.key === "salary_slip" || d.key === "statement") continue;
        if (d.required && !catDocUrls[d.key]) return `Please attach: ${d.label}`;
      }
      for (const d of extraConditionalDocs()) {
        if (!catDocUrls[d.key]) return `Please attach: ${d.label}`;
      }

      if (!isFixedAmount(category)) {
        if (isDebtCategory(category)) {
          if (!debtTotalAmount.trim() || parseFloat(debtTotalAmount) <= 0) {
            return "Please enter your total outstanding debt amount.";
          }
          if (!amount.trim() || parseFloat(amount) <= 0) {
            return "Please enter your total outstanding debt amount to calculate 5%.";
          }
        } else {
          if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed.";
          const maxLimit = getMaxLimit(category);
          if (maxLimit && parseFloat(amount) > maxLimit) {
            return `Amount cannot exceed Rs ${maxLimit.toLocaleString()}. Please enter a valid amount.`;
          }
        }
      }
    }

    if (!description.trim()) return "Please explain your situation.";

    if (!isFixedAmount(category) && !isEducationCategory) {
      if (!amount.trim() || parseFloat(amount) <= 0) return "Please enter the amount needed.";
    }

    if (!deadline) return "Please select the expiry date.";

    if (PROPERTY_RELEVANT_CATS.has(category) && !isEducationCategory) {
      if (!propertyOwnership) return "Please select property ownership (Owned or Rented).";
      if (propertyOwnership === "rented") {
        if (!catDocUrls["rental_agreement"]) return "Please attach the Rental Agreement.";
        if (!catDocUrls["landlord_cnic"]) return "Please attach the Landlord's CNIC.";
      }
      if (propertyOwnership === "owned") {
        if (!catFields.owner_relation) return "Please select whose name the house is in.";
        if (!catDocUrls["owner_cnic"]) return "Please attach the owner's CNIC.";
      }
    }

    return null;
  }

  // ============================================================
  //  HANDLE SUBMIT
  // ============================================================
  async function handleSubmit() {
    if (!confirmed) {
      toast.error("Please confirm all information is true");
      return;
    }
    if (!selfieUrl) {
      toast.error("Please take a live selfie");
      return;
    }
    if (!videoUrl) {
      toast.error("Please record a video appeal (60 seconds)");
      return;
    }

    if (isSuspended) {
      toast.error("Your account is suspended. Please unlock it first.");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated.");
      return;
    }

    setSubmitting(true);
    try {
      const uid = user.id;

      // Fetch fresh case data
      const freshCases = await getCasesByUser(uid);
      const freshRejections = freshCases?.filter((c: any) => c.status === "rejected").length || 0;
      // Count all free cases regardless of status
      const freshFreeUsed = freshCases?.filter((c: any) => c.was_free === true).length || 0;

      const freeDisabled = freshFreeUsed >= MAX_FREE_CASES;
      const userSuspended = freshRejections >= MAX_REJECTIONS_BEFORE_SUSPENSION;

      if (userSuspended) {
        await upsertUserSuspension({
          user_id: uid,
          suspension_count: suspensionCount + 1,
          is_active: true,
          suspended_at: new Date().toISOString(),
          rejection_count_at_suspension: freshRejections,
        });
        setIsSuspended(true);
        toast.error("Your account has been suspended due to multiple rejections.");
        setSubmitting(false);
        return;
      }

      // The first two submitted cases are free, regardless of review status.
      const firstFree = freshFreeUsed < MAX_FREE_CASES && !freeDisabled;

      let offerFree = false;
      let currentOffer: any = null;
      if (category && !firstFree) {
        const off = await getCategoryOffer(category);
        currentOffer = off;
        const claimCount = await getOfferClaimCount(uid);
        offerFree =
          !!off &&
          off.is_active &&
          (off.used_count ?? 0) < (off.free_limit ?? 0) &&
          (claimCount ?? 0) === 0 &&
          !freeDisabled;
      }

      const free = firstFree || offerFree;

      if (!free) {
        const wallet = await getWallet(uid);
        if (!wallet || wallet.balance < 1) {
          toast.error("Insufficient credits! You need 1 credit.");
          navigate({ to: "/wallet" });
          setSubmitting(false);
          return;
        }
      }

      const allDocUrls: Record<string, string> = { ...catDocUrls };
      const photoUrls: string[] = Object.values(allDocUrls);
      const docMeta: Record<string, string> = {};
      Object.keys(allDocUrls).forEach((k) => {
        docMeta[k] = allDocUrls[k];
      });

      const finalInstitute = easy
        ? isOtherInstitute
          ? otherName
          : instituteName
        : catFields.institute_name ||
          catFields.hospital_name ||
          catFields.provider ||
          catFields.provider_name ||
          catFields.landlord_name ||
          catFields.pharmacy_name ||
          catFields.lender_name ||
          "";
      const finalContact = easy
        ? isOtherInstitute
          ? otherContact
          : ""
        : catFields.institute_contact ||
          catFields.hospital_contact ||
          catFields.provider_contact ||
          catFields.landlord_contact ||
          catFields.pharmacy_contact ||
          catFields.lender_contact ||
          "";
      const finalAddress = isOtherInstitute ? otherAddress : catFields.institute_address || "";
      const finalUrgency = easy ? autoUrgency || "Medium" : urgency;

      const categoryDetails: Record<string, any> = {
        ...catFields,
        _documents: docMeta,
        property_ownership: propertyOwnership,
        rental_agreement_url: catDocUrls["rental_agreement"] || "",
        landlord_cnic_url: catDocUrls["landlord_cnic"] || "",
        job_status: jobStatus,
        gender: gender,
        marital_status: maritalStatus,
        is_orphan: isOrphan,
        orphan_parent: orphanParent,
        seeker_name: seekerName,
        seeker_contact: seekerContact,
        institute_name: finalInstitute,
        institute_contact: finalContact,
        institute_address: finalAddress,
        is_institute_in_list: !isOtherInstitute,
      };

      // ===== PAYMENT RECEIVER DETAILS =====
      if (needsPaymentReceiver) {
        categoryDetails.receiver_name = receiverName;
        categoryDetails.receiver_contact = receiverContact;
        categoryDetails.receiver_bank = receiverBank;
        categoryDetails.receiver_account = receiverAccount;
        categoryDetails.receiver_address = receiverAddress;
        categoryDetails.receiver_shop_name = receiverShopName;
      }

      // ===== DEBT RELIEF SPECIFIC =====
      if (isDebtCategory(category)) {
        categoryDetails.debt_total_amount = parseFloat(debtTotalAmount) || 0;
        categoryDetails.debt_percentage = 5;
        categoryDetails.debt_calculated_amount = calculatedDebtAmount;
        categoryDetails.debt_max_limit = 25000;
      }

      if (isEducationCategory) {
        categoryDetails.edu_sub_type = eduSubType;
        categoryDetails.edu_sub_fields = eduSubFields;
        if (eduSubType === "admission") {
          categoryDetails.edu_admission_level = eduAdmissionLevel;
        }
        categoryDetails.edu_documents = {
          admission_proof: catDocUrls["admission_proof"] || "",
          fee_challan: catDocUrls["fee_challan"] || "",
          student_id_proof: catDocUrls["student_id_proof"] || "",
          books_quotation: catDocUrls["books_quotation"] || "",
          uniform_quotation: catDocUrls["uniform_quotation"] || "",
          uniform_items: catDocUrls["uniform_items"] || "",
        };
      }

      if (shouldShowPaymentReceiver()) {
        categoryDetails.receiver_name = receiverName;
        categoryDetails.receiver_contact = receiverContact;
        categoryDetails.receiver_bank = receiverBank;
        categoryDetails.receiver_account = receiverAccount;
      }

      if (category === "Disability Support") {
        categoryDetails.disability_mode = disabilityMode;
        categoryDetails.disability_shop_name = disabilityShopName;
        categoryDetails.disability_shop_contact = disabilityShopContact;
        categoryDetails.disability_hospital = disabilityHospital;
        categoryDetails.disability_stipend_amount = disabilityMode === "stipend" ? DISABILITY_STIPEND_AMOUNT : undefined;
        categoryDetails.disability_bank_title = disabilityBankTitle;
        categoryDetails.disability_bank_number = disabilityBankNumber;
        categoryDetails.disability_type = disabilityType;
        categoryDetails.disability_reason = disabilityReason;
        if (disabilityMode === "treatment") {
          categoryDetails.treatment_amount = parseFloat(treatmentAmount);
          categoryDetails.treatment_expiry = treatmentExpiry;
          categoryDetails.treatment_patient_number = treatmentPatientNumber;
          categoryDetails.treatment_urgency = treatmentAutoUrgency;
        }
      }

      if (easy && !isEducationCategory) {
        categoryDetails.institute = finalInstitute;
        categoryDetails.institute_in_list = !isOtherInstitute;
        categoryDetails.reference_type = utilCfg
          ? selectedCompany?.ref ?? "Reference"
          : listCfg?.refLabel ?? "Reference";
        categoryDetails.reference_number = refNumber;
        categoryDetails.due_date = deadline;
      }

      // ===== FINAL AMOUNT - Apply policy =====
      let finalAmount: number;
      if (isFixedAmount(category)) {
        const fixedVal = getFixedAmountValue(category);
        finalAmount = fixedVal || 0;
      } else if (hasFixedStipend()) {
        finalAmount = DISABILITY_STIPEND_AMOUNT;
      } else if (isDebtCategory(category)) {
        finalAmount = calculatedDebtAmount;
      } else {
        finalAmount = parseFloat(amount) || 0;
      }

      const caseData = {
        user_id: uid,
        category,
        title,
        short_description: shortDesc,
        country,
        city,
        urgency: finalUrgency,
        description,
        amount_needed: finalAmount,
        currency,
        why_help: description,
        deadline: deadline || null,
        institute_name: finalInstitute,
        institute_contact: finalContact,
        institute_address: finalAddress,
        payment_method: easy
          ? "1Bill / Direct"
          : needsPaymentReceiver
          ? "Direct to Receiver"
          : "Direct to Provider",
        account_title: "",
        account_number: refNumber || "",
        account_iban: "",
        category_details: categoryDetails,
        photo_urls: photoUrls,
        selfie_url: selfieUrl,
        video_url: videoUrl,
        status: "pending",
        submitted_at: new Date().toISOString(),
        was_free: free,
      };

      await insertCaseSubmission(caseData);

      await loadUserStats();

      if (firstFree) {
        if (uid)
          await sendNotification(
            uid,
            "system",
            "First Case Submitted FREE 🎉",
            `Your first case "${title}" was submitted FREE and is under review.`,
            "/my-cases"
          );
        toast.success("🎉 Your first case is FREE! Submitted for review.");
      } else if (offerFree && currentOffer) {
        await insertOfferClaim({ user_id: uid, category });
        await updateCategoryOfferUsage(category, (currentOffer.used_count ?? 0) + 1);
        if (uid)
          await sendNotification(
            uid,
            "system",
            "Case Submitted (FREE) 🎉",
            `Your case "${title}" was submitted FREE!`,
            "/my-cases"
          );
        toast.success(`🎉 Free under ${currentOffer.label || "offer"}! Case submitted.`);
      } else {
        const wallet = await getWallet(uid);
        await updateWalletBalance(uid, (wallet?.balance ?? 1) - 1);
        if (uid)
          await sendNotification(
            uid,
            "system",
            "Case Submitted ⏳",
            `Your case "${title}" was submitted and is under review.`,
            "/my-cases"
          );
        toast.success("Case submitted! 1 credit deducted. Under review.");
      }

      clearDraft();
      navigate({ to: "/my-cases" });
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  }

  // ============================================================
  //  RENDER FUNCTIONS FOR STEP 2
  // ============================================================
  function renderField(f: any) {
    if (YES_NO_FIELDS.has(f.key)) {
      const questionLabel = f.key === "wife_status" ? "Do you have a wife / spouse in this household?" : f.label;
      return (
        <div key={f.key} className="space-y-2">
          <Label>{questionLabel} {f.required && "*"}</Label>
          <div className="grid grid-cols-2 gap-2">
            {["Yes", "No"].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setCatFields((p) => ({ ...p, [f.key]: opt }))}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                  catFields[f.key] === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }
    if (COUNTER_FIELDS.has(f.key)) {
      const val = parseInt(catFields[f.key] || "0", 10);
      return (
        <div key={f.key} className="space-y-2">
          <Label>{f.label}</Label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCatFields((p) => ({ ...p, [f.key]: String(Math.max(0, val - 1)) }))}
              className="h-9 w-9 rounded-lg border border-border font-bold text-lg"
            >
              −
            </button>
            <span className="w-10 text-center font-semibold">{val}</span>
            <button
              type="button"
              onClick={() => setCatFields((p) => ({ ...p, [f.key]: String(Math.min(15, val + 1)) }))}
              className="h-9 w-9 rounded-lg border border-border font-bold text-lg"
            >
              +
            </button>
          </div>
        </div>
      );
    }
    if (CHOICE_FIELDS[f.key]) {
      const opts = CHOICE_FIELDS[f.key];
      return (
        <div key={f.key} className="space-y-2">
          <Label>{f.label} {f.required && "*"}</Label>
          <div className="grid grid-cols-2 gap-2">
            {opts.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setCatFields((p) => ({ ...p, [f.key]: opt }))}
                className={`px-2 py-2 rounded-lg border text-xs font-medium text-left ${
                  catFields[f.key] === opt ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div key={f.key} className="space-y-2">
        <Label>{f.label} {f.required && "*"}</Label>
        {f.type === "textarea" ? (
          <Textarea
            value={catFields[f.key] ?? ""}
            onChange={(e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
            rows={3}
          />
        ) : (
          <Input
            type={f.type === "number" ? "number" : "text"}
            value={catFields[f.key] ?? ""}
            onChange={(e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value }))}
            placeholder={f.placeholder}
          />
        )}
      </div>
    );
  }

  function renderSeekerDetails() {
    return (
      <div className="pt-2 space-y-3 border-t border-border">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary mb-2">📌 Your Details (Seeker)</p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input
                value={seekerName}
                onChange={(e) => setSeekerName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-1">
              <Label>Contact Number *</Label>
              <Input
                value={seekerContact}
                onChange={(e) => setSeekerContact(e.target.value)}
                placeholder="Your phone number for verification"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderPaymentReceiverDetails() {
    if (!needsPaymentReceiver) return null;

    return (
      <div className="pt-2 space-y-3 border-t border-border">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary mb-2">📌 {getReceiverLabel()} Payment Details</p>
          <p className="text-[11px] text-muted-foreground mb-2">
            💡 Provide the official institute, school, hospital, or supplier details where funds should be sent so Givethra can verify.
          </p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label>{getReceiverLabel()} Name *</Label>
              <Input
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder={`Enter ${getReceiverLabel()} full name`}
              />
            </div>
            <div className="space-y-1">
              <Label>{getReceiverLabel()} Contact Number *</Label>
              <Input
                value={receiverContact}
                onChange={(e) => setReceiverContact(e.target.value)}
                placeholder="Phone number for verification"
              />
            </div>
            <div className="space-y-1">
              <Label>Shop / Business Name {["Food & Groceries", "Medicines", "Home Repair"].includes(category) ? "*" : ""}</Label>
              <Input
                value={receiverShopName}
                onChange={(e) => setReceiverShopName(e.target.value)}
                placeholder="Shop or business name"
              />
              {["Food & Groceries", "Medicines", "Home Repair"].includes(category) && (
                <p className="text-[11px] text-muted-foreground">💡 Required for shop purchases</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>{getReceiverLabel()} Bank Name *</Label>
              <Input
                value={receiverBank}
                onChange={(e) => setReceiverBank(e.target.value)}
                placeholder="Bank name"
              />
            </div>
            <div className="space-y-1">
              <Label>{getReceiverLabel()} Account Number *</Label>
              <Input
                value={receiverAccount}
                onChange={(e) => setReceiverAccount(e.target.value)}
                placeholder="Account number"
              />
            </div>
            <div className="space-y-1">
              <Label>{getReceiverLabel()} Address / Shop Address *</Label>
              <Textarea
                value={receiverAddress}
                onChange={(e) => setReceiverAddress(e.target.value)}
                placeholder="Complete address of the receiver/shop"
                rows={2}
              />
              <p className="text-[11px] text-muted-foreground">💡 Complete address for verification purposes</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderPaymentReceiver() {
    if (!shouldShowPaymentReceiver()) return null;
    return (
      <div className="pt-2 space-y-3 border-t border-border">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-primary mb-2">📌 {getReceiverLabel()} Payment Details</p>
          <div className="space-y-2">
            <div className="space-y-1">
              <Label>{getReceiverLabel()} Name *</Label>
              <Input
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder={`Enter ${getReceiverLabel()} name`}
              />
            </div>
            <div className="space-y-1">
              <Label>{getReceiverLabel()} Contact Number *</Label>
              <Input
                value={receiverContact}
                onChange={(e) => setReceiverContact(e.target.value)}
                placeholder="Phone number for verification"
              />
            </div>
            <div className="space-y-1">
              <Label>{getReceiverLabel()} Bank Name</Label>
              <Input
                value={receiverBank}
                onChange={(e) => setReceiverBank(e.target.value)}
                placeholder="Bank name"
              />
            </div>
            <div className="space-y-1">
              <Label>{getReceiverLabel()} Account Number</Label>
              <Input
                value={receiverAccount}
                onChange={(e) => setReceiverAccount(e.target.value)}
                placeholder="Account number"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderEducationCategory() {
    if (!listCfg || !isEducationCategory) return null;

    const subOptions = listCfg.subOptions || [];
    const isAdmissionCategory = category === "Education, Books & Admission";
    const isFeeCategory = category === "School, College & University Fees";

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>What do you need help with? *</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {subOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setEduSubType(opt.value as any);
                  setEduAdmissionLevel("");
                  setEduSubFields({});
                }}
                className={`px-3 py-3 rounded-lg border text-sm font-medium text-center ${
                  eduSubType === opt.value ? "bg-primary text-white border-primary" : "border-border"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {!isOtherInstitute && !instituteName && (
            <div className="space-y-2">
              <Label>Search & Select Your Institute *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={instituteSearch}
                  onChange={(e) => setInstituteSearch(e.target.value)}
                  placeholder="Type institute name..."
                  className="pl-9"
                />
              </div>
              {instituteSearch.trim().length >= 2 && (
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden max-h-48 overflow-y-auto">
                  {filteredInstitutes.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        setInstituteName(n);
                        setInstituteSearch("");
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5"
                    >
                      {n}
                    </button>
                  ))}
                  {filteredInstitutes.length === 0 && (
                    <p className="px-3 py-2.5 text-sm text-muted-foreground">No match found.</p>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsOtherInstitute(true)}
                className="text-xs text-primary font-medium underline"
              >
                My institute is not in the list — add manually
              </button>
            </div>
          )}

          {instituteName && !isOtherInstitute && (
            <div className="rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-300 p-3 flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-teal-700">
                ✓ {instituteName} <span className="text-[10px]">(1Bill listed)</span>
              </p>
              <button
                type="button"
                onClick={() => setInstituteName("")}
                className="text-xs text-primary underline shrink-0"
              >
                Change
              </button>
            </div>
          )}

          {isOtherInstitute && (
            <div className="space-y-3 rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Institute (not in list)</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsOtherInstitute(false);
                    setOtherName("");
                    setOtherContact("");
                    setOtherAddress("");
                  }}
                  className="text-xs text-primary underline"
                >
                  Back to list
                </button>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" /> Institute Full Name *
                </Label>
                <Input
                  value={otherName}
                  onChange={(e) => setOtherName(e.target.value)}
                  placeholder="e.g. Beaconhouse School System"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Phone className="h-4 w-4" /> Institute Contact Number *
                </Label>
                <Input
                  value={otherContact}
                  onChange={(e) => setOtherContact(e.target.value)}
                  placeholder="Office number — Givethra will verify"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Institute Address (City, Area, Street) *
                </Label>
                <Textarea
                  value={otherAddress}
                  onChange={(e) => setOtherAddress(e.target.value)}
                  placeholder="e.g. Main Boulevard, Gulberg 3, Lahore"
                  rows={2}
                  className="resize-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  💡 Please provide complete address so Givethra can verify the institute's location.
                </p>
              </div>
            </div>
          )}
        </div>

        {(instituteName || isOtherInstitute) && (
          <div className="space-y-3 pt-2 border-t border-border">
            {listCfg.personFields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label>
                  {f.label} {f.required && "*"}
                </Label>
                <Input
                  value={catFields[f.key] ?? ""}
                  onChange={(e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder || f.label}
                />
              </div>
            ))}

            {isAdmissionCategory && eduSubType === "admission" && (
              <div className="space-y-2">
                <Label>Where are you seeking admission? *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["School", "College", "University"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setEduAdmissionLevel(level as any);
                        setEduSubFields({});
                      }}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                        eduAdmissionLevel === level ? "bg-primary text-white border-primary" : "border-border"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {((isAdmissionCategory && eduSubType === "admission" && eduAdmissionLevel) ||
              (isFeeCategory && eduSubType)) && (
              <div className="space-y-3 pt-2">
                <p className="text-sm font-semibold text-foreground">
                  {isAdmissionCategory
                    ? `📋 ${eduAdmissionLevel} Admission Details`
                    : `📋 ${eduSubType.charAt(0).toUpperCase() + eduSubType.slice(1)} Fee Details`}
                </p>
                {listCfg
                  .getSubFields?.(eduSubType, isAdmissionCategory ? eduAdmissionLevel : "")
                  ?.map((f) => {
                    if (f.choices) {
                      return (
                        <div key={f.key} className="space-y-2">
                          <Label>{f.label} *</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {f.choices.map((choice: string) => (
                              <button
                                key={choice}
                                type="button"
                                onClick={() => setEduSubFields((p) => ({ ...p, [f.key]: choice }))}
                                className={`px-2 py-2 rounded-lg border text-xs font-medium text-left ${
                                  eduSubFields[f.key] === choice
                                    ? "bg-primary text-white border-primary"
                                    : "border-border"
                                }`}
                              >
                                {choice}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return (
                      <div key={f.key} className="space-y-2">
                        <Label>{f.label} *</Label>
                        <Input
                          value={eduSubFields[f.key] ?? ""}
                          onChange={(e) => setEduSubFields((p) => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder || f.label}
                        />
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="space-y-2">
              <Label>{listCfg.refLabel}</Label>
              <Input
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                placeholder={listCfg.refHint}
              />
              <p className="text-[11px] text-muted-foreground">💡 {listCfg.refHint}</p>
            </div>

            {((isAdmissionCategory && eduSubType === "admission" && eduAdmissionLevel) ||
              (isFeeCategory && eduSubType)) && (
              <div className="space-y-3 pt-2 border-t border-border">
                <p className="text-sm font-semibold text-foreground">📎 Required Documents</p>
                {listCfg
                  .getSubDocs?.(eduSubType, isAdmissionCategory ? eduAdmissionLevel : "")
                  ?.map((doc) => docBox(doc.key, doc.label, doc.required, doc.hint))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  //  RENDER HELPERS (docBox, etc.)
  // ============================================================
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  const filteredInstitutes = listCfg
    ? listCfg.list.filter((n) => n.toLowerCase().includes(instituteSearch.toLowerCase())).slice(0, 8)
    : [];

  const docBox = (key: string, label: string, required: boolean, hint?: string, accept = "image/*,.pdf") => (
    <div className="rounded-xl border border-border p-3 space-y-2">
      <Label className="text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      <input
        type="file"
        accept={accept}
        onChange={(e) => handleDocSelect(key, e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-muted-foreground"
      />
      {uploadingDoc === key && <p className="text-xs text-amber-600">⏳ Uploading... please wait</p>}
      {catDocUrls[key] && uploadingDoc !== key && (
        <p className="text-xs text-teal-600 flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5" /> {catDocNames[key] || "Document"} — Uploaded ✓
        </p>
      )}
      {tried2 && required && !catDocUrls[key] && uploadingDoc !== key && (
        <p className="text-xs text-red-500 font-medium">⚠️ Required — attach and wait for Uploaded ✓.</p>
      )}
    </div>
  );

  // ============================================================
  //  EARLY RETURNS (KYC, Suspended, etc.)
  // ============================================================
  if (kycLoading || loadingUserStats) return <Layout><div className="text-center py-20">Loading...</div></Layout>;

  if (checkingFeedback) return <Layout><div className="text-center py-20">Loading...</div></Layout>;

  if (blockedByFeedback) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border bg-card p-8 space-y-4">
            <Heart className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Please Share Your Feedback First</h1>
            <p className="text-muted-foreground">
              Your case "<strong>{blockedByFeedback.caseTitle}</strong>" was completed with a Hero's help.
              Before submitting a new case, please share your feedback (message + 90-second video) —
              this builds trust for Givethra and future Heroes.
            </p>
            <Button asChild className="w-full h-11">
              <Link to="/cases/$id" params={{ id: blockedByFeedback.caseId }}>
                Go to My Completed Case
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // ===== KYC STATUS CHECK =====
  if (kycStatus === "pending") {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border bg-card p-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto" />
            <h1 className="text-2xl font-bold">KYC Under Review</h1>
            <p className="text-muted-foreground">Your KYC is being reviewed. Please wait for approval before submitting a case.</p>
            <Button asChild>
              <Link to="/">Go to Home</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (kycStatus !== "approved") {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border bg-card p-8 space-y-4">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto" />
            <h1 className="text-2xl font-bold">KYC Verification Required</h1>
            <p className="text-muted-foreground">Complete identity verification before submitting a request.</p>
            <Button asChild>
              <Link to="/kyc">Complete KYC</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // ===== SUSPENDED PAGE =====
  if (isSuspended) {
    const canUnlock = balance >= UNLOCK_CREDITS_REQUIRED;
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-8 space-y-6">
            <ShieldAlert className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-red-700">🚫 Account Suspended</h1>
            <div className="space-y-2 text-red-600">
              <p>
                Your account has been suspended due to <strong>{MAX_REJECTIONS_BEFORE_SUSPENSION}</strong> rejected cases.
              </p>
              <p className="text-sm">
                This is your <strong>#{suspensionCount}</strong> suspension.
              </p>
              <p className="text-sm">
                Total rejected cases: <strong>{userRejectionCount}</strong>
              </p>
            </div>

            <div className="bg-card rounded-xl border p-4 space-y-3">
              <p className="font-semibold">🔓 How to Unlock Your Account:</p>
              <p className="text-sm text-muted-foreground">
                Deposit <strong>{UNLOCK_CREDITS_REQUIRED} credits</strong> to your wallet and click the button below.
              </p>
              <div className="flex justify-between items-center bg-primary/5 rounded-lg p-3">
                <span className="text-sm">Your Balance:</span>
                <span className={`font-bold text-lg ${canUnlock ? "text-teal-600" : "text-red-600"}`}>
                  {balance} credits
                </span>
              </div>
              {canUnlock ? (
                <Button
                  className="w-full h-12 font-semibold bg-teal-600 hover:bg-teal-700"
                  onClick={handleUnlockAccount}
                  disabled={unlocking}
                >
                  {unlocking ? "Unlocking..." : `🔓 Unlock Account (${UNLOCK_CREDITS_REQUIRED} Credits)`}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button className="w-full h-12 font-semibold" onClick={() => navigate({ to: "/wallet" })}>
                    <Wallet className="h-4 w-4 mr-2" /> Add Credits to Wallet
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    You need {UNLOCK_CREDITS_REQUIRED - balance} more credits to unlock.
                  </p>
                </div>
              )}
            </div>

            <div className="text-left text-xs text-muted-foreground border-t border-border pt-4">
              <p>⚠️ Important:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>After unlocking, your rejection count will reset to 0</li>
                <li>Your free case quota will be reset (you get 2 free cases again)</li>
                <li>
                  If you get {MAX_REJECTIONS_BEFORE_SUSPENSION} rejections again, your account will be suspended again
                </li>
                <li>Each suspension costs {UNLOCK_CREDITS_REQUIRED} credits to unlock</li>
              </ul>
            </div>

            <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/" })}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // ============================================================
  //  MAIN RENDER
  // ============================================================
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Submit a Help Request</h1>
        <p className="text-muted-foreground mb-3">Your first case is FREE. After that, a 1 credit listing fee applies.</p>

        {/* User Stats Banner - Updated with Free Cases Used X/2 and Rejections X/5 */}
        {!loadingUserStats && user && (
          <div className="mb-4 rounded-xl border bg-card p-4 text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-primary/5 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">Total Cases</p>
                <p className="font-bold text-lg">{userTotalCases}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">Rejected</p>
                <p className="font-bold text-lg text-red-600">
                  {userRejectionCount}/{MAX_REJECTIONS_BEFORE_SUSPENSION}
                </p>
                {userRejectionCount >= 3 && userRejectionCount < MAX_REJECTIONS_BEFORE_SUSPENSION && (
                  <p className="text-[10px] text-amber-600">⚠️ Near suspension</p>
                )}
              </div>
              <div className="bg-teal-50 dark:bg-teal-950/20 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">Free Cases Used</p>
                <p className="font-bold text-lg text-teal-600">
                  {userFreeCasesUsed}/{MAX_FREE_CASES}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className={`font-bold text-lg ${isFreeDisabled ? "text-red-600" : "text-teal-600"}`}>
                  {isFreeDisabled ? "🔒 Free Disabled" : "✅ Free Active"}
                </p>
              </div>
            </div>
            {isFreeDisabled && !isSuspended && (
              <div className="mt-2 text-xs text-center text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg p-2">
                ⚠️ Your free case access has been used ({userFreeCasesUsed}/{MAX_FREE_CASES} free cases). You can still submit cases using credits.
              </div>
            )}
            {userRejectionCount >= 3 && userRejectionCount < MAX_REJECTIONS_BEFORE_SUSPENSION && (
              <div className="mt-2 text-xs text-center text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2">
                ⚠️ Warning: {userRejectionCount} rejections. After {MAX_REJECTIONS_BEFORE_SUSPENSION} rejections, your
                account will be suspended.
              </div>
            )}
          </div>
        )}

        <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-2">
          <Languages className="h-4 w-4 shrink-0 mt-0.5" />
          <p>
            <strong>Don't understand English?</strong> In your phone browser menu, tap{" "}
            <strong>"Translate"</strong> to read this page in Urdu or any language.
          </p>
        </div>

        <div className="mb-6 inline-flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
          💰 Your Balance: {balance} Credits
        </div>

        {willBeFree && !isFreeDisabled && (
          <div className="mb-6 rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-300 p-4 flex items-start gap-2">
            <Gift className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-teal-700">🎉 This Case is FREE!</p>
              <p className="text-sm text-teal-700">
                {isFirstCaseFree ? "Your first case is FREE!" : "This category has a FREE offer!"}
                {userFreeCasesUsed > 0 && ` (You've used ${userFreeCasesUsed}/${MAX_FREE_CASES} free cases)`}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                    i + 1 < step
                      ? "bg-primary border-primary text-white"
                      : i + 1 === step
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {i + 1 < step ? "✓" : i + 1}
                </div>
                <span className="text-[9px] mt-1 text-muted-foreground whitespace-nowrap">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-6 mx-1 mb-4 ${i + 1 < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="font-bold text-lg">📝 Basic Information</h2>
            <div className="space-y-2">
              <Label>Help Category *</Label>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v);
                  setInstituteName("");
                  setIsOtherInstitute(false);
                  setRefNumber("");
                  setOtherName("");
                  setOtherContact("");
                  setOtherAddress("");
                  setCatFields({});
                  setCatDocUrls({});
                  setCatDocNames({});
                  setPropertyOwnership("");
                  setGender("");
                  setMaritalStatus("");
                  setIsOrphan("");
                  setOrphanParent("");
                  setSeekerName("");
                  setSeekerContact("");
                  setReceiverName("");
                  setReceiverContact("");
                  setReceiverBank("");
                  setReceiverAccount("");
                  setReceiverAddress("");
                  setReceiverShopName("");
                  setDisabilityMode("");
                  setAmount("");
                  setDebtTotalAmount("");
                  setEduSubType("");
                  setEduAdmissionLevel("");
                  setEduSubFields({});
                }}
              >
                <SelectTrigger className={!category ? "border-red-400" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {willBeFree && !isFreeDisabled && (
                <p className="text-xs text-teal-600 font-medium flex items-center gap-1">
                  <Gift className="h-3 w-3" /> {isFirstCaseFree ? "Your first case is FREE!" : "This category has a FREE offer!"}
                </p>
              )}

              {category && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs">
                  <p className="font-semibold text-primary">
                    📋 {CATEGORY_LIMITS[category]?.label || "Verified Need"}
                  </p>
                  {isFixedAmount(category) && (
                    <p className="text-teal-600 font-bold">
                      💰 Fixed Amount: Rs {getFixedAmountValue(category)?.toLocaleString()}
                    </p>
                  )}
                  {getMaxLimit(category) && (
                    <p className="text-amber-600">
                      ⚠️ Maximum Limit: Rs {getMaxLimit(category)?.toLocaleString()}
                    </p>
                  )}
                  {isDebtCategory(category) && (
                    <p className="text-blue-600">📊 5% of total debt (max Rs 25,000)</p>
                  )}
                  {needsPaymentReceiver && <p className="text-purple-600">📌 Payment receiver details required</p>}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Request Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Help with School Fee"
              />
            </div>
            <div className="space-y-2">
              <Label>Short Description *</Label>
              <Input
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="One line summary"
              />
            </div>
            {/* ============================================================
                COUNTRY & CITY - FIXED: More spacing (gap-6)
                ============================================================ */}
            <div className="grid grid-cols-2 gap-6" style={{ columnGap: "24px" }}>
              <div className="space-y-2">
                <Label>Country *</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className={!country ? "border-red-400" : ""}>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Karachi"
                />
              </div>
            </div>
            {!easy && category && category !== "Disability Support" && !isEducationCategory && (
              <div className="space-y-2">
                <Label>Urgency Level *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Low", "Medium", "High", "Emergency"].map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrgency(u)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                        urgency === u ? "bg-primary text-white border-primary" : "border-border"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(easy && !isEducationCategory) && (
              <p className="text-xs text-muted-foreground">ℹ️ Urgency will be set automatically from your bill's due date.</p>
            )}
            <Button
              className="w-full"
              onClick={() => {
                setTried1(true);
                if (!category || !title.trim() || !shortDesc.trim() || !country.trim() || !city.trim()) {
                  toast.error("Please fill all required fields (marked red)");
                  return;
                }
                if (!easy && category !== "Disability Support" && !isEducationCategory && !urgency) {
                  toast.error("Please choose urgency level");
                  return;
                }
                setStep(2);
              }}
            >
              Continue
            </Button>
            <StepGuide
              lines={[
                "Choose the category that matches your need.",
                "Write a short title and one-line description.",
                "Enter your country and city, then tap Continue.",
              ]}
            />
          </div>
        )}

        {/* STEP 2 - باقی کوڈ ویسے کا ویسے ہے، صرف یہاں تک درست ہے */}
        {step === 2 && (
          <div className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="font-bold text-lg">🗂 {category || "Category"} — Details</h2>

            {/* JOB STATUS */}
            <div className="pt-2 space-y-3 border-t border-border">
              <Label>Do you have a job? *</Label>
              <div className="grid grid-cols-2 gap-2">
                {["Yes", "No"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setJobStatus(opt as any)}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                      jobStatus === opt ? "bg-primary text-white border-primary" : "border-border"
                    }`}
                  >
                    {opt === "Yes" ? "✅ Yes, I have a job" : "❌ No job"}
                  </button>
                ))}
              </div>
              {jobStatus === "Yes" && (
                <div className="pt-2 space-y-2">
                  <div className="rounded-xl border border-teal-300 bg-teal-50 dark:bg-teal-950/20 p-3 space-y-2">
                    <p className="text-xs font-medium text-teal-700">📎 Required Documents (Job)</p>
                    {docBox("salary_slip", "Last 6 Months Salary Slip", true)}
                    {docBox("statement", "Last 6 Months Bank Statement", true, "Bank, EasyPaisa or JazzCash", ".pdf,image/*")}
                  </div>
                </div>
              )}
              {jobStatus === "No" && (
                <div className="pt-2 space-y-2">
                  <div className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3 space-y-2">
                    <p className="text-xs font-medium text-amber-700">📎 Required Document (No Job)</p>
                    {docBox("statement", "Last 6 Months Bank Statement", true, "Bank, EasyPaisa or JazzCash", ".pdf,image/*")}
                  </div>
                </div>
              )}
            </div>

            {/* GENDER */}
            <div className="pt-2 space-y-3 border-t border-border">
              <div className="space-y-2">
                <Label>Gender *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {GENDER_OPTIONS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g as any)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                        gender === g ? "bg-primary text-white border-primary" : "border-border"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {(gender === "Male" || gender === "Female") && (
                <div className="space-y-2">
                  <Label>Marital Status *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {MARITAL_STATUS_OPTIONS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMaritalStatus(m as any)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                          maritalStatus === m ? "bg-primary text-white border-primary" : "border-border"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {gender === "Female" && (
                <>
                  <div className="space-y-2">
                    <Label>Are you an orphan? *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Yes", "No"].map((o) => (
                        <button
                          key={o}
                          type="button"
                          onClick={() => setIsOrphan(o as any)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                            isOrphan === o ? "bg-primary text-white border-primary" : "border-border"
                          }`}
                        >
                          {o === "Yes" ? "✅ Yes, I am an orphan" : "❌ No, I am not an orphan"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {isOrphan === "Yes" && (
                    <div className="space-y-2">
                      <Label>Which parent passed away? *</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {["Father", "Mother", "Both"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setOrphanParent(p as any)}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                              orphanParent === p ? "bg-primary text-white border-primary" : "border-border"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {gender === "Child" && (
                <div className="space-y-2">
                  <Label>Is this child an orphan? *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Yes", "No"].map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setIsOrphan(o as any)}
                        className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                          isOrphan === o ? "bg-primary text-white border-primary" : "border-border"
                        }`}
                      >
                        {o === "Yes" ? "✅ Yes, child is orphan" : "❌ No, child is not orphan"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* GENDER BASED DOCS */}
            {gender && extraConditionalDocs().length > 0 && (
              <div className="pt-2 space-y-3 border-t border-border">
                <p className="text-sm font-semibold text-foreground">📎 Required Documents — Based on Your Profile</p>
                {extraConditionalDocs().map((d) => docBox(d.key, d.label, true, d.hint))}
              </div>
            )}

            {/* SEEKER DETAILS */}
            {renderSeekerDetails()}

            {/* PAYMENT RECEIVER DETAILS */}
            {renderPaymentReceiverDetails()}

            {/* UTILITY CATEGORIES */}
            {utilCfg && (
              <>
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-700 dark:text-red-400 font-medium">
                  ⚠️ One case = ONE bill only.
                </div>
                <div className="space-y-2">
                  <Label>Select Your Company *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {utilCfg.companies.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => {
                          setInstituteName(c.name);
                          setIsOtherInstitute(false);
                        }}
                        className={`px-3 py-2.5 rounded-lg border text-xs font-medium text-left ${
                          instituteName === c.name ? "bg-primary text-white border-primary" : "border-border"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                {selectedCompany && (
                  <>
                    <div className="space-y-2">
                      <Label>{selectedCompany.ref} *</Label>
                      <Input
                        value={refNumber}
                        onChange={(e) => setRefNumber(e.target.value)}
                        placeholder={selectedCompany.refHint}
                      />
                      <p className="text-[11px] text-muted-foreground">💡 {selectedCompany.refHint}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Bill Owner Name (as on bill) *</Label>
                      <Input
                        value={catFields.bill_owner_name || ""}
                        onChange={(e) => setCatFields((p) => ({ ...p, bill_owner_name: e.target.value }))}
                        placeholder="e.g. Muhammad Ali"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        💡 Enter the name exactly as it appears on the bill.
                      </p>
                    </div>
                  </>
                )}
                {docBox("bill", "Bill Photo (clear & readable)", true, "Bill par consumer/reference number aur amount saaf nazar aana chahiye")}
              </>
            )}

            {/* LIST CATEGORIES (non-Education) */}
            {listCfg && !isEducationCategory && (
              <>
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-700 dark:text-red-400 font-medium">
                  ⚠️ One case = ONE {category.includes("Medic") ? "patient" : "student"} only.
                </div>
                {!isOtherInstitute && !instituteName && (
                  <div className="space-y-2">
                    <Label>Search & Select Your Institute *</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        value={instituteSearch}
                        onChange={(e) => setInstituteSearch(e.target.value)}
                        placeholder="Type institute name..."
                        className="pl-9"
                      />
                    </div>
                    {instituteSearch.trim().length >= 2 && (
                      <div className="rounded-xl border border-border divide-y divide-border overflow-hidden max-h-48 overflow-y-auto">
                        {filteredInstitutes.map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => {
                              setInstituteName(n);
                              setInstituteSearch("");
                            }}
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5"
                          >
                            {n}
                          </button>
                        ))}
                        {filteredInstitutes.length === 0 && (
                          <p className="px-3 py-2.5 text-sm text-muted-foreground">No match found.</p>
                        )}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsOtherInstitute(true)}
                      className="text-xs text-primary font-medium underline"
                    >
                      My institute is not in the list — add manually
                    </button>
                  </div>
                )}
                {instituteName && !isOtherInstitute && (
                  <div className="rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-300 p-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-teal-700">
                      ✓ {instituteName} <span className="text-[10px]">(1Bill listed)</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => setInstituteName("")}
                      className="text-xs text-primary underline shrink-0"
                    >
                      Change
                    </button>
                  </div>
                )}
                {isOtherInstitute && (
                  <div className="space-y-3 rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Institute (not in list)</p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtherInstitute(false);
                          setOtherName("");
                          setOtherContact("");
                          setOtherAddress("");
                        }}
                        className="text-xs text-primary underline"
                      >
                        Back to list
                      </button>
                    </div>
                    <div className="space-y-2">
                      <Label>Institute Full Name *</Label>
                      <Input
                        value={otherName}
                        onChange={(e) => setOtherName(e.target.value)}
                        placeholder="Complete official name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Institute Contact Number *</Label>
                      <Input
                        value={otherContact}
                        onChange={(e) => setOtherContact(e.target.value)}
                        placeholder="Office number — Givethra will verify"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Institute Address (City, Area, Street) *</Label>
                      <Textarea
                        value={otherAddress}
                        onChange={(e) => setOtherAddress(e.target.value)}
                        placeholder="e.g. Main Boulevard, Gulberg 3, Lahore"
                        rows={2}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        💡 Please provide complete address so Givethra can verify the institute's location.
                      </p>
                    </div>
                  </div>
                )}
                {(instituteName || isOtherInstitute) && (
                  <>
                    {listCfg.personFields.map((f) => (
                      <div key={f.key} className="space-y-2">
                        <Label>
                          {f.label} {f.required && "*"}
                        </Label>
                        <Input
                          value={catFields[f.key] ?? ""}
                          onChange={(e) => setCatFields((p) => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder || f.label}
                        />
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label>{listCfg.refLabel}</Label>
                      <Input
                        value={refNumber}
                        onChange={(e) => setRefNumber(e.target.value)}
                        placeholder={listCfg.refHint}
                      />
                      <p className="text-[11px] text-muted-foreground">💡 {listCfg.refHint}</p>
                    </div>
                    {docBox("bill", listCfg.billLabel, true)}

                    {listCfg.extraDocs &&
                      listCfg.extraDocs.map((doc) => docBox(doc.key, doc.label, doc.required, doc.hint))}

                    {category === "Medical & Treatment" &&
                      docBox(
                        "doctor_prescription",
                        "Doctor's Written Prescription / Report",
                        true,
                        "Doctor ne apne haath se ya letterhead par jo likh kar diya hai — uski clear photo"
                      )}
                  </>
                )}
              </>
            )}

            {/* EDUCATION CATEGORIES */}
            {isEducationCategory && renderEducationCategory()}

            {/* NON-EASY CONFIG */}
            {!easy && config && category !== "Disability Support" && !isEducationCategory && (
              <>
                {cfgOneCase && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-700 dark:text-red-400 font-medium">
                    ⚠️ {cfgOneCase}
                  </div>
                )}
                {cfgFields
                  .filter((f) => {
                    if (f.key === "job_status") return false;
                    if (SKIP_FIELDS.has(f.key)) return false;
                    return true;
                  })
                  .map((f) => renderField(f))}

                <div className="pt-2 space-y-3 border-t border-border">
                  <p className="text-sm font-semibold text-foreground">📎 Required Documents</p>
                  {cfgDocs
                    .filter((d) => d.key !== "salary_slip" && d.key !== "statement")
                    .map((d) => docBox(d.key, d.label, !!d.required, d.hint))}
                </div>
              </>
            )}

            {/* DISABILITY SUPPORT */}
            {category === "Disability Support" && (
              <div className="space-y-4 rounded-xl border-2 border-amber-300 bg-amber-50/30 dark:bg-amber-950/10 p-4">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  📎 First — Required Documents (Upload these first)
                </p>
                {docBox(
                  "disability_cnic",
                  "CNIC showing Disability (or Disability Certificate)",
                  true,
                  "REQUIRED — CNIC that marks the person as disabled, or an official disability certificate"
                )}
                {docBox("disability_photo", "Clear Photo of Disability", true, "A clear photo showing the disability, for verification")}

                <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-bold mb-3">What kind of help is needed? *</p>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { v: "product", l: "🦽 Equipment / Product (e.g. wheelchair, hearing aid)" },
                      { v: "treatment", l: "🏥 Hospital Treatment" },
                      { v: "stipend", l: `💰 Monthly Stipend (Rs ${DISABILITY_STIPEND_AMOUNT})` },
                    ].map((o) => (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => setDisabilityMode(o.v as any)}
                        className={`px-3 py-2.5 rounded-lg border text-sm font-medium text-left ${
                          disabilityMode === o.v ? "bg-primary text-white border-primary" : "border-border"
                        }`}
                      >
                        {o.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Type of Disability *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CHOICE_FIELDS.disability_type.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDisabilityType(opt)}
                        className={`px-2 py-2 rounded-lg border text-xs font-medium text-left ${
                          disabilityType === opt ? "bg-primary text-white border-primary" : "border-border"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {disabilityMode === "product" && (
                  <div className="space-y-3 rounded-xl border border-border p-3 bg-card">
                    <p className="text-sm font-semibold text-teal-700">🛒 Product — Shop Details</p>
                    <p className="text-xs text-muted-foreground">Enter the shop where you'll buy the equipment.</p>
                    <div className="space-y-2">
                      <Label>Shop Name *</Label>
                      <Input
                        value={disabilityShopName}
                        onChange={(e) => setDisabilityShopName(e.target.value)}
                        placeholder="Shop name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Shop Contact Number *</Label>
                      <Input
                        value={disabilityShopContact}
                        onChange={(e) => setDisabilityShopContact(e.target.value)}
                        placeholder="Phone number"
                      />
                    </div>
                    {docBox("product_receipt", "Shop Quotation / Price Estimate", true, "Photo of the shop's quotation showing the product & price")}
                  </div>
                )}

                {disabilityMode === "treatment" && (
                  <div className="space-y-3 rounded-xl border border-border p-3 bg-card">
                    <p className="text-sm font-semibold text-teal-700">🏥 Treatment — Select Hospital</p>
                    {!disabilityHospitalOther && !disabilityHospital && (
                      <div className="space-y-2">
                        <Label>Search & Select Hospital *</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            value={disabilityHospitalSearch}
                            onChange={(e) => setDisabilityHospitalSearch(e.target.value)}
                            placeholder="Type hospital name..."
                            className="pl-9"
                          />
                        </div>
                        {disabilityHospitalSearch.trim().length >= 2 && (
                          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden max-h-48 overflow-y-auto">
                            {HEALTH_INSTITUTES.filter((n) =>
                              n.toLowerCase().includes(disabilityHospitalSearch.toLowerCase())
                            )
                              .slice(0, 8)
                              .map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => {
                                    setDisabilityHospital(n);
                                    setDisabilityHospitalSearch("");
                                  }}
                                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary/5"
                                >
                                  {n}
                                </button>
                              ))}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => setDisabilityHospitalOther(true)}
                          className="text-xs text-primary font-medium underline"
                        >
                          My hospital is not in the list — add manually
                        </button>
                      </div>
                    )}
                    {disabilityHospital && !disabilityHospitalOther && (
                      <div className="rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-300 p-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-teal-700">✓ {disabilityHospital}</p>
                        <button
                          type="button"
                          onClick={() => setDisabilityHospital("")}
                          className="text-xs text-primary underline shrink-0"
                        >
                          Change
                        </button>
                      </div>
                    )}
                    {disabilityHospitalOther && (
                      <div className="space-y-2">
                        <Label>Hospital Name *</Label>
                        <Input
                          value={disabilityHospital}
                          onChange={(e) => setDisabilityHospital(e.target.value)}
                          placeholder="Full hospital name"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDisabilityHospitalOther(false);
                            setDisabilityHospital("");
                          }}
                          className="text-xs text-primary underline"
                        >
                          Back to list
                        </button>
                      </div>
                    )}
                    <div className="pt-2 space-y-3 border-t border-border">
                      <div className="space-y-2">
                        <Label>Treatment Amount *</Label>
                        <Input
                          type="number"
                          value={treatmentAmount}
                          onChange={(e) => setTreatmentAmount(e.target.value)}
                          placeholder="Total amount on hospital bill"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bill Expiry Date *</Label>
                        <Input
                          type="date"
                          value={treatmentExpiry}
                          onChange={(e) => setTreatmentExpiry(e.target.value)}
                        />
                      </div>
                      {treatmentExpiry && (
                        <p className="text-xs font-medium">
                          Urgency (auto):{" "}
                          <span
                            className={
                              treatmentAutoUrgency === "Emergency"
                                ? "text-red-600"
                                : treatmentAutoUrgency === "Medium"
                                ? "text-orange-600"
                                : "text-teal-600"
                            }
                          >
                            {treatmentAutoUrgency}
                          </span>
                        </p>
                      )}
                      <div className="space-y-2">
                        <Label>Patient / Bill Number *</Label>
                        <Input
                          value={treatmentPatientNumber}
                          onChange={(e) => setTreatmentPatientNumber(e.target.value)}
                          placeholder="Patient number or bill number from hospital"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {disabilityMode === "stipend" && (
                  <div className="space-y-3 rounded-xl border border-border p-3 bg-card">
                    <p className="text-sm font-semibold text-teal-700">💰 Monthly Stipend — Rs {DISABILITY_STIPEND_AMOUNT}</p>
                    <p className="text-xs text-muted-foreground">This amount will be sent directly to your own account.</p>
                    <div className="space-y-2">
                      <Label>Account Title *</Label>
                      <Input
                        value={disabilityBankTitle}
                        onChange={(e) => setDisabilityBankTitle(e.target.value)}
                        placeholder="Your name as on account"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Account / EasyPaisa / JazzCash Number *</Label>
                      <Input
                        value={disabilityBankNumber}
                        onChange={(e) => setDisabilityBankNumber(e.target.value)}
                        placeholder="Account number"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROPERTY OWNERSHIP */}
            {PROPERTY_RELEVANT_CATS.has(category) && !isEducationCategory && (
              <div className="pt-4 border-t border-border space-y-3">
                <Label className="font-semibold">🏠 Property Ownership *</Label>
                <p className="text-xs text-muted-foreground">
                  Is the property where you live owned by you or are you a tenant (renting)?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPropertyOwnership("owned")}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                      propertyOwnership === "owned" ? "bg-primary text-white border-primary" : "border-border"
                    }`}
                  >
                    🏠 Owned
                  </button>
                  <button
                    type="button"
                    onClick={() => setPropertyOwnership("rented")}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium ${
                      propertyOwnership === "rented" ? "bg-primary text-white border-primary" : "border-border"
                    }`}
                  >
                    🏢 Rented (Tenant)
                  </button>
                </div>
                {propertyOwnership === "rented" && (
                  <div className="space-y-3 pt-2">
                    <p className="text-sm font-semibold text-foreground">📎 Tenant Documents (Required)</p>
                    {docBox(
                      "rental_agreement",
                      "Rental Agreement / Contract",
                      true,
                      "Jis ghar mein rehte hain, uska rent agreement ya lease document (clear photo)"
                    )}
                    {docBox(
                      "landlord_cnic",
                      "Landlord's CNIC (or any proof of landlord ownership)",
                      true,
                      "Malik ka CNIC ya koi aur dastawez jo yeh sabit kare ke yeh property unki hai"
                    )}
                  </div>
                )}
                {propertyOwnership === "owned" && (
                  <div className="space-y-3 pt-2">
                    <Label>House is in whose name? *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Myself", "Father", "Mother"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setCatFields((p) => ({ ...p, owner_relation: opt }))}
                          className={`px-2 py-2 rounded-lg border text-xs font-medium ${
                            catFields.owner_relation === opt ? "bg-primary text-white border-primary" : "border-border"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {docBox(
                      "owner_cnic",
                      `${catFields.owner_relation || "Owner"}'s CNIC`,
                      true,
                      "CNIC of the person whose name the house/utility bill is registered under"
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PAYMENT RECEIVER (for other categories) */}
            {renderPaymentReceiver()}

            {/* ============================================================
                AMOUNT SECTION - WITH POLICY
                ============================================================ */}
            <div className="pt-2 space-y-3 border-t border-border">
              <div className="space-y-2">
                <Label>Why do you need this help? Explain your situation *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Apni poori situation aur majboori yahan likhein — Heroes yehi parh kar madad karte hain. Jitna detail mein likhenge, utna behtar samjhenge aur madad karenge."
                />
                <p className="text-[11px] text-muted-foreground">
                  💡 Write in detail so Heroes understand your situation and can help better.
                </p>
              </div>

              {/* ===== AMOUNT FIELD - Conditional ===== */}
              {isFixedAmount(category) ? (
                <div className="rounded-xl bg-teal-50 dark:bg-teal-950/20 border border-teal-300 p-4">
                  <p className="text-sm font-semibold text-teal-700">💰 Fixed Amount</p>
                  <p className="text-lg font-bold text-teal-700">
                    Rs {getFixedAmountValue(category)?.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">This amount is fixed for this category. You cannot change it.</p>
                </div>
              ) : isDebtCategory(category) ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-300 p-4">
                    <p className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                      <Calculator className="h-4 w-4" /> 5% of Total Debt (Max Rs 25,000)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your total outstanding debt below. Givethra will automatically calculate 5% of it.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Total Outstanding Debt Amount *</Label>
                    <div className="flex gap-2">
                      <div className="w-28">
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {CASE_CURRENCIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
                          {sym}
                        </span>
                        <Input
                          type="number"
                          value={debtTotalAmount}
                          onChange={(e) => setDebtTotalAmount(e.target.value)}
                          placeholder="e.g. 500000"
                          className="pl-12"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">💡 Enter your total debt amount (e.g. 500,000 for 5 lakh)</p>
                  </div>
                  {debtTotalAmount && parseFloat(debtTotalAmount) > 0 && (
                    <div className="rounded-xl bg-primary/5 border border-primary/20 p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Calculated 5% Amount:</span>
                        <span className="text-lg font-bold text-primary">
                          {sym} {calculatedDebtAmount.toLocaleString()}
                          {calculatedDebtAmount >= 25000 && (
                            <span className="text-xs text-amber-600 ml-2">(Max limit reached)</span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>5% of {parseFloat(debtTotalAmount).toLocaleString()}</span>
                        <span>Max: Rs 25,000</span>
                      </div>
                    </div>
                  )}
                  <input type="hidden" value={amount} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Amount Needed *</Label>
                  <div className="flex gap-2">
                    <div className="w-28">
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {CASE_CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none">
                        {sym}
                      </span>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="e.g. 31000"
                        className="pl-12"
                      />
                    </div>
                  </div>
                  {getMaxLimit(category) && (
                    <p className="text-xs text-amber-600">⚠️ Maximum allowed: Rs {getMaxLimit(category)?.toLocaleString()}</p>
                  )}
                  {category === "Education, Books & Admission" && eduSubType === "admission" && (
                    <p className="text-xs text-muted-foreground">💡 Enter the admission fee / installment amount from your challan.</p>
                  )}
                  {category === "School, College & University Fees" && (
                    <p className="text-xs text-muted-foreground">💡 Enter the 1 month fee amount from your challan.</p>
                  )}
                  {category === "Food & Groceries" && (
                    <p className="text-xs text-muted-foreground">💡 Maximum Rs 12,000 per family.</p>
                  )}
                  {category === "Home Repair" && (
                    <p className="text-xs text-muted-foreground">💡 Maximum Rs 18,000.</p>
                  )}
                  {category === "Business / Work Help" && (
                    <p className="text-xs text-muted-foreground">💡 Rs 8,000–20,000 based on verified need.</p>
                  )}
                  {needsPaymentReceiver && (
                    <p className="text-xs text-purple-600">💡 This amount will be sent to the {getReceiverLabel()}.</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>{easy ? "Bill / Challan Due Date (Expiry) *" : "Expected Resolution Date"}</Label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                {easy && deadline && (
                  <p className="text-xs font-medium">
                    Urgency (auto):{" "}
                    <span
                      className={
                        autoUrgency === "Emergency"
                          ? "text-red-600"
                          : autoUrgency === "Medium"
                          ? "text-orange-600"
                          : "text-teal-600"
                      }
                    >
                      {autoUrgency}
                    </span>
                  </p>
                )}
                {easy && (
                  <p className="text-[11px] text-muted-foreground">
                    ⚠️ If the due date passes and the case is not completed, the case will EXPIRE. Givethra verifies this date
                    from your bill.
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setTried2(true);
                  if (uploadingDoc) {
                    toast.error("Please wait — a document is still uploading.");
                    return;
                  }
                  const err = validateStep2();
                  if (err) {
                    toast.error(err);
                    return;
                  }
                  setStep(3);
                }}
              >
                Continue
              </Button>
            </div>
            <StepGuide
              lines={[
                "Answer the job question first.",
                "Select your gender and provide required documents.",
                "Fill your personal details (Seeker).",
                ...(needsPaymentReceiver
                  ? [
                      `Fill the ${getReceiverLabel()} payment details completely.`,
                      "Provide full name, contact, bank details, and address.",
                    ]
                  : []),
                ...(isEducationCategory
                  ? [
                      "For Education, first select what you need.",
                      "Search and select your institute from the list, or add manually.",
                      "If adding manually, provide FULL NAME, CONTACT, and ADDRESS.",
                      "Fill all required fields and attach documents.",
                    ]
                  : []),
                ...(isFixedAmount(category)
                  ? [`💰 This category has a FIXED amount of Rs ${getFixedAmountValue(category)?.toLocaleString()}.`]
                  : isDebtCategory(category)
                  ? [
                      "📊 Enter your total debt amount.",
                      "5% will be automatically calculated.",
                      "Maximum assistance is Rs 25,000.",
                    ]
                  : [
                      "💰 Enter the verified amount needed.",
                      ...(getMaxLimit(category) ? [`⚠️ Maximum limit: Rs ${getMaxLimit(category)?.toLocaleString()}`] : []),
                    ]),
                "Finally, explain your situation, amount, and expiry date.",
                ...COMMON_GUIDE_TAIL,
              ]}
            />
          </div>
        )}

        {/* ===== STEP 3 - Identity Verification ===== */}
        {step === 3 && (
          <div className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="font-bold text-lg">🛡 Identity Verification</h2>

            {/* ===== LIVE SELFIE ===== */}
            <div className="space-y-2">
              <Label className="font-semibold">📸 Live Selfie *</Label>
              <p className="text-xs text-muted-foreground">
                Take a clear selfie to verify your identity. This must be a live photo, not a pre-existing image.
              </p>

              {!selfiePreview ? (
                <div className="space-y-3">
                  {!cameraOn ? (
                    <Button onClick={startCamera} className="w-full" variant="outline">
                      <Camera className="h-4 w-4 mr-2" /> Open Camera for Selfie
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl border" />
                      <Button onClick={takeSelfie} className="w-full">
                        <Camera className="h-4 w-4 mr-2" /> Take Selfie
                      </Button>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              ) : (
                <div className="space-y-3">
                  <img src={selfiePreview} alt="Selfie" className="w-full rounded-xl border max-h-48 object-cover" />
                  {uploadingSelfie && <p className="text-xs text-amber-600">⏳ Uploading selfie...</p>}
                  {selfieUrl && !uploadingSelfie && (
                    <p className="text-xs text-teal-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Selfie ready ✓
                    </p>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => {
                    setSelfiePreview(null);
                    setSelfieUrl("");
                  }}>
                    Retake Selfie
                  </Button>
                </div>
              )}
            </div>

            {/* ===== VIDEO STATEMENT ===== */}
            <div className="space-y-2">
              <Label className="font-semibold">🎥 Video Statement (60 Seconds)</Label>
              <p className="text-xs text-muted-foreground">
                <strong>Explain the following details clearly in your video statement:</strong>
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 ml-2">
                <li>What challenge are you facing and why do you need help?</li>
                <li>What is your financial situation and how does this impact your daily life?</li>
                <li>What do you hope to achieve with this support?</li>
              </ul>
              <p className="text-xs text-amber-600 mt-1">
                ⚠️ <strong>The video must be up to 60 seconds (1 minute) to keep file size under 50 MB.</strong>
              </p>

              {!videoPreview ? (
                <div className="space-y-3">
                  {!videoRecording ? (
                    <Button onClick={startVideoRecording} className="w-full" variant="outline">
                      🎥 Start Recording (max 60 sec)
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative bg-black/5 rounded-xl overflow-hidden border-2 border-primary/30">
                        <video
                          ref={liveVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full aspect-video object-cover"
                        />
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                          ● Live
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-500">
                          ● Recording... {videoTimer}s / 60s
                        </span>
                        <Button size="sm" variant="destructive" onClick={stopVideoRecording}>
                          Stop
                        </Button>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${(videoTimer / 60) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-amber-600">⏳ Max 60 seconds to keep file under 50MB</p>
                      {videoTimer >= 50 && <p className="text-xs text-red-600 font-bold">⚠️ Will auto-stop at 60 seconds!</p>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <video src={videoPreview} controls className="w-full rounded-xl border max-h-48" />
                  {uploadingVideo && <p className="text-xs text-amber-600">⏳ Uploading video...</p>}
                  {videoUrl && !uploadingVideo && (
                    <p className="text-xs text-teal-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Video ready ✓
                    </p>
                  )}
                  <Button variant="outline" className="w-full" onClick={() => {
                    setVideoPreview(null);
                    setVideoUrl("");
                  }}>
                    Re-record Video
                  </Button>
                </div>
              )}
            </div>

            {/* ===== CONFIRM CHECKBOX ===== */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="confirm"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="confirm" className="text-sm">
                I confirm all information is true and accurate
              </label>
            </div>

            {/* ===== NAVIGATION ===== */}
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (uploadingSelfie || uploadingVideo) {
                    toast.error("Please wait — upload in progress.");
                    return;
                  }
                  if (!selfieUrl) {
                    toast.error("Please take a live selfie");
                    return;
                  }
                  if (!videoUrl) {
                    toast.error("Please record a video appeal (60 seconds)");
                    return;
                  }
                  if (!confirmed) {
                    toast.error("Please confirm the information is true");
                    return;
                  }
                  setStep(4);
                }}
              >
                Continue
              </Button>
            </div>

            <StepGuide
              lines={[
                "Take a clear live selfie in good lighting.",
                "Record a 60-second video explaining your situation in detail.",
                "Tell Heroes what problem you're facing and why you need help.",
                "Explain your financial situation and how this help will make a difference.",
                "Wait for 'ready ✓', tick the confirm box, then Continue.",
              ]}
            />
          </div>
        )}

        {/* ===== STEP 4 - Review & Submit ===== */}
        {step === 4 && (
          <div className="rounded-2xl border bg-card p-6 space-y-5">
            <h2 className="font-bold text-lg">✅ Review & Submit</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{category}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium">{title}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Location</span>
                <span className="font-medium">
                  {city}, {country}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Urgency</span>
                <span className="font-medium">
                  {easy ? (autoUrgency || "—") + " (auto)" : urgency}
                </span>
              </div>

              {isFixedAmount(category) ? (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Amount (Fixed)</span>
                  <span className="font-medium text-teal-600">
                    Rs {getFixedAmountValue(category)?.toLocaleString()}
                  </span>
                </div>
              ) : isDebtCategory(category) ? (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Debt</span>
                  <span className="font-medium">
                    {sym} {parseFloat(debtTotalAmount || "0").toLocaleString()} {currency}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    {sym} {amount} {currency}
                  </span>
                </div>
              )}

              {isDebtCategory(category) && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">5% Assistance Amount</span>
                  <span className="font-medium text-primary font-bold">
                    {sym} {calculatedDebtAmount.toLocaleString()} {currency}
                  </span>
                </div>
              )}

              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Expiry</span>
                <span className="font-medium">{deadline}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Job Status</span>
                <span className="font-medium">{jobStatus || "—"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Gender</span>
                <span className="font-medium">{gender || "—"}</span>
              </div>
              {(gender === "Male" || gender === "Female") && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Marital Status</span>
                  <span className="font-medium">{maritalStatus || "—"}</span>
                </div>
              )}
              {gender === "Female" && (
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Orphan</span>
                    <span className="font-medium">{isOrphan || "—"}</span>
                  </div>
                  {isOrphan === "Yes" && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Orphan Parent</span>
                      <span className="font-medium">{orphanParent || "—"}</span>
                    </div>
                  )}
                </>
              )}
              {gender === "Child" && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Orphan</span>
                  <span className="font-medium">{isOrphan || "—"}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Seeker</span>
                <span className="font-medium">{seekerName || "—"}</span>
              </div>

              {/* Payment Receiver Review */}
              {needsPaymentReceiver && (
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">{getReceiverLabel()}</span>
                    <span className="font-medium">{receiverName || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Receiver Contact</span>
                    <span className="font-medium">{receiverContact || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Receiver Bank</span>
                    <span className="font-medium">{receiverBank || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Receiver Account</span>
                    <span className="font-medium">{receiverAccount || "—"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Receiver Address</span>
                    <span className="font-medium">{receiverAddress || "—"}</span>
                  </div>
                  {(category === "Food & Groceries" || category === "Medicines" || category === "Home Repair") && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Shop Name</span>
                      <span className="font-medium">{receiverShopName || "—"}</span>
                    </div>
                  )}
                </>
              )}

              {shouldShowPaymentReceiver() && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Payment Receiver</span>
                  <span className="font-medium">{receiverName || "—"}</span>
                </div>
              )}

              {isEducationCategory && (
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Help Type</span>
                    <span className="font-medium">
                      {category === "Education, Books & Admission"
                        ? eduSubType === "admission"
                          ? "🎓 Admission"
                          : eduSubType === "books"
                          ? "📚 Books"
                          : eduSubType === "uniform"
                          ? "👕 Uniform"
                          : "—"
                        : eduSubType === "school"
                        ? "🏫 School Fee"
                        : eduSubType === "college"
                        ? "🎓 College Fee"
                        : eduSubType === "university"
                        ? "🏛️ University Fee"
                        : "—"}
                    </span>
                  </div>
                  {category === "Education, Books & Admission" && eduSubType === "admission" && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Admission Level</span>
                      <span className="font-medium">{eduAdmissionLevel || "—"}</span>
                    </div>
                  )}
                  {Object.keys(eduSubFields).length > 0 && (
                    <>
                      {Object.entries(eduSubFields).map(([key, value]) => (
                        <div key={key} className="flex justify-between border-b pb-2">
                          <span className="text-muted-foreground">{key.replace(/_/g, " ").toUpperCase()}</span>
                          <span className="font-medium">{value || "—"}</span>
                        </div>
                      ))}
                    </>
                  )}
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Institute</span>
                    <span className="font-medium">{isOtherInstitute ? otherName : instituteName || "—"}</span>
                  </div>
                  {isOtherInstitute && (
                    <>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Institute Contact</span>
                        <span className="font-medium">{otherContact || "—"}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Institute Address</span>
                        <span className="font-medium">{otherAddress || "—"}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {category === "Disability Support" && (
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Disability Type</span>
                    <span className="font-medium">{disabilityType}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Disability Mode</span>
                    <span className="font-medium capitalize">{disabilityMode}</span>
                  </div>
                  {disabilityMode === "product" && (
                    <>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Shop</span>
                        <span className="font-medium">{disabilityShopName}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Shop Contact</span>
                        <span className="font-medium">{disabilityShopContact}</span>
                      </div>
                    </>
                  )}
                  {disabilityMode === "treatment" && (
                    <>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Hospital</span>
                        <span className="font-medium">{disabilityHospital}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Treatment Amount</span>
                        <span className="font-medium">{treatmentAmount}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Expiry Date</span>
                        <span className="font-medium">{treatmentExpiry}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Urgency (auto)</span>
                        <span className="font-medium">{treatmentAutoUrgency}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Patient/Bill No.</span>
                        <span className="font-medium">{treatmentPatientNumber}</span>
                      </div>
                    </>
                  )}
                  {disabilityMode === "stipend" && (
                    <>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Stipend Amount</span>
                        <span className="font-medium">Rs {DISABILITY_STIPEND_AMOUNT}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Bank Title</span>
                        <span className="font-medium">{disabilityBankTitle}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-muted-foreground">Bank Number</span>
                        <span className="font-medium">{disabilityBankNumber}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {easy && !isEducationCategory && (
                <>
                  <div className="flex justify-between border-b pb-2 gap-2">
                    <span className="text-muted-foreground shrink-0">Institute / Company</span>
                    <span className="font-medium text-right">
                      {isOtherInstitute ? otherName : instituteName}
                    </span>
                  </div>
                  {isOtherInstitute && (
                    <>
                      <div className="flex justify-between border-b pb-2 gap-2">
                        <span className="text-muted-foreground shrink-0">Institute Contact</span>
                        <span className="font-medium text-right">{otherContact}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2 gap-2">
                        <span className="text-muted-foreground shrink-0">Institute Address</span>
                        <span className="font-medium text-right">{otherAddress}</span>
                      </div>
                    </>
                  )}
                  {refNumber && (
                    <div className="flex justify-between border-b pb-2 gap-2">
                      <span className="text-muted-foreground shrink-0">Reference No</span>
                      <span className="font-mono font-medium text-right">{refNumber}</span>
                    </div>
                  )}
                </>
              )}
              {!easy &&
                cfgFields
                  .filter((f) => f.key !== "job_status" && !SKIP_FIELDS.has(f.key) && catFields[f.key])
                  .map((f) => (
                    <div key={f.key} className="flex justify-between border-b pb-2 gap-2">
                      <span className="text-muted-foreground shrink-0">{f.label}</span>
                      <span className="font-medium text-right">{catFields[f.key]}</span>
                    </div>
                  ))}
              {PROPERTY_RELEVANT_CATS.has(category) && !isEducationCategory && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Property</span>
                  <span className="font-medium">
                    {propertyOwnership === "owned" ? "Owned" : propertyOwnership === "rented" ? "Rented" : "—"}
                  </span>
                </div>
              )}
              {propertyOwnership === "rented" && (
                <>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Rental Agreement</span>
                    <span className="font-medium text-teal-600">{catDocUrls["rental_agreement"] ? "✓" : "✗"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Landlord's CNIC</span>
                    <span className="font-medium text-teal-600">{catDocUrls["landlord_cnic"] ? "✓" : "✗"}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Documents</span>
                <span className="font-medium">{Object.keys(catDocUrls).length} uploaded ✓</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Selfie</span>
                <span className="font-medium text-teal-600">{selfieUrl ? "✓ Done" : "—"}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Video</span>
                <span className="font-medium text-teal-600">{videoUrl ? "✓ Done" : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listing Fee</span>
                {willBeFree ? (
                  <span className="font-bold text-teal-600">
                    FREE 🎉 {isFirstCaseFree ? "(First Case)" : `(${offer?.label || "Offer"})`}
                  </span>
                ) : (
                  <span className="font-bold text-primary">1 Credit</span>
                )}
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
              Edit
            </Button>
            <Button className="w-full h-11 font-semibold" disabled={submitting} onClick={handleSubmit}>
              {submitting ? "Submitting..." : willBeFree ? "Submit Request — FREE 🎉" : "Pay 1 Credit & Submit Request"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep(3)}>
              Back
            </Button>
            <StepGuide
              lines={[
                "Check all details are correct. Tap Edit to fix anything.",
                willBeFree ? "Your case is FREE." : "A 1 Credit fee is charged when you submit.",
                "Tap Submit. Our team will review and approve your case.",
              ]}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
