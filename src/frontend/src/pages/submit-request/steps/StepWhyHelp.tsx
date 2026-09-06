// src/frontend/src/pages/submit-request/steps/StepWhyHelp.tsx
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StepNavigation } from "../shared/StepNavigation";

export default function StepWhyHelp({ value, onChange, onNext, onBack, isFirst, isLast }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Why do you need this help?</h2>
        <p className="text-sm text-muted-foreground">
          Describe your situation in detail — Heroes read this to understand your need and decide to help.
        </p>
        <Label>Explain Your Situation *</Label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your situation in detail..."
          rows={6}
          className="text-base"
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          💡 Write at least 20 words so Heroes can understand your situation better.
        </p>
      </div>
      <StepNavigation
        onNext={onNext}
        onBack={onBack}
        isFirst={isFirst}
        isLast={isLast}
        disabled={value?.trim().length < 20}
      />
    </div>
  );
}
