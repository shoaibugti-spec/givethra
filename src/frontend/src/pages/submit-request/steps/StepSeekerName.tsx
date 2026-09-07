// src/frontend/src/pages/submit-request/steps/StepSeekerName.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

export default function StepSeekerName({
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
        <h2 className="text-2xl font-bold">Your full name</h2>
        <p className="text-sm text-muted-foreground">
          Enter your name exactly as it appears on your CNIC or ID.
        </p>
        <Label>Full name *</Label>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Your full name"}
          className="text-lg py-6"
          autoFocus
        />
      </div>

      <StepGuide
        lines={[
          "Use the same name as on your CNIC / official ID.",
          "Do not use nicknames or incomplete names.",
          "This name is used for verification and case records.",
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
