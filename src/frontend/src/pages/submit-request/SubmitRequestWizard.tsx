// src/frontend/src/pages/submit-request/SubmitRequestWizard.tsx
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";

// ✅ نیا امپورٹ: آپ کا اپنا بنایا ہوا TopBar کمپوننٹ
import SubmitTopBar from "./shared/TopBar";

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
import StepGenderDocuments from "./steps/StepGenderDocuments";
import StepSeekerName from "./steps/StepSeekerName";
import StepSeekerContact from "./steps/StepSeekerContact";
import StepJobStatus from "./steps/StepJobStatus";
import StepJobDocuments from "./steps/StepJobDocuments";
import StepNoJobDocument from "./steps/StepNoJobDocument";
import StepCategoryDetails from "./steps/StepCategoryDetails";
import StepPropertyOwnership from "./steps/StepPropertyOwnership";
import StepRentedDocuments from "./steps/StepRentedDocuments";
import StepOwnedDocuments from "./steps/StepOwnedDocuments";
import StepPaymentReceiver from "./steps/StepPaymentReceiver";
import StepWhyHelp from "./steps/StepWhyHelp";
import StepDebtTotal from "./steps/StepDebtTotal";
import StepAmount from "./steps/StepAmount";
import StepCurrency from "./steps/StepCurrency";
import StepDeadline from "./steps/StepDeadline";
import StepSelfie from "./steps/StepSelfie";
import StepVideo from "./steps/StepVideo";
import StepTerms from "./steps/StepTerms";

import { StepProgress } from "./shared/StepProgress";
import { useVisibleSteps } from "./hooks/useVisibleSteps";
import { useSubmitDraft } from "./hooks/useSubmitDraft";
import { useUserSubmitStats } from "./hooks/useUserSubmitStats";
import { useCompletionCooldown } from "@/hooks/useCompletionCooldown";
import { formatRemaining } from "@/lib/completionCooldown";
import { validateStep } from "./utils/validation";
import { submitCase } from "./utils/SubmitCase";
import { getKycStatus } from "@/lib/api";

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
  genderDocuments: StepGenderDocuments,
  seekerName: StepSeekerName,
  seekerContact: StepSeekerContact,
  jobStatus: StepJobStatus,
  jobDocuments: StepJobDocuments,
  noJobDocument: StepNoJobDocument,
  categoryDetails: StepCategoryDetails,
  propertyOwnership: StepPropertyOwnership,
  rentedDocuments: StepRentedDocuments,
  ownedDocuments: StepOwnedDocuments,
  paymentReceiver: StepPaymentReceiver,
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
  "jobDocuments", "noJobDocument", "genderDocuments", "categoryDetails",
  "rentedDocuments", "ownedDocuments", "paymentReceiver", "debtTotal",
  "selfie", "video", "amount", "deadline",
]);

const PLACEHOLDERS: Record<string, string> = {
  title: "e.g. Help with School Fee",
  shortDesc: "One line summary",
  seekerName: "Your full name",
  seekerContact: "Your phone",
  city: "e.g. Karachi",
};

const INITIAL_FORM = {
  category: "", title: "", shortDesc: "", country: "", city: "",
  urgency: "", gender: "", maritalStatus: "", isOrphan: "", orphanParent: "",
  genderDocUrls: {}, seekerName: "", seekerContact: "", jobStatus: "",
  salarySlipUrl: "", statementUrl: "", catFields: {}, catDocUrls: {},
  propertyOwnership: "", rentalAgreementUrl: "", landlordCnicUrl: "",
  ownerCnicUrl: "", ownerRelation: "", receiverName: "", receiverContact: "",
  receiverBank: "", receiverAccount: "", receiverAddress: "", receiverShopName: "",
  description: "", debtTotalAmount: "", amount: "", currency: "PKR",
  deadline: "", selfieUrl: "", videoUrl: "", confirmed: false, isEarlyRequest: false,
};

