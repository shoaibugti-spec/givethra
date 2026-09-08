// src/frontend/src/pages/submit-request/SubmitRequestWizard.tsx
// Complete: status gates + genderDocuments + paymentReceiver + terms→confirmed
// + completion cooldown (30 days) + early request (after 15 days)

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";

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
import StepPeopertyOwnership from "./steps/StepPeopertyOwnership";
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

import { SubmitTopBar } from "./shared/TopBar";
import { StepProgress } from "./shared/StepProgress";

import { useVisibleSteps } from "./hooks/useVisibleSteps";
import { useSubmitDraft } from "./hooks/useSubmitDraft";
import { useUserSubmitStats } from "./hooks/useUserSubmitStats";
import { useCompletionCooldown } from "@/hooks/useCompletionCooldown";
import { formatRemaining } from "@/lib/completionCooldown";

import { validateStep } from "./utils/validation";
import { submitCase } from "./utils/SubmitCase";

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
  propertyOwnership: StepPeopertyOwnership,
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
  "jobDocuments",
  "noJobDocument",
  "genderDocuments",
  "categoryDetails",
  "rentedDocuments",
  "ownedDocuments",
  "paymentReceiver",
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

const INITIAL_FORM = {
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
  genderDocUrls: {},
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
  receiverName: "",
  receiverContact: "",
  receiverBank: "",
  receiverAccount: "",
  receiverAddress: "",
  receiverShopName: "",
  description: "",
  debtTotalAmount: "",
  amount: "",
  currency: "PKR",
  deadline: "",
  selfieUrl: "",
  videoUrl: "",
  confirmed: false,
  isEarlyRequest: false,
};

