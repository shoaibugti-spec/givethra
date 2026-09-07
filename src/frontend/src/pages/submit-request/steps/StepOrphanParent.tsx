// src/frontend/src/pages/submit-request/steps/StepOrphanParent.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

const OPTIONS = ["Father", "Mother", "Both"];

export default function StepOrphanParent({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Which parent passed away?</h2>
        <p className="text-sm text-muted-foreground">
          This helps us request the correct orphan proof document.
        </p>
        <Label>Parent *</Label>
        <div className="grid grid-cols-3 gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                value === opt
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-medium">{opt}</div>
            </button>
          ))}
        </div>
      </div>

      <StepGuide
        lines={[
          "Select Father, Mother, or Both.",
          "You must upload the matching death certificate in identity documents.",
          "Answer honestly — this is used for verification.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!value}
      />
    </div>
  );
}
