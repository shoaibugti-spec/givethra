// src/frontend/src/pages/submit-request/steps/StepPropertyOwnership.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

const OPTIONS = [
  { value: "rented", label: "Rented", icon: "🏠" },
  { value: "owned", label: "Owned", icon: "📜" },
];

// ✅ فنکشن کا نام بھی درست املا (Property) کے ساتھ اپڈیٹ کر دیا گیا ہے
export default function StepPropertyOwnership({
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
        <h2 className="text-2xl font-bold">Property ownership</h2>
        <p className="text-sm text-muted-foreground">
          Is the property rented or owned? This decides which documents we ask next.
        </p>
        <Label>Ownership *</Label>
        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((opt) => (
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
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="font-medium">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      <StepGuide
        lines={[
          "Rented: you will upload rental agreement and landlord CNIC.",
          "Owned: you will upload owner CNIC and relation to owner.",
          "Choose the option that matches your real situation.",
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
