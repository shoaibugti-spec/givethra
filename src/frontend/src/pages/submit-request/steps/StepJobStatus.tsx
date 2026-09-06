// src/frontend/src/pages/submit-request/steps/StepJobStatus.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";

export default function StepJobStatus({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Do you have a job?</h2>
        <p className="text-sm text-muted-foreground">This helps us understand your financial situation.</p>
        <Label>Job Status *</Label>
        <div className="grid grid-cols-2 gap-3">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`p-6 rounded-xl border-2 text-center transition-all ${
                value === opt
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="text-2xl mb-1">{opt === "Yes" ? "💼" : "🚫"}</div>
              <div className="font-medium">{opt === "Yes" ? "Yes, I have a job" : "No, I don't have a job"}</div>
            </button>
          ))}
        </div>
      </div>
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
