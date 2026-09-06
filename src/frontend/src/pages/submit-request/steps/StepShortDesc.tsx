// src/frontend/src/pages/submit-request/steps/StepShortDesc.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";

export default function StepShortDesc({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Summarize your need in one line</h2>
        <p className="text-sm text-muted-foreground">
          This will appear as a short summary on your case card.
        </p>
        <Label>Short Description *</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Need assistance with electricity bill for June"
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
