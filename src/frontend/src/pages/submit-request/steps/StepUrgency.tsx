// src/frontend/src/pages/submit-request/steps/StepUrgency.tsx
import { Label } from "@/components/ui/label";
import { StepNavigation } from "../shared/StepNavigation";

const URGENCY_OPTIONS = [
  { value: "Low", label: "🟢 Low", desc: "Can wait a while" },
  { value: "Medium", label: "🟡 Medium", desc: "Needs attention soon" },
  { value: "High", label: "🟠 High", desc: "Urgent, needs help quickly" },
  { value: "Emergency", label: "🔴 Emergency", desc: "Immediate help needed" },
];

export default function StepUrgency({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">How urgent is your need?</h2>
        <p className="text-sm text-muted-foreground">This helps Heroes prioritize their help.</p>
        <Label>Urgency Level *</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {URGENCY_OPTIONS.map((opt) => (
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
