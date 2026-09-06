// src/frontend/src/pages/submit-request/SubmitRequestWizard.tsx
// مرکزی کنٹرولر — تمام state اور logic یہاں رہے گی
// ہر step کو ایک الگ component کے ذریعے render کیا جائے گا

import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// تمام steps import کریں
import Step01_CategorySelect from "./steps/Step01_CategorySelect";
import Step02_TitleDescription from "./steps/Step02_TitleDescription";
import Step03_Location from "./steps/Step03_Location";
import Step04_Urgency from "./steps/Step04_Urgency";
import Step05_Gender from "./steps/Step05_Gender";
import Step06_SeekerDetails from "./steps/Step06_SeekerDetails";
import Step07_JobStatus from "./steps/Step07_JobStatus";
import Step08_CategoryDetails from "./steps/Step08_CategoryDetails";
import Step09_PropertyOwnership from "./steps/Step09_PropertyOwnership";
import Step10_WhyHelp from "./steps/Step10_WhyHelp";
import Step11_AmountAndDeadline from "./steps/Step11_AmountAndDeadline";
import Step12_Verification from "./steps/Step12_Verification";

// shared components
import { SubmitTopBar } from "./shared/TopBar";

// constants اور helpers
import { STEPS, MAX_FREE_CASES, UNLOCK_CREDITS_REQUIRED } from "./constants";
import { saveDraft, loadDraft, clearDraft } from "./hooks/useSubmitDraft";
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
  getFeedbacks,
  insertCaseSubmission,
  uploadFileToStorage,
} from "@/lib/api";
import { sendNotification } from "@/lib/notify";
import { checkCreditGate } from "@/lib/creditGate";

// CATEGORY_LIMITS, etc. کو constants.ts میں منتقل کریں گے
import {
  CATEGORY_LIMITS,
  CATEGORIES,
  CURRENCY_SYMBOLS,
  CASE_CURRENCIES,
  UTILITY_CATS,
  LIST_CATS,
  PAYMENT_RECEIVER_CATS,
  PERSONAL_PAYMENT_CATS,
  FIXED_STIPEND_CATS,
  PROPERTY_RELEVANT_CATS,
  DISABILITY_STIPEND_AMOUNT,
  MAX_REJECTIONS_BEFORE_SUSPENSION,
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  CHOICE_FIELDS,
  YES_NO_FIELDS,
  COUNTER_FIELDS,
  SKIP_FIELDS,
  EDUCATION_SUB_OPTIONS,
  FEE_SUB_OPTIONS,
  EDUCATION_ADMISSION_FIELDS,
  EDUCATION_FEE_FIELDS,
  getEducationDocs,
  isEasyCat,
  getCategoryLimit,
  isFixedAmountCategory,
  getFixedAmount,
  getMaxAmount,
  isDebtPercentageCategory,
  calculateDebtAmount,
  urgencyFromDue,
  getFixedAmountValue,
  getMaxLimit,
  isDebtCategory,
} from "./constants";

