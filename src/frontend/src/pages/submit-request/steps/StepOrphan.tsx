// src/frontend/src/pages/submit-request/steps/StepOrphan.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

export default function StepOrphan({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Are you an orphan?</h2>
        <p className="text-sm text-muted-foreground">
          This information helps us provide targeted support and request the right proof.
        </p>
        <Label>Orphan status *</Label>
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
              <div className="text-2xl mb-1">{opt === "Yes" ? "🙏" : "✅"}</div>
              <div className="font-medium">{opt}</div>
            </button>
          ))}
        </div>
      </div>

      <StepGuide
        lines={[
          "If Yes, you will select which parent passed away.",
          "You must upload the parent's death certificate in the documents step.",
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
