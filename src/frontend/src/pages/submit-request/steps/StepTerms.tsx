// src/frontend/src/pages/submit-request/steps/StepTerms.tsx
import { Label } from "@/components/ui/label";
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
          Please confirm that all information and documents you provided are true.
        </p>

        <div className="rounded-xl border p-4 space-y-3 text-sm text-muted-foreground">
          <p>• All details and documents in this request are true and accurate.</p>
          <p>• Fake documents or false information can lead to rejection and account action.</p>
          <p>• You agree to provide feedback after the case is completed when required.</p>
          <p>• You understand help depends on verification and available support.</p>
        </div>

        <label className="flex items-start gap-3 rounded-xl border p-4 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={confirmed}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-sm">
            <Label className="font-medium">I agree to the Terms & Conditions *</Label>
            <span className="block text-muted-foreground mt-1">
              I confirm my information is correct and I accept the platform rules.
            </span>
          </span>
        </label>
      </div>

      <StepGuide
        lines={[
          "You must agree before submitting.",
          "Double-check documents and details before you continue.",
          "After submit, your case goes to Pending review.",
          "Providing false information can suspend your account.",
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
