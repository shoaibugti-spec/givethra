// src/frontend/src/pages/submit-request/steps/StepJobStatus.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";
import { EMPLOYMENT_OPTIONS } from "../employment";

export default function StepJobStatus({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What is your current source of income?</h2>
        <p className="text-sm text-muted-foreground">
          This helps us understand your financial situation for verification.
        </p>
        <Label>Employment status *</Label>
        <div className="grid gap-3">
          {EMPLOYMENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`p-6 rounded-xl border-2 text-center transition-all ${
                value === opt.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="font-medium text-sm">{opt.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{opt.description}</div>
            </button>
          ))}
        </div>
      </div>

      <StepGuide
        lines={[
          "Choose the option that best describes your current source of income.",
          "The next step will show only the documents required for your selection.",
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
