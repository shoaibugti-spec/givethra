import { Category } from "@/backend";
import { ErrorBanner } from "@/components/ErrorBanner";
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
import { useBackendActor, useGetCallerProfile } from "@/hooks/useBackend";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

const STEP_LABELS = ["Details", "Documents", "Payment"];

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Education", value: Category.Education },
  { label: "School Fees", value: Category.SchoolFees },
  { label: "University Fees", value: Category.UniversityFees },
  { label: "Books", value: Category.Books },
  { label: "Uniform", value: Category.Uniform },
  { label: "Medical", value: Category.Medical },
  { label: "Surgery", value: Category.Surgery },
  { label: "Medicines", value: Category.Medicines },
  { label: "Utilities", value: Category.Utilities },
  { label: "Housing", value: Category.Housing },
  { label: "Food", value: Category.Food },
  { label: "Employment", value: Category.Employment },
  { label: "Transportation", value: Category.Transportation },
  { label: "Disability Support", value: Category.DisabilitySupport },
  { label: "Orphans", value: Category.Orphans },
  { label: "Widows", value: Category.Widows },
  { label: "Debt Relief", value: Category.DebtRelief },
  { label: "Emergency Needs", value: Category.EmergencyNeeds },
  { label: "Other", value: Category.Other },
];

