// src/frontend/src/pages/submit-request/steps/StepCity.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";

export default function StepCity({ value, onChange, onNext, onBack, isFirst, isLast, placeholder }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Which city are you in?</h2>
        <p className="text-sm text-muted-foreground">This helps Heroes know where you're located.</p>
        <Label>City *</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "e.g. Karachi"}
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
