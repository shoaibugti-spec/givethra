// src/frontend/src/pages/submit-request/steps/StepTitle.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

export default function StepTitle({
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  placeholder,
}: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">What is the title of your request?</h2>
        <p className="text-sm text-muted-foreground">
          Write a short, clear title that describes your need in a few words.
        </p>
        <Label>Request title *</Label>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "e.g. Help with School Fee"}
          className="text-lg py-6"
          autoFocus
        />
      </div>

      <StepGuide
        lines={[
          "Keep the title short and specific (about 5–12 words).",
          "Example: “Electricity bill for June” or “School fee for one child”.",
          "Do not write your full story here — that comes in Why Help.",
          "Avoid vague titles like “Need help” or “Urgent”.",
        ]}
      />

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
