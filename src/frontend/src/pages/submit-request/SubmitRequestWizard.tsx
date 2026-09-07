// src/frontend/src/pages/submit-request/SubmitRequestWizard.tsx
// ✅ FIXED: Root cause of blinking — stable stepProps, debounced draft, no cascade on category select

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";

// All steps
import StepCategory from "./steps/StepCategory";
import StepTitle from "./steps/StepTitle";
import StepShortDesc from "./steps/StepShortDesc";
import StepCountry from "./steps/StepCountry";
import StepCity from "./steps/StepCity";
import StepUrgency from "./steps/StepUrgency";
import StepGender from "./steps/StepGender";
import StepMartialStatus from "./steps/StepMartialStatus";
import StepOrphan from "./steps/StepOrphan";
import StepOrphanParent from "./steps/StepOrphanParent";
import StepSeekerName from "./steps/StepSeekerName";
import StepSeekerContact from "./steps/StepSeekerContact";
import StepJobStatus from "./steps/StepJobStatus";
import StepJobDocuments from "./steps/StepJobDocuments";
import StepNoJobDocument from "./steps/StepNoJobDocument";
import StepCategoryDetails from "./steps/StepCategoryDetails";
import StepPeopertyOwnership from "./steps/StepPeopertyOwnership";
import StepRentedDocuments from "./steps/StepRentedDocuments";
import StepOwnedDocuments from "./steps/StepOwnedDocuments";
import StepWhyHelp from "./steps/StepWhyHelp";
import StepDebtTotal from "./steps/StepDebtTotal";
import StepAmount from "./steps/StepAmount";
import StepCurrency from "./steps/StepCurrency";
import StepDeadline from "./steps/StepDeadline";
import StepSelfie from "./steps/StepSelfie";
import StepVideo from "./steps/StepVideo";
import StepTerms from "./steps/StepTerms";

// Shared
import { SubmitTopBar } from "./shared/TopBar";
import { StepProgress } from "./shared/StepProgress";

// Hooks
import { useVisibleSteps } from "./hooks/useVisibleSteps";
import { useSubmitDraft } from "./hooks/useSubmitDraft";
import { useUserSubmitStats } from "./hooks/useUserSubmitStats";

// Utils
import { validateStep } from "./utils/validation";
import { submitCase } from "./utils/SubmitCase";

// ✅ Module-level — never recreated on render
const STEP_COMPONENTS: Record<string, React.ComponentType<any>> = {
  category: StepCategory,
  title: StepTitle,
  shortDesc: StepShortDesc,
  country: StepCountry,
  city: StepCity,
  urgency: StepUrgency,
  gender: StepGender,
  maritalStatus: StepMartialStatus,
  orphan: StepOrphan,
  orphanParent: StepOrphanParent,
  seekerName: StepSeekerName,
  seekerContact: StepSeekerContact,
  jobStatus: StepJobStatus,
  jobDocuments: StepJobDocuments,
  noJobDocument: StepNoJobDocument,
  categoryDetails: StepCategoryDetails,
  propertyOwnership: StepPeopertyOwnership,
  rentedDocuments: StepRentedDocuments,
  ownedDocuments: StepOwnedDocuments,
  whyHelp: StepWhyHelp,
  debtTotal: StepDebtTotal,
  amount: StepAmount,
  currency: StepCurrency,
  deadline: StepDeadline,
  selfie: StepSelfie,
  video: StepVideo,
  terms: StepTerms,
};

const STEPS_NEEDING_FORMDATA = new Set([
  "jobDocuments",
  "noJobDocument",
  "categoryDetails",
  "rentedDocuments",
  "ownedDocuments",
  "debtTotal",
  "selfie",
  "video",
  "amount",
  "deadline",
]);

const PLACEHOLDERS: Record<string, string> = {
  title: "e.g. Help with School Fee",
  shortDesc: "One line summary",
  seekerName: "Your full name",
  seekerContact: "Your phone",
  city: "e.g. Karachi",
};

