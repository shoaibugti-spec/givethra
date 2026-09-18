// src/frontend/src/pages/submit-request/steps/StepDeadline.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

export default function StepDeadline({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
}: any) {
  const isPast = value ? new Date(value) < new Date(new Date().toDateString()) : false;
  const isValid = !!value && !isPast;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">When do you need this help by?</h2>
        <p className="text-sm text-muted-foreground">
          Select a realistic deadline in the future.
        </p>
        <Label>Deadline *</Label>
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="text-lg py-6"
          autoFocus
        />
        {isPast && (
          <p className="text-sm text-red-600">Deadline must be in the future.</p>
        )}
      </div>

      <StepGuide
        lines={[
          "Pick a real due date from your bill, challan, or need.",
          "Past dates are not allowed.",
          "Unrealistic deadlines can reduce trust during review.",
          "For utility bills, use the bill due date when possible.",
        ]}
      />

      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!isValid}
      />
    </div>
  );
}
