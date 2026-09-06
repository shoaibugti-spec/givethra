// src/frontend/src/pages/submit-request/steps/StepSeekerContact.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";

export default function StepSeekerContact({ value, onChange, onNext, onBack, isFirst, isLast, placeholder }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What is your contact number?</h2>
        <p className="text-sm text-muted-foreground">We'll only use this for verification purposes.</p>
        <Label>Phone Number *</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "e.g. 0300-1234567"}
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
