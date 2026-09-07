// src/frontend/src/pages/submit-request/SubmitRequestWizard.tsx
// 🔥 FINAL FIX: Stable step rendering, no blinking, no focus loss

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
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

// Constants & utils
import { CATEGORIES, CATEGORY_LIMITS } from "./constants";
import { validateStep } from "./utils/validation";
import { submitCase } from "./utils/SubmitCase";

// 🔥 Stable map of step components
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

  const canUseFree = !stats.isSuspended && !stats.isFreeDisabled && stats.freeCasesUsed < 2;
  const willBeFree = canUseFree;

  // Load draft
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in", search: { redirect: "/onboarding-submit" } });
      return;
    }
    const saved = loadDraft();
    if (saved) {
      setFormData(prev => ({ ...prev, ...saved }));
      if (saved._stepId) setCurrentStepId(saved._stepId);
    }
    setIsLoading(false);
  }, [isAuthenticated, navigate, loadDraft]);

  // Auto-save draft
  useEffect(() => {
    if (!isLoading) {
      saveDraft({ ...formData, _stepId: currentStepId });
    }
  }, [formData, currentStepId, isLoading, saveDraft]);

  // 🔥 Stable field change handler
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    for (const stepId of visibleStepIds) {
      const error = validateStep(stepId, formData);
      if (error) {
        toast.error(`❌ ${error}`);
        setCurrentStepId(stepId);
        return;
      }
    }
    if (!formData.confirmed) {
      toast.error("You must agree to the Terms & Conditions.");
      setCurrentStepId("terms");
      return;
    }
    if (!formData.selfieUrl) {
      toast.error("Please take a live selfie");
      setCurrentStepId("selfie");
      return;
    }
    if (!formData.videoUrl) {
      toast.error("Please record a video appeal");
      setCurrentStepId("video");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitCase(formData, user!.id, willBeFree);
      clearDraft();
      toast.success(result.message);
      navigate({ to: "/my-cases" });
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }, [formData, visibleStepIds, user, willBeFree, clearDraft, navigate]);

  // Navigation
  const handleNext = useCallback(() => {
    const error = validateStep(currentStepId, formData);
    if (error) {
      toast.error(error);
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalSteps) {
      handleSubmit();
    } else {
      setCurrentStepId(visibleStepIds[nextIndex]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStepId, currentIndex, totalSteps, visibleStepIds, formData, handleSubmit]);

  const handleBack = useCallback(() => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStepId(visibleStepIds[prevIndex]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex, visibleStepIds]);

  // 🔥 Memoize props for each step to avoid unnecessary re-renders
  const stepProps = useMemo(() => {
    const value = formData[currentStepId as keyof typeof formData];
    const onChange = (val: any) => handleFieldChange(currentStepId, val);

    // Common props for all steps
    const common = {
      value,
      onChange,
      onNext: handleNext,
      onBack: handleBack,
      isFirst,
      isLast,
    };

    // Specific props for certain steps
    const extra: any = {};
    if (currentStepId === "category") {
      extra.willBeFree = willBeFree;
      extra.isFreeDisabled = stats.isFreeDisabled;
      extra.freeCasesUsed = stats.freeCasesUsed;
    }
    if (["jobDocuments", "noJobDocument", "categoryDetails", "rentedDocuments", "ownedDocuments", "debtTotal", "selfie", "video"].includes(currentStepId)) {
      extra.formData = formData;
      extra.setFormData = setFormData;
    }
    if (["amount", "deadline"].includes(currentStepId)) {
      extra.formData = formData;
      extra.setFormData = setFormData;
    }
    if (["title", "shortDesc", "seekerName", "seekerContact", "city"].includes(currentStepId)) {
      extra.placeholder = currentStepId === "title" ? "e.g. Help with School Fee"
        : currentStepId === "shortDesc" ? "One line summary"
        : currentStepId === "seekerName" ? "Your full name"
        : currentStepId === "seekerContact" ? "Your phone"
        : "e.g. Karachi";
    }

    return { ...common, ...extra };
  }, [
    currentStepId,
    formData,
    handleFieldChange,
    handleNext,
    handleBack,
    isFirst,
    isLast,
    willBeFree,
    stats.isFreeDisabled,
    stats.freeCasesUsed,
  ]);

  // 🔥 Get the current step component from the map
  const CurrentStepComponent = STEP_COMPONENTS[currentStepId];

  if (isLoading || statsLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">Loading Submit Request Wizard...</div>
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
              Your case "<strong>{stats.blockedByFeedback.caseTitle}</strong>" was completed.
              Before submitting a new case, please share your feedback.
            </p>
            <Button asChild>
              <Link to="/cases/$id" params={{ id: stats.blockedByFeedback.caseId }}>
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
          {/* 🔥 Render current step with stable key */}
          {CurrentStepComponent && (
            <CurrentStepComponent
              key={currentStepId}
              {...stepProps}
            />
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
