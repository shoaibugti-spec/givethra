// src/frontend/src/pages/submit-request/steps/StepUrgency.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

const OPTIONS = [
  {
    value: "Emergency",
    icon: "🚨",
    label: "Emergency",
    hint: "Need help within days",
  },
  {
    value: "Medium",
    icon: "⏰",
    label: "Medium",
    hint: "Need help within a few weeks",
  },
  {
    value: "Low",
    icon: "📅",
    label: "Low",
    hint: "Can wait longer if needed",
  },
];

export default function StepUrgency({
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
        <h2 className="text-2xl font-bold">How urgent is your need?</h2>
        <p className="text-sm text-muted-foreground">
          Choose the option that best matches your real timeline.
        </p>
        <Label>Urgency *</Label>
        <div className="grid grid-cols-1 gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                value === opt.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.hint}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <StepGuide
        lines={[
          "Select urgency honestly based on your real deadline.",
          "Emergency is for needs within a few days.",
          "False urgency can hurt trust and slow approval.",
          "Some bill categories may set urgency from the due date automatically.",
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