export default function SubmitRequestPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useBackendActor();
  const { data: profile, isLoading: profileLoading } = useGetCallerProfile();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createdCaseId, setCreatedCaseId] = useState<bigint | null>(null);

  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  if (!isAuthenticated) {
    navigate({ to: "/sign-in" });
    return null;
  }

  // KYC gating — show block screen if not approved
  const kycStatus = (profile as { kycStatus?: string } | null)?.kycStatus;
  const isKycApproved = kycStatus === "approved";

  if (!profileLoading && !isKycApproved) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-16 text-center">
          <div className="rounded-2xl border border-border bg-card p-8 space-y-4">
            <h1 className="font-display text-2xl font-bold text-foreground">
              KYC Verification Required
            </h1>
            <p className="text-muted-foreground">
              Please complete your identity verification to submit a request.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Button asChild>
                <Link to="/profile/$id" params={{ id: "me" }}>
                  Go to Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || isFetching || category === null) return;
    setSubmitting(true);
    setError("");
    try {
      const deadlineTs =
        BigInt(new Date(deadline).getTime()) * BigInt(1_000_000);
      const amountCents = BigInt(Math.round(Number(amount) * 100));
      const id = await actor.createCase(
        "",
        title,
        description,
        category,
        country,
        city,
        amountCents,
        deadlineTs,
      );
      setCreatedCaseId(id);
      setStep(2);
    } catch (_err) {
      setError("Failed to create case. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2 = () => setStep(3);

  const handleStep3Pay = async () => {
    if (!actor || !createdCaseId) return;
    setSubmitting(true);
    try {
      const successUrl = `${window.location.origin}/my-requests?paid=1`;
      const cancelUrl = `${window.location.origin}/submit-request`;
      const sessionUrl = await actor.createListingFeeSession(
        successUrl,
        cancelUrl,
      );
      window.location.href = sessionUrl;
    } catch {
      toast.error("Failed to start payment. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="space-y-2 mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Submit a Help Request
          </h1>
          <p className="text-muted-foreground">
            A $1 listing fee is required before your case goes live.
          </p>
        </div>

        {/* Step indicator */}
        <div
          className="flex items-center gap-0 mb-8"
          data-ocid="submit_request.steps"
        >
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div
                className={`flex items-center gap-2 ${i + 1 <= step ? "text-primary" : "text-muted-foreground"}`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    i + 1 < step
                      ? "bg-primary border-primary text-primary-foreground"
                      : i + 1 === step
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:inline">
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${i + 1 < step ? "bg-primary" : "bg-border"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <form
            onSubmit={handleStep1}
            className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6"
          >
            {error && <ErrorBanner message={error} />}
            <div className="grid gap-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <p className="text-xs text-muted-foreground">
                  Select the category that best describes your need.
                </p>
                <Select
                  value={category ?? ""}
                  onValueChange={(v) => setCategory(v as Category)}
                  required
                >
                  <SelectTrigger
                    data-ocid="submit_request.category_select"
                    id="category"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Example: Education
                </p>
              </div>

              {/* Case Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Case Title</Label>
                <p className="text-xs text-muted-foreground">
                  Describe your request in one sentence.
                </p>
                <Input
                  id="title"
                  data-ocid="submit_request.title_input"
                  placeholder="Enter your case title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Example: University tuition support for final semester.
                </p>
              </div>

              {/* Case Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Case Description</Label>
                <p className="text-xs text-muted-foreground">
                  Explain your situation clearly.
                </p>
                <Textarea
                  id="description"
                  data-ocid="submit_request.description_textarea"
                  placeholder="Write your full situation here."
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Example: I am a final-year engineering student and cannot
                  afford my remaining tuition fee.
                </p>
              </div>

              {/* Country & City */}
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <p className="text-xs text-muted-foreground">
                    Select your country of residence.
                  </p>
                  <Input
                    id="country"
                    data-ocid="submit_request.country_input"
                    placeholder="Select your country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Example: Pakistan
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <p className="text-xs text-muted-foreground">
                    Enter your city name.
                  </p>
                  <Input
                    id="city"
                    data-ocid="submit_request.city_input"
                    placeholder="Enter your city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Example: Karachi
                  </p>
                </div>
              </div>

              {/* Amount Needed */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Needed</Label>
                <p className="text-xs text-muted-foreground">
                  Enter the total amount you need in your local currency.
                </p>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  data-ocid="submit_request.amount_input"
                  placeholder="Enter required amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Example: 50000 PKR
                </p>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <p className="text-xs text-muted-foreground">
                  When do you need this support by?
                </p>
                <Input
                  id="deadline"
                  type="date"
                  data-ocid="submit_request.deadline_input"
                  placeholder="Select a deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Example: 2025-12-31
                </p>
              </div>
            </div>
            <Button
              type="submit"
              data-ocid="submit_request.next_button"
              disabled={submitting || category === null}
              className="w-full h-11 font-semibold"
            >
              {submitting ? "Saving..." : "Continue to Documents"}
            </Button>
          </form>
        )}

        {/* Step 2: Documents */}
        {step === 2 && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
            <div>
              <h2 className="font-display font-semibold text-foreground">
                Upload Supporting Documents
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Upload documents that verify your request. You can add more
                later.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documents">Supporting Documents</Label>
              <p className="text-xs text-muted-foreground">
                Upload documents that verify your request (fee voucher, medical
                report, utility bill, etc.)
              </p>
              <Input
                id="documents"
                type="file"
                data-ocid="submit_request.upload_button"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                className="cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground">
                Example: Fee voucher, medical report, utility bill.
              </p>
              <p className="text-xs text-muted-foreground">
                Accepted: PDF, JPG, PNG
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="video">Video Appeal</Label>
              <p className="text-xs text-muted-foreground">
                Record a short video explaining your situation. Maximum 60
                seconds.
              </p>
              <Input
                id="video"
                type="file"
                data-ocid="submit_request.video_upload"
                accept="video/mp4,video/quicktime,video/webm"
                className="cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground">
                Example: Introduce yourself and explain why you need support.
              </p>
              <p className="text-xs text-muted-foreground">
                Accepted: MP4, MOV, WEBM. Max 60 seconds.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                type="button"
                data-ocid="submit_request.back_button"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="button"
                data-ocid="submit_request.skip_button"
                onClick={handleStep2}
                className="flex-1"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
            <div>
              <h2 className="font-display font-semibold text-foreground">
                Listing Fee
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pay $1 USD to publish your case and make it visible to Heroes.
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listing fee</span>
                <span className="font-semibold">$1.00 USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Case</span>
                <span className="font-medium truncate max-w-[180px]">
                  {title}
                </span>
              </div>
            </div>
            <div
              data-ocid="submit_request.payment_section"
              className="space-y-3"
            >
              <Button
                type="button"
                data-ocid="submit_request.pay_button"
                disabled={submitting}
                onClick={handleStep3Pay}
                className="w-full h-11 font-semibold"
              >
                {submitting
                  ? "Redirecting to payment..."
                  : "Pay $1 & Publish Case"}
              </Button>
              <Button
                variant="outline"
                type="button"
                data-ocid="submit_request.back_to_docs_button"
                onClick={() => setStep(2)}
                className="w-full"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
