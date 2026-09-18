// src/frontend/src/pages/submit-request/steps/StepSeekerContact.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "../shared/StepNavigation";
import { StepGuide } from "../shared/StepGuide";

export default function StepSeekerContact({
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
        <h2 className="text-2xl font-bold">Your contact number</h2>
        <p className="text-sm text-muted-foreground">
          A working phone number so we can reach you for verification.
        </p>
        <Label>Contact number *</Label>
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Your phone"}
          className="text-lg py-6"
          autoFocus
        />
      </div>

      <StepGuide
        lines={[
          "Use an active number that you answer regularly.",
          "Include country code if you are outside Pakistan when relevant.",
          "Wrong numbers delay verification and approval.",
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
