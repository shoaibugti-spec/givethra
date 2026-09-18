// src/frontend/src/pages/submit-request/steps/StepGender.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

const GENDER_OPTIONS = [
  { value: "Male", icon: "👨", label: "Male" },
  { value: "Female", icon: "👩", label: "Female" },
  { value: "Child", icon: "🧒", label: "Child" },
];

export default function StepGender({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Select your gender</h2>
        <p className="text-sm text-muted-foreground">
          This decides which identity documents we will ask for next.
        </p>
        <Label>Gender *</Label>
        <div className="grid grid-cols-3 gap-3">
          {GENDER_OPTIONS.map((opt) => (
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
              <div className="text-4xl mb-2">{opt.icon}</div>
              <div className="font-medium">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      <StepGuide
        lines={[
          "Male / Female: you will select marital status, then upload matching documents (FRC, Nikah Nama, etc.).",
          "Child: B-Form and FRC are required. Orphan status may also be asked.",
          "Choose carefully — required documents depend on this selection.",
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
