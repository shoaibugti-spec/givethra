// src/frontend/src/pages/submit-request/steps/StepJobStatus.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

export default function StepJobStatus({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Do you have a job?</h2>
        <p className="text-sm text-muted-foreground">
          This helps us understand your financial situation for verification.
        </p>
        <Label>Job status *</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: "Yes", icon: "💼", label: "Yes, I have a job" },
            { v: "No", icon: "🚫", label: "No, I don't have a job" },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => onChange(opt.v)}
              className={`p-6 rounded-xl border-2 text-center transition-all ${
                value === opt.v
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="font-medium text-sm">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      <StepGuide
        lines={[
          "If you have been jobless for more than one year but still have old salary records, select Yes and upload your last salary slip plus a current bank statement.",
          "Select No only if you truly have no employment income.",
          "Next step will ask for the matching documents.",
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