export default function SubmitRequestWizard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [currentStepId, setCurrentStepId] = useState<string>("category");
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [forceNewCase, setForceNewCase] = useState(false);
  const [allowEarlyFlow, setAllowEarlyFlow] = useState(false);

  const { saveDraft, loadDraft, clearDraft } = useSubmitDraft();
  const { stats, loading: statsLoading, refetch } = useUserSubmitStats(user?.id);
  const { cooldown, remainingLabel, loading: cooldownLoading } =
    useCompletionCooldown(user?.id);

  const visibleStepIds = useVisibleSteps(formData);
  const currentIndex = visibleStepIds.indexOf(currentStepId);
  const totalSteps = visibleStepIds.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;

  const canUseFree =
    !stats.isSuspended && !stats.isFreeDisabled && stats.freeCasesUsed < 2;
  const willBeFree = canUseFree;

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
    const saved = loadDraft();
    if (saved) {
      setFormData((prev) => ({ ...prev, ...saved }));
      if (saved._stepId) setCurrentStepId(saved._stepId);
    }
    setIsLoading(false);
  }, [isAuthenticated, navigate, loadDraft]);

  // Early request from Home banner ?early=1
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
        toast.error(error);
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

    const isEarly =
      allowEarlyFlowRef.current &&
      cooldownRef.current.phase === "early_available";

    setSubmitting(true);
    try {
      const payload = {
        ...formDataRef.current,
        isEarlyRequest: isEarly,
      };
      const result = await submitCase(payload, user!.id, willBeFree);
      clearDraft();
      setForceNewCase(false);
      setAllowEarlyFlow(false);
      toast.success(result.message);
      refetch();
      navigate({ to: "/my-cases" });
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
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
      setFormData((prev) => updater(prev));
    } else {
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
        : formData[currentStepId as keyof typeof formData];

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
  }, [
    currentStepId,
    currentValue,
    stableOnChange,
    handleNext,
    handleBack,
    handleSubmit,
    isFirst,
    isLast,
    submitting,
    willBeFree,
    stats.isFreeDisabled,
    stats.freeCasesUsed,
    needsFormData ? formData : null,
    stableSetFormData,
  ]);

  const CurrentStepComponent = STEP_COMPONENTS[currentStepId];

  if (isLoading || statsLoading || cooldownLoading) {
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
            <h1 className="text-2xl font-bold text-red-700">Account Suspended</h1>
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
              completed. Before submitting a new case, please share your feedback
              (message + video).
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

  // ── Completion cooldown (ONLY after COMPLETED cases) ──
  const inCooldown =
    cooldown.phase === "waiting" ||
    cooldown.phase === "early_available" ||
    cooldown.phase === "early_locked";

  if (inCooldown && !(allowEarlyFlow && cooldown.phase === "early_available")) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-950/20 p-8 space-y-5">
            <h1 className="text-2xl font-bold text-rose-800">
              Your Help Was Completed
            </h1>
            <p className="text-base">
              You can submit another case after 30 Days
            </p>
            <p className="text-lg font-semibold tabular-nums">
              ⏳ {formatRemaining(cooldown.remainingMs)}
            </p>
            {cooldown.lastCompletedTitle && (
              <p className="text-sm text-muted-foreground">
                Last completed: “{cooldown.lastCompletedTitle}”
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Your previous case was successfully completed. We appreciate your
              trust. Please allow time for others to receive help too.
            </p>

            {cooldown.phase === "early_available" && (
              <div className="rounded-xl border bg-white/90 dark:bg-card p-4 space-y-3 text-left">
                <p className="text-sm font-semibold">Need Help Again?</p>
                <p className="text-xs text-muted-foreground">
                  If you have a genuine new problem, you may submit one early
                  request for review. Approval is not guaranteed. If rejected, you
                  must wait until the full 30-day period ends.
                </p>
                <Button className="w-full" onClick={() => setAllowEarlyFlow(true)}>
                  Request Early Review
                </Button>
              </div>
            )}

            {cooldown.phase === "early_locked" && (
              <p className="text-sm text-red-600">
                Your early request was not approved. Please wait {remainingLabel}{" "}
                before submitting again.
              </p>
            )}

            <Button variant="outline" asChild className="w-full">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (stats.activeCase?.status === "pending" && !forceNewCase) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-8 space-y-5">
            <h1 className="text-2xl font-bold text-amber-800">Case Under Review</h1>
            <p className="text-base">
              Your case <strong>"{stats.activeCase.title}"</strong> has been submitted
              and is currently <strong>Pending</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              You can submit a new case only after this one is approved, rejected, or
              completed.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link to="/cases/$id" params={{ id: stats.activeCase.id }}>
                  View My Case
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/my-cases">My Cases</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (stats.activeCase?.status === "approved" && !forceNewCase) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border border-green-300 bg-green-50 dark:bg-green-950/20 p-8 space-y-5">
            <h1 className="text-2xl font-bold text-green-800">Case Approved</h1>
            <p className="text-base">
              <strong>"{stats.activeCase.title}"</strong> is live. People can contribute
              and help on this case.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild className="w-full">
                <Link to="/cases/$id" params={{ id: stats.activeCase.id }}>
                  Open Case Page
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/my-cases">My Cases</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (stats.activeCase?.status === "rejected" && !forceNewCase) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-8 space-y-5">
            <h1 className="text-2xl font-bold text-red-700">Case Rejected</h1>
            <p className="text-base">
              <strong>"{stats.activeCase.title}"</strong> was rejected by the admin team.
            </p>
            {stats.activeCase.rejectionReason ? (
              <div className="rounded-lg bg-white dark:bg-card border p-4 text-left text-sm">
                <p className="font-semibold mb-1">Reason:</p>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {stats.activeCase.rejectionReason}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                You can view more details on the case page.
              </p>
            )}
            <div className="flex flex-col gap-3">
              <Button className="w-full" onClick={startFreshCase}>
                Submit a New Case
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link to="/cases/$id" params={{ id: stats.activeCase.id }}>
                  View Rejected Case
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link to="/my-cases">My Cases</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        {allowEarlyFlow && cooldown.phase === "early_available" && (
          <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 text-sm">
            <p className="font-semibold text-amber-900 dark:text-amber-100">
              Early review request
            </p>
            <p className="text-xs text-amber-900/80 dark:text-amber-100/80 mt-1">
              You are submitting inside the 30-day window. Admin will review this as an
              early request. Approval is not guaranteed.
            </p>
          </div>
        )}
        <SubmitTopBar isFree={willBeFree} balance={stats.balance} />
        <StepProgress
          current={Math.max(currentIndex + 1, 1)}
          total={Math.max(totalSteps, 1)}
        />
        <div className="mt-6">
          {CurrentStepComponent && (
            <CurrentStepComponent key={currentStepId} {...stepProps} />
          )}
        </div>
        {currentIndex > 0 && (
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Your progress is saved automatically.
          </p>
        )}
      </div>
    </Layout>
  );
}