export default function SubmitRequestWizard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [currentStepId, setCurrentStepId] = useState<string>("category");
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingKyc, setCheckingKyc] = useState(true);
  const [forceNewCase, setForceNewCase] = useState(false);
  const [allowEarlyFlow, setAllowEarlyFlow] = useState(false);

  const { saveDraft, loadDraft, clearDraft } = useSubmitDraft();
  const { stats, loading: statsLoading, refetch } = useUserSubmitStats(user?.id);
  const { cooldown, remainingLabel, loading: cooldownLoading } = useCompletionCooldown(user?.id);

  const visibleStepIds = useVisibleSteps(formData);
  const currentIndex = visibleStepIds.indexOf(currentStepId);
  const totalSteps = visibleStepIds.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;

  const canUseFree = !stats.isSuspended && !stats.isFreeDisabled && stats.freeCasesUsed < 2;
  const willBeFree = canUseFree;
  const balance = stats.balance ?? 0;

  const currentStepIdRef = useRef(currentStepId);
  currentStepIdRef.current = currentStepId;
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const visibleStepIdsRef = useRef(visibleStepIds);
  visibleStepIdsRef.current = visibleStepIds;
  const allowEarlyFlowRef = useRef(allowEarlyFlow);
  allowEarlyFlowRef.current = allowEarlyFlow;
  const cooldownRef = useRef(cooldown);
  cooldownRef.current = cooldown;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/sign-in", search: { redirect: "/onboarding-submit" } });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const kyc = user?.id ? await getKycStatus(user.id) : null;
        const approved = String(kyc?.status || "none").trim().toLowerCase() === "approved";
        if (!approved) {
          try { sessionStorage.setItem("givethra_kyc_return_to", "/onboarding-submit"); } catch { /* ignore */ }
          navigate({ to: "/kyc" });
          return;
        }
        const saved = loadDraft();
        if (!cancelled && saved) {
          setFormData((prev) => ({ ...prev, ...saved }));
          if (saved._stepId) setCurrentStepId(saved._stepId);
        }
      } catch {
        try { sessionStorage.setItem("givethra_kyc_return_to", "/onboarding-submit"); } catch { /* ignore */ }
        navigate({ to: "/kyc" });
      } finally {
        if (!cancelled) {
          setCheckingKyc(false);
          setIsLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated, navigate, loadDraft, user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const early = new URLSearchParams(window.location.search).get("early") === "1";
    if (early && cooldown.phase === "early_available") {
      setAllowEarlyFlow(true);
    }
  }, [cooldown.phase]);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      saveDraft({ ...formDataRef.current, _stepId: currentStepIdRef.current });
    }, 400);
    return () => clearTimeout(timer);
  }, [formData, currentStepId, isLoading, saveDraft]);

  useEffect(() => {
    if (!visibleStepIds.includes(currentStepId) && visibleStepIds.length > 0) {
      setCurrentStepId(visibleStepIds[0]);
    }
  }, [visibleStepIds, currentStepId]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    formDataRef.current = { ...formDataRef.current, [field]: value };
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
    // Read the latest controlled state and normalize legacy/string draft values.
    // This prevents a checked Terms box from racing the final validation pass.
    const latest: any = { ...formDataRef.current };
    if (latest.confirmed === "true" || latest.confirmed === 1) {
      latest.confirmed = true;
    }
    for (const stepId of visibleStepIdsRef.current) {
      const error = validateStep(stepId, latest);
      if (error) {
        toast.error(error);
        setCurrentStepId(stepId);
        return;
      }
    }
    if (latest.confirmed !== true) {
      toast.error("You must agree to the Terms & Conditions.");
      setCurrentStepId("terms");
      return;
    }
    if (!latest.selfieUrl) {
      toast.error("Please take a live selfie");
      setCurrentStepId("selfie");
      return;
    }
    if (!latest.videoUrl) {
      toast.error("Please record a video appeal");
      setCurrentStepId("video");
      return;
    }

    const isEarly = allowEarlyFlowRef.current && cooldownRef.current.phase === "early_available";

    setSubmitting(true);
    try {
      const payload = { ...latest, confirmed: true, isEarlyRequest: isEarly };
      const result = await submitCase(payload, user!.id, willBeFree);
      clearDraft();
      setForceNewCase(false);
      setAllowEarlyFlow(false);
      toast.success(result.message);
      refetch();
      navigate({ to: "/my-cases" });
    } catch (err: any) {
      const message = err?.message || "Submission failed";
      if (String(message).toLowerCase().includes("kyc")) {
        toast.error(message);
        navigate({ to: "/kyc" });
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  }, [user, willBeFree, clearDraft, navigate, refetch]);

  const stableOnChange = useCallback(
    (val: any) => {
      const stepId = currentStepIdRef.current;
      if (stepId === "whyHelp") {
        handleFieldChange("description", val);
      } else if (stepId === "terms") {
        handleFieldChange("confirmed", val === true || val === "true");
      } else {
        handleFieldChange(stepId, val);
      }
    },
    [handleFieldChange]
  );

  const stableSetFormData = useCallback((updater: any) => {
    if (typeof updater === "function") {
      const next = updater(formDataRef.current);
      formDataRef.current = next;
      setFormData(next);
    } else {
      formDataRef.current = updater;
      setFormData(updater);
    }
  }, []);

  const startFreshCase = useCallback(() => {
    clearDraft();
    setFormData({ ...INITIAL_FORM });
    setCurrentStepId("category");
    setForceNewCase(true);
  }, [clearDraft]);

  const currentValue =
    currentStepId === "whyHelp"
      ? formData.description
      : currentStepId === "terms"
      ? formData.confirmed
      : (formData[currentStepId as keyof typeof formData] ?? "");

  const needsFormData = STEPS_NEEDING_FORMDATA.has(currentStepId);

  const stepProps = useMemo(() => {
    const common = {
      value: currentValue,
      onChange: stableOnChange,
      onNext: isLast ? handleSubmit : handleNext,
      onBack: handleBack,
      isFirst,
      isLast,
      submitting,
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
  }, [currentStepId, currentValue, stableOnChange, handleNext, handleBack, handleSubmit, isFirst, isLast, submitting, willBeFree, stats.isFreeDisabled, stats.freeCasesUsed, formData, stableSetFormData, needsFormData]);

  const CurrentStepComponent = STEP_COMPONENTS[currentStepId];

  // ✅ یہاں اب صرف آپ کا نیا SubmitTopBar استعمال ہوگا
  const shell = (body: React.ReactNode) => (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <SubmitTopBar isFree={willBeFree} balance={balance} />
        {body}
      </div>
    </Layout>
  );

  if (isLoading || checkingKyc || statsLoading || cooldownLoading) {
    return shell(<div className="py-16 text-center">Loading Submit Request Wizard...</div>);
  }

  if (stats.isSuspended) {
    return shell(
      <div className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/20 p-8 space-y-6 text-center">
        <h1 className="text-2xl font-bold text-red-700">Account Suspended</h1>
        <p>Your account is suspended. Please unlock it first.</p>
        <Button onClick={() => navigate({ to: "/wallet" })}>Go to Wallet</Button>
      </div>
    );
  }

  if (stats.blockedByFeedback) {
    return shell(
      <div className="rounded-2xl border bg-card p-8 space-y-4 text-center">
        <h1 className="text-2xl font-bold">Please Share Your Feedback First</h1>
        <p>Your case &quot;<strong>{stats.blockedByFeedback.caseTitle}</strong>&quot; was completed. Before submitting a new case, please share your feedback (message + video).</p>
        <Button asChild>
          <Link to="/cases/$id" params={{ id: stats.blockedByFeedback.caseId }}>Go to My Completed Case</Link>
        </Button>
      </div>
    );
  }

  const inCooldown = cooldown.phase === "waiting" || cooldown.phase === "early_available" || cooldown.phase === "early_locked";

  if (inCooldown && !(allowEarlyFlow && cooldown.phase === "early_available")) {
    return shell(
      <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 p-8 space-y-5 text-center">
        <h1 className="text-2xl font-bold text-rose-800">Your Help Was Completed</h1>
        <p className="text-base">You can submit another case after 30 Days</p>
        <p className="text-lg font-semibold tabular-nums">⏳ {formatRemaining(cooldown.remainingMs)}</p>
        {cooldown.lastCompletedTitle && (
          <p className="text-sm text-muted-foreground">Last completed: “{cooldown.lastCompletedTitle}”</p>
        )}
        {cooldown.phase === "early_available" && (
          <div className="rounded-xl border bg-white/90 dark:bg-card p-4 space-y-3 text-left">
            <p className="text-sm font-semibold">Need Help Again?</p>
            <p className="text-xs text-muted-foreground">You may submit one early request for review. Approval is not guaranteed.</p>
            <Button className="w-full" onClick={() => setAllowEarlyFlow(true)}>Request Early Review</Button>
          </div>
        )}
        {cooldown.phase === "early_locked" && (
          <p className="text-sm text-red-600">Your early request was not approved. Please wait {remainingLabel} before submitting again.</p>
        )}
        <Button variant="outline" asChild className="w-full">
          <Link to="/home">Back to Home</Link>
        </Button>
      </div>
    );
  }

  if (stats.activeCase?.status === "pending" && !forceNewCase) {
    return shell(
      <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-8 space-y-5 text-center">
        <h1 className="text-2xl font-bold text-amber-800">Case Under Review</h1>
        <p className="text-base">Your case <strong>&quot;{stats.activeCase.title}&quot;</strong> is <strong>Pending</strong>.</p>
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full"><Link to="/home">Back to Home</Link></Button>
          <Button variant="outline" asChild className="w-full"><Link to="/cases/$id" params={{ id: stats.activeCase.id }}>View My Case</Link></Button>
        </div>
      </div>
    );
  }

  if (stats.activeCase?.status === "approved" && !forceNewCase) {
    return shell(
      <div className="rounded-2xl border border-green-300 bg-green-50 dark:bg-green-950/20 p-8 space-y-5 text-center">
        <h1 className="text-2xl font-bold text-green-800">Case Approved</h1>
        <p className="text-base"><strong>&quot;{stats.activeCase.title}&quot;</strong> is live.</p>
        <div className="flex flex-col gap-3">
          <Button asChild className="w-full"><Link to="/home">Back to Home</Link></Button>
          <Button variant="outline" asChild className="w-full"><Link to="/cases/$id" params={{ id: stats.activeCase.id }}>Open Case Page</Link></Button>
        </div>
      </div>
    );
  }

  if (stats.activeCase?.status === "rejected" && !forceNewCase) {
    return shell(
      <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-8 space-y-5 text-center">
        <h1 className="text-2xl font-bold text-red-700">Case Rejected</h1>
        <p className="text-base"><strong>&quot;{stats.activeCase.title}&quot;</strong> was rejected.</p>
        {stats.activeCase.rejectionReason && (
          <div className="rounded-lg bg-white dark:bg-card border p-4 text-left text-sm">
            <p className="font-semibold mb-1">Reason:</p>
            <p className="text-muted-foreground whitespace-pre-wrap">{stats.activeCase.rejectionReason}</p>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <Button className="w-full" onClick={startFreshCase}>Submit a New Case</Button>
          <Button variant="outline" asChild className="w-full"><Link to="/home">Back to Home</Link></Button>
        </div>
      </div>
    );
  }

  return shell(
    <>
      {allowEarlyFlow && cooldown.phase === "early_available" && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm">
          <p className="font-semibold text-amber-900 dark:text-amber-100">Early review request</p>
          <p className="text-xs text-amber-900/80 dark:text-amber-100/80 mt-1">Admin will review this as an early request. Approval is not guaranteed.</p>
        </div>
      )}
      <StepProgress current={Math.max(currentIndex + 1, 1)} total={Math.max(totalSteps, 1)} />
      <div className="mt-6">
        {CurrentStepComponent && <CurrentStepComponent key={currentStepId} {...stepProps} />}
      </div>
      {currentIndex > 0 && (
        <p className="mt-4 text-xs text-muted-foreground text-center">Your progress is saved automatically.</p>
      )}
    </>
  );
}
