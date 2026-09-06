// src/frontend/src/pages/submit-request/steps/StepPropertyOwnership.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";

export default function StepPropertyOwnership({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">🏠 Property Ownership</h2>
        <p className="text-sm text-muted-foreground">
          Is the property where you live owned by you or are you a tenant (renting)?
        </p>
        <Label>Property Status *</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "owned", label: "🏠 Owned", desc: "I own this property" },
            { value: "rented", label: "🏢 Rented", desc: "I rent this property" },
          ].map((opt) => (
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
              <div className="font-medium text-lg">{opt.label}</div>
              <div className="text-sm text-muted-foreground">{opt.desc}</div>
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
