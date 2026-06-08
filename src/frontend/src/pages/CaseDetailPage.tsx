import type { CasePublic, VerificationStatus } from "@/backend";
import { CategoryPill } from "@/components/CategoryPill";
import Layout from "@/components/Layout";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { VerificationBadge } from "@/components/VerificationBadge";
import type { VerificationLevel } from "@/components/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useBackendActor } from "@/hooks/useBackend";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, Heart, Lock, MapPin, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function toVerifLevel(v: VerificationStatus): VerificationLevel {
  if (v === "InstitutionVerified") return "institution_verified";
  if (v === "DocumentsSubmitted") return "documents_submitted";
  return "unverified";
}

export default function CaseDetailPage() {
  const { id } = useParams({ from: "/cases/$id" });
  const navigate = useNavigate();
  const { isAuthenticated, isHero } = useAuth();
  const { actor, isFetching } = useBackendActor();
  const [caseData, setCaseData] = useState<CasePublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showProofForm, setShowProofForm] = useState(false);
  const [proofRef, setProofRef] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);

  useEffect(() => {
    if (!actor || isFetching) return;
    const caseId = BigInt(id);
    setLoading(true);
    Promise.all([
      actor.getCaseDetail(caseId),
      isAuthenticated ? actor.isUnlocked(caseId) : Promise.resolve(false),
    ])
      .then(([detail, isUnl]) => {
        setCaseData(detail ?? null);
        setUnlocked(isUnl);
      })
      .finally(() => setLoading(false));
  }, [actor, isFetching, id, isAuthenticated]);

  const handleUnlock = async () => {
    if (!actor) return;
    setUnlocking(true);
    try {
      const successUrl = `${window.location.origin}/cases/${id}?unlocked=1`;
      const cancelUrl = `${window.location.origin}/cases/${id}`;
      const sessionUrl = await actor.createUnlockFeeSession(
        BigInt(id),
        successUrl,
        cancelUrl,
      );
      window.location.href = sessionUrl;
    } catch {
      toast.error("Failed to start payment. Please try again.");
      setUnlocking(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!actor) return;
    setSubmittingProof(true);
    try {
      await actor.submitProof(BigInt(id), [], proofRef || null);
      toast.success("Proof submitted! The admin will review it shortly.");
      setShowProofForm(false);
      setProofRef("");
    } catch {
      toast.error("Failed to submit proof. Please try again.");
    } finally {
      setSubmittingProof(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div
          className="flex justify-center py-20"
          data-ocid="case_detail.loading_state"
        >
          <LoadingSpinner label="Loading case..." />
        </div>
      </Layout>
    );
  }

  if (!caseData) {
    return (
      <Layout>
        <div
          className="max-w-4xl mx-auto px-4 py-20 text-center"
          data-ocid="case_detail.error_state"
        >
          <p className="text-muted-foreground">Case not found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate({ to: "/cases" })}
          >
            Back to Cases
          </Button>
        </div>
      </Layout>
    );
  }

  const amountNeeded = Number(caseData.amountNeeded) / 100;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <button
          type="button"
          onClick={() => navigate({ to: "/cases" })}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="case_detail.back_button"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to cases
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <VerificationBadge
                  level={toVerifLevel(caseData.verificationStatus)}
                  size="md"
                />
                <CategoryPill category={caseData.category} size="sm" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {caseData.title}
              </h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {caseData.city}, {caseData.country}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {caseData.description}
              </p>
            </div>

            {/* Locked / Unlocked section */}
            {unlocked ? (
              <div
                data-ocid="case_detail.unlocked_section"
                className="rounded-2xl border border-border bg-card p-6 space-y-4"
              >
                <h3 className="font-display font-semibold text-foreground">
                  Case Details
                </h3>
                <div className="space-y-2 text-sm">
                  {caseData.documents.length > 0 ? (
                    <div>
                      <p className="font-medium text-foreground mb-2">
                        Documents
                      </p>
                      <ul className="space-y-1">
                        {caseData.documents.map((doc) => (
                          <li
                            key={doc.storageId}
                            className="text-primary underline text-xs"
                          >
                            {doc.fileName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No documents attached yet.
                    </p>
                  )}
                  {caseData.adminNote && (
                    <div className="mt-3 p-3 rounded-lg bg-muted text-muted-foreground text-xs">
                      <span className="font-medium">Admin note: </span>
                      {caseData.adminNote}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div
                data-ocid="case_detail.locked_section"
                className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 flex flex-col items-center text-center gap-4"
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    Documents &amp; Contact Details Locked
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Unlock this case for $2 USD to access verified documents,
                    institution contacts, and payment instructions.
                  </p>
                </div>
                <Button
                  data-ocid="case_detail.unlock_button"
                  disabled={!isAuthenticated || unlocking}
                  onClick={handleUnlock}
                  className="px-8"
                >
                  {unlocking
                    ? "Redirecting..."
                    : isAuthenticated
                      ? "Unlock Case — $2"
                      : "Sign in to unlock"}
                </Button>
                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/sign-in" })}
                      className="text-primary underline"
                    >
                      Sign in
                    </button>{" "}
                    or{" "}
                    <button
                      type="button"
                      onClick={() => navigate({ to: "/sign-up" })}
                      className="text-primary underline"
                    >
                      create an account
                    </button>{" "}
                    to unlock cases.
                  </p>
                )}
              </div>
            )}

            {/* Hero: submit proof of support */}
            {isHero && unlocked && (
              <div
                data-ocid="case_detail.support_section"
                className="rounded-2xl border border-border bg-card p-6 space-y-4"
              >
                <h3 className="font-display font-semibold text-foreground">
                  Submit Proof of Support
                </h3>
                {showProofForm ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="proofRef">
                        Reference Number or Notes
                      </Label>
                      <Input
                        id="proofRef"
                        data-ocid="case_detail.proof_ref_input"
                        placeholder="Transaction reference, receipt number..."
                        value={proofRef}
                        onChange={(e) => setProofRef(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        data-ocid="case_detail.submit_proof_button"
                        disabled={submittingProof}
                        onClick={handleSubmitProof}
                        className="flex-1"
                      >
                        {submittingProof ? "Submitting..." : "Submit Proof"}
                      </Button>
                      <Button
                        variant="outline"
                        data-ocid="case_detail.cancel_proof_button"
                        onClick={() => setShowProofForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    data-ocid="case_detail.support_button"
                    onClick={() => setShowProofForm(true)}
                    className="w-full gap-2"
                  >
                    <Upload className="h-4 w-4" /> I Supported This Case
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-display font-semibold text-foreground">
                Funding Status
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount needed</span>
                  <span className="font-semibold">
                    ${amountNeeded.toLocaleString()}
                  </span>
                </div>
                <Progress value={0} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Direct support model</span>
                  <span>Pay institution directly</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{caseData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <VerificationBadge
                  level={toVerifLevel(caseData.verificationStatus)}
                  size="sm"
                />
              </div>
            </div>

            {isHero && !unlocked && (
              <Button
                className="w-full"
                data-ocid="case_detail.unlock_cta_button"
                onClick={handleUnlock}
                disabled={!isAuthenticated || unlocking}
              >
                <Heart className="h-4 w-4 mr-2" />
                {unlocking ? "Redirecting..." : "Unlock to Help — $2"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
