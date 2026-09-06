// src/frontend/src/pages/submit-request/SubmitRequestWizard.tsx
// 🔥 FINAL BUILD-FIXED VERSION: uses StepMartialStatus and StepPeopertyOwnership

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// 🔥 Imports with exact file names (StepMartialStatus, StepPeopertyOwnership)
import StepCategory from "./steps/StepCategory";
import StepTitle from "./steps/StepTitle";
import StepShortDesc from "./steps/StepShortDesc";
import StepCountry from "./steps/StepCountry";
import StepCity from "./steps/StepCity";
import StepUrgency from "./steps/StepUrgency";
import StepGender from "./steps/StepGender";
import StepMartialStatus from "./steps/StepMartialStatus";   // ✅ exists
import StepOrphan from "./steps/StepOrphan";
import StepOrphanParent from "./steps/StepOrphanParent";
import StepSeekerName from "./steps/StepSeekerName";
import StepSeekerContact from "./steps/StepSeekerContact";
import StepJobStatus from "./steps/StepJobStatus";
import StepJobDocuments from "./steps/StepJobDocuments";
import StepNoJobDocument from "./steps/StepNoJobDocument";
import StepCategoryDetails from "./steps/StepCategoryDetails";
import StepPeopertyOwnership from "./steps/StepPeopertyOwnership";   // ✅ exists
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in", search: { redirect: "/submit-request" } });
      return;
    }
    const saved = loadDraft();
    if (saved) {
      setFormData(prev => ({ ...prev, ...saved }));
      if (saved._stepId) setCurrentStepId(saved._stepId);
    }
    setIsLoading(false);
  }, [isAuthenticated, navigate, loadDraft]);

  useEffect(() => {
    if (!isLoading) {
      saveDraft({ ...formData, _stepId: currentStepId });
    }
  }, [formData, currentStepId, isLoading, saveDraft]);

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

  const renderStep = () => {
    const commonProps = {
      value: formData[currentStepId as keyof typeof formData],
      onChange: (val: any) => setFormData(prev => ({ ...prev, [currentStepId]: val })),
      onNext: handleNext,
      onBack: handleBack,
      isFirst,
      isLast,
      submitting,
      formData,
      setFormData,
    };

    switch (currentStepId) {
      case "category":
  return (
    <StepCategory
      {...commonProps}
      // 🔥 categories prop کو مکمل ہٹا دیں
      willBeFree={willBeFree}
      isFreeDisabled={stats.isFreeDisabled}
      freeCasesUsed={stats.freeCasesUsed}
    />
  );
      case "title": return <StepTitle {...commonProps} placeholder="e.g. Help with School Fee" />;
      case "shortDesc": return <StepShortDesc {...commonProps} placeholder="One line summary" />;
      case "country": return <StepCountry {...commonProps} />;
      case "city": return <StepCity {...commonProps} placeholder="e.g. Karachi" />;
      case "urgency": return <StepUrgency {...commonProps} />;
      case "gender": return <StepGender {...commonProps} />;
      case "maritalStatus": return <StepMartialStatus {...commonProps} />;
      case "orphan": return <StepOrphan {...commonProps} />;
      case "orphanParent": return <StepOrphanParent {...commonProps} />;
      case "seekerName": return <StepSeekerName {...commonProps} placeholder="Your full name" />;
      case "seekerContact": return <StepSeekerContact {...commonProps} placeholder="Your phone" />;
      case "jobStatus": return <StepJobStatus {...commonProps} />;
      case "jobDocuments": return <StepJobDocuments {...commonProps} formData={formData} setFormData={setFormData} />;
      case "noJobDocument": return <StepNoJobDocument {...commonProps} formData={formData} setFormData={setFormData} />;
      case "categoryDetails": return <StepCategoryDetails {...commonProps} formData={formData} setFormData={setFormData} />;
      case "propertyOwnership": return <StepPeopertyOwnership {...commonProps} />;
      case "rentedDocuments": return <StepRentedDocuments {...commonProps} formData={formData} setFormData={setFormData} />;
      case "ownedDocuments": return <StepOwnedDocuments {...commonProps} formData={formData} setFormData={setFormData} />;
      case "whyHelp": return <StepWhyHelp {...commonProps} />;
      case "debtTotal": return <StepDebtTotal {...commonProps} formData={formData} setFormData={setFormData} />;
      case "amount": return <StepAmount {...commonProps} formData={formData} />;
      case "currency": return <StepCurrency {...commonProps} />;
      case "deadline": return <StepDeadline {...commonProps} formData={formData} />;
      case "selfie": return <StepSelfie {...commonProps} formData={formData} setFormData={setFormData} />;
      case "video": return <StepVideo {...commonProps} formData={formData} setFormData={setFormData} />;
      case "terms": return <StepTerms {...commonProps} />;
      default: return <div>Unknown step</div>;
    }
  };

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
        <div className="mt-6">{renderStep()}</div>
        {currentIndex > 0 && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            💾 Your progress is saved automatically.
          </p>
        )}
      </div>
    </Layout>
  );
}