// ============================================================
//  MAIN COMPONENT
// ============================================================
export default function SubmitRequestWizard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // ---- تمام state متغیرات موجودہ فائل کی طرح ----
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState("PKR");

  // Suspension state
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

  // ---- فارم ڈیٹا (تمام فیلڈز) ----
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

  // Payment receiver
  const [receiverName, setReceiverName] = useState("");
  const [receiverContact, setReceiverContact] = useState("");
  const [receiverBank, setReceiverBank] = useState("");
  const [receiverAccount, setReceiverAccount] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverShopName, setReceiverShopName] = useState("");

  // Disability
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

  // Education
  const [eduSubType, setEduSubType] = useState<"admission" | "books" | "uniform" | "school" | "college" | "university" | "">("");
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

  // Camera/Video refs
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

  // ---- Derived ----
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

  const isFirstCaseFree = canUseFreeCase();
  const offerApplies =
    !!offer &&
    offer.is_active &&
    (offer.used_count ?? 0) < (offer.free_limit ?? 0) &&
    !hasClaimedOfferBefore &&
    canUseFreeCase();
  const willBeFree = offerApplies || isFirstCaseFree;

  // ---- Helper functions (سب موجودہ فائل کی طرح) ----
  const canUseFreeCase = () => {
    if (isSuspended || isFreeDisabled) return false;
    return userFreeCasesUsed < MAX_FREE_CASES;
  };

  const hasFixedStipend = () => {
    if (category === "Disability Support" && disabilityMode === "stipend") return true;
    if (FIXED_STIPEND_CATS.has(category)) return true;
    return false;
  };

  const shouldShowPaymentReceiver = () => {
    return PERSONAL_PAYMENT_CATS.has(category) && !hasFixedStipend();
  };

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

  const getReceiverLabel = (): string => {
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
  };

  // ---- Effects (loadData, checkOffer, etc.) ----
  // (تمام effects موجودہ فائل کی طرح)

  // ---- Upload helpers ----
  async function uploadFile(file: File, path: string): Promise<string> {
    // موجودہ کوڈ
  }

  async function handleDocSelect(key: string, file: File | null) {
    // موجودہ کوڈ
  }

  // ---- Camera/Selfie functions ----
  async function startCamera() { /* ... */ }
  async function takeSelfie() { /* ... */ }
  async function handleSelfieFile(file: File | null) { /* ... */ }

  // ---- Video recording functions ----
  async function startVideoRecording() { /* ... */ }
  function stopVideoRecording() { /* ... */ }
  async function handleVideoFile(file: File | null) { /* ... */ }

  // ---- Validation ----
  function validateStep2(): string | null {
    // موجودہ کوڈ (پوری validateStep2)
  }

  // ---- Submit ----
  async function handleSubmit() {
    // موجودہ کوڈ (جس میں checkCreditGate شامل ہے)
  }

  // ---- Render helpers ----
  function renderField(f: any) { /* ... */ }
  function renderSeekerDetails() { /* ... */ }
  function renderPaymentReceiverDetails() { /* ... */ }
  function renderPaymentReceiver() { /* ... */ }
  function renderEducationCategory() { /* ... */ }
  function docBox(key: string, label: string, required: boolean, hint?: string, accept?: string) { /* ... */ }
  function TermsAndConditions() { /* ... */ }

  // ---- Step components render ----
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step01_CategorySelect
            category={category}
            setCategory={setCategory}
            willBeFree={willBeFree}
            isFirstCaseFree={isFirstCaseFree}
            isFreeDisabled={isFreeDisabled}
            CATEGORY_LIMITS={CATEGORY_LIMITS}
            CATEGORIES={CATEGORIES}
            isFixedAmount={isFixedAmount}
            getFixedAmountValue={getFixedAmountValue}
            getMaxLimit={getMaxLimit}
            isDebtCategory={isDebtCategory}
            needsPaymentReceiver={needsPaymentReceiver}
            title={title}
            setTitle={setTitle}
            shortDesc={shortDesc}
            setShortDesc={setShortDesc}
            country={country}
            setCountry={setCountry}
            city={city}
            setCity={setCity}
            urgency={urgency}
            setUrgency={setUrgency}
            easy={easy}
            isEducationCategory={isEducationCategory}
            category={category}
            setTried1={setTried1}
            setStep={setStep}
            StepGuide={StepGuide}
          />
        );
      case 2:
        return (
          <Step02_TitleDescription
            // تمام props
          />
        );
      // ... اسی طرح تمام steps کے لیے
      default:
        return null;
    }
  };

  // ---- Main return ----
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* TopBar */}
        <SubmitTopBar isFree={willBeFree} balance={balance} />

        {/* User Stats Banner */}
        {/* ... */}

        {/* Steps indicator */}
        {/* ... */}

        {/* Step content */}
        {renderStep()}
      </div>
    </Layout>
  );
}

// ---- StepGuide component (مشترکہ) ----
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

function getVisibleSteps(formData: any): string[] {
  const steps = ["category"];

  // Basic info
  steps.push("title", "shortDesc", "country", "city");

  // Urgency: only if not easy
  if (!isEasyCat(formData.category)) {
    steps.push("urgency");
  }

  // Gender
  steps.push("gender");
  if (formData.gender === "Male" || formData.gender === "Female") {
    steps.push("maritalStatus");
  }
  if (formData.gender === "Female") {
    steps.push("orphan");
    if (formData.isOrphan === "Yes") {
      steps.push("orphanParent");
    }
  }

  steps.push("seekerName", "seekerContact", "jobStatus");

  if (formData.jobStatus === "Yes") {
    steps.push("jobDocuments");
  } else if (formData.jobStatus === "No") {
    steps.push("noJobDocument");
  }

  // Category details (one big step, but later can be split)
  steps.push("categoryDetails");

  // Property
  if (PROPERTY_RELEVANT_CATS.has(formData.category)) {
    steps.push("propertyOwnership");
    if (formData.propertyOwnership === "rented") {
      steps.push("rentedDocuments");
    } else if (formData.propertyOwnership === "owned") {
      steps.push("ownedDocuments");
    }
  }

  // Why help
  steps.push("whyHelp");

  // Amount
  if (isDebtCategory(formData.category)) {
    steps.push("debtTotal");
  } else {
    steps.push("amount");
  }

  steps.push("currency", "deadline", "selfie", "video", "terms");

  return steps;
}