export default function SubmitRequestWizard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: "",
    title: "",
    shortDesc: "",
    country: "",
    city: "",
    urgency: "",
    gender: "",
    maritalStatus: "",
    isOrphan: "",
    orphanParent: "",
    seekerName: "",
    seekerContact: "",
    jobStatus: "",
    salarySlipUrl: "",
    statementUrl: "",
    catFields: {},
    catDocUrls: {},
    propertyOwnership: "",
    rentalAgreementUrl: "",
    landlordCnicUrl: "",
    ownerCnicUrl: "",
    ownerRelation: "",
    description: "",
    debtTotalAmount: "",
    amount: "",
    currency: "PKR",
    deadline: "",
    selfieUrl: "",
    videoUrl: "",
    confirmed: false,
  });

  const [currentStepId, setCurrentStepId] = useState<string>("category");
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { saveDraft, loadDraft, clearDraft } = useSubmitDraft();
  const { stats, loading: statsLoading } = useUserSubmitStats(user?.id);

  const visibleStepIds = useVisibleSteps(formData);
  const currentIndex = visibleStepIds.indexOf(currentStepId);
  const totalSteps = visibleStepIds.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;

  const canUseFree =
    !stats.isSuspended && !stats.isFreeDisabled && stats.freeCasesUsed < 2;
  const willBeFree = canUseFree;

  // ── Stable refs ──────────────────────────────────────────────
  const currentStepIdRef = useRef(currentStepId);
  currentStepIdRef.current = currentStepId;
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const visibleStepIdsRef = useRef(visibleStepIds);
  visibleStepIdsRef.current = visibleStepIds;

  // ── Load draft once ──────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in", search: { redirect: "/onboarding-submit" } });
      return;
    }
    const saved = loadDraft();
    if (saved) {
      setFormData((prev) => ({ ...prev, ...saved }));
      if (saved._stepId) setCurrentStepId(saved._stepId);
    }
    setIsLoading(false);
  }, [isAuthenticated, navigate, loadDraft]);

  // ── Debounced auto-save (400ms) — stops thrashing on every keystroke ──
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      saveDraft({ ...formDataRef.current, _stepId: currentStepIdRef.current });
    }, 400);
    return () => clearTimeout(timer);
  }, [formData, currentStepId, isLoading, saveDraft]);

  // ── Stable handlers ──────────────────────────────────────────
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleNext = useCallback(() => {
    const stepId = currentStepIdRef.current;
    const data = formDataRef.current;
    const error = validateStep(stepId, data);
    if (error) {
      toast.error(error);
      return;
    }
    const idx = visibleStepIdsRef.current.indexOf(stepId);
    const nextIndex = idx + 1;
    if (nextIndex < visibleStepIdsRef.current.length) {
      setCurrentStepId(visibleStepIdsRef.current[nextIndex]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleBack = useCallback(() => {
    const stepId = currentStepIdRef.current;
    const idx = visibleStepIdsRef.current.indexOf(stepId);
    const prevIndex = idx - 1;
    if (prevIndex >= 0) {
      setCurrentStepId(visibleStepIdsRef.current[prevIndex]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    for (const stepId of visibleStepIdsRef.current) {
      const error = validateStep(stepId, formDataRef.current);
      if (error) {
        toast.error(`❌ ${error}`);
        setCurrentStepId(stepId);
        return;
      }
    }
    if (!formDataRef.current.confirmed) {
      toast.error("You must agree to the Terms & Conditions.");
      setCurrentStepId("terms");
      return;
    }
    if (!formDataRef.current.selfieUrl) {
      toast.error("Please take a live selfie");
      setCurrentStepId("selfie");
      return;
    }
    if (!formDataRef.current.videoUrl) {
      toast.error("Please record a video appeal");
      setCurrentStepId("video");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitCase(formDataRef.current, user!.id, willBeFree);
      clearDraft();
      toast.success(result.message);
      navigate({ to: "/my-cases" });
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }, [user, willBeFree, clearDraft, navigate]);

  // ✅ Always writes to the CURRENT step via ref
  const stableOnChange = useCallback(
    (val: any) => {
      handleFieldChange(currentStepIdRef.current, val);
    },
    [handleFieldChange]
  );

  const stableSetFormData = useCallback((updater: any) => {
    if (typeof updater === "function") {
      setFormData((prev) => updater(prev));
    } else {
      setFormData(updater);
    }
  }, []);

  // ── CRITICAL: only the single field value, not whole formData ──
  const currentValue = formData[currentStepId as keyof typeof formData];
  const needsFormData = STEPS_NEEDING_FORMDATA.has(currentStepId);

  const stepProps = useMemo(() => {
    const common = {
      value: currentValue,
      onChange: stableOnChange,
      onNext: handleNext,
      onBack: handleBack,
      isFirst,
      isLast,
    };

    const extra: any = {};

    if (currentStepId === "category") {
      extra.willBeFree = willBeFree;
      extra.isFreeDisabled = stats.isFreeDisabled;
      extra.freeCasesUsed = stats.freeCasesUsed;
    }

    if (needsFormData) {
      extra.formData = formData;
      extra.setFormData = stableSetFormData;
    }

    if (PLACEHOLDERS[currentStepId]) {
      extra.placeholder = PLACEHOLDERS[currentStepId];
    }

    return { ...common, ...extra };
  }, [
    currentStepId,
    currentValue, // ← only the one field that matters
    stableOnChange,
    handleNext,
    handleBack,
    isFirst,
    isLast,
    willBeFree,
    stats.isFreeDisabled,
    stats.freeCasesUsed,
    needsFormData ? formData : null, // full formData only when required
    stableSetFormData,
  ]);

  const CurrentStepComponent = STEP_COMPONENTS[currentStepId];

  // ── Loading / blocked states ─────────────────────────────────
  if (isLoading || statsLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          Loading Submit Request Wizard...
        </div>
      </Layout>
    );
  }

  if (stats.isSuspended) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-8 space-y-6">
            <h1 className="text-2xl font-bold text-red-700">🚫 Account Suspended</h1>
            <p>Your account is suspended. Please unlock it first.</p>
            <Button onClick={() => navigate({ to: "/wallet" })}>Go to Wallet</Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (stats.blockedByFeedback) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border bg-card p-8 space-y-4">
            <h1 className="text-2xl font-bold">Please Share Your Feedback First</h1>
            <p>
              Your case "<strong>{stats.blockedByFeedback.caseTitle}</strong>" was
              completed. Before submitting a new case, please share your feedback.
            </p>
            <Button asChild>
              <Link
                to="/cases/$id"
                params={{ id: stats.blockedByFeedback.caseId }}
              >
                Go to My Completed Case
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <SubmitTopBar isFree={willBeFree} balance={stats.balance} />
        <StepProgress current={currentIndex + 1} total={totalSteps} />
        <div className="mt-6">
          {CurrentStepComponent && (
            <CurrentStepComponent key={currentStepId} {...stepProps} />
          )}
        </div>
        {currentIndex > 0 && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            💾 Your progress is saved automatically.
          </p>
        )}
      </div>
    </Layout>
  );
}
