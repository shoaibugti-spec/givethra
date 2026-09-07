// src/frontend/src/pages/submit-request/steps/StepTerms.tsx
// Full Terms & Conditions matching SubmitRequestPage

import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

export default function StepTerms({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  submitting,
}: any) {
  const confirmed = !!value;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Terms & Conditions</h2>
        <p className="text-sm text-muted-foreground">
          Please read carefully and confirm before submitting your case.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold">Terms & Conditions</p>
        <div className="max-h-60 overflow-y-auto rounded-xl border border-border bg-muted/30 p-4 text-xs space-y-2.5 leading-relaxed">
          <p>
            <strong>1. Truthfulness & Accuracy</strong>
            <br />
            I confirm that all information, documents, and statements provided in my
            case are completely true and accurate. Any falsehood or fraud will result
            in permanent account closure.
          </p>

          <p>
            <strong>2. Video Privacy & Access</strong>
            <br />
            <strong>a.</strong> My identity documents (CNIC, bills, etc.) and my selfie
            will <strong>never</strong> be shown to any contributor. They are only for
            Givethra&apos;s verification team.
            <br />
            <strong>b.</strong> My verification video (the appeal video I record){" "}
            <strong>will be shown only to the Hero who unlocks my case</strong> by
            paying the required credit. No one else can see it.
            <br />
            <strong>c.</strong> The video is provided in <strong>stream-only mode</strong>{" "}
            — it cannot be downloaded, shared, or saved by anyone.
            <br />
            <strong>d.</strong> Once my case is successfully completed (payment made),
            the video will be <strong>permanently hidden</strong> from that Hero and
            will never be shown again.
          </p>

          <p>
            <strong>3. Feedback Mandate</strong>
            <br />
            If my case is successfully completed, I must submit a{" "}
            <strong>feedback video (minimum 60 seconds) + a written caption</strong>{" "}
            within <strong>24 hours</strong> of completion. Failure to do so will
            result in my account being <strong>suspended</strong>. To unsuspend, I must
            pay <strong>5 credits</strong>.
          </p>

          <p>
            <strong>4. Public Usage Rights</strong>
            <br />
            I grant Givethra the right to use my{" "}
            <strong>case description, feedback video, and caption</strong> as public
            property. Givethra may publish these on social media, the community wall, or
            other public platforms where viewers can watch, like, and comment.
          </p>

          <p>
            <strong>5. Listing Fee</strong>
            <br />
            I understand that if my case is not my first case or part of a free offer, a{" "}
            <strong>1 credit listing fee</strong> will be deducted, which is{" "}
            <strong>non-refundable</strong>.
          </p>

          <p>
            <strong>6. Consent</strong>
            <br />
            I have read and fully agree to all the above terms and conditions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="termsCheckWizard"
            checked={confirmed}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="termsCheckWizard" className="text-sm">
            I have read all the Terms & Conditions and I agree to them.
          </label>
        </div>
      </div>

      <StepGuide
        lines={[
          "Read every point carefully before agreeing.",
          "Your selfie and ID docs are for verification only.",
          "Your appeal video is shown only to the Hero who unlocks the case.",
          "After completion you must submit feedback within 24 hours.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!confirmed || !!submitting}
      />
    </div>
  );
}
