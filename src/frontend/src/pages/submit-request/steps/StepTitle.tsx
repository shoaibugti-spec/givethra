// src/frontend/src/pages/submit-request/steps/StepTitle.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirst: boolean;
  isLast: boolean;
  placeholder?: string;
}

export default function StepTitle({ value, onChange, onNext, onBack, isFirst, isLast, placeholder }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What is the title of your request?</h2>
        <p className="text-sm text-muted-foreground">
          Write a short, clear title that describes your need in a few words.
        </p>
        <Label>Request Title *</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "e.g. Help with School Fee"}
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
