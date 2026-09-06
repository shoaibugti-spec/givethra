// src/frontend/src/pages/submit-request/steps/StepSeekerName.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";

export default function StepSeekerName({ value, onChange, onNext, onBack, isFirst, isLast, placeholder }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What is your full name?</h2>
        <p className="text-sm text-muted-foreground">This helps us verify your identity securely.</p>
        <Label>Full Name *</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter your full name"}
          className="text-lg py-6"
          autoFocus
        />
      </div>
      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={!value?.trim()}
      />
    </div>
  );
}
